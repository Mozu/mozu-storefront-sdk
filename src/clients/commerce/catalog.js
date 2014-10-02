module.exports = function(Client) {
  return Client.sub({
    admin: require('./catalog/admin')(Client)
  });
};