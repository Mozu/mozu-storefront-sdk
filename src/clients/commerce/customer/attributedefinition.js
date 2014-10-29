
module.exports = function(Client){
	return Client.sub({
		attributedefinition: require('./customer/attributedefinition/attribute')(Client)
	});
};


