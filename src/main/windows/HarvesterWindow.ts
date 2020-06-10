import { app, BrowserWindow, session, protocol, net } from 'electron';
import bodyParser from 'body-parser';
import fs from 'fs';
import express from 'express';
import path from 'path';
import isDev from 'electron-is-dev';
import harvesterConfiguration from '../../library/configuration/sitekeys';

interface HarvesterWindow {
	state: string;
	siteType: string;
	config: any;
	sessionName: string;
	server: any;
	serverPort: number;
	window: BrowserWindow;
}

class HarvesterWindow {
	constructor(_sessionName: string, _siteId: string) {
		this.state = 'init';
		this.siteType = _siteId;
		this.config = harvesterConfiguration(_siteId);
		this.sessionName = _sessionName;
		this.server = express();
		this.serverPort;
		this.window = null;
	}

	async spawn(): Promise<void> {
		// this.server
		// 	.use(bodyParser.json())
		// 	.use(bodyParser.urlencoded({
		// 		extended: true
		// 	}))
		// 	.use('/assets', express.static(path.join(app.getAppPath(), 'assets')))
		// 	.use('/build', express.static(path.join(app.getAppPath(), '..', 'build')))
		// 	.use('/library', express.static(path.join(app.getAppPath(), 'build/library')))
		// 	.use('/assets/fontawesome', express.static(path.join(app.getAppPath(), 'node_modules/@fortawesome/fontawesome-free')))
		// 	.get('/', (req, res) => {
		// 		res.sendFile(`file:///${Main.application.getAppPath()}/assets/renderer/index.html`);
		// 	})
		// 	.get('/config', (req, res) => {
		// 		res.json({
		// 			sessionName: this.sessionName,
		// 			site: this.siteType
		// 		});
		// 	});
		// this.serverPort = Math.floor(Math.random() * 9999) + 1000;
		// this.server.listen(this.serverPort);

		let captchaSession = session.fromPartition('persist:' + this.sessionName);

		// let prox;
		// setInterval(() => console.log(prox), 1000);
		// captchaSession.setp
		// .then(() => {
		// 	console.log('hi');
		// })
		// .catch((error:Error) => {
		// 	console.log(error);
		// });
		this.window = new BrowserWindow({
			backgroundColor: '#202020',
			height: 600,
			width: 400,
			resizable: false,
			frame: false,
			show: true,
			alwaysOnTop: false,
			webPreferences: {
				'nodeIntegration': true,
				'webSecurity': false,
				'session': captchaSession
			}
		});

		this.window.webContents.session.protocol.interceptBufferProtocol('http', (request: Electron.Request, callback) => {

			if (request.url.includes(this.config.domain)) {
				let reqPath = request.url.split('.com/')[1] === '' ? 'assets/harvester.html' : request.url.split('.com')[1];
				if (reqPath === '/config') {
					callback(Buffer.from(JSON.stringify({sessionName: this.sessionName,
						site: this.siteType
					})));
					return;
				}
				console.log(path.join(app.getAppPath(), reqPath));
				fs.readFile(path.join(app.getAppPath(), reqPath), 'utf8', function (err: NodeJS.ErrnoException, data: string): void {

					if (err) {
						console.log(err);
						return;
					}
					callback(Buffer.from(data));
				});
			}
			else {
				const req = net.request(request);
				req.on('response', res => {
					const chunks:Buffer[] = [];

					res.on('data', chunk => {
						chunks.push(Buffer.from(chunk));
					});

					res.on('end', async () => {
						const file = Buffer.concat(chunks);
						callback(file);
					});
				});

				// if (request.uploadData) {
				// 	request.uploadData.forEach(part => {
				// 		if (part.bytes) {
				// 			req.write(part.bytes)
				// 		} else if (part.file) {
				// 			req.write(fs.readFileSync(part.file))
				// 		}
				// 	})
				//}
				req.end();
			}
		});


		this.window.loadURL(`http://${this.config.domain}`, {
			//userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1'
		});
		if (isDev) this.window.webContents.openDevTools({ mode: 'undocked' });
		this.window.webContents.once('did-finish-load', () => {
			this.window.show();

		});
		// });
	}
}

export default HarvesterWindow;