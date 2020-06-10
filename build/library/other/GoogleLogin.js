const { Main } = require('../../Main');
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
            var _a;
            GoogleWindow.window = null;
            (_a = Main.mainWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('logged into GoogleWindow', {
                type: this.type
            });
        });
    }
}
module.exports = GoogleLogin;
//# sourceMappingURL=GoogleLogin.js.map