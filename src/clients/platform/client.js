var Client = require('../../client');

module.exports = Client.sub({
  adminuser: Client.from('platform/adminuser'),
  applications: Client.from('platform/applications'),
  developer: Client.from('platform/developer'),
  tenants: Client.from('platform/developer')
});