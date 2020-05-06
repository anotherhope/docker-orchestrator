const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const fs 		= require("fs-extra");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376,
	//version : 'v1.40'
});

const build = __dirname + '/../../.build';

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];

			if(!fs.existsSync(build + '/' + serviceName)){
				fs.mkdirp(build + '/' + serviceName);
			}	fs.emptyDirSync(build + '/' + serviceName);
				fs.copy('/etc/docker.d/contexts/binary', build + '/' + serviceName);
				fs.copy('/etc/docker.d/dockerfiles/bases/'+ serviceName, build + '/' + serviceName + '/Dockerfile')

				api.buildImage({ 
					context: build + '/' + serviceName
					src: ["Dockerfile"]
				},{
					t: serviceName
				}, function (err, response) {
					console.log(...arguments);
				});

		}



		//console.log(compose);
	}


}