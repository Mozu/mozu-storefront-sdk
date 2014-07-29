var sub = require('../../utils/sub'),
    makeAccessor = require('../../utils/make-accessor'),
    makeMethod = require('../../utils/make-method'),
    Client = require('../../client');

module.exports = sub(Client, {
  authenticateApp: makeMethod({
    method: "GET",
    url: "{+homePod}api/platform/applications/authtickets/"
  }),
  refreshAppAuthTicket: makeMethod({
    method: "PUT",
    url: "{+homePod}api/platform/applications/authtickets/refresh-ticket"
  }),
  deleteAppAuthTicket: makeMethod({
    method: "DELETE",
    url: "{+homePod}api/platform/applications/authtickets/{refreshToken}"
  })
});