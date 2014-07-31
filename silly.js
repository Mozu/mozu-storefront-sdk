var util = require('util'),
    client = require('./src/init').client();

// client.context.tenant = 2544;
// client.context['master-catalog'] = 1;

client.platform().developer().applications().getAllApplications(null, {
  proxy: "http://127.0.0.1:8888",
  strictSSL: false
}).then(function(res) {
  console.log(util.inspect(res));
}, function(err) {
  console.log(util.inspect(err));
})