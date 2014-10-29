
module.exports = function(Client){
	return Client.sub({
		"entity": require('./entitylists/entity')(Client),
		"entityContainer": require('./entitylists/entityContainer')(Client),
		"listView": require('./entitylists/listView')(Client)
	});
};


