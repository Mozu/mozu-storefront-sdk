
module.exports = function(Client){
	return Client.sub({
		entitylists: require('./platform/entitylists/entity')(Client),
		entitylists: require('./platform/entitylists/entityContainer')(Client),
		entitylists: require('./platform/entitylists/listView')(Client)
	});
};


