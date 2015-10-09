var utils = require('../utils');
var errors = require('../errors');

errors.register({
    'ADD_COUPON_FAILED': 'Adding coupon failed for the following reason: {0}'
});

module.exports = {
    count: function () {
        var items = this.prop('items');
        if (!items || !items.length) return 0;
        return utils.reduce(items, function (total, item) {
            return total + item.quantity;
        }, 0);
    },

    addExtendedProperty: function (extendedProperty) {
        // Expect extendedPropert to contain a key/value pair, if it doesn't we need to fail with incorrect data.
        if (!extendedProperty) {
            extendedProperty = {};
        }

        return this.api.action(this, 'addExtendedProperty', {
            // Fill in the data from extendedProperty here!
            'key': extendedProperty.key,
            'value': extendedProperty.value
        });
    },

    addExtendedProperties: function (extendedProperties) {
        // Expect extendedProperties to contain a list of key/value pair, if it doesn't we need to fail with incorrect data.
        if (!extendedProperties) {
            extendedProperties = [];
        }

        return this.api.action(this, 'addExtendedProperties', extendedProperties);
    },

    removeExtendedProperties: function (extendedPropertyKeys) {
        // Expect extendedPropertyKeys to contain a list of key/value pair, if it doesn't we need to fail with incorrect data.
        if (!extendedPropertyKeys) {
            extendedPropertyKeys = [];
        }

        return this.api.action(this, 'addExtendedProperties', extendedPropertyKeys);
    },
    addCoupon: function (couponCode) {
        var self = this;
        return this.applyCoupon(couponCode).then(function () {
            return self.get();
        }, function (reason) {
            errors.throwOnObject(self, 'ADD_COUPON_FAILED', reason.message);
        });
    }
};