module.exports = function (site:string):any {
	let siteData;
	switch (site) {
		case 'kickz':
			siteData = {
				'domain': 'www.kickz.com',
				'key': '6LeAALIUAAAAAKgH4qzUAFxx1mUO5UlEsTGgsQYX',
				'invisible': true
			};
			return siteData;
		
		case 'kickzpremium':
			siteData = {
				'domain': 'www.kickzpremium.com',
				'key': '6LeAALIUAAAAAKgH4qzUAFxx1mUO5UlEsTGgsQYX',
				'invisible': true
			};

		case 'shopify':
			siteData = {
				'domain': 'checkout.shopify.com',
				'key': '6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF',
				'invisible': false
			};
			return siteData;

		case 'supreme':
			siteData = {
				'domain': 'www.supremenewyork.com',
				'key': '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz',
				'invisible': true
			};
			return siteData;
	}
};