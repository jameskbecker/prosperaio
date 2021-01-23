package meshmobile

func (t *task) defaultHeaders() [][]string {
	return [][]string{
		[]string{"accept", "*/*"},
		[]string{"x-requested-with", "XMLHttpRequest"},
		[]string{"user-agent", t.useragent},
		[]string{"content-type", "application/json"},
		[]string{"origin", t.baseURL},
		[]string{"sec-fetch-site", "same-origin"},
		[]string{"sec-fetch-mode", "cors"},
		[]string{"sec-fetch-dest", "empty"},
		[]string{"accept-encoding", "gzip, deflate, br"},
		[]string{"accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"},
		//[]string{"newrelic", ""},
	}
}
