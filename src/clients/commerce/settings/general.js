
module.exports = function(Client){
	return Client.sub({
		general: require('./settings/general/taxableTerritory')(Client)
	});
};


