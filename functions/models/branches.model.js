const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = class BrenchesModel {
	constructor(data = {}) {
		this.client = data.Cliente;
		this.shop = data.Tienda;
		this.street = data.Calle;
		this.suburb = data.Colonia;
		this.town = data.municipio;
		this.estado = data.Estado;
		this.zipCode = data.CP || null;
		this.email = data.Email;
		this.phone = data.telefono;
		this.business_hours = data.Horario;
	}
	async validateData() {
		return true;
	}
	returnData() {
		return {
			client: this.client,
			shop: this.shop,
			street: this.street,
			suburb: this.suburb,
			town: this.town,
			estado: this.estado,
			zipCode: this.zipCode,
			email: this.email,
			phone: this.phone,
			business_hours: this.business_hours,
		};
	}
	returnDataList() {
		return {
			id: this.id,
			client: this.client,
			shop: this.shop,
			street: this.street,
			suburb: this.suburb,
			town: this.town,
			estado: this.estado,
			zipCode: this.zipCode,
			email: this.email,
			phone: this.phone,
			business_hours: this.business_hours,
		};
	}

	async getAllAreas() {
		let all = [];
		const snapshots = await db.collection('branches').get();

		await Promise.all(
			snapshots.docs.map(async (doc) => {
				const item = (await db.collection('products').where('areas', 'array-contains', doc.id).get()).size;
				all.push(new AreasModel(doc.data().name, doc.data().description, doc.id, item).returnDataList());
			})
		);

		return all;
	}

	async savenewBranche() {
		const data = this.returnData();

		const newBranche = db.collection('branches').doc();

		await newBranche.set(data);

		return newBranche.id;
	}
};
