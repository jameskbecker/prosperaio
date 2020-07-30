const fs = require("fs");
const net = require("net");
const SOCKETFILE = "/tmp/prosperaio.sock"


// Connect to server.
console.log("Connecting to server.");
client = net.createConnection(SOCKETFILE)
    .on('connect', () => {
        console.log("Connected.");
        var message = {
            channel: "task.run",
            args: {
                id: "Abc123"
            }
        };
        client.write(JSON.stringify(message));
        client.end()
    })
    // Messages are buffers. use toString
    .on('data', function (data) {
        data = data.toString();

        if (data === '__boop') {
            console.info('Server sent boop. Confirming our snoot is booped.');
            client.write('__snootbooped');
            return;
        }
        if (data === '__disconnect') {
            console.log('Server disconnected.')
            return cleanup();
        }

        // Generic message handler
        console.info('Server:', data)
    })
    .on('error', function (data) {
        console.error('Server not active.'); process.exit(1);
    })
    ;

// Handle input from stdin.


// if (inputbuffer.indexOf("\n") !== -1) {
//     var line = inputbuffer.substring(0, inputbuffer.indexOf("\n"));
//     inputbuffer = inputbuffer.substring(inputbuffer.indexOf("\n") + 1);
//     // Let the client escape
//     if (line === 'exit') { return cleanup(); }
//     if (line === 'quit') { return cleanup(); }
   
// }

function cleanup() {
    if (!SHUTDOWN) {
        SHUTDOWN = true;
        console.log('\n', "Terminating.", '\n');
        client.end();
        process.exit(0);
    }
}
process.on('SIGINT', cleanup);