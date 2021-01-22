import PeerClient from "./PeerClient.js";
import {AudioStream, SharedScreen, VideoStream} from "./MediaStreams.js";
import LayoutManager from "./LayoutManager";

export default class PeerManager {
    TYPE_VIDEO = "VIDEO"
    TYPE_AUDIO = "AUDIO"
    TYPE_SCREENSHARE = "SCREENSHARE"

    peer
    localUser = new PeerClient("__default")
    remoteUsers = {}
    videoEnabled = true
    audioEnabled = true
    screenSharingEnabled = false
    layoutManager = new LayoutManager()


    onClosedStream = (type) => {
    }
    onOpenedStream = (type) => {
    }

    constructor(peer) {
        this.peer = peer
    }

    async startPeering() {
        await this.startMyStream()
        this.peer.on('call', call => {
            if (!this.remoteUsers[call.peer]) {
                this.remoteUsers[call.peer] = new PeerClient(call.peer)
                this.layoutManager.insertPeer(this.remoteUsers[call.peer])

            }

            call.answer(null);
            call.on('stream', this.processReceivingMediaStream(call));
        });
    }

    async videoStart() {
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

    async screenStart() {
        await SharedScreen(stream => {
            this.localUser.joinScreenShareStream(stream, () => {
                this.localUser.screenSharingEnabled = false
                this.closeStream(this.TYPE_SCREENSHARE)
            });
        })
    }


    async startMyStream() {

        if (navigator.mediaDevices.getUserMedia) {
            await this.videoStart()
            await this.audioStart()
        }
        this.layoutManager.insertPeer(this.localUser)
    }

    sendMyStreams(peerId) {
        if (this.localUser.videoEnabled) this.call(peerId, this.localUser.videoStream, this.TYPE_VIDEO)
        if (this.localUser.audioEnabled) this.call(peerId, this.localUser.audioStream, this.TYPE_AUDIO)
        if (this.localUser.screenSharingEnabled) this.call(peerId, this.localUser.screenStream, this.TYPE_SCREENSHARE)
    }

    call(peerId, stream, type) {
        let callInstance = this.peer.call(peerId, stream, {metadata: {callType: type}});

        callInstance.on('close', () => {

        })
        if (!this.remoteUsers[peerId]) {
            this.remoteUsers[peerId] = new PeerClient(peerId)
            this.layoutManager.insertPeer(this.remoteUsers[peerId])
        }
        this.remoteUsers[peerId].calls[type] = callInstance
    }

    closeCall(peerId) {
        if (this.remoteUsers[peerId]) {
            this.layoutManager.removePeer(this.remoteUsers[peerId])

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
                case this.TYPE_SCREENSHARE:
                    this.remoteUsers[call.peer].joinScreenShareStream(stream, () => {
                    })
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
        this.localUser.videoEnabled = false
        for (let track of this.localUser.videoStream.getTracks()) {
            track.stop()
        }
        this.localUser.toggleVideo(false)
        this.closeStream(this.TYPE_VIDEO)


    }

    disableAudio() {
        this.localUser.audioEnabled = false
        for (let track of this.localUser.audioStream.getTracks()) {
            track.stop()
        }
        this.closeStream(this.TYPE_AUDIO)
    }

    async enableVideo() {
        this.localUser.videoEnabled = true
        await this.videoStart()
        this.openStream(this.localUser.videoStream, this.TYPE_VIDEO)
    }

    async enableAudio() {
        this.localUser.audioEnabled = true
        await this.audioStart()
        this.openStream(this.localUser.audioStream, this.TYPE_AUDIO)
    }

    async enableScreenShare() {
        try {
            await this.screenStart()
            this.localUser.screenSharingEnabled = true
            this.localUser.toggleScreen(true)
            this.openStream(this.localUser.screenStream, this.TYPE_SCREENSHARE)
        }catch(e){
            //donothing
        }
    }

    disableScreenShare() {
        this.localUser.toggleScreen(false)
        this.localUser.screenSharingEnabled = false
        for (let track of this.localUser.screenStream.getTracks()) {
            track.stop()
        }
        this.closeStream(this.TYPE_SCREENSHARE)
    }


    changeStreamStatus(peerId, type, status) {
        if (!this.remoteUsers[peerId]) return;
        switch (type) {
            case this.TYPE_VIDEO:
                this.remoteUsers[peerId].videoEnabled = status
                this.remoteUsers[peerId].toggleVideo(status)
                break
            case this.TYPE_AUDIO:
                this.remoteUsers[peerId].audioEnabled = status
                this.remoteUsers[peerId].toggleAudio(status)
                break
            case this.TYPE_SCREENSHARE:
                this.remoteUsers[peerId].screenSharingEnabled = status
                this.remoteUsers[peerId].toggleScreen(status)
                break
        }
    }

}