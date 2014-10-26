var constants = require('../../constants');

module.exports = function(Client) {
  return Client.sub({
    getTenant: Client.method({
      method: constants.verbs.GET,
      url: '{+homePod}api/platform/tenants/{tenantId}'
    }) 
  });
};