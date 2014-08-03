var sub = require('../../utils/sub'),
    makeMethod = require('../../utils/make-method'),
    makeAccessor = require('../../utils/make-accessor'),
    constants = require('../../constants'),
    Client = require('../../client');

module.exports = sub(Client, {
  authenticateApp: makeMethod({
    scope: constants.scopes.NONE,
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/applications/authtickets/"
  }),
  refreshAppAuthTicket: makeMethod({
    scope: constants.scopes.NONE,
    method: constants.verbs.PUT,
    url: "{+homePod}api/platform/applications/authtickets/refresh-ticket"
  }),
  deleteAppAuthTicket: makeMethod({
    scope: constants.scopes.NONE,
    method: constants.verbs.DELETE,
    url: "{+homePod}api/platform/applications/authtickets/{refreshToken}"
  })
});
