
module.exports = function(Client){
	return Client.sub({
		"adminuser": require('./platform/adminuser')(Client),
		"application": require('./platform/application')(Client),
		"applications": require('./platform/applications')(Client),
		"developer": require('./platform/developer')(Client),
		"entityList": require('./platform/entityList')(Client),
		"entitylists": require('./platform/entitylists')(Client),
		"referenceData": require('./platform/referenceData')(Client),
		"siteData": require('./platform/siteData')(Client),
		"tenant": require('./platform/tenant')(Client),
		"tenantData": require('./platform/tenantData')(Client),
		"userData": require('./platform/userData')(Client)
	});
};


