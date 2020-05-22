const electron = require('electron');
const { BrowserWindow, session } = electron;
const path = require('path')
const puppeteer = require('puppeteer-extra');

const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())
function createWindow(accountName) {
	const googleWindow = new BrowserWindow({
		width: electron.screen.getPrimaryDisplay().workAreaSize.width / 2,
		height: electron.screen.getPrimaryDisplay().workAreaSize.height / 2,
		frame: true,
		show: false,
		webPreferences: {
			session: session.fromPartition(`persist: ${accountName}`),
			nodeIntegration: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})
	module.exports.window = googleWindow;
}

async function loadWindow() {
	const googleWindow = module.exports.window;
	googleWindow.loadURL('https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Dm%26hl%3Den-GB%26next%3Dhttps%253A%252F%252Fm.youtube.com%252F&hl=en-GB', {
		userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1'
	});
	googleWindow.show();
}	

module.exports = {
	create: createWindow,
	load: loadWindow,
	window: null
}