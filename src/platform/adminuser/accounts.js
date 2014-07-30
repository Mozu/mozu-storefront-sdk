var sub = require('../utils/sub'),
    makeMethod = require('../utils/make-method'),
    makeAccessor = require('../utils/make-accessor'),
    constants = require('../constants'),
    Client = require('../client');

module.exports = sub(Client, {
  getUser: makeMethod({
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/adminuser/accounts/{userId}"
  }),
  getTenantScopesForUser: makeMethod({
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/adminuser/accounts/{userId}/tenants" 
  })
});