const mongoose = require('mongoose');
const Person = require('./Person');

Person.discriminator('Customer', new mongoose.Schema({
		city: {
			type: String,
			required: true
		},
		address: {
			type: String,
			required: true
		}
	})
)

module.exports = mongoose.model('Customer');