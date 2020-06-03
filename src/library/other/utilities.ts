import * as request from 'request';
import * as settings from 'electron-settings';

export function generateId (length: number): string {
	const idFormat = 'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvxyz1234567890';
	let id = '';
	while (id.length < length) {
		id += idFormat[Math.floor(Math.random() * idFormat.length)];
	}
	return id;
}

export function formatProxy (input: string | null) : string | null {
	if (!input) {
		return null;
	}
	else if (typeof input== 'string' && ['localhost', '', ' '].indexOf(input) != -1) {
		console.log('no proxy');
		return null;
	}
	else {
		let proxyComponents = input.split(':');
		let ip = proxyComponents[0];
		let port = proxyComponents[1];
		let user = proxyComponents[2];
		let pass = proxyComponents[3];
		
		if (!user || !pass) return 'http://' + ip + ':' + port;
		else return 'http://' + user + ':' + pass + '@' + ip + ':' + port;
	}
}

export function sendTestWebhook (): void {
	if (settings.has('discord')) {
		let webhookUrl:string = <string>settings.get('discord');
		request({
			url: webhookUrl,
			method: 'POST',
			json: true,
			body: {
				embeds: [{
					author: {
						name: 'Test Webhook'
					},
					type: 'rich',
					color: '16007763',
					thumbnail: {
						url: 'https://i.imgur.com/NGGew9J.png',
					},
					fields: [
						{
							name: 'Product:',
							value: 'Product Name',
							inline: false
						},
						{
							name: 'Size:',
							value: 'Size Name',
							inline: true
						},
						{
							name: 'Site:',
							value: 'Site Name',
							inline: true
						},
						{
							name: 'Profile:',
							value: 'Profile Name',
							inline: true
						},
						{
							name: 'Order Number:',
							value: '||1234567890||',
							inline: true
						}

					],
					footer: {
						text: `ProsperAIO Success Monitor • ${new Date().toUTCString()}`,
						icon_url: 'https://i.imgur.com/NGGew9J.png'
					}

				}]
			}
		}, (error, response, body) => {
			if (error) {
				console.log(error);
			}
			else {
				console.log(response.statusMessage);
			}
		});
	}
	else {
		console.log('no custom webhook');
	}
}
