module.exports = function (type, input) {
	switch (type) {
		case 'shopify':
			const shopifySizes = {
				"S": "small",
				"M": "medium",
				"L": "large",
				"XL": "x-large",
				"4.0": "4",
				"4.5": "4.5",
				"5.0": "5",
				"5.5": "5.5",
				"6.0": "6",
				"6.5": "6.5",
				"7.0": "7",
				"7.5": "7.5",
				"8.0": "8",
				"8.5": "8.5",
				"9.0": "9",
				"9.5": "9.5",
				"10.0": "10",
				"10.5": "10.5",
				"11.0": "11",
				"11.5": "11.5",
				"12.0": "12",
				"12.5": "12.5",
				"13.0": "13",
				"13.5": "13.5",
				"14.0": "14",
				"14.5": "14.5",
				"15.0": "15"
			}
			return shopifySizes[input];
		case 'supreme':
			if (input === 'SMALLEST' || input === 'LARGEST' || input === 'RANDOM') return input;
			else {
				const supremeSizes = {
					'OS': 'N/A',
					'S': 'Small',
					'M': 'Medium',
					'L': 'Large',
					'XL': 'XLarge',
					'7.0': '7',
					'7.5': '7.5',
					'8.0': '8',
					'8.5': '8.5',
					'9.0': '9',
					'9.5': '9.5',
					'10.0': '10',
					'10.5': '10',
					'11.0': '11',
					'11.5': '11.5', 
					'12.0': '12',
					'12.5': '12.5',
					'13.0': '13',
					'13.5': '13.5',
					'14.0': '14',
					'14.5': '14.5',
					'15.0': '15'
				}
				return supremeSizes[input];
			}

		case 'kickz':
			const kickzSizes = {
				"XS": "XS",
				"S": "S",
				"M": "M",
				"L": "L",
				"XL": "XL",
				"XXL": "2XL",
				"XXXL": "3XL",
				"4.0": "4",
				"4.5": "4+",
				"5.0": "5",
				"5.5": "5+",
				"6.0": "6",
				"6.5": "6+",
				"7.0": "7",
				"7.5": "7+",
				"8.0": "8",
				"8.5": "8+",
				"9.0": "9",
				"9.5": "9+",
				"10.0": "10",
				"10.5": "10+",
				"11.0": "11",
				"11.5": "11+",
				"12.0": "12",
				"12.5": "12+",
				"13.0": "13",
				"13.5": "13+",
				"14.0": "14",
				"14.5": "14+",
				"15.0": "15",
				"15.5": "15+"
			};
			return kickzSizes[input];

	}

}