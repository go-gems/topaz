export default class Controls {

    peerManager

    constructor(peerManager) {
        this.peerManager = peerManager
    }

    toggleAudio() {
        this.peerManager.audioEnabled ? this.peerManager.disableAudio() : this.peerManager.enableAudio()
    }

    toggleVideo() {
        this.peerManager.videoEnabled ? this.peerManager.disableVideo() : this.peerManager.enableVideo()

    }

}
