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
	game.load.image('bird', '/assets/bird.png');
	game.load.image('crosshair', '/assets/crosshair.png');
	
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.scale.updateLayout(true);
	var enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	enter.onDown.add(toggleChat, this);
}

function create() {
	game.renderer.renderSession.roundPixels = true;
	cursors = game.input.keyboard.createCursorKeys();
	w = game.input.keyboard.addKey(Phaser.Keyboard.W);
	s = game.input.keyboard.addKey(Phaser.Keyboard.S);
	a = game.input.keyboard.addKey(Phaser.Keyboard.A);
	d = game.input.keyboard.addKey(Phaser.Keyboard.D);
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.startSystem(Phaser.Physics.P2JS);
	platforms = game.add.group();
	platforms.enableBody = true;
	var ground = platforms.create(-200, game.world.height - 64, 'bird');
	ground.body.immovable = true;
	ground.scale.setTo(50, 2);
	gameState = "loaded";

	for (i = 0; i <= lUID; i++)
		loadSprite(i);
}

function loadSprite(i) {
	var plx = cursor[i].position.x;
	var ply = cursor[i].position.y;
	cursor[i] = game.add.sprite(plx, ply, 'crosshair');
	game.physics.arcade.enable(cursor[i]);
	cursor[i].body.bounce.y = 1;
	cursor[i].body.gravity.y = 0;
	cursor[i].body.collideWorldBounds = false;
	cursor[i].tint = Math.random() * 0xffffff;
	cursor[i].scale.setTo(0.75, 0.75);
}

function update() {
	for (i = 0; i < bird.length; i++) {
		if (bird[i].x < -20 || bird[i].x > 820 || bird[i].y < -20) {
			bird[i].destroy();
			bird.splice(i, 1);
		}
	}
	for (i = 0; i < cursor.length; i++) {
		cursor[i].bringToTop();
	}
	Input();
}

window.onmousemove = function () {
	var mouseX = game.input.mousePointer.x;
	var mouseY = game.input.mousePointer.y;
	cursor[mUID].x = mouseX - 12;
	cursor[mUID].y = mouseY - 12;
	
	
	socket.emit('moveCursor', {
		x : mouseX - 12,
		y : mouseY - 12,
		ID : mUID
	})
}

window.onclick = function() {
	for (i = 0; i < bird.length; i++) {
		bird[i].index = i;
	}
	overlap = game.physics.p2.hitTest(game.input.mousePointer.position, bird);
	for (j = 0; j < overlap.length; j++) {
		for (i = 0; i < bird.length; i++) {
			if (overlap[j].parent.sprite.index == bird[i].index) {
				bird[i].destroy();
				bird.splice(i, 1);
				socket.emit('birdKill', {ID: i, UID: mUID});
			}
		}
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
	socket.emit('updatePos', {
		ID : mUID,
		x : cursor[mUID].position.x,
		y : cursor[mUID].position.y
	});
});

function openChat() {
	if (chatFade < 0.85 && isChatOpen) {
		chatFade += 0.05;
		document.getElementById("chatBox").style.opacity = chatFade;
		setTimeout(openChat, 1000 / 100);
		document.getElementById("removeChat").style.width = "100%";
		document.getElementById("removeChat").style.height = "100%";
	}
}

function closeChat() {
	if (chatFade > 0 && !isChatOpen) {
		chatFade -= 0.05;
		document.getElementById("chatBox").style.opacity = chatFade;
		setTimeout(closeChat, 1000 / 100);
		document.getElementById("removeChat").style.width = "0%";
		document.getElementById("removeChat").style.height = "0%";
	}
}

function Input() {
	if (cursors) {}
}

function spawnBirds() {
	socket.emit('spawnBird', {
		x : Math.random() * 800,
		y : 400
	});
	setTimeout(spawnBirds, 10000 * Math.random());
}
spawnBirds();

socket.on('move', function (data) {
	var timeDiff = new Date() - data.time;

	if (data.x != null)
		bird[data.ID].body.velocity.x = data.x;
	if (data.y != null)
		bird[data.ID].body.velocity.y = data.y;

	if (data.x != null)
		bird[data.ID].movex = data.x;
	if (data.y != null)
		bird[data.ID].movey = data.y;
});

socket.on('birdKill', function (data) {
	if(data.UID != mUID) {
		bird[data.ID].kill();
		bird.splice(data.ID, 1);
	}
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
	bird[bird.length] = game.add.sprite(data.x, data.y, 'bird');
	bird[bird.length - 1].index = bird.length - 1;
	game.physics.p2.enable(bird[bird.length - 1], true);
	bird[bird.length - 1].body.angle = (Math.random() * 160) + 10
	bird[bird.length - 1].sprite.body.thrust(Math.random() * 100);
	//bird[bird.length - 1].kinematic = true;
	bird[bird.length - 1].fixedRotation = true;
	if (bird[bird.length - 1].body.angle > 90) bird[bird.length - 1].scale.setTo(1, -1);
	bird[bird.length - 1].body.collideWorldBounds = false;
});

socket.on('moveCursor', function (data) {
	if (parseInt(data.ID) != parseInt(mUID)) {
		cursor[data.ID].x = data.x;
		cursor[data.ID].y = data.y;
	}
});

socket.on('userDisconnect', function (UserID) {
	cursor[UserID].destroy();
	cursor.splice(UserID, 1);
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