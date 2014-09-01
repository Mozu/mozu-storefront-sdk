var sub = require('../../../utils/sub'),
    makeMethod = require('../../../utils/make-method'),
    makeClient = require('../../../utils/make-client'),
    constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = sub(Client, {
  accounts: makeClient('platform/adminuser/accounts'),
  authtickets: makeClient('platform/adminuser/authtickets')
});
