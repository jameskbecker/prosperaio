"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.clear = exports.save = exports.init = void 0;
var settings = require('electron-settings');
var content = require('./content');
var uuidv4 = require('uuid/v4');
function init() {
    if (!settings.has('profiles')) {
        settings.set('profiles', {});
    }
    content.profiles();
}
exports.init = init;
function save(id, options) {
    if (options === void 0) { options = {}; }
    if (!id)
        id = uuidv4();
    var profileData = settings.get('profiles');
    profileData[id] = options;
    settings.set('profiles', profileData, { prettify: true });
    require('jquery')('#profileModal').modal('hide');
}
exports.save = save;
function clear(name) {
    settings.delete("profiles." + name, { prettify: true });
    content.profiles();
}
exports.clear = clear;
function deleteAll() {
    settings.set('profiles', {});
    content.profiles();
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=profiles.js.map