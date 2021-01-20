import PeerClient from "./PeerClient.js";
import {AudioStream, SharedScreen, VideoStream} from "./MediaStreams.js";

export default class PeerManager {
    TYPE_VIDEO = "VIDEO"
    TYPE_AUDIO = "AUDIO"
    TYPE_SCREENSHARE = "SCREENSHARE"

    peer
    localUser
    remoteUsers = {}
    videoEnabled = true
    audioEnabled = true
    screenSharingEnabled = false
    onClosedStream = (type) => {
    }
    onOpenedStream = (type) => {
    }

    constructor(peer) {
        this.peer = peer
        this.localUser = new PeerClient("__default")
    }

    async startPeering() {
        await this.startMyStream()
        this.peer.on('call', call => {
            if (!this.remoteUsers[call.peer]) {
                this.remoteUsers[call.peer] = new PeerClient(call.peer)
                document.querySelector(".videos").appendChild(this.remoteUsers[call.peer].htmlElement)

            }

            call.answer(null);
            call.on('stream', this.processReceivingMediaStream(call));
        });
    }

    async videoStart() {
        this.screenSharingEnabled=false
        await VideoStream(stream => {
            this.localUser.joinVideoStream(stream)
        })
    }

    async audioStart() {
        await AudioStream(stream => {
            this.localUser.joinAudioStream(stream);
            this.localUser.audio.muted = true;
        })
    }
    async shareScreenStart(){
        await SharedScreen(stream=>{
            this.localUser.joinScreenShareStream(stream);
            this.screenSharingEnabled=true
            this.openStream(this.localUser.videoStream, this.TYPE_VIDEO)

        })
    }


    async startMyStream() {

        if (navigator.mediaDevices.getUserMedia) {
            await this.videoStart()
            await this.audioStart()
        }
        document.querySelector(".videos").appendChild(this.localUser.htmlElement)
    }

    sendMyStreams(peerId) {
        if (this.videoEnabled) this.call(peerId, this.localUser.videoStream, this.TYPE_VIDEO)
        if (this.audioEnabled) this.call(peerId, this.localUser.audioStream, this.TYPE_AUDIO)
    }

    call(peerId, stream, type) {
        let callInstance = this.peer.call(peerId, stream, {metadata: {callType: type}});

        callInstance.on('close', () => {

        })
        if (!this.remoteUsers[peerId]) {
            this.remoteUsers[peerId] = new PeerClient(peerId)
            document.querySelector(".videos").appendChild(this.remoteUsers[peerId].htmlElement)
        }
        this.remoteUsers[peerId].calls[type] = callInstance
    }

    onCloseCall(callback) {

    }

    closeCall(peerId) {
        if (this.remoteUsers[peerId]) {
            document.querySelector(".videos").removeChild(this.remoteUsers[peerId].htmlElement);
            delete this.remoteUsers[peerId]
        }
    }

    processReceivingMediaStream(call) {
        let callType = call.metadata.callType
        return stream => {
            switch (callType) {
                case this.TYPE_VIDEO:
                    this.remoteUsers[call.peer].joinVideoStream(stream)
                    break
                case this.TYPE_AUDIO:
                    this.remoteUsers[call.peer].joinAudioStream(stream)
                    break
            }
        }
    }

    closeStream(type) {
        for (let peerId of Object.keys(this.remoteUsers)) {
            this.remoteUsers[peerId].closeStream(type);
        }
        this.onClosedStream(type)
    }

    openStream(stream, type) {
        for (let peerId of Object.keys(this.remoteUsers)) {
            this.call(peerId, stream, type)
        }
        this.onOpenedStream(type)

    }

    disableVideo() {
        this.videoEnabled = false
        for (let track of this.localUser.videoStream.getTracks()) {
            track.stop()
        }
        this.closeStream(this.TYPE_VIDEO)


    }

    disableAudio() {
        this.audioEnabled = false
        for (let track of this.localUser.audioStream.getTracks()) {
            track.stop()
        }
        this.closeStream(this.TYPE_AUDIO)
    }

    async enableVideo() {
        this.videoEnabled = true
        await this.videoStart()
        this.openStream(this.localUser.videoStream, this.TYPE_VIDEO)
    }

    async enableAudio() {
        this.audioEnabled = true
        await this.audioStart()
        this.openStream(this.localUser.videoStream, this.TYPE_VIDEO)
    }

    changeStreamStatus(peerId, type, status) {
        if (!this.remoteUsers[peerId]) return;
        switch (type) {
            case this.TYPE_VIDEO:
                this.remoteUsers[peerId].toggleVideo(status)
                break
            case this.TYPE_AUDIO:
                this.remoteUsers[peerId].toggleAudio(status)
                break
        }
    }

}