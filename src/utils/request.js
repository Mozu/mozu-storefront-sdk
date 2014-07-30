var request = require('request'),
    constants = require('../constants'),
    scopes = constants.scopes,
    when = require('when'),
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
  if (context[DATAVIEWMODE]) headers[DATAVIEWMODE] = context[DATAVIEWMODE];
  if (conf.scope & (scopes.DEVELOPER | scopes.SHOPPER)) {
    headers[USERCLAIMS] = context[USERCLAIMS];
  }
  if (conf.scope & scopes.TENANT) {
    headers[TENANT] = context[TENANT];
  }
  if (conf.scope & scopes.SITE) {
    headers[SITE] = context[SITE];
  }
  if (conf.scope & scopes.MASTERCATALOG) {
    headers[MASTERCATALOG] = context[MASTERCATALOG];
  }
  if (conf.scope & scopes.CATALOG) {
    headers[CATALOG] = context[CATALOG];
  }
  return headers;
}

module.exports = function(conf) {
  var deferred = when.defer();
  request({
    proxy: 'http://127.0.0.1:8888',
    strictSSL: false,
    method: conf.method,
    uri: conf.url,
    json: conf.body,
    headers: makeContext(conf)
  }, function(error, message, response) {
    if (error) return deferred.reject(error);
    if (message && message.statusCode >= 400 && message.statusCode < 600) deferred.reject(response);
    deferred.resolve(response);
  })
  return deferred.promise;
};