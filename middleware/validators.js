const { check, query } = require("express-validator");

module.exports = {
	constructors: {
		password: (str) => {
			return [
				check(str, "Минимальная длина пароля 6 символов").exists().isLength({
					min: 6
				})
			]
		},
	},
	person: [
		check("name", "Строка имени не должно быть пустым").not().isEmpty(),
		check("surname", "Строка фамилии не должно быть пустым").not().isEmpty(),
		check("email", "Введите корректную почту").isEmail(),
		check("code", "Введите корректный код страны").matches(/^[+][0-9\s]{0,5}$/).not().isEmpty(),
		check("phone", "Введите корректный номер").matches(/^[-\s\./0-9]*$/).not().isEmpty(),
		check("countryCode", "countryCode не должен быть пустым").not().isEmpty()
	],
	customer: [
		check("address", "Строка адрес не должно быть пустым").not().isEmpty(),
		check("city", "Строка город не должно быть пустым").not().isEmpty()
	],
	staff: [
		check("access", "Строка доступа не должна быть пустой").not().isEmpty(),
		check("side", "Строка стороны не должна быть пустой").not().isEmpty()
	],
	login: [
		check("code", "Введите корректный код страны").matches(/^[+][0-9\s]{0,5}$/).not().isEmpty(),
		check("phone", "Введите корректный номер").matches(/^[-\s\./0-9]*$/).not().isEmpty(),
		check("password", "Минимальная длина пароля 6 символов").exists().isLength({
			min: 6
		})
	],
	warehouse: [
		check("title", "Строка название не должно быть пустым").not().isEmpty(),
		check("address", "Строка адрес не должно быть пустым").not().isEmpty(),
		check("city", "Строка город не должно быть пустым").not().isEmpty()
	],
	tariff: [
		check("title", "Строка название не должно быть пустым").not().isEmpty(),
		check("price", "Строка цена должна быть числом").isNumeric(),
		check("limit", "Строка лимит должна быть числом").isNumeric(),
		check("type", "Строка город не должно быть пустым").not().isEmpty()
	],
	dates: [
		query("startDate", "Укажите начальную дату, формат: yyyy-mm-dd").matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/),
		query("endDate", "Укажите конечную дату, формат: yyyy-mm-dd").matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/)
	],
	phone: [
		check("code", "Введите корректный код страны").matches(/^[+][0-9\s]{0,5}$/).not().isEmpty(),
		check("phone", "Введите корректный номер").matches(/^[-\s\./0-9]*$/).not().isEmpty(),
	],
	pagination: [
		query("page", "Страница должна быть числом и не пустой").isNumeric(),
		query("limit", "Лимит должен быть числом и не пустым").isNumeric(),
		query("model", "Модел должна быть не пустой").not().isEmpty()
	],
	order: {
		create: [
			check("title", "Строка название не должно быть пустым").not().isEmpty(),
			check("warehouse", "Строка склад не должно быть пустым").not().isEmpty(),
			check("tariff.title", "Строка название не должно быть пустым").not().isEmpty(),
			check("tariff.price", "Строка цена должна быть числом").isNumeric(),
			check("tariff.limit", "Строка лимит должно быть числом").isNumeric(),
			check("tariff.type", "Строка город не должно быть пустым").not().isEmpty(),
			check("merch", "Должнен быть массив товаров").isArray(),
			check("merch[*].title", "У каждго товара должно быть наименование").not().isEmpty(),
			check("merch[*].specifiedAmount", "Количество должно быть числом").isNumeric()
		],
		update: {
			tariff: [
				check("orderID", "Строка ID не должно быть пустым").not().isEmpty(),
				check("tariff._id", "Строка ID не должно быть пустым").not().isEmpty(),
				check("tariff.title", "Строка название не должно быть пустым").not().isEmpty(),
				check("tariff.price", "Строка цена должна быть числом").isNumeric(),
				check("tariff.limit", "Строка лимит должна быть числом").isNumeric(),
				check("tariff.type", "Строка город не должно быть пустым").not().isEmpty()
			],
			merch: [
				check("orderID", "Строка ID не должно быть пустым").not().isEmpty(),
				check("merchID", "Строка ID не должно быть пустым").not().isEmpty(),
				check("actualAmount", "Строка количество должно быть числом").isNumeric(),
				check("weight", "Строка вес должно быть числом").isNumeric()
			],
			approval: [
				check("orderID", "Строка ID не должно быть пустым").not().isEmpty(),
				check("approved", "Подтверждение должен быть булевым значением").isBoolean()
			]
		}
	},
	delete: {
		tariff: [
			check("tariffID", "Строка номера тарифа не должна быть пустой").not().isEmpty()
		]
	},
	clientMessage: [
		check("name", "Строка имени не должно быть пустым").not().isEmpty(),
		check("subject", "Строка фамилии не должно быть пустым").not().isEmpty(),
		check("email", "Введите корректную почту").isEmail(),
		check("message", "Сообщение не должно быть пустым").not().isEmpty()
	],
	site: [
		check("about", "Не должно быть пустым").isArray().not().isEmpty(),
		check("instruction", "Не должно быть пустым").isArray().not().isEmpty(),
		check("contacts", "Не должно быть пустым").isArray().not().isEmpty(),
		check("contacts[*].city", "Не должно быть пустым").not().isEmpty(),
		check("contacts[*].address", "Не должно быть пустым").not().isEmpty(),
		check("contacts[*].phone", "Не должно быть пустым").not().isEmpty(),
	]
}