var sub = require('../../utils/sub'),
    makeMethod = require('../../utils/make-method'),
    makeAccessor = require('../../utils/make-accessor'),
    constants = require('../../constants'),
    Client = require('../../client');

module.exports = sub(Client, {
  accounts: makeAccessor('platform/adminuser/accounts'),
  authtickets: makeAccessor('platform/adminuser/authtickets')
});
