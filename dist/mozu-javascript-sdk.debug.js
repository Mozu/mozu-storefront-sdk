/*! 
 * Mozu JavaScript SDK - v0.3.0 - 2014-01-20
 *
 * Copyright (c) 2014 Volusion, Inc.
 *
 */

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MozuSDK=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

var MicroEvent	= function(){}
MicroEvent.prototype	= {
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}

},{}],3:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*global unescape, module, define, window, global*/

/*
 UriTemplate Copyright (c) 2012-2013 Franz Antesberger. All Rights Reserved.
 Available via the MIT license.
*/

(function (exportCallback) {
    "use strict";

var UriTemplateError = (function () {

    function UriTemplateError (options) {
        this.options = options;
    }

    UriTemplateError.prototype.toString = function () {
        if (JSON && JSON.stringify) {
            return JSON.stringify(this.options);
        }
        else {
            return this.options;
        }
    };

    return UriTemplateError;
}());

var objectHelper = (function () {
    function isArray (value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    }

    function isString (value) {
        return Object.prototype.toString.apply(value) === '[object String]';
    }
    
    function isNumber (value) {
        return Object.prototype.toString.apply(value) === '[object Number]';
    }
    
    function isBoolean (value) {
        return Object.prototype.toString.apply(value) === '[object Boolean]';
    }
    
    function join (arr, separator) {
        var
            result = '',
            first = true,
            index;
        for (index = 0; index < arr.length; index += 1) {
            if (first) {
                first = false;
            }
            else {
                result += separator;
            }
            result += arr[index];
        }
        return result;
    }

    function map (arr, mapper) {
        var
            result = [],
            index = 0;
        for (; index < arr.length; index += 1) {
            result.push(mapper(arr[index]));
        }
        return result;
    }

    function filter (arr, predicate) {
        var
            result = [],
            index = 0;
        for (; index < arr.length; index += 1) {
            if (predicate(arr[index])) {
                result.push(arr[index]);
            }
        }
        return result;
    }

    function deepFreezeUsingObjectFreeze (object) {
        if (typeof object !== "object" || object === null) {
            return object;
        }
        Object.freeze(object);
        var property, propertyName;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                property = object[propertyName];
                // be aware, arrays are 'object', too
                if (typeof property === "object") {
                    deepFreeze(property);
                }
            }
        }
        return object;
    }

    function deepFreeze (object) {
        if (typeof Object.freeze === 'function') {
            return deepFreezeUsingObjectFreeze(object);
        }
        return object;
    }


    return {
        isArray: isArray,
        isString: isString,
        isNumber: isNumber,
        isBoolean: isBoolean,
        join: join,
        map: map,
        filter: filter,
        deepFreeze: deepFreeze
    };
}());

var charHelper = (function () {

    function isAlpha (chr) {
        return (chr >= 'a' && chr <= 'z') || ((chr >= 'A' && chr <= 'Z'));
    }

    function isDigit (chr) {
        return chr >= '0' && chr <= '9';
    }

    function isHexDigit (chr) {
        return isDigit(chr) || (chr >= 'a' && chr <= 'f') || (chr >= 'A' && chr <= 'F');
    }

    return {
        isAlpha: isAlpha,
        isDigit: isDigit,
        isHexDigit: isHexDigit
    };
}());

var pctEncoder = (function () {
    var utf8 = {
        encode: function (chr) {
            // see http://ecmanaut.blogspot.de/2006/07/encoding-decoding-utf8-in-javascript.html
            return unescape(encodeURIComponent(chr));
        },
        numBytes: function (firstCharCode) {
            if (firstCharCode <= 0x7F) {
                return 1;
            }
            else if (0xC2 <= firstCharCode && firstCharCode <= 0xDF) {
                return 2;
            }
            else if (0xE0 <= firstCharCode && firstCharCode <= 0xEF) {
                return 3;
            }
            else if (0xF0 <= firstCharCode && firstCharCode <= 0xF4) {
                return 4;
            }
            // no valid first octet
            return 0;
        },
        isValidFollowingCharCode: function (charCode) {
            return 0x80 <= charCode && charCode <= 0xBF;
        }
    };

    /**
     * encodes a character, if needed or not.
     * @param chr
     * @return pct-encoded character
     */
    function encodeCharacter (chr) {
        var
            result = '',
            octets = utf8.encode(chr),
            octet,
            index;
        for (index = 0; index < octets.length; index += 1) {
            octet = octets.charCodeAt(index);
            result += '%' + (octet < 0x10 ? '0' : '') + octet.toString(16).toUpperCase();
        }
        return result;
    }

    /**
     * Returns, whether the given text at start is in the form 'percent hex-digit hex-digit', like '%3F'
     * @param text
     * @param start
     * @return {boolean|*|*}
     */
    function isPercentDigitDigit (text, start) {
        return text.charAt(start) === '%' && charHelper.isHexDigit(text.charAt(start + 1)) && charHelper.isHexDigit(text.charAt(start + 2));
    }

    /**
     * Parses a hex number from start with length 2.
     * @param text a string
     * @param start the start index of the 2-digit hex number
     * @return {Number}
     */
    function parseHex2 (text, start) {
        return parseInt(text.substr(start, 2), 16);
    }

    /**
     * Returns whether or not the given char sequence is a correctly pct-encoded sequence.
     * @param chr
     * @return {boolean}
     */
    function isPctEncoded (chr) {
        if (!isPercentDigitDigit(chr, 0)) {
            return false;
        }
        var firstCharCode = parseHex2(chr, 1);
        var numBytes = utf8.numBytes(firstCharCode);
        if (numBytes === 0) {
            return false;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(chr, 3*byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(chr, 3*byteNumber + 1))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Reads as much as needed from the text, e.g. '%20' or '%C3%B6'. It does not decode!
     * @param text
     * @param startIndex
     * @return the character or pct-string of the text at startIndex
     */
    function pctCharAt(text, startIndex) {
        var chr = text.charAt(startIndex);
        if (!isPercentDigitDigit(text, startIndex)) {
            return chr;
        }
        var utf8CharCode = parseHex2(text, startIndex + 1);
        var numBytes = utf8.numBytes(utf8CharCode);
        if (numBytes === 0) {
            return chr;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(text, startIndex + 3 * byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(text, startIndex + 3 * byteNumber + 1))) {
                return chr;
            }
        }
        return text.substr(startIndex, 3 * numBytes);
    }

    return {
        encodeCharacter: encodeCharacter,
        isPctEncoded: isPctEncoded,
        pctCharAt: pctCharAt
    };
}());

var rfcCharHelper = (function () {

    /**
     * Returns if an character is an varchar character according 2.3 of rfc 6570
     * @param chr
     * @return (Boolean)
     */
    function isVarchar (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '_' || pctEncoder.isPctEncoded(chr);
    }

    /**
     * Returns if chr is an unreserved character according 1.5 of rfc 6570
     * @param chr
     * @return {Boolean}
     */
    function isUnreserved (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '-' || chr === '.' || chr === '_' || chr === '~';
    }

    /**
     * Returns if chr is an reserved character according 1.5 of rfc 6570
     * or the percent character mentioned in 3.2.1.
     * @param chr
     * @return {Boolean}
     */
    function isReserved (chr) {
        return chr === ':' || chr === '/' || chr === '?' || chr === '#' || chr === '[' || chr === ']' || chr === '@' || chr === '!' || chr === '$' || chr === '&' || chr === '(' ||
            chr === ')' || chr === '*' || chr === '+' || chr === ',' || chr === ';' || chr === '=' || chr === "'";
    }

    return {
        isVarchar: isVarchar,
        isUnreserved: isUnreserved,
        isReserved: isReserved
    };

}());

/**
 * encoding of rfc 6570
 */
var encodingHelper = (function () {

    function encode (text, passReserved) {
        var
            result = '',
            index,
            chr = '';
        if (typeof text === "number" || typeof text === "boolean") {
            text = text.toString();
        }
        for (index = 0; index < text.length; index += chr.length) {
            chr = text.charAt(index);
            result += rfcCharHelper.isUnreserved(chr) || (passReserved && rfcCharHelper.isReserved(chr)) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    }

    function encodePassReserved (text) {
        return encode(text, true);
    }

    function encodeLiteralCharacter (literal, index) {
        var chr = pctEncoder.pctCharAt(literal, index);
        if (chr.length > 1) {
            return chr;
        }
        else {
            return rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
        }
    }

    function encodeLiteral (literal) {
        var
            result = '',
            index,
            chr = '';
        for (index = 0; index < literal.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(literal, index);
            if (chr.length > 1) {
                result += chr;
            }
            else {
                result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
            }
        }
        return result;
    }

    return {
        encode: encode,
        encodePassReserved: encodePassReserved,
        encodeLiteral: encodeLiteral,
        encodeLiteralCharacter: encodeLiteralCharacter
    };

}());


// the operators defined by rfc 6570
var operators = (function () {

    var
        bySymbol = {};

    function create (symbol) {
        bySymbol[symbol] = {
            symbol: symbol,
            separator: (symbol === '?') ? '&' : (symbol === '' || symbol === '+' || symbol === '#') ? ',' : symbol,
            named: symbol === ';' || symbol === '&' || symbol === '?',
            ifEmpty: (symbol === '&' || symbol === '?') ? '=' : '',
            first: (symbol === '+' ) ? '' : symbol,
            encode: (symbol === '+' || symbol === '#') ? encodingHelper.encodePassReserved : encodingHelper.encode,
            toString: function () {
                return this.symbol;
            }
        };
    }

    create('');
    create('+');
    create('#');
    create('.');
    create('/');
    create(';');
    create('?');
    create('&');
    return {
        valueOf: function (chr) {
            if (bySymbol[chr]) {
                return bySymbol[chr];
            }
            if ("=,!@|".indexOf(chr) >= 0) {
                return null;
            }
            return bySymbol[''];
        }
    };
}());


/**
 * Detects, whether a given element is defined in the sense of rfc 6570
 * Section 2.3 of the RFC makes clear defintions:
 * * undefined and null are not defined.
 * * the empty string is defined
 * * an array ("list") is defined, if it is not empty (even if all elements are not defined)
 * * an object ("map") is defined, if it contains at least one property with defined value
 * @param object
 * @return {Boolean}
 */
function isDefined (object) {
    var
        propertyName;
    if (object === null || object === undefined) {
        return false;
    }
    if (objectHelper.isArray(object)) {
        // Section 2.3: A variable defined as a list value is considered undefined if the list contains zero members
        return object.length > 0;
    }
    if (typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
        // falsy values like empty strings, false or 0 are "defined"
        return true;
    }
    // else Object
    for (propertyName in object) {
        if (object.hasOwnProperty(propertyName) && isDefined(object[propertyName])) {
            return true;
        }
    }
    return false;
}

var LiteralExpression = (function () {
    function LiteralExpression (literal) {
        this.literal = encodingHelper.encodeLiteral(literal);
    }

    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    return LiteralExpression;
}());

var parse = (function () {

    function parseExpression (expressionText) {
        var
            operator,
            varspecs = [],
            varspec = null,
            varnameStart = null,
            maxLengthStart = null,
            index,
            chr = '';

        function closeVarname () {
            var varname = expressionText.substring(varnameStart, index);
            if (varname.length === 0) {
                throw new UriTemplateError({expressionText: expressionText, message: "a varname must be specified", position: index});
            }
            varspec = {varname: varname, exploded: false, maxLength: null};
            varnameStart = null;
        }

        function closeMaxLength () {
            if (maxLengthStart === index) {
                throw new UriTemplateError({expressionText: expressionText, message: "after a ':' you have to specify the length", position: index});
            }
            varspec.maxLength = parseInt(expressionText.substring(maxLengthStart, index), 10);
            maxLengthStart = null;
        }

        operator = (function (operatorText) {
            var op = operators.valueOf(operatorText);
            if (op === null) {
                throw new UriTemplateError({expressionText: expressionText, message: "illegal use of reserved operator", position: index, operator: operatorText});
            }
            return op;
        }(expressionText.charAt(0)));
        index = operator.symbol.length;

        varnameStart = index;

        for (; index < expressionText.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(expressionText, index);

            if (varnameStart !== null) {
                // the spec says: varname =  varchar *( ["."] varchar )
                // so a dot is allowed except for the first char
                if (chr === '.') {
                    if (varnameStart === index) {
                        throw new UriTemplateError({expressionText: expressionText, message: "a varname MUST NOT start with a dot", position: index});
                    }
                    continue;
                }
                if (rfcCharHelper.isVarchar(chr)) {
                    continue;
                }
                closeVarname();
            }
            if (maxLengthStart !== null) {
                if (index === maxLengthStart && chr === '0') {
                    throw new UriTemplateError({expressionText: expressionText, message: "A :prefix must not start with digit 0", position: index});
                }
                if (charHelper.isDigit(chr)) {
                    if (index - maxLengthStart >= 4) {
                        throw new UriTemplateError({expressionText: expressionText, message: "A :prefix must have max 4 digits", position: index});
                    }
                    continue;
                }
                closeMaxLength();
            }
            if (chr === ':') {
                if (varspec.maxLength !== null) {
                    throw new UriTemplateError({expressionText: expressionText, message: "only one :maxLength is allowed per varspec", position: index});
                }
                if (varspec.exploded) {
                    throw new UriTemplateError({expressionText: expressionText, message: "an exploeded varspec MUST NOT be varspeced", position: index});
                }
                maxLengthStart = index + 1;
                continue;
            }
            if (chr === '*') {
                if (varspec === null) {
                    throw new UriTemplateError({expressionText: expressionText, message: "exploded without varspec", position: index});
                }
                if (varspec.exploded) {
                    throw new UriTemplateError({expressionText: expressionText, message: "exploded twice", position: index});
                }
                if (varspec.maxLength) {
                    throw new UriTemplateError({expressionText: expressionText, message: "an explode (*) MUST NOT follow to a prefix", position: index});
                }
                varspec.exploded = true;
                continue;
            }
            // the only legal character now is the comma
            if (chr === ',') {
                varspecs.push(varspec);
                varspec = null;
                varnameStart = index + 1;
                continue;
            }
            throw new UriTemplateError({expressionText: expressionText, message: "illegal character", character: chr, position: index});
        } // for chr
        if (varnameStart !== null) {
            closeVarname();
        }
        if (maxLengthStart !== null) {
            closeMaxLength();
        }
        varspecs.push(varspec);
        return new VariableExpression(expressionText, operator, varspecs);
    }

    function parse (uriTemplateText) {
        // assert filled string
        var
            index,
            chr,
            expressions = [],
            braceOpenIndex = null,
            literalStart = 0;
        for (index = 0; index < uriTemplateText.length; index += 1) {
            chr = uriTemplateText.charAt(index);
            if (literalStart !== null) {
                if (chr === '}') {
                    throw new UriTemplateError({templateText: uriTemplateText, message: "unopened brace closed", position: index});
                }
                if (chr === '{') {
                    if (literalStart < index) {
                        expressions.push(new LiteralExpression(uriTemplateText.substring(literalStart, index)));
                    }
                    literalStart = null;
                    braceOpenIndex = index;
                }
                continue;
            }

            if (braceOpenIndex !== null) {
                // here just { is forbidden
                if (chr === '{') {
                    throw new UriTemplateError({templateText: uriTemplateText, message: "brace already opened", position: index});
                }
                if (chr === '}') {
                    if (braceOpenIndex + 1 === index) {
                        throw new UriTemplateError({templateText: uriTemplateText, message: "empty braces", position: braceOpenIndex});
                    }
                    try {
                        expressions.push(parseExpression(uriTemplateText.substring(braceOpenIndex + 1, index)));
                    }
                    catch (error) {
                        if (error.prototype === UriTemplateError.prototype) {
                            throw new UriTemplateError({templateText: uriTemplateText, message: error.options.message, position: braceOpenIndex + error.options.position, details: error.options});
                        }
                        throw error;
                    }
                    braceOpenIndex = null;
                    literalStart = index + 1;
                }
                continue;
            }
            throw new Error('reached unreachable code');
        }
        if (braceOpenIndex !== null) {
            throw new UriTemplateError({templateText: uriTemplateText, message: "unclosed brace", position: braceOpenIndex});
        }
        if (literalStart < uriTemplateText.length) {
            expressions.push(new LiteralExpression(uriTemplateText.substr(literalStart)));
        }
        return new UriTemplate(uriTemplateText, expressions);
    }

    return parse;
}());

var VariableExpression = (function () {
    // helper function if JSON is not available
    function prettyPrint (value) {
        return (JSON && JSON.stringify) ? JSON.stringify(value) : value;
    }

    function isEmpty (value) {
        if (!isDefined(value)) {
            return true;
        }
        if (objectHelper.isString(value)) {
            return value === '';
        }
        if (objectHelper.isNumber(value) || objectHelper.isBoolean(value)) {
            return false;
        }
        if (objectHelper.isArray(value)) {
            return value.length === 0;
        }
        for (var propertyName in value) {
            if (value.hasOwnProperty(propertyName)) {
                return false;
            }
        }
        return true;
    }

    function propertyArray (object) {
        var
            result = [],
            propertyName;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                result.push({name: propertyName, value: object[propertyName]});
            }
        }
        return result;
    }

    function VariableExpression (templateText, operator, varspecs) {
        this.templateText = templateText;
        this.operator = operator;
        this.varspecs = varspecs;
    }

    VariableExpression.prototype.toString = function () {
        return this.templateText;
    };

    function expandSimpleValue(varspec, operator, value) {
        var result = '';
        value = value.toString();
        if (operator.named) {
            result += encodingHelper.encodeLiteral(varspec.varname);
            if (value === '') {
                result += operator.ifEmpty;
                return result;
            }
            result += '=';
        }
        if (varspec.maxLength !== null) {
            value = value.substr(0, varspec.maxLength);
        }
        result += operator.encode(value);
        return result;
    }

    function valueDefined (nameValue) {
        return isDefined(nameValue.value);
    }

    function expandNotExploded(varspec, operator, value) {
        var
            arr = [],
            result = '';
        if (operator.named) {
            result += encodingHelper.encodeLiteral(varspec.varname);
            if (isEmpty(value)) {
                result += operator.ifEmpty;
                return result;
            }
            result += '=';
        }
        if (objectHelper.isArray(value)) {
            arr = value;
            arr = objectHelper.filter(arr, isDefined);
            arr = objectHelper.map(arr, operator.encode);
            result += objectHelper.join(arr, ',');
        }
        else {
            arr = propertyArray(value);
            arr = objectHelper.filter(arr, valueDefined);
            arr = objectHelper.map(arr, function (nameValue) {
                return operator.encode(nameValue.name) + ',' + operator.encode(nameValue.value);
            });
            result += objectHelper.join(arr, ',');
        }
        return result;
    }

    function expandExplodedNamed (varspec, operator, value) {
        var
            isArray = objectHelper.isArray(value),
            arr = [];
        if (isArray) {
            arr = value;
            arr = objectHelper.filter(arr, isDefined);
            arr = objectHelper.map(arr, function (listElement) {
                var tmp = encodingHelper.encodeLiteral(varspec.varname);
                if (isEmpty(listElement)) {
                    tmp += operator.ifEmpty;
                }
                else {
                    tmp += '=' + operator.encode(listElement);
                }
                return tmp;
            });
        }
        else {
            arr = propertyArray(value);
            arr = objectHelper.filter(arr, valueDefined);
            arr = objectHelper.map(arr, function (nameValue) {
                var tmp = encodingHelper.encodeLiteral(nameValue.name);
                if (isEmpty(nameValue.value)) {
                    tmp += operator.ifEmpty;
                }
                else {
                    tmp += '=' + operator.encode(nameValue.value);
                }
                return tmp;
            });
        }
        return objectHelper.join(arr, operator.separator);
    }

    function expandExplodedUnnamed (operator, value) {
        var
            arr = [],
            result = '';
        if (objectHelper.isArray(value)) {
            arr = value;
            arr = objectHelper.filter(arr, isDefined);
            arr = objectHelper.map(arr, operator.encode);
            result += objectHelper.join(arr, operator.separator);
        }
        else {
            arr = propertyArray(value);
            arr = objectHelper.filter(arr, function (nameValue) {
                return isDefined(nameValue.value);
            });
            arr = objectHelper.map(arr, function (nameValue) {
                return operator.encode(nameValue.name) + '=' + operator.encode(nameValue.value);
            });
            result += objectHelper.join(arr, operator.separator);
        }
        return result;
    }


    VariableExpression.prototype.expand = function (variables) {
        var
            expanded = [],
            index,
            varspec,
            value,
            valueIsArr,
            oneExploded = false,
            operator = this.operator;

        // expand each varspec and join with operator's separator
        for (index = 0; index < this.varspecs.length; index += 1) {
            varspec = this.varspecs[index];
            value = variables[varspec.varname];
            // if (!isDefined(value)) {
            // if (variables.hasOwnProperty(varspec.name)) {
            if (value === null || value === undefined) {
                continue;
            }
            if (varspec.exploded) {
                oneExploded = true;
            }
            valueIsArr = objectHelper.isArray(value);
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                expanded.push(expandSimpleValue(varspec, operator, value));
            }
            else if (varspec.maxLength && isDefined(value)) {
                // 2.4.1 of the spec says: "Prefix modifiers are not applicable to variables that have composite values."
                throw new Error('Prefix modifiers are not applicable to variables that have composite values. You tried to expand ' + this + " with " + prettyPrint(value));
            }
            else if (!varspec.exploded) {
                if (operator.named || !isEmpty(value)) {
                    expanded.push(expandNotExploded(varspec, operator, value));
                }
            }
            else if (isDefined(value)) {
                if (operator.named) {
                    expanded.push(expandExplodedNamed(varspec, operator, value));
                }
                else {
                    expanded.push(expandExplodedUnnamed(operator, value));
                }
            }
        }

        if (expanded.length === 0) {
            return "";
        }
        else {
            return operator.first + objectHelper.join(expanded, operator.separator);
        }
    };

    return VariableExpression;
}());

var UriTemplate = (function () {
    function UriTemplate (templateText, expressions) {
        this.templateText = templateText;
        this.expressions = expressions;
        objectHelper.deepFreeze(this);
    }

    UriTemplate.prototype.toString = function () {
        return this.templateText;
    };

    UriTemplate.prototype.expand = function (variables) {
        // this.expressions.map(function (expression) {return expression.expand(variables);}).join('');
        var
            index,
            result = '';
        for (index = 0; index < this.expressions.length; index += 1) {
            result += this.expressions[index].expand(variables);
        }
        return result;
    };

    UriTemplate.parse = parse;
    UriTemplate.UriTemplateError = UriTemplateError;
    return UriTemplate;
}());

    exportCallback(UriTemplate);

}(function (UriTemplate) {
        "use strict";
        // export UriTemplate, when module is present, or pass it to window or global
        if (typeof module !== "undefined") {
            module.exports = UriTemplate;
        }
        else if (typeof define === "function") {
            define([],function() {
                return UriTemplate;
            });
        }
        else if (typeof window !== "undefined") {
            window.UriTemplate = UriTemplate;
        }
        else {
            global.UriTemplate = UriTemplate;
        }
    }
));

},{}],4:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function() {

	return function createAggregator(reporter) {
		var promises, nextKey;

		function PromiseStatus(parent) {
			if(!(this instanceof PromiseStatus)) {
				return new PromiseStatus(parent);
			}

			var stackHolder;

			try {
				throw new Error();
			} catch(e) {
				stackHolder = e;
			}

			this.key = nextKey++;
			promises[this.key] = this;

			this.parent = parent;
			this.timestamp = +(new Date());
			this.createdAt = stackHolder;
		}

		PromiseStatus.prototype = {
			observed: function () {
				if(this.key in promises) {
					delete promises[this.key];
					report();
				}

				return new PromiseStatus(this);
			},
			fulfilled: function () {
				if(this.key in promises) {
					delete promises[this.key];
					report();
				}
			},
			rejected: function (reason) {
				var stackHolder;

				if(this.key in promises) {

					try {
						throw new Error(reason && reason.message || reason);
					} catch (e) {
						stackHolder = e;
					}

					this.reason = reason;
					this.rejectedAt = stackHolder;
					report();

				}
			}
		};

		reset();

		return publish({ publish: publish });

		function publish(target) {
			target.PromiseStatus = PromiseStatus;
			target.reportUnhandled = report;
			target.resetUnhandled = reset;
			return target;
		}

		function report() {
			return reporter(promises);
		}

		function reset() {
			nextKey = 0;
			promises = {}; // Should be WeakMap
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],5:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {

	// Silly Array helpers, since when.js needs to be
	// backward compatible to ES3

	return {
		forEach: forEach,
		reduce: reduce
	};

	function forEach(array, f) {
		if(typeof array.forEach === 'function') {
			return array.forEach(f);
		}

		var i, len;

		i = -1;
		len = array.length;

		while(++i < len) {
			f(array[i], i, array);
		}
	}

	function reduce(array, initial, f) {
		if(typeof array.reduce === 'function') {
			return array.reduce(f, initial);
		}

		var i, len, result;

		i = -1;
		len = array.length;
		result = initial;

		while(++i < len) {
			result = f(result, array[i], i, array);
		}

		return result;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],6:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function(require) {

	var createAggregator, throttleReporter, simpleReporter, aggregator,
		formatter, stackFilter, excludeRx, filter, reporter, logger,
		rejectionMsg, reasonMsg, filteredFramesMsg, stackJumpMsg, attachPoint;

	createAggregator = require('./aggregator');
	throttleReporter = require('./throttledReporter');
	simpleReporter = require('./simpleReporter');
	formatter = require('./simpleFormatter');
	stackFilter = require('./stackFilter');
	logger = require('./logger/consoleGroup');

	rejectionMsg = '=== Unhandled rejection escaped at ===';
	reasonMsg = '=== Caused by reason ===';
	stackJumpMsg = '  --- new call stack ---';
	filteredFramesMsg = '  ...[filtered frames]...';

	excludeRx = /when\.js|(module|node)\.js:\d|when\/monitor\//i;
	filter = stackFilter(exclude, mergePromiseFrames);
	reporter = simpleReporter(formatter(filter, rejectionMsg, reasonMsg, stackJumpMsg), logger);

	aggregator = createAggregator(throttleReporter(200, reporter));

	attachPoint = typeof console !== 'undefined'
		? aggregator.publish(console)
		: aggregator;

	return aggregator;

	function mergePromiseFrames(/* frames */) {
		return filteredFramesMsg;
	}

	function exclude(line) {
		var rx = attachPoint.promiseStackFilter || excludeRx;
		return rx.test(line);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"./aggregator":4,"./logger/consoleGroup":7,"./simpleFormatter":8,"./simpleReporter":9,"./stackFilter":10,"./throttledReporter":11}],7:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function(require) {
	/*jshint maxcomplexity:7*/

	var array, warn, warnAll, log;

	array = require('../array');

	if(typeof console === 'undefined') {
		// No console, give up, but at least don't break
		log = consoleNotAvailable;
	} else {
		if (console.warn && console.dir) {
			// Sensible console found, use it
			warn = function (x) {
				console.warn(x);
			};
		} else {
			// IE8 has console.log and JSON, so we can make a
			// reasonably useful warn() from those.
			// Credit to webpro (https://github.com/webpro) for this idea
			if (console.log && typeof JSON != 'undefined') {
				warn = function (x) {
					console.log(typeof x === 'string' ? x : JSON.stringify(x));
				};
			}
		}

		if(!warn) {
			// Couldn't find a suitable console logging function
			// Give up and just be silent
			log = consoleNotAvailable;
		} else {
			if(console.groupCollapsed) {
				warnAll = function(msg, list) {
					console.groupCollapsed(msg);
					try {
						array.forEach(list, warn);
					} finally {
						console.groupEnd();
					}
				};
			} else {
				warnAll = function(msg, list) {
					warn(msg);
					warn(list);
				};
			}

			log = function(rejections) {
				if(rejections.length) {
					warnAll('[promises] Unhandled rejections: '
						+ rejections.length, rejections);
				} else {
					warn('[promises] All previously unhandled rejections have now been handled');
				}
			};
		}

	}

	return log;

	function consoleNotAvailable() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../array":5}],8:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function() {

	var hasStackTraces;

	try {
		throw new Error();
	} catch (e) {
		hasStackTraces = !!e.stack;
	}

	return function(filterStack, unhandledMsg, reasonMsg, stackJumpMsg) {
		return function format(rec) {
			var cause, formatted;

			formatted = {
				reason: rec.reason,
				message: rec.reason && rec.reason.toString()
			};

			if(hasStackTraces) {
				cause = rec.reason && rec.reason.stack;
				if(!cause) {
					cause = rec.rejectedAt && rec.rejectedAt.stack;
				}
				var jumps = formatStackJumps(rec);
				formatted.stack = stitch(rec.createdAt.stack, jumps, cause);
			}

			return formatted;
		};

		function formatStackJumps(rec) {
			var jumps = [];

			rec = rec.parent;
			while (rec) {
				jumps.push(formatStackJump(rec));
				rec = rec.parent;
			}

			return jumps;
		}

		function formatStackJump(rec) {
			return filterStack(toArray(rec.createdAt.stack).slice(1));
		}

		function stitch(escaped, jumps, rejected) {
			escaped = filterStack(toArray(escaped)).slice(1);
			rejected = filterStack(toArray(rejected));

			return jumps.reduce(function(stack, jump, i) {
				return i ? stack.concat(stackJumpMsg, jump) : stack.concat(jump);
			}, [unhandledMsg]).concat(reasonMsg, rejected);
		}

		function toArray(stack) {
			return stack ? stack.split('\n') : [];
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],9:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function() {

	/**
	 * Creates a simple promise monitor reporter that filters out all
	 * but unhandled rejections, formats them using the supplied
	 * formatter, and then sends the results to the supplied log
	 * functions
	 * @param {function} format formats a single promise monitor
	 *  record for output
	 * @param {function} log logging function to which all unhandled
	 *  rejections will be passed.
	 * @return reporter functions
	 */
	return function simpleReporter(format, log) {
		var len = 0;

		return function(promises) {
			promises = filterAndFormat(format, promises);

			if (len === 0 && promises.length === 0) {
				return;
			}

			try {
				log(promises);
			} finally {
				len = promises.length;
			}
		};
	};

	function filterAndFormat(format, promises) {
		var key, rec, rejected;

		rejected = [];

		for(key in promises) {
			rec = promises[key];
			if(rec.rejectedAt) {
				rejected.push(format(rec));
			}
		}

		return rejected;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],10:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function(require) {

	var array = require('./array');

	return function(isExcluded, replace) {
		return function filterStack(stack) {
			var excluded;

			if(!(stack && stack.length)) {
				return [];
			}

			excluded = [];

			return array.reduce(stack, [], function(filtered, line) {
				var match;

				match = isExcluded(line);
				if(match) {
					if(!excluded) {
						excluded = [];
					}
					excluded.push(line);
				} else {
					if(excluded) {
						if(filtered.length > 1) {
							filtered = filtered.concat(replace(excluded));
							excluded = null;
						}
					}
					filtered.push(line);
				}

				return filtered;
			});
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"./array":5}],11:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
	define(function() {
		/*global setTimeout*/

		/**
		 * Throttles the given reporter such that it will report
		 * at most once every ms milliseconds
		 * @param {number} ms minimum millis between reports
		 * @param {function} reporter reporter to be throttled
		 * @return {function} throttled version of reporter
		 */
		return function throttleReporter(ms, reporter) {
			var timeout, toReport;

			return function(promises) {
				toReport = promises;
				if(timeout == null) {
					timeout = setTimeout(function() {
						timeout = null;
						reporter(toReport);
					}, ms);
				}
			};
		};

	});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],12:[function(require,module,exports){
var process=require("__browserify_process");/** @license MIT License (c) copyright 2011-2013 original author or authors */

/**
 * A lightweight CommonJS Promises/A and when() implementation
 * when is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 * @version 2.7.1
 */
(function(define) { 'use strict';
define(function (require) {

	// Public API

	when.promise   = promise;    // Create a pending promise
	when.resolve   = resolve;    // Create a resolved promise
	when.reject    = reject;     // Create a rejected promise
	when.defer     = defer;      // Create a {promise, resolver} pair

	when.join      = join;       // Join 2 or more promises

	when.all       = all;        // Resolve a list of promises
	when.map       = map;        // Array.map() for promises
	when.reduce    = reduce;     // Array.reduce() for promises
	when.settle    = settle;     // Settle a list of promises

	when.any       = any;        // One-winner race
	when.some      = some;       // Multi-winner race

	when.isPromise = isPromiseLike;  // DEPRECATED: use isPromiseLike
	when.isPromiseLike = isPromiseLike; // Is something promise-like, aka thenable

	/**
	 * Register an observer for a promise or immediate value.
	 *
	 * @param {*} promiseOrValue
	 * @param {function?} [onFulfilled] callback to be called when promiseOrValue is
	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {function?} [onRejected] callback to be called when promiseOrValue is
	 *   rejected.
	 * @param {function?} [onProgress] callback to be called when progress updates
	 *   are issued for promiseOrValue.
	 * @returns {Promise} a new {@link Promise} that will complete with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
		// Get a trusted promise for the input promiseOrValue, and then
		// register promise handlers
		return cast(promiseOrValue).then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Creates a new promise whose fate is determined by resolver.
	 * @param {function} resolver function(resolve, reject, notify)
	 * @returns {Promise} promise whose fate is determine by resolver
	 */
	function promise(resolver) {
		return new Promise(resolver,
			monitorApi.PromiseStatus && monitorApi.PromiseStatus());
	}

	/**
	 * Trusted Promise constructor.  A Promise created from this constructor is
	 * a trusted when.js promise.  Any other duck-typed promise is considered
	 * untrusted.
	 * @constructor
	 * @returns {Promise} promise whose fate is determine by resolver
	 * @name Promise
	 */
	function Promise(resolver, status) {
		var self, value, consumers = [];

		self = this;
		this._status = status;
		this.inspect = inspect;
		this._when = _when;

		// Call the provider resolver to seal the promise's fate
		try {
			resolver(promiseResolve, promiseReject, promiseNotify);
		} catch(e) {
			promiseReject(e);
		}

		/**
		 * Returns a snapshot of this promise's current status at the instant of call
		 * @returns {{state:String}}
		 */
		function inspect() {
			return value ? value.inspect() : toPendingState();
		}

		/**
		 * Private message delivery. Queues and delivers messages to
		 * the promise's ultimate fulfillment value or rejection reason.
		 * @private
		 */
		function _when(resolve, notify, onFulfilled, onRejected, onProgress) {
			consumers ? consumers.push(deliver) : enqueue(function() { deliver(value); });

			function deliver(p) {
				p._when(resolve, notify, onFulfilled, onRejected, onProgress);
			}
		}

		/**
		 * Transition from pre-resolution state to post-resolution state, notifying
		 * all listeners of the ultimate fulfillment or rejection
		 * @param {*} val resolution value
		 */
		function promiseResolve(val) {
			if(!consumers) {
				return;
			}

			var queue = consumers;
			consumers = undef;

			enqueue(function () {
				value = coerce(self, val);
				if(status) {
					updateStatus(value, status);
				}
				runHandlers(queue, value);
			});
		}

		/**
		 * Reject this promise with the supplied reason, which will be used verbatim.
		 * @param {*} reason reason for the rejection
		 */
		function promiseReject(reason) {
			promiseResolve(new RejectedPromise(reason));
		}

		/**
		 * Issue a progress event, notifying all progress listeners
		 * @param {*} update progress event payload to pass to all listeners
		 */
		function promiseNotify(update) {
			if(consumers) {
				var queue = consumers;
				enqueue(function () {
					runHandlers(queue, new ProgressingPromise(update));
				});
			}
		}
	}

	promisePrototype = Promise.prototype;

	/**
	 * Register handlers for this promise.
	 * @param [onFulfilled] {Function} fulfillment handler
	 * @param [onRejected] {Function} rejection handler
	 * @param [onProgress] {Function} progress handler
	 * @return {Promise} new Promise
	 */
	promisePrototype.then = function(onFulfilled, onRejected, onProgress) {
		var self = this;

		return new Promise(function(resolve, reject, notify) {
			self._when(resolve, notify, onFulfilled, onRejected, onProgress);
		}, this._status && this._status.observed());
	};

	/**
	 * Register a rejection handler.  Shortcut for .then(undefined, onRejected)
	 * @param {function?} onRejected
	 * @return {Promise}
	 */
	promisePrototype['catch'] = promisePrototype.otherwise = function(onRejected) {
		return this.then(undef, onRejected);
	};

	/**
	 * Ensures that onFulfilledOrRejected will be called regardless of whether
	 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
	 * receive the promises' value or reason.  Any returned value will be disregarded.
	 * onFulfilledOrRejected may throw or return a rejected promise to signal
	 * an additional error.
	 * @param {function} onFulfilledOrRejected handler to be called regardless of
	 *  fulfillment or rejection
	 * @returns {Promise}
	 */
	promisePrototype['finally'] = promisePrototype.ensure = function(onFulfilledOrRejected) {
		return typeof onFulfilledOrRejected === 'function'
			? this.then(injectHandler, injectHandler)['yield'](this)
			: this;

		function injectHandler() {
			return resolve(onFulfilledOrRejected());
		}
	};

	/**
	 * Terminate a promise chain by handling the ultimate fulfillment value or
	 * rejection reason, and assuming responsibility for all errors.  if an
	 * error propagates out of handleResult or handleFatalError, it will be
	 * rethrown to the host, resulting in a loud stack track on most platforms
	 * and a crash on some.
	 * @param {function?} handleResult
	 * @param {function?} handleError
	 * @returns {undefined}
	 */
	promisePrototype.done = function(handleResult, handleError) {
		this.then(handleResult, handleError)['catch'](crash);
	};

	/**
	 * Shortcut for .then(function() { return value; })
	 * @param  {*} value
	 * @return {Promise} a promise that:
	 *  - is fulfilled if value is not a promise, or
	 *  - if value is a promise, will fulfill with its value, or reject
	 *    with its reason.
	 */
	promisePrototype['yield'] = function(value) {
		return this.then(function() {
			return value;
		});
	};

	/**
	 * Runs a side effect when this promise fulfills, without changing the
	 * fulfillment value.
	 * @param {function} onFulfilledSideEffect
	 * @returns {Promise}
	 */
	promisePrototype.tap = function(onFulfilledSideEffect) {
		return this.then(onFulfilledSideEffect)['yield'](this);
	};

	/**
	 * Assumes that this promise will fulfill with an array, and arranges
	 * for the onFulfilled to be called with the array as its argument list
	 * i.e. onFulfilled.apply(undefined, array).
	 * @param {function} onFulfilled function to receive spread arguments
	 * @return {Promise}
	 */
	promisePrototype.spread = function(onFulfilled) {
		return this.then(function(array) {
			// array may contain promises, so resolve its contents.
			return all(array, function(array) {
				return onFulfilled.apply(undef, array);
			});
		});
	};

	/**
	 * Shortcut for .then(onFulfilledOrRejected, onFulfilledOrRejected)
	 * @deprecated
	 */
	promisePrototype.always = function(onFulfilledOrRejected, onProgress) {
		return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
	};

	/**
	 * Casts x to a trusted promise. If x is already a trusted promise, it is
	 * returned, otherwise a new trusted Promise which follows x is returned.
	 * @param {*} x
	 * @returns {Promise}
	 */
	function cast(x) {
		return x instanceof Promise ? x : resolve(x);
	}

	/**
	 * Returns a resolved promise. The returned promise will be
	 *  - fulfilled with promiseOrValue if it is a value, or
	 *  - if promiseOrValue is a promise
	 *    - fulfilled with promiseOrValue's value after it is fulfilled
	 *    - rejected with promiseOrValue's reason after it is rejected
	 * In contract to cast(x), this always creates a new Promise
	 * @param  {*} value
	 * @return {Promise}
	 */
	function resolve(value) {
		return promise(function(resolve) {
			resolve(value);
		});
	}

	/**
	 * Returns a rejected promise for the supplied promiseOrValue.  The returned
	 * promise will be rejected with:
	 * - promiseOrValue, if it is a value, or
	 * - if promiseOrValue is a promise
	 *   - promiseOrValue's value after it is fulfilled
	 *   - promiseOrValue's reason after it is rejected
	 * @param {*} promiseOrValue the rejected value of the returned {@link Promise}
	 * @return {Promise} rejected {@link Promise}
	 */
	function reject(promiseOrValue) {
		return when(promiseOrValue, function(e) {
			return new RejectedPromise(e);
		});
	}

	/**
	 * Creates a {promise, resolver} pair, either or both of which
	 * may be given out safely to consumers.
	 * The resolver has resolve, reject, and progress.  The promise
	 * has then plus extended promise API.
	 *
	 * @return {{
	 * promise: Promise,
	 * resolve: function:Promise,
	 * reject: function:Promise,
	 * notify: function:Promise
	 * resolver: {
	 *	resolve: function:Promise,
	 *	reject: function:Promise,
	 *	notify: function:Promise
	 * }}}
	 */
	function defer() {
		var deferred, pending, resolved;

		// Optimize object shape
		deferred = {
			promise: undef, resolve: undef, reject: undef, notify: undef,
			resolver: { resolve: undef, reject: undef, notify: undef }
		};

		deferred.promise = pending = promise(makeDeferred);

		return deferred;

		function makeDeferred(resolvePending, rejectPending, notifyPending) {
			deferred.resolve = deferred.resolver.resolve = function(value) {
				if(resolved) {
					return resolve(value);
				}
				resolved = true;
				resolvePending(value);
				return pending;
			};

			deferred.reject  = deferred.resolver.reject  = function(reason) {
				if(resolved) {
					return resolve(new RejectedPromise(reason));
				}
				resolved = true;
				rejectPending(reason);
				return pending;
			};

			deferred.notify  = deferred.resolver.notify  = function(update) {
				notifyPending(update);
				return update;
			};
		}
	}

	/**
	 * Run a queue of functions as quickly as possible, passing
	 * value to each.
	 */
	function runHandlers(queue, value) {
		for (var i = 0; i < queue.length; i++) {
			queue[i](value);
		}
	}

	/**
	 * Coerces x to a trusted Promise
	 * @param {*} x thing to coerce
	 * @returns {*} Guaranteed to return a trusted Promise.  If x
	 *   is trusted, returns x, otherwise, returns a new, trusted, already-resolved
	 *   Promise whose resolution value is:
	 *   * the resolution value of x if it's a foreign promise, or
	 *   * x if it's a value
	 */
	function coerce(self, x) {
		if (x === self) {
			return new RejectedPromise(new TypeError());
		}

		if (x instanceof Promise) {
			return x;
		}

		try {
			var untrustedThen = x === Object(x) && x.then;

			return typeof untrustedThen === 'function'
				? assimilate(untrustedThen, x)
				: new FulfilledPromise(x);
		} catch(e) {
			return new RejectedPromise(e);
		}
	}

	/**
	 * Safely assimilates a foreign thenable by wrapping it in a trusted promise
	 * @param {function} untrustedThen x's then() method
	 * @param {object|function} x thenable
	 * @returns {Promise}
	 */
	function assimilate(untrustedThen, x) {
		return promise(function (resolve, reject) {
			fcall(untrustedThen, x, resolve, reject);
		});
	}

	makePromisePrototype = Object.create ||
		function(o) {
			function PromisePrototype() {}
			PromisePrototype.prototype = o;
			return new PromisePrototype();
		};

	/**
	 * Creates a fulfilled, local promise as a proxy for a value
	 * NOTE: must never be exposed
	 * @private
	 * @param {*} value fulfillment value
	 * @returns {Promise}
	 */
	function FulfilledPromise(value) {
		this.value = value;
	}

	FulfilledPromise.prototype = makePromisePrototype(promisePrototype);

	FulfilledPromise.prototype.inspect = function() {
		return toFulfilledState(this.value);
	};

	FulfilledPromise.prototype._when = function(resolve, _, onFulfilled) {
		try {
			resolve(typeof onFulfilled === 'function' ? onFulfilled(this.value) : this.value);
		} catch(e) {
			resolve(new RejectedPromise(e));
		}
	};

	/**
	 * Creates a rejected, local promise as a proxy for a value
	 * NOTE: must never be exposed
	 * @private
	 * @param {*} reason rejection reason
	 * @returns {Promise}
	 */
	function RejectedPromise(reason) {
		this.value = reason;
	}

	RejectedPromise.prototype = makePromisePrototype(promisePrototype);

	RejectedPromise.prototype.inspect = function() {
		return toRejectedState(this.value);
	};

	RejectedPromise.prototype._when = function(resolve, _, __, onRejected) {
		try {
			resolve(typeof onRejected === 'function' ? onRejected(this.value) : this);
		} catch(e) {
			resolve(new RejectedPromise(e));
		}
	};

	/**
	 * Create a progress promise with the supplied update.
	 * @private
	 * @param {*} value progress update value
	 * @return {Promise} progress promise
	 */
	function ProgressingPromise(value) {
		this.value = value;
	}

	ProgressingPromise.prototype = makePromisePrototype(promisePrototype);

	ProgressingPromise.prototype._when = function(_, notify, f, r, u) {
		try {
			notify(typeof u === 'function' ? u(this.value) : this.value);
		} catch(e) {
			notify(e);
		}
	};

	/**
	 * Update a PromiseStatus monitor object with the outcome
	 * of the supplied value promise.
	 * @param {Promise} value
	 * @param {PromiseStatus} status
	 */
	function updateStatus(value, status) {
		value.then(statusFulfilled, statusRejected);

		function statusFulfilled() { status.fulfilled(); }
		function statusRejected(r) { status.rejected(r); }
	}

	/**
	 * Determines if x is promise-like, i.e. a thenable object
	 * NOTE: Will return true for *any thenable object*, and isn't truly
	 * safe, since it may attempt to access the `then` property of x (i.e.
	 *  clever/malicious getters may do weird things)
	 * @param {*} x anything
	 * @returns {boolean} true if x is promise-like
	 */
	function isPromiseLike(x) {
		return x && typeof x.then === 'function';
	}

	/**
	 * Initiates a competitive race, returning a promise that will resolve when
	 * howMany of the supplied promisesOrValues have resolved, or will reject when
	 * it becomes impossible for howMany to resolve, for example, when
	 * (promisesOrValues.length - howMany) + 1 input promises reject.
	 *
	 * @param {Array} promisesOrValues array of anything, may contain a mix
	 *      of promises and values
	 * @param howMany {number} number of promisesOrValues to resolve
	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
	 * @returns {Promise} promise that will resolve to an array of howMany values that
	 *  resolved first, or will reject with an array of
	 *  (promisesOrValues.length - howMany) + 1 rejection reasons.
	 */
	function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {

		return when(promisesOrValues, function(promisesOrValues) {

			return promise(resolveSome).then(onFulfilled, onRejected, onProgress);

			function resolveSome(resolve, reject, notify) {
				var toResolve, toReject, values, reasons, fulfillOne, rejectOne, len, i;

				len = promisesOrValues.length >>> 0;

				toResolve = Math.max(0, Math.min(howMany, len));
				values = [];

				toReject = (len - toResolve) + 1;
				reasons = [];

				// No items in the input, resolve immediately
				if (!toResolve) {
					resolve(values);

				} else {
					rejectOne = function(reason) {
						reasons.push(reason);
						if(!--toReject) {
							fulfillOne = rejectOne = identity;
							reject(reasons);
						}
					};

					fulfillOne = function(val) {
						// This orders the values based on promise resolution order
						values.push(val);
						if (!--toResolve) {
							fulfillOne = rejectOne = identity;
							resolve(values);
						}
					};

					for(i = 0; i < len; ++i) {
						if(i in promisesOrValues) {
							when(promisesOrValues[i], fulfiller, rejecter, notify);
						}
					}
				}

				function rejecter(reason) {
					rejectOne(reason);
				}

				function fulfiller(val) {
					fulfillOne(val);
				}
			}
		});
	}

	/**
	 * Initiates a competitive race, returning a promise that will resolve when
	 * any one of the supplied promisesOrValues has resolved or will reject when
	 * *all* promisesOrValues have rejected.
	 *
	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
	 * @returns {Promise} promise that will resolve to the value that resolved first, or
	 * will reject with an array of all rejected inputs.
	 */
	function any(promisesOrValues, onFulfilled, onRejected, onProgress) {

		function unwrapSingleResult(val) {
			return onFulfilled ? onFulfilled(val[0]) : val[0];
		}

		return some(promisesOrValues, 1, unwrapSingleResult, onRejected, onProgress);
	}

	/**
	 * Return a promise that will resolve only once all the supplied promisesOrValues
	 * have resolved. The resolution value of the returned promise will be an array
	 * containing the resolution values of each of the promisesOrValues.
	 * @memberOf when
	 *
	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
	 * @returns {Promise}
	 */
	function all(promisesOrValues, onFulfilled, onRejected, onProgress) {
		return _map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Joins multiple promises into a single returned promise.
	 * @return {Promise} a promise that will fulfill when *all* the input promises
	 * have fulfilled, or will reject when *any one* of the input promises rejects.
	 */
	function join(/* ...promises */) {
		return _map(arguments, identity);
	}

	/**
	 * Settles all input promises such that they are guaranteed not to
	 * be pending once the returned promise fulfills. The returned promise
	 * will always fulfill, except in the case where `array` is a promise
	 * that rejects.
	 * @param {Array|Promise} array or promise for array of promises to settle
	 * @returns {Promise} promise that always fulfills with an array of
	 *  outcome snapshots for each input promise.
	 */
	function settle(array) {
		return _map(array, toFulfilledState, toRejectedState);
	}

	/**
	 * Promise-aware array map function, similar to `Array.prototype.map()`,
	 * but input array may contain promises or values.
	 * @param {Array|Promise} array array of anything, may contain promises and values
	 * @param {function} mapFunc map function which may return a promise or value
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function map(array, mapFunc) {
		return _map(array, mapFunc);
	}

	/**
	 * Internal map that allows a fallback to handle rejections
	 * @param {Array|Promise} array array of anything, may contain promises and values
	 * @param {function} mapFunc map function which may return a promise or value
	 * @param {function?} fallback function to handle rejected promises
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function _map(array, mapFunc, fallback) {
		return when(array, function(array) {

			return new Promise(resolveMap);

			function resolveMap(resolve, reject, notify) {
				var results, len, toResolve, i;

				// Since we know the resulting length, we can preallocate the results
				// array to avoid array expansions.
				toResolve = len = array.length >>> 0;
				results = [];

				if(!toResolve) {
					resolve(results);
					return;
				}

				// Since mapFunc may be async, get all invocations of it into flight
				for(i = 0; i < len; i++) {
					if(i in array) {
						resolveOne(array[i], i);
					} else {
						--toResolve;
					}
				}

				function resolveOne(item, i) {
					when(item, mapFunc, fallback).then(function(mapped) {
						results[i] = mapped;

						if(!--toResolve) {
							resolve(results);
						}
					}, reject, notify);
				}
			}
		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 *
	 * @param {Array|Promise} promise array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function} reduceFunc reduce function reduce(currentValue, nextValue, index, total),
	 *      where total is the total number of items being reduced, and will be the same
	 *      in each call to reduceFunc.
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduce(promise, reduceFunc /*, initialValue */) {
		var args = fcall(slice, arguments, 1);

		return when(promise, function(array) {
			var total;

			total = array.length;

			// Wrap the supplied reduceFunc with one that handles promises and then
			// delegates to the supplied.
			args[0] = function (current, val, i) {
				return when(current, function (c) {
					return when(val, function (value) {
						return reduceFunc(c, value, i, total);
					});
				});
			};

			return reduceArray.apply(array, args);
		});
	}

	// Snapshot states

	/**
	 * Creates a fulfilled state snapshot
	 * @private
	 * @param {*} x any value
	 * @returns {{state:'fulfilled',value:*}}
	 */
	function toFulfilledState(x) {
		return { state: 'fulfilled', value: x };
	}

	/**
	 * Creates a rejected state snapshot
	 * @private
	 * @param {*} x any reason
	 * @returns {{state:'rejected',reason:*}}
	 */
	function toRejectedState(x) {
		return { state: 'rejected', reason: x };
	}

	/**
	 * Creates a pending state snapshot
	 * @private
	 * @returns {{state:'pending'}}
	 */
	function toPendingState() {
		return { state: 'pending' };
	}

	//
	// Internals, utilities, etc.
	//

	var promisePrototype, makePromisePrototype, reduceArray, slice, fcall, nextTick, handlerQueue,
		funcProto, call, arrayProto, monitorApi,
		capturedSetTimeout, cjsRequire, MutationObs, undef;

	cjsRequire = require;

	//
	// Shared handler queue processing
	//
	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for
	// next-tick conflation.

	handlerQueue = [];

	/**
	 * Enqueue a task. If the queue is not currently scheduled to be
	 * drained, schedule it.
	 * @param {function} task
	 */
	function enqueue(task) {
		if(handlerQueue.push(task) === 1) {
			nextTick(drainQueue);
		}
	}

	/**
	 * Drain the handler queue entirely, being careful to allow the
	 * queue to be extended while it is being processed, and to continue
	 * processing until it is truly empty.
	 */
	function drainQueue() {
		runHandlers(handlerQueue);
		handlerQueue = [];
	}

	// Allow attaching the monitor to when() if env has no console
	monitorApi = typeof console !== 'undefined' ? console : when;

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// vertx and finally fall back to setTimeout
	/*global process,document,setTimeout,MutationObserver,WebKitMutationObserver*/
	if (typeof process === 'object' && process.nextTick) {
		nextTick = process.nextTick;
	} else if(MutationObs =
		(typeof MutationObserver === 'function' && MutationObserver) ||
			(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver)) {
		nextTick = (function(document, MutationObserver, drainQueue) {
			var el = document.createElement('div');
			new MutationObserver(drainQueue).observe(el, { attributes: true });

			return function() {
				el.setAttribute('x', 'x');
			};
		}(document, MutationObs, drainQueue));
	} else {
		try {
			// vert.x 1.x || 2.x
			nextTick = cjsRequire('vertx').runOnLoop || cjsRequire('vertx').runOnContext;
		} catch(ignore) {
			// capture setTimeout to avoid being caught by fake timers
			// used in time based tests
			capturedSetTimeout = setTimeout;
			nextTick = function(t) { capturedSetTimeout(t, 0); };
		}
	}

	//
	// Capture/polyfill function and array utils
	//

	// Safe function calls
	funcProto = Function.prototype;
	call = funcProto.call;
	fcall = funcProto.bind
		? call.bind(call)
		: function(f, context) {
			return f.apply(context, slice.call(arguments, 2));
		};

	// Safe array ops
	arrayProto = [];
	slice = arrayProto.slice;

	// ES5 reduce implementation if native not available
	// See: http://es5.github.com/#x15.4.4.21 as there are many
	// specifics and edge cases.  ES5 dictates that reduce.length === 1
	// This implementation deviates from ES5 spec in the following ways:
	// 1. It does not check if reduceFunc is a Callable
	reduceArray = arrayProto.reduce ||
		function(reduceFunc /*, initialValue */) {
			/*jshint maxcomplexity: 7*/
			var arr, args, reduced, len, i;

			i = 0;
			arr = Object(this);
			len = arr.length >>> 0;
			args = arguments;

			// If no initialValue, use first item of array (we know length !== 0 here)
			// and adjust i to start at second item
			if(args.length <= 1) {
				// Skip to the first real element in the array
				for(;;) {
					if(i in arr) {
						reduced = arr[i++];
						break;
					}

					// If we reached the end of the array without finding any real
					// elements, it's a TypeError
					if(++i >= len) {
						throw new TypeError();
					}
				}
			} else {
				// If initialValue provided, use it
				reduced = args[1];
			}

			// Do the actual reduce
			for(;i < len; ++i) {
				if(i in arr) {
					reduced = reduceFunc(reduced, arr[i], i, arr);
				}
			}

			return reduced;
		};

	function identity(x) {
		return x;
	}

	function crash(fatalError) {
		if(typeof monitorApi.reportUnhandled === 'function') {
			monitorApi.reportUnhandled();
		} else {
			enqueue(function() {
				throw fatalError;
			});
		}

		throw fatalError;
	}

	return when;
});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"__browserify_process":1}],13:[function(require,module,exports){
// BEGIN OBJECT

var utils = require('./utils');
var ApiObject = require('./object');

    function convertItem(raw) {
        return ApiObject.create(this.itemType, raw, this.api);
    }

    var ApiCollectionConstructor = function (type, data, api, itemType) {
        var self = this;
        ApiObject.apply(this, arguments);
        this.itemType = itemType;
        if (!data) data = {};
        if (!data.items) this.prop("items", data.items = []);
        if (data.items.length > 0) this.add(data.items, true);
        this.on('sync', function (raw) {
            if (raw && raw.items) {
                self.removeAll();
                self.add(raw.items);
            }
        });
    };

    ApiCollectionConstructor.prototype = utils.extend(new ApiObject(), {
        isCollection: true,
        constructor: ApiCollectionConstructor,
        add: function (newItems, /*private*/ noUpdate) {
            if (utils.getType(newItems) !== "Array") newItems = [newItems];
            Array.prototype.push.apply(this, utils.map(newItems, convertItem, this));
            if (!noUpdate) {
                var rawItems = this.prop("items");
                this.prop("items", rawItems.concat(newItems));
            }
        },
        remove: function (indexOrItem) {
            var index = indexOrItem;
            if (typeof indexOrItem !== "number") {
                index = utils.indexOf(this, indexOrItem);
            }
            Array.prototype.splice.call(this, index, 1);
        },
        replace: function(newItems, noUpdate) {
            Array.prototype.splice.apply(this, [0, this.length].concat(utils.map(newItems, convertItem, this)));
            if (!noUpdate) {
                this.prop("items", newItems);
            }
        },
        removeAll: function(noUpdate) {
            Array.prototype.splice.call(this, 0, this.length);
            if (!noUpdate) {
                this.prop("items", []);
            }
        },
        getIndex: function (newIndex) {
            var index = this.currentIndex;
            if (!index && index !== 0) index = this.prop("startIndex");
            if (!index && index !== 0) index = 0;
            return index;
        },
        setIndex: function(newIndex, req) {
            var me = this;
            var p = this.get(utils.extend(req, { startIndex: newIndex}));
            p.then(function () {
                me.currentIndex = newIndex;
            });
            return p;
        },
        firstPage: function(req) {
            var currentIndex = this.getIndex();
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.setIndex(0, req);
        },
        prevPage: function (req) {
            var currentIndex = this.getIndex(),
                pageSize = this.prop("pageSize"),
                newIndex = Math.max(currentIndex - pageSize, 0);
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.setIndex(newIndex, req);
        },
        nextPage: function (req) {
            var currentIndex = this.getIndex(),
                pageSize = this.prop("pageSize"),
                newIndex = currentIndex + pageSize;
            if (!(newIndex < this.prop("totalCount"))) throw "This " + this.type + " collection is already at its last page and has no next page.";
            return this.setIndex(newIndex, req);
        },
        lastPage: function (req) {
            var totalCount = this.prop("totalCount"),
                pageSize = this.prop("pageSize"),
                newIndex = totalCount - pageSize;
            if (newIndex <= 0) throw "This " + this.type + " collection has only one page.";
            return this.setIndex(newIndex, req);
        }
    });

    ApiCollectionConstructor.types = {
        locations: require('./types/locations')
    };
    ApiCollectionConstructor.hydratedTypes = {};

    ApiCollectionConstructor.getHydratedType = ApiObject.getHydratedType;

    ApiCollectionConstructor.create = function (type, data, api, itemType) {
        return new (type in this.types ? this.types[type] : this)(type, data, api, itemType);
    };

    ApiCollectionConstructor.create = function (typeName, rawJSON, api, itemType) {
        var ApiCollectionType = this.getHydratedType(typeName);

        return new ApiCollectionType(typeName, rawJSON, api, itemType);
    };

    module.exports = ApiCollectionConstructor;

// END OBJECT

/***********/
},{"./object":22,"./types/locations":28,"./utils":35}],14:[function(require,module,exports){
module.exports = {
    DEFAULT_WISHLIST_NAME: 'my_wishlist',
    PAYMENT_STATUSES: {
        NEW: "New"
    },
    PAYMENT_ACTIONS: {
        VOID: "VoidPayment"
    },
    ORDER_STATUSES: {
        ABANDONED: "Abandoned",
        ACCEPTED: "Accepted",
        CANCELLED: "Cancelled",
        COMPLETED: "Completed",
        CREATED: "Created",
        PENDING_REVIEW: "PendingReview",
        PROCESSING: "Processing",
        SUBMITTED: "Submitted",
        VALIDATED: "Validated"
    },
    ORDER_ACTIONS: {
        CREATE_ORDER: "CreateOrder",
        SUBMIT_ORDER: "SubmitOrder",
        ACCEPT_ORDER: "AcceptOrder",
        VALIDATE_ORDER: "ValidateOrder",
        SET_ORDER_AS_PROCESSING: "SetOrderAsProcessing",
        COMPLETE_ORDER: "CompleteOrder",
        CANCEL_ORDER: "CancelOrder",
        REOPEN_ORDER: "ReopenOrder"
    },
    FULFILLMENT_METHODS: {
        SHIP: "Ship",
        PICKUP: "Pickup"
    }
};

},{}],15:[function(require,module,exports){
// BEGIN CONTEXT
/**
 * @class
 * @classdesc The context object helps you configure the SDK to connect to a particular Mozu site. Supply it with tenant, site, mastercatalog, currency code, locale code, app claims, and user claims, and  it will produce for you an ApiInterface object.
 */

var ApiInterface = require('./interface');
var ApiReference = require('./reference');
var utils = require('./utils');

/**
 * @private
 */
var ApiContextConstructor = function(conf) {
    utils.extend(this, conf);
    if (ApiContextConstructor.__debug__ === true) {
        ApiContextConstructor.__debug__ = require('when/monitor/console');
    }
},
    mutableAccessors = ['app-claims', 'user-claims', 'callchain', 'currency', 'locale'], //, 'bypass-cache'],
    immutableAccessors = ['tenant', 'site', 'master-catalog'],
    immutableAccessorLength = immutableAccessors.length,
    allAccessors = mutableAccessors.concat(immutableAccessors),
    allAccessorsLength = allAccessors.length,
    j;

var setImmutableAccessor = function(propName) {
    ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function(val) {
        if (val === undefined) return this[propName];
        var newConf = this.asObject();
        newConf[propName] = val;
        return new ApiContextConstructor(newConf);
    };
};

var setMutableAccessor = function(propName) {
    ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function(val) {
        if (val === undefined) return this[propName];
        this[propName] = val;
        return this;
    };
};

ApiContextConstructor.prototype = {
    constructor: ApiContextConstructor,

    /**
     * Gets or creates the `ApiInterface` for this context that will do all the real work.
     * Call this method only when you've built a complete context including tenant, site, master catalog,
     * locale, currency code, app claims, and user claims. Assign its return value to a local variable.
     * You'll use this interface object to create your `ApiObject`s and do API requests!
     *
     * @public
     * @memberof ApiContext#
     * @returns {ApiInterface} The single `ApiInterface` for this context.
     * @throws {ReferenceError} if the context is not yet complete.
     */
    api: function() {
        return this._apiInstance || (this._apiInstance = new ApiInterface(this));
    },
    Store: function(conf) {
        return new ApiContextConstructor(conf);
    },
    asObject: function(prefix) {
        var obj = {};
        prefix = prefix || '';
        for (var i = 0; i < allAccessorsLength; i++) {
            obj[prefix + allAccessors[i]] = this[allAccessors[i]];
        }
        return obj;
    },
    setServiceUrls: function(urls) {
        ApiReference.urls = urls;
    },
    getServiceUrls: function() {
        return utils.extend({}, ApiReference.urls);
    },
    currency: 'usd',
    locale: 'en-US'
};

for (j = 0; j < immutableAccessors.length; j++) setImmutableAccessor(immutableAccessors[j]);
for (j = 0; j < mutableAccessors.length; j++) setMutableAccessor(mutableAccessors[j]);

module.exports = ApiContextConstructor;

// END CONTEXT

/********/
},{"./interface":20,"./reference":23,"./utils":35,"when/monitor/console":6}],16:[function(require,module,exports){
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
},{"./utils":35}],17:[function(require,module,exports){
// BEGIN IFRAMEXHR
var utils = require('./utils');
var IframeXHR = (function (window, document, undefined) {

    var hasPostMessage = window.postMessage && navigator.userAgent.indexOf("Opera") === -1,
        firefoxVersion = (function () {
            var ua = navigator.userAgent,
                re = /Firefox\/(\d+)/i,
                match = ua.match(re),
                versionStr = parseInt(match ? (match[1] || false) : false),
                version = isNaN(versionStr) ? false : versionStr;

            return version;
        }()),
        cacheBust = 1,
        hashRE = /^#?\d+&/,
        originRE = /^https?:\/\/[^/]+/i,
        validateOrigin = function (ixhr, origin) {
            return ixhr.frameOrigin === origin.toLowerCase().match(originRE)[0];
        },
        messageDelimiter = '|||||',
        messageMethods = hasPostMessage ? {
            listen: function () {
                var self = this;
                this.messageListener = function (e) {
                    if (!e) e = window.event;
                    if (!validateOrigin(self, e.origin)) throw new Error("Origin " + e.origin + " does not match required origin " + self.frameOrigin);
                    if (e.data === "ready") return self.postMessage();
                    self.update(e.data);
                };
                window.addEventListener('message', this.messageListener, false);
            },
            postMessage: function () {
                return this.getFrameWindow().postMessage(this.getMessage(), this.frameOrigin);
            },
            detachListeners: function () {
                window.removeEventListener('message', this.messageListener, false);
            }
        } : {
            listen: function () {
                var self = this;
                this.interval = setInterval(function () {
                    var data;
                    self.hash = document.location.hash;
                    data = self.hash.replace(hashRE, '');
                    if (self.hash !== self.lastHash) {
                        if (data === "ready") return self.postMessage();

                        if (hashRE.test(self.hash)) {
                            self.lastHash = self.hash;
                            self.update(data);
                        }
                    }
                }, 100);
            },
            postMessage: function (message) {
                this.getFrameWindow().location = this.frameUrl.replace(/#.*$/, '') + '#' + (+new Date) + (cacheBust++) + '&' + this.getMessage();
            },
            detachListeners: function () {
                clearInterval(this.interval);
                this.interval = null;
            }
        };

    var IframeXMLHttpRequest = function (frameUrl) {
        var frameMatch = frameUrl.match(originRE);
        if (!frameMatch || !frameMatch[0]) throw new Error(frameUrl + " does not seem to have a valid origin.");
        this.frameOrigin = frameMatch[0].toLowerCase();
        this.frameUrl = frameUrl + "?&parenturl=" + encodeURIComponent(location.href) + "&parentdomain=" + encodeURIComponent(location.protocol + '//' + location.host) + "&messagedelimiter=" + encodeURIComponent(messageDelimiter);
        this.headers = {};
    };

    utils.extend(IframeXMLHttpRequest.prototype, messageMethods, {
        readyState: 0,
        status: 0,
        open: function (method, url) {
            this.readyState = 1;
            this.method = method;
            this.url = url;
        },
        send: function (data) {
            this.messageBody = data;
            this.listen();
            this.createIframe();
        },
        createIframe: function () {
            this.iframe = document.createElement('iframe');
            this.iframe.style.position = 'absolute';
            this.iframe.style.left = '-9999px';
            this.iframe.style.width = '1px';
            this.iframe.style.height = '1px';
            this.iframe.src = this.frameUrl;
            document.body.appendChild(this.iframe);
        },
        setRequestHeader: function (key, value) {
            this.headers[key] = value;
        },
        getMessage: function () {
            var msg = [this.url, this.messageBody, this.method];
            for (var header in this.headers) {
                msg.push(header, this.headers[header]);
            }
            return msg.join(messageDelimiter);
        },
        onreadystatechange: function () { },
        getFrameWindow: function () {
            return this.iframe.contentWindow || this.iframe;
        },
        cleanup: function () {
            var self = this;
            if (!self.destroyed) setTimeout(function () {
                self.detachListeners();
                self.iframe.parentNode && self.iframe.parentNode.removeChild(self.iframe);
            }, 250);
            self.destroyed = true;
        },
        update: function(data) {
            data = data.split(messageDelimiter);
            this.readyState = parseInt(data[0]) || 0;
            this.status = parseInt(data[1]) || 0;
            this.responseText = data[2];
            this.onreadystatechange();
            if (this.readyState === 4) this.cleanup();
        },
        abort: function () {
            this.status = 0;
            this.readyState = 0;
            this.cleanup();
        }
    });

    return IframeXMLHttpRequest;

}(this, this.document));
// END IFRAMEXHR
},{"./utils":35}],18:[function(require,module,exports){
// BEGIN INIT
var ApiContext = require('./context');
var initialGlobalContext = new ApiContext();
module.exports = initialGlobalContext;
// END INIT
},{"./context":15}],19:[function(require,module,exports){
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
},{"./collection":13,"./context":15,"./init":18,"./interface":20,"./object":22,"./reference":23,"./utils":35}],20:[function(require,module,exports){
/**
 * @external Promise
 * @see {@link https://github.com/cujojs/when/blob/master/docs/api.md#promise WhenJS/Promise}
 */

/**
 * Attach handlers to and transform the promise.
 * @function external:Promise#then
 * @returns external:Promise#
 */

// BEGIN INTERFACE
/**
 * @class
 * @classdesc The interface object makes requests to the API and returns API object. You can use it to make raw requests using the ApiInterface#request method, but you're more likely to use the ApiInterface#action method to create a external:Promise# that returns an ApiObject#.
 */
var utils = require('./utils');
var ApiReference = require('./reference');
var ApiObject = require('./object');

var errorMessage = "No {0} was specified. Run Mozu.Tenant(tenantId).MasterCatalog(masterCatalogId).Site(siteId).",
    requiredContextValues = ['Tenant', 'MasterCatalog', 'Site'];
var ApiInterfaceConstructor = function(context) {
    for (var i = 0, len = requiredContextValues.length; i < len; i++) {
        if (context[requiredContextValues[i]]() === undefined) throw new ReferenceError(errorMessage.split('{0}').join(requiredContextValues[i]));
    }
    this.context = context;
};

ApiInterfaceConstructor.prototype = {
    constructor: ApiInterfaceConstructor,
    /**
     * @public
     * @memberof ApiInterface#
     * @returns {external:Promise#}
     */
    request: function(method, requestConf, conf) {
        var me = this,
            url = typeof requestConf === "string" ? requestConf : requestConf.url;
        if (requestConf.verb)
            method = requestConf.verb;

        var deferred = me.defer();

        var data;
        if (requestConf.overridePostData) {
            data = requestConf.overridePostData;
        } else if (conf && !requestConf.noBody) {
            data = conf.data || conf;
        }

        var contextHeaders = this.context.asObject("x-vol-");

        var xhr = utils.request(method, url, contextHeaders, data, function(rawJSON) {
            // update context with response headers
            me.fire('success', rawJSON, xhr, requestConf);
            deferred.resolve(rawJSON, xhr);
        }, function(error) {
            deferred.reject(error, xhr, url);
        }, requestConf.iframeTransportUrl);

        var cancelled = false,
            canceller = function() {
                cancelled = true;
                xhr.abort();
                deferred.reject("Request cancelled.")
            };

        this.fire('request', xhr, canceller, deferred.promise, requestConf, conf);

        deferred.promise.otherwise(function(error) {
            var res;
            if (!cancelled) {
                me.fire('error', error, xhr, requestConf);
                throw error;
            }
        });


        return deferred.promise;
    },
    /**
     * @public
     * @memberof ApiInterface#
     * @returns external:Promise#
     */
    action: function(instanceOrType, actionName, data) {
        var me = this,
            obj = instanceOrType instanceof ApiObject ? instanceOrType : me.createSync(instanceOrType),
            type = obj.type;

        obj.fire('action', actionName, data);
        me.fire('action', obj, actionName, data);
        var requestConf = ApiReference.getRequestConfig(actionName, type, data || obj.data, me.context, obj);

        if ((actionName == "update" || actionName == "create") && !data) {
            data = obj.data;
        }

        return me.request(ApiReference.basicOps[actionName], requestConf, data).then(function(rawJSON) {
            if (requestConf.returnType) {
                var returnObj = ApiObject.create(requestConf.returnType, rawJSON, me);
                obj.fire('spawn', returnObj);
                me.fire('spawn', returnObj, obj);
                return returnObj;
            } else {
                if (rawJSON || rawJSON === 0 || rawJSON === false)
                    obj.data = utils.clone(rawJSON);
                delete obj.unsynced;
                obj.fire('sync', rawJSON, obj.data);
                me.fire('sync', obj, rawJSON, obj.data);
                return obj;
            }
        }, function(errorJSON) {
            obj.fire('error', errorJSON);
            me.fire('error', errorJSON, obj);
            throw errorJSON;
        });
    },
    all: function() {
        return utils.when.join.apply(utils.when, arguments);
    },
    steps: function() {
        var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
        return utils.pipeline(Array.prototype.slice.call(args));
    },
    defer: function() {
        return utils.when.defer();
    },
    getAvailableActionsFor: function(type) {
        return ApiReference.getActionsFor(type);
    }
};
var setOp = function(fnName) {
    ApiInterfaceConstructor.prototype[fnName] = function(type, conf, isRemote) {
        return this.action(type, fnName, conf, isRemote);
    };
};
for (var i in ApiReference.basicOps) {
    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
}

// add createSync method for a different style of development
ApiInterfaceConstructor.prototype.createSync = function(type, conf) {
    var newApiObject = ApiObject.create(type, conf, this);
    newApiObject.unsynced = true;
    this.fire('spawn', newApiObject);
    return newApiObject;
};

utils.addEvents(ApiInterfaceConstructor);

module.exports = ApiInterfaceConstructor;

// END INTERFACE

/*********/
},{"./object":22,"./reference":23,"./utils":35}],21:[function(require,module,exports){
module.exports={
  "products": {
    "template": "{+productService}{?_*}",
    "shortcutParam": "filter",
    "defaultParams": {
      "startIndex": 0,
      "pageSize": 15
    },
    "collectionOf": "product"
  },
  "categories": {
    "template": "{+categoryService}{?_*}",
    "shortcutParam": "filter",
    "defaultParams": {
      "startIndex": 0,
      "pageSize": 15
    },
    "collectionOf": "category"
  },
  "category": {
    "template": "{+categoryService}{id}(?allowInactive}",
    "shortcutParam": "Id",
    "defaultParams": {
      "allowInactive": false
    }
  },
  "search": {
    "template": "{+searchService}search{?query,filter,facetTemplate,facetTemplateSubset,facet,facetFieldRangeQuery,facetHierPrefix,facetHierValue,facetHierDepth,facetStartIndex,facetPageSize,facetSettings,facetValueFilter,sortBy,pageSize,PageSize,startIndex,StartIndex}",
    "shortcutParam": "query",
    "defaultParams": {
      "startIndex": 0,
      "query": "*:*",
      "pageSize": 15
    },
    "collectionOf": "product"
  },
  "customers": {
    "collectionOf": "customer"
  },
  "orders": {
    "template": "{+orderService}{?_*}",
    "defaultParams": {
      "startIndex": 0,
      "pageSize": 5
    },
    "collectionOf": "order"
  },
  "product": {
    "get": {
      "template": "{+productService}{productCode}?{&allowInactive*}",
      "shortcutParam": "productCode",
      "defaultParams": {
        "allowInactive": false
      }
    },
    "configure": {
      "verb": "POST",
      "template": "{+productService}{productCode}/configure{?includeOptionDetails}",
      "defaultParams": {
        "includeOptionDetails": true
      },
      "includeSelf": true
    },
    "add-to-cart": {
      "verb": "POST",
      "includeSelf": {
        "asProperty": "product"
      },
      "overridePostData": [
        "product",
        "quantity",
        "fulfillmentLocationCode",
        "fulfillmentMethod"
      ],
      "shortcutParam": "quantity",
      "returnType": "cartitem",
      "template": "{+cartService}current/items/"
    },
    "get-inventory": {
      "template": "{+productService}{productCode}/locationinventory{?locationCodes}",
      "includeSelf": true,
      "shortcutParam": "locationcodes",
      "returnType": "string"
    }
  },
  "location": {
    "get": {
      "template": "{+locationService}locationUsageTypes/SP/locations/{code}",
      "shortcutParam": "code"
    }
  },
  "locations": {
    "defaultParams": {
      "pageSize": 15
    },
    "collectionOf": "location",
    "get": {
      "template": "{+locationService}locationUsageTypes/SP/locations/{?startIndex,sortBy,pageSize,filter}"
    },
    "get-by-lat-long": {
      "template": "{+locationService}locationUsageTypes/SP/locations/?filter=geo near({latitude},{longitude}){&startIndex,sortBy,pageSize}"
    }
  },
  "cartsummary": "{+cartService}summary",
  "cart": {
    "get": "{+cartService}current",
    "add-product": {
      "verb": "POST",
      "returnType": "cartitem",
      "template": "{+cartService}current/items/"
    },
    "empty": {
      "verb": "DELETE",
      "template": "{+cartService}current/items/"
    },
    "checkout": {
      "verb": "POST",
      "template": "{+orderService}?cartId={id}",
      "returnType": "order",
      "noBody": true,
      "includeSelf": true
    }
  },
  "cartitem": {
    "defaults": {
      "template": "{+cartService}current/items/{id}",
      "shortcutParam": "id"
    },
    "update-quantity": {
      "verb": "PUT",
      "template": "{+cartService}current/items{/id,quantity}",
      "shortcutParam": "quantity",
      "includeSelf": true,
      "noBody": true
    }
  },
  "customer": {
    "template": "{+customerService}{id}",
    "shortcutParam": "id",
    "includeSelf": true,
    "create": {
      "verb": "POST",
      "template": "{+customerService}add-account-and-login",
      "returnType": "login"
    },
    "create-storefront": {
      "useIframeTransport": "{+storefrontUserService}../../receiver",
      "verb": "POST",
      "template": "{+storefrontUserService}create",
      "returnType": "login"
    },
    "login": {
      "useIframeTransport": "{+customerService}../../receiver",
      "verb": "POST",
      "template": "{+customerService}../authtickets",
      "returnType": "login"
    },
    "login-storefront": {
      "useIframeTransport": "{+storefrontUserService}../../receiver",
      "verb": "POST",
      "template": "{+storefrontUserService}login",
      "returnType": "login"
    },
    "update": {
      "verb": "PUT",
      "template": "{+customerService}{id}",
      "includeSelf": true
    },
    "reset-password": {
      "verb": "POST",
      "template": "{+customerService}reset-password",
      "returnType": "string"
    },
    "reset-password-storefront": {
      "useIframeTransport": "{+storefrontUserService}../../receiver",
      "verb": "POST",
      "template": "{+storefrontUserService}resetpassword",
      "returnType": "string"
    },
    "change-password": {
      "verb": "POST",
      "template": "{+customerService}{id}/change-password",
      "includeSelf": true
    },
    "get-orders": {
      "template": "{+orderService}?filter=OrderNumber ne null",
      "includeSelf": true,
      "returnType": "orders"
    },
    "get-cards": {
      "template": "{+customerService}{id}/cards",
      "includeSelf": true,
      "returnType": "accountcards"
    },
    "add-card": {
      "verb": "POST",
      "template": "{+customerService}{customer.id}/cards",
      "includeSelf": {
        "asProperty": "customer"
      },
      "returnType": "accountcard"
    },
    "update-card": {
      "verb": "PUT",
      "template": "{+customerService}{customer.id}/cards/{id}",
      "includeSelf": {
        "asProperty": "customer"
      },
      "returnType": "accountcard"
    },
    "delete-card": {
      "verb": "DELETE",
      "template": "{+customerService}{customer.id}/cards/{id}",
      "shortcutParam": "id",
      "includeSelf": {
        "asProperty": "customer"
      },
      "returnType": "accountcard"
    },
    "add-contact": {
      "verb": "POST",
      "template": "{+customerService}{id}/contacts",
      "includeSelf": true,
      "returnType": "contact"
    },
    "get-contacts": {
      "template": "{+customerService}{id}/contacts",
      "includeSelf": true,
      "returnType": "contacts"
    },
    "delete-contact": {
      "verb": "DELETE",
      "template": "{+customerService}{customer.id}/contacts/{id}",
      "shortcutParam": "id",
      "includeSelf": {
        "asProperty": "customer"
      },
      "returnType": "contact"
    },
    "get-credits": {
      "template": "{+creditService}",
      "returnType": "storecredits"
    }
  },
  "storecredit": {
    "associate-to-shopper": {
      "verb": "PUT",
      "template": "{+creditService}{code}/associate-to-shopper",
      "includeSelf": true
    }
  },
  "storecredits": {
    "template": "{+creditService}",
    "collectionOf": "storecredit"
  },
  "contact": {
    "template": "{+customerService}{accountId}/contacts/{id}",
    "includeSelf": true
  },
  "contacts": {
    "collectionOf": "contact"
  },
  "login": "{+userService}login",
  "address": {
    "validate-address": {
      "verb": "POST",
      "template": "{+addressValidationService}",
      "includeSelf": {
        "asProperty": "address"
      },
      "overridePostData": true,
      "returnType": "address"
    }
  },
  "order": {
    "template": "{+orderService}{id}",
    "includeSelf": true,
    "create": {
      "template": "{+orderService}{?cartId*}",
      "shortcutParam": "cartId",
      "noBody": true
    },
    "update-shipping-info": {
      "template": "{+orderService}{id}/fulfillmentinfo",
      "verb": "PUT",
      "returnType": "shipment",
      "includeSelf": true
    },
    "set-user-id": {
      "verb": "PUT",
      "template": "{+orderService}{id}/users",
      "noBody": true,
      "includeSelf": true,
      "returnType": "user"
    },
    "create-payment": {
      "verb": "POST",
      "template": "{+orderService}{id}/payments/actions",
      "includeSelf": true
    },
    "perform-payment-action": {
      "verb": "POST",
      "template": "{+orderService}{id}/payments/{paymentId}/actions",
      "includeSelf": true,
      "shortcutParam": "paymentId",
      "returnType": "string"
    },
    "apply-coupon": {
      "verb": "PUT",
      "template": "{+orderService}{id}/coupons/{couponCode}",
      "shortcutParam": "couponCode",
      "includeSelf": true,
      "noBody": true,
      "returnType": "coupon"
    },
    "remove-coupon": {
      "verb": "DELETE",
      "template": "{+orderService}{id}/coupons/{couponCode}",
      "shortcutParam": "couponCode",
      "includeSelf": true
    },
    "remove-all-coupons": {
      "verb": "DELETE",
      "template": "{+orderService}{id}/coupons",
      "includeSelf": true
    },
    "get-available-actions": {
      "template": "{+orderService}{id}/actions",
      "includeSelf": true,
      "returnType": "orderactions"
    },
    "perform-order-action": {
      "verb": "POST",
      "template": "{+orderService}{id}/actions",
      "shortcutParam": "actionName",
      "overridePostData": [
        "actionName"
      ],
      "includeSelf": true
    },
    "add-order-note": {
      "verb": "POST",
      "template": "{+orderService}{id}/notes",
      "includeSelf": true,
      "returnType": "ordernote"
    }
  },
  "rma": {
    "create": {
      "verb": "POST",
      "template": "{+returnService}"
    }
  },
  "rmas": {
    "template": "{+returnService}{?_*}",
    "defaultParams": {
      "startIndex": 0,
      "pageSize": 5
    },
    "collectionOf": "rma"
  },
  "shipment": {
    "defaults": {
      "template": "{+orderService}{orderId}/fulfillmentinfo",
      "includeSelf": true
    },
    "get-shipping-methods": {
      "template": "{+orderService}{orderId}/shipments/methods",
      "returnType": "shippingmethods"
    }
  },
  "payment": {
    "create": {
      "template": "{+orderService}{orderId}/payments/actions",
      "includeSelf": true
    }
  },
  "accountcard": {
    "template": "{+customerService}{id}/cards"
  },
  "accountcards": {
    "collectionOf": "accountcard"
  },
  "creditcard": {
    "defaults": {
      "useIframeTransport": "{+paymentService}../../Assets/mozu_receiver.html"
    },
    "save": {
      "verb": "POST",
      "template": "{+paymentService}",
      "returnType": "string"
    },
    "update": {
      "verb": "PUT",
      "template": "{+paymentService}{cardId}",
      "returnType": "string"
    },
    "del": {
      "verb": "DELETE",
      "shortcutParam": "cardId",
      "template": "{+paymentService}{cardId}"
    }
  },
  "creditcards": {
    "collectionOf": "creditcard"
  },
  "ordernote": {
    "template": "{+orderService}{orderId}/notes/{id}"
  },
  "document": {
    "get": {
      "template": "{+cmsService}{/documentListName,documentId}/{?version,status}",
      "shortcutParam": "documentId",
      "defaultParams": {
        "documentListName": "default"
      }
    }
  },
  "documentbyname": {
    "get": {
      "template": "{+cmsService}{documentListName}/documentTree/{documentName}/{?folderPath,version,status}",
      "shortcutParam": "documentName",
      "defaultParams": {
        "documentListName": "default"
      }
    }
  },
  "addressschemas": "{+referenceService}addressschemas",
  "wishlist": {
    "get": {
      "template": "{+wishlistService}{id}",
      "includeSelf": true
    },
    "get-by-name": {
      "template": "{+wishlistService}customers/{customerAccountId}/{name}",
      "includeSelf": true
    },
    "get-default": {
      "template": "{+wishlistService}customers/{customerAccountId}/my_wishlist",
      "includeSelf": true
    },
    "create-default": {
      "verb": "POST",
      "template": "{+wishlistService}",
      "defaultParams": {
        "name": "my_wishlist",
        "typeTag": "default"
      },
      "overridePostData": true
    },
    "add-item": {
      "verb": "POST",
      "template": "{+wishlistService}{id}/items/",
      "includeSelf": true
    },
    "delete-all-items": {
      "verb": "DELETE",
      "template": "{+wishlistService}{id}/items/"
    },
    "delete-item": {
      "verb": "DELETE",
      "template": "{+wishlistService}{id}/items/{itemId}",
      "includeSelf": true,
      "shortcutParam": "itemId"
    },
    "edit-item": {
      "verb": "PUT",
      "template": "{+wishlistService}{id}/items/{itemId}",
      "includeSelf": true
    },
    "add-item-to-cart": {
      "verb": "POST",
      "returnType": "cartitem",
      "template": "{+cartService}current/items/"
    },
    "get-items-by-name": {
      "returnType": "wishlistitems",
      "template": "{+wishlistService}customers/{customerAccountId}/{name}/items{?startIndex,pageSize,sortBy,filter}",
      "defaultParams": {
        "sortBy": "UpdateDate asc"
      },
      "includeSelf": true
    }
  },
  "wishlists": {
    "collectionOf": "wishlist"
  }
}
},{}],22:[function(require,module,exports){
// BEGIN OBJECT

var utils = require('./utils');
var ApiReference;
var ApiCollection; // lazy loading to prevent circular dep

var ApiObjectConstructor = function(type, data, iapi) {
    this.data = data || {};
    this.api = iapi;
    this.type = type;
};

ApiObjectConstructor.prototype = {
    constructor: ApiObjectConstructor,
    getAvailableActions: function() {
        ApiReference = ApiReference || require('./reference');
        return ApiReference.getActionsFor(this.type);
    },
    prop: function(k, v) {
        switch (arguments.length) {
            case 1:
                if (typeof k === "string") return this.data[k];
                if (typeof k === "object") {
                    for (var hashkey in k) {
                        if (k.hasOwnProperty(hashkey)) this.prop(hashkey, k[hashkey]);
                    }
                }
                break;
            case 2:
                this.data[k] = v;
        }
        return this;
    }
};

utils.addEvents(ApiObjectConstructor);

ApiObjectConstructor.types = {
    cart: require('./types/cart'),
    cartsummary: require('./types/cartsummary'),
    creditcard: require('./types/creditcard'),
    customer: require('./types/customer'),
    login: require('./types/login'),
    order: require('./types/order'),
    product: require('./types/product'),
    shipment: require('./types/shipment'),
    user: require('./types/user'),
    wishlist: require('./types/wishlist')
};
ApiObjectConstructor.hydratedTypes = {};

ApiObjectConstructor.getHydratedType = function(typeName) {
    ApiReference = ApiReference || require('./reference');
    if (!(typeName in this.hydratedTypes)) {
        var availableActions = ApiReference.getActionsFor(typeName),
            reflectedMethods = {};
        for (var i = availableActions.length - 1; i >= 0; i--) {
            utils.setOp(reflectedMethods, availableActions[i]);
        }
        this.hydratedTypes[typeName] = utils.inherit(this, utils.extend({}, reflectedMethods, this.types[typeName] || {}));
    }
    return this.hydratedTypes[typeName];
};

ApiObjectConstructor.create = function(typeName, rawJSON, api) {
    ApiReference = ApiReference || require('./reference');
    var type = ApiReference.getType(typeName);
    if (!type) {
        // for forward compatibility the API should return a response,
        // even one that it doesn't understand
        return rawJSON;
    }
    if (type.collectionOf) {
        // lazy load to prevent circular dep
        ApiCollection = ApiCollection || require('./collection');
        return ApiCollection.create(typeName, rawJSON, api, type.collectionOf);
    }

    var ApiObjectType = this.getHydratedType(typeName);

    return new ApiObjectType(typeName, rawJSON, api);
};

module.exports = ApiObjectConstructor;

// END OBJECT

/***********/
},{"./collection":13,"./reference":23,"./types/cart":24,"./types/cartsummary":25,"./types/creditcard":26,"./types/customer":27,"./types/login":29,"./types/order":30,"./types/product":31,"./types/shipment":32,"./types/user":33,"./types/wishlist":34,"./utils":35}],23:[function(require,module,exports){
// BEGIN REFERENCE
var utils = require('./utils');
var errors = require('./errors');
var ApiCollection;
var ApiObject = require('./object');
var objectTypes = require('./methods.json');

errors.register({
    'NO_REQUEST_CONFIG_FOUND': 'No request configuration was found for {0}.{1}',
    'NO_SHORTCUT_PARAM_FOUND': 'No shortcut parameter available for {0}. Please supply a configuration object instead of "{1}".'
});

var basicOps = {
    get: 'GET',
    update: 'PUT',
    create: 'POST',
    del: 'DELETE'
};
var copyToConf = ['verb', 'returnType', 'noBody'],
    copyToConfLength = copyToConf.length;
var reservedWords = {
    template: true,
    defaultParams: true,
    shortcutParam: true,
    defaults: true,
    verb: true,
    returnType: true,
    noBody: true,
    includeSelf: true,
    collectionOf: true,
    overridePostData: true,
    useIframeTransport: true,
    construct: true,
    postconstruct: true,
};
var ApiReference = {

    basicOps: basicOps,
    urls: {},

    getActionsFor: function(typeName) {
        ApiCollection = ApiCollection || require('./collection');
        if (!objectTypes[typeName]) return false;
        var actions = [],
            isSimpleType = (typeof objectTypes[typeName] === "string");
        for (var a in basicOps) {
            if (isSimpleType || !(a in objectTypes[typeName]))
                actions.push(a);
        }
        if (!isSimpleType) {
            for (a in objectTypes[typeName]) {
                if (a && objectTypes[typeName].hasOwnProperty(a) && !reservedWords[a])
                    actions.push(utils.camelCase(a));
            }
        }
        var declaredType = (objectTypes[typeName].collectionOf ? ApiCollection : ApiObject).types[typeName];
        if (declaredType) {
            for (a in declaredType) {
                if (isSimpleType || !(utils.dashCase(a) in objectTypes[typeName] && !reservedWords[a]) && typeof declaredType[a] === "function") actions.push(a);
            }
        }

        return actions;
    },

    getRequestConfig: function(operation, typeName, conf, context, obj) {

        var returnObj, tptData;

        // get object type from our reference
        var oType = objectTypes[typeName];

        // there may not be one
        if (!oType) errors.throwOnObject(obj, 'NO_REQUEST_CONFIG_FOUND', typeName, '');

        // get specific details of the requested operation
        if (operation) operation = utils.dashCase(operation);
        if (oType[operation]) oType = oType[operation];

        // some oTypes are a simple template as a string
        if (typeof oType === "string") oType = {
            template: oType
        };

        // the defaults at the root object type should be copied into all operation configs
        if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);

        // a template is required
        if (!oType.template) errors.throwOnObject(obj, 'NO_REQUEST_CONFIG_FOUND', typeName, operation);

        returnObj = {};
        tptData = {};

        // cache templates lazily
        if (typeof oType.template === "string") oType.template = utils.uritemplate.parse(oType.template);

        // add the requesting object's data itself to the tpt context
        if (oType.includeSelf && obj) {
            if (oType.includeSelf.asProperty) {
                tptData[oType.includeSelf.asProperty] = obj.data
            } else {
                tptData = utils.extend(tptData, obj.data);
            }
        }

        // shortcutparam allows you to use the most commonly used conf property as a string or number argument
        if (conf !== undefined && typeof conf !== "object") {
            if (!oType.shortcutParam) errors.throwOnObject(obj, 'NO_SHORTCUT_PARAM_FOUND', typeName, conf);
            tptData[oType.shortcutParam] = conf;
        } else if (conf) {
            // add the conf argued directly into this request fn to the tpt context
            utils.extend(tptData, conf);
        }

        // default params added to template, but overridden by existing tpt data
        if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);

        // remove stuff that the UriTemplate parser can't parse
        for (var tvar in tptData) {
            if (utils.getType(tptData[tvar]) == "Array") tptData[tvar] = JSON.stringify(tptData[tvar]);
        }
        var fullTptContext = utils.extend({
            _: tptData
        }, context.asObject('context-'), utils.flatten(tptData, {}), ApiReference.urls);
        returnObj.url = oType.template.expand(fullTptContext);
        for (var j = 0; j < copyToConfLength; j++) {
            if (copyToConf[j] in oType) returnObj[copyToConf[j]] = oType[copyToConf[j]];
        }
        if (oType.useIframeTransport) {
            // cache templates lazily
            if (typeof oType.useIframeTransport === "string") oType.useIframeTransport = utils.uritemplate.parse(oType.useIframeTransport);
            returnObj.iframeTransportUrl = oType.useIframeTransport.expand(fullTptContext);
        }
        if (oType.overridePostData) {
            var overriddenData;
            if (utils.getType(oType.overridePostData) == "Array") {
                overriddenData = {};
                for (var tOK = 0; tOK < oType.overridePostData.length; tOK++) {
                    overriddenData[oType.overridePostData[tOK]] = tptData[oType.overridePostData[tOK]];
                }
            } else {
                overriddenData = tptData;
            }
            returnObj.overridePostData = overriddenData;
        }
        return returnObj;
    },

    getType: function(typeName) {
        return objectTypes[typeName];
    }
};

module.exports = ApiReference;

// END REFERENCE

/***********/
},{"./collection":13,"./errors":16,"./methods.json":21,"./object":22,"./utils":35}],24:[function(require,module,exports){
var utils = require('../utils');
module.exports = {
    count: function () {
        var items = this.prop('items');
        if (!items || !items.length) return 0;
        return utils.reduce(items, function (total, item) { return total + item.quantity; }, 0);
    }
};
},{"../utils":35}],25:[function(require,module,exports){
var utils = require('../utils');
module.exports = {
    count: function () {
        return this.data.totalQuantity || 0;
    }
};
},{"../utils":35}],26:[function(require,module,exports){
var utils = require('../utils');
var errors = require('../errors');
module.exports = (function() {

    errors.register({
        'CARD_TYPE_MISSING': 'Card type missing.',
        'CARD_NUMBER_MISSING': 'Card number missing.',
        'CVV_MISSING': 'Card security code missing.',
        'CARD_NUMBER_UNRECOGNIZED': 'Card number is in an unrecognized format.',
        'MASK_PATTERN_INVALID': 'Supplied mask pattern did not match a valid card number.'
    });

    var charsInCardNumberRE = /[\s-]/g;

    function validateCardNumber(obj, cardNumber) {
        var maskCharacter = obj.maskCharacter;
        if (!cardNumber) return false;
        return (cardNumber.indexOf(maskCharacter) !== -1) || luhn10(cardNumber);
    }

    function luhn10(s) {
        // luhn 10 algorithm for card numbers
        var i, n, c, r, t;
        r = "";
        for (i = 0; i < s.length; i++) {
            c = parseInt(s.charAt(i), 10);
            if (c >= 0 && c <= 9) r = c + r;
        }
        if (r.length <= 1) return false;
        t = "";
        for (i = 0; i < r.length; i++) {
            c = parseInt(r.charAt(i), 10);
            if (i % 2 != 0) c *= 2;
            t = t + c;
        }
        n = 0;
        for (i = 0; i < t.length; i++) {
            c = parseInt(t.charAt(i), 10);
            n = n + c;
        }
        return (n != 0 && n % 10 == 0);
    }

    function createCardNumberMask(obj, cardNumber) {
        var maskRE = new RegExp(obj.maskPattern),
            matches = cardNumber.match(maskRE),
            toDisplay = cardNumber,
            toSend = [],
            maskCharacter = obj.maskCharacter,
            tempMask = "";

        if (!matches) errors.throwOnObject(obj, 'MASK_PATTERN_INVALID');
        for (var i = 1; i < matches.length; i++) {
            tempMask = "";
            for (var j = 0; j < matches[i].length; j++) {
                tempMask += maskCharacter;
            }
            toDisplay = toDisplay.replace(matches[i], tempMask);
        }
        for (i = toDisplay.length - 1; i >= 0; i--) {
            toSend.unshift(toDisplay.charAt(i) === maskCharacter ? cardNumber.charAt(i) : maskCharacter);
        }
        obj.maskedCardNumber = toDisplay;
        return toSend.join('');
    }

    function makePayload(obj) {
        var data = obj.data, maskCharacter = obj.maskCharacter, maskedData;
        if (!data.paymentOrCardType) errors.throwOnObject(obj, 'CARD_TYPE_MISSING');
        if (!data.cardNumberPartOrMask) errors.throwOnObject(obj, 'CARD_NUMBER_MISSING');
        if (!data.cvv) errors.throwOnObject(obj, 'CVV_MISSING');
        maskedData = transform.toCardData(data)
        var cardNumber = maskedData.cardNumber.replace(charsInCardNumberRE, '');
        if (!validateCardNumber(obj, cardNumber)) errors.throwOnObject(obj, 'CARD_NUMBER_UNRECOGNIZED');

        // only add numberPart if the current card number isn't already masked
        if (cardNumber.indexOf(maskCharacter) === -1) maskedData.numberPart = createCardNumberMask(obj, cardNumber);
        delete maskedData.cardNumber;

        return maskedData;
    }


    var transform = {
        fields: {
            "cardNumber": "cardNumberPartOrMask",
            "persistCard": "isCardInfoSaved",
            "cardholderName": "nameOnCard",
            "cardType": "paymentOrCardType",
            "cardId": "paymentServiceCardId",
            "cvv": "cvv"
        },
        toStorefrontData: function (data) {
            var storefrontData = {};
            for (var serviceField in this.fields) {
                if (serviceField in data) storefrontData[this.fields[serviceField]] = data[serviceField];
            }
            return storefrontData;
        },
        toCardData: function (data) {
            var cardData = {};
            for (var serviceField in this.fields) {
                if (this.fields[serviceField] in data) cardData[serviceField] = data[this.fields[serviceField]]
            }
            return cardData;
        }
    };
    

    return {
        maskCharacter: "*",
        maskPattern: "^(\\d+?)\\d{4}$",
        save: function () {
            var self = this,
                isUpdate = this.prop(transform.fields.cardId);
            return this.api.action(this, (isUpdate ? 'update' : 'save'), makePayload(this)).then(function (res) {
                self.prop(transform.toStorefrontData({
                    cardNumber: self.maskedCardNumber,
                    cvv: self.prop('cvv').replace(/\d/g, self.maskCharacter),
                    cardId: isUpdate || res
                }));
                self.fire('sync', utils.clone(self.data), self.data);
                return self;
            });
        },
        saveToCustomer: function (customerId) {
            var self = this;
            return this.save().then(function (cardId) {
                cardId = cardId || self.prop('id');
                var customer = self.api.createSync('customer', { id: customerId });
                errors.passFrom(customer, this);
                return customer.addCard(self.data);
            });
        },
        getOrderData: function () {
            return {
                cardNumberPartOrMask: this.maskedCardNumber,
                cvv: this.data.cvv,
                nameOnCard: this.data.nameOnCard,
                paymentOrCardType: this.data.paymentOrCardType || this.data.cardType,
                paymentServiceCardId: this.data.paymentServiceCardId || this.data.cardId,
                isCardInfoSaved: this.data.isCardInfoSaved || this.data.persistCard,
                expireMonth: this.data.expireMonth,
                expireYear: this.data.expireYear
            }
        }
    };

}());
},{"../errors":16,"../utils":35}],27:[function(require,module,exports){
var utils = require('../utils');
var errors = require('../errors');
module.exports = (function () {
    return {
        postconstruct: function() {
            var self = this;
            this.on('sync', function (json) {
                if (json && json.authTicket && json.authTicket.accessToken) {
                    self.api.context.UserClaims(json.authTicket.accessToken);
                    self.api.fire('login', json.authTicket);
                }
            });
        },
        savePaymentCard: function (unmaskedCardData) {
            var self = this, card = this.api.createSync('creditcard', unmaskedCardData),
                isUpdate = !!(unmaskedCardData.paymentServiceCardId || unmaskedCardData.id);
            errors.passFrom(card, this);
            return card.save().then(function (card) {
                var payload = utils.clone(card.data);
                payload.cardNumberPart = payload.cardNumberPartOrMask || payload.cardNumber;
                payload.id = payload.paymentServiceCardId;
                delete payload.cardNumber;
                delete payload.cardNumberPartOrMask;
                delete payload.paymentServiceCardId;
                return isUpdate ? self.updateCard(payload) : self.addCard(payload);
            });
        },
        deletePaymentCard: function (id) {
            var self = this;
            return this.deleteCard(id).then(function () {
                return self.api.del('creditcard', id);
            });
        },
        getStoreCredits: function() {
            var credits = this.api.createSync('storecredits');
            errors.passFrom(credits, this);
            return credits.get();
        },
        addStoreCredit: function (id) {
            var credit = this.api.createSync('storecredit', { code: id });
            errors.passFrom(credit, this);
            return credit.associateToShopper();
        },
        // as of 12/30/2013 partial updates on customer will
        // blank out these values unless they are included
        // TODO: remove as soon as TFS#21775 is fixed
        getMinimumPartial: function () {
            return {
                firstName: this.prop('firstName'),
                lastName: this.prop('lastName'),
                emailAddress: this.prop('emailAddress')
            };
        },
        update: function (data) {
            return this.api.action(this, 'update', utils.extend(this.getMinimumPartial(), utils.clone(data)));
        }
    }
}());
},{"../errors":16,"../utils":35}],28:[function(require,module,exports){
var utils = require('../utils');
module.exports = (function () {

    // haversine
    // By Nick Justice (niix)
    // https://github.com/niix/haversine

    var haversine = (function () {

        // convert to radians
        var toRad = function (num) {
            return num * Math.PI / 180
        }

        return function haversine(start, end, options) {
            var miles = 3960
            var km = 6371
            options = options || {}

            var R = options.unit === 'km' ? km : miles

            var dLat = toRad(end.latitude - start.latitude)
            var dLon = toRad(end.longitude - start.longitude)
            var lat1 = toRad(start.latitude)
            var lat2 = toRad(end.latitude)

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

            if (options.threshold) {
                return options.threshold > (R * c)
            } else {
                return R * c
            }
        }

    })()

    return {

        getByLatLong: function (opts) {
            var self = this;
            return this.api.action('locations', 'get-by-lat-long', {
                latitude: opts.location.coords.latitude,
                longitude: opts.location.coords.longitude
            }).then(function (coll) {
                var locations = coll.data.items;
                for (var i = 0, len = locations.length; i < len; i++) {
                    locations[i].distance = haversine(opts.location.coords, { latitude: locations[i].geo.lat, longitude: locations[i].geo.lng }).toFixed(1);
                }
                var data = utils.clone(coll.data);
                self.fire('sync', data, data);
                return self;
            });
        },

        getForProduct: function (opts) {
            var self = this,
                coll,
                // not running the method on self since it shouldn't sync until it's been processed!
                operation = opts.location ?
                this.api.action('locations', 'get-by-lat-long', {
                    latitude: opts.location.coords.latitude,
                    longitude: opts.location.coords.longitude
                }) :
                this.api.get('locations');
            return operation.then(function (c) {
                coll = c;
                var codes = utils.map(coll.data.items, function (loc) {
                    return loc.code;
                }).join(',');
                return self.api.action('product', 'getInventory', {
                    productCode: opts.productCode,
                    locationCodes: codes
                });
            }).then(function (inventory) {
                var j,
                    ilen,
                    locations = coll.data.items,
                    inventories = inventory.items,
                    validLocations = [];
                for (var i = 0, len = locations.length; i < len; i++) {
                    for (j = 0, ilen = inventories.length; j < ilen; j++) {
                        if (inventories[j].locationCode === locations[i].code) {
                            locations[i].quantity = inventories[j].stockAvailable;
                            if (opts.location) locations[i].distance = haversine(opts.location.coords, { latitude: locations[i].geo.lat, longitude: locations[i].geo.lng }).toFixed(1);
                            validLocations.push(locations[i]);
                            inventories.splice(j, 1);
                            break;
                        }
                    }
                }
                var data = { items: utils.clone(validLocations) };
                self.fire('sync', data, data);
                return self;
            });
        }
    }

}());
},{"../utils":35}],29:[function(require,module,exports){
module.exports = {
    postconstruct: function (type, json) {
        var accessToken;
        if (json.authTicket && json.authTicket.accessToken) {
            accessToken = json.authTicket.accessToken;
        } else if (json.accessToken) {
            accessToken = json.accessToken;
        }
        if (accessToken) {
            this.api.context.UserClaims(accessToken);
            this.api.fire('login', json);
        }
    }
};
},{}],30:[function(require,module,exports){
var errors = require('../errors');
var CONSTANTS = require('../constants/default');
var utils = require('../utils');
var ApiReference = require('../reference');
module.exports = (function() {

    errors.register({
        'BILLING_INFO_MISSING': 'Billing info missing.',
        'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED': 'Payment type missing or unrecognized.',
        'PAYMENT_MISSING': 'Expected a payment to exist on this order and one did not.',
        'PAYPAL_TRANSACTION_ID_MISSING': 'Expected the active payment to include a paymentServiceTransactionId and it did not.',
        'ORDER_CANNOT_SUBMIT': 'Order cannot be submitted. Is order complete?',
        'ADD_COUPON_FAILED': 'Adding coupon failed for the following reason: {0}',
        'ADD_CUSTOMER_FAILED': 'Adding customer failed for the following reason: {0}'
    });

    var OrderStatus2IsComplete = {};
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.SUBMITTED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.ACCEPTED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.PENDING_REVIEW] = true;

    var OrderStatus2IsReady = {};
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.SUBMIT_ORDER] = true;
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.ACCEPT_ORDER] = true;


    var PaymentStrategies = {
        "PaypalExpress": function (order, billingInfo) {
            return order.createPayment({
                returnUrl: billingInfo.paypalReturnUrl,
                cancelUrl: billingInfo.paypalCancelUrl
            }).ensure(function () {
                var payment = order.getCurrentPayment();
                if (!payment) errors.throwOnObject(order, 'PAYMENT_MISSING');
                if (!payment.paymentServiceTransactionId) errors.throwOnObject(order, 'PAYPAL_TRANSACTION_ID_MISSING');
                window.location = ApiReference.urls.paypalExpress + (ApiReference.urls.paypalExpress.indexOf('?') === -1 ? '?' : '&') + "token=" + payment.paymentServiceTransactionId; //utils.formatString(CONSTANTS.BASE_PAYPAL_URL, payment.paymentServiceTransactionId);
                });
        },
        "CreditCard": function (order, billingInfo) {
            var card = order.api.createSync('creditcard', billingInfo.card);
            errors.passFrom(card, order);
            return card.save().then(function(card) {
                billingInfo.card = card.getOrderData();
                order.prop('billingInfo', billingInfo);
                return order.createPayment();
            });
        },
        "Check": function (order, billingInfo) {
            return order.createPayment();
        }
    };
    
    return {
        addCoupon: function(couponCode) {
            var self = this;
            return this.applyCoupon(couponCode).then(function () {
                return self.get();
            }, function(reason) {
                errors.throwOnObject(self, 'ADD_COUPON_FAILED', reason.message);
            });
        },
        addNewCustomer: function (newCustomerPayload) {
            var self = this;
            return self.api.action('customer', 'createStorefront', newCustomerPayload).then(function (customer) {
                return self.setUserId();
            }, function (reason) {
                errors.throwOnObject(self, 'ADD_CUSTOMER_FAILED', reason.message);
            });
        },
        createPayment: function(extraProps) {
            return this.api.action(this, 'createPayment', utils.extend({
                currencyCode: this.api.context.Currency().toUpperCase(),
                amount: this.prop('amountRemainingForPayment'),
                newBillingInfo: this.prop('billingInfo')
            }, extraProps || {}));
        },
        addStoreCredit: function(payment) {
            return this.createPayment({
                amount: payment.amount,
                newBillingInfo: {
                    paymentType: 'StoreCredit',
                    storeCreditCode: payment.storeCreditCode
                }
            });
        },
        addPayment: function (payment) {
            var billingInfo = payment || this.prop('billingInfo');
            if (!billingInfo) errors.throwOnObject(this, 'BILLING_INFO_MISSING');
            if (!billingInfo.paymentType || !(billingInfo.paymentType in PaymentStrategies)) errors.throwOnObject(this, 'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED');
            return PaymentStrategies[billingInfo.paymentType](this, billingInfo);
        },
        getActivePayments: function() {
            var payments = this.prop('payments'),
                activePayments = [];
            if (payments.length !== 0) {
                for (var i = payments.length - 1; i >= 0; i--) {
                    if (payments[i].status === CONSTANTS.PAYMENT_STATUSES.NEW)
                        activePayments.push(utils.clone(payments[i]))
                }
            }
            return activePayments;
        },
        getCurrentPayment: function() {
            var activePayments = this.getActivePayments();
            for (var i = activePayments.length - 1; i >= 0; i--) {
                if (activePayments[i].paymentType !== "StoreCredit") return activePayments[i];
            }
        },
        getActiveStoreCredits: function() {
            var activePayments = this.getActivePayments(),
                credits = [];
            for (var i = activePayments.length - 1; i >= 0; i--) {
                if (activePayments[i].paymentType === "StoreCredit") credits.unshift(activePayments[i]);
            }
            return credits;
        },
        voidPayment: function (id) {
            var obj = this;
            return this.performPaymentAction({
                paymentId: id,
                actionName: CONSTANTS.PAYMENT_ACTIONS.VOID
            }).then(function (rawJSON) {
                if (rawJSON || rawJSON === 0 || rawJSON === false) {
                    delete rawJSON.billingInfo;
                    obj.data = utils.clone(rawJSON);
                }
                delete obj.unsynced;
                obj.fire('sync', rawJSON, obj.data);
                obj.api.fire('sync', obj, rawJSON, obj.data);
                return obj;
            });
        },
        checkout: function() {
            var availableActions = this.prop('availableActions');
            if (!this.isComplete()) {
                for (var i = availableActions.length - 1; i >= 0; i--) {
                    if (availableActions[i] in OrderStatus2IsReady) return this.performOrderAction(availableActions[i]);
                }
            }
            errors.throwOnObject(this, 'ORDER_CANNOT_SUBMIT');
        },
        isComplete: function () {
            return !!OrderStatus2IsComplete[this.prop('status')];
        }
    };
}());
},{"../constants/default":14,"../errors":16,"../reference":23,"../utils":35}],31:[function(require,module,exports){
var errors = require('../errors');
var utils = require('../utils');
var CONSTANTS = require('../constants/default');
module.exports = {
    addToWishlist: function (payload) {
        var self = this;
        var list = this.api.createSync('wishlist', { customerAccountId: payload.customerAccountId });
        return list.getOrCreate().then(function () {
            errors.passFrom(list, self);
            return list.addItem({
                quantity: payload.quantity,
                currencyCode: payload.currencyCode || self.api.context.Currency(),
                localeCode: payload.localeCode || self.api.context.Locale(),
                product: self.data
            });
        });
    },
    addToCartForPickup: function (opts) {
        return this.addToCart(utils.extend({}, this.data, {
            fulfillmentMethod: CONSTANTS.FULFILLMENT_METHODS.PICKUP
        }, opts));
    }
};
},{"../constants/default":14,"../errors":16,"../utils":35}],32:[function(require,module,exports){
module.exports = {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        return self.update({ fulfillmentContact: self.prop('fulfillmentContact') }).then(function () {
            return self.getShippingMethods();
        });
    }
};
},{}],33:[function(require,module,exports){
module.exports = {
    postconstruct: function () {
        var self = this;
        this.on('sync', function (json) {
            if (json && json.authTicket && json.authTicket.accessToken) {
                self.api.context.UserClaims(json.authTicket.accessToken);
                self.api.fire('login', json.authTicket);
            }
        });
    },
    createAndLogin: function(payload) {
        var self = this;
        if (!payload) payload = this.data;
        return this.create(payload).then(function () {
            return self.login({
                emailAddress: payload.emailAddress,
                password: payload.password
            });
        });
    },
    createWithCustomer: function (payload) {
        var self = this;
        return this.createAndLogin(payload).then(function () {
            return self.api.action('customer', 'create', {
                userId: self.prop('id')
            })
        }).then(function (customer) {
            return customer.addContact({
                email: self.prop('emailAddress'),
                firstName: self.prop('firstName'),
                lastNameOrSurname: self.prop('lastName'),
                address: {}
            });
        });
    }
};
},{}],34:[function(require,module,exports){
var errors = require('../errors'),
    utils = require('../utils');
module.exports = (function() {

    errors.register({
        'NO_ITEMS_IN_WISHLIST': 'No items in wishlist.',
        'NO_MATCHING_ITEM_IN_WISHLIST': 'No wishlist item matching ID {0}'
    });

    var getItem = function (list, item) {
        var items = list.prop('items');
        if (!items || items.length === 0) {
            return errors.throwOnObject(list, 'NO_ITEMS_IN_WISHLIST');
        }
        if (typeof item === "string") {
            for (var i = items.length - 1; i >= 0; i--) {
                if (items[i].id === item) {
                    item = items[i];
                    break;
                }
            }
            if (typeof item === "string") {
                return errors.throwOnObject(list, 'NO_MATCHING_ITEM_IN_WISHLIST', item);
            }
        }
        return item;
    }

    return {
        getOrCreate: function (cid) {
            var self = this;
            return this.getDefault({ customerAccountId: cid }).then(function (list) {
                return list;
            }, function () {
                return self.createDefault({ customerAccountId: cid });
            });
        },
        addItemToCartById: function (item) {
            return this.addItemToCart(getItem(this, item));
        },
        get: function () {
            // overriding get to always use getItemsByName to get the items collection
            // so items are always sorted by update date
            var self = this;
            return this.getItemsByName().then(function (items) {
                self.prop('items', items);
                self.fire('sync', self.data, self);
                return self;
            });
        }
    };
}());
},{"../errors":16,"../utils":35}],35:[function(require,module,exports){
var process=require("__browserify_process");// BEGIN UTILS
// Many of these poached from lodash

    var maxFlattenDepth = 20;

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
            };
            ApiInheritedObject.prototype = utils.extend(new parent(), more);
            return ApiInheritedObject;
        },
        map: function (arr, fn, scope) {
            var newArr = [], len = arr.length;
            scope = scope || window;
            for (var i = 0; i < len; i++) {
                newArr[i] = fn.call(scope, arr[i]);
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
},{"./iframexhr":17,"__browserify_process":1,"microevent":2,"uritemplate":3,"when":12,"xmlhttprequest":false}]},{},[19])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL21pY3JvZXZlbnQvbWljcm9ldmVudC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL25vZGVfbW9kdWxlcy91cml0ZW1wbGF0ZS9iaW4vdXJpdGVtcGxhdGUuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi9tb25pdG9yL2FnZ3JlZ2F0b3IuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi9tb25pdG9yL2FycmF5LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9jb25zb2xlLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9sb2dnZXIvY29uc29sZUdyb3VwLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9zaW1wbGVGb3JtYXR0ZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi9tb25pdG9yL3NpbXBsZVJlcG9ydGVyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9zdGFja0ZpbHRlci5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL25vZGVfbW9kdWxlcy93aGVuL21vbml0b3IvdGhyb3R0bGVkUmVwb3J0ZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi93aGVuLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2NvbGxlY3Rpb24uanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvY29uc3RhbnRzL2RlZmF1bHQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvY29udGV4dC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9lcnJvcnMuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvaWZyYW1leGhyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2luaXQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvaW5pdF9kZWJ1Zy5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9pbnRlcmZhY2UuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvbWV0aG9kcy5qc29uIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL29iamVjdC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9yZWZlcmVuY2UuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdHlwZXMvY2FydC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9jYXJ0c3VtbWFyeS5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9jcmVkaXRjYXJkLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL2N1c3RvbWVyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL2xvY2F0aW9ucy5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9sb2dpbi5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9vcmRlci5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9wcm9kdWN0LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL3NoaXBtZW50LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL3VzZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdHlwZXMvd2lzaGxpc3QuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcjNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8qKlxuICogTWljcm9FdmVudCAtIHRvIG1ha2UgYW55IGpzIG9iamVjdCBhbiBldmVudCBlbWl0dGVyIChzZXJ2ZXIgb3IgYnJvd3NlcilcbiAqIFxuICogLSBwdXJlIGphdmFzY3JpcHQgLSBzZXJ2ZXIgY29tcGF0aWJsZSwgYnJvd3NlciBjb21wYXRpYmxlXG4gKiAtIGRvbnQgcmVseSBvbiB0aGUgYnJvd3NlciBkb21zXG4gKiAtIHN1cGVyIHNpbXBsZSAtIHlvdSBnZXQgaXQgaW1tZWRpYXRseSwgbm8gbWlzdGVyeSwgbm8gbWFnaWMgaW52b2x2ZWRcbiAqXG4gKiAtIGNyZWF0ZSBhIE1pY3JvRXZlbnREZWJ1ZyB3aXRoIGdvb2RpZXMgdG8gZGVidWdcbiAqICAgLSBtYWtlIGl0IHNhZmVyIHRvIHVzZVxuKi9cblxudmFyIE1pY3JvRXZlbnRcdD0gZnVuY3Rpb24oKXt9XG5NaWNyb0V2ZW50LnByb3RvdHlwZVx0PSB7XG5cdGJpbmRcdDogZnVuY3Rpb24oZXZlbnQsIGZjdCl7XG5cdFx0dGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0gPSB0aGlzLl9ldmVudHNbZXZlbnRdXHR8fCBbXTtcblx0XHR0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goZmN0KTtcblx0fSxcblx0dW5iaW5kXHQ6IGZ1bmN0aW9uKGV2ZW50LCBmY3Qpe1xuXHRcdHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcblx0XHRpZiggZXZlbnQgaW4gdGhpcy5fZXZlbnRzID09PSBmYWxzZSAgKVx0cmV0dXJuO1xuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0uc3BsaWNlKHRoaXMuX2V2ZW50c1tldmVudF0uaW5kZXhPZihmY3QpLCAxKTtcblx0fSxcblx0dHJpZ2dlclx0OiBmdW5jdGlvbihldmVudCAvKiAsIGFyZ3MuLi4gKi8pe1xuXHRcdHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcblx0XHRpZiggZXZlbnQgaW4gdGhpcy5fZXZlbnRzID09PSBmYWxzZSAgKVx0cmV0dXJuO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLl9ldmVudHNbZXZlbnRdLmxlbmd0aDsgaSsrKXtcblx0XHRcdHRoaXMuX2V2ZW50c1tldmVudF1baV0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogbWl4aW4gd2lsbCBkZWxlZ2F0ZSBhbGwgTWljcm9FdmVudC5qcyBmdW5jdGlvbiBpbiB0aGUgZGVzdGluYXRpb24gb2JqZWN0XG4gKlxuICogLSByZXF1aXJlKCdNaWNyb0V2ZW50JykubWl4aW4oRm9vYmFyKSB3aWxsIG1ha2UgRm9vYmFyIGFibGUgdG8gdXNlIE1pY3JvRXZlbnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdGhlIG9iamVjdCB3aGljaCB3aWxsIHN1cHBvcnQgTWljcm9FdmVudFxuKi9cbk1pY3JvRXZlbnQubWl4aW5cdD0gZnVuY3Rpb24oZGVzdE9iamVjdCl7XG5cdHZhciBwcm9wc1x0PSBbJ2JpbmQnLCAndW5iaW5kJywgJ3RyaWdnZXInXTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSArKyl7XG5cdFx0ZGVzdE9iamVjdC5wcm90b3R5cGVbcHJvcHNbaV1dXHQ9IE1pY3JvRXZlbnQucHJvdG90eXBlW3Byb3BzW2ldXTtcblx0fVxufVxuXG4vLyBleHBvcnQgaW4gY29tbW9uIGpzXG5pZiggdHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiAoJ2V4cG9ydHMnIGluIG1vZHVsZSkpe1xuXHRtb2R1bGUuZXhwb3J0c1x0PSBNaWNyb0V2ZW50XG59XG4iLCJ2YXIgZ2xvYmFsPXR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fTsvKmdsb2JhbCB1bmVzY2FwZSwgbW9kdWxlLCBkZWZpbmUsIHdpbmRvdywgZ2xvYmFsKi9cclxuXHJcbi8qXHJcbiBVcmlUZW1wbGF0ZSBDb3B5cmlnaHQgKGMpIDIwMTItMjAxMyBGcmFueiBBbnRlc2Jlcmdlci4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuIEF2YWlsYWJsZSB2aWEgdGhlIE1JVCBsaWNlbnNlLlxyXG4qL1xyXG5cclxuKGZ1bmN0aW9uIChleHBvcnRDYWxsYmFjaykge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVXJpVGVtcGxhdGVFcnJvciA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gVXJpVGVtcGxhdGVFcnJvciAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgVXJpVGVtcGxhdGVFcnJvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKEpTT04gJiYgSlNPTi5zdHJpbmdpZnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIFVyaVRlbXBsYXRlRXJyb3I7XHJcbn0oKSk7XHJcblxyXG52YXIgb2JqZWN0SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIGlzQXJyYXkgKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzU3RyaW5nICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGlzTnVtYmVyICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgTnVtYmVyXSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGlzQm9vbGVhbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gam9pbiAoYXJyLCBzZXBhcmF0b3IpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gJycsXHJcbiAgICAgICAgICAgIGZpcnN0ID0gdHJ1ZSxcclxuICAgICAgICAgICAgaW5kZXg7XHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgYXJyLmxlbmd0aDsgaW5kZXggKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoZmlyc3QpIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc2VwYXJhdG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBhcnJbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hcCAoYXJyLCBtYXBwZXIpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gW10sXHJcbiAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICBmb3IgKDsgaW5kZXggPCBhcnIubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1hcHBlcihhcnJbaW5kZXhdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmlsdGVyIChhcnIsIHByZWRpY2F0ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSBbXSxcclxuICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGFyci5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJbaW5kZXhdKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYXJyW2luZGV4XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZWVwRnJlZXplVXNpbmdPYmplY3RGcmVlemUgKG9iamVjdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSBcIm9iamVjdFwiIHx8IG9iamVjdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBPYmplY3QuZnJlZXplKG9iamVjdCk7XHJcbiAgICAgICAgdmFyIHByb3BlcnR5LCBwcm9wZXJ0eU5hbWU7XHJcbiAgICAgICAgZm9yIChwcm9wZXJ0eU5hbWUgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydHkgPSBvYmplY3RbcHJvcGVydHlOYW1lXTtcclxuICAgICAgICAgICAgICAgIC8vIGJlIGF3YXJlLCBhcnJheXMgYXJlICdvYmplY3QnLCB0b29cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWVwRnJlZXplKHByb3BlcnR5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlZXBGcmVlemUgKG9iamVjdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgT2JqZWN0LmZyZWV6ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVlcEZyZWV6ZVVzaW5nT2JqZWN0RnJlZXplKG9iamVjdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNBcnJheTogaXNBcnJheSxcclxuICAgICAgICBpc1N0cmluZzogaXNTdHJpbmcsXHJcbiAgICAgICAgaXNOdW1iZXI6IGlzTnVtYmVyLFxyXG4gICAgICAgIGlzQm9vbGVhbjogaXNCb29sZWFuLFxyXG4gICAgICAgIGpvaW46IGpvaW4sXHJcbiAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgZmlsdGVyOiBmaWx0ZXIsXHJcbiAgICAgICAgZGVlcEZyZWV6ZTogZGVlcEZyZWV6ZVxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbnZhciBjaGFySGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBpc0FscGhhIChjaHIpIHtcclxuICAgICAgICByZXR1cm4gKGNociA+PSAnYScgJiYgY2hyIDw9ICd6JykgfHwgKChjaHIgPj0gJ0EnICYmIGNociA8PSAnWicpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0RpZ2l0IChjaHIpIHtcclxuICAgICAgICByZXR1cm4gY2hyID49ICcwJyAmJiBjaHIgPD0gJzknO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzSGV4RGlnaXQgKGNocikge1xyXG4gICAgICAgIHJldHVybiBpc0RpZ2l0KGNocikgfHwgKGNociA+PSAnYScgJiYgY2hyIDw9ICdmJykgfHwgKGNociA+PSAnQScgJiYgY2hyIDw9ICdGJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc0FscGhhOiBpc0FscGhhLFxyXG4gICAgICAgIGlzRGlnaXQ6IGlzRGlnaXQsXHJcbiAgICAgICAgaXNIZXhEaWdpdDogaXNIZXhEaWdpdFxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbnZhciBwY3RFbmNvZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB1dGY4ID0ge1xyXG4gICAgICAgIGVuY29kZTogZnVuY3Rpb24gKGNocikge1xyXG4gICAgICAgICAgICAvLyBzZWUgaHR0cDovL2VjbWFuYXV0LmJsb2dzcG90LmRlLzIwMDYvMDcvZW5jb2RpbmctZGVjb2RpbmctdXRmOC1pbi1qYXZhc2NyaXB0Lmh0bWxcclxuICAgICAgICAgICAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjaHIpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bUJ5dGVzOiBmdW5jdGlvbiAoZmlyc3RDaGFyQ29kZSkge1xyXG4gICAgICAgICAgICBpZiAoZmlyc3RDaGFyQ29kZSA8PSAweDdGKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgweEMyIDw9IGZpcnN0Q2hhckNvZGUgJiYgZmlyc3RDaGFyQ29kZSA8PSAweERGKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgweEUwIDw9IGZpcnN0Q2hhckNvZGUgJiYgZmlyc3RDaGFyQ29kZSA8PSAweEVGKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgweEYwIDw9IGZpcnN0Q2hhckNvZGUgJiYgZmlyc3RDaGFyQ29kZSA8PSAweEY0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBubyB2YWxpZCBmaXJzdCBvY3RldFxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzVmFsaWRGb2xsb3dpbmdDaGFyQ29kZTogZnVuY3Rpb24gKGNoYXJDb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAweDgwIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IDB4QkY7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuY29kZXMgYSBjaGFyYWN0ZXIsIGlmIG5lZWRlZCBvciBub3QuXHJcbiAgICAgKiBAcGFyYW0gY2hyXHJcbiAgICAgKiBAcmV0dXJuIHBjdC1lbmNvZGVkIGNoYXJhY3RlclxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBlbmNvZGVDaGFyYWN0ZXIgKGNocikge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSAnJyxcclxuICAgICAgICAgICAgb2N0ZXRzID0gdXRmOC5lbmNvZGUoY2hyKSxcclxuICAgICAgICAgICAgb2N0ZXQsXHJcbiAgICAgICAgICAgIGluZGV4O1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IG9jdGV0cy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgb2N0ZXQgPSBvY3RldHMuY2hhckNvZGVBdChpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSAnJScgKyAob2N0ZXQgPCAweDEwID8gJzAnIDogJycpICsgb2N0ZXQudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zLCB3aGV0aGVyIHRoZSBnaXZlbiB0ZXh0IGF0IHN0YXJ0IGlzIGluIHRoZSBmb3JtICdwZXJjZW50IGhleC1kaWdpdCBoZXgtZGlnaXQnLCBsaWtlICclM0YnXHJcbiAgICAgKiBAcGFyYW0gdGV4dFxyXG4gICAgICogQHBhcmFtIHN0YXJ0XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufCp8Kn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNQZXJjZW50RGlnaXREaWdpdCAodGV4dCwgc3RhcnQpIHtcclxuICAgICAgICByZXR1cm4gdGV4dC5jaGFyQXQoc3RhcnQpID09PSAnJScgJiYgY2hhckhlbHBlci5pc0hleERpZ2l0KHRleHQuY2hhckF0KHN0YXJ0ICsgMSkpICYmIGNoYXJIZWxwZXIuaXNIZXhEaWdpdCh0ZXh0LmNoYXJBdChzdGFydCArIDIpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyBhIGhleCBudW1iZXIgZnJvbSBzdGFydCB3aXRoIGxlbmd0aCAyLlxyXG4gICAgICogQHBhcmFtIHRleHQgYSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBzdGFydCB0aGUgc3RhcnQgaW5kZXggb2YgdGhlIDItZGlnaXQgaGV4IG51bWJlclxyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZUhleDIgKHRleHQsIHN0YXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRleHQuc3Vic3RyKHN0YXJ0LCAyKSwgMTYpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gY2hhciBzZXF1ZW5jZSBpcyBhIGNvcnJlY3RseSBwY3QtZW5jb2RlZCBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBjaHJcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzUGN0RW5jb2RlZCAoY2hyKSB7XHJcbiAgICAgICAgaWYgKCFpc1BlcmNlbnREaWdpdERpZ2l0KGNociwgMCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZmlyc3RDaGFyQ29kZSA9IHBhcnNlSGV4MihjaHIsIDEpO1xyXG4gICAgICAgIHZhciBudW1CeXRlcyA9IHV0ZjgubnVtQnl0ZXMoZmlyc3RDaGFyQ29kZSk7XHJcbiAgICAgICAgaWYgKG51bUJ5dGVzID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgYnl0ZU51bWJlciA9IDE7IGJ5dGVOdW1iZXIgPCBudW1CeXRlczsgYnl0ZU51bWJlciArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNQZXJjZW50RGlnaXREaWdpdChjaHIsIDMqYnl0ZU51bWJlcikgfHwgIXV0ZjguaXNWYWxpZEZvbGxvd2luZ0NoYXJDb2RlKHBhcnNlSGV4MihjaHIsIDMqYnl0ZU51bWJlciArIDEpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZHMgYXMgbXVjaCBhcyBuZWVkZWQgZnJvbSB0aGUgdGV4dCwgZS5nLiAnJTIwJyBvciAnJUMzJUI2Jy4gSXQgZG9lcyBub3QgZGVjb2RlIVxyXG4gICAgICogQHBhcmFtIHRleHRcclxuICAgICAqIEBwYXJhbSBzdGFydEluZGV4XHJcbiAgICAgKiBAcmV0dXJuIHRoZSBjaGFyYWN0ZXIgb3IgcGN0LXN0cmluZyBvZiB0aGUgdGV4dCBhdCBzdGFydEluZGV4XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBjdENoYXJBdCh0ZXh0LCBzdGFydEluZGV4KSB7XHJcbiAgICAgICAgdmFyIGNociA9IHRleHQuY2hhckF0KHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgIGlmICghaXNQZXJjZW50RGlnaXREaWdpdCh0ZXh0LCBzdGFydEluZGV4KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2hyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdXRmOENoYXJDb2RlID0gcGFyc2VIZXgyKHRleHQsIHN0YXJ0SW5kZXggKyAxKTtcclxuICAgICAgICB2YXIgbnVtQnl0ZXMgPSB1dGY4Lm51bUJ5dGVzKHV0ZjhDaGFyQ29kZSk7XHJcbiAgICAgICAgaWYgKG51bUJ5dGVzID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjaHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGJ5dGVOdW1iZXIgPSAxOyBieXRlTnVtYmVyIDwgbnVtQnl0ZXM7IGJ5dGVOdW1iZXIgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzUGVyY2VudERpZ2l0RGlnaXQodGV4dCwgc3RhcnRJbmRleCArIDMgKiBieXRlTnVtYmVyKSB8fCAhdXRmOC5pc1ZhbGlkRm9sbG93aW5nQ2hhckNvZGUocGFyc2VIZXgyKHRleHQsIHN0YXJ0SW5kZXggKyAzICogYnl0ZU51bWJlciArIDEpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNocjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGV4dC5zdWJzdHIoc3RhcnRJbmRleCwgMyAqIG51bUJ5dGVzKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGVuY29kZUNoYXJhY3RlcjogZW5jb2RlQ2hhcmFjdGVyLFxyXG4gICAgICAgIGlzUGN0RW5jb2RlZDogaXNQY3RFbmNvZGVkLFxyXG4gICAgICAgIHBjdENoYXJBdDogcGN0Q2hhckF0XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxudmFyIHJmY0NoYXJIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiBhbiBjaGFyYWN0ZXIgaXMgYW4gdmFyY2hhciBjaGFyYWN0ZXIgYWNjb3JkaW5nIDIuMyBvZiByZmMgNjU3MFxyXG4gICAgICogQHBhcmFtIGNoclxyXG4gICAgICogQHJldHVybiAoQm9vbGVhbilcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNWYXJjaGFyIChjaHIpIHtcclxuICAgICAgICByZXR1cm4gY2hhckhlbHBlci5pc0FscGhhKGNocikgfHwgY2hhckhlbHBlci5pc0RpZ2l0KGNocikgfHwgY2hyID09PSAnXycgfHwgcGN0RW5jb2Rlci5pc1BjdEVuY29kZWQoY2hyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgY2hyIGlzIGFuIHVucmVzZXJ2ZWQgY2hhcmFjdGVyIGFjY29yZGluZyAxLjUgb2YgcmZjIDY1NzBcclxuICAgICAqIEBwYXJhbSBjaHJcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVW5yZXNlcnZlZCAoY2hyKSB7XHJcbiAgICAgICAgcmV0dXJuIGNoYXJIZWxwZXIuaXNBbHBoYShjaHIpIHx8IGNoYXJIZWxwZXIuaXNEaWdpdChjaHIpIHx8IGNociA9PT0gJy0nIHx8IGNociA9PT0gJy4nIHx8IGNociA9PT0gJ18nIHx8IGNociA9PT0gJ34nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiBjaHIgaXMgYW4gcmVzZXJ2ZWQgY2hhcmFjdGVyIGFjY29yZGluZyAxLjUgb2YgcmZjIDY1NzBcclxuICAgICAqIG9yIHRoZSBwZXJjZW50IGNoYXJhY3RlciBtZW50aW9uZWQgaW4gMy4yLjEuXHJcbiAgICAgKiBAcGFyYW0gY2hyXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1Jlc2VydmVkIChjaHIpIHtcclxuICAgICAgICByZXR1cm4gY2hyID09PSAnOicgfHwgY2hyID09PSAnLycgfHwgY2hyID09PSAnPycgfHwgY2hyID09PSAnIycgfHwgY2hyID09PSAnWycgfHwgY2hyID09PSAnXScgfHwgY2hyID09PSAnQCcgfHwgY2hyID09PSAnIScgfHwgY2hyID09PSAnJCcgfHwgY2hyID09PSAnJicgfHwgY2hyID09PSAnKCcgfHxcclxuICAgICAgICAgICAgY2hyID09PSAnKScgfHwgY2hyID09PSAnKicgfHwgY2hyID09PSAnKycgfHwgY2hyID09PSAnLCcgfHwgY2hyID09PSAnOycgfHwgY2hyID09PSAnPScgfHwgY2hyID09PSBcIidcIjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFyY2hhcjogaXNWYXJjaGFyLFxyXG4gICAgICAgIGlzVW5yZXNlcnZlZDogaXNVbnJlc2VydmVkLFxyXG4gICAgICAgIGlzUmVzZXJ2ZWQ6IGlzUmVzZXJ2ZWRcclxuICAgIH07XHJcblxyXG59KCkpO1xyXG5cclxuLyoqXHJcbiAqIGVuY29kaW5nIG9mIHJmYyA2NTcwXHJcbiAqL1xyXG52YXIgZW5jb2RpbmdIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZSAodGV4dCwgcGFzc1Jlc2VydmVkKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnLFxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgY2hyID0gJyc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0ZXh0ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB0ZXh0ID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0ZXh0Lmxlbmd0aDsgaW5kZXggKz0gY2hyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjaHIgPSB0ZXh0LmNoYXJBdChpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSByZmNDaGFySGVscGVyLmlzVW5yZXNlcnZlZChjaHIpIHx8IChwYXNzUmVzZXJ2ZWQgJiYgcmZjQ2hhckhlbHBlci5pc1Jlc2VydmVkKGNocikpID8gY2hyIDogcGN0RW5jb2Rlci5lbmNvZGVDaGFyYWN0ZXIoY2hyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGVQYXNzUmVzZXJ2ZWQgKHRleHQpIHtcclxuICAgICAgICByZXR1cm4gZW5jb2RlKHRleHQsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZUxpdGVyYWxDaGFyYWN0ZXIgKGxpdGVyYWwsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIGNociA9IHBjdEVuY29kZXIucGN0Q2hhckF0KGxpdGVyYWwsIGluZGV4KTtcclxuICAgICAgICBpZiAoY2hyLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNocjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZmNDaGFySGVscGVyLmlzUmVzZXJ2ZWQoY2hyKSB8fCByZmNDaGFySGVscGVyLmlzVW5yZXNlcnZlZChjaHIpID8gY2hyIDogcGN0RW5jb2Rlci5lbmNvZGVDaGFyYWN0ZXIoY2hyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlTGl0ZXJhbCAobGl0ZXJhbCkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSAnJyxcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIGNociA9ICcnO1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGxpdGVyYWwubGVuZ3RoOyBpbmRleCArPSBjaHIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNociA9IHBjdEVuY29kZXIucGN0Q2hhckF0KGxpdGVyYWwsIGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKGNoci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gY2hyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHJmY0NoYXJIZWxwZXIuaXNSZXNlcnZlZChjaHIpIHx8IHJmY0NoYXJIZWxwZXIuaXNVbnJlc2VydmVkKGNocikgPyBjaHIgOiBwY3RFbmNvZGVyLmVuY29kZUNoYXJhY3RlcihjaHIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICBlbmNvZGVQYXNzUmVzZXJ2ZWQ6IGVuY29kZVBhc3NSZXNlcnZlZCxcclxuICAgICAgICBlbmNvZGVMaXRlcmFsOiBlbmNvZGVMaXRlcmFsLFxyXG4gICAgICAgIGVuY29kZUxpdGVyYWxDaGFyYWN0ZXI6IGVuY29kZUxpdGVyYWxDaGFyYWN0ZXJcclxuICAgIH07XHJcblxyXG59KCkpO1xyXG5cclxuXHJcbi8vIHRoZSBvcGVyYXRvcnMgZGVmaW5lZCBieSByZmMgNjU3MFxyXG52YXIgb3BlcmF0b3JzID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXJcclxuICAgICAgICBieVN5bWJvbCA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZSAoc3ltYm9sKSB7XHJcbiAgICAgICAgYnlTeW1ib2xbc3ltYm9sXSA9IHtcclxuICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXHJcbiAgICAgICAgICAgIHNlcGFyYXRvcjogKHN5bWJvbCA9PT0gJz8nKSA/ICcmJyA6IChzeW1ib2wgPT09ICcnIHx8IHN5bWJvbCA9PT0gJysnIHx8IHN5bWJvbCA9PT0gJyMnKSA/ICcsJyA6IHN5bWJvbCxcclxuICAgICAgICAgICAgbmFtZWQ6IHN5bWJvbCA9PT0gJzsnIHx8IHN5bWJvbCA9PT0gJyYnIHx8IHN5bWJvbCA9PT0gJz8nLFxyXG4gICAgICAgICAgICBpZkVtcHR5OiAoc3ltYm9sID09PSAnJicgfHwgc3ltYm9sID09PSAnPycpID8gJz0nIDogJycsXHJcbiAgICAgICAgICAgIGZpcnN0OiAoc3ltYm9sID09PSAnKycgKSA/ICcnIDogc3ltYm9sLFxyXG4gICAgICAgICAgICBlbmNvZGU6IChzeW1ib2wgPT09ICcrJyB8fCBzeW1ib2wgPT09ICcjJykgPyBlbmNvZGluZ0hlbHBlci5lbmNvZGVQYXNzUmVzZXJ2ZWQgOiBlbmNvZGluZ0hlbHBlci5lbmNvZGUsXHJcbiAgICAgICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2w7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZSgnJyk7XHJcbiAgICBjcmVhdGUoJysnKTtcclxuICAgIGNyZWF0ZSgnIycpO1xyXG4gICAgY3JlYXRlKCcuJyk7XHJcbiAgICBjcmVhdGUoJy8nKTtcclxuICAgIGNyZWF0ZSgnOycpO1xyXG4gICAgY3JlYXRlKCc/Jyk7XHJcbiAgICBjcmVhdGUoJyYnKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsdWVPZjogZnVuY3Rpb24gKGNocikge1xyXG4gICAgICAgICAgICBpZiAoYnlTeW1ib2xbY2hyXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5U3ltYm9sW2Nocl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKFwiPSwhQHxcIi5pbmRleE9mKGNocikgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGJ5U3ltYm9sWycnXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBEZXRlY3RzLCB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCBpcyBkZWZpbmVkIGluIHRoZSBzZW5zZSBvZiByZmMgNjU3MFxyXG4gKiBTZWN0aW9uIDIuMyBvZiB0aGUgUkZDIG1ha2VzIGNsZWFyIGRlZmludGlvbnM6XHJcbiAqICogdW5kZWZpbmVkIGFuZCBudWxsIGFyZSBub3QgZGVmaW5lZC5cclxuICogKiB0aGUgZW1wdHkgc3RyaW5nIGlzIGRlZmluZWRcclxuICogKiBhbiBhcnJheSAoXCJsaXN0XCIpIGlzIGRlZmluZWQsIGlmIGl0IGlzIG5vdCBlbXB0eSAoZXZlbiBpZiBhbGwgZWxlbWVudHMgYXJlIG5vdCBkZWZpbmVkKVxyXG4gKiAqIGFuIG9iamVjdCAoXCJtYXBcIikgaXMgZGVmaW5lZCwgaWYgaXQgY29udGFpbnMgYXQgbGVhc3Qgb25lIHByb3BlcnR5IHdpdGggZGVmaW5lZCB2YWx1ZVxyXG4gKiBAcGFyYW0gb2JqZWN0XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc0RlZmluZWQgKG9iamVjdCkge1xyXG4gICAgdmFyXHJcbiAgICAgICAgcHJvcGVydHlOYW1lO1xyXG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCB8fCBvYmplY3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChvYmplY3RIZWxwZXIuaXNBcnJheShvYmplY3QpKSB7XHJcbiAgICAgICAgLy8gU2VjdGlvbiAyLjM6IEEgdmFyaWFibGUgZGVmaW5lZCBhcyBhIGxpc3QgdmFsdWUgaXMgY29uc2lkZXJlZCB1bmRlZmluZWQgaWYgdGhlIGxpc3QgY29udGFpbnMgemVybyBtZW1iZXJzXHJcbiAgICAgICAgcmV0dXJuIG9iamVjdC5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2Ygb2JqZWN0ID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgIC8vIGZhbHN5IHZhbHVlcyBsaWtlIGVtcHR5IHN0cmluZ3MsIGZhbHNlIG9yIDAgYXJlIFwiZGVmaW5lZFwiXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvLyBlbHNlIE9iamVjdFxyXG4gICAgZm9yIChwcm9wZXJ0eU5hbWUgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpICYmIGlzRGVmaW5lZChvYmplY3RbcHJvcGVydHlOYW1lXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG52YXIgTGl0ZXJhbEV4cHJlc3Npb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGl0ZXJhbEV4cHJlc3Npb24gKGxpdGVyYWwpIHtcclxuICAgICAgICB0aGlzLmxpdGVyYWwgPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKGxpdGVyYWwpO1xyXG4gICAgfVxyXG5cclxuICAgIExpdGVyYWxFeHByZXNzaW9uLnByb3RvdHlwZS5leHBhbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGl0ZXJhbDtcclxuICAgIH07XHJcblxyXG4gICAgTGl0ZXJhbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gTGl0ZXJhbEV4cHJlc3Npb24ucHJvdG90eXBlLmV4cGFuZDtcclxuXHJcbiAgICByZXR1cm4gTGl0ZXJhbEV4cHJlc3Npb247XHJcbn0oKSk7XHJcblxyXG52YXIgcGFyc2UgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlRXhwcmVzc2lvbiAoZXhwcmVzc2lvblRleHQpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgb3BlcmF0b3IsXHJcbiAgICAgICAgICAgIHZhcnNwZWNzID0gW10sXHJcbiAgICAgICAgICAgIHZhcnNwZWMgPSBudWxsLFxyXG4gICAgICAgICAgICB2YXJuYW1lU3RhcnQgPSBudWxsLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGhTdGFydCA9IG51bGwsXHJcbiAgICAgICAgICAgIGluZGV4LFxyXG4gICAgICAgICAgICBjaHIgPSAnJztcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xvc2VWYXJuYW1lICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhcm5hbWUgPSBleHByZXNzaW9uVGV4dC5zdWJzdHJpbmcodmFybmFtZVN0YXJ0LCBpbmRleCk7XHJcbiAgICAgICAgICAgIGlmICh2YXJuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJhIHZhcm5hbWUgbXVzdCBiZSBzcGVjaWZpZWRcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyc3BlYyA9IHt2YXJuYW1lOiB2YXJuYW1lLCBleHBsb2RlZDogZmFsc2UsIG1heExlbmd0aDogbnVsbH07XHJcbiAgICAgICAgICAgIHZhcm5hbWVTdGFydCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjbG9zZU1heExlbmd0aCAoKSB7XHJcbiAgICAgICAgICAgIGlmIChtYXhMZW5ndGhTdGFydCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYWZ0ZXIgYSAnOicgeW91IGhhdmUgdG8gc3BlY2lmeSB0aGUgbGVuZ3RoXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhcnNwZWMubWF4TGVuZ3RoID0gcGFyc2VJbnQoZXhwcmVzc2lvblRleHQuc3Vic3RyaW5nKG1heExlbmd0aFN0YXJ0LCBpbmRleCksIDEwKTtcclxuICAgICAgICAgICAgbWF4TGVuZ3RoU3RhcnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3BlcmF0b3IgPSAoZnVuY3Rpb24gKG9wZXJhdG9yVGV4dCkge1xyXG4gICAgICAgICAgICB2YXIgb3AgPSBvcGVyYXRvcnMudmFsdWVPZihvcGVyYXRvclRleHQpO1xyXG4gICAgICAgICAgICBpZiAob3AgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiaWxsZWdhbCB1c2Ugb2YgcmVzZXJ2ZWQgb3BlcmF0b3JcIiwgcG9zaXRpb246IGluZGV4LCBvcGVyYXRvcjogb3BlcmF0b3JUZXh0fSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG9wO1xyXG4gICAgICAgIH0oZXhwcmVzc2lvblRleHQuY2hhckF0KDApKSk7XHJcbiAgICAgICAgaW5kZXggPSBvcGVyYXRvci5zeW1ib2wubGVuZ3RoO1xyXG5cclxuICAgICAgICB2YXJuYW1lU3RhcnQgPSBpbmRleDtcclxuXHJcbiAgICAgICAgZm9yICg7IGluZGV4IDwgZXhwcmVzc2lvblRleHQubGVuZ3RoOyBpbmRleCArPSBjaHIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNociA9IHBjdEVuY29kZXIucGN0Q2hhckF0KGV4cHJlc3Npb25UZXh0LCBpbmRleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodmFybmFtZVN0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3BlYyBzYXlzOiB2YXJuYW1lID0gIHZhcmNoYXIgKiggW1wiLlwiXSB2YXJjaGFyIClcclxuICAgICAgICAgICAgICAgIC8vIHNvIGEgZG90IGlzIGFsbG93ZWQgZXhjZXB0IGZvciB0aGUgZmlyc3QgY2hhclxyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJy4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhcm5hbWVTdGFydCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJhIHZhcm5hbWUgTVVTVCBOT1Qgc3RhcnQgd2l0aCBhIGRvdFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocmZjQ2hhckhlbHBlci5pc1ZhcmNoYXIoY2hyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2xvc2VWYXJuYW1lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1heExlbmd0aFN0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IG1heExlbmd0aFN0YXJ0ICYmIGNociA9PT0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJBIDpwcmVmaXggbXVzdCBub3Qgc3RhcnQgd2l0aCBkaWdpdCAwXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJIZWxwZXIuaXNEaWdpdChjaHIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IC0gbWF4TGVuZ3RoU3RhcnQgPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcIkEgOnByZWZpeCBtdXN0IGhhdmUgbWF4IDQgZGlnaXRzXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNsb3NlTWF4TGVuZ3RoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNociA9PT0gJzonKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFyc3BlYy5tYXhMZW5ndGggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcIm9ubHkgb25lIDptYXhMZW5ndGggaXMgYWxsb3dlZCBwZXIgdmFyc3BlY1wiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjLmV4cGxvZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJhbiBleHBsb2VkZWQgdmFyc3BlYyBNVVNUIE5PVCBiZSB2YXJzcGVjZWRcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGhTdGFydCA9IGluZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaHIgPT09ICcqJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhcnNwZWMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcImV4cGxvZGVkIHdpdGhvdXQgdmFyc3BlY1wiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjLmV4cGxvZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJleHBsb2RlZCB0d2ljZVwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjLm1heExlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYW4gZXhwbG9kZSAoKikgTVVTVCBOT1QgZm9sbG93IHRvIGEgcHJlZml4XCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyc3BlYy5leHBsb2RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0aGUgb25seSBsZWdhbCBjaGFyYWN0ZXIgbm93IGlzIHRoZSBjb21tYVxyXG4gICAgICAgICAgICBpZiAoY2hyID09PSAnLCcpIHtcclxuICAgICAgICAgICAgICAgIHZhcnNwZWNzLnB1c2godmFyc3BlYyk7XHJcbiAgICAgICAgICAgICAgICB2YXJzcGVjID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhcm5hbWVTdGFydCA9IGluZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiaWxsZWdhbCBjaGFyYWN0ZXJcIiwgY2hhcmFjdGVyOiBjaHIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgIH0gLy8gZm9yIGNoclxyXG4gICAgICAgIGlmICh2YXJuYW1lU3RhcnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2xvc2VWYXJuYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXhMZW5ndGhTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjbG9zZU1heExlbmd0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXJzcGVjcy5wdXNoKHZhcnNwZWMpO1xyXG4gICAgICAgIHJldHVybiBuZXcgVmFyaWFibGVFeHByZXNzaW9uKGV4cHJlc3Npb25UZXh0LCBvcGVyYXRvciwgdmFyc3BlY3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlICh1cmlUZW1wbGF0ZVRleHQpIHtcclxuICAgICAgICAvLyBhc3NlcnQgZmlsbGVkIHN0cmluZ1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgY2hyLFxyXG4gICAgICAgICAgICBleHByZXNzaW9ucyA9IFtdLFxyXG4gICAgICAgICAgICBicmFjZU9wZW5JbmRleCA9IG51bGwsXHJcbiAgICAgICAgICAgIGxpdGVyYWxTdGFydCA9IDA7XHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdXJpVGVtcGxhdGVUZXh0Lmxlbmd0aDsgaW5kZXggKz0gMSkge1xyXG4gICAgICAgICAgICBjaHIgPSB1cmlUZW1wbGF0ZVRleHQuY2hhckF0KGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKGxpdGVyYWxTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJ30nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcInVub3BlbmVkIGJyYWNlIGNsb3NlZFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaHIgPT09ICd7Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXRlcmFsU3RhcnQgPCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9ucy5wdXNoKG5ldyBMaXRlcmFsRXhwcmVzc2lvbih1cmlUZW1wbGF0ZVRleHQuc3Vic3RyaW5nKGxpdGVyYWxTdGFydCwgaW5kZXgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxpdGVyYWxTdGFydCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJhY2VPcGVuSW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJhY2VPcGVuSW5kZXggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIGhlcmUganVzdCB7IGlzIGZvcmJpZGRlblxyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJ3snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcImJyYWNlIGFscmVhZHkgb3BlbmVkXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJ30nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJyYWNlT3BlbkluZGV4ICsgMSA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcImVtcHR5IGJyYWNlc1wiLCBwb3NpdGlvbjogYnJhY2VPcGVuSW5kZXh9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbnMucHVzaChwYXJzZUV4cHJlc3Npb24odXJpVGVtcGxhdGVUZXh0LnN1YnN0cmluZyhicmFjZU9wZW5JbmRleCArIDEsIGluZGV4KSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yLnByb3RvdHlwZSA9PT0gVXJpVGVtcGxhdGVFcnJvci5wcm90b3R5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHt0ZW1wbGF0ZVRleHQ6IHVyaVRlbXBsYXRlVGV4dCwgbWVzc2FnZTogZXJyb3Iub3B0aW9ucy5tZXNzYWdlLCBwb3NpdGlvbjogYnJhY2VPcGVuSW5kZXggKyBlcnJvci5vcHRpb25zLnBvc2l0aW9uLCBkZXRhaWxzOiBlcnJvci5vcHRpb25zfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyYWNlT3BlbkluZGV4ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBsaXRlcmFsU3RhcnQgPSBpbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgdW5yZWFjaGFibGUgY29kZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnJhY2VPcGVuSW5kZXggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcInVuY2xvc2VkIGJyYWNlXCIsIHBvc2l0aW9uOiBicmFjZU9wZW5JbmRleH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGl0ZXJhbFN0YXJ0IDwgdXJpVGVtcGxhdGVUZXh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBleHByZXNzaW9ucy5wdXNoKG5ldyBMaXRlcmFsRXhwcmVzc2lvbih1cmlUZW1wbGF0ZVRleHQuc3Vic3RyKGxpdGVyYWxTdGFydCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBVcmlUZW1wbGF0ZSh1cmlUZW1wbGF0ZVRleHQsIGV4cHJlc3Npb25zKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGFyc2U7XHJcbn0oKSk7XHJcblxyXG52YXIgVmFyaWFibGVFeHByZXNzaW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIGhlbHBlciBmdW5jdGlvbiBpZiBKU09OIGlzIG5vdCBhdmFpbGFibGVcclxuICAgIGZ1bmN0aW9uIHByZXR0eVByaW50ICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiAoSlNPTiAmJiBKU09OLnN0cmluZ2lmeSkgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgOiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0VtcHR5ICh2YWx1ZSkge1xyXG4gICAgICAgIGlmICghaXNEZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc1N0cmluZyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc051bWJlcih2YWx1ZSkgfHwgb2JqZWN0SGVscGVyLmlzQm9vbGVhbih2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2JqZWN0SGVscGVyLmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiB2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByb3BlcnR5QXJyYXkgKG9iamVjdCkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSBbXSxcclxuICAgICAgICAgICAgcHJvcGVydHlOYW1lO1xyXG4gICAgICAgIGZvciAocHJvcGVydHlOYW1lIGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtuYW1lOiBwcm9wZXJ0eU5hbWUsIHZhbHVlOiBvYmplY3RbcHJvcGVydHlOYW1lXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gVmFyaWFibGVFeHByZXNzaW9uICh0ZW1wbGF0ZVRleHQsIG9wZXJhdG9yLCB2YXJzcGVjcykge1xyXG4gICAgICAgIHRoaXMudGVtcGxhdGVUZXh0ID0gdGVtcGxhdGVUZXh0O1xyXG4gICAgICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcclxuICAgICAgICB0aGlzLnZhcnNwZWNzID0gdmFyc3BlY3M7XHJcbiAgICB9XHJcblxyXG4gICAgVmFyaWFibGVFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVRleHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGV4cGFuZFNpbXBsZVZhbHVlKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKG9wZXJhdG9yLm5hbWVkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKHZhcnNwZWMudmFybmFtZSk7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBvcGVyYXRvci5pZkVtcHR5O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gJz0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFyc3BlYy5tYXhMZW5ndGggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMCwgdmFyc3BlYy5tYXhMZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQgKz0gb3BlcmF0b3IuZW5jb2RlKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHZhbHVlRGVmaW5lZCAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGlzRGVmaW5lZChuYW1lVmFsdWUudmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGV4cGFuZE5vdEV4cGxvZGVkKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBhcnIgPSBbXSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgaWYgKG9wZXJhdG9yLm5hbWVkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKHZhcnNwZWMudmFybmFtZSk7XHJcbiAgICAgICAgICAgIGlmIChpc0VtcHR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IG9wZXJhdG9yLmlmRW1wdHk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSAnPSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvYmplY3RIZWxwZXIuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgYXJyID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCBpc0RlZmluZWQpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgb3BlcmF0b3IuZW5jb2RlKTtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IG9iamVjdEhlbHBlci5qb2luKGFyciwgJywnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFyciA9IHByb3BlcnR5QXJyYXkodmFsdWUpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIuZmlsdGVyKGFyciwgdmFsdWVEZWZpbmVkKTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLm1hcChhcnIsIGZ1bmN0aW9uIChuYW1lVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRvci5lbmNvZGUobmFtZVZhbHVlLm5hbWUpICsgJywnICsgb3BlcmF0b3IuZW5jb2RlKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gb2JqZWN0SGVscGVyLmpvaW4oYXJyLCAnLCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGV4cGFuZEV4cGxvZGVkTmFtZWQgKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBpc0FycmF5ID0gb2JqZWN0SGVscGVyLmlzQXJyYXkodmFsdWUpLFxyXG4gICAgICAgICAgICBhcnIgPSBbXTtcclxuICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICBhcnIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIGlzRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBmdW5jdGlvbiAobGlzdEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKHZhcnNwZWMudmFybmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShsaXN0RWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gb3BlcmF0b3IuaWZFbXB0eTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtcCArPSAnPScgKyBvcGVyYXRvci5lbmNvZGUobGlzdEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRtcDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhcnIgPSBwcm9wZXJ0eUFycmF5KHZhbHVlKTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIHZhbHVlRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBmdW5jdGlvbiAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gZW5jb2RpbmdIZWxwZXIuZW5jb2RlTGl0ZXJhbChuYW1lVmFsdWUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShuYW1lVmFsdWUudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG1wICs9IG9wZXJhdG9yLmlmRW1wdHk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gJz0nICsgb3BlcmF0b3IuZW5jb2RlKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG1wO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdEhlbHBlci5qb2luKGFyciwgb3BlcmF0b3Iuc2VwYXJhdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmRFeHBsb2RlZFVubmFtZWQgKG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBhcnIgPSBbXSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICBhcnIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIGlzRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBvcGVyYXRvci5lbmNvZGUpO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gb2JqZWN0SGVscGVyLmpvaW4oYXJyLCBvcGVyYXRvci5zZXBhcmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXJyID0gcHJvcGVydHlBcnJheSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCBmdW5jdGlvbiAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNEZWZpbmVkKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgZnVuY3Rpb24gKG5hbWVWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmVuY29kZShuYW1lVmFsdWUubmFtZSkgKyAnPScgKyBvcGVyYXRvci5lbmNvZGUobmFtZVZhbHVlLnZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBvYmplY3RIZWxwZXIuam9pbihhcnIsIG9wZXJhdG9yLnNlcGFyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIFZhcmlhYmxlRXhwcmVzc2lvbi5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24gKHZhcmlhYmxlcykge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBleHBhbmRlZCA9IFtdLFxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgdmFyc3BlYyxcclxuICAgICAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgICAgIHZhbHVlSXNBcnIsXHJcbiAgICAgICAgICAgIG9uZUV4cGxvZGVkID0gZmFsc2UsXHJcbiAgICAgICAgICAgIG9wZXJhdG9yID0gdGhpcy5vcGVyYXRvcjtcclxuXHJcbiAgICAgICAgLy8gZXhwYW5kIGVhY2ggdmFyc3BlYyBhbmQgam9pbiB3aXRoIG9wZXJhdG9yJ3Mgc2VwYXJhdG9yXHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGhpcy52YXJzcGVjcy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyc3BlYyA9IHRoaXMudmFyc3BlY3NbaW5kZXhdO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHZhcmlhYmxlc1t2YXJzcGVjLnZhcm5hbWVdO1xyXG4gICAgICAgICAgICAvLyBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgLy8gaWYgKHZhcmlhYmxlcy5oYXNPd25Qcm9wZXJ0eSh2YXJzcGVjLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFyc3BlYy5leHBsb2RlZCkge1xyXG4gICAgICAgICAgICAgICAgb25lRXhwbG9kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhbHVlSXNBcnIgPSBvYmplY3RIZWxwZXIuaXNBcnJheSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAgICAgICAgIGV4cGFuZGVkLnB1c2goZXhwYW5kU2ltcGxlVmFsdWUodmFyc3BlYywgb3BlcmF0b3IsIHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodmFyc3BlYy5tYXhMZW5ndGggJiYgaXNEZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gMi40LjEgb2YgdGhlIHNwZWMgc2F5czogXCJQcmVmaXggbW9kaWZpZXJzIGFyZSBub3QgYXBwbGljYWJsZSB0byB2YXJpYWJsZXMgdGhhdCBoYXZlIGNvbXBvc2l0ZSB2YWx1ZXMuXCJcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJlZml4IG1vZGlmaWVycyBhcmUgbm90IGFwcGxpY2FibGUgdG8gdmFyaWFibGVzIHRoYXQgaGF2ZSBjb21wb3NpdGUgdmFsdWVzLiBZb3UgdHJpZWQgdG8gZXhwYW5kICcgKyB0aGlzICsgXCIgd2l0aCBcIiArIHByZXR0eVByaW50KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIXZhcnNwZWMuZXhwbG9kZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvci5uYW1lZCB8fCAhaXNFbXB0eSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRlZC5wdXNoKGV4cGFuZE5vdEV4cGxvZGVkKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvci5uYW1lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkLnB1c2goZXhwYW5kRXhwbG9kZWROYW1lZCh2YXJzcGVjLCBvcGVyYXRvciwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkLnB1c2goZXhwYW5kRXhwbG9kZWRVbm5hbWVkKG9wZXJhdG9yLCB2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXhwYW5kZWQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmZpcnN0ICsgb2JqZWN0SGVscGVyLmpvaW4oZXhwYW5kZWQsIG9wZXJhdG9yLnNlcGFyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gVmFyaWFibGVFeHByZXNzaW9uO1xyXG59KCkpO1xyXG5cclxudmFyIFVyaVRlbXBsYXRlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFVyaVRlbXBsYXRlICh0ZW1wbGF0ZVRleHQsIGV4cHJlc3Npb25zKSB7XHJcbiAgICAgICAgdGhpcy50ZW1wbGF0ZVRleHQgPSB0ZW1wbGF0ZVRleHQ7XHJcbiAgICAgICAgdGhpcy5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xyXG4gICAgICAgIG9iamVjdEhlbHBlci5kZWVwRnJlZXplKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIFVyaVRlbXBsYXRlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVRleHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFVyaVRlbXBsYXRlLnByb3RvdHlwZS5leHBhbmQgPSBmdW5jdGlvbiAodmFyaWFibGVzKSB7XHJcbiAgICAgICAgLy8gdGhpcy5leHByZXNzaW9ucy5tYXAoZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtyZXR1cm4gZXhwcmVzc2lvbi5leHBhbmQodmFyaWFibGVzKTt9KS5qb2luKCcnKTtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZXhwcmVzc2lvbnMubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSB0aGlzLmV4cHJlc3Npb25zW2luZGV4XS5leHBhbmQodmFyaWFibGVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcblxyXG4gICAgVXJpVGVtcGxhdGUucGFyc2UgPSBwYXJzZTtcclxuICAgIFVyaVRlbXBsYXRlLlVyaVRlbXBsYXRlRXJyb3IgPSBVcmlUZW1wbGF0ZUVycm9yO1xyXG4gICAgcmV0dXJuIFVyaVRlbXBsYXRlO1xyXG59KCkpO1xyXG5cclxuICAgIGV4cG9ydENhbGxiYWNrKFVyaVRlbXBsYXRlKTtcclxuXHJcbn0oZnVuY3Rpb24gKFVyaVRlbXBsYXRlKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy8gZXhwb3J0IFVyaVRlbXBsYXRlLCB3aGVuIG1vZHVsZSBpcyBwcmVzZW50LCBvciBwYXNzIGl0IHRvIHdpbmRvdyBvciBnbG9iYWxcclxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IFVyaVRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgZGVmaW5lKFtdLGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFVyaVRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICB3aW5kb3cuVXJpVGVtcGxhdGUgPSBVcmlUZW1wbGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdsb2JhbC5VcmlUZW1wbGF0ZSA9IFVyaVRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuKSk7XHJcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxMyBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuXG4vKipcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSBhdDpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogQGF1dGhvcjogQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3I6IEpvaG4gSGFublxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbigpIHtcblxuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlQWdncmVnYXRvcihyZXBvcnRlcikge1xuXHRcdHZhciBwcm9taXNlcywgbmV4dEtleTtcblxuXHRcdGZ1bmN0aW9uIFByb21pc2VTdGF0dXMocGFyZW50KSB7XG5cdFx0XHRpZighKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlU3RhdHVzKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2VTdGF0dXMocGFyZW50KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHN0YWNrSG9sZGVyO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRzdGFja0hvbGRlciA9IGU7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMua2V5ID0gbmV4dEtleSsrO1xuXHRcdFx0cHJvbWlzZXNbdGhpcy5rZXldID0gdGhpcztcblxuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHR0aGlzLnRpbWVzdGFtcCA9ICsobmV3IERhdGUoKSk7XG5cdFx0XHR0aGlzLmNyZWF0ZWRBdCA9IHN0YWNrSG9sZGVyO1xuXHRcdH1cblxuXHRcdFByb21pc2VTdGF0dXMucHJvdG90eXBlID0ge1xuXHRcdFx0b2JzZXJ2ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYodGhpcy5rZXkgaW4gcHJvbWlzZXMpIHtcblx0XHRcdFx0XHRkZWxldGUgcHJvbWlzZXNbdGhpcy5rZXldO1xuXHRcdFx0XHRcdHJlcG9ydCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlU3RhdHVzKHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bGZpbGxlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZih0aGlzLmtleSBpbiBwcm9taXNlcykge1xuXHRcdFx0XHRcdGRlbGV0ZSBwcm9taXNlc1t0aGlzLmtleV07XG5cdFx0XHRcdFx0cmVwb3J0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRyZWplY3RlZDogZnVuY3Rpb24gKHJlYXNvbikge1xuXHRcdFx0XHR2YXIgc3RhY2tIb2xkZXI7XG5cblx0XHRcdFx0aWYodGhpcy5rZXkgaW4gcHJvbWlzZXMpIHtcblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IocmVhc29uICYmIHJlYXNvbi5tZXNzYWdlIHx8IHJlYXNvbik7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0c3RhY2tIb2xkZXIgPSBlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMucmVhc29uID0gcmVhc29uO1xuXHRcdFx0XHRcdHRoaXMucmVqZWN0ZWRBdCA9IHN0YWNrSG9sZGVyO1xuXHRcdFx0XHRcdHJlcG9ydCgpO1xuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmVzZXQoKTtcblxuXHRcdHJldHVybiBwdWJsaXNoKHsgcHVibGlzaDogcHVibGlzaCB9KTtcblxuXHRcdGZ1bmN0aW9uIHB1Ymxpc2godGFyZ2V0KSB7XG5cdFx0XHR0YXJnZXQuUHJvbWlzZVN0YXR1cyA9IFByb21pc2VTdGF0dXM7XG5cdFx0XHR0YXJnZXQucmVwb3J0VW5oYW5kbGVkID0gcmVwb3J0O1xuXHRcdFx0dGFyZ2V0LnJlc2V0VW5oYW5kbGVkID0gcmVzZXQ7XG5cdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlcG9ydCgpIHtcblx0XHRcdHJldHVybiByZXBvcnRlcihwcm9taXNlcyk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVzZXQoKSB7XG5cdFx0XHRuZXh0S2V5ID0gMDtcblx0XHRcdHByb21pc2VzID0ge307IC8vIFNob3VsZCBiZSBXZWFrTWFwXG5cdFx0fVxuXHR9O1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDEzIG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG5cbi8qKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIGF0OlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBAYXV0aG9yOiBCcmlhbiBDYXZhbGllclxuICogQGF1dGhvcjogSm9obiBIYW5uXG4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0Ly8gU2lsbHkgQXJyYXkgaGVscGVycywgc2luY2Ugd2hlbi5qcyBuZWVkcyB0byBiZVxuXHQvLyBiYWNrd2FyZCBjb21wYXRpYmxlIHRvIEVTM1xuXG5cdHJldHVybiB7XG5cdFx0Zm9yRWFjaDogZm9yRWFjaCxcblx0XHRyZWR1Y2U6IHJlZHVjZVxuXHR9O1xuXG5cdGZ1bmN0aW9uIGZvckVhY2goYXJyYXksIGYpIHtcblx0XHRpZih0eXBlb2YgYXJyYXkuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIGFycmF5LmZvckVhY2goZik7XG5cdFx0fVxuXG5cdFx0dmFyIGksIGxlbjtcblxuXHRcdGkgPSAtMTtcblx0XHRsZW4gPSBhcnJheS5sZW5ndGg7XG5cblx0XHR3aGlsZSgrK2kgPCBsZW4pIHtcblx0XHRcdGYoYXJyYXlbaV0sIGksIGFycmF5KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZWR1Y2UoYXJyYXksIGluaXRpYWwsIGYpIHtcblx0XHRpZih0eXBlb2YgYXJyYXkucmVkdWNlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXR1cm4gYXJyYXkucmVkdWNlKGYsIGluaXRpYWwpO1xuXHRcdH1cblxuXHRcdHZhciBpLCBsZW4sIHJlc3VsdDtcblxuXHRcdGkgPSAtMTtcblx0XHRsZW4gPSBhcnJheS5sZW5ndGg7XG5cdFx0cmVzdWx0ID0gaW5pdGlhbDtcblxuXHRcdHdoaWxlKCsraSA8IGxlbikge1xuXHRcdFx0cmVzdWx0ID0gZihyZXN1bHQsIGFycmF5W2ldLCBpLCBhcnJheSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDEzIG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG5cbi8qKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIGF0OlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBAYXV0aG9yOiBCcmlhbiBDYXZhbGllclxuICogQGF1dGhvcjogSm9obiBIYW5uXG4gKi9cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKHJlcXVpcmUpIHtcblxuXHR2YXIgY3JlYXRlQWdncmVnYXRvciwgdGhyb3R0bGVSZXBvcnRlciwgc2ltcGxlUmVwb3J0ZXIsIGFnZ3JlZ2F0b3IsXG5cdFx0Zm9ybWF0dGVyLCBzdGFja0ZpbHRlciwgZXhjbHVkZVJ4LCBmaWx0ZXIsIHJlcG9ydGVyLCBsb2dnZXIsXG5cdFx0cmVqZWN0aW9uTXNnLCByZWFzb25Nc2csIGZpbHRlcmVkRnJhbWVzTXNnLCBzdGFja0p1bXBNc2csIGF0dGFjaFBvaW50O1xuXG5cdGNyZWF0ZUFnZ3JlZ2F0b3IgPSByZXF1aXJlKCcuL2FnZ3JlZ2F0b3InKTtcblx0dGhyb3R0bGVSZXBvcnRlciA9IHJlcXVpcmUoJy4vdGhyb3R0bGVkUmVwb3J0ZXInKTtcblx0c2ltcGxlUmVwb3J0ZXIgPSByZXF1aXJlKCcuL3NpbXBsZVJlcG9ydGVyJyk7XG5cdGZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2ltcGxlRm9ybWF0dGVyJyk7XG5cdHN0YWNrRmlsdGVyID0gcmVxdWlyZSgnLi9zdGFja0ZpbHRlcicpO1xuXHRsb2dnZXIgPSByZXF1aXJlKCcuL2xvZ2dlci9jb25zb2xlR3JvdXAnKTtcblxuXHRyZWplY3Rpb25Nc2cgPSAnPT09IFVuaGFuZGxlZCByZWplY3Rpb24gZXNjYXBlZCBhdCA9PT0nO1xuXHRyZWFzb25Nc2cgPSAnPT09IENhdXNlZCBieSByZWFzb24gPT09Jztcblx0c3RhY2tKdW1wTXNnID0gJyAgLS0tIG5ldyBjYWxsIHN0YWNrIC0tLSc7XG5cdGZpbHRlcmVkRnJhbWVzTXNnID0gJyAgLi4uW2ZpbHRlcmVkIGZyYW1lc10uLi4nO1xuXG5cdGV4Y2x1ZGVSeCA9IC93aGVuXFwuanN8KG1vZHVsZXxub2RlKVxcLmpzOlxcZHx3aGVuXFwvbW9uaXRvclxcLy9pO1xuXHRmaWx0ZXIgPSBzdGFja0ZpbHRlcihleGNsdWRlLCBtZXJnZVByb21pc2VGcmFtZXMpO1xuXHRyZXBvcnRlciA9IHNpbXBsZVJlcG9ydGVyKGZvcm1hdHRlcihmaWx0ZXIsIHJlamVjdGlvbk1zZywgcmVhc29uTXNnLCBzdGFja0p1bXBNc2cpLCBsb2dnZXIpO1xuXG5cdGFnZ3JlZ2F0b3IgPSBjcmVhdGVBZ2dyZWdhdG9yKHRocm90dGxlUmVwb3J0ZXIoMjAwLCByZXBvcnRlcikpO1xuXG5cdGF0dGFjaFBvaW50ID0gdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnXG5cdFx0PyBhZ2dyZWdhdG9yLnB1Ymxpc2goY29uc29sZSlcblx0XHQ6IGFnZ3JlZ2F0b3I7XG5cblx0cmV0dXJuIGFnZ3JlZ2F0b3I7XG5cblx0ZnVuY3Rpb24gbWVyZ2VQcm9taXNlRnJhbWVzKC8qIGZyYW1lcyAqLykge1xuXHRcdHJldHVybiBmaWx0ZXJlZEZyYW1lc01zZztcblx0fVxuXG5cdGZ1bmN0aW9uIGV4Y2x1ZGUobGluZSkge1xuXHRcdHZhciByeCA9IGF0dGFjaFBvaW50LnByb21pc2VTdGFja0ZpbHRlciB8fCBleGNsdWRlUng7XG5cdFx0cmV0dXJuIHJ4LnRlc3QobGluZSk7XG5cdH1cblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3I6IEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yOiBKb2huIEhhbm5cbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24ocmVxdWlyZSkge1xuXHQvKmpzaGludCBtYXhjb21wbGV4aXR5OjcqL1xuXG5cdHZhciBhcnJheSwgd2Fybiwgd2FybkFsbCwgbG9nO1xuXG5cdGFycmF5ID0gcmVxdWlyZSgnLi4vYXJyYXknKTtcblxuXHRpZih0eXBlb2YgY29uc29sZSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQvLyBObyBjb25zb2xlLCBnaXZlIHVwLCBidXQgYXQgbGVhc3QgZG9uJ3QgYnJlYWtcblx0XHRsb2cgPSBjb25zb2xlTm90QXZhaWxhYmxlO1xuXHR9IGVsc2Uge1xuXHRcdGlmIChjb25zb2xlLndhcm4gJiYgY29uc29sZS5kaXIpIHtcblx0XHRcdC8vIFNlbnNpYmxlIGNvbnNvbGUgZm91bmQsIHVzZSBpdFxuXHRcdFx0d2FybiA9IGZ1bmN0aW9uICh4KSB7XG5cdFx0XHRcdGNvbnNvbGUud2Fybih4KTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIElFOCBoYXMgY29uc29sZS5sb2cgYW5kIEpTT04sIHNvIHdlIGNhbiBtYWtlIGFcblx0XHRcdC8vIHJlYXNvbmFibHkgdXNlZnVsIHdhcm4oKSBmcm9tIHRob3NlLlxuXHRcdFx0Ly8gQ3JlZGl0IHRvIHdlYnBybyAoaHR0cHM6Ly9naXRodWIuY29tL3dlYnBybykgZm9yIHRoaXMgaWRlYVxuXHRcdFx0aWYgKGNvbnNvbGUubG9nICYmIHR5cGVvZiBKU09OICE9ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHdhcm4gPSBmdW5jdGlvbiAoeCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHR5cGVvZiB4ID09PSAnc3RyaW5nJyA/IHggOiBKU09OLnN0cmluZ2lmeSh4KSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIXdhcm4pIHtcblx0XHRcdC8vIENvdWxkbid0IGZpbmQgYSBzdWl0YWJsZSBjb25zb2xlIGxvZ2dpbmcgZnVuY3Rpb25cblx0XHRcdC8vIEdpdmUgdXAgYW5kIGp1c3QgYmUgc2lsZW50XG5cdFx0XHRsb2cgPSBjb25zb2xlTm90QXZhaWxhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZihjb25zb2xlLmdyb3VwQ29sbGFwc2VkKSB7XG5cdFx0XHRcdHdhcm5BbGwgPSBmdW5jdGlvbihtc2csIGxpc3QpIHtcblx0XHRcdFx0XHRjb25zb2xlLmdyb3VwQ29sbGFwc2VkKG1zZyk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGFycmF5LmZvckVhY2gobGlzdCwgd2Fybik7XG5cdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR3YXJuQWxsID0gZnVuY3Rpb24obXNnLCBsaXN0KSB7XG5cdFx0XHRcdFx0d2Fybihtc2cpO1xuXHRcdFx0XHRcdHdhcm4obGlzdCk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGxvZyA9IGZ1bmN0aW9uKHJlamVjdGlvbnMpIHtcblx0XHRcdFx0aWYocmVqZWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0XHR3YXJuQWxsKCdbcHJvbWlzZXNdIFVuaGFuZGxlZCByZWplY3Rpb25zOiAnXG5cdFx0XHRcdFx0XHQrIHJlamVjdGlvbnMubGVuZ3RoLCByZWplY3Rpb25zKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3YXJuKCdbcHJvbWlzZXNdIEFsbCBwcmV2aW91c2x5IHVuaGFuZGxlZCByZWplY3Rpb25zIGhhdmUgbm93IGJlZW4gaGFuZGxlZCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIGxvZztcblxuXHRmdW5jdGlvbiBjb25zb2xlTm90QXZhaWxhYmxlKCkge31cblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3I6IEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yOiBKb2huIEhhbm5cbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0dmFyIGhhc1N0YWNrVHJhY2VzO1xuXG5cdHRyeSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRoYXNTdGFja1RyYWNlcyA9ICEhZS5zdGFjaztcblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbihmaWx0ZXJTdGFjaywgdW5oYW5kbGVkTXNnLCByZWFzb25Nc2csIHN0YWNrSnVtcE1zZykge1xuXHRcdHJldHVybiBmdW5jdGlvbiBmb3JtYXQocmVjKSB7XG5cdFx0XHR2YXIgY2F1c2UsIGZvcm1hdHRlZDtcblxuXHRcdFx0Zm9ybWF0dGVkID0ge1xuXHRcdFx0XHRyZWFzb246IHJlYy5yZWFzb24sXG5cdFx0XHRcdG1lc3NhZ2U6IHJlYy5yZWFzb24gJiYgcmVjLnJlYXNvbi50b1N0cmluZygpXG5cdFx0XHR9O1xuXG5cdFx0XHRpZihoYXNTdGFja1RyYWNlcykge1xuXHRcdFx0XHRjYXVzZSA9IHJlYy5yZWFzb24gJiYgcmVjLnJlYXNvbi5zdGFjaztcblx0XHRcdFx0aWYoIWNhdXNlKSB7XG5cdFx0XHRcdFx0Y2F1c2UgPSByZWMucmVqZWN0ZWRBdCAmJiByZWMucmVqZWN0ZWRBdC5zdGFjaztcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIganVtcHMgPSBmb3JtYXRTdGFja0p1bXBzKHJlYyk7XG5cdFx0XHRcdGZvcm1hdHRlZC5zdGFjayA9IHN0aXRjaChyZWMuY3JlYXRlZEF0LnN0YWNrLCBqdW1wcywgY2F1c2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm9ybWF0dGVkO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBmb3JtYXRTdGFja0p1bXBzKHJlYykge1xuXHRcdFx0dmFyIGp1bXBzID0gW107XG5cblx0XHRcdHJlYyA9IHJlYy5wYXJlbnQ7XG5cdFx0XHR3aGlsZSAocmVjKSB7XG5cdFx0XHRcdGp1bXBzLnB1c2goZm9ybWF0U3RhY2tKdW1wKHJlYykpO1xuXHRcdFx0XHRyZWMgPSByZWMucGFyZW50O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ganVtcHM7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZm9ybWF0U3RhY2tKdW1wKHJlYykge1xuXHRcdFx0cmV0dXJuIGZpbHRlclN0YWNrKHRvQXJyYXkocmVjLmNyZWF0ZWRBdC5zdGFjaykuc2xpY2UoMSkpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHN0aXRjaChlc2NhcGVkLCBqdW1wcywgcmVqZWN0ZWQpIHtcblx0XHRcdGVzY2FwZWQgPSBmaWx0ZXJTdGFjayh0b0FycmF5KGVzY2FwZWQpKS5zbGljZSgxKTtcblx0XHRcdHJlamVjdGVkID0gZmlsdGVyU3RhY2sodG9BcnJheShyZWplY3RlZCkpO1xuXG5cdFx0XHRyZXR1cm4ganVtcHMucmVkdWNlKGZ1bmN0aW9uKHN0YWNrLCBqdW1wLCBpKSB7XG5cdFx0XHRcdHJldHVybiBpID8gc3RhY2suY29uY2F0KHN0YWNrSnVtcE1zZywganVtcCkgOiBzdGFjay5jb25jYXQoanVtcCk7XG5cdFx0XHR9LCBbdW5oYW5kbGVkTXNnXSkuY29uY2F0KHJlYXNvbk1zZywgcmVqZWN0ZWQpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRvQXJyYXkoc3RhY2spIHtcblx0XHRcdHJldHVybiBzdGFjayA/IHN0YWNrLnNwbGl0KCdcXG4nKSA6IFtdO1xuXHRcdH1cblx0fTtcblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxMyBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuXG4vKipcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSBhdDpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogQGF1dGhvcjogQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3I6IEpvaG4gSGFublxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbigpIHtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHNpbXBsZSBwcm9taXNlIG1vbml0b3IgcmVwb3J0ZXIgdGhhdCBmaWx0ZXJzIG91dCBhbGxcblx0ICogYnV0IHVuaGFuZGxlZCByZWplY3Rpb25zLCBmb3JtYXRzIHRoZW0gdXNpbmcgdGhlIHN1cHBsaWVkXG5cdCAqIGZvcm1hdHRlciwgYW5kIHRoZW4gc2VuZHMgdGhlIHJlc3VsdHMgdG8gdGhlIHN1cHBsaWVkIGxvZ1xuXHQgKiBmdW5jdGlvbnNcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gZm9ybWF0IGZvcm1hdHMgYSBzaW5nbGUgcHJvbWlzZSBtb25pdG9yXG5cdCAqICByZWNvcmQgZm9yIG91dHB1dFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsb2cgbG9nZ2luZyBmdW5jdGlvbiB0byB3aGljaCBhbGwgdW5oYW5kbGVkXG5cdCAqICByZWplY3Rpb25zIHdpbGwgYmUgcGFzc2VkLlxuXHQgKiBAcmV0dXJuIHJlcG9ydGVyIGZ1bmN0aW9uc1xuXHQgKi9cblx0cmV0dXJuIGZ1bmN0aW9uIHNpbXBsZVJlcG9ydGVyKGZvcm1hdCwgbG9nKSB7XG5cdFx0dmFyIGxlbiA9IDA7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24ocHJvbWlzZXMpIHtcblx0XHRcdHByb21pc2VzID0gZmlsdGVyQW5kRm9ybWF0KGZvcm1hdCwgcHJvbWlzZXMpO1xuXG5cdFx0XHRpZiAobGVuID09PSAwICYmIHByb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGxvZyhwcm9taXNlcyk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRsZW4gPSBwcm9taXNlcy5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHRmdW5jdGlvbiBmaWx0ZXJBbmRGb3JtYXQoZm9ybWF0LCBwcm9taXNlcykge1xuXHRcdHZhciBrZXksIHJlYywgcmVqZWN0ZWQ7XG5cblx0XHRyZWplY3RlZCA9IFtdO1xuXG5cdFx0Zm9yKGtleSBpbiBwcm9taXNlcykge1xuXHRcdFx0cmVjID0gcHJvbWlzZXNba2V5XTtcblx0XHRcdGlmKHJlYy5yZWplY3RlZEF0KSB7XG5cdFx0XHRcdHJlamVjdGVkLnB1c2goZm9ybWF0KHJlYykpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZWplY3RlZDtcblx0fVxuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDEzIG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG5cbi8qKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIGF0OlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBAYXV0aG9yOiBCcmlhbiBDYXZhbGllclxuICogQGF1dGhvcjogSm9obiBIYW5uXG4gKi9cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKHJlcXVpcmUpIHtcblxuXHR2YXIgYXJyYXkgPSByZXF1aXJlKCcuL2FycmF5Jyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGlzRXhjbHVkZWQsIHJlcGxhY2UpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZmlsdGVyU3RhY2soc3RhY2spIHtcblx0XHRcdHZhciBleGNsdWRlZDtcblxuXHRcdFx0aWYoIShzdGFjayAmJiBzdGFjay5sZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdH1cblxuXHRcdFx0ZXhjbHVkZWQgPSBbXTtcblxuXHRcdFx0cmV0dXJuIGFycmF5LnJlZHVjZShzdGFjaywgW10sIGZ1bmN0aW9uKGZpbHRlcmVkLCBsaW5lKSB7XG5cdFx0XHRcdHZhciBtYXRjaDtcblxuXHRcdFx0XHRtYXRjaCA9IGlzRXhjbHVkZWQobGluZSk7XG5cdFx0XHRcdGlmKG1hdGNoKSB7XG5cdFx0XHRcdFx0aWYoIWV4Y2x1ZGVkKSB7XG5cdFx0XHRcdFx0XHRleGNsdWRlZCA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRleGNsdWRlZC5wdXNoKGxpbmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmKGV4Y2x1ZGVkKSB7XG5cdFx0XHRcdFx0XHRpZihmaWx0ZXJlZC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdGZpbHRlcmVkID0gZmlsdGVyZWQuY29uY2F0KHJlcGxhY2UoZXhjbHVkZWQpKTtcblx0XHRcdFx0XHRcdFx0ZXhjbHVkZWQgPSBudWxsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaWx0ZXJlZC5wdXNoKGxpbmUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZpbHRlcmVkO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0fTtcblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3I6IEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yOiBKb2huIEhhbm5cbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHQvKmdsb2JhbCBzZXRUaW1lb3V0Ki9cblxuXHRcdC8qKlxuXHRcdCAqIFRocm90dGxlcyB0aGUgZ2l2ZW4gcmVwb3J0ZXIgc3VjaCB0aGF0IGl0IHdpbGwgcmVwb3J0XG5cdFx0ICogYXQgbW9zdCBvbmNlIGV2ZXJ5IG1zIG1pbGxpc2Vjb25kc1xuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBtcyBtaW5pbXVtIG1pbGxpcyBiZXR3ZWVuIHJlcG9ydHNcblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXBvcnRlciByZXBvcnRlciB0byBiZSB0aHJvdHRsZWRcblx0XHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gdGhyb3R0bGVkIHZlcnNpb24gb2YgcmVwb3J0ZXJcblx0XHQgKi9cblx0XHRyZXR1cm4gZnVuY3Rpb24gdGhyb3R0bGVSZXBvcnRlcihtcywgcmVwb3J0ZXIpIHtcblx0XHRcdHZhciB0aW1lb3V0LCB0b1JlcG9ydDtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHByb21pc2VzKSB7XG5cdFx0XHRcdHRvUmVwb3J0ID0gcHJvbWlzZXM7XG5cdFx0XHRcdGlmKHRpbWVvdXQgPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRcdFx0XHRyZXBvcnRlcih0b1JlcG9ydCk7XG5cdFx0XHRcdFx0fSwgbXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cblx0fSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTsvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDExLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IENvbW1vbkpTIFByb21pc2VzL0EgYW5kIHdoZW4oKSBpbXBsZW1lbnRhdGlvblxuICogd2hlbiBpcyBwYXJ0IG9mIHRoZSBjdWpvLmpzIGZhbWlseSBvZiBsaWJyYXJpZXMgKGh0dHA6Ly9jdWpvanMuY29tLylcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3IgSm9obiBIYW5uXG4gKiBAdmVyc2lvbiAyLjcuMVxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbiAocmVxdWlyZSkge1xuXG5cdC8vIFB1YmxpYyBBUElcblxuXHR3aGVuLnByb21pc2UgICA9IHByb21pc2U7ICAgIC8vIENyZWF0ZSBhIHBlbmRpbmcgcHJvbWlzZVxuXHR3aGVuLnJlc29sdmUgICA9IHJlc29sdmU7ICAgIC8vIENyZWF0ZSBhIHJlc29sdmVkIHByb21pc2Vcblx0d2hlbi5yZWplY3QgICAgPSByZWplY3Q7ICAgICAvLyBDcmVhdGUgYSByZWplY3RlZCBwcm9taXNlXG5cdHdoZW4uZGVmZXIgICAgID0gZGVmZXI7ICAgICAgLy8gQ3JlYXRlIGEge3Byb21pc2UsIHJlc29sdmVyfSBwYWlyXG5cblx0d2hlbi5qb2luICAgICAgPSBqb2luOyAgICAgICAvLyBKb2luIDIgb3IgbW9yZSBwcm9taXNlc1xuXG5cdHdoZW4uYWxsICAgICAgID0gYWxsOyAgICAgICAgLy8gUmVzb2x2ZSBhIGxpc3Qgb2YgcHJvbWlzZXNcblx0d2hlbi5tYXAgICAgICAgPSBtYXA7ICAgICAgICAvLyBBcnJheS5tYXAoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5yZWR1Y2UgICAgPSByZWR1Y2U7ICAgICAvLyBBcnJheS5yZWR1Y2UoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5zZXR0bGUgICAgPSBzZXR0bGU7ICAgICAvLyBTZXR0bGUgYSBsaXN0IG9mIHByb21pc2VzXG5cblx0d2hlbi5hbnkgICAgICAgPSBhbnk7ICAgICAgICAvLyBPbmUtd2lubmVyIHJhY2Vcblx0d2hlbi5zb21lICAgICAgPSBzb21lOyAgICAgICAvLyBNdWx0aS13aW5uZXIgcmFjZVxuXG5cdHdoZW4uaXNQcm9taXNlID0gaXNQcm9taXNlTGlrZTsgIC8vIERFUFJFQ0FURUQ6IHVzZSBpc1Byb21pc2VMaWtlXG5cdHdoZW4uaXNQcm9taXNlTGlrZSA9IGlzUHJvbWlzZUxpa2U7IC8vIElzIHNvbWV0aGluZyBwcm9taXNlLWxpa2UsIGFrYSB0aGVuYWJsZVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhbiBvYnNlcnZlciBmb3IgYSBwcm9taXNlIG9yIGltbWVkaWF0ZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHsqfSBwcm9taXNlT3JWYWx1ZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uRnVsZmlsbGVkXSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBwcm9taXNlT3JWYWx1ZSBpc1xuXHQgKiAgIHN1Y2Nlc3NmdWxseSBmdWxmaWxsZWQuICBJZiBwcm9taXNlT3JWYWx1ZSBpcyBhbiBpbW1lZGlhdGUgdmFsdWUsIGNhbGxiYWNrXG5cdCAqICAgd2lsbCBiZSBpbnZva2VkIGltbWVkaWF0ZWx5LlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uUmVqZWN0ZWRdIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIHByb21pc2VPclZhbHVlIGlzXG5cdCAqICAgcmVqZWN0ZWQuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25Qcm9ncmVzc10gY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gcHJvZ3Jlc3MgdXBkYXRlc1xuXHQgKiAgIGFyZSBpc3N1ZWQgZm9yIHByb21pc2VPclZhbHVlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBuZXcge0BsaW5rIFByb21pc2V9IHRoYXQgd2lsbCBjb21wbGV0ZSB3aXRoIHRoZSByZXR1cm5cblx0ICogICB2YWx1ZSBvZiBjYWxsYmFjayBvciBlcnJiYWNrIG9yIHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHByb21pc2VPclZhbHVlIGlmXG5cdCAqICAgY2FsbGJhY2sgYW5kL29yIGVycmJhY2sgaXMgbm90IHN1cHBsaWVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gd2hlbihwcm9taXNlT3JWYWx1ZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpIHtcblx0XHQvLyBHZXQgYSB0cnVzdGVkIHByb21pc2UgZm9yIHRoZSBpbnB1dCBwcm9taXNlT3JWYWx1ZSwgYW5kIHRoZW5cblx0XHQvLyByZWdpc3RlciBwcm9taXNlIGhhbmRsZXJzXG5cdFx0cmV0dXJuIGNhc3QocHJvbWlzZU9yVmFsdWUpLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSB3aG9zZSBmYXRlIGlzIGRldGVybWluZWQgYnkgcmVzb2x2ZXIuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aG9zZSBmYXRlIGlzIGRldGVybWluZSBieSByZXNvbHZlclxuXHQgKi9cblx0ZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlcixcblx0XHRcdG1vbml0b3JBcGkuUHJvbWlzZVN0YXR1cyAmJiBtb25pdG9yQXBpLlByb21pc2VTdGF0dXMoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJ1c3RlZCBQcm9taXNlIGNvbnN0cnVjdG9yLiAgQSBQcm9taXNlIGNyZWF0ZWQgZnJvbSB0aGlzIGNvbnN0cnVjdG9yIGlzXG5cdCAqIGEgdHJ1c3RlZCB3aGVuLmpzIHByb21pc2UuICBBbnkgb3RoZXIgZHVjay10eXBlZCBwcm9taXNlIGlzIGNvbnNpZGVyZWRcblx0ICogdW50cnVzdGVkLlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hvc2UgZmF0ZSBpcyBkZXRlcm1pbmUgYnkgcmVzb2x2ZXJcblx0ICogQG5hbWUgUHJvbWlzZVxuXHQgKi9cblx0ZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlciwgc3RhdHVzKSB7XG5cdFx0dmFyIHNlbGYsIHZhbHVlLCBjb25zdW1lcnMgPSBbXTtcblxuXHRcdHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcblx0XHR0aGlzLmluc3BlY3QgPSBpbnNwZWN0O1xuXHRcdHRoaXMuX3doZW4gPSBfd2hlbjtcblxuXHRcdC8vIENhbGwgdGhlIHByb3ZpZGVyIHJlc29sdmVyIHRvIHNlYWwgdGhlIHByb21pc2UncyBmYXRlXG5cdFx0dHJ5IHtcblx0XHRcdHJlc29sdmVyKHByb21pc2VSZXNvbHZlLCBwcm9taXNlUmVqZWN0LCBwcm9taXNlTm90aWZ5KTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdHByb21pc2VSZWplY3QoZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyBhIHNuYXBzaG90IG9mIHRoaXMgcHJvbWlzZSdzIGN1cnJlbnQgc3RhdHVzIGF0IHRoZSBpbnN0YW50IG9mIGNhbGxcblx0XHQgKiBAcmV0dXJucyB7e3N0YXRlOlN0cmluZ319XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaW5zcGVjdCgpIHtcblx0XHRcdHJldHVybiB2YWx1ZSA/IHZhbHVlLmluc3BlY3QoKSA6IHRvUGVuZGluZ1N0YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJpdmF0ZSBtZXNzYWdlIGRlbGl2ZXJ5LiBRdWV1ZXMgYW5kIGRlbGl2ZXJzIG1lc3NhZ2VzIHRvXG5cdFx0ICogdGhlIHByb21pc2UncyB1bHRpbWF0ZSBmdWxmaWxsbWVudCB2YWx1ZSBvciByZWplY3Rpb24gcmVhc29uLlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3doZW4ocmVzb2x2ZSwgbm90aWZ5LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdFx0Y29uc3VtZXJzID8gY29uc3VtZXJzLnB1c2goZGVsaXZlcikgOiBlbnF1ZXVlKGZ1bmN0aW9uKCkgeyBkZWxpdmVyKHZhbHVlKTsgfSk7XG5cblx0XHRcdGZ1bmN0aW9uIGRlbGl2ZXIocCkge1xuXHRcdFx0XHRwLl93aGVuKHJlc29sdmUsIG5vdGlmeSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRyYW5zaXRpb24gZnJvbSBwcmUtcmVzb2x1dGlvbiBzdGF0ZSB0byBwb3N0LXJlc29sdXRpb24gc3RhdGUsIG5vdGlmeWluZ1xuXHRcdCAqIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIHVsdGltYXRlIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvblxuXHRcdCAqIEBwYXJhbSB7Kn0gdmFsIHJlc29sdXRpb24gdmFsdWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZSh2YWwpIHtcblx0XHRcdGlmKCFjb25zdW1lcnMpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcXVldWUgPSBjb25zdW1lcnM7XG5cdFx0XHRjb25zdW1lcnMgPSB1bmRlZjtcblxuXHRcdFx0ZW5xdWV1ZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhbHVlID0gY29lcmNlKHNlbGYsIHZhbCk7XG5cdFx0XHRcdGlmKHN0YXR1cykge1xuXHRcdFx0XHRcdHVwZGF0ZVN0YXR1cyh2YWx1ZSwgc3RhdHVzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRydW5IYW5kbGVycyhxdWV1ZSwgdmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVqZWN0IHRoaXMgcHJvbWlzZSB3aXRoIHRoZSBzdXBwbGllZCByZWFzb24sIHdoaWNoIHdpbGwgYmUgdXNlZCB2ZXJiYXRpbS5cblx0XHQgKiBAcGFyYW0geyp9IHJlYXNvbiByZWFzb24gZm9yIHRoZSByZWplY3Rpb25cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcm9taXNlUmVqZWN0KHJlYXNvbikge1xuXHRcdFx0cHJvbWlzZVJlc29sdmUobmV3IFJlamVjdGVkUHJvbWlzZShyZWFzb24pKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBJc3N1ZSBhIHByb2dyZXNzIGV2ZW50LCBub3RpZnlpbmcgYWxsIHByb2dyZXNzIGxpc3RlbmVyc1xuXHRcdCAqIEBwYXJhbSB7Kn0gdXBkYXRlIHByb2dyZXNzIGV2ZW50IHBheWxvYWQgdG8gcGFzcyB0byBhbGwgbGlzdGVuZXJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcHJvbWlzZU5vdGlmeSh1cGRhdGUpIHtcblx0XHRcdGlmKGNvbnN1bWVycykge1xuXHRcdFx0XHR2YXIgcXVldWUgPSBjb25zdW1lcnM7XG5cdFx0XHRcdGVucXVldWUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJ1bkhhbmRsZXJzKHF1ZXVlLCBuZXcgUHJvZ3Jlc3NpbmdQcm9taXNlKHVwZGF0ZSkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcm9taXNlUHJvdG90eXBlID0gUHJvbWlzZS5wcm90b3R5cGU7XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXJzIGZvciB0aGlzIHByb21pc2UuXG5cdCAqIEBwYXJhbSBbb25GdWxmaWxsZWRdIHtGdW5jdGlvbn0gZnVsZmlsbG1lbnQgaGFuZGxlclxuXHQgKiBAcGFyYW0gW29uUmVqZWN0ZWRdIHtGdW5jdGlvbn0gcmVqZWN0aW9uIGhhbmRsZXJcblx0ICogQHBhcmFtIFtvblByb2dyZXNzXSB7RnVuY3Rpb259IHByb2dyZXNzIGhhbmRsZXJcblx0ICogQHJldHVybiB7UHJvbWlzZX0gbmV3IFByb21pc2Vcblx0ICovXG5cdHByb21pc2VQcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHRzZWxmLl93aGVuKHJlc29sdmUsIG5vdGlmeSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHRcdH0sIHRoaXMuX3N0YXR1cyAmJiB0aGlzLl9zdGF0dXMub2JzZXJ2ZWQoKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgcmVqZWN0aW9uIGhhbmRsZXIuICBTaG9ydGN1dCBmb3IgLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gb25SZWplY3RlZFxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsnY2F0Y2gnXSA9IHByb21pc2VQcm90b3R5cGUub3RoZXJ3aXNlID0gZnVuY3Rpb24ob25SZWplY3RlZCkge1xuXHRcdHJldHVybiB0aGlzLnRoZW4odW5kZWYsIG9uUmVqZWN0ZWQpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBFbnN1cmVzIHRoYXQgb25GdWxmaWxsZWRPclJlamVjdGVkIHdpbGwgYmUgY2FsbGVkIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlclxuXHQgKiB0aGlzIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgb25GdWxmaWxsZWRPclJlamVjdGVkIFdJTEwgTk9UXG5cdCAqIHJlY2VpdmUgdGhlIHByb21pc2VzJyB2YWx1ZSBvciByZWFzb24uICBBbnkgcmV0dXJuZWQgdmFsdWUgd2lsbCBiZSBkaXNyZWdhcmRlZC5cblx0ICogb25GdWxmaWxsZWRPclJlamVjdGVkIG1heSB0aHJvdyBvciByZXR1cm4gYSByZWplY3RlZCBwcm9taXNlIHRvIHNpZ25hbFxuXHQgKiBhbiBhZGRpdGlvbmFsIGVycm9yLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQgaGFuZGxlciB0byBiZSBjYWxsZWQgcmVnYXJkbGVzcyBvZlxuXHQgKiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsnZmluYWxseSddID0gcHJvbWlzZVByb3RvdHlwZS5lbnN1cmUgPSBmdW5jdGlvbihvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQpIHtcblx0XHRyZXR1cm4gdHlwZW9mIG9uRnVsZmlsbGVkT3JSZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0PyB0aGlzLnRoZW4oaW5qZWN0SGFuZGxlciwgaW5qZWN0SGFuZGxlcilbJ3lpZWxkJ10odGhpcylcblx0XHRcdDogdGhpcztcblxuXHRcdGZ1bmN0aW9uIGluamVjdEhhbmRsZXIoKSB7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQoKSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBUZXJtaW5hdGUgYSBwcm9taXNlIGNoYWluIGJ5IGhhbmRsaW5nIHRoZSB1bHRpbWF0ZSBmdWxmaWxsbWVudCB2YWx1ZSBvclxuXHQgKiByZWplY3Rpb24gcmVhc29uLCBhbmQgYXNzdW1pbmcgcmVzcG9uc2liaWxpdHkgZm9yIGFsbCBlcnJvcnMuICBpZiBhblxuXHQgKiBlcnJvciBwcm9wYWdhdGVzIG91dCBvZiBoYW5kbGVSZXN1bHQgb3IgaGFuZGxlRmF0YWxFcnJvciwgaXQgd2lsbCBiZVxuXHQgKiByZXRocm93biB0byB0aGUgaG9zdCwgcmVzdWx0aW5nIGluIGEgbG91ZCBzdGFjayB0cmFjayBvbiBtb3N0IHBsYXRmb3Jtc1xuXHQgKiBhbmQgYSBjcmFzaCBvbiBzb21lLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gaGFuZGxlUmVzdWx0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBoYW5kbGVFcnJvclxuXHQgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24oaGFuZGxlUmVzdWx0LCBoYW5kbGVFcnJvcikge1xuXHRcdHRoaXMudGhlbihoYW5kbGVSZXN1bHQsIGhhbmRsZUVycm9yKVsnY2F0Y2gnXShjcmFzaCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFNob3J0Y3V0IGZvciAudGhlbihmdW5jdGlvbigpIHsgcmV0dXJuIHZhbHVlOyB9KVxuXHQgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdDpcblx0ICogIC0gaXMgZnVsZmlsbGVkIGlmIHZhbHVlIGlzIG5vdCBhIHByb21pc2UsIG9yXG5cdCAqICAtIGlmIHZhbHVlIGlzIGEgcHJvbWlzZSwgd2lsbCBmdWxmaWxsIHdpdGggaXRzIHZhbHVlLCBvciByZWplY3Rcblx0ICogICAgd2l0aCBpdHMgcmVhc29uLlxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsneWllbGQnXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9KTtcblx0fTtcblxuXHQvKipcblx0ICogUnVucyBhIHNpZGUgZWZmZWN0IHdoZW4gdGhpcyBwcm9taXNlIGZ1bGZpbGxzLCB3aXRob3V0IGNoYW5naW5nIHRoZVxuXHQgKiBmdWxmaWxsbWVudCB2YWx1ZS5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gb25GdWxmaWxsZWRTaWRlRWZmZWN0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZS50YXAgPSBmdW5jdGlvbihvbkZ1bGZpbGxlZFNpZGVFZmZlY3QpIHtcblx0XHRyZXR1cm4gdGhpcy50aGVuKG9uRnVsZmlsbGVkU2lkZUVmZmVjdClbJ3lpZWxkJ10odGhpcyk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEFzc3VtZXMgdGhhdCB0aGlzIHByb21pc2Ugd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXksIGFuZCBhcnJhbmdlc1xuXHQgKiBmb3IgdGhlIG9uRnVsZmlsbGVkIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBhcnJheSBhcyBpdHMgYXJndW1lbnQgbGlzdFxuXHQgKiBpLmUuIG9uRnVsZmlsbGVkLmFwcGx5KHVuZGVmaW5lZCwgYXJyYXkpLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkZ1bGZpbGxlZCBmdW5jdGlvbiB0byByZWNlaXZlIHNwcmVhZCBhcmd1bWVudHNcblx0ICogQHJldHVybiB7UHJvbWlzZX1cblx0ICovXG5cdHByb21pc2VQcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24ob25GdWxmaWxsZWQpIHtcblx0XHRyZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uKGFycmF5KSB7XG5cdFx0XHQvLyBhcnJheSBtYXkgY29udGFpbiBwcm9taXNlcywgc28gcmVzb2x2ZSBpdHMgY29udGVudHMuXG5cdFx0XHRyZXR1cm4gYWxsKGFycmF5LCBmdW5jdGlvbihhcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gb25GdWxmaWxsZWQuYXBwbHkodW5kZWYsIGFycmF5KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBTaG9ydGN1dCBmb3IgLnRoZW4ob25GdWxmaWxsZWRPclJlamVjdGVkLCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQpXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRwcm9taXNlUHJvdG90eXBlLmFsd2F5cyA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkT3JSZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdHJldHVybiB0aGlzLnRoZW4ob25GdWxmaWxsZWRPclJlamVjdGVkLCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBDYXN0cyB4IHRvIGEgdHJ1c3RlZCBwcm9taXNlLiBJZiB4IGlzIGFscmVhZHkgYSB0cnVzdGVkIHByb21pc2UsIGl0IGlzXG5cdCAqIHJldHVybmVkLCBvdGhlcndpc2UgYSBuZXcgdHJ1c3RlZCBQcm9taXNlIHdoaWNoIGZvbGxvd3MgeCBpcyByZXR1cm5lZC5cblx0ICogQHBhcmFtIHsqfSB4XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gY2FzdCh4KSB7XG5cdFx0cmV0dXJuIHggaW5zdGFuY2VvZiBQcm9taXNlID8geCA6IHJlc29sdmUoeCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuIFRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmVcblx0ICogIC0gZnVsZmlsbGVkIHdpdGggcHJvbWlzZU9yVmFsdWUgaWYgaXQgaXMgYSB2YWx1ZSwgb3Jcblx0ICogIC0gaWYgcHJvbWlzZU9yVmFsdWUgaXMgYSBwcm9taXNlXG5cdCAqICAgIC0gZnVsZmlsbGVkIHdpdGggcHJvbWlzZU9yVmFsdWUncyB2YWx1ZSBhZnRlciBpdCBpcyBmdWxmaWxsZWRcblx0ICogICAgLSByZWplY3RlZCB3aXRoIHByb21pc2VPclZhbHVlJ3MgcmVhc29uIGFmdGVyIGl0IGlzIHJlamVjdGVkXG5cdCAqIEluIGNvbnRyYWN0IHRvIGNhc3QoeCksIHRoaXMgYWx3YXlzIGNyZWF0ZXMgYSBuZXcgUHJvbWlzZVxuXHQgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSkge1xuXHRcdHJldHVybiBwcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcblx0XHRcdHJlc29sdmUodmFsdWUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSByZWplY3RlZCBwcm9taXNlIGZvciB0aGUgc3VwcGxpZWQgcHJvbWlzZU9yVmFsdWUuICBUaGUgcmV0dXJuZWRcblx0ICogcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGg6XG5cdCAqIC0gcHJvbWlzZU9yVmFsdWUsIGlmIGl0IGlzIGEgdmFsdWUsIG9yXG5cdCAqIC0gaWYgcHJvbWlzZU9yVmFsdWUgaXMgYSBwcm9taXNlXG5cdCAqICAgLSBwcm9taXNlT3JWYWx1ZSdzIHZhbHVlIGFmdGVyIGl0IGlzIGZ1bGZpbGxlZFxuXHQgKiAgIC0gcHJvbWlzZU9yVmFsdWUncyByZWFzb24gYWZ0ZXIgaXQgaXMgcmVqZWN0ZWRcblx0ICogQHBhcmFtIHsqfSBwcm9taXNlT3JWYWx1ZSB0aGUgcmVqZWN0ZWQgdmFsdWUgb2YgdGhlIHJldHVybmVkIHtAbGluayBQcm9taXNlfVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSByZWplY3RlZCB7QGxpbmsgUHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIHJlamVjdChwcm9taXNlT3JWYWx1ZSkge1xuXHRcdHJldHVybiB3aGVuKHByb21pc2VPclZhbHVlLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkUHJvbWlzZShlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEge3Byb21pc2UsIHJlc29sdmVyfSBwYWlyLCBlaXRoZXIgb3IgYm90aCBvZiB3aGljaFxuXHQgKiBtYXkgYmUgZ2l2ZW4gb3V0IHNhZmVseSB0byBjb25zdW1lcnMuXG5cdCAqIFRoZSByZXNvbHZlciBoYXMgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgcHJvZ3Jlc3MuICBUaGUgcHJvbWlzZVxuXHQgKiBoYXMgdGhlbiBwbHVzIGV4dGVuZGVkIHByb21pc2UgQVBJLlxuXHQgKlxuXHQgKiBAcmV0dXJuIHt7XG5cdCAqIHByb21pc2U6IFByb21pc2UsXG5cdCAqIHJlc29sdmU6IGZ1bmN0aW9uOlByb21pc2UsXG5cdCAqIHJlamVjdDogZnVuY3Rpb246UHJvbWlzZSxcblx0ICogbm90aWZ5OiBmdW5jdGlvbjpQcm9taXNlXG5cdCAqIHJlc29sdmVyOiB7XG5cdCAqXHRyZXNvbHZlOiBmdW5jdGlvbjpQcm9taXNlLFxuXHQgKlx0cmVqZWN0OiBmdW5jdGlvbjpQcm9taXNlLFxuXHQgKlx0bm90aWZ5OiBmdW5jdGlvbjpQcm9taXNlXG5cdCAqIH19fVxuXHQgKi9cblx0ZnVuY3Rpb24gZGVmZXIoKSB7XG5cdFx0dmFyIGRlZmVycmVkLCBwZW5kaW5nLCByZXNvbHZlZDtcblxuXHRcdC8vIE9wdGltaXplIG9iamVjdCBzaGFwZVxuXHRcdGRlZmVycmVkID0ge1xuXHRcdFx0cHJvbWlzZTogdW5kZWYsIHJlc29sdmU6IHVuZGVmLCByZWplY3Q6IHVuZGVmLCBub3RpZnk6IHVuZGVmLFxuXHRcdFx0cmVzb2x2ZXI6IHsgcmVzb2x2ZTogdW5kZWYsIHJlamVjdDogdW5kZWYsIG5vdGlmeTogdW5kZWYgfVxuXHRcdH07XG5cblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcGVuZGluZyA9IHByb21pc2UobWFrZURlZmVycmVkKTtcblxuXHRcdHJldHVybiBkZWZlcnJlZDtcblxuXHRcdGZ1bmN0aW9uIG1ha2VEZWZlcnJlZChyZXNvbHZlUGVuZGluZywgcmVqZWN0UGVuZGluZywgbm90aWZ5UGVuZGluZykge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSA9IGRlZmVycmVkLnJlc29sdmVyLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXNvbHZlZCA9IHRydWU7XG5cdFx0XHRcdHJlc29sdmVQZW5kaW5nKHZhbHVlKTtcblx0XHRcdFx0cmV0dXJuIHBlbmRpbmc7XG5cdFx0XHR9O1xuXG5cdFx0XHRkZWZlcnJlZC5yZWplY3QgID0gZGVmZXJyZWQucmVzb2x2ZXIucmVqZWN0ICA9IGZ1bmN0aW9uKHJlYXNvbikge1xuXHRcdFx0XHRpZihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXNvbHZlKG5ldyBSZWplY3RlZFByb21pc2UocmVhc29uKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzb2x2ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZWplY3RQZW5kaW5nKHJlYXNvbik7XG5cdFx0XHRcdHJldHVybiBwZW5kaW5nO1xuXHRcdFx0fTtcblxuXHRcdFx0ZGVmZXJyZWQubm90aWZ5ICA9IGRlZmVycmVkLnJlc29sdmVyLm5vdGlmeSAgPSBmdW5jdGlvbih1cGRhdGUpIHtcblx0XHRcdFx0bm90aWZ5UGVuZGluZyh1cGRhdGUpO1xuXHRcdFx0XHRyZXR1cm4gdXBkYXRlO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUnVuIGEgcXVldWUgb2YgZnVuY3Rpb25zIGFzIHF1aWNrbHkgYXMgcG9zc2libGUsIHBhc3Npbmdcblx0ICogdmFsdWUgdG8gZWFjaC5cblx0ICovXG5cdGZ1bmN0aW9uIHJ1bkhhbmRsZXJzKHF1ZXVlLCB2YWx1ZSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHF1ZXVlW2ldKHZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29lcmNlcyB4IHRvIGEgdHJ1c3RlZCBQcm9taXNlXG5cdCAqIEBwYXJhbSB7Kn0geCB0aGluZyB0byBjb2VyY2Vcblx0ICogQHJldHVybnMgeyp9IEd1YXJhbnRlZWQgdG8gcmV0dXJuIGEgdHJ1c3RlZCBQcm9taXNlLiAgSWYgeFxuXHQgKiAgIGlzIHRydXN0ZWQsIHJldHVybnMgeCwgb3RoZXJ3aXNlLCByZXR1cm5zIGEgbmV3LCB0cnVzdGVkLCBhbHJlYWR5LXJlc29sdmVkXG5cdCAqICAgUHJvbWlzZSB3aG9zZSByZXNvbHV0aW9uIHZhbHVlIGlzOlxuXHQgKiAgICogdGhlIHJlc29sdXRpb24gdmFsdWUgb2YgeCBpZiBpdCdzIGEgZm9yZWlnbiBwcm9taXNlLCBvclxuXHQgKiAgICogeCBpZiBpdCdzIGEgdmFsdWVcblx0ICovXG5cdGZ1bmN0aW9uIGNvZXJjZShzZWxmLCB4KSB7XG5cdFx0aWYgKHggPT09IHNlbGYpIHtcblx0XHRcdHJldHVybiBuZXcgUmVqZWN0ZWRQcm9taXNlKG5ldyBUeXBlRXJyb3IoKSk7XG5cdFx0fVxuXG5cdFx0aWYgKHggaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRyZXR1cm4geDtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0dmFyIHVudHJ1c3RlZFRoZW4gPSB4ID09PSBPYmplY3QoeCkgJiYgeC50aGVuO1xuXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHVudHJ1c3RlZFRoZW4gPT09ICdmdW5jdGlvbidcblx0XHRcdFx0PyBhc3NpbWlsYXRlKHVudHJ1c3RlZFRoZW4sIHgpXG5cdFx0XHRcdDogbmV3IEZ1bGZpbGxlZFByb21pc2UoeCk7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkUHJvbWlzZShlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2FmZWx5IGFzc2ltaWxhdGVzIGEgZm9yZWlnbiB0aGVuYWJsZSBieSB3cmFwcGluZyBpdCBpbiBhIHRydXN0ZWQgcHJvbWlzZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1bnRydXN0ZWRUaGVuIHgncyB0aGVuKCkgbWV0aG9kXG5cdCAqIEBwYXJhbSB7b2JqZWN0fGZ1bmN0aW9ufSB4IHRoZW5hYmxlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gYXNzaW1pbGF0ZSh1bnRydXN0ZWRUaGVuLCB4KSB7XG5cdFx0cmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0ZmNhbGwodW50cnVzdGVkVGhlbiwgeCwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdG1ha2VQcm9taXNlUHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSB8fFxuXHRcdGZ1bmN0aW9uKG8pIHtcblx0XHRcdGZ1bmN0aW9uIFByb21pc2VQcm90b3R5cGUoKSB7fVxuXHRcdFx0UHJvbWlzZVByb3RvdHlwZS5wcm90b3R5cGUgPSBvO1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlUHJvdG90eXBlKCk7XG5cdFx0fTtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZ1bGZpbGxlZCwgbG9jYWwgcHJvbWlzZSBhcyBhIHByb3h5IGZvciBhIHZhbHVlXG5cdCAqIE5PVEU6IG11c3QgbmV2ZXIgYmUgZXhwb3NlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIGZ1bGZpbGxtZW50IHZhbHVlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gRnVsZmlsbGVkUHJvbWlzZSh2YWx1ZSkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxuXG5cdEZ1bGZpbGxlZFByb21pc2UucHJvdG90eXBlID0gbWFrZVByb21pc2VQcm90b3R5cGUocHJvbWlzZVByb3RvdHlwZSk7XG5cblx0RnVsZmlsbGVkUHJvbWlzZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0b0Z1bGZpbGxlZFN0YXRlKHRoaXMudmFsdWUpO1xuXHR9O1xuXG5cdEZ1bGZpbGxlZFByb21pc2UucHJvdG90eXBlLl93aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgXywgb25GdWxmaWxsZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzb2x2ZSh0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCh0aGlzLnZhbHVlKSA6IHRoaXMudmFsdWUpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0cmVzb2x2ZShuZXcgUmVqZWN0ZWRQcm9taXNlKGUpKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSByZWplY3RlZCwgbG9jYWwgcHJvbWlzZSBhcyBhIHByb3h5IGZvciBhIHZhbHVlXG5cdCAqIE5PVEU6IG11c3QgbmV2ZXIgYmUgZXhwb3NlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHJlYXNvbiByZWplY3Rpb24gcmVhc29uXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gUmVqZWN0ZWRQcm9taXNlKHJlYXNvbikge1xuXHRcdHRoaXMudmFsdWUgPSByZWFzb247XG5cdH1cblxuXHRSZWplY3RlZFByb21pc2UucHJvdG90eXBlID0gbWFrZVByb21pc2VQcm90b3R5cGUocHJvbWlzZVByb3RvdHlwZSk7XG5cblx0UmVqZWN0ZWRQcm9taXNlLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRvUmVqZWN0ZWRTdGF0ZSh0aGlzLnZhbHVlKTtcblx0fTtcblxuXHRSZWplY3RlZFByb21pc2UucHJvdG90eXBlLl93aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgXywgX18sIG9uUmVqZWN0ZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzb2x2ZSh0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQodGhpcy52YWx1ZSkgOiB0aGlzKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdHJlc29sdmUobmV3IFJlamVjdGVkUHJvbWlzZShlKSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBwcm9ncmVzcyBwcm9taXNlIHdpdGggdGhlIHN1cHBsaWVkIHVwZGF0ZS5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBwcm9ncmVzcyB1cGRhdGUgdmFsdWVcblx0ICogQHJldHVybiB7UHJvbWlzZX0gcHJvZ3Jlc3MgcHJvbWlzZVxuXHQgKi9cblx0ZnVuY3Rpb24gUHJvZ3Jlc3NpbmdQcm9taXNlKHZhbHVlKSB7XG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR9XG5cblx0UHJvZ3Jlc3NpbmdQcm9taXNlLnByb3RvdHlwZSA9IG1ha2VQcm9taXNlUHJvdG90eXBlKHByb21pc2VQcm90b3R5cGUpO1xuXG5cdFByb2dyZXNzaW5nUHJvbWlzZS5wcm90b3R5cGUuX3doZW4gPSBmdW5jdGlvbihfLCBub3RpZnksIGYsIHIsIHUpIHtcblx0XHR0cnkge1xuXHRcdFx0bm90aWZ5KHR5cGVvZiB1ID09PSAnZnVuY3Rpb24nID8gdSh0aGlzLnZhbHVlKSA6IHRoaXMudmFsdWUpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0bm90aWZ5KGUpO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogVXBkYXRlIGEgUHJvbWlzZVN0YXR1cyBtb25pdG9yIG9iamVjdCB3aXRoIHRoZSBvdXRjb21lXG5cdCAqIG9mIHRoZSBzdXBwbGllZCB2YWx1ZSBwcm9taXNlLlxuXHQgKiBAcGFyYW0ge1Byb21pc2V9IHZhbHVlXG5cdCAqIEBwYXJhbSB7UHJvbWlzZVN0YXR1c30gc3RhdHVzXG5cdCAqL1xuXHRmdW5jdGlvbiB1cGRhdGVTdGF0dXModmFsdWUsIHN0YXR1cykge1xuXHRcdHZhbHVlLnRoZW4oc3RhdHVzRnVsZmlsbGVkLCBzdGF0dXNSZWplY3RlZCk7XG5cblx0XHRmdW5jdGlvbiBzdGF0dXNGdWxmaWxsZWQoKSB7IHN0YXR1cy5mdWxmaWxsZWQoKTsgfVxuXHRcdGZ1bmN0aW9uIHN0YXR1c1JlamVjdGVkKHIpIHsgc3RhdHVzLnJlamVjdGVkKHIpOyB9XG5cdH1cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiB4IGlzIHByb21pc2UtbGlrZSwgaS5lLiBhIHRoZW5hYmxlIG9iamVjdFxuXHQgKiBOT1RFOiBXaWxsIHJldHVybiB0cnVlIGZvciAqYW55IHRoZW5hYmxlIG9iamVjdCosIGFuZCBpc24ndCB0cnVseVxuXHQgKiBzYWZlLCBzaW5jZSBpdCBtYXkgYXR0ZW1wdCB0byBhY2Nlc3MgdGhlIGB0aGVuYCBwcm9wZXJ0eSBvZiB4IChpLmUuXG5cdCAqICBjbGV2ZXIvbWFsaWNpb3VzIGdldHRlcnMgbWF5IGRvIHdlaXJkIHRoaW5ncylcblx0ICogQHBhcmFtIHsqfSB4IGFueXRoaW5nXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHggaXMgcHJvbWlzZS1saWtlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc1Byb21pc2VMaWtlKHgpIHtcblx0XHRyZXR1cm4geCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYXRlcyBhIGNvbXBldGl0aXZlIHJhY2UsIHJldHVybmluZyBhIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlblxuXHQgKiBob3dNYW55IG9mIHRoZSBzdXBwbGllZCBwcm9taXNlc09yVmFsdWVzIGhhdmUgcmVzb2x2ZWQsIG9yIHdpbGwgcmVqZWN0IHdoZW5cblx0ICogaXQgYmVjb21lcyBpbXBvc3NpYmxlIGZvciBob3dNYW55IHRvIHJlc29sdmUsIGZvciBleGFtcGxlLCB3aGVuXG5cdCAqIChwcm9taXNlc09yVmFsdWVzLmxlbmd0aCAtIGhvd01hbnkpICsgMSBpbnB1dCBwcm9taXNlcyByZWplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHByb21pc2VzT3JWYWx1ZXMgYXJyYXkgb2YgYW55dGhpbmcsIG1heSBjb250YWluIGEgbWl4XG5cdCAqICAgICAgb2YgcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0gaG93TWFueSB7bnVtYmVyfSBudW1iZXIgb2YgcHJvbWlzZXNPclZhbHVlcyB0byByZXNvbHZlXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25GdWxmaWxsZWRdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25SZWplY3RlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblByb2dyZXNzXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbiBhcnJheSBvZiBob3dNYW55IHZhbHVlcyB0aGF0XG5cdCAqICByZXNvbHZlZCBmaXJzdCwgb3Igd2lsbCByZWplY3Qgd2l0aCBhbiBhcnJheSBvZlxuXHQgKiAgKHByb21pc2VzT3JWYWx1ZXMubGVuZ3RoIC0gaG93TWFueSkgKyAxIHJlamVjdGlvbiByZWFzb25zLlxuXHQgKi9cblx0ZnVuY3Rpb24gc29tZShwcm9taXNlc09yVmFsdWVzLCBob3dNYW55LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZXNPclZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZXNPclZhbHVlcykge1xuXG5cdFx0XHRyZXR1cm4gcHJvbWlzZShyZXNvbHZlU29tZSkudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcyk7XG5cblx0XHRcdGZ1bmN0aW9uIHJlc29sdmVTb21lKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHRcdHZhciB0b1Jlc29sdmUsIHRvUmVqZWN0LCB2YWx1ZXMsIHJlYXNvbnMsIGZ1bGZpbGxPbmUsIHJlamVjdE9uZSwgbGVuLCBpO1xuXG5cdFx0XHRcdGxlbiA9IHByb21pc2VzT3JWYWx1ZXMubGVuZ3RoID4+PiAwO1xuXG5cdFx0XHRcdHRvUmVzb2x2ZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKGhvd01hbnksIGxlbikpO1xuXHRcdFx0XHR2YWx1ZXMgPSBbXTtcblxuXHRcdFx0XHR0b1JlamVjdCA9IChsZW4gLSB0b1Jlc29sdmUpICsgMTtcblx0XHRcdFx0cmVhc29ucyA9IFtdO1xuXG5cdFx0XHRcdC8vIE5vIGl0ZW1zIGluIHRoZSBpbnB1dCwgcmVzb2x2ZSBpbW1lZGlhdGVseVxuXHRcdFx0XHRpZiAoIXRvUmVzb2x2ZSkge1xuXHRcdFx0XHRcdHJlc29sdmUodmFsdWVzKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlamVjdE9uZSA9IGZ1bmN0aW9uKHJlYXNvbikge1xuXHRcdFx0XHRcdFx0cmVhc29ucy5wdXNoKHJlYXNvbik7XG5cdFx0XHRcdFx0XHRpZighLS10b1JlamVjdCkge1xuXHRcdFx0XHRcdFx0XHRmdWxmaWxsT25lID0gcmVqZWN0T25lID0gaWRlbnRpdHk7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChyZWFzb25zKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZnVsZmlsbE9uZSA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHRcdFx0Ly8gVGhpcyBvcmRlcnMgdGhlIHZhbHVlcyBiYXNlZCBvbiBwcm9taXNlIHJlc29sdXRpb24gb3JkZXJcblx0XHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbCk7XG5cdFx0XHRcdFx0XHRpZiAoIS0tdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdGZ1bGZpbGxPbmUgPSByZWplY3RPbmUgPSBpZGVudGl0eTtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSh2YWx1ZXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuXHRcdFx0XHRcdFx0aWYoaSBpbiBwcm9taXNlc09yVmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRcdHdoZW4ocHJvbWlzZXNPclZhbHVlc1tpXSwgZnVsZmlsbGVyLCByZWplY3Rlciwgbm90aWZ5KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiByZWplY3RlcihyZWFzb24pIHtcblx0XHRcdFx0XHRyZWplY3RPbmUocmVhc29uKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGZ1bGZpbGxlcih2YWwpIHtcblx0XHRcdFx0XHRmdWxmaWxsT25lKHZhbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWF0ZXMgYSBjb21wZXRpdGl2ZSByYWNlLCByZXR1cm5pbmcgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW5cblx0ICogYW55IG9uZSBvZiB0aGUgc3VwcGxpZWQgcHJvbWlzZXNPclZhbHVlcyBoYXMgcmVzb2x2ZWQgb3Igd2lsbCByZWplY3Qgd2hlblxuXHQgKiAqYWxsKiBwcm9taXNlc09yVmFsdWVzIGhhdmUgcmVqZWN0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZXNPclZhbHVlcyBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gYSBtaXhcblx0ICogICAgICBvZiB7QGxpbmsgUHJvbWlzZX1zIGFuZCB2YWx1ZXNcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvbkZ1bGZpbGxlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblJlamVjdGVkXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uUHJvZ3Jlc3NdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSB2YWx1ZSB0aGF0IHJlc29sdmVkIGZpcnN0LCBvclxuXHQgKiB3aWxsIHJlamVjdCB3aXRoIGFuIGFycmF5IG9mIGFsbCByZWplY3RlZCBpbnB1dHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBhbnkocHJvbWlzZXNPclZhbHVlcywgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpIHtcblxuXHRcdGZ1bmN0aW9uIHVud3JhcFNpbmdsZVJlc3VsdCh2YWwpIHtcblx0XHRcdHJldHVybiBvbkZ1bGZpbGxlZCA/IG9uRnVsZmlsbGVkKHZhbFswXSkgOiB2YWxbMF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNvbWUocHJvbWlzZXNPclZhbHVlcywgMSwgdW53cmFwU2luZ2xlUmVzdWx0LCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9ubHkgb25jZSBhbGwgdGhlIHN1cHBsaWVkIHByb21pc2VzT3JWYWx1ZXNcblx0ICogaGF2ZSByZXNvbHZlZC4gVGhlIHJlc29sdXRpb24gdmFsdWUgb2YgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSBhbiBhcnJheVxuXHQgKiBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIHZhbHVlcyBvZiBlYWNoIG9mIHRoZSBwcm9taXNlc09yVmFsdWVzLlxuXHQgKiBAbWVtYmVyT2Ygd2hlblxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fFByb21pc2V9IHByb21pc2VzT3JWYWx1ZXMgYXJyYXkgb2YgYW55dGhpbmcsIG1heSBjb250YWluIGEgbWl4XG5cdCAqICAgICAgb2Yge0BsaW5rIFByb21pc2V9cyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25GdWxmaWxsZWRdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25SZWplY3RlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblByb2dyZXNzXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIGFsbChwcm9taXNlc09yVmFsdWVzLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdHJldHVybiBfbWFwKHByb21pc2VzT3JWYWx1ZXMsIGlkZW50aXR5KS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBKb2lucyBtdWx0aXBsZSBwcm9taXNlcyBpbnRvIGEgc2luZ2xlIHJldHVybmVkIHByb21pc2UuXG5cdCAqIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgZnVsZmlsbCB3aGVuICphbGwqIHRoZSBpbnB1dCBwcm9taXNlc1xuXHQgKiBoYXZlIGZ1bGZpbGxlZCwgb3Igd2lsbCByZWplY3Qgd2hlbiAqYW55IG9uZSogb2YgdGhlIGlucHV0IHByb21pc2VzIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBqb2luKC8qIC4uLnByb21pc2VzICovKSB7XG5cdFx0cmV0dXJuIF9tYXAoYXJndW1lbnRzLCBpZGVudGl0eSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0dGxlcyBhbGwgaW5wdXQgcHJvbWlzZXMgc3VjaCB0aGF0IHRoZXkgYXJlIGd1YXJhbnRlZWQgbm90IHRvXG5cdCAqIGJlIHBlbmRpbmcgb25jZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSBmdWxmaWxscy4gVGhlIHJldHVybmVkIHByb21pc2Vcblx0ICogd2lsbCBhbHdheXMgZnVsZmlsbCwgZXhjZXB0IGluIHRoZSBjYXNlIHdoZXJlIGBhcnJheWAgaXMgYSBwcm9taXNlXG5cdCAqIHRoYXQgcmVqZWN0cy5cblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBhcnJheSBvciBwcm9taXNlIGZvciBhcnJheSBvZiBwcm9taXNlcyB0byBzZXR0bGVcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgdGhhdCBhbHdheXMgZnVsZmlsbHMgd2l0aCBhbiBhcnJheSBvZlxuXHQgKiAgb3V0Y29tZSBzbmFwc2hvdHMgZm9yIGVhY2ggaW5wdXQgcHJvbWlzZS5cblx0ICovXG5cdGZ1bmN0aW9uIHNldHRsZShhcnJheSkge1xuXHRcdHJldHVybiBfbWFwKGFycmF5LCB0b0Z1bGZpbGxlZFN0YXRlLCB0b1JlamVjdGVkU3RhdGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb21pc2UtYXdhcmUgYXJyYXkgbWFwIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUubWFwKClgLFxuXHQgKiBidXQgaW5wdXQgYXJyYXkgbWF5IGNvbnRhaW4gcHJvbWlzZXMgb3IgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge0FycmF5fFByb21pc2V9IGFycmF5IGFycmF5IG9mIGFueXRoaW5nLCBtYXkgY29udGFpbiBwcm9taXNlcyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcEZ1bmMgbWFwIGZ1bmN0aW9uIHdoaWNoIG1heSByZXR1cm4gYSBwcm9taXNlIG9yIHZhbHVlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgb2YgbWFwcGVkIHZhbHVlc1xuXHQgKiAgb3IgcmVqZWN0IGlmIGFueSBpbnB1dCBwcm9taXNlIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIG1hcEZ1bmMpIHtcblx0XHRyZXR1cm4gX21hcChhcnJheSwgbWFwRnVuYyk7XG5cdH1cblxuXHQvKipcblx0ICogSW50ZXJuYWwgbWFwIHRoYXQgYWxsb3dzIGEgZmFsbGJhY2sgdG8gaGFuZGxlIHJlamVjdGlvbnNcblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBhcnJheSBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtYXBGdW5jIG1hcCBmdW5jdGlvbiB3aGljaCBtYXkgcmV0dXJuIGEgcHJvbWlzZSBvciB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gZmFsbGJhY2sgZnVuY3Rpb24gdG8gaGFuZGxlIHJlamVjdGVkIHByb21pc2VzXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgb2YgbWFwcGVkIHZhbHVlc1xuXHQgKiAgb3IgcmVqZWN0IGlmIGFueSBpbnB1dCBwcm9taXNlIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfbWFwKGFycmF5LCBtYXBGdW5jLCBmYWxsYmFjaykge1xuXHRcdHJldHVybiB3aGVuKGFycmF5LCBmdW5jdGlvbihhcnJheSkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZU1hcCk7XG5cblx0XHRcdGZ1bmN0aW9uIHJlc29sdmVNYXAocmVzb2x2ZSwgcmVqZWN0LCBub3RpZnkpIHtcblx0XHRcdFx0dmFyIHJlc3VsdHMsIGxlbiwgdG9SZXNvbHZlLCBpO1xuXG5cdFx0XHRcdC8vIFNpbmNlIHdlIGtub3cgdGhlIHJlc3VsdGluZyBsZW5ndGgsIHdlIGNhbiBwcmVhbGxvY2F0ZSB0aGUgcmVzdWx0c1xuXHRcdFx0XHQvLyBhcnJheSB0byBhdm9pZCBhcnJheSBleHBhbnNpb25zLlxuXHRcdFx0XHR0b1Jlc29sdmUgPSBsZW4gPSBhcnJheS5sZW5ndGggPj4+IDA7XG5cdFx0XHRcdHJlc3VsdHMgPSBbXTtcblxuXHRcdFx0XHRpZighdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXN1bHRzKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTaW5jZSBtYXBGdW5jIG1heSBiZSBhc3luYywgZ2V0IGFsbCBpbnZvY2F0aW9ucyBvZiBpdCBpbnRvIGZsaWdodFxuXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRcdGlmKGkgaW4gYXJyYXkpIHtcblx0XHRcdFx0XHRcdHJlc29sdmVPbmUoYXJyYXlbaV0sIGkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQtLXRvUmVzb2x2ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiByZXNvbHZlT25lKGl0ZW0sIGkpIHtcblx0XHRcdFx0XHR3aGVuKGl0ZW0sIG1hcEZ1bmMsIGZhbGxiYWNrKS50aGVuKGZ1bmN0aW9uKG1hcHBlZCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0c1tpXSA9IG1hcHBlZDtcblxuXHRcdFx0XHRcdFx0aWYoIS0tdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUocmVzdWx0cyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgcmVqZWN0LCBub3RpZnkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJhZGl0aW9uYWwgcmVkdWNlIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUucmVkdWNlKClgLCBidXRcblx0ICogaW5wdXQgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kL29yIHZhbHVlcywgYW5kIHJlZHVjZUZ1bmNcblx0ICogbWF5IHJldHVybiBlaXRoZXIgYSB2YWx1ZSBvciBhIHByb21pc2UsICphbmQqIGluaXRpYWxWYWx1ZSBtYXlcblx0ICogYmUgYSBwcm9taXNlIGZvciB0aGUgc3RhcnRpbmcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZSBhcnJheSBvciBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBhbnl0aGluZyxcblx0ICogICAgICBtYXkgY29udGFpbiBhIG1peCBvZiBwcm9taXNlcyBhbmQgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWR1Y2VGdW5jIHJlZHVjZSBmdW5jdGlvbiByZWR1Y2UoY3VycmVudFZhbHVlLCBuZXh0VmFsdWUsIGluZGV4LCB0b3RhbCksXG5cdCAqICAgICAgd2hlcmUgdG90YWwgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBpdGVtcyBiZWluZyByZWR1Y2VkLCBhbmQgd2lsbCBiZSB0aGUgc2FtZVxuXHQgKiAgICAgIGluIGVhY2ggY2FsbCB0byByZWR1Y2VGdW5jLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIGZpbmFsIHJlZHVjZWQgdmFsdWVcblx0ICovXG5cdGZ1bmN0aW9uIHJlZHVjZShwcm9taXNlLCByZWR1Y2VGdW5jIC8qLCBpbml0aWFsVmFsdWUgKi8pIHtcblx0XHR2YXIgYXJncyA9IGZjYWxsKHNsaWNlLCBhcmd1bWVudHMsIDEpO1xuXG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZSwgZnVuY3Rpb24oYXJyYXkpIHtcblx0XHRcdHZhciB0b3RhbDtcblxuXHRcdFx0dG90YWwgPSBhcnJheS5sZW5ndGg7XG5cblx0XHRcdC8vIFdyYXAgdGhlIHN1cHBsaWVkIHJlZHVjZUZ1bmMgd2l0aCBvbmUgdGhhdCBoYW5kbGVzIHByb21pc2VzIGFuZCB0aGVuXG5cdFx0XHQvLyBkZWxlZ2F0ZXMgdG8gdGhlIHN1cHBsaWVkLlxuXHRcdFx0YXJnc1swXSA9IGZ1bmN0aW9uIChjdXJyZW50LCB2YWwsIGkpIHtcblx0XHRcdFx0cmV0dXJuIHdoZW4oY3VycmVudCwgZnVuY3Rpb24gKGMpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbih2YWwsIGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlZHVjZUZ1bmMoYywgdmFsdWUsIGksIHRvdGFsKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gcmVkdWNlQXJyYXkuYXBwbHkoYXJyYXksIGFyZ3MpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gU25hcHNob3Qgc3RhdGVzXG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmdWxmaWxsZWQgc3RhdGUgc25hcHNob3Rcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB4IGFueSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7e3N0YXRlOidmdWxmaWxsZWQnLHZhbHVlOip9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9GdWxmaWxsZWRTdGF0ZSh4KSB7XG5cdFx0cmV0dXJuIHsgc3RhdGU6ICdmdWxmaWxsZWQnLCB2YWx1ZTogeCB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSByZWplY3RlZCBzdGF0ZSBzbmFwc2hvdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHggYW55IHJlYXNvblxuXHQgKiBAcmV0dXJucyB7e3N0YXRlOidyZWplY3RlZCcscmVhc29uOip9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9SZWplY3RlZFN0YXRlKHgpIHtcblx0XHRyZXR1cm4geyBzdGF0ZTogJ3JlamVjdGVkJywgcmVhc29uOiB4IH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHBlbmRpbmcgc3RhdGUgc25hcHNob3Rcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMge3tzdGF0ZToncGVuZGluZyd9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9QZW5kaW5nU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHsgc3RhdGU6ICdwZW5kaW5nJyB9O1xuXHR9XG5cblx0Ly9cblx0Ly8gSW50ZXJuYWxzLCB1dGlsaXRpZXMsIGV0Yy5cblx0Ly9cblxuXHR2YXIgcHJvbWlzZVByb3RvdHlwZSwgbWFrZVByb21pc2VQcm90b3R5cGUsIHJlZHVjZUFycmF5LCBzbGljZSwgZmNhbGwsIG5leHRUaWNrLCBoYW5kbGVyUXVldWUsXG5cdFx0ZnVuY1Byb3RvLCBjYWxsLCBhcnJheVByb3RvLCBtb25pdG9yQXBpLFxuXHRcdGNhcHR1cmVkU2V0VGltZW91dCwgY2pzUmVxdWlyZSwgTXV0YXRpb25PYnMsIHVuZGVmO1xuXG5cdGNqc1JlcXVpcmUgPSByZXF1aXJlO1xuXG5cdC8vXG5cdC8vIFNoYXJlZCBoYW5kbGVyIHF1ZXVlIHByb2Nlc3Npbmdcblx0Ly9cblx0Ly8gQ3JlZGl0IHRvIFR3aXNvbCAoaHR0cHM6Ly9naXRodWIuY29tL1R3aXNvbCkgZm9yIHN1Z2dlc3Rpbmdcblx0Ly8gdGhpcyB0eXBlIG9mIGV4dGVuc2libGUgcXVldWUgKyB0cmFtcG9saW5lIGFwcHJvYWNoIGZvclxuXHQvLyBuZXh0LXRpY2sgY29uZmxhdGlvbi5cblxuXHRoYW5kbGVyUXVldWUgPSBbXTtcblxuXHQvKipcblx0ICogRW5xdWV1ZSBhIHRhc2suIElmIHRoZSBxdWV1ZSBpcyBub3QgY3VycmVudGx5IHNjaGVkdWxlZCB0byBiZVxuXHQgKiBkcmFpbmVkLCBzY2hlZHVsZSBpdC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gdGFza1xuXHQgKi9cblx0ZnVuY3Rpb24gZW5xdWV1ZSh0YXNrKSB7XG5cdFx0aWYoaGFuZGxlclF1ZXVlLnB1c2godGFzaykgPT09IDEpIHtcblx0XHRcdG5leHRUaWNrKGRyYWluUXVldWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEcmFpbiB0aGUgaGFuZGxlciBxdWV1ZSBlbnRpcmVseSwgYmVpbmcgY2FyZWZ1bCB0byBhbGxvdyB0aGVcblx0ICogcXVldWUgdG8gYmUgZXh0ZW5kZWQgd2hpbGUgaXQgaXMgYmVpbmcgcHJvY2Vzc2VkLCBhbmQgdG8gY29udGludWVcblx0ICogcHJvY2Vzc2luZyB1bnRpbCBpdCBpcyB0cnVseSBlbXB0eS5cblx0ICovXG5cdGZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG5cdFx0cnVuSGFuZGxlcnMoaGFuZGxlclF1ZXVlKTtcblx0XHRoYW5kbGVyUXVldWUgPSBbXTtcblx0fVxuXG5cdC8vIEFsbG93IGF0dGFjaGluZyB0aGUgbW9uaXRvciB0byB3aGVuKCkgaWYgZW52IGhhcyBubyBjb25zb2xlXG5cdG1vbml0b3JBcGkgPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgPyBjb25zb2xlIDogd2hlbjtcblxuXHQvLyBTbmlmZiBcImJlc3RcIiBhc3luYyBzY2hlZHVsaW5nIG9wdGlvblxuXHQvLyBQcmVmZXIgcHJvY2Vzcy5uZXh0VGljayBvciBNdXRhdGlvbk9ic2VydmVyLCB0aGVuIGNoZWNrIGZvclxuXHQvLyB2ZXJ0eCBhbmQgZmluYWxseSBmYWxsIGJhY2sgdG8gc2V0VGltZW91dFxuXHQvKmdsb2JhbCBwcm9jZXNzLGRvY3VtZW50LHNldFRpbWVvdXQsTXV0YXRpb25PYnNlcnZlcixXZWJLaXRNdXRhdGlvbk9ic2VydmVyKi9cblx0aWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG5cdFx0bmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuXHR9IGVsc2UgaWYoTXV0YXRpb25PYnMgPVxuXHRcdCh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBNdXRhdGlvbk9ic2VydmVyKSB8fFxuXHRcdFx0KHR5cGVvZiBXZWJLaXRNdXRhdGlvbk9ic2VydmVyID09PSAnZnVuY3Rpb24nICYmIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIpKSB7XG5cdFx0bmV4dFRpY2sgPSAoZnVuY3Rpb24oZG9jdW1lbnQsIE11dGF0aW9uT2JzZXJ2ZXIsIGRyYWluUXVldWUpIHtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIoZHJhaW5RdWV1ZSkub2JzZXJ2ZShlbCwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSgneCcsICd4Jyk7XG5cdFx0XHR9O1xuXHRcdH0oZG9jdW1lbnQsIE11dGF0aW9uT2JzLCBkcmFpblF1ZXVlKSk7XG5cdH0gZWxzZSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIHZlcnQueCAxLnggfHwgMi54XG5cdFx0XHRuZXh0VGljayA9IGNqc1JlcXVpcmUoJ3ZlcnR4JykucnVuT25Mb29wIHx8IGNqc1JlcXVpcmUoJ3ZlcnR4JykucnVuT25Db250ZXh0O1xuXHRcdH0gY2F0Y2goaWdub3JlKSB7XG5cdFx0XHQvLyBjYXB0dXJlIHNldFRpbWVvdXQgdG8gYXZvaWQgYmVpbmcgY2F1Z2h0IGJ5IGZha2UgdGltZXJzXG5cdFx0XHQvLyB1c2VkIGluIHRpbWUgYmFzZWQgdGVzdHNcblx0XHRcdGNhcHR1cmVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG5cdFx0XHRuZXh0VGljayA9IGZ1bmN0aW9uKHQpIHsgY2FwdHVyZWRTZXRUaW1lb3V0KHQsIDApOyB9O1xuXHRcdH1cblx0fVxuXG5cdC8vXG5cdC8vIENhcHR1cmUvcG9seWZpbGwgZnVuY3Rpb24gYW5kIGFycmF5IHV0aWxzXG5cdC8vXG5cblx0Ly8gU2FmZSBmdW5jdGlvbiBjYWxsc1xuXHRmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cdGNhbGwgPSBmdW5jUHJvdG8uY2FsbDtcblx0ZmNhbGwgPSBmdW5jUHJvdG8uYmluZFxuXHRcdD8gY2FsbC5iaW5kKGNhbGwpXG5cdFx0OiBmdW5jdGlvbihmLCBjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm4gZi5hcHBseShjb250ZXh0LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMikpO1xuXHRcdH07XG5cblx0Ly8gU2FmZSBhcnJheSBvcHNcblx0YXJyYXlQcm90byA9IFtdO1xuXHRzbGljZSA9IGFycmF5UHJvdG8uc2xpY2U7XG5cblx0Ly8gRVM1IHJlZHVjZSBpbXBsZW1lbnRhdGlvbiBpZiBuYXRpdmUgbm90IGF2YWlsYWJsZVxuXHQvLyBTZWU6IGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDE1LjQuNC4yMSBhcyB0aGVyZSBhcmUgbWFueVxuXHQvLyBzcGVjaWZpY3MgYW5kIGVkZ2UgY2FzZXMuICBFUzUgZGljdGF0ZXMgdGhhdCByZWR1Y2UubGVuZ3RoID09PSAxXG5cdC8vIFRoaXMgaW1wbGVtZW50YXRpb24gZGV2aWF0ZXMgZnJvbSBFUzUgc3BlYyBpbiB0aGUgZm9sbG93aW5nIHdheXM6XG5cdC8vIDEuIEl0IGRvZXMgbm90IGNoZWNrIGlmIHJlZHVjZUZ1bmMgaXMgYSBDYWxsYWJsZVxuXHRyZWR1Y2VBcnJheSA9IGFycmF5UHJvdG8ucmVkdWNlIHx8XG5cdFx0ZnVuY3Rpb24ocmVkdWNlRnVuYyAvKiwgaW5pdGlhbFZhbHVlICovKSB7XG5cdFx0XHQvKmpzaGludCBtYXhjb21wbGV4aXR5OiA3Ki9cblx0XHRcdHZhciBhcnIsIGFyZ3MsIHJlZHVjZWQsIGxlbiwgaTtcblxuXHRcdFx0aSA9IDA7XG5cdFx0XHRhcnIgPSBPYmplY3QodGhpcyk7XG5cdFx0XHRsZW4gPSBhcnIubGVuZ3RoID4+PiAwO1xuXHRcdFx0YXJncyA9IGFyZ3VtZW50cztcblxuXHRcdFx0Ly8gSWYgbm8gaW5pdGlhbFZhbHVlLCB1c2UgZmlyc3QgaXRlbSBvZiBhcnJheSAod2Uga25vdyBsZW5ndGggIT09IDAgaGVyZSlcblx0XHRcdC8vIGFuZCBhZGp1c3QgaSB0byBzdGFydCBhdCBzZWNvbmQgaXRlbVxuXHRcdFx0aWYoYXJncy5sZW5ndGggPD0gMSkge1xuXHRcdFx0XHQvLyBTa2lwIHRvIHRoZSBmaXJzdCByZWFsIGVsZW1lbnQgaW4gdGhlIGFycmF5XG5cdFx0XHRcdGZvcig7Oykge1xuXHRcdFx0XHRcdGlmKGkgaW4gYXJyKSB7XG5cdFx0XHRcdFx0XHRyZWR1Y2VkID0gYXJyW2krK107XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJZiB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGFycmF5IHdpdGhvdXQgZmluZGluZyBhbnkgcmVhbFxuXHRcdFx0XHRcdC8vIGVsZW1lbnRzLCBpdCdzIGEgVHlwZUVycm9yXG5cdFx0XHRcdFx0aWYoKytpID49IGxlbikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSWYgaW5pdGlhbFZhbHVlIHByb3ZpZGVkLCB1c2UgaXRcblx0XHRcdFx0cmVkdWNlZCA9IGFyZ3NbMV07XG5cdFx0XHR9XG5cblx0XHRcdC8vIERvIHRoZSBhY3R1YWwgcmVkdWNlXG5cdFx0XHRmb3IoO2kgPCBsZW47ICsraSkge1xuXHRcdFx0XHRpZihpIGluIGFycikge1xuXHRcdFx0XHRcdHJlZHVjZWQgPSByZWR1Y2VGdW5jKHJlZHVjZWQsIGFycltpXSwgaSwgYXJyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVkdWNlZDtcblx0XHR9O1xuXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcblx0XHRyZXR1cm4geDtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyYXNoKGZhdGFsRXJyb3IpIHtcblx0XHRpZih0eXBlb2YgbW9uaXRvckFwaS5yZXBvcnRVbmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdG1vbml0b3JBcGkucmVwb3J0VW5oYW5kbGVkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVucXVldWUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGZhdGFsRXJyb3I7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aHJvdyBmYXRhbEVycm9yO1xuXHR9XG5cblx0cmV0dXJuIHdoZW47XG59KTtcbn0pKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uIChmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKTsgfSk7XG4iLCIvLyBCRUdJTiBPQkpFQ1RcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIEFwaU9iamVjdCA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29udmVydEl0ZW0ocmF3KSB7XHJcbiAgICAgICAgcmV0dXJuIEFwaU9iamVjdC5jcmVhdGUodGhpcy5pdGVtVHlwZSwgcmF3LCB0aGlzLmFwaSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhLCBhcGksIGl0ZW1UeXBlKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIEFwaU9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSBpdGVtVHlwZTtcclxuICAgICAgICBpZiAoIWRhdGEpIGRhdGEgPSB7fTtcclxuICAgICAgICBpZiAoIWRhdGEuaXRlbXMpIHRoaXMucHJvcChcIml0ZW1zXCIsIGRhdGEuaXRlbXMgPSBbXSk7XHJcbiAgICAgICAgaWYgKGRhdGEuaXRlbXMubGVuZ3RoID4gMCkgdGhpcy5hZGQoZGF0YS5pdGVtcywgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5vbignc3luYycsIGZ1bmN0aW9uIChyYXcpIHtcclxuICAgICAgICAgICAgaWYgKHJhdyAmJiByYXcuaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlQWxsKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZChyYXcuaXRlbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB1dGlscy5leHRlbmQobmV3IEFwaU9iamVjdCgpLCB7XHJcbiAgICAgICAgaXNDb2xsZWN0aW9uOiB0cnVlLFxyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IsXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbiAobmV3SXRlbXMsIC8qcHJpdmF0ZSovIG5vVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5nZXRUeXBlKG5ld0l0ZW1zKSAhPT0gXCJBcnJheVwiKSBuZXdJdGVtcyA9IFtuZXdJdGVtc107XHJcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMsIHV0aWxzLm1hcChuZXdJdGVtcywgY29udmVydEl0ZW0sIHRoaXMpKTtcclxuICAgICAgICAgICAgaWYgKCFub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJhd0l0ZW1zID0gdGhpcy5wcm9wKFwiaXRlbXNcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3AoXCJpdGVtc1wiLCByYXdJdGVtcy5jb25jYXQobmV3SXRlbXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaW5kZXhPckl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPckl0ZW07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXhPckl0ZW0gIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gdXRpbHMuaW5kZXhPZih0aGlzLCBpbmRleE9ySXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5jYWxsKHRoaXMsIGluZGV4LCAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uKG5ld0l0ZW1zLCBub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHRoaXMsIFswLCB0aGlzLmxlbmd0aF0uY29uY2F0KHV0aWxzLm1hcChuZXdJdGVtcywgY29udmVydEl0ZW0sIHRoaXMpKSk7XHJcbiAgICAgICAgICAgIGlmICghbm9VcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcChcIml0ZW1zXCIsIG5ld0l0ZW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlQWxsOiBmdW5jdGlvbihub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwodGhpcywgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAoIW5vVXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3AoXCJpdGVtc1wiLCBbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEluZGV4OiBmdW5jdGlvbiAobmV3SW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jdXJyZW50SW5kZXg7XHJcbiAgICAgICAgICAgIGlmICghaW5kZXggJiYgaW5kZXggIT09IDApIGluZGV4ID0gdGhpcy5wcm9wKFwic3RhcnRJbmRleFwiKTtcclxuICAgICAgICAgICAgaWYgKCFpbmRleCAmJiBpbmRleCAhPT0gMCkgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRJbmRleDogZnVuY3Rpb24obmV3SW5kZXgsIHJlcSkge1xyXG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMuZ2V0KHV0aWxzLmV4dGVuZChyZXEsIHsgc3RhcnRJbmRleDogbmV3SW5kZXh9KSk7XHJcbiAgICAgICAgICAgIHAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBtZS5jdXJyZW50SW5kZXggPSBuZXdJbmRleDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmlyc3RQYWdlOiBmdW5jdGlvbihyZXEpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoKTtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJbmRleCA9PT0gMCkgdGhyb3cgXCJUaGlzIFwiICsgdGhpcy50eXBlICsgXCIgY29sbGVjdGlvbiBpcyBhbHJlYWR5IGF0IHJlY29yZCAwIGFuZCBoYXMgbm8gcHJldmlvdXMgcGFnZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SW5kZXgoMCwgcmVxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZQYWdlOiBmdW5jdGlvbiAocmVxKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmdldEluZGV4KCksXHJcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZSA9IHRoaXMucHJvcChcInBhZ2VTaXplXCIpLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSBNYXRoLm1heChjdXJyZW50SW5kZXggLSBwYWdlU2l6ZSwgMCk7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50SW5kZXggPT09IDApIHRocm93IFwiVGhpcyBcIiArIHRoaXMudHlwZSArIFwiIGNvbGxlY3Rpb24gaXMgYWxyZWFkeSBhdCByZWNvcmQgMCBhbmQgaGFzIG5vIHByZXZpb3VzIHBhZ2UuXCI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEluZGV4KG5ld0luZGV4LCByZXEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dFBhZ2U6IGZ1bmN0aW9uIChyZXEpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoKSxcclxuICAgICAgICAgICAgICAgIHBhZ2VTaXplID0gdGhpcy5wcm9wKFwicGFnZVNpemVcIiksXHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCA9IGN1cnJlbnRJbmRleCArIHBhZ2VTaXplO1xyXG4gICAgICAgICAgICBpZiAoIShuZXdJbmRleCA8IHRoaXMucHJvcChcInRvdGFsQ291bnRcIikpKSB0aHJvdyBcIlRoaXMgXCIgKyB0aGlzLnR5cGUgKyBcIiBjb2xsZWN0aW9uIGlzIGFscmVhZHkgYXQgaXRzIGxhc3QgcGFnZSBhbmQgaGFzIG5vIG5leHQgcGFnZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SW5kZXgobmV3SW5kZXgsIHJlcSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXN0UGFnZTogZnVuY3Rpb24gKHJlcSkge1xyXG4gICAgICAgICAgICB2YXIgdG90YWxDb3VudCA9IHRoaXMucHJvcChcInRvdGFsQ291bnRcIiksXHJcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZSA9IHRoaXMucHJvcChcInBhZ2VTaXplXCIpLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSB0b3RhbENvdW50IC0gcGFnZVNpemU7XHJcbiAgICAgICAgICAgIGlmIChuZXdJbmRleCA8PSAwKSB0aHJvdyBcIlRoaXMgXCIgKyB0aGlzLnR5cGUgKyBcIiBjb2xsZWN0aW9uIGhhcyBvbmx5IG9uZSBwYWdlLlwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRJbmRleChuZXdJbmRleCwgcmVxKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IudHlwZXMgPSB7XHJcbiAgICAgICAgbG9jYXRpb25zOiByZXF1aXJlKCcuL3R5cGVzL2xvY2F0aW9ucycpXHJcbiAgICB9O1xyXG4gICAgQXBpQ29sbGVjdGlvbkNvbnN0cnVjdG9yLmh5ZHJhdGVkVHlwZXMgPSB7fTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IuZ2V0SHlkcmF0ZWRUeXBlID0gQXBpT2JqZWN0LmdldEh5ZHJhdGVkVHlwZTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IuY3JlYXRlID0gZnVuY3Rpb24gKHR5cGUsIGRhdGEsIGFwaSwgaXRlbVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3ICh0eXBlIGluIHRoaXMudHlwZXMgPyB0aGlzLnR5cGVzW3R5cGVdIDogdGhpcykodHlwZSwgZGF0YSwgYXBpLCBpdGVtVHlwZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3Rvci5jcmVhdGUgPSBmdW5jdGlvbiAodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgaXRlbVR5cGUpIHtcclxuICAgICAgICB2YXIgQXBpQ29sbGVjdGlvblR5cGUgPSB0aGlzLmdldEh5ZHJhdGVkVHlwZSh0eXBlTmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgQXBpQ29sbGVjdGlvblR5cGUodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgaXRlbVR5cGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3RvcjtcclxuXHJcbi8vIEVORCBPQkpFQ1RcclxuXHJcbi8qKioqKioqKioqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIERFRkFVTFRfV0lTSExJU1RfTkFNRTogJ215X3dpc2hsaXN0JyxcclxuICAgIFBBWU1FTlRfU1RBVFVTRVM6IHtcclxuICAgICAgICBORVc6IFwiTmV3XCJcclxuICAgIH0sXHJcbiAgICBQQVlNRU5UX0FDVElPTlM6IHtcclxuICAgICAgICBWT0lEOiBcIlZvaWRQYXltZW50XCJcclxuICAgIH0sXHJcbiAgICBPUkRFUl9TVEFUVVNFUzoge1xyXG4gICAgICAgIEFCQU5ET05FRDogXCJBYmFuZG9uZWRcIixcclxuICAgICAgICBBQ0NFUFRFRDogXCJBY2NlcHRlZFwiLFxyXG4gICAgICAgIENBTkNFTExFRDogXCJDYW5jZWxsZWRcIixcclxuICAgICAgICBDT01QTEVURUQ6IFwiQ29tcGxldGVkXCIsXHJcbiAgICAgICAgQ1JFQVRFRDogXCJDcmVhdGVkXCIsXHJcbiAgICAgICAgUEVORElOR19SRVZJRVc6IFwiUGVuZGluZ1Jldmlld1wiLFxyXG4gICAgICAgIFBST0NFU1NJTkc6IFwiUHJvY2Vzc2luZ1wiLFxyXG4gICAgICAgIFNVQk1JVFRFRDogXCJTdWJtaXR0ZWRcIixcclxuICAgICAgICBWQUxJREFURUQ6IFwiVmFsaWRhdGVkXCJcclxuICAgIH0sXHJcbiAgICBPUkRFUl9BQ1RJT05TOiB7XHJcbiAgICAgICAgQ1JFQVRFX09SREVSOiBcIkNyZWF0ZU9yZGVyXCIsXHJcbiAgICAgICAgU1VCTUlUX09SREVSOiBcIlN1Ym1pdE9yZGVyXCIsXHJcbiAgICAgICAgQUNDRVBUX09SREVSOiBcIkFjY2VwdE9yZGVyXCIsXHJcbiAgICAgICAgVkFMSURBVEVfT1JERVI6IFwiVmFsaWRhdGVPcmRlclwiLFxyXG4gICAgICAgIFNFVF9PUkRFUl9BU19QUk9DRVNTSU5HOiBcIlNldE9yZGVyQXNQcm9jZXNzaW5nXCIsXHJcbiAgICAgICAgQ09NUExFVEVfT1JERVI6IFwiQ29tcGxldGVPcmRlclwiLFxyXG4gICAgICAgIENBTkNFTF9PUkRFUjogXCJDYW5jZWxPcmRlclwiLFxyXG4gICAgICAgIFJFT1BFTl9PUkRFUjogXCJSZW9wZW5PcmRlclwiXHJcbiAgICB9LFxyXG4gICAgRlVMRklMTE1FTlRfTUVUSE9EUzoge1xyXG4gICAgICAgIFNISVA6IFwiU2hpcFwiLFxyXG4gICAgICAgIFBJQ0tVUDogXCJQaWNrdXBcIlxyXG4gICAgfVxyXG59O1xyXG4iLCIvLyBCRUdJTiBDT05URVhUXHJcbi8qKlxyXG4gKiBAY2xhc3NcclxuICogQGNsYXNzZGVzYyBUaGUgY29udGV4dCBvYmplY3QgaGVscHMgeW91IGNvbmZpZ3VyZSB0aGUgU0RLIHRvIGNvbm5lY3QgdG8gYSBwYXJ0aWN1bGFyIE1venUgc2l0ZS4gU3VwcGx5IGl0IHdpdGggdGVuYW50LCBzaXRlLCBtYXN0ZXJjYXRhbG9nLCBjdXJyZW5jeSBjb2RlLCBsb2NhbGUgY29kZSwgYXBwIGNsYWltcywgYW5kIHVzZXIgY2xhaW1zLCBhbmQgIGl0IHdpbGwgcHJvZHVjZSBmb3IgeW91IGFuIEFwaUludGVyZmFjZSBvYmplY3QuXHJcbiAqL1xyXG5cclxudmFyIEFwaUludGVyZmFjZSA9IHJlcXVpcmUoJy4vaW50ZXJmYWNlJyk7XHJcbnZhciBBcGlSZWZlcmVuY2UgPSByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG4vKipcclxuICogQHByaXZhdGVcclxuICovXHJcbnZhciBBcGlDb250ZXh0Q29uc3RydWN0b3IgPSBmdW5jdGlvbihjb25mKSB7XHJcbiAgICB1dGlscy5leHRlbmQodGhpcywgY29uZik7XHJcbiAgICBpZiAoQXBpQ29udGV4dENvbnN0cnVjdG9yLl9fZGVidWdfXyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIEFwaUNvbnRleHRDb25zdHJ1Y3Rvci5fX2RlYnVnX18gPSByZXF1aXJlKCd3aGVuL21vbml0b3IvY29uc29sZScpO1xyXG4gICAgfVxyXG59LFxyXG4gICAgbXV0YWJsZUFjY2Vzc29ycyA9IFsnYXBwLWNsYWltcycsICd1c2VyLWNsYWltcycsICdjYWxsY2hhaW4nLCAnY3VycmVuY3knLCAnbG9jYWxlJ10sIC8vLCAnYnlwYXNzLWNhY2hlJ10sXHJcbiAgICBpbW11dGFibGVBY2Nlc3NvcnMgPSBbJ3RlbmFudCcsICdzaXRlJywgJ21hc3Rlci1jYXRhbG9nJ10sXHJcbiAgICBpbW11dGFibGVBY2Nlc3Nvckxlbmd0aCA9IGltbXV0YWJsZUFjY2Vzc29ycy5sZW5ndGgsXHJcbiAgICBhbGxBY2Nlc3NvcnMgPSBtdXRhYmxlQWNjZXNzb3JzLmNvbmNhdChpbW11dGFibGVBY2Nlc3NvcnMpLFxyXG4gICAgYWxsQWNjZXNzb3JzTGVuZ3RoID0gYWxsQWNjZXNzb3JzLmxlbmd0aCxcclxuICAgIGo7XHJcblxyXG52YXIgc2V0SW1tdXRhYmxlQWNjZXNzb3IgPSBmdW5jdGlvbihwcm9wTmFtZSkge1xyXG4gICAgQXBpQ29udGV4dENvbnN0cnVjdG9yLnByb3RvdHlwZVt1dGlscy5jYW1lbENhc2UocHJvcE5hbWUsIHRydWUpXSA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXNbcHJvcE5hbWVdO1xyXG4gICAgICAgIHZhciBuZXdDb25mID0gdGhpcy5hc09iamVjdCgpO1xyXG4gICAgICAgIG5ld0NvbmZbcHJvcE5hbWVdID0gdmFsO1xyXG4gICAgICAgIHJldHVybiBuZXcgQXBpQ29udGV4dENvbnN0cnVjdG9yKG5ld0NvbmYpO1xyXG4gICAgfTtcclxufTtcclxuXHJcbnZhciBzZXRNdXRhYmxlQWNjZXNzb3IgPSBmdW5jdGlvbihwcm9wTmFtZSkge1xyXG4gICAgQXBpQ29udGV4dENvbnN0cnVjdG9yLnByb3RvdHlwZVt1dGlscy5jYW1lbENhc2UocHJvcE5hbWUsIHRydWUpXSA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXNbcHJvcE5hbWVdO1xyXG4gICAgICAgIHRoaXNbcHJvcE5hbWVdID0gdmFsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxufTtcclxuXHJcbkFwaUNvbnRleHRDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XHJcbiAgICBjb25zdHJ1Y3RvcjogQXBpQ29udGV4dENvbnN0cnVjdG9yLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBvciBjcmVhdGVzIHRoZSBgQXBpSW50ZXJmYWNlYCBmb3IgdGhpcyBjb250ZXh0IHRoYXQgd2lsbCBkbyBhbGwgdGhlIHJlYWwgd29yay5cclxuICAgICAqIENhbGwgdGhpcyBtZXRob2Qgb25seSB3aGVuIHlvdSd2ZSBidWlsdCBhIGNvbXBsZXRlIGNvbnRleHQgaW5jbHVkaW5nIHRlbmFudCwgc2l0ZSwgbWFzdGVyIGNhdGFsb2csXHJcbiAgICAgKiBsb2NhbGUsIGN1cnJlbmN5IGNvZGUsIGFwcCBjbGFpbXMsIGFuZCB1c2VyIGNsYWltcy4gQXNzaWduIGl0cyByZXR1cm4gdmFsdWUgdG8gYSBsb2NhbCB2YXJpYWJsZS5cclxuICAgICAqIFlvdSdsbCB1c2UgdGhpcyBpbnRlcmZhY2Ugb2JqZWN0IHRvIGNyZWF0ZSB5b3VyIGBBcGlPYmplY3RgcyBhbmQgZG8gQVBJIHJlcXVlc3RzIVxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBBcGlDb250ZXh0I1xyXG4gICAgICogQHJldHVybnMge0FwaUludGVyZmFjZX0gVGhlIHNpbmdsZSBgQXBpSW50ZXJmYWNlYCBmb3IgdGhpcyBjb250ZXh0LlxyXG4gICAgICogQHRocm93cyB7UmVmZXJlbmNlRXJyb3J9IGlmIHRoZSBjb250ZXh0IGlzIG5vdCB5ZXQgY29tcGxldGUuXHJcbiAgICAgKi9cclxuICAgIGFwaTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwaUluc3RhbmNlIHx8ICh0aGlzLl9hcGlJbnN0YW5jZSA9IG5ldyBBcGlJbnRlcmZhY2UodGhpcykpO1xyXG4gICAgfSxcclxuICAgIFN0b3JlOiBmdW5jdGlvbihjb25mKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBBcGlDb250ZXh0Q29uc3RydWN0b3IoY29uZik7XHJcbiAgICB9LFxyXG4gICAgYXNPYmplY3Q6IGZ1bmN0aW9uKHByZWZpeCkge1xyXG4gICAgICAgIHZhciBvYmogPSB7fTtcclxuICAgICAgICBwcmVmaXggPSBwcmVmaXggfHwgJyc7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxBY2Nlc3NvcnNMZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBvYmpbcHJlZml4ICsgYWxsQWNjZXNzb3JzW2ldXSA9IHRoaXNbYWxsQWNjZXNzb3JzW2ldXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH0sXHJcbiAgICBzZXRTZXJ2aWNlVXJsczogZnVuY3Rpb24odXJscykge1xyXG4gICAgICAgIEFwaVJlZmVyZW5jZS51cmxzID0gdXJscztcclxuICAgIH0sXHJcbiAgICBnZXRTZXJ2aWNlVXJsczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmV4dGVuZCh7fSwgQXBpUmVmZXJlbmNlLnVybHMpO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbmN5OiAndXNkJyxcclxuICAgIGxvY2FsZTogJ2VuLVVTJ1xyXG59O1xyXG5cclxuZm9yIChqID0gMDsgaiA8IGltbXV0YWJsZUFjY2Vzc29ycy5sZW5ndGg7IGorKykgc2V0SW1tdXRhYmxlQWNjZXNzb3IoaW1tdXRhYmxlQWNjZXNzb3JzW2pdKTtcclxuZm9yIChqID0gMDsgaiA8IG11dGFibGVBY2Nlc3NvcnMubGVuZ3RoOyBqKyspIHNldE11dGFibGVBY2Nlc3NvcihtdXRhYmxlQWNjZXNzb3JzW2pdKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBpQ29udGV4dENvbnN0cnVjdG9yO1xyXG5cclxuLy8gRU5EIENPTlRFWFRcclxuXHJcbi8qKioqKioqKi8iLCIvLyBCRUdJTiBFUlJPUlNcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG5cclxuZnVuY3Rpb24gZXJyb3JUb1N0cmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLm5hbWUgKyBcIjogXCIgKyB0aGlzLm1lc3NhZ2U7XHJcbn1cclxuXHJcbnZhciBlcnJvclR5cGVzID0ge307XHJcblxyXG52YXIgZXJyb3JzID0ge1xyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNvZGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvZGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucmVnaXN0ZXIoaSwgY29kZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnJvclR5cGVzW2NvZGVdID0ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlOiBmdW5jdGlvbihjb2RlKSB7XHJcbiAgICAgICAgdmFyIG1zZyA9IHV0aWxzLmZvcm1hdFN0cmluZy5hcHBseSh1dGlscywgW2Vycm9yVHlwZXNbY29kZV0ubWVzc2FnZV0uY29uY2F0KHV0aWxzLnNsaWNlKGFyZ3VtZW50cywgMSkpKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lOiBjb2RlLFxyXG4gICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgbWVzc2FnZTogbXNnLFxyXG4gICAgICAgICAgICBodG1sTWVzc2FnZTogbXNnLFxyXG4gICAgICAgICAgICB0b1N0cmluZzogZXJyb3JUb1N0cmluZ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgdGhyb3dPbk9iamVjdDogZnVuY3Rpb24ob2JqLCBjb2RlKSB7XHJcbiAgICAgICAgdmFyIGVycm9yID0gZXJyb3JzLmNyZWF0ZS5hcHBseShlcnJvcnMsIFtjb2RlXS5jb25jYXQodXRpbHMuc2xpY2UoYXJndW1lbnRzLCAyKSkpO1xyXG4gICAgICAgIG9iai5maXJlKCdlcnJvcicsIGVycm9yKTtcclxuICAgICAgICBvYmouYXBpLmZpcmUoJ2Vycm9yJywgZXJyb3IsIG9iaik7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9LFxyXG4gICAgcGFzc0Zyb206IGZ1bmN0aW9uKGZyb20sIHRvKSB7XHJcbiAgICAgICAgZnJvbS5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdG8uZmlyZS5hcHBseSh0bywgWydlcnJvciddLmNvbmNhdCh1dGlscy5zbGljZShhcmd1bWVudHMpKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9ycztcclxuLy8gRU5EIEVSUk9SUyIsIi8vIEJFR0lOIElGUkFNRVhIUlxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBJZnJhbWVYSFIgPSAoZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIHZhciBoYXNQb3N0TWVzc2FnZSA9IHdpbmRvdy5wb3N0TWVzc2FnZSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJPcGVyYVwiKSA9PT0gLTEsXHJcbiAgICAgICAgZmlyZWZveFZlcnNpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LFxyXG4gICAgICAgICAgICAgICAgcmUgPSAvRmlyZWZveFxcLyhcXGQrKS9pLFxyXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB1YS5tYXRjaChyZSksXHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uU3RyID0gcGFyc2VJbnQobWF0Y2ggPyAobWF0Y2hbMV0gfHwgZmFsc2UpIDogZmFsc2UpLFxyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IGlzTmFOKHZlcnNpb25TdHIpID8gZmFsc2UgOiB2ZXJzaW9uU3RyO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHZlcnNpb247XHJcbiAgICAgICAgfSgpKSxcclxuICAgICAgICBjYWNoZUJ1c3QgPSAxLFxyXG4gICAgICAgIGhhc2hSRSA9IC9eIz9cXGQrJi8sXHJcbiAgICAgICAgb3JpZ2luUkUgPSAvXmh0dHBzPzpcXC9cXC9bXi9dKy9pLFxyXG4gICAgICAgIHZhbGlkYXRlT3JpZ2luID0gZnVuY3Rpb24gKGl4aHIsIG9yaWdpbikge1xyXG4gICAgICAgICAgICByZXR1cm4gaXhoci5mcmFtZU9yaWdpbiA9PT0gb3JpZ2luLnRvTG93ZXJDYXNlKCkubWF0Y2gob3JpZ2luUkUpWzBdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWVzc2FnZURlbGltaXRlciA9ICd8fHx8fCcsXHJcbiAgICAgICAgbWVzc2FnZU1ldGhvZHMgPSBoYXNQb3N0TWVzc2FnZSA/IHtcclxuICAgICAgICAgICAgbGlzdGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlKSBlID0gd2luZG93LmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdGVPcmlnaW4oc2VsZiwgZS5vcmlnaW4pKSB0aHJvdyBuZXcgRXJyb3IoXCJPcmlnaW4gXCIgKyBlLm9yaWdpbiArIFwiIGRvZXMgbm90IG1hdGNoIHJlcXVpcmVkIG9yaWdpbiBcIiArIHNlbGYuZnJhbWVPcmlnaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmRhdGEgPT09IFwicmVhZHlcIikgcmV0dXJuIHNlbGYucG9zdE1lc3NhZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZShlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlTGlzdGVuZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcG9zdE1lc3NhZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZyYW1lV2luZG93KCkucG9zdE1lc3NhZ2UodGhpcy5nZXRNZXNzYWdlKCksIHRoaXMuZnJhbWVPcmlnaW4pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXRhY2hMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5tZXNzYWdlTGlzdGVuZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gOiB7XHJcbiAgICAgICAgICAgIGxpc3RlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmhhc2ggPSBkb2N1bWVudC5sb2NhdGlvbi5oYXNoO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBzZWxmLmhhc2gucmVwbGFjZShoYXNoUkUsICcnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5oYXNoICE9PSBzZWxmLmxhc3RIYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSBcInJlYWR5XCIpIHJldHVybiBzZWxmLnBvc3RNZXNzYWdlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzaFJFLnRlc3Qoc2VsZi5oYXNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5sYXN0SGFzaCA9IHNlbGYuaGFzaDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcG9zdE1lc3NhZ2U6IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldEZyYW1lV2luZG93KCkubG9jYXRpb24gPSB0aGlzLmZyYW1lVXJsLnJlcGxhY2UoLyMuKiQvLCAnJykgKyAnIycgKyAoK25ldyBEYXRlKSArIChjYWNoZUJ1c3QrKykgKyAnJicgKyB0aGlzLmdldE1lc3NhZ2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGV0YWNoTGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgIHZhciBJZnJhbWVYTUxIdHRwUmVxdWVzdCA9IGZ1bmN0aW9uIChmcmFtZVVybCkge1xyXG4gICAgICAgIHZhciBmcmFtZU1hdGNoID0gZnJhbWVVcmwubWF0Y2gob3JpZ2luUkUpO1xyXG4gICAgICAgIGlmICghZnJhbWVNYXRjaCB8fCAhZnJhbWVNYXRjaFswXSkgdGhyb3cgbmV3IEVycm9yKGZyYW1lVXJsICsgXCIgZG9lcyBub3Qgc2VlbSB0byBoYXZlIGEgdmFsaWQgb3JpZ2luLlwiKTtcclxuICAgICAgICB0aGlzLmZyYW1lT3JpZ2luID0gZnJhbWVNYXRjaFswXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVVcmwgPSBmcmFtZVVybCArIFwiPyZwYXJlbnR1cmw9XCIgKyBlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24uaHJlZikgKyBcIiZwYXJlbnRkb21haW49XCIgKyBlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdCkgKyBcIiZtZXNzYWdlZGVsaW1pdGVyPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KG1lc3NhZ2VEZWxpbWl0ZXIpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVycyA9IHt9O1xyXG4gICAgfTtcclxuXHJcbiAgICB1dGlscy5leHRlbmQoSWZyYW1lWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLCBtZXNzYWdlTWV0aG9kcywge1xyXG4gICAgICAgIHJlYWR5U3RhdGU6IDAsXHJcbiAgICAgICAgc3RhdHVzOiAwLFxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uIChtZXRob2QsIHVybCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcclxuICAgICAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZW5kOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VCb2R5ID0gZGF0YTtcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVJZnJhbWUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZUlmcmFtZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLmhlaWdodCA9ICcxcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zcmMgPSB0aGlzLmZyYW1lVXJsO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuaWZyYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFJlcXVlc3RIZWFkZXI6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZGVyc1trZXldID0gdmFsdWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBtc2cgPSBbdGhpcy51cmwsIHRoaXMubWVzc2FnZUJvZHksIHRoaXMubWV0aG9kXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaGVhZGVyIGluIHRoaXMuaGVhZGVycykge1xyXG4gICAgICAgICAgICAgICAgbXNnLnB1c2goaGVhZGVyLCB0aGlzLmhlYWRlcnNbaGVhZGVyXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1zZy5qb2luKG1lc3NhZ2VEZWxpbWl0ZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25yZWFkeXN0YXRlY2hhbmdlOiBmdW5jdGlvbiAoKSB7IH0sXHJcbiAgICAgICAgZ2V0RnJhbWVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cgfHwgdGhpcy5pZnJhbWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbGVhbnVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgaWYgKCFzZWxmLmRlc3Ryb3llZCkgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRldGFjaExpc3RlbmVycygpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pZnJhbWUucGFyZW50Tm9kZSAmJiBzZWxmLmlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNlbGYuaWZyYW1lKTtcclxuICAgICAgICAgICAgfSwgMjUwKTtcclxuICAgICAgICAgICAgc2VsZi5kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnNwbGl0KG1lc3NhZ2VEZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBwYXJzZUludChkYXRhWzBdKSB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IHBhcnNlSW50KGRhdGFbMV0pIHx8IDA7XHJcbiAgICAgICAgICAgIHRoaXMucmVzcG9uc2VUZXh0ID0gZGF0YVsyXTtcclxuICAgICAgICAgICAgdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCkgdGhpcy5jbGVhbnVwKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhYm9ydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBJZnJhbWVYTUxIdHRwUmVxdWVzdDtcclxuXHJcbn0odGhpcywgdGhpcy5kb2N1bWVudCkpO1xyXG4vLyBFTkQgSUZSQU1FWEhSIiwiLy8gQkVHSU4gSU5JVFxyXG52YXIgQXBpQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dCcpO1xyXG52YXIgaW5pdGlhbEdsb2JhbENvbnRleHQgPSBuZXcgQXBpQ29udGV4dCgpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRpYWxHbG9iYWxDb250ZXh0O1xyXG4vLyBFTkQgSU5JVCIsIi8vIEVYUE9TRSBERUJVR0dJTkcgU1RVRkZcclxudmFyIF9pbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XHJcblxyXG5faW5pdC5VdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxuX2luaXQuQXBpQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dCcpO1xyXG5faW5pdC5BcGlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL2ludGVyZmFjZScpO1xyXG5faW5pdC5BcGlPYmplY3QgPSByZXF1aXJlKCcuL29iamVjdCcpO1xyXG5faW5pdC5BcGlDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9uJyk7XHJcbl9pbml0LkFwaVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vcmVmZXJlbmNlJyk7XHJcblxyXG5faW5pdC5fZXhwb3NlID0gZnVuY3Rpb24gKHIpIHtcclxuICAgIF9pbml0Lmxhc3RSZXN1bHQgPSByO1xyXG4gICAgY29uc29sZS5sb2cociAmJiByLmluc3BlY3QgPyByLmluc3BlY3QoKSA6IHIpO1xyXG59O1xyXG5cclxuX2luaXQuQXBpT2JqZWN0LnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSwgdHJ1ZSwgMik7XHJcbn07XHJcblxyXG5faW5pdC5BcGlDb250ZXh0Ll9fZGVidWdfXyA9IHRydWU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IF9pbml0OyIsIi8qKlxyXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vY3Vqb2pzL3doZW4vYmxvYi9tYXN0ZXIvZG9jcy9hcGkubWQjcHJvbWlzZSBXaGVuSlMvUHJvbWlzZX1cclxuICovXHJcblxyXG4vKipcclxuICogQXR0YWNoIGhhbmRsZXJzIHRvIGFuZCB0cmFuc2Zvcm0gdGhlIHByb21pc2UuXHJcbiAqIEBmdW5jdGlvbiBleHRlcm5hbDpQcm9taXNlI3RoZW5cclxuICogQHJldHVybnMgZXh0ZXJuYWw6UHJvbWlzZSNcclxuICovXHJcblxyXG4vLyBCRUdJTiBJTlRFUkZBQ0VcclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAY2xhc3NkZXNjIFRoZSBpbnRlcmZhY2Ugb2JqZWN0IG1ha2VzIHJlcXVlc3RzIHRvIHRoZSBBUEkgYW5kIHJldHVybnMgQVBJIG9iamVjdC4gWW91IGNhbiB1c2UgaXQgdG8gbWFrZSByYXcgcmVxdWVzdHMgdXNpbmcgdGhlIEFwaUludGVyZmFjZSNyZXF1ZXN0IG1ldGhvZCwgYnV0IHlvdSdyZSBtb3JlIGxpa2VseSB0byB1c2UgdGhlIEFwaUludGVyZmFjZSNhY3Rpb24gbWV0aG9kIHRvIGNyZWF0ZSBhIGV4dGVybmFsOlByb21pc2UjIHRoYXQgcmV0dXJucyBhbiBBcGlPYmplY3QjLlxyXG4gKi9cclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgQXBpUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9yZWZlcmVuY2UnKTtcclxudmFyIEFwaU9iamVjdCA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XHJcblxyXG52YXIgZXJyb3JNZXNzYWdlID0gXCJObyB7MH0gd2FzIHNwZWNpZmllZC4gUnVuIE1venUuVGVuYW50KHRlbmFudElkKS5NYXN0ZXJDYXRhbG9nKG1hc3RlckNhdGFsb2dJZCkuU2l0ZShzaXRlSWQpLlwiLFxyXG4gICAgcmVxdWlyZWRDb250ZXh0VmFsdWVzID0gWydUZW5hbnQnLCAnTWFzdGVyQ2F0YWxvZycsICdTaXRlJ107XHJcbnZhciBBcGlJbnRlcmZhY2VDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXF1aXJlZENvbnRleHRWYWx1ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBpZiAoY29udGV4dFtyZXF1aXJlZENvbnRleHRWYWx1ZXNbaV1dKCkgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGVycm9yTWVzc2FnZS5zcGxpdCgnezB9Jykuam9pbihyZXF1aXJlZENvbnRleHRWYWx1ZXNbaV0pKTtcclxuICAgIH1cclxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbn07XHJcblxyXG5BcGlJbnRlcmZhY2VDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XHJcbiAgICBjb25zdHJ1Y3RvcjogQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IsXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBBcGlJbnRlcmZhY2UjXHJcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZSN9XHJcbiAgICAgKi9cclxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKG1ldGhvZCwgcmVxdWVzdENvbmYsIGNvbmYpIHtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgICAgICB1cmwgPSB0eXBlb2YgcmVxdWVzdENvbmYgPT09IFwic3RyaW5nXCIgPyByZXF1ZXN0Q29uZiA6IHJlcXVlc3RDb25mLnVybDtcclxuICAgICAgICBpZiAocmVxdWVzdENvbmYudmVyYilcclxuICAgICAgICAgICAgbWV0aG9kID0gcmVxdWVzdENvbmYudmVyYjtcclxuXHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gbWUuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGE7XHJcbiAgICAgICAgaWYgKHJlcXVlc3RDb25mLm92ZXJyaWRlUG9zdERhdGEpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHJlcXVlc3RDb25mLm92ZXJyaWRlUG9zdERhdGE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb25mICYmICFyZXF1ZXN0Q29uZi5ub0JvZHkpIHtcclxuICAgICAgICAgICAgZGF0YSA9IGNvbmYuZGF0YSB8fCBjb25mO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNvbnRleHRIZWFkZXJzID0gdGhpcy5jb250ZXh0LmFzT2JqZWN0KFwieC12b2wtXCIpO1xyXG5cclxuICAgICAgICB2YXIgeGhyID0gdXRpbHMucmVxdWVzdChtZXRob2QsIHVybCwgY29udGV4dEhlYWRlcnMsIGRhdGEsIGZ1bmN0aW9uKHJhd0pTT04pIHtcclxuICAgICAgICAgICAgLy8gdXBkYXRlIGNvbnRleHQgd2l0aCByZXNwb25zZSBoZWFkZXJzXHJcbiAgICAgICAgICAgIG1lLmZpcmUoJ3N1Y2Nlc3MnLCByYXdKU09OLCB4aHIsIHJlcXVlc3RDb25mKTtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyYXdKU09OLCB4aHIpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvciwgeGhyLCB1cmwpO1xyXG4gICAgICAgIH0sIHJlcXVlc3RDb25mLmlmcmFtZVRyYW5zcG9ydFVybCk7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxsZWQgPSBmYWxzZSxcclxuICAgICAgICAgICAgY2FuY2VsbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgeGhyLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoXCJSZXF1ZXN0IGNhbmNlbGxlZC5cIilcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5maXJlKCdyZXF1ZXN0JywgeGhyLCBjYW5jZWxsZXIsIGRlZmVycmVkLnByb21pc2UsIHJlcXVlc3RDb25mLCBjb25mKTtcclxuXHJcbiAgICAgICAgZGVmZXJyZWQucHJvbWlzZS5vdGhlcndpc2UoZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgdmFyIHJlcztcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lLmZpcmUoJ2Vycm9yJywgZXJyb3IsIHhociwgcmVxdWVzdENvbmYpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEFwaUludGVyZmFjZSNcclxuICAgICAqIEByZXR1cm5zIGV4dGVybmFsOlByb21pc2UjXHJcbiAgICAgKi9cclxuICAgIGFjdGlvbjogZnVuY3Rpb24oaW5zdGFuY2VPclR5cGUsIGFjdGlvbk5hbWUsIGRhdGEpIHtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgICAgICBvYmogPSBpbnN0YW5jZU9yVHlwZSBpbnN0YW5jZW9mIEFwaU9iamVjdCA/IGluc3RhbmNlT3JUeXBlIDogbWUuY3JlYXRlU3luYyhpbnN0YW5jZU9yVHlwZSksXHJcbiAgICAgICAgICAgIHR5cGUgPSBvYmoudHlwZTtcclxuXHJcbiAgICAgICAgb2JqLmZpcmUoJ2FjdGlvbicsIGFjdGlvbk5hbWUsIGRhdGEpO1xyXG4gICAgICAgIG1lLmZpcmUoJ2FjdGlvbicsIG9iaiwgYWN0aW9uTmFtZSwgZGF0YSk7XHJcbiAgICAgICAgdmFyIHJlcXVlc3RDb25mID0gQXBpUmVmZXJlbmNlLmdldFJlcXVlc3RDb25maWcoYWN0aW9uTmFtZSwgdHlwZSwgZGF0YSB8fCBvYmouZGF0YSwgbWUuY29udGV4dCwgb2JqKTtcclxuXHJcbiAgICAgICAgaWYgKChhY3Rpb25OYW1lID09IFwidXBkYXRlXCIgfHwgYWN0aW9uTmFtZSA9PSBcImNyZWF0ZVwiKSAmJiAhZGF0YSkge1xyXG4gICAgICAgICAgICBkYXRhID0gb2JqLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbWUucmVxdWVzdChBcGlSZWZlcmVuY2UuYmFzaWNPcHNbYWN0aW9uTmFtZV0sIHJlcXVlc3RDb25mLCBkYXRhKS50aGVuKGZ1bmN0aW9uKHJhd0pTT04pIHtcclxuICAgICAgICAgICAgaWYgKHJlcXVlc3RDb25mLnJldHVyblR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXR1cm5PYmogPSBBcGlPYmplY3QuY3JlYXRlKHJlcXVlc3RDb25mLnJldHVyblR5cGUsIHJhd0pTT04sIG1lKTtcclxuICAgICAgICAgICAgICAgIG9iai5maXJlKCdzcGF3bicsIHJldHVybk9iaik7XHJcbiAgICAgICAgICAgICAgICBtZS5maXJlKCdzcGF3bicsIHJldHVybk9iaiwgb2JqKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5PYmo7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmF3SlNPTiB8fCByYXdKU09OID09PSAwIHx8IHJhd0pTT04gPT09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIG9iai5kYXRhID0gdXRpbHMuY2xvbmUocmF3SlNPTik7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnVuc3luY2VkO1xyXG4gICAgICAgICAgICAgICAgb2JqLmZpcmUoJ3N5bmMnLCByYXdKU09OLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBtZS5maXJlKCdzeW5jJywgb2JqLCByYXdKU09OLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3JKU09OKSB7XHJcbiAgICAgICAgICAgIG9iai5maXJlKCdlcnJvcicsIGVycm9ySlNPTik7XHJcbiAgICAgICAgICAgIG1lLmZpcmUoJ2Vycm9yJywgZXJyb3JKU09OLCBvYmopO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvckpTT047XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdXRpbHMud2hlbi5qb2luLmFwcGx5KHV0aWxzLndoZW4sIGFyZ3VtZW50cyk7XHJcbiAgICB9LFxyXG4gICAgc3RlcHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhcmdzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50c1swXSkgPT09IFwiW29iamVjdCBBcnJheV1cIiA/IGFyZ3VtZW50c1swXSA6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLnBpcGVsaW5lKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpKTtcclxuICAgIH0sXHJcbiAgICBkZWZlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLndoZW4uZGVmZXIoKTtcclxuICAgIH0sXHJcbiAgICBnZXRBdmFpbGFibGVBY3Rpb25zRm9yOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIEFwaVJlZmVyZW5jZS5nZXRBY3Rpb25zRm9yKHR5cGUpO1xyXG4gICAgfVxyXG59O1xyXG52YXIgc2V0T3AgPSBmdW5jdGlvbihmbk5hbWUpIHtcclxuICAgIEFwaUludGVyZmFjZUNvbnN0cnVjdG9yLnByb3RvdHlwZVtmbk5hbWVdID0gZnVuY3Rpb24odHlwZSwgY29uZiwgaXNSZW1vdGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb24odHlwZSwgZm5OYW1lLCBjb25mLCBpc1JlbW90ZSk7XHJcbiAgICB9O1xyXG59O1xyXG5mb3IgKHZhciBpIGluIEFwaVJlZmVyZW5jZS5iYXNpY09wcykge1xyXG4gICAgaWYgKEFwaVJlZmVyZW5jZS5iYXNpY09wcy5oYXNPd25Qcm9wZXJ0eShpKSkgc2V0T3AoaSk7XHJcbn1cclxuXHJcbi8vIGFkZCBjcmVhdGVTeW5jIG1ldGhvZCBmb3IgYSBkaWZmZXJlbnQgc3R5bGUgb2YgZGV2ZWxvcG1lbnRcclxuQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IucHJvdG90eXBlLmNyZWF0ZVN5bmMgPSBmdW5jdGlvbih0eXBlLCBjb25mKSB7XHJcbiAgICB2YXIgbmV3QXBpT2JqZWN0ID0gQXBpT2JqZWN0LmNyZWF0ZSh0eXBlLCBjb25mLCB0aGlzKTtcclxuICAgIG5ld0FwaU9iamVjdC51bnN5bmNlZCA9IHRydWU7XHJcbiAgICB0aGlzLmZpcmUoJ3NwYXduJywgbmV3QXBpT2JqZWN0KTtcclxuICAgIHJldHVybiBuZXdBcGlPYmplY3Q7XHJcbn07XHJcblxyXG51dGlscy5hZGRFdmVudHMoQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcGlJbnRlcmZhY2VDb25zdHJ1Y3RvcjtcclxuXHJcbi8vIEVORCBJTlRFUkZBQ0VcclxuXHJcbi8qKioqKioqKiovIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInByb2R1Y3RzXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytwcm9kdWN0U2VydmljZX17P18qfVwiLFxuICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImZpbHRlclwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicGFnZVNpemVcIjogMTVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwicHJvZHVjdFwiXG4gIH0sXG4gIFwiY2F0ZWdvcmllc1wiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2F0ZWdvcnlTZXJ2aWNlfXs/Xyp9XCIsXG4gICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiZmlsdGVyXCIsXG4gICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgIFwic3RhcnRJbmRleFwiOiAwLFxuICAgICAgXCJwYWdlU2l6ZVwiOiAxNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJjYXRlZ29yeVwiXG4gIH0sXG4gIFwiY2F0ZWdvcnlcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhdGVnb3J5U2VydmljZX17aWR9KD9hbGxvd0luYWN0aXZlfVwiLFxuICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcIklkXCIsXG4gICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgIFwiYWxsb3dJbmFjdGl2ZVwiOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgXCJzZWFyY2hcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K3NlYXJjaFNlcnZpY2V9c2VhcmNoez9xdWVyeSxmaWx0ZXIsZmFjZXRUZW1wbGF0ZSxmYWNldFRlbXBsYXRlU3Vic2V0LGZhY2V0LGZhY2V0RmllbGRSYW5nZVF1ZXJ5LGZhY2V0SGllclByZWZpeCxmYWNldEhpZXJWYWx1ZSxmYWNldEhpZXJEZXB0aCxmYWNldFN0YXJ0SW5kZXgsZmFjZXRQYWdlU2l6ZSxmYWNldFNldHRpbmdzLGZhY2V0VmFsdWVGaWx0ZXIsc29ydEJ5LHBhZ2VTaXplLFBhZ2VTaXplLHN0YXJ0SW5kZXgsU3RhcnRJbmRleH1cIixcbiAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJxdWVyeVwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicXVlcnlcIjogXCIqOipcIixcbiAgICAgIFwicGFnZVNpemVcIjogMTVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwicHJvZHVjdFwiXG4gIH0sXG4gIFwiY3VzdG9tZXJzXCI6IHtcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcImN1c3RvbWVyXCJcbiAgfSxcbiAgXCJvcmRlcnNcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17P18qfVwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicGFnZVNpemVcIjogNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJvcmRlclwiXG4gIH0sXG4gIFwicHJvZHVjdFwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcHJvZHVjdFNlcnZpY2V9e3Byb2R1Y3RDb2RlfT97JmFsbG93SW5hY3RpdmUqfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwicHJvZHVjdENvZGVcIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwiYWxsb3dJbmFjdGl2ZVwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJjb25maWd1cmVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcHJvZHVjdFNlcnZpY2V9e3Byb2R1Y3RDb2RlfS9jb25maWd1cmV7P2luY2x1ZGVPcHRpb25EZXRhaWxzfVwiLFxuICAgICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgICAgXCJpbmNsdWRlT3B0aW9uRGV0YWlsc1wiOiB0cnVlXG4gICAgICB9LFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImFkZC10by1jYXJ0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJwcm9kdWN0XCJcbiAgICAgIH0sXG4gICAgICBcIm92ZXJyaWRlUG9zdERhdGFcIjogW1xuICAgICAgICBcInByb2R1Y3RcIixcbiAgICAgICAgXCJxdWFudGl0eVwiLFxuICAgICAgICBcImZ1bGZpbGxtZW50TG9jYXRpb25Db2RlXCIsXG4gICAgICAgIFwiZnVsZmlsbG1lbnRNZXRob2RcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcInF1YW50aXR5XCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjYXJ0aXRlbVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtcy9cIlxuICAgIH0sXG4gICAgXCJnZXQtaW52ZW50b3J5XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3Byb2R1Y3RTZXJ2aWNlfXtwcm9kdWN0Q29kZX0vbG9jYXRpb25pbnZlbnRvcnl7P2xvY2F0aW9uQ29kZXN9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJsb2NhdGlvbmNvZGVzXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH1cbiAgfSxcbiAgXCJsb2NhdGlvblwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrbG9jYXRpb25TZXJ2aWNlfWxvY2F0aW9uVXNhZ2VUeXBlcy9TUC9sb2NhdGlvbnMve2NvZGV9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJjb2RlXCJcbiAgICB9XG4gIH0sXG4gIFwibG9jYXRpb25zXCI6IHtcbiAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgXCJwYWdlU2l6ZVwiOiAxNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJsb2NhdGlvblwiLFxuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2xvY2F0aW9uU2VydmljZX1sb2NhdGlvblVzYWdlVHlwZXMvU1AvbG9jYXRpb25zL3s/c3RhcnRJbmRleCxzb3J0QnkscGFnZVNpemUsZmlsdGVyfVwiXG4gICAgfSxcbiAgICBcImdldC1ieS1sYXQtbG9uZ1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytsb2NhdGlvblNlcnZpY2V9bG9jYXRpb25Vc2FnZVR5cGVzL1NQL2xvY2F0aW9ucy8/ZmlsdGVyPWdlbyBuZWFyKHtsYXRpdHVkZX0se2xvbmdpdHVkZX0peyZzdGFydEluZGV4LHNvcnRCeSxwYWdlU2l6ZX1cIlxuICAgIH1cbiAgfSxcbiAgXCJjYXJ0c3VtbWFyeVwiOiBcInsrY2FydFNlcnZpY2V9c3VtbWFyeVwiLFxuICBcImNhcnRcIjoge1xuICAgIFwiZ2V0XCI6IFwieytjYXJ0U2VydmljZX1jdXJyZW50XCIsXG4gICAgXCJhZGQtcHJvZHVjdFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjYXJ0aXRlbVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtcy9cIlxuICAgIH0sXG4gICAgXCJlbXB0eVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhcnRTZXJ2aWNlfWN1cnJlbnQvaXRlbXMvXCJcbiAgICB9LFxuICAgIFwiY2hlY2tvdXRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfT9jYXJ0SWQ9e2lkfVwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwib3JkZXJcIixcbiAgICAgIFwibm9Cb2R5XCI6IHRydWUsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9XG4gIH0sXG4gIFwiY2FydGl0ZW1cIjoge1xuICAgIFwiZGVmYXVsdHNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtcy97aWR9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJpZFwiXG4gICAgfSxcbiAgICBcInVwZGF0ZS1xdWFudGl0eVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhcnRTZXJ2aWNlfWN1cnJlbnQvaXRlbXN7L2lkLHF1YW50aXR5fVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwicXVhbnRpdHlcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwibm9Cb2R5XCI6IHRydWVcbiAgICB9XG4gIH0sXG4gIFwiY3VzdG9tZXJcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9XCIsXG4gICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiaWRcIixcbiAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgXCJjcmVhdGVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfWFkZC1hY2NvdW50LWFuZC1sb2dpblwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwibG9naW5cIlxuICAgIH0sXG4gICAgXCJjcmVhdGUtc3RvcmVmcm9udFwiOiB7XG4gICAgICBcInVzZUlmcmFtZVRyYW5zcG9ydFwiOiBcInsrc3RvcmVmcm9udFVzZXJTZXJ2aWNlfS4uLy4uL3JlY2VpdmVyXCIsXG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytzdG9yZWZyb250VXNlclNlcnZpY2V9Y3JlYXRlXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJsb2dpblwiXG4gICAgfSxcbiAgICBcImxvZ2luXCI6IHtcbiAgICAgIFwidXNlSWZyYW1lVHJhbnNwb3J0XCI6IFwieytjdXN0b21lclNlcnZpY2V9Li4vLi4vcmVjZWl2ZXJcIixcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX0uLi9hdXRodGlja2V0c1wiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwibG9naW5cIlxuICAgIH0sXG4gICAgXCJsb2dpbi1zdG9yZWZyb250XCI6IHtcbiAgICAgIFwidXNlSWZyYW1lVHJhbnNwb3J0XCI6IFwieytzdG9yZWZyb250VXNlclNlcnZpY2V9Li4vLi4vcmVjZWl2ZXJcIixcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3N0b3JlZnJvbnRVc2VyU2VydmljZX1sb2dpblwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwibG9naW5cIlxuICAgIH0sXG4gICAgXCJ1cGRhdGVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcInJlc2V0LXBhc3N3b3JkXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX1yZXNldC1wYXNzd29yZFwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIFwicmVzZXQtcGFzc3dvcmQtc3RvcmVmcm9udFwiOiB7XG4gICAgICBcInVzZUlmcmFtZVRyYW5zcG9ydFwiOiBcInsrc3RvcmVmcm9udFVzZXJTZXJ2aWNlfS4uLy4uL3JlY2VpdmVyXCIsXG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytzdG9yZWZyb250VXNlclNlcnZpY2V9cmVzZXRwYXNzd29yZFwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIFwiY2hhbmdlLXBhc3N3b3JkXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9L2NoYW5nZS1wYXNzd29yZFwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImdldC1vcmRlcnNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfT9maWx0ZXI9T3JkZXJOdW1iZXIgbmUgbnVsbFwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwib3JkZXJzXCJcbiAgICB9LFxuICAgIFwiZ2V0LWNhcmRzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9L2NhcmRzXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJhY2NvdW50Y2FyZHNcIlxuICAgIH0sXG4gICAgXCJhZGQtY2FyZFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2N1c3RvbWVyLmlkfS9jYXJkc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB7XG4gICAgICAgIFwiYXNQcm9wZXJ0eVwiOiBcImN1c3RvbWVyXCJcbiAgICAgIH0sXG4gICAgICBcInJldHVyblR5cGVcIjogXCJhY2NvdW50Y2FyZFwiXG4gICAgfSxcbiAgICBcInVwZGF0ZS1jYXJkXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtjdXN0b21lci5pZH0vY2FyZHMve2lkfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB7XG4gICAgICAgIFwiYXNQcm9wZXJ0eVwiOiBcImN1c3RvbWVyXCJcbiAgICAgIH0sXG4gICAgICBcInJldHVyblR5cGVcIjogXCJhY2NvdW50Y2FyZFwiXG4gICAgfSxcbiAgICBcImRlbGV0ZS1jYXJkXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtjdXN0b21lci5pZH0vY2FyZHMve2lkfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiaWRcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJjdXN0b21lclwiXG4gICAgICB9LFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiYWNjb3VudGNhcmRcIlxuICAgIH0sXG4gICAgXCJhZGQtY29udGFjdFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfS9jb250YWN0c1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY29udGFjdFwiXG4gICAgfSxcbiAgICBcImdldC1jb250YWN0c1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfS9jb250YWN0c1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY29udGFjdHNcIlxuICAgIH0sXG4gICAgXCJkZWxldGUtY29udGFjdFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17Y3VzdG9tZXIuaWR9L2NvbnRhY3RzL3tpZH1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImlkXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHtcbiAgICAgICAgXCJhc1Byb3BlcnR5XCI6IFwiY3VzdG9tZXJcIlxuICAgICAgfSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImNvbnRhY3RcIlxuICAgIH0sXG4gICAgXCJnZXQtY3JlZGl0c1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjcmVkaXRTZXJ2aWNlfVwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RvcmVjcmVkaXRzXCJcbiAgICB9XG4gIH0sXG4gIFwic3RvcmVjcmVkaXRcIjoge1xuICAgIFwiYXNzb2NpYXRlLXRvLXNob3BwZXJcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjcmVkaXRTZXJ2aWNlfXtjb2RlfS9hc3NvY2lhdGUtdG8tc2hvcHBlclwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfVxuICB9LFxuICBcInN0b3JlY3JlZGl0c1wiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3JlZGl0U2VydmljZX1cIixcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcInN0b3JlY3JlZGl0XCJcbiAgfSxcbiAgXCJjb250YWN0XCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2FjY291bnRJZH0vY29udGFjdHMve2lkfVwiLFxuICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICB9LFxuICBcImNvbnRhY3RzXCI6IHtcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcImNvbnRhY3RcIlxuICB9LFxuICBcImxvZ2luXCI6IFwieyt1c2VyU2VydmljZX1sb2dpblwiLFxuICBcImFkZHJlc3NcIjoge1xuICAgIFwidmFsaWRhdGUtYWRkcmVzc1wiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieythZGRyZXNzVmFsaWRhdGlvblNlcnZpY2V9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHtcbiAgICAgICAgXCJhc1Byb3BlcnR5XCI6IFwiYWRkcmVzc1wiXG4gICAgICB9LFxuICAgICAgXCJvdmVycmlkZVBvc3REYXRhXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJhZGRyZXNzXCJcbiAgICB9XG4gIH0sXG4gIFwib3JkZXJcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9XCIsXG4gICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17P2NhcnRJZCp9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJjYXJ0SWRcIixcbiAgICAgIFwibm9Cb2R5XCI6IHRydWVcbiAgICB9LFxuICAgIFwidXBkYXRlLXNoaXBwaW5nLWluZm9cIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vZnVsZmlsbG1lbnRpbmZvXCIsXG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInNoaXBtZW50XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwic2V0LXVzZXItaWRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS91c2Vyc1wiLFxuICAgICAgXCJub0JvZHlcIjogdHJ1ZSxcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInVzZXJcIlxuICAgIH0sXG4gICAgXCJjcmVhdGUtcGF5bWVudFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9wYXltZW50cy9hY3Rpb25zXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwicGVyZm9ybS1wYXltZW50LWFjdGlvblwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9wYXltZW50cy97cGF5bWVudElkfS9hY3Rpb25zXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJwYXltZW50SWRcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInN0cmluZ1wiXG4gICAgfSxcbiAgICBcImFwcGx5LWNvdXBvblwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L2NvdXBvbnMve2NvdXBvbkNvZGV9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJjb3Vwb25Db2RlXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcIm5vQm9keVwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY291cG9uXCJcbiAgICB9LFxuICAgIFwicmVtb3ZlLWNvdXBvblwiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L2NvdXBvbnMve2NvdXBvbkNvZGV9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJjb3Vwb25Db2RlXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwicmVtb3ZlLWFsbC1jb3Vwb25zXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vY291cG9uc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImdldC1hdmFpbGFibGUtYWN0aW9uc1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9hY3Rpb25zXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJvcmRlcmFjdGlvbnNcIlxuICAgIH0sXG4gICAgXCJwZXJmb3JtLW9yZGVyLWFjdGlvblwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9hY3Rpb25zXCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJhY3Rpb25OYW1lXCIsXG4gICAgICBcIm92ZXJyaWRlUG9zdERhdGFcIjogW1xuICAgICAgICBcImFjdGlvbk5hbWVcIlxuICAgICAgXSxcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJhZGQtb3JkZXItbm90ZVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9ub3Rlc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwib3JkZXJub3RlXCJcbiAgICB9XG4gIH0sXG4gIFwicm1hXCI6IHtcbiAgICBcImNyZWF0ZVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytyZXR1cm5TZXJ2aWNlfVwiXG4gICAgfVxuICB9LFxuICBcInJtYXNcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K3JldHVyblNlcnZpY2V9ez9fKn1cIixcbiAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgXCJzdGFydEluZGV4XCI6IDAsXG4gICAgICBcInBhZ2VTaXplXCI6IDVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwicm1hXCJcbiAgfSxcbiAgXCJzaGlwbWVudFwiOiB7XG4gICAgXCJkZWZhdWx0c1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e29yZGVySWR9L2Z1bGZpbGxtZW50aW5mb1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImdldC1zaGlwcGluZy1tZXRob2RzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17b3JkZXJJZH0vc2hpcG1lbnRzL21ldGhvZHNcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInNoaXBwaW5nbWV0aG9kc1wiXG4gICAgfVxuICB9LFxuICBcInBheW1lbnRcIjoge1xuICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17b3JkZXJJZH0vcGF5bWVudHMvYWN0aW9uc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfVxuICB9LFxuICBcImFjY291bnRjYXJkXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfS9jYXJkc1wiXG4gIH0sXG4gIFwiYWNjb3VudGNhcmRzXCI6IHtcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcImFjY291bnRjYXJkXCJcbiAgfSxcbiAgXCJjcmVkaXRjYXJkXCI6IHtcbiAgICBcImRlZmF1bHRzXCI6IHtcbiAgICAgIFwidXNlSWZyYW1lVHJhbnNwb3J0XCI6IFwieytwYXltZW50U2VydmljZX0uLi8uLi9Bc3NldHMvbW96dV9yZWNlaXZlci5odG1sXCJcbiAgICB9LFxuICAgIFwic2F2ZVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytwYXltZW50U2VydmljZX1cIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInN0cmluZ1wiXG4gICAgfSxcbiAgICBcInVwZGF0ZVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3BheW1lbnRTZXJ2aWNlfXtjYXJkSWR9XCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgXCJkZWxcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJjYXJkSWRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3BheW1lbnRTZXJ2aWNlfXtjYXJkSWR9XCJcbiAgICB9XG4gIH0sXG4gIFwiY3JlZGl0Y2FyZHNcIjoge1xuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwiY3JlZGl0Y2FyZFwiXG4gIH0sXG4gIFwib3JkZXJub3RlXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e29yZGVySWR9L25vdGVzL3tpZH1cIlxuICB9LFxuICBcImRvY3VtZW50XCI6IHtcbiAgICBcImdldFwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjbXNTZXJ2aWNlfXsvZG9jdW1lbnRMaXN0TmFtZSxkb2N1bWVudElkfS97P3ZlcnNpb24sc3RhdHVzfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiZG9jdW1lbnRJZFwiLFxuICAgICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgICAgXCJkb2N1bWVudExpc3ROYW1lXCI6IFwiZGVmYXVsdFwiXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcImRvY3VtZW50YnluYW1lXCI6IHtcbiAgICBcImdldFwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjbXNTZXJ2aWNlfXtkb2N1bWVudExpc3ROYW1lfS9kb2N1bWVudFRyZWUve2RvY3VtZW50TmFtZX0vez9mb2xkZXJQYXRoLHZlcnNpb24sc3RhdHVzfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiZG9jdW1lbnROYW1lXCIsXG4gICAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgICBcImRvY3VtZW50TGlzdE5hbWVcIjogXCJkZWZhdWx0XCJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiYWRkcmVzc3NjaGVtYXNcIjogXCJ7K3JlZmVyZW5jZVNlcnZpY2V9YWRkcmVzc3NjaGVtYXNcIixcbiAgXCJ3aXNobGlzdFwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfXtpZH1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJnZXQtYnktbmFtZVwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9Y3VzdG9tZXJzL3tjdXN0b21lckFjY291bnRJZH0ve25hbWV9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiZ2V0LWRlZmF1bHRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfWN1c3RvbWVycy97Y3VzdG9tZXJBY2NvdW50SWR9L215X3dpc2hsaXN0XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiY3JlYXRlLWRlZmF1bHRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfVwiLFxuICAgICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwibXlfd2lzaGxpc3RcIixcbiAgICAgICAgXCJ0eXBlVGFnXCI6IFwiZGVmYXVsdFwiXG4gICAgICB9LFxuICAgICAgXCJvdmVycmlkZVBvc3REYXRhXCI6IHRydWVcbiAgICB9LFxuICAgIFwiYWRkLWl0ZW1cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfXtpZH0vaXRlbXMvXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiZGVsZXRlLWFsbC1pdGVtc1wiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX17aWR9L2l0ZW1zL1wiXG4gICAgfSxcbiAgICBcImRlbGV0ZS1pdGVtXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfXtpZH0vaXRlbXMve2l0ZW1JZH1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcIml0ZW1JZFwiXG4gICAgfSxcbiAgICBcImVkaXQtaXRlbVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX17aWR9L2l0ZW1zL3tpdGVtSWR9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiYWRkLWl0ZW0tdG8tY2FydFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjYXJ0aXRlbVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtcy9cIlxuICAgIH0sXG4gICAgXCJnZXQtaXRlbXMtYnktbmFtZVwiOiB7XG4gICAgICBcInJldHVyblR5cGVcIjogXCJ3aXNobGlzdGl0ZW1zXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9Y3VzdG9tZXJzL3tjdXN0b21lckFjY291bnRJZH0ve25hbWV9L2l0ZW1zez9zdGFydEluZGV4LHBhZ2VTaXplLHNvcnRCeSxmaWx0ZXJ9XCIsXG4gICAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgICBcInNvcnRCeVwiOiBcIlVwZGF0ZURhdGUgYXNjXCJcbiAgICAgIH0sXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9XG4gIH0sXG4gIFwid2lzaGxpc3RzXCI6IHtcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcIndpc2hsaXN0XCJcbiAgfVxufSIsIi8vIEJFR0lOIE9CSkVDVFxyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgQXBpUmVmZXJlbmNlO1xyXG52YXIgQXBpQ29sbGVjdGlvbjsgLy8gbGF6eSBsb2FkaW5nIHRvIHByZXZlbnQgY2lyY3VsYXIgZGVwXHJcblxyXG52YXIgQXBpT2JqZWN0Q29uc3RydWN0b3IgPSBmdW5jdGlvbih0eXBlLCBkYXRhLCBpYXBpKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhIHx8IHt9O1xyXG4gICAgdGhpcy5hcGkgPSBpYXBpO1xyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxufTtcclxuXHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IHtcclxuICAgIGNvbnN0cnVjdG9yOiBBcGlPYmplY3RDb25zdHJ1Y3RvcixcclxuICAgIGdldEF2YWlsYWJsZUFjdGlvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIEFwaVJlZmVyZW5jZSA9IEFwaVJlZmVyZW5jZSB8fCByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG4gICAgICAgIHJldHVybiBBcGlSZWZlcmVuY2UuZ2V0QWN0aW9uc0Zvcih0aGlzLnR5cGUpO1xyXG4gICAgfSxcclxuICAgIHByb3A6IGZ1bmN0aW9uKGssIHYpIHtcclxuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBrID09PSBcInN0cmluZ1wiKSByZXR1cm4gdGhpcy5kYXRhW2tdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBrID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaGFzaGtleSBpbiBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrLmhhc093blByb3BlcnR5KGhhc2hrZXkpKSB0aGlzLnByb3AoaGFzaGtleSwga1toYXNoa2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtrXSA9IHY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59O1xyXG5cclxudXRpbHMuYWRkRXZlbnRzKEFwaU9iamVjdENvbnN0cnVjdG9yKTtcclxuXHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLnR5cGVzID0ge1xyXG4gICAgY2FydDogcmVxdWlyZSgnLi90eXBlcy9jYXJ0JyksXHJcbiAgICBjYXJ0c3VtbWFyeTogcmVxdWlyZSgnLi90eXBlcy9jYXJ0c3VtbWFyeScpLFxyXG4gICAgY3JlZGl0Y2FyZDogcmVxdWlyZSgnLi90eXBlcy9jcmVkaXRjYXJkJyksXHJcbiAgICBjdXN0b21lcjogcmVxdWlyZSgnLi90eXBlcy9jdXN0b21lcicpLFxyXG4gICAgbG9naW46IHJlcXVpcmUoJy4vdHlwZXMvbG9naW4nKSxcclxuICAgIG9yZGVyOiByZXF1aXJlKCcuL3R5cGVzL29yZGVyJyksXHJcbiAgICBwcm9kdWN0OiByZXF1aXJlKCcuL3R5cGVzL3Byb2R1Y3QnKSxcclxuICAgIHNoaXBtZW50OiByZXF1aXJlKCcuL3R5cGVzL3NoaXBtZW50JyksXHJcbiAgICB1c2VyOiByZXF1aXJlKCcuL3R5cGVzL3VzZXInKSxcclxuICAgIHdpc2hsaXN0OiByZXF1aXJlKCcuL3R5cGVzL3dpc2hsaXN0JylcclxufTtcclxuQXBpT2JqZWN0Q29uc3RydWN0b3IuaHlkcmF0ZWRUeXBlcyA9IHt9O1xyXG5cclxuQXBpT2JqZWN0Q29uc3RydWN0b3IuZ2V0SHlkcmF0ZWRUeXBlID0gZnVuY3Rpb24odHlwZU5hbWUpIHtcclxuICAgIEFwaVJlZmVyZW5jZSA9IEFwaVJlZmVyZW5jZSB8fCByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG4gICAgaWYgKCEodHlwZU5hbWUgaW4gdGhpcy5oeWRyYXRlZFR5cGVzKSkge1xyXG4gICAgICAgIHZhciBhdmFpbGFibGVBY3Rpb25zID0gQXBpUmVmZXJlbmNlLmdldEFjdGlvbnNGb3IodHlwZU5hbWUpLFxyXG4gICAgICAgICAgICByZWZsZWN0ZWRNZXRob2RzID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGF2YWlsYWJsZUFjdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdXRpbHMuc2V0T3AocmVmbGVjdGVkTWV0aG9kcywgYXZhaWxhYmxlQWN0aW9uc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaHlkcmF0ZWRUeXBlc1t0eXBlTmFtZV0gPSB1dGlscy5pbmhlcml0KHRoaXMsIHV0aWxzLmV4dGVuZCh7fSwgcmVmbGVjdGVkTWV0aG9kcywgdGhpcy50eXBlc1t0eXBlTmFtZV0gfHwge30pKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmh5ZHJhdGVkVHlwZXNbdHlwZU5hbWVdO1xyXG59O1xyXG5cclxuQXBpT2JqZWN0Q29uc3RydWN0b3IuY3JlYXRlID0gZnVuY3Rpb24odHlwZU5hbWUsIHJhd0pTT04sIGFwaSkge1xyXG4gICAgQXBpUmVmZXJlbmNlID0gQXBpUmVmZXJlbmNlIHx8IHJlcXVpcmUoJy4vcmVmZXJlbmNlJyk7XHJcbiAgICB2YXIgdHlwZSA9IEFwaVJlZmVyZW5jZS5nZXRUeXBlKHR5cGVOYW1lKTtcclxuICAgIGlmICghdHlwZSkge1xyXG4gICAgICAgIC8vIGZvciBmb3J3YXJkIGNvbXBhdGliaWxpdHkgdGhlIEFQSSBzaG91bGQgcmV0dXJuIGEgcmVzcG9uc2UsXHJcbiAgICAgICAgLy8gZXZlbiBvbmUgdGhhdCBpdCBkb2Vzbid0IHVuZGVyc3RhbmRcclxuICAgICAgICByZXR1cm4gcmF3SlNPTjtcclxuICAgIH1cclxuICAgIGlmICh0eXBlLmNvbGxlY3Rpb25PZikge1xyXG4gICAgICAgIC8vIGxhenkgbG9hZCB0byBwcmV2ZW50IGNpcmN1bGFyIGRlcFxyXG4gICAgICAgIEFwaUNvbGxlY3Rpb24gPSBBcGlDb2xsZWN0aW9uIHx8IHJlcXVpcmUoJy4vY29sbGVjdGlvbicpO1xyXG4gICAgICAgIHJldHVybiBBcGlDb2xsZWN0aW9uLmNyZWF0ZSh0eXBlTmFtZSwgcmF3SlNPTiwgYXBpLCB0eXBlLmNvbGxlY3Rpb25PZik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIEFwaU9iamVjdFR5cGUgPSB0aGlzLmdldEh5ZHJhdGVkVHlwZSh0eXBlTmFtZSk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBBcGlPYmplY3RUeXBlKHR5cGVOYW1lLCByYXdKU09OLCBhcGkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcGlPYmplY3RDb25zdHJ1Y3RvcjtcclxuXHJcbi8vIEVORCBPQkpFQ1RcclxuXHJcbi8qKioqKioqKioqKi8iLCIvLyBCRUdJTiBSRUZFUkVOQ0VcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcclxudmFyIEFwaUNvbGxlY3Rpb247XHJcbnZhciBBcGlPYmplY3QgPSByZXF1aXJlKCcuL29iamVjdCcpO1xyXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCcuL21ldGhvZHMuanNvbicpO1xyXG5cclxuZXJyb3JzLnJlZ2lzdGVyKHtcclxuICAgICdOT19SRVFVRVNUX0NPTkZJR19GT1VORCc6ICdObyByZXF1ZXN0IGNvbmZpZ3VyYXRpb24gd2FzIGZvdW5kIGZvciB7MH0uezF9JyxcclxuICAgICdOT19TSE9SVENVVF9QQVJBTV9GT1VORCc6ICdObyBzaG9ydGN1dCBwYXJhbWV0ZXIgYXZhaWxhYmxlIGZvciB7MH0uIFBsZWFzZSBzdXBwbHkgYSBjb25maWd1cmF0aW9uIG9iamVjdCBpbnN0ZWFkIG9mIFwiezF9XCIuJ1xyXG59KTtcclxuXHJcbnZhciBiYXNpY09wcyA9IHtcclxuICAgIGdldDogJ0dFVCcsXHJcbiAgICB1cGRhdGU6ICdQVVQnLFxyXG4gICAgY3JlYXRlOiAnUE9TVCcsXHJcbiAgICBkZWw6ICdERUxFVEUnXHJcbn07XHJcbnZhciBjb3B5VG9Db25mID0gWyd2ZXJiJywgJ3JldHVyblR5cGUnLCAnbm9Cb2R5J10sXHJcbiAgICBjb3B5VG9Db25mTGVuZ3RoID0gY29weVRvQ29uZi5sZW5ndGg7XHJcbnZhciByZXNlcnZlZFdvcmRzID0ge1xyXG4gICAgdGVtcGxhdGU6IHRydWUsXHJcbiAgICBkZWZhdWx0UGFyYW1zOiB0cnVlLFxyXG4gICAgc2hvcnRjdXRQYXJhbTogdHJ1ZSxcclxuICAgIGRlZmF1bHRzOiB0cnVlLFxyXG4gICAgdmVyYjogdHJ1ZSxcclxuICAgIHJldHVyblR5cGU6IHRydWUsXHJcbiAgICBub0JvZHk6IHRydWUsXHJcbiAgICBpbmNsdWRlU2VsZjogdHJ1ZSxcclxuICAgIGNvbGxlY3Rpb25PZjogdHJ1ZSxcclxuICAgIG92ZXJyaWRlUG9zdERhdGE6IHRydWUsXHJcbiAgICB1c2VJZnJhbWVUcmFuc3BvcnQ6IHRydWUsXHJcbiAgICBjb25zdHJ1Y3Q6IHRydWUsXHJcbiAgICBwb3N0Y29uc3RydWN0OiB0cnVlLFxyXG59O1xyXG52YXIgQXBpUmVmZXJlbmNlID0ge1xyXG5cclxuICAgIGJhc2ljT3BzOiBiYXNpY09wcyxcclxuICAgIHVybHM6IHt9LFxyXG5cclxuICAgIGdldEFjdGlvbnNGb3I6IGZ1bmN0aW9uKHR5cGVOYW1lKSB7XHJcbiAgICAgICAgQXBpQ29sbGVjdGlvbiA9IEFwaUNvbGxlY3Rpb24gfHwgcmVxdWlyZSgnLi9jb2xsZWN0aW9uJyk7XHJcbiAgICAgICAgaWYgKCFvYmplY3RUeXBlc1t0eXBlTmFtZV0pIHJldHVybiBmYWxzZTtcclxuICAgICAgICB2YXIgYWN0aW9ucyA9IFtdLFxyXG4gICAgICAgICAgICBpc1NpbXBsZVR5cGUgPSAodHlwZW9mIG9iamVjdFR5cGVzW3R5cGVOYW1lXSA9PT0gXCJzdHJpbmdcIik7XHJcbiAgICAgICAgZm9yICh2YXIgYSBpbiBiYXNpY09wcykge1xyXG4gICAgICAgICAgICBpZiAoaXNTaW1wbGVUeXBlIHx8ICEoYSBpbiBvYmplY3RUeXBlc1t0eXBlTmFtZV0pKVxyXG4gICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWlzU2ltcGxlVHlwZSkge1xyXG4gICAgICAgICAgICBmb3IgKGEgaW4gb2JqZWN0VHlwZXNbdHlwZU5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYSAmJiBvYmplY3RUeXBlc1t0eXBlTmFtZV0uaGFzT3duUHJvcGVydHkoYSkgJiYgIXJlc2VydmVkV29yZHNbYV0pXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKHV0aWxzLmNhbWVsQ2FzZShhKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGRlY2xhcmVkVHlwZSA9IChvYmplY3RUeXBlc1t0eXBlTmFtZV0uY29sbGVjdGlvbk9mID8gQXBpQ29sbGVjdGlvbiA6IEFwaU9iamVjdCkudHlwZXNbdHlwZU5hbWVdO1xyXG4gICAgICAgIGlmIChkZWNsYXJlZFR5cGUpIHtcclxuICAgICAgICAgICAgZm9yIChhIGluIGRlY2xhcmVkVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSB8fCAhKHV0aWxzLmRhc2hDYXNlKGEpIGluIG9iamVjdFR5cGVzW3R5cGVOYW1lXSAmJiAhcmVzZXJ2ZWRXb3Jkc1thXSkgJiYgdHlwZW9mIGRlY2xhcmVkVHlwZVthXSA9PT0gXCJmdW5jdGlvblwiKSBhY3Rpb25zLnB1c2goYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhY3Rpb25zO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRSZXF1ZXN0Q29uZmlnOiBmdW5jdGlvbihvcGVyYXRpb24sIHR5cGVOYW1lLCBjb25mLCBjb250ZXh0LCBvYmopIHtcclxuXHJcbiAgICAgICAgdmFyIHJldHVybk9iaiwgdHB0RGF0YTtcclxuXHJcbiAgICAgICAgLy8gZ2V0IG9iamVjdCB0eXBlIGZyb20gb3VyIHJlZmVyZW5jZVxyXG4gICAgICAgIHZhciBvVHlwZSA9IG9iamVjdFR5cGVzW3R5cGVOYW1lXTtcclxuXHJcbiAgICAgICAgLy8gdGhlcmUgbWF5IG5vdCBiZSBvbmVcclxuICAgICAgICBpZiAoIW9UeXBlKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdOT19SRVFVRVNUX0NPTkZJR19GT1VORCcsIHR5cGVOYW1lLCAnJyk7XHJcblxyXG4gICAgICAgIC8vIGdldCBzcGVjaWZpYyBkZXRhaWxzIG9mIHRoZSByZXF1ZXN0ZWQgb3BlcmF0aW9uXHJcbiAgICAgICAgaWYgKG9wZXJhdGlvbikgb3BlcmF0aW9uID0gdXRpbHMuZGFzaENhc2Uob3BlcmF0aW9uKTtcclxuICAgICAgICBpZiAob1R5cGVbb3BlcmF0aW9uXSkgb1R5cGUgPSBvVHlwZVtvcGVyYXRpb25dO1xyXG5cclxuICAgICAgICAvLyBzb21lIG9UeXBlcyBhcmUgYSBzaW1wbGUgdGVtcGxhdGUgYXMgYSBzdHJpbmdcclxuICAgICAgICBpZiAodHlwZW9mIG9UeXBlID09PSBcInN0cmluZ1wiKSBvVHlwZSA9IHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6IG9UeXBlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gdGhlIGRlZmF1bHRzIGF0IHRoZSByb290IG9iamVjdCB0eXBlIHNob3VsZCBiZSBjb3BpZWQgaW50byBhbGwgb3BlcmF0aW9uIGNvbmZpZ3NcclxuICAgICAgICBpZiAob2JqZWN0VHlwZXNbdHlwZU5hbWVdLmRlZmF1bHRzKSBvVHlwZSA9IHV0aWxzLmV4dGVuZCh7fSwgb2JqZWN0VHlwZXNbdHlwZU5hbWVdLmRlZmF1bHRzLCBvVHlwZSk7XHJcblxyXG4gICAgICAgIC8vIGEgdGVtcGxhdGUgaXMgcmVxdWlyZWRcclxuICAgICAgICBpZiAoIW9UeXBlLnRlbXBsYXRlKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdOT19SRVFVRVNUX0NPTkZJR19GT1VORCcsIHR5cGVOYW1lLCBvcGVyYXRpb24pO1xyXG5cclxuICAgICAgICByZXR1cm5PYmogPSB7fTtcclxuICAgICAgICB0cHREYXRhID0ge307XHJcblxyXG4gICAgICAgIC8vIGNhY2hlIHRlbXBsYXRlcyBsYXppbHlcclxuICAgICAgICBpZiAodHlwZW9mIG9UeXBlLnRlbXBsYXRlID09PSBcInN0cmluZ1wiKSBvVHlwZS50ZW1wbGF0ZSA9IHV0aWxzLnVyaXRlbXBsYXRlLnBhcnNlKG9UeXBlLnRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRoZSByZXF1ZXN0aW5nIG9iamVjdCdzIGRhdGEgaXRzZWxmIHRvIHRoZSB0cHQgY29udGV4dFxyXG4gICAgICAgIGlmIChvVHlwZS5pbmNsdWRlU2VsZiAmJiBvYmopIHtcclxuICAgICAgICAgICAgaWYgKG9UeXBlLmluY2x1ZGVTZWxmLmFzUHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgIHRwdERhdGFbb1R5cGUuaW5jbHVkZVNlbGYuYXNQcm9wZXJ0eV0gPSBvYmouZGF0YVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdHB0RGF0YSA9IHV0aWxzLmV4dGVuZCh0cHREYXRhLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNob3J0Y3V0cGFyYW0gYWxsb3dzIHlvdSB0byB1c2UgdGhlIG1vc3QgY29tbW9ubHkgdXNlZCBjb25mIHByb3BlcnR5IGFzIGEgc3RyaW5nIG9yIG51bWJlciBhcmd1bWVudFxyXG4gICAgICAgIGlmIChjb25mICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGNvbmYgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgaWYgKCFvVHlwZS5zaG9ydGN1dFBhcmFtKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdOT19TSE9SVENVVF9QQVJBTV9GT1VORCcsIHR5cGVOYW1lLCBjb25mKTtcclxuICAgICAgICAgICAgdHB0RGF0YVtvVHlwZS5zaG9ydGN1dFBhcmFtXSA9IGNvbmY7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb25mKSB7XHJcbiAgICAgICAgICAgIC8vIGFkZCB0aGUgY29uZiBhcmd1ZWQgZGlyZWN0bHkgaW50byB0aGlzIHJlcXVlc3QgZm4gdG8gdGhlIHRwdCBjb250ZXh0XHJcbiAgICAgICAgICAgIHV0aWxzLmV4dGVuZCh0cHREYXRhLCBjb25mKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGRlZmF1bHQgcGFyYW1zIGFkZGVkIHRvIHRlbXBsYXRlLCBidXQgb3ZlcnJpZGRlbiBieSBleGlzdGluZyB0cHQgZGF0YVxyXG4gICAgICAgIGlmIChvVHlwZS5kZWZhdWx0UGFyYW1zKSB0cHREYXRhID0gdXRpbHMuZXh0ZW5kKHt9LCBvVHlwZS5kZWZhdWx0UGFyYW1zLCB0cHREYXRhKTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIHN0dWZmIHRoYXQgdGhlIFVyaVRlbXBsYXRlIHBhcnNlciBjYW4ndCBwYXJzZVxyXG4gICAgICAgIGZvciAodmFyIHR2YXIgaW4gdHB0RGF0YSkge1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuZ2V0VHlwZSh0cHREYXRhW3R2YXJdKSA9PSBcIkFycmF5XCIpIHRwdERhdGFbdHZhcl0gPSBKU09OLnN0cmluZ2lmeSh0cHREYXRhW3R2YXJdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZ1bGxUcHRDb250ZXh0ID0gdXRpbHMuZXh0ZW5kKHtcclxuICAgICAgICAgICAgXzogdHB0RGF0YVxyXG4gICAgICAgIH0sIGNvbnRleHQuYXNPYmplY3QoJ2NvbnRleHQtJyksIHV0aWxzLmZsYXR0ZW4odHB0RGF0YSwge30pLCBBcGlSZWZlcmVuY2UudXJscyk7XHJcbiAgICAgICAgcmV0dXJuT2JqLnVybCA9IG9UeXBlLnRlbXBsYXRlLmV4cGFuZChmdWxsVHB0Q29udGV4dCk7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb3B5VG9Db25mTGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGNvcHlUb0NvbmZbal0gaW4gb1R5cGUpIHJldHVybk9ialtjb3B5VG9Db25mW2pdXSA9IG9UeXBlW2NvcHlUb0NvbmZbal1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob1R5cGUudXNlSWZyYW1lVHJhbnNwb3J0KSB7XHJcbiAgICAgICAgICAgIC8vIGNhY2hlIHRlbXBsYXRlcyBsYXppbHlcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvVHlwZS51c2VJZnJhbWVUcmFuc3BvcnQgPT09IFwic3RyaW5nXCIpIG9UeXBlLnVzZUlmcmFtZVRyYW5zcG9ydCA9IHV0aWxzLnVyaXRlbXBsYXRlLnBhcnNlKG9UeXBlLnVzZUlmcmFtZVRyYW5zcG9ydCk7XHJcbiAgICAgICAgICAgIHJldHVybk9iai5pZnJhbWVUcmFuc3BvcnRVcmwgPSBvVHlwZS51c2VJZnJhbWVUcmFuc3BvcnQuZXhwYW5kKGZ1bGxUcHRDb250ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9UeXBlLm92ZXJyaWRlUG9zdERhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG92ZXJyaWRkZW5EYXRhO1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuZ2V0VHlwZShvVHlwZS5vdmVycmlkZVBvc3REYXRhKSA9PSBcIkFycmF5XCIpIHtcclxuICAgICAgICAgICAgICAgIG92ZXJyaWRkZW5EYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0T0sgPSAwOyB0T0sgPCBvVHlwZS5vdmVycmlkZVBvc3REYXRhLmxlbmd0aDsgdE9LKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBvdmVycmlkZGVuRGF0YVtvVHlwZS5vdmVycmlkZVBvc3REYXRhW3RPS11dID0gdHB0RGF0YVtvVHlwZS5vdmVycmlkZVBvc3REYXRhW3RPS11dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3ZlcnJpZGRlbkRhdGEgPSB0cHREYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybk9iai5vdmVycmlkZVBvc3REYXRhID0gb3ZlcnJpZGRlbkRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXR1cm5PYmo7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFR5cGU6IGZ1bmN0aW9uKHR5cGVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdFR5cGVzW3R5cGVOYW1lXTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBpUmVmZXJlbmNlO1xyXG5cclxuLy8gRU5EIFJFRkVSRU5DRVxyXG5cclxuLyoqKioqKioqKioqLyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgY291bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3AoJ2l0ZW1zJyk7XHJcbiAgICAgICAgaWYgKCFpdGVtcyB8fCAhaXRlbXMubGVuZ3RoKSByZXR1cm4gMDtcclxuICAgICAgICByZXR1cm4gdXRpbHMucmVkdWNlKGl0ZW1zLCBmdW5jdGlvbiAodG90YWwsIGl0ZW0pIHsgcmV0dXJuIHRvdGFsICsgaXRlbS5xdWFudGl0eTsgfSwgMCk7XHJcbiAgICB9XHJcbn07IiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBjb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEudG90YWxRdWFudGl0eSB8fCAwO1xyXG4gICAgfVxyXG59OyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZXJyb3JzLnJlZ2lzdGVyKHtcclxuICAgICAgICAnQ0FSRF9UWVBFX01JU1NJTkcnOiAnQ2FyZCB0eXBlIG1pc3NpbmcuJyxcclxuICAgICAgICAnQ0FSRF9OVU1CRVJfTUlTU0lORyc6ICdDYXJkIG51bWJlciBtaXNzaW5nLicsXHJcbiAgICAgICAgJ0NWVl9NSVNTSU5HJzogJ0NhcmQgc2VjdXJpdHkgY29kZSBtaXNzaW5nLicsXHJcbiAgICAgICAgJ0NBUkRfTlVNQkVSX1VOUkVDT0dOSVpFRCc6ICdDYXJkIG51bWJlciBpcyBpbiBhbiB1bnJlY29nbml6ZWQgZm9ybWF0LicsXHJcbiAgICAgICAgJ01BU0tfUEFUVEVSTl9JTlZBTElEJzogJ1N1cHBsaWVkIG1hc2sgcGF0dGVybiBkaWQgbm90IG1hdGNoIGEgdmFsaWQgY2FyZCBudW1iZXIuJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGNoYXJzSW5DYXJkTnVtYmVyUkUgPSAvW1xccy1dL2c7XHJcblxyXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVDYXJkTnVtYmVyKG9iaiwgY2FyZE51bWJlcikge1xyXG4gICAgICAgIHZhciBtYXNrQ2hhcmFjdGVyID0gb2JqLm1hc2tDaGFyYWN0ZXI7XHJcbiAgICAgICAgaWYgKCFjYXJkTnVtYmVyKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIChjYXJkTnVtYmVyLmluZGV4T2YobWFza0NoYXJhY3RlcikgIT09IC0xKSB8fCBsdWhuMTAoY2FyZE51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbHVobjEwKHMpIHtcclxuICAgICAgICAvLyBsdWhuIDEwIGFsZ29yaXRobSBmb3IgY2FyZCBudW1iZXJzXHJcbiAgICAgICAgdmFyIGksIG4sIGMsIHIsIHQ7XHJcbiAgICAgICAgciA9IFwiXCI7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KHMuY2hhckF0KGkpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmIChjID49IDAgJiYgYyA8PSA5KSByID0gYyArIHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyLmxlbmd0aCA8PSAxKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdCA9IFwiXCI7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KHIuY2hhckF0KGkpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmIChpICUgMiAhPSAwKSBjICo9IDI7XHJcbiAgICAgICAgICAgIHQgPSB0ICsgYztcclxuICAgICAgICB9XHJcbiAgICAgICAgbiA9IDA7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KHQuY2hhckF0KGkpLCAxMCk7XHJcbiAgICAgICAgICAgIG4gPSBuICsgYztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChuICE9IDAgJiYgbiAlIDEwID09IDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhcmROdW1iZXJNYXNrKG9iaiwgY2FyZE51bWJlcikge1xyXG4gICAgICAgIHZhciBtYXNrUkUgPSBuZXcgUmVnRXhwKG9iai5tYXNrUGF0dGVybiksXHJcbiAgICAgICAgICAgIG1hdGNoZXMgPSBjYXJkTnVtYmVyLm1hdGNoKG1hc2tSRSksXHJcbiAgICAgICAgICAgIHRvRGlzcGxheSA9IGNhcmROdW1iZXIsXHJcbiAgICAgICAgICAgIHRvU2VuZCA9IFtdLFxyXG4gICAgICAgICAgICBtYXNrQ2hhcmFjdGVyID0gb2JqLm1hc2tDaGFyYWN0ZXIsXHJcbiAgICAgICAgICAgIHRlbXBNYXNrID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKCFtYXRjaGVzKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdNQVNLX1BBVFRFUk5fSU5WQUxJRCcpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0ZW1wTWFzayA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2hlc1tpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGVtcE1hc2sgKz0gbWFza0NoYXJhY3RlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b0Rpc3BsYXkgPSB0b0Rpc3BsYXkucmVwbGFjZShtYXRjaGVzW2ldLCB0ZW1wTWFzayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaSA9IHRvRGlzcGxheS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICB0b1NlbmQudW5zaGlmdCh0b0Rpc3BsYXkuY2hhckF0KGkpID09PSBtYXNrQ2hhcmFjdGVyID8gY2FyZE51bWJlci5jaGFyQXQoaSkgOiBtYXNrQ2hhcmFjdGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JqLm1hc2tlZENhcmROdW1iZXIgPSB0b0Rpc3BsYXk7XHJcbiAgICAgICAgcmV0dXJuIHRvU2VuZC5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYWtlUGF5bG9hZChvYmopIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG9iai5kYXRhLCBtYXNrQ2hhcmFjdGVyID0gb2JqLm1hc2tDaGFyYWN0ZXIsIG1hc2tlZERhdGE7XHJcbiAgICAgICAgaWYgKCFkYXRhLnBheW1lbnRPckNhcmRUeXBlKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdDQVJEX1RZUEVfTUlTU0lORycpO1xyXG4gICAgICAgIGlmICghZGF0YS5jYXJkTnVtYmVyUGFydE9yTWFzaykgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnQ0FSRF9OVU1CRVJfTUlTU0lORycpO1xyXG4gICAgICAgIGlmICghZGF0YS5jdnYpIGVycm9ycy50aHJvd09uT2JqZWN0KG9iaiwgJ0NWVl9NSVNTSU5HJyk7XHJcbiAgICAgICAgbWFza2VkRGF0YSA9IHRyYW5zZm9ybS50b0NhcmREYXRhKGRhdGEpXHJcbiAgICAgICAgdmFyIGNhcmROdW1iZXIgPSBtYXNrZWREYXRhLmNhcmROdW1iZXIucmVwbGFjZShjaGFyc0luQ2FyZE51bWJlclJFLCAnJyk7XHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZUNhcmROdW1iZXIob2JqLCBjYXJkTnVtYmVyKSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnQ0FSRF9OVU1CRVJfVU5SRUNPR05JWkVEJyk7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgYWRkIG51bWJlclBhcnQgaWYgdGhlIGN1cnJlbnQgY2FyZCBudW1iZXIgaXNuJ3QgYWxyZWFkeSBtYXNrZWRcclxuICAgICAgICBpZiAoY2FyZE51bWJlci5pbmRleE9mKG1hc2tDaGFyYWN0ZXIpID09PSAtMSkgbWFza2VkRGF0YS5udW1iZXJQYXJ0ID0gY3JlYXRlQ2FyZE51bWJlck1hc2sob2JqLCBjYXJkTnVtYmVyKTtcclxuICAgICAgICBkZWxldGUgbWFza2VkRGF0YS5jYXJkTnVtYmVyO1xyXG5cclxuICAgICAgICByZXR1cm4gbWFza2VkRGF0YTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdmFyIHRyYW5zZm9ybSA9IHtcclxuICAgICAgICBmaWVsZHM6IHtcclxuICAgICAgICAgICAgXCJjYXJkTnVtYmVyXCI6IFwiY2FyZE51bWJlclBhcnRPck1hc2tcIixcclxuICAgICAgICAgICAgXCJwZXJzaXN0Q2FyZFwiOiBcImlzQ2FyZEluZm9TYXZlZFwiLFxyXG4gICAgICAgICAgICBcImNhcmRob2xkZXJOYW1lXCI6IFwibmFtZU9uQ2FyZFwiLFxyXG4gICAgICAgICAgICBcImNhcmRUeXBlXCI6IFwicGF5bWVudE9yQ2FyZFR5cGVcIixcclxuICAgICAgICAgICAgXCJjYXJkSWRcIjogXCJwYXltZW50U2VydmljZUNhcmRJZFwiLFxyXG4gICAgICAgICAgICBcImN2dlwiOiBcImN2dlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b1N0b3JlZnJvbnREYXRhOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgc3RvcmVmcm9udERhdGEgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2VydmljZUZpZWxkIGluIHRoaXMuZmllbGRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VydmljZUZpZWxkIGluIGRhdGEpIHN0b3JlZnJvbnREYXRhW3RoaXMuZmllbGRzW3NlcnZpY2VGaWVsZF1dID0gZGF0YVtzZXJ2aWNlRmllbGRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdG9yZWZyb250RGF0YTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvQ2FyZERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzZXJ2aWNlRmllbGQgaW4gdGhpcy5maWVsZHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkc1tzZXJ2aWNlRmllbGRdIGluIGRhdGEpIGNhcmREYXRhW3NlcnZpY2VGaWVsZF0gPSBkYXRhW3RoaXMuZmllbGRzW3NlcnZpY2VGaWVsZF1dXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNhcmREYXRhO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1hc2tDaGFyYWN0ZXI6IFwiKlwiLFxyXG4gICAgICAgIG1hc2tQYXR0ZXJuOiBcIl4oXFxcXGQrPylcXFxcZHs0fSRcIixcclxuICAgICAgICBzYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGlzVXBkYXRlID0gdGhpcy5wcm9wKHRyYW5zZm9ybS5maWVsZHMuY2FyZElkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBpLmFjdGlvbih0aGlzLCAoaXNVcGRhdGUgPyAndXBkYXRlJyA6ICdzYXZlJyksIG1ha2VQYXlsb2FkKHRoaXMpKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucHJvcCh0cmFuc2Zvcm0udG9TdG9yZWZyb250RGF0YSh7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZE51bWJlcjogc2VsZi5tYXNrZWRDYXJkTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGN2djogc2VsZi5wcm9wKCdjdnYnKS5yZXBsYWNlKC9cXGQvZywgc2VsZi5tYXNrQ2hhcmFjdGVyKSxcclxuICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IGlzVXBkYXRlIHx8IHJlc1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKCdzeW5jJywgdXRpbHMuY2xvbmUoc2VsZi5kYXRhKSwgc2VsZi5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNhdmVUb0N1c3RvbWVyOiBmdW5jdGlvbiAoY3VzdG9tZXJJZCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChjYXJkSWQpIHtcclxuICAgICAgICAgICAgICAgIGNhcmRJZCA9IGNhcmRJZCB8fCBzZWxmLnByb3AoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VzdG9tZXIgPSBzZWxmLmFwaS5jcmVhdGVTeW5jKCdjdXN0b21lcicsIHsgaWQ6IGN1c3RvbWVySWQgfSk7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucGFzc0Zyb20oY3VzdG9tZXIsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1c3RvbWVyLmFkZENhcmQoc2VsZi5kYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRPcmRlckRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNhcmROdW1iZXJQYXJ0T3JNYXNrOiB0aGlzLm1hc2tlZENhcmROdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBjdnY6IHRoaXMuZGF0YS5jdnYsXHJcbiAgICAgICAgICAgICAgICBuYW1lT25DYXJkOiB0aGlzLmRhdGEubmFtZU9uQ2FyZCxcclxuICAgICAgICAgICAgICAgIHBheW1lbnRPckNhcmRUeXBlOiB0aGlzLmRhdGEucGF5bWVudE9yQ2FyZFR5cGUgfHwgdGhpcy5kYXRhLmNhcmRUeXBlLFxyXG4gICAgICAgICAgICAgICAgcGF5bWVudFNlcnZpY2VDYXJkSWQ6IHRoaXMuZGF0YS5wYXltZW50U2VydmljZUNhcmRJZCB8fCB0aGlzLmRhdGEuY2FyZElkLFxyXG4gICAgICAgICAgICAgICAgaXNDYXJkSW5mb1NhdmVkOiB0aGlzLmRhdGEuaXNDYXJkSW5mb1NhdmVkIHx8IHRoaXMuZGF0YS5wZXJzaXN0Q2FyZCxcclxuICAgICAgICAgICAgICAgIGV4cGlyZU1vbnRoOiB0aGlzLmRhdGEuZXhwaXJlTW9udGgsXHJcbiAgICAgICAgICAgICAgICBleHBpcmVZZWFyOiB0aGlzLmRhdGEuZXhwaXJlWWVhclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbn0oKSk7IiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvc3Rjb25zdHJ1Y3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMub24oJ3N5bmMnLCBmdW5jdGlvbiAoanNvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb24gJiYganNvbi5hdXRoVGlja2V0ICYmIGpzb24uYXV0aFRpY2tldC5hY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXBpLmNvbnRleHQuVXNlckNsYWltcyhqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXBpLmZpcmUoJ2xvZ2luJywganNvbi5hdXRoVGlja2V0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYXZlUGF5bWVudENhcmQ6IGZ1bmN0aW9uICh1bm1hc2tlZENhcmREYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgY2FyZCA9IHRoaXMuYXBpLmNyZWF0ZVN5bmMoJ2NyZWRpdGNhcmQnLCB1bm1hc2tlZENhcmREYXRhKSxcclxuICAgICAgICAgICAgICAgIGlzVXBkYXRlID0gISEodW5tYXNrZWRDYXJkRGF0YS5wYXltZW50U2VydmljZUNhcmRJZCB8fCB1bm1hc2tlZENhcmREYXRhLmlkKTtcclxuICAgICAgICAgICAgZXJyb3JzLnBhc3NGcm9tKGNhcmQsIHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gY2FyZC5zYXZlKCkudGhlbihmdW5jdGlvbiAoY2FyZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBheWxvYWQgPSB1dGlscy5jbG9uZShjYXJkLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5jYXJkTnVtYmVyUGFydCA9IHBheWxvYWQuY2FyZE51bWJlclBhcnRPck1hc2sgfHwgcGF5bG9hZC5jYXJkTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pZCA9IHBheWxvYWQucGF5bWVudFNlcnZpY2VDYXJkSWQ7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZC5jYXJkTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQuY2FyZE51bWJlclBhcnRPck1hc2s7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZC5wYXltZW50U2VydmljZUNhcmRJZDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpc1VwZGF0ZSA/IHNlbGYudXBkYXRlQ2FyZChwYXlsb2FkKSA6IHNlbGYuYWRkQ2FyZChwYXlsb2FkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWxldGVQYXltZW50Q2FyZDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlQ2FyZChpZCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5hcGkuZGVsKCdjcmVkaXRjYXJkJywgaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFN0b3JlQ3JlZGl0czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXRzID0gdGhpcy5hcGkuY3JlYXRlU3luYygnc3RvcmVjcmVkaXRzJyk7XHJcbiAgICAgICAgICAgIGVycm9ycy5wYXNzRnJvbShjcmVkaXRzLCB0aGlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWRpdHMuZ2V0KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRTdG9yZUNyZWRpdDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXQgPSB0aGlzLmFwaS5jcmVhdGVTeW5jKCdzdG9yZWNyZWRpdCcsIHsgY29kZTogaWQgfSk7XHJcbiAgICAgICAgICAgIGVycm9ycy5wYXNzRnJvbShjcmVkaXQsIHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gY3JlZGl0LmFzc29jaWF0ZVRvU2hvcHBlcigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gYXMgb2YgMTIvMzAvMjAxMyBwYXJ0aWFsIHVwZGF0ZXMgb24gY3VzdG9tZXIgd2lsbFxyXG4gICAgICAgIC8vIGJsYW5rIG91dCB0aGVzZSB2YWx1ZXMgdW5sZXNzIHRoZXkgYXJlIGluY2x1ZGVkXHJcbiAgICAgICAgLy8gVE9ETzogcmVtb3ZlIGFzIHNvb24gYXMgVEZTIzIxNzc1IGlzIGZpeGVkXHJcbiAgICAgICAgZ2V0TWluaW11bVBhcnRpYWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdGhpcy5wcm9wKCdmaXJzdE5hbWUnKSxcclxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiB0aGlzLnByb3AoJ2xhc3ROYW1lJyksXHJcbiAgICAgICAgICAgICAgICBlbWFpbEFkZHJlc3M6IHRoaXMucHJvcCgnZW1haWxBZGRyZXNzJylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBpLmFjdGlvbih0aGlzLCAndXBkYXRlJywgdXRpbHMuZXh0ZW5kKHRoaXMuZ2V0TWluaW11bVBhcnRpYWwoKSwgdXRpbHMuY2xvbmUoZGF0YSkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7IiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8vIGhhdmVyc2luZVxyXG4gICAgLy8gQnkgTmljayBKdXN0aWNlIChuaWl4KVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25paXgvaGF2ZXJzaW5lXHJcblxyXG4gICAgdmFyIGhhdmVyc2luZSA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gcmFkaWFuc1xyXG4gICAgICAgIHZhciB0b1JhZCA9IGZ1bmN0aW9uIChudW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bSAqIE1hdGguUEkgLyAxODBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBoYXZlcnNpbmUoc3RhcnQsIGVuZCwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgbWlsZXMgPSAzOTYwXHJcbiAgICAgICAgICAgIHZhciBrbSA9IDYzNzFcclxuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuXHJcbiAgICAgICAgICAgIHZhciBSID0gb3B0aW9ucy51bml0ID09PSAna20nID8ga20gOiBtaWxlc1xyXG5cclxuICAgICAgICAgICAgdmFyIGRMYXQgPSB0b1JhZChlbmQubGF0aXR1ZGUgLSBzdGFydC5sYXRpdHVkZSlcclxuICAgICAgICAgICAgdmFyIGRMb24gPSB0b1JhZChlbmQubG9uZ2l0dWRlIC0gc3RhcnQubG9uZ2l0dWRlKVxyXG4gICAgICAgICAgICB2YXIgbGF0MSA9IHRvUmFkKHN0YXJ0LmxhdGl0dWRlKVxyXG4gICAgICAgICAgICB2YXIgbGF0MiA9IHRvUmFkKGVuZC5sYXRpdHVkZSlcclxuXHJcbiAgICAgICAgICAgIHZhciBhID0gTWF0aC5zaW4oZExhdCAvIDIpICogTWF0aC5zaW4oZExhdCAvIDIpICtcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnNpbihkTG9uIC8gMikgKiBNYXRoLnNpbihkTG9uIC8gMikgKiBNYXRoLmNvcyhsYXQxKSAqIE1hdGguY29zKGxhdDIpXHJcbiAgICAgICAgICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMSAtIGEpKVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGhyZXNob2xkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50aHJlc2hvbGQgPiAoUiAqIGMpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUiAqIGNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KSgpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgZ2V0QnlMYXRMb25nOiBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24oJ2xvY2F0aW9ucycsICdnZXQtYnktbGF0LWxvbmcnLCB7XHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZTogb3B0cy5sb2NhdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICBsb25naXR1ZGU6IG9wdHMubG9jYXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb2xsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gY29sbC5kYXRhLml0ZW1zO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxvY2F0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uc1tpXS5kaXN0YW5jZSA9IGhhdmVyc2luZShvcHRzLmxvY2F0aW9uLmNvb3JkcywgeyBsYXRpdHVkZTogbG9jYXRpb25zW2ldLmdlby5sYXQsIGxvbmdpdHVkZTogbG9jYXRpb25zW2ldLmdlby5sbmcgfSkudG9GaXhlZCgxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdXRpbHMuY2xvbmUoY29sbC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZmlyZSgnc3luYycsIGRhdGEsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldEZvclByb2R1Y3Q6IGZ1bmN0aW9uIChvcHRzKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNvbGwsXHJcbiAgICAgICAgICAgICAgICAvLyBub3QgcnVubmluZyB0aGUgbWV0aG9kIG9uIHNlbGYgc2luY2UgaXQgc2hvdWxkbid0IHN5bmMgdW50aWwgaXQncyBiZWVuIHByb2Nlc3NlZCFcclxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IG9wdHMubG9jYXRpb24gP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuYWN0aW9uKCdsb2NhdGlvbnMnLCAnZ2V0LWJ5LWxhdC1sb25nJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiBvcHRzLmxvY2F0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGU6IG9wdHMubG9jYXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgfSkgOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuZ2V0KCdsb2NhdGlvbnMnKTtcclxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdGlvbi50aGVuKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsID0gYztcclxuICAgICAgICAgICAgICAgIHZhciBjb2RlcyA9IHV0aWxzLm1hcChjb2xsLmRhdGEuaXRlbXMsIGZ1bmN0aW9uIChsb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jLmNvZGU7XHJcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5hcGkuYWN0aW9uKCdwcm9kdWN0JywgJ2dldEludmVudG9yeScsIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9kdWN0Q29kZTogb3B0cy5wcm9kdWN0Q29kZSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkNvZGVzOiBjb2Rlc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGludmVudG9yeSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGosXHJcbiAgICAgICAgICAgICAgICAgICAgaWxlbixcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMgPSBjb2xsLmRhdGEuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgaW52ZW50b3JpZXMgPSBpbnZlbnRvcnkuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRMb2NhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsb2NhdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBpbGVuID0gaW52ZW50b3JpZXMubGVuZ3RoOyBqIDwgaWxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnZlbnRvcmllc1tqXS5sb2NhdGlvbkNvZGUgPT09IGxvY2F0aW9uc1tpXS5jb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnNbaV0ucXVhbnRpdHkgPSBpbnZlbnRvcmllc1tqXS5zdG9ja0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRzLmxvY2F0aW9uKSBsb2NhdGlvbnNbaV0uZGlzdGFuY2UgPSBoYXZlcnNpbmUob3B0cy5sb2NhdGlvbi5jb29yZHMsIHsgbGF0aXR1ZGU6IGxvY2F0aW9uc1tpXS5nZW8ubGF0LCBsb25naXR1ZGU6IGxvY2F0aW9uc1tpXS5nZW8ubG5nIH0pLnRvRml4ZWQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZlbnRvcmllcy5zcGxpY2UoaiwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0geyBpdGVtczogdXRpbHMuY2xvbmUodmFsaWRMb2NhdGlvbnMpIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoJ3N5bmMnLCBkYXRhLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KCkpOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcG9zdGNvbnN0cnVjdDogZnVuY3Rpb24gKHR5cGUsIGpzb24pIHtcclxuICAgICAgICB2YXIgYWNjZXNzVG9rZW47XHJcbiAgICAgICAgaWYgKGpzb24uYXV0aFRpY2tldCAmJiBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgYWNjZXNzVG9rZW4gPSBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgfSBlbHNlIGlmIChqc29uLmFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuID0ganNvbi5hY2Nlc3NUb2tlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBpLmNvbnRleHQuVXNlckNsYWltcyhhY2Nlc3NUb2tlbik7XHJcbiAgICAgICAgICAgIHRoaXMuYXBpLmZpcmUoJ2xvZ2luJywganNvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsInZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9kZWZhdWx0Jyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBBcGlSZWZlcmVuY2UgPSByZXF1aXJlKCcuLi9yZWZlcmVuY2UnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZXJyb3JzLnJlZ2lzdGVyKHtcclxuICAgICAgICAnQklMTElOR19JTkZPX01JU1NJTkcnOiAnQmlsbGluZyBpbmZvIG1pc3NpbmcuJyxcclxuICAgICAgICAnUEFZTUVOVF9UWVBFX01JU1NJTkdfT1JfVU5SRUNPR05JWkVEJzogJ1BheW1lbnQgdHlwZSBtaXNzaW5nIG9yIHVucmVjb2duaXplZC4nLFxyXG4gICAgICAgICdQQVlNRU5UX01JU1NJTkcnOiAnRXhwZWN0ZWQgYSBwYXltZW50IHRvIGV4aXN0IG9uIHRoaXMgb3JkZXIgYW5kIG9uZSBkaWQgbm90LicsXHJcbiAgICAgICAgJ1BBWVBBTF9UUkFOU0FDVElPTl9JRF9NSVNTSU5HJzogJ0V4cGVjdGVkIHRoZSBhY3RpdmUgcGF5bWVudCB0byBpbmNsdWRlIGEgcGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkIGFuZCBpdCBkaWQgbm90LicsXHJcbiAgICAgICAgJ09SREVSX0NBTk5PVF9TVUJNSVQnOiAnT3JkZXIgY2Fubm90IGJlIHN1Ym1pdHRlZC4gSXMgb3JkZXIgY29tcGxldGU/JyxcclxuICAgICAgICAnQUREX0NPVVBPTl9GQUlMRUQnOiAnQWRkaW5nIGNvdXBvbiBmYWlsZWQgZm9yIHRoZSBmb2xsb3dpbmcgcmVhc29uOiB7MH0nLFxyXG4gICAgICAgICdBRERfQ1VTVE9NRVJfRkFJTEVEJzogJ0FkZGluZyBjdXN0b21lciBmYWlsZWQgZm9yIHRoZSBmb2xsb3dpbmcgcmVhc29uOiB7MH0nXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgT3JkZXJTdGF0dXMySXNDb21wbGV0ZSA9IHt9O1xyXG4gICAgT3JkZXJTdGF0dXMySXNDb21wbGV0ZVtDT05TVEFOVFMuT1JERVJfU1RBVFVTRVMuU1VCTUlUVEVEXSA9IHRydWU7XHJcbiAgICBPcmRlclN0YXR1czJJc0NvbXBsZXRlW0NPTlNUQU5UUy5PUkRFUl9TVEFUVVNFUy5BQ0NFUFRFRF0gPSB0cnVlO1xyXG4gICAgT3JkZXJTdGF0dXMySXNDb21wbGV0ZVtDT05TVEFOVFMuT1JERVJfU1RBVFVTRVMuUEVORElOR19SRVZJRVddID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgT3JkZXJTdGF0dXMySXNSZWFkeSA9IHt9O1xyXG4gICAgT3JkZXJTdGF0dXMySXNSZWFkeVtDT05TVEFOVFMuT1JERVJfQUNUSU9OUy5TVUJNSVRfT1JERVJdID0gdHJ1ZTtcclxuICAgIE9yZGVyU3RhdHVzMklzUmVhZHlbQ09OU1RBTlRTLk9SREVSX0FDVElPTlMuQUNDRVBUX09SREVSXSA9IHRydWU7XHJcblxyXG5cclxuICAgIHZhciBQYXltZW50U3RyYXRlZ2llcyA9IHtcclxuICAgICAgICBcIlBheXBhbEV4cHJlc3NcIjogZnVuY3Rpb24gKG9yZGVyLCBiaWxsaW5nSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gb3JkZXIuY3JlYXRlUGF5bWVudCh7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5Vcmw6IGJpbGxpbmdJbmZvLnBheXBhbFJldHVyblVybCxcclxuICAgICAgICAgICAgICAgIGNhbmNlbFVybDogYmlsbGluZ0luZm8ucGF5cGFsQ2FuY2VsVXJsXHJcbiAgICAgICAgICAgIH0pLmVuc3VyZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGF5bWVudCA9IG9yZGVyLmdldEN1cnJlbnRQYXltZW50KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXBheW1lbnQpIGVycm9ycy50aHJvd09uT2JqZWN0KG9yZGVyLCAnUEFZTUVOVF9NSVNTSU5HJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXBheW1lbnQucGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkKSBlcnJvcnMudGhyb3dPbk9iamVjdChvcmRlciwgJ1BBWVBBTF9UUkFOU0FDVElPTl9JRF9NSVNTSU5HJyk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBBcGlSZWZlcmVuY2UudXJscy5wYXlwYWxFeHByZXNzICsgKEFwaVJlZmVyZW5jZS51cmxzLnBheXBhbEV4cHJlc3MuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBcInRva2VuPVwiICsgcGF5bWVudC5wYXltZW50U2VydmljZVRyYW5zYWN0aW9uSWQ7IC8vdXRpbHMuZm9ybWF0U3RyaW5nKENPTlNUQU5UUy5CQVNFX1BBWVBBTF9VUkwsIHBheW1lbnQucGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJDcmVkaXRDYXJkXCI6IGZ1bmN0aW9uIChvcmRlciwgYmlsbGluZ0luZm8pIHtcclxuICAgICAgICAgICAgdmFyIGNhcmQgPSBvcmRlci5hcGkuY3JlYXRlU3luYygnY3JlZGl0Y2FyZCcsIGJpbGxpbmdJbmZvLmNhcmQpO1xyXG4gICAgICAgICAgICBlcnJvcnMucGFzc0Zyb20oY2FyZCwgb3JkZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gY2FyZC5zYXZlKCkudGhlbihmdW5jdGlvbihjYXJkKSB7XHJcbiAgICAgICAgICAgICAgICBiaWxsaW5nSW5mby5jYXJkID0gY2FyZC5nZXRPcmRlckRhdGEoKTtcclxuICAgICAgICAgICAgICAgIG9yZGVyLnByb3AoJ2JpbGxpbmdJbmZvJywgYmlsbGluZ0luZm8pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyLmNyZWF0ZVBheW1lbnQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIkNoZWNrXCI6IGZ1bmN0aW9uIChvcmRlciwgYmlsbGluZ0luZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9yZGVyLmNyZWF0ZVBheW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGFkZENvdXBvbjogZnVuY3Rpb24oY291cG9uQ29kZSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5Q291cG9uKGNvdXBvbkNvZGUpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0KCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnRocm93T25PYmplY3Qoc2VsZiwgJ0FERF9DT1VQT05fRkFJTEVEJywgcmVhc29uLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZE5ld0N1c3RvbWVyOiBmdW5jdGlvbiAobmV3Q3VzdG9tZXJQYXlsb2FkKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuYXBpLmFjdGlvbignY3VzdG9tZXInLCAnY3JlYXRlU3RvcmVmcm9udCcsIG5ld0N1c3RvbWVyUGF5bG9hZCkudGhlbihmdW5jdGlvbiAoY3VzdG9tZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNldFVzZXJJZCgpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMudGhyb3dPbk9iamVjdChzZWxmLCAnQUREX0NVU1RPTUVSX0ZBSUxFRCcsIHJlYXNvbi5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVQYXltZW50OiBmdW5jdGlvbihleHRyYVByb3BzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24odGhpcywgJ2NyZWF0ZVBheW1lbnQnLCB1dGlscy5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiB0aGlzLmFwaS5jb250ZXh0LkN1cnJlbmN5KCkudG9VcHBlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGFtb3VudDogdGhpcy5wcm9wKCdhbW91bnRSZW1haW5pbmdGb3JQYXltZW50JyksXHJcbiAgICAgICAgICAgICAgICBuZXdCaWxsaW5nSW5mbzogdGhpcy5wcm9wKCdiaWxsaW5nSW5mbycpXHJcbiAgICAgICAgICAgIH0sIGV4dHJhUHJvcHMgfHwge30pKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFN0b3JlQ3JlZGl0OiBmdW5jdGlvbihwYXltZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVBheW1lbnQoe1xyXG4gICAgICAgICAgICAgICAgYW1vdW50OiBwYXltZW50LmFtb3VudCxcclxuICAgICAgICAgICAgICAgIG5ld0JpbGxpbmdJbmZvOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bWVudFR5cGU6ICdTdG9yZUNyZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVDcmVkaXRDb2RlOiBwYXltZW50LnN0b3JlQ3JlZGl0Q29kZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFBheW1lbnQ6IGZ1bmN0aW9uIChwYXltZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBiaWxsaW5nSW5mbyA9IHBheW1lbnQgfHwgdGhpcy5wcm9wKCdiaWxsaW5nSW5mbycpO1xyXG4gICAgICAgICAgICBpZiAoIWJpbGxpbmdJbmZvKSBlcnJvcnMudGhyb3dPbk9iamVjdCh0aGlzLCAnQklMTElOR19JTkZPX01JU1NJTkcnKTtcclxuICAgICAgICAgICAgaWYgKCFiaWxsaW5nSW5mby5wYXltZW50VHlwZSB8fCAhKGJpbGxpbmdJbmZvLnBheW1lbnRUeXBlIGluIFBheW1lbnRTdHJhdGVnaWVzKSkgZXJyb3JzLnRocm93T25PYmplY3QodGhpcywgJ1BBWU1FTlRfVFlQRV9NSVNTSU5HX09SX1VOUkVDT0dOSVpFRCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gUGF5bWVudFN0cmF0ZWdpZXNbYmlsbGluZ0luZm8ucGF5bWVudFR5cGVdKHRoaXMsIGJpbGxpbmdJbmZvKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEFjdGl2ZVBheW1lbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHBheW1lbnRzID0gdGhpcy5wcm9wKCdwYXltZW50cycpLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlUGF5bWVudHMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKHBheW1lbnRzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHBheW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBheW1lbnRzW2ldLnN0YXR1cyA9PT0gQ09OU1RBTlRTLlBBWU1FTlRfU1RBVFVTRVMuTkVXKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVQYXltZW50cy5wdXNoKHV0aWxzLmNsb25lKHBheW1lbnRzW2ldKSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYWN0aXZlUGF5bWVudHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRDdXJyZW50UGF5bWVudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBhY3RpdmVQYXltZW50cyA9IHRoaXMuZ2V0QWN0aXZlUGF5bWVudHMoKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGFjdGl2ZVBheW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUGF5bWVudHNbaV0ucGF5bWVudFR5cGUgIT09IFwiU3RvcmVDcmVkaXRcIikgcmV0dXJuIGFjdGl2ZVBheW1lbnRzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRBY3RpdmVTdG9yZUNyZWRpdHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgYWN0aXZlUGF5bWVudHMgPSB0aGlzLmdldEFjdGl2ZVBheW1lbnRzKCksXHJcbiAgICAgICAgICAgICAgICBjcmVkaXRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBhY3RpdmVQYXltZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBheW1lbnRzW2ldLnBheW1lbnRUeXBlID09PSBcIlN0b3JlQ3JlZGl0XCIpIGNyZWRpdHMudW5zaGlmdChhY3RpdmVQYXltZW50c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNyZWRpdHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB2b2lkUGF5bWVudDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBvYmogPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wZXJmb3JtUGF5bWVudEFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICBwYXltZW50SWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogQ09OU1RBTlRTLlBBWU1FTlRfQUNUSU9OUy5WT0lEXHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJhd0pTT04pIHtcclxuICAgICAgICAgICAgICAgIGlmIChyYXdKU09OIHx8IHJhd0pTT04gPT09IDAgfHwgcmF3SlNPTiA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmF3SlNPTi5iaWxsaW5nSW5mbztcclxuICAgICAgICAgICAgICAgICAgICBvYmouZGF0YSA9IHV0aWxzLmNsb25lKHJhd0pTT04pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai51bnN5bmNlZDtcclxuICAgICAgICAgICAgICAgIG9iai5maXJlKCdzeW5jJywgcmF3SlNPTiwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgb2JqLmFwaS5maXJlKCdzeW5jJywgb2JqLCByYXdKU09OLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNoZWNrb3V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZUFjdGlvbnMgPSB0aGlzLnByb3AoJ2F2YWlsYWJsZUFjdGlvbnMnKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGF2YWlsYWJsZUFjdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZhaWxhYmxlQWN0aW9uc1tpXSBpbiBPcmRlclN0YXR1czJJc1JlYWR5KSByZXR1cm4gdGhpcy5wZXJmb3JtT3JkZXJBY3Rpb24oYXZhaWxhYmxlQWN0aW9uc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXJyb3JzLnRocm93T25PYmplY3QodGhpcywgJ09SREVSX0NBTk5PVF9TVUJNSVQnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzQ29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhT3JkZXJTdGF0dXMySXNDb21wbGV0ZVt0aGlzLnByb3AoJ3N0YXR1cycpXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyIsInZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9kZWZhdWx0Jyk7XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYWRkVG9XaXNobGlzdDogZnVuY3Rpb24gKHBheWxvYWQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGxpc3QgPSB0aGlzLmFwaS5jcmVhdGVTeW5jKCd3aXNobGlzdCcsIHsgY3VzdG9tZXJBY2NvdW50SWQ6IHBheWxvYWQuY3VzdG9tZXJBY2NvdW50SWQgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3QuZ2V0T3JDcmVhdGUoKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXJyb3JzLnBhc3NGcm9tKGxpc3QsIHNlbGYpO1xyXG4gICAgICAgICAgICByZXR1cm4gbGlzdC5hZGRJdGVtKHtcclxuICAgICAgICAgICAgICAgIHF1YW50aXR5OiBwYXlsb2FkLnF1YW50aXR5LFxyXG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiBwYXlsb2FkLmN1cnJlbmN5Q29kZSB8fCBzZWxmLmFwaS5jb250ZXh0LkN1cnJlbmN5KCksXHJcbiAgICAgICAgICAgICAgICBsb2NhbGVDb2RlOiBwYXlsb2FkLmxvY2FsZUNvZGUgfHwgc2VsZi5hcGkuY29udGV4dC5Mb2NhbGUoKSxcclxuICAgICAgICAgICAgICAgIHByb2R1Y3Q6IHNlbGYuZGF0YVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBhZGRUb0NhcnRGb3JQaWNrdXA6IGZ1bmN0aW9uIChvcHRzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVG9DYXJ0KHV0aWxzLmV4dGVuZCh7fSwgdGhpcy5kYXRhLCB7XHJcbiAgICAgICAgICAgIGZ1bGZpbGxtZW50TWV0aG9kOiBDT05TVEFOVFMuRlVMRklMTE1FTlRfTUVUSE9EUy5QSUNLVVBcclxuICAgICAgICB9LCBvcHRzKSk7XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRTaGlwcGluZ01ldGhvZHNGcm9tQ29udGFjdDogZnVuY3Rpb24gKGNvbnRhY3QpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHNlbGYudXBkYXRlKHsgZnVsZmlsbG1lbnRDb250YWN0OiBzZWxmLnByb3AoJ2Z1bGZpbGxtZW50Q29udGFjdCcpIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRTaGlwcGluZ01ldGhvZHMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHBvc3Rjb25zdHJ1Y3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5vbignc3luYycsIGZ1bmN0aW9uIChqc29uKSB7XHJcbiAgICAgICAgICAgIGlmIChqc29uICYmIGpzb24uYXV0aFRpY2tldCAmJiBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBpLmNvbnRleHQuVXNlckNsYWltcyhqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcGkuZmlyZSgnbG9naW4nLCBqc29uLmF1dGhUaWNrZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlQW5kTG9naW46IGZ1bmN0aW9uKHBheWxvYWQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCFwYXlsb2FkKSBwYXlsb2FkID0gdGhpcy5kYXRhO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShwYXlsb2FkKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYubG9naW4oe1xyXG4gICAgICAgICAgICAgICAgZW1haWxBZGRyZXNzOiBwYXlsb2FkLmVtYWlsQWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXlsb2FkLnBhc3N3b3JkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZVdpdGhDdXN0b21lcjogZnVuY3Rpb24gKHBheWxvYWQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQW5kTG9naW4ocGF5bG9hZCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmFwaS5hY3Rpb24oJ2N1c3RvbWVyJywgJ2NyZWF0ZScsIHtcclxuICAgICAgICAgICAgICAgIHVzZXJJZDogc2VsZi5wcm9wKCdpZCcpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoY3VzdG9tZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1c3RvbWVyLmFkZENvbnRhY3Qoe1xyXG4gICAgICAgICAgICAgICAgZW1haWw6IHNlbGYucHJvcCgnZW1haWxBZGRyZXNzJyksXHJcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHNlbGYucHJvcCgnZmlyc3ROYW1lJyksXHJcbiAgICAgICAgICAgICAgICBsYXN0TmFtZU9yU3VybmFtZTogc2VsZi5wcm9wKCdsYXN0TmFtZScpLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzczoge31cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07IiwidmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycycpLFxyXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICBlcnJvcnMucmVnaXN0ZXIoe1xyXG4gICAgICAgICdOT19JVEVNU19JTl9XSVNITElTVCc6ICdObyBpdGVtcyBpbiB3aXNobGlzdC4nLFxyXG4gICAgICAgICdOT19NQVRDSElOR19JVEVNX0lOX1dJU0hMSVNUJzogJ05vIHdpc2hsaXN0IGl0ZW0gbWF0Y2hpbmcgSUQgezB9J1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGdldEl0ZW0gPSBmdW5jdGlvbiAobGlzdCwgaXRlbSkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IGxpc3QucHJvcCgnaXRlbXMnKTtcclxuICAgICAgICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JzLnRocm93T25PYmplY3QobGlzdCwgJ05PX0lURU1TX0lOX1dJU0hMSVNUJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gaXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtc1tpXS5pZCA9PT0gaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcnMudGhyb3dPbk9iamVjdChsaXN0LCAnTk9fTUFUQ0hJTkdfSVRFTV9JTl9XSVNITElTVCcsIGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0T3JDcmVhdGU6IGZ1bmN0aW9uIChjaWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KHsgY3VzdG9tZXJBY2NvdW50SWQ6IGNpZCB9KS50aGVuKGZ1bmN0aW9uIChsaXN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdDtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY3JlYXRlRGVmYXVsdCh7IGN1c3RvbWVyQWNjb3VudElkOiBjaWQgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkSXRlbVRvQ2FydEJ5SWQ6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZEl0ZW1Ub0NhcnQoZ2V0SXRlbSh0aGlzLCBpdGVtKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gb3ZlcnJpZGluZyBnZXQgdG8gYWx3YXlzIHVzZSBnZXRJdGVtc0J5TmFtZSB0byBnZXQgdGhlIGl0ZW1zIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAgLy8gc28gaXRlbXMgYXJlIGFsd2F5cyBzb3J0ZWQgYnkgdXBkYXRlIGRhdGVcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJdGVtc0J5TmFtZSgpLnRoZW4oZnVuY3Rpb24gKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnByb3AoJ2l0ZW1zJywgaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKCdzeW5jJywgc2VsZi5kYXRhLCBzZWxmKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTsvLyBCRUdJTiBVVElMU1xyXG4vLyBNYW55IG9mIHRoZXNlIHBvYWNoZWQgZnJvbSBsb2Rhc2hcclxuXHJcbiAgICB2YXIgbWF4RmxhdHRlbkRlcHRoID0gMjA7XHJcblxyXG4gICAgdmFyIE1pY3JvRXZlbnQgPSByZXF1aXJlKCdtaWNyb2V2ZW50Jyk7XHJcbiAgICB2YXIgaXNOb2RlID0gdHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2Vzcy50aXRsZSA9PT0gXCJub2RlXCI7XHJcbiAgICB2YXIgWEhSO1xyXG4gICAgdmFyIElmcmFtZVhIUjtcclxuICAgIHZhciBnZXRYSFIgPSBpc05vZGUgPyBmdW5jdGlvbigpIHtcclxuICAgICAgICBYSFIgPSBYSFIgfHwgcmVxdWlyZSgneG1saHR0cHJlcXVlc3QnKS5YTUxIdHRwUmVxdWVzdDtcclxuICAgICAgICByZXR1cm4gbmV3IFhIUigpO1xyXG4gICAgfSA6ICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QgPyBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB9IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG4gICAgfSk7XHJcbiAgICB2YXIgdXRpbHMgPSB7XHJcbiAgICAgICAgZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBzcmMsIGNvcHksIG5hbWUsIG9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBhcmd1bWVudHNbMF0sXHJcbiAgICAgICAgICAgICAgICBpID0gMSxcclxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICBpZiAoKG9wdGlvbnMgPSBhcmd1bWVudHNbaV0pICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChuYW1lIGluIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29weSA9IG9wdGlvbnNbbmFtZV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IGNvcHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29weSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBjb3B5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9uZTogZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpOyAvLyBjaGVhcCBjb3B5IDopXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmbGF0dGVuOiBmdW5jdGlvbiAob2JqLCBpbnRvLCBwcmVmaXgsIHNlcGFyYXRvciwgZGVwdGgpIHtcclxuICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB0aHJvdyBcIkNhbm5vdCBmbGF0dGVuIGNpcmN1bGFyIG9iamVjdC5cIjtcclxuICAgICAgICAgICAgaWYgKCFkZXB0aCkgZGVwdGggPSBtYXhGbGF0dGVuRGVwdGg7XHJcbiAgICAgICAgICAgIGludG8gPSBpbnRvIHx8IHt9O1xyXG4gICAgICAgICAgICBzZXBhcmF0b3IgPSBzZXBhcmF0b3IgfHwgXCIuXCI7XHJcbiAgICAgICAgICAgIHByZWZpeCA9IHByZWZpeCB8fCAnJztcclxuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IG47XHJcbiAgICAgICAgICAgICAgICB2YWwgPSBvYmpbbl07XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmICEoXHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWwgaW5zdGFuY2VvZiBBcnJheSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsIGluc3RhbmNlb2YgRGF0ZSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsIGluc3RhbmNlb2YgUmVnRXhwKVxyXG4gICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5mbGF0dGVuKHZhbC50b0pTT04gPyB2YWwudG9KU09OKCkgOiB2YWwsIGludG8sIHByZWZpeCArIGtleSArIHNlcGFyYXRvciwgc2VwYXJhdG9yLCAtLWRlcHRoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludG9bcHJlZml4ICsga2V5XSA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpbnRvO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5oZXJpdDogZnVuY3Rpb24gKHBhcmVudCwgbW9yZSkge1xyXG4gICAgICAgICAgICB2YXIgQXBpSW5oZXJpdGVkT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0KSB0aGlzLmNvbnN0cnVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wb3N0Y29uc3RydWN0KSB0aGlzLnBvc3Rjb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgQXBpSW5oZXJpdGVkT2JqZWN0LnByb3RvdHlwZSA9IHV0aWxzLmV4dGVuZChuZXcgcGFyZW50KCksIG1vcmUpO1xyXG4gICAgICAgICAgICByZXR1cm4gQXBpSW5oZXJpdGVkT2JqZWN0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFwOiBmdW5jdGlvbiAoYXJyLCBmbiwgc2NvcGUpIHtcclxuICAgICAgICAgICAgdmFyIG5ld0FyciA9IFtdLCBsZW4gPSBhcnIubGVuZ3RoO1xyXG4gICAgICAgICAgICBzY29wZSA9IHNjb3BlIHx8IHdpbmRvdztcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbmV3QXJyW2ldID0gZm4uY2FsbChzY29wZSwgYXJyW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3QXJyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVkdWNlOiBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgYWNjdW11bGF0b3IpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gLTEsXHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yID0gY2FsbGJhY2soYWNjdW11bGF0b3IsIGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2xpY2U6IGZ1bmN0aW9uKGFycmF5TGlrZU9iaiwgaXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycmF5TGlrZU9iaiwgaXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5kZXhPZjogKGZ1bmN0aW9uKG5hdGl2ZUluZGV4T2YpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChuYXRpdmVJbmRleE9mICYmIHR5cGVvZiBuYXRpdmVJbmRleE9mID09PSBcImZ1bmN0aW9uXCIpID8gZnVuY3Rpb24oYXJyLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuYXRpdmVJbmRleE9mLmNhbGwoYXJyLCB2YWwpO1xyXG4gICAgICAgICAgICB9IDogZnVuY3Rpb24gKGFyciwgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IHZhbCkgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfShBcnJheS5wcm90b3R5cGUuaW5kZXhPZikpLFxyXG4gICAgICAgIGZvcm1hdFN0cmluZzogZnVuY3Rpb24odHB0KSB7XHJcbiAgICAgICAgICAgIHZhciBmb3JtYXR0ZWQgPSB0cHQsIG90aGVyQXJncyA9IHV0aWxzLnNsaWNlKGFyZ3VtZW50cywgMSk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBvdGhlckFyZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGZvcm1hdHRlZCA9IGZvcm1hdHRlZC5zcGxpdCgneycgKyBpICsgJ30nKS5qb2luKG90aGVyQXJnc1tpXSB8fCAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdHRlZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldE9wOiBmdW5jdGlvbihwcm90bywgZm5OYW1lKSB7XHJcbiAgICAgICAgICAgIHByb3RvW2ZuTmFtZV0gPSBmdW5jdGlvbiAoY29uZikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBpLmFjdGlvbih0aGlzLCBmbk5hbWUsIGNvbmYpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VHlwZTogKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHJlVHlwZSA9IC9cXFtvYmplY3QgKFxcdyspXFxdLztcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0aGluZykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gcmVUeXBlLmV4ZWMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaW5nKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2hbMV07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSgpKSxcclxuICAgICAgICBjYW1lbENhc2U6IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciByZGFzaEFscGhhID0gLy0oW1xcZGEtel0pL2dpLFxyXG4gICAgICAgICAgICAgICAgY2NjYiA9IGZ1bmN0aW9uIChtYXRjaCwgbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHN0ciwgZmlyc3RDYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoZmlyc3RDYXAgPyBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc3Vic3RyaW5nKDEpIDogc3RyKS5yZXBsYWNlKHJkYXNoQWxwaGEsIGNjY2IpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSksXHJcblxyXG4gICAgICAgIGRhc2hDYXNlOiAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcmNhc2UgPSAvKFthLXpdKShbQS1aXSkvZyxcclxuICAgICAgICAgICAgICAgIHJzdHIgPSBcIiQxLSQyXCI7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmNhc2UsIHJzdHIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSgpKSxcclxuXHJcbiAgICAgICAgcmVxdWVzdDogZnVuY3Rpb24gKG1ldGhvZCwgdXJsLCBoZWFkZXJzLCBkYXRhLCBzdWNjZXNzLCBmYWlsdXJlLCBpZnJhbWVQYXRoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdmFyIHhocjtcclxuICAgICAgICAgICAgaWYgKGlmcmFtZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgIElmcmFtZVhIUiA9IElmcmFtZVhIUiB8fCByZXF1aXJlKCcuL2lmcmFtZXhocicpO1xyXG4gICAgICAgICAgICAgICAgeGhyID0gbmV3IElmcmFtZVhIUihpZnJhbWVQYXRoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHhociA9IGdldFhIUigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgZmFpbHVyZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgdGltZWQgb3V0LicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiAnVElNRU9VVCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH0sIHhocik7XHJcbiAgICAgICAgICAgIH0sIDYwMDAwKTtcclxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIganNvbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5yZXNwb25zZVRleHQgJiYgeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJVbmFibGUgdG8gcGFyc2UgcmVzcG9uc2U6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6ICdVTktOT1dOJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgeGhyLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCB8fCB4aHIuc3RhdHVzID09PSAzMDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyhqc29uLCB4aHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmUoanNvbiB8fCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgZmFpbGVkLCBubyByZXNwb25zZSBnaXZlbi4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiB4aHIuc3RhdHVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB4aHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgeGhyLm9wZW4obWV0aG9kIHx8ICdHRVQnLCB1cmwpO1xyXG4gICAgICAgICAgICBpZiAoaGVhZGVycykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaCBpbiBoZWFkZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWRlcnNbaF0pIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGgsIGhlYWRlcnNbaF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgeGhyLnNlbmQobWV0aG9kICE9PSAnR0VUJyAmJiBkYXRhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHhocjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwaXBlbGluZTogZnVuY3Rpb24gKHRhc2tzIC8qIGluaXRpYWxBcmdzLi4uICovKSB7XHJcbiAgICAgICAgICAgIC8vIFNlbGYtb3B0aW1pemluZyBmdW5jdGlvbiB0byBydW4gZmlyc3QgdGFzayB3aXRoIG11bHRpcGxlXHJcbiAgICAgICAgICAgIC8vIGFyZ3MgdXNpbmcgYXBwbHksIGJ1dCBzdWJzZXF1ZW5jZSB0YXNrcyB2aWEgZGlyZWN0IGludm9jYXRpb25cclxuICAgICAgICAgICAgdmFyIHJ1blRhc2sgPSBmdW5jdGlvbiAoYXJncywgdGFzaykge1xyXG4gICAgICAgICAgICAgICAgcnVuVGFzayA9IGZ1bmN0aW9uIChhcmcsIHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzayhhcmcpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB1dGlscy53aGVuLmFsbChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKS50aGVuKGZ1bmN0aW9uIChhcmdzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXRpbHMud2hlbi5yZWR1Y2UodGFza3MsIGZ1bmN0aW9uIChhcmcsIHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVuVGFzayhhcmcsIHRhc2spO1xyXG4gICAgICAgICAgICAgICAgfSwgYXJncyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHdoZW46IHJlcXVpcmUoJ3doZW4nKSxcclxuICAgICAgICB1cml0ZW1wbGF0ZTogcmVxdWlyZSgndXJpdGVtcGxhdGUnKSxcclxuXHJcbiAgICAgICAgYWRkRXZlbnRzOiBmdW5jdGlvbiAoY3Rvcikge1xyXG4gICAgICAgICAgICBNaWNyb0V2ZW50Lm1peGluKGN0b3IpO1xyXG4gICAgICAgICAgICBjdG9yLnByb3RvdHlwZS5vbiA9IGN0b3IucHJvdG90eXBlLmJpbmQ7XHJcbiAgICAgICAgICAgIGN0b3IucHJvdG90eXBlLm9mZiA9IGN0b3IucHJvdG90eXBlLnVuYmluZDtcclxuICAgICAgICAgICAgY3Rvci5wcm90b3R5cGUuZmlyZSA9IGN0b3IucHJvdG90eXBlLnRyaWdnZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV0aWxzO1xyXG4vLyBFTkQgVVRJTFNcclxuXHJcbi8qKioqKioqKiovIl19
(19)
});
