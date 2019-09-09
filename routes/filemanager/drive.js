const wfs = require("wfs-local");

module.exports = function() {
    //cоздаем путь для сохранения
    const folder = __dirname + "/files";
    const fs = new wfs.LocalFiles(folder, null, {
        verbose: true
    });
    return fs;
};