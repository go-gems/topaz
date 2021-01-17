import WsManager from "./WsManager.js";

export default class Topaz {

    peer
    peerId
    wsManager

    constructor() {
        this.peer = new Peer()
        this.setupPeerHandlers()
    }

    setupPeerHandlers() {
        this.peer.on('open', id => {
            this.peerId = id
            console.log('Peer ID : ' + id)
            this.initWs()
        })
    }

    initWs() {
        this.wsManager = new WsManager()
        this.wsManager.ws.onopen = () => {
            this.wsManager.send("login", {peerId: this.peerId})
        }
    }
}
