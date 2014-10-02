module.exports = function(Client) {
  return Client.sub({
    catalog: require('./commerce/catalog')(Client)
  });
};