var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var connections = 0;
var allClients = -1;

app.use('/', express.static(__dirname + '/'));

/*app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});*/

io.sockets.on('connection', function (socket) {
	allClients++;
	var UserID = allClients;
	io.sockets.emit('userConnect', {
		UserID : UserID,
		laUID : allClients
	});
	console.log('ID: ' + UserID + ' connected.');

	socket.on('disconnect', function () {
		console.log('ID: ' + UserID + ' disconnected.');
		io.sockets.emit('userDisconnect', UserID);
		allClients--;
	});

	socket.on('chat message', function (msg) {
		io.sockets.emit('chat message', msg);
	});

	socket.on('updatePos', function (data) {
		io.sockets.emit('updatePos', data);
	});

	socket.on('move', function (data) {
		io.sockets.emit('move', data);
	});

	socket.on('spawnBird', function (data) {
		io.sockets.emit('spawnBird', data);
	});

	socket.on('moveCursor', function (data) {
		io.sockets.emit('moveCursor', data);
	});
	
	socket.on('birdKill', function (data) {
		io.sockets.emit('birdKill', data);
	});
	
	socket.on('newData', function (data) {
		io.sockets.emit('newData', data);
	});
});

http.listen(port, function () {
	console.log('listening on *:' + (port).toString());
});
