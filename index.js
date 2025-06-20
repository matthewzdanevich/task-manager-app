const { MongoClient, ObjectId } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

const connectToMongoDB = async () => {
    const client = new MongoClient(connectionURL);
    
    try {
        // Соединение с СУБД
        await client.connect();
        console.log('A connection to MongoDB has been successfully established.');

        // Получение объекта базы данных
        const db = client.db(databaseName);
        
        // Получение объекта коллекции базы данных
        const collectionTasks = db.collection('tasks');

        // * CREATE - создание документов

        // Создание одного документа
        // const resultInsertOne = await collectionTasks.insertOne({ description: 'Take out the garbage', completed: false });
        // console.log('insertOne:', resultInsertOne.acknowledged);
        // console.log('insertedId:', resultInsertOne.insertedId.toString());

        // Создание нескольких документов
        // const resultInsertMany = await collectionTasks.insertMany([
        //     { description: 'Buy a T-shirt', completed: true },
        //     { description: 'Buy shorts', completed: true }
        // ]);
        // console.log('insertMany:', resultInsertMany.acknowledged);
        // Object.values(resultInsertMany.insertedIds).forEach(id => {
        //     console.log('insertedId:', id.toString());
        // });

        // * READ - чтение документов

        // Чтение одного документа
        // const resultFindOne = await collectionTasks.findOne({ _id: new ObjectId("68543da28d6db99ba151d69f") });
        // console.log(resultFindOne);

        // Чтение нескольких документов
        // const resultFind = await collectionTasks.find({ completed: false }).toArray();
        // console.log(resultFind);

        // * UPDATE - обновление документов

        // Обновление одного документа
        // const resultUpdateOne = await collectionTasks.updateOne(
        //     { _id: new ObjectId("68543da28d6db99ba151d69f") },
        //     { "$set": {
        //         completed: false
        //     } }
        // );
        // console.log(resultUpdateOne);

        // Обновление нескольких документов
        // const resultUpdateMany = await collectionTasks.updateMany(
        //     {
        //          completed: false
        //     },
        //     { "$set": {
        //         completed: true
        //     } }
        // );
        // console.log(resultUpdateMany);

        // * DELETE - удаление документов

        // Удаление одного документа
        // const resultDeleteOne = await collectionTasks.deleteOne({ description: "Buy a T-shirt" });
        // console.log(resultDeleteOne);

        // Удаление нескольких документов
        // const resultDeleteMany = await collectionTasks.deleteMany({ completed: false });
        // console.log(resultDeleteMany);
    } catch (error) {
        console.log(`An error occurred while performing the operation: ${error}`);
    } finally {
        await client.close();
        console.log('The connection to MongoDB is closed.');
    }
};

connectToMongoDB();