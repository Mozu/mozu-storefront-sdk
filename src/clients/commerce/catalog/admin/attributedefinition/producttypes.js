
module.exports = function(Client){
	return Client.sub({
		producttypes: require('./attributedefinition/producttypes/productTypeExtra')(Client),
		producttypes: require('./attributedefinition/producttypes/productTypeOption')(Client),
		producttypes: require('./attributedefinition/producttypes/productTypeProperty')(Client),
		producttypes: require('./attributedefinition/producttypes/productTypeVariation')(Client)
	});
};


