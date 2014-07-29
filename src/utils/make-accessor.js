var extend = require('node.extend');

module.exports = function makeAccessor(clientCls) {
  return function(cfg) {
    clientCls = require("../" + clientCls + "/client");
    return new clientCls(extend(cfg || {}, { context: this.context }));
  };
}