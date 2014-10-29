
module.exports = function(Client){
	return Client.sub({
		"taxableTerritory": require('./general/taxableTerritory')(Client)
	});
};


