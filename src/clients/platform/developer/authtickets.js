var constants = require('../../../constants');

module.exports = function(Client) {
  return Client.sub({
    createDeveloperUserAuthTicket: Client.method({
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/authtickets/{?developerAccountId}"
    }),
    refreshDeveloperAuthTicket: Client.method({
      method: constants.verbs.PUT,
      url: "{+homePod}api/platform/developer/authtickets/{?developerAccountId}"
    }),
    deleteUserAuthTicket: Client.method({
      method: constants.verbs.DELETE,
      url: "{+homePod}api/platform/developer/authtickets/{?developerAccountId}"
    })
  });
};