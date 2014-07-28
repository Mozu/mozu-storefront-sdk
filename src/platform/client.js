var sub = require('../utils/sub'),
    makeAccessor = require('../utils/make-accessor'),
    Client = require('../client');

module.exports = sub(Client, {
  applications: makeAccessor('platform/applications'),
  developer: makeAccessor('platform/developer')
});