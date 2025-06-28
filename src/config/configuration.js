require('dotenv').config({ path: './.dev.env' });

// Проверка наличия URL к базе данных
if (!process.env.MONGODB_URL) {
    console.error('MongoDB URL is not set in environment variables.');
    process.exit(1);
}

// Проверка наличия секретного ключа для аутентификации
if (!process.env.JWT_SECRET_KEY) {
    console.error('Secret key is not set in environment variables.');
    process.exit(1);
}

// Проверка наличия пароля приложения для отправки писем на электронную почту
if (!process.env.APP_PASSWORD) {
    console.error('App password is not set in environment variables.');
    process.exit(1);
}