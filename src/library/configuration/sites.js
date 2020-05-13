module.exports = {
	default: {
		'kickz': {
			enabled: false,
			type: 'kickz',
			label: 'Kickz',
			baseUrl: 'https://www.kickz.com'
		},

		'kickz-premium': {
			enabled: false,
			type: 'kickz',
			label: 'Kickz Premium',
			baseUrl: 'https://www.kickzpremium.com'
		},

		'kith': {
			enabled: false,
			type: 'shopify',
			label: 'Kith',
			baseUrl: 'https://www.kith.com'
		},

		'supreme-local': {
			enabled: false,
			type: 'supreme',
			label: 'Supreme Local',
			baseUrl: 'http://127.0.0.1:8000',
		},

		'supreme-eu': {
			enabled: true,
			type: 'supreme',
			label: 'Supreme EU',
			baseUrl: 'https://www.supremenewyork.com',
		},

		'supreme-jp': {
			enabled: true,
			type: 'supreme',
			label: 'Supreme JP',
			baseUrl: 'https://www.supremenewyork.com',
		},

		'supreme-us': {
			enabled: true,
			type: 'supreme',
			label: 'Supreme US',
			baseUrl: 'https://www.supremenewyork.com',
		},
		'off-white': {
			enabled: false,
			type: 'offwhite',
			label: 'Off-White',
			baseUrl: 'https://www.off---white.com/'
		}
	},
	captcha: [
		// {
		// 	label: 'Kickz',
		// 	value: 'kickz'
		// },
		// {
		// 	label: 'Kickz Premium',
		// 	value: 'kickzpremium'
		// },
		{
			label: 'Supreme',
			value: 'supreme'
		}
	]
}