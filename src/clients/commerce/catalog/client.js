var Client = require('../../../client');

module.exports = Client.sub({
  admin: Client.from('commerce/catalog/admin')
});