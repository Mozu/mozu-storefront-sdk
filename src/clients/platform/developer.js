
module.exports = function(Client){
	return Client.sub({
		"developerAdminUserAuthTicket": require('./developer/developerAdminUserAuthTicket')(Client)
	});
};


