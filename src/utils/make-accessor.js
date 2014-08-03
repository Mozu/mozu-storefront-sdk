module.exports = function makeAccessor(clientClsName) {
  if ((typeof clientClsName) !== "string") throw new Error("Expected clientClsName argument to makeAccessor to be string, was instead this:", clientClsName);
  return function(cfg) {
    cfg = cfg || {};
    cfg.context = this.context;
    cfg.defaultRequestOptions = this.defaultRequestOptions;
    var clientCls = require("../" + clientClsName);
    return new clientCls(cfg);
  };
}
