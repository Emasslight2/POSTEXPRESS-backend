const Excel = require('exceljs');
const PdfPrinter = require('pdfmake');
const QRCode = require('qrcode');

const fonts = require('../assets/fonts');
const printer = new PdfPrinter(fonts);

const { sendStatus } = require('./helpers/email');

const Order = require('../models/Order');
const Customer = require('../models/Customer');

module.exports = {
	create: (req, res, next) => {
		const { title, warehouse, merch, tariff } = req.body;

		Customer.findById(req.user._id, (err, customer) => {
			if (err) {
				return res.status(500).json({
					message: err.message
				});
			}
			else if (customer) {
				customer.password = "Hashed";
				Order.create({
					title: title,
					warehouse: warehouse,
					merch: merch,
					tariff: tariff,
					customer: customer
				}).then(order => res.status(200).json(order)).catch(e => res.status(500).json({
					message: e.message
				}));
			} else {
				return res.status(400).json({
					message: "Такой заказчик не существует"
				});
			}
		})

		
	},
	viewAll: (req, res, next) => {
		Order.find({}).then(orders => res.status(200).json(orders)).catch(err => res.status(500).json({
			message: err.message
		}));
	},
	getStatusOptions: (req, res, next) => {
		const statusValues = Order.schema.path('status').enumValues;
		return res.status(200).json(statusValues);
	},
	update: {
		basicInfo: (req, res, next) => {
			order = res.locals.order;
			const { title, warehouse } = req.body;
			order.title = title;
			order.warehouse = warehouse;
			order.save();
			return res.status(200).json({
				message: 'Заказ успешно обновлен',
				order: order
			});
		},
		approval: (req, res, next) => {
			order = res.locals.order;
			const approved = JSON.parse(req.body.approved);
			console.log(typeof approved, approved);
			const statusValues = Order.schema.path('status').enumValues;
			const currentStatusIndex = statusValues.indexOf(order.status);

			if (currentStatusIndex !== 2) {
				return res.status(403).json({
					message: 'Нам данном этапе подтвердить заказ нельзя'
				});
			}

			if (approved) {
				order.status = statusValues[3];
			} else {
				order.status = statusValues[0];
			}
			order.save();

			sendStatus(order.customer.email, order.status);

			return res.status(200).json({
				message: 'Статус заказа успешно обновлен',
				order: order
			});
		},
		tariff: (req, res, next) => {
			Order.findById(req.body.orderID, (err, order) => {
				if (err) {
					return res.status(500).json({
						message: err.message
					});
				} else if (order) {
					const { tariff } = req.body;
					order.tariff = tariff;
					order.save();
					return res.status(200).json({
						message: 'Тариф успешно обновлен',
						order: order
					});
				} else {
					return res.status(404).json({
						message: 'Такого заказа нет'
					});
				}
			});
		},
		merch: (req, res, next) => {
			Order.findById(req.body.orderID, (err, order) => {
				if (err) {
					return res.status(500).json({
						message: err.message
					});
				} else if (order) {
					const merch = order.merch.id(req.body.merchID);
					merch.actualAmount = req.body.actualAmount;
					merch.weight = req.body.weight;
					
					const merchWithWeight = order.merch.filter(obj => obj.toObject().hasOwnProperty('weight'));
					const weightsArr = merchWithWeight.map(obj => {
						const weight = parseFloat(obj.weight);
						const amount = parseFloat(obj.actualAmount);
						return weight * amount;
					});
					const totalWeight = weightsArr.reduce((a, b) => a + b, 0);
					const tariffPrice = parseFloat(order.tariff.price);
					const totalPrice = totalWeight * tariffPrice;

					order.price = totalPrice;
					order.save();
					return res.status(200).json({
						message: 'Товар успешно обновлен',
						order: order
					});
				} else {
					return res.status(404).json({
						message: 'Такого заказа нет'
					});
				}
			});
		},
		status: {
			next: (req, res, next) => {
				order = res.locals.order;
				statusValues = res.locals.statusValues;
				currentStatusIndex = res.locals.currentStatusIndex;

				order.status = statusValues[currentStatusIndex + 1];

				if (currentStatusIndex + 1 === 5) {
					order.reachedWarehouseAt = new Date();
				}

				if (currentStatusIndex + 1 === 6) {
					order.reachedCustomerAt = new Date();
				}

				order.save();

				sendStatus(order.customer.email, order.status);
				
				return res.status(200).json({
					message: 'Статус заказа успешно обновлен'
				});
			},
			previous: (req, res, next) => {
				order = res.locals.order;
				statusValues = res.locals.statusValues;
				currentStatusIndex = res.locals.currentStatusIndex;

				order.status = statusValues[currentStatusIndex - 1];

				if (currentStatusIndex - 1 === 5) {
					order.reachedCustomerAt = undefined;
				}

				if (currentStatusIndex - 1 === 4) {
					order.reachedWarehouseAt = undefined;
				}

				order.save();

				sendStatus(order.customer.email, order.status);
				
				return res.status(200).json({
					message: 'Статус заказа успешно обновлен'
				});
			}
		}
	},
	generate: {
		excel: (req, res, next) => {
			let { startDate, endDate } = req.query;
			startDate = new Date(startDate);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date(endDate);
			endDate.setHours(23, 59, 59, 59);

			Order.find({
				createdAt: {
					$gte: startDate,
					$lt: endDate
				}
			}, null, {
				sort: {
					createdAt: -1
				}
			}, function (err, orders) {
				if (orders) {
					res.writeHead(200, {
						'Content-Disposition': 'attachment; filename="file.xlsx"',
						'Transfer-Encoding': 'chunked',
						'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					});
			
					const workbook = new Excel.stream.xlsx.WorkbookWriter({
						stream: res
					});
			
					const worksheet = workbook.addWorksheet('Orders');
					worksheet.addRow(res.locals.headList).commit();

					orders.forEach((order, i) => {
						const record = [];
						for (const prop of res.locals.bodyList) {
							switch(prop) {
								case 'customer':
									record.push(order.customer._id);
									record.push(order.customer.name);
									break;
								case 'tariff':
									record.push(order.tariff.type);
									break;
								case 'warehouse':
									record.push(order.warehouse.title + ', город: ' + order.warehouse.city + ' адрес: ' + order.warehouse.address);
									break;
								case 'merch':
									let merch = "";
									for (const oneMerch of order.merch) {
										merch = merch + `[${oneMerch.title}, вес: ${oneMerch.weight ? oneMerch.weight : 'Еще не указан'}, УК: ${oneMerch.specifiedAmount}, АК: ${oneMerch.actualAmount ? oneMerch.actualAmount : 'Еще не указано'}],`;
									}
									record.push(merch);
									break;
								default:
									record.push(order[prop]);
							}
						}
						worksheet.addRow(record).commit();
					});
					
					worksheet.commit();
					workbook.commit();
					return res.status(200);
				} else if (err) {
					return res.status(500).json(err);
				} else {
					return res.status(500).json({
						message: 'Что-то пошло не так на сервере'
					});
				}
			});
		},
		pdf: (req, res, next) => {
			let { startDate, endDate } = req.query;
			const pdfHeaders = [];
			const widths = [];
			res.locals.headList.forEach(text => {
				pdfHeaders.push({
					text: text,
					style: 'tableHeader'
				});
				widths.push('auto');
			});
			widths[0] = '10%';
			const pdfDocDef = {
				pageOrientation: 'landscape',
				content: [
					{ text: `Данные о заказах с ${startDate} по ${endDate}`, style: 'subheader' },
					{
						style: 'tableExample',
						table: {
							headerRows: 1,
							widths: widths,
							dontBreakRows: true,
							// keepWithHeaderRows: 1,
							body: [ pdfHeaders ],
						},
						layout: 'lightHorizontalLines'
					}
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 10,
						color: 'black'
					}
				}
			}

			startDate = new Date(startDate);
			startDate.setHours(0, 0, 0, 0);
			endDate = new Date(endDate);
			endDate.setHours(23, 59, 59, 59);

			Order.find({
				createdAt: {
					$gte: startDate,
					$lt: endDate
				}
			}, null, {
				sort: {
					createdAt: -1
				}
			}, function (err, orders) {
				if (orders) {
					orders.forEach((order, i) => {
						const record = [];
						for (const prop of res.locals.bodyList) {
							
							switch(prop) {
								case 'tariff':
									record.push({ text: order.tariff.title + ', цена за 1 кг: ' + order.tariff.price + ', лимит кг: ' + order.tariff.limit + ', тип: ' + order.tariff.type });
									break;
								case 'warehouse':
									record.push({ text: order.warehouse.title + ', город: ' + order.warehouse.city + ' адрес: ' + order.warehouse.address });
									break;
								case 'merch':
									let merch = "";
									for (const oneMerch of order.merch) {
										merch = merch + `[${oneMerch.title}, вес: ${oneMerch.weight ? oneMerch.weight : 'Еще не указан'}, УК: ${oneMerch.specifiedAmount}, АК: ${oneMerch.actualAmount ? oneMerch.actualAmount : 'Еще не указано'}],`;
									}
									record.push({ text: merch });
									break;
								case '_id':
									record.push({ text: order._id.toString() });
									break;
								case 'createdAt':
									record.push({ text: new Date(order.createdAt).toString().substring(0, 25) });
									break;
								default:
									record.push({ text: order[prop] ? order[prop] : 'Не указано' });
							}
						}
						record.forEach(field => {
							field.fontSize = 10;
						});
						pdfDocDef.content[1].table.body.push(record);
					});

					const pdfDoc = printer.createPdfKitDocument(pdfDocDef);
					const chunks = [];

					pdfDoc.on('data', (chunk) => {
						chunks.push(chunk);
					});
				
					pdfDoc.on('end', () => {
						res.setHeader('Content-Type', 'application/pdf');
						res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');
						res.send(Buffer.concat(chunks)).end();
					});
					
					pdfDoc.end();

				} else if (err) {
					return res.status(500).json(err);
				} else {
					return res.status(500).json({
						message: 'Что-то пошло не так на сервере'
					});
				}
			});
		},
		qrcode: (req, res, next) => {
			Order.findById(req.params.id, (err, order) => {
				if (err) {
					return res.status(500).json({
						message: err.message
					});
				} else if (order) {
					QRCode.toDataURL(`${process.env.HOST_NAME}api/order/${req.params.id}/update/status`, { scale: 10 }, function (err, url) {
						const img = Buffer.from(url.replace(/^data:image\/\w+;base64,/, ""), 'base64');
						res.setHeader('Content-Type', 'image/png');
						res.setHeader('Content-Disposition', 'attachment; filename=file.png');
						res.setHeader('Content-Length', img.length);
						res.send(img).end();
					});
				} else {
					return res.status(404).json({
						message: 'Такого заказа нет'
					});
				}
			});
		},
		sticker: (req, res, next) => {
			Order.findById(req.params.id, (err, order) => {
				if (err) {
					return res.status(500).json(err);
				} else if (order) {
					const pdfDocDef = {
						content: [
							{
								style: 'tableExample',
								table: {
									dontBreakRows: true,
									widths: ['50%', '50%'],
									body: [
										[
											{
												image: 'assets/logo.png',
												fillColor: '#142440',
												colSpan: 2,
												alignment: 'center'
											},
											{}
										],
										[
											{
												text: 'Трек код:',
												style: 'subheader'
											},
											{
												text: order._id.toString(),
												style: 'subheader'
											}
										],
										[
											{
												text: 'Адрес:',
												style: 'subheader'
											},
											{
												text: order.customer.city + " " + order.customer.address,
												style: 'subheader'
											}
										],
										[
											{
												text: 'ФИО заказчика:',
												style: 'subheader'
											},
											{
												text: order.customer.name + " " + order.customer.surname,
												style: 'subheader'
											}
										],
										[
											{
												text: 'Номер телефона заказчика:',
												style: 'subheader'
											},
											{
												text: order.customer.code + order.customer.phone,
												style: 'subheader'
											}
										],
										[
											{
												text: 'Код заказчика:',
												style: 'subheader'
											},
											{
												text: order.customer._id.toString(),
												style: 'subheader'
											}
										],
										[
											{
												text: 'Название заказа:',
												style: 'subheader'
											},
											{
												text: order.title,
												style: 'subheader'
											}
										]
									],
								},
								layout: 'lightHorizontalLines'
							}
						],
						styles: {
							header: {
								fontSize: 18,
								bold: true,
								margin: [0, 0, 0, 10]
							},
							subheader: {
								fontSize: 16,
								bold: true,
								margin: [0, 10, 0, 5]
							},
							tableExample: {
								margin: [0, 5, 0, 15]
							},
							tableHeader: {
								bold: true,
								fontSize: 10,
								color: 'black'
							}
						}
					}

					const pdfDoc = printer.createPdfKitDocument(pdfDocDef);
					const chunks = [];

					pdfDoc.on('data', (chunk) => {
						chunks.push(chunk);
					});
				
					pdfDoc.on('end', () => {
						res.setHeader('Content-Type', 'application/pdf');
						res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');
						res.send(Buffer.concat(chunks)).end();
					});
					
					pdfDoc.end();

				} else {
					return res.status(404).json({
						message: 'Такого заказа нет'
					});
				}
			});
		}
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

				await Order.find({
					createdAt: {
						$gte: new Date(d),
						$lt: new Date(new Date(d).setMonth(d.getMonth() + 1))
					}
				}).then(orders => {
					dataset[`${d.getFullYear()}-${d.getMonth() + 1}`] = orders.length;
				}).catch(err => {
					console.log("Catch error:", err);
				});
			}
			
		} else if (format === 'days') {
			
			for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
				await Order.find({
					createdAt: {
						$gte: new Date(d),
						$lt: new Date(new Date(d).setDate(d.getDate() + 1))
					}
				}).then(orders => {
					dataset[`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] = orders.length;
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