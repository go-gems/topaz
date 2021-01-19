const express = require('express')
const app = module.exports = express()
const http = require('http').createServer(app)
const chat = require('./chat.js')
const io = require('socket.io')(http)
const assets = require('./avatars')
const AVATAR_IMAGE = assets.icons
const CSS_COLOR_NAMES = assets.colors
let avatars = {}
let clients = {}
io.on('connection', function (socket) {
    let avatarName = Object.keys(AVATAR_IMAGE)[Math.floor(Math.random() * Object.keys(AVATAR_IMAGE).length)];
    let avatarColor = CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)];
    let avatar = {
        avatar: avatarName,
        image: AVATAR_IMAGE[avatarName],
        color: avatarColor
    }
    clients[socket.id] = {
        avatar,
        username: avatar.avatar
    }
    socket.emit("initialize", {
        avatar,
        clients
    })

    socket.broadcast.emit("user-joined", {
        id: socket.id,
        user: clients[socket.id]
    });

    socket.on('disconnect', function () {
        delete avatars[socket.id]
        io.sockets.emit("user-left", socket.id);
    })

    socket.on("offer", data => {
        if (clients[data.to] !== undefined) {
            console.log("offer", data)
            io.to(data.to).emit("offer", {
                sender: socket.id,
                offer: data.offer
            })
        }
    })

    socket.on("answer", data => {
        if (clients[data.to] !== undefined) {
            console.log("answer", data)
            io.to(data.to).emit("answer", {
                sender: socket.id,
                answer: data.answer
            })
        }
    })

    socket.on("ice-candidate", data => {
        console.log("ice", data)
        io.to(data.to).emit("ice-candidate", {
            iceCandidate: data.iceCandidate,
            sender: socket.id
        })
    })


    socket.on("message", function (data) {
        chat.storeMessage(clients[socket.id].username, clients[socket.id].avatar, data.message)
        io.sockets.emit("message", {
            sender: socket.id,
            message: data.message
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

});

app.use("/", express.static(__dirname + "/public"));

http.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", http.address().port, app.settings.env);
});