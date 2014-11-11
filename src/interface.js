/**
 * @external Promise
 * @see {@link https://github.com/cujojs/when/blob/master/docs/api.md#promise WhenJS/Promise}
 */

/**
 * Attach handlers to and transform the promise.
 * @function external:Promise#then
 * @returns external:Promise#
 */

// BEGIN INTERFACE
/**
 * @class
 * @classdesc The interface object makes requests to the API and returns API object. You can use it to make raw requests using the ApiInterface#request method, but you're more likely to use the ApiInterface#action method to create a external:Promise# that returns an ApiObject#.
 */
var utils = require('./utils');
var ApiReference = require('./reference');
var ApiObject = require('./object');

var errorMessage = "No {0} was specified. Run Mozu.Tenant(tenantId).MasterCatalog(masterCatalogId).Catalog(catalogId).Site(siteId).",
    requiredContextValues = ['Tenant', 'MasterCatalog', 'Site', 'Catalog'];
var ApiInterfaceConstructor = function(context) {
    // for now, cheat and try to grab context from the known preload if it's not being supplied correctly
    var headerPreload = document.getElementById('data-mz-preload-apicontext'),
        headerPreloadText = headerPreload && (headerPreload.textContent || headerPreload.innerText || headerPreload.text || headerPreload.innerHTML),
        headerJSON = headerPreloadText && JSON.parse(headerPreloadText);

    if (headerJSON && headerJSON.headers) context = context.Store(headerJSON.headers);

    for (var i = 0, len = requiredContextValues.length; i < len; i++) {
        if (context[requiredContextValues[i]]() === undefined) throw new ReferenceError(errorMessage.split('{0}').join(requiredContextValues[i]));
    }
    this.context = context;
};

ApiInterfaceConstructor.prototype = {
    constructor: ApiInterfaceConstructor,
    /**
     * @public
     * @memberof ApiInterface#
     * @returns {external:Promise#}
     */
    request: function(method, requestConf, conf) {
        var me = this,
            url = typeof requestConf === "string" ? requestConf : requestConf.url;
        if (requestConf.verb)
            method = requestConf.verb;

        var deferred = me.defer();

        var data;
        if (requestConf.overridePostData) {
            data = requestConf.overridePostData;
        } else if (conf && !requestConf.noBody) {
            data = conf.data || conf;
        }

        var xhr;
        var triedRefresh = false;
        var makeRequest = function () {
            var contextHeaders = me.getRequestHeaders();
            xhr = utils.request(method, url, contextHeaders, data, function (rawJSON) {
            // update context with response headers
            me.fire('success', rawJSON, xhr, requestConf);
            deferred.resolve(rawJSON, xhr);
            }, function (error) {

                var failRequest = function () {
            deferred.reject(error, xhr, url);
                }

                if (error && error.errorCode === "INVALID_ACCESS_TOKEN" && !triedRefresh) {
                    me.refresh().then(makeRequest, failRequest);
                    triedRefresh = true;
                } else {
                    failRequest();
                }
        }, requestConf.iframeTransportUrl);
        };

        var cancelled = false,
            canceller = function() {
                cancelled = true;
                xhr.abort();
                deferred.reject("Request cancelled.")
            };

        makeRequest();
        this.fire('request', xhr, canceller, deferred.promise, requestConf, conf);

        deferred.promise.otherwise(function(error) {
            var res;
            if (!cancelled) {
                me.fire('error', error, xhr, requestConf);
                throw error;
            }
        });


        return deferred.promise;
    },
    refresh: function() {
        var me = this,
            updateClaimsHeaders = function(json, xhr, conf) {
                if (conf === '/token/refresh') {
                    me.context.AppClaims(xhr.getResponseHeader(ApiReference.headerPrefix + 'app-claims'));
                    me.context.UserClaims(xhr.getResponseHeader(ApiReference.headerPrefix + 'user-claims'));
                }
            };
        me.on('success', updateClaimsHeaders);
        return me.request('POST', '/token/refresh').ensure(function () {
            me.off('success', updateClaimsHeaders);
            return null;
        });
    },
    /**
     * @public
     * @memberof ApiInterface#
     * @returns external:Promise#
     */
    action: function(instanceOrType, actionName, data) {
        var me = this,
            obj = instanceOrType instanceof ApiObject ? instanceOrType : me.createSync(instanceOrType),
            type = obj.type;

        obj.fire('action', actionName, data);
        me.fire('action', obj, actionName, data);
        var requestConf = ApiReference.getRequestConfig(actionName, type, data || obj.data, me.context, obj);

        if ((actionName == "update" || actionName == "create") && !data) {
            data = obj.data;
        }

        return me.request(ApiReference.basicOps[actionName], requestConf, data).then(function(rawJSON) {
            if (requestConf.returnType) {
                var returnObj = ApiObject.create(requestConf.returnType, rawJSON, me);
                obj.fire('spawn', returnObj);
                me.fire('spawn', returnObj, obj);
                return returnObj;
            } else {
                if (rawJSON || rawJSON === 0 || rawJSON === false)
                    obj.data = utils.clone(rawJSON);
                delete obj.unsynced;
                obj.fire('sync', rawJSON, obj.data);
                me.fire('sync', obj, rawJSON, obj.data);
                return obj;
            }
        }, function(errorJSON) {
            if (!requestConf.suppressErrors) {
            obj.fire('error', errorJSON);
            me.fire('error', errorJSON, obj);
            }
            throw errorJSON;
        });
    },
    getActionConfig: function(instanceOrType, actionName, data) {
        var me = this,
            obj = instanceOrType instanceof ApiObject ? instanceOrType : me.createSync(instanceOrType),
            type = obj.type;
        return ApiReference.getRequestConfig(actionName, type, data || obj.data, me.context, obj);
    },
    getRequestHeaders: function() {
        return this.context.asHeaders();
    },
    all: function() {
        return utils.when.join.apply(utils.when, arguments);
    },
    steps: function() {
        var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
        return utils.pipeline(Array.prototype.slice.call(args));
    },
    defer: function() {
        return utils.when.defer();
    },
    getAvailableActionsFor: function(type) {
        return ApiReference.getActionsFor(type);
    }
};
var setOp = function(fnName) {
    ApiInterfaceConstructor.prototype[fnName] = function(type, conf, isRemote) {
        return this.action(type, fnName, conf, isRemote);
    };
};
for (var i in ApiReference.basicOps) {
    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
}

// add createSync method for a different style of development
ApiInterfaceConstructor.prototype.createSync = function(type, conf) {
    var newApiObject = ApiObject.create(type, conf, this);
    newApiObject.unsynced = true;
    this.fire('spawn', newApiObject);
    return newApiObject;
};

utils.addEvents(ApiInterfaceConstructor);

module.exports = ApiInterfaceConstructor;

// END INTERFACE

/*********/