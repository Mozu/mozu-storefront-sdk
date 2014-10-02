var constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = Client.sub({
  getTenant: Client.method({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: '{+homePod}api/platform/tenants/{tenantId}'
  }) 
});