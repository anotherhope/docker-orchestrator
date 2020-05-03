const Server = require(__dirname + "/services/Server.js").start();
const API    = require(__dirname + "/services/API.js").connect();



/*
// { socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'}
  if (server.isRunning() && server.isConnected()){
  	  server.
  }
	  server.register('controllers');

/*
const http      = require("http");
const socket    = require("socket.io");
const express   = require("express");
const dockerode = require("dockerode");
const config    = require("../config/connect.json");

let docker  = new dockerode(config);
//let docker2 = new dockerode({ host: "http://192.168.1.4", port: 2375 });

let app         = express().use(express.static(__dirname + "/../public"));
let server 	    = http.createServer(app).listen(3000);
let io 		    = socket(server);
	io.on("connection", (socket) => {
		console.log("a user connected");
	});
*/