package captcha

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path"
	"strings"
	"sync"

	"github.com/gorilla/mux"
	"github.com/lobre/goodhosts"
	"github.com/txn2/txeh"
)

func getSitekey(host string) (sitekey string) {
	switch host {
	case "footpatrol.com":
		sitekey = "6LfEwHQUAAAAACTyJsAICi2Lz2oweGni8QOhV-Yl"
		break
	case "jdsports.co.uk",
		"jdsports.de":
		sitekey = "6LeYwXQUAAAAAE4gXAlG6yGC-BP1Z2WwhFTfrm8g"
		break
	case "size.co.uk":
		sitekey = "6LcC-ncUAAAAAOLKxsMYds8lTaTNguv8eiJeVBsr"
		break
	}
	return
}

func startServer(hostname string, wg *sync.WaitGroup) {
	addRecord(hostname)
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", rootHandler).Methods("GET", "POST")
	port := "8080"
	txeh.ParseHosts(path.Join("etc", "hosts"))
	log.Println("Listening on Port: " + port)
	openBrowser("http://" + hostname + ":8080/")
	log.Fatal(http.ListenAndServe(":"+port, router))
}

type input struct {
	Sitekey string
	SiteID  string
}

func rootHandler(res http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case http.MethodGet:
		renderCaptchaPage(req, res)
		break
	case http.MethodPost:
		handleResponse(req)
		break
	}

}

func renderCaptchaPage(req *http.Request, res http.ResponseWriter) {
	site := strings.Split(req.Host, ":")[0]
	sitekey := getSitekey(site)
	if sitekey == "" {
		res.Write([]byte("Missing or invalid site "))
		return
	}
	template, _ := template.New("recaptcha").Parse(recaptchaHTML())
	template.Execute(res, input{
		Sitekey: sitekey,
		SiteID:  site,
	})
}

type captchaResponse struct {
	SiteID   string `json:"siteId"`
	Response string `json:"response"`
}

func handleResponse(req *http.Request) {
	body := captchaResponse{}
	json.NewDecoder(req.Body).Decode(&body)
}

func tokenReceiver(res http.ResponseWriter, req *http.Request) {
	fmt.Println(req.Form)
}

func addRecord(hostname string) {
	hosts, _ := goodhosts.NewHosts()
	fmt.Println("Checking for " + hostname + " in the hosts file...")
	if hosts.Has("127.0.0.1", hostname) {
		fmt.Println("Entry found!")
	} else {
		fmt.Println("Entry not found, creating it...")
		hosts.Add("127.0.0.1", hostname)
		fmt.Println("Entry created!")
	}
	if err := hosts.Flush(); err != nil {
		panic(err)
	}
}

//RemoveRecord ...
func RemoveRecord(hostname string) {
	hosts, _ := goodhosts.NewHosts()
	hosts.Remove("127.0.0.1", "www."+hostname, hostname)
	if err := hosts.Flush(); err != nil {
		panic(err)
	}
}

//RemoveAllRecords ...
func RemoveAllRecords() {
	// for k := range sitekeys {
	// 	RemoveRecord(k)
	// }
}
