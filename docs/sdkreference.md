# Contents
- [Context](#context)
  - [.Store(contextValues)](#contextstorecontextvalues)
  - [.setServiceUrls(serviceUrls)](#contextsetserviceurlsserviceurls)
  - [.api()](#contextapi)
  - [.getServiceUrls()](#contextgetserviceurls)
  - [.asObject(prefix)](#contextasobjectprefix)
  - [.asHeaders()](#contextasheaders)
- [Interface](#interface)
  - [.request(method, requestConfig, body)](#apirequestmethod-requestconfig-data)
  - [.action(instanceOrType, actionName, body)](#apiactiontype-actionname-data)
  - [.get(type, params)](#apigettype-data)
  - [.create(type, body)](#apicreatetype-data)
  - [.update(instanceOrType, body)](#apiupdateinstanceortype-data)
  - [.del(instanceOrType, params)](#apideltype-data)
  - [.createSync(type, data)](#apicreatesynctype-data)
  - [.getAvailableActionsFor(type)](#apigetavailableactionsfortype)
  - [.on(eventName, handler)](#apioneventname-handler)
  - [.off(eventName, handler)](#apioffeventname-handler)
  - [.all(promises*)](#apiallpromise1-promise2-)
  - [.steps(promises*)](#apistepspromise1-promise2-)
  - [.defer()](#apidefer)
  - [.context](#apicontext)
  - [Interface Events](#events)
- [ApiObject](#apiobject)
  - [.getAvailableActions()](#objgetavailableactions)
  - [.prop(name, value)](#objpropname-value)
  - [.on(eventName, handler)](#objon)
  - [.off(eventName, handler)](#objoff)
  - [.data](#objdata)
  - [.api](#objapi)
  - [.type](#objtype)
  - [ApiObject Events](#events-1)
- [ApiCollection](#apicollection)
  - [.add(newItems)](#collectionaddnewitems)
  - [.remove(indexOrItem)](#collectionremoveindexoritem)
  - [.replace(newItems)](#collectionreplacenewitems)
  - [.removeAll()](#collectionremoveall)
- [ApiObject Subtypes](#apiobject-subtypes)

# Context

The Context object is the "starter" object exposed by the SDK. Configure the Context with tenant, catalog, site, and access token data. When a Context is fully configured, run its `.api()` method to return an [Interface](#Interface) to begin making API calls.

## context.Store(contextValues)

Sets context values with a configuration object.
```js
var initialContext = Mozu.Store({
  "tenant": 1234,
  "master-catalog": 1,
  "catalog": 2,
  "site": 1,
  "currency": "USD",
  "locale": "en-US",
  "app-claims": "5+boBCH23[...]",
  "user-claims": "tHG6I7/[...]"
});

// initial context is now fully prepared to return an Interface
var client = initialContext.api();

```

- **Argument** *(object)* `contextValues`
  An object of key-value pairs for context values.

- **Returns** *Context*

The minimum required values to successfully create an `Interface` are `tenant`, `master-catalog`, `catalog`, and `site`. It's also necessary to provide `app-claims` and `user-claims`, though those may change over the course of usage.


## context.setServiceUrls(serviceUrls)

Sets the base URLs the `Interface` will use to create API calls.
```js
initialContext.setServiceUrls({
  "productService": "/api/commerce/catalog/storefront/products/",
  "documentListService": "https://www.example.com/api/content/documentlists/",
  "entityListService": "https://www.example.com/api/platform/entitylists/",
  "categoryService": "/api/commerce/catalog/storefront/categories/",
  "cartService": "/api/commerce/carts/",
  "customerService": "https://www.example.com/api/commerce/customer/accounts/",
  "inStockNotificationService": "/api/commerce/instocknotifications/",
  "shippingService": "https://www.example.com/api/commerce/catalog/storefront/shipping/",
  "orderService": "https://www.example.com/api/commerce/orders/",
  "searchService": "/api/commerce/catalog/storefront/productsearch/",
  "referenceService": "/api/platform/reference/",
  "paymentService": "https://pmts.mozu.com/payments/Mozu/cards/",
  "addressValidationService": "/api/commerce/customer/addressvalidation/",
  "wishlistService": "/api/commerce/wishlists/",
  "returnService": "https://www.example.com/api/commerce/returns/",
  "storefrontUserService": "https://www.example.com/user/",
  "locationService": "/api/commerce/storefront/",
  "creditService": "/api/commerce/customer/credits/",
  "paypalExpress": "https://paypal.com/cgi-bin/webscr?cmd=_express-checkout"
});

```

- **Argument** *(object)* `serviceUrls`
  An object consisting of key-value pairs of service names and service URLs.

- **Returns** *undefined*

You must set the base URL manually for any service you want to call, and you must set them all at once: subsequent calls to `setServiceUrls` will overwrite the previously set collection.


## context.api()

Gets or creates an `Interface` which will use this `Context`.
```js
// initial context is now fully prepared to return an Interface
var client = initialContext.api();
```

- **Returns** *Interface*

The [`Interface`](#interface) is the object you will use to run API requests. Once you have returned the `Interface`, you can access the original `Context` from its `.context` property.


## context.getServiceUrls()

Gets the collection of service URLs last set with `.setServiceUrls`.

- **Returns** *object*


## context.asObject(prefix)

Gets the collection of context values as a plain JavaScript object. Optionally, prepend a string `prefix` to each object key.
```js
initialContext.asObject();
> {
  "tenant": 1234,
  "master-catalog": 1,
  "catalog": 2,
  "site": 1,
  "currency": "USD",
  "locale": "en-US",
  "app-claims": "5+boBCH23[...]",
  "user-claims": "tHG6I7/[...]"
}

initialContext.asObject('meesa-');
> {
  "meesa-tenant": 1234,
  "meesa-master-catalog": 1,
  "meesa-catalog": 2,
  "meesa-site": 1,
  "meesa-currency": "USD",
  "meesa-locale": "en-US",
  "meesa-app-claims": "5+boBCH23[...]",
  "meesa-user-claims": "tHG6I7/[...]"
}
```

- **Argument** *(string)* `prefix`
  A string to use as a prefix for the keys of the returned object..

- **Returns** *object*

## context.asHeaders()

Gets the collection of context values as a plain JavaScript object to be used to set HTTP headers. Equivalent to running `context.asObject("x-vol-")`, since "x-vol" is the current Mozu custom HTTP header prefix.

- **Returns** *object*

* * *


# Interface

The [`Interface`](#interface) is the object you will use to run API requests. It creates `ApiObjects`, runs both raw and generated requests, and has an event bus so you can subscribe to events for all API calls. Get an `Interface` by creating a complete `Context` and then calling the `Context` method `.api()`.

```js
var Mozu = require('mozu-javascript-sdk');
var initialContext = Mozu.Store(contextValues);
initialContext.setServiceUrls(serviceUrls);
var api = initialContext.api();

// now run calls!
api.get('product','EXAMPLE-001').then(function(product) {   // ...

```

## api.request(method, requestConfig, data)

Place a raw API request. This is the underlying method that all higher-level API calls use. It should be rare to call it directly.

```js
api.request('POST', 'api/service/collection/', {
  some: 'new',
  payload: 'data'
}).then(function(responseObject) {
  // the promise resolves with parsed JSON
});
```

- **Argument** *(string)* `method`
A legal HTTP verb, like `'GET'`, `'POST'`, `'PUT'`, or `'DELETE'`. There is hardly ever a need for other HTTP verbs.

  *Note: Due to several bugs and incompatibilities in popular software, the Storefront SDK tunnels the `DELETE` method through a `POST` with an `X-HTTP-Method-Override: DELETE` header.*

- **Argument** *(object)* `requestConfig`
  A [Request Config](#requestconfig) object, specifying the request URL, alternate transports, or behavior configuration for this API call. The simplest possible Request Config is a string representing the URL. The above example uses this style, which is equivalent to `api.request('POST', { url: 'api/service/collection/' } [...]`. Most Request Configs are simple object literals. The `.request()` method understands the following Request Config options:

  *  `url` *(string)* The URL for the request.

  *  `verb` *(string)* An HTTP method to use instead of the method used in the first argument to `.request()`.

  *  `overridePostData` *(object)* An object to use instead of the data in the third argument to `.request()`.

  *  `noBody` *(boolean)* Set `true` to force a PUT or POST request to have no request body. The `.request()` method normally uses the third argument to the method as post data, but it also uses this data to populate variables in the URL. There may be times when you need to use the data argument, but the actual API call must have no body.

  *  `iframeTransportUrl` *(string)* In order to use the cross-domain iframe transport system instead of a direct AJAX call, set `iframeTransportUrl` to the URL of the "receiver" file on the foreign origin. For calls that run through the local proxy on Mozu storefronts, `'https://securehost.tld/receiver'` should work. For instance, to make a secure call from an unsecure page:
    ```js
    api.request('GET', {
      url: 'https://securehost.tld',
      iframeTransportUrl: 'https://securehost.tld/receiver'
    });
    ```

- **Argument** *(object)* `data`
  An object consisting of the data to send for the actual request, either as query parameters or as POST data, depending on the HTTP method used.

- **Returns** *Promise&lt;object&gt;*
  The `.request()` method, like all AJAX-invoking methods of the SDK, returns a Promise. The Promises in the Storefront SDK are [when.js](https://github.com/cujojs/when/) promises. They satisfy the Promises/A+ specification and also include [extra convenience methods](https://github.com/cujojs/when/blob/master/docs/api.md#promise). Promises returned by `.request()` resolve with a raw parsed JSON object.

## api.action(type, actionName, data)
Perform an action on a known type of API object. This method is the starting point to a lot of API actions. It returns a Promise for an API object, and at the same time, runs an "action" on that object. It can run the common CRUD actions `get`, `create`, `update`, and `del` on most objects, but known objects often also have special actions available, such as `addToCart` for `cart` or `resetPassword` for `password`. These actions correspond to method names on API objects. There are also convenience methods on the `Interface` itself for the common CRUD actions. Therefore:
```js
api.action('cart','get');

api.get('cart');

var cart = api.createSync('cart');
cart.get();
```
are all equivalent. The first runs the 'get' action on the 'cart' type by name, the second runs the `.get()` convenience method, and the third creates a blank `ApiObject` and then runs the corresponding instance method.

- **Argument** *(string)* `type`
  A string corresponding to a known `ApiObject` [type](#apiobject-types).

- **Argument** *(string)* `actionName`
  A string corresponding to a valid action name for the given type. For most types, the standard CRUD actions are available. To find a list of available actions for a type, use the [`.getAvailableActionsFor(type)`](#interfacegetavailableactionsfortype) method.

- **Argument** *(object)* `data`
  An object consisting of the data to send for the actual request, either as query parameters or as POST data, depending on the HTTP method used.

- **Returns** *Promise&lt;ApiObject&gt;*


### ApiObject Types
Valid ApiObject type strings are as follows:


* `document`
* `documentList`
* `documentView`
* `entityList`
* `entityView`
* `entity`
* `entityContainer`
* `entityContainerList`
* `entityContainerView`
* `products`
* `categories`
* `category`
* `categorytree`
* `search`
* `suggest`
* `customers`
* `orders`
* `product`
* `location`
* `locations`
* `cartsummary`
* `cart`
* `cartitem`
* `customer`
* `storecredit`
* `storecredits`
* `contact`
* `contacts`
* `login`
* `address`
* `order`
* `rma`
* `rmas`
* `shipment`
* `payment`
* `accountcard`
* `accountcards`
* `creditcard`
* `creditcards`
* `ordernote`
* `addressschemas`
* `wishlist`
* `wishlists`
* `instockrequest`

## api.get(type, [data])
Convenience method for `api.action(type, 'get', data)`.

## api.create(type, data)
Convenience method for `api.action(type, 'create', data)`.

## api.update(instanceOrType, data)
Convenience method for `api.action(instanceOrType, 'update', data)`. You can provide an `ApiObject` as the first argument to `api.action`, but if your updated data has enough information (usually just an ID) for the SDK to construct a URL to the original resource, then you can avoid using the existing object and just run `.update()` the same way you run `create()`.

## api.del(type, [data])
Convenience method for `api.action(type, 'del', data)`;

## api.createSync(type, [data])
Synchronously creates a "dummy" `ApiObject` that has never been synchronized with the server. 
```js
var customer = api.createSync('customer', { id: require.mozuData('user').accountId });
// customer exists, but has no data
customer.get(); // will populate itself
```

- **Argument** *(string)* `type`
  A valid [type](#apiobject-types) for an `ApiObject`.

- **Argument** *(object)* `data`
  Optionally, supply some data to preload into the object.

- **Returns** *ApiObject*

If you already have preloaded in your environment some data corresponding to an existing API object, then this method will create a local copy of that object. If you don't, then this creates a "blank" API object, and you'll need to run `.create()` or another equivalent method on it in order to make it persist.

## api.getAvailableActionsFor(type)
Returns an array of strings representing the names of the available actions for the given type.
```js
api.getAvailableActionsFor('product');
> ["update", "create", "del", "get", "configure", "addToCart", "getInventory", "addToWishlist", "addToCartForPickup"]
```

- **Argument** *(string)* `type`
  A valid [type](#apiobject-types) for an `ApiObject`.

- **Returns** *string[]*


## api.on(eventName, handler)
Subscribe to an [event](#interfaceevents) on this interface.
```js
api.on('error', function(err, xhr) {
  console.error(err);
});
// the above code will run every time any request results in an error
```

- **Argument** *(string)* `eventName`
  A valid name for an interface [event](#interfaceevents).

- **Argument** *(function)* `handler`
  A function to be run when the event fires, that receives the following arguments:
  - *(object)* `error` An error object from the service.
  - *(XmlHttpRequest)* `xhr` The HTTP request that failed, if one exists.

- **Returns** *undefined*

Unlike jQuery events, the return value of these handlers doesn't affect further processing.

## api.off(eventName, handler)
Unsubscribe a particular handler from a particular event.
```js
function logError(err, xhr) {
  console.error(err);
}

api.on('error', logError);
// the above code will run every time any request results in an error

api.off('error', logError);
// not anymore
```

- **Argument** *(string)* `eventName`
  A valid name for an interface [event](#interfaceevents).

- **Argument** *(function)* `handler`
  A handler to remove. This must be a direct reference to the same function that was originally passed.

- **Returns** *undefined*


## api.all(promise1, promise2, ...)
Return a promise that will fulfill only when all the input promises or values have fulfilled. This is an alias to [when.join](https://github.com/cujojs/when/blob/master/docs/api.md#whenjoin) provided for convenience.

## api.steps(promise1, promise2, ...)
Run an array of tasks in sequence, passing the return value of each task's promise to the subsequent task. This is an alias to [when.pipeline](https://github.com/cujojs/when/blob/master/docs/api.md#whenpipeline) provided for convenience.

## api.defer()
Create an object with a promise and a resolver. Used to make functions that may need not to do asynchronous work always return promises. This is an alias to [when.defer](https://github.com/cujojs/when/blob/master/docs/api.md#whendefer) provided for convenience.

## api.context
A reference to the `Context` object that created this interface. Useful if you need to check aspects of your current context.
```js
// what's my site?
api.context.Site(); // -> 1
```

## Events

### `request`
Fires immediately after the `Interface` or any of its child `ApiObjects` make a remote request.

- **Parameter** *(XmlHttpRequest)* `xhr`
  The XmlHttpRequest, now in flight.

- **Parameter** *(function)* `canceller`
  A function that, when called with no arguments, will abort the XmlHttpRequest and reject any returned Promises.

- **Parameter** *(Promise&lt;object&gt;)* `promise`
  A raw promise that will fulfill with a plain object, or reject with an error.

- **Parameter** *(object)* `requestConfig`
  The original request config used to create this request.

- **Parameter** *(object)* `data`
  The original data sent for the request.

### `success`
Fires immediately after a remote request made by the `Interface` or any of its child `ApiObjects` returns successfully.

- **Parameter** *(object)* `response`
  The plain JavaScript object that results from parsing the JSON response.

- **Parameter** *(XmlHttpRequest)* `xhr`
  The XmlHttpRequest, now returned and idle.

- **Parameter** *(object)* `requestConfig`
  The original request config used to create this request.

### `error`
Fires immediately after a remote request made by the `Interface` or any of its child `ApiObjects`fails, either locally or due to a remote return code.

- **Parameter** *(object)* `error`
  The plain JavaScript object that results from parsing the JSON error response.

- **Parameter** *(ApiObject)* `obj`
  The original `ApiObject` that made this request.

- **Parameter** *(object)* `requestConfig`
  The original request config used to create this request.

### `action`
Fires immediately after an action method was run on this Interface, either by itself or by a child ApiObject, but before running a remote request.

- **Parameter** *(ApiObject)* `obj`
  The original `ApiObject` that made this request.

- **Parameter** *(string)* `actionName`
  The name of the action.

- **Parameter** *(object)* `data`
  The original data sent for the request.

### `spawn`
Fires immediately after creating a new ApiObject, either manually with `api.createSync` or implicitly when an object-creating request returns.

- **Parameter** *(ApiObject)* `obj`
  The new `ApiObject` generated.

- **Parameter** *(ApiObject)* `parentObj`
  If this `ApiObject` was created by a request run by another `ApiObject`, this is the original `ApiObject`.

### `sync`
Fires immediately after a request by an existing child ApiObject returns and updates the requesting ApiObject's `data` collection. In effect, this event says the object is in sync with the server.

- **Parameter** *(ApiObject)* `obj`
  The `ApiObject` that has made this request and become synced.

- **Parameter** *(object)* `response`
  The plain JavaScript object that results from parsing the JSON response, that will be used to update the `ApiObject`.

* * *

# ApiObject

The ApiObject is the object fulfilled by the `Promise` returned by the `Interface`. It's a rich object with instance methods and internal state. It stores its server-side representation as a raw object in its `.data` property. An ApiObject has instance methods corresponding to the available actions for it returned by `api.getAvailableActionsFor(type)`.

## obj.getAvailableActions()
Return a list of available actions for this type. Equivalent to calling `api.getAvailableActionsFor(obj.type)`.

- **Returns** *string[]*

## obj.prop(name, [value])
Get or set properties from the `.data` of this object. This is an alternative way to access object data if directly manipulating the `.data` collection is ever discouraged or deprecated.
```js
// get the product code
api.get('product', { productCode: 'EXAMPLE123' }).then(function(product) {
  console.log(product.prop('productCode')); // -> 'EXAMPLE123'
  console.log(product.data.productCode); // -> 'EXAMPLE123'
});

// add a value argument to set instead of get
api.get('customer', { id: require.mozuData('user').accountId }).then(function(customer) {
  customer.prop('firstName','Benedict');
  // .data style:
  customer.data.lastName = 'Espinoza';
});
```

- **Argument** *(string)* `name`
  Property name to get or set.

- **Argument** *(string|object|boolean|number|null|array)* `value`
  Value to set. If this is not present, `.prop()` returns the current value.

## obj.on
Subscribe to events on this object. Just like [api.on](#apioneventname-handler), but for this object alone.

## obj.off
Unsubscribe to events on this object. Just like [api.off](#apioffeventname-handler), but for this object alone.

## obj.data
Reference to the plain JSON object representing this ApiObject's data. This object is the server representation of the ApiObject and is sent and updated with server requests.

## obj.api
Reference to the `Interface` instance that created this ApiObject.

## obj.type
The [type](#apiobject-types) of the ApiObject.

Subclasses of APIObject have more instance methods, as described below. Most of them have at least the methods `.get`, `.create`, `.update`, and `.del`, just like the `Interface`.

## Events

### `action`
Fires immediately after this ApiObject runs any action method, but before running the remote request.

- **Parameter** *(string)* `actionName`
  The name of the action.

- **Parameter** *(object)* `data`
  The original data sent for the request.

### `sync`
Fires immediately when this object has completed a request and updated its own `data` collection with the response. In effect, this event says the object is in sync with the server.

- **Parameter** *(object)* `response`
  The plain JavaScript object that results from parsing the JSON response, that will be used to update the `ApiObject`.

### `spawn`
Fires immediately after this object successfully completes an action method that must return a new `ApiObject`. An example is `product.addToCart()`, which does not update the product but instead returns a new `CartItem`.

- **Parameter** *(ApiObject)* `obj`
  The new `ApiObject` generated.

### `error`
Fires when a request this ApiObject ran failed.

- **Parameter** *(object) `error`
  A plain JavaScript object that results from parsing the error JSON received from the server.

* * *

# ApiCollection

An ApiCollection represents a paged list of ApiObjects. This is a common patterns throughout Mozu REST web services. An ApiCollection is an array-like object, similar to the objects that jQuery produces. You can use `for` loops on an ApiCollection, but not native array methods. An ApiCollection is also a subtype of an ApiObject, so it has all the method that `ApiObject` has. It also has a `.data` property, which has an `.items` property that you can access directly to work with a raw array of server objects instead of the ApiCollection's list of ApiObjects.

## collection.add(newItems)
Add one or more new items to the collection. Either pass a single item or an array of items.

- **Argument** *(object|object[])* `newItems`
  The new item or items to add. Can either be a full ApiObject of the appropriate type, or raw objects which will be converted.

- **Returns** *undefined*

## collection.remove(indexOrItem)
Remove an item by reference or by index.

- **Argument** *(object|number)* `itemOrIndex`
  The item to remove, or the index at which to remove an item.

- **Returns** *undefined*

## collection.replace(newItems)
Completely replace the items in the collection.

- **Argument** *(object[])* `newItems`
  The new item or items to represent the whole collection. Can either be a full ApiObject of the appropriate type, or raw objects which will be converted.

- **Returns** *undefined*

## collection.removeAll()
Remove all items from the collection.

- **Returns** *undefined*

* * *

# ApiObject Subtypes

The `ApiObject` described above is an abstract class. `ApiObjects` have types and instance methods. Some objects have complex methods, implemented as overrides inside the SDK, that do complex logic or run multiple outbound calls. Those methods are documented with extra explanatory text below. 


## document
     
#### document.get

##### `{+documentListService}{listName}/documents/{id}{?_*}` 

- **Returns** *document*




This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## documentList
`documentList` is an ApiCollection of `document` ApiObjects.            
#### documentList.get

##### `{+documentListService}{listName}/documents{?_*}` 

- **Returns** *documentList*
- **Shortcut Parameter** *listName*
  You can use the shortcut `documentList.get(foo)` instead of `documentList.get({ listName: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **pageSize**: 15
   

This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## documentView
`documentView` is an ApiCollection of `document` ApiObjects.            
#### documentView.get

##### `{+documentListService}{listName}/views/{viewName}/documents{?_*}` 

- **Returns** *documentView*
- **Shortcut Parameter** *listName*
  You can use the shortcut `documentView.get(foo)` instead of `documentView.get({ listName: foo })`. 

- **Default Parameters**
  - **viewName**: default
  - **startIndex**: 0
  - **pageSize**: 15
   

This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## entityList
`entityList` is an ApiCollection of `entity` ApiObjects.            
#### entityList.get

##### `{+entityListService}{listName}/entities{?_*}` 

- **Returns** *entityList*
- **Shortcut Parameter** *listName*
  You can use the shortcut `entityList.get(foo)` instead of `entityList.get({ listName: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **pageSize**: 15
   

This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## entityView
`entityView` is an ApiCollection of `entity` ApiObjects.            
#### entityView.get

##### `{+entityListService}{listName}/views/{viewName}/entities{?_*}` 

- **Returns** *entityView*
- **Shortcut Parameter** *listName*
  You can use the shortcut `entityView.get(foo)` instead of `entityView.get({ listName: foo })`. 

- **Default Parameters**
  - **viewName**: default
  - **startIndex**: 0
  - **pageSize**: 15
   

This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## entity
     
#### entity.get

##### `{+entityListService}{listName}/entities/{id}{?_*}` 

- **Returns** *entity*




This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## entityContainer
       
#### entityContainer.get

##### `{+entityListService}{listName}/entityContainers/{id}{?_*}` 

- **Returns** *entityContainer*
- **Shortcut Parameter** *listName*
  You can use the shortcut `entityContainer.get(foo)` instead of `entityContainer.get({ listName: foo })`. 



This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## entityContainerList
`entityContainerList` is an ApiCollection of `entityContainer` ApiObjects.            
#### entityContainerList.get

##### `{+entityListService}{listName}/entityContainers{?_*}` 

- **Returns** *entityContainerList*
- **Shortcut Parameter** *listName*
  You can use the shortcut `entityContainerList.get(foo)` instead of `entityContainerList.get({ listName: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **pageSize**: 15
   

This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## entityContainerView
`entityContainerView` is an ApiCollection of `entityContainer` ApiObjects.            
#### entityContainerView.get

##### `{+entityListService}{listName}/views/{viewName}/entityContainers{?_*}` 

- **Returns** *entityContainerView*
- **Shortcut Parameter** *listName*
  You can use the shortcut `entityContainerView.get(foo)` instead of `entityContainerView.get({ listName: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **viewName**: default
  - **pageSize**: 15
   

This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
## products
`products` is an ApiCollection of `product` ApiObjects.          
#### products.get

##### `{+productService}{?_*}` 

- **Returns** *products*
- **Shortcut Parameter** *filter*
  You can use the shortcut `products.get(foo)` instead of `products.get({ filter: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **pageSize**: 15
   


  
## categories
`categories` is an ApiCollection of `category` ApiObjects.          
#### categories.get

##### `{+categoryService}{?_*}` 

- **Returns** *categories*
- **Shortcut Parameter** *filter*
  You can use the shortcut `categories.get(foo)` instead of `categories.get({ filter: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **pageSize**: 15
   


  
## category
       
#### category.get

##### `{+categoryService}{id}{?allowInactive}` 

- **Returns** *category*
- **Shortcut Parameter** *id*
  You can use the shortcut `category.get(foo)` instead of `category.get({ id: foo })`. 

- **Default Parameters**
  - **allowInactive**: false
   


  
## categorytree
     
#### categorytree.get

##### `{+categoryService}tree` 

- **Returns** *json*





  
## search
`search` is an ApiCollection of `product` ApiObjects.          
#### search.get

##### `{+searchService}search{?query,filter,facetTemplate,facetTemplateSubset,facet,facetFieldRangeQuery,facetHierPrefix,facetHierValue,facetHierDepth,facetStartIndex,facetPageSize,facetSettings,facetValueFilter,sortBy,pageSize,PageSize,startIndex,StartIndex}` 

- **Returns** *search*
- **Shortcut Parameter** *query*
  You can use the shortcut `search.get(foo)` instead of `search.get({ query: foo })`. 

- **Default Parameters**
  - **startIndex**: 0
  - **query**: *:*
  - **pageSize**: 15
   


  
## suggest
     
#### suggest.get

##### `{+searchService}suggest{?_*}` 

- **Returns** *suggest*
- **Shortcut Parameter** *query*
  You can use the shortcut `suggest.get(foo)` instead of `suggest.get({ query: foo })`. 




  
## customers
`customers` is an ApiCollection of `customer` ApiObjects.    
#### customers.get



- **Returns** *customers*





  
## orders
`orders` is an ApiCollection of `order` ApiObjects.        
#### orders.get

##### `{+orderService}{?_*}` 

- **Returns** *orders*


- **Default Parameters**
  - **filter**: Status ne Created and Status ne Validated and Status ne Pending
  - **startIndex**: 0
  - **pageSize**: 5
   


  
## product
 
#### product.get

##### `{+productService}{productCode}?{&amp;allowInactive*}` 

- **Returns** *product*
- **Shortcut Parameter** *productCode*
  You can use the shortcut `product.get(foo)` instead of `product.get({ productCode: foo })`. 

- **Default Parameters**
  - **allowInactive**: false
   


  
#### product.configure

##### `{+productService}{productCode}/configure{?includeOptionDetails}` 

- **Returns** *product*


- **Default Parameters**
  - **includeOptionDetails**: true
   


  
#### product.addToCart


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/product.js). 
- **Returns** *product*





  
#### product.getInventory

##### `{+productService}{productCode}/locationinventory{?locationCodes}` 

- **Returns** *string*
- **Shortcut Parameter** *locationcodes*
  You can use the shortcut `product.getInventory(foo)` instead of `product.getInventory({ locationcodes: foo })`. 




  
#### product.addToWishlist


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/product.js). 
- **Returns** *product*





  
#### product.addToCartForPickup


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/product.js). 
- **Returns** *product*





  
## location
 
#### location.get

##### `{+locationService}locationUsageTypes/SP/locations/{code}` 

- **Returns** *location*
- **Shortcut Parameter** *code*
  You can use the shortcut `location.get(foo)` instead of `location.get({ code: foo })`. 




  
## locations
`locations` is an ApiCollection of `location` ApiObjects.      
#### locations.get

##### `{+locationService}locationUsageTypes/SP/locations/{?startIndex,sortBy,pageSize,filter}` 

- **Returns** *locations*


- **Default Parameters**
  - **pageSize**: 15
   


  
#### locations.getByLatLong


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/locations.js). 
- **Returns** *locations*


- **Default Parameters**
  - **pageSize**: 15
   


  
#### locations.getForProduct


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/locations.js). 
- **Returns** *locations*


- **Default Parameters**
  - **pageSize**: 15
   


  
## cartsummary
   
#### cartsummary.count

##### `{+cartService}summary` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/cartsummary.js). 
- **Returns** *cartsummary*





  
#### cartsummary.get

##### `{+cartService}summary` 

- **Returns** *cartsummary*





  
## cart
   
#### cart.addProduct

##### `{+cartService}current/items/` 

- **Returns** *cartitem*





  
#### cart.empty

##### `{+cartService}current/items/` 

- **Returns** *cart*





  
#### cart.checkout

##### `{+orderService}?cartId={id}` 

- **Returns** *order*





  
#### cart.count


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/cart.js). 
- **Returns** *cart*





  
#### cart.get



- **Returns** *cart*





  
## cartitem
   
#### cartitem.updateQuantity

##### `{+cartService}current/items{/id,quantity}` 

- **Returns** *cartitem*
- **Shortcut Parameter** *quantity*
  You can use the shortcut `cartitem.updateQuantity(foo)` instead of `cartitem.updateQuantity({ quantity: foo })`. 




  
#### cartitem.get



- **Returns** *cartitem*





  
## customer
         
#### customer.create

##### `{+customerService}add-account-and-login` 

- **Returns** *login*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.create(foo)` instead of `customer.create({ id: foo })`. 




  
#### customer.createStorefront

##### `{+storefrontUserService}create` 

- **Returns** *login*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.createStorefront(foo)` instead of `customer.createStorefront({ id: foo })`. 




  
#### customer.login

##### `{+customerService}../authtickets` 

- **Returns** *login*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.login(foo)` instead of `customer.login({ id: foo })`. 




  
#### customer.loginStorefront

##### `{+storefrontUserService}login` 

- **Returns** *login*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.loginStorefront(foo)` instead of `customer.loginStorefront({ id: foo })`. 




  
#### customer.update

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.update(foo)` instead of `customer.update({ id: foo })`. 




  
#### customer.resetPassword

##### `{+customerService}reset-password` 

- **Returns** *string*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.resetPassword(foo)` instead of `customer.resetPassword({ id: foo })`. 




  
#### customer.resetPasswordStorefront

##### `{+storefrontUserService}resetpassword` 

- **Returns** *string*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.resetPasswordStorefront(foo)` instead of `customer.resetPasswordStorefront({ id: foo })`. 




  
#### customer.changePassword

##### `{+customerService}{id}/change-password` 

- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.changePassword(foo)` instead of `customer.changePassword({ id: foo })`. 




  
#### customer.getOrders

##### `{+orderService}?filter=OrderNumber ne null` 

- **Returns** *orders*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getOrders(foo)` instead of `customer.getOrders({ id: foo })`. 




  
#### customer.getCards

##### `{+customerService}{id}/cards` 

- **Returns** *accountcards*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getCards(foo)` instead of `customer.getCards({ id: foo })`. 




  
#### customer.addCard

##### `{+customerService}{customer.id}/cards` 

- **Returns** *accountcard*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.addCard(foo)` instead of `customer.addCard({ id: foo })`. 




  
#### customer.updateCard

##### `{+customerService}{customer.id}/cards/{id}` 

- **Returns** *accountcard*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.updateCard(foo)` instead of `customer.updateCard({ id: foo })`. 




  
#### customer.deleteCard

##### `{+customerService}{customer.id}/cards/{id}` 

- **Returns** *accountcard*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.deleteCard(foo)` instead of `customer.deleteCard({ id: foo })`. 




  
#### customer.addContact

##### `{+customerService}{id}/contacts` 

- **Returns** *contact*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.addContact(foo)` instead of `customer.addContact({ id: foo })`. 




  
#### customer.getContacts

##### `{+customerService}{id}/contacts` 

- **Returns** *contacts*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getContacts(foo)` instead of `customer.getContacts({ id: foo })`. 




  
#### customer.deleteContact

##### `{+customerService}{customer.id}/contacts/{id}` 

- **Returns** *contact*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.deleteContact(foo)` instead of `customer.deleteContact({ id: foo })`. 




  
#### customer.getCredits

##### `{+creditService}` 

- **Returns** *storecredits*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getCredits(foo)` instead of `customer.getCredits({ id: foo })`. 




  
#### customer.getCredit

##### `{+creditService}/{id}` 

- **Returns** *storecredit*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getCredit(foo)` instead of `customer.getCredit({ id: foo })`. 




  
#### customer.savePaymentCard

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.savePaymentCard(foo)` instead of `customer.savePaymentCard({ id: foo })`. 




  
#### customer.deletePaymentCard

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.deletePaymentCard(foo)` instead of `customer.deletePaymentCard({ id: foo })`. 




  
#### customer.getStoreCredits

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getStoreCredits(foo)` instead of `customer.getStoreCredits({ id: foo })`. 




  
#### customer.getDigitalCredit

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getDigitalCredit(foo)` instead of `customer.getDigitalCredit({ id: foo })`. 




  
#### customer.addStoreCredit

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.addStoreCredit(foo)` instead of `customer.addStoreCredit({ id: foo })`. 




  
#### customer.getMinimumPartial

##### `{+customerService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/customer.js). 
- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.getMinimumPartial(foo)` instead of `customer.getMinimumPartial({ id: foo })`. 




  
#### customer.get

##### `{+customerService}{id}` 

- **Returns** *customer*
- **Shortcut Parameter** *id*
  You can use the shortcut `customer.get(foo)` instead of `customer.get({ id: foo })`. 




  
## storecredit
 
#### storecredit.associateToShopper

##### `{+creditService}{code}/associate-to-shopper` 

- **Returns** *storecredit*





  
#### storecredit.getCredit

##### `{+creditService}{code}` 

- **Returns** *storecredit*





  
#### storecredit.get



- **Returns** *storecredit*





  
## storecredits
`storecredits` is an ApiCollection of `storecredit` ApiObjects.      
#### storecredits.get

##### `{+creditService}` 

- **Returns** *storecredits*





  
## contact
     
#### contact.get

##### `{+customerService}{accountId}/contacts/{id}` 

- **Returns** *contact*





  
## contacts
`contacts` is an ApiCollection of `contact` ApiObjects.    
#### contacts.get



- **Returns** *contacts*





  
## login
   
#### login.get

##### `{+userService}login` 

- **Returns** *login*





  
## address
 
#### address.validateAddress

##### `{+addressValidationService}` 

- **Returns** *address*





  
#### address.validateAddressLenient

##### `{+addressValidationService}` 

- **Returns** *address*





  
#### address.get



- **Returns** *address*





  
## order
     
#### order.create

##### `{+orderService}{?cartId*}` 

- **Returns** *order*
- **Shortcut Parameter** *cartId*
  You can use the shortcut `order.create(foo)` instead of `order.create({ cartId: foo })`. 




  
#### order.updateShippingInfo

##### `{+orderService}{id}/fulfillmentinfo` 

- **Returns** *shipment*





  
#### order.getShippingMethods

##### `{+orderService}{id}/shipments/methods` 

- **Returns** *shippingmethods*





  
#### order.setUserId

##### `{+orderService}{id}/users` 

- **Returns** *user*





  
#### order.createPayment

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.performPaymentAction

##### `{+orderService}{id}/payments/{paymentId}/actions` 

- **Returns** *string*
- **Shortcut Parameter** *paymentId*
  You can use the shortcut `order.performPaymentAction(foo)` instead of `order.performPaymentAction({ paymentId: foo })`. 




  
#### order.applyCoupon

##### `{+orderService}{id}/coupons/{couponCode}` 

- **Returns** *coupon*
- **Shortcut Parameter** *couponCode*
  You can use the shortcut `order.applyCoupon(foo)` instead of `order.applyCoupon({ couponCode: foo })`. 




  
#### order.removeCoupon

##### `{+orderService}{id}/coupons/{couponCode}` 

- **Returns** *order*
- **Shortcut Parameter** *couponCode*
  You can use the shortcut `order.removeCoupon(foo)` instead of `order.removeCoupon({ couponCode: foo })`. 




  
#### order.removeAllCoupons

##### `{+orderService}{id}/coupons` 

- **Returns** *order*





  
#### order.getAvailableActions

##### `{+orderService}{id}/actions` 

- **Returns** *orderactions*





  
#### order.performOrderAction

##### `{+orderService}{id}/actions` 

- **Returns** *order*
- **Shortcut Parameter** *actionName*
  You can use the shortcut `order.performOrderAction(foo)` instead of `order.performOrderAction({ actionName: foo })`. 




  
#### order.addOrderNote

##### `{+orderService}{id}/notes` 

- **Returns** *ordernote*





  
#### order.getShippingMethodsFromContact

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.addCoupon

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.addNewCustomer

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.addStoreCredit

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.addPayment

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.getActivePayments

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.getCurrentPayment

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.getActiveStoreCredits

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.voidPayment

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.checkout

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.isComplete

##### `{+orderService}{id}` 
 This is a **method override** with special logic assigned to it, implemented [here](../src/types/order.js). 
- **Returns** *order*





  
#### order.get

##### `{+orderService}{id}` 

- **Returns** *order*





  
## rma
 
#### rma.create

##### `{+returnService}` 

- **Returns** *rma*





  
#### rma.get



- **Returns** *rma*





  
## rmas
`rmas` is an ApiCollection of `rma` ApiObjects.        
#### rmas.get

##### `{+returnService}{?_*}` 

- **Returns** *rmas*


- **Default Parameters**
  - **startIndex**: 0
  - **pageSize**: 5
   


  
## shipment
   
#### shipment.getShippingMethods

##### `{+orderService}{orderId}/shipments/methods` 

- **Returns** *shippingmethods*





  
#### shipment.getShippingMethodsFromContact


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/shipment.js). 
- **Returns** *shipment*





  
#### shipment.get



- **Returns** *shipment*





  
## payment
 
#### payment.create

##### `{+orderService}{orderId}/payments/actions` 

- **Returns** *payment*





  
#### payment.get



- **Returns** *payment*





  
## accountcard
   
#### accountcard.get

##### `{+customerService}{id}/cards` 

- **Returns** *accountcard*





  
## accountcards
`accountcards` is an ApiCollection of `accountcard` ApiObjects.    
#### accountcards.get



- **Returns** *accountcards*





  
## creditcard
   
#### creditcard.save


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/creditcard.js). 
- **Returns** *creditcard*





  
#### creditcard.update

##### `{+paymentService}{cardId}` 

- **Returns** *string*





  
#### creditcard.del

##### `{+paymentService}{cardId}` 

- **Returns** *creditcard*
- **Shortcut Parameter** *cardId*
  You can use the shortcut `creditcard.del(foo)` instead of `creditcard.del({ cardId: foo })`. 




  
#### creditcard.maskCharacter



- **Returns** *creditcard*





  
#### creditcard.maskPattern



- **Returns** *creditcard*





  
#### creditcard.saveToCustomer


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/creditcard.js). 
- **Returns** *creditcard*





  
#### creditcard.getOrderData


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/creditcard.js). 
- **Returns** *creditcard*





  
#### creditcard.get



- **Returns** *creditcard*





  
## creditcards
`creditcards` is an ApiCollection of `creditcard` ApiObjects.    
#### creditcards.get



- **Returns** *creditcards*





  
## ordernote
   
#### ordernote.get

##### `{+orderService}{orderId}/notes/{id}` 

- **Returns** *ordernote*





  
## addressschemas
   
#### addressschemas.get

##### `{+referenceService}addressschemas` 

- **Returns** *addressschemas*





  
## wishlist
 
#### wishlist.get


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/wishlist.js). 
- **Returns** *wishlist*





  
#### wishlist.getByName

##### `{+wishlistService}customers/{customerAccountId}/{name}` 

- **Returns** *wishlist*





  
#### wishlist.getDefault

##### `{+wishlistService}customers/{customerAccountId}/my_wishlist` 

- **Returns** *wishlist*





  
#### wishlist.createDefault

##### `{+wishlistService}` 

- **Returns** *wishlist*


- **Default Parameters**
  - **name**: my_wishlist
  - **typeTag**: default
   


  
#### wishlist.addItem

##### `{+wishlistService}{id}/items/` 

- **Returns** *wishlist*





  
#### wishlist.deleteAllItems

##### `{+wishlistService}{id}/items/` 

- **Returns** *wishlist*





  
#### wishlist.deleteItem

##### `{+wishlistService}{id}/items/{itemId}` 

- **Returns** *wishlist*
- **Shortcut Parameter** *itemId*
  You can use the shortcut `wishlist.deleteItem(foo)` instead of `wishlist.deleteItem({ itemId: foo })`. 




  
#### wishlist.editItem

##### `{+wishlistService}{id}/items/{itemId}` 

- **Returns** *wishlist*





  
#### wishlist.addItemToCart

##### `{+cartService}current/items/` 

- **Returns** *cartitem*





  
#### wishlist.getItemsByName

##### `{+wishlistService}customers/{customerAccountId}/{name}/items{?startIndex,pageSize,sortBy,filter}` 

- **Returns** *wishlistitems*


- **Default Parameters**
  - **sortBy**: UpdateDate asc
   


  
#### wishlist.getOrCreate


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/wishlist.js). 
- **Returns** *wishlist*





  
#### wishlist.addItemToCartById


 This is a **method override** with special logic assigned to it, implemented [here](../src/types/wishlist.js). 
- **Returns** *wishlist*





  
## wishlists
`wishlists` is an ApiCollection of `wishlist` ApiObjects.    
#### wishlists.get



- **Returns** *wishlists*





  
## instockrequest
 
#### instockrequest.create

##### `{+inStockNotificationService}` 

- **Returns** *instockrequest*




This method uses the iframe transport by default in order to be used across origins (such as secure and unsecure pages). 
  
#### instockrequest.get



- **Returns** *instockrequest*





  