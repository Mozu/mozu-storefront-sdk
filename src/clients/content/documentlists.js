
module.exports = function(Client){
	return Client.sub({
		"document": require('./documentlists/document')(Client),
		"documentTree": require('./documentlists/documentTree')(Client),
		"facet": require('./documentlists/facet')(Client),
		"view": require('./documentlists/view')(Client)
	});
};


