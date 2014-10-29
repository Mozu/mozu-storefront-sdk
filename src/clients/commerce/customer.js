
module.exports = function(Client){
	return Client.sub({
		customer: require('./commerce/customer/accounts')(Client),
		customer: require('./commerce/customer/addressValidationRequest')(Client),
		customer: require('./commerce/customer/attributedefinition')(Client),
		customer: require('./commerce/customer/credit')(Client),
		customer: require('./commerce/customer/credits')(Client),
		customer: require('./commerce/customer/customerAccount')(Client),
		customer: require('./commerce/customer/customerAuthTicket')(Client),
		customer: require('./commerce/customer/customerSegment')(Client),
		customer: require('./commerce/customer/visit')(Client)
	});
};


