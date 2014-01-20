describe('Mozu SDK', function () {

    var Mozu = MozuSDK;

    // current service URLs
    var ServiceUrls = {
        BadUrl: 'A_BAD_URL',
        "productService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/",
        "cartService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/carts/",
        "userService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/platform/user/accounts/",
        "orderService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/orders/",
        "searchService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch/",
        "cmsService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/content/documents/",
        "referenceService": "http://aus01pdweb001.ads.volusion.com:9090/Mozu.reference.WebApi/platform/reference",
    };

    Mozu.setServiceUrls(ServiceUrls);

    var Fixtures = {
        SampleProductCollection: {
            items: [
                {
                    productCode: 'hi!'
                }
            ]
        },
        SampleProductCode: "Sample",
        SampleProductUrl: ServiceUrls.productService + 'Sample',
        SampleProduct: {
            productCode: "Sample",
            productName: "Sample Name"
        },
        SampleCart: {
            items: [
                {
                    id: 'kashgdakjshdgakjdhgaksjdgh',
                    product: {
                        productCode: 'hai'
                    }
                }
            ],
            total: 200
        },
        EmptyCart: {
            items: [],
            total: 0
        },
        SampleCartItem: {
            id: 'kjagsdkjhagsdkjahg',
            product: {
                productCode: 'hai'
            }
        },
        SampleUnknownType: {
            someProp: "someValue"
        }
    };

    var server;
    
    before(function () {
        server = sinon.fakeServer.create();

        server.respondWith('GET', ServiceUrls.productService, JSON.stringify(Fixtures.SampleProductCollection));
        server.respondWith('GET', new RegExp(ServiceUrls.productService + "\\?.*"), JSON.stringify(Fixtures.SampleProductCollection));
        server.respondWith('GET', new RegExp(Fixtures.SampleProductUrl + "\\?.*"), JSON.stringify(Fixtures.SampleProduct));
        server.respondWith('GET', ServiceUrls.cartService + "current", JSON.stringify(Fixtures.SampleCart));
        server.respondWith('DELETE', ServiceUrls.cartService + "current/items/", JSON.stringify(Fixtures.EmptyCart));
        server.respondWith('POST', ServiceUrls.cartService + "current/items/", JSON.stringify(Fixtures.SampleCartItem));
        server.respondWith('GET', new RegExp(ServiceUrls.BadUrl), [404, {}, ""]);

        server.autoRespond = true; 
    });

    after(function () {
        server.restore();
    });
    

    it("should expose a Mozu object (in a non-AMD env)", function () {
        expect(Mozu).to.not.be.undefined;
    });

    describe("the root object", function () {

        it("should be an ApiContext object", function () {
            expect(Mozu).to.be.an.instanceof(Mozu.ApiContext);
        });

        it("should have functions to establish context", function () {
            expect(Mozu.Tenant).to.be.a('function');
            expect(Mozu.Site).to.be.a('function');
            expect(Mozu.MasterCatalog).to.be.a('function');
            expect(Mozu.Store).to.be.a('function');
            expect(Mozu.UserClaims).to.be.a('function');
        });

        it("should return an ApiContext from the Tenant, MasterCatalog, and Site functions", function () {
            expect(Mozu.Tenant(1)).to.be.an.instanceof(Mozu.ApiContext);
            expect(Mozu.Site(22)).to.be.an.instanceof(Mozu.ApiContext);
            expect(Mozu.MasterCatalog(22)).to.be.an.instanceof(Mozu.ApiContext);
        });

        it("should expose a Store function that can set all these properties in an object-initializer style", function () {
            expect(Mozu.Store({
                tenant: 1,
                site: 22,
                'master-catalog': 23
            })).to.be.an.instanceof(Mozu.ApiContext);
        });
    });

    describe("the ApiContext object", function() {
        var tenant = Mozu.Tenant(1);
        
        it("should have a tenantId property matching its argument", function() {
            expect(tenant.tenant).to.equal(1);
        });

        var site;
        it("should set the siteid with the site function", function () {
            site = tenant.Site(2);
            expect(site.site).to.equal(2);
        });

        it("should persist tenantId after siteId is set", function () {
            expect(site.tenant).to.equal(1);
        });

        it("should be able to initialize from a conf object as well", function () {
            expect(Mozu.Store({ 'tenant': 30001, 'master-catalog': 1, 'site': 30002 })).to.satisfy(function (context) {
                return context.Tenant() === 30001 && context.MasterCatalog() === 1 && context.Site() === 30002;
            });
        });


        it("should have a getServiceUrls method that returns a collection of the base URLs for the different services", function () {
            expect(tenant).to.respondTo('getServiceUrls');
            expect(tenant.getServiceUrls()).to.deep.equal(ServiceUrls);

        });

        it("should have a setServiceUrls method that sets the collection of the base URLs for the different services", function () {
            expect(tenant).to.respondTo('setServiceUrls');
            tenant.setServiceUrls(ServiceUrls);
            expect(Mozu.ApiReference.urls).to.equal(ServiceUrls);
        });
    });
    
    describe("ApiInterface object", function () {
        var completeContext = Mozu.Tenant(30001).MasterCatalog(1).Site(30002);
        var noTenantContext = Mozu.MasterCatalog(1).Site(40000);
        var noSiteContext = Mozu.Tenant(30000).MasterCatalog(1);
        var noMasterCatalogContext = Mozu.Tenant(30000).Site(1);
        //var noHostContext = Mozu.Tenant(4000).MasterCatalog(1).Site(2);

        it("should be returned by the 'api' method of a complete ApiContext", function () {
            expect(completeContext.api()).to.be.an.instanceof(Mozu.ApiInterface);
        });

        it("should error when any of tenant, site, or master catalog are not supplied", function () {
            expect(function () { return noTenantContext.api(); }).to.throw(/no tenant/i);
            expect(function () { return noSiteContext.api(); }).to.throw(/no site/i);
            expect(function () { return noMasterCatalogContext.api(); }).to.throw(/no mastercatalog/i);
        });

        var api = completeContext.api();

        it("should have request, get, update, create, and delete methods", function () {
            expect(api.request).to.be.a("function");
            expect(api.get).to.be.a("function");
            expect(api.update).to.be.a("function");
            expect(api.create).to.be.a("function");
            expect(api.del).to.be.a("function");
        });

        it("should have .on, .off, and .fire methods for event pub/sub", function() {
            expect(api.on).to.be.a("function");
            expect(api.off).to.be.a("function");
            expect(api.fire).to.be.a("function");
        });

        it("should have a reference to its context at .context", function() {
            expect(api.context).to.equal(completeContext);
        });

        describe("has an api.request method, that", function () {
            var req;

            before(function () {
                sinon.spy(Mozu.Utils, 'request');
            });

            after(function () {
                Mozu.Utils.request.restore();
            });

            it("should run an http request", function () {
                req = api.request('GET', ServiceUrls.productService);
                expect(Mozu.Utils.request).to.have.been.calledOnce;
            });

            it("should return a Promises/A compliant interface", function () {
                expect(req).to.satisfy(Mozu.Utils.when.isPromiseLike);
            });

            it("should fulfill the promise with the JSON returned from the service", function () {
                return expect(api.request("GET", ServiceUrls.productService)).to.become(Fixtures.SampleProductCollection);
            });


            it("should cause a 'request' event from the api object when it is called, supplying an XHR, a cancelling function, a promise, and the original configuration of the request", function (done) {
                var requestConf = {
                    url: ServiceUrls.productService
                };
                function onRequest(xhr, canceller, promise, reqConf) {
                    api.off('request',onRequest);
                    expect(xhr).to.have.property('status'); // since this is a fake XHR we can't do much more than duck test it
                    expect(canceller).to.be.a("function");
                    expect(promise).to.satisfy(Mozu.Utils.when.isPromiseLike);
                    expect(reqConf).to.equal(requestConf);
                    done();
                }
                api.on('request', onRequest);
                api.request("GET", requestConf);
            });

            it("should fail a promise when requests fail", function () {
                return expect(api.request('GET', ServiceUrls.BadUrl, {})).to.be.rejected;
            });

            describe("should supply a canceller function to 'request' handlers, that", function () {
                it("should cancel an outstanding XmlHttpRequest", function (done) {
                    var onRequest = function (xhr, canceller) {
                        expect(xhr.readyState).not.to.equal(0);
                        canceller();
                        expect(xhr.readyState).to.equal(0);
                        done();
                    }
                    api.on('request', onRequest);
                    api.request("GET", ServiceUrls.productService);
                    api.off('request', onRequest);
                });
            });

        });
        
        describe("has an api.get method, that", function () {

            beforeEach(function () {
                sinon.spy(Mozu.Utils, "request");
                sinon.spy(Mozu.ApiReference, "getRequestConfig");

            });

            afterEach(function () {
                Mozu.Utils.request.restore();
                Mozu.ApiReference.getRequestConfig.restore();
            });

            it("should work with shortcuts like 'products'", function () {
                var promise = api.get('products').otherwise(function (reason) {
                    console.log(reason);
                });

                return Mozu.Utils.when.all([
                    expect(promise).to.be.fulfilled,
                    expect(promise).to.eventually.be.an.instanceof(Mozu.ApiCollection),
                    expect(promise).to.eventually.have.property("type", "products"),
                    promise.then(function(products) {
                        expect(products).to.have.property("data").that.is.deep.equal(Fixtures.SampleProductCollection);
                    })
                ]);

            });
          
            it("should work with simple url templates, like 'product'", function () {

                var promise = api.get('product', { productCode: Fixtures.SampleProductCode });

                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "product", { productCode: Fixtures.SampleProductCode }, api.context);
                expect(Mozu.Utils.request).to.have.been.calledWithMatch(/GET/, new RegExp(Fixtures.SampleProductUrl + ".*"));

                return Mozu.Utils.when.all([
                    expect(promise).to.be.fulfilled,
                    expect(promise).to.eventually.be.an.instanceof(Mozu.ApiObject),
                    expect(promise).to.eventually.have.property("type", "product"),
                    promise.then(function (product) {
                        expect(product).to.have.property("data").that.is.deep.equal(Fixtures.SampleProduct);
                    })
                ]);
                
            });

            it("should work with a simple string argument to the most commonly-used param searched upon", function () {
                
                var promise = api.get("product", Fixtures.SampleProductCode);

                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "product", Fixtures.SampleProductCode, api.context);
                expect(Mozu.Utils.request).to.have.been.calledWithMatch(/GET/, new RegExp(ServiceUrls.productService + Fixtures.SampleProductCode + ".*"));

                return Mozu.Utils.when.all([
                      expect(promise).to.be.fulfilled,
                      expect(promise).to.eventually.be.an.instanceof(Mozu.ApiObject),
                      expect(promise).to.eventually.have.property("type", "product"),
                      promise.then(function (product) {
                          expect(product).to.have.property("data").that.is.deep.equal(Fixtures.SampleProduct);
                      })
                ]);

            });

            it("should work with carts", function () {
                var promise = api.get("cart");

                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "cart");
                expect(Mozu.Utils.request).to.have.been.calledWithMatch(/GET/, new RegExp(ServiceUrls.cartService + "current"));

                return Mozu.Utils.when.all([
                      expect(promise).to.be.fulfilled,
                      expect(promise).to.eventually.be.an.instanceof(Mozu.ApiObject),
                      expect(promise).to.eventually.have.property("type", "cart"),
                      promise.then(function (product) {
                          expect(product).to.have.property("data").that.is.deep.equal(Fixtures.SampleCart);
                      })
                ]);
            });

        });

        
        describe("has an \"error\" event for requests, that", function () {
            it("should fire when an XHR errors", function (done) {
                var onError = function (error, xhr, conf) {
                    api.off('error', onError);
                    expect(error).to.have.deep.property("items[0]");
                    expect(xhr).to.have.property("status");
                    expect(conf).to.be.ok;
                    done();
                };
                api.on('error', onError);
                api.request('GET', ServiceUrls.BadUrl, {});
            });
        });

        describe("has an api.all method, that ", function () {
            it("should make a bunch of API calls at once and return them all to a handler", function (done) {
                return api.all(api.get('product', Fixtures.SampleProductCode), api.get('cart')).spread(function (f, c) {
                    expect(f).to.be.an.instanceof(Mozu.ApiObject).and.to.have.property('type', 'product')
                    expect(f).to.have.property('data').that.is.deep.equal(Fixtures.SampleProduct);
                    expect(c).to.be.an.instanceof(Mozu.ApiObject).and.to.have.property('type', 'cart')
                    expect(c).to.have.property('data').that.is.deep.equal(Fixtures.SampleCart);
                });
            });
        });


        describe("has an api.steps method, that", function () {

            it("should make calls in sequence, passing the arguments from the previous call to the next one", function () {

                var checkers = [], product, cart;

                return api.steps(
                    function() {
                        checkers.push(1);
                        return api.get('product', Fixtures.SampleProduct);
                    },
                    function(p) {
                        checkers.push(2);
                        product = p;
                        return api.get('cart');
                    },
                    function(c) {
                        checkers.push(3);
                        cart = c;
                        return 5;
                    },
                    function(five) {
                        expect(product).to.have.property("data").that.deep.equal(Fixtures.SampleProduct);
                        expect(cart).to.have.property("data").that.deep.equal(Fixtures.SampleCart);
                        expect(five).to.equal(5);
                        expect(checkers).to.deep.equal([1,2,3]);
                    }
                ); 
            });
        });

        describe("has a 'createSync' method that", function () {
            var syncProd;
            before(function () {
                sinon.spy(Mozu.Utils, 'request');
                sinon.spy(Mozu.ApiReference, "getRequestConfig");
            });
            after(function () {
                Mozu.Utils.request.restore();
                Mozu.ApiReference.getRequestConfig.restore();
            });

            it("synchronously creates ApiObject objects", function () {
                expect(api).to.respondTo('createSync');
                expect(api.createSync('product', {})).to.be.an.instanceof(Mozu.ApiObject).with.a.property('type').that.equal('product');
                expect(syncProd = api.createSync('product', Fixtures.SampleProduct)).to.have.a.property('data').that.deep.equal(Fixtures.SampleProduct);
                expect(api.createSync('cart')).to.have.a.property('unsynced').that.is.true;
                expect(Mozu.Utils.request).not.to.have.been.called;
            });

            it("produces sync objects that act just like asynchronously returned ones", function () {
                var promise = syncProd.get();
                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "product", syncProd.data, api.context);
                expect(Mozu.Utils.request).to.have.been.calledWithMatch(/GET/, new RegExp(Fixtures.SampleProductUrl + ".*"));
                return expect(promise).to.be.fulfilled;
            });
        });


        it("should have a getAvailableActionsFor method that returns all actions that can be performed on a provided string type", function () {
                expect(api).to.respondTo('getAvailableActionsFor');
                expect(api.getAvailableActionsFor('cart')).to.include("empty");
        });


        describe("fulfills its promises with an ApiObject object, that", function () {

            beforeEach(function () {
                sinon.spy(Mozu.Utils, "request");
            });

            afterEach(function () {
                Mozu.Utils.request.restore();
            });

            it("should contain the original json at a 'data' property", function () {
                var rawJSON;
                function getJSON(raw) {
                    rawJSON = raw;
                }
                api.on('success', getJSON);
                return api.get('products').then(function (products) {
                    api.off(getJSON);
                    expect(products.data).to.deep.equal(rawJSON);
                });
            });

            describe("should have a 'prop' method that", function () {

                it("gets underlying properties from the raw JSON", function () {
                    return api.get('product', Fixtures.SampleProduct).then(function (product) {
                        expect(product).to.respondTo("prop");
                        expect(product.prop("productCode")).to.equal(Fixtures.SampleProduct.productCode);
                    });
                });

                it("sets single underlying properties from the raw JSON", function () {
                    return api.get('product', Fixtures.SampleProduct).then(function (product) {
                        var newName = product.prop("productName") + "_MODIFIED";
                        product.prop("productName", newName);
                        expect(product.data.productName).to.equal(newName)
                    });

                });

                it("sets multiple underlying properties from the raw JSON", function () {
                    return api.get('product', Fixtures.SampleProduct).then(function (product) {
                        var newStuff = {
                            productName: product.prop("productName") + "_MODIFIED",
                            productCode: product.prop("productCode") + "_MODIFIED"
                        };
                        product.prop(newStuff);
                        expect(product.data.productName).to.equal(newStuff.productName);
                        expect(product.data.productCode).to.equal(newStuff.productCode);
                    });
                });

            });

            it("should have methods that peforms common actions for the object type", function () {

                return Mozu.Utils.when.all([api.get('product', Fixtures.SampleProductCode).then(function (product) {
                    expect(product).to.respondTo('addToCart');
                    return product.addToCart().then(function (cartitem) {
                        expect(cartitem).to.have.property('data').that.is.deep.equal(Fixtures.SampleCartItem);
                    });
                }),
                api.get('cart').then(function (cart) {
                    expect(cart).to.respondTo('empty');
                    return cart.empty().then(function (emptycart) {
                        expect(emptycart).to.have.property('data').that.is.deep.equal(Fixtures.EmptyCart);
                    });
                })]);

            });

            it("should have a getAvailableActions method that returns all actions that can be performed on this resource", function () {
                return api.get('cart').then(function (cart) {
                    expect(cart).to.respondTo('getAvailableActions');
                    expect(cart.getAvailableActions()).to.include("empty");
                });
            });

            it("should fire an 'action' event when you successfully run an action method", function () {
                var product = api.createSync('product', Fixtures.SampleProduct),
                    actionName = "addToCart",
                    onAction = sinon.spy();
                product.on('action', onAction);
                product.addToCart();
                expect(onAction).to.have.been.calledWith(actionName);
            });

            it("should fire a 'sync' event when it syncs its own data from the server", function () {
                var product = api.createSync('product', { productCode: Fixtures.SampleProductCode }),
                    onSync = sinon.spy();
                product.on('sync', onSync);
                return product.get().then(function () {
                    expect(onSync).to.have.been.calledWith(Fixtures.SampleProduct);
                });
            });

            it("should, instead of updating itself, create new ApiObjects of a different type for some actions, and throw a 'spawn' event", function () {
                var product = api.createSync('product', { productCode: Fixtures.SampleProductCode }),
                    onSpawn = sinon.spy();
                product.on('spawn', onSpawn);
                return product.addToCart().then(function (cartItem) {
                    expect(onSpawn).to.have.been.calledWith(cartItem);
                });
            });

        });
            
        it("should fire an 'action' event when you successfully run an action method on any product that belongs to it", function () {
            var product = api.createSync('product', Fixtures.SampleProduct),
                actionName = "addToCart",
                onAction = sinon.spy();
            product.api.on('action', onAction);
            product.addToCart();
            expect(onAction).to.have.been.calledWith(product, actionName);
        });


        it("should fire a 'sync' event when any product that belongs to it syncs its own data from the server", function () {
            var product = api.createSync('product', { productCode: Fixtures.SampleProductCode }),
                onSync = sinon.spy();
            product.api.on('sync', onSync);
            return product.get().then(function () {
                expect(onSync).to.have.been.calledWith(product, Fixtures.SampleProduct);
            });
        });

        describe("should, for collections returned by the API, be of a special ApiCollection type, that", function () {
            var productsCollection, origLen, newItems = [{}, {}, {}, {}, {}];
            beforeEach(function() {
                return api.get("products").then(function (p) {
                    productsCollection = p;
                    origLen = p.length;
                });
            })
            afterEach(function () {
                productsCollection = null;
            });
            it("should have an \"isCollection\" flag set to true", function () {
                expect(productsCollection.isCollection).to.be.ok;
                expect(productsCollection).to.be.an.instanceof(Mozu.ApiCollection);
            });
            it("should be an array-like object with a length property", function () {
                expect(productsCollection).to.have.property("length").that.is.a("number");
            });
            it("should have a string type property and a string itemType property, for the collection type and the type of its items", function() {
                expect(productsCollection).to.have.a.property("type").that.is.a("string").and.is.to.equal("products");
                expect(productsCollection).to.have.a.property("itemType").that.is.a("string").and.is.to.equal("product");
            });
            it("should have an .add method that adds new items", function () {
                expect(productsCollection).to.respondTo("add");
            });
            it("should increase in length when items are added", function() {
                productsCollection.add(newItems);
                expect(productsCollection.length).to.equal(origLen + newItems.length);
            });
            it("should contain items of its item type", function() {
                productsCollection.add(newItems);
                expect(productsCollection[0]).to.be.an.instanceof(Mozu.ApiObject).and.to.have.a.property("type").that.is.to.equal(productsCollection.itemType);
            });
            it("should increment its underlying data.Items property to stay in sync when items are added", function () {
                expect(productsCollection.length).to.equal(productsCollection.prop("items").length);
                productsCollection.add(newItems);
                expect(productsCollection.length).to.equal(productsCollection.prop("items").length);
            });
        });
            
    });

});