
module.exports = function(Client){
	return Client.sub({
		catalog: require('./commerce/catalog/admin')(Client),
		catalog: require('./commerce/catalog/storefront')(Client)
	});
};


