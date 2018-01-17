/*===========================================================
	Clusterputt
	Taylor Meeks
	1/17/2018
===========================================================*/

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('ball','assets/sprites/ball.png');

	game.load.tilemap('level1','assets/tilemaps/maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('mapTiles','assets/tilemaps/tilesheets/blowharder.png');
}

var balls;

var ball;
var downKey, upKey, leftKey, rightKey;
var mouseLeft, mouse_orig_x, mouse_orig_y, shotDist, shotAngle;
var debugText = ["","",""];
var line;

var moving = false;
var shotMag = 2;
var shotMax = 300;

var map;
var layer = [];

function create() {

 	

 	//======================initialize map ======================
	//===========================================================
	game.stage.backgroundColor = '#f2d09b';

	//http://baraujo.net/integrating-tiled-maps-with-phaser/
	map = game.add.tilemap('level1');
	map.addTilesetImage('blowhard','mapTiles');


	layer[1] = map.createLayer('water');
	layer[2] = map.createLayer('cliff');
	layer[0] = map.createLayer('land');



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

	line = new Phaser.Line(ball.body.center.x, ball.body.center.y, 0, 0);


}

function update() {

	//=====================physics settings======================
	//===========================================================
	game.physics.arcade.collide(balls);
	game.physics.arcade.collide(balls, layer[2]);
	game.physics.arcade.collide(balls, layer[1]);



	if(mouseLeft.isDown) {
		debugText[1] = Phaser.Math.roundTo(
			Phaser.Math.distance(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y), 0);
		debugText[2] = Phaser.Math.radToDeg(
			Phaser.Math.angleBetween(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y));

		line.setTo(mouse_orig_x, mouse_orig_y, game.input.x, game.input.y);

	}


}

function render() {

	game.debug.text(debugText[0], 32, 32);
	game.debug.text("Force: "+debugText[1]+", Direction: "+debugText[2], 32, 64);
	game.debug.geom(line);
}




//===============custom functions===============
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
	debugText[1] = Phaser.Math.roundTo(shotDist, 0);
	debugText[2] = shotAngle;

	applyForceToBall();
}

function applyForceToBall() {
	ball.body.velocity.add(lengthdir_x(shotDist*shotMag,shotAngle+180),lengthdir_y(shotDist*shotMag,shotAngle+180));

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




//===================math helper functions===================
//===========================================================
function lengthdir_x(length, direction) {
    return Math.cos(direction * Math.PI / 180) * length;
}

function lengthdir_y(length, direction) {
    return Math.sin(direction * Math.PI / 180) * length;
}

//===========================================================