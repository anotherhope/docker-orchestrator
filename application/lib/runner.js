const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const api 		= new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];
			console.log(serviceName, service);

			
			DockerAPI.buildImage({
				context: process.env.DOCKER_DIRECTORY + '/dockerfiles/bases/'+serviceName
			},{
				t: serviceName
			}, function (err, response) {
				console.log(...arguments);
			});

		}



		//console.log(compose);
	}


}