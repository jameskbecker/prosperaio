const settings = require('electron-settings');
const content = require('./content');

exports.init = () => {
	if (!settings.has('profiles')) { settings.set('profiles', {}); }
	content.profiles();
}

exports.save = (name, options = {}) => {
	let profileData = settings.get('profiles');
	profileData[name] = options;
	settings.set('profiles', profileData, { prettify: true });
	content.profiles();
}

exports.delete = (name) => {
	settings.delete(`profiles.${name}`, { prettify: true });
	content.profiles();
}

exports.deleteAll = () => {
	settings.set('profiles', {});
	content.profiles();
}