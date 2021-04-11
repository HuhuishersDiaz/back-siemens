const { response } = require('express');
var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
let NormativesModel = require('../../models/normatives.model.js');
// Get a database reference to our blog

router.get('/', async (req, res) => {
	try {
		let all = [];
		let normative = new NormativesModel();
		all = await normative.getAllNormatives().then((c) => c);
		console.log(all);
		res.status(200).json(all);
	} catch (err) {
		res.status(501).json({ ok: false, message: 'Internal error', err: err });
	}
});

router.post('/', async (req, res = response) => {
	try {
		const { name, description } = req.body;
		const newNormative = new NormativesModel(name, description);

		let valid = await newNormative.validateData();
		console.log(valid);
		if (valid === true) {
			newNormative.saveNewNormative();
			res.status(201).json({ ok: true, message: 'success' });
		} else {
			res.status(501).json({ ok: false, message: valid });
		}
	} catch (e) {
		res.status(501).json({ ok: false, message: 'Internal error', e });
	}
});

module.exports = router;
