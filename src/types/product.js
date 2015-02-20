var errors = require('../errors');
var utils = require('../utils');
var CONSTANTS = require('../constants/default');

var catalogToCommerceFulfillmentTypeConstants = {};
for (var k in CONSTANTS.COMMERCE_FULFILLMENT_METHODS) {
    if (CONSTANTS.COMMERCE_FULFILLMENT_METHODS.hasOwnProperty(k)) {
        catalogToCommerceFulfillmentTypeConstants[CONSTANTS.CATALOG_FULFILLMENT_TYPES[k]] = CONSTANTS.COMMERCE_FULFILLMENT_METHODS[k];
    }
}

module.exports = {
    addToCart: function(payload) {
        // expect payload to have only "options" and "quantity"
        if (!payload) {
            payload = {};
        }
        
        return this.api.action(this, 'addToCart', {
            product: {
                productCode: this.data.productCode,
                variationProductCode: this.data.variationProductCode,
                options: payload.options || this.data.options
            },
            quantity: payload.quantity || 1,
            fulfillmentLocationCode: payload.fulfillmentLocationCode,
            fulfillmentMethod: payload.fulfillmentMethod || (this.data.fulfillmentTypesSupported && catalogToCommerceFulfillmentTypeConstants[this.data.fulfillmentTypesSupported[0]]) || (this.data.goodsType === CONSTANTS.GOODS_TYPES.PHYSICAL ? CONSTANTS.COMMERCE_FULFILLMENT_METHODS.SHIP : CONSTANTS.COMMERCE_FULFILLMENT_METHODS.DIGITAL)
        });
    },
    addToWishlist: function (payload) {
        var self = this;
        var list = this.api.createSync('wishlist', { customerAccountId: payload.customerAccountId });
        return list.getOrCreate().then(function () {
            errors.passFrom(list, self);
            return list.addItem({
                quantity: payload.quantity,
                currencyCode: payload.currencyCode || self.api.context.Currency(),
                localeCode: payload.localeCode || self.api.context.Locale(),
                product: self.data
            });
        });
    },
    addToCartForPickup: function (opts) {
        return this.addToCart(utils.extend({}, this.data, {
            fulfillmentMethod: CONSTANTS.COMMERCE_FULFILLMENT_METHODS.PICKUP
        }, opts));
    }
};