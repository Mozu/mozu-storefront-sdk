
module.exports = function(Client){
	return Client.sub({
		"eventDeliverySummary": require('./subscriptions/eventDeliverySummary')(Client)
	});
};


