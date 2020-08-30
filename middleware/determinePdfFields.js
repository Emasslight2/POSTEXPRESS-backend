const Staff = require('../models/Staff');

module.exports = (req, res, next) => {
    Staff.findById(req.user._id, (err, employee) => {
		if (err) {
			return res.status(500).json({
				message: "Ошибка на сервере"
			});
		} else if (employee) {
			const headList = [];
			const bodyList = [];
			if (employee.access === "superadmin") {
				headList.push('Трек код заказа', 'Склад', 'Наименование', 'Товары [Наименование, вес, указанное количество, актуальное количество]', 'Тариф', 'Общая сумма', 'Дата создания', 'Дата получения на складе', 'Дата передачи клиенту');
				bodyList.push('_id', 'warehouse', 'title', 'merch', 'tariff', 'price', 'createdAt', 'reachedWarehouseAt',  'reachedCustomerAt');
			} else if (employee.side === "CN") {
				headList.push('Трек код заказа', 'Склад', 'Наименование', 'Товары [Наименование, вес, указанное количество, актуальное количество]', 'Тариф', 'Общая сумма', 'Дата создания');
				bodyList.push('_id', 'warehouse', 'title', 'merch', 'tariff', 'price', 'createdAt');
			} else if (employee.side === "KG") {
				headList.push('Трек код заказа', 'Склад', 'Наименование', 'Товары [Наименование, вес, указанное количество, актуальное количество]', 'Тариф', 'Общая сумма', 'Дата создания', 'Дата получения на складе', 'Дата передачи клиенту');
				bodyList.push('_id', 'warehouse', 'title', 'merch', 'tariff', 'price', 'createdAt', 'reachedWarehouseAt',  'reachedCustomerAt');
			} else {
				return res.status(400).json({
					message: "У вас нет уровня доступа"
				});
			}
			res.locals.headList = headList;
			res.locals.bodyList = bodyList;
			next();
		} else {
			return res.status(400).json({
				message: "Такого сотрудника нет"
			});
		}
	});
}