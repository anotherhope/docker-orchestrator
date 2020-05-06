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
			console.log(serviceName,service);
			/*
			DockerAPI.buildImage({
				context: __dirname,
				src: ['Dockerfile', 'file1', 'file2']
			},{
				t: "imageName"
			}, function (err, response) {
				console.log(...arguments);
			});
			*/

		}



		//console.log(compose);
	}


}