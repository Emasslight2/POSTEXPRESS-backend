const Order = require('../models/Order');
const Staff = require('../models/Staff');

module.exports = (req, res, next) => {
	Staff.findById(req.user._id, (err, employee) => {
		if (err) {
			return res.status(500).json(err);
		} else if (employee) {
			Order.findById(req.params.id, (err, order) => {
				if (err) {
					return res.status(500).json({
						message: err.message
					});
				} else if (order) {
					const statusValues = Order.schema.path('status').enumValues;
					const currentStatusIndex = statusValues.indexOf(order.status);
					res.locals.order = order;
					res.locals.statusValues = statusValues;
					res.locals.currentStatusIndex = currentStatusIndex;

					if (currentStatusIndex === 0) {
						return res.status(400).json({
							message: 'Заказ был отменен'
						});
					}

					if (currentStatusIndex === statusValues.length - 1) {
						return res.status(400).json({
							message: 'Заказ уже завершен'
						});
					}

					
					if (employee.access === 'superadmin') {
						next();
					} else if (employee.side === 'CN' && currentStatusIndex < 4 && currentStatusIndex !== 2) {
						next();
					} else if (employee.side === 'KG' && currentStatusIndex >= 4) {
						next();
					} else {
						return res.status(400).json({
							message: 'Вам нельзя поменять статус этого заказа'
						});
					}
					
				} else {
					return res.status(404).json({
						message: 'Такого заказа нет'
					});
				}
			});
		} else {
			return res.status(500).json({
				message: 'Нет такого пользователя в системе'
			});
		}
	});
    
}