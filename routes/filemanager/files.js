const fpath = require("path");
const Busboy = require("busboy");
const drive = require("./drive");

async function each(data, handler){
	let paths = data.split(",");

	for(let i = 0; i < paths.length; i++)
		paths[i] = await handler(paths[i]);

	return paths.length > 0 ? paths : paths[0];
}

module.exports = function(app, root){
	const fs = drive();

	app.get(root, async (req, res, next)=>{
		try {
			res.send([{
				value: "Files",
				id: "/",
				data: await fs.list("/", { subFolders: true, nested:true }),
				type: "folder",
				open: true
			}]);
		}
		catch(err) {
			next(err);
		}
	});

	app.post(root, async (req, res, next)=>{
		try {
			const body = req.body;
			const path = body.source;

			switch (req.body.action){
				case "download":
					const data = await fs.read(body.source);
					const info = await fs.info(body.source);
					const name = encodeURIComponent(info.value);

					res.writeHead(200, {
						"Content-Type": "application/octet-stream",
						"Content-Disposition": "attachment; filename=" + name
					});
					data.pipe(res);
				break;
				case "remove":
					await each(path, file => fs.remove(file));
					res.send({});
				break;
				case "create":
					res.send(await fs.info(await fs.mkdir(fpath.join(body.target, path), { preventNameCollision: true })));
				break;
				case "copy":
					const copyResponse = await each(path, async file => {
						return fs.info(await fs.copy(file, body.target, { preventNameCollision: true }));
					});
					res.send(copyResponse);
				break;
				case "move":
					const moveResponse = await each(path, async file => {
						return fs.info(await fs.move(file, body.target, { preventNameCollision: true }));
					});
					res.send(moveResponse);
				break;
				case "rename":
					const newname = fpath.join( fpath.dirname(path), body.target);
					res.send(await fs.info(await fs.move(path, newname)));
				break;
				case "search":
					const files = await fs.list(path, {
						include: (fname) => fname.toLowerCase().indexOf(body.text.toLowerCase()) != -1,
						subFolders:true
					});
					res.send(files);
				break;
				default:
					// body-parser does not handle multipart bodies
					// so we can't read body.action for upload actions
					// instead of it, we will check the content-type
					if(req.headers["content-type"].indexOf("multipart/form-data")!=-1){
						const busboy = new Busboy({ headers: req.headers });
						
						busboy.on("file", async (field, file, name) => {
							const target = fpath.join(req.query.target, name);
							res.send(await fs.info(await fs.write(target, file, { preventNameCollision: true })));
						});

						req.pipe(busboy);
					}
			}
		}
		catch(err){
			console.error(err);
			next(err);
		}
	});
};