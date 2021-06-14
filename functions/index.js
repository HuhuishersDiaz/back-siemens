const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors')({ origin: true });
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

var nodemailer = require('nodemailer');

serviceAccount = require('./config/siemens-app-e35e2-firebase-adminsdk-94hte-5a6db71b1e.json');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://siemens-app-e35e2-default-rtdb.firebaseio.com',
	storageBucket: 'gs://siemens-app-e35e2.appspot.com',
});

const db = admin.database();
const app = express();

app.use(express.json());

app.use('/public', express.static(__dirname + '/public'));
app.use(cors);

const routers_countries = require('./routes/countries');
const routers_users = require('./routes/users');
const routers_normative = require('./routes/products/normative');
const routers_area = require('./routes/products/aplication_area');
const routers_type = require('./routes/products/type');
const routers_products = require('./routes/products/products');
const training = require('./routes/training/training');
const localization = require('./routes/branches/branches');

app.use('/api/countries', routers_countries);
app.use('/api/users', routers_users);
app.use('/api/products/normatives', routers_normative);
app.use('/api/products/area', routers_area);
app.use('/api/products/type', routers_type);
app.use('/api/products/', routers_products);
app.use('/api/training/', training);
app.use('/api/localization/', localization);

// /product_aplication_area
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});
app.post('/sendEmail', (req, res) => {
	let { nombre, email, tel, fecha, hora } = req.body;
	console.log('Entramos al metodo ');
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'noreply@grupomedicogaleno.com',
			pass: 'Galeno2021',
		},
	});

	var mailOptions = {
		from: 'noreply@grupomedicogaleno.com',
		to: 'contacto@grupomedicogaleno.com,armando.diaz.diaz.2409@gmail.com',
		subject: 'Nueva cita agendada ',
		html: `Nombre:	${nombre} <br>
		Telefono:	${email}<br>
		Correo:	${tel}<br>
		Fecha:	${fecha}<br>
		Hora:	${hora}`,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		console.log(error, info);
		if (error) {
			res.json(false);
		} else {
			res.json('Email sent: ' + info.response);
		}
	});
});

exports.app = functions.https.onRequest(app);
