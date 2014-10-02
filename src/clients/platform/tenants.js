var constants = require('../../constants');

module.exports = function(Client) {
  return Client.sub({
    getTenant: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: '{+homePod}api/platform/tenants/{tenantId}'
    }) 
  });
};