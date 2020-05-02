module.exports = {
	ajaxCart: function() {
		let body = {
			'id' : this.variantId,
			'quantity' : this.taskData.quantity
		};
		return body;
	},
	
	apiCart: function() {
		let body = {};
		body.checkout = {
			'line-items': [
				{
					variant_id: this.variantId,
					quantity: this.taskData.quantity,
				}
			]
		}
		return body;
	},

	creditCard: function() {
		let body = {}
		body.credit_card = {
			'number': this.profileData.cardNumber,
			'month': this.profileData.expiryMonth,
			'year': this.profileData.expiryYear,
			'verification_value': this.profileData.cvv,
			'first_name': this.profileData.firstName,
			'last_name': this.profileData.lastName
		}
		return body;
	}
}