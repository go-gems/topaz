export default class WsManager {
    ws
    actions = {}

    constructor() {
        this.ws = new WebSocket("ws://" + window.location.hostname + (window.location.port ? `:${window.location.port}` : "") + "/ws")
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