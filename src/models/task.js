const mongoose = require('mongoose');

// Модель задачи
const Task = mongoose.model('Task', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

// Экспорт модели
module.exports = Task;