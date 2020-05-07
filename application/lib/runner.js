const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const fs 		= require("fs-extra");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376,
	//version : 'v1.40'
});

console.log(fs.readFileSync('/etc/hosts'));

module.exports  = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		for (let serviceName in compose.services){
			let service = compose.services[serviceName];

				fs.mkdirp('/tmp/.build/' + serviceName);
				fs.copySync('/etc/docker.d/contexts/binary', '/tmp/.build/' + serviceName);
				fs.copySync('/etc/docker.d/dockerfiles/bases/'+ serviceName, '/tmp/.build/' + serviceName + '/Dockerfile')

				api.buildImage({ context: '/tmp/.build/' + serviceName },{
					t: serviceName
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

		}

		//console.log(compose);
	}


}