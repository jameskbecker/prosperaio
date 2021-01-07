package demandware

import "time"

func (t *Task) warn(msg string) {
	id := ""
	if t.PID != "" {
		id = "[" + t.PID + "] "
	} else if t.BPID != "" {
		id = "[" + t.BPID + "] "
	}
	ts := time.Now().Format("2006-01-02 15:04:05.000000")
	t.lWrn.SetPrefix(yellow + ts + " [" + t.Site + "] [Task " + t.TNbr + "] " + id)
	t.lWrn.Println(msg + reset)
}

func (t *Task) err(msg string) {
	id := ""
	if t.PID != "" {
		id = "[" + t.PID + "] "
	} else if t.BPID != "" {
		id = "[" + t.BPID + "] "
	}
	ts := time.Now().Format("2006-01-02 15:04:05.000000")
	t.lErr.SetPrefix(red + ts + " [" + t.Site + "] [Task " + t.TNbr + "] " + id)
	t.lErr.Println(msg + reset)
}

func (t *Task) info(msg string) {
	id := ""
	if t.PID != "" {
		id = "[" + t.PID + "] "
	} else if t.BPID != "" {
		id = "[" + t.BPID + "] "
	}

	ts := time.Now().Format("2006-01-02 15:04:05.000000")
	t.lInf.SetPrefix(green + ts + " [" + t.Site + "] [Task " + t.TNbr + "] " + id)
	t.lInf.Println(msg + reset)
}

func (t *Task) debg(msg string) {
	id := ""
	if t.PID != "" {
		id = "[" + t.PID + "] "
	} else if t.BPID != "" {
		id = "[" + t.BPID + "] "
	}
	ts := time.Now().Format("2006-01-02 15:04:05.000000")
	t.lDbg.SetPrefix(blue + ts + " [" + t.Site + "] [Task " + t.TNbr + "] " + id)
	t.lDbg.Println(msg + reset)
}
