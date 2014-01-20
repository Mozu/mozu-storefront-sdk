// BEGIN REFERENCE
var utils = require('./utils');
var errors = require('./errors');
var ApiCollection;
var ApiObject = require('./object');
var objectTypes = require('./methods.json');

errors.register({
    'NO_REQUEST_CONFIG_FOUND': 'No request configuration was found for {0}.{1}',
    'NO_SHORTCUT_PARAM_FOUND': 'No shortcut parameter available for {0}. Please supply a configuration object instead of "{1}".'
});

var basicOps = {
    get: 'GET',
    update: 'PUT',
    create: 'POST',
    del: 'DELETE'
};
var copyToConf = ['verb', 'returnType', 'noBody'],
    copyToConfLength = copyToConf.length;
var reservedWords = {
    template: true,
    defaultParams: true,
    shortcutParam: true,
    defaults: true,
    verb: true,
    returnType: true,
    noBody: true,
    includeSelf: true,
    collectionOf: true,
    overridePostData: true,
    useIframeTransport: true,
    construct: true,
    postconstruct: true,
};
var ApiReference = {

    basicOps: basicOps,
    urls: {},

    getActionsFor: function(typeName) {
        ApiCollection = ApiCollection || require('./collection');
        if (!objectTypes[typeName]) return false;
        var actions = [],
            isSimpleType = (typeof objectTypes[typeName] === "string");
        for (var a in basicOps) {
            if (isSimpleType || !(a in objectTypes[typeName]))
                actions.push(a);
        }
        if (!isSimpleType) {
            for (a in objectTypes[typeName]) {
                if (a && objectTypes[typeName].hasOwnProperty(a) && !reservedWords[a])
                    actions.push(utils.camelCase(a));
            }
        }
        var declaredType = (objectTypes[typeName].collectionOf ? ApiCollection : ApiObject).types[typeName];
        if (declaredType) {
            for (a in declaredType) {
                if (isSimpleType || !(utils.dashCase(a) in objectTypes[typeName] && !reservedWords[a]) && typeof declaredType[a] === "function") actions.push(a);
            }
        }

        return actions;
    },

    getRequestConfig: function(operation, typeName, conf, context, obj) {

        var returnObj, tptData;

        // get object type from our reference
        var oType = objectTypes[typeName];

        // there may not be one
        if (!oType) errors.throwOnObject(obj, 'NO_REQUEST_CONFIG_FOUND', typeName, '');

        // get specific details of the requested operation
        if (operation) operation = utils.dashCase(operation);
        if (oType[operation]) oType = oType[operation];

        // some oTypes are a simple template as a string
        if (typeof oType === "string") oType = {
            template: oType
        };

        // the defaults at the root object type should be copied into all operation configs
        if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);

        // a template is required
        if (!oType.template) errors.throwOnObject(obj, 'NO_REQUEST_CONFIG_FOUND', typeName, operation);

        returnObj = {};
        tptData = {};

        // cache templates lazily
        if (typeof oType.template === "string") oType.template = utils.uritemplate.parse(oType.template);

        // add the requesting object's data itself to the tpt context
        if (oType.includeSelf && obj) {
            if (oType.includeSelf.asProperty) {
                tptData[oType.includeSelf.asProperty] = obj.data
            } else {
                tptData = utils.extend(tptData, obj.data);
            }
        }

        // shortcutparam allows you to use the most commonly used conf property as a string or number argument
        if (conf !== undefined && typeof conf !== "object") {
            if (!oType.shortcutParam) errors.throwOnObject(obj, 'NO_SHORTCUT_PARAM_FOUND', typeName, conf);
            tptData[oType.shortcutParam] = conf;
        } else if (conf) {
            // add the conf argued directly into this request fn to the tpt context
            utils.extend(tptData, conf);
        }

        // default params added to template, but overridden by existing tpt data
        if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);

        // remove stuff that the UriTemplate parser can't parse
        for (var tvar in tptData) {
            if (utils.getType(tptData[tvar]) == "Array") tptData[tvar] = JSON.stringify(tptData[tvar]);
        }
        var fullTptContext = utils.extend({
            _: tptData
        }, context.asObject('context-'), utils.flatten(tptData, {}), ApiReference.urls);
        returnObj.url = oType.template.expand(fullTptContext);
        for (var j = 0; j < copyToConfLength; j++) {
            if (copyToConf[j] in oType) returnObj[copyToConf[j]] = oType[copyToConf[j]];
        }
        if (oType.useIframeTransport) {
            // cache templates lazily
            if (typeof oType.useIframeTransport === "string") oType.useIframeTransport = utils.uritemplate.parse(oType.useIframeTransport);
            returnObj.iframeTransportUrl = oType.useIframeTransport.expand(fullTptContext);
        }
        if (oType.overridePostData) {
            var overriddenData;
            if (utils.getType(oType.overridePostData) == "Array") {
                overriddenData = {};
                for (var tOK = 0; tOK < oType.overridePostData.length; tOK++) {
                    overriddenData[oType.overridePostData[tOK]] = tptData[oType.overridePostData[tOK]];
                }
            } else {
                overriddenData = tptData;
            }
            returnObj.overridePostData = overriddenData;
        }
        return returnObj;
    },

    getType: function(typeName) {
        return objectTypes[typeName];
    }
};

module.exports = ApiReference;

// END REFERENCE

/***********/