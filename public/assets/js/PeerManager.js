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
        this.waitForCall()
        this.startMyStream().then(this.initCalls(this))

    }

    async startMyStream() {
        if (navigator.mediaDevices.getUserMedia) {
            return await navigator.mediaDevices.getUserMedia({video: true, audio: true})
                .then(this.getUserMediaSuccess(this))
        }
        // Here I should as well implement the audio media but for now let's start simply with the video+audio single streamline.
    }


    initCalls(self) {
        return () => {
            // And this is where I stopped at 2 AM as I don't f**king know how to efficiently loop in object in js
            // unless using the for Object.keys
            for (let i = 0; i < Object.keys(userList).length; i++) {
                let user = userList[Object.keys(userList)[i]];
                this.remoteUsers[user.peerId] = new PeerClient(user.peerId)
                self.call(user.peerId, this.TYPE_VIDEO)
            }
        }
    }

    async waitForCall() {
        console.log("waiting for call")
        this.peer.on('call', call => {
            console.log(call)// Answer the call, providing our mediaStream
            call.answer(this.selfUser.videoStream);
            call.on('stream', this.processReceivingMediaStream(this, call));
        });
    }

    call(peerId, type) {
        let call = this.peer.call(peerId, this.selfUser.videoStream);
        call.on('stream', this.processReceivingMediaStream(this, call));
    }

    processReceivingMediaStream(self, call) {
        return stream => {
            console.log(call, stream)


        }
    }

    getUserMediaSuccess(self) {
        return stream => {
            self.selfUser.joinVideoStream(stream)
            document.querySelector(".videos").appendChild(this.selfUser.htmlElement)
        }
    }
}