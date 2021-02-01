package meshdesktop

import (
	"prosperaio/discord"
	"strings"
)

func (t *task) webhookMessage() discord.Message {

	fields := []discord.Field{
		{Name: "Product", Value: "N/A", Inline: false},
		{Name: "Site", Value: "jd-" + strings.ToLower(t.region) + "_fe", Inline: true},
		{Name: "Size", Value: "N/A", Inline: true},
	}

	if t.pData.name != "" {
		fields[0].Value = t.pData.name
	}

	if t.size != "" {
		fields[2].Value = t.size
	}

	embedData := discord.Embed{
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
