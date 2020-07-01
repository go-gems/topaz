var express = require('express')

var app = module.exports = express.createServer();

var io = require('socket.io')(app);

var fullscreen = null;
io.on('connection', function(socket){
	io.sockets.emit("user-joined", socket.id, io.engine.clientsCount, Object.keys(io.sockets.clients().sockets));

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message);
		setTimeout(() => {
			io.to(toId).emit('fullscreen', fullscreen);
		}, 500);
  	});
	socket.on("fullscreen", function(data){
		fullscreen = socket.id;
		io.sockets.emit("fullscreen", socket.id);
    })
    socket.on("message", function(data){
		io.sockets.emit("broadcast-message", socket.id, data);
    })

	socket.on("sound-status-changed", status => {
		//Sends to everyone but the sender
		socket.broadcast.emit("sound-status-changed", {id: socket.id, status})
	})

	socket.on("video-status-changed", status => {
		//Sends to everyone but the sender
		socket.broadcast.emit("video-status-changed", {id: socket.id, status})
	})

	socket.on('disconnect', function() {
		io.sockets.emit("user-left", socket.id);
	})
});

app.use("/",express.static(__dirname+"/public"));

app.listen(3000, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});