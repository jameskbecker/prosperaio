package supreme

import (
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

//Task ...
type Task struct {
	Profile                                                           *Profile
	Client                                                            http.Client
	Warn, Info, Debug, Err                                            *log.Logger
	BaseURL, UserAgent                                                string
	InputKW, InputStyle, InputCat, InputSize, InputQty                string
	Slug, CookieSub, CardinalJWT, CardinalTid, CardinalID, OrderTotal string
	CartResponse                                                      string
	CheckoutResponse                                                  checkoutResponse
	ProductName, StyleName, SizeName                                  string
	ProductID, StyleID, SizeID, OrderNumber                           int
	ErrorDelay, MonitorDelay                                          time.Duration
}

//GetTicket ...
func (t *Task) getTicket() error {
	request, err := http.NewRequest("GET", "https://www.supremenewyork.com/ticket.wasm", nil)
	if err != nil {
		return err
	}

	request.Header.Add("User-Agent", t.UserAgent)

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	//Close Request Once Function is Completed
	defer response.Body.Close()

	//body, err := ioutil.ReadAll(response.Body)
	// if err != nil {
	// 	return err
	// }

	return nil

}

//InitCardinal ...
func (t *Task) InitCardinal() error {
	payload := `{
		"BrowserPayload":{"Order":{"OrderDetails":{},"Consumer":{"BillingAddress":{},"ShippingAddress":{},"Account":{}},"Cart":[],"Token":{},"Authorization":{},"Options":{},"CCAExtension":{}},"SupportsAlternativePayments":{"cca":true,"hostedFields":false,"applepay":false,"discoverwallet":false,"wallet":false,"paypal":false,"visacheckout":false}},"Client":{"Agent":"SongbirdJS","Version":"1.30.2"},"ConsumerSessionId":null,
		"ServerJWT": "` + t.CardinalJWT + `"
	}`
	request, _ := http.NewRequest("POST", "https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Init", strings.NewReader(payload))

	uniqueID := uuid.New()
	t.CardinalTid = "Tid-" + uniqueID.String()

	request.Header.Add("accept", "*/*")
	//request.Header.Add("accept-encoding", "gzip, deflate, br")
	request.Header.Add("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Add("content-type", "application/json;charset=UTF-8")
	request.Header.Add("origin", t.BaseURL)
	request.Header.Add("referer", t.BaseURL+"/mobile")
	request.Header.Add("user-agent", t.UserAgent)
	request.Header.Add("x-cardinal-tid", t.CardinalTid)

	response, err := t.Client.Do(request)

	if err != nil {
		return err
	}

	defer response.Body.Close()

	body2, _ := ioutil.ReadAll(response.Body)
	log.Println(string(body2))
	time.Sleep(100 * time.Second)
	var body map[string]string

	json.NewDecoder(response.Body).Decode(&body)

	t.CardinalJWT = body["CardinalJWT"]
	log.Println()
	b64url := strings.Split(t.CardinalJWT, ".")[1]
	replacer := strings.NewReplacer("-", "+", "_", "/")
	b64string := replacer.Replace(b64url)
	decodedBytes, err := base64.StdEncoding.DecodeString(b64string)
	if err != nil {
		return err
	}
	var data map[string]string
	json.NewDecoder(strings.NewReader(string(decodedBytes))).Decode(&data)

	t.CardinalID = data["ConsumerSessionId"]

	return nil
}
