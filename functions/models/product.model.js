const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = class ProductModel {
	constructor(
		name,
		thumbnail,
		img_presentation,
		description,
		normatives,
		types,
		areas,
		features,
		downloads,
		contacto,
		status
	) {
		this.name = name;
		this.thumbnail = thumbnail;
		this.img_presentation = img_presentation;
		this.description = description;
		this.normatives = normatives || [];
		this.types = types || [];
		this.areas = areas || [];
		this.features = features || [{}];
		this.downloads = downloads || [{}];
		this.contacto = contacto || [{}];
		this.status = status || false;
	}

	async validateData() {
		if (!this.name && !this.description) {
			return 'Todos los datos son requeridos';
		}

		let snapshot = await db.collection('products').where('name', '==', this.name).get();
		if (!snapshot.empty) {
			return 'Product name already exists';
		}

		for await (const normative of this.normatives) {
			console.log(normative);
			const exists = (await db.collection('normatives').doc(normative).get()).exists;
			if (!exists) {
				return 'Normative not found';
			}
		}

		for await (const type of this.types) {
			console.log(type);
			const exists = (await db.collection('types').doc(type).get()).exists;
			if (!exists) {
				return 'Type not found';
			}
		}

		for await (const area of this.areas) {
			console.log(area);
			const exists = (await db.collection('aplication_areas').doc(area).get()).exists;
			if (!exists) {
				return 'Area not found';
			}
		}

		return true;
	}

	returnData() {
		return {
			name: this.name,
			thumbnail: this.thumbnail,
			img_presentation: this.img_presentation,
			description: this.description,
			normatives: this.normatives,
			types: this.types,
			areas: this.areas,
			features: this.features,
			downloads: this.downloads,
			contacto: this.contacto,
			status: this.status,
		};
	}

	async getAllProducts() {
		let all = [];
		const snapshot = await db.collection('products').get();
		snapshot.forEach((doc) => {
			console.log(doc.id, '=>', doc.data());
			all.push({
				id: doc.id,
				data: doc.data(),
			});
		});
		return all;
	}

	async saveNewProduct() {
		const data = this.returnData();

		const newProduct = db.collection('products').doc();

		await newProduct.set(data);

		return newProduct.id;
	}
};
