var constants = require('../../constants');

module.exports = function(Client) {
  return Client.sub({
    accounts: require('./adminuser/accounts')(Client),
    authtickets: require('./adminuser/authtickets')(Client)
  });
};
