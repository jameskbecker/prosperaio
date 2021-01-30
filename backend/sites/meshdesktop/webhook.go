package meshdesktop

import (
	"prosperaio/discord"
	"strconv"
	"strings"
)

func (t *task) webhookMessage() discord.Message {

	//fmt.Println(checkoutURL)
	productName := "N/A"
	pid := "N/A"
	size := "N/A"
	if t.size != "" {
		productName = t.pData.name
	}

	if t.size != "" {
		pid = strconv.Itoa(t.pData.pid)
	}

	if t.size != "" {
		size = t.size
	}

	fields := []discord.Field{
		{Name: "Product", Value: productName, Inline: false},
		{Name: "PID", Value: pid, Inline: true},
		{Name: "Site", Value: "jd-" + strings.ToLower(t.region) + "_fe", Inline: true},
		{Name: "Size", Value: size, Inline: true},
		{Name: "Price", Value: t.pData.price, Inline: true},
		{Name: "Checkout Link", Value: "[Click Here](" + t.checkoutURL + ")", Inline: true},
	}

	embedData := discord.Embed{
		Title:  "Successful Checkout",
		Type:   "rich",
		Color:  3642623,
		Fields: fields,
		Footer: discord.GetFooter(),
	}

	if t.pData.imageURL != "" {
		embedData.Thumbnail = discord.Image{URL: t.pData.imageURL}
	}

	return discord.Message{
		Embeds: []discord.Embed{embedData},
	}
}
