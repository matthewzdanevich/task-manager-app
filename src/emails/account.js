const nodemailer = require('nodemailer');

// Конфигурация транспортера
const appEmail = 'mk21mail@gmail.com';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: appEmail,
        pass: process.env.APP_PASSWORD
    }
});

// Письмо после создания аккаунта
const sendAccountCreationEmail = (email, name) => {
    transporter.sendMail({
        from: appEmail,
        to: email,
        subject: 'Welcome to the Task Manager App',
        text: `We are glad to see you in our application, ${name}! In our app you will be able to create, modify and delete your tasks. We hope you will enjoy using our product and that it will help you to simplify the process of managing your tasks.`
    }, (error) => {
        if (error) {
            throw new Error(error);
        }
    });
};

// Письмо после удаления аккаунта
const sendAccountDeletionEmail = (email, name) => {
    transporter.sendMail({
        from: appEmail,
        to: email,
        subject: 'All the best',
        text: `We hope you enjoyed using our product, ${name}! Tell us why you decided to delete your account and advise us what we can improve to make you come back to our app again?`
    }, (error) => {
        if (error) {
            console.error('Error sending account deletion email:', error);
        }
    });
};

// Экспорт функций
module.exports = { sendAccountCreationEmail, sendAccountDeletionEmail };