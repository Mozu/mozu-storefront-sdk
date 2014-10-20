var chai = require('chai'),
    nock = require('nock'),
    client = require('../src/init').client(),
    record = require('./utils/record'),
    testConfig = require('./utils/config');

chai.should();
chai.use(require('chai-as-promised'));

client.setTenant(testConfig.tenant);
client.setMasterCatalog(testConfig.masterCatalog);

client.defaultRequestOptions = {
  proxy: "http://127.0.0.1:8888",
  strictSSL: false
};

describe('the Mozu JavaScript SDK', function() {
  
  this.timeout(20000);
  var today = new Date();
  var recorder = record('fixtures-' + today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());
  before(recorder.before);
  after(recorder.after);

  describe('Catalog section', function() {
    it('returns Products from ProductAdmin.GetProducts()', function() {
      return client.commerce().catalog().admin().products().getProducts().should.eventually.be.ok;
      // nock will implicitly throw if there are any problems with authentication
    });
  });

});