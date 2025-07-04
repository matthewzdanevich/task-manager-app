const express = require('express');
const Task = require('../models/task.js');
const authenticateUser = require('../middleware/authentication.js');

// Маршрутизатор для задач
const router = new express.Router();

// POST - создание задачи
router.post('/tasks', authenticateUser, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        const newTask = await task.save();
        res.status(201).send(newTask);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET - получение всех задач пользователя
router.get('/tasks', authenticateUser, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.completed) {
            match.completed = (req.query.completed === "true");
        }

        if (req.query.sort) {
            const sortArray = req.query.sort.split(':');
            const sortField = sortArray[0];
            const sortDirection = sortArray[1] === 'asc' ? 1 : -1;
              
            sort[sortField] = sortDirection;
        } 

        await req.user.populate({ 
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        });
        res.status(200).send(req.user.tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET - получение конкретной задачи пользователя
router.get('/tasks/:id', authenticateUser, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send({
                message: 'Task not found'
            });
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH - изменение конкретной задачи пользователя
router.patch('/tasks/:id', authenticateUser, async (req, res) => {
    try {
        const availableFields = ['description', 'completed'];
        const updatedFields = Object.keys(req.body);
        const isUpdatable = updatedFields.every((field) => availableFields.includes(field));

        if (!isUpdatable) {
            return res.status(400).send({
                message: 'The following fields are not allowed to be updated'
            });
        }
        
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send({
                message: 'Task not found'
            });
        }

        updatedFields.forEach((field) => {
            task[field] = req.body[field];
        });

        const updatedTask = await task.save();

        res.status(200).send(updatedTask);
    } catch (error) {
        res.status(400).send(error);
    }
});

// DELETE - удаление конкретной задачи
router.delete('/tasks/:id', authenticateUser, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send({
                message: 'Task not found'
            });
        }

        res.status(200).send({
            message: `Task \"${task.description}\" has been deleted`
        });
    } catch (error) {
        res.status(500).send();
    }
});

// Экспорт маршрутизатора
module.exports = router;