package outback

import "net/http"

func addToCart() error {
	//https://www.outback-sylt.de/warenkorb/hinzugefuegen
	//https://www.outback-sylt.de/en/cart/add
	url := "https://www.outback-sylt.de/en/cart/add"
	_, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return err
	}

	return nil
}

type addToCartBase struct {
	ProductBSID int
	ProductID   int
	Amount      int
	AddToCart   string
	Ajax        bool
}

type addToCartForm struct {
	
}
