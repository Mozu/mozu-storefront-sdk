
module.exports = function(Client){
	return Client.sub({
		admin: require('./catalog/admin/attributedefinition')(Client),
		admin: require('./catalog/admin/category')(Client),
		admin: require('./catalog/admin/discount')(Client),
		admin: require('./catalog/admin/discounts')(Client),
		admin: require('./catalog/admin/facet')(Client),
		admin: require('./catalog/admin/locationInventory')(Client),
		admin: require('./catalog/admin/masterCatalog')(Client),
		admin: require('./catalog/admin/product')(Client),
		admin: require('./catalog/admin/productReservation')(Client),
		admin: require('./catalog/admin/products')(Client),
		admin: require('./catalog/admin/publishingScope')(Client),
		admin: require('./catalog/admin/search')(Client)
	});
};


