const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = class NormativesModel {
	constructor(name = '', description = '', id = '', items = 0, status = true) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.status = status;
		this.item = items;
	}
	async validateData() {
		if (!this.name && !this.description) {
			return 'all data is required';
		}
		let snapshot = (await db.collection('normatives').where('name', '==', this.name).get()).empty;
		if (!snapshot) {
			return 'Normative name already exists';
		}
		return true;
	}

	returnData() {
		return {
			name: this.name,
			description: this.description,
			status: this.status,
		};
	}

	returnDataList() {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			status: this.status,
			items: this.item,
		};
	}

	async getAllNormatives() {
		let all = [];
		const snapshots = await db.collection('normatives').get();

		await Promise.all(
			snapshots.docs.map(async (doc) => {
				const item = (await db.collection('products').where('normatives', 'array-contains', doc.id).get()).size;
				all.push(new NormativesModel(doc.data().name, doc.data().description, doc.id, item).returnDataList());
			})
		);

		return all;
	}

	async saveNewNormative() {
		const data = this.returnData();

		const newNormative = db.collection('normatives').doc();

		await newNormative.set(data);

		return newNormative.id;
	}
};
