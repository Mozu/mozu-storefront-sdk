
module.exports = function(Client){
	return Client.sub({
		"customerCheckoutSettings": require('./checkout/customerCheckoutSettings')(Client),
		"paymentSettings": require('./checkout/paymentSettings')(Client)
	});
};


