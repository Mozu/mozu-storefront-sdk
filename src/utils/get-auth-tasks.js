var constants = require('../constants');
var AuthProvider = require('../auth-provider');
var scopes = constants.scopes;

/**
 * Return an array of tasks (functions returning Promises) that performs, in sequence, all necessary authentication tasks for the given scope.
 * @param  {Client} client The client in whose context to run the tasks. AuthProvider will cache the claims per client.
 * @param  {Scope} scope  A scope (bitmask). If the scope is not NONE, then app claims will be added. If the scope is DEVELOPER xor ADMINUSER, user claims will be added.
 * @return {Array}        A list of tasks. If no auth is required, the list will be empty.
 */
module.exports = function getAuthTasks(client, scope) {
  var tasks = [];
  if (scope & scopes.DEVELOPER) {
    tasks.push(function() {
      return AuthProvider.addDeveloperUserClaims(client);
    });
  } else if (scope & scopes.ADMINUSER) {
    tasks.push(function() {
      return AuthProvider.addAdminUserClaims(client);
    })
  }
  if (!scope && AuthProvider.addMostRecentUserClaims) {
    tasks.push(function() {
      return AuthProvider.addMostRecentUserClaims(client);
    });
  }
  if (!(scope & scopes.NONE)) {
    tasks.push(function() {
      return AuthProvider.addPlatformAppClaims(client);
    });
  }

  return tasks;
};