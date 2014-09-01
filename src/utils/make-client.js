/**
 * Create an accessor that returns a new Client subclass from the clients directory.
 * @param  {string} clientPath The path in the clients directory to the client itself, e.g. "platform/application/authtickets".
 * @return {Client}            A newly instantiated subclass of Client.
 */
module.exports = function makeClient(clientPath) {
  return function(cfg) {
    cfg = cfg || {};
    cfg.context = this.context;
    cfg.defaultRequestOptions = this.defaultRequestOptions;
    var clientCls = require("../clients/" + clientPath + "/client");
    return new clientCls(cfg);
  };
}
