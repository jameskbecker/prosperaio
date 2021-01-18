package client

import (
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strings"
)

//Create a new instance of client
func Create(proxy string) (http.Client, error) {
	client := http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	jar, err := cookiejar.New(nil)
	if err != nil {
		return client, err
	}

	client.Jar = jar

	if proxy != "" {
		proxyURL := formatProxy(proxy)
		client.Transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	}

	return client, nil
}

func formatProxy(proxy string) *url.URL {
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
