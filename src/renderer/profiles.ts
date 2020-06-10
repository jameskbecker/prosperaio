const settings = require('electron-settings');
const content = require('./content');
const uuidv4 = require('uuid/v4');

export function init():void  {
	if (!settings.has('profiles')) { settings.set('profiles', {}); }
	content.profiles();
}

export function save(id:string, options:any = {}):void {
	if(!id) id = uuidv4();
	let profileData = settings.get('profiles');
	profileData[id] = options;
	settings.set('profiles', profileData, { prettify: true });
	
	require('jquery')('#profileModal').modal('hide');
}

export function clear(name:string):void {
	settings.delete(`profiles.${name}`, { prettify: true });
	content.profiles();
}

export function deleteAll():void {
	settings.set('profiles', {});
	content.profiles();
}