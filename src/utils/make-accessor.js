var extend = require('node.extend');

module.exports = function makeAccessor(clientCls) {
  return function(cfg) {
    clientCls = require("../" + clientCls);
    return new clientCls(extend(cfg || {}, this));
  };
}