/*===========================================================
	Clusterputt
	Taylor Meeks
	1/17/2018
===========================================================*/

var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'Clusterputt', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('ball','/assets/sprites/ball.png');

	game.load.tilemap('level1','/assets/tilemaps/maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('mapTiles','/assets/tilemaps/tilesheets/blowharder.png');
}

var balls;

var ball;
var otherBalls;
var downKey, upKey, leftKey, rightKey;
var mouseLeft, mouse_orig_x, mouse_orig_y, shotDist, shotAngle;
var debugText = ["","",""];
var line;

var moving = false;
var shotMag = 2;
var shotMax = 300;

var map;
var layer = [];

var socket; //Socket connection

function create() {

	console.log("client started");
	socket = io.connect();

 	

 	//======================initialize map ======================
	//===========================================================
	game.stage.backgroundColor = '#f2d09b';

	//http://baraujo.net/integrating-tiled-maps-with-phaser/
	map = game.add.tilemap('level1');
	map.addTilesetImage('blowhard','mapTiles');
	
	map.setCollisionBetween(1, 9999, true, 'obstacles');




	layer[0] = map.createLayer('water');
	layer[2] = map.createLayer('land');
	layer[1] = map.createLayer('obstacles');

	layer[0].setScale(2,2);
	layer[1].setScale(2,2);
	layer[2].setScale(2,2);
	layer[0].resizeWorld();


	otherBalls = [];




 	//=================initialize arcade physics=================
	//===========================================================
	game.physics.startSystem(Phaser.Physics.ARCADE);
	balls = game.add.group();
	balls.enableBody = true;
	balls.physicsBodyType = Phaser.Physics.ARCADE;
	//===========================================================


	//===============initialize key/moues captures===============
	//===========================================================
	game.input.mouse.capture = true;
	mouseLeft = game.input.activePointer.leftButton;

	downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
	upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);

	mouseLeft.onDown.add(mouseDown, this);
	mouseLeft.onUp.add(mouseUp, this);
	downKey.onDown.add(spawnBall, this);
	//===========================================================







	//=====================spawn player ball=====================
	//===========================================================
	ball = spawnBall();
	//===========================================================




	debugText[0] = "neutral";

	line = new Phaser.Line();

	// Start listening for events
	setEventHandlers();


}

var setEventHandlers = function () {
	// Socket connection successful
	socket.on('connect', onSocketConnected)

	// Socket disconnection
	socket.on('disconnect', onSocketDisconnect)

	// New player message received
	socket.on('new player', onNewPlayer)

	// Player move message received
	socket.on('move player', onMovePlayer)

	// Player removed message received
	socket.on('remove player', onRemovePlayer)
}

// Socket connected
function onSocketConnected  () {
	console.log('Connected to socket server');

	otherBalls.forEach(function (otherBall) {
		otherBall.player.kill();
	})
	otherBalls = [];

	// Send local player data to the game server
	socket.emit('new player', { x: ball.x, y: ball.y});
}

// Socket disconnected
function onSocketDisconnect () {
	console.log('Disconnected from socket server');
}

// New player
function onNewPlayer (data) {
	console.log('New player connected:', data.id);

	// Avoid possible duplicate players
	var duplicate = playerById(data.id)
	if (duplicate) {
	console.log('Duplicate player!');
	return
	}

	// Add new player to the remote players array
	otherBalls.push(new RemoteBall(data.id, game, ball, data.x, data.y));
}

// Move player
function onMovePlayer (data) {
  var movePlayer = playerById(data.id);

  // Player not found
  if (!movePlayer) {
    console.log('Game.js - onMovePlayer - Player not found: ', data.id);
    return
  }

  // Update player position
  movePlayer.player.x = data.x;
  movePlayer.player.y = data.y;
}

// Remove player
function onRemovePlayer (data) {
  var removePlayer = playerById(data.id);

  // Player not found
  if (!removePlayer) {
    console.log('Game.js - onRemovePlayer -  Player not found: ', data.id);
    return;
  }

  removePlayer.player.kill();

  // Remove player from array
  otherBalls.splice(otherBalls.indexOf(removePlayer), 1);
}

function update() {

	//=====================physics settings======================
	//===========================================================
	game.physics.arcade.collide(balls);
	game.physics.arcade.collide(balls, layer[1]);

	for (var i = 0; i < otherBalls.length; i++) {
	    if (otherBalls[i].alive) {
	      otherBalls[i].update();
	      game.physics.arcade.collide(ball, otherBalls[i].ball);
    	}
	}


	if(mouseLeft.isDown) {
		debugText[1] = Phaser.Math.roundTo(
			Phaser.Math.distance(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y), 0);
		debugText[2] = Phaser.Math.roundTo(
			Phaser.Math.radToDeg(
			Phaser.Math.angleBetween(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y)), 
			0);

		line.setTo(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y);

	}

	//turn off "moving" when ball stops
	if(moving) {
		if(ball.body.position.equals(ball.body.prev)) {
			moving = false;
		}
	}


	socket.emit('move player', { x: ball.x, y: ball.y});

}

function render() {

	game.debug.text("Moving: "+moving, 16, 16);
	game.debug.text("Force: "+debugText[1]+", Direction: "+debugText[2], 16, 32);
	game.debug.geom(line);
}



//======================helper functions=====================
//===========================================================
function mouseDown() {
	debugText[0] = "mouseDown";
	mouse_orig_x = game.input.x;
	mouse_orig_y = game.input.y;
}

function mouseUp() {
	debugText[0] = "mouseUp";
	shotDist = Phaser.Math.distance(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y);
	shotAngle = Phaser.Math.radToDeg(
		Phaser.Math.angleBetween(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y));

	if(!moving)
	applyForceToBall();
}

function applyForceToBall() {
	ball.body.velocity.add(lengthdir_x(shotDist*shotMag,shotAngle+180),lengthdir_y(shotDist*shotMag,shotAngle+180));
	moving = true;
}

function spawnBall() {
	var newball = balls.create(
		game.math.between(20,780), 
		game.math.between(20,580), 
		'ball');

    newball.body.collideWorldBounds = true;
    newball.body.bounce.set(0.5);
    newball.body.drag.set(50,50);
    newball.body.setCircle(9);

    return newball;
}

// Find player by ID
function playerById (id) {
  for (var i = 0; i < otherBalls.length; i++) {
    if (otherBalls[i].player.name === id) {
      return otherBalls[i];
    }
  }
  return false;
}




//===================math helper functions===================
//===========================================================
function lengthdir_x(length, direction) {
    return Math.cos(direction * Math.PI / 180) * length;
}

function lengthdir_y(length, direction) {
    return Math.sin(direction * Math.PI / 180) * length;
}

//===========================================================