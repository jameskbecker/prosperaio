package log

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

//Reset ...
const Reset = "\u001b[0m"

//Red ...
const Red = Reset + "\u001b[31m"

//Green ...
const Green = Reset + "\u001b[32m"

//Yellow ...
const Yellow = Reset + "\u001b[33m"

//Blue ...
const Blue = Reset + "\u001b[34m"

//Magenta ...
const Magenta = Reset + "\u001b[35m"

//Cyan ...
const Cyan = Reset + "\u001b[36m"

//Bold ...
const Bold = Reset + "\u001b[1m"

//Logger ...
type Logger struct {
	Prefix string
}

//Info ...
func (l *Logger) Info(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + Green + l.Prefix + m + Reset)
}

//Warn ...
func (l *Logger) Warn(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + Yellow + l.Prefix + m + Reset)
}

//Debug ...
func (l *Logger) Debug(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + Blue + l.Prefix + m + Reset)
}

//Error ...
func (l *Logger) Error(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + Red + l.Prefix + m + Reset)
}

//TitleCounts ...
type TitleCounts struct {
	Cart, Checkout, Proxy int
}

//UpdateTitle ...
func UpdateTitle(a string, b *TitleCounts) {
	title := []string{
		"ProsperAIO v" + a,
		"Carted: " + strconv.Itoa(b.Cart),
		"Checkouts: " + strconv.Itoa(b.Checkout),
		"Proxies: " + strconv.Itoa(b.Proxy),
	}
	fmt.Print("\033]0;" + strings.Join(title, " | ") + "\007")
}
