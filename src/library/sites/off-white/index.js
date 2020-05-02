const Task = require('../../tasks/base');
const request = require('request');

class OffWhite extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.request = request;
		this.cookieJar = request.jar();

		this.bagId;

		this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
	}
}

module.exports = OffWhite;