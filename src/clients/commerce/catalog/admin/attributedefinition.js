
module.exports = function(Client){
	return Client.sub({
		attributedefinition: require('./admin/attributedefinition/attribute')(Client),
		attributedefinition: require('./admin/attributedefinition/attributes')(Client),
		attributedefinition: require('./admin/attributedefinition/productType')(Client),
		attributedefinition: require('./admin/attributedefinition/producttypes')(Client)
	});
};


