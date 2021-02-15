package client

import (
	"compress/flate"
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"time"

	"github.com/fatih/color"
	tls "github.com/refraction-networking/utls"
	"github.com/x04/cclient"
)

//Create a new instance of client
func Create(proxy string, maxRedirects int) http.Client {
	client, _ := cclient.NewClient(tls.HelloChrome_Auto)

	jar, _ := cookiejar.New(nil)
	client.Jar = jar
	client.Timeout = 30 * time.Second
	client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
		if len(via) > maxRedirects {
			return http.ErrUseLastResponse
		}
		return nil
	}

	if proxy != "" {
		proxyURL := FormatProxy(proxy)
		client.Transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	}

	return client
}

//GetJSONCookies ...
func GetJSONCookies(uri *url.URL, c *http.Client) string {
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
		color.Red(err.Error())
		return "[]"
	}

	encodedJSONCookies := base64.URLEncoding.EncodeToString(jsonCookies)
	return encodedJSONCookies
}

//Decompress compressed response body TODO: add deflate and brotli
func Decompress(res *http.Response) error {
	switch res.Header.Get("Content-Encoding") {
	case "gzip":
		zr, err := gzip.NewReader(res.Body)
		if err != nil {
			return err
		}
		res.Body = zr
		break

	// case "br":
	// 	br := cbrotli.NewReader(res.Body)
	// 	res.Body = br
	// 	break

	case "deflate":
		df := flate.NewReader(res.Body)
		res.Body = df

	}
	defer res.Body.Close()
	return nil
}
