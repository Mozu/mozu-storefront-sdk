
module.exports = function(Client){
	return Client.sub({
		returns: require('./commerce/returns/package')(Client),
		returns: require('./commerce/returns/shipment')(Client)
	});
};


