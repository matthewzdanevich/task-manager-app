const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Обработчик для провери подлинности пользователя перед выполнением запроса
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const data = jwt.verify(token, JWT_SECRET_KEY);
        const user = await User.findOne({ _id: data._id , 'tokens.token': token });
        
        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({
            message: 'Unauthorized'
        });
    }
};

// Экспорт мидлвара
module.exports = authenticateUser;