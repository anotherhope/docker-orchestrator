const DockerAPI = require("dockerode");
const fs        = require("fs");

let api = new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});
