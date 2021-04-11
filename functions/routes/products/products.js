const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const ProductModel = require('../../models/product.model');

const { Storage } = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();
const bucket = admin.storage().bucket();

// Get a database reference to our blog

router.get('/', async (req, res = response) => {
	try {
		let all = [];

		let product = new ProductModel('Armando', 'David');

		all = product.getAllProducts().then((data) => data);

		res.status(200).json(all);
	} catch (err) {
		res.status(501).json({ ok: false, message: 'Internal error', err: err });
	}
});

router.post('/', async (req, res = response) => {
	try {
		const {
			name,
			thumbnail,
			img_presentation,
			description,
			normatives,
			types,
			areas,
			features,
			downloads,
			contacto,
			status,
		} = req.body;

		let newProduct = new ProductModel(
			name,
			thumbnail,
			img_presentation,
			description,
			normatives,
			types,
			areas,
			features,
			downloads,
			contacto,
			status
		);

		valid = await newProduct.validateData();
		console.log(valid);
		if (valid === true) {
			newProduct.saveNewProduct();
			res.status(201).json({ ok: true, message: 'success' });
		} else {
			res.status(201).json({ ok: false, message: valid });
		}
		// newProduct.saveNewProduct();
	} catch (err) {
		res.status(500).json({ ok: false, message: 'error', err });
	}
});

const bucketName = 'gs://siemens-app-e35e2.appspot.com';

// The path to your file to upload
const filePath = 'img.jpg';

// The new ID for your GCS file
const destFileName = 'products/filenewpdf.jpg';

router.get('/storage', async (req, res) => {
	console.log(storage.baseUrl);
	uploadFile()
		// .then((r) => {
		// 	res.status(201).json({ ok: true, result: r });
		// })
		.catch((e) => {
			res.status(502).json({ ok: false, error: e });
		});

	res.status(201).json({ ok: true });
});

async function uploadFile() {
	let result = await storage.bucket(bucketName).upload(filePath, {
		destination: destFileName,
	});
	bucket
		.file(destFileName)
		.getSignedUrl({ action: 'read', expires: '12-12-9999' })
		.then((url) => console.log(url[0]));
}

module.exports = router;
