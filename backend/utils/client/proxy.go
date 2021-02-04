package client

import (
	"fmt"
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
	c := Create(data, 0)

	req, err := http.NewRequest("GET", "https://wearestrap.com/es/", nil)
	if err != nil {
		color.Red(fmt.Sprintf("%-25s", "FAILED(E1)") + data)
		wg.Done()
		return
	}

	res, err := c.Do(req)
	if err != nil {
		color.Red(fmt.Sprintf("%-25s", "BAD") + data)
		wg.Done()
		return
	}

	if res.StatusCode < 200 { //1XX
		color.Yellow(fmt.Sprintf("%-25s", res.Status) + data)

	} else if res.StatusCode < 300 { //2XX
		color.Green(fmt.Sprintf("%-25s", res.Status) + data)

	} else if res.StatusCode < 400 { //3XX
		color.Yellow(fmt.Sprintf("%-25s", res.Status) + data)

	} else {
		color.Red(fmt.Sprintf("%-25s", res.Status) + data)
	}

	wg.Done()
}

//RotateProxy ...
func RotateProxy(data []string) []string {
	return append(data[1:], data[0])
}
