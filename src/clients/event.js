
module.exports = function(Client){
	return Client.sub({
		event: require('./event/event/eventNotification')(Client),
		event: require('./event/event/push')(Client)
	});
};


