package onygo

import (
	"log"
	"net/http"
	"net/url"
	"regexp"
	"sync"

	"../demandware"
)

//Run Onygo task
func Run(i Input, fa *int, sc *int, wg *sync.WaitGroup) {

	url, err := url.Parse(i.ProductURL)
	if err != nil {
		panic("Invalid URL")
	}
	//log.Println("Product URL: " + url.String())

	baseURL, err := url.Parse("https://" + url.Hostname())
	if err != nil {
		panic("Invalid base URL")
	}

	pidExp := regexp.MustCompile(`-(?P<pid>\d*?)\.html`)
	match := pidExp.FindStringSubmatch(url.String())
	if match == nil || len(match) < 2 {
		panic("Unable to Parse PID")
	}
	pid := match[1]
	//log.Println("PID: " + pid)

	task := demandware.Task{
		ProductURL: url,
		Size:       i.Size,
		BaseURL:    baseURL,
		PID:        pid,
		Client:     *createClient(),
		SiteID:     "ong-DE",
		UserAgent:  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
	}
	log.Println("Getting _px3 Cookie...")
	px, err := task.GetPXCookie()
	if err != nil {
		panic(err)
	}

	cookies := []*http.Cookie{}
	cookies = append(cookies, &http.Cookie{Name: "customerCountry", Value: "gb"})
	cookies = append(cookies, &http.Cookie{Name: "hideLocalizationDialog", Value: "true"})
	cookies = append(cookies, &http.Cookie{Name: "acceptCookie", Value: "true"})
	cookies = append(cookies, &http.Cookie{Name: "_px3", Value: px})
	task.Client.Jar.SetCookies(task.BaseURL, cookies)

	err = task.GetProductShowURL()
	if err != nil {
		panic("D" + err.Error())
	}

	err = task.GetProductData()
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			*fa++
			*sc--
		} else {
			log.Println("D" + err.Error())
		}

	}

	*sc++
	wg.Done()
	// err = task.AddToCart()
	// if err != nil {
	// 	panic("F" + err.Error())
	// }

	// err = task.GetCSRFToken()
	// if err != nil {
	// 	panic("F" + err.Error())
	// }

	// err = task.SubmitShipping()
	// if err != nil {
	// 	panic("Fd" + err.Error())
	// }

	// err = task.SubmitPayment()
	// if err != nil {
	// 	panic("Fd" + err.Error())
	// }

	// err = task.PlaceOrder()
	// if err != nil {
	// 	panic("Fd" + err.Error())
	// }

}
