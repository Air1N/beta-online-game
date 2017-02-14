var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var connections = 0;

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/lib', express.static(__dirname + '/lib'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	var UserID = socket.sessionid;
	io.sockets.emit('userConnect', {
		UserID : UserID,
		laUID : allClients.length - 1
	});
	console.log('ID: ' + UserID + ' connected.');

	socket.once('disconnect', function () {
		console.log('ID: ' + UserID + ' disconnected.');
		io.sockets.emit('userDisconnect', UserID)
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
