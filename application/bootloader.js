const http      = require('http');
const socket    = require('socket.io');
const express   = require('express');
const dockerode = require('dockerode');

var docker  = new dockerode({ socketPath: '/var/run/docker.sock' });
var docker2 = new dockerode({ host: 'http://192.168.1.4', port: 2375 });

	console.log(docker2.listImages());

let app         = express().use(express.static(__dirname + '/../public'));
let server 	    = http.createServer(app).listen(3000);
let io 		    = socket(server);
	io.on('connection', (socket) => {
		console.log('a user connected');
	});
