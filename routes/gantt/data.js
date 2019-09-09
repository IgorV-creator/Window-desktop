module.exports = function(app, root) {
    const db = require('../../database');
    const Promise = require('bluebird');
    const mongoose = require('mongoose');
    mongoose.Promise = Promise;

//вызываем подключение к БД
        db().then(db => {
        const Gantt_task = db.collection('gantt_task');
        const Gantt_link = db.collection('gantt_link');

//создаем путь для доступа к созданной коллекции tasks/links 
//добавляем сессии пользователей и определяем права
        app.get(root + "/data", async(req, res, next) => {
            const userId = req.session.userId;
            const userLogin = req.session.userLogin;
            const owner = userId;
            console.log({ this_user: userId, login: userLogin });
            if (!userId) {
                // db.close();
                res.render('error');
            } else {
                try {
                    mongoose.Promise.all([
                        await Gantt_task.find({ owner }).toArray(function(err, tasks) {
                            if (err)
                                next(err);
                            else
                                Gantt_link.find({ owner }).toArray(function(err, links) {
                                    if (err)
                                        next(err);
                                    else
                                        for (var i = 0; i < tasks.length; i++) {
                                            tasks[i].id = tasks[i]._id;
                                            delete tasks[i]._id;
                                        }
                                    for (var j = 0; j < links.length; j++) {
                                        links[j].id = links[j]._id;
                                        delete links[j]._id;
                                    }
                                    //   console.log(links);
                                    res.send({
                                        open: true,
                                        data: tasks,
                                        collections: { links: links }
                                    });
                                });
                        })
                    ])
                } catch (error) {
                    console.log(error);
                }
            }
        });

        // добавляем записи task
        app.post(root + "/data/task", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    console.log(req.body);
                    const url = `${Date.now().toString(36)}`;
                    var orderIndex = 1;
                    await Gantt_task.findOne().then(maxOrder => {
                        if (!maxOrder) {
                            var task = getTask(req.body, req.session.userId, orderIndex, url);
                            return Gantt_task.insertOne(task, (err, result) => {
                                if (err)
                                    next(err);
                                else
                                    result.id = result._id;
                                delete result._id;
                                res.send(result);
                            });
                        } else {
                           
                            Gantt_task.find().sort().toArray(function(err, result) {
                                if (err)
                                    next(err);
                                else
                                                                    console.log(result);
                                orderIndex = (result[result.length - 1].sortorder) + 1;
                                task = getTask(req.body, req.session.userId, orderIndex, url);
                                return Gantt_task.insertOne(task, (err, result) => {
                                    if (err)
                                        next(err);
                                    else
                                        res.send({ result });
                                    // console.log(result);
                                    //console.log({ _id: result.insertedId });

                                });
                            })
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });

        //изменяем записи tasks
        app.put(root + "/data/task/:id", async(req, res) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    //определяем условия для формирования id для вновь создаваемях объектов upsert
                      if (req.params.id > 20) {
                        var sid = mongoose.Types.ObjectId();
                        var operation = { upsert: true }
                        
                            //   Gantt_task.remove({ _id: id });
                    } else {
                        sid = req.params.id;
                        operation = { new: true, upsert: true, returnOriginal: false };
                    }
                    var target = req.body.target,
                        orderIndex = Number(req.body.sortorder),
                        url = req.body.url,
                        task = getTask(req.body, req.session.userId, orderIndex, url),
                        newValues = { $set: task };
                    //await updateOrder(sid, target, orderIndex);
                    await Gantt_task.findOneAndUpdate({ _id: sid }, newValues, operation).then((result) => {
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

        // удаляем записи task
        app.delete(root + "/data/task/:id", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    var sid1 = req.params.id;
                    var sid2 = mongoose.Types.ObjectId(req.params.id);
                    console.log(req.params.id);
                    await Gantt_task.deleteMany({ _id: { $in: [sid1, sid2] } }, (err) => {
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

        // добавляем записи link
        app.post(root + "/data/link", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    console.log(req.body);
                    let link = getLink(req.body, req.session.userId);
                    await Gantt_link.insertOne(link, (err, result) => {
                        if (err)
                            next(err);
                        else
                            res.send({ result });
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });

        // изменяем записи link
        app.put(root + "/data/link/:id", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    console.log(req.body);
                    var sid = req.params.id,
                        task = getTask(req.body, req.session.userId),
                        newValues = { $set: task };
                    await Gantt_link.findOneAndUpdate({ _id: sid }, newValues, { returnOriginal: false, upsert: true, new: true }).then((result) => {
                            res.swnd({ result });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } catch (error) {
                    console.log(error);
                }
            }
        });

        // удаляем записи link
        app.delete(root + "/data/link/:id", async(req, res, next) => {
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    var sid1 = req.params.id;
                    var sid2 = mongoose.Types.ObjectId(req.params.id);
                    console.log(req.params.id);
                    Gantt_link.findOneAndDelete({ _id: { $in: [sid1, sid2] } }, (err) => {
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

        //создаем объект записи в БД для коллекции tasks
        function getTask(data, userId, orderIndex, url) {
            return {
                start_date: data.start_date,
                text: data.text,
                duration: data.duration,
                end_date: data.end_date,
                parent: data.parent,
                progress: data.progress || 0,
                sortorder: orderIndex || 0,
                open: true,
                target: data.target,
                owner: userId,
                url: url

            };
        }

          //создаем объект записи в БД для коллекции links
        function getLink(data, userId) {
            return {
                source: data.source,
                target: data.target,
                type: data.type,
                owner: userId
            };
        }

          //создаем метод для изменения объекта target
        function updateOrder(sid, target, orderIndex, data) {
            var nextTask = false;
            var targetOrder;
            var sortorder = orderIndex;

            target = target || "";

            if (target.startsWith("next:null")) {
                target = 0;
                nextTask = true;
            }
            return Gantt_task.find([target]).toArray((err, result) => {
                if (err)
                    console.log(err);
                else
                if (result === null) {
                    return targetOrder = 1;
                } else {
                    targetOrder = result[result.length - 1].sortorder;
                }
                if (nextTask)
                    targetOrder++;
                return Gantt_task.findOneAndUpdate({ _id: sid }, { $set: targetOrder }, { upsert: true, new: true }).then((result) => {
                    console.log({ result });
                });
            });
        }

    })
}