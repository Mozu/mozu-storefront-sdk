var request = require('request'),
    constants = require('../constants'),
    scopes = constants.scopes,
    when = require('when'),
    extend = require('node.extend'),
    APPCLAIMS = constants.headers.APPCLAIMS,
    USERCLAIMS = constants.headers.USERCLAIMS,
    TENANT = constants.headers.TENANT,
    SITE = constants.headers.SITE,
    MASTERCATALOG = constants.headers.MASTERCATALOG,
    CATALOG = constants.headers.CATALOG,
    DATAVIEWMODE = constants.headers.DATAVIEWMODE;

function makeContext(conf) {
  var headers = {},
  context = conf.context;
  if (context[APPCLAIMS]) headers[APPCLAIMS] = context[APPCLAIMS];
  if (context[DATAVIEWMODE]) {
    headers[DATAVIEWMODE] = context[DATAVIEWMODE];
  } 
  if (conf.scope & (scopes.DEVELOPER | scopes.ADMINUSER | scopes.SHOPPER)) {
    headers[USERCLAIMS] = context[USERCLAIMS];
  }
  if (((conf.scope & scopes.TENANT) == scopes.TENANT) && context[TENANT]) {
    headers[TENANT] = context[TENANT];
  }
  if (((conf.scope & scopes.SITE) == scopes.SITE) && context[SITE]) {
    headers[SITE] = context[SITE];
  }
  if (((conf.scope & scopes.MASTERCATALOG) == scopes.MASTERCATALOG) && context[MASTERCATALOG]) {
    headers[MASTERCATALOG] = context[MASTERCATALOG];
  }
  if (((conf.scope & scopes.CATALOG) == scopes.CATALOG) && context[CATALOG]) {
    headers[CATALOG] = context[CATALOG];
  }
  return headers;
}

/**
 * Make an HTTP request to the Mozu API. This method populates headers based on the scope of the supplied context.
 * @param  {Object} options The request options, to be passed to the `request` module. Look up on NPM for details.
 * @return {Promise<ApiResponse,ApiError>}         A Promise that will fulfill as the JSON response from the API, or reject with an error as JSON from the API.
 */
module.exports = function(options) {
  var deferred = when.defer(),
      conf = extend({}, options);
  if (conf.body && typeof conf.body === "object") {
    conf.json = conf.body;
    delete conf.body;
  }
  conf.headers = makeContext(conf);
  request(conf, function(error, message, response) {
    if (error) return deferred.reject(error);
    if (message && message.statusCode >= 400 && message.statusCode < 600) deferred.reject(response);
    deferred.resolve(response);
  })
  return deferred.promise;
};