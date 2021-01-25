package meshdesktop

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"../client"
	"../log"
)

//Run mesh desktop task
func Run(i Input, taskID int, wg *sync.WaitGroup) {
	c, _ := client.Create(i.Proxy)
	pURL, err := url.Parse(i.MonitorInput)
	if err != nil {

	}
	splitPath := strings.Split(pURL.Path, "/")
	sku, err := strconv.Atoi(splitPath[3])
	if err != nil {

	}
	t := task{
		size:   i.Size,
		id:     taskID,
		sku:    sku,
		client: &c,
	}
	t.updatePrefix()
	t.log.Debug("Starting Task")
	wg.Done()
}
func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	prefix := "[" + tID + "] [jd_desktop] [" + t.size + "] [" + strconv.Itoa(t.sku) + "] "
	t.log = log.Logger{Prefix: prefix}
}
