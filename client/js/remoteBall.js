var RemoteBall = function(index, game, player, startX, startY) {
	var x = startX;
	var y = startY;

	this.game = game;
	this.player = player;


	this.player = balls.create(
		game.math.between(20,780), 
		game.math.between(20,580), 
		'ball');

	this.player.body.collideWorldBounds = true;
    this.player.body.bounce.set(0.5);
    this.player.body.drag.set(50,50);
    this.player.body.setCircle(9);

    // this.player.anchor.setTo(0.5, 0.5)



	this.lastPosition = { x: x, y: y};


}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
    //this.player.play('move');
  } else {
    //this.player.play('stop');
  }

  this.lastPosition.x = this.player.x;
  this.lastPosition.y = this.player.y;
}

window.RemotePlayer = RemotePlayer;