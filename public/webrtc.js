let localVideo;
let firstPerson = false;
let socketCount = 0;
let devmode = true;
let socketId;
let localStream;
let screenStream;
let connections = [];
let videotracks = [];
let screensharing = false;
let videoEnabled = true
let audioEnabled = true
let peerConnection = null
let cameraId = null
let microphoneId = null
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
    if (videoEnabled) {
        button.classList.add("fa-video");
        button.classList.remove("fa-video-slash");
        return
    }
    button.classList.add("fa-video-slash");
    button.classList.remove("fa-video");
}

function shareScreen() {
    _startScreenCapture()
        .then(getScreenMediaSuccess)
        .then(function () {
            console.log("PIF", connections)
            for(connection of connections){
                console.log("PAF",connection)
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

function pageReady() {

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

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
                socket.on('broadcast-message', function (id, data) {

                    var video = document.querySelector('[data-socket="' + id + '"]');
                    //if(data.mode && data.mode=="fullscreen")
                    //video.classList.add("fullscreen");
                })
                socket.on('connect', function () {

                    socketId = socket.id;

                    socket.on('user-left', function (id) {
                        var video = document.querySelector('[data-socket="' + id + '"]');
                        var parentDiv = video.parentElement;
                        video.parentElement.parentElement.removeChild(parentDiv);
                        let src = '/off.mp3';
                        let audio = new Audio(src);
                        audio.play();
                    });
                    socket.on('fullscreen', function (id) {
                        var video = document.querySelector('[data-socket="' + id + '"]');
                        if (video) {
                            var parentDiv = video.parentElement;
                            parentDiv.classList.add("fullscreen");
                        }

                    })

                    socket.on('user-joined', function (id, count, clients) {
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
                                    gotRemoteStream(event, socketListId)
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
}

function gotRemoteStream(event, id) {

    var videos = document.querySelectorAll('video'),
        video = document.createElement('video'),
        div = document.createElement('div')

    video.setAttribute('data-socket', id);
    try {
        video.srcObject = event.stream;
    } catch (error) {
        video.src = window.URL.createObjectURL(event.stream);
    }

    video.autoplay = true;
    video.muted = devmode == false;
    video.playsinline = true;

    div.appendChild(video);
    document.querySelector('.videos').appendChild(div);
}

function gotMessageFromServer(fromId, message) {

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

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}