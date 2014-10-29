
module.exports = function(Client){
	return Client.sub({
		storefront: require('./catalog/storefront/category')(Client),
		storefront: require('./catalog/storefront/product')(Client),
		storefront: require('./catalog/storefront/productSearchResult')(Client),
		storefront: require('./catalog/storefront/shipping')(Client)
	});
};


