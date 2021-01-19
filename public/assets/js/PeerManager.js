import PeerClient from "./PeerClient.js";

export default class PeerManager {
    TYPE_VIDEO = "VIDEO"
    TYPE_AUDIO = "AUDIO"
    TYPE_SCREENSHARE = "SCREENSHARE"

    peer
    selfUser
    remoteUsers = {}

    constructor(peer, callback) {
        this.peer = peer
        this.selfUser = new PeerClient("__default")


    }

    async startPeering() {
        await this.startMyStream()
        this.peer.on('call', call => {
            console.log("calling from " + call.peer)// Answer the call, providing our mediaStream
            let callType = call.metadata.type
            //todo check which callType to answer with appropriate stream
            call.answer(this.selfUser.videoStream);
            call.on('stream', this.processReceivingMediaStream(this, call, callType));
        });
    }

    async startMyStream() {

        if (navigator.mediaDevices.getUserMedia) {
            return await navigator.mediaDevices.getUserMedia({video: true, audio: true})
                .then(this.getUserMediaSuccess(this))
        }
        // Here I should as well implement the audio media but for now let's start simply with the video+audio single streamline.
    }


    call(peerId) {
        console.log("calling " + peerId)

        let callVideo = this.peer.call(peerId, this.selfUser.videoStream, {metadata: {streamType: this.TYPE_VIDEO}});
        callVideo.on('stream', this.processReceivingMediaStream(this, callVideo));
    }

    closeCall(peerId) {
        if (this.remoteUsers[peerId]) {
            document.querySelector(".videos").removeChild(this.remoteUsers[peerId].htmlElement);
            delete this.remoteUsers[peerId]
        }
    }

    processReceivingMediaStream(self, call) {
        return stream => {
            console.log("Receiving stream from " + call.peer)
            if (!self.remoteUsers[call.peer]) {
                self.remoteUsers[call.peer] = new PeerClient(call.peer)
                self.remoteUsers[call.peer].joinVideoStream(stream)
               // self.remoteUsers[call.peer].setSound(false)
                document.querySelector(".videos").appendChild(self.remoteUsers[call.peer].htmlElement)
            }
        }
    }

    getUserMediaSuccess(self) {
        return stream => {
            self.selfUser.joinVideoStream(stream)
            self.selfUser.setSound(false)
            document.querySelector(".videos").appendChild(this.selfUser.htmlElement)
        }
    }
}