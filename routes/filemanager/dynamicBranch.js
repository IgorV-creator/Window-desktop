const drive = require("./drive");

module.exports = function(app, root) {
    const fs = drive();

    app.use(root + "/branch", async(req, res, next) => {
        try {
            let data = await fs.list(req.body.source || "/")
            data.map(file => {
                if (file.type === "folder") {
                    file.webix_branch = true;
                }
            });

            if (req.body.source) {
                // sub levels
                res.send({
                    parent: req.body.source,
                    data
                });
            } else {
                // top level
                res.send([{
                    value: "Files",
                    id: "/",
                    data,
                    type: "folder",
                    open: true
                }]);
            }
        } catch (err) {
            next(err);
        }
    });

};