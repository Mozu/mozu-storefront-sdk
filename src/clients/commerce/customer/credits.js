
module.exports = function(Client){
	return Client.sub({
		credits: require('./customer/credits/creditAuditEntry')(Client),
		credits: require('./customer/credits/creditTransaction')(Client)
	});
};


