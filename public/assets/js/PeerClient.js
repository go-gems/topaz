export default class PeerClient {
    peerId
    htmlElement
    video
    videoStream
    audio
    audioStream
    calls = {}

    constructor(peerId) {
        this.peerId = peerId
        this._initializeHTML()
    }

    _initializeHTML() {
        this.video = document.createElement('video');
        this.audio = document.createElement('audio');
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add("video", "remote-video");
        this.htmlElement.dataset.peerId = this.peerId;
        this.htmlElement.appendChild(this.video);
        this.htmlElement.appendChild(this.audio);
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

    }
    joinScreenShareStream(stream){
        this.videoStream = stream
        try {
            this.video.srcObject = this.videoStream;
        } catch (error) {
            this.video.src = window.URL.createObjectURL(this.videoStream);
        }

        this.video.autoplay = true;
        this.video.muted = false;
        this.video.playsinline = true;
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
    }

    closeStream(type) {
        if (this.calls[type]) {
            this.calls[type].close()
            delete this.calls[type]
        }
    }

    toggleAudio(b) {
        this.audio.muted = !b
        // Here show mic on/off
    }

    toggleVideo(b) {
        // Here show video on/off
        if (!b) {
            this.video.style.display="none"
        } else {
            this.video.style.display="block"
        }
    }


}