const app = require('./app');
const database = require('./database');
const config = require('./config');

// catch 404 and forward to error handler 
// app.use((req, res, next) => {
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });


// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.render('error.ejs', {
        message: error.message,
        error: !config.IS_PRODUCTION ? error : {},
        title: 'Oops...'
    });
});

database()
    .then(info => { // если подключились возвращается описание
        console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
        app.listen(config.PORT, () =>
            console.log(`Works localhost:${config.PORT}!`)
        );
    })
    .catch(() => { // иначе ошибка
        console.error('Unable to connect to database');
        process.exit(1);
    });