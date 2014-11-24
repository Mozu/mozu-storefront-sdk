/*! 
 * Mozu JavaScript SDK - v0.3.0 - 2014-11-20
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


//# sourceUrl=src/collection.js

// BEGIN OBJECT

var utils = require('./utils');
var ApiObject = require('./object');

    function convertItem(raw) {
        return ApiObject.create(this.itemType, raw, this.api);
    }

    var ApiCollectionConstructor = function (type, data, api, itemType) {
        ApiObject.apply(this, arguments);
        this.itemType = itemType;
    };

    ApiCollectionConstructor.prototype = utils.extend(new ApiObject(), {
        isCollection: true,
        constructor: ApiCollectionConstructor,
        postconstruct: function(type, data, api, itemType) {
            var self = this;
            if (!data) data = {};
            if (!data.items) this.prop("items", data.items = []);
            if (data.items.length > 0) this.add(data.items, true);
            this.on('sync', function(raw) {
                if (raw && raw.items) {
                    self.removeAll();
                    self.add(raw.items);
                }
            });
        },
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


//# sourceUrl=src/constants/default.js

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
        PICKUP: "Pickup",
        DIGITAL: "Digital"
    }
};

},{}],15:[function(require,module,exports){


//# sourceUrl=src/context.js

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
    mutableAccessors = ['app-claims', 'user-claims', 'callchain', 'currency', 'locale','dataview-mode'], //, 'bypass-cache'],
    immutableAccessors = ['tenant', 'site', 'master-catalog', 'catalog'],
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
        var xform = {}, l = ApiReference.headerPrefix.length;
        for (var k in conf) {
            if (conf.hasOwnProperty(k)) {
                if (k.indexOf(ApiReference.headerPrefix) === 0) {
                    xform[k.substring(l)] = conf[k];
                } else {
                    xform[k] = conf[k];
                }
            }
        }
        return new ApiContextConstructor(xform);
    },
    asObject: function(prefix) {
        var obj = {};
        prefix = prefix || '';
        for (var i = 0; i < allAccessorsLength; i++) {
            obj[prefix + allAccessors[i]] = this[allAccessors[i]];
        }
        return obj;
    },
    asHeaders: function() {
        return this.asObject(ApiReference.headerPrefix);
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


//# sourceUrl=src/errors.js

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


//# sourceUrl=src/iframexhr.js

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
                    if (e && e.data === "process-tick") return; // browserify clogs up this channel
                    if (e.data.indexOf(self.uid) !== 0) return;
                    if (!validateOrigin(self, e.origin)) throw new Error("Origin " + e.origin + " does not match required origin " + self.frameOrigin);
                    if (e.data === self.uid + " ready") return self.postMessage();
                    self.update(e.data.substring(self.uid.length));
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
                        if (data === self.uid + "ready") return self.postMessage();

                        if (hashRE.test(self.hash)) {
                            self.lastHash = self.hash;
                            self.update(data.substring(self.uid.length));
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


    var uids = 0;
    var IframeXMLHttpRequest = function (frameUrl) {
        var frameMatch = frameUrl.match(originRE);
        if (!frameMatch || !frameMatch[0]) throw new Error(frameUrl + " does not seem to have a valid origin.");
        this.frameOrigin = frameMatch[0].toLowerCase();
        this.uid = "xhr_" + (++uids);
        this.frameUrl = frameUrl + (frameUrl.indexOf('?') === -1 ? '?' : '&') + "parenturl=" + encodeURIComponent(location.href) + "&parentdomain=" + encodeURIComponent(location.protocol + '//' + location.host) + "&messagedelimiter=" + encodeURIComponent(messageDelimiter) + "&uid=" + this.uid;
        this.headers = {};
    };

    IframeXMLHttpRequest.version = 2;

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


//# sourceUrl=src/init.js

// BEGIN INIT
var ApiContext = require('./context');
var initialGlobalContext = new ApiContext();
module.exports = initialGlobalContext;
// END INIT
},{"./context":15}],19:[function(require,module,exports){


//# sourceUrl=src/init_debug.js

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


//# sourceUrl=src/interface.js

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

var errorMessage = "No {0} was specified. Run Mozu.Tenant(tenantId).MasterCatalog(masterCatalogId).Catalog(catalogId).Site(siteId).",
    requiredContextValues = ['Tenant', 'MasterCatalog', 'Site', 'Catalog'];
var ApiInterfaceConstructor = function(context) {
    // for now, cheat and try to grab context from the known preload if it's not being supplied correctly
    var headerPreload = document.getElementById('data-mz-preload-apicontext'),
        headerPreloadText = headerPreload && (headerPreload.textContent || headerPreload.innerText || headerPreload.text || headerPreload.innerHTML),
        headerJSON = headerPreloadText && JSON.parse(headerPreloadText);

    if (headerJSON && headerJSON.headers) context = context.Store(headerJSON.headers);

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

        var xhr;
        var triedRefresh = false;
        var makeRequest = function () {
            var contextHeaders = me.getRequestHeaders();
            xhr = utils.request(method, url, contextHeaders, data, function (rawJSON) {
            // update context with response headers
            me.fire('success', rawJSON, xhr, requestConf);
            deferred.resolve(rawJSON, xhr);
            }, function (error) {

                var failRequest = function () {
            deferred.reject(error, xhr, url);
                }

                if (error && error.errorCode === "INVALID_ACCESS_TOKEN" && !triedRefresh) {
                    me.refresh().then(makeRequest, failRequest);
                    triedRefresh = true;
                } else {
                    failRequest();
                }
        }, requestConf.iframeTransportUrl);
        };

        var cancelled = false,
            canceller = function() {
                cancelled = true;
                xhr.abort();
                deferred.reject("Request cancelled.")
            };

        makeRequest();
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
    refresh: function() {
        var me = this,
            updateClaimsHeaders = function(json, xhr, conf) {
                if (conf === '/token/refresh') {
                    me.context.AppClaims(xhr.getResponseHeader(ApiReference.headerPrefix + 'app-claims'));
                    me.context.UserClaims(xhr.getResponseHeader(ApiReference.headerPrefix + 'user-claims'));
                }
            };
        me.on('success', updateClaimsHeaders);
        return me.request('POST', '/token/refresh').ensure(function () {
            me.off('success', updateClaimsHeaders);
            return null;
        });
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
            if (!requestConf.suppressErrors) {
            obj.fire('error', errorJSON);
            me.fire('error', errorJSON, obj);
            }
            throw errorJSON;
        });
    },
    getActionConfig: function(instanceOrType, actionName, data) {
        var me = this,
            obj = instanceOrType instanceof ApiObject ? instanceOrType : me.createSync(instanceOrType),
            type = obj.type;
        return ApiReference.getRequestConfig(actionName, type, data || obj.data, me.context, obj);
    },
    getRequestHeaders: function() {
        return this.context.asHeaders();
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
module.exports=

//# sourceUrl=src/methods.json

{
    "document": {
        "template": "{+documentListService}{listName}/documents/{id}{?_*}",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "documentList": {
        "template": "{+documentListService}{listName}/documents{?_*}",
        "shortcutParam": "listName",
        "defaultParams": {
            "startIndex": 0,
            "pageSize": 15
        },
        "collectionOf": "document",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "documentView": {
        "template": "{+documentListService}{listName}/views/{viewName}/documents{?_*}",
        "shortcutParam": "listName",
        "defaultParams": {
            "viewName": "default",
            "startIndex": 0,
            "pageSize": 15
        },
        "collectionOf": "document",
        "useIframeTransport": "{{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "entityList": {
        "template": "{+entityListService}{listName}/entities{?_*}",
        "shortcutParam": "listName",
        "defaultParams": {
            "startIndex": 0,
            "pageSize": 15
        },
        "collectionOf": "entity",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "entityView": {
        "template": "{+entityListService}{listName}/views/{viewName}/entities{?_*}",
        "shortcutParam": "listName",
        "defaultParams": {
            "viewName": "default",
            "startIndex": 0,
            "pageSize": 15
        },
        "collectionOf": "entity",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "entity": {
        "template": "{+entityListService}{listName}/entities/{id}{?_*}",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "entityContainer": {
        "template": "{+entityListService}{listName}/entityContainers/{id}{?_*}",
        "shortcutParam": "listName",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "entityContainerList": {
        "template": "{+entityListService}{listName}/entityContainers{?_*}",
        "shortcutParam": "listName",
        "defaultParams": {
            "startIndex": 0,
            "pageSize": 15
        },
        "collectionOf": "entityContainer",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
    "entityContainerView": {
        "template": "{+entityListService}{listName}/views/{viewName}/entityContainers{?_*}",
        "shortcutParam": "listName",
        "defaultParams": {
            "startIndex": 0,
            "viewName": "default",
            "pageSize": 15
        },
        "collectionOf": "entityContainer",
        "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
    },
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
        "template": "{+categoryService}{id}{?allowInactive}",
        "shortcutParam": "id",
        "defaultParams": {
            "allowInactive": false
        }
    },
    "categorytree": {
        "template": "{+categoryService}tree",
        "returnType": "json"
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
    "suggest": {
        "template": "{+searchService}suggest{?_*}",
        "shortcutParam": "query"
    },
    "customers": {
        "collectionOf": "customer"
    },
    "orders": {
        "template": "{+orderService}{?_*}",
        "defaultParams": {
            "filter": "Status ne Created and Status ne Validated and Status ne Pending",
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
        "defaults": {
            "template": "{+cartService}current"
        },
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
        "defaults": { 
            "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}"
        },
        "shortcutParam": "id",
        "includeSelf": true,
        "create": {
            "verb": "POST",
            "template": "{+customerService}add-account-and-login",
            "returnType": "login"
        },
        "create-storefront": {
            "verb": "POST",
            "template": "{+storefrontUserService}create",
            "returnType": "login"
        },
        "login": {
            "verb": "POST",
            "template": "{+customerService}../authtickets",
            "returnType": "login"
        },
        "login-storefront": {
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
        },
        "get-credit": {
            "verb": "GET",
            "template": "{+creditService}/{id}",
            "includeSelf": true,
            "returnType": "storecredit"
        }
    },
    "storecredit": {
        "associate-to-shopper": {
            "verb": "PUT",
            "template": "{+creditService}{code}/associate-to-shopper",
            "includeSelf": true
        },
        "get-credit": {
            "verb": "GET",
            "template": "{+creditService}{code}",
            "includeSelf": true,
            "returnType": "storecredit"
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
        },
        "validate-address-lenient": {
            "verb": "POST",
            "template": "{+addressValidationService}",
            "includeSelf": {
                "asProperty": "address"
            },
            "overridePostData": true,
            "returnType": "address",
            "suppressErrors": true
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
        "get-shipping-methods": {
            "template": "{+orderService}{id}/shipments/methods",
            "returnType": "shippingmethods"
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
            "useIframeTransport": "{+paymentService}../../Assets/mozu_receiver_v2.html"
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
    },
    "instockrequest": {
        "create": {
            "useIframeTransport": "{+storefrontUserService}../../receiver{?receiverVersion}",
            "verb": "POST",
            "template": "{+inStockNotificationService}"
        }
    }
}
},{}],22:[function(require,module,exports){


//# sourceUrl=src/object.js

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
    //address: require('./types/address'),
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


//# sourceUrl=src/reference.js

// BEGIN REFERENCE
var utils = require('./utils');
var errors = require('./errors');
var ApiCollection;
var ApiObject = require('./object');
var objectTypes = require('./methods.json');
var IframeXHR;

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
var copyToConf = ['verb', 'returnType', 'noBody', 'suppressErrors'],
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

    headerPrefix: 'x-vol-',

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

        IframeXHR = IframeXHR || require('./iframexhr');
        tptData = {
            receiverVersion: IframeXHR.version
        };

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
},{"./collection":13,"./errors":16,"./iframexhr":17,"./methods.json":21,"./object":22,"./utils":35}],24:[function(require,module,exports){


//# sourceUrl=src/types/cart.js

var utils = require('../utils');
module.exports = {
    count: function () {
        var items = this.prop('items');
        if (!items || !items.length) return 0;
        return utils.reduce(items, function (total, item) { return total + item.quantity; }, 0);
    }
};
},{"../utils":35}],25:[function(require,module,exports){


//# sourceUrl=src/types/cartsummary.js

var utils = require('../utils');
module.exports = {
    count: function () {
        return this.data.totalQuantity || 0;
    }
};
},{"../utils":35}],26:[function(require,module,exports){


//# sourceUrl=src/types/creditcard.js

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
        if (!data.cvv && !data.isCvvOptional) errors.throwOnObject(obj, 'CVV_MISSING');
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
                    cvv: !!(self.prop('cvv'))? self.prop('cvv').replace(/\d/g, self.maskCharacter) : '',
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
                cardNumberPartOrMask: this.maskedCardNumber || this.data.cardNumberPartOrMask || this.data.cardNumberPart || this.data.cardNumber,
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


//# sourceUrl=src/types/customer.js

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
        getDigitalCredit: function (id) {
            var credit = this.api.createSync('storecredit', { code: id });
            errors.passFrom(credit, this);
            return credit.getCredit();
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


//# sourceUrl=src/types/locations.js

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


//# sourceUrl=src/types/login.js

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


//# sourceUrl=src/types/order.js

var errors = require('../errors');
var CONSTANTS = require('../constants/default');
var utils = require('../utils');
var ApiReference;
module.exports = (function () {

    errors.register({
        'BILLING_INFO_MISSING': 'Billing info missing.',
        'PAYMENT_TYPE_MISSING_OR_UNRECOGNIZED': 'Payment type missing or unrecognized.',
        'PAYMENT_MISSING': 'Sorry, something went wrong: Expected a payment to exist on this order and one did not.',
        'PAYPAL_TRANSACTION_ID_MISSING': 'Sorry, something went wrong: Expected the active payment to include a paymentServiceTransactionId and it did not.',
        'ORDER_CANNOT_SUBMIT': 'Sorry, this order cannot be submitted. Please refresh the page and try again, or contact Support.',
        'ADD_COUPON_FAILED': 'Adding coupon failed for the following reason: {0}',
        //'ADD_GIFT_CARD_FAILED': 'Adding gift card failed for the following reason: {0}',
        'ADD_CUSTOMER_FAILED': 'Adding customer failed for the following reason: {0}'
    });

    var OrderStatus2IsComplete = {};
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.SUBMITTED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.ACCEPTED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.PENDING_REVIEW] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.COMPLETED] = true;

    var OrderStatus2IsReady = {};
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.SUBMIT_ORDER] = true;
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.ACCEPT_ORDER] = true;


    var PaymentStrategies = {
        "PaypalExpress": function (order, billingInfo) {
            if (!ApiReference) ApiReference = require('../reference');
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
        getShippingMethodsFromContact: function (contact) {
            var self = this;
            var fulfillmentContact = utils.clone(self.prop('fulfillmentInfo').fulfillmentContact);
            // currently the service can't handle not having a state
            if (fulfillmentContact.address && !fulfillmentContact.address.stateOrProvince) fulfillmentContact.address.stateOrProvince = "n/a";
            return self.update({ fulfillmentInfo: { fulfillmentContact: fulfillmentContact } }).then(function () {
                return self.getShippingMethods();
            });
        },
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
                if (activePayments[i].paymentType !== "StoreCredit" && activePayments[i].paymentType !== 'GiftCard') return activePayments[i];
            }
        },
        getActiveStoreCredits: function() {
            var activePayments = this.getActivePayments(),
                credits = [];
            for (var i = activePayments.length - 1; i >= 0; i--) {
                if (activePayments[i].paymentType === "StoreCredit" || activePayments[i].paymentType === "GiftCard") credits.unshift(activePayments[i]);
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
            var self = this,
                availableActions = this.prop('availableActions');
            if (!this.isComplete()) {
                for (var i = availableActions.length - 1; i >= 0; i--) {
                    if (availableActions[i] in OrderStatus2IsReady) return this.performOrderAction(availableActions[i]).otherwise(function(e) {
                        return self.get().ensure(function() {
                            throw e;
                        })
                    });
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


//# sourceUrl=src/types/product.js

var errors = require('../errors');
var utils = require('../utils');
var CONSTANTS = require('../constants/default');
module.exports = {
    addToCart: function(payload) {
        // expect payload to have only "options" and "quantity"
        if (!payload) {
            payload = {};
        }
        
        return this.api.action(this, 'addToCart', {
            product: {
                productCode: this.data.productCode,
                variationProductCode: this.data.variationProductCode,
                options: payload.options
            },
            quantity: payload.quantity || 1,
            fulfillmentLocationCode: payload.fulfillmentLocationCode,
            fulfillmentMethod: payload.fulfillmentMethod || "Ship"
        });
    },
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


//# sourceUrl=src/types/shipment.js

var utils = require('../utils');
module.exports = {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        var fulfillmentContact = utils.clone(self.prop('fulfillmentContact'));
        // currently the service can't handle not having a state
        if (fulfillmentContact.address && !fulfillmentContact.address.stateOrProvince) fulfillmentContact.address.stateOrProvince = "n/a";
        return self.update({ fulfillmentContact: fulfillmentContact }).then(function () {
            return self.getShippingMethods();
        });
    }
};
},{"../utils":35}],33:[function(require,module,exports){


//# sourceUrl=src/types/user.js

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


//# sourceUrl=src/types/wishlist.js

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
var process=require("__browserify_process");

//# sourceUrl=src/utils.js

// BEGIN UTILS
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
        compose: function(first, second) {
            return function() {
                first.call(this, arguments);
                second.call(this, arguments);
            }
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
},{"./iframexhr":17,"__browserify_process":1,"microevent":2,"uritemplate":3,"when":12,"xmlhttprequest":false}]},{},[19])
(19)
});