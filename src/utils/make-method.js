var extend = require('node.extend'),
    request = require('./request'),
    makeUrl = require('./make-url'),
    pipeline = require('when/pipeline'),
    AppAuthenticator = require('../appauthenticator');


module.exports = function(conf) {
  return function(body) {
    var tasks = [];
    conf.url = makeUrl(this, conf.url, body);
    conf.contextHeaders = conf.contextHeaders || {};
    conf.body = body;
    if (conf.requiresDeveloperAuth) {
      tasks.push(function() {
        return AppAuthenticator.getDeveloperUserClaims(this).then(function(claims) {
          conf.contextHeaders['user-claims'] = claims;
        });
      });
    }
    tasks.push(function() {
      return AppAuthenticator.getAppClaims(this).then(function(claims) {
        conf.contextHeaders['app-claims'] = claims;
      });
    });
    tasks.push(function() {
      return request(conf);
    });
    return pipeline(tasks);
  }
}