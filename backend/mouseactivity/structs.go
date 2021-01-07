package mouseactivity

//MouseEvent ...
type MouseEvent struct {
	//AltKey             bool          `json:"altKey"`
	//Bubbles            bool          `json:"bubbles"`
	//Button             int           `json:"button"`
	//Buttons            int           `json:"buttons"`
	//CancelBubble       bool          `json:"cancelBubble"`
	//Cancelable         bool          `json:"cancelable"`
	ClientX int `json:"clientX"`
	ClientY int `json:"clientY"`
	//Composed           bool          `json:"composed"`
	//CtrlKey            bool          `json:"ctrlKey"`
	//CurrentTarget      interface{}   `json:"currentTarget"`
	//DefaultPrevented   bool          `json:"defaultPrevented"`
	//Detail             int           `json:"detail"`
	//EventPhase         int           `json:"eventPhase"`
	//FromElement        interface{}   `json:"fromElement"`
	//IsTrusted          bool          `json:"isTrusted"`
	//LayerX             int           `json:"layerX"`
	//LayerY             int           `json:"layerY"`
	//MetaKey            bool          `json:"metaKey"`
	//MovementX          int           `json:"movementX"`
	//MovementY          int           `json:"movementY"`
	//OffsetX            int           `json:"offsetX"`
	//OffsetY            int           `json:"offsetY"`
	PageX int `json:"pageX"`
	PageY int `json:"pageY"`
	//Path               []interface{} `json:"path"`
	//RelatedTarget      interface{}   `json:"relatedTarget"`
	//ReturnValue        bool          `json:"returnValue"`
	//ScreenX            int           `json:"screenX"`
	//ScreenY            int           `json:"screenY"`
	//ShiftKey           bool          `json:"shiftKey"`
	//SourceCapabilities interface{}   `json:"sourceCapabilities"`
	//SrcElement         interface{}   `json:"srcElement"`
	//Target             interface{}   `json:"target"`
	TimeStamp int32 `json:"timeStamp"`
	//ToElement          interface{}   `json:"toElement"`
	Type string `json:"type"`
	//View               interface{}   `json:"view"`
	//Which              int           `json:"which"`
	//X                  int           `json:"x"`
	//Y                  int           `json:"y"`
}
