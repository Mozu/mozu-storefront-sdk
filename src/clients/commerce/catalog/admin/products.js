
module.exports = function(Client){
	return Client.sub({
		"locationInventory": require('./products/locationInventory')(Client),
		"productExtra": require('./products/productExtra')(Client),
		"productOption": require('./products/productOption')(Client),
		"productProperty": require('./products/productProperty')(Client),
		"productVariation": require('./products/productVariation')(Client)
	});
};


