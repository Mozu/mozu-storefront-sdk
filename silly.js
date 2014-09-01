var util = require('util'),
    client = require('./src/init').client();

client.setTenant(2628);
client.setMastercatalog(1);
// client.context['master-catalog'] = 1;

client.defaultRequestOptions = {
  proxy: "http://127.0.0.1:8888",
  strictSSL: false
};

// client.platform().developer().applications().getAllApplications(null, {
client.commerce().catalog().admin().products().getProducts().then(function(res) {
  console.log(util.inspect(res));
}, function(err) {
  console.log(util.inspect(err));
})