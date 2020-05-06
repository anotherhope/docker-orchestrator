const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376
});

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];

			api.buildImage({
				context: '/etc/docker.d/contexts/binary',
			},{
				t: serviceName,
				dockerfile:'/etc/docker.d/dockerfiles/bases/' + serviceName
			}, function (err, response) {
				console.log(...arguments);
			});

		}



		//console.log(compose);
	}


}