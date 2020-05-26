exports.set = function (name, value) {
	try {
		delete this.cookieJar._jar.store.idx['' + this.baseUrl.replace('https://', '')]['/']['' + name];

	} catch (err) { }
	try {
		let cookie = `${name}=${value}`;
		
		this.cookieJar.setCookie(cookie, this.baseUrl);
	} catch (err) { }
};

exports.get = function (name) {
	try {
		return this.cookieJar._jar.store.idx['' + this.baseUrl.replace('https://', '')]['/'][name].value;

	} catch (err) { console.error(err) }
};


exports.delete = function  (name) {
	try {
		delete this.cookieJar._jar.store.idx['' + this.baseUrl.replace('https://', '')]['/']['' + name];
	} catch (err) { }
};