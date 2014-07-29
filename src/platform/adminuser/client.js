var sub = require('../../utils/sub'),
    makeAccessor = require('../../utils/make-accessor'),
    makeMethod = require('../../utils/make-method'),
    Client = require('../../client');

module.exports = sub(Client, {
  accounts: makeAccessor('platform/adminuser/accounts'),
  authtickets: makeAccessor('platform/adminuser/authtickets')
});
