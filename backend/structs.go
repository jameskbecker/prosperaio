package main

/*----------------------------------- GENERAL -----------------------------------*/

//IPCMessage is received through socket from NodeJS MAIN process
type IPCMessage struct {
	Channel string    `json:"channel"`
	Args    TaskInput `json:"args"`
}

//TaskInput is the user's input to run a task
type TaskInput struct {
	Site         string              `json:"site"`
	ProfileName  string              `json:"profileName"`
	ErrorDelay   int                 `json:"errorDelay"`
	MonitorDelay int                 `json:"monitorDelay"`
	TimeoutDelay int                 `json:"timeoutDelay"`
	ProductInput []taskInputProducts `json:"products"`
}

type taskInputProducts struct {
	Keywords string `json:"searchInput"`
	Size     string `json:"size"`
	Qty      int    `json:"productQty"`
	Category string `json:"category,omitonempty"`
	Style    string `json:"style,omitonempty"`
}

//Profile ...
type Profile struct {
	ProfileName  string   `json:"profileName"`
	Billing      *Contact `json:"billing"`
	Shipping     *Contact `json:"shipping"`
	Payment      *Payment `json:"payment"`
	SameShipping bool
}

//Contact ...
type Contact struct {
	FirstName string `json:"first"`
	LastName  string `json:"last"`
	Email     string `json:"email"`
	Telephone string `json:"telephone"`
	Address1  string `json:"address1"`
	Address2  string `json:"address2"`
	City      string `json:"city"`
	Zip       string `json:"zip"`
	Country   string `json:"country"`
	State     string `json:"state"`
}

//Payment ...
type Payment struct {
	Type       string `json:"type"`
	CardNumber string `json:"cardNumber"`
	ExpMonth   string `json:"expiryMonth"`
	ExpYear    string `json:"expiryYear"`
	Cvv        string `json:"cvv"`
}
