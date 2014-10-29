
module.exports = function(Client){
	return Client.sub({
		developer: require('./platform/developer/applications')(Client),
		developer: require('./platform/developer/authtickets')(Client),
		developer: require('./platform/developer/developerAdminUserAuthTicket')(Client)
	});
};


