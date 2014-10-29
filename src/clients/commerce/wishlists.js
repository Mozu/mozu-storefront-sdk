
module.exports = function(Client){
	return Client.sub({
		"wishlistItem": require('./wishlists/wishlistItem')(Client)
	});
};


