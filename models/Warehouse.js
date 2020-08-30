const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Warehouse', warehouseSchema);