const { response } = require('express');
var express = require('express');
var router = express.Router();
// Import Admin SDK
var admin = require('firebase-admin');

// Get a database reference to our blog
var db = admin.database();
var rootRef = db.ref();

router.post('/', (req, resp) => {
	const { country, state, uid, birth, city, company, email, last_names, name, title } = req.body;

	var user_info = {
		country,
		state,
		city,
		birth,
		company,
		name,
		last_names,
		email,
		title,
		role: 3,
	};

	baseRefUsers = rootRef.child(`User_info`).child(uid);
	baseRefRole = rootRef.child(`Users_roles`).child('3').child('users');

	admin
		.auth()
		.getUser(uid)
		.then((data) => {
			baseRefUsers.set(user_info, (error) => {
				if (error) {
					resp.status(404).json({ ok: false, data: [], error: error });
				} else {
					baseRefRole.child(uid).set(user_info.name + ' ' + user_info.last_names);
					resp.status(201).json({ ok: true, message: 'update data' });
				}
			});
		})
		.catch((error) => {
			resp.status(404).json({ ok: false, data: [], error: error });
		});
});

router.get('/:uid', async (req, res) => {
	const { uid } = req.params;

	let info_user_ref = rootRef.child('User_info').child(uid);
	let info_role_ref = rootRef.child('Users_roles');

	let user_info = {};
	let role_info = {};

	user_info = await info_user_ref.once('value', (schedule) => schedule.val());

	if (user_info) {
		res.status(404).json({ ok: false, meessage: ' User not fund ' });
	}
	await info_role_ref.child(user_info.val().role).once('value', (schedule) => {
		role_info = schedule.val();
	});

	let country = await rootRef
		.child(`/countries/${user_info.val().country}`)
		.once('value', (schedule) => schedule.val().name);

	let state = await rootRef
		.child(`/countries/${user_info.val().country}/countries/${user_info.val().state}`)
		.once('value', (schedule) => schedule.val().name);

	console.log(country.val());
	console.log(state.val());

	user_info.val().country = country.val().name;
	user_info.val().state = state.val().name;

	let rootObject = {
		user_info: {
			birth: user_info.val().birth,
			city: user_info.val().city,
			company: user_info.val().company,
			country: {
				id: user_info.val().country,
				name: country.val().name,
			},
			email: user_info.val().email,
			last_names: user_info.val().last_names,
			name: user_info.val().name,
			role: user_info.val().role,
			state: {
				id: user_info.val().state,
				name: state.val().name,
			},
			title: user_info.val().title,
		},
		role_info: {
			sections: role_info.sections,
			permissions: role_info.permissions,
		},
	};

	res.status(201).json(rootObject);
});
module.exports = router;
