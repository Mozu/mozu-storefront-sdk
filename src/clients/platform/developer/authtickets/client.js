var sub = require('../../../../utils/sub'),
    makeMethod = require('../../../../utils/make-method'),
    makeClient = require('../../../../utils/make-client'),
    constants = require('../../../../constants'),
    Client = require('../../../../client');

module.exports = sub(Client, {
  createDeveloperUserAuthTicket: makeMethod({
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/developer/authtickets/{?developerAccountId}"
  }),
  refreshDeveloperAuthTicket: makeMethod({
    method: constants.verbs.PUT,
    url: "{+homePod}api/platform/developer/authtickets/{?developerAccountId}"
  }),
  deleteUserAuthTicket: makeMethod({
    method: constants.verbs.DELETE,
    url: "{+homePod}api/platform/developer/authtickets/{?developerAccountId}"
  })
});