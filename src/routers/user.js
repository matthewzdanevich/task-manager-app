const express = require('express');
const User = require('../models/user.js');
const router = new express.Router();

// Маршрутизация POST-запросов
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        const result = await user.save();
        res.status(201).send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Маршрутизация GET-запросов
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).send();
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Маршрутизация PATCH-запросов
router.patch('/users/:id', async (req, res) => {
    const availableFields = ['name', 'email', 'password'];
    const updatedFields = Object.keys(req.body);
    const isUpdatable = updatedFields.every((field) => availableFields.includes(field));

    if (!isUpdatable) {
        return res.status(400).send();
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        if (!user) {
            return res.status(404).send();
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Маршрутизация DELETE-запросов
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).send();   
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send();
    }
});

// Экспорт маршрутизатора
module.exports = router;