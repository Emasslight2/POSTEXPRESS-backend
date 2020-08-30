const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Person = require('../models/Person');
const Staff = require("../models/Staff");

const { sendClientMessage } = require('./helpers/email');

module.exports = {
	register: async (req, res, next) => {
		const { name, surname, email, code, phone, password, access, side, countryCode } = req.body;

		Person.findOne({
			$and: [
				{ code: code },
				{ phone: phone }
			]
		}).exec((err, employee) => {
			if (err) return res.status(500).json({
				message: err.message
			});
			else if (employee) return res.status(200).json({
				message: "Пользователь с таким номером уже есть"
			});
			else {
				bcrypt.hash(password, 12, (err, hashedPassword) => {
					if (err) return res.status(500).json(err.message);
					else if (hashedPassword) {
						Staff.create({
							name: name,
							surname: surname,
							email: email,
							code: code,
							phone: phone,
							password: hashedPassword,
							access: access,
							side: side,
							countryCode: countryCode
						}).then(employee => res.status(200).json(employee)).catch(err => res.status(500).json({
							message: err.message
						}));
					}
					else return res.status(500).json({
						message: "Пароль не захешировался"
					});
				});
			}
		});
	},
	viewAll: async (req, res, next) => {
		Staff.find({})
			.then((staff) => res.status(200).json(staff))
			.catch((err) => res.status(500).json({
				message: err.message
			}));
	},
	login: (req, res, next) => {
		const { code, phone, password } = req.body;

		Staff.findOne({
			$and: [
				{ code: code },
				{ phone: phone }
			]
		}, (err, employee) => {
			if (err) return res.status(500).json({
				message: err.message
			});
			else if (employee) {
				bcrypt.compare(password, employee.password, (err, match) => {
					if (err) return res.status(500).json({
						message: err.message
					});
					else if (match) {
						const token = jwt.sign({
							_id: employee._id,
							access: employee.access,
							side: employee.side
						}, process.env.JWT_SECRET, {
							expiresIn: "1h"
						});

						return res.status(200).json({ token, _id: employee._id });
					}
					else return res.status(400).json({
						message: "Пароли не совпадают"
					})
				})
			}
			else return res.status(404).json({
				message: "Сотрудник не найден"
			});
		});
	},
	alter: (req, res, next) => {
		const { name, surname, email, code, phone, oldPassword, newPassword, countryCode } = req.body;
		Staff.findById(req.user._id, (err, employee) => {
			if (err) {
				return res.status(500).json(err);
			} else if (employee) {
				bcrypt.compare(oldPassword, employee.password, (err, match) => {
					if (err) return res.status(500).json({
						message: err.message
					});
					else if (match) {
						
						bcrypt.hash(newPassword, 12, (err, hashedPassword) => {
							if (err) return res.status(500).json({
								message: err.message
							});
							else if (hashedPassword) {
								employee.name = name;
								employee.surname = surname;
								employee.email = email;
								employee.code = code;
								employee.phone = phone;
								employee.password = hashedPassword;
								employee.countryCode = countryCode;
								employee.save();
								return res.status(200).json({
									message: 'Аккаунт успешно обновлен',
									employee: employee
								});
							}
							else return res.status(500).json({
								message: "Пароль не захешировался"
							});
						});
					}
					else return res.status(400).json({
						message: "Старый пароль не верен"
					})
				});
			} else {
				return res.status(404).json({
					message: 'Такого пользователя нет'
				});
			}
		});
	},
	clientMessage: (req, res, next) => {
		Staff.find({ access: 'superadmin' })
			.then((staff) => {
				staff.forEach(superadmin => sendClientMessage(superadmin.email, req.body));
				return res.status(200).json({
					message: 'Ваше сообщение отправлено'
				});
			})
			.catch((err) => res.status(500).json({
				message: err.message
			}));
	}
};
