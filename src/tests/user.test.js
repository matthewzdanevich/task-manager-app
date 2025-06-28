const app = require('../app.js');
const User = require('../models/user.js');
const {
    defaultUserId,
    anotherUserId,
    defaultUserToken,
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
    // Создание пользователя
    test('POST /users - create a new user', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                name: 'Jason',
                email: 'jason@gmail.com',
                password: 'jason12345'
            })
            .expect(201);
        
        const user = await User.findById(response.body.user._id);
        expect(user).toBeDefined();
    });

    // Создание пользователя с дублирующимся адресом электронной почты
    test('POST /users - create user with duplicate email', async () => {
        const usersBefore = await User.find({ email: 'ben@gmail.com' });
        expect(usersBefore).toHaveLength(1);
        
        await request(app)
            .post('/users')
            .send({
                name: 'Ben',
                email: 'ben@gmail.com',
                password: 'ben12345'
            })
            .expect(400);

        const usersAfter = await User.find({ email: 'ben@gmail.com' });
        expect(usersAfter).toHaveLength(1);
    });

    // Вход в аккаунт пользователя
    test('POST /users/login - login to user account', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: 'ben@gmail.com',
                password: 'ben12345'
            })
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user.tokens[1].token).toBe(response.body.token);
    });

    // Вход в аккаунт пользователя, не указав все нужные данные
    test('POST /users/login - login to user account without providing all the required data (1)', async () => {
        await request(app)
            .post('/users/login')
            .send({
                email: 'ben@gmail.com',
            })
            .expect(400);

        const user = await User.findById(defaultUserId);
        expect(user.tokens).toHaveLength(1);
    });

    // Вход в аккаунт пользователя, не указав все нужные данные
    test('POST /users/login - login to user account without providing all the required data (2)', async () => {
        await request(app)
            .post('/users/login')
            .send({
                password: 'ben12345'
            })
            .expect(400);

        const user = await User.findById(defaultUserId);
        expect(user.tokens).toHaveLength(1);
    });

    // Вход в аккаунт пользователя, указав неверные данные
    test('POST /users/login - login to user account with incorrect data (1)', async () => {
        await request(app)
            .post('/users/login')
            .send({
                email: 'ben@gmail.com',
                password: 'ben1234567890'
            })
            .expect(401);

        const user = await User.findById(defaultUserId);
        expect(user.tokens).toHaveLength(1);
    });

    // Вход в аккаунт пользователя, указав неверные данные
    test('POST /users/login - login to user account with incorrect data (2)', async () => {
        await request(app)
            .post('/users/login')
            .send({
                email: 'ben12345@gmail.com',
                password: 'ben12345'
            })
            .expect(401);

        const user = await User.findById(defaultUserId);
        expect(user.tokens).toHaveLength(1);
    });

    // Выйти из сеанса пользователя
    test('POST /users/logout - logout of user session', async () => {
        await request(app)
            .post('/users/logout')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user.tokens).toHaveLength(0);
    });

    // Выйти из сеанса неавторизованного пользователя
    test('POST /users/logout - logout of unauthorized user session', async () => {
        await request(app)
            .post('/users/logout')
            .send()
            .expect(401);
    });

    // Выйти из всех сеансов пользователя
    test('POST /users/logoutAll - logout of all user sessions', async () => {
        await request(app)
            .post('/users/logoutAll')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user.tokens).toHaveLength(0);
    });

    // Выйти из всех сеансов неавторизованного пользователя
    test('POST /users/logoutAll - logout of all unauthorized user sessions', async () => {
        await request(app)
            .post('/users/logoutAll')
            .send()
            .expect(401);
    });

    // Загрузка иконки профиля
    test('POST /users/profile/icon - upload profile icon', async () => {
        await request(app)
            .post('/users/profile/icon')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .attach('icon', 'src/tests/fixtures/icon.jpg')
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user.icon).toEqual(expect.any(Buffer));
    });

    // Загрузка иконки профиля неправильного формата
    test('POST /users/profile/icon - upload profile icon of incorrect format', async () => {
        await request(app)
            .post('/users/profile/icon')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .attach('icon', 'src/tests/fixtures/icon.txt')
            .expect(400);

        const user = await User.findById(defaultUserId);
        expect(user.icon).toBeUndefined();
    });
});

// Тестирование GET-запросов
describe('GET requests', () => {
    // Переход в профиль пользователя
    test('GET /users/profile - get user profile', async () => {
        await request(app)
            .get('/users/profile')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user).toBeDefined();
    });

    // Переход в профиль неавторизованного пользователя
    test('GET /users/profile - get unauthorized user profile', async () => {
        await request(app)
            .get('/users/profile')
            .send()
            .expect(401);
    });

    // Отображение иконки профиля указанного пользователя
    test('GET /users/:id/icon - get profile icon of the specified user', async () => {
        await request(app)
            .post('/users/profile/icon')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .attach('icon', 'src/tests/fixtures/icon.jpg')
            .expect(200);

        await request(app)
            .get(`/users/${defaultUserId}/icon`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(200);
    });

    // Отображение иконки профиля несуществующего пользователя
    test('GET /users/:id/icon - get profile icon of non-existent user', async () => {
        await request(app)
            .get(`/users/${anotherUserId}/icon`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(404);
    });

    // Отображение иконки профиля указанного пользователя без иконки профиля
    test('GET /users/:id/icon - get profile icon of the specified user without the profile icon', async () => {
        const userBefore = await User.findById(defaultUserId);
        expect(userBefore.icon).toBeUndefined();

        await request(app)
            .get(`/users/${defaultUserId}/icon`)
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(404);
    });
});

// Тестирование PATCH-запросов
describe('PATCH requests', () => {
    // Изменение пользователя
    test('PATCH /users/profile - update user', async () => {
        await request(app)
            .patch('/users/profile')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send({
                name: 'Mark'
            })
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user.name).toBe('Mark');
    });

    // Изменение несуществующих полей пользователя
    test('PATCH /users/profile - update non-existent user fields', async () => {
        await request(app)
            .patch('/users/profile')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send({
                age: 20
            })
            .expect(400);
    });

    // Изменение неавторизованного пользователя
    test('PATCH /users/profile - update unauthorized user', async () => {
        await request(app)
            .patch('/users/profile')
            .send({
                name: 'Mark'
            })
            .expect(401);
    });
});

// Тестирование DELETE-запросов
describe('DELETE requests', () => {
    // Удаление пользователя
    test('DELETE /users/profile - delete user', async () => {
        await request(app)
            .delete('/users/profile')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(200);

        const user = await User.findById(defaultUserId);
        expect(user).toBeNull();
    });

    // Удаление неавторизованного пользователя
    test('DELETE /users/profile - delete unauthorized user', async () => {
        await request(app)
            .delete('/users/profile')
            .send()
            .expect(401);
    });

    // Удаление иконки профиля
    test('DELETE /users/profile/icon - delete profile icon', async () => {
        await request(app)
            .post('/users/profile/icon')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .attach('icon', 'src/tests/fixtures/icon.jpg')
            .expect(200);

        const userBefore = await User.findById(defaultUserId);
        expect(userBefore.icon).toEqual(expect.any(Buffer));
        
        await request(app)
            .delete('/users/profile/icon')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(200);

        const userAfter = await User.findById(defaultUserId);
        expect(userAfter.icon).toBeUndefined();
    });

    // Удаление несуществующей иконки профиля
    test('DELETE /users/profile/icon - delete non-existent profile icon', async () => {
        const userBefore = await User.findById(defaultUserId);
        expect(userBefore.icon).toBeUndefined();
        
        await request(app)
            .delete('/users/profile/icon')
            .set('Authorization', `Bearer ${defaultUserToken}`)
            .send()
            .expect(404);
    });

    // Удаление иконки профиля неавторизованного пользователя
    test('DELETE /users/profile/icon - delete profile icon of unauthorized user ', async () => {
        await request(app)
            .delete('/users/profile/icon')
            .send()
            .expect(401);
    });
});