const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = class TrainingModel {
	constructor(data = {}) {
		console.log(data);
		this.id = data.id || null;
		this.title = data.title;
		this.seconds = data.seconds;
		this.pmod = data.pmod;
		this.pcreate = data.pcreate;
		this.pdesc = data.pdesc;
		this.embedUrl = data.embedUrl;
		this.author = data.author;
		this.category = data.category;
	}

	async validateData() {
		if (this.title || this.pdesc) {
			return true;
		}
		return false;
	}
	getData() {
		return {
			title: this.title,
			category: this.category,
			seconds: this.seconds,
			pmod: this.pmod,
			pcreate: this.pcreate,
			pdesc: this.pdesc,
			embedUrl: this.embedUrl,
			author: this.author,
		};
	}
	async saveNewTraining() {
		try {
			const data = this.getData();
			console.log(data);
			const newProduct = db.collection('training').doc();

			await newProduct.set(data);

			console.log('nuevo ');
			console.log(newProduct.id);
			return newProduct.id;
		} catch (err) {
			return false;
		}
	}

	async getAll(page = 1, limit = 5) {
		try {
			console.log(page, limit);
			let all = [];
			const first = db
				.collection('training')
				.orderBy('title')
				.limit(limit * page);
			// console.log((await first.get()).docs);

			const snapshot = await first.get();

			const last = snapshot.docs[snapshot.docs.length - 1];
			console.log(last.data().title);
			const next = db
				.collection('training')
				.orderBy('title')
				.startAfter(last.data().title)
				.limit(parseInt(limit));
			// const next = db.collection('training');

			(await next.get()).docs.map((doc) => {
				// console.log(doc);
				all.push({
					id: doc.id,
					embedUrl: doc.data().embedUrl,
					category: doc.data().category,
					pmod: doc.data().pmod,
					pdesc: doc.data().pdesc,
					seconds: doc.data().seconds,
					pcreate: doc.data().pcreate,
					author: doc.data().author,
					title: doc.data().title,
				});
			});
			console.log((await next.get()).size);

			console.log(all);
			return all;
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async getAllCategories() {
		try {
			let all = [];

			const next = db.collection('training_categories');
			(await next.get()).docs.map((doc) => {
				console.log(doc);
				all.push({
					id: doc.id,
					pdesc: doc.data().pdesc,
					title: doc.data().title,
				});
			});
			return all;
		} catch (ex) {
			console.log(ex, 'error ');
		}
	}
};
