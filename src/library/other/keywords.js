exports.parse = function(input) {
	//if(!input) return '';
	if (input === '') return 'ANY';
	else {
		let output = {
			positive: [],
			negative: []
		};
			let indudvidalWords = input.split(',');
			for (let j = 0; j < indudvidalWords.length; j++) {
				if (indudvidalWords[j].includes('+')) {
					output.positive.push(indudvidalWords[j].trim().toLowerCase().substr(1));
				}
				if (indudvidalWords[j].includes('-')) {
					output.negative.push(indudvidalWords[j].trim().toLowerCase().substr(1));
				}
			}
	
		return output;
	}	
}

exports.isMatch = function(productName, keywordSet) {
	if (!productName || !keywordSet) {
		return false;
	}
	
	else if (keywordSet === 'ANY') {
		return true;
	}
	else {
		for (let i = 0; i < keywordSet.positive.length; i++) {
			if (!productName.includes(keywordSet.positive[i])) {
				return false;
			}
		}
		for (let i = 0; i < keywordSet.negative.length; i++) {
			if (productName.includes(keywordSet.negative[i])) {
				return false;
			}
		}
		return true;
	}
}
