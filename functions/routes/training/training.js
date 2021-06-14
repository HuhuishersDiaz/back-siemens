const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const { Storage } = require('@google-cloud/storage');
const TrainingModel = require('../../models/training.model');

// Creates a client
const storage = new Storage();
const bucket = admin.storage().bucket();

// Get a database reference to our blog

router.get('/', async (req, res = response) => {
	try {
		const { page, items } = req.query;
		let all = [];

		let training = new TrainingModel();

		all = await training.getAll().then((data) => data);
		console.log(all);
		res.status(200).json(all);
	} catch (error) {
		res.status(501).json({ ok: false, message: 'Internal error', error });
	}
});

router.post('/', async (req, res) => {
	try {
		let newTraining = new TrainingModel(req.body);
		// console.log(newTraining);

		let valid = await newTraining.validateData();
		// console.log(valid);
		if (valid === true) {
			await newTraining.saveNewTraining();
			res.status(201).json({ ok: true, message: 'success' });
		} else {
			res.status(201).json({ ok: false, message: valid });
			return false;
		}
	} catch (error) {
		console.log(error);
		res.status(201).json({ ok: false, error });
		return false;
	}
});

router.post('/categories', async (req, res) => {
	try {
		let newTraining = new TrainingModel(req.body);
		// console.log(newTraining);

		let valid = await newTraining.validateData();
		// console.log(valid);
		if (valid === true) {
			newTraining.saveNewTraining();
			res.status(201).json({ ok: true, message: 'success' });
		} else {
			res.status(201).json({ ok: false, message: valid });
			return false;
		}
	} catch (error) {
		console.log(error);
		res.status(201).json({ ok: false, error });
		return false;
	}
});

router.get('/categories', async (req, res = response) => {
	try {
		// const { page, items } = req.query;
		let all = [];

		let training = new TrainingModel();

		all = await training.getAllCategories().then((data) => data);
		console.log(all);
		res.status(200).json(all);
	} catch (err) {
		console.log(err);
		res.status(501).json({ ok: false, message: 'Internal error', err });
	}
});
module.exports = router;
