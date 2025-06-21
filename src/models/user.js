const mongoose = require('mongoose');
const validator = require('validator');

// Модель пользователя
const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('The email address is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('The password must not contain the word “password”');
            }
        }
    }
});

// Экспорт модели
module.exports = User;