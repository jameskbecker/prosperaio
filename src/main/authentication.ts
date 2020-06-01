const { machineIdSync } = require('node-machine-id');
const request = require('request');

function authenticate(userKey:string, callback:Function):any {
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
	}, (error:any, response:any, body:any):void => {
		if (error) {
			callback('Unable to connect to ProsperAIO servers. Please try again.');
			return;
		}
		else {
			switch (response.statusCode) {
				case 200:
					body.message === 'successful' ? callback(null, true) : callback('Invalid licence key. Please try again.', false);
					return;
				default: 
					callback('Unable to connect to ProsperAIO servers. Please try again.');
					return;
			}
		}
		
	
	});
}

export { authenticate };