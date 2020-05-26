const { mainWindow, google } = require('../../main/windows');

class GoogleLogin {
	constructor(_name, _type) {
		this.name = _name;
		this.type = _type
		this.spawn();
	}

	spawn() {
		google.create(this.name);
		google.load();
		google.window.once('closed', () => {
			google.window = null;
			mainWindow.window.webContents.send('logged into google', {
				type: this.type
			});
		})
	}
}

module.exports = GoogleLogin;