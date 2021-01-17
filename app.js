var express = require('express')

var app = module.exports = express.createServer();
const chat = require('./chat.js');
var io = require('socket.io')(app);
const { PeerServer } = require('peer')
const assets = require('./avatars')
const AVATAR_IMAGE = assets.icons
const CSS_COLOR_NAMES = assets.colors
let avatars = {}

const peerServer = PeerServer({port: 8042, path: '/topaz', proxied: true})

io.on('connection', function (socket) {
    let avatar = Object.keys(AVATAR_IMAGE)[Math.floor(Math.random() * Object.keys(AVATAR_IMAGE).length)];
    let color = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
    let myAvatar = {
        avatar: avatar,
        image: AVATAR_IMAGE[avatar],
        color: color
    }
    io.to(socket.id).emit("avatar", myAvatar)

    avatars[socket.id] = myAvatar;
    io.sockets.emit("user-joined", socket.id, io.engine.clientsCount, Object.keys(io.sockets.clients().sockets), avatars);

    socket.on('signal', (toId, message) => {
        io.to(toId).emit('signal', socket.id, message);

    });

    socket.on("message", async function (data) {
        chat.storeMessage(data.username, avatars[socket.id], data.message)
        let processed = await chat.processMessage(data.username, avatars[socket.id], data.message)

        if (processed.transformed) chat.storeMessage(processed.author, processed.avatar, processed.message)

        io.sockets.emit("message", socket.id, processed.avatar, {
            username: processed.author,
            message: processed.message
        });
    })

    socket.on("sound-status-changed", status => {
        //Sends to everyone but the sender
        socket.broadcast.emit("sound-status-changed", {id: socket.id, status})
    })

    socket.on("video-status-changed", status => {
        //Sends to everyone but the sender
        socket.broadcast.emit("video-status-changed", {id: socket.id, status})
    })

    socket.on('disconnect', function () {
        delete avatars[socket.id]
        io.sockets.emit("user-left", socket.id);
    })
});

app.use("/", express.static(__dirname + "/public"));

app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
