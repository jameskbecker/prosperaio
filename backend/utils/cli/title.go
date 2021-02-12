package cli

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

//TitleCounts ...
type TitleCounts struct {
	Cart, Checkout, Proxy int
}

//UpdateTitle ...
func UpdateTitle(c TitleCounts) {
	title := []string{
		"ProsperAIO v" + os.Getenv("version"),
		"Carted: " + strconv.Itoa(c.Cart),
		"Checkouts: " + strconv.Itoa(c.Checkout),
		"Proxies: " + strconv.Itoa(c.Proxy),
	}

	if runtime.GOOS != "darwin" {
		exec.Command("title", strings.Join(title, " | ")).Run()
		return
	}
	fmt.Print("\033]0;" + strings.Join(title, " | ") + "\007")
}
