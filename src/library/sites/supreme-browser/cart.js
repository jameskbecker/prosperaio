exports.add = function () {
	return new Promise(async (resolve, reject) => {
		try {
			
				resolve();
			
		}
		catch (err) {
			console.log(err);
			reject(err)
		}
	})
}