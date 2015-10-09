var utils = require('../utils');
module.exports = {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        var fulfillmentContact = utils.clone(self.prop('fulfillmentContact'));
        // currently the service can't handle not having a state
        if (fulfillmentContact.address && !fulfillmentContact.address.stateOrProvince) fulfillmentContact.address.stateOrProvince = "n/a";
        return self.update({ fulfillmentContact: fulfillmentContact }).then(function () {
            return self.getShippingMethods();
        });
    }
};