const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const fs 		= require("fs-extra");
const path 		= require("path");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376,
	//version : 'v1.40'
});

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];

				let context = path.resolve(path.dirname(path),service.build.context);
				fs.mkdirp('/tmp/.build/' + serviceName);
				fs.copySync(context, '/tmp/.build/' + serviceName);
				fs.copySync(path.resolve(context,service.build.dockerfile), '/tmp/.build/' + serviceName + '/Dockerfile')

		}

		for (let serviceName in compose.services){

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

		//console.log(compose);
	}


}