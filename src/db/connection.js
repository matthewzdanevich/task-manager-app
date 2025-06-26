const mongoose = require('mongoose');

// Соединение с СУБД
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('A connection to MongoDB has been successfully established.')
    })
    .catch((error) => {
        console.log('An error occurred while establishing a connection to MongoDB:', error)
        process.exit(1);
    });