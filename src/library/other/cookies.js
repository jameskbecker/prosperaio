exports.set = function (url, name, value) {
	try {
		delete this.cookieJar._jar.store.idx['' + url]['/']['' + name];

	} catch (err) { }
	try {
		let cookie = `${name}=${value}`;
		this.cookieJar.setCookie(cookie, url);
	} catch (err) { }
};

exports.get = function (url, name) {
	console.log(arguments)
	try {
		return this.cookieJar._jar.store.idx['' + url]['/'][name];

	} catch (err) { console.error(err) }
};


exports.delete = function (url, name) {
	try {
		delete this.cookieJar._jar.store.idx['' + url]['/']['' + name];
	} catch (err) { }
};