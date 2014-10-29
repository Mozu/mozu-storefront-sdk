
module.exports = function(Client){
	return Client.sub({
		"subscription": require('./push/subscription')(Client),
		"subscriptions": require('./push/subscriptions')(Client)
	});
};


