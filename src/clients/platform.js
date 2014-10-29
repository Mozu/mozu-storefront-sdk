
module.exports = function(Client){
	return Client.sub({
		platform: require('./platform/platform/adminuser')(Client),
		platform: require('./platform/platform/application')(Client),
		platform: require('./platform/platform/applications')(Client),
		platform: require('./platform/platform/developer')(Client),
		platform: require('./platform/platform/entityList')(Client),
		platform: require('./platform/platform/entitylists')(Client),
		platform: require('./platform/platform/referenceData')(Client),
		platform: require('./platform/platform/siteData')(Client),
		platform: require('./platform/platform/tenant')(Client),
		platform: require('./platform/platform/tenantData')(Client),
		platform: require('./platform/platform/tenants')(Client),
		platform: require('./platform/platform/userData')(Client)
	});
};


