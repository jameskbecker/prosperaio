package meshmobile

import "net/http"

func (t *task) stock() {
	qs := "channel=iphone-app&expand=variations,informationBlocks,customisations"
	uri := "https://prod.jdgroupmesh.cloud/stores/jdsportsuk/products/" + t.sku + "?" + qs

	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {

	}

	req.Header.Set("accept", "*/*")
	req.Header.Set("accept-language", "en-gb")
	req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("mesh-commerce-channel", "iphone-app")
	req.Header.Set("mesh-version", "cart=4")
	req.Header.Set("user-agent", "jdsportsuk/6.6.3.2011 (iphone-app; iOS 14.3)")
	req.Header.Set("x-api-key", "4CE1177BB983470AB15E703EC95E5285")
	req.Header.Set("x-request-auth", `Hawk id="d1bdff50c5", mac="o1tqnjcpWmjE50MnvuqbDY3Q1K8t7oCYE0DtywdhZow=", ts="1611263947", nonce="RRT96T"`)
}

func (t *task) add() error {
	uri := "https://prod.jdgroupmesh.cloud/stores/jdsportsuk/carts"
	req, err := http.NewRequest("POST", uri, nil)
	if err != nil {
		return err
	}
	req.Header.Set("referer", "https://www.jdsports.co.uk/product/white-nike-dunk-low-infant/16071416/")

	return nil
}
