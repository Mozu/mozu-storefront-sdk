var sub = require('../../../utils/sub'),
    makeClient = require('../../../utils/make-client'),
    Client = require('../../../client');

module.exports = sub(Client, {
  admin: makeClient('commerce/catalog/admin')
});