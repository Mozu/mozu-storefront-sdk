var sub = require('../utils/sub'),
    makeMethod = require('../utils/make-method'),
    makeAccessor = require('../utils/make-accessor'),
    constants = require('../constants'),
    Client = require('../client');

module.exports = sub(Client,{
  getTenant: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: '{+homePod}api/platform/tenants/{tenantId}'
  }) 
});