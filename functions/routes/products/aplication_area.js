const { response } = require('express');
var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
let AreasModel = require('../../models/areas.model.js');
// Get a database reference to our blog

router.get('/', async (req, res) => {
	try {
		let all = [];
		let areas = new AreasModel();
		all = await areas.getAllAreas().then((c) => c);
		console.log(all);
		res.status(200).json(all);
	} catch (err) {
		res.status(501).json({ ok: false, message: 'Internal error', err: err });
	}
});

router.post('/', async (req, res = response) => {
	try {
		const { name, description } = req.body;
		const newArea = new AreasModel(name, description);
		console.log(newArea.returnData());

		let valid = await newArea.validateData();
		console.log(valid);
		if (valid === true) {
			newArea.saveNewArea();
			res.status(201).json({ ok: true, message: 'success' });
		} else {
			res.status(501).json({ ok: false, message: valid });
		}
	} catch (e) {
		res.status(501).json({ ok: false, message: 'Internal error', e });
	}
});

module.exports = router;
