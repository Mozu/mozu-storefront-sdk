var constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = Client.sub({
  accounts: Client.from('platform/adminuser/accounts'),
  authtickets: Client.from('platform/adminuser/authtickets')
});
