exports.getCookies = async function() {
	await this.page.goto('https://www.supremenewyork.com/mobile');
	return this.page.cookies('www.supremenewyork.com', '.supremenewyork.com').then(cookies => {
		return cookies;
	})
}