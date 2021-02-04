package client

import (
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"time"
)

//Create a new instance of client
func Create(proxy string, maxRedirects int) http.Client {
	client := http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) > maxRedirects {
				return http.ErrUseLastResponse
			}
			return nil
		},
		Timeout: 5000 * time.Millisecond,
	}
	jar, _ := cookiejar.New(nil)
	client.Jar = jar

	if proxy != "" {
		proxyURL := FormatProxy(proxy)
		client.Transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	}

	return client
}

//GetJSONCookies ...
func GetJSONCookies(uri *url.URL, c *http.Client) (string, error) {
	rawCookies := c.Jar.Cookies(uri)
	cookies := []ExtensionCookie{}
	for _, v := range rawCookies {
		cookies = append(cookies, ExtensionCookie{
			Name:  v.Name,
			Value: v.Value,
			Path:  "/",
			URL:   uri.String(),
		})
	}
	jsonCookies, err := json.Marshal(cookies)
	if err != nil {
		return "", err
	}

	encodedJSONCookies := base64.URLEncoding.EncodeToString(jsonCookies)
	return encodedJSONCookies, nil
}

//Decompress compressed response body TODO: add deflate and brotli
func Decompress(res *http.Response) (io.ReadCloser, error) {
	switch res.Header.Get("Content-Encoding") {
	case "gzip":
		zr, _ := gzip.NewReader(res.Body)
		return gzreadCloser{zr, res.Body}, nil
	}
	return res.Body, nil
}

type gzreadCloser struct {
	*gzip.Reader
	io.Closer
}

func (gz gzreadCloser) Close() error {
	return gz.Closer.Close()
}
