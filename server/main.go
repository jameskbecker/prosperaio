package main

import (
	"crypto/tls"
	"log"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/asticode/go-astilectron"
)

type ipcMessage struct {
	Channel string
	Args    map[string]string
}

const red = "\u001b[31m"
const green = "\u001b[32m"
const yellow = "\u001b[33m"
const cyan = "\u001b[36m"
const bold = "\033[1m"
const reset = "\033[0m"

var socketFile = "/tmp/prosperaio.sock"

func main() {

	var wg sync.WaitGroup
	wg.Add(1)

	go runTask(&wg, "0001")
	defer wg.Wait()

	// os.Remove(socketFile)
	// listener, err := net.Listen("unix", socketFile)
	// if err != nil {
	// 	log.Fatalf("Unable to listen on socket file %s: %s", socketFile, err)
	// }

	// log.Println("Listening at: " + socketFile)
	// defer listener.Close()

	// for {
	// 	conn, err := listener.Accept()
	// 	if err != nil {
	// 		log.Fatalf("Error on accept: %s", err)
	// 	}
	// 	go handleConnection(conn)
	// }
}

// func handleConnection(c net.Conn) {
// 	received := make([]byte, 0)
// 	for {
// 		buf := make([]byte, 512)
// 		count, err := c.Read(buf)
// 		received = append(received, buf[:count]...)
// 		if err != nil {
// 			if err != io.EOF {
// 				log.Println("Error on read: ", err)
// 			}
// 			break
// 		}
// 		var message ipcMessage
// 		decoder := json.NewDecoder(strings.NewReader(string(received)))
// 		decoder.Decode(&message)

// 		ipc(message)
// 	}
// }

// func ipc(message ipcMessage) {
// 	switch message.Channel {
// 	case "task.run":
// 		go runTask(message.Args["id"])
// 		break

// 	default:
// 		log.Println(message.Channel)
// 	}
// }

func runTask(wg *sync.WaitGroup, id string) {
	site := "supreme-eu"
	proxy := ""
	log.Println("Running Task: " + id)

	var task Task
	task.Debug = log.New(os.Stdout, string(log.LstdFlags)+green+"[TASK] ["+id+"] ["+site+"] ", 0)
	task.Warn = log.New(os.Stdout, yellow+"[TASK] ["+id+"] ["+site+"] ", log.LstdFlags|log.Lmicroseconds)
	task.Info = log.New(os.Stdout, cyan+"[TASK] ["+id+"] ["+site+"] ", log.LstdFlags|log.Lmicroseconds)
	task.Err = log.New(os.Stdout, red+"[TASK] ["+id+"] ["+site+"] ", log.LstdFlags|log.Lmicroseconds)

	task.MonitorDelay = time.Duration(1000 * time.Millisecond)
	task.ErrorDelay = time.Duration(1000 * time.Millisecond)

	task.Profile = &Data{
		ProfileName: "Test",
		Billing: &Contact{
			FirstName: "James",
			LastName:  "Becker",
			Email:     "jameskieranbecker@gmail.com",
			Telephone: "015903762209",
			Address1:  "Josph Roth Str 110",
			Address2:  "",
			City:      "Bonn",
			Zip:       "53175",
			Country:   "DE",
			State:     "",
		},
		Payment: &Payment{
			Type:       "visa",
			CardNumber: "4242 4242 4242 4242",
			ExpMonth:   "12",
			ExpYear:    "2024",
			Cvv:        "340",
		},
	}

	task.InputKW = "+tagless,+tee"
	task.InputStyle = "+black"
	task.InputCat = "Accessories"
	task.InputSize = "large"
	task.InputQty = "1"

	task.BaseURL = "https://www.supremenewyork.com"
	task.UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/604.1"

	//var cookieJar http.CookieJar
	cookieJar, err := cookiejar.New(nil)
	if err != nil {
		log.Println(err)
	}

	cfg := &tls.Config{
		MinVersion:               tls.VersionTLS12,
		CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
		PreferServerCipherSuites: true,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
			tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_RSA_WITH_AES_256_CBC_SHA,
		},
	}

	//Create Client
	task.Client = http.Client{
		Timeout: 5000 * time.Millisecond,
		Jar:     cookieJar,
		Transport: &http.Transport{
			TLSClientConfig: cfg,
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			//log.Println(err.Error())
			return http.ErrUseLastResponse
		},
	}
	if proxy != "" {
		proxyURL, err := url.Parse(proxy)
		if err != nil {
			task.Err.Println(err.Error())
		}
		task.Client.Transport = &http.Transport{Proxy: http.ProxyURL(proxyURL)}
	}

	erro := task.GetHomePage()

	if erro != nil {
		log.Println(erro.Error())
	}

	// for { //Fetch Stock Data
	// 	task.Warn.Println("Fetching Stock Data")
	// 	err := task.GetStockData("shop.json")
	// 	if err != nil {
	// 		task.Err.Println(err.Error())
	// 		time.Sleep(task.MonitorDelay)
	// 	} else {
	// 		task.Debug.Println("Found Product Data!")
	// 		task.Info.Println("Product Name: " + task.ProductName)
	// 		task.Info.Println("Product ID: " + strconv.Itoa(task.ProductID))
	// 		break
	// 	}
	// }

	// for { //Fetch Style Data
	// 	task.Warn.Println("Fetching Style Data")
	// 	err := task.GetProductData()
	// 	if err != nil {
	// 		task.Err.Println(err.Error())
	// 		time.Sleep(task.MonitorDelay)
	// 	} else {
	// 		task.Debug.Println("Found Style Data!")
	// 		task.Info.Println("Style Name: " + task.StyleName)
	// 		task.Info.Println("Style ID: " + strconv.Itoa(task.StyleID))
	// 		task.Info.Println("Size Name: " + task.SizeName)
	// 		task.Info.Println("Size ID: " + strconv.Itoa(task.SizeID))
	// 		break
	// 	}

	// }

	// for { //Add to Cart
	// 	task.Warn.Println("Adding to Cart")
	// 	err := task.AddToCart()
	// 	if err != nil {
	// 		task.Err.Println(err.Error())
	// 		time.Sleep(task.ErrorDelay)
	// 	} else {
	// 		task.Debug.Println("Added to Cart!")
	// 		task.Info.Println("Cart Response: " + task.CartResponse)
	// 		task.Info.Println("Cookie Sub: " + task.CookieSub)
	// 		break
	// 	}

	// }

	// for { //Get Totals
	// 	task.Warn.Println("Fetching Totals")
	// 	err := task.GetMobileTotals()
	// 	if err != nil {
	// 		task.Err.Println(err.Error())
	// 		time.Sleep(task.ErrorDelay)
	// 	} else {
	// 		task.Debug.Println("Fetched Totals!")
	// 		task.Info.Println("Order Total: " + task.OrderTotal)
	// 		task.Info.Println("Cardinal JWT: " + task.CardinalJWT[:15] + "[...]")
	// 		break
	// 	}

	// }

	// for { //Initialise 3DS
	// 	task.Warn.Println("Initialising 3DS")
	// 	err := task.InitCardinal()

	// 	if err != nil {
	// 		log.Println(err.Error())
	// 	} else {
	// 		task.Info.Println("Cardinal ID: " + task.CardinalID)
	// 		break
	// 	}
	// }

	// for { //Post Checkout
	// 	task.Warn.Println("Submitting Checkout")
	// 	err := task.PostCheckout()
	// 	if err != nil {
	// 		task.Err.Println(err.Error())
	// 	} else {
	// 		task.Info.Println("Checkout Status: " + task.CheckoutResponse.Status)
	// 		task.Info.Println("Order Number: " + strconv.Itoa(task.CheckoutResponse.ID))
	// 		break
	// 	}

	// }

	wg.Done()

}

func setStatus(w *astilectron.Window, message string, id string) {
	w.SendMessage(`{"name":"task.setStatus", "message": "` + message + `", "id": "` + id + `"}`)
}
