export namespace Supreme {
	export interface additionalDataProps {
		swatch_url: string;
		swatch_url_hi: string;
		image_url: string;
		image_url_hi: string;
		zoomed_url: string;
		zoomed_url_hi: string;
		bigger_zoomed_url: string;
	}
	
	export interface sizeDataProps {
		name: string;
		id: number;
		stock_level: number;
	}
	
	export interface styleDataProps {
		id: number;
		name: string;
		currency: string;
		description: string | null;
		image_url: string;
		image_url_hi: string;
		swatch_url: string;
		swatch_url_hi: string;
		mobile_zoomed_url: string;
		mobile_zoomed_url_hi: string;
		bigger_zoomed_url: string;
		sizes: sizeDataProps[];
		additional: additionalDataProps[];
	}
	
	export interface productDataProps {
		styles: styleDataProps[];
		description: string | null;
		can_add_styles: boolean;
		can_buy_multiple: boolean;
		ino: string;
		cod_blocked: boolean;
		canada_blocked: boolean;
		purchasable_qty: number;
		special_purchasable_qty: [];
		new_item: boolean;
		apparel: boolean;
		handling: number;
		no_free_shipping: boolean;
		can_buy_multiple_with_limit: boolean;
		non_eu_blocked: boolean;
		russia_blocked: boolean;
	}

	export interface cartWrapperProps {
		cart: cartItemProps[];
		success: boolean;
	}

	export interface cartItemProps {
		size_id: string;
		in_stock: boolean;
	}

	export interface statusProps {
		status: string;
		slug?: string;
		id?: string;
		errors?: string;
		page?: string;
		transaction_id: string;
		acs_url: string;
		payload: string;
		consumer: any;
	}
}

export namespace UserData {
	export interface allTasks {
		[key: string]: task;
	}

	export interface task {
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

	export interface allProfiles {
		[key: string]: profile;
	}

	export interface profile {
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
}

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