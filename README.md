# Mozu JavaScript SDK

The Mozu JavaScript SDK provides a JavaScript API for connecting to Mozu web services. Originally designed to manage API requests for the storefront Core theme, the JS SDK is a multipurpose tool for performing common shopper-level actions.

## Development requirements

*   NodeJS >= 0.8
*   GruntJS > 0.4
*   `grunt-cli` installed globally

## Browser requirements

*   Native JSON or json2.js. In the Core theme this library is provided by the Mozu-Require module loader.

## NodeJS requirements

*   NodeJS >= 0.10
*   [microevent](https://npmjs.org/package/microevent)
*   [uritemplate](https://npmjs.org/package/uritemplate)
*   [when](https://npmjs.org/package/when)
*   [xmlhttprequest](https://npmjs.org/package/xmlhttprequest)

## Build

Uses NPM for packaging and testing.

    $ npm install -g grunt-cli
    $ npm install
    $ grunt

This should work on all platforms.

## Test

    $ grunt test

## Test and debug with a browser

    $ grunt testbrowser

## Usage

In the presence of an AMD module loader like RequireJS or a CommonJS module loader like Node, the SDK will declare itself as a module. If neither are present, the SDK will declare a global Mozu variable that is an empty, configurable `ApiContext`. The first step is to configure the context and use it to generate an `ApiInterface`.

Full usage details are available in the Getting Started guide in the `/docs` folder. Here's how to quickly generate an interface for a given store:

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

## Planned

*   Real NodeJS testing (Nock)
*   Support for Admin services
*   Full method documentation