var electron = require('electron');
var app = electron.app, BrowserWindow = electron.BrowserWindow;
var isDev = require('electron-is-dev');
function createWindow(taskId) {
    var threeDSWindow = new BrowserWindow({
        width: 450,
        height: 555,
        frame: false,
        show: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    global['CARDINAL_SOLVERS'][taskId] = threeDSWindow;
}
function loadWindow(id, callback) {
    var window = global['CARDINAL_SOLVERS'][id];
    window.loadFile(app.getAppPath() + "/assets/3d-secure.html");
    window.webContents.once('dom-ready', function () {
        if (isDev) {
        }
        window.show();
        callback();
    });
}
module.exports = {
    create: createWindow,
    load: loadWindow,
    window: null
};
//# sourceMappingURL=ThreeDSWindow.js.map