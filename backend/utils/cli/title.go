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

//IncrementCount ...
func IncrementCount(key string) {
	strVal := os.Getenv(key)
	count, _ := strconv.Atoi(strVal)
	count++
	os.Setenv(key, strconv.Itoa(count))
	UpdateTitle()
}

//UpdateTitle ...
func UpdateTitle() {
	title := []string{
		"ProsperAIO v" + os.Getenv("version"),
		"Carted: " + os.Getenv("cartCount"),
		"Checkouts: " + os.Getenv("checkoutCount"),
		"Proxies: " + os.Getenv("proxyCount"),
	}

	if runtime.GOOS != "darwin" {
		exec.Command("title", strings.Join(title, " | ")).Run()
		return
	}
	fmt.Print("\033]0;" + strings.Join(title, " | ") + "\007")
}
