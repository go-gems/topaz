export default class PeerManager {
    TYPE_VIDEO = "VIDEO"
    TYPE_AUDIO = "AUDIO"
    TYPE_SCREENSHARE = "SCREENSHARE"

    peer

    constructor(peer, callback) {
        this.peer = peer
    }

    initCalls() {
        console.log("let's audio+video every users here")
        // And this is where I stopped at 2 AM as I don't f**king know how to efficiently loop in object in js
        // unless using the for Object.keys
        call("PEERID", this.TYPE_VIDEO, null)
        call("PEERID", this.TYPE_AUDIO, null)
    }

    call(peerId, type, mediastream) {

    }
}