const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: {
		type: String,
		required: true
	},
	surname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	countryCode: {
		type: String
	},
	password: {
		type: String,
		required: true
	}
}, {
	timestamps: true,
	discriminatorKey: 'role',
	collection: 'people'
})

module.exports = mongoose.model('Person', personSchema);