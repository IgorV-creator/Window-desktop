const mongoose = require('mongoose');
const Schema = mongoose.Schema; //объект модели

const schema = new Schema({
    login: {
        type: String,
        required: true,
        //unique: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    accept: {
        type: String,
        required: true
    },
    url: {
        type: String,
        // unique: true
    }
}, {
    timestamps: true
});
schema.set('toJSON', { // чтобы представляла изБД объекты как как Json
    virtuals: true
});

module.exports = mongoose.model('User', schema); // передаем объект методом Post