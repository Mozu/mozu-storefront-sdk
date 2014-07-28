var util = require('util'),
    extend = require('node.extend');

module.exports = function sub(cons, proto) {
  var sub = function() {
      cons.apply(this, arguments);
  };
  util.inherits(sub, cons);
  if (proto) extend(sub.prototype, proto);
  return sub;
}