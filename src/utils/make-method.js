var extend = require('node.extend'),
    request = require('./request'),
    makeUrl = require('./make-url'),
    pipeline = require('when/pipeline'),
    scopes = require('../constants').scopes,
    getAuthTasks = require('./get-auth-tasks');

/**
 * Create an API method that runs a request based on a configuration and a body. The method handles and caches authentication automatically based on a provided scope, by delegating to AuthProvider where necessary.
 * @param {Object} config The configuration object used to create the method. Should include a URITemplate at `url`, optionally an HTTP verb at `method`, and optionally a scope from `constants.scopes` at `scope`.
 * @return {Function} A function that takes two parameters, a `body` object to be used as JSON payload, and optionally an `options` object to be sent to `request` to override default options. Expects to be run in the context of a Client.
 */
module.exports = function(config) {
  return function(body, options) {
    var self = this,
        tasks = getAuthTasks(this, resolveScope(options, config));
    
    tasks.push(function() {
      return request(extend({}, config, self.defaultRequestOptions, {
        url: makeUrl(self.context, config.url, body || {}),
        context: self.context,
        body: body
      }, options));
    });
    return pipeline(tasks);
  }
}

function resolveScope(options, config) {
  if (options && options.scope) {
    if (scopes[options.scope]) return scopes[options.scope];
    return options.scope;
  }
  return config.scope;
}