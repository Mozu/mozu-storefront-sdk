
module.exports = function(Client){
	return Client.sub({
		"attributeLocalizedContent": require('./attributes/attributeLocalizedContent')(Client),
		"attributeTypeRule": require('./attributes/attributeTypeRule')(Client),
		"attributeVocabularyValue": require('./attributes/attributeVocabularyValue')(Client)
	});
};


