var socket = io();
var player = [];
var mUID;
var left = false;
var right = false;
var up = false;
var lUID = 0;
var isChatOpen = false;
var chatFade = 0;
var game = new Phaser.Game(800, 400, Phaser.AUTO, '', {
		preload : preload,
		create : create,
		update : update
	});
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

	for (i = 0; i <= lUID; i++)
		loadSprite(i);
}

function loadSprite(i) {
	var plx = player[i].position.x;
	var ply = player[i].position.y;
	player[i] = game.add.sprite(plx, ply, 'ariLUL');
	game.physics.arcade.enable(player[i]);
	player[i].body.bounce.y = 0.2;
	player[i].body.gravity.y = 600;
	player[i].body.collideWorldBounds = true;
}

function update() {
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

socket.on('userConnect', function (data) {
	lUID = data.laUID;
	UserID = data.UserID;
	
	if (mUID === undefined)
		mUID = UserID;
	for (i = 0; i <= lUID; i++) {
		if (player[i] == null) {
			player[i] = {
				position : {
					x : 0,
					y : 0
				}
			};
			loadSprite(i);
		}
	}
	socket.emit('updatePos', {ID: mUID, x: player[mUID].position.x, y: player[mUID].position.y});
});

function openChat() {
	if (chatFade < 0.85 && isChatOpen) {
		chatFade += 0.05;
		document.getElementById("chatBox").style.opacity = chatFade;
		setTimeout(openChat, 1000 / 100);
	}
}

function closeChat() {
	if (chatFade > 0 && !isChatOpen) {
		chatFade -= 0.05;
		document.getElementById("chatBox").style.opacity = chatFade;
		setTimeout(closeChat, 1000 / 100);
	}
}

function Input() {
	if (cursors) {
		if (cursors.right.isUp && cursors.left.isUp) {
			if (player[mUID].body.velocity.x != 0)
				socket.emit('move', {mUID: mUID, x: 0, time: new Date()});
			if (player[mUID].body.velocity.x != 0)
				player[mUID].body.velocity.x = 0;

			left = false;
			right = false;
		}

		if (player[mUID].body.touching.down)
			up = false;

		if (cursors.left.isDown) {
			left = true;

			if (player[mUID].body.velocity.x != -150)
				socket.emit('move', {mUID: mUID, x: -150, time: new Date()});
			if (player[mUID].body.velocity.x != -150)
				player[mUID].body.velocity.x = -150;
		}

		if (cursors.right.isDown) {
			right = true;

			if (player[mUID].body.velocity.x != 150)
				socket.emit('move', {mUID: mUID, x: 150, time: new Date()});
			if (player[mUID].body.velocity.x != 150)
				player[mUID].body.velocity.x = 150;
		}

		if (cursors.up.isDown && !up) {
			up = true;

			if (player[mUID].body.velocity.y != -350)
				socket.emit('move', {ID: mUID, y: -350, time: new Date()});
			if (player[mUID].body.velocity.y != -350)
				player[mUID].body.velocity.y = -350;
		}
	}
}

socket.on('move', function (data) {
		var timeDiff = new Date() - data.time;
		
		if (data.x != null) player[data.ID].body.velocity.x = data.x;
		if (data.y != null) player[data.ID].body.velocity.y = data.y;
});

socket.on('updatePos', function (data) {
	if (parseInt(data.ID) != parseInt(mUID)) {
		player[data.ID].body.velocity.x = (data.x - player[data.ID].x) * 5;
        player[data.ID].body.velocity.y = (data.y - player[data.ID].y) * 5;
	}
});

socket.on('userDisconnect', function (UserID) {
	player[UserID].destroy();
	player.splice(UserID, 1);
	if (UserID < mUID)
		mUID--;
	lUID--;
});

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}