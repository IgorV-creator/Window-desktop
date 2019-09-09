module.exports = function(app) {
    const bcrypt = require('bcrypt-nodejs'); //модуль шифрования используем для пароля
    const tr = require('transliter'); //модуль траслятирирует посты

    const User = require('../models/user');

    //создаем путь для извлеченеия приветствия(login) в основное меню
    app.get('/login', (req, res) => {
        console.log(req.body);
        const id = req.session.userId;
        const login = req.session.userLogin;
        console.log(login);
        !login ? res.send('Вы не авторизованы') : res.send('Hello,' + ' ' + login);
    });

    //создаем путь на страницу пользователя
    app.get('/users/:id', async(req, res) => {
        const id = req.session.userId;
        const login = req.session.userLogin;
        if (!login) {
            res.send('Вы не являетесь владельцем этого Login')
        } else {
            try {
                await res.render('auth', {
                    user: {
                        id,
                        login
                    }
                });              
            } catch (error) {
                console.log(error);
            }
        }
    });

    //POST регистрация
    app.post('/register', (req, res) => {
        console.log(req.body);
        const login = req.body.username; //принимаем значения полей из body  и перекладываем в переменные
        const Email = req.body.email;
        const password = req.body.register_password;
        const passwordConfirm = req.body.passwordConfirm;
        const accept = req.body.accept;
        const url = `${tr.slugify(login)}-${Date.now().toString(36)}`;

        if (password !== passwordConfirm) {
            res.json({
                ok: false,
                error: 'Пароли не совпадают!',
                fields: ['password', 'passwordConfirm']
            });
        } else if (accept != 1) {
            res.json({
                ok: false,
                error: 'Не приняты услолвия пользования',
                fields: ['accept']
            });
        } else {
            User.findOne({ //ищем user с логином
                    Email
                })
                .then(user => {
                    if (!user) { // если пустой то выполняется все дальше.Если уже есть (имя занято)
                        bcrypt.hash(password, null, null, (err, hash) => {

                            User.create({ // создаем объект
                                    login,
                                    Email,
                                    password: hash,
                                    accept,
                                    url
                                })
                                .then(user => { // возвращается объект созданного user
                                    console.log(user);
                                    req.session.userId = user._id; //осуществляем сохранение сессии через id на сервере (в cooксе) храним только ссылку на пароль ии логин(express-session)
                                    req.session.userLogin = user.login;
                                    req.session.userUrl = user.url;
                                    req.session.userEmail = user.Email;

                                            res.redirect('/users/' + login);
                                       
                                })
                                .catch(err => { // отработка исключений
                                    console.log(err);
                                    res.json({
                                        ok: false,
                                        error: 'Ошибка, попробуйте позже!'
                                    });
                                });

                        });
                    } else {
                        res.json({
                            ok: false,
                            error: 'Email занято, укажите другой!',
                            fields: ['Email']
                        });
                    }
                })
        }

    });

    //POST авторизация
    app.post('/user', (req, res) => {
        console.log(req.body);
        const login = req.body.login;
        const password = req.body.password;

        if (!login || !password) { //если поля пустые
            const fields = []; //создаем массив в который добавляем заполненне значения
            if (!login) fields.push('login');
            if (!password) fields.push('password');

            res.json({
                ok: false, //если всо ок, ОК будет rtue иначе false
                error: 'Все поля должны быть заполнены!', //название ошибки
                // fields // поля содержащие ошибку подстветим в стилях красным
            });
        } else {
            User.findOne({ // проверяем пользователя - ищем в БД берем пароль из БД и авторизуем
                    login // смотрим есть ли логин в БД сверяем со строкой из формы и либо ОК либо ошиб
                }).then(user => {
                    if (!user) {
                        res.json({
                            ok: false,
                            error: 'Логин не верный!',
                            fields: ['login', 'password']
                        });
                    } else {
                        bcrypt.compare(password, user.password, function(err, result) {
                            console.log(result);
                            if (!result) {
                                res.json({
                                    ok: false,
                                    error: 'Пароль не верный!',
                                    fields: ['login', 'password']
                                });
                            } else {
                                req.session.userId = user.id; //осуществляем сохранение сессии через id на сервере (в cooксе) храним только ссылку на пароль ии логин(express-session)
                                req.session.userLogin = user.login;
                                req.session.userUrl = user.url;
                                req.session.daY = user.createdAt.getDate();
                                req.session.month = user.updatedAt.getMonth() + 1;
                                req.session.year = user.updatedAt.getFullYear();

                                res.redirect('/users/' + login);
                            }
                            console.log(user.updatedAt);
                        });
                     }
                })
                .catch(err => {
                    console.log(err);
                    res.json({
                        ok: false,
                        error: 'Ошибка, попробуйте позже!'
                    });
                });
        }
    });

    // завершаем logout
    app.get('/logout', (req, res) => { // путь для выхода из сессии
        if (req.session) {
            // delete session object
            req.session.destroy(() => {
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    });
}