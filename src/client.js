var extend = require('node.extend'),
    makeAccessor = require('./utils/make-accessor');

function Client(cfg) {
  extend(this, cfg);
}

extend(Client.prototype, {
  // commerce: makeAccessor('./commerce/client'),
  // content: makeAccessor('./content/client'),
  // event: makeAccessor('./event/client'),
  platform: makeAccessor('platform/client')
});

module.exports = Client;