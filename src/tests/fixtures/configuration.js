const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.js');
const Task = require('../../models/task.js');

// Создание пользователей
const defaultUserId = new mongoose.Types.ObjectId();
const anotherUserId = new mongoose.Types.ObjectId();

const defaultUserToken = jwt.sign({ _id: defaultUserId.toString() }, process.env.JWT_SECRET_KEY);
const anotherUserToken = jwt.sign({ _id: anotherUserId.toString() }, process.env.JWT_SECRET_KEY);

const defaultUser = {
    _id: defaultUserId,
    name: 'Ben',
    email: 'ben@gmail.com',
    password: 'ben12345',
    tokens: [{
        token: defaultUserToken
    }]
};
const anotherUser = {
    _id: anotherUserId,
    name: 'Noah',
    email: 'noah@gmail.com',
    password: 'noah12345',
    tokens: [{
        token: anotherUserToken
    }]
};

// Создание задач
const taskOneId = new mongoose.Types.ObjectId();
const taskTwoId = new mongoose.Types.ObjectId();
const taskThreeId = new mongoose.Types.ObjectId();

const taskOne = {
    _id: taskOneId,
    description: 'Clean the house',
    completed: true,
    owner: defaultUserId
};
const taskTwo = {
    _id: taskTwoId,
    description: 'Water the plants',
    completed: false,
    owner: defaultUserId
};
const taskThree = {
    _id: taskThreeId,
    description: 'Take out the garbage',
    completed: true,
    owner: anotherUserId
};

// Очистка базы данных и добавление тестовых данных
const beforeEachTest = async () => {
    await User.deleteMany(); 
    await new User(defaultUser).save();
    await new User(anotherUser).save();

    await Task.deleteMany();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

// Закрытие соединения с базой данных после выполнения всех тестов
const afterAllTests = async() => {
    await mongoose.connection.close();
};

// Экспорт объекта конфигурации
module.exports = {
    defaultUserId,
    anotherUserId,
    defaultUserToken,
    anotherUserToken,
    taskOneId,
    taskTwoId,
    taskThreeId,
    beforeEachTest,
    afterAllTests
};