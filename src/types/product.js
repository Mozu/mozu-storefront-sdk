ApiObject.types.product = {
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
            fulfillmentMethod: CONSTANTS.FULFILLMENT_METHODS.PICKUP
        }, opts));
    }
};