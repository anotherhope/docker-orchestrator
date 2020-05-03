const DockerAPI = require("dockerode");
const path 		= require("path")
const fs 		= require("fs")
const paths 	= {
	context     : '/etc/docker.d/contexts',
	dockerfile  : '/etc/docker.d/dockerfiles',
	profile     : '/etc/docker.d/profiles'
}

let register = {}

let api = new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

const contexts = fs.readdirSync(paths.dockerfile);

for (let context of contexts){
	for (let dockerfile of path.join(paths.dockerfile,context)){
		const dfpath = path.join(paths.dockerfile,context,dockerfile);
		const data   = fs.readFileSync(dfpath, 'utf8');
		const from   = data.match(RegExp("^FROM\\s((?:"+contexts.join('|')+")_[a-z]+):"));

		register[context + '_' + dockerfile] = {
			path 	   : dfpath,
			depends_on : from ? from[1] : false
		}
	}
}

console.log(register);