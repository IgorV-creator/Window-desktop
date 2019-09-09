const path = require("path");
const mime = require("mime");
const fs = require("fs");

module.exports = function(app, root) {
    const folder = __dirname + "/files";

    app.post(root + "/error", async(req, res, next) => {
        res.status(400);
        res.send("None shall pass");
    });

    app.post(root + "/preview", async(req, res, next) => {
        const file = path.join(folder, req.body.source);
        const type = mime.lookup(file);

        let encoded = type.indexOf("image") == 0 ?
            "data:" + type + ";base64," + fs.readFileSync(file, "base64") :
            fs.readFileSync(file);

        res.send(encoded);
    })
};