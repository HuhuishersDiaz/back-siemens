const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = class TypesModel {
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
		let snapshot = (await db.collection('types').where('name', '==', this.name).get()).empty;
		if (!snapshot) {
			return 'Type name already exists';
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

	async getAllTypes() {
		let all = [];
		const snapshots = await db.collection('types').get();

		await Promise.all(
			snapshots.docs.map(async (doc) => {
				const item = (await db.collection('products').where('types', 'array-contains', doc.id).get()).size;
				all.push(new TypesModel(doc.data().name, doc.data().description, doc.id, item).returnDataList());
			})
		);

		return all;
	}

	async saveNewType() {
		const data = this.returnData();

		const newNormative = db.collection('types').doc();

		await newNormative.set(data);

		return newNormative.id;
	}
};
