package meshdesktop

import (
	"fmt"
	"net/http"
	"net/url"
	"prosperaio/captcha"
	"prosperaio/discord"
	"prosperaio/utils/client"
	"prosperaio/utils/log"
	"strings"
	"time"
)

func getBaseURL(siteID string, region string) (baseURL *url.URL) {
	baseURL = &url.URL{Scheme: "https"}
	switch siteID {
	case "jd":
		baseURL.Host += "www.jdsports"
		break
	case "fp":
		baseURL.Host += "www.footpatrol"
		break
	case "size":
		baseURL.Host += "www.size"
		break
	}

	if region == "" {
		baseURL.Host += ".com"
		return
	}

	if region == "gb" {
		baseURL.Host += ".co.uk"
		return
	}

	baseURL.Host += "." + region
	return
}

func setDefaultHeaders(req *http.Request, ua string, bURL string) {
	headers := [][]string{
		{"accept", "*/*"},
		{"x-requested-with", "XMLHttpRequest"},
		{"user-agent", ua},
		{"content-type", "application/json"},
		{"origin", bURL},
		{"sec-fetch-site", "same-origin"},
		{"sec-fetch-mode", "cors"},
		{"sec-fetch-dest", "empty"},
		{"accept-encoding", "gzip"},
		{"accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"},
	}

	for _, v := range headers {
		req.Header.Set(v[0], v[1])
	}
}

func buildCheckoutURL(cookies string, redirURL string) string {
	qs := url.Values{}
	qs.Set("cookie", cookies)
	qs.Set("redirectUrl", redirURL)

	return "http://localhost/extension.prosperaio.com?" + qs.Encode()
}

func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	site := strings.ToLower(t.site)
	region := strings.ToLower(t.region)
	if region != "" {
		site += "-" + region
	}
	prefix := "[" + tID + "] [" + site + "_fe] [" + t.size + "] "
	t.log = log.Logger{Prefix: prefix}
}

func (t *task) webhookMessage() discord.Message {
	productHeader := discord.Author{Name: "Successful Checkout"}
	site := strings.ToLower(t.site)
	if t.region != "" {
		site += "-" + strings.ToLower(t.region)
	}
	fields := []discord.Field{
		{Name: "Site", Value: site + "_fe", Inline: true},
		{Name: "Size", Value: "N/A", Inline: true},
	}

	if t.pData.name != "" {
		productHeader.Name = t.pData.name
	}

	if t.size != "" {
		fields[1].Value = t.size
	}

	t.log.Debug(t.webhookURL)

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

func (t *task) sendSuccess() (err error) {
	adyenURL1, _ := url.Parse("https://live.adyen.com/")
	adyenURL2, _ := url.Parse("https://live.adyen.com/hpp/")
	adyenURL3, _ := url.Parse("https://live.adyen.com/hpp")
	cookieURLs := []*url.URL{t.baseURL, adyenURL1, adyenURL2, adyenURL3}
	cookies := client.GetJSONCookies(cookieURLs, t.client)
	t.webhookURL = buildCheckoutURL(cookies, t.ppURL)
	err = discord.PostWebhook(t.settings.WebhookURL, t.webhookMessage())
	return
}

func (t *task) getCaptcha(sitekey string) string {
	for {
		code, err := captcha.Request2Captcha(captcha.InputParams{
			APIKey:  "",
			Sitekey: sitekey,
			URL:     t.baseURL.String(),
		})
		if err != nil {
			t.log.Error("ReCap2 Err: " + err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		t.log.Debug("ReCap2 Response: " + code)
		return code
	}

}
