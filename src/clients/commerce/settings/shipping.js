
module.exports = function(Client){
	return Client.sub({
		shipping: require('./settings/shipping/siteShippingHandlingFee')(Client)
	});
};


