var sub = require('../utils/sub'),
    makeAccessor = require('../utils/make-accessor'),
    Client = require('../client');

module.exports = sub(Client, {
  adminuser: makeAccessor('platform/adminuser/client'),
  applications: makeAccessor('platform/applications/client'),
  developer: makeAccessor('platform/developer/client'),
  tenants: makeAccessor('platform/developer/tenants')
});