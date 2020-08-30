const mongoose = require('mongoose');
const tariffSchema = require('./Tariff').schema;
const warehouseSchema = require('./Warehouse').schema;
const customerSchema = require('../models/Customer').schema;

const merchSchema = new mongoose.Schema({
    title: {
		type: String,
		required: true
	},
	// Вес за 1 штуку
	weight: {
		type: String
	},
	// Указанное количество товара
	specifiedAmount: {
		type: String
	},
	// Найденное (полученное) количество товара
	actualAmount: {
		type: String
	}
});

const orderSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	// Цена за доставку
	price: {
		type: String
	},
	warehouse: warehouseSchema,
	merch: [merchSchema],
	tariff: tariffSchema,
	status: {
		type: String,
		enum: ['Отменен', 'Проходит обработку', 'Ожидание подтверждения', 'Подтвержден', 'В пути', 'На складе', 'Завершен'],
		default: 'Проходит обработку',
		required: true
	},
	active: {
		type: Boolean,
		default: true,
		required: true
	},
	customer: customerSchema,
	reachedWarehouseAt: {
		type: Date
	},
	reachedCustomerAt: {
		type: Date
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);