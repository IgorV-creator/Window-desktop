module.exports = function(app, root) {
    var db = require('../../database');

 //вызываем подключение к БД
    db().then(db => {
        app.get(root + "/data/dyn", async(req, res, next) => {
            var Sched = db.collection('scheduler');
            const userId = req.session.userId;
            if (!userId) {
                res.render('error');
            } else {
                try {
                    //cортируем динамические данные
                    await Sched.find({
                        start_date: { $lt: req.query.to + " 24:00" },
                        end_date: { $gte: req.query.from }
                    }).sort({ order: 1 }).toArray((err, data) => {
                        if (err)
                            next(err);
                        else
                            res.send(data);
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        });
    });
};