
module.exports = function(Client){
	return Client.sub({
		content: require('./content/content/documentDraftSummary')(Client),
		content: require('./content/content/documentList')(Client),
		content: require('./content/content/documentlists')(Client),
		content: require('./content/content/documentListType')(Client),
		content: require('./content/content/documentType')(Client),
		content: require('./content/content/propertyType')(Client)
	});
};


