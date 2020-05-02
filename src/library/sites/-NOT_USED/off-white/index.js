const Task = require('../../tasks/base');
const monitor = require('./monitor');
const cart = require('./cart');
const checkout = require('./checkout');
const keys = require('./keys');
let options = {
	"id": 4,
	"site": {
        id: 'offwhite',
        type: 'offwhite',
        label: 'Off-White',
        enabled: true,
        baseUrl: 'https://www.off---white.com',
        taskModes: [
            {
                id: 'desktopApi',
                label: 'Desktop (API)'
            }
        ],
        searchModes: [
            {
                id: 'directUrl',
                label: 'Direct URL'
            }
		],
		disabledInputs: ['#taskEmail', '#taskPassword']
    },
	"mode": "url-Endpoint",
	"searchMode": "url-Endpoint",
	"searchInput": "https://www.off---white.com/en/DE/men/products/omia094t19a511011001",
	"profile": "Test Profile",
	"size": "39",
	"category": "",
	"timer": "",
	"proxy": "",
	"loginEmail": "",
	"loginPassword": "",
	"minPrice": "",
	"maxPrice": "",
	"cartDelay": 4000,
	"checkoutDelay": "",
	"monitorDelay": "",

}

class OffWhite extends Task {
	constructor(_taskData) {
		super(_taskData);
		this.variantId;
		this.orderId;
		this.keys = {};
		this.cookies;
		this.keyUrl;
	}

	run() {
		await this.init(); 
		await utilities.setTimer.bind(this)();
		this.setStatus('STARTING TASK', 'WARNING');
	}

	// async init() {
	// 	taskStatus.set.bind(this)('Initializing', 'INFO');
	// 	//keys.generate.bind(this)();
	// 	//console.log(this.keys)

	// 	switch(this.taskData.searchMode) {
	// 		case 'url-endpoint':
	// 			this.monitorEndpoint.bind(this)();
	// 		break;
	// 		case 'url-DOM':
	// 			this.monitorDOM.bind(this)();
	// 		break;
	// 		default:
	// 			console.log('No Search Mode Specified' );
	// 	}
	// }

	async monitorEndpoint() {
		try {
			await monitor.getCookies.bind(this)();
			monitor.useCookies.bind(this)();
			console.log(`Variant ID: ${this.variantId} is in Stock!`);
			//this.cartProduct.bind(this);
		} 
		catch(err) {
			switch(err.type) {
				case "Out of Stock":
					taskStatus.set.bind(this)('Monitor Active.', 'WARNING');
					setTimeout(this.monitorEndpoint.bind(this), this.taskData.monitorDelay);
				break;
				
				case "Invalid URL":
					taskStatus.set.bind(this)('Invalid URL.', 'ERROR')
				break;
				
				case "Request Error":
					taskStatus.set.bind(this)('Connection Error.', 'ERROR');
				break;

				case "No Response":
					taskStatus.set.bind(this)('Falling back to DOM Monitor', 'WARNING');
					setTimeout(this.monitorDOM.bind(this), this.taskData.monitorDelay);
				
				default: 
			}
		}
	}
 
	async monitorDOM() {
		try {
			await monitor.checkDOM.bind(this)();
		}
		catch(err) {
			switch(err.type) {
				case 'Variant Not Found':
					console.log('OOS... Retrying')
					setTimeout(this.monitorDOM.bind(this), this.taskData.cartDelay);	
				break;
				default:
					console.log(err);

			}
		}
	}

	async cartProduct() {
		if (this.variantId) {
			try {
				await cart.addItem.bind(this)();
			}
			catch(err) {
				switch(err.type) {

				}
			}
			console.log(`Carted Product. Order ID: ${this.orderId}`);
		}
		else {
			console.log('An Unknown Error Occured.');
		}
	}

	async checkoutProduct() {
		if (this.orderId) {
			try {
				await checkout.address.bind(this)();
				console.log('Address Submitted.');
				await checkout.delivery.bind(this)();
				console.log('Delivery Method Submitted.');
				await checkout.payment.bind(this)();
				console.log('Payment Submitted.');
			}
			catch(err) {
				switch(err.type) {

				}
			}
		}
	}
}



// let offwhite = new OffWhite(options);
// offwhite.init();

module.exports = OffWhite;