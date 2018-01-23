var Ball = function(startX, startY) {
	var x = startX;
	var y= startY;
	var id;

	var getX = function() {
		return x;
	}

	var getY = function() {
		return y;
	}

	var setX = function(input) {
		x = input;
	}

	var setY = function(input) {
		y = input;
	}

	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		id: id
	}



}

// Export the Ball class so you can use it in
// other files by using require("Ball")
module.exports = Ball;