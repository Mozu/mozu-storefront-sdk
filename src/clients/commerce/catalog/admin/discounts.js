
module.exports = function(Client){
	return Client.sub({
		"discountTarget": require('./discounts/discountTarget')(Client)
	});
};


