
module.exports = function(Client){
	return Client.sub({
		attributedefinition: require('./orders/attributedefinition/attribute')(Client)
	});
};


