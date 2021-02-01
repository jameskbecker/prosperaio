package discord

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/hugolgst/rich-go/client"
)

var timeout = 5000
var attempts = 0

// SetPresence sets the currently logged in user's presence via IPC
func SetPresence() {
	startTS := time.Now()
	err := client.Login("648966990400061451")
	if err != nil {
		if attempts < 10 {
			time.Sleep(time.Duration(timeout) * time.Millisecond)
			timeout = timeout * 2
			attempts++
			SetPresence()
		}
		return
	}

	err = client.SetActivity(client.Activity{
		State:      "v" + os.Getenv("version"),
		Details:    "Running Tasks",
		LargeImage: "prosperaio_logo",
		LargeText:  "ProsperAIO",
		SmallImage: "",
		SmallText:  "",
		Party:      nil,
		Timestamps: &client.Timestamps{
			Start: &startTS,
		},
	})
	if err != nil {
		if attempts < 10 {
			time.Sleep(time.Duration(timeout) * time.Millisecond)
			timeout = timeout * 2
			attempts++
			SetPresence()
		}
		return
	}
}

//PostWebhook posts
func PostWebhook(url string, data Message) error {
	fmt.Println("post webhook")
	client := http.Client{}
	dataB, err := json.Marshal(data)
	if err != nil {
		return err
	}
	fmt.Println(string(dataB))

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(dataB))
	if err != nil {
		return err
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return err
	}

	if res.StatusCode != 204 {
		return errors.New("Discord Webhook Status: " + res.Status)
	}

	bodyB, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	fmt.Println(string(bodyB))

	return nil
}

//TestWebhook sends a test webhook to a given webhook URL
func TestWebhook(url string) {
	logo := Image{
		URL:    "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/4f37fca8-6bce-43e7-ad07-f57ae3c13142/air-force-1-07-shoe-QNxTcf.jpg",
		Height: 500,
		Width:  500,
	}

	embedData := Embed{
		Title:     "Webhook Test",
		Type:      "rich",
		Color:     3642623,
		URL:       "https://twitter.com/theprosperbot",
		Thumbnail: logo,
		Fields:    testFields(),
		Footer:    GetFooter(),
	}

	data := Message{
		Embeds: []Embed{embedData},
	}

	err := PostWebhook(url, data)
	if err != nil {
		fmt.Println(err)
	}
}

func testFields() []Field {
	return []Field{
		{
			Name:   "Product",
			Value:  "Nike Air Force 1 '07",
			Inline: true,
		},
		{
			Name:   "Size",
			Value:  "9",
			Inline: true,
		},
		{
			Name:   "Site",
			Value:  "ProsperAIO",
			Inline: true,
		},
		{
			Name:   "Order",
			Value:  "||0000000000||",
			Inline: true,
		},
	}
}

//GetFooter ...
func GetFooter() Footer {
	ts := time.Now().UTC()

	return Footer{
		Text:    "ProsperAIO v" + os.Getenv("version") + " • " + ts.Format("02/01/2006 15:04:05.000 MST"),
		IconURL: "https://i.imgur.com/NGGew9J.png",
	}
}
