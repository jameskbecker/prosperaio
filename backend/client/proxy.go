package client

import (
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/fatih/color"
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
		color.Red("Failed(E1) - " + data)
		wg.Done()
		return
	}

	req, err := http.NewRequest("GET", "https://wearestrap.com/es/", nil)
	if err != nil {
		color.Red("Failed(E2) - " + data)
		wg.Done()
		return
	}

	res, err := c.Do(req)
	if err != nil {
		color.Red("Bad - " + data)
		wg.Done()
		return
	}

	if res.StatusCode < 200 { //1XX
		color.Yellow(res.Status + " - " + data)

	} else if res.StatusCode < 300 { //2XX
		color.Green(res.Status + " - " + data)

	} else if res.StatusCode < 400 { //3XX
		color.Yellow(res.Status + " - " + data)

	} else {
		color.Red(res.Status + " - " + data)
	}

	wg.Done()
}

//RotateProxy ...
func RotateProxy(data []string) []string {
	return append(data[1:], data[0])
}
