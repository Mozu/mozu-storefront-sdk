
module.exports = function(Client){
	return Client.sub({
		"location": require('./admin/location')(Client),
		"locationType": require('./admin/locationType')(Client)
	});
};


