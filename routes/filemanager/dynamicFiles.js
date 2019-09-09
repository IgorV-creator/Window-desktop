const drive = require("./drive");

function markFolders(data) {
    data.forEach(file => {
        if (file.type === "folder") {
            file.webix_files = 1;
            if (file.data) {
                markFolders(file.data);
            }
        }
    })
}

module.exports = function(app, root) {
    const fs = drive();

    app.get(root + "/files", async(req, res, next) => {
        try {
            const data = await fs.list("/", { subFolders: true, skipFiles: true, nested: true });
            markFolders(data);

            res.send([{
                value: "Files",
                id: "/",
                data,
                type: "folder",
                open: true
            }]);
        } catch (err) {
            next(err);
        }
    });

    app.post(root + "/files", async(req, res, next) => {
        try {
            res.send({
                parent: req.body.source,
                data: await fs.list(req.body.source, {})
            });
        } catch (err) {
            next(err);
        }
    });
};