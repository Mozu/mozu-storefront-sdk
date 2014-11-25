/**
 * Create an accessor that returns a new Client subclass from the clients directory.
 * @param  {string} clientPath The path in the clients directory to the client itself, e.g. "platform/application/authtickets".
 * @return {Client}            A newly instantiated subclass of Client.
 */
var constants = require('../constants'),
  versionKey = constants.headers.VERSION,
  version = constants.version;
module.exports = function makeClient(clientCls) {
  return function(cfg) {
    cfg = cfg || {};
    cfg.context = this.context;
    if (!cfg.context[versionKey]) cfg.context[versionKey] = version;
    cfg.defaultRequestOptions = this.defaultRequestOptions;
    return new clientCls(cfg);
  };
}
