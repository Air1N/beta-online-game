var socket = io();
  var player = [];
  var mUID;
  var leftLength = 0;
  var rightLength = 0;
  var upLength = 0;
  var lUID = 0;
  var isChatOpen = false;
  var chatFade = 0;
  var game = new Phaser.Game(800, 400, Phaser.AUTO, '', { preload: preload, create: create, update: update });
  var target;
  var gameState = "";

  function preload() {
    game.stage.disableVisibilityChange = true;
    game.load.image('ariLUL', '/assets/ariLUL.png');
    
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.updateLayout(true);
    var enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    enter.onDown.add(toggleChat, this);
  }


  function create() {
    cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(-200, game.world.height - 64, 'ariLUL');
    ground.body.immovable = true;
    ground.scale.setTo(50, 2);
    gameState = "loaded";
    
    for (i = 0; i <= lUID; i++) loadSprite(i);
  }
  
  function loadSprite(i) {
        console.log(i + " // Defining");
        var plx = player[i].position.x;
        var ply = player[i].position.y;
        player[i];
        //player.splice(i, 1);
        player[i] = game.add.sprite(plx, ply, 'ariLUL');
        game.physics.arcade.enable(player[i]);
        player[i].body.bounce.y = 0.2;
        player[i].body.gravity.y = 300;
        player[i].body.collideWorldBounds = true;
        console.log(player[i]);
  }

  function update(){
    for (i = 0; i <= lUID; i++) {
      game.physics.arcade.collide(player[i], platforms);
    }
    Input();
  }

  function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatFade = 0;
      openChat();
    } else {
      chatFade = 0.85;
      closeChat();
    }
  }

  socket.on('userConnect', function(data) {
    lUID = data.laUID;
    UserID = data.UserID;

    if (mUID === undefined) mUID = UserID;
    for (i = 0; i <= lUID; i++) {
      console.log(i + " // First Spawn")
      if (player[i] == null) {
        player[i] = {position: {x: 0, y: 0}};
        loadSprite(i);
      }
    }
    console.log(mUID + "M // U" + lUID + " // New User UUID")
    socket.emit('updatePos', player[mUID].position.x + ' ' + player[mUID].position.y + ' ' + mUID);
    console.log(player[mUID].position.x + " // " + player[mUID].position.y + " // Old Users Positions // " + mUID)
  });
  
  function openChat() {
    if (chatFade < 0.85 && isChatOpen) {
      chatFade += 0.05;
      document.getElementById("chatBox").style.opacity = chatFade;
      setTimeout(openChat, 1000/100);
    }
  }
  
  function closeChat() {
    if (chatFade > 0 && !isChatOpen) {
      chatFade -= 0.05;
      document.getElementById("chatBox").style.opacity = chatFade;
      setTimeout(closeChat, 1000/100);
    }
  }
  
  
  
function Input() {
  if (cursors) {
    if (cursors.right.isUp && cursors.left.isUp) {
        socket.emit('move', 'x ' + 0 + ' ' + mUID);
        player[mUID].body.velocity.x = 0;
      
        left = false;
        right = false;
    }
    
    if (player[mUID].body.touching.down) up = false;

    if (cursors.left.isDown) {
      left = true;
      
      socket.emit('move', 'x ' + -150 + ' ' + mUID);
      player[mUID].body.velocity.x = -150;
    }
      
    if (cursors.right.isDown) {
      right = true;
      
      socket.emit('move', 'x ' + 150 + ' ' + mUID);
      player[mUID].body.velocity.x = 150;
    }

    if (cursors.up.isDown) {
      up = true;

      socket.emit('move', 'y ' + -350 + ' ' + mUID);
      player[mUID].body.velocity.y = -350;
    }
  }
}
  
  function manualInput(e) {
    if (e.keyCode == 13) {
      //toggleChat();
    }
  }
  
  socket.on('move', function(data) {
    var ID = parseInt(data.split(' ')[2]);
    var SPEED  = parseInt(data.split(' ')[1]);
    var DIR = data.split(' ')[0];
    //console.log('mUID: ' + mUID +' ID: ' + ID + ' SPEED: ' + SPEED + ' DIR: ' + DIR);
    if (parseInt(ID) != parseInt(mUID) && DIR == "x") player[ID].body.velocity.x = SPEED;
    if (parseInt(ID) != parseInt(mUID) && DIR == "y") player[ID].body.velocity.y = SPEED;
  });

  socket.on('updatePos', function(data) {
    var X = parseInt(data.split(' ')[0]);
    var Y = parseInt(data.split(' ')[1]);
    var ID = parseInt(data.split(' ')[2]);
    if (parseInt(ID) != parseInt(mUID)) {
      player[ID].position.x = X;
      player[ID].position.y = Y;
    }
  });

  socket.on('userDisconnect', function(UserID) {
    player[UserID].destroy();
    player.splice(UserID, 1);
    if (UserID < mUID) mUID--;
    lUID--;
  });

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length,c.length);
      }
    }
    return "";
  }
