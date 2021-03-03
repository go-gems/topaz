package server

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
	"text/template"
)

type M map[string]interface{}
type Client struct {
	Conn   *websocket.Conn `json:"-"`
	PeerId string          `json:"peerId"`
	Avatar *Avatar         `json:"avatar"`
}
type Settings struct {
	//for later usage, peerJS server url for example
	//FPS and resolution default settings as well
	//your logo or anything else, and more and more love.
	Version string `json:"version"`
}

type Payload struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
}

var clientMux = sync.Mutex{}
var clientList = map[string]Client{}
var settings = Settings{Version: "2.0"}
var upgrader = websocket.Upgrader{}

func Run() {
	http.HandleFunc("/settings.js", settingsHandler)
	http.Handle("/", http.FileServer(http.Dir("./public")))

	http.HandleFunc("/ws", websocketHandler)
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}

}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	defer c.Close()
	for {
		messageType, message, err := c.ReadMessage()
		log.Println("Messagetype:", messageType)
		if err != nil {
			log.Println("read:", err)
			go checkWhoisDead()
			break
		}

		payload := Payload{}
		err = json.Unmarshal(message, &payload)
		if err != nil {
			log.Println("Error while trying to unmarshall")
		}
		arguments := payload.Data.(map[string]interface{})

		switch payload.Type {
		case "login":
			onLogin(c, arguments["peerId"].(string))
		case "message":
			onMessage(arguments["peerId"].(string), arguments["message"].(string))
		case "call-me":
			onCallingRequest(arguments["from"].(string), arguments["to"].(string))
		case "stream-status-changed":
			onStreamStatusChanged(arguments["peerId"].(string), payload)
		}

		log.Printf("recv: %s", message)
	}
}

func onStreamStatusChanged(peerId string, payload Payload) {
	broadcastExcept(peerId, payload)
}

func onCallingRequest(callingSource string, callingDestination string) {
	clientMux.Lock()
	defer clientMux.Unlock()
	if _, ok := clientList[callingDestination]; !ok {
		return
	}
	if _, ok := clientList[callingSource]; !ok {
		return
	}
	clientList[callingDestination].Conn.WriteJSON(Payload{"call-request", clientList[callingSource]})
}

func onMessage(PeerId string, Content string) {
	clientMux.Lock()
	Avatar := clientList[PeerId].Avatar
	defer clientMux.Unlock()
	broadcastExcept(PeerId, Payload{"message", M{
		"peerId":  PeerId,
		"message": Content,
		"avatar":  Avatar,
	}})
}

func checkWhoisDead() {
	//legal delay for removing the user left, in case of refresh
	clientMux.Lock()
	var peerId string
	for _, c := range clientList {
		if err := c.Conn.WriteJSON(Payload{Type: "ping"}); err != nil {
			peerId = c.PeerId
			break
		}
	}
	clientMux.Unlock()
	if len(peerId) > 0 {
		clientMux.Lock()
		clientList[peerId].Conn.Close()
		delete(clientList, peerId)
		clientMux.Unlock()
		broadcast(Payload{"user-left", peerId})
	}

}

func broadcast(payload Payload) {
	broadcastExcept("", payload)
}
func broadcastExcept(peerId string, payload Payload) {
	clientMux.Lock()
	defer clientMux.Unlock()
	log.Printf("broadcast: %v to all except %v", payload.Type, peerId)
	for _, client := range clientList {
		if client.PeerId == peerId {
			continue
		}
		_ = client.Conn.WriteJSON(payload)
	}
}

// onLogin websocket Event : returns logged with the client's information, then starts a loop check
func onLogin(c *websocket.Conn, peerId string) {
	clientMux.Lock()
	clientList[peerId] = Client{c, peerId, PickOneAvatar()}

	loggedInUserPayload := struct {
		User     Client            `json:"user"`
		UserList map[string]Client `json:"userList"`
	}{
		clientList[peerId],
		clientList,
	}
	c.WriteJSON(Payload{"logged", loggedInUserPayload})
	newUser := clientList[peerId]
	clientMux.Unlock()

	broadcastExcept(peerId, Payload{"user-joined", newUser})
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
	clientMux.Lock()
	defer clientMux.Unlock()
	homeTemplate := template.Must(template.ParseFiles("templates/index.js"))
	marshaled, _ := json.Marshal(settings)
	err := homeTemplate.Execute(w, string(marshaled))
	if err != nil {
		log.Fatal(err)
	}

}
