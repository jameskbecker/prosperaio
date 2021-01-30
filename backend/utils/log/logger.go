package log

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
)

// //Reset ...
// var Reset = strconv.Itoa(int(color.Reset))

// //Red ...
// var Red = Reset + "\u001b[32m"

// //Green ...
// var Green = Reset + "\u001b[32m"

// //Yellow ...
// var Yellow = Reset + "\u001b[33m"

// //Blue ...
// var Blue = Reset + "\u001b[34m"

// //Magenta ...
// var Magenta = Reset + "\u001b[35m"

// //Cyan ...
// var Cyan = Reset + "\x1b[36m"

// //Bold ...
// var Bold = Reset + "\u001b[1m"

//Logger ...
type Logger struct {
	Prefix string
}

//Info ...
func (l *Logger) Info(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000 MST] ")
	color.Green(fTS + l.Prefix + m)
}

//Warn ...
func (l *Logger) Warn(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000 MST] ")
	color.Yellow(fTS + l.Prefix + m)
}

//Debug ...
func (l *Logger) Debug(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000 MST] ")
	color.Blue(fTS + l.Prefix + m)
}

//Error ...
func (l *Logger) Error(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000 MST] ")
	color.Red(fTS + l.Prefix + m)
}

//TitleCounts ...
type TitleCounts struct {
	Cart, Checkout, Proxy int
}

//UpdateTitle ...
func UpdateTitle(c *TitleCounts) {
	title := []string{
		"ProsperAIO v" + os.Getenv("version"),
		//"Carted: " + strconv.Itoa(c.Cart),
		//"Checkouts: " + strconv.Itoa(c.Checkout),
		"Proxies: " + strconv.Itoa(c.Proxy),
	}

	if runtime.GOOS != "darwin" {
		exec.Command("title", strings.Join(title, " | ")).Run()
		return
	}
	fmt.Print("\033]0;" + strings.Join(title, " | ") + "\007")
}
