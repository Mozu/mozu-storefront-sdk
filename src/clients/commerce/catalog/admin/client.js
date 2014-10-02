var Client = require('../../../../client');

module.exports = Client.sub({
  products: Client.from('commerce/catalog/admin/products')
});