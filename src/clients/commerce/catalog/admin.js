
module.exports = function(Client){
	return Client.sub({
		"attributedefinition": require('./admin/attributedefinition')(Client),
		"category": require('./admin/category')(Client),
		"discount": require('./admin/discount')(Client),
		"discounts": require('./admin/discounts')(Client),
		"facet": require('./admin/facet')(Client),
		"locationInventory": require('./admin/locationInventory')(Client),
		"masterCatalog": require('./admin/masterCatalog')(Client),
		"product": require('./admin/product')(Client),
		"productReservation": require('./admin/productReservation')(Client),
		"products": require('./admin/products')(Client),
		"publishingScope": require('./admin/publishingScope')(Client),
		"search": require('./admin/search')(Client)
	});
};


