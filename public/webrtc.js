let localVideo;
let devmode = true;
let socketId;
let localStream;
let screenStream;
let connections = [];
let videotracks = [];
let screensharing = false;
let showParameters = false
let pinnedVideo = null
let videoEnabled = true
let audioEnabled = true
let showChat = false
let cameraId = null
let microphoneId = null
let username = "Username"
let defaultUsername = ""
let peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};


function _startScreenCapture() {
    if (navigator.getDisplayMedia) {
        return navigator.getDisplayMedia({video: true});
    } else if (navigator.mediaDevices.getDisplayMedia) {
        return navigator.mediaDevices.getDisplayMedia({video: true});
    } else {
        return navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}});
    }
}

function toggleSound() {
    let button = document.querySelector("#sound-button");
    audioEnabled = !audioEnabled
    localStream.getAudioTracks()[0].enabled = audioEnabled;

    if (socket) {
        socket.emit("sound-status-changed", audioEnabled)
    }

    if (audioEnabled) {
        button.classList.add("fa-microphone");
        button.classList.remove("fa-microphone-slash");
        return
    }

    button.classList.add("fa-microphone-slash");
    button.classList.remove("fa-microphone");
}

function toggleVideo() {
    let button = document.querySelector("#video-button");
    videoEnabled = !videoEnabled
    localStream.getVideoTracks()[0].enabled = videoEnabled

    if (socket) {
        socket.emit("video-status-changed", videoEnabled)
    }

    if (videoEnabled) {
        button.classList.add("fa-video");
        button.classList.remove("fa-video-slash");
        document.querySelector(".local-video").classList.remove("disabled");
        return
    }
    document.querySelector(".local-video").classList.add("disabled")

    button.classList.add("fa-video-slash");
    button.classList.remove("fa-video");
}

function toggleChat() {
    let chatPanel = document.querySelector(".chat-panel")
    showChat ? chatPanel.classList.remove("open") : chatPanel.classList.add("open");
    showChat = !showChat

}

function toggleParameters() {
    let parametersModal = document.querySelector("#parameters-modal")
    parametersModal.style.display = showParameters ? "none" : "block"
    showParameters = !showParameters
}

function sendMessage(event) {
    let textarea = document.querySelector(".chat-box textarea")
    if (
        event instanceof MouseEvent || (
            event instanceof KeyboardEvent &&
            !event.ctrlKey &&
            !event.shiftKey &&
            event.key === "Enter"
        )
    ) {
        event.preventDefault()
        socket.emit('message', {username: username, message: textarea.value})

        textarea.value = ""
        textarea.focus()
        return
    }
    if (event.ctrlKey && event.key === "Enter") {
        textarea.value += "\n"
    }
}

function shareScreen() {
    _startScreenCapture()
        .then(getScreenMediaSuccess)
        .then(function () {
            console.log("PIF", connections)
            for (connection of connections) {
                console.log("PAF", connection)
            }
            connections.forEach(function (pc) {
                console.log("PAF")

                screenvideotrack = localStream.getVideoTracks()[0]
                var sender = pc.getSenders().find(function (s) {
                    return s.track.kind == screenvideotrack.kind;
                });
                console.log('found sender:', sender);
                sender.replaceTrack(screenvideotrack);
            })
        })
}

function shareVideo() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getUserMediaSuccess)
            .then(function () {
                connections[socketId].replaceTrack(localStream)
            })
    }
}

function getStream() {
    return new Promise((resolve, reject) => {
        let constraints = {
            video: true,
            audio: true
        }

        if (cameraId !== null) {
            constraints.video = {
                deviceId: {
                    exact: cameraId
                }
            }
        }
        if (microphoneId !== null) {
            constraints.audio = {
                deviceId: {
                    exact: microphoneId
                }
            }
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                resolve(stream)
            })
    })

}


function replaceStream(stream) {
    getUserMediaSuccess(stream)

    //We need to replace both the audio and video tracks otherwise we have some reference problems
    let videoTrack = localStream.getVideoTracks()[0]
    let audioTrack = localStream.getAudioTracks()[0]

    for (let id of Object.keys(connections)) {
        if (id === socketId) {
            continue
        }
        let connection = connections[id]

        let videoSender = connection.getSenders().find(s => {
            return s.track.kind === videoTrack.kind
        })
        let audioSender = connection.getSenders().find(s => {
            return s.track.kind === audioTrack.kind
        })
        console.log("found video sender : ", videoSender)
        videoSender.replaceTrack(videoTrack)
        console.log("found audio sender : ", audioSender)
        audioSender.replaceTrack(audioTrack)
    }

    //To make sure camera or microphone stay disabled if it was already
    localStream.getVideoTracks()[0].enabled = videoEnabled
    localStream.getAudioTracks()[0].enabled = audioEnabled
}


async function loadDevices() {
    if (await navigator.mediaDevices.getUserMedia({video: true, audio: true})) {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                for (let device of devices) {
                    switch (device.kind) {
                        case "audioinput":
                            document.querySelector("#audioInputDevices").appendChild(
                                htmlToElement(`<option value="${device.deviceId}">${device.label}</option>`)
                            )
                            break;
                        case "videoinput":
                            document.querySelector("#videoInputDevices").appendChild(
                                htmlToElement(`<option value="${device.deviceId}">${device.label}</option>`)
                            )
                            break
                        default:
                            break
                    }
                }
            })

        document.querySelector("#audioInputDevices").addEventListener("change", e => {
            microphoneId = e.target.value
            getStream()
                .then(stream => {
                    replaceStream(stream)
                })
        })
        document.querySelector("#videoInputDevices").addEventListener("change", e => {
            cameraId = e.target.value
            getStream()
                .then(stream => {
                    replaceStream(stream)
                })
        })

    }
}

function appendAvatar(avatar, container, addon) {
    let div = document.createElement('div');
    div.innerHTML = avatar.image.trim();
    div.classList.add("avatar")
    div.firstChild.setAttribute("color", avatar.color)
    let legend = document.createElement("p")
    let add = addon ? "(" + addon + ")" : "";
    legend.innerHTML = `${avatar.color} ${avatar.avatar} ${add}`
    legend.style.color = avatar.color;
    div.appendChild(legend)
    container.appendChild(div);
}

function toggleEditUsername() {
    let chatusername = document.querySelector(".chat-username");
    document.querySelector(".chat-username input").value = username
    chatusername.classList.add("edit")
}

function updateUsername(element, event) {
    if (event.key == "Enter") {
        let chatusername = document.querySelector(".chat-username");
        chatusername.classList.remove("edit")
        username = element.value
        if (element.value) {
            localStorage.setItem("username", username);
        } else {
            username = defaultUsername
        }
        document.querySelector(".readonly-name").innerHTML = username
    } else if (event.key == "Escape") {
        console.log(event)
        chatusername.classList.remove("edit")

    }
}

function appendMessage(avatar, username, message) {
    let replaced = message.replace("\n", "<br/>");
    let chatbox = document.querySelector(".chat-content");
    if (isUrl(replaced)){
        replaced = `<a href='${replaced}' target="_blank">${replaced}</a>`
    }
    chatbox.innerHTML = (chatbox.innerHTML || "") + `
    <div class="message">
        <div class="message-avatar" style="color: ${avatar.color}">${avatar.image}</div>
        <div class="message-body">
            <div class="message-author">${username}</div>
            <div class="message-content">${replaced}</div>
        </div>
    </div>
    `
    chatbox.scrollTop = chatbox.scrollHeight
}

function isUrl(message) {
    let regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(message);
}

function pageReady() {

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    window.onresize = updateCSS

    loadDevices()
    let constraints = {
        video: true,
        audio: true,
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getUserMediaSuccess)
            .then(function () {

                socket = io.connect(config.host, {secure: true});
                socket.on('signal', gotMessageFromServer);
                socket.on('message', function (id, avatar, data) {
                    appendMessage(avatar, data.username, data.message)
                })

                socket.on('connect', function () {
                    socketId = socket.id;
                    socket.on("avatar", function (avatar) {
                        defaultUsername = avatar.color + " " + avatar.avatar
                        username = defaultUsername
                        username = localStorage.getItem("username") || username;

                        document.querySelector(".readonly-name").innerHTML = username

                        let div = document.querySelector(".local-video")
                        appendAvatar(avatar, div, "you")
                    })
                    socket.on('user-left', function (id) {
                        var video = document.querySelector('[data-socket="' + id + '"]');
                        var parentDiv = video.parentElement;
                        if (pinnedVideo === parentDiv) {
                            selectCam(parentDiv)()
                        }
                        video.parentElement.parentElement.removeChild(parentDiv);
                        let src = '/off.mp3';
                        let audio = new Audio(src);
                        audio.play();
                        delete connections[id]
                        updateCSS()
                    });

                    socket.on("video-status-changed", data => {

                        let video = document.querySelector('[data-socket="' + data.id + '"]');
                        if (video) {
                            let indicator = video.parentElement.querySelector(".remote-video-status")
                            data.status ? indicator.classList.remove("status-disabled") : indicator.classList.add("status-disabled")
                            data.status ? video.parentElement.classList.remove("disabled") : video.parentElement.classList.add("disabled")
                        }
                    })

                    socket.on("sound-status-changed", data => {

                        let video = document.querySelector('[data-socket="' + data.id + '"]');
                        if (video) {
                            let indicator = video.parentElement.querySelector(".remote-sound-status")
                            data.status ? indicator.classList.remove("status-disabled") : indicator.classList.add("status-disabled")
                        }
                    })

                    socket.on('user-joined', function (id, count, clients, avatars) {
                        let src = '/on.mp3';
                        let audio = new Audio(src);
                        audio.play();
                        clients.forEach(function (socketListId) {
                            if (!connections[socketListId]) {
                                connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);
                                //Wait for their ice candidate       
                                connections[socketListId].onicecandidate = function () {
                                    if (event.candidate != null) {
                                        console.log('SENDING ICE');
                                        socket.emit('signal', socketListId, JSON.stringify({'ice': event.candidate}));
                                    }
                                }

                                //Wait for their video stream
                                connections[socketListId].onaddstream = function (event) {
                                    console.log("adding stream event")
                                    gotRemoteStream(event, socketListId, avatars)
                                }

                                //Add the local video stream
                                connections[socketListId].addStream(localStream);
                            }
                        });

                        //Create an offer to connect with your local description

                        if (count >= 2) {
                            connections[id].createOffer().then(function (description) {
                                connections[id].setLocalDescription(description).then(function () {
                                    // console.log(connections);
                                    socket.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}));
                                }).catch(e => console.log(e));
                            });
                        }
                    });
                })

            });
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getScreenMediaSuccess(stream) {
    screensharing = true;
    screenStream = stream;
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    try {
        localVideo.srcObject = stream;
    } catch (error) {
        localVideo.src = window.URL.createObjectURL(stream);
    }
    let localVideoElement = document.querySelector(".local-video")
    localVideoElement.onclick = selectCam(localVideoElement)
    updateCSS()
}

function gotRemoteStream(event, id, avatars) {

    let video = document.createElement('video'),

        inputsStatuses = htmlToElement(`
        <div class="remote-inputs-statuses">
            <i class="remote-sound-status remote-input-status fas fa-microphone-slash"></i>
            <i class="remote-video-status remote-input-status fas fa-video-slash"></i>
        </div>
        `),
        div = document.createElement('div')

    div.classList.add("remote-video")
    div.classList.add("video")
    if (avatars[id]) {
        let avatar = document.createElement('i')
        appendAvatar(avatars[id], div)
    }
    video.setAttribute('data-socket', id);
    div.onclick = selectCam(div)
    try {
        video.srcObject = event.stream;
    } catch (error) {
        video.src = window.URL.createObjectURL(event.stream);
    }

    video.autoplay = true;
    video.muted = devmode == false;
    video.playsinline = true;

    div.appendChild(video);
    div.appendChild(inputsStatuses)
    document.querySelector('.videos').appendChild(div);
    updateCSS()

}

function gotMessageFromServer(fromId, message) {
    socket.emit("video-status-changed", videoEnabled)
    socket.emit("sound-status-changed", audioEnabled)
    //Parse the incoming signal
    var signal = JSON.parse(message)

    //Make sure it's not coming from yourself
    if (fromId != socketId) {

        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
                if (signal.sdp.type == 'offer') {
                    connections[fromId].createAnswer().then(function (description) {
                        connections[fromId].setLocalDescription(description).then(function () {
                            socket.emit('signal', fromId, JSON.stringify({'sdp': connections[fromId].localDescription}));
                        }).catch(e => console.log(e));
                    }).catch(e => console.log(e));
                }
            }).catch(e => console.log(e));
        }

        if (signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
        }
    }
}


function updateCSS() {
    let container = document.querySelector(".videos")
    let countCam = Object.keys(connections).length > 0 ? Object.keys(connections).length : 1
    let divider = 1;

    if (pinnedVideo !== null) {
        countCam--
    }


    while (countCam > divider * divider) {
        divider++;
    }
    let rowDivider = divider

    if (countCam < 3) {
        rowDivider = 1
    }

    if (container.clientHeight > container.clientWidth) {
        // We swap the variables if the height is greater than the width for a better display
        [divider, rowDivider] = [rowDivider, divider]
    }

    container.style.gridTemplateColumns = "repeat(" + divider + ",1fr)"
    container.style.gridTemplateRows = "repeat(" + rowDivider + ",1fr)"
}

function selectCam(el) {
    return () => {
        // We don't want to pin the webcam if you are alone in the call
        if (Object.keys(connections).length < 2) return

        let container = document.querySelector(".videos")
        let primary = document.querySelector("#pinned-video")

        if (pinnedVideo !== null) {
            container.appendChild(pinnedVideo)
        }

        if (pinnedVideo !== el) {
            pinnedVideo = el
            primary.style.display = "block"
            container.classList.add("reduced");
            primary.appendChild(pinnedVideo)
            updateCSS()
            return
        }

        primary.style.display = "none"
        container.classList.remove("reduced")
        pinnedVideo = null
        updateCSS()
    }
}

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
