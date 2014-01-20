// BEGIN OBJECT

var utils = require('./utils');
var ApiReference;
var ApiCollection; // lazy loading to prevent circular dep

var ApiObjectConstructor = function(type, data, iapi) {
    this.data = data || {};
    this.api = iapi;
    this.type = type;
};

ApiObjectConstructor.prototype = {
    constructor: ApiObjectConstructor,
    getAvailableActions: function() {
        ApiReference = ApiReference || require('./reference');
        return ApiReference.getActionsFor(this.type);
    },
    prop: function(k, v) {
        switch (arguments.length) {
            case 1:
                if (typeof k === "string") return this.data[k];
                if (typeof k === "object") {
                    for (var hashkey in k) {
                        if (k.hasOwnProperty(hashkey)) this.prop(hashkey, k[hashkey]);
                    }
                }
                break;
            case 2:
                this.data[k] = v;
        }
        return this;
    }
};

utils.addEvents(ApiObjectConstructor);

ApiObjectConstructor.types = {
    cart: require('./types/cart'),
    cartsummary: require('./types/cartsummary'),
    creditcard: require('./types/creditcard'),
    customer: require('./types/customer'),
    login: require('./types/login'),
    order: require('./types/order'),
    product: require('./types/product'),
    shipment: require('./types/shipment'),
    user: require('./types/user'),
    wishlist: require('./types/wishlist')
};
ApiObjectConstructor.hydratedTypes = {};

ApiObjectConstructor.getHydratedType = function(typeName) {
    ApiReference = ApiReference || require('./reference');
    if (!(typeName in this.hydratedTypes)) {
        var availableActions = ApiReference.getActionsFor(typeName),
            reflectedMethods = {};
        for (var i = availableActions.length - 1; i >= 0; i--) {
            utils.setOp(reflectedMethods, availableActions[i]);
        }
        this.hydratedTypes[typeName] = utils.inherit(this, utils.extend({}, reflectedMethods, this.types[typeName] || {}));
    }
    return this.hydratedTypes[typeName];
};

ApiObjectConstructor.create = function(typeName, rawJSON, api) {
    ApiReference = ApiReference || require('./reference');
    var type = ApiReference.getType(typeName);
    if (!type) {
        // for forward compatibility the API should return a response,
        // even one that it doesn't understand
        return rawJSON;
    }
    if (type.collectionOf) {
        // lazy load to prevent circular dep
        ApiCollection = ApiCollection || require('./collection');
        return ApiCollection.create(typeName, rawJSON, api, type.collectionOf);
    }

    var ApiObjectType = this.getHydratedType(typeName);

    return new ApiObjectType(typeName, rawJSON, api);
};

module.exports = ApiObjectConstructor;

// END OBJECT

/***********/