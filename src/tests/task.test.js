const app = require('../app.js');
const Task = require('../models/task.js');
const {
    defaultUserId,
    defaultUserToken,
    anotherUserToken,
    taskOneId,
    taskTwoId,
    taskThreeId,
    beforeEachTest,
    afterAllTests
} = require('./fixtures/configuration.js');

// Конфигурация тестирования
const { describe } = require('node:test');
const request = require('supertest');

// Удаление всех пользователей и добавление одного по умолчанию перед каждым следующим тестом
beforeEach(beforeEachTest);

// Закрытие соединения с базой данных после выполнения всех тестов
afterAll(afterAllTests);

// Тестирование POST-запросов
describe('POST requests', () => {
    // Создание задачи
    test('POST /tasks - create a task', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send({
                description: 'Walk the dog',
            })
            .expect(201);

        const task = Task.findById(response.body._id);
        expect(task).toBeDefined();
        expect(task.completed).toBeFalsy();
    });

    // Создание задачи, не указав все нужные данные
    test('POST /tasks - create a task without providing all the required data', async () => {
        await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send({
                completed: true
            })
            .expect(400);
    });

    // Создание задачи неавторизованного пользователя
    test('POST /tasks - create unauthorized user task', async () => {
        await request(app)
            .post('/tasks')
            .send({
                description: 'Walk the dog',
            })
            .expect(401);
    });
});

// Тестирование GET-запросов
describe('GET requests', () => {
    // Получение всех задач пользователя
    test('GET /tasks - get all user tasks', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
    });

    // Получение конкретной задачи пользователя
    test('GET /tasks/:id - get a specific user task', async () => {
        const response = await request(app)
            .get(`/tasks/${taskOneId}`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .expect(200);

        expect(response.body.owner.toString()).toEqual(defaultUserId.toString());
    });

    // Получение конкретной задачи другого пользователя
    test('GET /tasks/:id - get a specific task from another user', async () => {
        await request(app)
            .get(`/tasks/${taskTwoId}`)
            .set('Authorization', `Bearer ${anotherUserToken}`)
            .expect(404);
    });

    // Получение конкретной задачи неавторизованного пользователя
    test('GET /tasks/:id - get a specific unauthorized user task', async () => {
        await request(app)
            .get(`/tasks/${taskThreeId}`)
            .expect(401);
    });
});

// Тестирование PATCH-запросов
describe('PATCH requests', () => {
    // Изменение конкретной задачи пользователя
    test('PATCH /tasks/:id - update a specific user task', async () => {
        const response = await request(app)
            .patch(`/tasks/${taskOneId}`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send({
                completed: 'false'
            })
            .expect(200);

        expect(response.body.completed).toBeFalsy();
    });

    // Изменение конкретной задачи другого пользователя
    test('PATCH /tasks/:id - update a specific task from another user', async () => {
        await request(app)
            .patch(`/tasks/${taskOneId}`)
            .set('Authorization', `Bearer ${anotherUserToken}`)
            .send({
                completed: 'false'
            })
            .expect(404);

        const task = await Task.findById(taskOneId);
        expect(task.completed).toBeTruthy();
    });

    // Изменение несуществующих полей конкретной задачи пользователя
    test('PATCH /tasks/:id - update non-existent fields of a specific user task', async () => {
        await request(app)
            .patch(`/tasks/${taskOneId}`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send({
                location: 'Warsaw'
            })
            .expect(400);
    });

    // Изменение конкретной задачи неавторизованного пользователя
    test('PATCH /tasks/:id - update a specific unauthorized user task', async () => {
        await request(app)
            .patch(`/tasks/${taskOneId}`)
            .send({
                completed: 'false'
            })
            .expect(401);
    });
});

// Тестирование DELETE-запросов
describe('DELETE requests', () => {
    // Удаление конкретной заметки
    test('DELETE /tasks/:id - delete a specific note', async () => {
        await request(app)
            .delete(`/tasks/${taskTwoId}`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .expect(200);

        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .expect(200);

        expect(response.body).toHaveLength(1);        
    });

    // Удаление конкретной заметки другого пользователя
    test('DELETE /tasks/:id - delete a specific note from another user', async () => {
        await request(app)
            .delete(`/tasks/${taskOneId}`)
            .set('Authorization', `Bearer ${anotherUserToken}`)
            .expect(404);

        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .expect(200);

        expect(response.body).toHaveLength(2);        
    });

    // Удаление конкретной заметки неавторизованного пользователя
    test('DELETE /tasks/:id - delete a specific note from unauthorized user', async () => {
        await request(app)
            .delete(`/tasks/${taskThreeId}`)
            .expect(401);   
    });
});