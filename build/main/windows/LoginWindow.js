var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var isDev = require('electron-is-dev');
function createWindow() {
    var loginWindow = new BrowserWindow({
        backgroundColor: '#1a1919',
        width: electron.screen.getPrimaryDisplay().workAreaSize.width * 0.5,
        height: electron.screen.getPrimaryDisplay().workAreaSize.height / 2,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    module.exports.window = loginWindow;
}
function showWindow() {
    var loginWindow = module.exports.window;
    loginWindow.loadURL(config.loginWindowPath);
    loginWindow.webContents.once('dom-ready', function () {
        loginWindow.show();
        if (isDev)
            loginWindow.webContents.openDevTools();
    });
}
module.exports = {
    create: createWindow,
    show: showWindow,
    window: undefined
};
//# sourceMappingURL=LoginWindow.js.map