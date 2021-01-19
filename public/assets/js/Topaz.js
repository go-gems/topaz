import WsManager from "./WsManager.js";
import PeerManager from "./PeerManager.js";

export default class Topaz {

    peerManager
    peerId
    wsManager

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
            console.log('Peer ID : ' + id)
            this.initWs()
            this.peerManager.startPeering()
        })
    }

    initWs() {
        this.wsManager = new WsManager()
        this.wsManager.on("logged", (data) => {

            // this.wsManager.send("message", {peerId: this.peerId, message: "i'm logged :)"})
        })
        this.wsManager.on("user-joined", (data) => {
            userList[data.peerId] = data
            console.log("user joined: " + data.peerId);
            this.peerManager.call(data.peerId)
        })

        this.wsManager.on("user-left", (data) => {
            delete userList[data]
            this.peerManager.closeCall(data)
        })

        this.wsManager.on("message", (data) => {
            // todo for the chat
            //console.log(data.username, ":", data.message)
        })

        this.wsManager.ws.onopen = () => {
            this.wsManager.send("login", {peerId: this.peerId})
        }
    }

}
