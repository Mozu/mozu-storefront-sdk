var constants = require('../../constants');

module.exports = function(Client) {
  return Client.sub({
    authtickets: require('./applications/authtickets')(Client)
  });
};