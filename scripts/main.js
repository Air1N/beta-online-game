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
  
  function preload() {
    game.load.image('ariLUL', '/assets/ariLUL.png');
    
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.updateLayout(true);
    var enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    enter.onDown.add(toggleChat, this);
  }


  function create() {
    game.stage.disableVisibilityChange = true;
    cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(-200, game.world.height - 64, 'ariLUL');
    ground.body.immovable = true;
    ground.scale.setTo(50, 2);
  }

  socket.on('userConnect', function(UserID) {
    lUID++;
    player[UserID] = game.add.sprite(0, 0, 'ariLUL');
    game.physics.arcade.enable(player[UserID]);
    player[UserID].body.bounce.y = 0.2;
    player[UserID].body.gravity.y = 300;
    player[UserID].body.collideWorldBounds = true;

    if (mUID === undefined) {
      lUID = UserID;
      mUID = UserID;
      for (i = 0; i < UserID; i++) {
        player[i] = game.add.sprite(0, 0, 'ariLUL');
        game.physics.arcade.enable(player[i]);
        player[i].body.bounce.y = 0.2;
        player[i].body.gravity.y = 300;
        player[i].body.collideWorldBounds = true;
      }
      setInterval(Input, 1000/100);
    }
    socket.emit('updatePos', player[mUID].position.x + ' ' + player[mUID].position.y + ' ' + mUID);
  });

  function update(){
    for (i = 0; i <= lUID; i++) {
      game.physics.arcade.collide(player[i], platforms);
    }
  }
  
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
  
  function Input() {
    if (cursors.right.isUp && cursors.left.isUp) {
      if (leftLength >= 1 || rightLength >= 1) {
        socket.emit('move', 'x ' + 0 + ' ' + mUID);
        player[mUID].body.velocity.x = 0;
        leftLength = 0;
        rightLength = 0;
      }
    }
    
    if (player[mUID].body.touching.down) upLength = 0;

    if (cursors.left.isDown) {
      rightLength++

      if (rightLength == 1) {
        socket.emit('move', 'x ' + -150 + ' ' + mUID);
        player[mUID].body.velocity.x = -150;
      }
    }
    if (cursors.right.isDown) {
      leftLength++

      if (leftLength == 1) {
        socket.emit('move', 'x ' + 150 + ' ' + mUID);
        player[mUID].body.velocity.x = 150;
      }
    }

    if (cursors.up.isDown) {
      upLength++

      if (upLength == 1) {
        socket.emit('move', 'y ' + -350 + ' ' + mUID);
        player[mUID].body.velocity.y = -350;
      }
    }
  }
  
  function manualInput(e) {
    if (e.keyCode == 13) {
      toggleChat();
    }
  }
  
  socket.on('move', function(data) {
    var ID = parseInt(data.split(' ')[2]);
    var SPEED  = parseInt(data.split(' ')[1]);
    var DIR = data.split(' ')[0];
    if (parseInt(ID) != parseInt(mUID) && DIR == "x") player[ID].body.velocity.x = SPEED;
    if (parseInt(ID) != parseInt(mUID) && DIR == "y") player[ID].body.velocity.y = SPEED;
    //console.log('mUID: ' + mUID +' ID: ' + ID + ' SPEED: ' + SPEED + ' DIR: ' + DIR);
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