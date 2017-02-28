var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var allClients = [];


app.use('/', express.static(__dirname + '/'));

io.sockets.on('connection', function (socket) {
  allClients.push(socket);
  var ID = allClients.indexOf(socket);
  console.log("ID " + ID + " connected.");
  socket.on('disconnect', function() {
    console.log("ID " + ID + " disconnected.");
    allClients.splice(ID, 1);
  });
});

http.listen(port, function () {
	console.log('listening on *:' + (port).toString());
});
