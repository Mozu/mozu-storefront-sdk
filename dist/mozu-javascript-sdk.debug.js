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
module.exports = (function (window, document, undefined) {

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

}(window, document));
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL21pY3JvZXZlbnQvbWljcm9ldmVudC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL25vZGVfbW9kdWxlcy91cml0ZW1wbGF0ZS9iaW4vdXJpdGVtcGxhdGUuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi9tb25pdG9yL2FnZ3JlZ2F0b3IuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi9tb25pdG9yL2FycmF5LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9jb25zb2xlLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9sb2dnZXIvY29uc29sZUdyb3VwLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9zaW1wbGVGb3JtYXR0ZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi9tb25pdG9yL3NpbXBsZVJlcG9ydGVyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vbW9uaXRvci9zdGFja0ZpbHRlci5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL25vZGVfbW9kdWxlcy93aGVuL21vbml0b3IvdGhyb3R0bGVkUmVwb3J0ZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvd2hlbi93aGVuLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2NvbGxlY3Rpb24uanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvY29uc3RhbnRzL2RlZmF1bHQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvY29udGV4dC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9lcnJvcnMuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvaWZyYW1leGhyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2luaXQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvaW5pdF9kZWJ1Zy5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9pbnRlcmZhY2UuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvbWV0aG9kcy5qc29uIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL29iamVjdC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9yZWZlcmVuY2UuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdHlwZXMvY2FydC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9jYXJ0c3VtbWFyeS5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9jcmVkaXRjYXJkLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL2N1c3RvbWVyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL2xvY2F0aW9ucy5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9sb2dpbi5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9vcmRlci5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9wcm9kdWN0LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL3NoaXBtZW50LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL3VzZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdHlwZXMvd2lzaGxpc3QuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcjNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIi8qKlxuICogTWljcm9FdmVudCAtIHRvIG1ha2UgYW55IGpzIG9iamVjdCBhbiBldmVudCBlbWl0dGVyIChzZXJ2ZXIgb3IgYnJvd3NlcilcbiAqIFxuICogLSBwdXJlIGphdmFzY3JpcHQgLSBzZXJ2ZXIgY29tcGF0aWJsZSwgYnJvd3NlciBjb21wYXRpYmxlXG4gKiAtIGRvbnQgcmVseSBvbiB0aGUgYnJvd3NlciBkb21zXG4gKiAtIHN1cGVyIHNpbXBsZSAtIHlvdSBnZXQgaXQgaW1tZWRpYXRseSwgbm8gbWlzdGVyeSwgbm8gbWFnaWMgaW52b2x2ZWRcbiAqXG4gKiAtIGNyZWF0ZSBhIE1pY3JvRXZlbnREZWJ1ZyB3aXRoIGdvb2RpZXMgdG8gZGVidWdcbiAqICAgLSBtYWtlIGl0IHNhZmVyIHRvIHVzZVxuKi9cblxudmFyIE1pY3JvRXZlbnRcdD0gZnVuY3Rpb24oKXt9XG5NaWNyb0V2ZW50LnByb3RvdHlwZVx0PSB7XG5cdGJpbmRcdDogZnVuY3Rpb24oZXZlbnQsIGZjdCl7XG5cdFx0dGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0gPSB0aGlzLl9ldmVudHNbZXZlbnRdXHR8fCBbXTtcblx0XHR0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goZmN0KTtcblx0fSxcblx0dW5iaW5kXHQ6IGZ1bmN0aW9uKGV2ZW50LCBmY3Qpe1xuXHRcdHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcblx0XHRpZiggZXZlbnQgaW4gdGhpcy5fZXZlbnRzID09PSBmYWxzZSAgKVx0cmV0dXJuO1xuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0uc3BsaWNlKHRoaXMuX2V2ZW50c1tldmVudF0uaW5kZXhPZihmY3QpLCAxKTtcblx0fSxcblx0dHJpZ2dlclx0OiBmdW5jdGlvbihldmVudCAvKiAsIGFyZ3MuLi4gKi8pe1xuXHRcdHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcblx0XHRpZiggZXZlbnQgaW4gdGhpcy5fZXZlbnRzID09PSBmYWxzZSAgKVx0cmV0dXJuO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLl9ldmVudHNbZXZlbnRdLmxlbmd0aDsgaSsrKXtcblx0XHRcdHRoaXMuX2V2ZW50c1tldmVudF1baV0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogbWl4aW4gd2lsbCBkZWxlZ2F0ZSBhbGwgTWljcm9FdmVudC5qcyBmdW5jdGlvbiBpbiB0aGUgZGVzdGluYXRpb24gb2JqZWN0XG4gKlxuICogLSByZXF1aXJlKCdNaWNyb0V2ZW50JykubWl4aW4oRm9vYmFyKSB3aWxsIG1ha2UgRm9vYmFyIGFibGUgdG8gdXNlIE1pY3JvRXZlbnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdGhlIG9iamVjdCB3aGljaCB3aWxsIHN1cHBvcnQgTWljcm9FdmVudFxuKi9cbk1pY3JvRXZlbnQubWl4aW5cdD0gZnVuY3Rpb24oZGVzdE9iamVjdCl7XG5cdHZhciBwcm9wc1x0PSBbJ2JpbmQnLCAndW5iaW5kJywgJ3RyaWdnZXInXTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSArKyl7XG5cdFx0ZGVzdE9iamVjdC5wcm90b3R5cGVbcHJvcHNbaV1dXHQ9IE1pY3JvRXZlbnQucHJvdG90eXBlW3Byb3BzW2ldXTtcblx0fVxufVxuXG4vLyBleHBvcnQgaW4gY29tbW9uIGpzXG5pZiggdHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiAoJ2V4cG9ydHMnIGluIG1vZHVsZSkpe1xuXHRtb2R1bGUuZXhwb3J0c1x0PSBNaWNyb0V2ZW50XG59XG4iLCJ2YXIgZ2xvYmFsPXR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fTsvKmdsb2JhbCB1bmVzY2FwZSwgbW9kdWxlLCBkZWZpbmUsIHdpbmRvdywgZ2xvYmFsKi9cclxuXHJcbi8qXHJcbiBVcmlUZW1wbGF0ZSBDb3B5cmlnaHQgKGMpIDIwMTItMjAxMyBGcmFueiBBbnRlc2Jlcmdlci4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuIEF2YWlsYWJsZSB2aWEgdGhlIE1JVCBsaWNlbnNlLlxyXG4qL1xyXG5cclxuKGZ1bmN0aW9uIChleHBvcnRDYWxsYmFjaykge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVXJpVGVtcGxhdGVFcnJvciA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gVXJpVGVtcGxhdGVFcnJvciAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgVXJpVGVtcGxhdGVFcnJvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKEpTT04gJiYgSlNPTi5zdHJpbmdpZnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIFVyaVRlbXBsYXRlRXJyb3I7XHJcbn0oKSk7XHJcblxyXG52YXIgb2JqZWN0SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIGlzQXJyYXkgKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzU3RyaW5nICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGlzTnVtYmVyICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgTnVtYmVyXSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGlzQm9vbGVhbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZnVuY3Rpb24gam9pbiAoYXJyLCBzZXBhcmF0b3IpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gJycsXHJcbiAgICAgICAgICAgIGZpcnN0ID0gdHJ1ZSxcclxuICAgICAgICAgICAgaW5kZXg7XHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgYXJyLmxlbmd0aDsgaW5kZXggKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoZmlyc3QpIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc2VwYXJhdG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBhcnJbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1hcCAoYXJyLCBtYXBwZXIpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gW10sXHJcbiAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICBmb3IgKDsgaW5kZXggPCBhcnIubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1hcHBlcihhcnJbaW5kZXhdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmlsdGVyIChhcnIsIHByZWRpY2F0ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSBbXSxcclxuICAgICAgICAgICAgaW5kZXggPSAwO1xyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGFyci5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJbaW5kZXhdKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYXJyW2luZGV4XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZWVwRnJlZXplVXNpbmdPYmplY3RGcmVlemUgKG9iamVjdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSBcIm9iamVjdFwiIHx8IG9iamVjdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBPYmplY3QuZnJlZXplKG9iamVjdCk7XHJcbiAgICAgICAgdmFyIHByb3BlcnR5LCBwcm9wZXJ0eU5hbWU7XHJcbiAgICAgICAgZm9yIChwcm9wZXJ0eU5hbWUgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydHkgPSBvYmplY3RbcHJvcGVydHlOYW1lXTtcclxuICAgICAgICAgICAgICAgIC8vIGJlIGF3YXJlLCBhcnJheXMgYXJlICdvYmplY3QnLCB0b29cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWVwRnJlZXplKHByb3BlcnR5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlZXBGcmVlemUgKG9iamVjdCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgT2JqZWN0LmZyZWV6ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVlcEZyZWV6ZVVzaW5nT2JqZWN0RnJlZXplKG9iamVjdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNBcnJheTogaXNBcnJheSxcclxuICAgICAgICBpc1N0cmluZzogaXNTdHJpbmcsXHJcbiAgICAgICAgaXNOdW1iZXI6IGlzTnVtYmVyLFxyXG4gICAgICAgIGlzQm9vbGVhbjogaXNCb29sZWFuLFxyXG4gICAgICAgIGpvaW46IGpvaW4sXHJcbiAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgZmlsdGVyOiBmaWx0ZXIsXHJcbiAgICAgICAgZGVlcEZyZWV6ZTogZGVlcEZyZWV6ZVxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbnZhciBjaGFySGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBpc0FscGhhIChjaHIpIHtcclxuICAgICAgICByZXR1cm4gKGNociA+PSAnYScgJiYgY2hyIDw9ICd6JykgfHwgKChjaHIgPj0gJ0EnICYmIGNociA8PSAnWicpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0RpZ2l0IChjaHIpIHtcclxuICAgICAgICByZXR1cm4gY2hyID49ICcwJyAmJiBjaHIgPD0gJzknO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzSGV4RGlnaXQgKGNocikge1xyXG4gICAgICAgIHJldHVybiBpc0RpZ2l0KGNocikgfHwgKGNociA+PSAnYScgJiYgY2hyIDw9ICdmJykgfHwgKGNociA+PSAnQScgJiYgY2hyIDw9ICdGJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc0FscGhhOiBpc0FscGhhLFxyXG4gICAgICAgIGlzRGlnaXQ6IGlzRGlnaXQsXHJcbiAgICAgICAgaXNIZXhEaWdpdDogaXNIZXhEaWdpdFxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbnZhciBwY3RFbmNvZGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB1dGY4ID0ge1xyXG4gICAgICAgIGVuY29kZTogZnVuY3Rpb24gKGNocikge1xyXG4gICAgICAgICAgICAvLyBzZWUgaHR0cDovL2VjbWFuYXV0LmJsb2dzcG90LmRlLzIwMDYvMDcvZW5jb2RpbmctZGVjb2RpbmctdXRmOC1pbi1qYXZhc2NyaXB0Lmh0bWxcclxuICAgICAgICAgICAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjaHIpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bUJ5dGVzOiBmdW5jdGlvbiAoZmlyc3RDaGFyQ29kZSkge1xyXG4gICAgICAgICAgICBpZiAoZmlyc3RDaGFyQ29kZSA8PSAweDdGKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgweEMyIDw9IGZpcnN0Q2hhckNvZGUgJiYgZmlyc3RDaGFyQ29kZSA8PSAweERGKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgweEUwIDw9IGZpcnN0Q2hhckNvZGUgJiYgZmlyc3RDaGFyQ29kZSA8PSAweEVGKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICgweEYwIDw9IGZpcnN0Q2hhckNvZGUgJiYgZmlyc3RDaGFyQ29kZSA8PSAweEY0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBubyB2YWxpZCBmaXJzdCBvY3RldFxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzVmFsaWRGb2xsb3dpbmdDaGFyQ29kZTogZnVuY3Rpb24gKGNoYXJDb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAweDgwIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IDB4QkY7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuY29kZXMgYSBjaGFyYWN0ZXIsIGlmIG5lZWRlZCBvciBub3QuXHJcbiAgICAgKiBAcGFyYW0gY2hyXHJcbiAgICAgKiBAcmV0dXJuIHBjdC1lbmNvZGVkIGNoYXJhY3RlclxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBlbmNvZGVDaGFyYWN0ZXIgKGNocikge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSAnJyxcclxuICAgICAgICAgICAgb2N0ZXRzID0gdXRmOC5lbmNvZGUoY2hyKSxcclxuICAgICAgICAgICAgb2N0ZXQsXHJcbiAgICAgICAgICAgIGluZGV4O1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IG9jdGV0cy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgb2N0ZXQgPSBvY3RldHMuY2hhckNvZGVBdChpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSAnJScgKyAob2N0ZXQgPCAweDEwID8gJzAnIDogJycpICsgb2N0ZXQudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zLCB3aGV0aGVyIHRoZSBnaXZlbiB0ZXh0IGF0IHN0YXJ0IGlzIGluIHRoZSBmb3JtICdwZXJjZW50IGhleC1kaWdpdCBoZXgtZGlnaXQnLCBsaWtlICclM0YnXHJcbiAgICAgKiBAcGFyYW0gdGV4dFxyXG4gICAgICogQHBhcmFtIHN0YXJ0XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufCp8Kn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNQZXJjZW50RGlnaXREaWdpdCAodGV4dCwgc3RhcnQpIHtcclxuICAgICAgICByZXR1cm4gdGV4dC5jaGFyQXQoc3RhcnQpID09PSAnJScgJiYgY2hhckhlbHBlci5pc0hleERpZ2l0KHRleHQuY2hhckF0KHN0YXJ0ICsgMSkpICYmIGNoYXJIZWxwZXIuaXNIZXhEaWdpdCh0ZXh0LmNoYXJBdChzdGFydCArIDIpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlcyBhIGhleCBudW1iZXIgZnJvbSBzdGFydCB3aXRoIGxlbmd0aCAyLlxyXG4gICAgICogQHBhcmFtIHRleHQgYSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBzdGFydCB0aGUgc3RhcnQgaW5kZXggb2YgdGhlIDItZGlnaXQgaGV4IG51bWJlclxyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZUhleDIgKHRleHQsIHN0YXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRleHQuc3Vic3RyKHN0YXJ0LCAyKSwgMTYpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gY2hhciBzZXF1ZW5jZSBpcyBhIGNvcnJlY3RseSBwY3QtZW5jb2RlZCBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBjaHJcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzUGN0RW5jb2RlZCAoY2hyKSB7XHJcbiAgICAgICAgaWYgKCFpc1BlcmNlbnREaWdpdERpZ2l0KGNociwgMCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZmlyc3RDaGFyQ29kZSA9IHBhcnNlSGV4MihjaHIsIDEpO1xyXG4gICAgICAgIHZhciBudW1CeXRlcyA9IHV0ZjgubnVtQnl0ZXMoZmlyc3RDaGFyQ29kZSk7XHJcbiAgICAgICAgaWYgKG51bUJ5dGVzID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgYnl0ZU51bWJlciA9IDE7IGJ5dGVOdW1iZXIgPCBudW1CeXRlczsgYnl0ZU51bWJlciArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNQZXJjZW50RGlnaXREaWdpdChjaHIsIDMqYnl0ZU51bWJlcikgfHwgIXV0ZjguaXNWYWxpZEZvbGxvd2luZ0NoYXJDb2RlKHBhcnNlSGV4MihjaHIsIDMqYnl0ZU51bWJlciArIDEpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZHMgYXMgbXVjaCBhcyBuZWVkZWQgZnJvbSB0aGUgdGV4dCwgZS5nLiAnJTIwJyBvciAnJUMzJUI2Jy4gSXQgZG9lcyBub3QgZGVjb2RlIVxyXG4gICAgICogQHBhcmFtIHRleHRcclxuICAgICAqIEBwYXJhbSBzdGFydEluZGV4XHJcbiAgICAgKiBAcmV0dXJuIHRoZSBjaGFyYWN0ZXIgb3IgcGN0LXN0cmluZyBvZiB0aGUgdGV4dCBhdCBzdGFydEluZGV4XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBjdENoYXJBdCh0ZXh0LCBzdGFydEluZGV4KSB7XHJcbiAgICAgICAgdmFyIGNociA9IHRleHQuY2hhckF0KHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgIGlmICghaXNQZXJjZW50RGlnaXREaWdpdCh0ZXh0LCBzdGFydEluZGV4KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2hyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdXRmOENoYXJDb2RlID0gcGFyc2VIZXgyKHRleHQsIHN0YXJ0SW5kZXggKyAxKTtcclxuICAgICAgICB2YXIgbnVtQnl0ZXMgPSB1dGY4Lm51bUJ5dGVzKHV0ZjhDaGFyQ29kZSk7XHJcbiAgICAgICAgaWYgKG51bUJ5dGVzID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjaHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGJ5dGVOdW1iZXIgPSAxOyBieXRlTnVtYmVyIDwgbnVtQnl0ZXM7IGJ5dGVOdW1iZXIgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzUGVyY2VudERpZ2l0RGlnaXQodGV4dCwgc3RhcnRJbmRleCArIDMgKiBieXRlTnVtYmVyKSB8fCAhdXRmOC5pc1ZhbGlkRm9sbG93aW5nQ2hhckNvZGUocGFyc2VIZXgyKHRleHQsIHN0YXJ0SW5kZXggKyAzICogYnl0ZU51bWJlciArIDEpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNocjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGV4dC5zdWJzdHIoc3RhcnRJbmRleCwgMyAqIG51bUJ5dGVzKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGVuY29kZUNoYXJhY3RlcjogZW5jb2RlQ2hhcmFjdGVyLFxyXG4gICAgICAgIGlzUGN0RW5jb2RlZDogaXNQY3RFbmNvZGVkLFxyXG4gICAgICAgIHBjdENoYXJBdDogcGN0Q2hhckF0XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxudmFyIHJmY0NoYXJIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiBhbiBjaGFyYWN0ZXIgaXMgYW4gdmFyY2hhciBjaGFyYWN0ZXIgYWNjb3JkaW5nIDIuMyBvZiByZmMgNjU3MFxyXG4gICAgICogQHBhcmFtIGNoclxyXG4gICAgICogQHJldHVybiAoQm9vbGVhbilcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNWYXJjaGFyIChjaHIpIHtcclxuICAgICAgICByZXR1cm4gY2hhckhlbHBlci5pc0FscGhhKGNocikgfHwgY2hhckhlbHBlci5pc0RpZ2l0KGNocikgfHwgY2hyID09PSAnXycgfHwgcGN0RW5jb2Rlci5pc1BjdEVuY29kZWQoY2hyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgY2hyIGlzIGFuIHVucmVzZXJ2ZWQgY2hhcmFjdGVyIGFjY29yZGluZyAxLjUgb2YgcmZjIDY1NzBcclxuICAgICAqIEBwYXJhbSBjaHJcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVW5yZXNlcnZlZCAoY2hyKSB7XHJcbiAgICAgICAgcmV0dXJuIGNoYXJIZWxwZXIuaXNBbHBoYShjaHIpIHx8IGNoYXJIZWxwZXIuaXNEaWdpdChjaHIpIHx8IGNociA9PT0gJy0nIHx8IGNociA9PT0gJy4nIHx8IGNociA9PT0gJ18nIHx8IGNociA9PT0gJ34nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiBjaHIgaXMgYW4gcmVzZXJ2ZWQgY2hhcmFjdGVyIGFjY29yZGluZyAxLjUgb2YgcmZjIDY1NzBcclxuICAgICAqIG9yIHRoZSBwZXJjZW50IGNoYXJhY3RlciBtZW50aW9uZWQgaW4gMy4yLjEuXHJcbiAgICAgKiBAcGFyYW0gY2hyXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1Jlc2VydmVkIChjaHIpIHtcclxuICAgICAgICByZXR1cm4gY2hyID09PSAnOicgfHwgY2hyID09PSAnLycgfHwgY2hyID09PSAnPycgfHwgY2hyID09PSAnIycgfHwgY2hyID09PSAnWycgfHwgY2hyID09PSAnXScgfHwgY2hyID09PSAnQCcgfHwgY2hyID09PSAnIScgfHwgY2hyID09PSAnJCcgfHwgY2hyID09PSAnJicgfHwgY2hyID09PSAnKCcgfHxcclxuICAgICAgICAgICAgY2hyID09PSAnKScgfHwgY2hyID09PSAnKicgfHwgY2hyID09PSAnKycgfHwgY2hyID09PSAnLCcgfHwgY2hyID09PSAnOycgfHwgY2hyID09PSAnPScgfHwgY2hyID09PSBcIidcIjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzVmFyY2hhcjogaXNWYXJjaGFyLFxyXG4gICAgICAgIGlzVW5yZXNlcnZlZDogaXNVbnJlc2VydmVkLFxyXG4gICAgICAgIGlzUmVzZXJ2ZWQ6IGlzUmVzZXJ2ZWRcclxuICAgIH07XHJcblxyXG59KCkpO1xyXG5cclxuLyoqXHJcbiAqIGVuY29kaW5nIG9mIHJmYyA2NTcwXHJcbiAqL1xyXG52YXIgZW5jb2RpbmdIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZSAodGV4dCwgcGFzc1Jlc2VydmVkKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnLFxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgY2hyID0gJyc7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0ZXh0ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB0ZXh0ID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0ZXh0Lmxlbmd0aDsgaW5kZXggKz0gY2hyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjaHIgPSB0ZXh0LmNoYXJBdChpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSByZmNDaGFySGVscGVyLmlzVW5yZXNlcnZlZChjaHIpIHx8IChwYXNzUmVzZXJ2ZWQgJiYgcmZjQ2hhckhlbHBlci5pc1Jlc2VydmVkKGNocikpID8gY2hyIDogcGN0RW5jb2Rlci5lbmNvZGVDaGFyYWN0ZXIoY2hyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGVQYXNzUmVzZXJ2ZWQgKHRleHQpIHtcclxuICAgICAgICByZXR1cm4gZW5jb2RlKHRleHQsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZUxpdGVyYWxDaGFyYWN0ZXIgKGxpdGVyYWwsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIGNociA9IHBjdEVuY29kZXIucGN0Q2hhckF0KGxpdGVyYWwsIGluZGV4KTtcclxuICAgICAgICBpZiAoY2hyLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNocjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZmNDaGFySGVscGVyLmlzUmVzZXJ2ZWQoY2hyKSB8fCByZmNDaGFySGVscGVyLmlzVW5yZXNlcnZlZChjaHIpID8gY2hyIDogcGN0RW5jb2Rlci5lbmNvZGVDaGFyYWN0ZXIoY2hyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlTGl0ZXJhbCAobGl0ZXJhbCkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSAnJyxcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIGNociA9ICcnO1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGxpdGVyYWwubGVuZ3RoOyBpbmRleCArPSBjaHIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNociA9IHBjdEVuY29kZXIucGN0Q2hhckF0KGxpdGVyYWwsIGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKGNoci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gY2hyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHJmY0NoYXJIZWxwZXIuaXNSZXNlcnZlZChjaHIpIHx8IHJmY0NoYXJIZWxwZXIuaXNVbnJlc2VydmVkKGNocikgPyBjaHIgOiBwY3RFbmNvZGVyLmVuY29kZUNoYXJhY3RlcihjaHIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICBlbmNvZGVQYXNzUmVzZXJ2ZWQ6IGVuY29kZVBhc3NSZXNlcnZlZCxcclxuICAgICAgICBlbmNvZGVMaXRlcmFsOiBlbmNvZGVMaXRlcmFsLFxyXG4gICAgICAgIGVuY29kZUxpdGVyYWxDaGFyYWN0ZXI6IGVuY29kZUxpdGVyYWxDaGFyYWN0ZXJcclxuICAgIH07XHJcblxyXG59KCkpO1xyXG5cclxuXHJcbi8vIHRoZSBvcGVyYXRvcnMgZGVmaW5lZCBieSByZmMgNjU3MFxyXG52YXIgb3BlcmF0b3JzID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXJcclxuICAgICAgICBieVN5bWJvbCA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZSAoc3ltYm9sKSB7XHJcbiAgICAgICAgYnlTeW1ib2xbc3ltYm9sXSA9IHtcclxuICAgICAgICAgICAgc3ltYm9sOiBzeW1ib2wsXHJcbiAgICAgICAgICAgIHNlcGFyYXRvcjogKHN5bWJvbCA9PT0gJz8nKSA/ICcmJyA6IChzeW1ib2wgPT09ICcnIHx8IHN5bWJvbCA9PT0gJysnIHx8IHN5bWJvbCA9PT0gJyMnKSA/ICcsJyA6IHN5bWJvbCxcclxuICAgICAgICAgICAgbmFtZWQ6IHN5bWJvbCA9PT0gJzsnIHx8IHN5bWJvbCA9PT0gJyYnIHx8IHN5bWJvbCA9PT0gJz8nLFxyXG4gICAgICAgICAgICBpZkVtcHR5OiAoc3ltYm9sID09PSAnJicgfHwgc3ltYm9sID09PSAnPycpID8gJz0nIDogJycsXHJcbiAgICAgICAgICAgIGZpcnN0OiAoc3ltYm9sID09PSAnKycgKSA/ICcnIDogc3ltYm9sLFxyXG4gICAgICAgICAgICBlbmNvZGU6IChzeW1ib2wgPT09ICcrJyB8fCBzeW1ib2wgPT09ICcjJykgPyBlbmNvZGluZ0hlbHBlci5lbmNvZGVQYXNzUmVzZXJ2ZWQgOiBlbmNvZGluZ0hlbHBlci5lbmNvZGUsXHJcbiAgICAgICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2w7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZSgnJyk7XHJcbiAgICBjcmVhdGUoJysnKTtcclxuICAgIGNyZWF0ZSgnIycpO1xyXG4gICAgY3JlYXRlKCcuJyk7XHJcbiAgICBjcmVhdGUoJy8nKTtcclxuICAgIGNyZWF0ZSgnOycpO1xyXG4gICAgY3JlYXRlKCc/Jyk7XHJcbiAgICBjcmVhdGUoJyYnKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsdWVPZjogZnVuY3Rpb24gKGNocikge1xyXG4gICAgICAgICAgICBpZiAoYnlTeW1ib2xbY2hyXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5U3ltYm9sW2Nocl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKFwiPSwhQHxcIi5pbmRleE9mKGNocikgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGJ5U3ltYm9sWycnXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBEZXRlY3RzLCB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCBpcyBkZWZpbmVkIGluIHRoZSBzZW5zZSBvZiByZmMgNjU3MFxyXG4gKiBTZWN0aW9uIDIuMyBvZiB0aGUgUkZDIG1ha2VzIGNsZWFyIGRlZmludGlvbnM6XHJcbiAqICogdW5kZWZpbmVkIGFuZCBudWxsIGFyZSBub3QgZGVmaW5lZC5cclxuICogKiB0aGUgZW1wdHkgc3RyaW5nIGlzIGRlZmluZWRcclxuICogKiBhbiBhcnJheSAoXCJsaXN0XCIpIGlzIGRlZmluZWQsIGlmIGl0IGlzIG5vdCBlbXB0eSAoZXZlbiBpZiBhbGwgZWxlbWVudHMgYXJlIG5vdCBkZWZpbmVkKVxyXG4gKiAqIGFuIG9iamVjdCAoXCJtYXBcIikgaXMgZGVmaW5lZCwgaWYgaXQgY29udGFpbnMgYXQgbGVhc3Qgb25lIHByb3BlcnR5IHdpdGggZGVmaW5lZCB2YWx1ZVxyXG4gKiBAcGFyYW0gb2JqZWN0XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBpc0RlZmluZWQgKG9iamVjdCkge1xyXG4gICAgdmFyXHJcbiAgICAgICAgcHJvcGVydHlOYW1lO1xyXG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCB8fCBvYmplY3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChvYmplY3RIZWxwZXIuaXNBcnJheShvYmplY3QpKSB7XHJcbiAgICAgICAgLy8gU2VjdGlvbiAyLjM6IEEgdmFyaWFibGUgZGVmaW5lZCBhcyBhIGxpc3QgdmFsdWUgaXMgY29uc2lkZXJlZCB1bmRlZmluZWQgaWYgdGhlIGxpc3QgY29udGFpbnMgemVybyBtZW1iZXJzXHJcbiAgICAgICAgcmV0dXJuIG9iamVjdC5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2Ygb2JqZWN0ID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgIC8vIGZhbHN5IHZhbHVlcyBsaWtlIGVtcHR5IHN0cmluZ3MsIGZhbHNlIG9yIDAgYXJlIFwiZGVmaW5lZFwiXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvLyBlbHNlIE9iamVjdFxyXG4gICAgZm9yIChwcm9wZXJ0eU5hbWUgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpICYmIGlzRGVmaW5lZChvYmplY3RbcHJvcGVydHlOYW1lXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG52YXIgTGl0ZXJhbEV4cHJlc3Npb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGl0ZXJhbEV4cHJlc3Npb24gKGxpdGVyYWwpIHtcclxuICAgICAgICB0aGlzLmxpdGVyYWwgPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKGxpdGVyYWwpO1xyXG4gICAgfVxyXG5cclxuICAgIExpdGVyYWxFeHByZXNzaW9uLnByb3RvdHlwZS5leHBhbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGl0ZXJhbDtcclxuICAgIH07XHJcblxyXG4gICAgTGl0ZXJhbEV4cHJlc3Npb24ucHJvdG90eXBlLnRvU3RyaW5nID0gTGl0ZXJhbEV4cHJlc3Npb24ucHJvdG90eXBlLmV4cGFuZDtcclxuXHJcbiAgICByZXR1cm4gTGl0ZXJhbEV4cHJlc3Npb247XHJcbn0oKSk7XHJcblxyXG52YXIgcGFyc2UgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlRXhwcmVzc2lvbiAoZXhwcmVzc2lvblRleHQpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgb3BlcmF0b3IsXHJcbiAgICAgICAgICAgIHZhcnNwZWNzID0gW10sXHJcbiAgICAgICAgICAgIHZhcnNwZWMgPSBudWxsLFxyXG4gICAgICAgICAgICB2YXJuYW1lU3RhcnQgPSBudWxsLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGhTdGFydCA9IG51bGwsXHJcbiAgICAgICAgICAgIGluZGV4LFxyXG4gICAgICAgICAgICBjaHIgPSAnJztcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xvc2VWYXJuYW1lICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhcm5hbWUgPSBleHByZXNzaW9uVGV4dC5zdWJzdHJpbmcodmFybmFtZVN0YXJ0LCBpbmRleCk7XHJcbiAgICAgICAgICAgIGlmICh2YXJuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJhIHZhcm5hbWUgbXVzdCBiZSBzcGVjaWZpZWRcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyc3BlYyA9IHt2YXJuYW1lOiB2YXJuYW1lLCBleHBsb2RlZDogZmFsc2UsIG1heExlbmd0aDogbnVsbH07XHJcbiAgICAgICAgICAgIHZhcm5hbWVTdGFydCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjbG9zZU1heExlbmd0aCAoKSB7XHJcbiAgICAgICAgICAgIGlmIChtYXhMZW5ndGhTdGFydCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYWZ0ZXIgYSAnOicgeW91IGhhdmUgdG8gc3BlY2lmeSB0aGUgbGVuZ3RoXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhcnNwZWMubWF4TGVuZ3RoID0gcGFyc2VJbnQoZXhwcmVzc2lvblRleHQuc3Vic3RyaW5nKG1heExlbmd0aFN0YXJ0LCBpbmRleCksIDEwKTtcclxuICAgICAgICAgICAgbWF4TGVuZ3RoU3RhcnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3BlcmF0b3IgPSAoZnVuY3Rpb24gKG9wZXJhdG9yVGV4dCkge1xyXG4gICAgICAgICAgICB2YXIgb3AgPSBvcGVyYXRvcnMudmFsdWVPZihvcGVyYXRvclRleHQpO1xyXG4gICAgICAgICAgICBpZiAob3AgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiaWxsZWdhbCB1c2Ugb2YgcmVzZXJ2ZWQgb3BlcmF0b3JcIiwgcG9zaXRpb246IGluZGV4LCBvcGVyYXRvcjogb3BlcmF0b3JUZXh0fSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG9wO1xyXG4gICAgICAgIH0oZXhwcmVzc2lvblRleHQuY2hhckF0KDApKSk7XHJcbiAgICAgICAgaW5kZXggPSBvcGVyYXRvci5zeW1ib2wubGVuZ3RoO1xyXG5cclxuICAgICAgICB2YXJuYW1lU3RhcnQgPSBpbmRleDtcclxuXHJcbiAgICAgICAgZm9yICg7IGluZGV4IDwgZXhwcmVzc2lvblRleHQubGVuZ3RoOyBpbmRleCArPSBjaHIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNociA9IHBjdEVuY29kZXIucGN0Q2hhckF0KGV4cHJlc3Npb25UZXh0LCBpbmRleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodmFybmFtZVN0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3BlYyBzYXlzOiB2YXJuYW1lID0gIHZhcmNoYXIgKiggW1wiLlwiXSB2YXJjaGFyIClcclxuICAgICAgICAgICAgICAgIC8vIHNvIGEgZG90IGlzIGFsbG93ZWQgZXhjZXB0IGZvciB0aGUgZmlyc3QgY2hhclxyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJy4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhcm5hbWVTdGFydCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJhIHZhcm5hbWUgTVVTVCBOT1Qgc3RhcnQgd2l0aCBhIGRvdFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocmZjQ2hhckhlbHBlci5pc1ZhcmNoYXIoY2hyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2xvc2VWYXJuYW1lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1heExlbmd0aFN0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IG1heExlbmd0aFN0YXJ0ICYmIGNociA9PT0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJBIDpwcmVmaXggbXVzdCBub3Qgc3RhcnQgd2l0aCBkaWdpdCAwXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJIZWxwZXIuaXNEaWdpdChjaHIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IC0gbWF4TGVuZ3RoU3RhcnQgPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcIkEgOnByZWZpeCBtdXN0IGhhdmUgbWF4IDQgZGlnaXRzXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNsb3NlTWF4TGVuZ3RoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNociA9PT0gJzonKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFyc3BlYy5tYXhMZW5ndGggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcIm9ubHkgb25lIDptYXhMZW5ndGggaXMgYWxsb3dlZCBwZXIgdmFyc3BlY1wiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjLmV4cGxvZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJhbiBleHBsb2VkZWQgdmFyc3BlYyBNVVNUIE5PVCBiZSB2YXJzcGVjZWRcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGhTdGFydCA9IGluZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaHIgPT09ICcqJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhcnNwZWMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcImV4cGxvZGVkIHdpdGhvdXQgdmFyc3BlY1wiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjLmV4cGxvZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJleHBsb2RlZCB0d2ljZVwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjLm1heExlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYW4gZXhwbG9kZSAoKikgTVVTVCBOT1QgZm9sbG93IHRvIGEgcHJlZml4XCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyc3BlYy5leHBsb2RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0aGUgb25seSBsZWdhbCBjaGFyYWN0ZXIgbm93IGlzIHRoZSBjb21tYVxyXG4gICAgICAgICAgICBpZiAoY2hyID09PSAnLCcpIHtcclxuICAgICAgICAgICAgICAgIHZhcnNwZWNzLnB1c2godmFyc3BlYyk7XHJcbiAgICAgICAgICAgICAgICB2YXJzcGVjID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhcm5hbWVTdGFydCA9IGluZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiaWxsZWdhbCBjaGFyYWN0ZXJcIiwgY2hhcmFjdGVyOiBjaHIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgIH0gLy8gZm9yIGNoclxyXG4gICAgICAgIGlmICh2YXJuYW1lU3RhcnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2xvc2VWYXJuYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXhMZW5ndGhTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjbG9zZU1heExlbmd0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXJzcGVjcy5wdXNoKHZhcnNwZWMpO1xyXG4gICAgICAgIHJldHVybiBuZXcgVmFyaWFibGVFeHByZXNzaW9uKGV4cHJlc3Npb25UZXh0LCBvcGVyYXRvciwgdmFyc3BlY3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlICh1cmlUZW1wbGF0ZVRleHQpIHtcclxuICAgICAgICAvLyBhc3NlcnQgZmlsbGVkIHN0cmluZ1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgY2hyLFxyXG4gICAgICAgICAgICBleHByZXNzaW9ucyA9IFtdLFxyXG4gICAgICAgICAgICBicmFjZU9wZW5JbmRleCA9IG51bGwsXHJcbiAgICAgICAgICAgIGxpdGVyYWxTdGFydCA9IDA7XHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdXJpVGVtcGxhdGVUZXh0Lmxlbmd0aDsgaW5kZXggKz0gMSkge1xyXG4gICAgICAgICAgICBjaHIgPSB1cmlUZW1wbGF0ZVRleHQuY2hhckF0KGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKGxpdGVyYWxTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJ30nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcInVub3BlbmVkIGJyYWNlIGNsb3NlZFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaHIgPT09ICd7Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXRlcmFsU3RhcnQgPCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9ucy5wdXNoKG5ldyBMaXRlcmFsRXhwcmVzc2lvbih1cmlUZW1wbGF0ZVRleHQuc3Vic3RyaW5nKGxpdGVyYWxTdGFydCwgaW5kZXgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxpdGVyYWxTdGFydCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJhY2VPcGVuSW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYnJhY2VPcGVuSW5kZXggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIGhlcmUganVzdCB7IGlzIGZvcmJpZGRlblxyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJ3snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcImJyYWNlIGFscmVhZHkgb3BlbmVkXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNociA9PT0gJ30nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJyYWNlT3BlbkluZGV4ICsgMSA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcImVtcHR5IGJyYWNlc1wiLCBwb3NpdGlvbjogYnJhY2VPcGVuSW5kZXh9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbnMucHVzaChwYXJzZUV4cHJlc3Npb24odXJpVGVtcGxhdGVUZXh0LnN1YnN0cmluZyhicmFjZU9wZW5JbmRleCArIDEsIGluZGV4KSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yLnByb3RvdHlwZSA9PT0gVXJpVGVtcGxhdGVFcnJvci5wcm90b3R5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHt0ZW1wbGF0ZVRleHQ6IHVyaVRlbXBsYXRlVGV4dCwgbWVzc2FnZTogZXJyb3Iub3B0aW9ucy5tZXNzYWdlLCBwb3NpdGlvbjogYnJhY2VPcGVuSW5kZXggKyBlcnJvci5vcHRpb25zLnBvc2l0aW9uLCBkZXRhaWxzOiBlcnJvci5vcHRpb25zfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyYWNlT3BlbkluZGV4ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBsaXRlcmFsU3RhcnQgPSBpbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlYWNoZWQgdW5yZWFjaGFibGUgY29kZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnJhY2VPcGVuSW5kZXggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe3RlbXBsYXRlVGV4dDogdXJpVGVtcGxhdGVUZXh0LCBtZXNzYWdlOiBcInVuY2xvc2VkIGJyYWNlXCIsIHBvc2l0aW9uOiBicmFjZU9wZW5JbmRleH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGl0ZXJhbFN0YXJ0IDwgdXJpVGVtcGxhdGVUZXh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBleHByZXNzaW9ucy5wdXNoKG5ldyBMaXRlcmFsRXhwcmVzc2lvbih1cmlUZW1wbGF0ZVRleHQuc3Vic3RyKGxpdGVyYWxTdGFydCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBVcmlUZW1wbGF0ZSh1cmlUZW1wbGF0ZVRleHQsIGV4cHJlc3Npb25zKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGFyc2U7XHJcbn0oKSk7XHJcblxyXG52YXIgVmFyaWFibGVFeHByZXNzaW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIGhlbHBlciBmdW5jdGlvbiBpZiBKU09OIGlzIG5vdCBhdmFpbGFibGVcclxuICAgIGZ1bmN0aW9uIHByZXR0eVByaW50ICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiAoSlNPTiAmJiBKU09OLnN0cmluZ2lmeSkgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgOiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0VtcHR5ICh2YWx1ZSkge1xyXG4gICAgICAgIGlmICghaXNEZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc1N0cmluZyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc051bWJlcih2YWx1ZSkgfHwgb2JqZWN0SGVscGVyLmlzQm9vbGVhbih2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2JqZWN0SGVscGVyLmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiB2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByb3BlcnR5QXJyYXkgKG9iamVjdCkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSBbXSxcclxuICAgICAgICAgICAgcHJvcGVydHlOYW1lO1xyXG4gICAgICAgIGZvciAocHJvcGVydHlOYW1lIGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtuYW1lOiBwcm9wZXJ0eU5hbWUsIHZhbHVlOiBvYmplY3RbcHJvcGVydHlOYW1lXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gVmFyaWFibGVFeHByZXNzaW9uICh0ZW1wbGF0ZVRleHQsIG9wZXJhdG9yLCB2YXJzcGVjcykge1xyXG4gICAgICAgIHRoaXMudGVtcGxhdGVUZXh0ID0gdGVtcGxhdGVUZXh0O1xyXG4gICAgICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcclxuICAgICAgICB0aGlzLnZhcnNwZWNzID0gdmFyc3BlY3M7XHJcbiAgICB9XHJcblxyXG4gICAgVmFyaWFibGVFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVRleHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGV4cGFuZFNpbXBsZVZhbHVlKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKG9wZXJhdG9yLm5hbWVkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKHZhcnNwZWMudmFybmFtZSk7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBvcGVyYXRvci5pZkVtcHR5O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gJz0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFyc3BlYy5tYXhMZW5ndGggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMCwgdmFyc3BlYy5tYXhMZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQgKz0gb3BlcmF0b3IuZW5jb2RlKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHZhbHVlRGVmaW5lZCAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGlzRGVmaW5lZChuYW1lVmFsdWUudmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGV4cGFuZE5vdEV4cGxvZGVkKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBhcnIgPSBbXSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgaWYgKG9wZXJhdG9yLm5hbWVkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKHZhcnNwZWMudmFybmFtZSk7XHJcbiAgICAgICAgICAgIGlmIChpc0VtcHR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IG9wZXJhdG9yLmlmRW1wdHk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSAnPSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvYmplY3RIZWxwZXIuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgYXJyID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCBpc0RlZmluZWQpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgb3BlcmF0b3IuZW5jb2RlKTtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IG9iamVjdEhlbHBlci5qb2luKGFyciwgJywnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFyciA9IHByb3BlcnR5QXJyYXkodmFsdWUpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIuZmlsdGVyKGFyciwgdmFsdWVEZWZpbmVkKTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLm1hcChhcnIsIGZ1bmN0aW9uIChuYW1lVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRvci5lbmNvZGUobmFtZVZhbHVlLm5hbWUpICsgJywnICsgb3BlcmF0b3IuZW5jb2RlKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gb2JqZWN0SGVscGVyLmpvaW4oYXJyLCAnLCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGV4cGFuZEV4cGxvZGVkTmFtZWQgKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBpc0FycmF5ID0gb2JqZWN0SGVscGVyLmlzQXJyYXkodmFsdWUpLFxyXG4gICAgICAgICAgICBhcnIgPSBbXTtcclxuICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICBhcnIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIGlzRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBmdW5jdGlvbiAobGlzdEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBlbmNvZGluZ0hlbHBlci5lbmNvZGVMaXRlcmFsKHZhcnNwZWMudmFybmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShsaXN0RWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gb3BlcmF0b3IuaWZFbXB0eTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtcCArPSAnPScgKyBvcGVyYXRvci5lbmNvZGUobGlzdEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRtcDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhcnIgPSBwcm9wZXJ0eUFycmF5KHZhbHVlKTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIHZhbHVlRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBmdW5jdGlvbiAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gZW5jb2RpbmdIZWxwZXIuZW5jb2RlTGl0ZXJhbChuYW1lVmFsdWUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShuYW1lVmFsdWUudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG1wICs9IG9wZXJhdG9yLmlmRW1wdHk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gJz0nICsgb3BlcmF0b3IuZW5jb2RlKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG1wO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdEhlbHBlci5qb2luKGFyciwgb3BlcmF0b3Iuc2VwYXJhdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmRFeHBsb2RlZFVubmFtZWQgKG9wZXJhdG9yLCB2YWx1ZSkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBhcnIgPSBbXSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICBhcnIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIGlzRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBvcGVyYXRvci5lbmNvZGUpO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gb2JqZWN0SGVscGVyLmpvaW4oYXJyLCBvcGVyYXRvci5zZXBhcmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXJyID0gcHJvcGVydHlBcnJheSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCBmdW5jdGlvbiAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNEZWZpbmVkKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgZnVuY3Rpb24gKG5hbWVWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmVuY29kZShuYW1lVmFsdWUubmFtZSkgKyAnPScgKyBvcGVyYXRvci5lbmNvZGUobmFtZVZhbHVlLnZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBvYmplY3RIZWxwZXIuam9pbihhcnIsIG9wZXJhdG9yLnNlcGFyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIFZhcmlhYmxlRXhwcmVzc2lvbi5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24gKHZhcmlhYmxlcykge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICBleHBhbmRlZCA9IFtdLFxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgdmFyc3BlYyxcclxuICAgICAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgICAgIHZhbHVlSXNBcnIsXHJcbiAgICAgICAgICAgIG9uZUV4cGxvZGVkID0gZmFsc2UsXHJcbiAgICAgICAgICAgIG9wZXJhdG9yID0gdGhpcy5vcGVyYXRvcjtcclxuXHJcbiAgICAgICAgLy8gZXhwYW5kIGVhY2ggdmFyc3BlYyBhbmQgam9pbiB3aXRoIG9wZXJhdG9yJ3Mgc2VwYXJhdG9yXHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGhpcy52YXJzcGVjcy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyc3BlYyA9IHRoaXMudmFyc3BlY3NbaW5kZXhdO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHZhcmlhYmxlc1t2YXJzcGVjLnZhcm5hbWVdO1xyXG4gICAgICAgICAgICAvLyBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgLy8gaWYgKHZhcmlhYmxlcy5oYXNPd25Qcm9wZXJ0eSh2YXJzcGVjLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFyc3BlYy5leHBsb2RlZCkge1xyXG4gICAgICAgICAgICAgICAgb25lRXhwbG9kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhbHVlSXNBcnIgPSBvYmplY3RIZWxwZXIuaXNBcnJheSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAgICAgICAgIGV4cGFuZGVkLnB1c2goZXhwYW5kU2ltcGxlVmFsdWUodmFyc3BlYywgb3BlcmF0b3IsIHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodmFyc3BlYy5tYXhMZW5ndGggJiYgaXNEZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gMi40LjEgb2YgdGhlIHNwZWMgc2F5czogXCJQcmVmaXggbW9kaWZpZXJzIGFyZSBub3QgYXBwbGljYWJsZSB0byB2YXJpYWJsZXMgdGhhdCBoYXZlIGNvbXBvc2l0ZSB2YWx1ZXMuXCJcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJlZml4IG1vZGlmaWVycyBhcmUgbm90IGFwcGxpY2FibGUgdG8gdmFyaWFibGVzIHRoYXQgaGF2ZSBjb21wb3NpdGUgdmFsdWVzLiBZb3UgdHJpZWQgdG8gZXhwYW5kICcgKyB0aGlzICsgXCIgd2l0aCBcIiArIHByZXR0eVByaW50KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIXZhcnNwZWMuZXhwbG9kZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvci5uYW1lZCB8fCAhaXNFbXB0eSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRlZC5wdXNoKGV4cGFuZE5vdEV4cGxvZGVkKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvci5uYW1lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkLnB1c2goZXhwYW5kRXhwbG9kZWROYW1lZCh2YXJzcGVjLCBvcGVyYXRvciwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkLnB1c2goZXhwYW5kRXhwbG9kZWRVbm5hbWVkKG9wZXJhdG9yLCB2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXhwYW5kZWQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmZpcnN0ICsgb2JqZWN0SGVscGVyLmpvaW4oZXhwYW5kZWQsIG9wZXJhdG9yLnNlcGFyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gVmFyaWFibGVFeHByZXNzaW9uO1xyXG59KCkpO1xyXG5cclxudmFyIFVyaVRlbXBsYXRlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFVyaVRlbXBsYXRlICh0ZW1wbGF0ZVRleHQsIGV4cHJlc3Npb25zKSB7XHJcbiAgICAgICAgdGhpcy50ZW1wbGF0ZVRleHQgPSB0ZW1wbGF0ZVRleHQ7XHJcbiAgICAgICAgdGhpcy5leHByZXNzaW9ucyA9IGV4cHJlc3Npb25zO1xyXG4gICAgICAgIG9iamVjdEhlbHBlci5kZWVwRnJlZXplKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIFVyaVRlbXBsYXRlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVRleHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFVyaVRlbXBsYXRlLnByb3RvdHlwZS5leHBhbmQgPSBmdW5jdGlvbiAodmFyaWFibGVzKSB7XHJcbiAgICAgICAgLy8gdGhpcy5leHByZXNzaW9ucy5tYXAoZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtyZXR1cm4gZXhwcmVzc2lvbi5leHBhbmQodmFyaWFibGVzKTt9KS5qb2luKCcnKTtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZXhwcmVzc2lvbnMubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSB0aGlzLmV4cHJlc3Npb25zW2luZGV4XS5leHBhbmQodmFyaWFibGVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcblxyXG4gICAgVXJpVGVtcGxhdGUucGFyc2UgPSBwYXJzZTtcclxuICAgIFVyaVRlbXBsYXRlLlVyaVRlbXBsYXRlRXJyb3IgPSBVcmlUZW1wbGF0ZUVycm9yO1xyXG4gICAgcmV0dXJuIFVyaVRlbXBsYXRlO1xyXG59KCkpO1xyXG5cclxuICAgIGV4cG9ydENhbGxiYWNrKFVyaVRlbXBsYXRlKTtcclxuXHJcbn0oZnVuY3Rpb24gKFVyaVRlbXBsYXRlKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy8gZXhwb3J0IFVyaVRlbXBsYXRlLCB3aGVuIG1vZHVsZSBpcyBwcmVzZW50LCBvciBwYXNzIGl0IHRvIHdpbmRvdyBvciBnbG9iYWxcclxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IFVyaVRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgZGVmaW5lKFtdLGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFVyaVRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICB3aW5kb3cuVXJpVGVtcGxhdGUgPSBVcmlUZW1wbGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdsb2JhbC5VcmlUZW1wbGF0ZSA9IFVyaVRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuKSk7XHJcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxMyBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuXG4vKipcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSBhdDpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogQGF1dGhvcjogQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3I6IEpvaG4gSGFublxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbigpIHtcblxuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlQWdncmVnYXRvcihyZXBvcnRlcikge1xuXHRcdHZhciBwcm9taXNlcywgbmV4dEtleTtcblxuXHRcdGZ1bmN0aW9uIFByb21pc2VTdGF0dXMocGFyZW50KSB7XG5cdFx0XHRpZighKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlU3RhdHVzKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2VTdGF0dXMocGFyZW50KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHN0YWNrSG9sZGVyO1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRzdGFja0hvbGRlciA9IGU7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMua2V5ID0gbmV4dEtleSsrO1xuXHRcdFx0cHJvbWlzZXNbdGhpcy5rZXldID0gdGhpcztcblxuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHR0aGlzLnRpbWVzdGFtcCA9ICsobmV3IERhdGUoKSk7XG5cdFx0XHR0aGlzLmNyZWF0ZWRBdCA9IHN0YWNrSG9sZGVyO1xuXHRcdH1cblxuXHRcdFByb21pc2VTdGF0dXMucHJvdG90eXBlID0ge1xuXHRcdFx0b2JzZXJ2ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYodGhpcy5rZXkgaW4gcHJvbWlzZXMpIHtcblx0XHRcdFx0XHRkZWxldGUgcHJvbWlzZXNbdGhpcy5rZXldO1xuXHRcdFx0XHRcdHJlcG9ydCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlU3RhdHVzKHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bGZpbGxlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZih0aGlzLmtleSBpbiBwcm9taXNlcykge1xuXHRcdFx0XHRcdGRlbGV0ZSBwcm9taXNlc1t0aGlzLmtleV07XG5cdFx0XHRcdFx0cmVwb3J0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRyZWplY3RlZDogZnVuY3Rpb24gKHJlYXNvbikge1xuXHRcdFx0XHR2YXIgc3RhY2tIb2xkZXI7XG5cblx0XHRcdFx0aWYodGhpcy5rZXkgaW4gcHJvbWlzZXMpIHtcblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IocmVhc29uICYmIHJlYXNvbi5tZXNzYWdlIHx8IHJlYXNvbik7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0c3RhY2tIb2xkZXIgPSBlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMucmVhc29uID0gcmVhc29uO1xuXHRcdFx0XHRcdHRoaXMucmVqZWN0ZWRBdCA9IHN0YWNrSG9sZGVyO1xuXHRcdFx0XHRcdHJlcG9ydCgpO1xuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmVzZXQoKTtcblxuXHRcdHJldHVybiBwdWJsaXNoKHsgcHVibGlzaDogcHVibGlzaCB9KTtcblxuXHRcdGZ1bmN0aW9uIHB1Ymxpc2godGFyZ2V0KSB7XG5cdFx0XHR0YXJnZXQuUHJvbWlzZVN0YXR1cyA9IFByb21pc2VTdGF0dXM7XG5cdFx0XHR0YXJnZXQucmVwb3J0VW5oYW5kbGVkID0gcmVwb3J0O1xuXHRcdFx0dGFyZ2V0LnJlc2V0VW5oYW5kbGVkID0gcmVzZXQ7XG5cdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlcG9ydCgpIHtcblx0XHRcdHJldHVybiByZXBvcnRlcihwcm9taXNlcyk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVzZXQoKSB7XG5cdFx0XHRuZXh0S2V5ID0gMDtcblx0XHRcdHByb21pc2VzID0ge307IC8vIFNob3VsZCBiZSBXZWFrTWFwXG5cdFx0fVxuXHR9O1xuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDEzIG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG5cbi8qKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIGF0OlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBAYXV0aG9yOiBCcmlhbiBDYXZhbGllclxuICogQGF1dGhvcjogSm9obiBIYW5uXG4gKi9cblxuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0Ly8gU2lsbHkgQXJyYXkgaGVscGVycywgc2luY2Ugd2hlbi5qcyBuZWVkcyB0byBiZVxuXHQvLyBiYWNrd2FyZCBjb21wYXRpYmxlIHRvIEVTM1xuXG5cdHJldHVybiB7XG5cdFx0Zm9yRWFjaDogZm9yRWFjaCxcblx0XHRyZWR1Y2U6IHJlZHVjZVxuXHR9O1xuXG5cdGZ1bmN0aW9uIGZvckVhY2goYXJyYXksIGYpIHtcblx0XHRpZih0eXBlb2YgYXJyYXkuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIGFycmF5LmZvckVhY2goZik7XG5cdFx0fVxuXG5cdFx0dmFyIGksIGxlbjtcblxuXHRcdGkgPSAtMTtcblx0XHRsZW4gPSBhcnJheS5sZW5ndGg7XG5cblx0XHR3aGlsZSgrK2kgPCBsZW4pIHtcblx0XHRcdGYoYXJyYXlbaV0sIGksIGFycmF5KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZWR1Y2UoYXJyYXksIGluaXRpYWwsIGYpIHtcblx0XHRpZih0eXBlb2YgYXJyYXkucmVkdWNlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXR1cm4gYXJyYXkucmVkdWNlKGYsIGluaXRpYWwpO1xuXHRcdH1cblxuXHRcdHZhciBpLCBsZW4sIHJlc3VsdDtcblxuXHRcdGkgPSAtMTtcblx0XHRsZW4gPSBhcnJheS5sZW5ndGg7XG5cdFx0cmVzdWx0ID0gaW5pdGlhbDtcblxuXHRcdHdoaWxlKCsraSA8IGxlbikge1xuXHRcdFx0cmVzdWx0ID0gZihyZXN1bHQsIGFycmF5W2ldLCBpLCBhcnJheSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDEzIG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG5cbi8qKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIGF0OlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBAYXV0aG9yOiBCcmlhbiBDYXZhbGllclxuICogQGF1dGhvcjogSm9obiBIYW5uXG4gKi9cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKHJlcXVpcmUpIHtcblxuXHR2YXIgY3JlYXRlQWdncmVnYXRvciwgdGhyb3R0bGVSZXBvcnRlciwgc2ltcGxlUmVwb3J0ZXIsIGFnZ3JlZ2F0b3IsXG5cdFx0Zm9ybWF0dGVyLCBzdGFja0ZpbHRlciwgZXhjbHVkZVJ4LCBmaWx0ZXIsIHJlcG9ydGVyLCBsb2dnZXIsXG5cdFx0cmVqZWN0aW9uTXNnLCByZWFzb25Nc2csIGZpbHRlcmVkRnJhbWVzTXNnLCBzdGFja0p1bXBNc2csIGF0dGFjaFBvaW50O1xuXG5cdGNyZWF0ZUFnZ3JlZ2F0b3IgPSByZXF1aXJlKCcuL2FnZ3JlZ2F0b3InKTtcblx0dGhyb3R0bGVSZXBvcnRlciA9IHJlcXVpcmUoJy4vdGhyb3R0bGVkUmVwb3J0ZXInKTtcblx0c2ltcGxlUmVwb3J0ZXIgPSByZXF1aXJlKCcuL3NpbXBsZVJlcG9ydGVyJyk7XG5cdGZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2ltcGxlRm9ybWF0dGVyJyk7XG5cdHN0YWNrRmlsdGVyID0gcmVxdWlyZSgnLi9zdGFja0ZpbHRlcicpO1xuXHRsb2dnZXIgPSByZXF1aXJlKCcuL2xvZ2dlci9jb25zb2xlR3JvdXAnKTtcblxuXHRyZWplY3Rpb25Nc2cgPSAnPT09IFVuaGFuZGxlZCByZWplY3Rpb24gZXNjYXBlZCBhdCA9PT0nO1xuXHRyZWFzb25Nc2cgPSAnPT09IENhdXNlZCBieSByZWFzb24gPT09Jztcblx0c3RhY2tKdW1wTXNnID0gJyAgLS0tIG5ldyBjYWxsIHN0YWNrIC0tLSc7XG5cdGZpbHRlcmVkRnJhbWVzTXNnID0gJyAgLi4uW2ZpbHRlcmVkIGZyYW1lc10uLi4nO1xuXG5cdGV4Y2x1ZGVSeCA9IC93aGVuXFwuanN8KG1vZHVsZXxub2RlKVxcLmpzOlxcZHx3aGVuXFwvbW9uaXRvclxcLy9pO1xuXHRmaWx0ZXIgPSBzdGFja0ZpbHRlcihleGNsdWRlLCBtZXJnZVByb21pc2VGcmFtZXMpO1xuXHRyZXBvcnRlciA9IHNpbXBsZVJlcG9ydGVyKGZvcm1hdHRlcihmaWx0ZXIsIHJlamVjdGlvbk1zZywgcmVhc29uTXNnLCBzdGFja0p1bXBNc2cpLCBsb2dnZXIpO1xuXG5cdGFnZ3JlZ2F0b3IgPSBjcmVhdGVBZ2dyZWdhdG9yKHRocm90dGxlUmVwb3J0ZXIoMjAwLCByZXBvcnRlcikpO1xuXG5cdGF0dGFjaFBvaW50ID0gdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnXG5cdFx0PyBhZ2dyZWdhdG9yLnB1Ymxpc2goY29uc29sZSlcblx0XHQ6IGFnZ3JlZ2F0b3I7XG5cblx0cmV0dXJuIGFnZ3JlZ2F0b3I7XG5cblx0ZnVuY3Rpb24gbWVyZ2VQcm9taXNlRnJhbWVzKC8qIGZyYW1lcyAqLykge1xuXHRcdHJldHVybiBmaWx0ZXJlZEZyYW1lc01zZztcblx0fVxuXG5cdGZ1bmN0aW9uIGV4Y2x1ZGUobGluZSkge1xuXHRcdHZhciByeCA9IGF0dGFjaFBvaW50LnByb21pc2VTdGFja0ZpbHRlciB8fCBleGNsdWRlUng7XG5cdFx0cmV0dXJuIHJ4LnRlc3QobGluZSk7XG5cdH1cblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3I6IEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yOiBKb2huIEhhbm5cbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24ocmVxdWlyZSkge1xuXHQvKmpzaGludCBtYXhjb21wbGV4aXR5OjcqL1xuXG5cdHZhciBhcnJheSwgd2Fybiwgd2FybkFsbCwgbG9nO1xuXG5cdGFycmF5ID0gcmVxdWlyZSgnLi4vYXJyYXknKTtcblxuXHRpZih0eXBlb2YgY29uc29sZSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQvLyBObyBjb25zb2xlLCBnaXZlIHVwLCBidXQgYXQgbGVhc3QgZG9uJ3QgYnJlYWtcblx0XHRsb2cgPSBjb25zb2xlTm90QXZhaWxhYmxlO1xuXHR9IGVsc2Uge1xuXHRcdGlmIChjb25zb2xlLndhcm4gJiYgY29uc29sZS5kaXIpIHtcblx0XHRcdC8vIFNlbnNpYmxlIGNvbnNvbGUgZm91bmQsIHVzZSBpdFxuXHRcdFx0d2FybiA9IGZ1bmN0aW9uICh4KSB7XG5cdFx0XHRcdGNvbnNvbGUud2Fybih4KTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIElFOCBoYXMgY29uc29sZS5sb2cgYW5kIEpTT04sIHNvIHdlIGNhbiBtYWtlIGFcblx0XHRcdC8vIHJlYXNvbmFibHkgdXNlZnVsIHdhcm4oKSBmcm9tIHRob3NlLlxuXHRcdFx0Ly8gQ3JlZGl0IHRvIHdlYnBybyAoaHR0cHM6Ly9naXRodWIuY29tL3dlYnBybykgZm9yIHRoaXMgaWRlYVxuXHRcdFx0aWYgKGNvbnNvbGUubG9nICYmIHR5cGVvZiBKU09OICE9ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHdhcm4gPSBmdW5jdGlvbiAoeCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHR5cGVvZiB4ID09PSAnc3RyaW5nJyA/IHggOiBKU09OLnN0cmluZ2lmeSh4KSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIXdhcm4pIHtcblx0XHRcdC8vIENvdWxkbid0IGZpbmQgYSBzdWl0YWJsZSBjb25zb2xlIGxvZ2dpbmcgZnVuY3Rpb25cblx0XHRcdC8vIEdpdmUgdXAgYW5kIGp1c3QgYmUgc2lsZW50XG5cdFx0XHRsb2cgPSBjb25zb2xlTm90QXZhaWxhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZihjb25zb2xlLmdyb3VwQ29sbGFwc2VkKSB7XG5cdFx0XHRcdHdhcm5BbGwgPSBmdW5jdGlvbihtc2csIGxpc3QpIHtcblx0XHRcdFx0XHRjb25zb2xlLmdyb3VwQ29sbGFwc2VkKG1zZyk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGFycmF5LmZvckVhY2gobGlzdCwgd2Fybik7XG5cdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR3YXJuQWxsID0gZnVuY3Rpb24obXNnLCBsaXN0KSB7XG5cdFx0XHRcdFx0d2Fybihtc2cpO1xuXHRcdFx0XHRcdHdhcm4obGlzdCk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGxvZyA9IGZ1bmN0aW9uKHJlamVjdGlvbnMpIHtcblx0XHRcdFx0aWYocmVqZWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0XHR3YXJuQWxsKCdbcHJvbWlzZXNdIFVuaGFuZGxlZCByZWplY3Rpb25zOiAnXG5cdFx0XHRcdFx0XHQrIHJlamVjdGlvbnMubGVuZ3RoLCByZWplY3Rpb25zKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3YXJuKCdbcHJvbWlzZXNdIEFsbCBwcmV2aW91c2x5IHVuaGFuZGxlZCByZWplY3Rpb25zIGhhdmUgbm93IGJlZW4gaGFuZGxlZCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIGxvZztcblxuXHRmdW5jdGlvbiBjb25zb2xlTm90QXZhaWxhYmxlKCkge31cblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3I6IEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yOiBKb2huIEhhbm5cbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5kZWZpbmUoZnVuY3Rpb24oKSB7XG5cblx0dmFyIGhhc1N0YWNrVHJhY2VzO1xuXG5cdHRyeSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRoYXNTdGFja1RyYWNlcyA9ICEhZS5zdGFjaztcblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbihmaWx0ZXJTdGFjaywgdW5oYW5kbGVkTXNnLCByZWFzb25Nc2csIHN0YWNrSnVtcE1zZykge1xuXHRcdHJldHVybiBmdW5jdGlvbiBmb3JtYXQocmVjKSB7XG5cdFx0XHR2YXIgY2F1c2UsIGZvcm1hdHRlZDtcblxuXHRcdFx0Zm9ybWF0dGVkID0ge1xuXHRcdFx0XHRyZWFzb246IHJlYy5yZWFzb24sXG5cdFx0XHRcdG1lc3NhZ2U6IHJlYy5yZWFzb24gJiYgcmVjLnJlYXNvbi50b1N0cmluZygpXG5cdFx0XHR9O1xuXG5cdFx0XHRpZihoYXNTdGFja1RyYWNlcykge1xuXHRcdFx0XHRjYXVzZSA9IHJlYy5yZWFzb24gJiYgcmVjLnJlYXNvbi5zdGFjaztcblx0XHRcdFx0aWYoIWNhdXNlKSB7XG5cdFx0XHRcdFx0Y2F1c2UgPSByZWMucmVqZWN0ZWRBdCAmJiByZWMucmVqZWN0ZWRBdC5zdGFjaztcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIganVtcHMgPSBmb3JtYXRTdGFja0p1bXBzKHJlYyk7XG5cdFx0XHRcdGZvcm1hdHRlZC5zdGFjayA9IHN0aXRjaChyZWMuY3JlYXRlZEF0LnN0YWNrLCBqdW1wcywgY2F1c2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm9ybWF0dGVkO1xuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBmb3JtYXRTdGFja0p1bXBzKHJlYykge1xuXHRcdFx0dmFyIGp1bXBzID0gW107XG5cblx0XHRcdHJlYyA9IHJlYy5wYXJlbnQ7XG5cdFx0XHR3aGlsZSAocmVjKSB7XG5cdFx0XHRcdGp1bXBzLnB1c2goZm9ybWF0U3RhY2tKdW1wKHJlYykpO1xuXHRcdFx0XHRyZWMgPSByZWMucGFyZW50O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ganVtcHM7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZm9ybWF0U3RhY2tKdW1wKHJlYykge1xuXHRcdFx0cmV0dXJuIGZpbHRlclN0YWNrKHRvQXJyYXkocmVjLmNyZWF0ZWRBdC5zdGFjaykuc2xpY2UoMSkpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHN0aXRjaChlc2NhcGVkLCBqdW1wcywgcmVqZWN0ZWQpIHtcblx0XHRcdGVzY2FwZWQgPSBmaWx0ZXJTdGFjayh0b0FycmF5KGVzY2FwZWQpKS5zbGljZSgxKTtcblx0XHRcdHJlamVjdGVkID0gZmlsdGVyU3RhY2sodG9BcnJheShyZWplY3RlZCkpO1xuXG5cdFx0XHRyZXR1cm4ganVtcHMucmVkdWNlKGZ1bmN0aW9uKHN0YWNrLCBqdW1wLCBpKSB7XG5cdFx0XHRcdHJldHVybiBpID8gc3RhY2suY29uY2F0KHN0YWNrSnVtcE1zZywganVtcCkgOiBzdGFjay5jb25jYXQoanVtcCk7XG5cdFx0XHR9LCBbdW5oYW5kbGVkTXNnXSkuY29uY2F0KHJlYXNvbk1zZywgcmVqZWN0ZWQpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRvQXJyYXkoc3RhY2spIHtcblx0XHRcdHJldHVybiBzdGFjayA/IHN0YWNrLnNwbGl0KCdcXG4nKSA6IFtdO1xuXHRcdH1cblx0fTtcblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsIi8qKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoYykgY29weXJpZ2h0IDIwMTAtMjAxMyBvcmlnaW5hbCBhdXRob3Igb3IgYXV0aG9ycyAqL1xuXG4vKipcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSBhdDpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogQGF1dGhvcjogQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3I6IEpvaG4gSGFublxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbigpIHtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHNpbXBsZSBwcm9taXNlIG1vbml0b3IgcmVwb3J0ZXIgdGhhdCBmaWx0ZXJzIG91dCBhbGxcblx0ICogYnV0IHVuaGFuZGxlZCByZWplY3Rpb25zLCBmb3JtYXRzIHRoZW0gdXNpbmcgdGhlIHN1cHBsaWVkXG5cdCAqIGZvcm1hdHRlciwgYW5kIHRoZW4gc2VuZHMgdGhlIHJlc3VsdHMgdG8gdGhlIHN1cHBsaWVkIGxvZ1xuXHQgKiBmdW5jdGlvbnNcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gZm9ybWF0IGZvcm1hdHMgYSBzaW5nbGUgcHJvbWlzZSBtb25pdG9yXG5cdCAqICByZWNvcmQgZm9yIG91dHB1dFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsb2cgbG9nZ2luZyBmdW5jdGlvbiB0byB3aGljaCBhbGwgdW5oYW5kbGVkXG5cdCAqICByZWplY3Rpb25zIHdpbGwgYmUgcGFzc2VkLlxuXHQgKiBAcmV0dXJuIHJlcG9ydGVyIGZ1bmN0aW9uc1xuXHQgKi9cblx0cmV0dXJuIGZ1bmN0aW9uIHNpbXBsZVJlcG9ydGVyKGZvcm1hdCwgbG9nKSB7XG5cdFx0dmFyIGxlbiA9IDA7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24ocHJvbWlzZXMpIHtcblx0XHRcdHByb21pc2VzID0gZmlsdGVyQW5kRm9ybWF0KGZvcm1hdCwgcHJvbWlzZXMpO1xuXG5cdFx0XHRpZiAobGVuID09PSAwICYmIHByb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGxvZyhwcm9taXNlcyk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRsZW4gPSBwcm9taXNlcy5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHRmdW5jdGlvbiBmaWx0ZXJBbmRGb3JtYXQoZm9ybWF0LCBwcm9taXNlcykge1xuXHRcdHZhciBrZXksIHJlYywgcmVqZWN0ZWQ7XG5cblx0XHRyZWplY3RlZCA9IFtdO1xuXG5cdFx0Zm9yKGtleSBpbiBwcm9taXNlcykge1xuXHRcdFx0cmVjID0gcHJvbWlzZXNba2V5XTtcblx0XHRcdGlmKHJlYy5yZWplY3RlZEF0KSB7XG5cdFx0XHRcdHJlamVjdGVkLnB1c2goZm9ybWF0KHJlYykpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZWplY3RlZDtcblx0fVxuXG59KTtcbn0odHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lIDogZnVuY3Rpb24oZmFjdG9yeSkgeyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgfSkpO1xuIiwiLyoqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChjKSBjb3B5cmlnaHQgMjAxMC0yMDEzIG9yaWdpbmFsIGF1dGhvciBvciBhdXRob3JzICovXG5cbi8qKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIGF0OlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBAYXV0aG9yOiBCcmlhbiBDYXZhbGllclxuICogQGF1dGhvcjogSm9obiBIYW5uXG4gKi9cbihmdW5jdGlvbihkZWZpbmUpIHsgJ3VzZSBzdHJpY3QnO1xuZGVmaW5lKGZ1bmN0aW9uKHJlcXVpcmUpIHtcblxuXHR2YXIgYXJyYXkgPSByZXF1aXJlKCcuL2FycmF5Jyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGlzRXhjbHVkZWQsIHJlcGxhY2UpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZmlsdGVyU3RhY2soc3RhY2spIHtcblx0XHRcdHZhciBleGNsdWRlZDtcblxuXHRcdFx0aWYoIShzdGFjayAmJiBzdGFjay5sZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdH1cblxuXHRcdFx0ZXhjbHVkZWQgPSBbXTtcblxuXHRcdFx0cmV0dXJuIGFycmF5LnJlZHVjZShzdGFjaywgW10sIGZ1bmN0aW9uKGZpbHRlcmVkLCBsaW5lKSB7XG5cdFx0XHRcdHZhciBtYXRjaDtcblxuXHRcdFx0XHRtYXRjaCA9IGlzRXhjbHVkZWQobGluZSk7XG5cdFx0XHRcdGlmKG1hdGNoKSB7XG5cdFx0XHRcdFx0aWYoIWV4Y2x1ZGVkKSB7XG5cdFx0XHRcdFx0XHRleGNsdWRlZCA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRleGNsdWRlZC5wdXNoKGxpbmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmKGV4Y2x1ZGVkKSB7XG5cdFx0XHRcdFx0XHRpZihmaWx0ZXJlZC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdGZpbHRlcmVkID0gZmlsdGVyZWQuY29uY2F0KHJlcGxhY2UoZXhjbHVkZWQpKTtcblx0XHRcdFx0XHRcdFx0ZXhjbHVkZWQgPSBudWxsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaWx0ZXJlZC5wdXNoKGxpbmUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZpbHRlcmVkO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0fTtcblxufSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUpOyB9KSk7XG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDEwLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3I6IEJyaWFuIENhdmFsaWVyXG4gKiBAYXV0aG9yOiBKb2huIEhhbm5cbiAqL1xuKGZ1bmN0aW9uKGRlZmluZSkgeyAndXNlIHN0cmljdCc7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHQvKmdsb2JhbCBzZXRUaW1lb3V0Ki9cblxuXHRcdC8qKlxuXHRcdCAqIFRocm90dGxlcyB0aGUgZ2l2ZW4gcmVwb3J0ZXIgc3VjaCB0aGF0IGl0IHdpbGwgcmVwb3J0XG5cdFx0ICogYXQgbW9zdCBvbmNlIGV2ZXJ5IG1zIG1pbGxpc2Vjb25kc1xuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBtcyBtaW5pbXVtIG1pbGxpcyBiZXR3ZWVuIHJlcG9ydHNcblx0XHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZXBvcnRlciByZXBvcnRlciB0byBiZSB0aHJvdHRsZWRcblx0XHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gdGhyb3R0bGVkIHZlcnNpb24gb2YgcmVwb3J0ZXJcblx0XHQgKi9cblx0XHRyZXR1cm4gZnVuY3Rpb24gdGhyb3R0bGVSZXBvcnRlcihtcywgcmVwb3J0ZXIpIHtcblx0XHRcdHZhciB0aW1lb3V0LCB0b1JlcG9ydDtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHByb21pc2VzKSB7XG5cdFx0XHRcdHRvUmVwb3J0ID0gcHJvbWlzZXM7XG5cdFx0XHRcdGlmKHRpbWVvdXQgPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRcdFx0XHRyZXBvcnRlcih0b1JlcG9ydCk7XG5cdFx0XHRcdFx0fSwgbXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cblx0fSk7XG59KHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uKGZhY3RvcnkpIHsgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7IH0pKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTsvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDExLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IENvbW1vbkpTIFByb21pc2VzL0EgYW5kIHdoZW4oKSBpbXBsZW1lbnRhdGlvblxuICogd2hlbiBpcyBwYXJ0IG9mIHRoZSBjdWpvLmpzIGZhbWlseSBvZiBsaWJyYXJpZXMgKGh0dHA6Ly9jdWpvanMuY29tLylcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3IgSm9obiBIYW5uXG4gKiBAdmVyc2lvbiAyLjcuMVxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbiAocmVxdWlyZSkge1xuXG5cdC8vIFB1YmxpYyBBUElcblxuXHR3aGVuLnByb21pc2UgICA9IHByb21pc2U7ICAgIC8vIENyZWF0ZSBhIHBlbmRpbmcgcHJvbWlzZVxuXHR3aGVuLnJlc29sdmUgICA9IHJlc29sdmU7ICAgIC8vIENyZWF0ZSBhIHJlc29sdmVkIHByb21pc2Vcblx0d2hlbi5yZWplY3QgICAgPSByZWplY3Q7ICAgICAvLyBDcmVhdGUgYSByZWplY3RlZCBwcm9taXNlXG5cdHdoZW4uZGVmZXIgICAgID0gZGVmZXI7ICAgICAgLy8gQ3JlYXRlIGEge3Byb21pc2UsIHJlc29sdmVyfSBwYWlyXG5cblx0d2hlbi5qb2luICAgICAgPSBqb2luOyAgICAgICAvLyBKb2luIDIgb3IgbW9yZSBwcm9taXNlc1xuXG5cdHdoZW4uYWxsICAgICAgID0gYWxsOyAgICAgICAgLy8gUmVzb2x2ZSBhIGxpc3Qgb2YgcHJvbWlzZXNcblx0d2hlbi5tYXAgICAgICAgPSBtYXA7ICAgICAgICAvLyBBcnJheS5tYXAoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5yZWR1Y2UgICAgPSByZWR1Y2U7ICAgICAvLyBBcnJheS5yZWR1Y2UoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5zZXR0bGUgICAgPSBzZXR0bGU7ICAgICAvLyBTZXR0bGUgYSBsaXN0IG9mIHByb21pc2VzXG5cblx0d2hlbi5hbnkgICAgICAgPSBhbnk7ICAgICAgICAvLyBPbmUtd2lubmVyIHJhY2Vcblx0d2hlbi5zb21lICAgICAgPSBzb21lOyAgICAgICAvLyBNdWx0aS13aW5uZXIgcmFjZVxuXG5cdHdoZW4uaXNQcm9taXNlID0gaXNQcm9taXNlTGlrZTsgIC8vIERFUFJFQ0FURUQ6IHVzZSBpc1Byb21pc2VMaWtlXG5cdHdoZW4uaXNQcm9taXNlTGlrZSA9IGlzUHJvbWlzZUxpa2U7IC8vIElzIHNvbWV0aGluZyBwcm9taXNlLWxpa2UsIGFrYSB0aGVuYWJsZVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhbiBvYnNlcnZlciBmb3IgYSBwcm9taXNlIG9yIGltbWVkaWF0ZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHsqfSBwcm9taXNlT3JWYWx1ZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uRnVsZmlsbGVkXSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBwcm9taXNlT3JWYWx1ZSBpc1xuXHQgKiAgIHN1Y2Nlc3NmdWxseSBmdWxmaWxsZWQuICBJZiBwcm9taXNlT3JWYWx1ZSBpcyBhbiBpbW1lZGlhdGUgdmFsdWUsIGNhbGxiYWNrXG5cdCAqICAgd2lsbCBiZSBpbnZva2VkIGltbWVkaWF0ZWx5LlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uUmVqZWN0ZWRdIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIHByb21pc2VPclZhbHVlIGlzXG5cdCAqICAgcmVqZWN0ZWQuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25Qcm9ncmVzc10gY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gcHJvZ3Jlc3MgdXBkYXRlc1xuXHQgKiAgIGFyZSBpc3N1ZWQgZm9yIHByb21pc2VPclZhbHVlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBuZXcge0BsaW5rIFByb21pc2V9IHRoYXQgd2lsbCBjb21wbGV0ZSB3aXRoIHRoZSByZXR1cm5cblx0ICogICB2YWx1ZSBvZiBjYWxsYmFjayBvciBlcnJiYWNrIG9yIHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHByb21pc2VPclZhbHVlIGlmXG5cdCAqICAgY2FsbGJhY2sgYW5kL29yIGVycmJhY2sgaXMgbm90IHN1cHBsaWVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gd2hlbihwcm9taXNlT3JWYWx1ZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpIHtcblx0XHQvLyBHZXQgYSB0cnVzdGVkIHByb21pc2UgZm9yIHRoZSBpbnB1dCBwcm9taXNlT3JWYWx1ZSwgYW5kIHRoZW5cblx0XHQvLyByZWdpc3RlciBwcm9taXNlIGhhbmRsZXJzXG5cdFx0cmV0dXJuIGNhc3QocHJvbWlzZU9yVmFsdWUpLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSB3aG9zZSBmYXRlIGlzIGRldGVybWluZWQgYnkgcmVzb2x2ZXIuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aG9zZSBmYXRlIGlzIGRldGVybWluZSBieSByZXNvbHZlclxuXHQgKi9cblx0ZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlcixcblx0XHRcdG1vbml0b3JBcGkuUHJvbWlzZVN0YXR1cyAmJiBtb25pdG9yQXBpLlByb21pc2VTdGF0dXMoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJ1c3RlZCBQcm9taXNlIGNvbnN0cnVjdG9yLiAgQSBQcm9taXNlIGNyZWF0ZWQgZnJvbSB0aGlzIGNvbnN0cnVjdG9yIGlzXG5cdCAqIGEgdHJ1c3RlZCB3aGVuLmpzIHByb21pc2UuICBBbnkgb3RoZXIgZHVjay10eXBlZCBwcm9taXNlIGlzIGNvbnNpZGVyZWRcblx0ICogdW50cnVzdGVkLlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hvc2UgZmF0ZSBpcyBkZXRlcm1pbmUgYnkgcmVzb2x2ZXJcblx0ICogQG5hbWUgUHJvbWlzZVxuXHQgKi9cblx0ZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlciwgc3RhdHVzKSB7XG5cdFx0dmFyIHNlbGYsIHZhbHVlLCBjb25zdW1lcnMgPSBbXTtcblxuXHRcdHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcblx0XHR0aGlzLmluc3BlY3QgPSBpbnNwZWN0O1xuXHRcdHRoaXMuX3doZW4gPSBfd2hlbjtcblxuXHRcdC8vIENhbGwgdGhlIHByb3ZpZGVyIHJlc29sdmVyIHRvIHNlYWwgdGhlIHByb21pc2UncyBmYXRlXG5cdFx0dHJ5IHtcblx0XHRcdHJlc29sdmVyKHByb21pc2VSZXNvbHZlLCBwcm9taXNlUmVqZWN0LCBwcm9taXNlTm90aWZ5KTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdHByb21pc2VSZWplY3QoZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyBhIHNuYXBzaG90IG9mIHRoaXMgcHJvbWlzZSdzIGN1cnJlbnQgc3RhdHVzIGF0IHRoZSBpbnN0YW50IG9mIGNhbGxcblx0XHQgKiBAcmV0dXJucyB7e3N0YXRlOlN0cmluZ319XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaW5zcGVjdCgpIHtcblx0XHRcdHJldHVybiB2YWx1ZSA/IHZhbHVlLmluc3BlY3QoKSA6IHRvUGVuZGluZ1N0YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJpdmF0ZSBtZXNzYWdlIGRlbGl2ZXJ5LiBRdWV1ZXMgYW5kIGRlbGl2ZXJzIG1lc3NhZ2VzIHRvXG5cdFx0ICogdGhlIHByb21pc2UncyB1bHRpbWF0ZSBmdWxmaWxsbWVudCB2YWx1ZSBvciByZWplY3Rpb24gcmVhc29uLlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3doZW4ocmVzb2x2ZSwgbm90aWZ5LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdFx0Y29uc3VtZXJzID8gY29uc3VtZXJzLnB1c2goZGVsaXZlcikgOiBlbnF1ZXVlKGZ1bmN0aW9uKCkgeyBkZWxpdmVyKHZhbHVlKTsgfSk7XG5cblx0XHRcdGZ1bmN0aW9uIGRlbGl2ZXIocCkge1xuXHRcdFx0XHRwLl93aGVuKHJlc29sdmUsIG5vdGlmeSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRyYW5zaXRpb24gZnJvbSBwcmUtcmVzb2x1dGlvbiBzdGF0ZSB0byBwb3N0LXJlc29sdXRpb24gc3RhdGUsIG5vdGlmeWluZ1xuXHRcdCAqIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIHVsdGltYXRlIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvblxuXHRcdCAqIEBwYXJhbSB7Kn0gdmFsIHJlc29sdXRpb24gdmFsdWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZSh2YWwpIHtcblx0XHRcdGlmKCFjb25zdW1lcnMpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcXVldWUgPSBjb25zdW1lcnM7XG5cdFx0XHRjb25zdW1lcnMgPSB1bmRlZjtcblxuXHRcdFx0ZW5xdWV1ZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhbHVlID0gY29lcmNlKHNlbGYsIHZhbCk7XG5cdFx0XHRcdGlmKHN0YXR1cykge1xuXHRcdFx0XHRcdHVwZGF0ZVN0YXR1cyh2YWx1ZSwgc3RhdHVzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRydW5IYW5kbGVycyhxdWV1ZSwgdmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVqZWN0IHRoaXMgcHJvbWlzZSB3aXRoIHRoZSBzdXBwbGllZCByZWFzb24sIHdoaWNoIHdpbGwgYmUgdXNlZCB2ZXJiYXRpbS5cblx0XHQgKiBAcGFyYW0geyp9IHJlYXNvbiByZWFzb24gZm9yIHRoZSByZWplY3Rpb25cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcm9taXNlUmVqZWN0KHJlYXNvbikge1xuXHRcdFx0cHJvbWlzZVJlc29sdmUobmV3IFJlamVjdGVkUHJvbWlzZShyZWFzb24pKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBJc3N1ZSBhIHByb2dyZXNzIGV2ZW50LCBub3RpZnlpbmcgYWxsIHByb2dyZXNzIGxpc3RlbmVyc1xuXHRcdCAqIEBwYXJhbSB7Kn0gdXBkYXRlIHByb2dyZXNzIGV2ZW50IHBheWxvYWQgdG8gcGFzcyB0byBhbGwgbGlzdGVuZXJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcHJvbWlzZU5vdGlmeSh1cGRhdGUpIHtcblx0XHRcdGlmKGNvbnN1bWVycykge1xuXHRcdFx0XHR2YXIgcXVldWUgPSBjb25zdW1lcnM7XG5cdFx0XHRcdGVucXVldWUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJ1bkhhbmRsZXJzKHF1ZXVlLCBuZXcgUHJvZ3Jlc3NpbmdQcm9taXNlKHVwZGF0ZSkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcm9taXNlUHJvdG90eXBlID0gUHJvbWlzZS5wcm90b3R5cGU7XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXJzIGZvciB0aGlzIHByb21pc2UuXG5cdCAqIEBwYXJhbSBbb25GdWxmaWxsZWRdIHtGdW5jdGlvbn0gZnVsZmlsbG1lbnQgaGFuZGxlclxuXHQgKiBAcGFyYW0gW29uUmVqZWN0ZWRdIHtGdW5jdGlvbn0gcmVqZWN0aW9uIGhhbmRsZXJcblx0ICogQHBhcmFtIFtvblByb2dyZXNzXSB7RnVuY3Rpb259IHByb2dyZXNzIGhhbmRsZXJcblx0ICogQHJldHVybiB7UHJvbWlzZX0gbmV3IFByb21pc2Vcblx0ICovXG5cdHByb21pc2VQcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHRzZWxmLl93aGVuKHJlc29sdmUsIG5vdGlmeSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHRcdH0sIHRoaXMuX3N0YXR1cyAmJiB0aGlzLl9zdGF0dXMub2JzZXJ2ZWQoKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgcmVqZWN0aW9uIGhhbmRsZXIuICBTaG9ydGN1dCBmb3IgLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gb25SZWplY3RlZFxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsnY2F0Y2gnXSA9IHByb21pc2VQcm90b3R5cGUub3RoZXJ3aXNlID0gZnVuY3Rpb24ob25SZWplY3RlZCkge1xuXHRcdHJldHVybiB0aGlzLnRoZW4odW5kZWYsIG9uUmVqZWN0ZWQpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBFbnN1cmVzIHRoYXQgb25GdWxmaWxsZWRPclJlamVjdGVkIHdpbGwgYmUgY2FsbGVkIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlclxuXHQgKiB0aGlzIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgb25GdWxmaWxsZWRPclJlamVjdGVkIFdJTEwgTk9UXG5cdCAqIHJlY2VpdmUgdGhlIHByb21pc2VzJyB2YWx1ZSBvciByZWFzb24uICBBbnkgcmV0dXJuZWQgdmFsdWUgd2lsbCBiZSBkaXNyZWdhcmRlZC5cblx0ICogb25GdWxmaWxsZWRPclJlamVjdGVkIG1heSB0aHJvdyBvciByZXR1cm4gYSByZWplY3RlZCBwcm9taXNlIHRvIHNpZ25hbFxuXHQgKiBhbiBhZGRpdGlvbmFsIGVycm9yLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQgaGFuZGxlciB0byBiZSBjYWxsZWQgcmVnYXJkbGVzcyBvZlxuXHQgKiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsnZmluYWxseSddID0gcHJvbWlzZVByb3RvdHlwZS5lbnN1cmUgPSBmdW5jdGlvbihvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQpIHtcblx0XHRyZXR1cm4gdHlwZW9mIG9uRnVsZmlsbGVkT3JSZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0PyB0aGlzLnRoZW4oaW5qZWN0SGFuZGxlciwgaW5qZWN0SGFuZGxlcilbJ3lpZWxkJ10odGhpcylcblx0XHRcdDogdGhpcztcblxuXHRcdGZ1bmN0aW9uIGluamVjdEhhbmRsZXIoKSB7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQoKSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBUZXJtaW5hdGUgYSBwcm9taXNlIGNoYWluIGJ5IGhhbmRsaW5nIHRoZSB1bHRpbWF0ZSBmdWxmaWxsbWVudCB2YWx1ZSBvclxuXHQgKiByZWplY3Rpb24gcmVhc29uLCBhbmQgYXNzdW1pbmcgcmVzcG9uc2liaWxpdHkgZm9yIGFsbCBlcnJvcnMuICBpZiBhblxuXHQgKiBlcnJvciBwcm9wYWdhdGVzIG91dCBvZiBoYW5kbGVSZXN1bHQgb3IgaGFuZGxlRmF0YWxFcnJvciwgaXQgd2lsbCBiZVxuXHQgKiByZXRocm93biB0byB0aGUgaG9zdCwgcmVzdWx0aW5nIGluIGEgbG91ZCBzdGFjayB0cmFjayBvbiBtb3N0IHBsYXRmb3Jtc1xuXHQgKiBhbmQgYSBjcmFzaCBvbiBzb21lLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gaGFuZGxlUmVzdWx0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBoYW5kbGVFcnJvclxuXHQgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24oaGFuZGxlUmVzdWx0LCBoYW5kbGVFcnJvcikge1xuXHRcdHRoaXMudGhlbihoYW5kbGVSZXN1bHQsIGhhbmRsZUVycm9yKVsnY2F0Y2gnXShjcmFzaCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFNob3J0Y3V0IGZvciAudGhlbihmdW5jdGlvbigpIHsgcmV0dXJuIHZhbHVlOyB9KVxuXHQgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdDpcblx0ICogIC0gaXMgZnVsZmlsbGVkIGlmIHZhbHVlIGlzIG5vdCBhIHByb21pc2UsIG9yXG5cdCAqICAtIGlmIHZhbHVlIGlzIGEgcHJvbWlzZSwgd2lsbCBmdWxmaWxsIHdpdGggaXRzIHZhbHVlLCBvciByZWplY3Rcblx0ICogICAgd2l0aCBpdHMgcmVhc29uLlxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsneWllbGQnXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9KTtcblx0fTtcblxuXHQvKipcblx0ICogUnVucyBhIHNpZGUgZWZmZWN0IHdoZW4gdGhpcyBwcm9taXNlIGZ1bGZpbGxzLCB3aXRob3V0IGNoYW5naW5nIHRoZVxuXHQgKiBmdWxmaWxsbWVudCB2YWx1ZS5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gb25GdWxmaWxsZWRTaWRlRWZmZWN0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZS50YXAgPSBmdW5jdGlvbihvbkZ1bGZpbGxlZFNpZGVFZmZlY3QpIHtcblx0XHRyZXR1cm4gdGhpcy50aGVuKG9uRnVsZmlsbGVkU2lkZUVmZmVjdClbJ3lpZWxkJ10odGhpcyk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEFzc3VtZXMgdGhhdCB0aGlzIHByb21pc2Ugd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXksIGFuZCBhcnJhbmdlc1xuXHQgKiBmb3IgdGhlIG9uRnVsZmlsbGVkIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBhcnJheSBhcyBpdHMgYXJndW1lbnQgbGlzdFxuXHQgKiBpLmUuIG9uRnVsZmlsbGVkLmFwcGx5KHVuZGVmaW5lZCwgYXJyYXkpLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkZ1bGZpbGxlZCBmdW5jdGlvbiB0byByZWNlaXZlIHNwcmVhZCBhcmd1bWVudHNcblx0ICogQHJldHVybiB7UHJvbWlzZX1cblx0ICovXG5cdHByb21pc2VQcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24ob25GdWxmaWxsZWQpIHtcblx0XHRyZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uKGFycmF5KSB7XG5cdFx0XHQvLyBhcnJheSBtYXkgY29udGFpbiBwcm9taXNlcywgc28gcmVzb2x2ZSBpdHMgY29udGVudHMuXG5cdFx0XHRyZXR1cm4gYWxsKGFycmF5LCBmdW5jdGlvbihhcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gb25GdWxmaWxsZWQuYXBwbHkodW5kZWYsIGFycmF5KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBTaG9ydGN1dCBmb3IgLnRoZW4ob25GdWxmaWxsZWRPclJlamVjdGVkLCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQpXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRwcm9taXNlUHJvdG90eXBlLmFsd2F5cyA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkT3JSZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdHJldHVybiB0aGlzLnRoZW4ob25GdWxmaWxsZWRPclJlamVjdGVkLCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBDYXN0cyB4IHRvIGEgdHJ1c3RlZCBwcm9taXNlLiBJZiB4IGlzIGFscmVhZHkgYSB0cnVzdGVkIHByb21pc2UsIGl0IGlzXG5cdCAqIHJldHVybmVkLCBvdGhlcndpc2UgYSBuZXcgdHJ1c3RlZCBQcm9taXNlIHdoaWNoIGZvbGxvd3MgeCBpcyByZXR1cm5lZC5cblx0ICogQHBhcmFtIHsqfSB4XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gY2FzdCh4KSB7XG5cdFx0cmV0dXJuIHggaW5zdGFuY2VvZiBQcm9taXNlID8geCA6IHJlc29sdmUoeCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuIFRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmVcblx0ICogIC0gZnVsZmlsbGVkIHdpdGggcHJvbWlzZU9yVmFsdWUgaWYgaXQgaXMgYSB2YWx1ZSwgb3Jcblx0ICogIC0gaWYgcHJvbWlzZU9yVmFsdWUgaXMgYSBwcm9taXNlXG5cdCAqICAgIC0gZnVsZmlsbGVkIHdpdGggcHJvbWlzZU9yVmFsdWUncyB2YWx1ZSBhZnRlciBpdCBpcyBmdWxmaWxsZWRcblx0ICogICAgLSByZWplY3RlZCB3aXRoIHByb21pc2VPclZhbHVlJ3MgcmVhc29uIGFmdGVyIGl0IGlzIHJlamVjdGVkXG5cdCAqIEluIGNvbnRyYWN0IHRvIGNhc3QoeCksIHRoaXMgYWx3YXlzIGNyZWF0ZXMgYSBuZXcgUHJvbWlzZVxuXHQgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSkge1xuXHRcdHJldHVybiBwcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcblx0XHRcdHJlc29sdmUodmFsdWUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSByZWplY3RlZCBwcm9taXNlIGZvciB0aGUgc3VwcGxpZWQgcHJvbWlzZU9yVmFsdWUuICBUaGUgcmV0dXJuZWRcblx0ICogcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGg6XG5cdCAqIC0gcHJvbWlzZU9yVmFsdWUsIGlmIGl0IGlzIGEgdmFsdWUsIG9yXG5cdCAqIC0gaWYgcHJvbWlzZU9yVmFsdWUgaXMgYSBwcm9taXNlXG5cdCAqICAgLSBwcm9taXNlT3JWYWx1ZSdzIHZhbHVlIGFmdGVyIGl0IGlzIGZ1bGZpbGxlZFxuXHQgKiAgIC0gcHJvbWlzZU9yVmFsdWUncyByZWFzb24gYWZ0ZXIgaXQgaXMgcmVqZWN0ZWRcblx0ICogQHBhcmFtIHsqfSBwcm9taXNlT3JWYWx1ZSB0aGUgcmVqZWN0ZWQgdmFsdWUgb2YgdGhlIHJldHVybmVkIHtAbGluayBQcm9taXNlfVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSByZWplY3RlZCB7QGxpbmsgUHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIHJlamVjdChwcm9taXNlT3JWYWx1ZSkge1xuXHRcdHJldHVybiB3aGVuKHByb21pc2VPclZhbHVlLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkUHJvbWlzZShlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEge3Byb21pc2UsIHJlc29sdmVyfSBwYWlyLCBlaXRoZXIgb3IgYm90aCBvZiB3aGljaFxuXHQgKiBtYXkgYmUgZ2l2ZW4gb3V0IHNhZmVseSB0byBjb25zdW1lcnMuXG5cdCAqIFRoZSByZXNvbHZlciBoYXMgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgcHJvZ3Jlc3MuICBUaGUgcHJvbWlzZVxuXHQgKiBoYXMgdGhlbiBwbHVzIGV4dGVuZGVkIHByb21pc2UgQVBJLlxuXHQgKlxuXHQgKiBAcmV0dXJuIHt7XG5cdCAqIHByb21pc2U6IFByb21pc2UsXG5cdCAqIHJlc29sdmU6IGZ1bmN0aW9uOlByb21pc2UsXG5cdCAqIHJlamVjdDogZnVuY3Rpb246UHJvbWlzZSxcblx0ICogbm90aWZ5OiBmdW5jdGlvbjpQcm9taXNlXG5cdCAqIHJlc29sdmVyOiB7XG5cdCAqXHRyZXNvbHZlOiBmdW5jdGlvbjpQcm9taXNlLFxuXHQgKlx0cmVqZWN0OiBmdW5jdGlvbjpQcm9taXNlLFxuXHQgKlx0bm90aWZ5OiBmdW5jdGlvbjpQcm9taXNlXG5cdCAqIH19fVxuXHQgKi9cblx0ZnVuY3Rpb24gZGVmZXIoKSB7XG5cdFx0dmFyIGRlZmVycmVkLCBwZW5kaW5nLCByZXNvbHZlZDtcblxuXHRcdC8vIE9wdGltaXplIG9iamVjdCBzaGFwZVxuXHRcdGRlZmVycmVkID0ge1xuXHRcdFx0cHJvbWlzZTogdW5kZWYsIHJlc29sdmU6IHVuZGVmLCByZWplY3Q6IHVuZGVmLCBub3RpZnk6IHVuZGVmLFxuXHRcdFx0cmVzb2x2ZXI6IHsgcmVzb2x2ZTogdW5kZWYsIHJlamVjdDogdW5kZWYsIG5vdGlmeTogdW5kZWYgfVxuXHRcdH07XG5cblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcGVuZGluZyA9IHByb21pc2UobWFrZURlZmVycmVkKTtcblxuXHRcdHJldHVybiBkZWZlcnJlZDtcblxuXHRcdGZ1bmN0aW9uIG1ha2VEZWZlcnJlZChyZXNvbHZlUGVuZGluZywgcmVqZWN0UGVuZGluZywgbm90aWZ5UGVuZGluZykge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSA9IGRlZmVycmVkLnJlc29sdmVyLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXNvbHZlZCA9IHRydWU7XG5cdFx0XHRcdHJlc29sdmVQZW5kaW5nKHZhbHVlKTtcblx0XHRcdFx0cmV0dXJuIHBlbmRpbmc7XG5cdFx0XHR9O1xuXG5cdFx0XHRkZWZlcnJlZC5yZWplY3QgID0gZGVmZXJyZWQucmVzb2x2ZXIucmVqZWN0ICA9IGZ1bmN0aW9uKHJlYXNvbikge1xuXHRcdFx0XHRpZihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXNvbHZlKG5ldyBSZWplY3RlZFByb21pc2UocmVhc29uKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzb2x2ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZWplY3RQZW5kaW5nKHJlYXNvbik7XG5cdFx0XHRcdHJldHVybiBwZW5kaW5nO1xuXHRcdFx0fTtcblxuXHRcdFx0ZGVmZXJyZWQubm90aWZ5ICA9IGRlZmVycmVkLnJlc29sdmVyLm5vdGlmeSAgPSBmdW5jdGlvbih1cGRhdGUpIHtcblx0XHRcdFx0bm90aWZ5UGVuZGluZyh1cGRhdGUpO1xuXHRcdFx0XHRyZXR1cm4gdXBkYXRlO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUnVuIGEgcXVldWUgb2YgZnVuY3Rpb25zIGFzIHF1aWNrbHkgYXMgcG9zc2libGUsIHBhc3Npbmdcblx0ICogdmFsdWUgdG8gZWFjaC5cblx0ICovXG5cdGZ1bmN0aW9uIHJ1bkhhbmRsZXJzKHF1ZXVlLCB2YWx1ZSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHF1ZXVlW2ldKHZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29lcmNlcyB4IHRvIGEgdHJ1c3RlZCBQcm9taXNlXG5cdCAqIEBwYXJhbSB7Kn0geCB0aGluZyB0byBjb2VyY2Vcblx0ICogQHJldHVybnMgeyp9IEd1YXJhbnRlZWQgdG8gcmV0dXJuIGEgdHJ1c3RlZCBQcm9taXNlLiAgSWYgeFxuXHQgKiAgIGlzIHRydXN0ZWQsIHJldHVybnMgeCwgb3RoZXJ3aXNlLCByZXR1cm5zIGEgbmV3LCB0cnVzdGVkLCBhbHJlYWR5LXJlc29sdmVkXG5cdCAqICAgUHJvbWlzZSB3aG9zZSByZXNvbHV0aW9uIHZhbHVlIGlzOlxuXHQgKiAgICogdGhlIHJlc29sdXRpb24gdmFsdWUgb2YgeCBpZiBpdCdzIGEgZm9yZWlnbiBwcm9taXNlLCBvclxuXHQgKiAgICogeCBpZiBpdCdzIGEgdmFsdWVcblx0ICovXG5cdGZ1bmN0aW9uIGNvZXJjZShzZWxmLCB4KSB7XG5cdFx0aWYgKHggPT09IHNlbGYpIHtcblx0XHRcdHJldHVybiBuZXcgUmVqZWN0ZWRQcm9taXNlKG5ldyBUeXBlRXJyb3IoKSk7XG5cdFx0fVxuXG5cdFx0aWYgKHggaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRyZXR1cm4geDtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0dmFyIHVudHJ1c3RlZFRoZW4gPSB4ID09PSBPYmplY3QoeCkgJiYgeC50aGVuO1xuXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHVudHJ1c3RlZFRoZW4gPT09ICdmdW5jdGlvbidcblx0XHRcdFx0PyBhc3NpbWlsYXRlKHVudHJ1c3RlZFRoZW4sIHgpXG5cdFx0XHRcdDogbmV3IEZ1bGZpbGxlZFByb21pc2UoeCk7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkUHJvbWlzZShlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2FmZWx5IGFzc2ltaWxhdGVzIGEgZm9yZWlnbiB0aGVuYWJsZSBieSB3cmFwcGluZyBpdCBpbiBhIHRydXN0ZWQgcHJvbWlzZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1bnRydXN0ZWRUaGVuIHgncyB0aGVuKCkgbWV0aG9kXG5cdCAqIEBwYXJhbSB7b2JqZWN0fGZ1bmN0aW9ufSB4IHRoZW5hYmxlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gYXNzaW1pbGF0ZSh1bnRydXN0ZWRUaGVuLCB4KSB7XG5cdFx0cmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0ZmNhbGwodW50cnVzdGVkVGhlbiwgeCwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdG1ha2VQcm9taXNlUHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSB8fFxuXHRcdGZ1bmN0aW9uKG8pIHtcblx0XHRcdGZ1bmN0aW9uIFByb21pc2VQcm90b3R5cGUoKSB7fVxuXHRcdFx0UHJvbWlzZVByb3RvdHlwZS5wcm90b3R5cGUgPSBvO1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlUHJvdG90eXBlKCk7XG5cdFx0fTtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZ1bGZpbGxlZCwgbG9jYWwgcHJvbWlzZSBhcyBhIHByb3h5IGZvciBhIHZhbHVlXG5cdCAqIE5PVEU6IG11c3QgbmV2ZXIgYmUgZXhwb3NlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIGZ1bGZpbGxtZW50IHZhbHVlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gRnVsZmlsbGVkUHJvbWlzZSh2YWx1ZSkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxuXG5cdEZ1bGZpbGxlZFByb21pc2UucHJvdG90eXBlID0gbWFrZVByb21pc2VQcm90b3R5cGUocHJvbWlzZVByb3RvdHlwZSk7XG5cblx0RnVsZmlsbGVkUHJvbWlzZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0b0Z1bGZpbGxlZFN0YXRlKHRoaXMudmFsdWUpO1xuXHR9O1xuXG5cdEZ1bGZpbGxlZFByb21pc2UucHJvdG90eXBlLl93aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgXywgb25GdWxmaWxsZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzb2x2ZSh0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCh0aGlzLnZhbHVlKSA6IHRoaXMudmFsdWUpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0cmVzb2x2ZShuZXcgUmVqZWN0ZWRQcm9taXNlKGUpKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSByZWplY3RlZCwgbG9jYWwgcHJvbWlzZSBhcyBhIHByb3h5IGZvciBhIHZhbHVlXG5cdCAqIE5PVEU6IG11c3QgbmV2ZXIgYmUgZXhwb3NlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHJlYXNvbiByZWplY3Rpb24gcmVhc29uXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gUmVqZWN0ZWRQcm9taXNlKHJlYXNvbikge1xuXHRcdHRoaXMudmFsdWUgPSByZWFzb247XG5cdH1cblxuXHRSZWplY3RlZFByb21pc2UucHJvdG90eXBlID0gbWFrZVByb21pc2VQcm90b3R5cGUocHJvbWlzZVByb3RvdHlwZSk7XG5cblx0UmVqZWN0ZWRQcm9taXNlLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRvUmVqZWN0ZWRTdGF0ZSh0aGlzLnZhbHVlKTtcblx0fTtcblxuXHRSZWplY3RlZFByb21pc2UucHJvdG90eXBlLl93aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgXywgX18sIG9uUmVqZWN0ZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzb2x2ZSh0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQodGhpcy52YWx1ZSkgOiB0aGlzKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdHJlc29sdmUobmV3IFJlamVjdGVkUHJvbWlzZShlKSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBwcm9ncmVzcyBwcm9taXNlIHdpdGggdGhlIHN1cHBsaWVkIHVwZGF0ZS5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBwcm9ncmVzcyB1cGRhdGUgdmFsdWVcblx0ICogQHJldHVybiB7UHJvbWlzZX0gcHJvZ3Jlc3MgcHJvbWlzZVxuXHQgKi9cblx0ZnVuY3Rpb24gUHJvZ3Jlc3NpbmdQcm9taXNlKHZhbHVlKSB7XG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR9XG5cblx0UHJvZ3Jlc3NpbmdQcm9taXNlLnByb3RvdHlwZSA9IG1ha2VQcm9taXNlUHJvdG90eXBlKHByb21pc2VQcm90b3R5cGUpO1xuXG5cdFByb2dyZXNzaW5nUHJvbWlzZS5wcm90b3R5cGUuX3doZW4gPSBmdW5jdGlvbihfLCBub3RpZnksIGYsIHIsIHUpIHtcblx0XHR0cnkge1xuXHRcdFx0bm90aWZ5KHR5cGVvZiB1ID09PSAnZnVuY3Rpb24nID8gdSh0aGlzLnZhbHVlKSA6IHRoaXMudmFsdWUpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0bm90aWZ5KGUpO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogVXBkYXRlIGEgUHJvbWlzZVN0YXR1cyBtb25pdG9yIG9iamVjdCB3aXRoIHRoZSBvdXRjb21lXG5cdCAqIG9mIHRoZSBzdXBwbGllZCB2YWx1ZSBwcm9taXNlLlxuXHQgKiBAcGFyYW0ge1Byb21pc2V9IHZhbHVlXG5cdCAqIEBwYXJhbSB7UHJvbWlzZVN0YXR1c30gc3RhdHVzXG5cdCAqL1xuXHRmdW5jdGlvbiB1cGRhdGVTdGF0dXModmFsdWUsIHN0YXR1cykge1xuXHRcdHZhbHVlLnRoZW4oc3RhdHVzRnVsZmlsbGVkLCBzdGF0dXNSZWplY3RlZCk7XG5cblx0XHRmdW5jdGlvbiBzdGF0dXNGdWxmaWxsZWQoKSB7IHN0YXR1cy5mdWxmaWxsZWQoKTsgfVxuXHRcdGZ1bmN0aW9uIHN0YXR1c1JlamVjdGVkKHIpIHsgc3RhdHVzLnJlamVjdGVkKHIpOyB9XG5cdH1cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiB4IGlzIHByb21pc2UtbGlrZSwgaS5lLiBhIHRoZW5hYmxlIG9iamVjdFxuXHQgKiBOT1RFOiBXaWxsIHJldHVybiB0cnVlIGZvciAqYW55IHRoZW5hYmxlIG9iamVjdCosIGFuZCBpc24ndCB0cnVseVxuXHQgKiBzYWZlLCBzaW5jZSBpdCBtYXkgYXR0ZW1wdCB0byBhY2Nlc3MgdGhlIGB0aGVuYCBwcm9wZXJ0eSBvZiB4IChpLmUuXG5cdCAqICBjbGV2ZXIvbWFsaWNpb3VzIGdldHRlcnMgbWF5IGRvIHdlaXJkIHRoaW5ncylcblx0ICogQHBhcmFtIHsqfSB4IGFueXRoaW5nXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHggaXMgcHJvbWlzZS1saWtlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc1Byb21pc2VMaWtlKHgpIHtcblx0XHRyZXR1cm4geCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYXRlcyBhIGNvbXBldGl0aXZlIHJhY2UsIHJldHVybmluZyBhIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlblxuXHQgKiBob3dNYW55IG9mIHRoZSBzdXBwbGllZCBwcm9taXNlc09yVmFsdWVzIGhhdmUgcmVzb2x2ZWQsIG9yIHdpbGwgcmVqZWN0IHdoZW5cblx0ICogaXQgYmVjb21lcyBpbXBvc3NpYmxlIGZvciBob3dNYW55IHRvIHJlc29sdmUsIGZvciBleGFtcGxlLCB3aGVuXG5cdCAqIChwcm9taXNlc09yVmFsdWVzLmxlbmd0aCAtIGhvd01hbnkpICsgMSBpbnB1dCBwcm9taXNlcyByZWplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHByb21pc2VzT3JWYWx1ZXMgYXJyYXkgb2YgYW55dGhpbmcsIG1heSBjb250YWluIGEgbWl4XG5cdCAqICAgICAgb2YgcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0gaG93TWFueSB7bnVtYmVyfSBudW1iZXIgb2YgcHJvbWlzZXNPclZhbHVlcyB0byByZXNvbHZlXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25GdWxmaWxsZWRdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25SZWplY3RlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblByb2dyZXNzXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbiBhcnJheSBvZiBob3dNYW55IHZhbHVlcyB0aGF0XG5cdCAqICByZXNvbHZlZCBmaXJzdCwgb3Igd2lsbCByZWplY3Qgd2l0aCBhbiBhcnJheSBvZlxuXHQgKiAgKHByb21pc2VzT3JWYWx1ZXMubGVuZ3RoIC0gaG93TWFueSkgKyAxIHJlamVjdGlvbiByZWFzb25zLlxuXHQgKi9cblx0ZnVuY3Rpb24gc29tZShwcm9taXNlc09yVmFsdWVzLCBob3dNYW55LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZXNPclZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZXNPclZhbHVlcykge1xuXG5cdFx0XHRyZXR1cm4gcHJvbWlzZShyZXNvbHZlU29tZSkudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcyk7XG5cblx0XHRcdGZ1bmN0aW9uIHJlc29sdmVTb21lKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHRcdHZhciB0b1Jlc29sdmUsIHRvUmVqZWN0LCB2YWx1ZXMsIHJlYXNvbnMsIGZ1bGZpbGxPbmUsIHJlamVjdE9uZSwgbGVuLCBpO1xuXG5cdFx0XHRcdGxlbiA9IHByb21pc2VzT3JWYWx1ZXMubGVuZ3RoID4+PiAwO1xuXG5cdFx0XHRcdHRvUmVzb2x2ZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKGhvd01hbnksIGxlbikpO1xuXHRcdFx0XHR2YWx1ZXMgPSBbXTtcblxuXHRcdFx0XHR0b1JlamVjdCA9IChsZW4gLSB0b1Jlc29sdmUpICsgMTtcblx0XHRcdFx0cmVhc29ucyA9IFtdO1xuXG5cdFx0XHRcdC8vIE5vIGl0ZW1zIGluIHRoZSBpbnB1dCwgcmVzb2x2ZSBpbW1lZGlhdGVseVxuXHRcdFx0XHRpZiAoIXRvUmVzb2x2ZSkge1xuXHRcdFx0XHRcdHJlc29sdmUodmFsdWVzKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlamVjdE9uZSA9IGZ1bmN0aW9uKHJlYXNvbikge1xuXHRcdFx0XHRcdFx0cmVhc29ucy5wdXNoKHJlYXNvbik7XG5cdFx0XHRcdFx0XHRpZighLS10b1JlamVjdCkge1xuXHRcdFx0XHRcdFx0XHRmdWxmaWxsT25lID0gcmVqZWN0T25lID0gaWRlbnRpdHk7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChyZWFzb25zKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZnVsZmlsbE9uZSA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHRcdFx0Ly8gVGhpcyBvcmRlcnMgdGhlIHZhbHVlcyBiYXNlZCBvbiBwcm9taXNlIHJlc29sdXRpb24gb3JkZXJcblx0XHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbCk7XG5cdFx0XHRcdFx0XHRpZiAoIS0tdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdGZ1bGZpbGxPbmUgPSByZWplY3RPbmUgPSBpZGVudGl0eTtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSh2YWx1ZXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuXHRcdFx0XHRcdFx0aWYoaSBpbiBwcm9taXNlc09yVmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRcdHdoZW4ocHJvbWlzZXNPclZhbHVlc1tpXSwgZnVsZmlsbGVyLCByZWplY3Rlciwgbm90aWZ5KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiByZWplY3RlcihyZWFzb24pIHtcblx0XHRcdFx0XHRyZWplY3RPbmUocmVhc29uKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGZ1bGZpbGxlcih2YWwpIHtcblx0XHRcdFx0XHRmdWxmaWxsT25lKHZhbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWF0ZXMgYSBjb21wZXRpdGl2ZSByYWNlLCByZXR1cm5pbmcgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW5cblx0ICogYW55IG9uZSBvZiB0aGUgc3VwcGxpZWQgcHJvbWlzZXNPclZhbHVlcyBoYXMgcmVzb2x2ZWQgb3Igd2lsbCByZWplY3Qgd2hlblxuXHQgKiAqYWxsKiBwcm9taXNlc09yVmFsdWVzIGhhdmUgcmVqZWN0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZXNPclZhbHVlcyBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gYSBtaXhcblx0ICogICAgICBvZiB7QGxpbmsgUHJvbWlzZX1zIGFuZCB2YWx1ZXNcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvbkZ1bGZpbGxlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblJlamVjdGVkXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uUHJvZ3Jlc3NdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSB2YWx1ZSB0aGF0IHJlc29sdmVkIGZpcnN0LCBvclxuXHQgKiB3aWxsIHJlamVjdCB3aXRoIGFuIGFycmF5IG9mIGFsbCByZWplY3RlZCBpbnB1dHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBhbnkocHJvbWlzZXNPclZhbHVlcywgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpIHtcblxuXHRcdGZ1bmN0aW9uIHVud3JhcFNpbmdsZVJlc3VsdCh2YWwpIHtcblx0XHRcdHJldHVybiBvbkZ1bGZpbGxlZCA/IG9uRnVsZmlsbGVkKHZhbFswXSkgOiB2YWxbMF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNvbWUocHJvbWlzZXNPclZhbHVlcywgMSwgdW53cmFwU2luZ2xlUmVzdWx0LCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9ubHkgb25jZSBhbGwgdGhlIHN1cHBsaWVkIHByb21pc2VzT3JWYWx1ZXNcblx0ICogaGF2ZSByZXNvbHZlZC4gVGhlIHJlc29sdXRpb24gdmFsdWUgb2YgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSBhbiBhcnJheVxuXHQgKiBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIHZhbHVlcyBvZiBlYWNoIG9mIHRoZSBwcm9taXNlc09yVmFsdWVzLlxuXHQgKiBAbWVtYmVyT2Ygd2hlblxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fFByb21pc2V9IHByb21pc2VzT3JWYWx1ZXMgYXJyYXkgb2YgYW55dGhpbmcsIG1heSBjb250YWluIGEgbWl4XG5cdCAqICAgICAgb2Yge0BsaW5rIFByb21pc2V9cyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25GdWxmaWxsZWRdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25SZWplY3RlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblByb2dyZXNzXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIGFsbChwcm9taXNlc09yVmFsdWVzLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdHJldHVybiBfbWFwKHByb21pc2VzT3JWYWx1ZXMsIGlkZW50aXR5KS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBKb2lucyBtdWx0aXBsZSBwcm9taXNlcyBpbnRvIGEgc2luZ2xlIHJldHVybmVkIHByb21pc2UuXG5cdCAqIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgZnVsZmlsbCB3aGVuICphbGwqIHRoZSBpbnB1dCBwcm9taXNlc1xuXHQgKiBoYXZlIGZ1bGZpbGxlZCwgb3Igd2lsbCByZWplY3Qgd2hlbiAqYW55IG9uZSogb2YgdGhlIGlucHV0IHByb21pc2VzIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBqb2luKC8qIC4uLnByb21pc2VzICovKSB7XG5cdFx0cmV0dXJuIF9tYXAoYXJndW1lbnRzLCBpZGVudGl0eSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0dGxlcyBhbGwgaW5wdXQgcHJvbWlzZXMgc3VjaCB0aGF0IHRoZXkgYXJlIGd1YXJhbnRlZWQgbm90IHRvXG5cdCAqIGJlIHBlbmRpbmcgb25jZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSBmdWxmaWxscy4gVGhlIHJldHVybmVkIHByb21pc2Vcblx0ICogd2lsbCBhbHdheXMgZnVsZmlsbCwgZXhjZXB0IGluIHRoZSBjYXNlIHdoZXJlIGBhcnJheWAgaXMgYSBwcm9taXNlXG5cdCAqIHRoYXQgcmVqZWN0cy5cblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBhcnJheSBvciBwcm9taXNlIGZvciBhcnJheSBvZiBwcm9taXNlcyB0byBzZXR0bGVcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgdGhhdCBhbHdheXMgZnVsZmlsbHMgd2l0aCBhbiBhcnJheSBvZlxuXHQgKiAgb3V0Y29tZSBzbmFwc2hvdHMgZm9yIGVhY2ggaW5wdXQgcHJvbWlzZS5cblx0ICovXG5cdGZ1bmN0aW9uIHNldHRsZShhcnJheSkge1xuXHRcdHJldHVybiBfbWFwKGFycmF5LCB0b0Z1bGZpbGxlZFN0YXRlLCB0b1JlamVjdGVkU3RhdGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb21pc2UtYXdhcmUgYXJyYXkgbWFwIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUubWFwKClgLFxuXHQgKiBidXQgaW5wdXQgYXJyYXkgbWF5IGNvbnRhaW4gcHJvbWlzZXMgb3IgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge0FycmF5fFByb21pc2V9IGFycmF5IGFycmF5IG9mIGFueXRoaW5nLCBtYXkgY29udGFpbiBwcm9taXNlcyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcEZ1bmMgbWFwIGZ1bmN0aW9uIHdoaWNoIG1heSByZXR1cm4gYSBwcm9taXNlIG9yIHZhbHVlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgb2YgbWFwcGVkIHZhbHVlc1xuXHQgKiAgb3IgcmVqZWN0IGlmIGFueSBpbnB1dCBwcm9taXNlIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIG1hcEZ1bmMpIHtcblx0XHRyZXR1cm4gX21hcChhcnJheSwgbWFwRnVuYyk7XG5cdH1cblxuXHQvKipcblx0ICogSW50ZXJuYWwgbWFwIHRoYXQgYWxsb3dzIGEgZmFsbGJhY2sgdG8gaGFuZGxlIHJlamVjdGlvbnNcblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBhcnJheSBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtYXBGdW5jIG1hcCBmdW5jdGlvbiB3aGljaCBtYXkgcmV0dXJuIGEgcHJvbWlzZSBvciB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gZmFsbGJhY2sgZnVuY3Rpb24gdG8gaGFuZGxlIHJlamVjdGVkIHByb21pc2VzXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgb2YgbWFwcGVkIHZhbHVlc1xuXHQgKiAgb3IgcmVqZWN0IGlmIGFueSBpbnB1dCBwcm9taXNlIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfbWFwKGFycmF5LCBtYXBGdW5jLCBmYWxsYmFjaykge1xuXHRcdHJldHVybiB3aGVuKGFycmF5LCBmdW5jdGlvbihhcnJheSkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZU1hcCk7XG5cblx0XHRcdGZ1bmN0aW9uIHJlc29sdmVNYXAocmVzb2x2ZSwgcmVqZWN0LCBub3RpZnkpIHtcblx0XHRcdFx0dmFyIHJlc3VsdHMsIGxlbiwgdG9SZXNvbHZlLCBpO1xuXG5cdFx0XHRcdC8vIFNpbmNlIHdlIGtub3cgdGhlIHJlc3VsdGluZyBsZW5ndGgsIHdlIGNhbiBwcmVhbGxvY2F0ZSB0aGUgcmVzdWx0c1xuXHRcdFx0XHQvLyBhcnJheSB0byBhdm9pZCBhcnJheSBleHBhbnNpb25zLlxuXHRcdFx0XHR0b1Jlc29sdmUgPSBsZW4gPSBhcnJheS5sZW5ndGggPj4+IDA7XG5cdFx0XHRcdHJlc3VsdHMgPSBbXTtcblxuXHRcdFx0XHRpZighdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXN1bHRzKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTaW5jZSBtYXBGdW5jIG1heSBiZSBhc3luYywgZ2V0IGFsbCBpbnZvY2F0aW9ucyBvZiBpdCBpbnRvIGZsaWdodFxuXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRcdGlmKGkgaW4gYXJyYXkpIHtcblx0XHRcdFx0XHRcdHJlc29sdmVPbmUoYXJyYXlbaV0sIGkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQtLXRvUmVzb2x2ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiByZXNvbHZlT25lKGl0ZW0sIGkpIHtcblx0XHRcdFx0XHR3aGVuKGl0ZW0sIG1hcEZ1bmMsIGZhbGxiYWNrKS50aGVuKGZ1bmN0aW9uKG1hcHBlZCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0c1tpXSA9IG1hcHBlZDtcblxuXHRcdFx0XHRcdFx0aWYoIS0tdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUocmVzdWx0cyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgcmVqZWN0LCBub3RpZnkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJhZGl0aW9uYWwgcmVkdWNlIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUucmVkdWNlKClgLCBidXRcblx0ICogaW5wdXQgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kL29yIHZhbHVlcywgYW5kIHJlZHVjZUZ1bmNcblx0ICogbWF5IHJldHVybiBlaXRoZXIgYSB2YWx1ZSBvciBhIHByb21pc2UsICphbmQqIGluaXRpYWxWYWx1ZSBtYXlcblx0ICogYmUgYSBwcm9taXNlIGZvciB0aGUgc3RhcnRpbmcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZSBhcnJheSBvciBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBhbnl0aGluZyxcblx0ICogICAgICBtYXkgY29udGFpbiBhIG1peCBvZiBwcm9taXNlcyBhbmQgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWR1Y2VGdW5jIHJlZHVjZSBmdW5jdGlvbiByZWR1Y2UoY3VycmVudFZhbHVlLCBuZXh0VmFsdWUsIGluZGV4LCB0b3RhbCksXG5cdCAqICAgICAgd2hlcmUgdG90YWwgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBpdGVtcyBiZWluZyByZWR1Y2VkLCBhbmQgd2lsbCBiZSB0aGUgc2FtZVxuXHQgKiAgICAgIGluIGVhY2ggY2FsbCB0byByZWR1Y2VGdW5jLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIGZpbmFsIHJlZHVjZWQgdmFsdWVcblx0ICovXG5cdGZ1bmN0aW9uIHJlZHVjZShwcm9taXNlLCByZWR1Y2VGdW5jIC8qLCBpbml0aWFsVmFsdWUgKi8pIHtcblx0XHR2YXIgYXJncyA9IGZjYWxsKHNsaWNlLCBhcmd1bWVudHMsIDEpO1xuXG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZSwgZnVuY3Rpb24oYXJyYXkpIHtcblx0XHRcdHZhciB0b3RhbDtcblxuXHRcdFx0dG90YWwgPSBhcnJheS5sZW5ndGg7XG5cblx0XHRcdC8vIFdyYXAgdGhlIHN1cHBsaWVkIHJlZHVjZUZ1bmMgd2l0aCBvbmUgdGhhdCBoYW5kbGVzIHByb21pc2VzIGFuZCB0aGVuXG5cdFx0XHQvLyBkZWxlZ2F0ZXMgdG8gdGhlIHN1cHBsaWVkLlxuXHRcdFx0YXJnc1swXSA9IGZ1bmN0aW9uIChjdXJyZW50LCB2YWwsIGkpIHtcblx0XHRcdFx0cmV0dXJuIHdoZW4oY3VycmVudCwgZnVuY3Rpb24gKGMpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbih2YWwsIGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlZHVjZUZ1bmMoYywgdmFsdWUsIGksIHRvdGFsKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gcmVkdWNlQXJyYXkuYXBwbHkoYXJyYXksIGFyZ3MpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gU25hcHNob3Qgc3RhdGVzXG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmdWxmaWxsZWQgc3RhdGUgc25hcHNob3Rcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB4IGFueSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7e3N0YXRlOidmdWxmaWxsZWQnLHZhbHVlOip9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9GdWxmaWxsZWRTdGF0ZSh4KSB7XG5cdFx0cmV0dXJuIHsgc3RhdGU6ICdmdWxmaWxsZWQnLCB2YWx1ZTogeCB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSByZWplY3RlZCBzdGF0ZSBzbmFwc2hvdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHggYW55IHJlYXNvblxuXHQgKiBAcmV0dXJucyB7e3N0YXRlOidyZWplY3RlZCcscmVhc29uOip9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9SZWplY3RlZFN0YXRlKHgpIHtcblx0XHRyZXR1cm4geyBzdGF0ZTogJ3JlamVjdGVkJywgcmVhc29uOiB4IH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHBlbmRpbmcgc3RhdGUgc25hcHNob3Rcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMge3tzdGF0ZToncGVuZGluZyd9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9QZW5kaW5nU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHsgc3RhdGU6ICdwZW5kaW5nJyB9O1xuXHR9XG5cblx0Ly9cblx0Ly8gSW50ZXJuYWxzLCB1dGlsaXRpZXMsIGV0Yy5cblx0Ly9cblxuXHR2YXIgcHJvbWlzZVByb3RvdHlwZSwgbWFrZVByb21pc2VQcm90b3R5cGUsIHJlZHVjZUFycmF5LCBzbGljZSwgZmNhbGwsIG5leHRUaWNrLCBoYW5kbGVyUXVldWUsXG5cdFx0ZnVuY1Byb3RvLCBjYWxsLCBhcnJheVByb3RvLCBtb25pdG9yQXBpLFxuXHRcdGNhcHR1cmVkU2V0VGltZW91dCwgY2pzUmVxdWlyZSwgTXV0YXRpb25PYnMsIHVuZGVmO1xuXG5cdGNqc1JlcXVpcmUgPSByZXF1aXJlO1xuXG5cdC8vXG5cdC8vIFNoYXJlZCBoYW5kbGVyIHF1ZXVlIHByb2Nlc3Npbmdcblx0Ly9cblx0Ly8gQ3JlZGl0IHRvIFR3aXNvbCAoaHR0cHM6Ly9naXRodWIuY29tL1R3aXNvbCkgZm9yIHN1Z2dlc3Rpbmdcblx0Ly8gdGhpcyB0eXBlIG9mIGV4dGVuc2libGUgcXVldWUgKyB0cmFtcG9saW5lIGFwcHJvYWNoIGZvclxuXHQvLyBuZXh0LXRpY2sgY29uZmxhdGlvbi5cblxuXHRoYW5kbGVyUXVldWUgPSBbXTtcblxuXHQvKipcblx0ICogRW5xdWV1ZSBhIHRhc2suIElmIHRoZSBxdWV1ZSBpcyBub3QgY3VycmVudGx5IHNjaGVkdWxlZCB0byBiZVxuXHQgKiBkcmFpbmVkLCBzY2hlZHVsZSBpdC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gdGFza1xuXHQgKi9cblx0ZnVuY3Rpb24gZW5xdWV1ZSh0YXNrKSB7XG5cdFx0aWYoaGFuZGxlclF1ZXVlLnB1c2godGFzaykgPT09IDEpIHtcblx0XHRcdG5leHRUaWNrKGRyYWluUXVldWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEcmFpbiB0aGUgaGFuZGxlciBxdWV1ZSBlbnRpcmVseSwgYmVpbmcgY2FyZWZ1bCB0byBhbGxvdyB0aGVcblx0ICogcXVldWUgdG8gYmUgZXh0ZW5kZWQgd2hpbGUgaXQgaXMgYmVpbmcgcHJvY2Vzc2VkLCBhbmQgdG8gY29udGludWVcblx0ICogcHJvY2Vzc2luZyB1bnRpbCBpdCBpcyB0cnVseSBlbXB0eS5cblx0ICovXG5cdGZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG5cdFx0cnVuSGFuZGxlcnMoaGFuZGxlclF1ZXVlKTtcblx0XHRoYW5kbGVyUXVldWUgPSBbXTtcblx0fVxuXG5cdC8vIEFsbG93IGF0dGFjaGluZyB0aGUgbW9uaXRvciB0byB3aGVuKCkgaWYgZW52IGhhcyBubyBjb25zb2xlXG5cdG1vbml0b3JBcGkgPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgPyBjb25zb2xlIDogd2hlbjtcblxuXHQvLyBTbmlmZiBcImJlc3RcIiBhc3luYyBzY2hlZHVsaW5nIG9wdGlvblxuXHQvLyBQcmVmZXIgcHJvY2Vzcy5uZXh0VGljayBvciBNdXRhdGlvbk9ic2VydmVyLCB0aGVuIGNoZWNrIGZvclxuXHQvLyB2ZXJ0eCBhbmQgZmluYWxseSBmYWxsIGJhY2sgdG8gc2V0VGltZW91dFxuXHQvKmdsb2JhbCBwcm9jZXNzLGRvY3VtZW50LHNldFRpbWVvdXQsTXV0YXRpb25PYnNlcnZlcixXZWJLaXRNdXRhdGlvbk9ic2VydmVyKi9cblx0aWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG5cdFx0bmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuXHR9IGVsc2UgaWYoTXV0YXRpb25PYnMgPVxuXHRcdCh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBNdXRhdGlvbk9ic2VydmVyKSB8fFxuXHRcdFx0KHR5cGVvZiBXZWJLaXRNdXRhdGlvbk9ic2VydmVyID09PSAnZnVuY3Rpb24nICYmIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIpKSB7XG5cdFx0bmV4dFRpY2sgPSAoZnVuY3Rpb24oZG9jdW1lbnQsIE11dGF0aW9uT2JzZXJ2ZXIsIGRyYWluUXVldWUpIHtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIoZHJhaW5RdWV1ZSkub2JzZXJ2ZShlbCwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSgneCcsICd4Jyk7XG5cdFx0XHR9O1xuXHRcdH0oZG9jdW1lbnQsIE11dGF0aW9uT2JzLCBkcmFpblF1ZXVlKSk7XG5cdH0gZWxzZSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIHZlcnQueCAxLnggfHwgMi54XG5cdFx0XHRuZXh0VGljayA9IGNqc1JlcXVpcmUoJ3ZlcnR4JykucnVuT25Mb29wIHx8IGNqc1JlcXVpcmUoJ3ZlcnR4JykucnVuT25Db250ZXh0O1xuXHRcdH0gY2F0Y2goaWdub3JlKSB7XG5cdFx0XHQvLyBjYXB0dXJlIHNldFRpbWVvdXQgdG8gYXZvaWQgYmVpbmcgY2F1Z2h0IGJ5IGZha2UgdGltZXJzXG5cdFx0XHQvLyB1c2VkIGluIHRpbWUgYmFzZWQgdGVzdHNcblx0XHRcdGNhcHR1cmVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG5cdFx0XHRuZXh0VGljayA9IGZ1bmN0aW9uKHQpIHsgY2FwdHVyZWRTZXRUaW1lb3V0KHQsIDApOyB9O1xuXHRcdH1cblx0fVxuXG5cdC8vXG5cdC8vIENhcHR1cmUvcG9seWZpbGwgZnVuY3Rpb24gYW5kIGFycmF5IHV0aWxzXG5cdC8vXG5cblx0Ly8gU2FmZSBmdW5jdGlvbiBjYWxsc1xuXHRmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cdGNhbGwgPSBmdW5jUHJvdG8uY2FsbDtcblx0ZmNhbGwgPSBmdW5jUHJvdG8uYmluZFxuXHRcdD8gY2FsbC5iaW5kKGNhbGwpXG5cdFx0OiBmdW5jdGlvbihmLCBjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm4gZi5hcHBseShjb250ZXh0LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMikpO1xuXHRcdH07XG5cblx0Ly8gU2FmZSBhcnJheSBvcHNcblx0YXJyYXlQcm90byA9IFtdO1xuXHRzbGljZSA9IGFycmF5UHJvdG8uc2xpY2U7XG5cblx0Ly8gRVM1IHJlZHVjZSBpbXBsZW1lbnRhdGlvbiBpZiBuYXRpdmUgbm90IGF2YWlsYWJsZVxuXHQvLyBTZWU6IGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDE1LjQuNC4yMSBhcyB0aGVyZSBhcmUgbWFueVxuXHQvLyBzcGVjaWZpY3MgYW5kIGVkZ2UgY2FzZXMuICBFUzUgZGljdGF0ZXMgdGhhdCByZWR1Y2UubGVuZ3RoID09PSAxXG5cdC8vIFRoaXMgaW1wbGVtZW50YXRpb24gZGV2aWF0ZXMgZnJvbSBFUzUgc3BlYyBpbiB0aGUgZm9sbG93aW5nIHdheXM6XG5cdC8vIDEuIEl0IGRvZXMgbm90IGNoZWNrIGlmIHJlZHVjZUZ1bmMgaXMgYSBDYWxsYWJsZVxuXHRyZWR1Y2VBcnJheSA9IGFycmF5UHJvdG8ucmVkdWNlIHx8XG5cdFx0ZnVuY3Rpb24ocmVkdWNlRnVuYyAvKiwgaW5pdGlhbFZhbHVlICovKSB7XG5cdFx0XHQvKmpzaGludCBtYXhjb21wbGV4aXR5OiA3Ki9cblx0XHRcdHZhciBhcnIsIGFyZ3MsIHJlZHVjZWQsIGxlbiwgaTtcblxuXHRcdFx0aSA9IDA7XG5cdFx0XHRhcnIgPSBPYmplY3QodGhpcyk7XG5cdFx0XHRsZW4gPSBhcnIubGVuZ3RoID4+PiAwO1xuXHRcdFx0YXJncyA9IGFyZ3VtZW50cztcblxuXHRcdFx0Ly8gSWYgbm8gaW5pdGlhbFZhbHVlLCB1c2UgZmlyc3QgaXRlbSBvZiBhcnJheSAod2Uga25vdyBsZW5ndGggIT09IDAgaGVyZSlcblx0XHRcdC8vIGFuZCBhZGp1c3QgaSB0byBzdGFydCBhdCBzZWNvbmQgaXRlbVxuXHRcdFx0aWYoYXJncy5sZW5ndGggPD0gMSkge1xuXHRcdFx0XHQvLyBTa2lwIHRvIHRoZSBmaXJzdCByZWFsIGVsZW1lbnQgaW4gdGhlIGFycmF5XG5cdFx0XHRcdGZvcig7Oykge1xuXHRcdFx0XHRcdGlmKGkgaW4gYXJyKSB7XG5cdFx0XHRcdFx0XHRyZWR1Y2VkID0gYXJyW2krK107XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJZiB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGFycmF5IHdpdGhvdXQgZmluZGluZyBhbnkgcmVhbFxuXHRcdFx0XHRcdC8vIGVsZW1lbnRzLCBpdCdzIGEgVHlwZUVycm9yXG5cdFx0XHRcdFx0aWYoKytpID49IGxlbikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSWYgaW5pdGlhbFZhbHVlIHByb3ZpZGVkLCB1c2UgaXRcblx0XHRcdFx0cmVkdWNlZCA9IGFyZ3NbMV07XG5cdFx0XHR9XG5cblx0XHRcdC8vIERvIHRoZSBhY3R1YWwgcmVkdWNlXG5cdFx0XHRmb3IoO2kgPCBsZW47ICsraSkge1xuXHRcdFx0XHRpZihpIGluIGFycikge1xuXHRcdFx0XHRcdHJlZHVjZWQgPSByZWR1Y2VGdW5jKHJlZHVjZWQsIGFycltpXSwgaSwgYXJyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVkdWNlZDtcblx0XHR9O1xuXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcblx0XHRyZXR1cm4geDtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyYXNoKGZhdGFsRXJyb3IpIHtcblx0XHRpZih0eXBlb2YgbW9uaXRvckFwaS5yZXBvcnRVbmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdG1vbml0b3JBcGkucmVwb3J0VW5oYW5kbGVkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVucXVldWUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGZhdGFsRXJyb3I7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aHJvdyBmYXRhbEVycm9yO1xuXHR9XG5cblx0cmV0dXJuIHdoZW47XG59KTtcbn0pKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uIChmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKTsgfSk7XG4iLCIvLyBCRUdJTiBPQkpFQ1RcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIEFwaU9iamVjdCA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29udmVydEl0ZW0ocmF3KSB7XHJcbiAgICAgICAgcmV0dXJuIEFwaU9iamVjdC5jcmVhdGUodGhpcy5pdGVtVHlwZSwgcmF3LCB0aGlzLmFwaSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhLCBhcGksIGl0ZW1UeXBlKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIEFwaU9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSBpdGVtVHlwZTtcclxuICAgICAgICBpZiAoIWRhdGEpIGRhdGEgPSB7fTtcclxuICAgICAgICBpZiAoIWRhdGEuaXRlbXMpIHRoaXMucHJvcChcIml0ZW1zXCIsIGRhdGEuaXRlbXMgPSBbXSk7XHJcbiAgICAgICAgaWYgKGRhdGEuaXRlbXMubGVuZ3RoID4gMCkgdGhpcy5hZGQoZGF0YS5pdGVtcywgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5vbignc3luYycsIGZ1bmN0aW9uIChyYXcpIHtcclxuICAgICAgICAgICAgaWYgKHJhdyAmJiByYXcuaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlQWxsKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZChyYXcuaXRlbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB1dGlscy5leHRlbmQobmV3IEFwaU9iamVjdCgpLCB7XHJcbiAgICAgICAgaXNDb2xsZWN0aW9uOiB0cnVlLFxyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IsXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbiAobmV3SXRlbXMsIC8qcHJpdmF0ZSovIG5vVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5nZXRUeXBlKG5ld0l0ZW1zKSAhPT0gXCJBcnJheVwiKSBuZXdJdGVtcyA9IFtuZXdJdGVtc107XHJcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMsIHV0aWxzLm1hcChuZXdJdGVtcywgY29udmVydEl0ZW0sIHRoaXMpKTtcclxuICAgICAgICAgICAgaWYgKCFub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJhd0l0ZW1zID0gdGhpcy5wcm9wKFwiaXRlbXNcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3AoXCJpdGVtc1wiLCByYXdJdGVtcy5jb25jYXQobmV3SXRlbXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaW5kZXhPckl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPckl0ZW07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXhPckl0ZW0gIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gdXRpbHMuaW5kZXhPZih0aGlzLCBpbmRleE9ySXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5jYWxsKHRoaXMsIGluZGV4LCAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uKG5ld0l0ZW1zLCBub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHRoaXMsIFswLCB0aGlzLmxlbmd0aF0uY29uY2F0KHV0aWxzLm1hcChuZXdJdGVtcywgY29udmVydEl0ZW0sIHRoaXMpKSk7XHJcbiAgICAgICAgICAgIGlmICghbm9VcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcChcIml0ZW1zXCIsIG5ld0l0ZW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlQWxsOiBmdW5jdGlvbihub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwodGhpcywgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAoIW5vVXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3AoXCJpdGVtc1wiLCBbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEluZGV4OiBmdW5jdGlvbiAobmV3SW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jdXJyZW50SW5kZXg7XHJcbiAgICAgICAgICAgIGlmICghaW5kZXggJiYgaW5kZXggIT09IDApIGluZGV4ID0gdGhpcy5wcm9wKFwic3RhcnRJbmRleFwiKTtcclxuICAgICAgICAgICAgaWYgKCFpbmRleCAmJiBpbmRleCAhPT0gMCkgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRJbmRleDogZnVuY3Rpb24obmV3SW5kZXgsIHJlcSkge1xyXG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMuZ2V0KHV0aWxzLmV4dGVuZChyZXEsIHsgc3RhcnRJbmRleDogbmV3SW5kZXh9KSk7XHJcbiAgICAgICAgICAgIHAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBtZS5jdXJyZW50SW5kZXggPSBuZXdJbmRleDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmlyc3RQYWdlOiBmdW5jdGlvbihyZXEpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoKTtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJbmRleCA9PT0gMCkgdGhyb3cgXCJUaGlzIFwiICsgdGhpcy50eXBlICsgXCIgY29sbGVjdGlvbiBpcyBhbHJlYWR5IGF0IHJlY29yZCAwIGFuZCBoYXMgbm8gcHJldmlvdXMgcGFnZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SW5kZXgoMCwgcmVxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZQYWdlOiBmdW5jdGlvbiAocmVxKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmdldEluZGV4KCksXHJcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZSA9IHRoaXMucHJvcChcInBhZ2VTaXplXCIpLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSBNYXRoLm1heChjdXJyZW50SW5kZXggLSBwYWdlU2l6ZSwgMCk7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50SW5kZXggPT09IDApIHRocm93IFwiVGhpcyBcIiArIHRoaXMudHlwZSArIFwiIGNvbGxlY3Rpb24gaXMgYWxyZWFkeSBhdCByZWNvcmQgMCBhbmQgaGFzIG5vIHByZXZpb3VzIHBhZ2UuXCI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEluZGV4KG5ld0luZGV4LCByZXEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dFBhZ2U6IGZ1bmN0aW9uIChyZXEpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoKSxcclxuICAgICAgICAgICAgICAgIHBhZ2VTaXplID0gdGhpcy5wcm9wKFwicGFnZVNpemVcIiksXHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCA9IGN1cnJlbnRJbmRleCArIHBhZ2VTaXplO1xyXG4gICAgICAgICAgICBpZiAoIShuZXdJbmRleCA8IHRoaXMucHJvcChcInRvdGFsQ291bnRcIikpKSB0aHJvdyBcIlRoaXMgXCIgKyB0aGlzLnR5cGUgKyBcIiBjb2xsZWN0aW9uIGlzIGFscmVhZHkgYXQgaXRzIGxhc3QgcGFnZSBhbmQgaGFzIG5vIG5leHQgcGFnZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SW5kZXgobmV3SW5kZXgsIHJlcSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXN0UGFnZTogZnVuY3Rpb24gKHJlcSkge1xyXG4gICAgICAgICAgICB2YXIgdG90YWxDb3VudCA9IHRoaXMucHJvcChcInRvdGFsQ291bnRcIiksXHJcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZSA9IHRoaXMucHJvcChcInBhZ2VTaXplXCIpLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSB0b3RhbENvdW50IC0gcGFnZVNpemU7XHJcbiAgICAgICAgICAgIGlmIChuZXdJbmRleCA8PSAwKSB0aHJvdyBcIlRoaXMgXCIgKyB0aGlzLnR5cGUgKyBcIiBjb2xsZWN0aW9uIGhhcyBvbmx5IG9uZSBwYWdlLlwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRJbmRleChuZXdJbmRleCwgcmVxKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IudHlwZXMgPSB7XHJcbiAgICAgICAgbG9jYXRpb25zOiByZXF1aXJlKCcuL3R5cGVzL2xvY2F0aW9ucycpXHJcbiAgICB9O1xyXG4gICAgQXBpQ29sbGVjdGlvbkNvbnN0cnVjdG9yLmh5ZHJhdGVkVHlwZXMgPSB7fTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IuZ2V0SHlkcmF0ZWRUeXBlID0gQXBpT2JqZWN0LmdldEh5ZHJhdGVkVHlwZTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IuY3JlYXRlID0gZnVuY3Rpb24gKHR5cGUsIGRhdGEsIGFwaSwgaXRlbVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3ICh0eXBlIGluIHRoaXMudHlwZXMgPyB0aGlzLnR5cGVzW3R5cGVdIDogdGhpcykodHlwZSwgZGF0YSwgYXBpLCBpdGVtVHlwZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3Rvci5jcmVhdGUgPSBmdW5jdGlvbiAodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgaXRlbVR5cGUpIHtcclxuICAgICAgICB2YXIgQXBpQ29sbGVjdGlvblR5cGUgPSB0aGlzLmdldEh5ZHJhdGVkVHlwZSh0eXBlTmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgQXBpQ29sbGVjdGlvblR5cGUodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgaXRlbVR5cGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3RvcjtcclxuXHJcbi8vIEVORCBPQkpFQ1RcclxuXHJcbi8qKioqKioqKioqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIERFRkFVTFRfV0lTSExJU1RfTkFNRTogJ215X3dpc2hsaXN0JyxcclxuICAgIFBBWU1FTlRfU1RBVFVTRVM6IHtcclxuICAgICAgICBORVc6IFwiTmV3XCJcclxuICAgIH0sXHJcbiAgICBQQVlNRU5UX0FDVElPTlM6IHtcclxuICAgICAgICBWT0lEOiBcIlZvaWRQYXltZW50XCJcclxuICAgIH0sXHJcbiAgICBPUkRFUl9TVEFUVVNFUzoge1xyXG4gICAgICAgIEFCQU5ET05FRDogXCJBYmFuZG9uZWRcIixcclxuICAgICAgICBBQ0NFUFRFRDogXCJBY2NlcHRlZFwiLFxyXG4gICAgICAgIENBTkNFTExFRDogXCJDYW5jZWxsZWRcIixcclxuICAgICAgICBDT01QTEVURUQ6IFwiQ29tcGxldGVkXCIsXHJcbiAgICAgICAgQ1JFQVRFRDogXCJDcmVhdGVkXCIsXHJcbiAgICAgICAgUEVORElOR19SRVZJRVc6IFwiUGVuZGluZ1Jldmlld1wiLFxyXG4gICAgICAgIFBST0NFU1NJTkc6IFwiUHJvY2Vzc2luZ1wiLFxyXG4gICAgICAgIFNVQk1JVFRFRDogXCJTdWJtaXR0ZWRcIixcclxuICAgICAgICBWQUxJREFURUQ6IFwiVmFsaWRhdGVkXCJcclxuICAgIH0sXHJcbiAgICBPUkRFUl9BQ1RJT05TOiB7XHJcbiAgICAgICAgQ1JFQVRFX09SREVSOiBcIkNyZWF0ZU9yZGVyXCIsXHJcbiAgICAgICAgU1VCTUlUX09SREVSOiBcIlN1Ym1pdE9yZGVyXCIsXHJcbiAgICAgICAgQUNDRVBUX09SREVSOiBcIkFjY2VwdE9yZGVyXCIsXHJcbiAgICAgICAgVkFMSURBVEVfT1JERVI6IFwiVmFsaWRhdGVPcmRlclwiLFxyXG4gICAgICAgIFNFVF9PUkRFUl9BU19QUk9DRVNTSU5HOiBcIlNldE9yZGVyQXNQcm9jZXNzaW5nXCIsXHJcbiAgICAgICAgQ09NUExFVEVfT1JERVI6IFwiQ29tcGxldGVPcmRlclwiLFxyXG4gICAgICAgIENBTkNFTF9PUkRFUjogXCJDYW5jZWxPcmRlclwiLFxyXG4gICAgICAgIFJFT1BFTl9PUkRFUjogXCJSZW9wZW5PcmRlclwiXHJcbiAgICB9LFxyXG4gICAgRlVMRklMTE1FTlRfTUVUSE9EUzoge1xyXG4gICAgICAgIFNISVA6IFwiU2hpcFwiLFxyXG4gICAgICAgIFBJQ0tVUDogXCJQaWNrdXBcIlxyXG4gICAgfVxyXG59O1xyXG4iLCIvLyBCRUdJTiBDT05URVhUXHJcbi8qKlxyXG4gKiBAY2xhc3NcclxuICogQGNsYXNzZGVzYyBUaGUgY29udGV4dCBvYmplY3QgaGVscHMgeW91IGNvbmZpZ3VyZSB0aGUgU0RLIHRvIGNvbm5lY3QgdG8gYSBwYXJ0aWN1bGFyIE1venUgc2l0ZS4gU3VwcGx5IGl0IHdpdGggdGVuYW50LCBzaXRlLCBtYXN0ZXJjYXRhbG9nLCBjdXJyZW5jeSBjb2RlLCBsb2NhbGUgY29kZSwgYXBwIGNsYWltcywgYW5kIHVzZXIgY2xhaW1zLCBhbmQgIGl0IHdpbGwgcHJvZHVjZSBmb3IgeW91IGFuIEFwaUludGVyZmFjZSBvYmplY3QuXHJcbiAqL1xyXG5cclxudmFyIEFwaUludGVyZmFjZSA9IHJlcXVpcmUoJy4vaW50ZXJmYWNlJyk7XHJcbnZhciBBcGlSZWZlcmVuY2UgPSByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG4vKipcclxuICogQHByaXZhdGVcclxuICovXHJcbnZhciBBcGlDb250ZXh0Q29uc3RydWN0b3IgPSBmdW5jdGlvbihjb25mKSB7XHJcbiAgICB1dGlscy5leHRlbmQodGhpcywgY29uZik7XHJcbiAgICBpZiAoQXBpQ29udGV4dENvbnN0cnVjdG9yLl9fZGVidWdfXyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIEFwaUNvbnRleHRDb25zdHJ1Y3Rvci5fX2RlYnVnX18gPSByZXF1aXJlKCd3aGVuL21vbml0b3IvY29uc29sZScpO1xyXG4gICAgfVxyXG59LFxyXG4gICAgbXV0YWJsZUFjY2Vzc29ycyA9IFsnYXBwLWNsYWltcycsICd1c2VyLWNsYWltcycsICdjYWxsY2hhaW4nLCAnY3VycmVuY3knLCAnbG9jYWxlJ10sIC8vLCAnYnlwYXNzLWNhY2hlJ10sXHJcbiAgICBpbW11dGFibGVBY2Nlc3NvcnMgPSBbJ3RlbmFudCcsICdzaXRlJywgJ21hc3Rlci1jYXRhbG9nJ10sXHJcbiAgICBpbW11dGFibGVBY2Nlc3Nvckxlbmd0aCA9IGltbXV0YWJsZUFjY2Vzc29ycy5sZW5ndGgsXHJcbiAgICBhbGxBY2Nlc3NvcnMgPSBtdXRhYmxlQWNjZXNzb3JzLmNvbmNhdChpbW11dGFibGVBY2Nlc3NvcnMpLFxyXG4gICAgYWxsQWNjZXNzb3JzTGVuZ3RoID0gYWxsQWNjZXNzb3JzLmxlbmd0aCxcclxuICAgIGo7XHJcblxyXG52YXIgc2V0SW1tdXRhYmxlQWNjZXNzb3IgPSBmdW5jdGlvbihwcm9wTmFtZSkge1xyXG4gICAgQXBpQ29udGV4dENvbnN0cnVjdG9yLnByb3RvdHlwZVt1dGlscy5jYW1lbENhc2UocHJvcE5hbWUsIHRydWUpXSA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXNbcHJvcE5hbWVdO1xyXG4gICAgICAgIHZhciBuZXdDb25mID0gdGhpcy5hc09iamVjdCgpO1xyXG4gICAgICAgIG5ld0NvbmZbcHJvcE5hbWVdID0gdmFsO1xyXG4gICAgICAgIHJldHVybiBuZXcgQXBpQ29udGV4dENvbnN0cnVjdG9yKG5ld0NvbmYpO1xyXG4gICAgfTtcclxufTtcclxuXHJcbnZhciBzZXRNdXRhYmxlQWNjZXNzb3IgPSBmdW5jdGlvbihwcm9wTmFtZSkge1xyXG4gICAgQXBpQ29udGV4dENvbnN0cnVjdG9yLnByb3RvdHlwZVt1dGlscy5jYW1lbENhc2UocHJvcE5hbWUsIHRydWUpXSA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXNbcHJvcE5hbWVdO1xyXG4gICAgICAgIHRoaXNbcHJvcE5hbWVdID0gdmFsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxufTtcclxuXHJcbkFwaUNvbnRleHRDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XHJcbiAgICBjb25zdHJ1Y3RvcjogQXBpQ29udGV4dENvbnN0cnVjdG9yLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBvciBjcmVhdGVzIHRoZSBgQXBpSW50ZXJmYWNlYCBmb3IgdGhpcyBjb250ZXh0IHRoYXQgd2lsbCBkbyBhbGwgdGhlIHJlYWwgd29yay5cclxuICAgICAqIENhbGwgdGhpcyBtZXRob2Qgb25seSB3aGVuIHlvdSd2ZSBidWlsdCBhIGNvbXBsZXRlIGNvbnRleHQgaW5jbHVkaW5nIHRlbmFudCwgc2l0ZSwgbWFzdGVyIGNhdGFsb2csXHJcbiAgICAgKiBsb2NhbGUsIGN1cnJlbmN5IGNvZGUsIGFwcCBjbGFpbXMsIGFuZCB1c2VyIGNsYWltcy4gQXNzaWduIGl0cyByZXR1cm4gdmFsdWUgdG8gYSBsb2NhbCB2YXJpYWJsZS5cclxuICAgICAqIFlvdSdsbCB1c2UgdGhpcyBpbnRlcmZhY2Ugb2JqZWN0IHRvIGNyZWF0ZSB5b3VyIGBBcGlPYmplY3RgcyBhbmQgZG8gQVBJIHJlcXVlc3RzIVxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBBcGlDb250ZXh0I1xyXG4gICAgICogQHJldHVybnMge0FwaUludGVyZmFjZX0gVGhlIHNpbmdsZSBgQXBpSW50ZXJmYWNlYCBmb3IgdGhpcyBjb250ZXh0LlxyXG4gICAgICogQHRocm93cyB7UmVmZXJlbmNlRXJyb3J9IGlmIHRoZSBjb250ZXh0IGlzIG5vdCB5ZXQgY29tcGxldGUuXHJcbiAgICAgKi9cclxuICAgIGFwaTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwaUluc3RhbmNlIHx8ICh0aGlzLl9hcGlJbnN0YW5jZSA9IG5ldyBBcGlJbnRlcmZhY2UodGhpcykpO1xyXG4gICAgfSxcclxuICAgIFN0b3JlOiBmdW5jdGlvbihjb25mKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBBcGlDb250ZXh0Q29uc3RydWN0b3IoY29uZik7XHJcbiAgICB9LFxyXG4gICAgYXNPYmplY3Q6IGZ1bmN0aW9uKHByZWZpeCkge1xyXG4gICAgICAgIHZhciBvYmogPSB7fTtcclxuICAgICAgICBwcmVmaXggPSBwcmVmaXggfHwgJyc7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxBY2Nlc3NvcnNMZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBvYmpbcHJlZml4ICsgYWxsQWNjZXNzb3JzW2ldXSA9IHRoaXNbYWxsQWNjZXNzb3JzW2ldXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH0sXHJcbiAgICBzZXRTZXJ2aWNlVXJsczogZnVuY3Rpb24odXJscykge1xyXG4gICAgICAgIEFwaVJlZmVyZW5jZS51cmxzID0gdXJscztcclxuICAgIH0sXHJcbiAgICBnZXRTZXJ2aWNlVXJsczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmV4dGVuZCh7fSwgQXBpUmVmZXJlbmNlLnVybHMpO1xyXG4gICAgfSxcclxuICAgIGN1cnJlbmN5OiAndXNkJyxcclxuICAgIGxvY2FsZTogJ2VuLVVTJ1xyXG59O1xyXG5cclxuZm9yIChqID0gMDsgaiA8IGltbXV0YWJsZUFjY2Vzc29ycy5sZW5ndGg7IGorKykgc2V0SW1tdXRhYmxlQWNjZXNzb3IoaW1tdXRhYmxlQWNjZXNzb3JzW2pdKTtcclxuZm9yIChqID0gMDsgaiA8IG11dGFibGVBY2Nlc3NvcnMubGVuZ3RoOyBqKyspIHNldE11dGFibGVBY2Nlc3NvcihtdXRhYmxlQWNjZXNzb3JzW2pdKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBpQ29udGV4dENvbnN0cnVjdG9yO1xyXG5cclxuLy8gRU5EIENPTlRFWFRcclxuXHJcbi8qKioqKioqKi8iLCIvLyBCRUdJTiBFUlJPUlNcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG5cclxuZnVuY3Rpb24gZXJyb3JUb1N0cmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLm5hbWUgKyBcIjogXCIgKyB0aGlzLm1lc3NhZ2U7XHJcbn1cclxuXHJcbnZhciBlcnJvclR5cGVzID0ge307XHJcblxyXG52YXIgZXJyb3JzID0ge1xyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGNvZGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvZGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucmVnaXN0ZXIoaSwgY29kZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnJvclR5cGVzW2NvZGVdID0ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlOiBmdW5jdGlvbihjb2RlKSB7XHJcbiAgICAgICAgdmFyIG1zZyA9IHV0aWxzLmZvcm1hdFN0cmluZy5hcHBseSh1dGlscywgW2Vycm9yVHlwZXNbY29kZV0ubWVzc2FnZV0uY29uY2F0KHV0aWxzLnNsaWNlKGFyZ3VtZW50cywgMSkpKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lOiBjb2RlLFxyXG4gICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAgbWVzc2FnZTogbXNnLFxyXG4gICAgICAgICAgICBodG1sTWVzc2FnZTogbXNnLFxyXG4gICAgICAgICAgICB0b1N0cmluZzogZXJyb3JUb1N0cmluZ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgdGhyb3dPbk9iamVjdDogZnVuY3Rpb24ob2JqLCBjb2RlKSB7XHJcbiAgICAgICAgdmFyIGVycm9yID0gZXJyb3JzLmNyZWF0ZS5hcHBseShlcnJvcnMsIFtjb2RlXS5jb25jYXQodXRpbHMuc2xpY2UoYXJndW1lbnRzLCAyKSkpO1xyXG4gICAgICAgIG9iai5maXJlKCdlcnJvcicsIGVycm9yKTtcclxuICAgICAgICBvYmouYXBpLmZpcmUoJ2Vycm9yJywgZXJyb3IsIG9iaik7XHJcbiAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9LFxyXG4gICAgcGFzc0Zyb206IGZ1bmN0aW9uKGZyb20sIHRvKSB7XHJcbiAgICAgICAgZnJvbS5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdG8uZmlyZS5hcHBseSh0bywgWydlcnJvciddLmNvbmNhdCh1dGlscy5zbGljZShhcmd1bWVudHMpKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9ycztcclxuLy8gRU5EIEVSUk9SUyIsIi8vIEJFR0lOIElGUkFNRVhIUlxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICB2YXIgaGFzUG9zdE1lc3NhZ2UgPSB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiT3BlcmFcIikgPT09IC0xLFxyXG4gICAgICAgIGZpcmVmb3hWZXJzaW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCxcclxuICAgICAgICAgICAgICAgIHJlID0gL0ZpcmVmb3hcXC8oXFxkKykvaSxcclxuICAgICAgICAgICAgICAgIG1hdGNoID0gdWEubWF0Y2gocmUpLFxyXG4gICAgICAgICAgICAgICAgdmVyc2lvblN0ciA9IHBhcnNlSW50KG1hdGNoID8gKG1hdGNoWzFdIHx8IGZhbHNlKSA6IGZhbHNlKSxcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSBpc05hTih2ZXJzaW9uU3RyKSA/IGZhbHNlIDogdmVyc2lvblN0cjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xyXG4gICAgICAgIH0oKSksXHJcbiAgICAgICAgY2FjaGVCdXN0ID0gMSxcclxuICAgICAgICBoYXNoUkUgPSAvXiM/XFxkKyYvLFxyXG4gICAgICAgIG9yaWdpblJFID0gL15odHRwcz86XFwvXFwvW14vXSsvaSxcclxuICAgICAgICB2YWxpZGF0ZU9yaWdpbiA9IGZ1bmN0aW9uIChpeGhyLCBvcmlnaW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl4aHIuZnJhbWVPcmlnaW4gPT09IG9yaWdpbi50b0xvd2VyQ2FzZSgpLm1hdGNoKG9yaWdpblJFKVswXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1lc3NhZ2VEZWxpbWl0ZXIgPSAnfHx8fHwnLFxyXG4gICAgICAgIG1lc3NhZ2VNZXRob2RzID0gaGFzUG9zdE1lc3NhZ2UgPyB7XHJcbiAgICAgICAgICAgIGxpc3RlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlTGlzdGVuZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZSkgZSA9IHdpbmRvdy5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlT3JpZ2luKHNlbGYsIGUub3JpZ2luKSkgdGhyb3cgbmV3IEVycm9yKFwiT3JpZ2luIFwiICsgZS5vcmlnaW4gKyBcIiBkb2VzIG5vdCBtYXRjaCByZXF1aXJlZCBvcmlnaW4gXCIgKyBzZWxmLmZyYW1lT3JpZ2luKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5kYXRhID09PSBcInJlYWR5XCIpIHJldHVybiBzZWxmLnBvc3RNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi51cGRhdGUoZS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUxpc3RlbmVyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBvc3RNZXNzYWdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGcmFtZVdpbmRvdygpLnBvc3RNZXNzYWdlKHRoaXMuZ2V0TWVzc2FnZSgpLCB0aGlzLmZyYW1lT3JpZ2luKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGV0YWNoTGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMubWVzc2FnZUxpc3RlbmVyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IDoge1xyXG4gICAgICAgICAgICBsaXN0ZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oYXNoID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaDtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc2VsZi5oYXNoLnJlcGxhY2UoaGFzaFJFLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuaGFzaCAhPT0gc2VsZi5sYXN0SGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gXCJyZWFkeVwiKSByZXR1cm4gc2VsZi5wb3N0TWVzc2FnZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc2hSRS50ZXN0KHNlbGYuaGFzaCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubGFzdEhhc2ggPSBzZWxmLmhhc2g7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBvc3RNZXNzYWdlOiBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRGcmFtZVdpbmRvdygpLmxvY2F0aW9uID0gdGhpcy5mcmFtZVVybC5yZXBsYWNlKC8jLiokLywgJycpICsgJyMnICsgKCtuZXcgRGF0ZSkgKyAoY2FjaGVCdXN0KyspICsgJyYnICsgdGhpcy5nZXRNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRldGFjaExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB2YXIgSWZyYW1lWE1MSHR0cFJlcXVlc3QgPSBmdW5jdGlvbiAoZnJhbWVVcmwpIHtcclxuICAgICAgICB2YXIgZnJhbWVNYXRjaCA9IGZyYW1lVXJsLm1hdGNoKG9yaWdpblJFKTtcclxuICAgICAgICBpZiAoIWZyYW1lTWF0Y2ggfHwgIWZyYW1lTWF0Y2hbMF0pIHRocm93IG5ldyBFcnJvcihmcmFtZVVybCArIFwiIGRvZXMgbm90IHNlZW0gdG8gaGF2ZSBhIHZhbGlkIG9yaWdpbi5cIik7XHJcbiAgICAgICAgdGhpcy5mcmFtZU9yaWdpbiA9IGZyYW1lTWF0Y2hbMF0udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB0aGlzLmZyYW1lVXJsID0gZnJhbWVVcmwgKyBcIj8mcGFyZW50dXJsPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpICsgXCImcGFyZW50ZG9tYWluPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3QpICsgXCImbWVzc2FnZWRlbGltaXRlcj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChtZXNzYWdlRGVsaW1pdGVyKTtcclxuICAgICAgICB0aGlzLmhlYWRlcnMgPSB7fTtcclxuICAgIH07XHJcblxyXG4gICAgdXRpbHMuZXh0ZW5kKElmcmFtZVhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZSwgbWVzc2FnZU1ldGhvZHMsIHtcclxuICAgICAgICByZWFkeVN0YXRlOiAwLFxyXG4gICAgICAgIHN0YXR1czogMCxcclxuICAgICAgICBvcGVuOiBmdW5jdGlvbiAobWV0aG9kLCB1cmwpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gMTtcclxuICAgICAgICAgICAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XHJcbiAgICAgICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VuZDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlQm9keSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlSWZyYW1lKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVJZnJhbWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS53aWR0aCA9ICcxcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5oZWlnaHQgPSAnMXB4JztcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3JjID0gdGhpcy5mcmFtZVVybDtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmlmcmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRSZXF1ZXN0SGVhZGVyOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhlYWRlcnNba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgbXNnID0gW3RoaXMudXJsLCB0aGlzLm1lc3NhZ2VCb2R5LCB0aGlzLm1ldGhvZF07XHJcbiAgICAgICAgICAgIGZvciAodmFyIGhlYWRlciBpbiB0aGlzLmhlYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIG1zZy5wdXNoKGhlYWRlciwgdGhpcy5oZWFkZXJzW2hlYWRlcl0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtc2cuam9pbihtZXNzYWdlRGVsaW1pdGVyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9ucmVhZHlzdGF0ZWNoYW5nZTogZnVuY3Rpb24gKCkgeyB9LFxyXG4gICAgICAgIGdldEZyYW1lV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93IHx8IHRoaXMuaWZyYW1lO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xlYW51cDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmICghc2VsZi5kZXN0cm95ZWQpIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kZXRhY2hMaXN0ZW5lcnMoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuaWZyYW1lLnBhcmVudE5vZGUgJiYgc2VsZi5pZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWxmLmlmcmFtZSk7XHJcbiAgICAgICAgICAgIH0sIDI1MCk7XHJcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBkYXRhID0gZGF0YS5zcGxpdChtZXNzYWdlRGVsaW1pdGVyKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gcGFyc2VJbnQoZGF0YVswXSkgfHwgMDtcclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBwYXJzZUludChkYXRhWzFdKSB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlVGV4dCA9IGRhdGFbMl07XHJcbiAgICAgICAgICAgIHRoaXMub25yZWFkeXN0YXRlY2hhbmdlKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHRoaXMuY2xlYW51cCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWJvcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFudXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gSWZyYW1lWE1MSHR0cFJlcXVlc3Q7XHJcblxyXG59KHdpbmRvdywgZG9jdW1lbnQpKTtcclxuLy8gRU5EIElGUkFNRVhIUiIsIi8vIEJFR0lOIElOSVRcclxudmFyIEFwaUNvbnRleHQgPSByZXF1aXJlKCcuL2NvbnRleHQnKTtcclxudmFyIGluaXRpYWxHbG9iYWxDb250ZXh0ID0gbmV3IEFwaUNvbnRleHQoKTtcclxubW9kdWxlLmV4cG9ydHMgPSBpbml0aWFsR2xvYmFsQ29udGV4dDtcclxuLy8gRU5EIElOSVQiLCIvLyBFWFBPU0UgREVCVUdHSU5HIFNUVUZGXHJcbnZhciBfaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xyXG5cclxuX2luaXQuVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbl9pbml0LkFwaUNvbnRleHQgPSByZXF1aXJlKCcuL2NvbnRleHQnKTtcclxuX2luaXQuQXBpSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9pbnRlcmZhY2UnKTtcclxuX2luaXQuQXBpT2JqZWN0ID0gcmVxdWlyZSgnLi9vYmplY3QnKTtcclxuX2luaXQuQXBpQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbicpO1xyXG5faW5pdC5BcGlSZWZlcmVuY2UgPSByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG5cclxuX2luaXQuX2V4cG9zZSA9IGZ1bmN0aW9uIChyKSB7XHJcbiAgICBfaW5pdC5sYXN0UmVzdWx0ID0gcjtcclxuICAgIGNvbnNvbGUubG9nKHIgJiYgci5pbnNwZWN0ID8gci5pbnNwZWN0KCkgOiByKTtcclxufTtcclxuXHJcbl9pbml0LkFwaU9iamVjdC5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEsIHRydWUsIDIpO1xyXG59O1xyXG5cclxuX2luaXQuQXBpQ29udGV4dC5fX2RlYnVnX18gPSB0cnVlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBfaW5pdDsiLCIvKipcclxuICogQGV4dGVybmFsIFByb21pc2VcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy93aGVuL2Jsb2IvbWFzdGVyL2RvY3MvYXBpLm1kI3Byb21pc2UgV2hlbkpTL1Byb21pc2V9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEF0dGFjaCBoYW5kbGVycyB0byBhbmQgdHJhbnNmb3JtIHRoZSBwcm9taXNlLlxyXG4gKiBAZnVuY3Rpb24gZXh0ZXJuYWw6UHJvbWlzZSN0aGVuXHJcbiAqIEByZXR1cm5zIGV4dGVybmFsOlByb21pc2UjXHJcbiAqL1xyXG5cclxuLy8gQkVHSU4gSU5URVJGQUNFXHJcbi8qKlxyXG4gKiBAY2xhc3NcclxuICogQGNsYXNzZGVzYyBUaGUgaW50ZXJmYWNlIG9iamVjdCBtYWtlcyByZXF1ZXN0cyB0byB0aGUgQVBJIGFuZCByZXR1cm5zIEFQSSBvYmplY3QuIFlvdSBjYW4gdXNlIGl0IHRvIG1ha2UgcmF3IHJlcXVlc3RzIHVzaW5nIHRoZSBBcGlJbnRlcmZhY2UjcmVxdWVzdCBtZXRob2QsIGJ1dCB5b3UncmUgbW9yZSBsaWtlbHkgdG8gdXNlIHRoZSBBcGlJbnRlcmZhY2UjYWN0aW9uIG1ldGhvZCB0byBjcmVhdGUgYSBleHRlcm5hbDpQcm9taXNlIyB0aGF0IHJldHVybnMgYW4gQXBpT2JqZWN0Iy5cclxuICovXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIEFwaVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vcmVmZXJlbmNlJyk7XHJcbnZhciBBcGlPYmplY3QgPSByZXF1aXJlKCcuL29iamVjdCcpO1xyXG5cclxudmFyIGVycm9yTWVzc2FnZSA9IFwiTm8gezB9IHdhcyBzcGVjaWZpZWQuIFJ1biBNb3p1LlRlbmFudCh0ZW5hbnRJZCkuTWFzdGVyQ2F0YWxvZyhtYXN0ZXJDYXRhbG9nSWQpLlNpdGUoc2l0ZUlkKS5cIixcclxuICAgIHJlcXVpcmVkQ29udGV4dFZhbHVlcyA9IFsnVGVuYW50JywgJ01hc3RlckNhdGFsb2cnLCAnU2l0ZSddO1xyXG52YXIgQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IgPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcmVxdWlyZWRDb250ZXh0VmFsdWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHRbcmVxdWlyZWRDb250ZXh0VmFsdWVzW2ldXSgpID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihlcnJvck1lc3NhZ2Uuc3BsaXQoJ3swfScpLmpvaW4ocmVxdWlyZWRDb250ZXh0VmFsdWVzW2ldKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG59O1xyXG5cclxuQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IucHJvdG90eXBlID0ge1xyXG4gICAgY29uc3RydWN0b3I6IEFwaUludGVyZmFjZUNvbnN0cnVjdG9yLFxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgQXBpSW50ZXJmYWNlI1xyXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2UjfVxyXG4gICAgICovXHJcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihtZXRob2QsIHJlcXVlc3RDb25mLCBjb25mKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICAgICAgdXJsID0gdHlwZW9mIHJlcXVlc3RDb25mID09PSBcInN0cmluZ1wiID8gcmVxdWVzdENvbmYgOiByZXF1ZXN0Q29uZi51cmw7XHJcbiAgICAgICAgaWYgKHJlcXVlc3RDb25mLnZlcmIpXHJcbiAgICAgICAgICAgIG1ldGhvZCA9IHJlcXVlc3RDb25mLnZlcmI7XHJcblxyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9IG1lLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBkYXRhO1xyXG4gICAgICAgIGlmIChyZXF1ZXN0Q29uZi5vdmVycmlkZVBvc3REYXRhKSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSByZXF1ZXN0Q29uZi5vdmVycmlkZVBvc3REYXRhO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29uZiAmJiAhcmVxdWVzdENvbmYubm9Cb2R5KSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSBjb25mLmRhdGEgfHwgY29uZjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjb250ZXh0SGVhZGVycyA9IHRoaXMuY29udGV4dC5hc09iamVjdChcIngtdm9sLVwiKTtcclxuXHJcbiAgICAgICAgdmFyIHhociA9IHV0aWxzLnJlcXVlc3QobWV0aG9kLCB1cmwsIGNvbnRleHRIZWFkZXJzLCBkYXRhLCBmdW5jdGlvbihyYXdKU09OKSB7XHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBjb250ZXh0IHdpdGggcmVzcG9uc2UgaGVhZGVyc1xyXG4gICAgICAgICAgICBtZS5maXJlKCdzdWNjZXNzJywgcmF3SlNPTiwgeGhyLCByZXF1ZXN0Q29uZik7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmF3SlNPTiwgeGhyKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IsIHhociwgdXJsKTtcclxuICAgICAgICB9LCByZXF1ZXN0Q29uZi5pZnJhbWVUcmFuc3BvcnRVcmwpO1xyXG5cclxuICAgICAgICB2YXIgY2FuY2VsbGVkID0gZmFsc2UsXHJcbiAgICAgICAgICAgIGNhbmNlbGxlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KFwiUmVxdWVzdCBjYW5jZWxsZWQuXCIpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZmlyZSgncmVxdWVzdCcsIHhociwgY2FuY2VsbGVyLCBkZWZlcnJlZC5wcm9taXNlLCByZXF1ZXN0Q29uZiwgY29uZik7XHJcblxyXG4gICAgICAgIGRlZmVycmVkLnByb21pc2Uub3RoZXJ3aXNlKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHZhciByZXM7XHJcbiAgICAgICAgICAgIGlmICghY2FuY2VsbGVkKSB7XHJcbiAgICAgICAgICAgICAgICBtZS5maXJlKCdlcnJvcicsIGVycm9yLCB4aHIsIHJlcXVlc3RDb25mKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBBcGlJbnRlcmZhY2UjXHJcbiAgICAgKiBAcmV0dXJucyBleHRlcm5hbDpQcm9taXNlI1xyXG4gICAgICovXHJcbiAgICBhY3Rpb246IGZ1bmN0aW9uKGluc3RhbmNlT3JUeXBlLCBhY3Rpb25OYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICAgICAgb2JqID0gaW5zdGFuY2VPclR5cGUgaW5zdGFuY2VvZiBBcGlPYmplY3QgPyBpbnN0YW5jZU9yVHlwZSA6IG1lLmNyZWF0ZVN5bmMoaW5zdGFuY2VPclR5cGUpLFxyXG4gICAgICAgICAgICB0eXBlID0gb2JqLnR5cGU7XHJcblxyXG4gICAgICAgIG9iai5maXJlKCdhY3Rpb24nLCBhY3Rpb25OYW1lLCBkYXRhKTtcclxuICAgICAgICBtZS5maXJlKCdhY3Rpb24nLCBvYmosIGFjdGlvbk5hbWUsIGRhdGEpO1xyXG4gICAgICAgIHZhciByZXF1ZXN0Q29uZiA9IEFwaVJlZmVyZW5jZS5nZXRSZXF1ZXN0Q29uZmlnKGFjdGlvbk5hbWUsIHR5cGUsIGRhdGEgfHwgb2JqLmRhdGEsIG1lLmNvbnRleHQsIG9iaik7XHJcblxyXG4gICAgICAgIGlmICgoYWN0aW9uTmFtZSA9PSBcInVwZGF0ZVwiIHx8IGFjdGlvbk5hbWUgPT0gXCJjcmVhdGVcIikgJiYgIWRhdGEpIHtcclxuICAgICAgICAgICAgZGF0YSA9IG9iai5kYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1lLnJlcXVlc3QoQXBpUmVmZXJlbmNlLmJhc2ljT3BzW2FjdGlvbk5hbWVdLCByZXF1ZXN0Q29uZiwgZGF0YSkudGhlbihmdW5jdGlvbihyYXdKU09OKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0Q29uZi5yZXR1cm5UeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJuT2JqID0gQXBpT2JqZWN0LmNyZWF0ZShyZXF1ZXN0Q29uZi5yZXR1cm5UeXBlLCByYXdKU09OLCBtZSk7XHJcbiAgICAgICAgICAgICAgICBvYmouZmlyZSgnc3Bhd24nLCByZXR1cm5PYmopO1xyXG4gICAgICAgICAgICAgICAgbWUuZmlyZSgnc3Bhd24nLCByZXR1cm5PYmosIG9iaik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0dXJuT2JqO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJhd0pTT04gfHwgcmF3SlNPTiA9PT0gMCB8fCByYXdKU09OID09PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICBvYmouZGF0YSA9IHV0aWxzLmNsb25lKHJhd0pTT04pO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai51bnN5bmNlZDtcclxuICAgICAgICAgICAgICAgIG9iai5maXJlKCdzeW5jJywgcmF3SlNPTiwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgbWUuZmlyZSgnc3luYycsIG9iaiwgcmF3SlNPTiwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9ySlNPTikge1xyXG4gICAgICAgICAgICBvYmouZmlyZSgnZXJyb3InLCBlcnJvckpTT04pO1xyXG4gICAgICAgICAgICBtZS5maXJlKCdlcnJvcicsIGVycm9ySlNPTiwgb2JqKTtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3JKU09OO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLndoZW4uam9pbi5hcHBseSh1dGlscy53aGVuLCBhcmd1bWVudHMpO1xyXG4gICAgfSxcclxuICAgIHN0ZXBzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXJncyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHNbMF0pID09PSBcIltvYmplY3QgQXJyYXldXCIgPyBhcmd1bWVudHNbMF0gOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG4gICAgICAgIHJldHVybiB1dGlscy5waXBlbGluZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKSk7XHJcbiAgICB9LFxyXG4gICAgZGVmZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB1dGlscy53aGVuLmRlZmVyKCk7XHJcbiAgICB9LFxyXG4gICAgZ2V0QXZhaWxhYmxlQWN0aW9uc0ZvcjogZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgIHJldHVybiBBcGlSZWZlcmVuY2UuZ2V0QWN0aW9uc0Zvcih0eXBlKTtcclxuICAgIH1cclxufTtcclxudmFyIHNldE9wID0gZnVuY3Rpb24oZm5OYW1lKSB7XHJcbiAgICBBcGlJbnRlcmZhY2VDb25zdHJ1Y3Rvci5wcm90b3R5cGVbZm5OYW1lXSA9IGZ1bmN0aW9uKHR5cGUsIGNvbmYsIGlzUmVtb3RlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9uKHR5cGUsIGZuTmFtZSwgY29uZiwgaXNSZW1vdGUpO1xyXG4gICAgfTtcclxufTtcclxuZm9yICh2YXIgaSBpbiBBcGlSZWZlcmVuY2UuYmFzaWNPcHMpIHtcclxuICAgIGlmIChBcGlSZWZlcmVuY2UuYmFzaWNPcHMuaGFzT3duUHJvcGVydHkoaSkpIHNldE9wKGkpO1xyXG59XHJcblxyXG4vLyBhZGQgY3JlYXRlU3luYyBtZXRob2QgZm9yIGEgZGlmZmVyZW50IHN0eWxlIG9mIGRldmVsb3BtZW50XHJcbkFwaUludGVyZmFjZUNvbnN0cnVjdG9yLnByb3RvdHlwZS5jcmVhdGVTeW5jID0gZnVuY3Rpb24odHlwZSwgY29uZikge1xyXG4gICAgdmFyIG5ld0FwaU9iamVjdCA9IEFwaU9iamVjdC5jcmVhdGUodHlwZSwgY29uZiwgdGhpcyk7XHJcbiAgICBuZXdBcGlPYmplY3QudW5zeW5jZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXJlKCdzcGF3bicsIG5ld0FwaU9iamVjdCk7XHJcbiAgICByZXR1cm4gbmV3QXBpT2JqZWN0O1xyXG59O1xyXG5cclxudXRpbHMuYWRkRXZlbnRzKEFwaUludGVyZmFjZUNvbnN0cnVjdG9yKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBpSW50ZXJmYWNlQ29uc3RydWN0b3I7XHJcblxyXG4vLyBFTkQgSU5URVJGQUNFXHJcblxyXG4vKioqKioqKioqLyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJwcm9kdWN0c1wiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcHJvZHVjdFNlcnZpY2V9ez9fKn1cIixcbiAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJmaWx0ZXJcIixcbiAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgXCJzdGFydEluZGV4XCI6IDAsXG4gICAgICBcInBhZ2VTaXplXCI6IDE1XG4gICAgfSxcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcInByb2R1Y3RcIlxuICB9LFxuICBcImNhdGVnb3JpZXNcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhdGVnb3J5U2VydmljZX17P18qfVwiLFxuICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImZpbHRlclwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicGFnZVNpemVcIjogMTVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwiY2F0ZWdvcnlcIlxuICB9LFxuICBcImNhdGVnb3J5XCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytjYXRlZ29yeVNlcnZpY2V9e2lkfSg/YWxsb3dJbmFjdGl2ZX1cIixcbiAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJJZFwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcImFsbG93SW5hY3RpdmVcIjogZmFsc2VcbiAgICB9XG4gIH0sXG4gIFwic2VhcmNoXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytzZWFyY2hTZXJ2aWNlfXNlYXJjaHs/cXVlcnksZmlsdGVyLGZhY2V0VGVtcGxhdGUsZmFjZXRUZW1wbGF0ZVN1YnNldCxmYWNldCxmYWNldEZpZWxkUmFuZ2VRdWVyeSxmYWNldEhpZXJQcmVmaXgsZmFjZXRIaWVyVmFsdWUsZmFjZXRIaWVyRGVwdGgsZmFjZXRTdGFydEluZGV4LGZhY2V0UGFnZVNpemUsZmFjZXRTZXR0aW5ncyxmYWNldFZhbHVlRmlsdGVyLHNvcnRCeSxwYWdlU2l6ZSxQYWdlU2l6ZSxzdGFydEluZGV4LFN0YXJ0SW5kZXh9XCIsXG4gICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwicXVlcnlcIixcbiAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgXCJzdGFydEluZGV4XCI6IDAsXG4gICAgICBcInF1ZXJ5XCI6IFwiKjoqXCIsXG4gICAgICBcInBhZ2VTaXplXCI6IDE1XG4gICAgfSxcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcInByb2R1Y3RcIlxuICB9LFxuICBcImN1c3RvbWVyc1wiOiB7XG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJjdXN0b21lclwiXG4gIH0sXG4gIFwib3JkZXJzXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9ez9fKn1cIixcbiAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgXCJzdGFydEluZGV4XCI6IDAsXG4gICAgICBcInBhZ2VTaXplXCI6IDVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwib3JkZXJcIlxuICB9LFxuICBcInByb2R1Y3RcIjoge1xuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3Byb2R1Y3RTZXJ2aWNlfXtwcm9kdWN0Q29kZX0/eyZhbGxvd0luYWN0aXZlKn1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcInByb2R1Y3RDb2RlXCIsXG4gICAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgICBcImFsbG93SW5hY3RpdmVcIjogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIFwiY29uZmlndXJlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3Byb2R1Y3RTZXJ2aWNlfXtwcm9kdWN0Q29kZX0vY29uZmlndXJlez9pbmNsdWRlT3B0aW9uRGV0YWlsc31cIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwiaW5jbHVkZU9wdGlvbkRldGFpbHNcIjogdHJ1ZVxuICAgICAgfSxcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJhZGQtdG8tY2FydFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHtcbiAgICAgICAgXCJhc1Byb3BlcnR5XCI6IFwicHJvZHVjdFwiXG4gICAgICB9LFxuICAgICAgXCJvdmVycmlkZVBvc3REYXRhXCI6IFtcbiAgICAgICAgXCJwcm9kdWN0XCIsXG4gICAgICAgIFwicXVhbnRpdHlcIixcbiAgICAgICAgXCJmdWxmaWxsbWVudExvY2F0aW9uQ29kZVwiLFxuICAgICAgICBcImZ1bGZpbGxtZW50TWV0aG9kXCJcbiAgICAgIF0sXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJxdWFudGl0eVwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY2FydGl0ZW1cIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhcnRTZXJ2aWNlfWN1cnJlbnQvaXRlbXMvXCJcbiAgICB9LFxuICAgIFwiZ2V0LWludmVudG9yeVwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytwcm9kdWN0U2VydmljZX17cHJvZHVjdENvZGV9L2xvY2F0aW9uaW52ZW50b3J5ez9sb2NhdGlvbkNvZGVzfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwibG9jYXRpb25jb2Rlc1wiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RyaW5nXCJcbiAgICB9XG4gIH0sXG4gIFwibG9jYXRpb25cIjoge1xuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2xvY2F0aW9uU2VydmljZX1sb2NhdGlvblVzYWdlVHlwZXMvU1AvbG9jYXRpb25zL3tjb2RlfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiY29kZVwiXG4gICAgfVxuICB9LFxuICBcImxvY2F0aW9uc1wiOiB7XG4gICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgIFwicGFnZVNpemVcIjogMTVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwibG9jYXRpb25cIixcbiAgICBcImdldFwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytsb2NhdGlvblNlcnZpY2V9bG9jYXRpb25Vc2FnZVR5cGVzL1NQL2xvY2F0aW9ucy97P3N0YXJ0SW5kZXgsc29ydEJ5LHBhZ2VTaXplLGZpbHRlcn1cIlxuICAgIH0sXG4gICAgXCJnZXQtYnktbGF0LWxvbmdcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrbG9jYXRpb25TZXJ2aWNlfWxvY2F0aW9uVXNhZ2VUeXBlcy9TUC9sb2NhdGlvbnMvP2ZpbHRlcj1nZW8gbmVhcih7bGF0aXR1ZGV9LHtsb25naXR1ZGV9KXsmc3RhcnRJbmRleCxzb3J0QnkscGFnZVNpemV9XCJcbiAgICB9XG4gIH0sXG4gIFwiY2FydHN1bW1hcnlcIjogXCJ7K2NhcnRTZXJ2aWNlfXN1bW1hcnlcIixcbiAgXCJjYXJ0XCI6IHtcbiAgICBcImdldFwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudFwiLFxuICAgIFwiYWRkLXByb2R1Y3RcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY2FydGl0ZW1cIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhcnRTZXJ2aWNlfWN1cnJlbnQvaXRlbXMvXCJcbiAgICB9LFxuICAgIFwiZW1wdHlcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjYXJ0U2VydmljZX1jdXJyZW50L2l0ZW1zL1wiXG4gICAgfSxcbiAgICBcImNoZWNrb3V0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX0/Y2FydElkPXtpZH1cIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcIm9yZGVyXCIsXG4gICAgICBcIm5vQm9keVwiOiB0cnVlLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfVxuICB9LFxuICBcImNhcnRpdGVtXCI6IHtcbiAgICBcImRlZmF1bHRzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhcnRTZXJ2aWNlfWN1cnJlbnQvaXRlbXMve2lkfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiaWRcIlxuICAgIH0sXG4gICAgXCJ1cGRhdGUtcXVhbnRpdHlcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjYXJ0U2VydmljZX1jdXJyZW50L2l0ZW1zey9pZCxxdWFudGl0eX1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcInF1YW50aXR5XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcIm5vQm9keVwiOiB0cnVlXG4gICAgfVxuICB9LFxuICBcImN1c3RvbWVyXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfVwiLFxuICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImlkXCIsXG4gICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX1hZGQtYWNjb3VudC1hbmQtbG9naW5cIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImxvZ2luXCJcbiAgICB9LFxuICAgIFwiY3JlYXRlLXN0b3JlZnJvbnRcIjoge1xuICAgICAgXCJ1c2VJZnJhbWVUcmFuc3BvcnRcIjogXCJ7K3N0b3JlZnJvbnRVc2VyU2VydmljZX0uLi8uLi9yZWNlaXZlclwiLFxuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrc3RvcmVmcm9udFVzZXJTZXJ2aWNlfWNyZWF0ZVwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwibG9naW5cIlxuICAgIH0sXG4gICAgXCJsb2dpblwiOiB7XG4gICAgICBcInVzZUlmcmFtZVRyYW5zcG9ydFwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfS4uLy4uL3JlY2VpdmVyXCIsXG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9Li4vYXV0aHRpY2tldHNcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImxvZ2luXCJcbiAgICB9LFxuICAgIFwibG9naW4tc3RvcmVmcm9udFwiOiB7XG4gICAgICBcInVzZUlmcmFtZVRyYW5zcG9ydFwiOiBcInsrc3RvcmVmcm9udFVzZXJTZXJ2aWNlfS4uLy4uL3JlY2VpdmVyXCIsXG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytzdG9yZWZyb250VXNlclNlcnZpY2V9bG9naW5cIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImxvZ2luXCJcbiAgICB9LFxuICAgIFwidXBkYXRlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJyZXNldC1wYXNzd29yZFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9cmVzZXQtcGFzc3dvcmRcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInN0cmluZ1wiXG4gICAgfSxcbiAgICBcInJlc2V0LXBhc3N3b3JkLXN0b3JlZnJvbnRcIjoge1xuICAgICAgXCJ1c2VJZnJhbWVUcmFuc3BvcnRcIjogXCJ7K3N0b3JlZnJvbnRVc2VyU2VydmljZX0uLi8uLi9yZWNlaXZlclwiLFxuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrc3RvcmVmcm9udFVzZXJTZXJ2aWNlfXJlc2V0cGFzc3dvcmRcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInN0cmluZ1wiXG4gICAgfSxcbiAgICBcImNoYW5nZS1wYXNzd29yZFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfS9jaGFuZ2UtcGFzc3dvcmRcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJnZXQtb3JkZXJzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX0/ZmlsdGVyPU9yZGVyTnVtYmVyIG5lIG51bGxcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcIm9yZGVyc1wiXG4gICAgfSxcbiAgICBcImdldC1jYXJkc1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2lkfS9jYXJkc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiYWNjb3VudGNhcmRzXCJcbiAgICB9LFxuICAgIFwiYWRkLWNhcmRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtjdXN0b21lci5pZH0vY2FyZHNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJjdXN0b21lclwiXG4gICAgICB9LFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiYWNjb3VudGNhcmRcIlxuICAgIH0sXG4gICAgXCJ1cGRhdGUtY2FyZFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17Y3VzdG9tZXIuaWR9L2NhcmRzL3tpZH1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJjdXN0b21lclwiXG4gICAgICB9LFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiYWNjb3VudGNhcmRcIlxuICAgIH0sXG4gICAgXCJkZWxldGUtY2FyZFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17Y3VzdG9tZXIuaWR9L2NhcmRzL3tpZH1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImlkXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHtcbiAgICAgICAgXCJhc1Byb3BlcnR5XCI6IFwiY3VzdG9tZXJcIlxuICAgICAgfSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImFjY291bnRjYXJkXCJcbiAgICB9LFxuICAgIFwiYWRkLWNvbnRhY3RcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH0vY29udGFjdHNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImNvbnRhY3RcIlxuICAgIH0sXG4gICAgXCJnZXQtY29udGFjdHNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH0vY29udGFjdHNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImNvbnRhY3RzXCJcbiAgICB9LFxuICAgIFwiZGVsZXRlLWNvbnRhY3RcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2N1c3RvbWVyLmlkfS9jb250YWN0cy97aWR9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJpZFwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB7XG4gICAgICAgIFwiYXNQcm9wZXJ0eVwiOiBcImN1c3RvbWVyXCJcbiAgICAgIH0sXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjb250YWN0XCJcbiAgICB9LFxuICAgIFwiZ2V0LWNyZWRpdHNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3JlZGl0U2VydmljZX1cIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInN0b3JlY3JlZGl0c1wiXG4gICAgfVxuICB9LFxuICBcInN0b3JlY3JlZGl0XCI6IHtcbiAgICBcImFzc29jaWF0ZS10by1zaG9wcGVyXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3JlZGl0U2VydmljZX17Y29kZX0vYXNzb2NpYXRlLXRvLXNob3BwZXJcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgXCJzdG9yZWNyZWRpdHNcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2NyZWRpdFNlcnZpY2V9XCIsXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJzdG9yZWNyZWRpdFwiXG4gIH0sXG4gIFwiY29udGFjdFwiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXthY2NvdW50SWR9L2NvbnRhY3RzL3tpZH1cIixcbiAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgfSxcbiAgXCJjb250YWN0c1wiOiB7XG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJjb250YWN0XCJcbiAgfSxcbiAgXCJsb2dpblwiOiBcInsrdXNlclNlcnZpY2V9bG9naW5cIixcbiAgXCJhZGRyZXNzXCI6IHtcbiAgICBcInZhbGlkYXRlLWFkZHJlc3NcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrYWRkcmVzc1ZhbGlkYXRpb25TZXJ2aWNlfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB7XG4gICAgICAgIFwiYXNQcm9wZXJ0eVwiOiBcImFkZHJlc3NcIlxuICAgICAgfSxcbiAgICAgIFwib3ZlcnJpZGVQb3N0RGF0YVwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiYWRkcmVzc1wiXG4gICAgfVxuICB9LFxuICBcIm9yZGVyXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfVwiLFxuICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICBcImNyZWF0ZVwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9ez9jYXJ0SWQqfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiY2FydElkXCIsXG4gICAgICBcIm5vQm9keVwiOiB0cnVlXG4gICAgfSxcbiAgICBcInVwZGF0ZS1zaGlwcGluZy1pbmZvXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L2Z1bGZpbGxtZW50aW5mb1wiLFxuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzaGlwbWVudFwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcInNldC11c2VyLWlkXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vdXNlcnNcIixcbiAgICAgIFwibm9Cb2R5XCI6IHRydWUsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJ1c2VyXCJcbiAgICB9LFxuICAgIFwiY3JlYXRlLXBheW1lbnRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vcGF5bWVudHMvYWN0aW9uc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcInBlcmZvcm0tcGF5bWVudC1hY3Rpb25cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vcGF5bWVudHMve3BheW1lbnRJZH0vYWN0aW9uc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwicGF5bWVudElkXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgXCJhcHBseS1jb3Vwb25cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9jb3Vwb25zL3tjb3Vwb25Db2RlfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiY291cG9uQ29kZVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJub0JvZHlcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImNvdXBvblwiXG4gICAgfSxcbiAgICBcInJlbW92ZS1jb3Vwb25cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9jb3Vwb25zL3tjb3Vwb25Db2RlfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiY291cG9uQ29kZVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcInJlbW92ZS1hbGwtY291cG9uc1wiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L2NvdXBvbnNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJnZXQtYXZhaWxhYmxlLWFjdGlvbnNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vYWN0aW9uc1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwib3JkZXJhY3Rpb25zXCJcbiAgICB9LFxuICAgIFwicGVyZm9ybS1vcmRlci1hY3Rpb25cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vYWN0aW9uc1wiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiYWN0aW9uTmFtZVwiLFxuICAgICAgXCJvdmVycmlkZVBvc3REYXRhXCI6IFtcbiAgICAgICAgXCJhY3Rpb25OYW1lXCJcbiAgICAgIF0sXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiYWRkLW9yZGVyLW5vdGVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vbm90ZXNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcIm9yZGVybm90ZVwiXG4gICAgfVxuICB9LFxuICBcInJtYVwiOiB7XG4gICAgXCJjcmVhdGVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcmV0dXJuU2VydmljZX1cIlxuICAgIH1cbiAgfSxcbiAgXCJybWFzXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytyZXR1cm5TZXJ2aWNlfXs/Xyp9XCIsXG4gICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgIFwic3RhcnRJbmRleFwiOiAwLFxuICAgICAgXCJwYWdlU2l6ZVwiOiA1XG4gICAgfSxcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcInJtYVwiXG4gIH0sXG4gIFwic2hpcG1lbnRcIjoge1xuICAgIFwiZGVmYXVsdHNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtvcmRlcklkfS9mdWxmaWxsbWVudGluZm9cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJnZXQtc2hpcHBpbmctbWV0aG9kc1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e29yZGVySWR9L3NoaXBtZW50cy9tZXRob2RzXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzaGlwcGluZ21ldGhvZHNcIlxuICAgIH1cbiAgfSxcbiAgXCJwYXltZW50XCI6IHtcbiAgICBcImNyZWF0ZVwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e29yZGVySWR9L3BheW1lbnRzL2FjdGlvbnNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgXCJhY2NvdW50Y2FyZFwiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH0vY2FyZHNcIlxuICB9LFxuICBcImFjY291bnRjYXJkc1wiOiB7XG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJhY2NvdW50Y2FyZFwiXG4gIH0sXG4gIFwiY3JlZGl0Y2FyZFwiOiB7XG4gICAgXCJkZWZhdWx0c1wiOiB7XG4gICAgICBcInVzZUlmcmFtZVRyYW5zcG9ydFwiOiBcInsrcGF5bWVudFNlcnZpY2V9Li4vLi4vQXNzZXRzL21venVfcmVjZWl2ZXIuaHRtbFwiXG4gICAgfSxcbiAgICBcInNhdmVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcGF5bWVudFNlcnZpY2V9XCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgXCJ1cGRhdGVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytwYXltZW50U2VydmljZX17Y2FyZElkfVwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIFwiZGVsXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiY2FyZElkXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytwYXltZW50U2VydmljZX17Y2FyZElkfVwiXG4gICAgfVxuICB9LFxuICBcImNyZWRpdGNhcmRzXCI6IHtcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcImNyZWRpdGNhcmRcIlxuICB9LFxuICBcIm9yZGVybm90ZVwiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtvcmRlcklkfS9ub3Rlcy97aWR9XCJcbiAgfSxcbiAgXCJkb2N1bWVudFwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY21zU2VydmljZX17L2RvY3VtZW50TGlzdE5hbWUsZG9jdW1lbnRJZH0vez92ZXJzaW9uLHN0YXR1c31cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImRvY3VtZW50SWRcIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwiZG9jdW1lbnRMaXN0TmFtZVwiOiBcImRlZmF1bHRcIlxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJkb2N1bWVudGJ5bmFtZVwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY21zU2VydmljZX17ZG9jdW1lbnRMaXN0TmFtZX0vZG9jdW1lbnRUcmVlL3tkb2N1bWVudE5hbWV9L3s/Zm9sZGVyUGF0aCx2ZXJzaW9uLHN0YXR1c31cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImRvY3VtZW50TmFtZVwiLFxuICAgICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgICAgXCJkb2N1bWVudExpc3ROYW1lXCI6IFwiZGVmYXVsdFwiXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcImFkZHJlc3NzY2hlbWFzXCI6IFwieytyZWZlcmVuY2VTZXJ2aWNlfWFkZHJlc3NzY2hlbWFzXCIsXG4gIFwid2lzaGxpc3RcIjoge1xuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX17aWR9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiZ2V0LWJ5LW5hbWVcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfWN1c3RvbWVycy97Y3VzdG9tZXJBY2NvdW50SWR9L3tuYW1lfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImdldC1kZWZhdWx0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX1jdXN0b21lcnMve2N1c3RvbWVyQWNjb3VudElkfS9teV93aXNobGlzdFwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImNyZWF0ZS1kZWZhdWx0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX1cIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcIm15X3dpc2hsaXN0XCIsXG4gICAgICAgIFwidHlwZVRhZ1wiOiBcImRlZmF1bHRcIlxuICAgICAgfSxcbiAgICAgIFwib3ZlcnJpZGVQb3N0RGF0YVwiOiB0cnVlXG4gICAgfSxcbiAgICBcImFkZC1pdGVtXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX17aWR9L2l0ZW1zL1wiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImRlbGV0ZS1hbGwtaXRlbXNcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9e2lkfS9pdGVtcy9cIlxuICAgIH0sXG4gICAgXCJkZWxldGUtaXRlbVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX17aWR9L2l0ZW1zL3tpdGVtSWR9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJpdGVtSWRcIlxuICAgIH0sXG4gICAgXCJlZGl0LWl0ZW1cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9e2lkfS9pdGVtcy97aXRlbUlkfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImFkZC1pdGVtLXRvLWNhcnRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY2FydGl0ZW1cIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhcnRTZXJ2aWNlfWN1cnJlbnQvaXRlbXMvXCJcbiAgICB9LFxuICAgIFwiZ2V0LWl0ZW1zLWJ5LW5hbWVcIjoge1xuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwid2lzaGxpc3RpdGVtc1wiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfWN1c3RvbWVycy97Y3VzdG9tZXJBY2NvdW50SWR9L3tuYW1lfS9pdGVtc3s/c3RhcnRJbmRleCxwYWdlU2l6ZSxzb3J0QnksZmlsdGVyfVwiLFxuICAgICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgICAgXCJzb3J0QnlcIjogXCJVcGRhdGVEYXRlIGFzY1wiXG4gICAgICB9LFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfVxuICB9LFxuICBcIndpc2hsaXN0c1wiOiB7XG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJ3aXNobGlzdFwiXG4gIH1cbn0iLCIvLyBCRUdJTiBPQkpFQ1RcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIEFwaVJlZmVyZW5jZTtcclxudmFyIEFwaUNvbGxlY3Rpb247IC8vIGxhenkgbG9hZGluZyB0byBwcmV2ZW50IGNpcmN1bGFyIGRlcFxyXG5cclxudmFyIEFwaU9iamVjdENvbnN0cnVjdG9yID0gZnVuY3Rpb24odHlwZSwgZGF0YSwgaWFwaSkge1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YSB8fCB7fTtcclxuICAgIHRoaXMuYXBpID0gaWFwaTtcclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbn07XHJcblxyXG5BcGlPYmplY3RDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XHJcbiAgICBjb25zdHJ1Y3RvcjogQXBpT2JqZWN0Q29uc3RydWN0b3IsXHJcbiAgICBnZXRBdmFpbGFibGVBY3Rpb25zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBBcGlSZWZlcmVuY2UgPSBBcGlSZWZlcmVuY2UgfHwgcmVxdWlyZSgnLi9yZWZlcmVuY2UnKTtcclxuICAgICAgICByZXR1cm4gQXBpUmVmZXJlbmNlLmdldEFjdGlvbnNGb3IodGhpcy50eXBlKTtcclxuICAgIH0sXHJcbiAgICBwcm9wOiBmdW5jdGlvbihrLCB2KSB7XHJcbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgayA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHRoaXMuZGF0YVtrXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgayA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGhhc2hrZXkgaW4gaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoay5oYXNPd25Qcm9wZXJ0eShoYXNoa2V5KSkgdGhpcy5wcm9wKGhhc2hrZXksIGtbaGFzaGtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFba10gPSB2O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufTtcclxuXHJcbnV0aWxzLmFkZEV2ZW50cyhBcGlPYmplY3RDb25zdHJ1Y3Rvcik7XHJcblxyXG5BcGlPYmplY3RDb25zdHJ1Y3Rvci50eXBlcyA9IHtcclxuICAgIGNhcnQ6IHJlcXVpcmUoJy4vdHlwZXMvY2FydCcpLFxyXG4gICAgY2FydHN1bW1hcnk6IHJlcXVpcmUoJy4vdHlwZXMvY2FydHN1bW1hcnknKSxcclxuICAgIGNyZWRpdGNhcmQ6IHJlcXVpcmUoJy4vdHlwZXMvY3JlZGl0Y2FyZCcpLFxyXG4gICAgY3VzdG9tZXI6IHJlcXVpcmUoJy4vdHlwZXMvY3VzdG9tZXInKSxcclxuICAgIGxvZ2luOiByZXF1aXJlKCcuL3R5cGVzL2xvZ2luJyksXHJcbiAgICBvcmRlcjogcmVxdWlyZSgnLi90eXBlcy9vcmRlcicpLFxyXG4gICAgcHJvZHVjdDogcmVxdWlyZSgnLi90eXBlcy9wcm9kdWN0JyksXHJcbiAgICBzaGlwbWVudDogcmVxdWlyZSgnLi90eXBlcy9zaGlwbWVudCcpLFxyXG4gICAgdXNlcjogcmVxdWlyZSgnLi90eXBlcy91c2VyJyksXHJcbiAgICB3aXNobGlzdDogcmVxdWlyZSgnLi90eXBlcy93aXNobGlzdCcpXHJcbn07XHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLmh5ZHJhdGVkVHlwZXMgPSB7fTtcclxuXHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLmdldEh5ZHJhdGVkVHlwZSA9IGZ1bmN0aW9uKHR5cGVOYW1lKSB7XHJcbiAgICBBcGlSZWZlcmVuY2UgPSBBcGlSZWZlcmVuY2UgfHwgcmVxdWlyZSgnLi9yZWZlcmVuY2UnKTtcclxuICAgIGlmICghKHR5cGVOYW1lIGluIHRoaXMuaHlkcmF0ZWRUeXBlcykpIHtcclxuICAgICAgICB2YXIgYXZhaWxhYmxlQWN0aW9ucyA9IEFwaVJlZmVyZW5jZS5nZXRBY3Rpb25zRm9yKHR5cGVOYW1lKSxcclxuICAgICAgICAgICAgcmVmbGVjdGVkTWV0aG9kcyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBhdmFpbGFibGVBY3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLnNldE9wKHJlZmxlY3RlZE1ldGhvZHMsIGF2YWlsYWJsZUFjdGlvbnNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmh5ZHJhdGVkVHlwZXNbdHlwZU5hbWVdID0gdXRpbHMuaW5oZXJpdCh0aGlzLCB1dGlscy5leHRlbmQoe30sIHJlZmxlY3RlZE1ldGhvZHMsIHRoaXMudHlwZXNbdHlwZU5hbWVdIHx8IHt9KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5oeWRyYXRlZFR5cGVzW3R5cGVOYW1lXTtcclxufTtcclxuXHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLmNyZWF0ZSA9IGZ1bmN0aW9uKHR5cGVOYW1lLCByYXdKU09OLCBhcGkpIHtcclxuICAgIEFwaVJlZmVyZW5jZSA9IEFwaVJlZmVyZW5jZSB8fCByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG4gICAgdmFyIHR5cGUgPSBBcGlSZWZlcmVuY2UuZ2V0VHlwZSh0eXBlTmFtZSk7XHJcbiAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAvLyBmb3IgZm9yd2FyZCBjb21wYXRpYmlsaXR5IHRoZSBBUEkgc2hvdWxkIHJldHVybiBhIHJlc3BvbnNlLFxyXG4gICAgICAgIC8vIGV2ZW4gb25lIHRoYXQgaXQgZG9lc24ndCB1bmRlcnN0YW5kXHJcbiAgICAgICAgcmV0dXJuIHJhd0pTT047XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZS5jb2xsZWN0aW9uT2YpIHtcclxuICAgICAgICAvLyBsYXp5IGxvYWQgdG8gcHJldmVudCBjaXJjdWxhciBkZXBcclxuICAgICAgICBBcGlDb2xsZWN0aW9uID0gQXBpQ29sbGVjdGlvbiB8fCByZXF1aXJlKCcuL2NvbGxlY3Rpb24nKTtcclxuICAgICAgICByZXR1cm4gQXBpQ29sbGVjdGlvbi5jcmVhdGUodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgdHlwZS5jb2xsZWN0aW9uT2YpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBBcGlPYmplY3RUeXBlID0gdGhpcy5nZXRIeWRyYXRlZFR5cGUodHlwZU5hbWUpO1xyXG5cclxuICAgIHJldHVybiBuZXcgQXBpT2JqZWN0VHlwZSh0eXBlTmFtZSwgcmF3SlNPTiwgYXBpKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBpT2JqZWN0Q29uc3RydWN0b3I7XHJcblxyXG4vLyBFTkQgT0JKRUNUXHJcblxyXG4vKioqKioqKioqKiovIiwiLy8gQkVHSU4gUkVGRVJFTkNFXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XHJcbnZhciBBcGlDb2xsZWN0aW9uO1xyXG52YXIgQXBpT2JqZWN0ID0gcmVxdWlyZSgnLi9vYmplY3QnKTtcclxudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnLi9tZXRob2RzLmpzb24nKTtcclxuXHJcbmVycm9ycy5yZWdpc3Rlcih7XHJcbiAgICAnTk9fUkVRVUVTVF9DT05GSUdfRk9VTkQnOiAnTm8gcmVxdWVzdCBjb25maWd1cmF0aW9uIHdhcyBmb3VuZCBmb3IgezB9LnsxfScsXHJcbiAgICAnTk9fU0hPUlRDVVRfUEFSQU1fRk9VTkQnOiAnTm8gc2hvcnRjdXQgcGFyYW1ldGVyIGF2YWlsYWJsZSBmb3IgezB9LiBQbGVhc2Ugc3VwcGx5IGEgY29uZmlndXJhdGlvbiBvYmplY3QgaW5zdGVhZCBvZiBcInsxfVwiLidcclxufSk7XHJcblxyXG52YXIgYmFzaWNPcHMgPSB7XHJcbiAgICBnZXQ6ICdHRVQnLFxyXG4gICAgdXBkYXRlOiAnUFVUJyxcclxuICAgIGNyZWF0ZTogJ1BPU1QnLFxyXG4gICAgZGVsOiAnREVMRVRFJ1xyXG59O1xyXG52YXIgY29weVRvQ29uZiA9IFsndmVyYicsICdyZXR1cm5UeXBlJywgJ25vQm9keSddLFxyXG4gICAgY29weVRvQ29uZkxlbmd0aCA9IGNvcHlUb0NvbmYubGVuZ3RoO1xyXG52YXIgcmVzZXJ2ZWRXb3JkcyA9IHtcclxuICAgIHRlbXBsYXRlOiB0cnVlLFxyXG4gICAgZGVmYXVsdFBhcmFtczogdHJ1ZSxcclxuICAgIHNob3J0Y3V0UGFyYW06IHRydWUsXHJcbiAgICBkZWZhdWx0czogdHJ1ZSxcclxuICAgIHZlcmI6IHRydWUsXHJcbiAgICByZXR1cm5UeXBlOiB0cnVlLFxyXG4gICAgbm9Cb2R5OiB0cnVlLFxyXG4gICAgaW5jbHVkZVNlbGY6IHRydWUsXHJcbiAgICBjb2xsZWN0aW9uT2Y6IHRydWUsXHJcbiAgICBvdmVycmlkZVBvc3REYXRhOiB0cnVlLFxyXG4gICAgdXNlSWZyYW1lVHJhbnNwb3J0OiB0cnVlLFxyXG4gICAgY29uc3RydWN0OiB0cnVlLFxyXG4gICAgcG9zdGNvbnN0cnVjdDogdHJ1ZSxcclxufTtcclxudmFyIEFwaVJlZmVyZW5jZSA9IHtcclxuXHJcbiAgICBiYXNpY09wczogYmFzaWNPcHMsXHJcbiAgICB1cmxzOiB7fSxcclxuXHJcbiAgICBnZXRBY3Rpb25zRm9yOiBmdW5jdGlvbih0eXBlTmFtZSkge1xyXG4gICAgICAgIEFwaUNvbGxlY3Rpb24gPSBBcGlDb2xsZWN0aW9uIHx8IHJlcXVpcmUoJy4vY29sbGVjdGlvbicpO1xyXG4gICAgICAgIGlmICghb2JqZWN0VHlwZXNbdHlwZU5hbWVdKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIGFjdGlvbnMgPSBbXSxcclxuICAgICAgICAgICAgaXNTaW1wbGVUeXBlID0gKHR5cGVvZiBvYmplY3RUeXBlc1t0eXBlTmFtZV0gPT09IFwic3RyaW5nXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGEgaW4gYmFzaWNPcHMpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSB8fCAhKGEgaW4gb2JqZWN0VHlwZXNbdHlwZU5hbWVdKSlcclxuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc1NpbXBsZVR5cGUpIHtcclxuICAgICAgICAgICAgZm9yIChhIGluIG9iamVjdFR5cGVzW3R5cGVOYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEgJiYgb2JqZWN0VHlwZXNbdHlwZU5hbWVdLmhhc093blByb3BlcnR5KGEpICYmICFyZXNlcnZlZFdvcmRzW2FdKVxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaCh1dGlscy5jYW1lbENhc2UoYSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBkZWNsYXJlZFR5cGUgPSAob2JqZWN0VHlwZXNbdHlwZU5hbWVdLmNvbGxlY3Rpb25PZiA/IEFwaUNvbGxlY3Rpb24gOiBBcGlPYmplY3QpLnR5cGVzW3R5cGVOYW1lXTtcclxuICAgICAgICBpZiAoZGVjbGFyZWRUeXBlKSB7XHJcbiAgICAgICAgICAgIGZvciAoYSBpbiBkZWNsYXJlZFR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbXBsZVR5cGUgfHwgISh1dGlscy5kYXNoQ2FzZShhKSBpbiBvYmplY3RUeXBlc1t0eXBlTmFtZV0gJiYgIXJlc2VydmVkV29yZHNbYV0pICYmIHR5cGVvZiBkZWNsYXJlZFR5cGVbYV0gPT09IFwiZnVuY3Rpb25cIikgYWN0aW9ucy5wdXNoKGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWN0aW9ucztcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0UmVxdWVzdENvbmZpZzogZnVuY3Rpb24ob3BlcmF0aW9uLCB0eXBlTmFtZSwgY29uZiwgY29udGV4dCwgb2JqKSB7XHJcblxyXG4gICAgICAgIHZhciByZXR1cm5PYmosIHRwdERhdGE7XHJcblxyXG4gICAgICAgIC8vIGdldCBvYmplY3QgdHlwZSBmcm9tIG91ciByZWZlcmVuY2VcclxuICAgICAgICB2YXIgb1R5cGUgPSBvYmplY3RUeXBlc1t0eXBlTmFtZV07XHJcblxyXG4gICAgICAgIC8vIHRoZXJlIG1heSBub3QgYmUgb25lXHJcbiAgICAgICAgaWYgKCFvVHlwZSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTk9fUkVRVUVTVF9DT05GSUdfRk9VTkQnLCB0eXBlTmFtZSwgJycpO1xyXG5cclxuICAgICAgICAvLyBnZXQgc3BlY2lmaWMgZGV0YWlscyBvZiB0aGUgcmVxdWVzdGVkIG9wZXJhdGlvblxyXG4gICAgICAgIGlmIChvcGVyYXRpb24pIG9wZXJhdGlvbiA9IHV0aWxzLmRhc2hDYXNlKG9wZXJhdGlvbik7XHJcbiAgICAgICAgaWYgKG9UeXBlW29wZXJhdGlvbl0pIG9UeXBlID0gb1R5cGVbb3BlcmF0aW9uXTtcclxuXHJcbiAgICAgICAgLy8gc29tZSBvVHlwZXMgYXJlIGEgc2ltcGxlIHRlbXBsYXRlIGFzIGEgc3RyaW5nXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvVHlwZSA9PT0gXCJzdHJpbmdcIikgb1R5cGUgPSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBvVHlwZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIHRoZSBkZWZhdWx0cyBhdCB0aGUgcm9vdCBvYmplY3QgdHlwZSBzaG91bGQgYmUgY29waWVkIGludG8gYWxsIG9wZXJhdGlvbiBjb25maWdzXHJcbiAgICAgICAgaWYgKG9iamVjdFR5cGVzW3R5cGVOYW1lXS5kZWZhdWx0cykgb1R5cGUgPSB1dGlscy5leHRlbmQoe30sIG9iamVjdFR5cGVzW3R5cGVOYW1lXS5kZWZhdWx0cywgb1R5cGUpO1xyXG5cclxuICAgICAgICAvLyBhIHRlbXBsYXRlIGlzIHJlcXVpcmVkXHJcbiAgICAgICAgaWYgKCFvVHlwZS50ZW1wbGF0ZSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTk9fUkVRVUVTVF9DT05GSUdfRk9VTkQnLCB0eXBlTmFtZSwgb3BlcmF0aW9uKTtcclxuXHJcbiAgICAgICAgcmV0dXJuT2JqID0ge307XHJcbiAgICAgICAgdHB0RGF0YSA9IHt9O1xyXG5cclxuICAgICAgICAvLyBjYWNoZSB0ZW1wbGF0ZXMgbGF6aWx5XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvVHlwZS50ZW1wbGF0ZSA9PT0gXCJzdHJpbmdcIikgb1R5cGUudGVtcGxhdGUgPSB1dGlscy51cml0ZW1wbGF0ZS5wYXJzZShvVHlwZS50ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGUgcmVxdWVzdGluZyBvYmplY3QncyBkYXRhIGl0c2VsZiB0byB0aGUgdHB0IGNvbnRleHRcclxuICAgICAgICBpZiAob1R5cGUuaW5jbHVkZVNlbGYgJiYgb2JqKSB7XHJcbiAgICAgICAgICAgIGlmIChvVHlwZS5pbmNsdWRlU2VsZi5hc1Byb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICB0cHREYXRhW29UeXBlLmluY2x1ZGVTZWxmLmFzUHJvcGVydHldID0gb2JqLmRhdGFcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRwdERhdGEgPSB1dGlscy5leHRlbmQodHB0RGF0YSwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzaG9ydGN1dHBhcmFtIGFsbG93cyB5b3UgdG8gdXNlIHRoZSBtb3N0IGNvbW1vbmx5IHVzZWQgY29uZiBwcm9wZXJ0eSBhcyBhIHN0cmluZyBvciBudW1iZXIgYXJndW1lbnRcclxuICAgICAgICBpZiAoY29uZiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjb25mICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmICghb1R5cGUuc2hvcnRjdXRQYXJhbSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTk9fU0hPUlRDVVRfUEFSQU1fRk9VTkQnLCB0eXBlTmFtZSwgY29uZik7XHJcbiAgICAgICAgICAgIHRwdERhdGFbb1R5cGUuc2hvcnRjdXRQYXJhbV0gPSBjb25mO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29uZikge1xyXG4gICAgICAgICAgICAvLyBhZGQgdGhlIGNvbmYgYXJndWVkIGRpcmVjdGx5IGludG8gdGhpcyByZXF1ZXN0IGZuIHRvIHRoZSB0cHQgY29udGV4dFxyXG4gICAgICAgICAgICB1dGlscy5leHRlbmQodHB0RGF0YSwgY29uZik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkZWZhdWx0IHBhcmFtcyBhZGRlZCB0byB0ZW1wbGF0ZSwgYnV0IG92ZXJyaWRkZW4gYnkgZXhpc3RpbmcgdHB0IGRhdGFcclxuICAgICAgICBpZiAob1R5cGUuZGVmYXVsdFBhcmFtcykgdHB0RGF0YSA9IHV0aWxzLmV4dGVuZCh7fSwgb1R5cGUuZGVmYXVsdFBhcmFtcywgdHB0RGF0YSk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBzdHVmZiB0aGF0IHRoZSBVcmlUZW1wbGF0ZSBwYXJzZXIgY2FuJ3QgcGFyc2VcclxuICAgICAgICBmb3IgKHZhciB0dmFyIGluIHRwdERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmdldFR5cGUodHB0RGF0YVt0dmFyXSkgPT0gXCJBcnJheVwiKSB0cHREYXRhW3R2YXJdID0gSlNPTi5zdHJpbmdpZnkodHB0RGF0YVt0dmFyXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBmdWxsVHB0Q29udGV4dCA9IHV0aWxzLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIF86IHRwdERhdGFcclxuICAgICAgICB9LCBjb250ZXh0LmFzT2JqZWN0KCdjb250ZXh0LScpLCB1dGlscy5mbGF0dGVuKHRwdERhdGEsIHt9KSwgQXBpUmVmZXJlbmNlLnVybHMpO1xyXG4gICAgICAgIHJldHVybk9iai51cmwgPSBvVHlwZS50ZW1wbGF0ZS5leHBhbmQoZnVsbFRwdENvbnRleHQpO1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29weVRvQ29uZkxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChjb3B5VG9Db25mW2pdIGluIG9UeXBlKSByZXR1cm5PYmpbY29weVRvQ29uZltqXV0gPSBvVHlwZVtjb3B5VG9Db25mW2pdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9UeXBlLnVzZUlmcmFtZVRyYW5zcG9ydCkge1xyXG4gICAgICAgICAgICAvLyBjYWNoZSB0ZW1wbGF0ZXMgbGF6aWx5XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb1R5cGUudXNlSWZyYW1lVHJhbnNwb3J0ID09PSBcInN0cmluZ1wiKSBvVHlwZS51c2VJZnJhbWVUcmFuc3BvcnQgPSB1dGlscy51cml0ZW1wbGF0ZS5wYXJzZShvVHlwZS51c2VJZnJhbWVUcmFuc3BvcnQpO1xyXG4gICAgICAgICAgICByZXR1cm5PYmouaWZyYW1lVHJhbnNwb3J0VXJsID0gb1R5cGUudXNlSWZyYW1lVHJhbnNwb3J0LmV4cGFuZChmdWxsVHB0Q29udGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvVHlwZS5vdmVycmlkZVBvc3REYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBvdmVycmlkZGVuRGF0YTtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmdldFR5cGUob1R5cGUub3ZlcnJpZGVQb3N0RGF0YSkgPT0gXCJBcnJheVwiKSB7XHJcbiAgICAgICAgICAgICAgICBvdmVycmlkZGVuRGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdE9LID0gMDsgdE9LIDwgb1R5cGUub3ZlcnJpZGVQb3N0RGF0YS5sZW5ndGg7IHRPSysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcnJpZGRlbkRhdGFbb1R5cGUub3ZlcnJpZGVQb3N0RGF0YVt0T0tdXSA9IHRwdERhdGFbb1R5cGUub3ZlcnJpZGVQb3N0RGF0YVt0T0tdXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG92ZXJyaWRkZW5EYXRhID0gdHB0RGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm5PYmoub3ZlcnJpZGVQb3N0RGF0YSA9IG92ZXJyaWRkZW5EYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0dXJuT2JqO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRUeXBlOiBmdW5jdGlvbih0eXBlTmFtZSkge1xyXG4gICAgICAgIHJldHVybiBvYmplY3RUeXBlc1t0eXBlTmFtZV07XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwaVJlZmVyZW5jZTtcclxuXHJcbi8vIEVORCBSRUZFUkVOQ0VcclxuXHJcbi8qKioqKioqKioqKi8iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGNvdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wKCdpdGVtcycpO1xyXG4gICAgICAgIGlmICghaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCkgcmV0dXJuIDA7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLnJlZHVjZShpdGVtcywgZnVuY3Rpb24gKHRvdGFsLCBpdGVtKSB7IHJldHVybiB0b3RhbCArIGl0ZW0ucXVhbnRpdHk7IH0sIDApO1xyXG4gICAgfVxyXG59OyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgY291bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLnRvdGFsUXVhbnRpdHkgfHwgMDtcclxuICAgIH1cclxufTsiLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi4vZXJyb3JzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGVycm9ycy5yZWdpc3Rlcih7XHJcbiAgICAgICAgJ0NBUkRfVFlQRV9NSVNTSU5HJzogJ0NhcmQgdHlwZSBtaXNzaW5nLicsXHJcbiAgICAgICAgJ0NBUkRfTlVNQkVSX01JU1NJTkcnOiAnQ2FyZCBudW1iZXIgbWlzc2luZy4nLFxyXG4gICAgICAgICdDVlZfTUlTU0lORyc6ICdDYXJkIHNlY3VyaXR5IGNvZGUgbWlzc2luZy4nLFxyXG4gICAgICAgICdDQVJEX05VTUJFUl9VTlJFQ09HTklaRUQnOiAnQ2FyZCBudW1iZXIgaXMgaW4gYW4gdW5yZWNvZ25pemVkIGZvcm1hdC4nLFxyXG4gICAgICAgICdNQVNLX1BBVFRFUk5fSU5WQUxJRCc6ICdTdXBwbGllZCBtYXNrIHBhdHRlcm4gZGlkIG5vdCBtYXRjaCBhIHZhbGlkIGNhcmQgbnVtYmVyLidcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBjaGFyc0luQ2FyZE51bWJlclJFID0gL1tcXHMtXS9nO1xyXG5cclxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlQ2FyZE51bWJlcihvYmosIGNhcmROdW1iZXIpIHtcclxuICAgICAgICB2YXIgbWFza0NoYXJhY3RlciA9IG9iai5tYXNrQ2hhcmFjdGVyO1xyXG4gICAgICAgIGlmICghY2FyZE51bWJlcikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiAoY2FyZE51bWJlci5pbmRleE9mKG1hc2tDaGFyYWN0ZXIpICE9PSAtMSkgfHwgbHVobjEwKGNhcmROdW1iZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGx1aG4xMChzKSB7XHJcbiAgICAgICAgLy8gbHVobiAxMCBhbGdvcml0aG0gZm9yIGNhcmQgbnVtYmVyc1xyXG4gICAgICAgIHZhciBpLCBuLCBjLCByLCB0O1xyXG4gICAgICAgIHIgPSBcIlwiO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSBwYXJzZUludChzLmNoYXJBdChpKSwgMTApO1xyXG4gICAgICAgICAgICBpZiAoYyA+PSAwICYmIGMgPD0gOSkgciA9IGMgKyByO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoci5sZW5ndGggPD0gMSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHQgPSBcIlwiO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCByLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSBwYXJzZUludChyLmNoYXJBdChpKSwgMTApO1xyXG4gICAgICAgICAgICBpZiAoaSAlIDIgIT0gMCkgYyAqPSAyO1xyXG4gICAgICAgICAgICB0ID0gdCArIGM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG4gPSAwO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSBwYXJzZUludCh0LmNoYXJBdChpKSwgMTApO1xyXG4gICAgICAgICAgICBuID0gbiArIGM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAobiAhPSAwICYmIG4gJSAxMCA9PSAwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVDYXJkTnVtYmVyTWFzayhvYmosIGNhcmROdW1iZXIpIHtcclxuICAgICAgICB2YXIgbWFza1JFID0gbmV3IFJlZ0V4cChvYmoubWFza1BhdHRlcm4pLFxyXG4gICAgICAgICAgICBtYXRjaGVzID0gY2FyZE51bWJlci5tYXRjaChtYXNrUkUpLFxyXG4gICAgICAgICAgICB0b0Rpc3BsYXkgPSBjYXJkTnVtYmVyLFxyXG4gICAgICAgICAgICB0b1NlbmQgPSBbXSxcclxuICAgICAgICAgICAgbWFza0NoYXJhY3RlciA9IG9iai5tYXNrQ2hhcmFjdGVyLFxyXG4gICAgICAgICAgICB0ZW1wTWFzayA9IFwiXCI7XHJcblxyXG4gICAgICAgIGlmICghbWF0Y2hlcykgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTUFTS19QQVRURVJOX0lOVkFMSUQnKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGVtcE1hc2sgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hdGNoZXNbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRlbXBNYXNrICs9IG1hc2tDaGFyYWN0ZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG9EaXNwbGF5ID0gdG9EaXNwbGF5LnJlcGxhY2UobWF0Y2hlc1tpXSwgdGVtcE1hc2spO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgPSB0b0Rpc3BsYXkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdG9TZW5kLnVuc2hpZnQodG9EaXNwbGF5LmNoYXJBdChpKSA9PT0gbWFza0NoYXJhY3RlciA/IGNhcmROdW1iZXIuY2hhckF0KGkpIDogbWFza0NoYXJhY3Rlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9iai5tYXNrZWRDYXJkTnVtYmVyID0gdG9EaXNwbGF5O1xyXG4gICAgICAgIHJldHVybiB0b1NlbmQuam9pbignJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFrZVBheWxvYWQob2JqKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBvYmouZGF0YSwgbWFza0NoYXJhY3RlciA9IG9iai5tYXNrQ2hhcmFjdGVyLCBtYXNrZWREYXRhO1xyXG4gICAgICAgIGlmICghZGF0YS5wYXltZW50T3JDYXJkVHlwZSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnQ0FSRF9UWVBFX01JU1NJTkcnKTtcclxuICAgICAgICBpZiAoIWRhdGEuY2FyZE51bWJlclBhcnRPck1hc2spIGVycm9ycy50aHJvd09uT2JqZWN0KG9iaiwgJ0NBUkRfTlVNQkVSX01JU1NJTkcnKTtcclxuICAgICAgICBpZiAoIWRhdGEuY3Z2KSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdDVlZfTUlTU0lORycpO1xyXG4gICAgICAgIG1hc2tlZERhdGEgPSB0cmFuc2Zvcm0udG9DYXJkRGF0YShkYXRhKVxyXG4gICAgICAgIHZhciBjYXJkTnVtYmVyID0gbWFza2VkRGF0YS5jYXJkTnVtYmVyLnJlcGxhY2UoY2hhcnNJbkNhcmROdW1iZXJSRSwgJycpO1xyXG4gICAgICAgIGlmICghdmFsaWRhdGVDYXJkTnVtYmVyKG9iaiwgY2FyZE51bWJlcikpIGVycm9ycy50aHJvd09uT2JqZWN0KG9iaiwgJ0NBUkRfTlVNQkVSX1VOUkVDT0dOSVpFRCcpO1xyXG5cclxuICAgICAgICAvLyBvbmx5IGFkZCBudW1iZXJQYXJ0IGlmIHRoZSBjdXJyZW50IGNhcmQgbnVtYmVyIGlzbid0IGFscmVhZHkgbWFza2VkXHJcbiAgICAgICAgaWYgKGNhcmROdW1iZXIuaW5kZXhPZihtYXNrQ2hhcmFjdGVyKSA9PT0gLTEpIG1hc2tlZERhdGEubnVtYmVyUGFydCA9IGNyZWF0ZUNhcmROdW1iZXJNYXNrKG9iaiwgY2FyZE51bWJlcik7XHJcbiAgICAgICAgZGVsZXRlIG1hc2tlZERhdGEuY2FyZE51bWJlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1hc2tlZERhdGE7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHZhciB0cmFuc2Zvcm0gPSB7XHJcbiAgICAgICAgZmllbGRzOiB7XHJcbiAgICAgICAgICAgIFwiY2FyZE51bWJlclwiOiBcImNhcmROdW1iZXJQYXJ0T3JNYXNrXCIsXHJcbiAgICAgICAgICAgIFwicGVyc2lzdENhcmRcIjogXCJpc0NhcmRJbmZvU2F2ZWRcIixcclxuICAgICAgICAgICAgXCJjYXJkaG9sZGVyTmFtZVwiOiBcIm5hbWVPbkNhcmRcIixcclxuICAgICAgICAgICAgXCJjYXJkVHlwZVwiOiBcInBheW1lbnRPckNhcmRUeXBlXCIsXHJcbiAgICAgICAgICAgIFwiY2FyZElkXCI6IFwicGF5bWVudFNlcnZpY2VDYXJkSWRcIixcclxuICAgICAgICAgICAgXCJjdnZcIjogXCJjdnZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9TdG9yZWZyb250RGF0YTogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHN0b3JlZnJvbnREYXRhID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIHNlcnZpY2VGaWVsZCBpbiB0aGlzLmZpZWxkcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlcnZpY2VGaWVsZCBpbiBkYXRhKSBzdG9yZWZyb250RGF0YVt0aGlzLmZpZWxkc1tzZXJ2aWNlRmllbGRdXSA9IGRhdGFbc2VydmljZUZpZWxkXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RvcmVmcm9udERhdGE7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b0NhcmREYXRhOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgY2FyZERhdGEgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2VydmljZUZpZWxkIGluIHRoaXMuZmllbGRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5maWVsZHNbc2VydmljZUZpZWxkXSBpbiBkYXRhKSBjYXJkRGF0YVtzZXJ2aWNlRmllbGRdID0gZGF0YVt0aGlzLmZpZWxkc1tzZXJ2aWNlRmllbGRdXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjYXJkRGF0YTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtYXNrQ2hhcmFjdGVyOiBcIipcIixcclxuICAgICAgICBtYXNrUGF0dGVybjogXCJeKFxcXFxkKz8pXFxcXGR7NH0kXCIsXHJcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBpc1VwZGF0ZSA9IHRoaXMucHJvcCh0cmFuc2Zvcm0uZmllbGRzLmNhcmRJZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24odGhpcywgKGlzVXBkYXRlID8gJ3VwZGF0ZScgOiAnc2F2ZScpLCBtYWtlUGF5bG9hZCh0aGlzKSkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnByb3AodHJhbnNmb3JtLnRvU3RvcmVmcm9udERhdGEoe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcmROdW1iZXI6IHNlbGYubWFza2VkQ2FyZE51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICBjdnY6IHNlbGYucHJvcCgnY3Z2JykucmVwbGFjZSgvXFxkL2csIHNlbGYubWFza0NoYXJhY3RlciksXHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZElkOiBpc1VwZGF0ZSB8fCByZXNcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZmlyZSgnc3luYycsIHV0aWxzLmNsb25lKHNlbGYuZGF0YSksIHNlbGYuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYXZlVG9DdXN0b21lcjogZnVuY3Rpb24gKGN1c3RvbWVySWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zYXZlKCkudGhlbihmdW5jdGlvbiAoY2FyZElkKSB7XHJcbiAgICAgICAgICAgICAgICBjYXJkSWQgPSBjYXJkSWQgfHwgc2VsZi5wcm9wKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1c3RvbWVyID0gc2VsZi5hcGkuY3JlYXRlU3luYygnY3VzdG9tZXInLCB7IGlkOiBjdXN0b21lcklkIH0pO1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnBhc3NGcm9tKGN1c3RvbWVyLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXN0b21lci5hZGRDYXJkKHNlbGYuZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0T3JkZXJEYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjYXJkTnVtYmVyUGFydE9yTWFzazogdGhpcy5tYXNrZWRDYXJkTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgY3Z2OiB0aGlzLmRhdGEuY3Z2LFxyXG4gICAgICAgICAgICAgICAgbmFtZU9uQ2FyZDogdGhpcy5kYXRhLm5hbWVPbkNhcmQsXHJcbiAgICAgICAgICAgICAgICBwYXltZW50T3JDYXJkVHlwZTogdGhpcy5kYXRhLnBheW1lbnRPckNhcmRUeXBlIHx8IHRoaXMuZGF0YS5jYXJkVHlwZSxcclxuICAgICAgICAgICAgICAgIHBheW1lbnRTZXJ2aWNlQ2FyZElkOiB0aGlzLmRhdGEucGF5bWVudFNlcnZpY2VDYXJkSWQgfHwgdGhpcy5kYXRhLmNhcmRJZCxcclxuICAgICAgICAgICAgICAgIGlzQ2FyZEluZm9TYXZlZDogdGhpcy5kYXRhLmlzQ2FyZEluZm9TYXZlZCB8fCB0aGlzLmRhdGEucGVyc2lzdENhcmQsXHJcbiAgICAgICAgICAgICAgICBleHBpcmVNb250aDogdGhpcy5kYXRhLmV4cGlyZU1vbnRoLFxyXG4gICAgICAgICAgICAgICAgZXhwaXJlWWVhcjogdGhpcy5kYXRhLmV4cGlyZVllYXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KCkpOyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwb3N0Y29uc3RydWN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLm9uKCdzeW5jJywgZnVuY3Rpb24gKGpzb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChqc29uICYmIGpzb24uYXV0aFRpY2tldCAmJiBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFwaS5jb250ZXh0LlVzZXJDbGFpbXMoanNvbi5hdXRoVGlja2V0LmFjY2Vzc1Rva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFwaS5maXJlKCdsb2dpbicsIGpzb24uYXV0aFRpY2tldCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2F2ZVBheW1lbnRDYXJkOiBmdW5jdGlvbiAodW5tYXNrZWRDYXJkRGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIGNhcmQgPSB0aGlzLmFwaS5jcmVhdGVTeW5jKCdjcmVkaXRjYXJkJywgdW5tYXNrZWRDYXJkRGF0YSksXHJcbiAgICAgICAgICAgICAgICBpc1VwZGF0ZSA9ICEhKHVubWFza2VkQ2FyZERhdGEucGF5bWVudFNlcnZpY2VDYXJkSWQgfHwgdW5tYXNrZWRDYXJkRGF0YS5pZCk7XHJcbiAgICAgICAgICAgIGVycm9ycy5wYXNzRnJvbShjYXJkLCB0aGlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNhcmQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGNhcmQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXlsb2FkID0gdXRpbHMuY2xvbmUoY2FyZC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuY2FyZE51bWJlclBhcnQgPSBwYXlsb2FkLmNhcmROdW1iZXJQYXJ0T3JNYXNrIHx8IHBheWxvYWQuY2FyZE51bWJlcjtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaWQgPSBwYXlsb2FkLnBheW1lbnRTZXJ2aWNlQ2FyZElkO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQuY2FyZE51bWJlcjtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwYXlsb2FkLmNhcmROdW1iZXJQYXJ0T3JNYXNrO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQucGF5bWVudFNlcnZpY2VDYXJkSWQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNVcGRhdGUgPyBzZWxmLnVwZGF0ZUNhcmQocGF5bG9hZCkgOiBzZWxmLmFkZENhcmQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlUGF5bWVudENhcmQ6IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZUNhcmQoaWQpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuYXBpLmRlbCgnY3JlZGl0Y2FyZCcsIGlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTdG9yZUNyZWRpdHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0cyA9IHRoaXMuYXBpLmNyZWF0ZVN5bmMoJ3N0b3JlY3JlZGl0cycpO1xyXG4gICAgICAgICAgICBlcnJvcnMucGFzc0Zyb20oY3JlZGl0cywgdGhpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVkaXRzLmdldCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkU3RvcmVDcmVkaXQ6IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0ID0gdGhpcy5hcGkuY3JlYXRlU3luYygnc3RvcmVjcmVkaXQnLCB7IGNvZGU6IGlkIH0pO1xyXG4gICAgICAgICAgICBlcnJvcnMucGFzc0Zyb20oY3JlZGl0LCB0aGlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWRpdC5hc3NvY2lhdGVUb1Nob3BwZXIoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIGFzIG9mIDEyLzMwLzIwMTMgcGFydGlhbCB1cGRhdGVzIG9uIGN1c3RvbWVyIHdpbGxcclxuICAgICAgICAvLyBibGFuayBvdXQgdGhlc2UgdmFsdWVzIHVubGVzcyB0aGV5IGFyZSBpbmNsdWRlZFxyXG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBhcyBzb29uIGFzIFRGUyMyMTc3NSBpcyBmaXhlZFxyXG4gICAgICAgIGdldE1pbmltdW1QYXJ0aWFsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHRoaXMucHJvcCgnZmlyc3ROYW1lJyksXHJcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogdGhpcy5wcm9wKCdsYXN0TmFtZScpLFxyXG4gICAgICAgICAgICAgICAgZW1haWxBZGRyZXNzOiB0aGlzLnByb3AoJ2VtYWlsQWRkcmVzcycpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24odGhpcywgJ3VwZGF0ZScsIHV0aWxzLmV4dGVuZCh0aGlzLmdldE1pbmltdW1QYXJ0aWFsKCksIHV0aWxzLmNsb25lKGRhdGEpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpOyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvLyBoYXZlcnNpbmVcclxuICAgIC8vIEJ5IE5pY2sgSnVzdGljZSAobmlpeClcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9uaWl4L2hhdmVyc2luZVxyXG5cclxuICAgIHZhciBoYXZlcnNpbmUgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAvLyBjb252ZXJ0IHRvIHJhZGlhbnNcclxuICAgICAgICB2YXIgdG9SYWQgPSBmdW5jdGlvbiAobnVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudW0gKiBNYXRoLlBJIC8gMTgwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gaGF2ZXJzaW5lKHN0YXJ0LCBlbmQsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIG1pbGVzID0gMzk2MFxyXG4gICAgICAgICAgICB2YXIga20gPSA2MzcxXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcblxyXG4gICAgICAgICAgICB2YXIgUiA9IG9wdGlvbnMudW5pdCA9PT0gJ2ttJyA/IGttIDogbWlsZXNcclxuXHJcbiAgICAgICAgICAgIHZhciBkTGF0ID0gdG9SYWQoZW5kLmxhdGl0dWRlIC0gc3RhcnQubGF0aXR1ZGUpXHJcbiAgICAgICAgICAgIHZhciBkTG9uID0gdG9SYWQoZW5kLmxvbmdpdHVkZSAtIHN0YXJ0LmxvbmdpdHVkZSlcclxuICAgICAgICAgICAgdmFyIGxhdDEgPSB0b1JhZChzdGFydC5sYXRpdHVkZSlcclxuICAgICAgICAgICAgdmFyIGxhdDIgPSB0b1JhZChlbmQubGF0aXR1ZGUpXHJcblxyXG4gICAgICAgICAgICB2YXIgYSA9IE1hdGguc2luKGRMYXQgLyAyKSAqIE1hdGguc2luKGRMYXQgLyAyKSArXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5zaW4oZExvbiAvIDIpICogTWF0aC5zaW4oZExvbiAvIDIpICogTWF0aC5jb3MobGF0MSkgKiBNYXRoLmNvcyhsYXQyKVxyXG4gICAgICAgICAgICB2YXIgYyA9IDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEgLSBhKSlcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRocmVzaG9sZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudGhyZXNob2xkID4gKFIgKiBjKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFIgKiBjXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSkoKVxyXG5cclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIGdldEJ5TGF0TG9uZzogZnVuY3Rpb24gKG9wdHMpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcGkuYWN0aW9uKCdsb2NhdGlvbnMnLCAnZ2V0LWJ5LWxhdC1sb25nJywge1xyXG4gICAgICAgICAgICAgICAgbGF0aXR1ZGU6IG9wdHMubG9jYXRpb24uY29vcmRzLmxhdGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBvcHRzLmxvY2F0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29sbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9ucyA9IGNvbGwuZGF0YS5pdGVtcztcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsb2NhdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnNbaV0uZGlzdGFuY2UgPSBoYXZlcnNpbmUob3B0cy5sb2NhdGlvbi5jb29yZHMsIHsgbGF0aXR1ZGU6IGxvY2F0aW9uc1tpXS5nZW8ubGF0LCBsb25naXR1ZGU6IGxvY2F0aW9uc1tpXS5nZW8ubG5nIH0pLnRvRml4ZWQoMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHV0aWxzLmNsb25lKGNvbGwuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoJ3N5bmMnLCBkYXRhLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXRGb3JQcm9kdWN0OiBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBjb2xsLFxyXG4gICAgICAgICAgICAgICAgLy8gbm90IHJ1bm5pbmcgdGhlIG1ldGhvZCBvbiBzZWxmIHNpbmNlIGl0IHNob3VsZG4ndCBzeW5jIHVudGlsIGl0J3MgYmVlbiBwcm9jZXNzZWQhXHJcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24gPSBvcHRzLmxvY2F0aW9uID9cclxuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmFjdGlvbignbG9jYXRpb25zJywgJ2dldC1ieS1sYXQtbG9uZycsIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZTogb3B0cy5sb2NhdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBvcHRzLmxvY2F0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuICAgICAgICAgICAgICAgIH0pIDpcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmdldCgnbG9jYXRpb25zJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb24udGhlbihmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgICAgICAgY29sbCA9IGM7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29kZXMgPSB1dGlscy5tYXAoY29sbC5kYXRhLml0ZW1zLCBmdW5jdGlvbiAobG9jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYy5jb2RlO1xyXG4gICAgICAgICAgICAgICAgfSkuam9pbignLCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuYXBpLmFjdGlvbigncHJvZHVjdCcsICdnZXRJbnZlbnRvcnknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvZHVjdENvZGU6IG9wdHMucHJvZHVjdENvZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25Db2RlczogY29kZXNcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChpbnZlbnRvcnkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBqLFxyXG4gICAgICAgICAgICAgICAgICAgIGlsZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zID0gY29sbC5kYXRhLml0ZW1zLFxyXG4gICAgICAgICAgICAgICAgICAgIGludmVudG9yaWVzID0gaW52ZW50b3J5Lml0ZW1zLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkTG9jYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbG9jYXRpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMCwgaWxlbiA9IGludmVudG9yaWVzLmxlbmd0aDsgaiA8IGlsZW47IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW52ZW50b3JpZXNbal0ubG9jYXRpb25Db2RlID09PSBsb2NhdGlvbnNbaV0uY29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zW2ldLnF1YW50aXR5ID0gaW52ZW50b3JpZXNbal0uc3RvY2tBdmFpbGFibGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0cy5sb2NhdGlvbikgbG9jYXRpb25zW2ldLmRpc3RhbmNlID0gaGF2ZXJzaW5lKG9wdHMubG9jYXRpb24uY29vcmRzLCB7IGxhdGl0dWRlOiBsb2NhdGlvbnNbaV0uZ2VvLmxhdCwgbG9uZ2l0dWRlOiBsb2NhdGlvbnNbaV0uZ2VvLmxuZyB9KS50b0ZpeGVkKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52ZW50b3JpZXMuc3BsaWNlKGosIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHsgaXRlbXM6IHV0aWxzLmNsb25lKHZhbGlkTG9jYXRpb25zKSB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKCdzeW5jJywgZGF0YSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHBvc3Rjb25zdHJ1Y3Q6IGZ1bmN0aW9uICh0eXBlLCBqc29uKSB7XHJcbiAgICAgICAgdmFyIGFjY2Vzc1Rva2VuO1xyXG4gICAgICAgIGlmIChqc29uLmF1dGhUaWNrZXQgJiYganNvbi5hdXRoVGlja2V0LmFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuID0ganNvbi5hdXRoVGlja2V0LmFjY2Vzc1Rva2VuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoanNvbi5hY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICBhY2Nlc3NUb2tlbiA9IGpzb24uYWNjZXNzVG9rZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICB0aGlzLmFwaS5jb250ZXh0LlVzZXJDbGFpbXMoYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICB0aGlzLmFwaS5maXJlKCdsb2dpbicsIGpzb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCJ2YXIgZXJyb3JzID0gcmVxdWlyZSgnLi4vZXJyb3JzJyk7XHJcbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvZGVmYXVsdCcpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgQXBpUmVmZXJlbmNlID0gcmVxdWlyZSgnLi4vcmVmZXJlbmNlJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGVycm9ycy5yZWdpc3Rlcih7XHJcbiAgICAgICAgJ0JJTExJTkdfSU5GT19NSVNTSU5HJzogJ0JpbGxpbmcgaW5mbyBtaXNzaW5nLicsXHJcbiAgICAgICAgJ1BBWU1FTlRfVFlQRV9NSVNTSU5HX09SX1VOUkVDT0dOSVpFRCc6ICdQYXltZW50IHR5cGUgbWlzc2luZyBvciB1bnJlY29nbml6ZWQuJyxcclxuICAgICAgICAnUEFZTUVOVF9NSVNTSU5HJzogJ0V4cGVjdGVkIGEgcGF5bWVudCB0byBleGlzdCBvbiB0aGlzIG9yZGVyIGFuZCBvbmUgZGlkIG5vdC4nLFxyXG4gICAgICAgICdQQVlQQUxfVFJBTlNBQ1RJT05fSURfTUlTU0lORyc6ICdFeHBlY3RlZCB0aGUgYWN0aXZlIHBheW1lbnQgdG8gaW5jbHVkZSBhIHBheW1lbnRTZXJ2aWNlVHJhbnNhY3Rpb25JZCBhbmQgaXQgZGlkIG5vdC4nLFxyXG4gICAgICAgICdPUkRFUl9DQU5OT1RfU1VCTUlUJzogJ09yZGVyIGNhbm5vdCBiZSBzdWJtaXR0ZWQuIElzIG9yZGVyIGNvbXBsZXRlPycsXHJcbiAgICAgICAgJ0FERF9DT1VQT05fRkFJTEVEJzogJ0FkZGluZyBjb3Vwb24gZmFpbGVkIGZvciB0aGUgZm9sbG93aW5nIHJlYXNvbjogezB9JyxcclxuICAgICAgICAnQUREX0NVU1RPTUVSX0ZBSUxFRCc6ICdBZGRpbmcgY3VzdG9tZXIgZmFpbGVkIGZvciB0aGUgZm9sbG93aW5nIHJlYXNvbjogezB9J1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE9yZGVyU3RhdHVzMklzQ29tcGxldGUgPSB7fTtcclxuICAgIE9yZGVyU3RhdHVzMklzQ29tcGxldGVbQ09OU1RBTlRTLk9SREVSX1NUQVRVU0VTLlNVQk1JVFRFRF0gPSB0cnVlO1xyXG4gICAgT3JkZXJTdGF0dXMySXNDb21wbGV0ZVtDT05TVEFOVFMuT1JERVJfU1RBVFVTRVMuQUNDRVBURURdID0gdHJ1ZTtcclxuICAgIE9yZGVyU3RhdHVzMklzQ29tcGxldGVbQ09OU1RBTlRTLk9SREVSX1NUQVRVU0VTLlBFTkRJTkdfUkVWSUVXXSA9IHRydWU7XHJcblxyXG4gICAgdmFyIE9yZGVyU3RhdHVzMklzUmVhZHkgPSB7fTtcclxuICAgIE9yZGVyU3RhdHVzMklzUmVhZHlbQ09OU1RBTlRTLk9SREVSX0FDVElPTlMuU1VCTUlUX09SREVSXSA9IHRydWU7XHJcbiAgICBPcmRlclN0YXR1czJJc1JlYWR5W0NPTlNUQU5UUy5PUkRFUl9BQ1RJT05TLkFDQ0VQVF9PUkRFUl0gPSB0cnVlO1xyXG5cclxuXHJcbiAgICB2YXIgUGF5bWVudFN0cmF0ZWdpZXMgPSB7XHJcbiAgICAgICAgXCJQYXlwYWxFeHByZXNzXCI6IGZ1bmN0aW9uIChvcmRlciwgYmlsbGluZ0luZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9yZGVyLmNyZWF0ZVBheW1lbnQoe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuVXJsOiBiaWxsaW5nSW5mby5wYXlwYWxSZXR1cm5VcmwsXHJcbiAgICAgICAgICAgICAgICBjYW5jZWxVcmw6IGJpbGxpbmdJbmZvLnBheXBhbENhbmNlbFVybFxyXG4gICAgICAgICAgICB9KS5lbnN1cmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBheW1lbnQgPSBvcmRlci5nZXRDdXJyZW50UGF5bWVudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwYXltZW50KSBlcnJvcnMudGhyb3dPbk9iamVjdChvcmRlciwgJ1BBWU1FTlRfTUlTU0lORycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwYXltZW50LnBheW1lbnRTZXJ2aWNlVHJhbnNhY3Rpb25JZCkgZXJyb3JzLnRocm93T25PYmplY3Qob3JkZXIsICdQQVlQQUxfVFJBTlNBQ1RJT05fSURfTUlTU0lORycpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gQXBpUmVmZXJlbmNlLnVybHMucGF5cGFsRXhwcmVzcyArIChBcGlSZWZlcmVuY2UudXJscy5wYXlwYWxFeHByZXNzLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgXCJ0b2tlbj1cIiArIHBheW1lbnQucGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkOyAvL3V0aWxzLmZvcm1hdFN0cmluZyhDT05TVEFOVFMuQkFTRV9QQVlQQUxfVVJMLCBwYXltZW50LnBheW1lbnRTZXJ2aWNlVHJhbnNhY3Rpb25JZCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiQ3JlZGl0Q2FyZFwiOiBmdW5jdGlvbiAob3JkZXIsIGJpbGxpbmdJbmZvKSB7XHJcbiAgICAgICAgICAgIHZhciBjYXJkID0gb3JkZXIuYXBpLmNyZWF0ZVN5bmMoJ2NyZWRpdGNhcmQnLCBiaWxsaW5nSW5mby5jYXJkKTtcclxuICAgICAgICAgICAgZXJyb3JzLnBhc3NGcm9tKGNhcmQsIG9yZGVyKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNhcmQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24oY2FyZCkge1xyXG4gICAgICAgICAgICAgICAgYmlsbGluZ0luZm8uY2FyZCA9IGNhcmQuZ2V0T3JkZXJEYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBvcmRlci5wcm9wKCdiaWxsaW5nSW5mbycsIGJpbGxpbmdJbmZvKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcmRlci5jcmVhdGVQYXltZW50KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJDaGVja1wiOiBmdW5jdGlvbiAob3JkZXIsIGJpbGxpbmdJbmZvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcmRlci5jcmVhdGVQYXltZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBhZGRDb3Vwb246IGZ1bmN0aW9uKGNvdXBvbkNvZGUpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseUNvdXBvbihjb3Vwb25Db2RlKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldCgpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgIGVycm9ycy50aHJvd09uT2JqZWN0KHNlbGYsICdBRERfQ09VUE9OX0ZBSUxFRCcsIHJlYXNvbi5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGROZXdDdXN0b21lcjogZnVuY3Rpb24gKG5ld0N1c3RvbWVyUGF5bG9hZCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmFwaS5hY3Rpb24oJ2N1c3RvbWVyJywgJ2NyZWF0ZVN0b3JlZnJvbnQnLCBuZXdDdXN0b21lclBheWxvYWQpLnRoZW4oZnVuY3Rpb24gKGN1c3RvbWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zZXRVc2VySWQoKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnRocm93T25PYmplY3Qoc2VsZiwgJ0FERF9DVVNUT01FUl9GQUlMRUQnLCByZWFzb24ubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlUGF5bWVudDogZnVuY3Rpb24oZXh0cmFQcm9wcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcGkuYWN0aW9uKHRoaXMsICdjcmVhdGVQYXltZW50JywgdXRpbHMuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZTogdGhpcy5hcGkuY29udGV4dC5DdXJyZW5jeSgpLnRvVXBwZXJDYXNlKCksXHJcbiAgICAgICAgICAgICAgICBhbW91bnQ6IHRoaXMucHJvcCgnYW1vdW50UmVtYWluaW5nRm9yUGF5bWVudCcpLFxyXG4gICAgICAgICAgICAgICAgbmV3QmlsbGluZ0luZm86IHRoaXMucHJvcCgnYmlsbGluZ0luZm8nKVxyXG4gICAgICAgICAgICB9LCBleHRyYVByb3BzIHx8IHt9KSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRTdG9yZUNyZWRpdDogZnVuY3Rpb24ocGF5bWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVQYXltZW50KHtcclxuICAgICAgICAgICAgICAgIGFtb3VudDogcGF5bWVudC5hbW91bnQsXHJcbiAgICAgICAgICAgICAgICBuZXdCaWxsaW5nSW5mbzoge1xyXG4gICAgICAgICAgICAgICAgICAgIHBheW1lbnRUeXBlOiAnU3RvcmVDcmVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlQ3JlZGl0Q29kZTogcGF5bWVudC5zdG9yZUNyZWRpdENvZGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRQYXltZW50OiBmdW5jdGlvbiAocGF5bWVudCkge1xyXG4gICAgICAgICAgICB2YXIgYmlsbGluZ0luZm8gPSBwYXltZW50IHx8IHRoaXMucHJvcCgnYmlsbGluZ0luZm8nKTtcclxuICAgICAgICAgICAgaWYgKCFiaWxsaW5nSW5mbykgZXJyb3JzLnRocm93T25PYmplY3QodGhpcywgJ0JJTExJTkdfSU5GT19NSVNTSU5HJyk7XHJcbiAgICAgICAgICAgIGlmICghYmlsbGluZ0luZm8ucGF5bWVudFR5cGUgfHwgIShiaWxsaW5nSW5mby5wYXltZW50VHlwZSBpbiBQYXltZW50U3RyYXRlZ2llcykpIGVycm9ycy50aHJvd09uT2JqZWN0KHRoaXMsICdQQVlNRU5UX1RZUEVfTUlTU0lOR19PUl9VTlJFQ09HTklaRUQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFBheW1lbnRTdHJhdGVnaWVzW2JpbGxpbmdJbmZvLnBheW1lbnRUeXBlXSh0aGlzLCBiaWxsaW5nSW5mbyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRBY3RpdmVQYXltZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXltZW50cyA9IHRoaXMucHJvcCgncGF5bWVudHMnKSxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZVBheW1lbnRzID0gW107XHJcbiAgICAgICAgICAgIGlmIChwYXltZW50cy5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBwYXltZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXltZW50c1tpXS5zdGF0dXMgPT09IENPTlNUQU5UUy5QQVlNRU5UX1NUQVRVU0VTLk5FVylcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlUGF5bWVudHMucHVzaCh1dGlscy5jbG9uZShwYXltZW50c1tpXSkpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZVBheW1lbnRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Q3VycmVudFBheW1lbnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgYWN0aXZlUGF5bWVudHMgPSB0aGlzLmdldEFjdGl2ZVBheW1lbnRzKCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBhY3RpdmVQYXltZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBheW1lbnRzW2ldLnBheW1lbnRUeXBlICE9PSBcIlN0b3JlQ3JlZGl0XCIpIHJldHVybiBhY3RpdmVQYXltZW50c1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QWN0aXZlU3RvcmVDcmVkaXRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGFjdGl2ZVBheW1lbnRzID0gdGhpcy5nZXRBY3RpdmVQYXltZW50cygpLFxyXG4gICAgICAgICAgICAgICAgY3JlZGl0cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gYWN0aXZlUGF5bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVQYXltZW50c1tpXS5wYXltZW50VHlwZSA9PT0gXCJTdG9yZUNyZWRpdFwiKSBjcmVkaXRzLnVuc2hpZnQoYWN0aXZlUGF5bWVudHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVkaXRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdm9pZFBheW1lbnQ6IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICB2YXIgb2JqID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGVyZm9ybVBheW1lbnRBY3Rpb24oe1xyXG4gICAgICAgICAgICAgICAgcGF5bWVudElkOiBpZCxcclxuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6IENPTlNUQU5UUy5QQVlNRU5UX0FDVElPTlMuVk9JRFxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyYXdKU09OKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmF3SlNPTiB8fCByYXdKU09OID09PSAwIHx8IHJhd0pTT04gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJhd0pTT04uYmlsbGluZ0luZm87XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRhdGEgPSB1dGlscy5jbG9uZShyYXdKU09OKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmoudW5zeW5jZWQ7XHJcbiAgICAgICAgICAgICAgICBvYmouZmlyZSgnc3luYycsIHJhd0pTT04sIG9iai5kYXRhKTtcclxuICAgICAgICAgICAgICAgIG9iai5hcGkuZmlyZSgnc3luYycsIG9iaiwgcmF3SlNPTiwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja291dDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBhdmFpbGFibGVBY3Rpb25zID0gdGhpcy5wcm9wKCdhdmFpbGFibGVBY3Rpb25zJyk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0NvbXBsZXRlKCkpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBhdmFpbGFibGVBY3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWlsYWJsZUFjdGlvbnNbaV0gaW4gT3JkZXJTdGF0dXMySXNSZWFkeSkgcmV0dXJuIHRoaXMucGVyZm9ybU9yZGVyQWN0aW9uKGF2YWlsYWJsZUFjdGlvbnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVycm9ycy50aHJvd09uT2JqZWN0KHRoaXMsICdPUkRFUl9DQU5OT1RfU1VCTUlUJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0NvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhIU9yZGVyU3RhdHVzMklzQ29tcGxldGVbdGhpcy5wcm9wKCdzdGF0dXMnKV07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSgpKTsiLCJ2YXIgZXJyb3JzID0gcmVxdWlyZSgnLi4vZXJyb3JzJyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBDT05TVEFOVFMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMvZGVmYXVsdCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGFkZFRvV2lzaGxpc3Q6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5hcGkuY3JlYXRlU3luYygnd2lzaGxpc3QnLCB7IGN1c3RvbWVyQWNjb3VudElkOiBwYXlsb2FkLmN1c3RvbWVyQWNjb3VudElkIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0LmdldE9yQ3JlYXRlKCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGVycm9ycy5wYXNzRnJvbShsaXN0LCBzZWxmKTtcclxuICAgICAgICAgICAgcmV0dXJuIGxpc3QuYWRkSXRlbSh7XHJcbiAgICAgICAgICAgICAgICBxdWFudGl0eTogcGF5bG9hZC5xdWFudGl0eSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZTogcGF5bG9hZC5jdXJyZW5jeUNvZGUgfHwgc2VsZi5hcGkuY29udGV4dC5DdXJyZW5jeSgpLFxyXG4gICAgICAgICAgICAgICAgbG9jYWxlQ29kZTogcGF5bG9hZC5sb2NhbGVDb2RlIHx8IHNlbGYuYXBpLmNvbnRleHQuTG9jYWxlKCksXHJcbiAgICAgICAgICAgICAgICBwcm9kdWN0OiBzZWxmLmRhdGFcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkVG9DYXJ0Rm9yUGlja3VwOiBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFkZFRvQ2FydCh1dGlscy5leHRlbmQoe30sIHRoaXMuZGF0YSwge1xyXG4gICAgICAgICAgICBmdWxmaWxsbWVudE1ldGhvZDogQ09OU1RBTlRTLkZVTEZJTExNRU5UX01FVEhPRFMuUElDS1VQXHJcbiAgICAgICAgfSwgb3B0cykpO1xyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgZ2V0U2hpcHBpbmdNZXRob2RzRnJvbUNvbnRhY3Q6IGZ1bmN0aW9uIChjb250YWN0KSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBzZWxmLnVwZGF0ZSh7IGZ1bGZpbGxtZW50Q29udGFjdDogc2VsZi5wcm9wKCdmdWxmaWxsbWVudENvbnRhY3QnKSB9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0U2hpcHBpbmdNZXRob2RzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBwb3N0Y29uc3RydWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub24oJ3N5bmMnLCBmdW5jdGlvbiAoanNvbikge1xyXG4gICAgICAgICAgICBpZiAoanNvbiAmJiBqc29uLmF1dGhUaWNrZXQgJiYganNvbi5hdXRoVGlja2V0LmFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwaS5jb250ZXh0LlVzZXJDbGFpbXMoanNvbi5hdXRoVGlja2V0LmFjY2Vzc1Rva2VuKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBpLmZpcmUoJ2xvZ2luJywganNvbi5hdXRoVGlja2V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZUFuZExvZ2luOiBmdW5jdGlvbihwYXlsb2FkKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlmICghcGF5bG9hZCkgcGF5bG9hZCA9IHRoaXMuZGF0YTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUocGF5bG9hZCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmxvZ2luKHtcclxuICAgICAgICAgICAgICAgIGVtYWlsQWRkcmVzczogcGF5bG9hZC5lbWFpbEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGF5bG9hZC5wYXNzd29yZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBjcmVhdGVXaXRoQ3VzdG9tZXI6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUFuZExvZ2luKHBheWxvYWQpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5hcGkuYWN0aW9uKCdjdXN0b21lcicsICdjcmVhdGUnLCB7XHJcbiAgICAgICAgICAgICAgICB1c2VySWQ6IHNlbGYucHJvcCgnaWQnKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGN1c3RvbWVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXN0b21lci5hZGRDb250YWN0KHtcclxuICAgICAgICAgICAgICAgIGVtYWlsOiBzZWxmLnByb3AoJ2VtYWlsQWRkcmVzcycpLFxyXG4gICAgICAgICAgICAgICAgZmlyc3ROYW1lOiBzZWxmLnByb3AoJ2ZpcnN0TmFtZScpLFxyXG4gICAgICAgICAgICAgICAgbGFzdE5hbWVPclN1cm5hbWU6IHNlbGYucHJvcCgnbGFzdE5hbWUnKSxcclxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IHt9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59OyIsInZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZXJyb3JzLnJlZ2lzdGVyKHtcclxuICAgICAgICAnTk9fSVRFTVNfSU5fV0lTSExJU1QnOiAnTm8gaXRlbXMgaW4gd2lzaGxpc3QuJyxcclxuICAgICAgICAnTk9fTUFUQ0hJTkdfSVRFTV9JTl9XSVNITElTVCc6ICdObyB3aXNobGlzdCBpdGVtIG1hdGNoaW5nIElEIHswfSdcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBnZXRJdGVtID0gZnVuY3Rpb24gKGxpc3QsIGl0ZW0pIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBsaXN0LnByb3AoJ2l0ZW1zJyk7XHJcbiAgICAgICAgaWYgKCFpdGVtcyB8fCBpdGVtcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVycm9ycy50aHJvd09uT2JqZWN0KGxpc3QsICdOT19JVEVNU19JTl9XSVNITElTVCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbXNbaV0uaWQgPT09IGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtID0gaXRlbXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JzLnRocm93T25PYmplY3QobGlzdCwgJ05PX01BVENISU5HX0lURU1fSU5fV0lTSExJU1QnLCBpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldE9yQ3JlYXRlOiBmdW5jdGlvbiAoY2lkKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdCh7IGN1c3RvbWVyQWNjb3VudElkOiBjaWQgfSkudGhlbihmdW5jdGlvbiAobGlzdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3Q7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNyZWF0ZURlZmF1bHQoeyBjdXN0b21lckFjY291bnRJZDogY2lkIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZEl0ZW1Ub0NhcnRCeUlkOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRJdGVtVG9DYXJ0KGdldEl0ZW0odGhpcywgaXRlbSkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIG92ZXJyaWRpbmcgZ2V0IHRvIGFsd2F5cyB1c2UgZ2V0SXRlbXNCeU5hbWUgdG8gZ2V0IHRoZSBpdGVtcyBjb2xsZWN0aW9uXHJcbiAgICAgICAgICAgIC8vIHNvIGl0ZW1zIGFyZSBhbHdheXMgc29ydGVkIGJ5IHVwZGF0ZSBkYXRlXHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbXNCeU5hbWUoKS50aGVuKGZ1bmN0aW9uIChpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5wcm9wKCdpdGVtcycsIGl0ZW1zKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZmlyZSgnc3luYycsIHNlbGYuZGF0YSwgc2VsZik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSgpKTsiLCJ2YXIgcHJvY2Vzcz1yZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIik7Ly8gQkVHSU4gVVRJTFNcclxuLy8gTWFueSBvZiB0aGVzZSBwb2FjaGVkIGZyb20gbG9kYXNoXHJcblxyXG4gICAgdmFyIG1heEZsYXR0ZW5EZXB0aCA9IDIwO1xyXG5cclxuICAgIHZhciBNaWNyb0V2ZW50ID0gcmVxdWlyZSgnbWljcm9ldmVudCcpO1xyXG4gICAgdmFyIGlzTm9kZSA9IHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MudGl0bGUgPT09IFwibm9kZVwiO1xyXG4gICAgdmFyIFhIUjtcclxuICAgIHZhciBJZnJhbWVYSFI7XHJcbiAgICB2YXIgZ2V0WEhSID0gaXNOb2RlID8gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgWEhSID0gWEhSIHx8IHJlcXVpcmUoJ3htbGh0dHByZXF1ZXN0JykuWE1MSHR0cFJlcXVlc3Q7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBYSFIoKTtcclxuICAgIH0gOiAod2luZG93LlhNTEh0dHBSZXF1ZXN0ID8gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgfSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTtcclxuICAgIH0pO1xyXG4gICAgdmFyIHV0aWxzID0ge1xyXG4gICAgICAgIGV4dGVuZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgc3JjLCBjb3B5LCBuYW1lLCBvcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxyXG4gICAgICAgICAgICAgICAgaSA9IDEsXHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgaWYgKChvcHRpb25zID0gYXJndW1lbnRzW2ldKSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobmFtZSBpbiBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHkgPSBvcHRpb25zW25hbWVdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBjb3B5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvcHkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gY29weTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvbmU6IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTsgLy8gY2hlYXAgY29weSA6KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmxhdHRlbjogZnVuY3Rpb24gKG9iaiwgaW50bywgcHJlZml4LCBzZXBhcmF0b3IsIGRlcHRoKSB7XHJcbiAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMCkgdGhyb3cgXCJDYW5ub3QgZmxhdHRlbiBjaXJjdWxhciBvYmplY3QuXCI7XHJcbiAgICAgICAgICAgIGlmICghZGVwdGgpIGRlcHRoID0gbWF4RmxhdHRlbkRlcHRoO1xyXG4gICAgICAgICAgICBpbnRvID0gaW50byB8fCB7fTtcclxuICAgICAgICAgICAgc2VwYXJhdG9yID0gc2VwYXJhdG9yIHx8IFwiLlwiO1xyXG4gICAgICAgICAgICBwcmVmaXggPSBwcmVmaXggfHwgJyc7XHJcbiAgICAgICAgICAgIGZvciAodmFyIG4gaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBuO1xyXG4gICAgICAgICAgICAgICAgdmFsID0gb2JqW25dO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JyAmJiAhKFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsIGluc3RhbmNlb2YgQXJyYXkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIHZhbCBpbnN0YW5jZW9mIERhdGUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgIHZhbCBpbnN0YW5jZW9mIFJlZ0V4cClcclxuICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZmxhdHRlbih2YWwudG9KU09OID8gdmFsLnRvSlNPTigpIDogdmFsLCBpbnRvLCBwcmVmaXggKyBrZXkgKyBzZXBhcmF0b3IsIHNlcGFyYXRvciwgLS1kZXB0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRvW3ByZWZpeCArIGtleV0gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaW50bztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaGVyaXQ6IGZ1bmN0aW9uIChwYXJlbnQsIG1vcmUpIHtcclxuICAgICAgICAgICAgdmFyIEFwaUluaGVyaXRlZE9iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdCkgdGhpcy5jb25zdHJ1Y3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucG9zdGNvbnN0cnVjdCkgdGhpcy5wb3N0Y29uc3RydWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIEFwaUluaGVyaXRlZE9iamVjdC5wcm90b3R5cGUgPSB1dGlscy5leHRlbmQobmV3IHBhcmVudCgpLCBtb3JlKTtcclxuICAgICAgICAgICAgcmV0dXJuIEFwaUluaGVyaXRlZE9iamVjdDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hcDogZnVuY3Rpb24gKGFyciwgZm4sIHNjb3BlKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdBcnIgPSBbXSwgbGVuID0gYXJyLmxlbmd0aDtcclxuICAgICAgICAgICAgc2NvcGUgPSBzY29wZSB8fCB3aW5kb3c7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIG5ld0FycltpXSA9IGZuLmNhbGwoc2NvcGUsIGFycltpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ld0FycjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZHVjZTogZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIGFjY3VtdWxhdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IC0xLFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBhY2N1bXVsYXRvciA9IGNhbGxiYWNrKGFjY3VtdWxhdG9yLCBjb2xsZWN0aW9uW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNsaWNlOiBmdW5jdGlvbihhcnJheUxpa2VPYmosIGl4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2VPYmosIGl4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluZGV4T2Y6IChmdW5jdGlvbihuYXRpdmVJbmRleE9mKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAobmF0aXZlSW5kZXhPZiAmJiB0eXBlb2YgbmF0aXZlSW5kZXhPZiA9PT0gXCJmdW5jdGlvblwiKSA/IGZ1bmN0aW9uKGFyciwgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmF0aXZlSW5kZXhPZi5jYWxsKGFyciwgdmFsKTtcclxuICAgICAgICAgICAgfSA6IGZ1bmN0aW9uIChhcnIsIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldID09PSB2YWwpIHJldHVybiBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oQXJyYXkucHJvdG90eXBlLmluZGV4T2YpKSxcclxuICAgICAgICBmb3JtYXRTdHJpbmc6IGZ1bmN0aW9uKHRwdCkge1xyXG4gICAgICAgICAgICB2YXIgZm9ybWF0dGVkID0gdHB0LCBvdGhlckFyZ3MgPSB1dGlscy5zbGljZShhcmd1bWVudHMsIDEpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gb3RoZXJBcmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWQgPSBmb3JtYXR0ZWQuc3BsaXQoJ3snICsgaSArICd9Jykuam9pbihvdGhlckFyZ3NbaV0gfHwgJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXR0ZWQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRPcDogZnVuY3Rpb24ocHJvdG8sIGZuTmFtZSkge1xyXG4gICAgICAgICAgICBwcm90b1tmbk5hbWVdID0gZnVuY3Rpb24gKGNvbmYpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24odGhpcywgZm5OYW1lLCBjb25mKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFR5cGU6IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciByZVR5cGUgPSAvXFxbb2JqZWN0IChcXHcrKVxcXS87XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGhpbmcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IHJlVHlwZS5leGVjKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoWzFdO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSksXHJcbiAgICAgICAgY2FtZWxDYXNlOiAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcmRhc2hBbHBoYSA9IC8tKFtcXGRhLXpdKS9naSxcclxuICAgICAgICAgICAgICAgIGNjY2IgPSBmdW5jdGlvbiAobWF0Y2gsIGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzdHIsIGZpcnN0Q2FwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGZpcnN0Q2FwID8gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnN1YnN0cmluZygxKSA6IHN0cikucmVwbGFjZShyZGFzaEFscGhhLCBjY2NiKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KCkpLFxyXG5cclxuICAgICAgICBkYXNoQ2FzZTogKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHJjYXNlID0gLyhbYS16XSkoW0EtWl0pL2csXHJcbiAgICAgICAgICAgICAgICByc3RyID0gXCIkMS0kMlwiO1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJjYXNlLCByc3RyKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSksXHJcblxyXG4gICAgICAgIHJlcXVlc3Q6IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgaGVhZGVycywgZGF0YSwgc3VjY2VzcywgZmFpbHVyZSwgaWZyYW1lUGF0aCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIpIGRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciB4aHI7XHJcbiAgICAgICAgICAgIGlmIChpZnJhbWVQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICBJZnJhbWVYSFIgPSBJZnJhbWVYSFIgfHwgcmVxdWlyZSgnLi9pZnJhbWV4aHInKTtcclxuICAgICAgICAgICAgICAgIHhociA9IG5ldyBJZnJhbWVYSFIoaWZyYW1lUGF0aCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB4aHIgPSBnZXRYSFIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIGZhaWx1cmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IHRpbWVkIG91dC4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogJ1RJTUVPVVQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9LCB4aHIpO1xyXG4gICAgICAgICAgICB9LCA2MDAwMCk7XHJcbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGpzb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIucmVzcG9uc2VUZXh0ICYmIHhoci5yZXNwb25zZVRleHQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiVW5hYmxlIHRvIHBhcnNlIHJlc3BvbnNlOiBcIiArIHhoci5yZXNwb25zZVRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiAnVU5LTk9XTidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHhociwgZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDAgfHwgeGhyLnN0YXR1cyA9PT0gMzA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MoanNvbiwgeGhyKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlKGpzb24gfHwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IGZhaWxlZCwgbm8gcmVzcG9uc2UgZ2l2ZW4uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogeGhyLnN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgeGhyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHhoci5vcGVuKG1ldGhvZCB8fCAnR0VUJywgdXJsKTtcclxuICAgICAgICAgICAgaWYgKGhlYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGggaW4gaGVhZGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoZWFkZXJzW2hdKSB4aHIuc2V0UmVxdWVzdEhlYWRlcihoLCBoZWFkZXJzW2hdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIHhoci5zZW5kKG1ldGhvZCAhPT0gJ0dFVCcgJiYgZGF0YSk7XHJcbiAgICAgICAgICAgIHJldHVybiB4aHI7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGlwZWxpbmU6IGZ1bmN0aW9uICh0YXNrcyAvKiBpbml0aWFsQXJncy4uLiAqLykge1xyXG4gICAgICAgICAgICAvLyBTZWxmLW9wdGltaXppbmcgZnVuY3Rpb24gdG8gcnVuIGZpcnN0IHRhc2sgd2l0aCBtdWx0aXBsZVxyXG4gICAgICAgICAgICAvLyBhcmdzIHVzaW5nIGFwcGx5LCBidXQgc3Vic2VxdWVuY2UgdGFza3MgdmlhIGRpcmVjdCBpbnZvY2F0aW9uXHJcbiAgICAgICAgICAgIHZhciBydW5UYXNrID0gZnVuY3Rpb24gKGFyZ3MsIHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJ1blRhc2sgPSBmdW5jdGlvbiAoYXJnLCB0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2soYXJnKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdXRpbHMud2hlbi5hbGwoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkudGhlbihmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHV0aWxzLndoZW4ucmVkdWNlKHRhc2tzLCBmdW5jdGlvbiAoYXJnLCB0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1blRhc2soYXJnLCB0YXNrKTtcclxuICAgICAgICAgICAgICAgIH0sIGFyZ3MpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB3aGVuOiByZXF1aXJlKCd3aGVuJyksXHJcbiAgICAgICAgdXJpdGVtcGxhdGU6IHJlcXVpcmUoJ3VyaXRlbXBsYXRlJyksXHJcblxyXG4gICAgICAgIGFkZEV2ZW50czogZnVuY3Rpb24gKGN0b3IpIHtcclxuICAgICAgICAgICAgTWljcm9FdmVudC5taXhpbihjdG9yKTtcclxuICAgICAgICAgICAgY3Rvci5wcm90b3R5cGUub24gPSBjdG9yLnByb3RvdHlwZS5iaW5kO1xyXG4gICAgICAgICAgICBjdG9yLnByb3RvdHlwZS5vZmYgPSBjdG9yLnByb3RvdHlwZS51bmJpbmQ7XHJcbiAgICAgICAgICAgIGN0b3IucHJvdG90eXBlLmZpcmUgPSBjdG9yLnByb3RvdHlwZS50cmlnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB1dGlscztcclxuLy8gRU5EIFVUSUxTXHJcblxyXG4vKioqKioqKioqLyJdfQ==
(19)
});
