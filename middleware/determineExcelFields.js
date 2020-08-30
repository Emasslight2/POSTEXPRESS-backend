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
				headList.push('Трек номер заказа', 'Статус', 'Тип перевозки', 'Дата создания', 'Код клиента', 'Имя получателя', 'Наименование', 'Товары [Наименование, вес, указанное количество, актуальное количество]', 'Общая стоимость', 'Склад', 'Дата получения на складе');
				bodyList.push('_id', 'status', 'tariff', 'createdAt', 'customer', 'title', 'merch', 'price', 'warehouse', 'reachedWarehouseAt');
			} else if (employee.side === "CN") {
				headList.push('Трек номер заказа', 'Статус', 'Тип перевозки', 'Дата создания', 'Код клиента', 'Имя получателя', 'Наименование', 'Товары [Наименование, вес, указанное количество, актуальное количество]', 'Общая стоимость', 'Склад');
				bodyList.push('_id', 'status', 'tariff', 'createdAt', 'customer', 'title', 'merch', 'price', 'warehouse');
			} else if (employee.side === "KG") {
				headList.push('Трек номер заказа', 'Наименование', 'Товары [Наименование, вес, указанное количество, актуальное количество]', 'Общая стоимость', 'Дата создания', 'Дата получения на складе', 'Код клиента');
				bodyList.push('_id', 'title', 'merch', 'price', 'createdAt', 'reachedWarehouseAt',  'customer');
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