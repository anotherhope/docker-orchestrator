const Architecture     = require(__dirname + "/lib/architecture.js");
const Viewer 		   = require(__dirname + "/lib/viewer.js");
const [,,path,...args] = process.argv;

Architecture.load(path || process.env.DOCKER_COMPOSE).on('parse',(arch) => {
	console.log(arch);
})


/*
var cluster = require('cluster');

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
	console.log('worker')
}
*/




/*
let api 		= new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

const contexts = fs.readdirSync(paths.dockerfile);

for (let context of contexts){
	for (let dockerfile of fs.readdirSync(path.join(paths.dockerfile,context))){
		const dfpath = path.join(paths.dockerfile,context,dockerfile);
		const data   = fs.readFileSync(dfpath, 'utf8');
		const from   = data.match(RegExp("^FROM\\s((?:"+contexts.join('|')+")_[a-z_§]+):"));

		register[context + '_' + dockerfile] = {
			path 	   : dfpath,
			depends_on : from 
							? from[1] 
							: false,
			context    : fs.existSync(path.join(paths.context,dockerfile)) 
							? path.join(paths.context,dockerfile)
							: path.join(paths.context,'binary')
		}
	}
}

console.log(register);

*/