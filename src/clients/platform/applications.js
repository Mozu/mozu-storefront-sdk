
module.exports = function(Client){
	return Client.sub({
		"authTicket": require('./applications/authTicket')(Client)
	});
};


