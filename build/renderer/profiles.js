var settings = require('electron-settings');
var content = require('./content');
var uuidv4 = require('uuid/v4');
exports.init = function () {
    if (!settings.has('profiles')) {
        settings.set('profiles', {});
    }
    content.profiles();
};
exports.save = function (id, options) {
    if (options === void 0) { options = {}; }
    if (!id)
        id = uuidv4();
    var profileData = settings.get('profiles');
    profileData[id] = options;
    settings.set('profiles', profileData, { prettify: true });
    require('jquery')('#profileModal').modal('hide');
};
exports.delete = function (name) {
    settings.delete("profiles." + name, { prettify: true });
    content.profiles();
};
exports.deleteAll = function () {
    settings.set('profiles', {});
    content.profiles();
};
//# sourceMappingURL=profiles.js.map