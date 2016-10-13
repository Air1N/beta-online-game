var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('uuid');
var port = process.env.PORT || 80;
var connections = 0;
var UserID = 0;

var allClients = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/scripts', express.static(__dirname + '/scripts'));

io.on('connection', function(socket){
  allClients.push(socket);
  var UserID = allClients.indexOf(socket);
  io.emit('userConnect', UserID);
  console.log('ID: ' + UserID + ' connected.');

  socket.on('disconnect', function(){
    var UserID = allClients.indexOf(socket);
    console.log('ID: ' + UserID + ' disconnected.');
    io.emit('userDisconnect', UserID)
    allClients.splice(UserID, 1);
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('updatePos', function(data){
    io.emit('updatePos', data);
  });

  socket.on('move', function(data){
    io.emit('move', data);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + (port).toString());
});
