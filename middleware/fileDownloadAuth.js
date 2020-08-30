const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.params.token;
        if (!token) {
            return res.status(401).json({
                message: 'Нет авторизации'
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
        next();

    } catch (e) {
        res.status(401).json({
            message: 'Нет авторизации'
        })
    }
}