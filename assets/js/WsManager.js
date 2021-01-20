export default class WsManager {
    ws
    actions = {}

    constructor() {
        let protocol = "ws://"
        if (window.location.protocol == "https:") {
            protocol = "wss://"
        }
        this.ws = new WebSocket(protocol + window.location.hostname + (window.location.port ? `:${window.location.port}` : "") + "/ws")
        this.ws.onmessage = this._onEvent(this)
    }

    _onEvent(self) {
        return (event) => {
            let msg = JSON.parse(event.data);
            if (self.actions[msg.type]) {
                self.actions[msg.type](msg.data)
            }
        }
    }

    send(type, data) {
        this.ws.send(JSON.stringify({
            type,
            data
        }))
    }

    on(type, callback) {
        this.actions[type] = callback
    }
}