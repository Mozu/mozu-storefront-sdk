var util = require('util'),
    extend = require('node.extend');

/**
 * Subclass a constructor. Like Node's `util.inherits` but lets you pass additions to the prototype, and composes constructors.
 * @param  {Function} cons  The constructor to subclass.
 * @param  {Object} proto Methods to add to the prototype.
 * @return {Function}       The new subclass.
 */
module.exports = function sub(cons, proto) {
  var sub = function() {
      cons.apply(this, arguments);
  };
  util.inherits(sub, cons);
  if (proto) extend(sub.prototype, proto);
  return sub;
}