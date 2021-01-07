import { app, BrowserWindow } from 'electron';
import { ChildProcess, exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import moment from 'moment';
import net from 'net';
import ora from 'ora';
import path from 'path';
import readline from 'readline';
import logo from './logo';
// let mainWindow: BrowserWindow;
// let loginWindow: BrowserWindow;
// let workerWindow: BrowserWindow;
// let captchaWindows: BrowserWindow[];

const blue = '\u001b[34m';
const cyan = '\u001b[36m';
const bold = '\u001b[1m';
const reset = '\u001b[0m';

const log = function (...message: string[]) {
    console.log(
        blue +
        `[${moment().format('DD/MM/YYYY HH:mm:ss.SSSS')}]` +
        ' ' + reset +
        message.join(' ')
    );
};

let connection: net.Socket;

async function main(): Promise<void> {
    const mainWindow = new BrowserWindow({
        'width': 1400,
        'height': 750,
        'backgroundColor': '#8c8f93',//'#1a1919',
        'frame': false,
        'show': true,
        'resizable': true,
        'webPreferences': {
            nodeIntegration: true
        }
    });

    const workerWindow = new BrowserWindow({
        'height': 750,
        'width': 1000,
        'show': false,
        'webPreferences': {
            nodeIntegration: true
        }
    });

    await mainWindow.loadURL('http://localhost:4080#index');
    mainWindow.webContents.openDevTools();
    // await workerWindow.loadURL('http://localhost:4080#worker');
    // workerWindow.webContents.openDevTools();


    //checkSocket();

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });
    // console.log(logo());
    // console.log(bold + 'Welcome to ProsperAIO!' + reset);
    // const loader = ora({ prefixText: '\nInitialising', color: 'white' });

    // const configPath = path.join(os.homedir(), 'ProsperAIO');




    // process.stdout.write();
    //loader.start();

    //const socketPath = '/tmp/prosperaio.sock';
    //const { goProcess, goServer } = createServer(socketPath);

    //goProcess.stdout.on('data', (data: string) => { log(data); });
    //goProcess.stderr.on('data', (data: string) => { console.log('[ ERROR ]', data); });

    //goServer.listen(socketPath);
    // goServer.on('connection', () => {
    //     setTimeout(() => {
    //         loader.stopAndPersist({
    //             prefixText: '\n',
    //         });
    //         log('Select Site (1-3):');
    //         log('1. Kickz');
    //         log('2. Outback');
    //         log('3. Titolo')

    //         rl.question('\n-> ', (input) => {
    //             let site: string;
    //             switch (input) {
    //                 case '1': site = 'kickz';
    //                 break;

    //                 case '2': site = 'outback';
    //                 break;

    //                 case '3': site = 'titolo';
    //                 break;
    //             }
    //             site && connection.write(
    //                 Buffer.from(
    //                     JSON.stringify({ site })
    //                 )
    //             );

    //         });
    //     }, 2000);
    //     //loader.stop();


    // });

    
}

//main();
app.on('ready', main);


function createServer(socketPath: string): { goProcess: ChildProcess; goServer: net.Server; } {
    try {
        fs.statSync(socketPath);
        try {
            fs.unlinkSync(socketPath);
        } catch (err) {
            console.error(err);
            process.exit(0);
        }
    } catch (err) { }

    const goServer = net.createServer((socket: net.Socket) => {
        connection = socket;
        socket.on('data', function (_data: Buffer) {
            let chunk = _data.toString();
            let messages = chunk.split(';');

            messages.forEach((m: string) => {
                //ipcHandler(m);
            });
        });

        socket.on('end', function () { });
    });

    const goProcess = exec(path.resolve('build', 'go-server'));

    return { goProcess, goServer };
}



// function setupIntercept(): void {
//     protocol.interceptBufferProtocol('http', (req: Electron.Request, callback: (buffer?: Buffer) => void) => {
//         const u = url.parse(req.url);
//         let realUrl = '';
//         if (u.host === 'www.supremenewyork.com') {
//             realUrl = 'http://localhost:4000' + u.path;
//         }
//         else realUrl = req.url;
//         try {
//             const request = electron.net.request(realUrl);
//             request.on('response', (res: any) => {
//                 let data: Buffer[] = [];
//                 res.on('data', (chunk: string) => {
//                     data.push(Buffer.from(chunk));
//                 });

//                 res.on('end', () => {
//                     callback(Buffer.concat(data));
//                 });
//             });

//             request.on('error', (error: Error) => { console.error(error); });
//             request.end();
//         }
//         catch (err) {
//             console.log('Error Intercepting Request', err);
//         }
//     });
// }











// captchaWindows = [];
// const ses = session.fromPartition('persist:test')

// let captchaWindow = new BrowserWindow({
//     width: 480,
//     height: 650,
//     frame: false,
//     show: false,
//     webPreferences: {
//         nodeIntegration: true,
//         webSecurity: false,
//         session: ses
//     },
// });





// await captchaWindow.webContents.session.setProxy({
//     proxyRules: 'http://localhost:4000',
//     proxyBypassRules: '.google.com, .gstatic.com',

// });

// await captchaWindow.loadURL('http://www.supremenewyork.com/#captcha');


// // captchaWindow.webContents.openDevTools({mode: 'undocked'})
// // captchaWindow.show();

// ipcMain.on('captcha.response', (e, ...args: any[]) => {
//     console.log(args);
//     const [ taskId, token, ts ] = args;
//     console.log({ taskId, token, ts });
// })

// setTimeout(() => {
//     captchaWindow.webContents.send('captcha.request', 'testID', '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz');
// }, 4000);



