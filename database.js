const config = require('./config');
const mongoose = require('mongoose');

module.exports = function() {
    return new Promise((resolve, reject) => { //вщзвращает объект ожидания
        mongoose.Promise = global.Promise; // устанавливаем объекты ожидания из монгоосе
        mongoose.set('debug', true);

        mongoose.connection //слушаем события
            .on('error', error => reject(error))
            .on('close', () => console.log('Database connection closed!'))
            .once('open', () => resolve(mongoose.connections[0]));

        mongoose.connect(config.MONGO_URL, { useNewUrlParser: true });

    });
};