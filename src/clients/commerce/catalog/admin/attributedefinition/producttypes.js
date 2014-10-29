
module.exports = function(Client){
	return Client.sub({
		"productTypeExtra": require('./producttypes/productTypeExtra')(Client),
		"productTypeOption": require('./producttypes/productTypeOption')(Client),
		"productTypeProperty": require('./producttypes/productTypeProperty')(Client),
		"productTypeVariation": require('./producttypes/productTypeVariation')(Client)
	});
};


