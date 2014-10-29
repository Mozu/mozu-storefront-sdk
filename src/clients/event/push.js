
module.exports = function(Client){
	return Client.sub({
		push: require('./event/push/subscription')(Client),
		push: require('./event/push/subscriptions')(Client)
	});
};


