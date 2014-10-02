var Client = require('../../client');

module.exports = Client.sub({
  catalog: Client.from('commerce/catalog')
});