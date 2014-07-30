var extend = require('node.extend'),
    makeAccessor = require('./utils/make-accessor'),
    constants = require('./constants'),

    rdashAlpha = /-([\da-z])/gi,
    cccb = function (match, l) {
        return l.toUpperCase();
    },
    cutoff = constants.headerPrefix.length;

function Client(cfg) {
  extend(this, cfg);
}

extend(Client.prototype, {
  // commerce: makeAccessor('./commerce/client'),
  // content: makeAccessor('./content/client'),
  // event: makeAccessor('./event/client'),
  platform: makeAccessor('platform/client')
});

function camelCase (str) {
  return (str.charAt(0).toUpperCase() + str.substring(1)).replace(rdashAlpha, cccb);
};

function createAccessor(name) {
  var accessorName = camelCase(name.substring(cutoff));
  Client.prototype['get' + accessorName] = function() {
    return this.context[name];
  };
  Client.prototype['set' + accessorName] = function(val) {
    this.context[name] = val;
    return this;
  };
}

for (var h in constants.headers) {
  if (Object.prototype.hasOwnProperty.call(constants.headers, h)) {
    createAccessor(constants.headers[h]);
  }
}

module.exports = Client;