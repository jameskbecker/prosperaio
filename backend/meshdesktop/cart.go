package meshdesktop

import (
	"net/http"
	"strconv"
)

func (t *task) add() error {
	uri := t.baseURL + "/cart/" + strconv.Itoa(t.sku)
	req, err := http.NewRequest("POST", uri, nil)
	if err != nil {
		return err
	}
	req.Header.Set("referer", "https://www.jdsports.co.uk/product/white-nike-dunk-low-infant/16071416/")

	return nil
}

func (t *task) updateDelivery() {

}
