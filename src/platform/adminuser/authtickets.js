var sub = require('../utils/sub'),
    makeMethod = require('../utils/make-method'),
    makeAccessor = require('../utils/make-accessor'),
    constants = require('../constants'),
    Client = require('../client');

module.exports = sub(Client, {
  createUserAuthTicket: makeMethod({
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/adminuser/authtickets/tenants?tenantId={tenantId}"
  }),
  refreshAuthTicket: makeMethod({
    method: constants.verbs.PUT,
    url: "{+homePod}api/platform/adminuser/authtickets/tenants?tenantId={tenantId}" 
  }),
  deleteUserAuthTicket: makeMethod({
    method: constants.verbs.DELETE,
    url: "{+homePod}api/platform/adminuser/authtickets/?refreshToken={refreshToken}"
  })
});