
module.exports = function(Client){
	return Client.sub({
		checkout: require('./settings/checkout/customerCheckoutSettings')(Client),
		checkout: require('./settings/checkout/paymentSettings')(Client)
	});
};


