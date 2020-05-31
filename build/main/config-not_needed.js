var electron = require("electron");
var app = electron.hasOwnProperty('app') ? electron.app : electron.remote.app;
var os = require("os");
var isDev = require("electron-is-dev");
var path = require("path");
var interfaceAuthPath, interfaceMainPath, interfaceHarvesterPath, interfaceThreeDSPath, interfaceWorkerPath, userSettingsPath, version;
if (isDev) {
    interfaceAuthPath = "file:///" + app.getAppPath() + "/assets/authenticator.html";
    interfaceMainPath = "file:///" + app.getAppPath() + "/assets/index.html";
    interfaceHarvesterPath = app.getAppPath() + "/assets/harvester.html";
    interfaceThreeDSPath = app.getAppPath() + "/assets/3d-secure.html";
    interfaceWorkerPath = "file:///" + app.getAppPath() + "/assets/worker.html";
    userSettingsPath = app.getPath("userData") + "/config.json";
    version = "XXXAIO V" + app.getVersion() + " DEVELOPMENT";
}
else {
    interfaceAuthPath = "file:///" + app.getAppPath() + "/assets/authenticator.html";
    interfaceMainPath = "file:///" + app.getAppPath() + "/assets/index.html";
    interfaceHarvesterPath = app.getAppPath() + "/assets/harvester.html";
    interfaceThreeDSPath = app.getAppPath() + "/assets/3d-secure.html";
    interfaceWorkerPath = "file:///" + app.getAppPath() + "/assets/worker.html";
    userSettingsPath = app.getPath("userData") + "/config.json";
    version = "XXXAIO V" + app.getVersion() + " PRODUCTION";
}
module.exports = {
    "name": "XXXAIO",
    "author": "XXXAIO",
    "copyright": "Copyright © 2019 XXXAIO.",
    "version": version,
    "loginWindowPath": interfaceAuthPath,
    "threeDSWindowPath": interfaceThreeDSPath,
    "mainWindowPath": interfaceMainPath,
    "captchaWindowPath": interfaceHarvesterPath,
    "workerWindowPath": interfaceWorkerPath,
    "twitter": "https://www.twitter.com/tripplexaio",
    "instagram": "https://www.instagram.com/tripplexaio",
    "homepage": "https://www.xxxaio.com"
};
//# sourceMappingURL=config-not_needed.js.map