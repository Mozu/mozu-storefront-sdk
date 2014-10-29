
module.exports = function(Client){
	return Client.sub({
		"adjustment": require('./orders/adjustment')(Client),
		"appliedDiscount": require('./orders/appliedDiscount')(Client),
		"attributedefinition": require('./orders/attributedefinition')(Client),
		"billingInfo": require('./orders/billingInfo')(Client),
		"digitalPackage": require('./orders/digitalPackage')(Client),
		"fulfillmentAction": require('./orders/fulfillmentAction')(Client),
		"fulfillmentInfo": require('./orders/fulfillmentInfo')(Client),
		"orderAttribute": require('./orders/orderAttribute')(Client),
		"orderItem": require('./orders/orderItem')(Client),
		"orderNote": require('./orders/orderNote')(Client),
		"orderValidationResult": require('./orders/orderValidationResult')(Client),
		"package": require('./orders/package')(Client),
		"payment": require('./orders/payment')(Client),
		"pickup": require('./orders/pickup')(Client),
		"shipment": require('./orders/shipment')(Client)
	});
};


