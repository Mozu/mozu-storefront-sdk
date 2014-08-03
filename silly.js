var util = require('util'),
    client = require('./src/init').client();

// client.context.tenant = 2544;
// client.context['master-catalog'] = 1;



client.platform().developer().applications().addPackageFile({
  applicationVersionId: 8243,
  packageId: 5339,
  filepath: '/newdir/onoes.txt'
}, {
  proxy: "http://127.0.0.1:8888",
  strictSSL: false,
  body: 'Oh noes!!'
}).then(function(res) {
  console.log(util.inspect(res));
  console.log('success');
}, function(res) {
  console.log(util.inspect(res));
  console.log('failure');
});
