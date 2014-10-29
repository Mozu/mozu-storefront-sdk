
module.exports = function(Client){
	return Client.sub({
		applications: require('./platform/applications/authTicket')(Client)
	});
};


