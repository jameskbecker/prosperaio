package client

//ExtensionCookie used for discord checkout links
type ExtensionCookie struct {
	Name  string `json:"name"`
	Value string `json:"value"`
	URL   string `json:"url"`
	Path  string `json:"path"`
}
