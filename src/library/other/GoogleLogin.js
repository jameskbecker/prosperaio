const { GoogleWindow } = require('../../main/windows');

class GoogleLogin {
	constructor(_name, _type) {
		this.name = _name;
		this.type = _type;
		this.spawn();
	}

	spawn() {
		GoogleWindow.create(this.name);
		GoogleWindow.load();
		GoogleWindow.window.once('closed', () => {
			GoogleWindow.window = null;
			mainWindow.webContents.send('logged into GoogleWindow', {
				type: this.type
			});
		});
	}
}

module.exports = GoogleLogin;