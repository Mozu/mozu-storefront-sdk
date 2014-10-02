var constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = Client.sub({
  authtickets: Client.from('platform/developer/authtickets'),
  applications: Client.from('platform/developer/applications')
});