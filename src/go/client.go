package main

import (
	"encoding/json"
	"fmt"
	"net"
	"sync"
)

var c net.Conn

const blue = "\u001b[34m"
const bold = "\u001b[1m"
const reset = "\u001b[0m"

func main() {
	fmt.Println(logo())
	fmt.Println(bold + "Welcome to ProsperAIO!")
	fmt.Println("Initialising...")
	var wg sync.WaitGroup
	wg.Add(1)

	//fmt.Println("Connecting to Server...")
	// conn, err := net.Dial("unix", "/tmp/prosperaio.sock")
	// if err != nil {
	// 	log.Println(err.Error())
	// }
	// c = conn
	// go reader(c)
	// //go writer(c)
	// time.Sleep(3000 * time.Millisecond)

	defer wg.Wait()

}

type startTask struct {
	Site string `json:"site"`
}

func reader(r net.Conn) {
	buf := make([]byte, 1024)
	for {
		n, err := r.Read(buf[:])
		if err != nil {
			return
		}
		var message startTask
		json.Unmarshal(buf[0:n], &message)

		switch message.Site {
		case "kickz":
			fmt.Println("Starting Kickz Tasks")

			break
		case "outback":
			fmt.Println("Starting Outback Tasks")
			break
		case "titolo":
			fmt.Println("Starting Titolo Tasks")
			break
		}
	}

	//}
}

func logo() string {
	return `
________________________________________________________________________________________` + blue + `

8888888b.                                                        d8888 8888888 .d88888b.  
888   Y88b                                                      d88888   888  d88P" "Y88b 
888    888                                                     d88P888   888  888     888 
888   d88P 888d888 .d88b.  .d88888b 88888b.   .d88b.  888d888 d88P 888   888  888     888 
8888888P"  888P"  d88""88b 88K      888 "88b d8P  Y8b 888P"  d88P  888   888  888     888 
888        888    888  888 "Y8888b. 888  888 88888888 888   d88P   888   888  888     888 
888        888    Y88..88P      X88 888 d88P Y8b.     888  d8888888888   888  Y88b. .d88P 
888        888     "Y88P"  888888P' 88888P"   "Y8888  888 d88P     888 8888888 "Y88888P"  
                                    888                                                
                                    888
                                    888                                                 ` + reset + `
________________________________________________________________________________________
`
}

// func ipc(message IPCMessage) {
// 	switch message.Channel {
// 	case "main.connected":
// 		log.Println("Connected to Node Process")
// 		break
// 	case "task.run":
// 		go runTask(message.Args)
// 		break

// 	default:
// 		log.Println("[GO] Unable to read IPC Message on channel: " + message.Channel)
// 	}
// }

// func runTask(input TaskInput) {
// 	log.Println("[IPC] - task.run - " + input.ProfileName)

// 	monitordelay := time.Duration(input.MonitorDelay) * time.Millisecond
// 	errordelay := time.Duration(input.ErrorDelay) * time.Millisecond
// 	timeoutdelay := time.Duration(input.TimeoutDelay) * time.Millisecond

// 	cookieJar, err := cookiejar.New(nil)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	transport := &http.Transport{
// 		TLSClientConfig: getTLSConfig(),
// 	}

// 	proxyString := ""
// 	if proxyString != "" {
// 		proxyURL, err := url.Parse(proxyString)
// 		if err != nil {
// 			log.Println(err.Error())
// 		} else {
// 			transport.Proxy = http.ProxyURL(proxyURL)
// 		}

// 	}

// 	client := http.Client{
// 		Jar:       cookieJar,
// 		Timeout:   timeoutdelay,
// 		Transport: transport,
// 	}

// 	switch input.Site {
// 	// case "supreme-us", "supreme-eu", "supreme-jp":
// 	// 	task := getSupremeOptions(&input)
// 	// 	task.Client = client
// 	// 	task.Socket = &c
// 	// 	task.MonitorDelay = monitordelay
// 	// 	task.ErrorDelay = errordelay

// 	// 	//go supreme.Run(task)
// 	// 	break

// 	default:
// 		log.Println("No Site Specified", input)
// 	}
// }

// func getTLSConfig() *tls.Config {
// 	return &tls.Config{
// 		MinVersion:               tls.VersionTLS12,
// 		CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
// 		PreferServerCipherSuites: true,
// 		CipherSuites: []uint16{
// 			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
// 			tls.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
// 			tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
// 			tls.TLS_RSA_WITH_AES_256_CBC_SHA,
// 		},
// 	}
// }

// func getSupremeOptions(input *TaskInput) *supreme.InputOptions {
// 	return &supreme.InputOptions{
// 		ID:            "testID",
// 		Keywords:      input.ProductInput[0].Keywords,
// 		StyleKeywords: input.ProductInput[0].Style,
// 		SizeKeywords:  input.ProductInput[0].Size,
// 		Category:      input.ProductInput[0].Category,
// 		Quantity:      input.ProductInput[0].Qty,
// 	}
// }
