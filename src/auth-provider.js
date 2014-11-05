var constants = require('./constants'),
    when = require('when');

/**
 * A promise that will resolve to an App Claims
 * @typedef {Object} AppClaimsPromise
 */

/**
 * The authentication ticket used to authenticate anything.
 * @class AuthTicket
 * @property {string} accessToken The token that stores an encrypted list of the application's configured behaviors and authenticates the application.
 * @property {Date} accessTokenExpiration Date and time the access token expires. After the access token expires, refresh the authentication ticket using the refresh token.
 * @property {string} refreshToken The token that refreshes the application's authentication ticket.
 * @property {Date} refreshTokenExpiration Date and time the refresh token expires. After the refresh token expires, generate a new authentication ticket.
 */
function AuthTicket(json) {
  var self = this;
  for (var p in json) {
    if (json.hasOwnProperty(p)) {
      self[p] = p.indexOf('Expiration') !== -1 ? new Date(json[p]) : json[p]; // dateify the dates, this'll break if the prop name changes
    }
  }
}
AuthTicket.create = function(json) {
  return new AuthTicket(json);
}

function getPlatformAuthTicket(client) {
  return client.platform().applications().authTicket().authenticateApp({
    applicationId: client.context.appId,
    sharedSecret: client.context.sharedSecret
  }, {
    scope: constants.scopes.NONE
  }).then(AuthTicket.create);
}

function refreshPlatformAuthTicket(client, ticket) {
  return client.platform().applications().authTicket().refreshAppAuthTicket({
    refreshToken: ticket.refreshToken
  }).then(AuthTicket.create);
}

function getDeveloperAuthTicket(client) {
  return client.root().platform().developer().developerAdminUserAuthTicket().createDeveloperUserAuthTicket(client.context.developerAccount).then(function(json) {
    if (json.availableTenants && json.availableTenants.length > 0) client.setAvailableTenants(json.availableTenants);
    return AuthTicket.create(json);
  });
}

function refreshDeveloperAuthTicket(client, ticket) {
  return client.root().platform().developer().developerAdminUserAuthTicket().refreshDeveloperUserAuthTicket(ticket).then(AuthTicket.create);
}

function getAdminUserAuthTicket(client) {
  return client.root().platform().adminuser().tenantAdminUserAuthTicket().createUserAuthTicket({ tenantId: client.getTenant() }, { body: client.context.developerAccount }).then(function(json) {
    client.context.user = json.user;
    if (json.availableTenants && json.availableTenants.length > 0) client.setAvailableTenants(json.availableTenants);
    return AuthTicket.create(json);
  })
}

function refreshAdminUserAuthTicket(client, ticket) {
  return client.root().platform().adminuser().authtickets().refreshAuthTicket(ticket).then(AuthTicket.create);
}

function makeClaimMemoizer(calleeName, requester, refresher, claimHeader) {
  var claimCache = {};
  return function(client) {
    var claimsOp,
        now = new Date(),
        cached = claimCache[client.context.appId],
        cacheAndUpdateClient = function(ticket) {
          claimCache[client.context.appId] = ticket;
          client.context[claimHeader] = ticket.accessToken;
          return client;
        };
    if (!cached || (cached.refreshTokenExpiration < now && cached.accessTokenExpiration < now)) {
      return requester(client).then(cacheAndUpdateClient);
    } else if (cached.accessTokenExpiration < now && cached.refreshTokenExpiration > now) {
      claimsOp = refresher(client, cached).then(cacheAndUpdateClient);
    } else {
      client.context[claimHeader] = cached.accessToken;
      claimsOp = when(client);
    }
    claimsOp.ensure(function() {
      allClaimMethods.addMostRecentUserClaims = allClaimMethods[calleeName];
    });
    return claimsOp;
  };
}


var allClaimMethods = {
  addPlatformAppClaims: makeClaimMemoizer('addPlatformAppClaims', getPlatformAuthTicket, refreshPlatformAuthTicket, constants.headers.APPCLAIMS),
  addDeveloperUserClaims: makeClaimMemoizer('addDeveloperUserClaims', getDeveloperAuthTicket, refreshDeveloperAuthTicket, constants.headers.USERCLAIMS),
  addAdminUserClaims: makeClaimMemoizer('addAdminUserClaims', getAdminUserAuthTicket, refreshAdminUserAuthTicket, constants.headers.USERCLAIMS),
  addMostRecentUserClaims: false
};

module.exports = allClaimMethods;
