const Task = require('../../tasks/base');
const request = require('request');
const status = require('../../tasks/task-status');

class Shopify extends Task {
	constructor() {
		this.apiAccessToken = null;
		this.checkoutToken = null;
		this.sessionId = null;
		this.status = status;
		this.request = request;
	}

	run() {

	}
}