package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
	
)

func main() {
	
	var wg sync.WaitGroup
	wg.Add(1)
	fmt.Println("Connecting to Server...")
	c, err := net.Dial("unix", "/tmp/prosperaio.sock")
	if err != nil {
		log.Println(err.Error())
	}
	go reader(c)
	//go writer(c)
	defer wg.Wait()

}

func reader(r net.Conn) {
	buf := make([]byte, 1024)
	for {
		n, err := r.Read(buf[:])
		if err != nil {
			return
		}
		var message IPCMessage
		json.NewDecoder(strings.NewReader(string(buf[0:n]))).Decode(&message)

		ipc(message)
	}

	//}
}

func ipc(message IPCMessage) {
	switch message.Channel {
	case "main.connected":
		log.Println("Connected to Node Process")
		break
	case "task.run":
		var decodedArgs TaskInput
		json.NewDecoder(strings.NewReader(message.Args)).Decode(&decodedArgs)
		log.Println("[GO] IPC - task.run - " + decodedArgs.ProfileName)

		switch decodedArgs.Site {
		case "supreme-us", "supreme-eu", "supreme-jp":
			go runSupremeTask(&decodedArgs, "testIDs")
			break
		}

		break

	default:
		log.Println("[GO] Unable to read IPC Message on channel: " + message.Channel)
	}
}

func runSupremeTask(input *TaskInput, id string) {
	const red = "\u001b[31m"
	const green = "\u001b[32m"
	const yellow = "\u001b[33m"
	const cyan = "\u001b[36m"
	const bold = "\033[1m"
	const reset = "\033[0m"

	site := "supreme-eu"
	proxy := ""

	var task Task

	task.Debug = log.New(os.Stdout, green+"[ GO ] [TASK] ["+id+"] ["+site+"] ", 0)
	task.Warn = log.New(os.Stdout, yellow+"[ GO ] [TASK] ["+id+"] ["+site+"] ", 0)
	task.Info = log.New(os.Stdout, cyan+"[ GO ] [TASK] ["+id+"] ["+site+"] ", 0)
	task.Err = log.New(os.Stdout, red+"[ GO ] [TASK] ["+id+"] ["+site+"] ", 0)
	task.Info.Println("Running Task: " + id)

	task.MonitorDelay = time.Duration(input.MonitorDelay) * time.Millisecond
	task.ErrorDelay = time.Duration(input.ErrorDelay) * time.Millisecond

	task.Profile = &Profile{
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
	supreme.Add()
	task.InputKW = input.ProductInput[0].Keywords
	task.InputStyle = input.ProductInput[0].Style
	task.InputCat = input.ProductInput[0].Category
	task.InputSize = input.ProductInput[0].Size
	task.InputQty = input.ProductInput[0].Qty

	// task.BaseURL = "https://www.supremenewyork.com"
	task.BaseURL = "http://127.0.0.1:8000"
	task.UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"

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
	supreme.cart
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
	supreme.
	//erro := task.GetHomePage()

	// if erro != nil {
	// 	log.Println(erro.Error())
	// }

	for { //Fetch Stock Data
		task.Warn.Println("Fetching Stock Data")
		err := task.GetStockData("shop.json")
		if err != nil {
			task.Err.Println(err.Error())
			time.Sleep(task.MonitorDelay)
		} else {
			task.Debug.Println("Found Product Data!")
			task.Info.Println("Product Name: " + task.ProductName)
			task.Info.Println("Product ID: " + strconv.Itoa(task.ProductID))
			break
		}
	}

	for { //Fetch Style Data
		task.Warn.Println("Fetching Style Data")
		err := task.GetProductData()
		if err != nil {
			task.Err.Println(err.Error())
			time.Sleep(task.MonitorDelay)
		} else {
			task.Debug.Println("Found Style Data!")
			task.Info.Println("Style Name: " + task.StyleName)
			task.Info.Println("Style ID: " + strconv.Itoa(task.StyleID))
			task.Info.Println("Size Name: " + task.SizeName)
			task.Info.Println("Size ID: " + strconv.Itoa(task.SizeID))
			break
		}

	}

	for { //Add to Cart
		task.Warn.Println("Adding to Cart")
		err := task.AddToCart()
		if err != nil {
			task.Err.Println(err.Error())
			time.Sleep(task.ErrorDelay)
		} else {
			task.Debug.Println("Added to Cart!")
			task.Info.Println("Cart Response: " + task.CartResponse)
			task.Info.Println("Cookie Sub: " + task.CookieSub)
			break
		}

	}

	for { //Get Totals
		task.Warn.Println("Fetching Totals")
		err := task.GetMobileTotals()
		if err != nil {
			task.Err.Println(err.Error())
			time.Sleep(task.ErrorDelay)
		} else {
			task.Debug.Println("Fetched Totals!")
			task.Info.Println("Order Total: " + task.OrderTotal)
			task.Info.Println("Cardinal JWT: " + task.CardinalJWT[:15] + "[...]")
			break
		}

	}

	for { //Initialise 3DS
		task.Warn.Println("Initialising 3DS")
		err := task.InitCardinal()

		if err != nil {
			log.Println(err.Error())
		} else {
			task.Info.Println("Cardinal ID: " + task.CardinalID)
			break
		}
	}

	for { //Post Checkout
		task.Warn.Println("Submitting Checkout")
		err := task.PostCheckout()
		if err != nil {
			task.Err.Println(err.Error())
		} else {
			task.Info.Println("Checkout Status: " + task.CheckoutResponse.Status)
			task.Info.Println("Order Number: " + strconv.Itoa(task.CheckoutResponse.ID))
			break
		}

	}

	//wg.Done()

}

func setStatus(c net.Conn, message string, id string) {
	c.Write([]byte(`{"name":"task.setStatus", "message": "` + message + `", "id": "` + id + `"}`))
}
