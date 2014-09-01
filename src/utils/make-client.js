module.exports = function makeClient(clientPath) {
  return function(cfg) {
    cfg = cfg || {};
    cfg.context = this.context;
    cfg.defaultRequestOptions = this.defaultRequestOptions;
    var clientCls = require("../clients/" + clientPath + "/client");
    return new clientCls(cfg);
  };
}
