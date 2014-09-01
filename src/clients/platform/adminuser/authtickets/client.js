var sub = require('../../../../utils/sub'),
    makeMethod = require('../../../../utils/make-method'),
    makeClient = require('../../../../utils/make-client'),
    constants = require('../../../../constants'),
    Client = require('../../../../client');

module.exports = sub(Client, {
  createUserAuthTicket: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/adminuser/authtickets/tenants{?tenantId}"
  }),
  refreshAuthTicket: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.PUT,
    url: "{+homePod}api/platform/adminuser/authtickets/tenants{?tenantId}" 
  }),
  deleteUserAuthTicket: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.DELETE,
    url: "{+homePod}api/platform/adminuser/authtickets/{?refreshToken}"
  })
});