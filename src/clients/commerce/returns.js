
module.exports = function(Client){
	return Client.sub({
		"package": require('./returns/package')(Client),
		"shipment": require('./returns/shipment')(Client)
	});
};


