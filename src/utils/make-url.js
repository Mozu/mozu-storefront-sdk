var uritemplate = require('uritemplate'),
extend = require('node.extend');

var templateCache = {};

module.exports = function makeUrl(context, tpt, obj) {
  var template = templateCache[tpt] || (templateCache[tpt] = uritemplate.parse(tpt));
  return template.expand(extend({ homePod: context.baseUrl, tenantPod: context.tenantPodUrl }, obj));
}
