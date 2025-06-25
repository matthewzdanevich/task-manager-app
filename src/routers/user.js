const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user.js');
const authenticateUser = require('../middleware/authentication.js');

// Мидлвар для загрузки файлов
const upload = multer({
    limits: {
        fileSize: 1 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('The file to be uploaded must be an image (jpg, jpeg, png).'));
        }

        cb(null, true);
    }
});

// Маршрутизатор для пользователей
const router = new express.Router();

// POST - создание пользователя
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        const newUser = await user.save();
        const token = await newUser.generateAuthenticationToken();
        res.status(201).send({
            message: `A new user named ${newUser.name} has been created`,
            token
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

// POST - вход в аккаунт пользователя
router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                message: "Bad request"
            });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).send({
                message: "Invalid credentials"
            });
        }

        const isAuthorized = await bcrypt.compare(req.body.password, user.password);
        if (!isAuthorized) {
            return res.status(401).send({
                message: "Invalid credentials"
            });
        }

        const token = await user.generateAuthenticationToken();
        res.status(200).send({
            message: `You're logged into ${user.name}'s account`,
            token
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// POST - выйти из сеанса пользователя
router.post('/users/logout', authenticateUser, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.status(200).send({
            message: `You have logged out of ${req.user.name}'s account`
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// POST - выйти из всех сеансов пользователя
router.post('/users/logoutAll', authenticateUser, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send({
            message: `You have logged out of all sessions of the ${req.user.name}'s account`
        });
    } catch (error) {
        res.status(500).send();
    }
});

// POST - загрузка иконки профиля
router.post('/users/profile/icon', authenticateUser, upload.single('icon'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize(380).jpeg().toBuffer();
        req.user.icon = buffer;
        await req.user.save();
        res.status(200).send({
            message: "The profile icon has been set"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
}, (error, req, res, next) => {
    res.status(400).send({
        message: error.message
    });
});

// GET - переход в профиль пользователя
router.get('/users/profile', authenticateUser, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET - отображение иконки профиля указанного пользователя
router.get('/users/:id/icon', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send({
                message: 'User not found'
            });
        }

        if (!user.icon) {
            return res.status(404).send({
                message: 'The user does not have a profile icon'
            });
        }

        res.set('Content-Type', 'image/jpeg');
        res.send(user.icon);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH - изменение пользователя
router.patch('/users/profile', authenticateUser, async (req, res) => {
    const availableFields = ['name', 'email', 'password'];
    const updatedFields = Object.keys(req.body);
    const isUpdatable = updatedFields.every((field) => availableFields.includes(field));

    if (!isUpdatable) {
        return res.status(400).send();
    }

    try {
        updatedFields.forEach((field) => {
            req.user[field] = req.body[field];
        });

        const updatedUser = await req.user.save();

        res.status(200).send(updatedUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

// DELETE - удаление пользователя
router.delete('/users/profile', authenticateUser, async (req, res) => {
    try {
        await req.user.deleteOne();
        res.status(200).send({
            message: `The user ${req.user.name} has been deleted`
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// DELETE - удаление иконки профиля
router.delete('/users/profile/icon', authenticateUser, async (req, res) => {
    try {
        if (!req.user.icon) {
            return res.status(404).send({
                message: 'To remove a profile icon, you must first set it up'
            });
        }

        req.user.icon = undefined;
        await req.user.save();
        res.status(200).send({
            message: 'The profile icon has been removed'
        });
    } catch (error) {
        res.status(500).send();
    }
})

// Экспорт маршрутизатора
module.exports = router;