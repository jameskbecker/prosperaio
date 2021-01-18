package client

import (
	"net/http"
	"net/http/cookiejar"
	"time"
)

//Create a new instance of client
func Create(proxy string) (http.Client, error) {
	client := http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Timeout: 5000 * time.Millisecond,
	}
	jar, err := cookiejar.New(nil)
	if err != nil {
		return client, err
	}

	client.Jar = jar

	if proxy != "" {
		proxyURL := FormatProxy(proxy)
		client.Transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	}

	return client, nil
}
