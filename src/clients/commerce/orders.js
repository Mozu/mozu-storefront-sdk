
module.exports = function(Client){
	return Client.sub({
		orders: require('./commerce/orders/adjustment')(Client),
		orders: require('./commerce/orders/appliedDiscount')(Client),
		orders: require('./commerce/orders/attributedefinition')(Client),
		orders: require('./commerce/orders/billingInfo')(Client),
		orders: require('./commerce/orders/digitalPackage')(Client),
		orders: require('./commerce/orders/fulfillmentAction')(Client),
		orders: require('./commerce/orders/fulfillmentInfo')(Client),
		orders: require('./commerce/orders/orderAttribute')(Client),
		orders: require('./commerce/orders/orderItem')(Client),
		orders: require('./commerce/orders/orderNote')(Client),
		orders: require('./commerce/orders/orderValidationResult')(Client),
		orders: require('./commerce/orders/package')(Client),
		orders: require('./commerce/orders/payment')(Client),
		orders: require('./commerce/orders/pickup')(Client),
		orders: require('./commerce/orders/shipment')(Client)
	});
};


