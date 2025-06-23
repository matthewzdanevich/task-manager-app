const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const authenticateUser = require('../middleware/authentication.js');

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

// GET - переход в профиль пользователя
router.get('/users/profile', authenticateUser, async (req, res) => {
    try {
        res.status(200).send(req.user);
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

// Экспорт маршрутизатора
module.exports = router;