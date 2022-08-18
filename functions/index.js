const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
// const multer = require("multer");
const nodemailer = require("nodemailer");

const serviceAccount = require("./config/siemens-app-e35e2-firebase-adminsdk-94hte-5a6db71b1e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://siemens-app-e35e2-default-rtdb.firebaseio.com",
  storageBucket: "gs://siemens-app-e35e2.appspot.com",
});

const db = admin.database();
const bucket = admin.storage().bucket();
const storageRef = admin.storage();
const app = express();

app.use(express.json());
// app.use(fileupload());

// app.use("/public", express.static(__dirname + "/public"));
app.use(cors);

const routers_countries = require("./routes/countries");
const { sendTextMessage } = require("./twilo");

app.use("/api/countries", routers_countries);

app.post("/webhook", function (req, res) {
  console.log("req ->", req.body);
  sendTextMessage(req.body.WaId, req.body.Body);
  res.status(200).json({ ok: true, msg: "Mensaje enviado correctamente" });
});

app.post("/sendEmail", (req, res) => {
  let { nombre, email, tel, fecha, hora } = req.body;
  console.log("Entramos al metodo ");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreply@grupomedicogaleno.com",
      pass: "Galeno2021",
    },
  });

  var mailOptions = {
    from: "noreply@grupomedicogaleno.com",
    to: "contacto@grupomedicogaleno.com,armando.diaz.diaz.2409@gmail.com",
    subject: "Nueva cita agendada ",
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
      res.json("Email sent: " + info.response);
    }
  });
});

app.post("/Email", (req, res) => {
  console.log(req.body);

  let { request, title , emails } = req.body;
  console.log("Entramos al metodo ");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "armando.diaz.diaz.2409@gmail.com",
      pass: "huhuishers",
    },
  });

  var mailOptions = {
    from: "noreply@ep-hub.com",
    to: emails,
    subject: "Solicitud de prestamo (demo Tracke)",
    html: `
		Demo:	${title}<br>
    Nombre:	${request.name} <br>
		Telefono:	${request.phone}<br>
		Correo:	${request.email}<br>
		Ubicación solicitada:	${request.location}<br>
		Fecha Inicio:	${request.startDate}<br>
		Fecha Fin:	${request.endDate}<br>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    console.log(error, info);
    if (error) {
      res.json({ ok: false, message: error });
    } else {
      res.json({ ok: true, message: "Email sent: " + info.response });
    }
  });
});

const middleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  }
  next();
};

app.post("/imageUpload", async (req, res) => {
  try {
    var files = req.files[0];
    const bucket = await admin
      .storage()
      .bucket()
      .file("blogs/" + files.originalname);

    await bucket.save(files.buffer);
    await bucket
      .getSignedUrl({ action: "read", expires: "03-09-2491" })
      .then((c) => {
        res.json({
          url: c,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.post("/", middleware, async (req, res) => {
  // app.post('/', async (req, res) => {
  const db = admin.firestore().collection("fcmTokens");
  const { title, description, url, role, user } = req.body;
  var tokens = [];
  if (user) {
    console.log(user);
    let token = await db
      .doc(`${user}`)
      .get()
      .then((c) => c.data().token);
    tokens.push(token);
  } else if (role === "all") {
    tokens = await db
      .where("token", "!=", "null")
      .get()
      .then((c) => c.docs.map((doc) => doc.data().token));
  } else {
    tokens = await db
      .where("role", "=", role)
      .get()
      .then((c) => c.docs.map((doc) => doc.data().token));
  }

  let notification = {
    title: title,
    description: description,
    url: url,
    role: role,
    user: user,
    createAt: new Date().toString(),
  };

  admin.firestore().collection("notifications").add(notification);
  const message = {
    data: {
      url: url,
      role: role,
      createAt: new Date().toString(),
    },
    notification: {
      body: description,
      title: title,
    },
    tokens: tokens.filter((c) => c != null),
  };

  admin
    .messaging()
    .sendMulticast(message)
    .then(() => {
      res.json({ sending: "true" }).statusCode = 201;
    })
    .catch((err) => {
      res.json({ sending: "false", err }).statusCode = 502;
    });
});

exports.app = functions.https.onRequest(app);
