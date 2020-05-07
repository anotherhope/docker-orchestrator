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

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];

			if(!fs.existsSync('/tmp/.build/' + serviceName)){
				fs.mkdirp('/tmp/.build/' + serviceName);
			}	fs.emptyDirSync('/tmp/.build/' + serviceName);
				fs.copySync('/etc/docker.d/contexts/binary', '/tmp/.build/' + serviceName);
				fs.copySync('/etc/docker.d/dockerfiles/bases/'+ serviceName, '/tmp/.build/' + serviceName + '/Dockerfile')

				api.buildImage({ 
					context: '/tmp/.build/' + serviceName
				},{
					t: serviceName
				}, (err, response) => {

					let body = '';
						response.setEncoding('utf8');
						response.on('data', (chunk) => {
							body += chunk;
						}).on('end', () => {
							console.log(body)
						});

					//console.log(...arguments);
				});

		}



		//console.log(compose);
	}


}