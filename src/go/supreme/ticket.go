package supreme

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"
)

//GetTicket ticket.wasm file
func (t *InputOptions) GetTicket() ([]byte, error) {
	request, err := http.NewRequest("GET", "https://www.supremenewyork.com/ticket.wasm", nil)

	if err != nil {
		return nil, err
	}

	request.Header.Add("Accept", "application/wasm")
	request.Header.Add("User-Agent", t.UserAgent)

	response, err := t.Client.Do(request)

	if err != nil {
		return nil, err
	}

	body, err := ioutil.ReadAll(response.Body)

	if err != nil {
		return nil, err
	}

	return body, nil
}

//GenerateTicket ...
func (t *InputOptions) GenerateTicket(wg *sync.WaitGroup) {
	log.Println("Requesting Ticket")
	messageStruct := &ticketRequest{
		Channel: "ticket.generate",
		Path:    t.TicketPath,
		Cookies: t.CookieString,
	}

	message, err := json.Marshal(messageStruct)

	if err != nil {
		log.Println(err.Error())
	}

	(*t.Socket).Write(message)
	defer wg.Done()
	time.Sleep(3 * time.Second)

}

type ticketRequest struct {
	Channel string `json:"channel"`
	Path    string `json:"ticketPath"`
	Cookies string `json:"cookies"`
}
