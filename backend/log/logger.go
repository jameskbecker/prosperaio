package log

import (
	"fmt"
	"time"
)

const reset = "\u001b[0m"
const green = reset + "\u001b[32m"
const red = reset + "\u001b[31m"
const yellow = reset + "\u001b[33m"
const blue = reset + "\u001b[34m"

//Logger ...
type Logger struct {
	Prefix string
}

//Info ...
func (l *Logger) Info(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + green + l.Prefix + m + reset)
}

//Warn ...
func (l *Logger) Warn(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + yellow + l.Prefix + m + reset)
}

//Debug ...
func (l *Logger) Debug(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + blue + l.Prefix + m + reset)
}

//Error ...
func (l *Logger) Error(m string) {
	ts := time.Now()
	fTS := ts.Format("[02/01/2006 15:04:05.000] ")
	fmt.Println(fTS + red + l.Prefix + m + reset)
}
