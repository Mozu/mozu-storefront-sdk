var constants = require('../../../../constants'),
    Client = require('../../../../client');

module.exports = Client.sub({
  createUserAuthTicket: Client.method({
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/adminuser/authtickets/tenants{?tenantId}"
  }),
  refreshAuthTicket: Client.method({
    method: constants.verbs.PUT,
    url: "{+homePod}api/platform/adminuser/authtickets/tenants{?tenantId}" 
  }),
  deleteUserAuthTicket: Client.method({
    method: constants.verbs.DELETE,
    url: "{+homePod}api/platform/adminuser/authtickets/{?refreshToken}"
  })
});