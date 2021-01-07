package snipes

import (
	"log"
	"net/http"
	"net/url"
	"regexp"
	"sync"

	"../demandware"
)

//Run snipes task
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
		SiteID:     "snse-DE-AT",
		UserAgent:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
	}
	//log.Println("Getting _px3 Cookie...")
	px3, err := task.GetPXCookie()
	if err != nil {
		panic(err)
	}
	//log.Println("Got _px3 Cookie: " + px3)

	cookies := []*http.Cookie{}
	//cookies = append(cookies, &http.Cookie{Name: "customerCountry", Value: "gb"})
	cookies = append(cookies, &http.Cookie{Name: "hideLocalizationDialog", Value: "true"})
	cookies = append(cookies, &http.Cookie{Name: "acceptCookie", Value: "true"})
	cookies = append(cookies, &http.Cookie{Name: "_px3", Value: px3})
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

	} else {
		// err = task.AddToCart()
		// if err != nil {
		// 	if err.Error() == "FORBIDDEN" {
		// 		*fa++
		// 		*sc--
		// 	} else {
		// 		log.Println("D" + err.Error())
		// 	}

		// }
	}

	*sc++
	wg.Done()

}
