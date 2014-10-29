
module.exports = function(Client){
	return Client.sub({
		"documentDraftSummary": require('./content/documentDraftSummary')(Client),
		"documentList": require('./content/documentList')(Client),
		"documentlists": require('./content/documentlists')(Client),
		"documentListType": require('./content/documentListType')(Client),
		"documentType": require('./content/documentType')(Client),
		"propertyType": require('./content/propertyType')(Client)
	});
};


