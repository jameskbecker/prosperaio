package main

import (
	"log"
	"net"
)

func main() {
	var client sender
	client.SocketFile = "/tmp/prosperaio.sock"
	message := []byte("Hello World!")
	client.sendMessage(message)
}

type sender struct {
	SocketFile string
}

func (s *sender) sendMessage(message []byte) {
	c, err := net.Dial("unix", s.SocketFile)
	if err != nil {
		log.Println("Failed to dial:", err)
	}
	defer c.Close()
	count, err := c.Write(message)
	if err != nil {
		log.Println("Write error:", err)
	}
	log.Println("Wrote bytes", count)
}
