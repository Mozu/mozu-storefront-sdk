
module.exports = function(Client){
	return Client.sub({
		"siteShippingHandlingFee": require('./shipping/siteShippingHandlingFee')(Client)
	});
};


