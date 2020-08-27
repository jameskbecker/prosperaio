import { ChildProcess, exec } from 'child_process';
import electron, { app, protocol, session, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';

import moment from 'moment';
import net from 'net';
import path from 'path';
import React, { useEffect } from 'react';
import ticket from './ticket';

import taskConfig from './task.config';

function setTerminalTitle(title: string): void {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}

const log = function (...message: string[]) {
    console.log(
        '\x1b[0m' +
        moment().format('DD/MM/YYYY HH:mm:ss.SSSS') +
        ' ' +
        message.join(' ')
    );
};

let connections: net.Socket[] = [];

const init = (): void => {
    setTerminalTitle('ProsperAIO CLI - [ Tasks: 0 - Carted: 0 - Checkouts: 0');
    const socketPath = '/tmp/prosperaio.sock';

    const { goProcess, goServer } = createServer(socketPath);

    goProcess.stdout.on('data', (data: string) => {
        log('[ GO ]', data);
    });
    goProcess.stderr.on('data', (data: string) => {
        log('[ GO ]', data);
    });
    // goProcess.stdin.on('data', (data: string) => { log('[ GO ]', data); });
    goServer.listen(socketPath);
    goServer.on('connection', () => {
        log('[MAIN]', 'Client Connected.');

        connections[0].write(
            Buffer.from(
                JSON.stringify({
                    channel: 'task.run',
                    args: taskConfig
                })
            )
        );
    });
};

function createServer( socketPath: string ): { goProcess: ChildProcess; goServer: net.Server; } {
    log('[MAIN]', 'Checking for leftover socketPath.');
    try {
        fs.statSync(socketPath);
        try {
            log('[MAIN]', 'Removing leftover socketPath.');
            fs.unlinkSync(socketPath);
        } catch (err) {
            console.error(err);
            process.exit(0);
        }
    } catch (err) {
        log('[MAIN]', 'No leftover socketPath found.');
    }
    log('[MAIN]', 'Starting Go Server');

    const goServer = net.createServer((socket: net.Socket) => {
        log('[MAIN]', 'Connection acknowledged.');
        // socket.on('end', function () {
        //     delete global.go;
        // });

        // Messages are buffers. use toString
        //let data = '';
        socket.on('data', function (_data: Buffer) {
            let chunk = _data.toString();
            let messages = chunk.split(';');

            messages.forEach((m: string) => {
                ipcHandler(m);
            });
        });

        socket.on('end', function () { });
    });

    const goProcess = exec(path.resolve('build', 'go-server'));

    return { goProcess, goServer };
}

function ipcHandler(data: string): void {
    try {
        const args = JSON.parse(data);

        switch (args.channel) {
            case 'task.setStatus':
                log('TASK STATUS:', args.message);
                //mainWindow.webContents.send('task.setStatus', args.id, args.message, args.type);
                break;

            case 'ticket.generate':
                ticketHandler(args);
                break;

            default:
                log('[MAIN] Received Unknown GO IPC Message:', args);
        }
    } catch (err) {
        log(err);
        log(data);
    }
}

function ticketHandler(args: any) {
    fs.readFile(args.ticketPath, async (err, data) => {
        if (err) throw err;
        const ticketCookie = await ticket(data, args.cookies);
        connections[0].write(
            Buffer.from(
                JSON.stringify({
                    channel: 'ticket.response',
                    cookie: ticketCookie,
                })
            )
        );
    });
}

export default () => {
    useEffect(init, []);
    return (
        <>
            <div>Worker</div>
        </>
    );
};