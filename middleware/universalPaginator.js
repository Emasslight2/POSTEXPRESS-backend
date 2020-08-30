const mongoose = require('mongoose');
const { checkObjectID } = require('./helpers/checkObjectID');

module.exports = async (req, res, next) => {
    if (!req.query.page || !req.query.limit || !req.query.model) {
		return res.status(400).json({
			message: 'Вы не указали главные параметры запроса'
		});
	}
	if (!mongoose.modelNames().includes(req.query.model)) {
		return res.status(400).json({
			message: 'Такой модели нет'
		});
	}
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);
	const model = req.query.model;
	const search = req.query.search ? req.query.search : null;
	delete req.query.page;
	delete req.query.limit;
	delete req.query.model;
	delete req.query.search;

	let query = {};

	query = await Object.entries(req.query).reduce((queryObj, [key, value]) => {
		try {
			const parsedJSON = JSON.parse(value);
			queryObj[key] = parsedJSON;
		} catch (error) {
			queryObj[key] = value
		}

		return queryObj;
	}, {});

	if (search) {
		switch(model) {
			case 'Staff':
			case 'Customer':
			case 'Person':
				if (checkObjectID(search)) {
					query._id = search;
				} else {
					query.$or = [
						{ name: { $regex: search, $options: 'i' } },
						{ surname: { $regex: search, $options: 'i' } },
						{ email: { $regex: search, $options: 'i' } },
						{ city: { $regex: search, $options: 'i' } },
						{ address: { $regex: search, $options: 'i' } },
						{ access: { $regex: search, $options: 'i' } },
						{ side: { $regex: search, $options: 'i' } }
					];
				}
				break;
			case 'Order':
				if (checkObjectID(search)) {
					query._id = search;
				} else {
					query.$or = [
						{ title: { $regex: search, $options: 'i' } },
						{ price: { $regex: search, $options: 'i' } },
						{ status: { $regex: search, $options: 'i' } },
						{ "merch.title": { $regex: search, $options: 'i' } }
					];
				}
				
				break;
			case 'Tariff':
				if (checkObjectID(search)) {
					query._id = search;
				} else {
					query.$or = [
						{ title: { $regex: search, $options: 'i' } },
						{ price: { $regex: search, $options: 'i' } },
						{ limit: { $regex: search, $options: 'i' } },
						{ description: { $regex: search, $options: 'i' } },
						{ type: { $regex: search, $options: 'i' } }
					];
				}
				break;
			case 'Warehouse': {
				if (checkObjectID(search)) {
					query._id = search;
				} else {
					query.$or = [
						{ title: { $regex: search, $options: 'i' } },
						{ city: { $regex: search, $options: 'i' } },
						{ address: { $regex: search, $options: 'i' } }
					];
				}
			}
		}
	}
	console.log(query)
	const amountOfDocs = await mongoose.model(model).countDocuments(query).exec();
	
	let lastPage = 1;
	if (amountOfDocs > 0) {
		lastPage = Math.ceil(amountOfDocs / limit);
	}
	
	if (lastPage < page || page < 1) {
		return res.status(404).json({
			message: 'Неправильный номер страницы'
		});
	}
	
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const data = {
		pages: {},
		entries: {}
	};
	data.pages.total = lastPage;
	data.pages.current = page;
	if (endIndex < amountOfDocs) {
		data.pages.next = page + 1;
	}
	
	if (startIndex > 0) {
		data.pages.previous = page - 1;
	}
	data.entries.start = startIndex;
	data.entries.end = endIndex;
	data.entries.total = amountOfDocs;

	mongoose.model(model).find(query).sort({ createdAt: -1 }).limit(limit).skip(startIndex).exec((err, docs) => {
		if (err) {
			return res.status(500).json({ message: e.message })
			
		} else if (docs) {
			data.docs = docs;
			return res.status(200).json(data);
		} else {
			data.docs = [];
			return res.status(200).json(data);
		}
		
	});
}