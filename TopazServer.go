package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"html/template"
	"log"
	"net/http"
)

type Client struct {
	Conn   *websocket.Conn `json:"-"`
	PeerId string          `json:"peerId"`
}

type Payload struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

var clientList map[string]Client

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
			break
		}

		payload := Payload{}
		err = json.Unmarshal(message, &payload)
		if err != nil {
			log.Println("Error while trying to unmarshall")
		}

		if payload.Type == "login" {

		}

		log.Printf("recv: %s", message)
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	homeTemplate := template.Must(template.ParseFiles("templates/index.html"))

	err := homeTemplate.Execute(w, clientList)
	if err != nil {
		log.Fatal(err)
	}

}
