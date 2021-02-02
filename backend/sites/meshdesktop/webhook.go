package meshdesktop

import (
	"prosperaio/discord"
	"strings"
)

func (t *task) webhookMessage() discord.Message {
	productHeader := discord.Author{Name: "Successful Checkout"}
	fields := []discord.Field{
		{Name: "Site", Value: "jd-" + strings.ToLower(t.region) + "_fe", Inline: true},
		{Name: "Size", Value: "N/A", Inline: true},
		{Name: "Order #", Value: "N/A", Inline: true},
	}

	if t.pData.name != "" {
		productHeader.Name = t.pData.name
	}

	if t.size != "" {
		fields[1].Value = t.size
	}

	embedData := discord.Embed{
		Author: productHeader,
		Title:  "Checkout Now",
		Type:   "rich",
		Color:  3642623,
		URL:    t.webhookURL,
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
