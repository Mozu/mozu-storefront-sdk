// EXPOSE DEBUGGING STUFF
var _init = require('./init');

_init.Utils = require('./utils');
_init.ApiContext = require('./context');
_init.ApiInterface = require('./interface');
_init.ApiObject = require('./object');
_init.ApiCollection = require('./collection');
_init.ApiReference = require('./reference');

_init._expose = function (r) {
    _init.lastResult = r;
    console.log(r && r.inspect ? r.inspect() : r);
};

_init.ApiObject.prototype.inspect = function () {
    return JSON.stringify(this.data, true, 2);
};

_init.ApiContext.__debug__ = true;

module.exports = _init;