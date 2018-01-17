/*===========================================================
	Clusterputt
	Taylor Meeks
	1/17/2018
===========================================================*/



var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('ball','assets/sprites/ball.png');
}

var ball;
var downKey, upKey, leftKey, rightKey;
var mouseLeft, mouse_orig_x, mouse_orig_y, shotDist, shotAngle;
var debugText = ["","",""];
var line;

var moving = false;
var shotMag = 2;
var shotMax = 300;

function create() {

 	game.stage.backgroundColor = '#f2d09b';
	game.physics.startSystem(Phaser.Physics.ARCADE);


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
	//===========================================================


	//==================initialize ball physics==================
	//===========================================================
	ball = game.add.sprite(400, 200, 'ball');
	game.physics.enable(ball, Phaser.Physics.ARCADE);

	//  This gets it moving
    //ball.body.velocity.setTo(200, 200);
  
    //  This makes the game world bounce-able
    ball.body.collideWorldBounds = true;
    
    //  This sets the image bounce energy for the horizontal  and vertical vectors (as an x,y point). "1" is 100% energy return
    ball.body.bounce.set(0.5);

    ball.body.drag.set(50,50);

	//ball.body.gravity.set(0, 0);
	//===========================================================


	debugText[0] = "neutral";

	line = new Phaser.Line(ball.body.x, ball.body.y, 0, 0);



}

function update() {

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




//===================math helper functions===================
//===========================================================
function lengthdir_x(length, direction) {
    return Math.cos(direction * Math.PI / 180) * length;
}

function lengthdir_y(length, direction) {
    return Math.sin(direction * Math.PI / 180) * length;
}

//===========================================================