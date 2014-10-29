
module.exports = function(Client){
	return Client.sub({
		"admin": require('./catalog/admin')(Client),
		"storefront": require('./catalog/storefront')(Client)
	});
};


