var request = require('request'),
    when = require('when');

function makeHeaders(headers) {
  var hdrs = {};
  for(var n in headers) {
    hdrs['x-vol-' + n] = headers[n];
  }
  return hdrs;
}

module.exports = function(conf) {
  var deferred = when.defer();
  request({
    proxy: 'http://127.0.0.1:8888',
    strictSSL: false,
    method: conf.method,
    uri: conf.url,
    json: conf.body,
    headers: makeHeaders(conf.context)
  }, function(error, message, response) {
    if (error) return deferred.reject(error);
    if (message && message.statusCode >= 400 && message.statusCode < 600) deferred.reject(response);
    deferred.resolve(response);
  })
  return deferred.promise;
};