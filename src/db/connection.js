const mongoose = require('mongoose');

// Соединение с СУБД
mongoose.connect('mongodb://127.0.0.1:27017/task-manager-app')
    .then(() => {
        console.log('A connection to MongoDB has been successfully established.')
    })
    .catch((error) => {
        console.log('An error occurred while establishing a connection to MongoDB:', error)
    });