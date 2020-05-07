const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const fs 		= require("fs-extra");
const path 		= require("path");
const readline 	= require("readline");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376,
	//version : 'v1.40'
});

module.exports  = class Runner {

	static prepare(composePath){
		let compose  = Parser.loadFrom(composePath);
		let services = [];

		for (let serviceName in compose.services){
			services.push(
				new Promise((resolve,reject) => {
					let service = compose.services[serviceName];
					let context = path.resolve(path.dirname(composePath),service.build.context);
						fs.mkdirp('/tmp/.build/' + serviceName);
						fs.emptyDirSync('/tmp/.build/' + serviceName);
						fs.copySync(context, '/tmp/.build/' + serviceName);
						fs.copySync(path.resolve(context,service.build.dockerfile), '/tmp/.build/' + serviceName + '/Dockerfile');

					const lineReader = readline.createInterface({
						input: fs.createReadStream('/tmp/.build/' + serviceName + '/Dockerfile')
					}).on('line', (line) => {
						let match = /FROM\s([a-z0-9_]+)/gi.exec(line);
						if (match && match[1]){
							service.from = match[1];
							lineReader.close();
						}
					}).on('close',() => {
						service.name = serviceName;
						resolve(service);
					});
				})
			)

		}

		return Promise.all(services);
	}

	static deploy(composePath){

		this.prepare(composePath).then((services) => {
			console.log(services);

			let statements = [];

			for (let service of services){
				statements.push(
					api.getImages(service.from)
				);
				/*
					api.buildImage({ context: '/tmp/.build/' + serviceName },{
						t: 'local_' + serviceName + "_image"
					}, (err, response) => {
						if (!err){
							response.on('data', (chunk) => {
								try {
									process.stdout.write(JSON.parse(chunk).stream);
								} catch(e) {
									process.stdout.write(chunk);
								}
							}).on('end',() => {
								fs.removeSync('/tmp/.build/' + serviceName)
							});
						}
					});
				*/
			}

			return Promise.all(statements);
		}).then((all) => {
			console.log(all)
		}).catch( e => {
			console.log(e);
		});

	}


}