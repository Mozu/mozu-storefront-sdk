
module.exports = function(Client){
	return Client.sub({
		"adminUser": require('./adminuser/adminUser')(Client),
		"tenantAdminUserAuthTicket": require('./adminuser/tenantAdminUserAuthTicket')(Client)
	});
};


