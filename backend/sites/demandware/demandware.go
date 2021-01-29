package demandware

import (
	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"
)

const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"

//Run DemandWare task
func Run(i Input, tNbr string, wg *sync.WaitGroup) {
	task := Task{
		Size:      i.Size,
		Site:      i.Site,
		Profile:   i.Profile,
		Client:    createClient(),
		TNbr:      tNbr,
		UserAgent: userAgent,
		lDbg:      log.New(os.Stdout, "", 0),
		lErr:      log.New(os.Stdout, "", 0),
		lInf:      log.New(os.Stdout, "", 0),
		lWrn:      log.New(os.Stdout, "", 0),
	}
	task.debg("Starting Task...")

	baseURL, err := getBaseURL(i.Site)
	if err != nil {
		task.err(err.Error())
		return
	}
	task.BaseURL = baseURL

	if !strings.Contains(i.ProductURL, "www") {
		task.BPID = strings.Replace(i.ProductURL, `"`, "", 1)
	} else {
		f, err := url.Parse(i.ProductURL)
		if err != nil {
			panic("Invalid URL")
		}
		task.ProductURL = f

		pidExp := regexp.MustCompile(`-(?P<pid>\d*?)\.html`)
		match := pidExp.FindStringSubmatch(f.String())
		if match == nil || len(match) < 2 {
			panic("Unable to Parse PID")
		}
		task.PID = match[1]
	}

	siteID, err := getSiteID(i.Site)
	if err != nil {
		panic(err)
	}
	task.SiteID = siteID
	errorDelay := time.Second * 2

	for {
		px3, err := task.GetPXCookie()
		if err != nil || px3 == "" {
			if err != nil {
				task.err(err.Error())
			}
			select {
			case <-time.After(errorDelay):
				continue
			}
		}
		task.PX3 = px3
		break
	}

	cookies := []*http.Cookie{
		{Name: "hideLocalizationDialog", Value: "true"},
		{Name: "acceptCookie", Value: "true"},
		//{Name: "customerCountry", Value: "gb"},
		{Name: "_px3", Value: task.PX3},
	}

	task.Client.Jar.SetCookies(task.BaseURL, cookies)

	//Get CSFR Token for valid POST requests
	// for {
	// 	err = task.GetCSRFToken()
	// 	if err != nil {
	// 		task.err(err.Error())
	// 		select {
	// 		case <-time.After(errorDelay):
	// 			continue
	// 		}
	// 	}

	// 	break
	// }

	//Generate Account
	// for {
	// 	err = task.SubmitRegistration()
	// 	if err != nil {
	// 		task.err(err.Error())
	// 		select {
	// 		case <-time.After(errorDelay):
	// 			continue
	// 		}
	// 	}
	// 	break
	// }

	//ProductURL Mode
	if task.BPID == "" {
		//Get Url for Product Data Endpoint
		for {
			err = task.GetProductShowURL()
			if err != nil {
				task.err(err.Error())
				select {
				case <-time.After(errorDelay):
					continue
				}
			}
			break
		}

		for {
			err = task.GetProductData()
			if err != nil {
				//task.err(err.Error())
				select {
				case <-time.After(errorDelay):
					continue
				}
			}
			break
		}
	}
	// timeFormat := "2006-01-02 15:04 MST"
	// v := "2020-11-16 15:35 GMT"
	// then, _ := time.Parse(timeFormat, v)
	// task.debg("Preload Complete. Task Scheduled For: " + v)
	// duration := time.Until(then)
	// time.Sleep(duration)

	//Add item to cart
	// for {
	// 	err = task.AddToCart()
	// 	if err != nil {
	// 		task.err(err.Error())
	// 		select {
	// 		case <-time.After(errorDelay):
	// 			continue
	// 		}
	// 	}
	// 	break
	// }

	// for {
	// 	err = task.SubmitShipping()
	// 	if err != nil {
	// 	task.err(err.Error())
	// 	select {
	// 	case <-time.After(errorDelay):
	// 		continue
	// 	}
	// }
	// 	break
	// }

	// for {
	// 	err = task.SubmitPayment()
	// 	if err != nil {
	// 	task.err(err.Error())
	// 	select {
	// 	case <-time.After(errorDelay):
	// 		continue
	// 	}
	// }
	// 	break
	// }

	// for {
	// 	err = task.PlaceOrder()
	// if err != nil {
	// 	task.err(err.Error())
	// 	select {
	// 	case <-time.After(errorDelay):
	// 		continue
	// 	}
	// }
	// 	break
	// }

	wg.Done()

}

func getBaseURL(s string) (baseURL *url.URL, err error) {
	switch strings.ToLower(s) {
	case "onygo":
		baseURL, err = url.Parse("https://www.onygo.com")
		if err != nil {
			return nil, err
		}

		break

	case "snipes-at", "snipes-de", "snipes-fr", "snipes-ch", "snipes-es", "snipes-it", "snipes-nl", "snipes-be", "snipes-usa":
		baseURL, err = url.Parse("https://www.snipes.com")
		if err != nil {
			return nil, err
		}

		break

	case "solebox-de":
		baseURL, err = url.Parse("https://www.solebox.com")
		if err != nil {
			return nil, err
		}

		break
	default:
		err = errors.New("Error Setting Parsing Input Site (SBURL)")
		return
	}

	return baseURL, err
}

func getSiteID(s string) (string, error) {
	switch strings.ToLower(s) {
	case "onygo":
		return "ong-DE", nil

	case "snipes-at", "snipes-de":
		return "snse-DE-AT", nil

	case "snipes-es", "snipes-it":
		return "snse-SOUTH", nil

	case "snipes-nl", "snipes-be":
		return "snse-NL-BE", nil

	case "snipes-fr":
		return "snse-FR", nil

	case "snipes-ch":
		return "snse-CH", nil

	case "snipes-usa":
		return "snipesusa", nil

	case "solebox-de":
		return "solebox", nil
	}

	return "", errors.New("UNKNOWN SITE")
}
