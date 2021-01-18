package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"time"
)

type M map[string]interface{}
type Client struct {
	Conn     *websocket.Conn `json:"-"`
	PeerId   string          `json:"peerId"`
	Username *string         `json:"username"`
}
type Settings struct {
	//for later usage, peerJS server url for example
	Version string
}

type Payload struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
}

var clientList = map[string]Client{}
var settings = Settings{Version: "2.0"}
var upgrader = websocket.Upgrader{}

func main() {
	http.HandleFunc("/", homeHandler)
	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("./public"))))

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
		}

		log.Printf("recv: %s", message)
	}
}

func onMessage(PeerId string, Content string) {

	broadcastExcept(PeerId, Payload{"message", M{
		"peerId":   PeerId,
		"message":  Content,
		"username": clientList[PeerId].Username,
	}})
}

func checkWhoisDead() {
	//legal delay for removing the user left, in case of refresh

	var peerId string
	for _, c := range clientList {
		if err := c.Conn.WriteJSON(Payload{Type: "ping"}); err != nil {
			peerId = c.PeerId
			break
		}
	}
	if len(peerId) > 0 {
		clientList[peerId].Conn.Close()
		delete(clientList, peerId)
		broadcast(Payload{"user-left", peerId})

		// This is in case of only refreshing the page
		// The quick'n'dirty solution to tell the refreshed user that the other guy's not here anymore.
		time.Sleep(3 * time.Second)
		broadcast(Payload{"user-left", peerId})
	}

}

func broadcast(payload Payload) {
	broadcastExcept("", payload)
}
func broadcastExcept(peerId string, payload Payload) {
	for _, client := range clientList {
		if client.PeerId == peerId {
			continue
		}
		_ = client.Conn.WriteJSON(payload)
	}
}

// onLogin websocket Event : returns logged with the client's information, then starts a loop check
func onLogin(c *websocket.Conn, peerId string) {
	clientList[peerId] = Client{c, peerId, randomUsername()}
	c.WriteJSON(Payload{"logged", clientList[peerId]})
	broadcastExcept(peerId, Payload{"user-joined", clientList[peerId]})
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	homeTemplate := template.Must(template.ParseFiles("templates/index.html"))
	content := struct {
		Clients  map[string]Client
		Settings Settings
	}{Clients: clientList, Settings: settings}
	err := homeTemplate.Execute(w, content)
	if err != nil {
		log.Fatal(err)
	}

}

/**
This part is about Generating random usernames
*/
type wordList []string

func (l wordList) pickOne() string {
	return l[rand.Intn(len(l))]
}
func randomUsername() *string {
	animal := wordList{"Bear", "Panda", "Koala", "Bunny", "Fox", "Unicorn", "Horse", "Kitty", "Elephant"}
	title := wordList{"Miss", "Mr.", "Doctor", "MC", "Polar", "Sea", "Funny"}
	adjective := wordList{"Funny", "Fantastic", "Awesome", "Pretty", "Little", "Big", "Giant", "Amusing", "Aroused", "Dishonored", "Asymptomatic", "Sick", "Lonely"}
	response := fmt.Sprintf("%v %v %v", adjective.pickOne(), title.pickOne(), animal.pickOne())
	return &response
}
