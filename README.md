# Mozu JavaScript SDK

The Mozu JavaScript SDK provides a JavaScript API for connecting to Mozu web services. Originally designed to manage API requests for the storefront Core theme, the JS SDK is a multipurpose tool for performing common shopper-level actions.

## Development Requirements

*   NodeJS >0.8
*   GruntJS > 0.4
*   `grunt-cli` installed globally

## Browser Requirements

*   Native JSON or json2.js. In the Core theme this library is provided by the Mozu-Require module loader.

## Build

It uses GruntJS for building and testing. 

    $ npm install -g grunt-cli
    $ npm install
    $ grunt

This should work on all platforms.

## Test Quickly

    $ grunt test

## Test And Debug With A Browser

    $ grunt testbrowser

## Planned

*   Real NodeJS support (AJAX replaced with HttpRequest, tests written with Nock)
*   Support for Admin services
*   Full method documentation
*   Updated Getting Started guide