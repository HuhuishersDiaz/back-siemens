const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors')({ origin: true });
var bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

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

var routers_countries = require('./routes/countries');
var routers_users = require('./routes/users');
var routers_normative = require('./routes/products/normative');
var routers_area = require('./routes/products/aplication_area');
var routers_type = require('./routes/products/type');
var routers_products = require('./routes/products/products');

app.use('/api/countries', routers_countries);
app.use('/api/users', routers_users);
app.use('/api/products/normatives', routers_normative);
app.use('/api/products/area', routers_area);
app.use('/api/products/type', routers_type);
app.use('/api/products/', routers_products);

// /product_aplication_area
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

exports.app = functions.https.onRequest(app);
