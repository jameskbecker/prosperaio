const getKeys = require('./get-keys');

exports.createSession = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					this.setStatus('CREATING SESSION', 'WARNING')();
					await getKeys.init();
					await getKeys.generate.bind(this)();
				}
				catch(err) {

				}
			}
		}
	})
}