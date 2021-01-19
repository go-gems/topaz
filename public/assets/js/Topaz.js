import WsManager from "./WsManager.js";
import PeerManager from "./PeerManager.js";

export default class Topaz {

    peerManager
    peerId
    wsManager
    userList = {}

    constructor() {
        this.peerManager = new PeerManager(new Peer({
                config: {
                    'iceServers': [
                        {url: 'stun:stun.l.google.com:19302'},
                        {url: 'stun:stun.services.mozilla.com'},
                    ]
                }
            }
        ))
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
            this.userList = data.userList
        })

        this.wsManager.on("user-joined", (data) => {
            this.userList[data.peerId] = data
            this.peerManager.call(data.peerId)
        })

        this.wsManager.on("user-left", (data) => {
            delete userList[data]
            this.peerManager.closeCall(data)
        })

        this.wsManager.ws.onopen = () => {
            this.wsManager.send("login", {peerId: this.peerId})
        }
    }

}
