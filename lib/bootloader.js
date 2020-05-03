const DockerAPI = require("dockerode");
const path 		= require("path")
const fs 		= require("fs")
const paths 	= {
	context    : '/etc/docker.d/contexts',
	dockerfile : '/etc/docker.d/dockerfiles',
	profile    : '/etc/docker.d/profiles'
}

let api = new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

fs.readdir(paths.dockerfile, (err, items) => {
    //console.log(items);
});