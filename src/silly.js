var client = require('./init').client();

// client.context.tenant = 2544;
// client.context['master-catalog'] = 1;

client.platform().developer().getAllApplications().then(function(res) {
  console.log(util.inspect(res));
})

// require('./appauthenticator').getAppClaims('https://home.mozu-qa.com',apid,ss).then(function(claims) { console.log(claims); })