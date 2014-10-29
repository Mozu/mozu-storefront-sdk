
module.exports = function(Client){
	return Client.sub({
		"attribute": require('./attributedefinition/attribute')(Client),
		"attributes": require('./attributedefinition/attributes')(Client),
		"productType": require('./attributedefinition/productType')(Client),
		"producttypes": require('./attributedefinition/producttypes')(Client)
	});
};


