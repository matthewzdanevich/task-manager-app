const express = require('express');
const Task = require('../models/task.js');
const router = new express.Router();

// Маршрутизация POST-запросов
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body);

    try {
        const result = await task.save();
        res.status(201).send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Маршрутизация GET-запросов
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Маршрутизация PATCH-запросов
router.patch('/tasks/:id', async (req, res) => {
    const availableFields = ['description', 'completed'];
    const updatedFields = Object.keys(req.body);
    const isUpdatable = updatedFields.every((field) => availableFields.includes(field));

    if (!isUpdatable) {
        return res.status(400).send();
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Маршрутизация DELETE-запросов
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).send();   
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send();
    }
});

// Экспорт маршрутизатора
module.exports = router;