package wearestrap

import (
	"fmt"
	"sync"
	"time"
)

//Run --
func Run(t *sync.WaitGroup) {
	fmt.Println("hello")
	time.Sleep(2000 * time.Millisecond)
	fmt.Println("World")
	t.Done()
}
