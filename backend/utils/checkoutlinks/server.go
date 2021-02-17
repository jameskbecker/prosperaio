package checkoutlinks

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/fatih/color"
	"github.com/gorilla/mux"
)

//StartServer ...
func StartServer() {
	_, err := getCheckoutlinks()
	if err != nil {
		color.Red(err.Error())
		os.Exit(0)
	}

	PORT := "7500"
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/checkouts/{taskID}", getCheckoutURL).Methods("GET")
	router.NotFoundHandler = http.HandlerFunc(notFound)
	log.Println("Listening on Port: " + PORT)
	_ = http.ListenAndServe(":"+PORT, router)
}

func getCheckoutURL(res http.ResponseWriter, req *http.Request) {
	data, err := getCheckoutlinks()
	if err != nil {
		color.Red(err.Error())
		os.Exit(0)
	}
	taskID, _ := mux.Vars(req)["taskID"]

	http.Redirect(res, req, data[taskID], http.StatusFound)
}

func notFound(res http.ResponseWriter, req *http.Request) {
	res.Write([]byte("Malformed or no longer valid checkout url."))
}

func getCheckoutlinks() (data map[string]string, err error) {
	homedir, _ := os.UserHomeDir()
	checkoutLinksPath := path.Join(homedir, "ProsperAIO", "checkoutLinks.json")

	checkoutLinksFile, err := os.Open(checkoutLinksPath)
	if err != nil {
		return
	}

	json.NewDecoder(checkoutLinksFile).Decode(&data)
	return
}

//AddCheckoutLink ...
func AddCheckoutLink(taskID string, checkoutLink string) (err error) {
	homedir, _ := os.UserHomeDir()
	checkoutLinksPath := path.Join(homedir, "ProsperAIO", "checkoutLinks.json")

	existingData, err := getCheckoutlinks()
	if err != nil {
		return
	}
	existingData[taskID] = checkoutLink
	newData, err := json.Marshal(existingData)
	if err != nil {
		return
	}

	err = ioutil.WriteFile(checkoutLinksPath, newData, 0644)
	return
}
