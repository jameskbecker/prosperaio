package demandware

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"prosperaio/utils/log"
	"strings"
)

func (t *task) getBaseURL(siteID string) (baseURL *url.URL) {
	baseURL = &url.URL{Scheme: "https"}
	switch strings.ToLower(siteID) {
	case "snipes":
		baseURL.Host += "www.snipes"
	}

	baseURL.Host += ".com"

	return
}

func getSiteID(s string) (string, error) {
	switch strings.ToLower(s) {
	case "onygo":
		return "ong-DE", nil

	case "snipes-at", "snipes-de":
		return "snse-DE-AT", nil

	case "snipes-es", "snipes-it":
		return "snse-SOUTH", nil

	case "snipes-nl", "snipes-be":
		return "snse-NL-BE", nil

	case "snipes-fr":
		return "snse-FR", nil

	case "snipes-ch":
		return "snse-CH", nil

	case "snipes-usa":
		return "snipesusa", nil

	case "solebox-de":
		return "solebox", nil
	}

	return "", errUnknownSite
}

func setDefaultHeaders(req *http.Request, ua string, bURL string) {
	headers := [][]string{
		{"accept", "application/json, text/javascript, */*; q=0.01"},
		{"accept-encoding", "gzip, deflate, br"},
		{"accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"},
		{"sec-fetch-site", "same-origin"},
		{"user-agent", ua},
		{"x-requested-with", "XMLHttpRequest"},
		{"sec-ch-ua", `"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"`},
		{"sec-ch-ua-mobile", "?0"},
	}

	for _, v := range headers {
		req.Header.Set(v[0], v[1])
	}
}

func buildExtensionURL(cookies []byte, redirURL string) string {
	qs := url.Values{}
	qs.Set("cookie", base64.URLEncoding.EncodeToString(cookies))
	qs.Set("redirectUrl", base64.URLEncoding.EncodeToString([]byte(redirURL)))
	return "http://localhost/extension.prosperaio.com?" + qs.Encode()
}

func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	site := strings.ToLower(t.site)
	region := strings.ToLower(t.region)
	if region != "" {
		site += "-" + region
	}
	prefix := "[" + tID + "] [" + site + "] [" + t.product.ID + "] [" + t.size + "] "
	t.log = log.Logger{Prefix: prefix}
}

// func (t *task) webhookMessage() discord.Message {
// 	taskID := fmt.Sprintf("%04d", t.id)
// 	err := checkoutlinks.AddCheckoutLink(taskID, t.extensionURL)
// 	if err != nil {
// 		color.Red(err.Error())
// 	}

// 	productHeader := discord.Author{Name: "Successful Checkout"}
// 	site := strings.ToLower(t.site)
// 	if t.region != "" {
// 		site += "-" + strings.ToLower(t.region)
// 	}
// 	fields := []discord.Field{
// 		{Name: "PID", Value: t.pData.pid, Inline: true},
// 		{Name: "Site", Value: site + "_fe", Inline: true},
// 		{Name: "Size", Value: "N/A", Inline: true},
// 	}

// 	if t.pData.name != "" {
// 		productHeader.Name = t.pData.name
// 	}

// 	if t.size != "" {
// 		fields[2].Value = t.size
// 	}

// 	t.log.Debug(t.extensionURL)

// 	embedData := discord.Embed{
// 		Author: productHeader,
// 		Title:  "Checkout Now",
// 		Type:   "rich",
// 		Color:  3642623,
// 		URL:    "http://127.0.0.1:7500/checkouts/" + taskID,
// 		Fields: fields,
// 		Footer: discord.GetFooter(),
// 	}

// 	if t.pData.imageURL != "" {
// 		embedData.Thumbnail = discord.Image{URL: t.pData.imageURL}
// 	}

// 	return discord.Message{
// 		Embeds: []discord.Embed{embedData},
// 	}
// }

// func (t *task) sendSuccess() (err error) {
// 	adyenURL1, _ := url.Parse("https://live.adyen.com/")
// 	adyenURL2, _ := url.Parse("https://live.adyen.com/hpp/")
// 	adyenURL3, _ := url.Parse("https://live.adyen.com/hpp")
// 	cookieURLs := []*url.URL{t.baseURL, adyenURL1, adyenURL2, adyenURL3}
// 	cookies := client.GetJSONCookies(cookieURLs, t.client)
// 	t.extensionURL = buildExtensionURL(cookies, t.ppURL)
// 	err = discord.PostWebhook(t.settings.WebhookURL, t.webhookMessage())
// 	return
// }

// func (t *task) getCaptcha() {
// 	if t.recaptcha.sitekey == "" {
// 		t.log.Error("Error getting captcha: missing sitekey")
// 		return
// 	}
// 	t.log.Warn("Requesting 2Captcha")
// 	code, err := captcha.Request2Captcha(captcha.InputParams{
// 		APIKey:  t.settings.TwoCapKey,
// 		Sitekey: t.recaptcha.sitekey,
// 		URL:     t.baseURL.String(),
// 	})
// 	if err != nil {
// 		t.retry(err, t.getCaptcha)
// 		return
// 	}
// 	t.log.Debug("ReCap2 Response: " + code)
// 	t.recaptcha.response = code
// }
