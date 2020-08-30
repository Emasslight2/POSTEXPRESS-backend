const Order = require('../models/Order');

module.exports = (req, res, next) => {
    Order.findById(req.body.orderID, (err, order) => {
		if (err) {
			return res.status(500).json({
				message: err.message
			});
		} else if (order) {
			const statusValues = Order.schema.path('status').enumValues;
			const currentStatusIndex = statusValues.indexOf(order.status);
			if (currentStatusIndex === 0 || currentStatusIndex > 2) {
				return res.status(403).json({
					message: 'После потверждения или отмены заказа данные поменять нельзя'
				});
			} else {
				res.locals.order = order;
				next();
			}
			
		} else {
			return res.status(404).json({
				message: 'Такого заказа нет'
			});
		}
	})
}