export default class WsManager {
    ws

    constructor() {
        this.ws = new WebSocket("ws://" + window.location.hostname + ( window.location.port ? `:${window.location.port}` : "") + "/ws")
    }

    send(type, data) {
        this.ws.send(JSON.stringify({
            type,
            data
        }))
    }
}