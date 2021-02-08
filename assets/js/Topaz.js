import WsManager from "./WsManager.js";
import PeerManager from "./PeerManager.js";
import Controls from "./Controls.js";


export default class Topaz {

    peerManager
    peerId
    wsManager
    userList = {}
    controls

    constructor() {
        this.setupPeerManager()
        this.setupPeerHandlers()
    }

    setupPeerHandlers() {
        this.peerManager.peer.on('open', id => {
            this.peerId = id
            this.peerManager.startPeering()
                .then(() => {
                    this.initWs()
                })
        })
    }

    initWs() {
        this.wsManager = new WsManager()
        this.wsManager.on("logged", (data) => {
            this.peerManager.localUser.setAvatar(data.user.avatar)
        })

        this.wsManager.on("user-joined", data => {
            this.userList[data.peerId] = data
            let src = '/on.mp3';
            let audio = new Audio(src);
            audio.play();
            this.peerManager.sendMyStreams(data.peerId, data.avatar)
            this.wsManager.send("call-me", {"from": this.peerId, "to": data.peerId})
            // from A to B
        })
        this.wsManager.on("call-request", data => {
            // B will store client A and make a call
            this.userList[data.peerId] = data
            this.peerManager.sendMyStreams(data.peerId, data.avatar)
        })

        this.wsManager.on("user-left", (data) => {
            delete userList[data]
            this.peerManager.closeCall(data)
        })

        this.wsManager.on("stream-status-changed", (data) => {
            this.peerManager.changeStreamStatus(data.peerId, data.type, data.on);

        })

        this.wsManager.ws.onopen = () => {
            this.wsManager.send("login", {peerId: this.peerId})
        }
    }

    setupPeerManager() {
        this.peerManager = new PeerManager(new Peer({
                config: {
                    'iceServers': [
                        {url: 'stun:stun.l.google.com:19302'},
                        {url: 'stun:stun.services.mozilla.com'},
                    ]
                }
            }
        ))
        this.controls = new Controls(this.peerManager)

        this.peerManager.onOpenedStream = (type) => {
            this.wsManager.send("stream-status-changed", {peerId: this.peerId, type: type, on: true})
        }

        this.peerManager.onClosedStream = (type) => {
            this.wsManager.send("stream-status-changed", {peerId: this.peerId, type: type, on: false})

        }

    }
}
