var sub = require('../../utils/sub'),
    makeAccessor = require('../../utils/make-accessor'),
    makeMethod = require('../../utils/make-method'),
    Client = require('../../client');

module.exports = sub(Client, {
  applications: makeAccessor('platform/developer/applications')
});