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

let clients = {}

const wsClient = {
    socket: null,
    initialize() {

        this.socket = io(config.host)
        socketId = this.socket.id

        this.socket.on("initialize", onInitialize)
        this.socket.on("offer", onOffer)
        this.socket.on("answer", onAnswer)
        this.socket.on("ice-candidate", onIceCandidate)
        this.socket.on("user-joined", onUserJoined)
        this.socket.on("user-left", onUserLeft)
        this.socket.on("chat-message", onChatMessage)
        this.socket.on("video-status-changed", onVideoStatusChanged)
        this.socket.on("audio-status-changed", onAudioStatusChanged)
    },

}

const media = {
    localStream: null,
    localVideoElement: null,
    constraints: {
        video: true,
        audio: true
    },
    async initialize() {
        if (!await navigator.mediaDevices.getUserMedia) {
            alert("Your browser does not support the getMediaAPI. Please update your browser.")
        }

        this.loadDevices()

        this.localVideoElement = document.querySelector("#localVideo")
        console.log(this)

        try {
            let stream = await navigator.mediaDevices.getUserMedia(this.constraints)
            this.handleLocalStream(stream)
        } catch (err) {
            console.error("Error while trying to get user stream", err)
        }

    },
    handleLocalStream(stream) {
        console.log(this)
        this.localStream = stream
        this.localVideoElement.srcObject = this.localStream
        let localVideoParentElement = this.localVideoElement.parentElement
        localVideoParentElement.onclick = selectCam(localVideoParentElement)
        updateCSS()
    },

    sendLocalStreamToConnection(connection) {
        media.localStream.getTracks().forEach(track => {
            connection.addTrack(track)
        })
    },
    initializeRemoteStream(clientId) {

        // Create the remote stream, used to add tracks later
        clients[clientId].stream = new MediaStream()

        // Create the HTML elements
        let video = document.createElement('video')
        let inputsStatuses = htmlToElement(`
            <div class="remote-inputs-statuses">
                <i class="remote-sound-status remote-input-status fas fa-microphone-slash"></i>
                <i class="remote-video-status remote-input-status fas fa-video-slash"></i>
            </div>
        `)
        let wrapper = document.createElement('div')
        wrapper.classList.add("remote-video")
        wrapper.classList.add("video")

        // Adding avatar
        if (clients[clientId].avatar) {
            appendAvatar(clients[clientId].avatar, wrapper)
        }

        video.setAttribute('data-socket', clientId)
        wrapper.onclick = selectCam(wrapper)

        // Adding the stream to the video element
        video.srcObject = clients[clientId].stream

        //TODO: Look if this is necessary
        video.autoplay = true
        video.muted = devmode == false
        video.playsinline = true

        // Adding the HTML elements
        wrapper.appendChild(video);
        wrapper.appendChild(inputsStatuses)
        document.querySelector('.videos').appendChild(wrapper);
        updateCSS()

        // Create the event handler, which will add the tracks that it receive from the client to the stream
        clients[clientId].connection.ontrack = event => {
            clients[clientId].stream.addTrack(event.track)
        }
    },

    // Loads the list of devices
    // TODO: Add a listener for changes in the devices :
    //  https://webrtc.org/getting-started/media-devices#listening_for_devices_changes
    loadDevices() {
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
            getStream(videoEnabled)
                .then(stream => {
                    replaceStream(stream)
                })
        })
        document.querySelector("#videoInputDevices").addEventListener("change", e => {
            cameraId = e.target.value
            getStream(videoEnabled)
                .then(stream => {
                    replaceStream(stream)
                })
        })
    }
}

media.initialize()
    .then(() => {
        wsClient.initialize()
    })

function onInitialize(data) {
    username = localStorage.getItem("username") || data.avatar.color + " " + data.avatar.avatar;

    document.querySelector(".readonly-name").innerHTML = username

    let div = document.querySelector(".local-video")
    appendAvatar(data.avatar, div, "you")

    clients = data.clients

    sendOffers(clients)
}

// Handles an offer by sending an answer to the sender
async function onOffer(data) {
    if (!data.offer || !data.sender) {
        return
    }

    console.log("received offer", data)

    const connection = new RTCPeerConnection(peerConnectionConfig)
    await connection.setRemoteDescription(new RTCSessionDescription(data.offer))
    const answer = await connection.createAnswer()
    await connection.setLocalDescription(answer)

    clients[data.sender].connection = connection

    setupIceCandidates(data.sender)
    wsClient.socket.emit("answer", {
        to: data.sender,
        answer: answer
    })

    media.sendLocalStreamToConnection(clients[data.sender].connection)

    media.initializeRemoteStream(data.sender)

}

// Handling the answer returned by a client you offered
async function onAnswer(data) {
    console.log(data, clients)
    if (!data.answer || !clients[data.sender].connection) {
        return
    }

    console.log("received answer", data)

    const remoteDescription = new RTCSessionDescription(data.answer)
    await clients[data.sender].connection.setRemoteDescription(remoteDescription)

    setupIceCandidates(data.sender)

    media.sendLocalStreamToConnection(clients[data.sender].connection)

    media.initializeRemoteStream(data.sender)

}

// Add remote ice candidate to the connection
function onIceCandidate(data) {
    if (!data.iceCandidate || !data.sender) {
        return
    }

    console.log("received ice", data)

    clients[data.sender].connection.addIceCandidate(data.iceCandidate)
        .catch(err => {
            console.warn("Error while trying to add ice candidate", err)
        })
}

// Handles a new user joining
// TODO: Add some client list synchronization logic with the server to avoid
//  potential desynchronization if we add functionalities later
function onUserJoined(data) {
    let src = '/on.mp3'
    let audio = new Audio(src)
    audio.play()
        .catch(err => {
            console.error("Error while trying to play join sound", err)
        })
    clients[data.id] = data.user
}

function onUserLeft(data) {
    const video = document.querySelector('[data-socket="' + data.id + '"]');
    const parentDiv = video.parentElement;
    if (pinnedVideo === parentDiv) {
        selectCam(parentDiv)()
    }
    video.parentElement.parentElement.removeChild(parentDiv);
    let src = '/off.mp3'
    let audio = new Audio(src)
    audio.play()
        .catch(err => {
            console.error("Error while trying to play leave sound", err)
        })
    delete clients[data.id]
    updateCSS()
}

function onChatMessage(data) {
    appendMessage(data.sender, data.message)
}

function onVideoStatusChanged(data) {
    const video = document.querySelector('[data-socket="' + data.id + '"]');
    if (video) {
        let indicator = video.parentElement.querySelector(".remote-video-status")
        data.status ?
            indicator.classList.remove("status-disabled") :
            indicator.classList.add("status-disabled")
        data.status ?
            video.parentElement.classList.remove("disabled") :
            video.parentElement.classList.add("disabled")
    }
}

function onAudioStatusChanged(data) {
    const video = document.querySelector('[data-socket="' + data.id + '"]');
    if (video) {
        let indicator = video.parentElement.querySelector(".remote-sound-status")
        data.status ?
            indicator.classList.remove("status-disabled") :
            indicator.classList.add("status-disabled")
    }
}

// Send offers to all clients connected (used at the start)
function sendOffers(clients) {
    Object.keys(clients).forEach(clientId => {
        if (clientId === wsClient.socket.id) {
            return
        }
        const connection = new RTCPeerConnection(peerConnectionConfig)
        connection.createOffer()
            .then(async offer => {
                await connection.setLocalDescription(offer)
                clients[clientId] = {
                    connection
                }
                wsClient.socket.emit("offer", {
                    to: clientId,
                    offer
                })
            })
    })
}

function setupIceCandidates(clientId) {
    clients[clientId].connection.onicecandidate = function(event) {
        console.log("ice event", event)
        if (event.candidate) {
            wsClient.socket.emit("ice-candidate", {
                iceCandidate: event.candidate,
                to: clientId
            })
        }
    }

    console.log("setup ice data", clients[clientId])

}

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
    // localStream.getVideoTracks()[0].enabled = videoEnabled
    getStream(videoEnabled)
        .then(replaceStream)


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


function getStream(enableVideo) {
    return new Promise((resolve, reject) => {
        let constraints = {
            video: enableVideo,
            audio: true
        }

        if (cameraId !== null && enableVideo) {
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

function appendMessage(id, message) {
    const replaced = transformContainingURL(message.replace("\n", "<br/>"));
    const chatbox = document.querySelector(".chat-content");
    const user = clients[id]
    chatbox.innerHTML = (chatbox.innerHTML || "") + `
    <div class="message">
        <div class="message-avatar" style="color: ${user.avatar.color}">${user.avatar.image}</div>
        <div class="message-body">
            <div class="message-author">${user.username}</div>
            <div class="message-content">${replaced}</div>
        </div>
    </div>
    `
    chatbox.scrollTop = chatbox.scrollHeight
}

function transformContainingURL(message) {
    let regex = /((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/g
    return message.replace(regex, `<a href='$1' target="_blank">$1</a>`)
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
