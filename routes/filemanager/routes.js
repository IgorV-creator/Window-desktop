module.exports = function(app) {

    const root = "/data/local";
    require("./files")(app, root);
    require("./dynamicFiles")(app, root);
    require("./dynamicBranch")(app, root);

    // error, preview
    require("./other")(app, root);
}