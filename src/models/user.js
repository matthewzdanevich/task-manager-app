const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');

// Схема пользователя
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
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
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    icon: {
        type: Buffer
    }
}, {
    timestamps: true
});

// Виртуальное поле для заметок пользователя
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// Метод экземпляра класса для скрытия данных
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    delete userObject.icon;

    return userObject;
}

// Метод экземпляра класса для генерации токена аутентификации
userSchema.methods.generateAuthenticationToken = async function () {
    try {
        const user = this;
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY);
        
        user.tokens = user.tokens.concat({token});
        await user.save();
        
        return token;
    } catch (error) {
        console.log('Error:', error);
    }
};

// Обработчик для хеширования пароля перед сохранением
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

// Обработчик для удаления связанных задач перед удалением пользователя
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const user = this;
        const result = await Task.deleteMany({ owner: user._id });
        next();
    } catch (error) {
        console.log(error);
    }
});

// Модель пользователя
const User = mongoose.model('User', userSchema);

// Экспорт модели
module.exports = User;