const express = require('express');
const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

// Соединение с СУБД
require('./db/connection.js');

// Конфигурация сервера
const app = express();
const port = 3000;
app.use(express.json());

// Маршрутизация запросов
app.use(userRouter);
app.use(taskRouter);

// Запуск сервера
app.listen(port, (error) => {
    if (error) {
        console.error(`Failed to start server on port ${port}: ${err.message}`);
        process.exit(1);
    }

    console.log(`The server is running on port: ${port}`);
});