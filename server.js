
//import express.js 
var express = require('express');
//assign it to variable app 
var app = express();
//create a server and pass in app as a request handler
var serv = require('http').Server(app); //Server-11


var Ball = require('./Ball');


var players;

//send a index.html file when a get request is fired to the given 
//route, which is ‘/’ in this case
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

//this means when a get request is made to ‘/client’, put all the 
//static files inside the client folder 
//Under ‘/client’. See for more details below
// app.use('/client',express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/client'));

//listen on port 2000
serv.listen(process.env.PORT || 88);
console.log("Server started.");

init();




function init() {
	players = [];

	// binds the serv object we created to socket.io
	var io = require('socket.io')(serv,{});

	// listen for a connection request from any client
	io.sockets.on('connection', onSocketConnection);


}

function onSocketConnection (client) {
  console.log('New player has connected: ' + client.id)

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  // Listen for move player message
  client.on('move player', onMovePlayer)
}
		
function onClientDisconnect () {
  console.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)

  // Player not found
  if (!removePlayer) {
    console.log('Server.js - Player not found: ' + this.id)
    return
  }

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('remove player', {id: this.id})
}

// New player has joined
function onNewPlayer (data) {
  // Create a new player
  var newBall = new Ball(data.x, data.y)
  newBall.id = this.id

  // Broadcast new player to connected socket clients
  this.broadcast.emit('new player', {id: newBall.id, x: newBall.getX(), y: newBall.getY()})

  // Send existing players to the new player
  var i, existingPlayer;
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
  }

  // Add new player to the players array
  players.push(newBall)
}

function onMovePlayer (data) {
  // Find player in array
  var movePlayer = playerById(this.id)

  // Player not found
  if (!movePlayer) {
    console.log('Server.js - Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.setX(data.x)
  movePlayer.setY(data.y)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()

  })
}

/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */

// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}