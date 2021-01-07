package onygo

import (
	"crypto/rand"
	"crypto/tls"
	"net"
	"net/http"
	"net/http/cookiejar"
	"time"
)

func createClient() *http.Client {
	jar, _ := cookiejar.New(nil)
	//proxyURL, _ := url.Parse("http://100.76.72.39:8888")
	return &http.Client{
		Jar: jar,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Transport: &http.Transport{
			//Proxy:                 http.ProxyURL(proxyURL),
			MaxIdleConns:          10,
			IdleConnTimeout:       60 * time.Second,
			TLSHandshakeTimeout:   10 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
			TLSClientConfig:       getTLSConfig(),
			ForceAttemptHTTP2:     false,
			DialContext: (&net.Dialer{
				Timeout:   10 * time.Second,
				KeepAlive: 30 * time.Second,
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
		// CipherSuites: []uint16{
		// 	tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		// 	tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		// },
	}
}
