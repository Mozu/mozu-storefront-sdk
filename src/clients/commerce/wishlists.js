
module.exports = function(Client){
	return Client.sub({
		wishlists: require('./commerce/wishlists/wishlistItem')(Client)
	});
};


