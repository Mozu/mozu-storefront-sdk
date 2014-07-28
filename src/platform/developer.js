var sub = require('../utils/sub'),
    makeMethod = require('../utils/make-method'),
    Client = require('../client');

module.exports = sub(Client, {
  getAllApplications: makeMethod({
    requiresDeveloperAuth: true,
    method: 'GET',
    url: '{+homePod}/api/platform/developer/applications/{?_*}'
  })
});