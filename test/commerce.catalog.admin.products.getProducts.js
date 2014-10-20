var chai = require('chai'),
    nock = require('nock'),
    client = require('../src/init').client(),
    record = require('./utils/record'),
    testConfig = require('./utils/config');

chai.should();
chai.use(require('chai-as-promised'));

describe('the Mozu JavaScript SDK', function() {
  this.timeout(10000);
  describe('manages its own authentication', function() {
    var recorder = record('commerce.catalog.admin.products.getProducts');

    before(function() {
      client.setTenant(testConfig.tenant);
      client.setMasterCatalog(testConfig.masterCatalog);
      recorder.before();
    });

    after(recorder.after);

    it('always starts from scratch by getting valid app claims using a valid login', function() {
      return client.commerce().catalog().admin().products().getProducts().should.eventually.be.ok;
      // nock will implicitly throw if there are any problems with authentication
    });
  })
});