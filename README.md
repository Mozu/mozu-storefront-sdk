# Mozu JavaScript SDK

The Mozu JavaScript SDK provides a JavaScript API for connecting to Mozu web services.

## Usage

In order to pass context from layer to layer of the API, traverse the graph by calling each layer as a function instead of a plain dot lookup. For example, accessing Platform.AdminUser.Accounts would be `client.platform().adminuser().accounts()`, rather than `client.platformadminuser.accounts`.

```js
var client = require('mozu-javascript-sdk').client();

client.setTenant(1234);

client.commerce().catalog().admin().products().getProducts().then(function(res) {
  console.log(util.inspect(res));
}, function(err) {
  console.log(util.inspect(err));
})
```

## Development requirements

*   NodeJS >= 0.10

## Planned

*   Real NodeJS testing (Nock)