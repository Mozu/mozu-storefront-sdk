
module.exports = function(Client){
	return Client.sub({
		"admin": require('./commerce/admin')(Client),
		"cart": require('./commerce/cart')(Client),
		"carts": require('./commerce/carts')(Client),
		"catalog": require('./commerce/catalog')(Client),
		"channel": require('./commerce/channel')(Client),
		"channelGroup": require('./commerce/channelGroup')(Client),
		"customer": require('./commerce/customer')(Client),
		"inStockNotificationSubscription": require('./commerce/inStockNotificationSubscription')(Client),
		"location": require('./commerce/location')(Client),
		"order": require('./commerce/order')(Client),
		"orders": require('./commerce/orders')(Client),
		"return": require('./commerce/return')(Client),
		"returns": require('./commerce/returns')(Client),
		"settings": require('./commerce/settings')(Client),
		"wishlist": require('./commerce/wishlist')(Client),
		"wishlists": require('./commerce/wishlists')(Client)
	});
};


