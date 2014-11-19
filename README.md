# Mozu Storefront SDK

The Mozu Storefront SDK provides a JavaScript API for connecting to Mozu web services. Originally designed to manage API requests for the storefront Core theme, the JS SDK is a multipurpose tool for performing common shopper-level actions.

## Development requirements

*   NodeJS >= 0.8
*   `grunt-cli` package installed globally

## Browser requirements

*   Native JSON or json2.js. In the Core theme the json2.js polyfill is provided by the Mozu-Require module loader.

## Build

Uses npm for packaging and testing.

    $ npm install -g grunt-cli
    $ npm install
    $ grunt

This should work on all platforms.

## Test

    $ grunt test

## Test and debug with a browser

    $ grunt testbrowser

## Usage

The SDK is registered with the Mozu-Require library built into the storefront and used by the Mozu Core Theme. You can access the SDK directly as the module `'sdk'`, though you usually don't want to.

```js
require(['sdk'], function(Mozu) {
    // the original blank APIContext is now the Mozu object, you'll need to hydrate it with store data
})
```

Since the initial SDK object, an APIContext, is useless without store information, the Core Theme has a simple JavaScript module that creates an API context and returns an API interface for you, available at `'modules/api'`.

```js
require(['modules/api'], function(api) {
    // the api object is already prepared with your store's information and the logged-in user's permissions

    // get the current customer!
    api.get('customer', require.mozuData('user').accountId).then(function(customer) {
        console.log(customer.prop('firstName')); // "James"
    });

    // search for products!
    api.get('search', 'gold').then(function(products) {
        console.log(products.prop('totalCount')); // 124 (products matching "gold")
        console.log(products[0].prop('content').name); // "Gold Cuff Links"
    });

})
```

Use the `'modules/api'` module everywhere. In the Mozu Core Theme, there is almost no reason to directly access the original SDK object.

## Uncommon Usages

While the Storefront SDK is designed to be used in a Mozu storefront with the Mozu Core Theme, it's possible to use the SDK separately.

In the presence of an AMD module loader like RequireJS or a CommonJS web module loader like wreq, the SDK will declare itself as a module. If neither are present, the SDK will declare a global `Mozu` variable that is an empty, configurable `ApiContext`. The first step is to configure the context and use it to generate an `ApiInterface`.

```js
define(['mozu-javascript-sdk/dist/mozu-javascript-sdk.min'], function(Mozu) {

    // assuming an AMD environment. The above is equivalent to:
    // var Mozu = require('mozu-javascript-sdk/dist/mozu-javascript-sdk');
    // in a CommonJS environment.

    var myStoreApiContext = Mozu.Store({
        "tenant": 2561,
        "master-catalog": 1,
        "site": 1234,
        "app-claims": "+RuyRpztqvRNrWTpbc...XNbC",
        "currency": "usd",
        "locale": "en-US"
    });

    // the above objects will probably come out of your store configuration on the server side and need to be serialized as JSON.


    // you need to set individual base URLs for the following services
    myStoreApiContext.setServiceUrls({
        "productService": "/api/commerce/catalog/storefront/products/",
        "categoryService": "/api/commerce/catalog/storefront/categories/",
        "cartService": "/api/commerce/carts/",
        "customerService": "https://yourstoredomain.com/api/commerce/customer/accounts/",
        "orderService": "https://yourstoredomain.com/api/commerce/orders/",
        "searchService": "/api/commerce/catalog/storefront/productsearch/",
        "referenceService": "/api/platform/reference/",
        "paymentService": "https://payments-sb.mozu.com/payments/Mozu/cards/",
        "addressValidationService": "/api/commerce/customer/addressvalidation/",
        "wishlistService": "/api/commerce/wishlists/",
        "returnService": "https://yourstoredomain.com/api/commerce/returns",
        "storefrontUserService": "https://yourstoredomain.com/user/",
        "locationService": "/api/commerce/storefront/",
        "creditService": "/api/commerce/customer/credits/"
    });

    // configuration complete, you may now retrieve an API interface
    var myStoreApi = myStoreApiContext.api();

    // and begin manipulating API objects!
    myStoreApi.get('product','MS-CYC-BIK-004').then(function(product) {
        console.log(product.prop('content').name); // -> "Diamondback Sortie 3 29er Bike - 2013"
    });
});
```

## Reference documentation

Full usage details are available in the [Getting Started guide](docs/getting_started.md) in the `/docs` folder. 

A full method reference is available at [docs/reference.md](docs/reference.md).