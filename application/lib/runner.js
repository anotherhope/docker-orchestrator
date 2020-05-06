const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const fs 		= require("fs-extra");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376,
	//version : 'v1.40'
});

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		console.log('=>',fs.existsSync)

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];

			api.buildImage({
				context: '/etc/docker.d/contexts/binary',
				src : [ '../../dockerfiles/bases/' + serviceName ]
			},{
				t: serviceName,
				dockerfile : serviceName
			}, function (err, response) {
				console.log(...arguments);
			});

		}



		//console.log(compose);
	}


}