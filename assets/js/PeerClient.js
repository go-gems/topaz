export default class PeerClient {
    videoEnabled = true
    audioEnabled = true
    screenSharingEnabled = false

    peerId
    htmlElement
    video
    videoStream
    audio
    screen
    screenStream
    audioStream
    calls = {}
    properties = {}
    callsBar
    placeholder

    constructor(peerId) {
        this.peerId = peerId
        this._initializeHTML()

    }

    setAvatar(avatar) {
        let image = document.createElement("div")
        image.classList.add("portrait")
        image.innerHTML = avatar.image
        image.style.color = avatar.color
        this.avatar.appendChild(image)
        let name = document.createElement("div")
        name.classList.add("title")
        name.style.color = avatar.color
        name.innerText = avatar.name
        this.avatar.appendChild(name)
    }

    showControls(e) {
        //use only on debug
        // e.setAttribute("controls", "controls")
    }

    _initializeHTML() {
        this.avatar = document.createElement("div")
        this.avatar.classList.add("avatar-placeholder")
        this.video = document.createElement('video');
        this.video.classList.add("video")
        this.showControls(this.video)
        this.screen = document.createElement('video');
        this.screen.classList.add("screen")
        this.showControls(this.screen)
        this.audio = document.createElement('audio');
        this.audio.classList.add("audio")
        this.audioIndicator = document.createElement("i")
        this.audioIndicator.classList.add("fas", "fa-microphone-slash", "audio-indicator")

        this.showControls(this.audio)
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add("peer");
        this.htmlElement.dataset.peerId = this.peerId;
        this.htmlElement.appendChild(this.avatar);
        this.htmlElement.appendChild(this.video);
        this.htmlElement.appendChild(this.screen);
        this.htmlElement.appendChild(this.audio);
        this._callsBar_init()
        this.htmlElement.appendChild(this.callsBar)
        this.htmlElement.appendChild(this.audioIndicator)
    }

    _callsBar_init() {

        this.callsBar = document.createElement("div")
    }

    joinVideoStream(stream) {
        this.video.style.display = "block";
        this.videoStream = stream
        try {
            this.video.srcObject = this.videoStream;
        } catch (error) {
            this.video.src = window.URL.createObjectURL(this.videoStream);
        }

        this.video.autoplay = true;
        this.video.muted = true;
        this.video.playsinline = true;
        this.avatar.style.zIndex = "-1";

    }

    joinScreenShareStream(stream, onClose) {
        this.screenStream = stream
        try {
            this.screen.srcObject = this.screenStream;
        } catch (error) {
            this.screen.src = window.URL.createObjectURL(this.videoStream);
        }

        this.screen.autoplay = true;
        this.screen.muted = false;
        this.screen.playsinline = true;
        this.toggleScreen(true)
        this.screenStream.getVideoTracks()[0].onended = () => {
            this.toggleScreen(false)
            onClose()

        };

    }

    joinAudioStream(stream) {
        this.audioStream = stream
        try {
            this.audio.srcObject = this.audioStream;
        } catch (error) {
            this.audio.src = window.URL.createObjectURL(this.audioStream);
        }

        this.audio.autoplay = true;
        this.audio.muted = false;
        this.audio.playsinline = true;
        this.audioIndicator.classList.add("audio-indicator-disabled")
    }

    closeStream(type) {
        if (this.calls[type]) {
            this.calls[type].close()
            delete this.calls[type]
        }
    }

    toggleAudio(b) {
        this.audio.muted = !b
        this.audio.muted
            ? this.audioIndicator.classList.remove("audio-indicator-disabled")
            : this.audioIndicator.classList.add("audio-indicator-disabled")
    }

    toggleScreen(b) {
        if (b) {
            this.htmlElement.classList.add("screen-share")
        } else {
            this.htmlElement.classList.remove("screen-share")
        }
        this.showAvatar()
    }

    toggleVideo(b) {
        // Here show video on/off
        if (!b) {
            this.video.style.display = "none"
        } else {
            this.video.style.display = "block"
        }
        this.showAvatar()
    }

    showAvatar() {
        if (!this.videoEnabled && !this.screenSharingEnabled) {
            this.avatar.style.display = "block"

        } else {
            this.avatar.style.display = "none"

        }
    }


}