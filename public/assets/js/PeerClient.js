export default class PeerClient {
    peerId
    htmlElement
    video
    videoStream

    constructor(peerId) {
        this.peerId = peerId
        this._initializeHTML()
    }

    _initializeHTML() {
        this.video = document.createElement('video');
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add("video", "remote-video");
        this.htmlElement.dataset.peerId = this.peerId;
        this.htmlElement.appendChild(this.video);
    }

    joinVideoStream(stream) {
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

    setSound(b) {
        this.video.muted = !b
    }


}