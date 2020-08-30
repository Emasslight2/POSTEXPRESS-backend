const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Person = require('../models/Person');

module.exports = {
	checkPhoneUniqueness: (req, res, next) => {
		const { code, phone } = req.body;

		Person.findOne({$and: [
				{ code: code },
				{ phone: phone }
			]}).exec((err, person) => {
			if (err) return res.status(500).json({
				message: err.message
			});
			else if (person) return res.status(409).json({
				message: "Пользователь с таким номером уже есть"
			});
			else {
				return res.status(200).json({
					message: "Такого номера нет, регистрация возможна"
				});
			}
		});
	},
	getInfo: (req, res, next) => {
		Person.findById(req.user._id, (err, person) => {
			if (err) {
				return res.status(500).json({
					message: err.message
				});
			} else if (person) {
				return res.status(200).json(person);
			} else {
				return res.status(404).json({
					message: "Такого человека нет в БД"
				});
			}
		});
	},
	login: (req, res, next) => {
		const { code, phone, password } = req.body;

		Person.findOne({
			$and: [
				{ code: code },
				{ phone: phone }
			]
		}, (err, person) => {
			if (err) return res.status(500).json({
				message: err.message
			});
			else if (person) {
				bcrypt.compare(password, person.password, (err, match) => {
					if (err) return res.status(500).json({
						message: err.message
					});
					else if (match) {
						if (person.access) {
							if (person.access === 'superadmin') {
								const token = jwt.sign({
									_id: person._id,
									role: 'Superadmin'
								}, process.env.JWT_SECRET, {
									expiresIn: "1h"
								});
								return res.status(200).json({ token, _id: person._id });
							} else {
								const token = jwt.sign({
									_id: person._id,
									role: person.side
								}, process.env.JWT_SECRET, {
									expiresIn: "1h"
								});
								return res.status(200).json({ token, _id: person._id });
							}
							
						} else {
							const token = jwt.sign({
								_id: person._id,
								role: person.role
							}, process.env.JWT_SECRET, {
								expiresIn: "1h"
							});
							return res.status(200).json({ token, _id: person._id });
						}

					}
					else return res.status(400).json({
						message: "Пароли не совпадают"
					});
				});
			}
			else return res.status(404).json({
				message: "Пользователь не найден"
			});
		});
	},
	delete: (req, res, next) => {
		Person.findByIdAndDelete(req.params.id, err => {
			if (err) {
				return res.status(500).json(err);
			} else {
				return res.status(200).json({
					message: "Пользователь удален"
				});
			}
		});
	}
};