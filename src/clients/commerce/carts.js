
module.exports = function(Client){
	return Client.sub({
		carts: require('./commerce/carts/appliedDiscount')(Client),
		carts: require('./commerce/carts/cartItem')(Client),
		carts: require('./commerce/carts/changeMessage')(Client)
	});
};


