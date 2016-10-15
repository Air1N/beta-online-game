var socket = io();
var mUID;
var left = false;
var right = false;
var up = false;
var lUID = 0;
var isChatOpen = false;
var chatFade = 0;
var bird = [];
var cursor = [];
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
	w = game.input.keyboard.addKey(Phaser.Keyboard.W);
	s = game.input.keyboard.addKey(Phaser.Keyboard.S);
	a = game.input.keyboard.addKey(Phaser.Keyboard.A);
	d = game.input.keyboard.addKey(Phaser.Keyboard.D);
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
	var plx = cursor[i].position.x;
	var ply = cursor[i].position.y;
	cursor[i] = game.add.sprite(plx, ply, 'ariLUL');
	game.physics.arcade.enable(cursor[i]);
	cursor[i].body.bounce.y = 0.2;
	cursor[i].body.gravity.y = 0;
	cursor[i].body.collideWorldBounds = true;
}

function update() {
	for (i = 0; i <= lUID; i++) {
		game.physics.arcade.collide(bird[i], platforms);
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
		if (cursor[i] == null) {
			cursor[i] = {
				position : {
					x : 0,
					y : 0
				}
			};
			loadSprite(i);
		}
	}
	socket.emit('updatePos', {ID: mUID, x: cursor[mUID].position.x, y: cursor[mUID].position.y});
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
		/*if (d.isUp && a.isUp) {
			if (bird[mUID].body.velocity.x != 0)
				socket.emit('move', {ID: mUID, x: 0, time: new Date()});
			if (bird[mUID].body.velocity.x != 0)
				bird[mUID].body.velocity.x = 0;

			left = false;
			right = false;
		}

		if (bird[mUID].body.touching.down)
			up = false;

		if (a.isDown) {
			left = true;

			if (bird[mUID].body.velocity.x != -150)
				socket.emit('move', {ID: mUID, x: -150, time: new Date()});
			if (bird[mUID].body.velocity.x != -150)
				bird[mUID].body.velocity.x = -150;
		}

		if (d.isDown) {
			right = true;

			if (bird[mUID].body.velocity.x != 150)
				socket.emit('move', {ID: mUID, x: 150, time: new Date()});
			if (bird[mUID].body.velocity.x != 150)
				bird[mUID].body.velocity.x = 150;
		}

		if (w.isDown && !up) {
			up = true;

			if (bird[mUID].body.velocity.y != -350)
				socket.emit('move', {ID: mUID, y: -350, time: new Date()});
			if (bird[mUID].body.velocity.y != -350)
				bird[mUID].body.velocity.y = -350;
		}*/
		
		
		
	}
}

function spawnBirds() {
	socket.emit('spawnBird', {x: Math.random() * 800, y: 400, dirX: Math.random() - 0.5, dirY: Math.random() + 0.1});
	setTimeout(spawnBirds, 10000 * Math.random());
}
spawnBirds();

window.onmousemove = function(e) {
	var mouseX = game.input.mousePointer.x;
	var mouseY = game.input.mousePointer.y;
	cursor[mUID].x = mouseX;
	cursor[mUID].y = mouseY;
	
	socket.emit('moveCursor', {x: mouseX, y: mouseY, ID: mUID})
}


socket.on('move', function (data) {
		var timeDiff = new Date() - data.time;
		
		if (data.x != null) bird[data.ID].body.velocity.x = data.x;
		if (data.y != null) bird[data.ID].body.velocity.y = data.y;
		
		if (data.x != null) bird[data.ID].movex = data.x;
		if (data.y != null) bird[data.ID].movey = data.y;
});

socket.on('lagComp', function (data) {
	if (parseInt(data.ID) != parseInt(mUID)) {
		bird[data.ID].x = bird[data.ID].movex + parseInt(data.x - bird[data.ID].x) / 50;
	}
});

socket.on('updatePos', function (data) {
	if (parseInt(data.ID) != parseInt(mUID)) {
		bird[data.ID].x = data.x;
        bird[data.ID].y = data.y;
	}
});

socket.on('spawnBird', function (data) {
	bird[bird.length] = game.add.sprite(data.x, data.y, 'ariLUL');
	game.physics.arcade.enable(bird[bird.length - 1]);
	bird[bird.length - 1].body.bounce.y = 0.2;
	bird[bird.length - 1].body.gravity.y = 0;
	bird[bird.length - 1].body.collideWorldBounds = false;
	
	bird[bird.length - 1].body.velocity.x = data.dirX * 300;
	bird[bird.length - 1].body.velocity.y = data.dirY * -100;
});

socket.on('moveCursor', function (data) {
	if (parseInt(data.ID) != parseInt(mUID)) {
		cursor[data.ID].x = data.x;
		cursor[data.ID].y = data.y;
	}
});


socket.on('userDisconnect', function (UserID) {
	bird[UserID].destroy();
	bird.splice(UserID, 1);
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