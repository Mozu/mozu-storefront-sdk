var sub = require('../utils/sub'),
    makeMethod = require('../utils/make-method'),
    Client = require('../client');

module.exports = sub(Client, {
  createUserAuthTicket: makeMethod({
    method: "POST",
    url: "{+homePod}api/platform/adminuser/authtickets/tenants?tenantId={tenantId}"
  }),
  refreshAuthTicket: makeMethod({
    method: "PUT",
    url: "{+homePod}api/platform/adminuser/authtickets/tenants?tenantId={tenantId}" 
  }),
  deleteUserAuthTicket: makeMethod({
    method: "DELETE",
    url: "{+homePod}api/platform/adminuser/authtickets/?refreshToken={refreshToken}"
  })
});