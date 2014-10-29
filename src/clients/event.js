
module.exports = function(Client){
	return Client.sub({
		"eventNotification": require('./event/eventNotification')(Client),
		"push": require('./event/push')(Client)
	});
};


