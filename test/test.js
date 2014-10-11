var chai = require('chai'),
    nock = require('nock'),
    client = require('../src/init').client(),

    testConfig = {
      tenant: 2628,
      masterCatalog: 1,
      tpDomain: 'https://t2628.sandbox.mozu.com',
      fixtures: {
        AdminUserAuthTicket: require('./fixtures/AdminUserAuthTicket'),
        AdminUserUserClaimsTicket: require('./fixtures/AdminUserUserClaimsTicket'),
        ProductCollection: require('./fixtures/ProductCollection')
      }
    };

chai.should();
chai.use(require('chai-as-promised'));

client.defaultRequestOptions = {
  proxy: "http://127.0.0.1:8888",
  strictSSL: false
};

describe('the Mozu JavaScript SDK', function() {
  describe('manages its own authentication', function() {
    var adminUserAppClaimsRequest,
        adminUserUserClaimsRequest,
        productCollectionRequest;
    before(function() {
      client.setTenant(testConfig.tenant);
      client.setMasterCatalog(testConfig.masterCatalog);
    });
    beforeEach(function() {
      requests = nock('http://home.mozu.com')
        .post('/api/platform/applications/authtickets/')
        .reply(200, JSON.stringify(testConfig.fixtures.AdminUserAuthTicket));
      adminUserUserClaimsRequest = nock('http://home.mozu.com')
        .post('/api/platform/adminuser/authtickets/tenants?tenantId=' + testConfig.tenant)
        .reply(200, JSON.stringify(testConfig.fixtures.AdminUserUserClaimsTicket));
      productCollectionRequest = nock(testConfig.tpDomain)
        .get('/api/commerce/catalog/admin/products/?startIndex=&pageSize=&sortBy=&filter=&q=&qLimit=&noCount=')
        .reply(200, JSON.stringify(testConfig.fixtures.ProductCollection));
    })
    it('always starts from scratch by getting valid app claims using a valid login', function(done) {
      var op = client.commerce().catalog().admin().products().getProducts();
      op.then(function() {
        requests.done().should.not.Throw;
        done();
      });
      //return op.should.become(testConfig.fixtures.ProductCollection);
    });
  })
});