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
		status,
		families
	) {
		try {
			this.name = name;
			this.thumbnail = thumbnail || 'thumbnail.png';
			this.img_presentation = img_presentation || ['img1.jpg', 'img2.jpg'];
			this.description = description || 'description';
			this.normatives = normatives || [];
			this.types = types || [];
			this.areas = areas || [];
			this.features = features || [];
			this.downloads = downloads || [];
			this.contacto = contacto || [];
			this.status = status || false;
			this.families = families || [];
		} catch (error) {
			console.log(error);
		}
	}

	async validateData() {
		if (!this.name && !this.description) {
			return 'Todos los datos son requeridos';
		}

		let snapshot = await db.collection('products').where('name', '==', this.name).get();
		if (!snapshot.empty) {
			return 'Product name already exists ' + this.name;
		}

		for await (const normative of this.normatives) {
			const exists = (await db.collection('normatives').doc(normative).get()).exists;
			if (!exists) {
				return 'Normative not found : ' + normative;
			}
		}

		for await (const type of this.types) {
			const exists = (await db.collection('types').doc(type).get()).exists;
			if (!exists) {
				return 'Type not found : ' + type;
			}
		}

		for await (const area of this.areas) {
			const exists = (await db.collection('aplication_areas').doc(area).get()).exists;
			if (!exists) {
				return 'Area not found : ' + area + '';
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
			families: this.families,
			features: this.features,
			downloads: this.downloads,
			contacto: this.contacto,
			status: this.status,
		};
	}

	async getAllProducts(page = 1, limit = 10) {
		try {
			let all = [];
			const first = db
				.collection('products')
				.orderBy('name')
				.limit(limit * page);

			const snapshot = await first.get();

			const last = snapshot.docs[snapshot.docs.length - 1];

			const next = db.collection('products').orderBy('name').startAfter(last.data().name).limit(parseInt(limit));

			(await next.get()).docs.map((doc) => {
				all.push({
					id: doc.id,
					data: doc.data(),
				});
			});

			return all;
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async saveNewProduct() {
		const data = this.returnData();

		const newProduct = db.collection('products').doc();

		await newProduct.set(data);

		return newProduct.id;
	}
};
