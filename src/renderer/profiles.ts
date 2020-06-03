const settings = require('electron-settings');
const content = require('./content');
const uuidv4 = require('uuid/v4');

export function init()  {
	if (!settings.has('profiles')) { settings.set('profiles', {}); }
	content.profiles();
}

export function save(id, options = {}) {
	if(!id) id = uuidv4();
	let profileData = settings.get('profiles');
	profileData[id] = options;
	settings.set('profiles', profileData, { prettify: true });
	
	require('jquery')('#profileModal').modal('hide');
}

export function clear(name) {
	settings.delete(`profiles.${name}`, { prettify: true });
	content.profiles();
}

export function deleteAll() {
	settings.set('profiles', {});
	content.profiles();
}