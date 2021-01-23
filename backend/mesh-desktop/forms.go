package mesh

import "encoding/json"

func (t *task) addressBookAddForm() ([]byte, error) {
	form := address{
		SameDelivery: true,
		Country:      "",
		Locale:       "",
		FirstName:    "",
		LastName:     "",
		Phone:        "",
		Address1:     "",
		Address2:     "",
		Town:         "",
		County:       "",
	}
	formBytes, err := json.Marshal(form)
	if err != nil {
		return nil, err
	}

	return formBytes, nil
}
