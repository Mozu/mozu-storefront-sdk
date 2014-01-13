// BEGIN UTILS
// Many of these poached from lodash
var utils = (function () {

    var maxFlattenDepth = 20;

    return {
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
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj)); // cheap copy :)
        },
        flatten: function (obj, into, prefix, separator, depth) {
            if (depth === 0) throw "Cannot flatten circular object.";
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
                        utils.flatten(val.toJSON ? val.toJSON() : val, into, prefix + key + separator, separator, --depth);
                    }
                    else {
                        into[prefix + key] = val;
                    }
                }
            }

            return into;
        },
        inherit: function (parent, more) {
            var ApiInheritedObject = function () {
                if (this.construct) this.construct.apply(this, arguments);
                parent.apply(this, arguments);
                if (this.postconstruct) this.postconstruct.apply(this, arguments);
            }
            ApiInheritedObject.prototype = utils.extend(new parent(), more);
            return ApiInheritedObject;
        },
        map: function (arr, fn, scope) {
            var newArr = [], len = arr.length;
            scope = scope || window;
            for (var i = 0; i < len; i++) {
                newArr[i] = fn.call(scope, arr[i])
            }
            return newArr;
        },
        reduce: function(collection, callback, accumulator) {
            var index = -1,
                length = collection.length;
            while (++index < length) {
                accumulator = callback(accumulator, collection[index], index, collection);
            }
            return accumulator;
        },
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
            }
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
            }
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
            }
        }()),

        ajax: function (method, url, headers, data, success, failure, iframePath) {
            if (typeof data !== "string") data = JSON.stringify(data);
            var xhr;
            if (iframePath) {
                xhr = new IframeXHR(iframePath);
            } else {
                xhr = new (window.XMLHttpRequest ? window.XMLHttpRequest : window.ActiveXObject("Microsoft.XMLHTTP"))();
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
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
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
            xhr.open(method || 'GET', url);
            if (headers) {
                for (var h in headers) {
                    if (headers[h]) xhr.setRequestHeader(h, headers[h]);
                }
            }
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(method !== 'GET' && data);
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

        // the sdk build uses a super-slim override of "define" that pushes AMD deps into an array.
        // this allows us to cleanly vendor AMD-compatible scripts without polluting scope.
        // only downside is, you have to refer to the build script (Gruntfile) to see what order you brought them in.
        when: amds[0],
        uritemplate: amds[1],

        addEvents: function (ctor) {
            MicroEvent.mixin(ctor);
            ctor.prototype.on = ctor.prototype.bind;
            ctor.prototype.off = ctor.prototype.unbind;
            ctor.prototype.fire = ctor.prototype.trigger;
        }
    };
}());
// END UTILS

/*********/