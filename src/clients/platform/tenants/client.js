var sub = require('../../../utils/sub'),
    makeMethod = require('../../../utils/make-method'),
    makeClient = require('../../../utils/make-client'),
    constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = sub(Client,{
  getTenant: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: '{+homePod}api/platform/tenants/{tenantId}'
  }) 
});