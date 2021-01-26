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
	plu, err := strconv.Atoi(splitPath[3])
	if err != nil {

	}
	t := task{
		productURL: pURL,
		baseURL:    "https://" + pURL.Hostname(),
		size:       i.Size,
		id:         taskID,
		plu:        plu,
		client:     &c,
	}
	//t.sku = strconv.Itoa(t.plu)
	t.updatePrefix()
	t.log.Debug("Starting Task")
	err = t.getStockData()
	if err != nil {
		t.log.Error(err.Error())
	}
	t.log.Debug("SKU: " + t.sku)
	t.log.Debug("Price: " + t.price)
	err = t.add()
	if err != nil {
		t.log.Error(err.Error())
	}

	t.log.Warn("Checking Out")
	err = t.initGuest()
	if err != nil {
		t.log.Error(err.Error())
	}

	wg.Done()
}
func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	prefix := "[" + tID + "] [jd_desktop] [" + t.size + "] "
	t.log = log.Logger{Prefix: prefix}
}
