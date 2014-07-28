var extend = require('node.extend'),
    request = require('./request'),
    makeUrl = require('./make-url'),
    pipeline = require('when/pipeline'),
    AppAuthenticator = require('../appauthenticator');

module.exports = function(defaults) {
  return function(body) {
    var self = this,
        tasks = [], 
        conf = extend({}, defaults, {
          url: makeUrl(this.context, defaults.url, body),
          context: defaults.headers || {},
          body: body
        });
    if (conf.requiresDeveloperAuth) {
      tasks.push(function() {
        return AppAuthenticator.getDeveloperUserClaims(self.context).then(function(claims) {
          conf.context['user-claims'] = claims;
        });
      });
    }
    tasks.push(function() {
      return AppAuthenticator.getAppClaims(self.context).then(function(claims) {
        conf.context['app-claims'] = claims;
      });
    });
    tasks.push(function() {
      return request(conf);
    });
    return pipeline(tasks);
  }
}