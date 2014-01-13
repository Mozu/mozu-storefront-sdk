ApiObject.types.shipment = {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        return self.update({ fulfillmentContact: self.prop('fulfillmentContact') }).then(function () {
            return self.getShippingMethods();
        });
    }
};