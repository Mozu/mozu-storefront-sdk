
module.exports = function(Client){
	return Client.sub({
		admin: require('./commerce/admin/location')(Client),
		admin: require('./commerce/admin/locationType')(Client)
	});
};


