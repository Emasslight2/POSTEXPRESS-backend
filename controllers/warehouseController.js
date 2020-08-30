const Warehouse = require('../models/Warehouse');

module.exports = {
	create: (req, res, next) => {
		const { title, city, address } = req.body;

		Warehouse.create({
			title: title,
			city: city,
			address: address
		}).then(warehouse => res.status(200).json(warehouse)).catch(e => res.status(500).json({
			message: e.message
		}));
	},
	viewAll: (req, res, next) => {
		Warehouse.find({}).then(warehouses => res.status(200).json(warehouses)).catch(err => res.status(500).json({
			message: err.message
		}));
	},
	delete: (req, res, next) => {
		Warehouse.findByIdAndDelete(req.body.warehouseID, err => {
			if (err) {
				return res.status(400).json({
					message: err.message
				});
			} else {
				return res.status(200).json({
					message: 'Склад удален'
				});
			}
		});
	},
	update: (req, res, next) => {
		Warehouse.findById(req.body.warehouseID, (err, warehouse) => {
			if (err) {
				return res.status(500).json({
					message: err.message
				});
			} else if (warehouse) {
				const { title, city, address } = req.body;

				warehouse.title = title;
				warehouse.city = city;
				warehouse.address = address;

				warehouse.save();
				return res.status(200).json(warehouse);
			} else {
				return res.status(404).json({
					message: 'Такого склада нет'
				});
			}
		});
	}
};