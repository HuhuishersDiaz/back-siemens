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
		const { groupby, page, item, uidNormativa, uidArea, uidType, uidFamily, q } = req.query;
		let all = [];

		let product = new ProductModel('Armando', 'David');

		all = await product.getAllProducts(page, item).then((data) => data);

		res.status(200).json(all);
	} catch (error) {
		res.status(501).json({ ok: false, message: 'Internal error', error });
	}
});

router.post('/', async (req, res) => {
	try {
		const data = req.body;
		// let json = [];
		// data.map((c) => {
		// 	let featurs = [];
		// 	let keys = c.features[0].split(',');
		// 	keys.forEach((element) => {
		// 		let featur = element.split(':');
		// 		console.log(featur);
		// 		featurs.push({ name: featur[0], value: featur[1] || 'N/A' });
		// 	});
		// 	c.features = featurs;
		// 	// console.log(c.features[0].split(',').split(':'));
		// 	json.push(c);
		// });
		let i = 0;
		for await (let c of data) {
			console.log(i);

			i++;
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
			} = c;
			try {
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
				// console.log(newProduct);

				let valid = await newProduct.validateData();
				// console.log(valid);
				if (valid === true) {
					newProduct.saveNewProduct();
					// res.status(201).json({ ok: true, message: 'success' });
				} else {
					res.status(201).json({ ok: false, message: valid });
					return false;
				}
			} catch (error) {
				console.log(error);
				res.status(201).json({ ok: false, error });
				return false;
			}
		}

		res.status(201).json({ ok: true, message: 'success', json });
	} catch (error) {
		res.status(500).json({ ok: false, message: 'error', error });
	}
});
router.post('/tojson', async (req, res) => {
	try {
		const data = req.body;
		let json = [];
		data.map((c) => {
			let featurs = [];
			let keys = c.features[0].split(',');
			keys.forEach((element) => {
				let featur = element.split(':');
				console.log(featur);
				featurs.push({ name: featur[0], value: featur[1] || 'N/A' });
			});
			c.features = featurs;
			// console.log(c.features[0].split(',').split(':'));
			json.push(c);
		});

		res.status(201).json({ ok: true, message: 'success', json });
	} catch (error) {
		res.status(500).json({ ok: false, message: 'error', error });
	}
});
router.post('/update', function (req, res) {
	const { name, description } = req.body;
	res.send(`Name name, desc description`);
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
