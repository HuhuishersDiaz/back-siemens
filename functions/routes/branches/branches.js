const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const { Storage } = require('@google-cloud/storage');
const BrenchesModel = require('../../models/branches.model');

// Creates a client
const storage = new Storage();
const bucket = admin.storage().bucket();

// Get a database reference to our blog

router.get('/', async (req, res = response) => {
	try {
		const { page, items } = req.query;
		let all = [];

		let training = new BrenchesModel();

		all = await training.getAll().then((data) => data);
		console.log(all);
		res.status(200).json(all);
	} catch (error) {
		res.status(501).json({ ok: false, message: 'Internal error', error });
	}
});

router.post('/', async (req, res) => {
	try {
		const data = req.body;
		let i = 0;
		for await (let c of data) {
			i++;
			try {
				let newBranch = new BrenchesModel(c);

				let valid = await newBranch.validateData();
				// console.log(valid);
				if (valid === true) {
					await newBranch.savenewBranche();
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

module.exports = router;
