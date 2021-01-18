package discord

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/hugolgst/rich-go/client"
)

const version = "4.0.0 (BETA)"

// SetPresence sets the currently logged in user's presence via IPC
func SetPresence() {
	startTS := time.Now()
	err := client.Login("648966990400061451")
	if err != nil {
		fmt.Println(err)
		return
	}

	err = client.SetActivity(client.Activity{
		State:      "v" + version,
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
		fmt.Println(err)
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
		URL:    "https://i.imgur.com/NGGew9J.png",
		Height: 400,
		Width:  400,
	}

	embedData := Embed{
		Title:     "Webhook Test",
		Type:      "rich",
		Color:     3642623,
		Thumbnail: logo,
		Fields:    testFields(),
		Footer:    getFooter(),
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
			Value:  "----------",
			Inline: true,
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

func getFooter() Footer {
	ts := time.Now().UTC()
	return Footer{
		Text:    "ProsperAIO v" + version + " • " + ts.String(),
		IconURL: "https://i.imgur.com/NGGew9J.png",
	}
}
