// BEGIN UTILS
// Many of these poached from lodash

    var maxFlattenDepth = 100;

    var MicroEvent = require('microevent');
    var isNode = typeof process === "object" && process.title === "node";
    var XHR;
    var IframeXHR;
    var getXHR = isNode ? function() {
        XHR = XHR || require('xmlhttprequest').XMLHttpRequest;
        return new XHR();
    } : (window.XMLHttpRequest ? function() {
        return new XMLHttpRequest();
    } : function() {
        return new window.ActiveXObject("Microsoft.XMLHTTP");
    });
    var utils = {
        extend: function () {
            var src, copy, name, options,
                target = arguments[0],
                i = 1,
                length = arguments.length;

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null) {
                    // Extend the base object
                    for (name in options) {
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        },
        each: function(arr, callback) {

        },
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj)); // cheap copy :)
        },
        compose: function(first, second) {
            return function() {
                first.call(this, arguments);
                second.call(this, arguments);
            }
        },
        flatten: function (obj, into, prefix, separator, depth) {
            if (depth === 0)
              throw new Error("Cannot flatten object of depth greater than 100. Consider normalizing this object.");
            if (!depth) depth = maxFlattenDepth;
            into = into || {};
            separator = separator || ".";
            prefix = prefix || '';
            for (var n in obj) {
                key = n;
                val = obj[n];
                if (obj.hasOwnProperty(key)) {
                    if (val && typeof val === 'object' && !(
                      val instanceof Array ||
                      val instanceof Date ||
                      val instanceof RegExp)
                    ) {
                        utils.flatten(val.toJSON ? val.toJSON() : val, into, prefix + key + separator, separator, depth - 1);
                    }
                    else {
                        into[prefix + key] = val;
                    }
                }
            }

            return into;
        },
        inherit: (function(composedMethods) {
            return function (parent, more) {
                var ApiInheritedObject = function() {
                    if (this.construct) this.construct.apply(this, arguments);
                    parent.apply(this, arguments);
                    if (this.postconstruct) this.postconstruct.apply(this, arguments);
                },
                parentObject = new parent();
                for (var i = 0; i < composedMethods.length; i++) {
                    if (parentObject[composedMethods[i]] && more[composedMethods[i]])
                        more[composedMethods[i]] = utils.compose(parentObject[composedMethods[i]], more[composedMethods[i]]);
                }
                ApiInheritedObject.prototype = utils.extend(parentObject, more);
                return ApiInheritedObject;
            };
        })(['construct','postconstruct']),
        map: function (arr, fn, scope) {
            var newArr = [], len = arr.length;
            scope = scope || window;
            for (var i = 0; i < len; i++) {
                newArr[i] = fn.call(scope, arr[i]);
            }
            return newArr;
        },
        each: (function(nativeForEach) {
            return (nativeForEach && typeof nativeForEach === "function") ? function(arr) {
                return nativeForEach.apply(arr, utils.slice(arguments, 1));
            } : function(collection, callback, thisArg) {

                var T, k;

                // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
                var O = Object(collection);

                // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
                // 3. Let len be ToUint32(lenValue).
                var len = O.length >>> 0;

                // 4. If IsCallable(callback) is false, throw a TypeError exception.
                // See: http://es5.github.com/#x9.11
                if (typeof callback !== "function") {
                    throw new TypeError(callback + ' is not a function');
                }

                // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 1) {
                    T = thisArg;
                }

                // 6. Let k be 0
                k = 0;

                // 7. Repeat, while k < len
                while (k < len) {

                    var kValue;

                    // a. Let Pk be ToString(k).
                    //   This is implicit for LHS operands of the in operator
                    // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                    //   This step can be combined with c
                    // c. If kPresent is true, then
                    if (k in O) {

                        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                        kValue = O[k];

                        // ii. Call the Call internal method of callback with T as the this value and
                        // argument list containing kValue, k, and O.
                        callback.call(T, kValue, k, O);
                    }
                    // d. Increase k by 1.
                    k++;
                }
                // 8. return undefined
            }
        }(Array.prototype.forEach)),
        reduce: (function(nativeReduce) {
            return (nativeReduce && typeof nativeReduce === "function") ? function(arr) {
                return nativeReduce.apply(arr, utils.slice(arguments, 1));
            } : function(collection, callback /*, initialValue*/) {
                var t = Object(collection), len = t.length >>> 0, k = 0, value;
                if (arguments.length == 3) {
                    value = arguments[2];
                } else {
                    while (k < len && !(k in t)) {
                        k++; 
                    }
                    if (k >= len) {
                        throw new TypeError('Reduce of empty array with no initial value');
                    }
                    value = t[k++];
                }
                for (; k < len; k++) {
                    if (k in t) {
                        value = callback(value, t[k], k, t);
                    }
                }
                return value;
            }
        }(Array.prototype.reduce)), 
        slice: function(arrayLikeObj, ix) {
            return Array.prototype.slice.call(arrayLikeObj, ix);
        },
        indexOf: (function(nativeIndexOf) {
            return (nativeIndexOf && typeof nativeIndexOf === "function") ? function(arr, val) {
                return nativeIndexOf.call(arr, val);
            } : function (arr, val) {
                for (var i = 0, l = arr.length; i < length; i++) {
                    if (arr[i] === val) return i;
                }
                return -1;
            };
        }(Array.prototype.indexOf)),
        formatString: function(tpt) {
            var formatted = tpt, otherArgs = utils.slice(arguments, 1);
            for (var i = 0, len = otherArgs.length; i < len; i++) {
                formatted = formatted.split('{' + i + '}').join(otherArgs[i] || '');
            }
            return formatted;
        },
        setOp: function(proto, fnName) {
            proto[fnName] = function (conf) {
                return this.api.action(this, fnName, conf);
            };
        },
        getType: (function () {
            var reType = /\[object (\w+)\]/;
            return function (thing) {
                var match = reType.exec(Object.prototype.toString.call(thing));
                return match && match[1];
            };
        }()),
        camelCase: (function () {
            var rdashAlpha = /-([\da-z])/gi,
                cccb = function (match, l) {
                    return l.toUpperCase();
                };
            return function (str, firstCap) {
                return (firstCap ? str.charAt(0).toUpperCase() + str.substring(1) : str).replace(rdashAlpha, cccb);
            };
        }()),

        dashCase: (function () {
            var rcase = /([a-z])([A-Z])/g,
                rstr = "$1-$2";
            return function (str) {
                return str.replace(rcase, rstr).toLowerCase();
            };
        }()),

        request: function (method, url, headers, data, success, failure, iframePath) {
            if (typeof data !== "string") data = JSON.stringify(data);
            
            var xhr;
            if (iframePath) {
                IframeXHR = IframeXHR || require('./iframexhr');
                xhr = new IframeXHR(iframePath);
            } else {
                xhr = getXHR();
            }

            var timeout = setTimeout(function () {
                clearTimeout(timeout);
                failure({
                    items: [
                        {
                            message: 'Request timed out.',
                            code: 'TIMEOUT'
                        }
                    ]
                }, xhr);
            }, 60000);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    clearTimeout(timeout);
                    var json = null;
                    if (xhr.responseText && xhr.responseText.length > 0) {
                        try {
                            json = JSON.parse(xhr.responseText);
                        } catch (e) {
                            failure({
                                items: [
                                    {
                                        message: "Unable to parse response: " + xhr.responseText,
                                        code: 'UNKNOWN'
                                    }
                                ]
                            }, xhr, e);
                        }
                    }
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 1223) { // IE8 reports 204 as 1223
                        success(json, xhr);
                    } else {
                        failure(json || {
                            items: [
                                {
                                    message: 'Request failed, no response given.',
                                    code: xhr.status
                                }
                            ]
                        }, xhr);
                    }
                }
            };

            var tunnelMethod = (method === "DELETE");

            xhr.open(tunnelMethod ? "POST" : (method || 'GET'), url);
            if (headers) {
                for (var h in headers) {
                    if (headers[h]) xhr.setRequestHeader(h, headers[h]);
                }
            }

            if (tunnelMethod) {
                xhr.setRequestHeader('X-HTTP-Method-Override', method);
            }


            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            if (data && method !== 'GET') {
                xhr.send(data);
            } else {
                xhr.send();
            }
            return xhr;
        },

        pipeline: function (tasks /* initialArgs... */) {
            // Self-optimizing function to run first task with multiple
            // args using apply, but subsequence tasks via direct invocation
            var runTask = function (args, task) {
                runTask = function (arg, task) {
                    return task(arg);
                };

                return task.apply(null, args);
            };

            return utils.when.all(Array.prototype.slice.call(arguments, 1)).then(function (args) {
                return utils.when.reduce(tasks, function (arg, task) {
                    return runTask(arg, task);
                }, args);
            });
        },

        when: require('when'),
        uritemplate: require('uritemplate'),

        addEvents: function (ctor) {
            MicroEvent.mixin(ctor);
            ctor.prototype.on = ctor.prototype.bind;
            ctor.prototype.off = ctor.prototype.unbind;
            ctor.prototype.fire = ctor.prototype.trigger;
        }
    };

    module.exports = utils;
// END UTILS

/*********/
