const Site = require('../models/Site');

module.exports = {
	getSite: async (req, res) => {
        try {
            const existingSite = await Site.findOne({ type: 'site' })

            if (!existingSite) {
                const helpText = await Site.create({ type: 'site' })

                return res.status(200).json(helpText)
            }

            return res.status(200).json(existingSite)
        } catch (e) {
            return res.status(500).json({
                message: `Server Error ${e.message}`,
            })
        }
    },
    updateSite: async (req, res) => {
        const { about, contacts, instruction } = req.body;

        try {
            await Site.updateOne(
                {
                    type: 'site',
                },
                {
                    about, contacts, instruction
                }
            )
            return res.status(201).json({
                message: 'Успешно обновлено!',
            })
        } catch (e) {
            return res.status(500).json({
                message: `Server Error ${e.message}`,
            })
        }
    }
};