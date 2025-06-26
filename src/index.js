const express = require('express');

// Конфигурация переменных окружения
require('dotenv').config();
if (!process.env.MONGODB_URL) {
    console.error('MongoDB URL is not set in environment variables.');
    process.exit(1);
}
if (!process.env.JWT_SECRET_KEY) {
    console.error('Secret key is not set in environment variables.');
    process.exit(1);
}
if (!process.env.APP_PASSWORD) {
    console.error('App password is not set in environment variables.');
    process.exit(1);
}

// Маршрутизаторы
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

// Соединение с СУБД
require('./db/connection.js');

// Конфигурация сервера
const app = express();
const port = process.env.PORT || 3000;

// Корневой маршрут
app.get('/', (req, res) => {
    res.status(200).send({ message: 'Task Manager API is running' });
});

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Запуск сервера
app.listen(port, '0.0.0.0', (error) => {
    if (error) {
        console.error(`Failed to start server on port ${port}: ${error.message}`);
        process.exit(1);
    }
    console.log(`The server is running on port: ${port}`);
});