
module.exports = function(Client){
	return Client.sub({
		accounts: require('./customer/accounts/card')(Client),
		accounts: require('./customer/accounts/customerAttribute')(Client),
		accounts: require('./customer/accounts/customerContact')(Client),
		accounts: require('./customer/accounts/customerNote')(Client),
		accounts: require('./customer/accounts/customerSegment')(Client),
		accounts: require('./customer/accounts/transaction')(Client)
	});
};


