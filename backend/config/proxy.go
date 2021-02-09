package config

import (
	"os"
	"path"
	"prosperaio/utils/cli"
	"strings"
)

//LoadProxies ...
func LoadProxies() (proxies []string) {
	homedir, _ := os.UserHomeDir()
	proxyFolder := path.Join(homedir, "ProsperAIO", "proxies")
	proxyPaths := GetDirPaths(proxyFolder, ".txt")

	items := append(proxyPaths, "Back", "Exit")
	i := cli.GetUserInput("Select Proxy File", items)

	switch i {
	case len(items) - 2: //Back
		return
	case len(items) - 1: //Exit
		os.Exit(0)
		return
	default:
		sPath := path.Join(proxyFolder, proxyPaths[i])
		bData, _ := LoadTXT(sPath)
		proxies = strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})
	}
	return
}
