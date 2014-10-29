
module.exports = function(Client){
	return Client.sub({
		commerce: require('./commerce/commerce/admin')(Client),
		commerce: require('./commerce/commerce/cart')(Client),
		commerce: require('./commerce/commerce/carts')(Client),
		commerce: require('./commerce/commerce/catalog')(Client),
		commerce: require('./commerce/commerce/channel')(Client),
		commerce: require('./commerce/commerce/channelGroup')(Client),
		commerce: require('./commerce/commerce/customer')(Client),
		commerce: require('./commerce/commerce/inStockNotificationSubscription')(Client),
		commerce: require('./commerce/commerce/location')(Client),
		commerce: require('./commerce/commerce/order')(Client),
		commerce: require('./commerce/commerce/orders')(Client),
		commerce: require('./commerce/commerce/return')(Client),
		commerce: require('./commerce/commerce/returns')(Client),
		commerce: require('./commerce/commerce/settings')(Client),
		commerce: require('./commerce/commerce/wishlist')(Client),
		commerce: require('./commerce/commerce/wishlists')(Client)
	});
};


