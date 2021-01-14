package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

type message struct {
	Embeds []embed `json:"embeds"`
}

type embed struct {
	Title       string  `json:"title,omitonempty"`
	Type        string  `json:"type,omitonempty"`
	Description string  `json:"description,omitonempty"`
	URL         string  `json:"url,omitonempty"`
	TS          int     `json:"timestamp,omitonempty"`
	Color       int     `json:"color,omitonempty"`
	Footer      footer  `json:"footer,omitonempty"`
	Image       image   `json:"image,omitonempty"`
	Thumbnail   image   `json:"thumbnail,omitonempty"`
	Author      author  `json:"author,omitonempty"`
	Fields      []field `json:"fields,omitonempty"`
}

type footer struct {
	Text         string `json:"text"`
	IconURL      string `json:"icon_url,omitonempty"`
	ProxyIconURL string `json:"proxy_icon_url,omitonempty"`
}

type image struct {
	URL      string `json:"url,omitonempty"`
	ProxyURL string `json:"proxy_url,omitonempty"`
	Height   int    `json:"height,omitonempty"`
	Width    int    `json:"width,omitonempty"`
}

type author struct {
	Name         string `json:"name,omitonempty"`
	URL          string `json:"url,omitonempty"`
	IconURL      string `json:"icon_url,omitonempty"`
	ProxyIconURL string `json:"proxy_icon_url,omitonempty"`
}

type field struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline,omitonempty"`
}

func testFields() []field {
	return []field{
		field{
			Name:   "Product",
			Value:  "----------",
			Inline: true,
		},
		field{
			Name:   "Site",
			Value:  "----------",
			Inline: true,
		},
		field{
			Name:   "Size",
			Value:  "----------",
			Inline: true,
		},
		field{
			Name:   "Order",
			Value:  "||----------||",
			Inline: true,
		},
		field{
			Name:   "Checkout Link",
			Value:  "[Click Here](https://twitter.com/prosperaio)",
			Inline: true,
		},
	}
}

func getFooter() footer {
	ts := time.Now().UTC()
	return footer{
		Text:    "ProsperAIO v" + version + " • " + ts.String(),
		IconURL: "https://i.imgur.com/NGGew9J.png",
	}
}

func testWebhook(url string) {
	embedData := embed{
		Title: "Webhook Test",
		Type:  "rich",
		Color: 3642623,
		Thumbnail: image{
			URL:    "https://i.imgur.com/NGGew9J.png",
			Height: 400,
			Width:  400,
		},
		Fields: testFields(),
		Footer: getFooter(),
	}

	data := message{
		Embeds: []embed{embedData},
	}

	err := postWebhook(url, data)
	if err != nil {
		fmt.Println(err)
	}
}

func postWebhook(url string, data message) error {
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

	res, err := client.Do(req)
	if err != nil {
		return err
	}

	bodyB, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	body := string(bodyB)
	fmt.Println(body)

	return nil
}
