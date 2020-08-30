const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('../models/Customer');
const Person = require('../models/Person');

module.exports = {
	register: (req, res, next) => {
		const { name, surname, email, code, phone, password, address, city, countryCode } = req.body;

		Person.findOne({$and: [
				{ code: code },
				{ phone: phone }
			]}).exec((err, customer) => {
			if (err) return res.status(500).json({
				message: err.message
			});
			else if (customer) return res.status(409).json({
				message: "Пользователь с таким номером уже есть"
			});
			else {
				bcrypt.hash(password, 12, (err, hashedPassword) => {
					if (err) return res.status(500).json({
						message: err.message
					});
					else if (hashedPassword) {
						Customer.create({
							name: name,
							surname: surname,
							email: email,
							code: code,
							phone: phone,
							password: hashedPassword,
							city: city,
							address: address,
							countryCode: countryCode
						}).then(customer => {
							return res.status(200).json(customer);
						}).catch(err => res.status(500).json({
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
	viewAll: (req, res, next) => {
		Customer.find({}).then(customers => res.status(200).json(customers)).catch(err => res.status(500).json({
			message: err.message
		}));
	},
	login: (req, res, next) => {
		const { code, phone, password } = req.body;

		Customer.findOne({$and: [
			{ code: code },
			{ phone: phone }
		]}, (err, customer) => {
			if (err) return res.status(500).json({
				message: err.message
			});
			else if (customer) {
				bcrypt.compare(password, customer.password, (err, match) => {
					if (err) return res.status(500).json({
						message: err.message
					});
					else if (match) {
						const token = jwt.sign({
							_id: customer._id
						}, process.env.JWT_SECRET, {
							expiresIn: "1h"
						});

						return res.status(200).json({ token, _id: customer._id });
					}
					else return res.status(400).json({
						message: "Пароли не совпадают"
					})
				})	
			}
			else return res.status(404).json({
				message: "Пользователь не найден"
			});
		});
	},
	alter: (req, res, next) => {
		const { name, surname, email, code, phone, oldPassword, newPassword, city, address, countryCode } = req.body;
		Customer.findById(req.user._id, (err, customer) => {
			if (err) {
				return res.status(500).json(err);
			} else if (customer) {
				bcrypt.compare(oldPassword, customer.password, (err, match) => {
					if (err) return res.status(500).json({
						message: err.message
					});
					else if (match) {
						
						bcrypt.hash(newPassword, 12, (err, hashedPassword) => {
							if (err) return res.status(500).json({
								message: err.message
							});
							else if (hashedPassword) {
								customer.name = name;
								customer.surname = surname;
								customer.email = email;
								customer.code = code;
								customer.phone = phone;
								customer.password = hashedPassword;
								customer.city = city;
								customer.address = address;
								customer.countryCode = countryCode;
								customer.save();
								return res.status(200).json({
									message: 'Аккаунт успешно обновлен',
									customer: customer
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
	dataset: async (req, res, next) => {
		let { startDate, endDate, format } = req.query;
		startDate = new Date(new Date(startDate));
		endDate = new Date(new Date(endDate));
		const dataset = {};
		if (format === 'months') {
			startDate.setDate(1);
			endDate.setDate(30);
			for (var d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {

				await Customer.find({
					createdAt: {
						$gte: new Date(d),
						$lt: new Date(new Date(d).setMonth(d.getMonth() + 1))
					}
				}).then(customers => {
					dataset[`${d.getFullYear()}-${d.getMonth() + 1}`] = customers.length;
				}).catch(err => {
					console.log("Catch error:", err);
				});
			}
			
		} else if (format === 'days') {
			
			for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
				await Customer.find({
					createdAt: {
						$gte: new Date(d),
						$lt: new Date(new Date(d).setDate(d.getDate() + 1))
					}
				}).then(customers => {
					dataset[`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] = customers.length;
				}).catch(err => {
					console.log("Catch error:", err);
				});
			}
			
		} else {
			return res.status(400).json({
				message: 'Такого формата нет'
			})
		}
		return res.status(200).json(dataset);
	}
};