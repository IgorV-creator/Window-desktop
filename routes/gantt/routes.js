module.exports = function(app) {
    const root = "/gantt/server";
    require("./data")(app, root);
}