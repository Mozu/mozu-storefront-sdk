var uritemplate = require('uritemplate'),
extend = require('node.extend');

var templateCache = {};

/**
 * Creates, evaluates based on context, and returns a string URL for a Mozu API request.
 * @param  {Object} context The context of a client. Should have a `baseUrl` property at minimum.
 * @param  {string} tpt     A string to be compiled into a UriTemplate. Should be a valid UriTemplate.
 * @param  {Object} body      An object consisting of the JSON body of the request, to be used to interpolate URL paramters.
 * @return {string}         A fully qualified URL.
 */
module.exports = function makeUrl(context, tpt, body) {
  var template = templateCache[tpt] || (templateCache[tpt] = uritemplate.parse(tpt));
  var ctx = extend({ homePod: context.baseUrl }, context, body);
  return template.expand(ctx);
}
