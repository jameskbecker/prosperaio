package snipes

import (
	"crypto/rand"
	"crypto/tls"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"time"
)

func createClient() *http.Client {
	jar, _ := cookiejar.New(nil)
	proxyURL, _ := url.Parse("http://customer-Z534cnN4-cc-DE:A3Mki64O@pr.rubyproxies.com:7777")
	return &http.Client{
		Jar: jar,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Transport: &http.Transport{
			Proxy:                 http.ProxyURL(proxyURL),
			MaxIdleConns:          10,
			IdleConnTimeout:       60 * time.Second,
			TLSHandshakeTimeout:   15 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
			TLSClientConfig:       getTLSConfig(),
			ForceAttemptHTTP2:     true,
			DialContext: (&net.Dialer{
				Timeout:   10 * time.Second,
				KeepAlive: 1 * time.Second,
				DualStack: true,
			}).DialContext,
		},
	}
}

func getTLSConfig() *tls.Config {
	return &tls.Config{
		Rand:         rand.Reader,
		KeyLogWriter: nil,
		MinVersion:   tls.VersionTLS12,
		//CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
		PreferServerCipherSuites: true,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		},
	}
}
