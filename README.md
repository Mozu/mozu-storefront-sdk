# Mozu JavaScript SDK

The Mozu JavaScript SDK provides a JavaScript API for connecting to Mozu web services.

## Usage

You may pass configuration into the client factory directly:

```js
var client = require('mozu-javascript-sdk').client({
    context: {
        "appId": "00000",
        "sharedSecret": "9864c0520cc0468397faa37600f1f110",
        "baseUrl": "https://home.mozu.com/",
        "developerAccountId": "001",
        "developerAccount": {
            "emailAddress": "example@volusion.com",
            "password": "Password123!"
        }
    }
});
```

Or, if you have a JSON file in your working directory called `mozu.config.json` or `mozu.config`, the SDK will attempt to read configuration out of that instead, and you can call the client factory with no arguments.

In order to pass context from layer to layer of the API, traverse the graph by calling each layer as a function instead of a plain dot lookup. For example, accessing Platform.AdminUser.Accounts would be `client.platform().adminuser().accounts()`, rather than `client.platform.adminuser.accounts`.

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