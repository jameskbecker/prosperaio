
const DiscordRPC = require('discord-rpc');
const { app } = require('electron');
exports.setPresence = function() {
	const rpc = new DiscordRPC.Client({
		transport: 'ipc'
	})
	rpc.on('ready', () => {
		rpc.setActivity({
			details: `Version ${app.getVersion()}`,
			startTimestamp: new Date(),
			instance: false,
			largeImageKey: 'prosperaio_logo'
		})
	})
	let clientId = '648966990400061451'
	rpc.login({ clientId }).catch((e) => {console.log(e)})
}	
