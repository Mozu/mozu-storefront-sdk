module.exports = function makeAccessor(clientCls) {
  return function(cfg) {
    cfg = cfg || {};
    cfg.context = this.context;
    clientCls = require("../" + clientCls);
    return new clientCls(cfg);
  };
}