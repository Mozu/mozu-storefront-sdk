var uritemplate = require('uritemplate'),
extend = require('node.extend');

var templateCache = {};

module.exports = function makeUrl(context, tpt, obj) {
  var template = templateCache[tpt] || (templateCache[tpt] = uritemplate.parse(tpt));
  var ctx = extend({ homePod: context.baseUrl, tenantPod: context.tenantPodUrl }, context, obj);
  console.log(tpt, ctx, context);
  return template.expand(ctx);
}
