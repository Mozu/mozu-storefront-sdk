var sub = require('../../../../utils/sub'),
    makeMethod = require('../../../../utils/make-method'),
    makeClient = require('../../../../utils/make-client'),
    constants = require('../../../../constants'),
    AuthProvider = require('../../../../auth-provider'),
    Client = require('../../../../client');

module.exports = sub(Client, {
  getUser: makeMethod({
    scope: constants.scopes.ADMINUSER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/adminuser/accounts/{userId}"
  }),
  getTenantScopesForUser: (function(getTenantScopes) {
      return function getDefaultScope(conf) {
        if (conf) return getTenantScopes.call(this, conf);
        if (this.context.user) return getTenantScopes.call(this, { userId: this.context.user.userId });
        return AuthProvider.addAdminUserClaims(this).then(function() {
          return getTenantScopes.call(this, { userId: this.context.user.userId });
        }.bind(this));
      }
    })(makeMethod({
      scope: constants.scopes.ADMINUSER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/adminuser/accounts/{userId}/tenants" 
    }))
});