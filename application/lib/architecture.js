const Parser    = require(__dirname + "/parser.js");
const DockerAPI = require("dockerode");
const fs 		= require("fs-extra");
const path 		= require("path");
const events 	= require("events");
const readline 	= require("readline");
const os 		= require("os");
const api 		= new DockerAPI({ 
	//socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
	host: process.env.DOCKER_HOST || '192.168.1.4',
	port: process.env.DOCKER_PORT || 2376,
	//version : 'v1.40'
});
let instance 	= null;
module.exports  = class Architecture extends events {

	constructor(compose){
		super();
		this._compose = compose;
		this.host     = {
			name 			  : os.hostname			 	  ? os.hostname()		  		 : null,
			cpus 			  : os.cpus				 	  ? os.cpus()  			  		 : null,
			freemem 		  : os.freemem			 	  ? os.freemem()  		  		 : null,
			totalmem 		  : os.totalmem			 	  ? os.totalmem()  		  		 : null,
			usedmem 		  : os.totalmem	&& os.freemem ? os.totalmem() - os.freemem() : null,
			homedir 		  : os.homedir			 	  ? os.homedir()  		  		 : null,
			loadavg 		  : os.loadavg			 	  ? os.loadavg()  		  		 : null,
			networkInterfaces : os.networkInterfaces 	  ? os.networkInterfaces() 		 : null,
			platform 		  : os.platform			 	  ? os.platform()  		  		 : null,
			release 		  : os.release			 	  ? os.release()  		  		 : null,
			type 			  : os.type				 	  ? os.type()  			  		 : null,
			tmpdir 			  : os.tmpdir			 	  ? os.tmpdir() 			  	 : null,
			version 		  : os.version			 	  ? os.version() 		  		 : null
		}

		setImmediate(() => {
			this.emit('parse',this)
		});
	}

	static load(pathToCompose){
		if(!instance){
			instance = new this(Parser.loadFrom(pathToCompose));
		} return instance;
	}

	static prepare(architecture){
		let services = [];

		for (let serviceName in architecture.services){
			services.push(
				new Promise((resolve,reject) => {

					let service   		    = architecture.services[serviceName];
					let context   		    = path.resolve(path.dirname(composePath),service.build.context);
					let dockerfile		    = path.resolve(context,service.build.dockerfile);
						service.isBuildable = false;
					if( fs.existsSync(context) && fs.existsSync(dockerfile)){
						service.isBuildable = true;
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
					} else {
						resolve(service);
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

	static buildImages(services){
		let statments = [];
		for (let service of services){

			if (service.isBuildable){
				statments.push(
					service.from.match(/^host_/gi)
						? new Promise((resolve, reject) => {
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
						: new Promise((resolve, reject) => {
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

		return Promise.all(statments).then( statments => {
			return services
		});
	}

	static createVolumes(services){
		console.log(services)


		return Promise.all(services);
	}

	static deploy(composePath){

		this.prepare(composePath)
			.then( services => this.buildImages(services) )
			.then( services => this.createVolumes(services) )
			.then( services => { console.log(services) })
			.catch( e => {
				console.log(e);
			});

	}


}