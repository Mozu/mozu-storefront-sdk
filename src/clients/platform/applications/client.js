var constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = Client.sub({
  authtickets: Client.from('platform/applications/authtickets')
});