
module.exports = function(Client){
	return Client.sub({
		"appliedDiscount": require('./carts/appliedDiscount')(Client),
		"cartItem": require('./carts/cartItem')(Client),
		"changeMessage": require('./carts/changeMessage')(Client)
	});
};


