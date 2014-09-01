var sub = require('../../../utils/sub'),
    makeMethod = require('../../../utils/make-method'),
    makeClient = require('../../../utils/make-client'),
    constants = require('../../../constants'),
    Client = require('../../../client');

module.exports = sub(Client, {
  authtickets: makeClient('platform/developer/authtickets'),
  applications: makeClient('platform/developer/applications')
});