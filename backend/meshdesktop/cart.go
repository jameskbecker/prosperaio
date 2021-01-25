package meshdesktop

import "net/http"

func (t *task) add() error {
	uri := t.baseURL + "/cart/" + t.sku
	req, err := http.NewRequest("POST", uri, nil)
	if err != nil {
		return err
	}
	req.Header.Set("referer", "https://www.jdsports.co.uk/product/white-nike-dunk-low-infant/16071416/")

	return nil
}

func (t *task) updateDelivery() {

}
