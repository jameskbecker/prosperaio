package discord

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
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
	client := http.Client{}
	dataB, err := json.Marshal(data)
	if err != nil {
		return err
	}

	dataS := string(dataB)
	req, err := http.NewRequest("POST", url, strings.NewReader(dataS))
	if err != nil {
		return err
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	_, err = client.Do(req)
	if err != nil {
		return err
	}

	return nil
}

//TestWebhook sends a test webhook to a given webhook URL
func TestWebhook(url string) {
	logo := Image{
		URL:    "https://img.favpng.com/20/13/20/air-force-jumpman-nike-free-coloring-book-air-jordan-png-favpng-50G7r6aWHwsbe9YC4ha20PUPj.jpg",
		Height: 500,
		Width:  500,
	}

	embedData := Embed{
		Title:     "Webhook Test",
		Type:      "rich",
		Color:     3642623,
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
		Field{
			Name:   "Product",
			Value:  "------------------------------",
			Inline: false,
		},
		Field{
			Name:   "Site",
			Value:  "----------",
			Inline: true,
		},
		Field{
			Name:   "Size",
			Value:  "----------",
			Inline: true,
		},
		Field{
			Name:   "Order",
			Value:  "||----------||",
			Inline: true,
		},
		Field{
			Name:   "Checkout Link",
			Value:  "[Click Here](https://twitter.com/theprosperbot)",
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
