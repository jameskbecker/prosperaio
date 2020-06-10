export interface productProps {
	searchInput: string;
	category: string;
	size: string;
	style: string;
	productQty: string;
}

export interface taskDataProps {
	setup: {
		profile: string,
		mode: string,
		restockMode: string,
		checkoutAttempts: number
	};
	site: string;
	delays: {
		cart: number,
		checkout: number
	};
	additional: {
		proxyList: string,
		maxPrice: number,
		timer: string,
		monitorRestocks: boolean,
		skipCaptcha: boolean,
		enableThreeDS: boolean
	};
	products: productProps[];
}

export interface profileDataProps {
	profileName: string;
	billing: {
		first: string;
		last: string;
		email: string;
		telephone: string;
		address1: string;
		address2: string;
		city: string;
		zip: string;
		country: string;
		state: string;
	};
	shipping: {
		first: string;
		last: string;
		email: string;
		telephone: string;
		address1: string;
		address2: string;
		city: string;
		zip: string;
		country: string;
		state: string;
	};
	payment: {
		type: string;
		cardNumber: string;
		expiryMonth: string;
		expiryYear: string;
		cvv: string;
	};
}

export interface harvesterProps {
	name: string;
}

export interface siteDataProps {
  enabled: boolean;
  type: string;
  label: string;
  baseUrl: string;
}