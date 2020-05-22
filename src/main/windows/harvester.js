const electron = require('electron');
const { app, BrowserWindow, net, protocol, session } = electron;
const bodyParser = require('body-parser');
const config = require('../../config');
const express = require('express');
const path = require('path')
const isDev = require('electron-is-dev')
const harvesterConfiguration = require('../../library/configuration/sitekeys');

class Harvester {
	constructor(_sessionName, _siteId) {
		this.state = 'init';
		this.siteType = _siteId
		this.config = harvesterConfiguration(_siteId);
		this.sessionName = _sessionName;
		this.server = express();
		this.serverPort
		this.window = null;
	}

	spawn() {
		this.server
			.use(bodyParser.json())
			.use(bodyParser.urlencoded({
				extended: true
			}))
			.use('/assets', express.static(path.join(app.getAppPath(), 'assets')))
			.use('/library', express.static(path.join(app.getAppPath(), 'src/library')))
			.use('/assets/fontawesome', express.static(path.join(app.getAppPath(), 'node_modules/@fortawesome/fontawesome-free')))
			.get('/', (req, res) => {
				res.sendFile(config.captchaWindowPath);
			})
			.get('/config', (req, res) => {
				res.json({
					sessionName: this.sessionName,
					site: this.siteType
				})
			})
		this.serverPort = Math.floor(Math.random() * 9999) + 1000;
		this.server.listen(this.serverPort);

		let captchaSession = session.fromPartition("persist: " + this.sessionName);
		this.window = new BrowserWindow({
			backgroundColor: '#202020',
			height: 600,
			width: 400,
			resizable: false,
			frame: false,
			show: true,
			alwaysOnTop: true,
			webPreferences: {
				'nodeIntegration': true,
				'webSecurity': false,
				'session': captchaSession
			}
		});
		this.window.webContents.session.setProxy({
			proxyRules: 'http=localhost:' + this.serverPort,
			proxyBypassRules: '.google.com, .gstatic.com, .youtube.com'
		})
		.then(() => {
			
			this.window.loadURL(`http://${this.config.domain}:${this.serverPort}`, {
				//userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1'
			});
			//this.window.webContents.once('dom-ready', () => {
				this.window.show();
				if (isDev) this.window.webContents.openDevTools({mode:'undocked'});
			//});
		})
	}
}



module.exports = Harvester;