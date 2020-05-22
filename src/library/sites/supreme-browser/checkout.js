exports.fillForm = function () {
	return new Promise(async (resolve, reject) => {
		try {
		

			resolve();
		}
		catch (err) {
			console.log(err)
		}
	})
}

exports.submitForm = function () {
	return new Promise(async (resolve, reject) => {
	
	})
}


exports.pollStatus = function () {
	let options = {
		url: this.baseUrl + '/checkout/' + this.slug + '/status.json',
		method: 'GET',
		json: true
	}
	return this.request(options);
}