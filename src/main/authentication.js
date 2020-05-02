const { machineIdSync } = require('node-machine-id');
const request = require('request');

exports.authenticate = function(userKey, callback) {
	request({
		url: 'https://q7y84200yh.execute-api.eu-central-1.amazonaws.com/v1/authenticate',
		method: 'POST',
		json: true,
		headers: {
			accept: 'application/json'
		},
		body: {
			'userKey': userKey,
			'device': machineIdSync()
		}
	}, (error, response, body) => {
		if (error) return callback('Unable to connect to XXXAIO servers. Please try again.')
		else {
			switch (response.statusCode) {
				case 200:
					return body.message === 'successful' ? callback(null, true) : callback('Invalid licence key. Please try again.', false);
				default: return callback('Unable to connect to XXXAIO servers. Please try again.');
			}
		}
		
	
	});
}