package kickz

import (
	"log"
	"net/http"
	"sync"
)

//Run kickz task
func Run(wg *sync.WaitGroup, o *Options) {
	var t Task
	log.Println(o)
	t.Options = o
	t.Client = &http.Client{}
	t.UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
	wg.Done()
}
