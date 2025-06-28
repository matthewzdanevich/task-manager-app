const app = require('./app.js');
const port = process.env.PORT || 3000;

// Запуск сервера
app.listen(port, '0.0.0.0', (error) => {
    if (error) {
        console.error(`Failed to start server on port ${port}: ${error.message}`);
        process.exit(1);
    }
    console.log(`The server is running on port: ${port}`);
});