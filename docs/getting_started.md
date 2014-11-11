
# Mozu JavaScript SDK

The Mozu JavaScript SDK is a JavaScript tool for using the Mozu APIs. It turns the simple JSON responses of the APIs into rich JavaScript objects that stay synchronized with your Mozu store, taking care of all of the AJAX, events, and callback management along the way. You can use the SDK to create innovative Mozu-powered interfaces, to integrate ecommerce features into another site, or just to make a clean Mozu theme, where all you have to worry about is the spit and polish. The SDK takes code that used to look like this:

```js
$.ajax({
    url: 'http://mozu/mozu.ProductRuntime.WebApi/products/' + productid,
    headers: {
        'x-vol-tenant': 30001,
        'x-vol-site': 2,
        'x-vol-sitegroup': 1
    },
    success: function(product) {
        $.ajax({
            url: 'http://mozu/mozu.CommerceRuntime.WebApi/carts/current',
            type: 'POST',
            data: {},
            success: function() {
                $.ajax({
                    // and so forth
                })
            }
        })
    }
})
```

And turns it into this:

```js
Mozu.Tenant(30001)
    .MasterCatalog(1)
    .Site(2)
    .api()
    .get('product',productid)
    .then(function(product){ 
        return product.action('addToCart'); 
    }).then(function(){
        // there, isn't that nice?
    })
```

It is a small (9.2Kb minified and gzipped), cross-browser, platform-independent library, that depends on no other libraries, but works well with all of the ones we know about. It supports multiple tenants and stores at once. It uses an emerging standard for asynchronous tasks called [Promises](http://wiki.commonjs.org/wiki/Promises/A), used also in jQuery's [Deferred Objects](http://api.jquery.com/category/deferred-object/). Any SDK method or function that requires an AJAX call returns a Promise object with a `.then` method for attaching callbacks to the eventual result of that AJAX call. Lastly, it looks and feels great; common ecommerce tasks can be written in an expressive, concise way, easy to follow for later maintainers of your code. **It's the bee's knees on the cat's pajamas**, is what we're trying to get across here. Don't talk to the Mozu APIs without it.

##  Getting Started

### Loading the SDK

The SDK is available at a special URL at your store's domain: `yourstoredomain.com/sdk/default.js`. Two other flavors are available: a minified version at `yourstoredomain.com/sdk/min.js`, and a debug version that exposes some inner workings at `yourstoredomain.com/sdk/debug.js`. **We recommend using the minified version.** The simplest way to include the SDK is with a good old-fashioned `script` tag:

```html
<script src="/sdk/min.js"></script>
```
You will then be able to make new API contexts using the `Mozu` global variable.

Of course, **our favorite way to load the SDK is with *require.js*.** The Core Theme uses RequireJS modules for all its JavaScript, and our template language provides convenience methods to make RequireJS modules easy and seamless to use; our SDK is compatible with RequireJS as well!

```js
require(['sdk'], function(Mozu) {
   var api = Mozu.Store('...').api();
   // In the presence of a global, AMD-compatible define() function, 
   // the SDK will define() itself instead of assigning itself to the Mozu global. 
});
```

### Obtaining an API Interface

*__Note:__ The Core Theme includes a module, `modules/api`, that completes this step for you. It initializes an API interface and returns it to you prepared to create API objects. Use this part of the guide for initializing the SDK outside your Core theme or its descendents.*

The SDK tries to be as simple as possible, but since Mozu is a multi-tenant system at its core, you have to provide your tenant, sitegroup, and site IDs before you get an API interface. The combination of variables that determine your store and authentication level is called a **context**. The first thing to do is obtain one.

You can create a context by chaining individual functions:

```js
var context = Mozu.Tenant(30001).MasterCatalog(1).Site(2);
```

Or you can call the single `Store()` method with an object literal of these IDs:

```js
var context = Mozu.Store({
    'tenant': 30001,
    'site-group': 1,
    'site': 2   
});
```

These two script blocks are equivalent. They both produce the same context object.

Contexts can be used to create new contexts:

```js
var context = Mozu.Tenant(30001).MasterCatalog(1).Site(2);
var site3Context = context.Site(3);
// the new site3Context is still in tenant 30001 and sitegroup 1
```

But the *big* deal about a context is that once it has a tenant, sitegroup, and site, it can produce an **interface object** through its `.api()` method.

```js
var myStoreApi = Mozu.Tenant(30001).MasterCatalog(1).Site(2).api();
```

This interface is what you'll use to work with API objects.

### Getting Objects With Your Interface

#### Using `.get()`, `.create()`, `.update()`, and `.del()`

You might recognize that these methods correspond to the standard set of CRUD actions available on REST API resources! Or, if you're not a REST junkie, you might see them as likely things you'd want to do with API objects. These are the basic methods you'll use to get started. API objects have similar methods on themselves, so you should view these methods on the interface itself as being *starting points* for a chain of interactions. **By far, the most common starting point is `.get()`, so that's what we'll cover here;** the other methods take the same arguments.

Let's assume we created an interface that we called `myStoreApi`, as above, and use it to get a product:

```js
var productPromise = myStoreApi.get('product',{
    ProductCode: 'OXFORDSHIRT1'
});
```

The first argument to `.get()` is the **object type** you want. This must be a string such as `"product"`, `"cart"`, or `"user"`. The complete list of supported product types is available in the full SDK documentation.

The second argument to `.get()` is the **request configuration**. This is an object literal, specifying the part of the object that you already know about. In this case, we want to get a product when we know its code.
**Note:** For many objects, you'll find yourself searching on one parameter most commonly. Products, for example, you'll usually get using their unique product code. The SDK gives you some sugar here.

```js
// the below is equivalent to the above; the SDK knows that a string for a product request config means to use that string as ProductCode.
var productPromise = myStoreApi.get('product','OXFORDSHIRT1');
```

#### Working with Promises

You might notice that we are storing the return value of `myStoreApi.get()` in a variable called `productPromise`. Why `productPromise` and not just `product`? Because when the method returns, the product isn't quite ready yet; the `.get()` method, like all asynchronous methods in the SDK, returns a **Promise**. The SDK needs to run an AJAX call to retrieve this product, so it returns an object that you can add callbacks to, via its `.then()` method.

```js
productPromise.then(function(product) {
    console.log(product.data.ProductName); // --> 'Oxford Shirt'
})
```

You can usually chain the api request and the call to `.then()` for brevity and readability, and the promise itself never gets stored in a variable:

```js
myStoreApi.get('product','OXFORDSHIRT1').then(function(product){
    console.log(product.data.ProductName); // --> 'Oxford Shirt'
});
```

The `.then()` method takes *two* arguments; the first is called if the promise *fulfilled*, and the second if the promise *rejected*. In SDK terms, this translates to whether your API call was successful or not. The second argument to `.then()` can be used for error handling:

```js
myStoreApi.get('product','OXFORDSHIRT1').then(function(product){
    return product.action('addToCart');
}, function(error) {
    console.error(error);
})
```

Remember that a Promise can take indefinite callbacks; you can call .then() on it as many times as you want and add success and/or failure handlers that receive its eventual result.

#### Chaining Promises

If you're wondering why Promises are any better than just having success and failure callbacks, then read this carefully, because this is the special sauce.

The `.then()` method of a promise **returns a new promise**. The new promise fulfills or rejects with the *return value* of the handlers you added during that invocation of `.then()`.

```js
var newPromise = myStoreApi.get('product','OXFORDSHIRT1').then(function(product) {
    return product.data.Price.Price;
});
newPromise.then(function(value) {
    console.log(value); // --> 35.00
})
```

And if you return a new promise inside your old promise's `.then()` handler, you get a promise that only fulfills when both the old and the new promise have fulfilled. This makes it easy to do sequential, asynchronous tasks without building an ugly, hard-to-trace callback pyramid!

```js
myStoreApi.get('product','OXFORDSHIRT1').then(function(product) {
    return product.action('addToCart');
}).then(function(cartItem) {
    return myStoreApi.get('cart')
}).then(function(cart) {
    return cart.action('checkout');
})
```

Isn't that nice? The interface has a few convenience methods to make multiple promises even easier to manage, available in the full SDK documentation.


#### The raw `request()` method

The API exposes a `request()` method that you can use to perform raw AJAX calls to URLs that you manually specify. Like all asynchronous methods, it returns a Promise with a `.then()` method, but the promise fulfills with a raw JSON object instead of a rich API object.

```js
api.request('GET','http://mozu/mozu.CommerceRuntime.WebApi/carts/current').then(function(cartData){
    // cartData is raw JSON here
})
```

You should never have to do this, since all the calls you'll want to make should be supported by the SDK's library of rich objects. If you find yourself doing this, either we've dropped the ball, or there might be a cleaner and more concise way to do what you're trying to do.

### Using API Objects

Now that you're using the interface's `.get()` method (or `.create()` or `.update()` methods, you hotshot) to acquire API objects, you may have noticed some stuff about them:

 *  They have a `type` property, a string representing their type (e.g. `"product"` or `"user"`)
 *  They have a `data` property, an object containing the raw JSON representation of this API resource
 *  They have an `.action()` method
 *  They have a `.getAvailableActions()` method
 *  They have `.on()`, `.off()`, and `.fire()` methods

The `.action()` method on API objects is where, not coincidentally, the action is. Every API object has a list of **actions** you can perform on it. Some actions transform the object, some use it to create a new object, some get related objects. You can see what your API object can do by running `.getAvailableActions()` on it, which will return an array of strings.

```js
api.get('product','OXFORDSHIRT1').then(function(product){
    console.log(product.getAvailableActions()); // --> ["update", "create", "del", "get", "addToCart"]
})
```

You can carry out any of these actions on your product using the `.action()` method. All API objects have the four basic actions, which are usually the equivalent of using the API interface's method instead of the API object's method. Most API objects have more specialized actions, such as `addToCart`.

Since the `.action` method always has to run an AJAX call, it returns a Promise. For many actions, the promise will fulfill with the same (updated) object; for others, the promise will fulfill with a new or different object. In the case of `addToCart`, the returned object is a CartItem.

```js
product.action('addToCart', 3).then(function(cartItem){
    return cartItem.action('updateQuantity', 2);
})
// the above adds 3 of a product to the cart, and then updates the quantity to 2, removing one. 
// Goodness knows why, but it seemed instructive
```

Using Promises and Actions, you can build a very clear chain of events with the SDK:

```js
api.get('product','OXFORDSHIRT1').then(function(product){
    return product.action('addToCart',3);
}).then(function(){
    return api.get('cart');
}).then(function(cart){
    return cart.action('checkout');
}).then(function(order) {
    window.location = "/orders/" + order.data.Id;
});
```

### Using Events

Both the API interface and the API objects fire events. They have `.on()` and `.off()` methods that each take two arguments: an event name, and a function or function reference to use as a handler. There is also a `.fire()` event on both, to manually fire these events if necessary.

#### Events on the API Interface

The API interface throws three events: `request`, `success`, and `error`. The `request` event fires before every AJAX request the interface makes, including requests made by the interface's child objects. *(Under the hood, all API objects use their parent interface to issue their requests.)* The `success` event fires after an AJAX request has successfully completed, but before any promises are fulfilled. The `error` event fires after an AJAX request has failed, either from a failed HTTP request or from the API service responding with a detailed error. You can use the interface's events for e.g. a global error handler, instead of having to argue the same error handlers into every promise:

```js
api.on('error', function(error){
    var messages = error.Items.map(function(item) { return item.Message; }).join('\n');
    alert("Sorry, errors occurred in the Mozu API: \n" + messages);
})
```

#### Events on the API Object

API objects throw four events: `action`, `sync`, `spawn`, and `error`. The `action` event fires before every action request is sent, and the `error` event fires if any of this object's requests fail, but instead of a `success` event, there are two different success cases:

 *   `sync` fires if the action caused an update in *this object's* data, like a `get` or an `update` action
 *   `spawn` fires if the action caused a new API object to be returned by the fulfilled promise, like `addToCart` returning a `"cartitem"` from a `"product"`, or `checkout` returning an `"order"` from a `"cart"`.

 Subscribe to the events in the same way as the interface. These events are useful when integrating the SDK objects into some client-side data-binding framework.

```js
product.on('action', function(){
    myProductView.addClass('loading');
})
product.on('sync', function(newData) {
    myProductView.removeClass('loading');
    myProductViewModel.update(newData);
})
```

### Get Going

This guide has outlined the most commonly used features of the SDK; it should be enough to get you started with your killer new Mozu app. If it's not, there is full SDK documentation after the beep!

## Full SDK Reference

 *   *There is no full SDK documentation yet.*