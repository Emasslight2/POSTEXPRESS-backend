const Tariff = require('../models/Tariff');

module.exports = {
	create: (req, res, next) => {
		const { title, description, price, limit, type } = req.body;

		Tariff.create({
			title: title,
			description: description,
			price: price,
			limit: limit,
			type: type
		}).then(tariff => res.status(200).json(tariff)).catch(e => res.status(500).json({
			message: e.message
		}));
	},
	viewAll: (req, res, next) => {
		Tariff.find({}).then(tariffs => res.status(200).json(tariffs)).catch(err => res.status(500).json({
			message: err.message
		}));
	},
	delete: (req, res, next) => {
		Tariff.findByIdAndDelete(req.body.tariffID, err => {
			if (err) {
				return res.status(400).json({
					message: err.message
				});
			} else {
				return res.status(200).json({
					message: 'Тариф удален'
				});
			}
		});
	},
	update: (req, res, next) => {
		Tariff.findById(req.body.tariffID, (err, tariff) => {
			if (err) {
				return res.status(500).json({
					message: err.message
				});
			} else if (tariff) {
				const { title, description, price, limit, type } = req.body;

				tariff.title = title;
				tariff.description = description;
				tariff.price = price;
				tariff.limit = limit;
				tariff.type = type;

				tariff.save();
				return res.status(200).json(tariff);
			} else {
				return res.status(404).json({
					message: 'Такого тарифа нет'
				});
			}
		});
	}
};