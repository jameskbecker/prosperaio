package meshdesktop

import (
	"encoding/json"
	"strings"

	"prosperaio/config"
)

//Using pointers to show type as null
type atcForm struct {
	Customisations          bool         `json:"customisations"`
	CartPosition            *interface{} `json:"cartPosition"`
	RecaptchaResponse       interface{}  `json:"recaptchaResponse"` // -> false or capRespString
	CartProductNotification *interface{} `json:"cartProductNotification"`
	QuantityToAdd           int          `json:"quantityToAdd"`
}

func buildATCForm() ([]byte, error) {
	return json.Marshal(atcForm{
		Customisations:          false,
		CartPosition:            nil,
		RecaptchaResponse:       false,
		CartProductNotification: nil,
		QuantityToAdd:           1,
	})
}

func guestForm(email string) []byte {
	return []byte(`{"email":"` + email + `"}`)
}

type address struct {
	SameDelivery       bool   `json:"useDeliveryAsBilling"`
	Country            string `json:"country"`
	Locale             string `json:"locale"`
	FirstName          string `json:"firstName"`
	LastName           string `json:"lastName"`
	Phone              string `json:"phone"`
	Address1           string `json:"address1"`
	Address2           string `json:"address2"`
	Town               string `json:"town"`
	County             string `json:"county"`
	Postcode           string `json:"postcode"`
	AddressPredict     string `json:"addressPredict"`
	SetOnCart          string `json:"setOnCart"`
	AddressPredictflag string `json:"addressPredictflag"`
}

func addressBookAddForm(profile config.Profile) []byte {
	form := address{
		SameDelivery:       true,
		Country:            getCountry(profile.Billing.Country),
		Locale:             "",
		FirstName:          profile.Billing.FirstName,
		LastName:           profile.Billing.LastName,
		Phone:              profile.Phone,
		Address1:           profile.Billing.Address1,
		Address2:           profile.Billing.Address2,
		Town:               profile.Billing.City,
		County:             "",
		Postcode:           profile.Billing.PostCode,
		AddressPredict:     "",
		SetOnCart:          "deliveryAddressID",
		AddressPredictflag: "false",
	}
	formBytes, _ := json.Marshal(form)

	return formBytes
}

//consider switching to switch statement
func getCountry(code string) string {
	data := map[string]string{
		"de": "Germany",
		"af": "Afghanistan",
		"ax": "Åland Islands",
		"al": "Albania",
		"dz": "Algeria",
		"as": "American Samoa",
		"ad": "Andorra",
		"ao": "Angola",
		"ai": "Anguilla",
		"aq": "Antarctica",
		"ag": "Antigua And Barbuda",
		"ar": "Argentina",
		"am": "Armenia",
		"aw": "Aruba",
		"au": "Australia",
		"at": "Austria",
		"az": "Azerbaijan",
		"bs": "Bahamas",
		"bh": "Bahrain",
		"bd": "Bangladesh",
		"bb": "Barbados",
		"by": "Belarus",
		"be": "Belgium",
		"bz": "Belize",
		"bj": "Benin",
		"bm": "Bermuda",
		"bt": "Bhutan",
		"bo": "Bolivia, Plurinational State Of",
		"bq": "Bonaire, Sint Eustatius And Saba",
		"ba": "Bosnia And Herzegovina",
		"bw": "Botswana",
		"bv": "Bouvet Island",
		"br": "Brazil",
		"io": "British Indian Ocean Territory",
		"bn": "Brunei Darussalam",
		"bg": "Bulgaria",
		"bf": "Burkina Faso",
		"bi": "Burundi",
		"kh": "Cambodia",
		"cm": "Cameroon",
		"ca": "Canada",
		"ic": "Canary Islands",
		"cv": "Cape Verde",
		"ky": "Cayman Islands",
		"cf": "Central African Republic",
		"ea": "Ceuta And Melilla",
		"td": "Chad",
		"cl": "Chile",
		"cn": "China",
		"cx": "Christmas Island",
		"cc": "Cocos (keeling) Islands",
		"co": "Colombia",
		"km": "Comoros",
		"cg": "Congo",
		"cd": "Congo, The Democratic Republic Of The",
		"ck": "Cook Islands",
		"cr": "Costa Rica",
		"ci": "Ivory Coast",
		"hr": "Croatia",
		"cu": "Cuba",
		"cw": "Curaçao",
		"cy": "Cyprus",
		"cz": "Czech Republic",
		"dk": "Denmark",
		"dj": "Djibouti",
		"dm": "Dominica",
		"do": "Dominican Republic",
		"ec": "Ecuador",
		"eg": "Egypt",
		"sv": "El Salvador",
		"gq": "Equatorial Guinea",
		"er": "Eritrea",
		"ee": "Estonia",
		"et": "Ethiopia",
		"fk": "Falkland Islands (malvinas)",
		"fo": "Faroe Islands",
		"fj": "Fiji",
		"fi": "Finland",
		"fr": "France",
		"gf": "French Guiana",
		"pf": "French Polynesia",
		"tf": "French Southern Territories",
		"ga": "Gabon",
		"gm": "Gambia",
		"ge": "Georgia",
		"gh": "Ghana",
		"gi": "Gibraltar",
		"gr": "Greece",
		"gl": "Greenland",
		"gd": "Grenada",
		"gp": "Guadeloupe",
		"gu": "Guam",
		"gt": "Guatemala",
		"gg": "Guernsey",
		"gn": "Guinea",
		"gw": "Guinea-Bissau",
		"gy": "Guyana",
		"ht": "Haiti",
		"hm": "Heard Island And Mcdonald Islands",
		"va": "Holy See (vatican City State)",
		"hn": "Honduras",
		"hk": "Hong Kong",
		"hu": "Hungary",
		"is": "Iceland",
		"in": "India",
		"id": "Indonesia",
		"ir": "Iran, Islamic Republic Of",
		"iq": "Iraq",
		"ie": "Ireland",
		"im": "Isle Of Man",
		"il": "Israel",
		"it": "Italy",
		"jm": "Jamaica",
		"jp": "Japan",
		"je": "Jersey",
		"jo": "Jordan",
		"kz": "Kazakhstan",
		"ke": "Kenya",
		"ki": "Kiribati",
		"kp": "Korea, Democratic People's Republic Of",
		"kr": "Korea, Republic Of",
		"xk": "Kosovo",
		"kw": "Kuwait",
		"kg": "Kyrgyzstan",
		"la": "Lao People's Democratic Republic",
		"lv": "Latvia",
		"lb": "Lebanon",
		"ls": "Lesotho",
		"lr": "Liberia",
		"ly": "Libya",
		"li": "Liechtenstein",
		"lt": "Lithuania",
		"lu": "Luxembourg",
		"mo": "Macao",
		"mk": "Macedonia, The Former Yugoslav Republic Of",
		"mg": "Madagascar",
		"mw": "Malawi",
		"my": "Malaysia",
		"mv": "Maldives",
		"ml": "Mali",
		"mt": "Malta",
		"mh": "Marshall Islands",
		"mq": "Martinique",
		"mr": "Mauritania",
		"mu": "Mauritius",
		"yt": "Mayotte",
		"mx": "Mexico",
		"fm": "Micronesia, Federated States Of",
		"md": "Moldova, Republic Of",
		"mc": "Monaco",
		"mn": "Mongolia",
		"me": "Montenegro",
		"ms": "Montserrat",
		"ma": "Morocco",
		"mz": "Mozambique",
		"mm": "Myanmar",
		"na": "Namibia",
		"nr": "Nauru",
		"np": "Nepal",
		"nl": "Netherlands",
		"nc": "New Caledonia",
		"nz": "New Zealand",
		"ni": "Nicaragua",
		"ne": "Niger",
		"ng": "Nigeria",
		"nu": "Niue",
		"nf": "Norfolk Island",
		"mp": "Northern Mariana Islands",
		"no": "Norway",
		"om": "Oman",
		"pk": "Pakistan",
		"pw": "Palau",
		"ps": "Palestinian Territory, Occupied",
		"pa": "Panama",
		"pg": "Papua New Guinea",
		"py": "Paraguay",
		"pe": "Peru",
		"ph": "Philippines",
		"pn": "Pitcairn",
		"pl": "Poland",
		"pt": "Portugal",
		"pr": "Puerto Rico",
		"qa": "Qatar",
		"re": "Reunion, Island Of (re)",
		"ro": "Romania",
		"ru": "Russian Federation",
		"rw": "Rwanda",
		"bl": "St Barthelemy",
		"sh": "Saint Helena, Ascension And Tristan Da Cunha",
		"kn": "Saint Kitts And Nevis",
		"lc": "Saint Lucia",
		"mf": "Saint Martin (french Part)",
		"pm": "Saint Pierre And Miquelon",
		"vc": "Saint Vincent And The Grenadines",
		"ws": "Samoa",
		"sm": "San Marino",
		"st": "Sao Tome And Principe",
		"sa": "Saudi Arabia",
		"sn": "Senegal",
		"rs": "Serbia",
		"sc": "Seychelles",
		"sl": "Sierra Leone",
		"sg": "Singapore",
		"sx": "St Maarten",
		"sk": "Slovakia",
		"si": "Slovenia",
		"sb": "Solomon Islands",
		"so": "Somalia",
		"za": "South Africa",
		"gs": "South Georgia And The South Sandwich Islands",
		"ss": "South Sudan",
		"es": "Spain",
		"lk": "Sri Lanka",
		"sd": "Sudan",
		"sr": "Suriname",
		"sj": "Svalbard And Jan Mayen",
		"sz": "Swaziland",
		"se": "Sweden",
		"ch": "Switzerland",
		"sy": "Syrian Arab Republic",
		"tw": "Taiwan, Province Of China",
		"tj": "Tajikistan",
		"tz": "Tanzania, United Republic Of",
		"th": "Thailand",
		"tl": "Timor-Leste",
		"tg": "Togo",
		"tk": "Tokelau",
		"to": "Tonga",
		"tt": "Trinidad And Tobago",
		"tn": "Tunisia",
		"tr": "Turkey",
		"tm": "Turkmenistan",
		"tc": "Turks And Caicos Islands",
		"tv": "Tuvalu",
		"ug": "Uganda",
		"ua": "Ukraine",
		"ae": "United Arab Emirates",
		"gb": "United Kingdom",
		"us": "United States",
		"um": "United States Minor Outlying Islands",
		"uy": "Uruguay",
		"uz": "Uzbekistan",
		"vu": "Vanuatu",
		"ve": "Venezuela, Bolivarian Republic Of",
		"vn": "Vietnam",
		"vg": "Virgin Islands, British",
		"vi": "Virgin Islands, U.S.",
		"wf": "Wallis And Futuna",
		"eh": "Western Sahara",
		"ye": "Yemen",
		"zm": "Zambia",
		"zw": "Zimbabwe",
	}

	if val, ok := data[strings.ToLower(code)]; ok {
		return val + "|" + strings.ToLower(code)
	}

	return ""
}