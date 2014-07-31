var extend = require('node.extend'),
    request = require('./request'),
    makeUrl = require('./make-url'),
    pipeline = require('when/pipeline'),
    constants = require('../constants'),
    AuthProvider = require('../auth-provider');

module.exports = function(defaults) {
  return function(body, options) {
    var self = this,
        tasks = [];
    if (defaults.scope & constants.scopes.DEVELOPER) {
      tasks.push(function() {
        return AuthProvider.addDeveloperUserClaims(self);
      });
    }
    if (defaults.scope & (constants.scopes.TENANT | ~constants.scopes.SHOPPER) ) {
      tasks.push(function() {
        return AuthProvider.addAdminUserClaims(self);
      })
    }
    tasks.push(function() {
      return AuthProvider.getAppClaims(self.context).then(function(claims) {
        self.setAppClaims(claims);
      });
    });
    tasks.push(function() {
      return request(extend({}, defaults, {
        url: makeUrl(self.context, defaults.url, body),
        context: self.context,
        body: body
      }, options));
    });
    return pipeline(tasks);
  }
}