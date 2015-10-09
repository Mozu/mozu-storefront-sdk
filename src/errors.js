// BEGIN ERRORS
var utils = require('./utils');

function errorToString() {
    return this.name + ": " + this.message;
}

var errorTypes = {};

var errors = {
    register: function(code, message) {
        if (typeof code === "object") {
            for (var i in code) {
                errors.register(i, code[i]);
            }
        } else {
            errorTypes[code] = {
                code: code,
                message: message
            };
        }
    },
    create: function(code) {
        var msg = utils.formatString.apply(utils, [errorTypes[code].message].concat(utils.slice(arguments, 1)));
        return {
            name: code,
            level: 1,
            message: msg,
            htmlMessage: msg,
            toString: errorToString
        };
    },
    throwOnObject: function(obj, code) {
        var error = errors.create.apply(errors, [code].concat(utils.slice(arguments, 2)));
        obj.fire('error', error);
        obj.api.fire('error', error, obj);
        throw error;
    },
    passFrom: function(from, to) {
        from.on('error', function() {
            to.fire.apply(to, ['error'].concat(utils.slice(arguments)));
        });
    }
};

module.exports = errors;
// END ERRORS