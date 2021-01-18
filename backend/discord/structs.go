package discord

//Message ...
type Message struct {
	Embeds []Embed `json:"embeds"`
}

//Embed ...
type Embed struct {
	Title       string  `json:"title,omitonempty"`
	Type        string  `json:"type,omitonempty"`
	Description string  `json:"description,omitonempty"`
	URL         string  `json:"url,omitonempty"`
	TS          int     `json:"timestamp,omitonempty"`
	Color       int     `json:"color,omitonempty"`
	Footer      Footer  `json:"footer,omitonempty"`
	Image       Image   `json:"image,omitonempty"`
	Thumbnail   Image   `json:"thumbnail,omitonempty"`
	Author      Author  `json:"author,omitonempty"`
	Fields      []Field `json:"fields,omitonempty"`
}

//Footer ...
type Footer struct {
	Text         string `json:"text"`
	IconURL      string `json:"icon_url,omitonempty"`
	ProxyIconURL string `json:"proxy_icon_url,omitonempty"`
}

//Image ...
type Image struct {
	URL      string `json:"url,omitonempty"`
	ProxyURL string `json:"proxy_url,omitonempty"`
	Height   int    `json:"height,omitonempty"`
	Width    int    `json:"width,omitonempty"`
}

//Author ...
type Author struct {
	Name         string `json:"name,omitonempty"`
	URL          string `json:"url,omitonempty"`
	IconURL      string `json:"icon_url,omitonempty"`
	ProxyIconURL string `json:"proxy_icon_url,omitonempty"`
}

//Field ...
type Field struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline,omitonempty"`
}
