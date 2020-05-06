require(__dirname + "/prototype/Object.js");

const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const api 		= new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		for (let service of compose.services){
			
			console.log(service);
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