package main

import (
	"compress/gzip"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	// "github.com/google/brotli/go/cbrotli"
)

func (t *Task) GetHomePage() error {
	request, err := http.NewRequest("GET", "https://www.off---white.com", nil)

	if err != nil {
		return err
	}

	request.Header.Add("upgrade-insecure-requests", "1")
	request.Header.Add("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36")
	request.Header.Add("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	request.Header.Add("sec-fetch-site", "none")
	request.Header.Add("sec-fetch-mode", "navigate")
	request.Header.Add("sec-fetch-user", "?1")
	request.Header.Add("sec-fetch-dest", "document")
	request.Header.Add("accept-encoding", "gzip, deflate")
	request.Header.Add("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	response, err := t.Client.Do(request)

	if err != nil {
		return err
	}

	var reader io.Reader

	switch response.Header.Get("Content-Encoding") {
	// case "br":
	// 	r, err := cbrotli.NewReader(response.Body)
	// 	if err != nil {
	// 		return err
	// 	}
	// 	reader = r
	// 	break

	case "gzip":
		r, err := gzip.NewReader(response.Body)
		if err != nil {
			return err
		}
		reader = r
		break
	default:
		log.Println(response.Header.Get("Content-Encoding"))
		reader = response.Body
	}

	body, err := ioutil.ReadAll(reader)

	if err != nil {
		return err
	}

	log.Println(string(body))
	log.Println(response.Header)

	return nil
}
