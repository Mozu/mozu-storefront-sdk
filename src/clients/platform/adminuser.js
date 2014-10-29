
module.exports = function(Client){
	return Client.sub({
		adminuser: require('./platform/adminuser/adminUser')(Client),
		adminuser: require('./platform/adminuser/tenantAdminUserAuthTicket')(Client)
	});
};


