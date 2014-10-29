
module.exports = function(Client){
	return Client.sub({
		attributes: require('./attributedefinition/attributes/attributeLocalizedContent')(Client),
		attributes: require('./attributedefinition/attributes/attributeTypeRule')(Client),
		attributes: require('./attributedefinition/attributes/attributeVocabularyValue')(Client)
	});
};


