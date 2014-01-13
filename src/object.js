// BEGIN OBJECT
var ApiObject = (function () {

    var ApiObjectConstructor = function (type, data, iapi) {
        this.data = data || {};
        this.api = iapi;
        this.type = type;
    }

    ApiObjectConstructor.prototype = {
        constructor: ApiObjectConstructor,
        getAvailableActions: function () {
            return ApiReference.getActionsFor(this.type);
        },
        prop: function (k, v) {
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

    ApiObjectConstructor.types = {};
    ApiObjectConstructor.hydratedTypes = {};

    ApiObjectConstructor.getHydratedType = function (typeName) {
        if (!(typeName in this.hydratedTypes)) {
            var availableActions = ApiReference.getActionsFor(typeName),
                reflectedMethods = {};
            for (var i = availableActions.length - 1; i >= 0; i--) {
                utils.setOp(reflectedMethods, availableActions[i]);
            }
            this.hydratedTypes[typeName] = utils.inherit(this, utils.extend({}, reflectedMethods, this.types[typeName] || {}));
        }
        return this.hydratedTypes[typeName];
    }

    ApiObjectConstructor.create = function (typeName, rawJSON, api) {
        var type = ApiReference.getType(typeName);
        if (!type) {
            // for forward compatibility the API should return a response,
            // even one that it doesn't understand
            return rawJSON;
        }
        if (type.collectionOf) {
            return ApiCollection.create(typeName, rawJSON, api, type.collectionOf)
        }

        var ApiObjectType = this.getHydratedType(typeName);
        
        return new ApiObjectType(typeName, rawJSON, api);
    };

    return ApiObjectConstructor;

}());
// END OBJECT

/***********/