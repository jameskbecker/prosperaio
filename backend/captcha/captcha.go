package captcha

import (
	"os/exec"
	"runtime"
	"sync"
)

//Launch Harvester
func Launch() {
	wg := sync.WaitGroup{}

	wg.Add(1)
	go startServer("jdsports.de", &wg)
	wg.Wait()
}

func openBrowser(url string) bool {
	var args []string
	switch runtime.GOOS {
	case "darwin":
		args = []string{"open"}
	case "windows":
		args = []string{"cmd", "/c", "start"}
	default:
		args = []string{"xdg-open"}
	}
	cmd := exec.Command(args[0], append(args[1:], url)...)
	return cmd.Start() == nil
}
