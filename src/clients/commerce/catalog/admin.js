module.exports = function(Client) {
  return Client.sub({
    products: require('./admin/products')(Client)
  });
};