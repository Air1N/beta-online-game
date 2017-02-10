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
var points = [];
var topScorers = [];
var usedIndex = [];
var game = new Phaser.Game(1600, 900, Phaser.AUTO, '', {
		preload : preload,
		create : create,
		update : update
	});
var target;
var gameState = "";
var maxIndex = 0;
var topPoints = [];

function preload() {
	game.load.image('bird', '/assets/bird.png');
	game.load.image('crosshair', '/assets/crosshair.png');
	game.load.image('ground', '/assets/ground.png');

	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.scale.updateLayout(true);
	var enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
	enter.onDown.add(toggleChat, this);
}

function create() {
	game.stage.disableVisibilityChange = true;
	game.renderer.renderSession.roundPixels = true;
	cursors = game.input.keyboard.createCursorKeys();
	w = game.input.keyboard.addKey(Phaser.Keyboard.W);
	s = game.input.keyboard.addKey(Phaser.Keyboard.S);
	a = game.input.keyboard.addKey(Phaser.Keyboard.A);
	d = game.input.keyboard.addKey(Phaser.Keyboard.D);
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.startSystem(Phaser.Physics.P2JS);
	ground = game.add.sprite(0, game.world.height - 64, 'ground');
	gameState = "loaded";
	var scoreboardBase = this.game.add.graphics(0, 0);
	scoreboardBase.beginFill(0x111111, 1);
	scoreboard = scoreboardBase.drawRect(1350, 0, 250, 300);

	topScores = [
		game.add.text(1375, 20, ""),
		game.add.text(1375, 70, ""),
		game.add.text(1375, 120, ""),
		game.add.text(1375, 170, ""),
		game.add.text(1375, 220, "")
	]

	for (i = 0; i < topScores.length; i++) {
		topScores[i].font = "Calibri"
			topScores[i].fontSize = "16px"
			topScores[i].addColor("#e0e0e0", 0)
	}

	for (i = 0; i <= lUID; i++) {
		loadSprite(i);
	}
}

function topScore() {
	usedIndex = [];
	for (i = 0; i < points.length; i++) {
		topPoints[i] = points[i];
	}
	points.sort(function(a, b){return b-a});
	console.debug(points)
	console.debug(topPoints)
	for (i = 0; i < 5; i++) {
		topScorers[i] = points[i] + " " + topPoints.indexOf(points[i]);
		usedIndex.push(topPoints.indexOf(points[i]));
		topPoints.indexOf(points[i]);
		topScores[i].text = topScorers[i];
	}
	for (i = 0; i < topPoints.length; i++) {
		points[i] = topPoints[i];
	}
}

setInterval(topScore, 1000/20)

function loadSprite(i) {
	var plx = cursor[i].position.x;
	var ply = cursor[i].position.y;
	cursor[i] = game.add.sprite(plx, ply, 'crosshair');
	cursor[i].tint = Math.random() * 0xffffff;
	cursor[i].scale.setTo(0.75, 0.75);
}

function update() {
	maxIndex++;
	for (i = 0; i < bird.length; i++) {
		if (bird[i] != null)
			bird[i].body.thrust(bird[i].speed);
		if (bird[i] != null && bird[i].x < -20 || bird[i].x > 1620 || bird[i].y < -20) {
			bird[i].destroy();
			bird.splice(i, 1);
		}
	}
	ground.bringToTop();
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

window.onclick = function () {
	overlap = game.physics.p2.hitTest(game.input.mousePointer.position, bird);
	for (j = 0; j < overlap.length; j++) {
		i = bird.indexOf(overlap[j].parent.sprite);
		if (bird[i] != null)
			socket.emit('birdKill', {
				index : bird[i].index,
				UID : mUID
			});
		if (bird[i] != null)
			bird[i].destroy();
		if (bird[i] != null)
			bird.splice(i, 1);
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

	console.log(lUID);

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
			points[i] = 0;
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
		x : Math.random() * 1600,
		y : 901,
		spd : (Math.random() * 100) + 50,
		angl : (Math.random() * 180) - 90,
		ind : maxIndex
	});
	setTimeout(spawnBirds, 10000 * Math.random());
}

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
	for (i = 0; i < bird.length; i++) {
		if (bird[i].index == data.index) {
			z = i;
		}
	}
	points[data.UID]++;
	if (data.UID != mUID) {
		bird[z].destroy();
		bird.splice(z, 1);
	}
});

socket.on('updatePos', function (data) {
	if (parseInt(data.ID) != parseInt(mUID)) {
		cursor[data.ID].x = data.x;
		cursor[data.ID].y = data.y;
	}
});

socket.on('spawnBird', function (data) {
	bird[bird.length] = game.add.sprite(data.x, data.y, 'bird');
	bird[bird.length - 1].index = data.ind;
	bird[bird.length - 1].speed = data.spd;
	game.physics.p2.enable(bird[bird.length - 1]);
	bird[bird.length - 1].body.angle = data.angl;
	if (bird[bird.length - 1].body.angle > 0)
		bird[bird.length - 1].scale.setTo(-1, 1);
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
	console.log(lUID);
});

spawnBirds();

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
