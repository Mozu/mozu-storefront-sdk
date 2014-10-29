
module.exports = function(Client){
	return Client.sub({
		products: require('./admin/products/locationInventory')(Client),
		products: require('./admin/products/productExtra')(Client),
		products: require('./admin/products/productOption')(Client),
		products: require('./admin/products/productProperty')(Client),
		products: require('./admin/products/productVariation')(Client)
	});
};


