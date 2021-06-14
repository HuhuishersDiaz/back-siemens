var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');

// Get a database reference to our blog
var db = admin.database();
var refRoot = db.ref();

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
// 	console.log('Time: ', Date.now());
// 	next();
// });

router.get('/', async (req, res) => {
	var ref = db.ref('/countries');
	ref.once(
		'value',
		(snapshot) => {
			let countries = [];
			snapshot.forEach((childSnapshot) => {
				var childKey = childSnapshot.key;
				var childData = childSnapshot.val();
				console.log(childKey);
				countries.push({
					id: childKey,
					name: childData.name,
				});
			});

			res.json(countries);
		},
		(errorObject) => {
			res.status(501).json({ error: 'internal server error ' });
		}
	);
});

router.get('/states/:id_contry', (req, res) => {
	const { id_contry } = req.params;
	console.log(id_contry);
	var ref = db.ref('/countries/' + id_contry + '/countries');
	ref.orderByChild('name').once(
		'value',
		(snapshot) => {
			let states = [];
			snapshot.forEach((childSnapshot) => {
				var childKey = childSnapshot.key;
				var childData = childSnapshot.val();
				states.push({
					id: childKey,
					name: childData.name,
				});
			});
			res.json(states);
		},
		(errorObject) => {
			console.log('The read failed: ' + errorObject.code);
		}
	);
});

module.exports = router;
