
module.exports = function(Client){
	return Client.sub({
		"accounts": require('./customer/accounts')(Client),
		"addressValidationRequest": require('./customer/addressValidationRequest')(Client),
		"attributedefinition": require('./customer/attributedefinition')(Client),
		"credit": require('./customer/credit')(Client),
		"credits": require('./customer/credits')(Client),
		"customerAccount": require('./customer/customerAccount')(Client),
		"customerAuthTicket": require('./customer/customerAuthTicket')(Client),
		"customerSegment": require('./customer/customerSegment')(Client),
		"visit": require('./customer/visit')(Client)
	});
};


