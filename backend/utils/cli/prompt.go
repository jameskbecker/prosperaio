package cli

import (
	"os"

	"github.com/AlecAivazis/survey/v2"
)

//GetUserInput ...
func GetUserInput(label string, items []string) int {
	selection := 0
	prompt := &survey.Select{
		Message: label,
		Options: items,
	}

	survey.AskOne(prompt, &selection)
	return selection
}

type bellSkipper struct{}

// Write implements an io.WriterCloser over os.Stderr, but it skips the terminal
// bell character.
func (bs *bellSkipper) Write(b []byte) (int, error) {
	const charBell = 7 // c.f. readline.CharBell
	if len(b) == 1 && b[0] == charBell {
		return 0, nil
	}
	return os.Stderr.Write(b)
}

// Close implements an io.WriterCloser over os.Stderr.
func (bs *bellSkipper) Close() error {
	return os.Stderr.Close()
}
