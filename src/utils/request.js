var request = require('request'),
    when = require('when');

function makeHeaders(headers) {
  var hdrs = {};
  for(var n in headers) {
    hdrs['x-vol-' + n] = headers[n];
  }
  return hdrs;
}

return function(conf) {
  var deferred = when.defer();
  request({
    proxy: 'http://127.0.0.1:8888',
    strictSSL: false,
    method: conf.method,
    uri: conf.url,
    json: conf.body,
    headers: conf.contextHeaders
  }, function(error, message, response) {
    if (error) deferred.reject(error);
    deferred.resolve(response);
  })
  return deferred.promise;
};