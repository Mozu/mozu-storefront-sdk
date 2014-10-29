
module.exports = function(Client){
	return Client.sub({
		"card": require('./accounts/card')(Client),
		"customerAttribute": require('./accounts/customerAttribute')(Client),
		"customerContact": require('./accounts/customerContact')(Client),
		"customerNote": require('./accounts/customerNote')(Client),
		"customerSegment": require('./accounts/customerSegment')(Client),
		"transaction": require('./accounts/transaction')(Client)
	});
};


