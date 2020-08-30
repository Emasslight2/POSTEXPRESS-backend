const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'gmail',
	secure: false,
	port: 25,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	},
	tls: {
		rejectUnauthorized: false
	}
});

const sendStatus = (receiver, status) => {
	const mailOptions = {
		from: process.env.EMAIL,
		to: receiver,
		subject: 'Изменен статус вашего заказа',
		html: `<h2>Статус изменен на: </h2><h2>${status}</h2>`
	};
	transporter.sendMail(mailOptions, function (err) {

		if (err) {
			console.log(err);
		}
	});
}

const sendClientMessage = (receiver, body) => {
	const mailOptions = {
		from: process.env.EMAIL,
		to: receiver,
		subject: body.subject,
		html: `<h2>Имя: ${body.name}</h2><h2>Почта: ${body.email}</h2><p>Сообщение: ${body.message}</p>`
	};
	transporter.sendMail(mailOptions, function (err) {

		if (err) {
			console.log(err);
		}
	});
}

module.exports = { sendStatus, sendClientMessage }