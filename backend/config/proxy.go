package config

import (
	"os"
	"path"
	"prosperaio/utils/cli"
	"strings"
)

//LoadProxies ...
func LoadProxies() []string {
	homedir, _ := os.UserHomeDir()
	proxyFolder := path.Join(homedir, "ProsperAIO", "proxies")
	proxyPaths := GetDirPaths(proxyFolder, ".txt")

	i := cli.GetUserInput("Select Proxy File", proxyPaths)
	sPath := path.Join(proxyFolder, proxyPaths[i])
	bData, _ := LoadTXT(sPath)
	data := strings.FieldsFunc(string(bData), func(r rune) bool {
		return string(r) == "\n" || string(r) == "\r"
	})
	return data
}
