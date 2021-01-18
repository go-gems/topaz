import WsManager from "./WsManager.js";
import PeerManager from "./PeerManager.js";

export default class Topaz {

    peerManager
    peerId
    wsManager

    constructor() {
        this.peerManager = new PeerManager(new Peer())
        this.setupPeerHandlers()

    }

    setupPeerHandlers() {
        this.peerManager.peer.on('open', id => {
            this.peerId = id
            console.log('Peer ID : ' + id)
            this.initWs()
            this.peerManager.initCalls()
        })
    }

    initWs() {
        this.wsManager = new WsManager()
        this.wsManager.on("logged", (data) => {
            this.wsManager.send("message", {peerId: this.peerId, message: "i'm logged :)"})
        })
        this.wsManager.on("user-joined", (data) => {
            userList[data.peerId] = data
        })

        this.wsManager.on("user-left", (data) => {
            delete userList[data]
        })

        this.wsManager.on("message", (data) => {
            console.log(data.username, ":", data.message)
        })

        this.wsManager.ws.onopen = () => {
            this.wsManager.send("login", {peerId: this.peerId})
        }
    }

}
