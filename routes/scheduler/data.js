module.exports = function(app, root) {
    var db = require('../../database');
    const mongoose = require('mongoose');

    // клиентская сторона ожидает obj.id, в то время как DB предоставляет obj._id
    function fixID(a) {
        a.id = a._id;
        delete a._id;
        return a;
    }
    //вызываем подключение к БД
    db().then(db => {
// создаем переменную и передаем в нее коллекцию "scheduler"
        var Sched = db.collection('scheduler');
        
//создаем путь для доступа к созданной коллекции tasks/links 
//добавляем сессии пользователей и определяем права
        app.get(root + "/data", async(req, res, next) => { const userId = req.session.userId;
            const userLogin = req.session.userLogin;
            const owner = userId;
            console.log({ this_user: userId, login: userLogin });
            if (!userId) {
                res.render('error');
            } else {
                try {
                    await Sched.find({ owner }).sort({ order: 1 }).toArray((err, data) => {
                        if (err)
                            next(err);
                        else
                            res.send(data.map(fixID));
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });

        //изменяем записи 
        app.put(root + "/data/:id", async(req, res) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    const userId = req.session.userId;
                    console.log(req.body);
                    var data = {
                        start_date: req.body.start_date,
                        end_date: req.body.end_date,
                        text: req.body.text,
                        allDay: req.body.allDay,
                        details: req.body.details,
                        owner: userId
                    };
                    var newValues = { $set: data };

                    if (req.params.id > 20) {
                        var sid = mongoose.Types.ObjectId();
                        var operation = { upsert: true }
                    } else {
                        sid = req.params.id;
                        operation = { new: true, upsert: true, returnOriginal: false };
                    }
                    await Sched.findOneAndUpdate({ _id: sid }, newValues, operation).then((result) => {
                            res.json({ result });
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                } catch (error) {
                    console.log(error);
                }
            }
        });
//удаляем записи
        app.delete(root + "/data/:id", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    var sid1 = req.params.id;
                    var sid2 = mongoose.Types.ObjectId(req.params.id);
                    console.log(req.params.id);
                    await Sched.deleteMany({ _id: { $in: [sid1, sid2] } }, (err) => {
                        if (err)
                            next(err);
                        else
                            res.send({});
                    });

                } catch (error) {
                    console.log(error);
                }
            }
        });

        //создаем записи
        app.post(root + "/data", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    console.log(req.body);
                    const userId = req.session.userId;
                    let data = {
                        start_date: req.body.start_date,
                        end_date: req.body.end_date,
                        text: req.body.text,
                        allDay: req.body.allDay,
                        details: req.body.details,
                        owner: userId
                    };
                    await Sched.insertOne(data, (err, data) => {
                        if (err)
                            next(err);
                        else
                            res.send({ id: fixID(data).id });
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });
    });
};