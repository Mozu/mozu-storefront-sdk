var constants = require('../../constants');

module.exports = function(Client) {
  return Client.sub({
    authtickets: require('./developer/authtickets')(Client),
    applications: require('./developer/applications')(Client)
  });
};