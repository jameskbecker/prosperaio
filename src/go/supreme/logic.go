package supreme

import (
	"io/ioutil"
	"log"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const red = "\u001b[31m"
const green = "\u001b[32m"
const yellow = "\u001b[33m"
const cyan = "\u001b[36m"
const bold = "\033[1m"
const reset = "\033[0m"

//Run ...
func Run(task *InputOptions) error {
	log.Println("Running Task: " + task.ID)

	url, err := url.Parse("http://127.0.0.1:8000")
	if err != nil {
		return err
	}

	task.BaseURL = url
	task.UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"

	task.stockProcess()
	task.productProcess()
	task.fetchTicketProcess()
	defer os.Remove(task.TicketPath)
	task.generateTicketProcess("1")
	task.atcProcess()
	task.generateTicketProcess("2")
	task.checkoutProcess()

	return nil

}

func (t *InputOptions) stockProcess() {
	for {
		log.Println("Fetching Stock Data")
		err := t.Stock("shop.json")

		if err != nil {
			switch err.Error() {
			case "ESTATUS":
				log.Println("Unexpected Response Status")
				break
			case "ENOCAT":
				log.Println("Category Not Found")
				break
			case "ECLOSED":
				log.Println("Webstore Closed")
			case "ENOPDCT":
				log.Println("Product Not Found")
				break
			default:
				log.Println(err.Error())
			}

			time.Sleep(t.MonitorDelay)
			continue
		}
		break
	}
}

func (t *InputOptions) productProcess() {
	for {
		log.Println("Fetching Style Data")
		err := t.Product()
		if err != nil {
			log.Println(err.Error())
			time.Sleep(t.MonitorDelay)
			continue
		}

		log.Println("Found Style Data!")
		log.Println("Style Name: " + t.StyleName)
		log.Println("Style ID: " + strconv.Itoa(t.StyleID))
		log.Println("Size Name: " + t.SizeName)
		log.Println("Size ID: " + strconv.Itoa(t.SizeID))
		break
	}
}

func (t *InputOptions) atcProcess() {
	for {
		log.Println("Adding to Cart")
		err := t.AddToCart()
		if err != nil {
			log.Println(err.Error())
			time.Sleep(t.ErrorDelay)
			continue
		}

		log.Println("Added to Cart!")
		log.Println("Cart Response: " + t.CartResponse)
		log.Println("Cookie Sub: " + t.CookieSub)
		break
	}
}

func (t *InputOptions) fetchTicketProcess() {
	for {
		log.Println("Fetching Ticket")
		ticketBytes, err := t.GetTicket()

		if err != nil {
			log.Println(err.Error())
			time.Sleep(t.ErrorDelay)
			continue
		}

		ticket, err := ioutil.TempFile("", "ticket")
		if err != nil {
			log.Println(err.Error())
			continue
		}

		t.TicketPath = ticket.Name()

		_, err = ticket.Write(ticketBytes)
		if err != nil {
			log.Println(err.Error())
			continue
		}

		break
	}
}

func (t *InputOptions) generateTicketProcess(typ string) {
	log.Println("Generating Ticket #" + typ)
	url, _ := url.Parse("http://127.0.0.1:8000")
	cookies := t.Client.Jar.Cookies(url)
	var cookieValues []string

	for _, v := range cookies {
		cookieValues = append(cookieValues, v.Name+"="+v.Value+v.Path)
	}

	t.CookieString = strings.Join(cookieValues, "; ")

	var wg sync.WaitGroup
	wg.Add(1)
	t.GenerateTicket(&wg)
	wg.Wait()

}

func (t *InputOptions) totalsProcess() {
	for {
		log.Println("Fetching Totals")
		err := t.Totals()
		if err != nil {
			log.Println(err.Error())
			time.Sleep(t.ErrorDelay)
		} else {
			log.Println("Fetched Totals!")
			log.Println("Order Total: " + t.OrderTotal)
			log.Println("Cardinal JWT: " + t.CardinalJWT[:15] + "[...]")
			break
		}

	}
}

func (t *InputOptions) threeDSProcess() {
	for {
		log.Println("Initialising 3DS")
		err := t.StartCardinal()

		if err != nil {
			log.Println(err.Error())
		} else {
			log.Println("Cardinal ID: " + t.CardinalID)
			break
		}
	}
}

func (t *InputOptions) checkoutProcess() {
	for {
		log.Println("Submitting Checkout")
		err := t.Submit()
		if err != nil {
			log.Println(err.Error())
		} else {
			log.Println("Checkout Status: " + t.CheckoutResponse.Status)
			log.Println("Order Number: " + strconv.Itoa(t.CheckoutResponse.ID))
			break
		}
	}
}

func setStatus(c net.Conn, id string, message string, level string) {
	c.Write([]byte(`{
		"channel": "t.setStatus", 
		"message": "` + message + `", 
		"type":     "` + level + `",
		"id":      "` + id + `"};`))
}
