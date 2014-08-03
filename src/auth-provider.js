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
  return client.platform().applications().authtickets().authenticateApp({
    applicationId: client.context.appId,
    sharedSecret: client.context.sharedSecret
  }).then(AuthTicket.create);
}

function refreshPlatformAuthTicket(client, ticket) {
  return client.platform().applications().authtickets().refreshAppAuthTicket({
    refreshToken: ticket.refreshToken
  }).then(AuthTicket.create);
}

function getDeveloperAuthTicket(client) {
  return client.root().platform().developer().authtickets().createDeveloperUserAuthTicket(client.context.developerAccount).then(AuthTicket.create);
}

function refreshDeveloperAuthTicket(client, ticket) {
  return client.root().platform().developer().authtickets().refreshDeveloperAuthTicket(ticket).then(AuthTicket.create);
}

function getAdminUserAuthTicket(client) {
  return client.root().platform().adminuser().authtickets().createUserAuthTicket({
    tenantId: client.getTenant()
  }, {
    body: client.context.developerAccount
  });
}

function refreshAdminUserAuthTicket(client, ticket) {
  return client.root().platform().adminuser().authtickets().refreshAuthTicket({
    tenantId: client.getTenant()
  }, {
    body: ticket
  }).then(AuthTicket.create);
}

function makeClaimMemoizer(requester, refresher, claimHeader) {
  var claimCache = {};
  return function(client) {
    var now = new Date(),
        cached = claimCache[client.context.appId],
        cacheAndUpdateClient = function(ticket) {
          claimCache[client.context.appId] = ticket;
          client.context[claimHeader] = ticket.accessToken;
          return client;
        };
    if (!cached || (cached.refreshTokenExpiration < now && cached.accessTokenExpiration < now)) {
      return requester(client).then(cacheAndUpdateClient);
    } else if (cached.accessTokenExpiration < now && cached.refreshTokenExpiration > now) {
      return refresher(client, cached).then(cacheAndUpdateClient);
    } else {
      client.context[claimHeader] = cached.accessToken;
      return when(client);
    }
  };
}

var addPlatformAppClaims = makeClaimMemoizer(getPlatformAuthTicket, refreshPlatformAuthTicket, constants.headers.APPCLAIMS),
    addDeveloperUserClaims = makeClaimMemoizer(getDeveloperAuthTicket, refreshDeveloperAuthTicket, constants.headers.USERCLAIMS),
    addAdminUserClaims = makeClaimMemoizer(getAdminUserAuthTicket, refreshAdminUserAuthTicket, "TODO--WHAT_HEADER!!?");

/**
 * Get app claims string. Returns a promise because if necessary this will re-authenticate to acquire the string.
 * @return {AppClaimsPromise}
 * @param {string} host The host to use to access the platform service, e.g. `http://home.mozu.com` for normal production environments
 * @param {string} appId Application Id
 * @param {string} sharedSecret Shared Secret
 */
module.exports = {
  addPlatformAppClaims: addPlatformAppClaims,
  addDeveloperUserClaims: addDeveloperUserClaims,
  addAdminUserClaims: addAdminUserClaims
};
