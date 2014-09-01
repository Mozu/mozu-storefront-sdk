var sub = require('../../utils/sub'),
    makeClient = require('../../utils/make-client'),
    Client = require('../../client');

module.exports = sub(Client, {
  adminuser: makeClient('platform/adminuser'),
  applications: makeClient('platform/applications'),
  developer: makeClient('platform/developer'),
  tenants: makeClient('platform/developer')
});