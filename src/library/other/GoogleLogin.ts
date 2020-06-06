const { Main } = require('../../Main');
const { GoogleWindow } = require('../../main/windows');

interface GoogleLogin {
	name: string;
	type: string;
}

class GoogleLogin {
	constructor(_name:string, _type:string) {
		this.name = _name;
		this.type = _type;
		this.spawn();
	}

	spawn():void {
		GoogleWindow.create(this.name);
		GoogleWindow.load();
		GoogleWindow.window.once('closed', () => {
			GoogleWindow.window = null;
			Main.mainWindow?.webContents.send('logged into GoogleWindow', {
				type: this.type
			});
		});
	}
}

module.exports = GoogleLogin;