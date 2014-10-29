
module.exports = function(Client){
	return Client.sub({
		documentlists: require('./content/documentlists/document')(Client),
		documentlists: require('./content/documentlists/documentTree')(Client),
		documentlists: require('./content/documentlists/facet')(Client),
		documentlists: require('./content/documentlists/view')(Client)
	});
};


