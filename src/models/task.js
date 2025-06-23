const mongoose = require('mongoose');

// Схема задачи
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

// Модель задачи
const Task = mongoose.model('Task', taskSchema);

// Экспорт модели
module.exports = Task;