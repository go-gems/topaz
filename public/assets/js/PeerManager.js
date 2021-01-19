import PeerClient from "./PeerClient.js";

export default class PeerManager {
    TYPE_VIDEO = "VIDEO"
    TYPE_AUDIO = "AUDIO"
    TYPE_SCREENSHARE = "SCREENSHARE"

    peer
    selfUser
    remoteUsers = {}

    constructor(peer) {
        this.peer = peer
        this.selfUser = new PeerClient("__default")
    }

    async startPeering() {
        await this.startMyStream()
        this.peer.on('call', call => {
            let callType = call.metadata.type
            //todo check which callType to answer with appropriate stream
            call.answer(this.selfUser.videoStream);
            call.on('stream', this.processReceivingMediaStream(call));
        });
    }

    async startMyStream() {

        if (navigator.mediaDevices.getUserMedia) {
            return await navigator.mediaDevices.getUserMedia({video: true, audio: true})
                .then(this.getUserMediaSuccess())
        }
        // Here I should as well implement the audio media but for now let's start simply with the video+audio single streamline.
    }

    call(peerId) {
        let callVideo = this.peer.call(peerId, this.selfUser.videoStream, {metadata: {streamType: this.TYPE_VIDEO}});
        callVideo.on('stream', this.processReceivingMediaStream(callVideo));
    }

    closeCall(peerId) {
        if (this.remoteUsers[peerId]) {
            document.querySelector(".videos").removeChild(this.remoteUsers[peerId].htmlElement);
            delete this.remoteUsers[peerId]
        }
    }

    processReceivingMediaStream(call) {
        return stream => {
            if (!this.remoteUsers[call.peer]) {
                this.remoteUsers[call.peer] = new PeerClient(call.peer)
                this.remoteUsers[call.peer].joinVideoStream(stream)
                this.remoteUsers[call.peer].setSound(false)
                document.querySelector(".videos").appendChild(this.remoteUsers[call.peer].htmlElement)
            }
        }
    }

    getUserMediaSuccess() {
        return stream => {
            this.selfUser.joinVideoStream(stream)
            this.selfUser.setSound(false)
            document.querySelector(".videos").appendChild(this.selfUser.htmlElement)
        }
    }
}