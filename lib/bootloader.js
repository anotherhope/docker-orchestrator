const DockerAPI = require("dockerode");
const Express   = require("express");
const app 		= Express();

let api = new DockerAPI({ 
	socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});



app.get('/', (req, res) => {
	res.end();
}).get('/reload', (req, res) => {
	res.send('Hello World!')
}).listen(3000);
