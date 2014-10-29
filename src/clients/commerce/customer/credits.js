
module.exports = function(Client){
	return Client.sub({
		"creditAuditEntry": require('./credits/creditAuditEntry')(Client),
		"creditTransaction": require('./credits/creditTransaction')(Client)
	});
};


