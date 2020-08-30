const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
	about: {
		type: Array,
		required: true,
		default: ['Логистическая компания с 10 летним опытом', 'Доставка грузов из Китая в Кыргызстан', 'Команда из 100 профессионалов в своей области', 'Первое место в номинации “Динамика развития” в 2016 году на церемонии награждения лидеров отрасли Кыргызстана']
	},
	contacts: {
		type: [
			{
				city: String,
				address: String,
				phone: String,
			}
		],
		required: true,
		default: [{
			city: 'Адрес в Бишкеке:',
			address: 'г.Бишкек ул.Сыдыкова 113, пер. ул.Тоголок-Молдо',
			phone: '+996 501 116 622'
		}, {
			city: 'Адрес в Алматы:',
			address: 'г.Алматы ул.Розы Бакиева',
			phone: '+996 7906 116 622'
		}]
	},
	instruction: {
		type: Array,
		required: true,
		default: ['Надо так-то', 'Вот так-то']
	},
	type: {
        type: String,
        enum: ['site'],
        default: 'site',
    }
});

module.exports = mongoose.model('Site', siteSchema);