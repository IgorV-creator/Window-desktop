module.exports = function(app) {
    //создаем путь к коллекциям scheduler
    const root = "/scheduler/server";
    require("./data")(app, root);
    require("./dyn_data")(app, root);
}