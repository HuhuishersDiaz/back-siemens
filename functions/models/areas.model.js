const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = class AreasModel {
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
		let snapshot = (await db.collection('aplication_areas').where('name', '==', this.name).get()).empty;
		if (!snapshot) {
			return 'Aplication area name already exists';
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

	async getAllAreas() {
		let all = [];
		const snapshots = await db.collection('aplication_areas').get();

		await Promise.all(
			snapshots.docs.map(async (doc) => {
				const item = (await db.collection('products').where('areas', 'array-contains', doc.id).get()).size;
				all.push(new AreasModel(doc.data().name, doc.data().description, doc.id, item).returnDataList());
			})
		);

		return all;
	}

	async saveNewArea() {
		const data = this.returnData();

		const newArea = db.collection('aplication_areas').doc();

		await newArea.set(data);

		return newArea.id;
	}
};
