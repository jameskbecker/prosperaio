package client

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"../log"
)

//FormatProxy ...
func FormatProxy(proxy string) *url.URL {
	splitProxy := strings.Split(proxy, ":")

	if len(splitProxy) < 2 {

	}

	ip := splitProxy[0]
	port := splitProxy[1]
	user := ""
	pass := ""
	if len(splitProxy) == 4 {
		user = splitProxy[2]
		pass = splitProxy[3]
	}

	pURL := ""
	if user != "" && pass != "" {
		pURL = "http://" + user + ":" + pass + "@" + ip + ":" + port
	} else {
		pURL = "http://" + ip + ":" + port
	}

	output, _ := url.Parse(pURL)
	return output
}

//TestProxy ...
func TestProxy(data string, wg *sync.WaitGroup) {
	c, err := Create(data)
	if err != nil {
		fmt.Println(log.Red + "Failed(E1) - " + data + log.Reset)
		wg.Done()
		return
	}

	req, err := http.NewRequest("GET", "https://wearestrap.com/es/", nil)
	if err != nil {
		fmt.Println(log.Red + "Failed(E2) - " + data + log.Reset)
		wg.Done()
		return
	}

	res, err := c.Do(req)
	if err != nil {
		fmt.Println(log.Red + "Bad - " + data + log.Reset)
		wg.Done()
		return
	}

	if res.StatusCode < 200 { //1XX
		fmt.Println(log.Yellow + res.Status + " - " + data + log.Reset)

	} else if res.StatusCode < 300 { //2XX
		fmt.Println(log.Green + res.Status + " - " + data + log.Reset)

	} else if res.StatusCode < 400 { //3XX
		fmt.Println(log.Yellow + res.Status + " - " + data + log.Reset)

	} else {
		fmt.Println(log.Red + res.Status + " - " + data + log.Reset)
	}

	wg.Done()
}

//RotateProxy ...
func RotateProxy(data []string) []string {
	return append(data[1:], data[0])
}
