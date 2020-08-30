const mongoose = require('mongoose');
const Person = require('./Person');

Person.discriminator('Staff', new mongoose.Schema({
		access: {
			type: String,
			enum: ['superadmin', 'admin'],
			default: 'admin'
		},
		side: {
			type: String,
			enum: ['KG', 'CN'],
			required: true
		}
	})
);

module.exports = mongoose.model('Staff');