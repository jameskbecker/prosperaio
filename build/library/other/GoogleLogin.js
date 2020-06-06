var Main = require('../../Main').Main;
var GoogleWindow = require('../../main/windows').GoogleWindow;
var GoogleLogin = (function () {
    function GoogleLogin(_name, _type) {
        this.name = _name;
        this.type = _type;
        this.spawn();
    }
    GoogleLogin.prototype.spawn = function () {
        var _this = this;
        GoogleWindow.create(this.name);
        GoogleWindow.load();
        GoogleWindow.window.once('closed', function () {
            var _a;
            GoogleWindow.window = null;
            (_a = Main.mainWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('logged into GoogleWindow', {
                type: _this.type
            });
        });
    };
    return GoogleLogin;
}());
module.exports = GoogleLogin;
//# sourceMappingURL=GoogleLogin.js.map