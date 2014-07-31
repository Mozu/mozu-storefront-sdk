var sub = require('../../utils/sub'),
    makeMethod = require('../../utils/make-method'),
    makeAccessor = require('../../utils/make-accessor'),
    constants = require('../../constants'),
    Client = require('../../client');

module.exports = sub(Client, {
  authtickets: makeAccessor('platform/developer/authtickets'),
  applications: makeAccessor('platform/developer/applications')
});