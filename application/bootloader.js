const http    = require('http');
const socket  = require('socket.io');

http.createServer((req, res) => {
	console.log(req);
}).listen(3000,() => {
	console.log('listening on *:3000');
});

/*
io.on('connection', (socket) => {
  console.log('a user connected');
});
*/