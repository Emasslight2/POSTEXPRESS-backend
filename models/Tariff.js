const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	price: {
		type: String,
		required: true
	},
	limit: {
		type: String,
		required: true
	},
	type: {
		type: String,
		enum: ['air', 'land'],
		required: true
	}
});

module.exports = mongoose.model('Tariff', tariffSchema);