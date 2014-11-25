// BEGIN INIT
var fs = require('fs'),
    extend = require('node.extend'),
    path = require('path'),
    Client = require('./client');

var legalConfigNames = ['mozu.config','mozu.config.json']

function getConfig() {
  var conf;
  for (var i = legalConfigNames.length - 1; i >= 0; i--) {
    try {
      conf = fs.readFileSync(path.resolve(legalConfigNames[i]), 'utf-8');
    } catch(e) {}
    if (conf) break;
  }
  if (!conf) {
    throw new Error("No configuration file found. Either create a 'mozu.config' or 'mozu.config.json' file, or supply full config to the .client() method.");
  }
  try {
    conf = JSON.parse(conf);
  } catch(e) {
    throw new Error("Configuration file was unreadable: " + e.message);
  }
  return conf;
}


module.exports = {
  client: function(cfg) {
    cfg = cfg || {};
    if (!cfg || !cfg.appId || !cfg.sharedSecret  || !cfg.baseUrl) {
      cfg = extend(getConfig(), cfg);
    }
    return new Client({context: cfg});
  }
}
// END INIT