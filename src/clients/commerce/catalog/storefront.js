
module.exports = function(Client){
	return Client.sub({
		"category": require('./storefront/category')(Client),
		"product": require('./storefront/product')(Client),
		"productSearchResult": require('./storefront/productSearchResult')(Client),
		"shipping": require('./storefront/shipping')(Client)
	});
};


