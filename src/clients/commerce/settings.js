
module.exports = function(Client){
	return Client.sub({
		"application": require('./settings/application')(Client),
		"checkout": require('./settings/checkout')(Client),
		"checkoutSettings": require('./settings/checkoutSettings')(Client),
		"general": require('./settings/general')(Client),
		"generalSettings": require('./settings/generalSettings')(Client),
		"locationUsage": require('./settings/locationUsage')(Client),
		"shipping": require('./settings/shipping')(Client),
		"siteShippingSettings": require('./settings/siteShippingSettings')(Client)
	});
};


