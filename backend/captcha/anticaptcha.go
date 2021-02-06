package captcha

/*
{
  "clientKey":"YOUR_API_KEY",
  "task":
     {
         "type":"RecaptchaV2TaskProxyless",
         "websiteURL":"http://makeawebsitehub.com/recaptcha/test.php",
         "websiteKey":"6LfI9IsUAAAAAKuvopU0hfY8pWADfR_mogXokIIZ"
     },
  "softId":0,
  "languagePool":"en"
}
*/

type anticap struct {
	ClientKey string      `json:"clientKey"`
	Task      anticapTask `json:"task"`
	SoftID    int         `json:"softId"`
	LangPool  string      `json:"languagePool"`
}

type anticapTask struct {
	Type    string `json:"type"`
	URL     string `json:"websiteURL"`
	Sitekey string `json:"websitekey"`
}

type anticapRes struct {
	ErrorID int `json:"e"`
}
