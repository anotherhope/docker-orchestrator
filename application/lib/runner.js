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

					let service    = compose.services[serviceName];
					let context    = path.resolve(path.dirname(composePath),service.build.context);
					let dockerfile = path.resolve(context,service.build.dockerfile);

					if( fs.existsSync(context) && fs.existsSync(dockerfile)){
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
					}
				})
			)

		}

		return Promise.all(services);
	}

	static retry(fctToRetry, retryUntil = true, delayBeforRetry = 1000){
		if(typeof retryUntil === 'function'){
			return fctToRetry()
				.then(function()  { return retryUntil({ ...arguments }, true)  ? Promise.resolve(...arguments) : new Promise( resolve => { setTimeout(() => { resolve(Runner.retry(fctToRetry, retryUntil)); },delayBeforRetry) }); })
				.catch(function() { return retryUntil({ ...arguments }, false) ? Promise.resolve(...arguments) : new Promise( resolve => { setTimeout(() => { resolve(Runner.retry(fctToRetry, retryUntil)); },delayBeforRetry) }); })
		} else {
			return fctToRetry()
				.then(function()  { return  retryUntil ? Promise.resolve(...arguments) : new Promise( resolve => { setTimeout(() => { resolve(Runner.retry(fctToRetry, retryUntil)); },delayBeforRetry) }); })
				.catch(function() { return !retryUntil ? Promise.resolve(...arguments) : new Promise( resolve => { setTimeout(() => { resolve(Runner.retry(fctToRetry, retryUntil)); },delayBeforRetry) }); })
		}
	}

	static logIncomingMessage(chunk) {
		try {
			process.stdout.write(JSON.parse(chunk).stream);
		} catch(e) {
			process.stdout.write(chunk);
		}
	}

	static buildImage(services){
		let statements = [];
		for (let service of services){
			if (service.from.match(/^host_/gi)){
				statements.push(
					new Promise((resolve, reject) => {
						if (services.find( s => 'host_' + s.name === service.from)){
							this.retry( () => { return api.getImage( service.from ).get() }, (data,statment) => { return statment }).then( response => {
								api.buildImage({ context: '/tmp/.build/' + service.name },{
									t: 'host_' + service.name
								}).then( response => {
									response.on('data', this.logIncomingMessage);
									response.on('end', () => {
										resolve('host_' + service.name);
									});
								});
							})
						}
					})
				);
			} else {
				statements.push(
					new Promise((resolve, reject) => {
						api.buildImage({ context: '/tmp/.build/' + service.name },{
							t: 'host_' + service.name
						}).then( response => {
							response.on('data', this.logIncomingMessage);
							response.on('end', () => {
								resolve('host_' + service.name);
							});
						})
					})
				);	
			}
		}

		return Promise.all(statements);
	}

	static deploy(composePath){

		this.prepare(composePath)
			.then( services => this.buildImage(services) )
			.catch( e => {
				console.log(e);
			});

	}


}