
module.exports = function(Client){
	return Client.sub({
		settings: require('./commerce/settings/application')(Client),
		settings: require('./commerce/settings/checkout')(Client),
		settings: require('./commerce/settings/checkoutSettings')(Client),
		settings: require('./commerce/settings/general')(Client),
		settings: require('./commerce/settings/generalSettings')(Client),
		settings: require('./commerce/settings/locationUsage')(Client),
		settings: require('./commerce/settings/shipping')(Client),
		settings: require('./commerce/settings/siteShippingSettings')(Client)
	});
};


