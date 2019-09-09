const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('./config');
require("date-format-lite");

const app = express();

// sessions
app.use(
    session({
        secret: config.SESSION_SECRET, //SESSION_SECRET добавляем в config. для безопасности
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection //подключаемся а БД
        })
    })
);

app.set('view engine', 'ejs'); //подключаем шаблонизатор и указываем дерикторию 
//app.use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); //указываем, чтобы express отдавал статику из папки
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(bodyParser.json());

//подключаем скрипты и стили
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules', 'webix')));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules', 'webix')));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules', 'webix', 'gantt')));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules', 'webix', 'filemanager', 'codebase')));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules', 'webix', 'filemanager', 'codebase')));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules', 'webix', 'scheduler', 'codebase')));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules', 'webix', 'scheduler', 'codebase')));

//подключаем вывод id и login для авторизации и управлением контентом 
app.get('/', (req, res) => {
    const id = req.session.userId;
    const login = req.session.userLogin;

    res.render('index', {
        user: {
            id,
            login
        }
    });
});
// подключаем routers
require("./routes/gantt/routes")(app);
require("./routes/scheduler/routes")(app);
require("./routes/filemanager/routes")(app);
require("./routes/user")(app);

module.exports = app;