// BEGIN CONTEXT
/**
 * @class
 * @classdesc The context object helps you configure the SDK to connect to a particular Mozu site. Supply it with tenant, site, mastercatalog, currency code, locale code, app claims, and user claims, and  it will produce for you an ApiInterface object.
 */

var ApiInterface = require('./interface');
var ApiReference = require('./reference');
var utils = require('./utils');

/**
 * @private
 */
var ApiContextConstructor = function(conf) {
    utils.extend(this, conf);
},
    mutableAccessors = ['app-claims', 'user-claims', 'callchain', 'currency', 'locale'], //, 'bypass-cache'],
    immutableAccessors = ['tenant', 'site', 'master-catalog'],
    immutableAccessorLength = immutableAccessors.length,
    allAccessors = mutableAccessors.concat(immutableAccessors),
    allAccessorsLength = allAccessors.length,
    j;

var setImmutableAccessor = function(propName) {
    ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function(val) {
        if (val === undefined) return this[propName];
        var newConf = this.asObject();
        newConf[propName] = val;
        return new ApiContextConstructor(newConf);
    };
};

var setMutableAccessor = function(propName) {
    ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function(val) {
        if (val === undefined) return this[propName];
        this[propName] = val;
        return this;
    };
};

ApiContextConstructor.prototype = {
    constructor: ApiContextConstructor,

    /**
     * Gets or creates the `ApiInterface` for this context that will do all the real work.
     * Call this method only when you've built a complete context including tenant, site, master catalog,
     * locale, currency code, app claims, and user claims. Assign its return value to a local variable.
     * You'll use this interface object to create your `ApiObject`s and do API requests!
     *
     * @public
     * @memberof ApiContext#
     * @returns {ApiInterface} The single `ApiInterface` for this context.
     * @throws {ReferenceError} if the context is not yet complete.
     */
    api: function() {
        return this._apiInstance || (this._apiInstance = new ApiInterface(this));
    },
    Store: function(conf) {
        return new ApiContextConstructor(conf);
    },
    asObject: function(prefix) {
        var obj = {};
        prefix = prefix || '';
        for (var i = 0; i < allAccessorsLength; i++) {
            obj[prefix + allAccessors[i]] = this[allAccessors[i]];
        }
        return obj;
    },
    setServiceUrls: function(urls) {
        ApiReference.urls = urls;
    },
    getServiceUrls: function() {
        return utils.extend({}, ApiReference.urls);
    },
    currency: 'usd',
    locale: 'en-US'
};

for (j = 0; j < immutableAccessors.length; j++) setImmutableAccessor(immutableAccessors[j]);
for (j = 0; j < mutableAccessors.length; j++) setMutableAccessor(mutableAccessors[j]);

module.exports = ApiContextConstructor;

// END CONTEXT

/********/