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
					let service = compose.services[serviceName];
					let context = path.resolve(path.dirname(composePath),service.build.context);
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
				})
			)

		}

		return Promise.all(services);
	}

	static retry(fctToRetry, retryUntil = true){
		if(typeof retryUntil === 'function'){
			fctToRetry()
				.then(function()  { return retryUntil({ ...arguments }, true)  ? { ...arguments } : this.retry(fctToRetry, retryUntil); })
				.catch(function() { return retryUntil({ ...arguments }, false) ? { ...arguments } : this.retry(fctToRetry, retryUntil); })
		} else {
			fctToRetry()
				.then(function()  { return  retryUntil ? { ...arguments } : this.retry(fctToRetry, retryUntil); })
				.catch(function() { return !retryUntil ? { ...arguments } : this.retry(fctToRetry, retryUntil); })
		}
	}

	static buildImage(services){
		let statements = [];
		for (let service of services){
			if (service.from.match(/^_/gi)){

				if (services[service.from]){

					this.retry( api.getImage( service.from ).get,(data,statment) => { return statment }).then( response => {
						console.log(response);
						/*
							api.buildImage({ context: '/tmp/.build/' + service.name },{
								t: '_' + serviceName
							});
						*/
						console.log('build:', service.from, service.name, response.constructor);
					}).catch( e => {
						console.log(service.name,e);
					});

				}

			} else {
				api.buildImage({ context: '/tmp/.build/' + service.name },{
					t: 'host_' + service.name
				}).then( response => {
					console.log('build:', service.name, response.constructor);
				}).catch( e => {
					console.log(service.name,e);
				});			
			}


/*

(err, response) => {
	if (!err){
		response.on('data', (chunk) => {
			try {
				process.stdout.write(JSON.parse(chunk).stream);
			} catch(e) {
				process.stdout.write(chunk);
			}
		}).on('end',() => {

		});
	}
}

api.getImage( 'base_' + service.name ).get()
	.then((response)  => { console.log('exist:' +  'base_' + service.name,a ); })
	.catch(() => { console.log('not exist:' +  'base_' + service.name ); })

api.getImage( 'base_' + service.name  + '_').get()
	.then((response)  => { console.log('exist:' +  'base_' + service.name,a,b,c,d ); })
	.catch(() => { console.log('not exist:' +  'base_' + service.name  + '_'); })

				api.buildImage({ context: '/tmp/.build/' + service.name },{
					t: '_' + serviceName
				}, (err, response) => {
					if (!err){
						response.on('data', (chunk) => {
							try {
								process.stdout.write(JSON.parse(chunk).stream);
							} catch(e) {
								process.stdout.write(chunk);
							}
						}).on('end',() => {

						});
					}
				});
			*/
		}

		return Promise.all(statements);
	}

	static deploy(composePath){

		
		this.prepare(composePath)
			.then(this.buildImage)
			.catch( e => {
				console.log(e);
			});

	}


}