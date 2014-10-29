
module.exports = function(Client){
	return Client.sub({
		discounts: require('./admin/discounts/discountTarget')(Client)
	});
};


