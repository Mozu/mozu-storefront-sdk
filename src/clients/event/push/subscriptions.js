
module.exports = function(Client){
	return Client.sub({
		subscriptions: require('./push/subscriptions/eventDeliverySummary')(Client)
	});
};


