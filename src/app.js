require('./config/configuration.js');
require('./db/connection.js');
const express = require('express');

// Маршрутизаторы
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

// Конфигурация сервера
const app = express();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Корневой маршрут
app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Task Manager API is running'
    });
});

// Экспорт сервера
module.exports = app;