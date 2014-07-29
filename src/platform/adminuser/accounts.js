var sub = require('../utils/sub'),
    makeMethod = require('../utils/make-method'),
    Client = require('../client');

module.exports = sub(Client, {
  getUser: makeMethod({
    url: "{+homePod}api/platform/adminuser/accounts/{userId}"
  }),
  getTenantScopesForUser: makeMethod({
    url: "{+homePod}api/platform/adminuser/accounts/{userId}/tenants" 
  })
});