var sub = require('../../utils/sub'),
    makeMethod = require('../../utils/make-method'),
    makeAccessor = require('../../utils/make-accessor'),
    constants = require('../../constants'),
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