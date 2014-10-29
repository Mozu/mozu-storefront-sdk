
module.exports = function(Client){
	return Client.sub({
		"attribute": require('./attributedefinition/attribute')(Client)
	});
};


