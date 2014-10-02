var constants = require('../../../constants');

module.exports = function(Client) {
  return Client.sub({
    authenticateApp: Client.method({
      scope: constants.scopes.NONE,
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/applications/authtickets/"
    }),
    refreshAppAuthTicket: Client.method({
      scope: constants.scopes.NONE,
      method: constants.verbs.PUT,
      url: "{+homePod}api/platform/applications/authtickets/refresh-ticket"
    }),
    deleteAppAuthTicket: Client.method({
      scope: constants.scopes.NONE,
      method: constants.verbs.DELETE,
      url: "{+homePod}api/platform/applications/authtickets/{refreshToken}"
    })
  });
};