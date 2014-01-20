!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MozuSDK=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/*global unescape, module, define, window, global*/

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

},{}],3:[function(require,module,exports){
/** @license MIT License (c) copyright 2011-2013 original author or authors */

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

},{}],4:[function(require,module,exports){
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
},{"./object":12,"./types/locations":17,"./utils":24}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
},{"./interface":10,"./reference":13,"./utils":24}],7:[function(require,module,exports){
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
},{"./utils":24}],8:[function(require,module,exports){
// BEGIN INIT
var ApiContext = require('./context');
var initialGlobalContext = new ApiContext();
module.exports = initialGlobalContext;
// END INIT
},{"./context":6}],9:[function(require,module,exports){
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

module.exports = _init;
},{"./collection":4,"./context":6,"./init":8,"./interface":10,"./object":12,"./reference":13,"./utils":24}],10:[function(require,module,exports){
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
},{"./object":12,"./reference":13,"./utils":24}],11:[function(require,module,exports){
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
  "cart": {
    "get": "{+cartService}current",
    "get-summary": "{+cartService}summary",
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
},{}],12:[function(require,module,exports){
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
},{"./collection":4,"./reference":13,"./types/cart":14,"./types/creditcard":15,"./types/customer":16,"./types/login":18,"./types/order":19,"./types/product":20,"./types/shipment":21,"./types/user":22,"./types/wishlist":23,"./utils":24}],13:[function(require,module,exports){
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
},{"./collection":4,"./errors":7,"./methods.json":11,"./object":12,"./utils":24}],14:[function(require,module,exports){
var utils = require('../utils');
module.exports = {
    count: function () {
        var items = this.prop('items');
        if (!items || !items.length) return 0;
        return utils.reduce(items, function (total, item) { return total + item.quantity; }, 0);
    }
};
},{"../utils":24}],15:[function(require,module,exports){
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
},{"../errors":7,"../utils":24}],16:[function(require,module,exports){
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
},{"../errors":7,"../utils":24}],17:[function(require,module,exports){
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
},{"../utils":24}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{"../constants/default":5,"../errors":7,"../reference":13,"../utils":24}],20:[function(require,module,exports){
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
},{"../constants/default":5,"../errors":7,"../utils":24}],21:[function(require,module,exports){
module.exports = {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        return self.update({ fulfillmentContact: self.prop('fulfillmentContact') }).then(function () {
            return self.getShippingMethods();
        });
    }
};
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
},{"../errors":7,"../utils":24}],24:[function(require,module,exports){
// BEGIN UTILS
// Many of these poached from lodash

    var maxFlattenDepth = 20;

    var MicroEvent = require('microevent');
    var isNode = typeof process === "object" && process.title === "node";
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

        request: isNode ? function(method, url, headers, data, success, failure, iframePath) {
            console.log(this, arguments, "request");
        } : function (method, url, headers, data, success, failure, iframePath) {
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
},{"microevent":1,"uritemplate":2,"when":3}]},{},[9])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL3NoYXJlL25wbS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL25vZGVfbW9kdWxlcy9taWNyb2V2ZW50L21pY3JvZXZlbnQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9ub2RlX21vZHVsZXMvdXJpdGVtcGxhdGUvYmluL3VyaXRlbXBsYXRlLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvbm9kZV9tb2R1bGVzL3doZW4vd2hlbi5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9jb2xsZWN0aW9uLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2NvbnN0YW50cy9kZWZhdWx0LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2NvbnRleHQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvZXJyb3JzLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL2luaXQuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvaW5pdF9kZWJ1Zy5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9pbnRlcmZhY2UuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvbWV0aG9kcy5qc29uIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL29iamVjdC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy9yZWZlcmVuY2UuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdHlwZXMvY2FydC5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9jcmVkaXRjYXJkLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL2N1c3RvbWVyLmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL2xvY2F0aW9ucy5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9sb2dpbi5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9vcmRlci5qcyIsIi9Vc2Vycy9qYW1lc196ZXRsZW4vZ2l0cy9tb3p1LWphdmFzY3JpcHQtc2RrL3NyYy90eXBlcy9wcm9kdWN0LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL3NoaXBtZW50LmpzIiwiL1VzZXJzL2phbWVzX3pldGxlbi9naXRzL21venUtamF2YXNjcmlwdC1zZGsvc3JjL3R5cGVzL3VzZXIuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdHlwZXMvd2lzaGxpc3QuanMiLCIvVXNlcnMvamFtZXNfemV0bGVuL2dpdHMvbW96dS1qYXZhc2NyaXB0LXNkay9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3IzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIE1pY3JvRXZlbnQgLSB0byBtYWtlIGFueSBqcyBvYmplY3QgYW4gZXZlbnQgZW1pdHRlciAoc2VydmVyIG9yIGJyb3dzZXIpXG4gKiBcbiAqIC0gcHVyZSBqYXZhc2NyaXB0IC0gc2VydmVyIGNvbXBhdGlibGUsIGJyb3dzZXIgY29tcGF0aWJsZVxuICogLSBkb250IHJlbHkgb24gdGhlIGJyb3dzZXIgZG9tc1xuICogLSBzdXBlciBzaW1wbGUgLSB5b3UgZ2V0IGl0IGltbWVkaWF0bHksIG5vIG1pc3RlcnksIG5vIG1hZ2ljIGludm9sdmVkXG4gKlxuICogLSBjcmVhdGUgYSBNaWNyb0V2ZW50RGVidWcgd2l0aCBnb29kaWVzIHRvIGRlYnVnXG4gKiAgIC0gbWFrZSBpdCBzYWZlciB0byB1c2VcbiovXG5cbnZhciBNaWNyb0V2ZW50XHQ9IGZ1bmN0aW9uKCl7fVxuTWljcm9FdmVudC5wcm90b3R5cGVcdD0ge1xuXHRiaW5kXHQ6IGZ1bmN0aW9uKGV2ZW50LCBmY3Qpe1xuXHRcdHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcblx0XHR0aGlzLl9ldmVudHNbZXZlbnRdID0gdGhpcy5fZXZlbnRzW2V2ZW50XVx0fHwgW107XG5cdFx0dGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKGZjdCk7XG5cdH0sXG5cdHVuYmluZFx0OiBmdW5jdGlvbihldmVudCwgZmN0KXtcblx0XHR0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG5cdFx0aWYoIGV2ZW50IGluIHRoaXMuX2V2ZW50cyA9PT0gZmFsc2UgIClcdHJldHVybjtcblx0XHR0aGlzLl9ldmVudHNbZXZlbnRdLnNwbGljZSh0aGlzLl9ldmVudHNbZXZlbnRdLmluZGV4T2YoZmN0KSwgMSk7XG5cdH0sXG5cdHRyaWdnZXJcdDogZnVuY3Rpb24oZXZlbnQgLyogLCBhcmdzLi4uICovKXtcblx0XHR0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG5cdFx0aWYoIGV2ZW50IGluIHRoaXMuX2V2ZW50cyA9PT0gZmFsc2UgIClcdHJldHVybjtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGg7IGkrKyl7XG5cdFx0XHR0aGlzLl9ldmVudHNbZXZlbnRdW2ldLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpXG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIG1peGluIHdpbGwgZGVsZWdhdGUgYWxsIE1pY3JvRXZlbnQuanMgZnVuY3Rpb24gaW4gdGhlIGRlc3RpbmF0aW9uIG9iamVjdFxuICpcbiAqIC0gcmVxdWlyZSgnTWljcm9FdmVudCcpLm1peGluKEZvb2Jhcikgd2lsbCBtYWtlIEZvb2JhciBhYmxlIHRvIHVzZSBNaWNyb0V2ZW50XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRoZSBvYmplY3Qgd2hpY2ggd2lsbCBzdXBwb3J0IE1pY3JvRXZlbnRcbiovXG5NaWNyb0V2ZW50Lm1peGluXHQ9IGZ1bmN0aW9uKGRlc3RPYmplY3Qpe1xuXHR2YXIgcHJvcHNcdD0gWydiaW5kJywgJ3VuYmluZCcsICd0cmlnZ2VyJ107XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkgKyspe1xuXHRcdGRlc3RPYmplY3QucHJvdG90eXBlW3Byb3BzW2ldXVx0PSBNaWNyb0V2ZW50LnByb3RvdHlwZVtwcm9wc1tpXV07XG5cdH1cbn1cblxuLy8gZXhwb3J0IGluIGNvbW1vbiBqc1xuaWYoIHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgKCdleHBvcnRzJyBpbiBtb2R1bGUpKXtcblx0bW9kdWxlLmV4cG9ydHNcdD0gTWljcm9FdmVudFxufVxuIiwiLypnbG9iYWwgdW5lc2NhcGUsIG1vZHVsZSwgZGVmaW5lLCB3aW5kb3csIGdsb2JhbCovXHJcblxyXG4vKlxyXG4gVXJpVGVtcGxhdGUgQ29weXJpZ2h0IChjKSAyMDEyLTIwMTMgRnJhbnogQW50ZXNiZXJnZXIuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiBBdmFpbGFibGUgdmlhIHRoZSBNSVQgbGljZW5zZS5cclxuKi9cclxuXHJcbihmdW5jdGlvbiAoZXhwb3J0Q2FsbGJhY2spIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFVyaVRlbXBsYXRlRXJyb3IgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIFVyaVRlbXBsYXRlRXJyb3IgKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIFVyaVRlbXBsYXRlRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChKU09OICYmIEpTT04uc3RyaW5naWZ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBVcmlUZW1wbGF0ZUVycm9yO1xyXG59KCkpO1xyXG5cclxudmFyIG9iamVjdEhlbHBlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBpc0FycmF5ICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1N0cmluZyAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBpc051bWJlciAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IE51bWJlcl0nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBpc0Jvb2xlYW4gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBCb29sZWFuXSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGpvaW4gKGFyciwgc2VwYXJhdG9yKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnLFxyXG4gICAgICAgICAgICBmaXJzdCA9IHRydWUsXHJcbiAgICAgICAgICAgIGluZGV4O1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGFyci5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKGZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHNlcGFyYXRvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gYXJyW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYXAgKGFyciwgbWFwcGVyKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdLFxyXG4gICAgICAgICAgICBpbmRleCA9IDA7XHJcbiAgICAgICAgZm9yICg7IGluZGV4IDwgYXJyLmxlbmd0aDsgaW5kZXggKz0gMSkge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChtYXBwZXIoYXJyW2luZGV4XSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZpbHRlciAoYXJyLCBwcmVkaWNhdGUpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gW10sXHJcbiAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICBmb3IgKDsgaW5kZXggPCBhcnIubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUoYXJyW2luZGV4XSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFycltpbmRleF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVlcEZyZWV6ZVVzaW5nT2JqZWN0RnJlZXplIChvYmplY3QpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIiB8fCBvYmplY3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgT2JqZWN0LmZyZWV6ZShvYmplY3QpO1xyXG4gICAgICAgIHZhciBwcm9wZXJ0eSwgcHJvcGVydHlOYW1lO1xyXG4gICAgICAgIGZvciAocHJvcGVydHlOYW1lIGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnR5ID0gb2JqZWN0W3Byb3BlcnR5TmFtZV07XHJcbiAgICAgICAgICAgICAgICAvLyBiZSBhd2FyZSwgYXJyYXlzIGFyZSAnb2JqZWN0JywgdG9vXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVlcEZyZWV6ZShwcm9wZXJ0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZWVwRnJlZXplIChvYmplY3QpIHtcclxuICAgICAgICBpZiAodHlwZW9mIE9iamVjdC5mcmVlemUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZXBGcmVlemVVc2luZ09iamVjdEZyZWV6ZShvYmplY3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlzQXJyYXk6IGlzQXJyYXksXHJcbiAgICAgICAgaXNTdHJpbmc6IGlzU3RyaW5nLFxyXG4gICAgICAgIGlzTnVtYmVyOiBpc051bWJlcixcclxuICAgICAgICBpc0Jvb2xlYW46IGlzQm9vbGVhbixcclxuICAgICAgICBqb2luOiBqb2luLFxyXG4gICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgIGZpbHRlcjogZmlsdGVyLFxyXG4gICAgICAgIGRlZXBGcmVlemU6IGRlZXBGcmVlemVcclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG52YXIgY2hhckhlbHBlciA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gaXNBbHBoYSAoY2hyKSB7XHJcbiAgICAgICAgcmV0dXJuIChjaHIgPj0gJ2EnICYmIGNociA8PSAneicpIHx8ICgoY2hyID49ICdBJyAmJiBjaHIgPD0gJ1onKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNEaWdpdCAoY2hyKSB7XHJcbiAgICAgICAgcmV0dXJuIGNociA+PSAnMCcgJiYgY2hyIDw9ICc5JztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0hleERpZ2l0IChjaHIpIHtcclxuICAgICAgICByZXR1cm4gaXNEaWdpdChjaHIpIHx8IChjaHIgPj0gJ2EnICYmIGNociA8PSAnZicpIHx8IChjaHIgPj0gJ0EnICYmIGNociA8PSAnRicpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNBbHBoYTogaXNBbHBoYSxcclxuICAgICAgICBpc0RpZ2l0OiBpc0RpZ2l0LFxyXG4gICAgICAgIGlzSGV4RGlnaXQ6IGlzSGV4RGlnaXRcclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG52YXIgcGN0RW5jb2RlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdXRmOCA9IHtcclxuICAgICAgICBlbmNvZGU6IGZ1bmN0aW9uIChjaHIpIHtcclxuICAgICAgICAgICAgLy8gc2VlIGh0dHA6Ly9lY21hbmF1dC5ibG9nc3BvdC5kZS8yMDA2LzA3L2VuY29kaW5nLWRlY29kaW5nLXV0ZjgtaW4tamF2YXNjcmlwdC5odG1sXHJcbiAgICAgICAgICAgIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY2hyKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBudW1CeXRlczogZnVuY3Rpb24gKGZpcnN0Q2hhckNvZGUpIHtcclxuICAgICAgICAgICAgaWYgKGZpcnN0Q2hhckNvZGUgPD0gMHg3Rikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoMHhDMiA8PSBmaXJzdENoYXJDb2RlICYmIGZpcnN0Q2hhckNvZGUgPD0gMHhERikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoMHhFMCA8PSBmaXJzdENoYXJDb2RlICYmIGZpcnN0Q2hhckNvZGUgPD0gMHhFRikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoMHhGMCA8PSBmaXJzdENoYXJDb2RlICYmIGZpcnN0Q2hhckNvZGUgPD0gMHhGNCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbm8gdmFsaWQgZmlyc3Qgb2N0ZXRcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc1ZhbGlkRm9sbG93aW5nQ2hhckNvZGU6IGZ1bmN0aW9uIChjaGFyQ29kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMHg4MCA8PSBjaGFyQ29kZSAmJiBjaGFyQ29kZSA8PSAweEJGO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmNvZGVzIGEgY2hhcmFjdGVyLCBpZiBuZWVkZWQgb3Igbm90LlxyXG4gICAgICogQHBhcmFtIGNoclxyXG4gICAgICogQHJldHVybiBwY3QtZW5jb2RlZCBjaGFyYWN0ZXJcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZW5jb2RlQ2hhcmFjdGVyIChjaHIpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gJycsXHJcbiAgICAgICAgICAgIG9jdGV0cyA9IHV0ZjguZW5jb2RlKGNociksXHJcbiAgICAgICAgICAgIG9jdGV0LFxyXG4gICAgICAgICAgICBpbmRleDtcclxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBvY3RldHMubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIG9jdGV0ID0gb2N0ZXRzLmNoYXJDb2RlQXQoaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gJyUnICsgKG9jdGV0IDwgMHgxMCA/ICcwJyA6ICcnKSArIG9jdGV0LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucywgd2hldGhlciB0aGUgZ2l2ZW4gdGV4dCBhdCBzdGFydCBpcyBpbiB0aGUgZm9ybSAncGVyY2VudCBoZXgtZGlnaXQgaGV4LWRpZ2l0JywgbGlrZSAnJTNGJ1xyXG4gICAgICogQHBhcmFtIHRleHRcclxuICAgICAqIEBwYXJhbSBzdGFydFxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbnwqfCp9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzUGVyY2VudERpZ2l0RGlnaXQgKHRleHQsIHN0YXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRleHQuY2hhckF0KHN0YXJ0KSA9PT0gJyUnICYmIGNoYXJIZWxwZXIuaXNIZXhEaWdpdCh0ZXh0LmNoYXJBdChzdGFydCArIDEpKSAmJiBjaGFySGVscGVyLmlzSGV4RGlnaXQodGV4dC5jaGFyQXQoc3RhcnQgKyAyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgYSBoZXggbnVtYmVyIGZyb20gc3RhcnQgd2l0aCBsZW5ndGggMi5cclxuICAgICAqIEBwYXJhbSB0ZXh0IGEgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gc3RhcnQgdGhlIHN0YXJ0IGluZGV4IG9mIHRoZSAyLWRpZ2l0IGhleCBudW1iZXJcclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2VIZXgyICh0ZXh0LCBzdGFydCkge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUludCh0ZXh0LnN1YnN0cihzdGFydCwgMiksIDE2KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGdpdmVuIGNoYXIgc2VxdWVuY2UgaXMgYSBjb3JyZWN0bHkgcGN0LWVuY29kZWQgc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gY2hyXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1BjdEVuY29kZWQgKGNocikge1xyXG4gICAgICAgIGlmICghaXNQZXJjZW50RGlnaXREaWdpdChjaHIsIDApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZpcnN0Q2hhckNvZGUgPSBwYXJzZUhleDIoY2hyLCAxKTtcclxuICAgICAgICB2YXIgbnVtQnl0ZXMgPSB1dGY4Lm51bUJ5dGVzKGZpcnN0Q2hhckNvZGUpO1xyXG4gICAgICAgIGlmIChudW1CeXRlcyA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGJ5dGVOdW1iZXIgPSAxOyBieXRlTnVtYmVyIDwgbnVtQnl0ZXM7IGJ5dGVOdW1iZXIgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzUGVyY2VudERpZ2l0RGlnaXQoY2hyLCAzKmJ5dGVOdW1iZXIpIHx8ICF1dGY4LmlzVmFsaWRGb2xsb3dpbmdDaGFyQ29kZShwYXJzZUhleDIoY2hyLCAzKmJ5dGVOdW1iZXIgKyAxKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlYWRzIGFzIG11Y2ggYXMgbmVlZGVkIGZyb20gdGhlIHRleHQsIGUuZy4gJyUyMCcgb3IgJyVDMyVCNicuIEl0IGRvZXMgbm90IGRlY29kZSFcclxuICAgICAqIEBwYXJhbSB0ZXh0XHJcbiAgICAgKiBAcGFyYW0gc3RhcnRJbmRleFxyXG4gICAgICogQHJldHVybiB0aGUgY2hhcmFjdGVyIG9yIHBjdC1zdHJpbmcgb2YgdGhlIHRleHQgYXQgc3RhcnRJbmRleFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwY3RDaGFyQXQodGV4dCwgc3RhcnRJbmRleCkge1xyXG4gICAgICAgIHZhciBjaHIgPSB0ZXh0LmNoYXJBdChzdGFydEluZGV4KTtcclxuICAgICAgICBpZiAoIWlzUGVyY2VudERpZ2l0RGlnaXQodGV4dCwgc3RhcnRJbmRleCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNocjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHV0ZjhDaGFyQ29kZSA9IHBhcnNlSGV4Mih0ZXh0LCBzdGFydEluZGV4ICsgMSk7XHJcbiAgICAgICAgdmFyIG51bUJ5dGVzID0gdXRmOC5udW1CeXRlcyh1dGY4Q2hhckNvZGUpO1xyXG4gICAgICAgIGlmIChudW1CeXRlcyA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2hyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBieXRlTnVtYmVyID0gMTsgYnl0ZU51bWJlciA8IG51bUJ5dGVzOyBieXRlTnVtYmVyICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1BlcmNlbnREaWdpdERpZ2l0KHRleHQsIHN0YXJ0SW5kZXggKyAzICogYnl0ZU51bWJlcikgfHwgIXV0ZjguaXNWYWxpZEZvbGxvd2luZ0NoYXJDb2RlKHBhcnNlSGV4Mih0ZXh0LCBzdGFydEluZGV4ICsgMyAqIGJ5dGVOdW1iZXIgKyAxKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRleHQuc3Vic3RyKHN0YXJ0SW5kZXgsIDMgKiBudW1CeXRlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBlbmNvZGVDaGFyYWN0ZXI6IGVuY29kZUNoYXJhY3RlcixcclxuICAgICAgICBpc1BjdEVuY29kZWQ6IGlzUGN0RW5jb2RlZCxcclxuICAgICAgICBwY3RDaGFyQXQ6IHBjdENoYXJBdFxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbnZhciByZmNDaGFySGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgYW4gY2hhcmFjdGVyIGlzIGFuIHZhcmNoYXIgY2hhcmFjdGVyIGFjY29yZGluZyAyLjMgb2YgcmZjIDY1NzBcclxuICAgICAqIEBwYXJhbSBjaHJcclxuICAgICAqIEByZXR1cm4gKEJvb2xlYW4pXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzVmFyY2hhciAoY2hyKSB7XHJcbiAgICAgICAgcmV0dXJuIGNoYXJIZWxwZXIuaXNBbHBoYShjaHIpIHx8IGNoYXJIZWxwZXIuaXNEaWdpdChjaHIpIHx8IGNociA9PT0gJ18nIHx8IHBjdEVuY29kZXIuaXNQY3RFbmNvZGVkKGNocik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGlmIGNociBpcyBhbiB1bnJlc2VydmVkIGNoYXJhY3RlciBhY2NvcmRpbmcgMS41IG9mIHJmYyA2NTcwXHJcbiAgICAgKiBAcGFyYW0gY2hyXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc1VucmVzZXJ2ZWQgKGNocikge1xyXG4gICAgICAgIHJldHVybiBjaGFySGVscGVyLmlzQWxwaGEoY2hyKSB8fCBjaGFySGVscGVyLmlzRGlnaXQoY2hyKSB8fCBjaHIgPT09ICctJyB8fCBjaHIgPT09ICcuJyB8fCBjaHIgPT09ICdfJyB8fCBjaHIgPT09ICd+JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgaWYgY2hyIGlzIGFuIHJlc2VydmVkIGNoYXJhY3RlciBhY2NvcmRpbmcgMS41IG9mIHJmYyA2NTcwXHJcbiAgICAgKiBvciB0aGUgcGVyY2VudCBjaGFyYWN0ZXIgbWVudGlvbmVkIGluIDMuMi4xLlxyXG4gICAgICogQHBhcmFtIGNoclxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNSZXNlcnZlZCAoY2hyKSB7XHJcbiAgICAgICAgcmV0dXJuIGNociA9PT0gJzonIHx8IGNociA9PT0gJy8nIHx8IGNociA9PT0gJz8nIHx8IGNociA9PT0gJyMnIHx8IGNociA9PT0gJ1snIHx8IGNociA9PT0gJ10nIHx8IGNociA9PT0gJ0AnIHx8IGNociA9PT0gJyEnIHx8IGNociA9PT0gJyQnIHx8IGNociA9PT0gJyYnIHx8IGNociA9PT0gJygnIHx8XHJcbiAgICAgICAgICAgIGNociA9PT0gJyknIHx8IGNociA9PT0gJyonIHx8IGNociA9PT0gJysnIHx8IGNociA9PT0gJywnIHx8IGNociA9PT0gJzsnIHx8IGNociA9PT0gJz0nIHx8IGNociA9PT0gXCInXCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpc1ZhcmNoYXI6IGlzVmFyY2hhcixcclxuICAgICAgICBpc1VucmVzZXJ2ZWQ6IGlzVW5yZXNlcnZlZCxcclxuICAgICAgICBpc1Jlc2VydmVkOiBpc1Jlc2VydmVkXHJcbiAgICB9O1xyXG5cclxufSgpKTtcclxuXHJcbi8qKlxyXG4gKiBlbmNvZGluZyBvZiByZmMgNjU3MFxyXG4gKi9cclxudmFyIGVuY29kaW5nSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGUgKHRleHQsIHBhc3NSZXNlcnZlZCkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgICByZXN1bHQgPSAnJyxcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIGNociA9ICcnO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGV4dCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgdGV4dCA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAgICAgdGV4dCA9IHRleHQudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGV4dC5sZW5ndGg7IGluZGV4ICs9IGNoci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY2hyID0gdGV4dC5jaGFyQXQoaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gcmZjQ2hhckhlbHBlci5pc1VucmVzZXJ2ZWQoY2hyKSB8fCAocGFzc1Jlc2VydmVkICYmIHJmY0NoYXJIZWxwZXIuaXNSZXNlcnZlZChjaHIpKSA/IGNociA6IHBjdEVuY29kZXIuZW5jb2RlQ2hhcmFjdGVyKGNocik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlUGFzc1Jlc2VydmVkICh0ZXh0KSB7XHJcbiAgICAgICAgcmV0dXJuIGVuY29kZSh0ZXh0LCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGVMaXRlcmFsQ2hhcmFjdGVyIChsaXRlcmFsLCBpbmRleCkge1xyXG4gICAgICAgIHZhciBjaHIgPSBwY3RFbmNvZGVyLnBjdENoYXJBdChsaXRlcmFsLCBpbmRleCk7XHJcbiAgICAgICAgaWYgKGNoci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjaHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcmZjQ2hhckhlbHBlci5pc1Jlc2VydmVkKGNocikgfHwgcmZjQ2hhckhlbHBlci5pc1VucmVzZXJ2ZWQoY2hyKSA/IGNociA6IHBjdEVuY29kZXIuZW5jb2RlQ2hhcmFjdGVyKGNocik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZUxpdGVyYWwgKGxpdGVyYWwpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gJycsXHJcbiAgICAgICAgICAgIGluZGV4LFxyXG4gICAgICAgICAgICBjaHIgPSAnJztcclxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsaXRlcmFsLmxlbmd0aDsgaW5kZXggKz0gY2hyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjaHIgPSBwY3RFbmNvZGVyLnBjdENoYXJBdChsaXRlcmFsLCBpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChjaHIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGNocjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSByZmNDaGFySGVscGVyLmlzUmVzZXJ2ZWQoY2hyKSB8fCByZmNDaGFySGVscGVyLmlzVW5yZXNlcnZlZChjaHIpID8gY2hyIDogcGN0RW5jb2Rlci5lbmNvZGVDaGFyYWN0ZXIoY2hyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZW5jb2RlOiBlbmNvZGUsXHJcbiAgICAgICAgZW5jb2RlUGFzc1Jlc2VydmVkOiBlbmNvZGVQYXNzUmVzZXJ2ZWQsXHJcbiAgICAgICAgZW5jb2RlTGl0ZXJhbDogZW5jb2RlTGl0ZXJhbCxcclxuICAgICAgICBlbmNvZGVMaXRlcmFsQ2hhcmFjdGVyOiBlbmNvZGVMaXRlcmFsQ2hhcmFjdGVyXHJcbiAgICB9O1xyXG5cclxufSgpKTtcclxuXHJcblxyXG4vLyB0aGUgb3BlcmF0b3JzIGRlZmluZWQgYnkgcmZjIDY1NzBcclxudmFyIG9wZXJhdG9ycyA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyXHJcbiAgICAgICAgYnlTeW1ib2wgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGUgKHN5bWJvbCkge1xyXG4gICAgICAgIGJ5U3ltYm9sW3N5bWJvbF0gPSB7XHJcbiAgICAgICAgICAgIHN5bWJvbDogc3ltYm9sLFxyXG4gICAgICAgICAgICBzZXBhcmF0b3I6IChzeW1ib2wgPT09ICc/JykgPyAnJicgOiAoc3ltYm9sID09PSAnJyB8fCBzeW1ib2wgPT09ICcrJyB8fCBzeW1ib2wgPT09ICcjJykgPyAnLCcgOiBzeW1ib2wsXHJcbiAgICAgICAgICAgIG5hbWVkOiBzeW1ib2wgPT09ICc7JyB8fCBzeW1ib2wgPT09ICcmJyB8fCBzeW1ib2wgPT09ICc/JyxcclxuICAgICAgICAgICAgaWZFbXB0eTogKHN5bWJvbCA9PT0gJyYnIHx8IHN5bWJvbCA9PT0gJz8nKSA/ICc9JyA6ICcnLFxyXG4gICAgICAgICAgICBmaXJzdDogKHN5bWJvbCA9PT0gJysnICkgPyAnJyA6IHN5bWJvbCxcclxuICAgICAgICAgICAgZW5jb2RlOiAoc3ltYm9sID09PSAnKycgfHwgc3ltYm9sID09PSAnIycpID8gZW5jb2RpbmdIZWxwZXIuZW5jb2RlUGFzc1Jlc2VydmVkIDogZW5jb2RpbmdIZWxwZXIuZW5jb2RlLFxyXG4gICAgICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoJycpO1xyXG4gICAgY3JlYXRlKCcrJyk7XHJcbiAgICBjcmVhdGUoJyMnKTtcclxuICAgIGNyZWF0ZSgnLicpO1xyXG4gICAgY3JlYXRlKCcvJyk7XHJcbiAgICBjcmVhdGUoJzsnKTtcclxuICAgIGNyZWF0ZSgnPycpO1xyXG4gICAgY3JlYXRlKCcmJyk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHZhbHVlT2Y6IGZ1bmN0aW9uIChjaHIpIHtcclxuICAgICAgICAgICAgaWYgKGJ5U3ltYm9sW2Nocl0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBieVN5bWJvbFtjaHJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChcIj0sIUB8XCIuaW5kZXhPZihjaHIpID49IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBieVN5bWJvbFsnJ107XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcblxyXG4vKipcclxuICogRGV0ZWN0cywgd2hldGhlciBhIGdpdmVuIGVsZW1lbnQgaXMgZGVmaW5lZCBpbiB0aGUgc2Vuc2Ugb2YgcmZjIDY1NzBcclxuICogU2VjdGlvbiAyLjMgb2YgdGhlIFJGQyBtYWtlcyBjbGVhciBkZWZpbnRpb25zOlxyXG4gKiAqIHVuZGVmaW5lZCBhbmQgbnVsbCBhcmUgbm90IGRlZmluZWQuXHJcbiAqICogdGhlIGVtcHR5IHN0cmluZyBpcyBkZWZpbmVkXHJcbiAqICogYW4gYXJyYXkgKFwibGlzdFwiKSBpcyBkZWZpbmVkLCBpZiBpdCBpcyBub3QgZW1wdHkgKGV2ZW4gaWYgYWxsIGVsZW1lbnRzIGFyZSBub3QgZGVmaW5lZClcclxuICogKiBhbiBvYmplY3QgKFwibWFwXCIpIGlzIGRlZmluZWQsIGlmIGl0IGNvbnRhaW5zIGF0IGxlYXN0IG9uZSBwcm9wZXJ0eSB3aXRoIGRlZmluZWQgdmFsdWVcclxuICogQHBhcmFtIG9iamVjdFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNEZWZpbmVkIChvYmplY3QpIHtcclxuICAgIHZhclxyXG4gICAgICAgIHByb3BlcnR5TmFtZTtcclxuICAgIGlmIChvYmplY3QgPT09IG51bGwgfHwgb2JqZWN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAob2JqZWN0SGVscGVyLmlzQXJyYXkob2JqZWN0KSkge1xyXG4gICAgICAgIC8vIFNlY3Rpb24gMi4zOiBBIHZhcmlhYmxlIGRlZmluZWQgYXMgYSBsaXN0IHZhbHVlIGlzIGNvbnNpZGVyZWQgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGNvbnRhaW5zIHplcm8gbWVtYmVyc1xyXG4gICAgICAgIHJldHVybiBvYmplY3QubGVuZ3RoID4gMDtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBvYmplY3QgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIG9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICAvLyBmYWxzeSB2YWx1ZXMgbGlrZSBlbXB0eSBzdHJpbmdzLCBmYWxzZSBvciAwIGFyZSBcImRlZmluZWRcIlxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgLy8gZWxzZSBPYmplY3RcclxuICAgIGZvciAocHJvcGVydHlOYW1lIGluIG9iamVjdCkge1xyXG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSAmJiBpc0RlZmluZWQob2JqZWN0W3Byb3BlcnR5TmFtZV0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxudmFyIExpdGVyYWxFeHByZXNzaW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpdGVyYWxFeHByZXNzaW9uIChsaXRlcmFsKSB7XHJcbiAgICAgICAgdGhpcy5saXRlcmFsID0gZW5jb2RpbmdIZWxwZXIuZW5jb2RlTGl0ZXJhbChsaXRlcmFsKTtcclxuICAgIH1cclxuXHJcbiAgICBMaXRlcmFsRXhwcmVzc2lvbi5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpdGVyYWw7XHJcbiAgICB9O1xyXG5cclxuICAgIExpdGVyYWxFeHByZXNzaW9uLnByb3RvdHlwZS50b1N0cmluZyA9IExpdGVyYWxFeHByZXNzaW9uLnByb3RvdHlwZS5leHBhbmQ7XHJcblxyXG4gICAgcmV0dXJuIExpdGVyYWxFeHByZXNzaW9uO1xyXG59KCkpO1xyXG5cclxudmFyIHBhcnNlID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZUV4cHJlc3Npb24gKGV4cHJlc3Npb25UZXh0KSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIG9wZXJhdG9yLFxyXG4gICAgICAgICAgICB2YXJzcGVjcyA9IFtdLFxyXG4gICAgICAgICAgICB2YXJzcGVjID0gbnVsbCxcclxuICAgICAgICAgICAgdmFybmFtZVN0YXJ0ID0gbnVsbCxcclxuICAgICAgICAgICAgbWF4TGVuZ3RoU3RhcnQgPSBudWxsLFxyXG4gICAgICAgICAgICBpbmRleCxcclxuICAgICAgICAgICAgY2hyID0gJyc7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsb3NlVmFybmFtZSAoKSB7XHJcbiAgICAgICAgICAgIHZhciB2YXJuYW1lID0gZXhwcmVzc2lvblRleHQuc3Vic3RyaW5nKHZhcm5hbWVTdGFydCwgaW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAodmFybmFtZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYSB2YXJuYW1lIG11c3QgYmUgc3BlY2lmaWVkXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhcnNwZWMgPSB7dmFybmFtZTogdmFybmFtZSwgZXhwbG9kZWQ6IGZhbHNlLCBtYXhMZW5ndGg6IG51bGx9O1xyXG4gICAgICAgICAgICB2YXJuYW1lU3RhcnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xvc2VNYXhMZW5ndGggKCkge1xyXG4gICAgICAgICAgICBpZiAobWF4TGVuZ3RoU3RhcnQgPT09IGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcImFmdGVyIGEgJzonIHlvdSBoYXZlIHRvIHNwZWNpZnkgdGhlIGxlbmd0aFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXJzcGVjLm1heExlbmd0aCA9IHBhcnNlSW50KGV4cHJlc3Npb25UZXh0LnN1YnN0cmluZyhtYXhMZW5ndGhTdGFydCwgaW5kZXgpLCAxMCk7XHJcbiAgICAgICAgICAgIG1heExlbmd0aFN0YXJ0ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9wZXJhdG9yID0gKGZ1bmN0aW9uIChvcGVyYXRvclRleHQpIHtcclxuICAgICAgICAgICAgdmFyIG9wID0gb3BlcmF0b3JzLnZhbHVlT2Yob3BlcmF0b3JUZXh0KTtcclxuICAgICAgICAgICAgaWYgKG9wID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcImlsbGVnYWwgdXNlIG9mIHJlc2VydmVkIG9wZXJhdG9yXCIsIHBvc2l0aW9uOiBpbmRleCwgb3BlcmF0b3I6IG9wZXJhdG9yVGV4dH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBvcDtcclxuICAgICAgICB9KGV4cHJlc3Npb25UZXh0LmNoYXJBdCgwKSkpO1xyXG4gICAgICAgIGluZGV4ID0gb3BlcmF0b3Iuc3ltYm9sLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdmFybmFtZVN0YXJ0ID0gaW5kZXg7XHJcblxyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGV4cHJlc3Npb25UZXh0Lmxlbmd0aDsgaW5kZXggKz0gY2hyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjaHIgPSBwY3RFbmNvZGVyLnBjdENoYXJBdChleHByZXNzaW9uVGV4dCwgaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHZhcm5hbWVTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdGhlIHNwZWMgc2F5czogdmFybmFtZSA9ICB2YXJjaGFyICooIFtcIi5cIl0gdmFyY2hhciApXHJcbiAgICAgICAgICAgICAgICAvLyBzbyBhIGRvdCBpcyBhbGxvd2VkIGV4Y2VwdCBmb3IgdGhlIGZpcnN0IGNoYXJcclxuICAgICAgICAgICAgICAgIGlmIChjaHIgPT09ICcuJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YXJuYW1lU3RhcnQgPT09IGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYSB2YXJuYW1lIE1VU1QgTk9UIHN0YXJ0IHdpdGggYSBkb3RcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHJmY0NoYXJIZWxwZXIuaXNWYXJjaGFyKGNocikpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNsb3NlVmFybmFtZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXhMZW5ndGhTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBtYXhMZW5ndGhTdGFydCAmJiBjaHIgPT09ICcwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiQSA6cHJlZml4IG11c3Qgbm90IHN0YXJ0IHdpdGggZGlnaXQgMFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaGFySGVscGVyLmlzRGlnaXQoY2hyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAtIG1heExlbmd0aFN0YXJ0ID49IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJBIDpwcmVmaXggbXVzdCBoYXZlIG1heCA0IGRpZ2l0c1wiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbG9zZU1heExlbmd0aCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaHIgPT09ICc6Jykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhcnNwZWMubWF4TGVuZ3RoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJvbmx5IG9uZSA6bWF4TGVuZ3RoIGlzIGFsbG93ZWQgcGVyIHZhcnNwZWNcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodmFyc3BlYy5leHBsb2RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiYW4gZXhwbG9lZGVkIHZhcnNwZWMgTVVTVCBOT1QgYmUgdmFyc3BlY2VkXCIsIHBvc2l0aW9uOiBpbmRleH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoU3RhcnQgPSBpbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2hyID09PSAnKicpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YXJzcGVjID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVyaVRlbXBsYXRlRXJyb3Ioe2V4cHJlc3Npb25UZXh0OiBleHByZXNzaW9uVGV4dCwgbWVzc2FnZTogXCJleHBsb2RlZCB3aXRob3V0IHZhcnNwZWNcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodmFyc3BlYy5leHBsb2RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHtleHByZXNzaW9uVGV4dDogZXhwcmVzc2lvblRleHQsIG1lc3NhZ2U6IFwiZXhwbG9kZWQgdHdpY2VcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodmFyc3BlYy5tYXhMZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcImFuIGV4cGxvZGUgKCopIE1VU1QgTk9UIGZvbGxvdyB0byBhIHByZWZpeFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhcnNwZWMuZXhwbG9kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdGhlIG9ubHkgbGVnYWwgY2hhcmFjdGVyIG5vdyBpcyB0aGUgY29tbWFcclxuICAgICAgICAgICAgaWYgKGNociA9PT0gJywnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXJzcGVjcy5wdXNoKHZhcnNwZWMpO1xyXG4gICAgICAgICAgICAgICAgdmFyc3BlYyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXJuYW1lU3RhcnQgPSBpbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7ZXhwcmVzc2lvblRleHQ6IGV4cHJlc3Npb25UZXh0LCBtZXNzYWdlOiBcImlsbGVnYWwgY2hhcmFjdGVyXCIsIGNoYXJhY3RlcjogY2hyLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICB9IC8vIGZvciBjaHJcclxuICAgICAgICBpZiAodmFybmFtZVN0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNsb3NlVmFybmFtZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF4TGVuZ3RoU3RhcnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2xvc2VNYXhMZW5ndGgoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyc3BlY3MucHVzaCh2YXJzcGVjKTtcclxuICAgICAgICByZXR1cm4gbmV3IFZhcmlhYmxlRXhwcmVzc2lvbihleHByZXNzaW9uVGV4dCwgb3BlcmF0b3IsIHZhcnNwZWNzKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZSAodXJpVGVtcGxhdGVUZXh0KSB7XHJcbiAgICAgICAgLy8gYXNzZXJ0IGZpbGxlZCBzdHJpbmdcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIGNocixcclxuICAgICAgICAgICAgZXhwcmVzc2lvbnMgPSBbXSxcclxuICAgICAgICAgICAgYnJhY2VPcGVuSW5kZXggPSBudWxsLFxyXG4gICAgICAgICAgICBsaXRlcmFsU3RhcnQgPSAwO1xyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHVyaVRlbXBsYXRlVGV4dC5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgICAgICAgICAgY2hyID0gdXJpVGVtcGxhdGVUZXh0LmNoYXJBdChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChsaXRlcmFsU3RhcnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaHIgPT09ICd9Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHt0ZW1wbGF0ZVRleHQ6IHVyaVRlbXBsYXRlVGV4dCwgbWVzc2FnZTogXCJ1bm9wZW5lZCBicmFjZSBjbG9zZWRcIiwgcG9zaXRpb246IGluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hyID09PSAneycpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGl0ZXJhbFN0YXJ0IDwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbnMucHVzaChuZXcgTGl0ZXJhbEV4cHJlc3Npb24odXJpVGVtcGxhdGVUZXh0LnN1YnN0cmluZyhsaXRlcmFsU3RhcnQsIGluZGV4KSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsaXRlcmFsU3RhcnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyYWNlT3BlbkluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGJyYWNlT3BlbkluZGV4ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBoZXJlIGp1c3QgeyBpcyBmb3JiaWRkZW5cclxuICAgICAgICAgICAgICAgIGlmIChjaHIgPT09ICd7Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHt0ZW1wbGF0ZVRleHQ6IHVyaVRlbXBsYXRlVGV4dCwgbWVzc2FnZTogXCJicmFjZSBhbHJlYWR5IG9wZW5lZFwiLCBwb3NpdGlvbjogaW5kZXh9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaHIgPT09ICd9Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChicmFjZU9wZW5JbmRleCArIDEgPT09IGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHt0ZW1wbGF0ZVRleHQ6IHVyaVRlbXBsYXRlVGV4dCwgbWVzc2FnZTogXCJlbXB0eSBicmFjZXNcIiwgcG9zaXRpb246IGJyYWNlT3BlbkluZGV4fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb25zLnB1c2gocGFyc2VFeHByZXNzaW9uKHVyaVRlbXBsYXRlVGV4dC5zdWJzdHJpbmcoYnJhY2VPcGVuSW5kZXggKyAxLCBpbmRleCkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5wcm90b3R5cGUgPT09IFVyaVRlbXBsYXRlRXJyb3IucHJvdG90eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVXJpVGVtcGxhdGVFcnJvcih7dGVtcGxhdGVUZXh0OiB1cmlUZW1wbGF0ZVRleHQsIG1lc3NhZ2U6IGVycm9yLm9wdGlvbnMubWVzc2FnZSwgcG9zaXRpb246IGJyYWNlT3BlbkluZGV4ICsgZXJyb3Iub3B0aW9ucy5wb3NpdGlvbiwgZGV0YWlsczogZXJyb3Iub3B0aW9uc30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmFjZU9wZW5JbmRleCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgbGl0ZXJhbFN0YXJ0ID0gaW5kZXggKyAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZWFjaGVkIHVucmVhY2hhYmxlIGNvZGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJyYWNlT3BlbkluZGV4ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBVcmlUZW1wbGF0ZUVycm9yKHt0ZW1wbGF0ZVRleHQ6IHVyaVRlbXBsYXRlVGV4dCwgbWVzc2FnZTogXCJ1bmNsb3NlZCBicmFjZVwiLCBwb3NpdGlvbjogYnJhY2VPcGVuSW5kZXh9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxpdGVyYWxTdGFydCA8IHVyaVRlbXBsYXRlVGV4dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZXhwcmVzc2lvbnMucHVzaChuZXcgTGl0ZXJhbEV4cHJlc3Npb24odXJpVGVtcGxhdGVUZXh0LnN1YnN0cihsaXRlcmFsU3RhcnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVXJpVGVtcGxhdGUodXJpVGVtcGxhdGVUZXh0LCBleHByZXNzaW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhcnNlO1xyXG59KCkpO1xyXG5cclxudmFyIFZhcmlhYmxlRXhwcmVzc2lvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBoZWxwZXIgZnVuY3Rpb24gaWYgSlNPTiBpcyBub3QgYXZhaWxhYmxlXHJcbiAgICBmdW5jdGlvbiBwcmV0dHlQcmludCAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gKEpTT04gJiYgSlNPTi5zdHJpbmdpZnkpID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNFbXB0eSAodmFsdWUpIHtcclxuICAgICAgICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvYmplY3RIZWxwZXIuaXNTdHJpbmcodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvYmplY3RIZWxwZXIuaXNOdW1iZXIodmFsdWUpIHx8IG9iamVjdEhlbHBlci5pc0Jvb2xlYW4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iamVjdEhlbHBlci5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID09PSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gdmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwcm9wZXJ0eUFycmF5IChvYmplY3QpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmVzdWx0ID0gW10sXHJcbiAgICAgICAgICAgIHByb3BlcnR5TmFtZTtcclxuICAgICAgICBmb3IgKHByb3BlcnR5TmFtZSBpbiBvYmplY3QpIHtcclxuICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7bmFtZTogcHJvcGVydHlOYW1lLCB2YWx1ZTogb2JqZWN0W3Byb3BlcnR5TmFtZV19KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIFZhcmlhYmxlRXhwcmVzc2lvbiAodGVtcGxhdGVUZXh0LCBvcGVyYXRvciwgdmFyc3BlY3MpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlVGV4dCA9IHRlbXBsYXRlVGV4dDtcclxuICAgICAgICB0aGlzLm9wZXJhdG9yID0gb3BlcmF0b3I7XHJcbiAgICAgICAgdGhpcy52YXJzcGVjcyA9IHZhcnNwZWNzO1xyXG4gICAgfVxyXG5cclxuICAgIFZhcmlhYmxlRXhwcmVzc2lvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVUZXh0O1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmRTaW1wbGVWYWx1ZSh2YXJzcGVjLCBvcGVyYXRvciwgdmFsdWUpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmIChvcGVyYXRvci5uYW1lZCkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gZW5jb2RpbmdIZWxwZXIuZW5jb2RlTGl0ZXJhbCh2YXJzcGVjLnZhcm5hbWUpO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gb3BlcmF0b3IuaWZFbXB0eTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9ICc9JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhcnNwZWMubWF4TGVuZ3RoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyKDAsIHZhcnNwZWMubWF4TGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IG9wZXJhdG9yLmVuY29kZSh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB2YWx1ZURlZmluZWQgKG5hbWVWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBpc0RlZmluZWQobmFtZVZhbHVlLnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmROb3RFeHBsb2RlZCh2YXJzcGVjLCBvcGVyYXRvciwgdmFsdWUpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgYXJyID0gW10sXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGlmIChvcGVyYXRvci5uYW1lZCkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gZW5jb2RpbmdIZWxwZXIuZW5jb2RlTGl0ZXJhbCh2YXJzcGVjLnZhcm5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBvcGVyYXRvci5pZkVtcHR5O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gJz0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2JqZWN0SGVscGVyLmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGFyciA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIuZmlsdGVyKGFyciwgaXNEZWZpbmVkKTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLm1hcChhcnIsIG9wZXJhdG9yLmVuY29kZSk7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBvYmplY3RIZWxwZXIuam9pbihhcnIsICcsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhcnIgPSBwcm9wZXJ0eUFycmF5KHZhbHVlKTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLmZpbHRlcihhcnIsIHZhbHVlRGVmaW5lZCk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5tYXAoYXJyLCBmdW5jdGlvbiAobmFtZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlcmF0b3IuZW5jb2RlKG5hbWVWYWx1ZS5uYW1lKSArICcsJyArIG9wZXJhdG9yLmVuY29kZShuYW1lVmFsdWUudmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IG9iamVjdEhlbHBlci5qb2luKGFyciwgJywnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmRFeHBsb2RlZE5hbWVkICh2YXJzcGVjLCBvcGVyYXRvciwgdmFsdWUpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgaXNBcnJheSA9IG9iamVjdEhlbHBlci5pc0FycmF5KHZhbHVlKSxcclxuICAgICAgICAgICAgYXJyID0gW107XHJcbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgYXJyID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCBpc0RlZmluZWQpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgZnVuY3Rpb24gKGxpc3RFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gZW5jb2RpbmdIZWxwZXIuZW5jb2RlTGl0ZXJhbCh2YXJzcGVjLnZhcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkobGlzdEVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG1wICs9IG9wZXJhdG9yLmlmRW1wdHk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0bXAgKz0gJz0nICsgb3BlcmF0b3IuZW5jb2RlKGxpc3RFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0bXA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYXJyID0gcHJvcGVydHlBcnJheSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCB2YWx1ZURlZmluZWQpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgZnVuY3Rpb24gKG5hbWVWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IGVuY29kaW5nSGVscGVyLmVuY29kZUxpdGVyYWwobmFtZVZhbHVlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkobmFtZVZhbHVlLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRtcCArPSBvcGVyYXRvci5pZkVtcHR5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG1wICs9ICc9JyArIG9wZXJhdG9yLmVuY29kZShuYW1lVmFsdWUudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRtcDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3RIZWxwZXIuam9pbihhcnIsIG9wZXJhdG9yLnNlcGFyYXRvcik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwYW5kRXhwbG9kZWRVbm5hbWVkIChvcGVyYXRvciwgdmFsdWUpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgYXJyID0gW10sXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGlmIChvYmplY3RIZWxwZXIuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgYXJyID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGFyciA9IG9iamVjdEhlbHBlci5maWx0ZXIoYXJyLCBpc0RlZmluZWQpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIubWFwKGFyciwgb3BlcmF0b3IuZW5jb2RlKTtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IG9iamVjdEhlbHBlci5qb2luKGFyciwgb3BlcmF0b3Iuc2VwYXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFyciA9IHByb3BlcnR5QXJyYXkodmFsdWUpO1xyXG4gICAgICAgICAgICBhcnIgPSBvYmplY3RIZWxwZXIuZmlsdGVyKGFyciwgZnVuY3Rpb24gKG5hbWVWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzRGVmaW5lZChuYW1lVmFsdWUudmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYXJyID0gb2JqZWN0SGVscGVyLm1hcChhcnIsIGZ1bmN0aW9uIChuYW1lVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVyYXRvci5lbmNvZGUobmFtZVZhbHVlLm5hbWUpICsgJz0nICsgb3BlcmF0b3IuZW5jb2RlKG5hbWVWYWx1ZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gb2JqZWN0SGVscGVyLmpvaW4oYXJyLCBvcGVyYXRvci5zZXBhcmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBWYXJpYWJsZUV4cHJlc3Npb24ucHJvdG90eXBlLmV4cGFuZCA9IGZ1bmN0aW9uICh2YXJpYWJsZXMpIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgICAgZXhwYW5kZWQgPSBbXSxcclxuICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgIHZhcnNwZWMsXHJcbiAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICB2YWx1ZUlzQXJyLFxyXG4gICAgICAgICAgICBvbmVFeHBsb2RlZCA9IGZhbHNlLFxyXG4gICAgICAgICAgICBvcGVyYXRvciA9IHRoaXMub3BlcmF0b3I7XHJcblxyXG4gICAgICAgIC8vIGV4cGFuZCBlYWNoIHZhcnNwZWMgYW5kIGpvaW4gd2l0aCBvcGVyYXRvcidzIHNlcGFyYXRvclxyXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMudmFyc3BlY3MubGVuZ3RoOyBpbmRleCArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhcnNwZWMgPSB0aGlzLnZhcnNwZWNzW2luZGV4XTtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YXJpYWJsZXNbdmFyc3BlYy52YXJuYW1lXTtcclxuICAgICAgICAgICAgLy8gaWYgKCFpc0RlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIC8vIGlmICh2YXJpYWJsZXMuaGFzT3duUHJvcGVydHkodmFyc3BlYy5uYW1lKSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhcnNwZWMuZXhwbG9kZWQpIHtcclxuICAgICAgICAgICAgICAgIG9uZUV4cGxvZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWx1ZUlzQXJyID0gb2JqZWN0SGVscGVyLmlzQXJyYXkodmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgICAgICAgICBleHBhbmRlZC5wdXNoKGV4cGFuZFNpbXBsZVZhbHVlKHZhcnNwZWMsIG9wZXJhdG9yLCB2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhcnNwZWMubWF4TGVuZ3RoICYmIGlzRGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIDIuNC4xIG9mIHRoZSBzcGVjIHNheXM6IFwiUHJlZml4IG1vZGlmaWVycyBhcmUgbm90IGFwcGxpY2FibGUgdG8gdmFyaWFibGVzIHRoYXQgaGF2ZSBjb21wb3NpdGUgdmFsdWVzLlwiXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ByZWZpeCBtb2RpZmllcnMgYXJlIG5vdCBhcHBsaWNhYmxlIHRvIHZhcmlhYmxlcyB0aGF0IGhhdmUgY29tcG9zaXRlIHZhbHVlcy4gWW91IHRyaWVkIHRvIGV4cGFuZCAnICsgdGhpcyArIFwiIHdpdGggXCIgKyBwcmV0dHlQcmludCh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCF2YXJzcGVjLmV4cGxvZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3IubmFtZWQgfHwgIWlzRW1wdHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWQucHVzaChleHBhbmROb3RFeHBsb2RlZCh2YXJzcGVjLCBvcGVyYXRvciwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3IubmFtZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRlZC5wdXNoKGV4cGFuZEV4cGxvZGVkTmFtZWQodmFyc3BlYywgb3BlcmF0b3IsIHZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRlZC5wdXNoKGV4cGFuZEV4cGxvZGVkVW5uYW1lZChvcGVyYXRvciwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV4cGFuZGVkLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcGVyYXRvci5maXJzdCArIG9iamVjdEhlbHBlci5qb2luKGV4cGFuZGVkLCBvcGVyYXRvci5zZXBhcmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIFZhcmlhYmxlRXhwcmVzc2lvbjtcclxufSgpKTtcclxuXHJcbnZhciBVcmlUZW1wbGF0ZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBVcmlUZW1wbGF0ZSAodGVtcGxhdGVUZXh0LCBleHByZXNzaW9ucykge1xyXG4gICAgICAgIHRoaXMudGVtcGxhdGVUZXh0ID0gdGVtcGxhdGVUZXh0O1xyXG4gICAgICAgIHRoaXMuZXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucztcclxuICAgICAgICBvYmplY3RIZWxwZXIuZGVlcEZyZWV6ZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBVcmlUZW1wbGF0ZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVUZXh0O1xyXG4gICAgfTtcclxuXHJcbiAgICBVcmlUZW1wbGF0ZS5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24gKHZhcmlhYmxlcykge1xyXG4gICAgICAgIC8vIHRoaXMuZXhwcmVzc2lvbnMubWFwKGZ1bmN0aW9uIChleHByZXNzaW9uKSB7cmV0dXJuIGV4cHJlc3Npb24uZXhwYW5kKHZhcmlhYmxlcyk7fSkuam9pbignJyk7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIGluZGV4LFxyXG4gICAgICAgICAgICByZXN1bHQgPSAnJztcclxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmV4cHJlc3Npb25zLmxlbmd0aDsgaW5kZXggKz0gMSkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gdGhpcy5leHByZXNzaW9uc1tpbmRleF0uZXhwYW5kKHZhcmlhYmxlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFVyaVRlbXBsYXRlLnBhcnNlID0gcGFyc2U7XHJcbiAgICBVcmlUZW1wbGF0ZS5VcmlUZW1wbGF0ZUVycm9yID0gVXJpVGVtcGxhdGVFcnJvcjtcclxuICAgIHJldHVybiBVcmlUZW1wbGF0ZTtcclxufSgpKTtcclxuXHJcbiAgICBleHBvcnRDYWxsYmFjayhVcmlUZW1wbGF0ZSk7XHJcblxyXG59KGZ1bmN0aW9uIChVcmlUZW1wbGF0ZSkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIC8vIGV4cG9ydCBVcmlUZW1wbGF0ZSwgd2hlbiBtb2R1bGUgaXMgcHJlc2VudCwgb3IgcGFzcyBpdCB0byB3aW5kb3cgb3IgZ2xvYmFsXHJcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBVcmlUZW1wbGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGRlZmluZShbXSxmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBVcmlUZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgd2luZG93LlVyaVRlbXBsYXRlID0gVXJpVGVtcGxhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBnbG9iYWwuVXJpVGVtcGxhdGUgPSBVcmlUZW1wbGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbikpO1xyXG4iLCIvKiogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKGMpIGNvcHlyaWdodCAyMDExLTIwMTMgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMgKi9cblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IENvbW1vbkpTIFByb21pc2VzL0EgYW5kIHdoZW4oKSBpbXBsZW1lbnRhdGlvblxuICogd2hlbiBpcyBwYXJ0IG9mIHRoZSBjdWpvLmpzIGZhbWlseSBvZiBsaWJyYXJpZXMgKGh0dHA6Ly9jdWpvanMuY29tLylcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgYXQ6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEBhdXRob3IgQnJpYW4gQ2F2YWxpZXJcbiAqIEBhdXRob3IgSm9obiBIYW5uXG4gKiBAdmVyc2lvbiAyLjcuMVxuICovXG4oZnVuY3Rpb24oZGVmaW5lKSB7ICd1c2Ugc3RyaWN0JztcbmRlZmluZShmdW5jdGlvbiAocmVxdWlyZSkge1xuXG5cdC8vIFB1YmxpYyBBUElcblxuXHR3aGVuLnByb21pc2UgICA9IHByb21pc2U7ICAgIC8vIENyZWF0ZSBhIHBlbmRpbmcgcHJvbWlzZVxuXHR3aGVuLnJlc29sdmUgICA9IHJlc29sdmU7ICAgIC8vIENyZWF0ZSBhIHJlc29sdmVkIHByb21pc2Vcblx0d2hlbi5yZWplY3QgICAgPSByZWplY3Q7ICAgICAvLyBDcmVhdGUgYSByZWplY3RlZCBwcm9taXNlXG5cdHdoZW4uZGVmZXIgICAgID0gZGVmZXI7ICAgICAgLy8gQ3JlYXRlIGEge3Byb21pc2UsIHJlc29sdmVyfSBwYWlyXG5cblx0d2hlbi5qb2luICAgICAgPSBqb2luOyAgICAgICAvLyBKb2luIDIgb3IgbW9yZSBwcm9taXNlc1xuXG5cdHdoZW4uYWxsICAgICAgID0gYWxsOyAgICAgICAgLy8gUmVzb2x2ZSBhIGxpc3Qgb2YgcHJvbWlzZXNcblx0d2hlbi5tYXAgICAgICAgPSBtYXA7ICAgICAgICAvLyBBcnJheS5tYXAoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5yZWR1Y2UgICAgPSByZWR1Y2U7ICAgICAvLyBBcnJheS5yZWR1Y2UoKSBmb3IgcHJvbWlzZXNcblx0d2hlbi5zZXR0bGUgICAgPSBzZXR0bGU7ICAgICAvLyBTZXR0bGUgYSBsaXN0IG9mIHByb21pc2VzXG5cblx0d2hlbi5hbnkgICAgICAgPSBhbnk7ICAgICAgICAvLyBPbmUtd2lubmVyIHJhY2Vcblx0d2hlbi5zb21lICAgICAgPSBzb21lOyAgICAgICAvLyBNdWx0aS13aW5uZXIgcmFjZVxuXG5cdHdoZW4uaXNQcm9taXNlID0gaXNQcm9taXNlTGlrZTsgIC8vIERFUFJFQ0FURUQ6IHVzZSBpc1Byb21pc2VMaWtlXG5cdHdoZW4uaXNQcm9taXNlTGlrZSA9IGlzUHJvbWlzZUxpa2U7IC8vIElzIHNvbWV0aGluZyBwcm9taXNlLWxpa2UsIGFrYSB0aGVuYWJsZVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhbiBvYnNlcnZlciBmb3IgYSBwcm9taXNlIG9yIGltbWVkaWF0ZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHsqfSBwcm9taXNlT3JWYWx1ZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uRnVsZmlsbGVkXSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBwcm9taXNlT3JWYWx1ZSBpc1xuXHQgKiAgIHN1Y2Nlc3NmdWxseSBmdWxmaWxsZWQuICBJZiBwcm9taXNlT3JWYWx1ZSBpcyBhbiBpbW1lZGlhdGUgdmFsdWUsIGNhbGxiYWNrXG5cdCAqICAgd2lsbCBiZSBpbnZva2VkIGltbWVkaWF0ZWx5LlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uUmVqZWN0ZWRdIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIHByb21pc2VPclZhbHVlIGlzXG5cdCAqICAgcmVqZWN0ZWQuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25Qcm9ncmVzc10gY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gcHJvZ3Jlc3MgdXBkYXRlc1xuXHQgKiAgIGFyZSBpc3N1ZWQgZm9yIHByb21pc2VPclZhbHVlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBuZXcge0BsaW5rIFByb21pc2V9IHRoYXQgd2lsbCBjb21wbGV0ZSB3aXRoIHRoZSByZXR1cm5cblx0ICogICB2YWx1ZSBvZiBjYWxsYmFjayBvciBlcnJiYWNrIG9yIHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHByb21pc2VPclZhbHVlIGlmXG5cdCAqICAgY2FsbGJhY2sgYW5kL29yIGVycmJhY2sgaXMgbm90IHN1cHBsaWVkLlxuXHQgKi9cblx0ZnVuY3Rpb24gd2hlbihwcm9taXNlT3JWYWx1ZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpIHtcblx0XHQvLyBHZXQgYSB0cnVzdGVkIHByb21pc2UgZm9yIHRoZSBpbnB1dCBwcm9taXNlT3JWYWx1ZSwgYW5kIHRoZW5cblx0XHQvLyByZWdpc3RlciBwcm9taXNlIGhhbmRsZXJzXG5cdFx0cmV0dXJuIGNhc3QocHJvbWlzZU9yVmFsdWUpLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSB3aG9zZSBmYXRlIGlzIGRldGVybWluZWQgYnkgcmVzb2x2ZXIuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aG9zZSBmYXRlIGlzIGRldGVybWluZSBieSByZXNvbHZlclxuXHQgKi9cblx0ZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlcixcblx0XHRcdG1vbml0b3JBcGkuUHJvbWlzZVN0YXR1cyAmJiBtb25pdG9yQXBpLlByb21pc2VTdGF0dXMoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJ1c3RlZCBQcm9taXNlIGNvbnN0cnVjdG9yLiAgQSBQcm9taXNlIGNyZWF0ZWQgZnJvbSB0aGlzIGNvbnN0cnVjdG9yIGlzXG5cdCAqIGEgdHJ1c3RlZCB3aGVuLmpzIHByb21pc2UuICBBbnkgb3RoZXIgZHVjay10eXBlZCBwcm9taXNlIGlzIGNvbnNpZGVyZWRcblx0ICogdW50cnVzdGVkLlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hvc2UgZmF0ZSBpcyBkZXRlcm1pbmUgYnkgcmVzb2x2ZXJcblx0ICogQG5hbWUgUHJvbWlzZVxuXHQgKi9cblx0ZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlciwgc3RhdHVzKSB7XG5cdFx0dmFyIHNlbGYsIHZhbHVlLCBjb25zdW1lcnMgPSBbXTtcblxuXHRcdHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcblx0XHR0aGlzLmluc3BlY3QgPSBpbnNwZWN0O1xuXHRcdHRoaXMuX3doZW4gPSBfd2hlbjtcblxuXHRcdC8vIENhbGwgdGhlIHByb3ZpZGVyIHJlc29sdmVyIHRvIHNlYWwgdGhlIHByb21pc2UncyBmYXRlXG5cdFx0dHJ5IHtcblx0XHRcdHJlc29sdmVyKHByb21pc2VSZXNvbHZlLCBwcm9taXNlUmVqZWN0LCBwcm9taXNlTm90aWZ5KTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdHByb21pc2VSZWplY3QoZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyBhIHNuYXBzaG90IG9mIHRoaXMgcHJvbWlzZSdzIGN1cnJlbnQgc3RhdHVzIGF0IHRoZSBpbnN0YW50IG9mIGNhbGxcblx0XHQgKiBAcmV0dXJucyB7e3N0YXRlOlN0cmluZ319XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaW5zcGVjdCgpIHtcblx0XHRcdHJldHVybiB2YWx1ZSA/IHZhbHVlLmluc3BlY3QoKSA6IHRvUGVuZGluZ1N0YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJpdmF0ZSBtZXNzYWdlIGRlbGl2ZXJ5LiBRdWV1ZXMgYW5kIGRlbGl2ZXJzIG1lc3NhZ2VzIHRvXG5cdFx0ICogdGhlIHByb21pc2UncyB1bHRpbWF0ZSBmdWxmaWxsbWVudCB2YWx1ZSBvciByZWplY3Rpb24gcmVhc29uLlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3doZW4ocmVzb2x2ZSwgbm90aWZ5LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdFx0Y29uc3VtZXJzID8gY29uc3VtZXJzLnB1c2goZGVsaXZlcikgOiBlbnF1ZXVlKGZ1bmN0aW9uKCkgeyBkZWxpdmVyKHZhbHVlKTsgfSk7XG5cblx0XHRcdGZ1bmN0aW9uIGRlbGl2ZXIocCkge1xuXHRcdFx0XHRwLl93aGVuKHJlc29sdmUsIG5vdGlmeSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRyYW5zaXRpb24gZnJvbSBwcmUtcmVzb2x1dGlvbiBzdGF0ZSB0byBwb3N0LXJlc29sdXRpb24gc3RhdGUsIG5vdGlmeWluZ1xuXHRcdCAqIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIHVsdGltYXRlIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvblxuXHRcdCAqIEBwYXJhbSB7Kn0gdmFsIHJlc29sdXRpb24gdmFsdWVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZSh2YWwpIHtcblx0XHRcdGlmKCFjb25zdW1lcnMpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcXVldWUgPSBjb25zdW1lcnM7XG5cdFx0XHRjb25zdW1lcnMgPSB1bmRlZjtcblxuXHRcdFx0ZW5xdWV1ZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhbHVlID0gY29lcmNlKHNlbGYsIHZhbCk7XG5cdFx0XHRcdGlmKHN0YXR1cykge1xuXHRcdFx0XHRcdHVwZGF0ZVN0YXR1cyh2YWx1ZSwgc3RhdHVzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRydW5IYW5kbGVycyhxdWV1ZSwgdmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVqZWN0IHRoaXMgcHJvbWlzZSB3aXRoIHRoZSBzdXBwbGllZCByZWFzb24sIHdoaWNoIHdpbGwgYmUgdXNlZCB2ZXJiYXRpbS5cblx0XHQgKiBAcGFyYW0geyp9IHJlYXNvbiByZWFzb24gZm9yIHRoZSByZWplY3Rpb25cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcm9taXNlUmVqZWN0KHJlYXNvbikge1xuXHRcdFx0cHJvbWlzZVJlc29sdmUobmV3IFJlamVjdGVkUHJvbWlzZShyZWFzb24pKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBJc3N1ZSBhIHByb2dyZXNzIGV2ZW50LCBub3RpZnlpbmcgYWxsIHByb2dyZXNzIGxpc3RlbmVyc1xuXHRcdCAqIEBwYXJhbSB7Kn0gdXBkYXRlIHByb2dyZXNzIGV2ZW50IHBheWxvYWQgdG8gcGFzcyB0byBhbGwgbGlzdGVuZXJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcHJvbWlzZU5vdGlmeSh1cGRhdGUpIHtcblx0XHRcdGlmKGNvbnN1bWVycykge1xuXHRcdFx0XHR2YXIgcXVldWUgPSBjb25zdW1lcnM7XG5cdFx0XHRcdGVucXVldWUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJ1bkhhbmRsZXJzKHF1ZXVlLCBuZXcgUHJvZ3Jlc3NpbmdQcm9taXNlKHVwZGF0ZSkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcm9taXNlUHJvdG90eXBlID0gUHJvbWlzZS5wcm90b3R5cGU7XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXJzIGZvciB0aGlzIHByb21pc2UuXG5cdCAqIEBwYXJhbSBbb25GdWxmaWxsZWRdIHtGdW5jdGlvbn0gZnVsZmlsbG1lbnQgaGFuZGxlclxuXHQgKiBAcGFyYW0gW29uUmVqZWN0ZWRdIHtGdW5jdGlvbn0gcmVqZWN0aW9uIGhhbmRsZXJcblx0ICogQHBhcmFtIFtvblByb2dyZXNzXSB7RnVuY3Rpb259IHByb2dyZXNzIGhhbmRsZXJcblx0ICogQHJldHVybiB7UHJvbWlzZX0gbmV3IFByb21pc2Vcblx0ICovXG5cdHByb21pc2VQcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHRzZWxmLl93aGVuKHJlc29sdmUsIG5vdGlmeSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHRcdH0sIHRoaXMuX3N0YXR1cyAmJiB0aGlzLl9zdGF0dXMub2JzZXJ2ZWQoKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgcmVqZWN0aW9uIGhhbmRsZXIuICBTaG9ydGN1dCBmb3IgLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gb25SZWplY3RlZFxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsnY2F0Y2gnXSA9IHByb21pc2VQcm90b3R5cGUub3RoZXJ3aXNlID0gZnVuY3Rpb24ob25SZWplY3RlZCkge1xuXHRcdHJldHVybiB0aGlzLnRoZW4odW5kZWYsIG9uUmVqZWN0ZWQpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBFbnN1cmVzIHRoYXQgb25GdWxmaWxsZWRPclJlamVjdGVkIHdpbGwgYmUgY2FsbGVkIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlclxuXHQgKiB0aGlzIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgb25GdWxmaWxsZWRPclJlamVjdGVkIFdJTEwgTk9UXG5cdCAqIHJlY2VpdmUgdGhlIHByb21pc2VzJyB2YWx1ZSBvciByZWFzb24uICBBbnkgcmV0dXJuZWQgdmFsdWUgd2lsbCBiZSBkaXNyZWdhcmRlZC5cblx0ICogb25GdWxmaWxsZWRPclJlamVjdGVkIG1heSB0aHJvdyBvciByZXR1cm4gYSByZWplY3RlZCBwcm9taXNlIHRvIHNpZ25hbFxuXHQgKiBhbiBhZGRpdGlvbmFsIGVycm9yLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQgaGFuZGxlciB0byBiZSBjYWxsZWQgcmVnYXJkbGVzcyBvZlxuXHQgKiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsnZmluYWxseSddID0gcHJvbWlzZVByb3RvdHlwZS5lbnN1cmUgPSBmdW5jdGlvbihvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQpIHtcblx0XHRyZXR1cm4gdHlwZW9mIG9uRnVsZmlsbGVkT3JSZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0PyB0aGlzLnRoZW4oaW5qZWN0SGFuZGxlciwgaW5qZWN0SGFuZGxlcilbJ3lpZWxkJ10odGhpcylcblx0XHRcdDogdGhpcztcblxuXHRcdGZ1bmN0aW9uIGluamVjdEhhbmRsZXIoKSB7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQoKSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBUZXJtaW5hdGUgYSBwcm9taXNlIGNoYWluIGJ5IGhhbmRsaW5nIHRoZSB1bHRpbWF0ZSBmdWxmaWxsbWVudCB2YWx1ZSBvclxuXHQgKiByZWplY3Rpb24gcmVhc29uLCBhbmQgYXNzdW1pbmcgcmVzcG9uc2liaWxpdHkgZm9yIGFsbCBlcnJvcnMuICBpZiBhblxuXHQgKiBlcnJvciBwcm9wYWdhdGVzIG91dCBvZiBoYW5kbGVSZXN1bHQgb3IgaGFuZGxlRmF0YWxFcnJvciwgaXQgd2lsbCBiZVxuXHQgKiByZXRocm93biB0byB0aGUgaG9zdCwgcmVzdWx0aW5nIGluIGEgbG91ZCBzdGFjayB0cmFjayBvbiBtb3N0IHBsYXRmb3Jtc1xuXHQgKiBhbmQgYSBjcmFzaCBvbiBzb21lLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gaGFuZGxlUmVzdWx0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBoYW5kbGVFcnJvclxuXHQgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24oaGFuZGxlUmVzdWx0LCBoYW5kbGVFcnJvcikge1xuXHRcdHRoaXMudGhlbihoYW5kbGVSZXN1bHQsIGhhbmRsZUVycm9yKVsnY2F0Y2gnXShjcmFzaCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFNob3J0Y3V0IGZvciAudGhlbihmdW5jdGlvbigpIHsgcmV0dXJuIHZhbHVlOyB9KVxuXHQgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdDpcblx0ICogIC0gaXMgZnVsZmlsbGVkIGlmIHZhbHVlIGlzIG5vdCBhIHByb21pc2UsIG9yXG5cdCAqICAtIGlmIHZhbHVlIGlzIGEgcHJvbWlzZSwgd2lsbCBmdWxmaWxsIHdpdGggaXRzIHZhbHVlLCBvciByZWplY3Rcblx0ICogICAgd2l0aCBpdHMgcmVhc29uLlxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZVsneWllbGQnXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9KTtcblx0fTtcblxuXHQvKipcblx0ICogUnVucyBhIHNpZGUgZWZmZWN0IHdoZW4gdGhpcyBwcm9taXNlIGZ1bGZpbGxzLCB3aXRob3V0IGNoYW5naW5nIHRoZVxuXHQgKiBmdWxmaWxsbWVudCB2YWx1ZS5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gb25GdWxmaWxsZWRTaWRlRWZmZWN0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0cHJvbWlzZVByb3RvdHlwZS50YXAgPSBmdW5jdGlvbihvbkZ1bGZpbGxlZFNpZGVFZmZlY3QpIHtcblx0XHRyZXR1cm4gdGhpcy50aGVuKG9uRnVsZmlsbGVkU2lkZUVmZmVjdClbJ3lpZWxkJ10odGhpcyk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEFzc3VtZXMgdGhhdCB0aGlzIHByb21pc2Ugd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXksIGFuZCBhcnJhbmdlc1xuXHQgKiBmb3IgdGhlIG9uRnVsZmlsbGVkIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBhcnJheSBhcyBpdHMgYXJndW1lbnQgbGlzdFxuXHQgKiBpLmUuIG9uRnVsZmlsbGVkLmFwcGx5KHVuZGVmaW5lZCwgYXJyYXkpLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkZ1bGZpbGxlZCBmdW5jdGlvbiB0byByZWNlaXZlIHNwcmVhZCBhcmd1bWVudHNcblx0ICogQHJldHVybiB7UHJvbWlzZX1cblx0ICovXG5cdHByb21pc2VQcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24ob25GdWxmaWxsZWQpIHtcblx0XHRyZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uKGFycmF5KSB7XG5cdFx0XHQvLyBhcnJheSBtYXkgY29udGFpbiBwcm9taXNlcywgc28gcmVzb2x2ZSBpdHMgY29udGVudHMuXG5cdFx0XHRyZXR1cm4gYWxsKGFycmF5LCBmdW5jdGlvbihhcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gb25GdWxmaWxsZWQuYXBwbHkodW5kZWYsIGFycmF5KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBTaG9ydGN1dCBmb3IgLnRoZW4ob25GdWxmaWxsZWRPclJlamVjdGVkLCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQpXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRwcm9taXNlUHJvdG90eXBlLmFsd2F5cyA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkT3JSZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdHJldHVybiB0aGlzLnRoZW4ob25GdWxmaWxsZWRPclJlamVjdGVkLCBvbkZ1bGZpbGxlZE9yUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBDYXN0cyB4IHRvIGEgdHJ1c3RlZCBwcm9taXNlLiBJZiB4IGlzIGFscmVhZHkgYSB0cnVzdGVkIHByb21pc2UsIGl0IGlzXG5cdCAqIHJldHVybmVkLCBvdGhlcndpc2UgYSBuZXcgdHJ1c3RlZCBQcm9taXNlIHdoaWNoIGZvbGxvd3MgeCBpcyByZXR1cm5lZC5cblx0ICogQHBhcmFtIHsqfSB4XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gY2FzdCh4KSB7XG5cdFx0cmV0dXJuIHggaW5zdGFuY2VvZiBQcm9taXNlID8geCA6IHJlc29sdmUoeCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuIFRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmVcblx0ICogIC0gZnVsZmlsbGVkIHdpdGggcHJvbWlzZU9yVmFsdWUgaWYgaXQgaXMgYSB2YWx1ZSwgb3Jcblx0ICogIC0gaWYgcHJvbWlzZU9yVmFsdWUgaXMgYSBwcm9taXNlXG5cdCAqICAgIC0gZnVsZmlsbGVkIHdpdGggcHJvbWlzZU9yVmFsdWUncyB2YWx1ZSBhZnRlciBpdCBpcyBmdWxmaWxsZWRcblx0ICogICAgLSByZWplY3RlZCB3aXRoIHByb21pc2VPclZhbHVlJ3MgcmVhc29uIGFmdGVyIGl0IGlzIHJlamVjdGVkXG5cdCAqIEluIGNvbnRyYWN0IHRvIGNhc3QoeCksIHRoaXMgYWx3YXlzIGNyZWF0ZXMgYSBuZXcgUHJvbWlzZVxuXHQgKiBAcGFyYW0gIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSkge1xuXHRcdHJldHVybiBwcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcblx0XHRcdHJlc29sdmUodmFsdWUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSByZWplY3RlZCBwcm9taXNlIGZvciB0aGUgc3VwcGxpZWQgcHJvbWlzZU9yVmFsdWUuICBUaGUgcmV0dXJuZWRcblx0ICogcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGg6XG5cdCAqIC0gcHJvbWlzZU9yVmFsdWUsIGlmIGl0IGlzIGEgdmFsdWUsIG9yXG5cdCAqIC0gaWYgcHJvbWlzZU9yVmFsdWUgaXMgYSBwcm9taXNlXG5cdCAqICAgLSBwcm9taXNlT3JWYWx1ZSdzIHZhbHVlIGFmdGVyIGl0IGlzIGZ1bGZpbGxlZFxuXHQgKiAgIC0gcHJvbWlzZU9yVmFsdWUncyByZWFzb24gYWZ0ZXIgaXQgaXMgcmVqZWN0ZWRcblx0ICogQHBhcmFtIHsqfSBwcm9taXNlT3JWYWx1ZSB0aGUgcmVqZWN0ZWQgdmFsdWUgb2YgdGhlIHJldHVybmVkIHtAbGluayBQcm9taXNlfVxuXHQgKiBAcmV0dXJuIHtQcm9taXNlfSByZWplY3RlZCB7QGxpbmsgUHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIHJlamVjdChwcm9taXNlT3JWYWx1ZSkge1xuXHRcdHJldHVybiB3aGVuKHByb21pc2VPclZhbHVlLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkUHJvbWlzZShlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEge3Byb21pc2UsIHJlc29sdmVyfSBwYWlyLCBlaXRoZXIgb3IgYm90aCBvZiB3aGljaFxuXHQgKiBtYXkgYmUgZ2l2ZW4gb3V0IHNhZmVseSB0byBjb25zdW1lcnMuXG5cdCAqIFRoZSByZXNvbHZlciBoYXMgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgcHJvZ3Jlc3MuICBUaGUgcHJvbWlzZVxuXHQgKiBoYXMgdGhlbiBwbHVzIGV4dGVuZGVkIHByb21pc2UgQVBJLlxuXHQgKlxuXHQgKiBAcmV0dXJuIHt7XG5cdCAqIHByb21pc2U6IFByb21pc2UsXG5cdCAqIHJlc29sdmU6IGZ1bmN0aW9uOlByb21pc2UsXG5cdCAqIHJlamVjdDogZnVuY3Rpb246UHJvbWlzZSxcblx0ICogbm90aWZ5OiBmdW5jdGlvbjpQcm9taXNlXG5cdCAqIHJlc29sdmVyOiB7XG5cdCAqXHRyZXNvbHZlOiBmdW5jdGlvbjpQcm9taXNlLFxuXHQgKlx0cmVqZWN0OiBmdW5jdGlvbjpQcm9taXNlLFxuXHQgKlx0bm90aWZ5OiBmdW5jdGlvbjpQcm9taXNlXG5cdCAqIH19fVxuXHQgKi9cblx0ZnVuY3Rpb24gZGVmZXIoKSB7XG5cdFx0dmFyIGRlZmVycmVkLCBwZW5kaW5nLCByZXNvbHZlZDtcblxuXHRcdC8vIE9wdGltaXplIG9iamVjdCBzaGFwZVxuXHRcdGRlZmVycmVkID0ge1xuXHRcdFx0cHJvbWlzZTogdW5kZWYsIHJlc29sdmU6IHVuZGVmLCByZWplY3Q6IHVuZGVmLCBub3RpZnk6IHVuZGVmLFxuXHRcdFx0cmVzb2x2ZXI6IHsgcmVzb2x2ZTogdW5kZWYsIHJlamVjdDogdW5kZWYsIG5vdGlmeTogdW5kZWYgfVxuXHRcdH07XG5cblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcGVuZGluZyA9IHByb21pc2UobWFrZURlZmVycmVkKTtcblxuXHRcdHJldHVybiBkZWZlcnJlZDtcblxuXHRcdGZ1bmN0aW9uIG1ha2VEZWZlcnJlZChyZXNvbHZlUGVuZGluZywgcmVqZWN0UGVuZGluZywgbm90aWZ5UGVuZGluZykge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSA9IGRlZmVycmVkLnJlc29sdmVyLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXNvbHZlZCA9IHRydWU7XG5cdFx0XHRcdHJlc29sdmVQZW5kaW5nKHZhbHVlKTtcblx0XHRcdFx0cmV0dXJuIHBlbmRpbmc7XG5cdFx0XHR9O1xuXG5cdFx0XHRkZWZlcnJlZC5yZWplY3QgID0gZGVmZXJyZWQucmVzb2x2ZXIucmVqZWN0ICA9IGZ1bmN0aW9uKHJlYXNvbikge1xuXHRcdFx0XHRpZihyZXNvbHZlZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXNvbHZlKG5ldyBSZWplY3RlZFByb21pc2UocmVhc29uKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzb2x2ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZWplY3RQZW5kaW5nKHJlYXNvbik7XG5cdFx0XHRcdHJldHVybiBwZW5kaW5nO1xuXHRcdFx0fTtcblxuXHRcdFx0ZGVmZXJyZWQubm90aWZ5ICA9IGRlZmVycmVkLnJlc29sdmVyLm5vdGlmeSAgPSBmdW5jdGlvbih1cGRhdGUpIHtcblx0XHRcdFx0bm90aWZ5UGVuZGluZyh1cGRhdGUpO1xuXHRcdFx0XHRyZXR1cm4gdXBkYXRlO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUnVuIGEgcXVldWUgb2YgZnVuY3Rpb25zIGFzIHF1aWNrbHkgYXMgcG9zc2libGUsIHBhc3Npbmdcblx0ICogdmFsdWUgdG8gZWFjaC5cblx0ICovXG5cdGZ1bmN0aW9uIHJ1bkhhbmRsZXJzKHF1ZXVlLCB2YWx1ZSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHF1ZXVlW2ldKHZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29lcmNlcyB4IHRvIGEgdHJ1c3RlZCBQcm9taXNlXG5cdCAqIEBwYXJhbSB7Kn0geCB0aGluZyB0byBjb2VyY2Vcblx0ICogQHJldHVybnMgeyp9IEd1YXJhbnRlZWQgdG8gcmV0dXJuIGEgdHJ1c3RlZCBQcm9taXNlLiAgSWYgeFxuXHQgKiAgIGlzIHRydXN0ZWQsIHJldHVybnMgeCwgb3RoZXJ3aXNlLCByZXR1cm5zIGEgbmV3LCB0cnVzdGVkLCBhbHJlYWR5LXJlc29sdmVkXG5cdCAqICAgUHJvbWlzZSB3aG9zZSByZXNvbHV0aW9uIHZhbHVlIGlzOlxuXHQgKiAgICogdGhlIHJlc29sdXRpb24gdmFsdWUgb2YgeCBpZiBpdCdzIGEgZm9yZWlnbiBwcm9taXNlLCBvclxuXHQgKiAgICogeCBpZiBpdCdzIGEgdmFsdWVcblx0ICovXG5cdGZ1bmN0aW9uIGNvZXJjZShzZWxmLCB4KSB7XG5cdFx0aWYgKHggPT09IHNlbGYpIHtcblx0XHRcdHJldHVybiBuZXcgUmVqZWN0ZWRQcm9taXNlKG5ldyBUeXBlRXJyb3IoKSk7XG5cdFx0fVxuXG5cdFx0aWYgKHggaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRyZXR1cm4geDtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0dmFyIHVudHJ1c3RlZFRoZW4gPSB4ID09PSBPYmplY3QoeCkgJiYgeC50aGVuO1xuXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHVudHJ1c3RlZFRoZW4gPT09ICdmdW5jdGlvbidcblx0XHRcdFx0PyBhc3NpbWlsYXRlKHVudHJ1c3RlZFRoZW4sIHgpXG5cdFx0XHRcdDogbmV3IEZ1bGZpbGxlZFByb21pc2UoeCk7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFJlamVjdGVkUHJvbWlzZShlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2FmZWx5IGFzc2ltaWxhdGVzIGEgZm9yZWlnbiB0aGVuYWJsZSBieSB3cmFwcGluZyBpdCBpbiBhIHRydXN0ZWQgcHJvbWlzZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1bnRydXN0ZWRUaGVuIHgncyB0aGVuKCkgbWV0aG9kXG5cdCAqIEBwYXJhbSB7b2JqZWN0fGZ1bmN0aW9ufSB4IHRoZW5hYmxlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gYXNzaW1pbGF0ZSh1bnRydXN0ZWRUaGVuLCB4KSB7XG5cdFx0cmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0ZmNhbGwodW50cnVzdGVkVGhlbiwgeCwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdG1ha2VQcm9taXNlUHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSB8fFxuXHRcdGZ1bmN0aW9uKG8pIHtcblx0XHRcdGZ1bmN0aW9uIFByb21pc2VQcm90b3R5cGUoKSB7fVxuXHRcdFx0UHJvbWlzZVByb3RvdHlwZS5wcm90b3R5cGUgPSBvO1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlUHJvdG90eXBlKCk7XG5cdFx0fTtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZ1bGZpbGxlZCwgbG9jYWwgcHJvbWlzZSBhcyBhIHByb3h5IGZvciBhIHZhbHVlXG5cdCAqIE5PVEU6IG11c3QgbmV2ZXIgYmUgZXhwb3NlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIGZ1bGZpbGxtZW50IHZhbHVlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gRnVsZmlsbGVkUHJvbWlzZSh2YWx1ZSkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxuXG5cdEZ1bGZpbGxlZFByb21pc2UucHJvdG90eXBlID0gbWFrZVByb21pc2VQcm90b3R5cGUocHJvbWlzZVByb3RvdHlwZSk7XG5cblx0RnVsZmlsbGVkUHJvbWlzZS5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0b0Z1bGZpbGxlZFN0YXRlKHRoaXMudmFsdWUpO1xuXHR9O1xuXG5cdEZ1bGZpbGxlZFByb21pc2UucHJvdG90eXBlLl93aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgXywgb25GdWxmaWxsZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzb2x2ZSh0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCh0aGlzLnZhbHVlKSA6IHRoaXMudmFsdWUpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0cmVzb2x2ZShuZXcgUmVqZWN0ZWRQcm9taXNlKGUpKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSByZWplY3RlZCwgbG9jYWwgcHJvbWlzZSBhcyBhIHByb3h5IGZvciBhIHZhbHVlXG5cdCAqIE5PVEU6IG11c3QgbmV2ZXIgYmUgZXhwb3NlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHJlYXNvbiByZWplY3Rpb24gcmVhc29uXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gUmVqZWN0ZWRQcm9taXNlKHJlYXNvbikge1xuXHRcdHRoaXMudmFsdWUgPSByZWFzb247XG5cdH1cblxuXHRSZWplY3RlZFByb21pc2UucHJvdG90eXBlID0gbWFrZVByb21pc2VQcm90b3R5cGUocHJvbWlzZVByb3RvdHlwZSk7XG5cblx0UmVqZWN0ZWRQcm9taXNlLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRvUmVqZWN0ZWRTdGF0ZSh0aGlzLnZhbHVlKTtcblx0fTtcblxuXHRSZWplY3RlZFByb21pc2UucHJvdG90eXBlLl93aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgXywgX18sIG9uUmVqZWN0ZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0cmVzb2x2ZSh0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQodGhpcy52YWx1ZSkgOiB0aGlzKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdHJlc29sdmUobmV3IFJlamVjdGVkUHJvbWlzZShlKSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBwcm9ncmVzcyBwcm9taXNlIHdpdGggdGhlIHN1cHBsaWVkIHVwZGF0ZS5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBwcm9ncmVzcyB1cGRhdGUgdmFsdWVcblx0ICogQHJldHVybiB7UHJvbWlzZX0gcHJvZ3Jlc3MgcHJvbWlzZVxuXHQgKi9cblx0ZnVuY3Rpb24gUHJvZ3Jlc3NpbmdQcm9taXNlKHZhbHVlKSB7XG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR9XG5cblx0UHJvZ3Jlc3NpbmdQcm9taXNlLnByb3RvdHlwZSA9IG1ha2VQcm9taXNlUHJvdG90eXBlKHByb21pc2VQcm90b3R5cGUpO1xuXG5cdFByb2dyZXNzaW5nUHJvbWlzZS5wcm90b3R5cGUuX3doZW4gPSBmdW5jdGlvbihfLCBub3RpZnksIGYsIHIsIHUpIHtcblx0XHR0cnkge1xuXHRcdFx0bm90aWZ5KHR5cGVvZiB1ID09PSAnZnVuY3Rpb24nID8gdSh0aGlzLnZhbHVlKSA6IHRoaXMudmFsdWUpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0bm90aWZ5KGUpO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogVXBkYXRlIGEgUHJvbWlzZVN0YXR1cyBtb25pdG9yIG9iamVjdCB3aXRoIHRoZSBvdXRjb21lXG5cdCAqIG9mIHRoZSBzdXBwbGllZCB2YWx1ZSBwcm9taXNlLlxuXHQgKiBAcGFyYW0ge1Byb21pc2V9IHZhbHVlXG5cdCAqIEBwYXJhbSB7UHJvbWlzZVN0YXR1c30gc3RhdHVzXG5cdCAqL1xuXHRmdW5jdGlvbiB1cGRhdGVTdGF0dXModmFsdWUsIHN0YXR1cykge1xuXHRcdHZhbHVlLnRoZW4oc3RhdHVzRnVsZmlsbGVkLCBzdGF0dXNSZWplY3RlZCk7XG5cblx0XHRmdW5jdGlvbiBzdGF0dXNGdWxmaWxsZWQoKSB7IHN0YXR1cy5mdWxmaWxsZWQoKTsgfVxuXHRcdGZ1bmN0aW9uIHN0YXR1c1JlamVjdGVkKHIpIHsgc3RhdHVzLnJlamVjdGVkKHIpOyB9XG5cdH1cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiB4IGlzIHByb21pc2UtbGlrZSwgaS5lLiBhIHRoZW5hYmxlIG9iamVjdFxuXHQgKiBOT1RFOiBXaWxsIHJldHVybiB0cnVlIGZvciAqYW55IHRoZW5hYmxlIG9iamVjdCosIGFuZCBpc24ndCB0cnVseVxuXHQgKiBzYWZlLCBzaW5jZSBpdCBtYXkgYXR0ZW1wdCB0byBhY2Nlc3MgdGhlIGB0aGVuYCBwcm9wZXJ0eSBvZiB4IChpLmUuXG5cdCAqICBjbGV2ZXIvbWFsaWNpb3VzIGdldHRlcnMgbWF5IGRvIHdlaXJkIHRoaW5ncylcblx0ICogQHBhcmFtIHsqfSB4IGFueXRoaW5nXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHggaXMgcHJvbWlzZS1saWtlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc1Byb21pc2VMaWtlKHgpIHtcblx0XHRyZXR1cm4geCAmJiB0eXBlb2YgeC50aGVuID09PSAnZnVuY3Rpb24nO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYXRlcyBhIGNvbXBldGl0aXZlIHJhY2UsIHJldHVybmluZyBhIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlblxuXHQgKiBob3dNYW55IG9mIHRoZSBzdXBwbGllZCBwcm9taXNlc09yVmFsdWVzIGhhdmUgcmVzb2x2ZWQsIG9yIHdpbGwgcmVqZWN0IHdoZW5cblx0ICogaXQgYmVjb21lcyBpbXBvc3NpYmxlIGZvciBob3dNYW55IHRvIHJlc29sdmUsIGZvciBleGFtcGxlLCB3aGVuXG5cdCAqIChwcm9taXNlc09yVmFsdWVzLmxlbmd0aCAtIGhvd01hbnkpICsgMSBpbnB1dCBwcm9taXNlcyByZWplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHByb21pc2VzT3JWYWx1ZXMgYXJyYXkgb2YgYW55dGhpbmcsIG1heSBjb250YWluIGEgbWl4XG5cdCAqICAgICAgb2YgcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0gaG93TWFueSB7bnVtYmVyfSBudW1iZXIgb2YgcHJvbWlzZXNPclZhbHVlcyB0byByZXNvbHZlXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25GdWxmaWxsZWRdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25SZWplY3RlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblByb2dyZXNzXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byBhbiBhcnJheSBvZiBob3dNYW55IHZhbHVlcyB0aGF0XG5cdCAqICByZXNvbHZlZCBmaXJzdCwgb3Igd2lsbCByZWplY3Qgd2l0aCBhbiBhcnJheSBvZlxuXHQgKiAgKHByb21pc2VzT3JWYWx1ZXMubGVuZ3RoIC0gaG93TWFueSkgKyAxIHJlamVjdGlvbiByZWFzb25zLlxuXHQgKi9cblx0ZnVuY3Rpb24gc29tZShwcm9taXNlc09yVmFsdWVzLCBob3dNYW55LCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZXNPclZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZXNPclZhbHVlcykge1xuXG5cdFx0XHRyZXR1cm4gcHJvbWlzZShyZXNvbHZlU29tZSkudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcyk7XG5cblx0XHRcdGZ1bmN0aW9uIHJlc29sdmVTb21lKHJlc29sdmUsIHJlamVjdCwgbm90aWZ5KSB7XG5cdFx0XHRcdHZhciB0b1Jlc29sdmUsIHRvUmVqZWN0LCB2YWx1ZXMsIHJlYXNvbnMsIGZ1bGZpbGxPbmUsIHJlamVjdE9uZSwgbGVuLCBpO1xuXG5cdFx0XHRcdGxlbiA9IHByb21pc2VzT3JWYWx1ZXMubGVuZ3RoID4+PiAwO1xuXG5cdFx0XHRcdHRvUmVzb2x2ZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKGhvd01hbnksIGxlbikpO1xuXHRcdFx0XHR2YWx1ZXMgPSBbXTtcblxuXHRcdFx0XHR0b1JlamVjdCA9IChsZW4gLSB0b1Jlc29sdmUpICsgMTtcblx0XHRcdFx0cmVhc29ucyA9IFtdO1xuXG5cdFx0XHRcdC8vIE5vIGl0ZW1zIGluIHRoZSBpbnB1dCwgcmVzb2x2ZSBpbW1lZGlhdGVseVxuXHRcdFx0XHRpZiAoIXRvUmVzb2x2ZSkge1xuXHRcdFx0XHRcdHJlc29sdmUodmFsdWVzKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlamVjdE9uZSA9IGZ1bmN0aW9uKHJlYXNvbikge1xuXHRcdFx0XHRcdFx0cmVhc29ucy5wdXNoKHJlYXNvbik7XG5cdFx0XHRcdFx0XHRpZighLS10b1JlamVjdCkge1xuXHRcdFx0XHRcdFx0XHRmdWxmaWxsT25lID0gcmVqZWN0T25lID0gaWRlbnRpdHk7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChyZWFzb25zKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZnVsZmlsbE9uZSA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHRcdFx0Ly8gVGhpcyBvcmRlcnMgdGhlIHZhbHVlcyBiYXNlZCBvbiBwcm9taXNlIHJlc29sdXRpb24gb3JkZXJcblx0XHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbCk7XG5cdFx0XHRcdFx0XHRpZiAoIS0tdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdGZ1bGZpbGxPbmUgPSByZWplY3RPbmUgPSBpZGVudGl0eTtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSh2YWx1ZXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuXHRcdFx0XHRcdFx0aWYoaSBpbiBwcm9taXNlc09yVmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRcdHdoZW4ocHJvbWlzZXNPclZhbHVlc1tpXSwgZnVsZmlsbGVyLCByZWplY3Rlciwgbm90aWZ5KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiByZWplY3RlcihyZWFzb24pIHtcblx0XHRcdFx0XHRyZWplY3RPbmUocmVhc29uKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGZ1bGZpbGxlcih2YWwpIHtcblx0XHRcdFx0XHRmdWxmaWxsT25lKHZhbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWF0ZXMgYSBjb21wZXRpdGl2ZSByYWNlLCByZXR1cm5pbmcgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW5cblx0ICogYW55IG9uZSBvZiB0aGUgc3VwcGxpZWQgcHJvbWlzZXNPclZhbHVlcyBoYXMgcmVzb2x2ZWQgb3Igd2lsbCByZWplY3Qgd2hlblxuXHQgKiAqYWxsKiBwcm9taXNlc09yVmFsdWVzIGhhdmUgcmVqZWN0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZXNPclZhbHVlcyBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gYSBtaXhcblx0ICogICAgICBvZiB7QGxpbmsgUHJvbWlzZX1zIGFuZCB2YWx1ZXNcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvbkZ1bGZpbGxlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblJlamVjdGVkXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gW29uUHJvZ3Jlc3NdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSB2YWx1ZSB0aGF0IHJlc29sdmVkIGZpcnN0LCBvclxuXHQgKiB3aWxsIHJlamVjdCB3aXRoIGFuIGFycmF5IG9mIGFsbCByZWplY3RlZCBpbnB1dHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBhbnkocHJvbWlzZXNPclZhbHVlcywgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpIHtcblxuXHRcdGZ1bmN0aW9uIHVud3JhcFNpbmdsZVJlc3VsdCh2YWwpIHtcblx0XHRcdHJldHVybiBvbkZ1bGZpbGxlZCA/IG9uRnVsZmlsbGVkKHZhbFswXSkgOiB2YWxbMF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNvbWUocHJvbWlzZXNPclZhbHVlcywgMSwgdW53cmFwU2luZ2xlUmVzdWx0LCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9ubHkgb25jZSBhbGwgdGhlIHN1cHBsaWVkIHByb21pc2VzT3JWYWx1ZXNcblx0ICogaGF2ZSByZXNvbHZlZC4gVGhlIHJlc29sdXRpb24gdmFsdWUgb2YgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSBhbiBhcnJheVxuXHQgKiBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIHZhbHVlcyBvZiBlYWNoIG9mIHRoZSBwcm9taXNlc09yVmFsdWVzLlxuXHQgKiBAbWVtYmVyT2Ygd2hlblxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fFByb21pc2V9IHByb21pc2VzT3JWYWx1ZXMgYXJyYXkgb2YgYW55dGhpbmcsIG1heSBjb250YWluIGEgbWl4XG5cdCAqICAgICAgb2Yge0BsaW5rIFByb21pc2V9cyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25GdWxmaWxsZWRdIERFUFJFQ0FURUQsIHVzZSByZXR1cm5lZFByb21pc2UudGhlbigpXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24/fSBbb25SZWplY3RlZF0gREVQUkVDQVRFRCwgdXNlIHJldHVybmVkUHJvbWlzZS50aGVuKClcblx0ICogQHBhcmFtIHtmdW5jdGlvbj99IFtvblByb2dyZXNzXSBERVBSRUNBVEVELCB1c2UgcmV0dXJuZWRQcm9taXNlLnRoZW4oKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX1cblx0ICovXG5cdGZ1bmN0aW9uIGFsbChwcm9taXNlc09yVmFsdWVzLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcykge1xuXHRcdHJldHVybiBfbWFwKHByb21pc2VzT3JWYWx1ZXMsIGlkZW50aXR5KS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBKb2lucyBtdWx0aXBsZSBwcm9taXNlcyBpbnRvIGEgc2luZ2xlIHJldHVybmVkIHByb21pc2UuXG5cdCAqIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgZnVsZmlsbCB3aGVuICphbGwqIHRoZSBpbnB1dCBwcm9taXNlc1xuXHQgKiBoYXZlIGZ1bGZpbGxlZCwgb3Igd2lsbCByZWplY3Qgd2hlbiAqYW55IG9uZSogb2YgdGhlIGlucHV0IHByb21pc2VzIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBqb2luKC8qIC4uLnByb21pc2VzICovKSB7XG5cdFx0cmV0dXJuIF9tYXAoYXJndW1lbnRzLCBpZGVudGl0eSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0dGxlcyBhbGwgaW5wdXQgcHJvbWlzZXMgc3VjaCB0aGF0IHRoZXkgYXJlIGd1YXJhbnRlZWQgbm90IHRvXG5cdCAqIGJlIHBlbmRpbmcgb25jZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSBmdWxmaWxscy4gVGhlIHJldHVybmVkIHByb21pc2Vcblx0ICogd2lsbCBhbHdheXMgZnVsZmlsbCwgZXhjZXB0IGluIHRoZSBjYXNlIHdoZXJlIGBhcnJheWAgaXMgYSBwcm9taXNlXG5cdCAqIHRoYXQgcmVqZWN0cy5cblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBhcnJheSBvciBwcm9taXNlIGZvciBhcnJheSBvZiBwcm9taXNlcyB0byBzZXR0bGVcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgdGhhdCBhbHdheXMgZnVsZmlsbHMgd2l0aCBhbiBhcnJheSBvZlxuXHQgKiAgb3V0Y29tZSBzbmFwc2hvdHMgZm9yIGVhY2ggaW5wdXQgcHJvbWlzZS5cblx0ICovXG5cdGZ1bmN0aW9uIHNldHRsZShhcnJheSkge1xuXHRcdHJldHVybiBfbWFwKGFycmF5LCB0b0Z1bGZpbGxlZFN0YXRlLCB0b1JlamVjdGVkU3RhdGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb21pc2UtYXdhcmUgYXJyYXkgbWFwIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUubWFwKClgLFxuXHQgKiBidXQgaW5wdXQgYXJyYXkgbWF5IGNvbnRhaW4gcHJvbWlzZXMgb3IgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge0FycmF5fFByb21pc2V9IGFycmF5IGFycmF5IG9mIGFueXRoaW5nLCBtYXkgY29udGFpbiBwcm9taXNlcyBhbmQgdmFsdWVzXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IG1hcEZ1bmMgbWFwIGZ1bmN0aW9uIHdoaWNoIG1heSByZXR1cm4gYSBwcm9taXNlIG9yIHZhbHVlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgb2YgbWFwcGVkIHZhbHVlc1xuXHQgKiAgb3IgcmVqZWN0IGlmIGFueSBpbnB1dCBwcm9taXNlIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIG1hcEZ1bmMpIHtcblx0XHRyZXR1cm4gX21hcChhcnJheSwgbWFwRnVuYyk7XG5cdH1cblxuXHQvKipcblx0ICogSW50ZXJuYWwgbWFwIHRoYXQgYWxsb3dzIGEgZmFsbGJhY2sgdG8gaGFuZGxlIHJlamVjdGlvbnNcblx0ICogQHBhcmFtIHtBcnJheXxQcm9taXNlfSBhcnJheSBhcnJheSBvZiBhbnl0aGluZywgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kIHZhbHVlc1xuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtYXBGdW5jIG1hcCBmdW5jdGlvbiB3aGljaCBtYXkgcmV0dXJuIGEgcHJvbWlzZSBvciB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uP30gZmFsbGJhY2sgZnVuY3Rpb24gdG8gaGFuZGxlIHJlamVjdGVkIHByb21pc2VzXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIHdpdGggYW4gYXJyYXkgb2YgbWFwcGVkIHZhbHVlc1xuXHQgKiAgb3IgcmVqZWN0IGlmIGFueSBpbnB1dCBwcm9taXNlIHJlamVjdHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBfbWFwKGFycmF5LCBtYXBGdW5jLCBmYWxsYmFjaykge1xuXHRcdHJldHVybiB3aGVuKGFycmF5LCBmdW5jdGlvbihhcnJheSkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZU1hcCk7XG5cblx0XHRcdGZ1bmN0aW9uIHJlc29sdmVNYXAocmVzb2x2ZSwgcmVqZWN0LCBub3RpZnkpIHtcblx0XHRcdFx0dmFyIHJlc3VsdHMsIGxlbiwgdG9SZXNvbHZlLCBpO1xuXG5cdFx0XHRcdC8vIFNpbmNlIHdlIGtub3cgdGhlIHJlc3VsdGluZyBsZW5ndGgsIHdlIGNhbiBwcmVhbGxvY2F0ZSB0aGUgcmVzdWx0c1xuXHRcdFx0XHQvLyBhcnJheSB0byBhdm9pZCBhcnJheSBleHBhbnNpb25zLlxuXHRcdFx0XHR0b1Jlc29sdmUgPSBsZW4gPSBhcnJheS5sZW5ndGggPj4+IDA7XG5cdFx0XHRcdHJlc3VsdHMgPSBbXTtcblxuXHRcdFx0XHRpZighdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXN1bHRzKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTaW5jZSBtYXBGdW5jIG1heSBiZSBhc3luYywgZ2V0IGFsbCBpbnZvY2F0aW9ucyBvZiBpdCBpbnRvIGZsaWdodFxuXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRcdGlmKGkgaW4gYXJyYXkpIHtcblx0XHRcdFx0XHRcdHJlc29sdmVPbmUoYXJyYXlbaV0sIGkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQtLXRvUmVzb2x2ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiByZXNvbHZlT25lKGl0ZW0sIGkpIHtcblx0XHRcdFx0XHR3aGVuKGl0ZW0sIG1hcEZ1bmMsIGZhbGxiYWNrKS50aGVuKGZ1bmN0aW9uKG1hcHBlZCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0c1tpXSA9IG1hcHBlZDtcblxuXHRcdFx0XHRcdFx0aWYoIS0tdG9SZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUocmVzdWx0cyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgcmVqZWN0LCBub3RpZnkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJhZGl0aW9uYWwgcmVkdWNlIGZ1bmN0aW9uLCBzaW1pbGFyIHRvIGBBcnJheS5wcm90b3R5cGUucmVkdWNlKClgLCBidXRcblx0ICogaW5wdXQgbWF5IGNvbnRhaW4gcHJvbWlzZXMgYW5kL29yIHZhbHVlcywgYW5kIHJlZHVjZUZ1bmNcblx0ICogbWF5IHJldHVybiBlaXRoZXIgYSB2YWx1ZSBvciBhIHByb21pc2UsICphbmQqIGluaXRpYWxWYWx1ZSBtYXlcblx0ICogYmUgYSBwcm9taXNlIGZvciB0aGUgc3RhcnRpbmcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8UHJvbWlzZX0gcHJvbWlzZSBhcnJheSBvciBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBhbnl0aGluZyxcblx0ICogICAgICBtYXkgY29udGFpbiBhIG1peCBvZiBwcm9taXNlcyBhbmQgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZWR1Y2VGdW5jIHJlZHVjZSBmdW5jdGlvbiByZWR1Y2UoY3VycmVudFZhbHVlLCBuZXh0VmFsdWUsIGluZGV4LCB0b3RhbCksXG5cdCAqICAgICAgd2hlcmUgdG90YWwgaXMgdGhlIHRvdGFsIG51bWJlciBvZiBpdGVtcyBiZWluZyByZWR1Y2VkLCBhbmQgd2lsbCBiZSB0aGUgc2FtZVxuXHQgKiAgICAgIGluIGVhY2ggY2FsbCB0byByZWR1Y2VGdW5jLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIGZpbmFsIHJlZHVjZWQgdmFsdWVcblx0ICovXG5cdGZ1bmN0aW9uIHJlZHVjZShwcm9taXNlLCByZWR1Y2VGdW5jIC8qLCBpbml0aWFsVmFsdWUgKi8pIHtcblx0XHR2YXIgYXJncyA9IGZjYWxsKHNsaWNlLCBhcmd1bWVudHMsIDEpO1xuXG5cdFx0cmV0dXJuIHdoZW4ocHJvbWlzZSwgZnVuY3Rpb24oYXJyYXkpIHtcblx0XHRcdHZhciB0b3RhbDtcblxuXHRcdFx0dG90YWwgPSBhcnJheS5sZW5ndGg7XG5cblx0XHRcdC8vIFdyYXAgdGhlIHN1cHBsaWVkIHJlZHVjZUZ1bmMgd2l0aCBvbmUgdGhhdCBoYW5kbGVzIHByb21pc2VzIGFuZCB0aGVuXG5cdFx0XHQvLyBkZWxlZ2F0ZXMgdG8gdGhlIHN1cHBsaWVkLlxuXHRcdFx0YXJnc1swXSA9IGZ1bmN0aW9uIChjdXJyZW50LCB2YWwsIGkpIHtcblx0XHRcdFx0cmV0dXJuIHdoZW4oY3VycmVudCwgZnVuY3Rpb24gKGMpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbih2YWwsIGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlZHVjZUZ1bmMoYywgdmFsdWUsIGksIHRvdGFsKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gcmVkdWNlQXJyYXkuYXBwbHkoYXJyYXksIGFyZ3MpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gU25hcHNob3Qgc3RhdGVzXG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmdWxmaWxsZWQgc3RhdGUgc25hcHNob3Rcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB4IGFueSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7e3N0YXRlOidmdWxmaWxsZWQnLHZhbHVlOip9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9GdWxmaWxsZWRTdGF0ZSh4KSB7XG5cdFx0cmV0dXJuIHsgc3RhdGU6ICdmdWxmaWxsZWQnLCB2YWx1ZTogeCB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSByZWplY3RlZCBzdGF0ZSBzbmFwc2hvdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHggYW55IHJlYXNvblxuXHQgKiBAcmV0dXJucyB7e3N0YXRlOidyZWplY3RlZCcscmVhc29uOip9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9SZWplY3RlZFN0YXRlKHgpIHtcblx0XHRyZXR1cm4geyBzdGF0ZTogJ3JlamVjdGVkJywgcmVhc29uOiB4IH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHBlbmRpbmcgc3RhdGUgc25hcHNob3Rcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMge3tzdGF0ZToncGVuZGluZyd9fVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9QZW5kaW5nU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHsgc3RhdGU6ICdwZW5kaW5nJyB9O1xuXHR9XG5cblx0Ly9cblx0Ly8gSW50ZXJuYWxzLCB1dGlsaXRpZXMsIGV0Yy5cblx0Ly9cblxuXHR2YXIgcHJvbWlzZVByb3RvdHlwZSwgbWFrZVByb21pc2VQcm90b3R5cGUsIHJlZHVjZUFycmF5LCBzbGljZSwgZmNhbGwsIG5leHRUaWNrLCBoYW5kbGVyUXVldWUsXG5cdFx0ZnVuY1Byb3RvLCBjYWxsLCBhcnJheVByb3RvLCBtb25pdG9yQXBpLFxuXHRcdGNhcHR1cmVkU2V0VGltZW91dCwgY2pzUmVxdWlyZSwgTXV0YXRpb25PYnMsIHVuZGVmO1xuXG5cdGNqc1JlcXVpcmUgPSByZXF1aXJlO1xuXG5cdC8vXG5cdC8vIFNoYXJlZCBoYW5kbGVyIHF1ZXVlIHByb2Nlc3Npbmdcblx0Ly9cblx0Ly8gQ3JlZGl0IHRvIFR3aXNvbCAoaHR0cHM6Ly9naXRodWIuY29tL1R3aXNvbCkgZm9yIHN1Z2dlc3Rpbmdcblx0Ly8gdGhpcyB0eXBlIG9mIGV4dGVuc2libGUgcXVldWUgKyB0cmFtcG9saW5lIGFwcHJvYWNoIGZvclxuXHQvLyBuZXh0LXRpY2sgY29uZmxhdGlvbi5cblxuXHRoYW5kbGVyUXVldWUgPSBbXTtcblxuXHQvKipcblx0ICogRW5xdWV1ZSBhIHRhc2suIElmIHRoZSBxdWV1ZSBpcyBub3QgY3VycmVudGx5IHNjaGVkdWxlZCB0byBiZVxuXHQgKiBkcmFpbmVkLCBzY2hlZHVsZSBpdC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gdGFza1xuXHQgKi9cblx0ZnVuY3Rpb24gZW5xdWV1ZSh0YXNrKSB7XG5cdFx0aWYoaGFuZGxlclF1ZXVlLnB1c2godGFzaykgPT09IDEpIHtcblx0XHRcdG5leHRUaWNrKGRyYWluUXVldWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEcmFpbiB0aGUgaGFuZGxlciBxdWV1ZSBlbnRpcmVseSwgYmVpbmcgY2FyZWZ1bCB0byBhbGxvdyB0aGVcblx0ICogcXVldWUgdG8gYmUgZXh0ZW5kZWQgd2hpbGUgaXQgaXMgYmVpbmcgcHJvY2Vzc2VkLCBhbmQgdG8gY29udGludWVcblx0ICogcHJvY2Vzc2luZyB1bnRpbCBpdCBpcyB0cnVseSBlbXB0eS5cblx0ICovXG5cdGZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG5cdFx0cnVuSGFuZGxlcnMoaGFuZGxlclF1ZXVlKTtcblx0XHRoYW5kbGVyUXVldWUgPSBbXTtcblx0fVxuXG5cdC8vIEFsbG93IGF0dGFjaGluZyB0aGUgbW9uaXRvciB0byB3aGVuKCkgaWYgZW52IGhhcyBubyBjb25zb2xlXG5cdG1vbml0b3JBcGkgPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgPyBjb25zb2xlIDogd2hlbjtcblxuXHQvLyBTbmlmZiBcImJlc3RcIiBhc3luYyBzY2hlZHVsaW5nIG9wdGlvblxuXHQvLyBQcmVmZXIgcHJvY2Vzcy5uZXh0VGljayBvciBNdXRhdGlvbk9ic2VydmVyLCB0aGVuIGNoZWNrIGZvclxuXHQvLyB2ZXJ0eCBhbmQgZmluYWxseSBmYWxsIGJhY2sgdG8gc2V0VGltZW91dFxuXHQvKmdsb2JhbCBwcm9jZXNzLGRvY3VtZW50LHNldFRpbWVvdXQsTXV0YXRpb25PYnNlcnZlcixXZWJLaXRNdXRhdGlvbk9ic2VydmVyKi9cblx0aWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG5cdFx0bmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuXHR9IGVsc2UgaWYoTXV0YXRpb25PYnMgPVxuXHRcdCh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBNdXRhdGlvbk9ic2VydmVyKSB8fFxuXHRcdFx0KHR5cGVvZiBXZWJLaXRNdXRhdGlvbk9ic2VydmVyID09PSAnZnVuY3Rpb24nICYmIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIpKSB7XG5cdFx0bmV4dFRpY2sgPSAoZnVuY3Rpb24oZG9jdW1lbnQsIE11dGF0aW9uT2JzZXJ2ZXIsIGRyYWluUXVldWUpIHtcblx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIoZHJhaW5RdWV1ZSkub2JzZXJ2ZShlbCwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGVsLnNldEF0dHJpYnV0ZSgneCcsICd4Jyk7XG5cdFx0XHR9O1xuXHRcdH0oZG9jdW1lbnQsIE11dGF0aW9uT2JzLCBkcmFpblF1ZXVlKSk7XG5cdH0gZWxzZSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIHZlcnQueCAxLnggfHwgMi54XG5cdFx0XHRuZXh0VGljayA9IGNqc1JlcXVpcmUoJ3ZlcnR4JykucnVuT25Mb29wIHx8IGNqc1JlcXVpcmUoJ3ZlcnR4JykucnVuT25Db250ZXh0O1xuXHRcdH0gY2F0Y2goaWdub3JlKSB7XG5cdFx0XHQvLyBjYXB0dXJlIHNldFRpbWVvdXQgdG8gYXZvaWQgYmVpbmcgY2F1Z2h0IGJ5IGZha2UgdGltZXJzXG5cdFx0XHQvLyB1c2VkIGluIHRpbWUgYmFzZWQgdGVzdHNcblx0XHRcdGNhcHR1cmVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG5cdFx0XHRuZXh0VGljayA9IGZ1bmN0aW9uKHQpIHsgY2FwdHVyZWRTZXRUaW1lb3V0KHQsIDApOyB9O1xuXHRcdH1cblx0fVxuXG5cdC8vXG5cdC8vIENhcHR1cmUvcG9seWZpbGwgZnVuY3Rpb24gYW5kIGFycmF5IHV0aWxzXG5cdC8vXG5cblx0Ly8gU2FmZSBmdW5jdGlvbiBjYWxsc1xuXHRmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cdGNhbGwgPSBmdW5jUHJvdG8uY2FsbDtcblx0ZmNhbGwgPSBmdW5jUHJvdG8uYmluZFxuXHRcdD8gY2FsbC5iaW5kKGNhbGwpXG5cdFx0OiBmdW5jdGlvbihmLCBjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm4gZi5hcHBseShjb250ZXh0LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMikpO1xuXHRcdH07XG5cblx0Ly8gU2FmZSBhcnJheSBvcHNcblx0YXJyYXlQcm90byA9IFtdO1xuXHRzbGljZSA9IGFycmF5UHJvdG8uc2xpY2U7XG5cblx0Ly8gRVM1IHJlZHVjZSBpbXBsZW1lbnRhdGlvbiBpZiBuYXRpdmUgbm90IGF2YWlsYWJsZVxuXHQvLyBTZWU6IGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDE1LjQuNC4yMSBhcyB0aGVyZSBhcmUgbWFueVxuXHQvLyBzcGVjaWZpY3MgYW5kIGVkZ2UgY2FzZXMuICBFUzUgZGljdGF0ZXMgdGhhdCByZWR1Y2UubGVuZ3RoID09PSAxXG5cdC8vIFRoaXMgaW1wbGVtZW50YXRpb24gZGV2aWF0ZXMgZnJvbSBFUzUgc3BlYyBpbiB0aGUgZm9sbG93aW5nIHdheXM6XG5cdC8vIDEuIEl0IGRvZXMgbm90IGNoZWNrIGlmIHJlZHVjZUZ1bmMgaXMgYSBDYWxsYWJsZVxuXHRyZWR1Y2VBcnJheSA9IGFycmF5UHJvdG8ucmVkdWNlIHx8XG5cdFx0ZnVuY3Rpb24ocmVkdWNlRnVuYyAvKiwgaW5pdGlhbFZhbHVlICovKSB7XG5cdFx0XHQvKmpzaGludCBtYXhjb21wbGV4aXR5OiA3Ki9cblx0XHRcdHZhciBhcnIsIGFyZ3MsIHJlZHVjZWQsIGxlbiwgaTtcblxuXHRcdFx0aSA9IDA7XG5cdFx0XHRhcnIgPSBPYmplY3QodGhpcyk7XG5cdFx0XHRsZW4gPSBhcnIubGVuZ3RoID4+PiAwO1xuXHRcdFx0YXJncyA9IGFyZ3VtZW50cztcblxuXHRcdFx0Ly8gSWYgbm8gaW5pdGlhbFZhbHVlLCB1c2UgZmlyc3QgaXRlbSBvZiBhcnJheSAod2Uga25vdyBsZW5ndGggIT09IDAgaGVyZSlcblx0XHRcdC8vIGFuZCBhZGp1c3QgaSB0byBzdGFydCBhdCBzZWNvbmQgaXRlbVxuXHRcdFx0aWYoYXJncy5sZW5ndGggPD0gMSkge1xuXHRcdFx0XHQvLyBTa2lwIHRvIHRoZSBmaXJzdCByZWFsIGVsZW1lbnQgaW4gdGhlIGFycmF5XG5cdFx0XHRcdGZvcig7Oykge1xuXHRcdFx0XHRcdGlmKGkgaW4gYXJyKSB7XG5cdFx0XHRcdFx0XHRyZWR1Y2VkID0gYXJyW2krK107XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJZiB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGFycmF5IHdpdGhvdXQgZmluZGluZyBhbnkgcmVhbFxuXHRcdFx0XHRcdC8vIGVsZW1lbnRzLCBpdCdzIGEgVHlwZUVycm9yXG5cdFx0XHRcdFx0aWYoKytpID49IGxlbikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSWYgaW5pdGlhbFZhbHVlIHByb3ZpZGVkLCB1c2UgaXRcblx0XHRcdFx0cmVkdWNlZCA9IGFyZ3NbMV07XG5cdFx0XHR9XG5cblx0XHRcdC8vIERvIHRoZSBhY3R1YWwgcmVkdWNlXG5cdFx0XHRmb3IoO2kgPCBsZW47ICsraSkge1xuXHRcdFx0XHRpZihpIGluIGFycikge1xuXHRcdFx0XHRcdHJlZHVjZWQgPSByZWR1Y2VGdW5jKHJlZHVjZWQsIGFycltpXSwgaSwgYXJyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVkdWNlZDtcblx0XHR9O1xuXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcblx0XHRyZXR1cm4geDtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyYXNoKGZhdGFsRXJyb3IpIHtcblx0XHRpZih0eXBlb2YgbW9uaXRvckFwaS5yZXBvcnRVbmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdG1vbml0b3JBcGkucmVwb3J0VW5oYW5kbGVkKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVucXVldWUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGZhdGFsRXJyb3I7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aHJvdyBmYXRhbEVycm9yO1xuXHR9XG5cblx0cmV0dXJuIHdoZW47XG59KTtcbn0pKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSA6IGZ1bmN0aW9uIChmYWN0b3J5KSB7IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKTsgfSk7XG4iLCIvLyBCRUdJTiBPQkpFQ1RcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIEFwaU9iamVjdCA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29udmVydEl0ZW0ocmF3KSB7XHJcbiAgICAgICAgcmV0dXJuIEFwaU9iamVjdC5jcmVhdGUodGhpcy5pdGVtVHlwZSwgcmF3LCB0aGlzLmFwaSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhLCBhcGksIGl0ZW1UeXBlKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIEFwaU9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSBpdGVtVHlwZTtcclxuICAgICAgICBpZiAoIWRhdGEpIGRhdGEgPSB7fTtcclxuICAgICAgICBpZiAoIWRhdGEuaXRlbXMpIHRoaXMucHJvcChcIml0ZW1zXCIsIGRhdGEuaXRlbXMgPSBbXSk7XHJcbiAgICAgICAgaWYgKGRhdGEuaXRlbXMubGVuZ3RoID4gMCkgdGhpcy5hZGQoZGF0YS5pdGVtcywgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5vbignc3luYycsIGZ1bmN0aW9uIChyYXcpIHtcclxuICAgICAgICAgICAgaWYgKHJhdyAmJiByYXcuaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlQWxsKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZChyYXcuaXRlbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB1dGlscy5leHRlbmQobmV3IEFwaU9iamVjdCgpLCB7XHJcbiAgICAgICAgaXNDb2xsZWN0aW9uOiB0cnVlLFxyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IsXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbiAobmV3SXRlbXMsIC8qcHJpdmF0ZSovIG5vVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5nZXRUeXBlKG5ld0l0ZW1zKSAhPT0gXCJBcnJheVwiKSBuZXdJdGVtcyA9IFtuZXdJdGVtc107XHJcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMsIHV0aWxzLm1hcChuZXdJdGVtcywgY29udmVydEl0ZW0sIHRoaXMpKTtcclxuICAgICAgICAgICAgaWYgKCFub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJhd0l0ZW1zID0gdGhpcy5wcm9wKFwiaXRlbXNcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3AoXCJpdGVtc1wiLCByYXdJdGVtcy5jb25jYXQobmV3SXRlbXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaW5kZXhPckl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPckl0ZW07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXhPckl0ZW0gIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gdXRpbHMuaW5kZXhPZih0aGlzLCBpbmRleE9ySXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5jYWxsKHRoaXMsIGluZGV4LCAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uKG5ld0l0ZW1zLCBub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KHRoaXMsIFswLCB0aGlzLmxlbmd0aF0uY29uY2F0KHV0aWxzLm1hcChuZXdJdGVtcywgY29udmVydEl0ZW0sIHRoaXMpKSk7XHJcbiAgICAgICAgICAgIGlmICghbm9VcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcChcIml0ZW1zXCIsIG5ld0l0ZW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlQWxsOiBmdW5jdGlvbihub1VwZGF0ZSkge1xyXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwodGhpcywgMCwgdGhpcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAoIW5vVXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3AoXCJpdGVtc1wiLCBbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEluZGV4OiBmdW5jdGlvbiAobmV3SW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jdXJyZW50SW5kZXg7XHJcbiAgICAgICAgICAgIGlmICghaW5kZXggJiYgaW5kZXggIT09IDApIGluZGV4ID0gdGhpcy5wcm9wKFwic3RhcnRJbmRleFwiKTtcclxuICAgICAgICAgICAgaWYgKCFpbmRleCAmJiBpbmRleCAhPT0gMCkgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRJbmRleDogZnVuY3Rpb24obmV3SW5kZXgsIHJlcSkge1xyXG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMuZ2V0KHV0aWxzLmV4dGVuZChyZXEsIHsgc3RhcnRJbmRleDogbmV3SW5kZXh9KSk7XHJcbiAgICAgICAgICAgIHAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBtZS5jdXJyZW50SW5kZXggPSBuZXdJbmRleDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmlyc3RQYWdlOiBmdW5jdGlvbihyZXEpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoKTtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJbmRleCA9PT0gMCkgdGhyb3cgXCJUaGlzIFwiICsgdGhpcy50eXBlICsgXCIgY29sbGVjdGlvbiBpcyBhbHJlYWR5IGF0IHJlY29yZCAwIGFuZCBoYXMgbm8gcHJldmlvdXMgcGFnZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SW5kZXgoMCwgcmVxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZQYWdlOiBmdW5jdGlvbiAocmVxKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmdldEluZGV4KCksXHJcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZSA9IHRoaXMucHJvcChcInBhZ2VTaXplXCIpLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSBNYXRoLm1heChjdXJyZW50SW5kZXggLSBwYWdlU2l6ZSwgMCk7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50SW5kZXggPT09IDApIHRocm93IFwiVGhpcyBcIiArIHRoaXMudHlwZSArIFwiIGNvbGxlY3Rpb24gaXMgYWxyZWFkeSBhdCByZWNvcmQgMCBhbmQgaGFzIG5vIHByZXZpb3VzIHBhZ2UuXCI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEluZGV4KG5ld0luZGV4LCByZXEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dFBhZ2U6IGZ1bmN0aW9uIChyZXEpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuZ2V0SW5kZXgoKSxcclxuICAgICAgICAgICAgICAgIHBhZ2VTaXplID0gdGhpcy5wcm9wKFwicGFnZVNpemVcIiksXHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCA9IGN1cnJlbnRJbmRleCArIHBhZ2VTaXplO1xyXG4gICAgICAgICAgICBpZiAoIShuZXdJbmRleCA8IHRoaXMucHJvcChcInRvdGFsQ291bnRcIikpKSB0aHJvdyBcIlRoaXMgXCIgKyB0aGlzLnR5cGUgKyBcIiBjb2xsZWN0aW9uIGlzIGFscmVhZHkgYXQgaXRzIGxhc3QgcGFnZSBhbmQgaGFzIG5vIG5leHQgcGFnZS5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SW5kZXgobmV3SW5kZXgsIHJlcSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXN0UGFnZTogZnVuY3Rpb24gKHJlcSkge1xyXG4gICAgICAgICAgICB2YXIgdG90YWxDb3VudCA9IHRoaXMucHJvcChcInRvdGFsQ291bnRcIiksXHJcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZSA9IHRoaXMucHJvcChcInBhZ2VTaXplXCIpLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSB0b3RhbENvdW50IC0gcGFnZVNpemU7XHJcbiAgICAgICAgICAgIGlmIChuZXdJbmRleCA8PSAwKSB0aHJvdyBcIlRoaXMgXCIgKyB0aGlzLnR5cGUgKyBcIiBjb2xsZWN0aW9uIGhhcyBvbmx5IG9uZSBwYWdlLlwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRJbmRleChuZXdJbmRleCwgcmVxKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IudHlwZXMgPSB7XHJcbiAgICAgICAgbG9jYXRpb25zOiByZXF1aXJlKCcuL3R5cGVzL2xvY2F0aW9ucycpXHJcbiAgICB9O1xyXG4gICAgQXBpQ29sbGVjdGlvbkNvbnN0cnVjdG9yLmh5ZHJhdGVkVHlwZXMgPSB7fTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IuZ2V0SHlkcmF0ZWRUeXBlID0gQXBpT2JqZWN0LmdldEh5ZHJhdGVkVHlwZTtcclxuXHJcbiAgICBBcGlDb2xsZWN0aW9uQ29uc3RydWN0b3IuY3JlYXRlID0gZnVuY3Rpb24gKHR5cGUsIGRhdGEsIGFwaSwgaXRlbVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gbmV3ICh0eXBlIGluIHRoaXMudHlwZXMgPyB0aGlzLnR5cGVzW3R5cGVdIDogdGhpcykodHlwZSwgZGF0YSwgYXBpLCBpdGVtVHlwZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3Rvci5jcmVhdGUgPSBmdW5jdGlvbiAodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgaXRlbVR5cGUpIHtcclxuICAgICAgICB2YXIgQXBpQ29sbGVjdGlvblR5cGUgPSB0aGlzLmdldEh5ZHJhdGVkVHlwZSh0eXBlTmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgQXBpQ29sbGVjdGlvblR5cGUodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgaXRlbVR5cGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFwaUNvbGxlY3Rpb25Db25zdHJ1Y3RvcjtcclxuXHJcbi8vIEVORCBPQkpFQ1RcclxuXHJcbi8qKioqKioqKioqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIERFRkFVTFRfV0lTSExJU1RfTkFNRTogJ215X3dpc2hsaXN0JyxcclxuICAgIFBBWU1FTlRfU1RBVFVTRVM6IHtcclxuICAgICAgICBORVc6IFwiTmV3XCJcclxuICAgIH0sXHJcbiAgICBQQVlNRU5UX0FDVElPTlM6IHtcclxuICAgICAgICBWT0lEOiBcIlZvaWRQYXltZW50XCJcclxuICAgIH0sXHJcbiAgICBPUkRFUl9TVEFUVVNFUzoge1xyXG4gICAgICAgIEFCQU5ET05FRDogXCJBYmFuZG9uZWRcIixcclxuICAgICAgICBBQ0NFUFRFRDogXCJBY2NlcHRlZFwiLFxyXG4gICAgICAgIENBTkNFTExFRDogXCJDYW5jZWxsZWRcIixcclxuICAgICAgICBDT01QTEVURUQ6IFwiQ29tcGxldGVkXCIsXHJcbiAgICAgICAgQ1JFQVRFRDogXCJDcmVhdGVkXCIsXHJcbiAgICAgICAgUEVORElOR19SRVZJRVc6IFwiUGVuZGluZ1Jldmlld1wiLFxyXG4gICAgICAgIFBST0NFU1NJTkc6IFwiUHJvY2Vzc2luZ1wiLFxyXG4gICAgICAgIFNVQk1JVFRFRDogXCJTdWJtaXR0ZWRcIixcclxuICAgICAgICBWQUxJREFURUQ6IFwiVmFsaWRhdGVkXCJcclxuICAgIH0sXHJcbiAgICBPUkRFUl9BQ1RJT05TOiB7XHJcbiAgICAgICAgQ1JFQVRFX09SREVSOiBcIkNyZWF0ZU9yZGVyXCIsXHJcbiAgICAgICAgU1VCTUlUX09SREVSOiBcIlN1Ym1pdE9yZGVyXCIsXHJcbiAgICAgICAgQUNDRVBUX09SREVSOiBcIkFjY2VwdE9yZGVyXCIsXHJcbiAgICAgICAgVkFMSURBVEVfT1JERVI6IFwiVmFsaWRhdGVPcmRlclwiLFxyXG4gICAgICAgIFNFVF9PUkRFUl9BU19QUk9DRVNTSU5HOiBcIlNldE9yZGVyQXNQcm9jZXNzaW5nXCIsXHJcbiAgICAgICAgQ09NUExFVEVfT1JERVI6IFwiQ29tcGxldGVPcmRlclwiLFxyXG4gICAgICAgIENBTkNFTF9PUkRFUjogXCJDYW5jZWxPcmRlclwiLFxyXG4gICAgICAgIFJFT1BFTl9PUkRFUjogXCJSZW9wZW5PcmRlclwiXHJcbiAgICB9LFxyXG4gICAgRlVMRklMTE1FTlRfTUVUSE9EUzoge1xyXG4gICAgICAgIFNISVA6IFwiU2hpcFwiLFxyXG4gICAgICAgIFBJQ0tVUDogXCJQaWNrdXBcIlxyXG4gICAgfVxyXG59O1xyXG4iLCIvLyBCRUdJTiBDT05URVhUXHJcbi8qKlxyXG4gKiBAY2xhc3NcclxuICogQGNsYXNzZGVzYyBUaGUgY29udGV4dCBvYmplY3QgaGVscHMgeW91IGNvbmZpZ3VyZSB0aGUgU0RLIHRvIGNvbm5lY3QgdG8gYSBwYXJ0aWN1bGFyIE1venUgc2l0ZS4gU3VwcGx5IGl0IHdpdGggdGVuYW50LCBzaXRlLCBtYXN0ZXJjYXRhbG9nLCBjdXJyZW5jeSBjb2RlLCBsb2NhbGUgY29kZSwgYXBwIGNsYWltcywgYW5kIHVzZXIgY2xhaW1zLCBhbmQgIGl0IHdpbGwgcHJvZHVjZSBmb3IgeW91IGFuIEFwaUludGVyZmFjZSBvYmplY3QuXHJcbiAqL1xyXG5cclxudmFyIEFwaUludGVyZmFjZSA9IHJlcXVpcmUoJy4vaW50ZXJmYWNlJyk7XHJcbnZhciBBcGlSZWZlcmVuY2UgPSByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG4vKipcclxuICogQHByaXZhdGVcclxuICovXHJcbnZhciBBcGlDb250ZXh0Q29uc3RydWN0b3IgPSBmdW5jdGlvbihjb25mKSB7XHJcbiAgICB1dGlscy5leHRlbmQodGhpcywgY29uZik7XHJcbn0sXHJcbiAgICBtdXRhYmxlQWNjZXNzb3JzID0gWydhcHAtY2xhaW1zJywgJ3VzZXItY2xhaW1zJywgJ2NhbGxjaGFpbicsICdjdXJyZW5jeScsICdsb2NhbGUnXSwgLy8sICdieXBhc3MtY2FjaGUnXSxcclxuICAgIGltbXV0YWJsZUFjY2Vzc29ycyA9IFsndGVuYW50JywgJ3NpdGUnLCAnbWFzdGVyLWNhdGFsb2cnXSxcclxuICAgIGltbXV0YWJsZUFjY2Vzc29yTGVuZ3RoID0gaW1tdXRhYmxlQWNjZXNzb3JzLmxlbmd0aCxcclxuICAgIGFsbEFjY2Vzc29ycyA9IG11dGFibGVBY2Nlc3NvcnMuY29uY2F0KGltbXV0YWJsZUFjY2Vzc29ycyksXHJcbiAgICBhbGxBY2Nlc3NvcnNMZW5ndGggPSBhbGxBY2Nlc3NvcnMubGVuZ3RoLFxyXG4gICAgajtcclxuXHJcbnZhciBzZXRJbW11dGFibGVBY2Nlc3NvciA9IGZ1bmN0aW9uKHByb3BOYW1lKSB7XHJcbiAgICBBcGlDb250ZXh0Q29uc3RydWN0b3IucHJvdG90eXBlW3V0aWxzLmNhbWVsQ2FzZShwcm9wTmFtZSwgdHJ1ZSldID0gZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpc1twcm9wTmFtZV07XHJcbiAgICAgICAgdmFyIG5ld0NvbmYgPSB0aGlzLmFzT2JqZWN0KCk7XHJcbiAgICAgICAgbmV3Q29uZltwcm9wTmFtZV0gPSB2YWw7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBBcGlDb250ZXh0Q29uc3RydWN0b3IobmV3Q29uZik7XHJcbiAgICB9O1xyXG59O1xyXG5cclxudmFyIHNldE11dGFibGVBY2Nlc3NvciA9IGZ1bmN0aW9uKHByb3BOYW1lKSB7XHJcbiAgICBBcGlDb250ZXh0Q29uc3RydWN0b3IucHJvdG90eXBlW3V0aWxzLmNhbWVsQ2FzZShwcm9wTmFtZSwgdHJ1ZSldID0gZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpc1twcm9wTmFtZV07XHJcbiAgICAgICAgdGhpc1twcm9wTmFtZV0gPSB2YWw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuQXBpQ29udGV4dENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IHtcclxuICAgIGNvbnN0cnVjdG9yOiBBcGlDb250ZXh0Q29uc3RydWN0b3IsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIG9yIGNyZWF0ZXMgdGhlIGBBcGlJbnRlcmZhY2VgIGZvciB0aGlzIGNvbnRleHQgdGhhdCB3aWxsIGRvIGFsbCB0aGUgcmVhbCB3b3JrLlxyXG4gICAgICogQ2FsbCB0aGlzIG1ldGhvZCBvbmx5IHdoZW4geW91J3ZlIGJ1aWx0IGEgY29tcGxldGUgY29udGV4dCBpbmNsdWRpbmcgdGVuYW50LCBzaXRlLCBtYXN0ZXIgY2F0YWxvZyxcclxuICAgICAqIGxvY2FsZSwgY3VycmVuY3kgY29kZSwgYXBwIGNsYWltcywgYW5kIHVzZXIgY2xhaW1zLiBBc3NpZ24gaXRzIHJldHVybiB2YWx1ZSB0byBhIGxvY2FsIHZhcmlhYmxlLlxyXG4gICAgICogWW91J2xsIHVzZSB0aGlzIGludGVyZmFjZSBvYmplY3QgdG8gY3JlYXRlIHlvdXIgYEFwaU9iamVjdGBzIGFuZCBkbyBBUEkgcmVxdWVzdHMhXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEFwaUNvbnRleHQjXHJcbiAgICAgKiBAcmV0dXJucyB7QXBpSW50ZXJmYWNlfSBUaGUgc2luZ2xlIGBBcGlJbnRlcmZhY2VgIGZvciB0aGlzIGNvbnRleHQuXHJcbiAgICAgKiBAdGhyb3dzIHtSZWZlcmVuY2VFcnJvcn0gaWYgdGhlIGNvbnRleHQgaXMgbm90IHlldCBjb21wbGV0ZS5cclxuICAgICAqL1xyXG4gICAgYXBpOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYXBpSW5zdGFuY2UgfHwgKHRoaXMuX2FwaUluc3RhbmNlID0gbmV3IEFwaUludGVyZmFjZSh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgU3RvcmU6IGZ1bmN0aW9uKGNvbmYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEFwaUNvbnRleHRDb25zdHJ1Y3Rvcihjb25mKTtcclxuICAgIH0sXHJcbiAgICBhc09iamVjdDogZnVuY3Rpb24ocHJlZml4KSB7XHJcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xyXG4gICAgICAgIHByZWZpeCA9IHByZWZpeCB8fCAnJztcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbEFjY2Vzc29yc0xlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIG9ialtwcmVmaXggKyBhbGxBY2Nlc3NvcnNbaV1dID0gdGhpc1thbGxBY2Nlc3NvcnNbaV1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgfSxcclxuICAgIHNldFNlcnZpY2VVcmxzOiBmdW5jdGlvbih1cmxzKSB7XHJcbiAgICAgICAgQXBpUmVmZXJlbmNlLnVybHMgPSB1cmxzO1xyXG4gICAgfSxcclxuICAgIGdldFNlcnZpY2VVcmxzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdXRpbHMuZXh0ZW5kKHt9LCBBcGlSZWZlcmVuY2UudXJscyk7XHJcbiAgICB9LFxyXG4gICAgY3VycmVuY3k6ICd1c2QnLFxyXG4gICAgbG9jYWxlOiAnZW4tVVMnXHJcbn07XHJcblxyXG5mb3IgKGogPSAwOyBqIDwgaW1tdXRhYmxlQWNjZXNzb3JzLmxlbmd0aDsgaisrKSBzZXRJbW11dGFibGVBY2Nlc3NvcihpbW11dGFibGVBY2Nlc3NvcnNbal0pO1xyXG5mb3IgKGogPSAwOyBqIDwgbXV0YWJsZUFjY2Vzc29ycy5sZW5ndGg7IGorKykgc2V0TXV0YWJsZUFjY2Vzc29yKG11dGFibGVBY2Nlc3NvcnNbal0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcGlDb250ZXh0Q29uc3RydWN0b3I7XHJcblxyXG4vLyBFTkQgQ09OVEVYVFxyXG5cclxuLyoqKioqKioqLyIsIi8vIEJFR0lOIEVSUk9SU1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBlcnJvclRvU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubmFtZSArIFwiOiBcIiArIHRoaXMubWVzc2FnZTtcclxufVxyXG5cclxudmFyIGVycm9yVHlwZXMgPSB7fTtcclxuXHJcbnZhciBlcnJvcnMgPSB7XHJcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oY29kZSwgbWVzc2FnZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29kZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGNvZGUpIHtcclxuICAgICAgICAgICAgICAgIGVycm9ycy5yZWdpc3RlcihpLCBjb2RlW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVycm9yVHlwZXNbY29kZV0gPSB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKGNvZGUpIHtcclxuICAgICAgICB2YXIgbXNnID0gdXRpbHMuZm9ybWF0U3RyaW5nLmFwcGx5KHV0aWxzLCBbZXJyb3JUeXBlc1tjb2RlXS5tZXNzYWdlXS5jb25jYXQodXRpbHMuc2xpY2UoYXJndW1lbnRzLCAxKSkpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IGNvZGUsXHJcbiAgICAgICAgICAgIGxldmVsOiAxLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBtc2csXHJcbiAgICAgICAgICAgIGh0bWxNZXNzYWdlOiBtc2csXHJcbiAgICAgICAgICAgIHRvU3RyaW5nOiBlcnJvclRvU3RyaW5nXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICB0aHJvd09uT2JqZWN0OiBmdW5jdGlvbihvYmosIGNvZGUpIHtcclxuICAgICAgICB2YXIgZXJyb3IgPSBlcnJvcnMuY3JlYXRlLmFwcGx5KGVycm9ycywgW2NvZGVdLmNvbmNhdCh1dGlscy5zbGljZShhcmd1bWVudHMsIDIpKSk7XHJcbiAgICAgICAgb2JqLmZpcmUoJ2Vycm9yJywgZXJyb3IpO1xyXG4gICAgICAgIG9iai5hcGkuZmlyZSgnZXJyb3InLCBlcnJvciwgb2JqKTtcclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH0sXHJcbiAgICBwYXNzRnJvbTogZnVuY3Rpb24oZnJvbSwgdG8pIHtcclxuICAgICAgICBmcm9tLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0by5maXJlLmFwcGx5KHRvLCBbJ2Vycm9yJ10uY29uY2F0KHV0aWxzLnNsaWNlKGFyZ3VtZW50cykpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXJyb3JzO1xyXG4vLyBFTkQgRVJST1JTIiwiLy8gQkVHSU4gSU5JVFxyXG52YXIgQXBpQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dCcpO1xyXG52YXIgaW5pdGlhbEdsb2JhbENvbnRleHQgPSBuZXcgQXBpQ29udGV4dCgpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRpYWxHbG9iYWxDb250ZXh0O1xyXG4vLyBFTkQgSU5JVCIsIi8vIEVYUE9TRSBERUJVR0dJTkcgU1RVRkZcclxudmFyIF9pbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XHJcblxyXG5faW5pdC5VdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxuX2luaXQuQXBpQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dCcpO1xyXG5faW5pdC5BcGlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL2ludGVyZmFjZScpO1xyXG5faW5pdC5BcGlPYmplY3QgPSByZXF1aXJlKCcuL29iamVjdCcpO1xyXG5faW5pdC5BcGlDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9uJyk7XHJcbl9pbml0LkFwaVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vcmVmZXJlbmNlJyk7XHJcblxyXG5faW5pdC5fZXhwb3NlID0gZnVuY3Rpb24gKHIpIHtcclxuICAgIF9pbml0Lmxhc3RSZXN1bHQgPSByO1xyXG4gICAgY29uc29sZS5sb2cociAmJiByLmluc3BlY3QgPyByLmluc3BlY3QoKSA6IHIpO1xyXG59O1xyXG5cclxuX2luaXQuQXBpT2JqZWN0LnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSwgdHJ1ZSwgMik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IF9pbml0OyIsIi8qKlxyXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vY3Vqb2pzL3doZW4vYmxvYi9tYXN0ZXIvZG9jcy9hcGkubWQjcHJvbWlzZSBXaGVuSlMvUHJvbWlzZX1cclxuICovXHJcblxyXG4vKipcclxuICogQXR0YWNoIGhhbmRsZXJzIHRvIGFuZCB0cmFuc2Zvcm0gdGhlIHByb21pc2UuXHJcbiAqIEBmdW5jdGlvbiBleHRlcm5hbDpQcm9taXNlI3RoZW5cclxuICogQHJldHVybnMgZXh0ZXJuYWw6UHJvbWlzZSNcclxuICovXHJcblxyXG4vLyBCRUdJTiBJTlRFUkZBQ0VcclxuLyoqXHJcbiAqIEBjbGFzc1xyXG4gKiBAY2xhc3NkZXNjIFRoZSBpbnRlcmZhY2Ugb2JqZWN0IG1ha2VzIHJlcXVlc3RzIHRvIHRoZSBBUEkgYW5kIHJldHVybnMgQVBJIG9iamVjdC4gWW91IGNhbiB1c2UgaXQgdG8gbWFrZSByYXcgcmVxdWVzdHMgdXNpbmcgdGhlIEFwaUludGVyZmFjZSNyZXF1ZXN0IG1ldGhvZCwgYnV0IHlvdSdyZSBtb3JlIGxpa2VseSB0byB1c2UgdGhlIEFwaUludGVyZmFjZSNhY3Rpb24gbWV0aG9kIHRvIGNyZWF0ZSBhIGV4dGVybmFsOlByb21pc2UjIHRoYXQgcmV0dXJucyBhbiBBcGlPYmplY3QjLlxyXG4gKi9cclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgQXBpUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9yZWZlcmVuY2UnKTtcclxudmFyIEFwaU9iamVjdCA9IHJlcXVpcmUoJy4vb2JqZWN0Jyk7XHJcblxyXG52YXIgZXJyb3JNZXNzYWdlID0gXCJObyB7MH0gd2FzIHNwZWNpZmllZC4gUnVuIE1venUuVGVuYW50KHRlbmFudElkKS5NYXN0ZXJDYXRhbG9nKG1hc3RlckNhdGFsb2dJZCkuU2l0ZShzaXRlSWQpLlwiLFxyXG4gICAgcmVxdWlyZWRDb250ZXh0VmFsdWVzID0gWydUZW5hbnQnLCAnTWFzdGVyQ2F0YWxvZycsICdTaXRlJ107XHJcbnZhciBBcGlJbnRlcmZhY2VDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXF1aXJlZENvbnRleHRWYWx1ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBpZiAoY29udGV4dFtyZXF1aXJlZENvbnRleHRWYWx1ZXNbaV1dKCkgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGVycm9yTWVzc2FnZS5zcGxpdCgnezB9Jykuam9pbihyZXF1aXJlZENvbnRleHRWYWx1ZXNbaV0pKTtcclxuICAgIH1cclxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbn07XHJcblxyXG5BcGlJbnRlcmZhY2VDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XHJcbiAgICBjb25zdHJ1Y3RvcjogQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IsXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBBcGlJbnRlcmZhY2UjXHJcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZSN9XHJcbiAgICAgKi9cclxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKG1ldGhvZCwgcmVxdWVzdENvbmYsIGNvbmYpIHtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgICAgICB1cmwgPSB0eXBlb2YgcmVxdWVzdENvbmYgPT09IFwic3RyaW5nXCIgPyByZXF1ZXN0Q29uZiA6IHJlcXVlc3RDb25mLnVybDtcclxuICAgICAgICBpZiAocmVxdWVzdENvbmYudmVyYilcclxuICAgICAgICAgICAgbWV0aG9kID0gcmVxdWVzdENvbmYudmVyYjtcclxuXHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gbWUuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGE7XHJcbiAgICAgICAgaWYgKHJlcXVlc3RDb25mLm92ZXJyaWRlUG9zdERhdGEpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHJlcXVlc3RDb25mLm92ZXJyaWRlUG9zdERhdGE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb25mICYmICFyZXF1ZXN0Q29uZi5ub0JvZHkpIHtcclxuICAgICAgICAgICAgZGF0YSA9IGNvbmYuZGF0YSB8fCBjb25mO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNvbnRleHRIZWFkZXJzID0gdGhpcy5jb250ZXh0LmFzT2JqZWN0KFwieC12b2wtXCIpO1xyXG5cclxuICAgICAgICB2YXIgeGhyID0gdXRpbHMucmVxdWVzdChtZXRob2QsIHVybCwgY29udGV4dEhlYWRlcnMsIGRhdGEsIGZ1bmN0aW9uKHJhd0pTT04pIHtcclxuICAgICAgICAgICAgLy8gdXBkYXRlIGNvbnRleHQgd2l0aCByZXNwb25zZSBoZWFkZXJzXHJcbiAgICAgICAgICAgIG1lLmZpcmUoJ3N1Y2Nlc3MnLCByYXdKU09OLCB4aHIsIHJlcXVlc3RDb25mKTtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyYXdKU09OLCB4aHIpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvciwgeGhyLCB1cmwpO1xyXG4gICAgICAgIH0sIHJlcXVlc3RDb25mLmlmcmFtZVRyYW5zcG9ydFVybCk7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxsZWQgPSBmYWxzZSxcclxuICAgICAgICAgICAgY2FuY2VsbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgeGhyLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoXCJSZXF1ZXN0IGNhbmNlbGxlZC5cIilcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5maXJlKCdyZXF1ZXN0JywgeGhyLCBjYW5jZWxsZXIsIGRlZmVycmVkLnByb21pc2UsIHJlcXVlc3RDb25mLCBjb25mKTtcclxuXHJcbiAgICAgICAgZGVmZXJyZWQucHJvbWlzZS5vdGhlcndpc2UoZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgdmFyIHJlcztcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lLmZpcmUoJ2Vycm9yJywgZXJyb3IsIHhociwgcmVxdWVzdENvbmYpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEFwaUludGVyZmFjZSNcclxuICAgICAqIEByZXR1cm5zIGV4dGVybmFsOlByb21pc2UjXHJcbiAgICAgKi9cclxuICAgIGFjdGlvbjogZnVuY3Rpb24oaW5zdGFuY2VPclR5cGUsIGFjdGlvbk5hbWUsIGRhdGEpIHtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgICAgICBvYmogPSBpbnN0YW5jZU9yVHlwZSBpbnN0YW5jZW9mIEFwaU9iamVjdCA/IGluc3RhbmNlT3JUeXBlIDogbWUuY3JlYXRlU3luYyhpbnN0YW5jZU9yVHlwZSksXHJcbiAgICAgICAgICAgIHR5cGUgPSBvYmoudHlwZTtcclxuXHJcbiAgICAgICAgb2JqLmZpcmUoJ2FjdGlvbicsIGFjdGlvbk5hbWUsIGRhdGEpO1xyXG4gICAgICAgIG1lLmZpcmUoJ2FjdGlvbicsIG9iaiwgYWN0aW9uTmFtZSwgZGF0YSk7XHJcbiAgICAgICAgdmFyIHJlcXVlc3RDb25mID0gQXBpUmVmZXJlbmNlLmdldFJlcXVlc3RDb25maWcoYWN0aW9uTmFtZSwgdHlwZSwgZGF0YSB8fCBvYmouZGF0YSwgbWUuY29udGV4dCwgb2JqKTtcclxuXHJcbiAgICAgICAgaWYgKChhY3Rpb25OYW1lID09IFwidXBkYXRlXCIgfHwgYWN0aW9uTmFtZSA9PSBcImNyZWF0ZVwiKSAmJiAhZGF0YSkge1xyXG4gICAgICAgICAgICBkYXRhID0gb2JqLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbWUucmVxdWVzdChBcGlSZWZlcmVuY2UuYmFzaWNPcHNbYWN0aW9uTmFtZV0sIHJlcXVlc3RDb25mLCBkYXRhKS50aGVuKGZ1bmN0aW9uKHJhd0pTT04pIHtcclxuICAgICAgICAgICAgaWYgKHJlcXVlc3RDb25mLnJldHVyblR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXR1cm5PYmogPSBBcGlPYmplY3QuY3JlYXRlKHJlcXVlc3RDb25mLnJldHVyblR5cGUsIHJhd0pTT04sIG1lKTtcclxuICAgICAgICAgICAgICAgIG9iai5maXJlKCdzcGF3bicsIHJldHVybk9iaik7XHJcbiAgICAgICAgICAgICAgICBtZS5maXJlKCdzcGF3bicsIHJldHVybk9iaiwgb2JqKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5PYmo7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmF3SlNPTiB8fCByYXdKU09OID09PSAwIHx8IHJhd0pTT04gPT09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIG9iai5kYXRhID0gdXRpbHMuY2xvbmUocmF3SlNPTik7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnVuc3luY2VkO1xyXG4gICAgICAgICAgICAgICAgb2JqLmZpcmUoJ3N5bmMnLCByYXdKU09OLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBtZS5maXJlKCdzeW5jJywgb2JqLCByYXdKU09OLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3JKU09OKSB7XHJcbiAgICAgICAgICAgIG9iai5maXJlKCdlcnJvcicsIGVycm9ySlNPTik7XHJcbiAgICAgICAgICAgIG1lLmZpcmUoJ2Vycm9yJywgZXJyb3JKU09OLCBvYmopO1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvckpTT047XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdXRpbHMud2hlbi5qb2luLmFwcGx5KHV0aWxzLndoZW4sIGFyZ3VtZW50cyk7XHJcbiAgICB9LFxyXG4gICAgc3RlcHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhcmdzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50c1swXSkgPT09IFwiW29iamVjdCBBcnJheV1cIiA/IGFyZ3VtZW50c1swXSA6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLnBpcGVsaW5lKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpKTtcclxuICAgIH0sXHJcbiAgICBkZWZlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLndoZW4uZGVmZXIoKTtcclxuICAgIH0sXHJcbiAgICBnZXRBdmFpbGFibGVBY3Rpb25zRm9yOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIEFwaVJlZmVyZW5jZS5nZXRBY3Rpb25zRm9yKHR5cGUpO1xyXG4gICAgfVxyXG59O1xyXG52YXIgc2V0T3AgPSBmdW5jdGlvbihmbk5hbWUpIHtcclxuICAgIEFwaUludGVyZmFjZUNvbnN0cnVjdG9yLnByb3RvdHlwZVtmbk5hbWVdID0gZnVuY3Rpb24odHlwZSwgY29uZiwgaXNSZW1vdGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb24odHlwZSwgZm5OYW1lLCBjb25mLCBpc1JlbW90ZSk7XHJcbiAgICB9O1xyXG59O1xyXG5mb3IgKHZhciBpIGluIEFwaVJlZmVyZW5jZS5iYXNpY09wcykge1xyXG4gICAgaWYgKEFwaVJlZmVyZW5jZS5iYXNpY09wcy5oYXNPd25Qcm9wZXJ0eShpKSkgc2V0T3AoaSk7XHJcbn1cclxuXHJcbi8vIGFkZCBjcmVhdGVTeW5jIG1ldGhvZCBmb3IgYSBkaWZmZXJlbnQgc3R5bGUgb2YgZGV2ZWxvcG1lbnRcclxuQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IucHJvdG90eXBlLmNyZWF0ZVN5bmMgPSBmdW5jdGlvbih0eXBlLCBjb25mKSB7XHJcbiAgICB2YXIgbmV3QXBpT2JqZWN0ID0gQXBpT2JqZWN0LmNyZWF0ZSh0eXBlLCBjb25mLCB0aGlzKTtcclxuICAgIG5ld0FwaU9iamVjdC51bnN5bmNlZCA9IHRydWU7XHJcbiAgICB0aGlzLmZpcmUoJ3NwYXduJywgbmV3QXBpT2JqZWN0KTtcclxuICAgIHJldHVybiBuZXdBcGlPYmplY3Q7XHJcbn07XHJcblxyXG51dGlscy5hZGRFdmVudHMoQXBpSW50ZXJmYWNlQ29uc3RydWN0b3IpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcGlJbnRlcmZhY2VDb25zdHJ1Y3RvcjtcclxuXHJcbi8vIEVORCBJTlRFUkZBQ0VcclxuXHJcbi8qKioqKioqKiovIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInByb2R1Y3RzXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytwcm9kdWN0U2VydmljZX17P18qfVwiLFxuICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImZpbHRlclwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicGFnZVNpemVcIjogMTVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwicHJvZHVjdFwiXG4gIH0sXG4gIFwiY2F0ZWdvcmllc1wiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2F0ZWdvcnlTZXJ2aWNlfXs/Xyp9XCIsXG4gICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiZmlsdGVyXCIsXG4gICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgIFwic3RhcnRJbmRleFwiOiAwLFxuICAgICAgXCJwYWdlU2l6ZVwiOiAxNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJjYXRlZ29yeVwiXG4gIH0sXG4gIFwiY2F0ZWdvcnlcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2NhdGVnb3J5U2VydmljZX17aWR9KD9hbGxvd0luYWN0aXZlfVwiLFxuICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcIklkXCIsXG4gICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgIFwiYWxsb3dJbmFjdGl2ZVwiOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgXCJzZWFyY2hcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K3NlYXJjaFNlcnZpY2V9c2VhcmNoez9xdWVyeSxmaWx0ZXIsZmFjZXRUZW1wbGF0ZSxmYWNldFRlbXBsYXRlU3Vic2V0LGZhY2V0LGZhY2V0RmllbGRSYW5nZVF1ZXJ5LGZhY2V0SGllclByZWZpeCxmYWNldEhpZXJWYWx1ZSxmYWNldEhpZXJEZXB0aCxmYWNldFN0YXJ0SW5kZXgsZmFjZXRQYWdlU2l6ZSxmYWNldFNldHRpbmdzLGZhY2V0VmFsdWVGaWx0ZXIsc29ydEJ5LHBhZ2VTaXplLFBhZ2VTaXplLHN0YXJ0SW5kZXgsU3RhcnRJbmRleH1cIixcbiAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJxdWVyeVwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicXVlcnlcIjogXCIqOipcIixcbiAgICAgIFwicGFnZVNpemVcIjogMTVcbiAgICB9LFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwicHJvZHVjdFwiXG4gIH0sXG4gIFwiY3VzdG9tZXJzXCI6IHtcbiAgICBcImNvbGxlY3Rpb25PZlwiOiBcImN1c3RvbWVyXCJcbiAgfSxcbiAgXCJvcmRlcnNcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17P18qfVwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicGFnZVNpemVcIjogNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJvcmRlclwiXG4gIH0sXG4gIFwicHJvZHVjdFwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcHJvZHVjdFNlcnZpY2V9e3Byb2R1Y3RDb2RlfT97JmFsbG93SW5hY3RpdmUqfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwicHJvZHVjdENvZGVcIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwiYWxsb3dJbmFjdGl2ZVwiOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJjb25maWd1cmVcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcHJvZHVjdFNlcnZpY2V9e3Byb2R1Y3RDb2RlfS9jb25maWd1cmV7P2luY2x1ZGVPcHRpb25EZXRhaWxzfVwiLFxuICAgICAgXCJkZWZhdWx0UGFyYW1zXCI6IHtcbiAgICAgICAgXCJpbmNsdWRlT3B0aW9uRGV0YWlsc1wiOiB0cnVlXG4gICAgICB9LFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImFkZC10by1jYXJ0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJwcm9kdWN0XCJcbiAgICAgIH0sXG4gICAgICBcIm92ZXJyaWRlUG9zdERhdGFcIjogW1xuICAgICAgICBcInByb2R1Y3RcIixcbiAgICAgICAgXCJxdWFudGl0eVwiLFxuICAgICAgICBcImZ1bGZpbGxtZW50TG9jYXRpb25Db2RlXCIsXG4gICAgICAgIFwiZnVsZmlsbG1lbnRNZXRob2RcIlxuICAgICAgXSxcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcInF1YW50aXR5XCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjYXJ0aXRlbVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtcy9cIlxuICAgIH0sXG4gICAgXCJnZXQtaW52ZW50b3J5XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3Byb2R1Y3RTZXJ2aWNlfXtwcm9kdWN0Q29kZX0vbG9jYXRpb25pbnZlbnRvcnl7P2xvY2F0aW9uQ29kZXN9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJsb2NhdGlvbmNvZGVzXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH1cbiAgfSxcbiAgXCJsb2NhdGlvblwiOiB7XG4gICAgXCJnZXRcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrbG9jYXRpb25TZXJ2aWNlfWxvY2F0aW9uVXNhZ2VUeXBlcy9TUC9sb2NhdGlvbnMve2NvZGV9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJjb2RlXCJcbiAgICB9XG4gIH0sXG4gIFwibG9jYXRpb25zXCI6IHtcbiAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgXCJwYWdlU2l6ZVwiOiAxNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJsb2NhdGlvblwiLFxuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2xvY2F0aW9uU2VydmljZX1sb2NhdGlvblVzYWdlVHlwZXMvU1AvbG9jYXRpb25zL3s/c3RhcnRJbmRleCxzb3J0QnkscGFnZVNpemUsZmlsdGVyfVwiXG4gICAgfSxcbiAgICBcImdldC1ieS1sYXQtbG9uZ1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytsb2NhdGlvblNlcnZpY2V9bG9jYXRpb25Vc2FnZVR5cGVzL1NQL2xvY2F0aW9ucy8/ZmlsdGVyPWdlbyBuZWFyKHtsYXRpdHVkZX0se2xvbmdpdHVkZX0peyZzdGFydEluZGV4LHNvcnRCeSxwYWdlU2l6ZX1cIlxuICAgIH1cbiAgfSxcbiAgXCJjYXJ0XCI6IHtcbiAgICBcImdldFwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudFwiLFxuICAgIFwiZ2V0LXN1bW1hcnlcIjogXCJ7K2NhcnRTZXJ2aWNlfXN1bW1hcnlcIixcbiAgICBcImFkZC1wcm9kdWN0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImNhcnRpdGVtXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjYXJ0U2VydmljZX1jdXJyZW50L2l0ZW1zL1wiXG4gICAgfSxcbiAgICBcImVtcHR5XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtcy9cIlxuICAgIH0sXG4gICAgXCJjaGVja291dFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9P2NhcnRJZD17aWR9XCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJvcmRlclwiLFxuICAgICAgXCJub0JvZHlcIjogdHJ1ZSxcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgXCJjYXJ0aXRlbVwiOiB7XG4gICAgXCJkZWZhdWx0c1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjYXJ0U2VydmljZX1jdXJyZW50L2l0ZW1zL3tpZH1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImlkXCJcbiAgICB9LFxuICAgIFwidXBkYXRlLXF1YW50aXR5XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY2FydFNlcnZpY2V9Y3VycmVudC9pdGVtc3svaWQscXVhbnRpdHl9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJxdWFudGl0eVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJub0JvZHlcIjogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgXCJjdXN0b21lclwiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH1cIixcbiAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJpZFwiLFxuICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICBcImNyZWF0ZVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9YWRkLWFjY291bnQtYW5kLWxvZ2luXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJsb2dpblwiXG4gICAgfSxcbiAgICBcImNyZWF0ZS1zdG9yZWZyb250XCI6IHtcbiAgICAgIFwidXNlSWZyYW1lVHJhbnNwb3J0XCI6IFwieytzdG9yZWZyb250VXNlclNlcnZpY2V9Li4vLi4vcmVjZWl2ZXJcIixcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3N0b3JlZnJvbnRVc2VyU2VydmljZX1jcmVhdGVcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImxvZ2luXCJcbiAgICB9LFxuICAgIFwibG9naW5cIjoge1xuICAgICAgXCJ1c2VJZnJhbWVUcmFuc3BvcnRcIjogXCJ7K2N1c3RvbWVyU2VydmljZX0uLi8uLi9yZWNlaXZlclwiLFxuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfS4uL2F1dGh0aWNrZXRzXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJsb2dpblwiXG4gICAgfSxcbiAgICBcImxvZ2luLXN0b3JlZnJvbnRcIjoge1xuICAgICAgXCJ1c2VJZnJhbWVUcmFuc3BvcnRcIjogXCJ7K3N0b3JlZnJvbnRVc2VyU2VydmljZX0uLi8uLi9yZWNlaXZlclwiLFxuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrc3RvcmVmcm9udFVzZXJTZXJ2aWNlfWxvZ2luXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJsb2dpblwiXG4gICAgfSxcbiAgICBcInVwZGF0ZVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwicmVzZXQtcGFzc3dvcmRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXJlc2V0LXBhc3N3b3JkXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgXCJyZXNldC1wYXNzd29yZC1zdG9yZWZyb250XCI6IHtcbiAgICAgIFwidXNlSWZyYW1lVHJhbnNwb3J0XCI6IFwieytzdG9yZWZyb250VXNlclNlcnZpY2V9Li4vLi4vcmVjZWl2ZXJcIixcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3N0b3JlZnJvbnRVc2VyU2VydmljZX1yZXNldHBhc3N3b3JkXCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdHJpbmdcIlxuICAgIH0sXG4gICAgXCJjaGFuZ2UtcGFzc3dvcmRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUE9TVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH0vY2hhbmdlLXBhc3N3b3JkXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiZ2V0LW9yZGVyc1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9P2ZpbHRlcj1PcmRlck51bWJlciBuZSBudWxsXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJvcmRlcnNcIlxuICAgIH0sXG4gICAgXCJnZXQtY2FyZHNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtpZH0vY2FyZHNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImFjY291bnRjYXJkc1wiXG4gICAgfSxcbiAgICBcImFkZC1jYXJkXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17Y3VzdG9tZXIuaWR9L2NhcmRzXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHtcbiAgICAgICAgXCJhc1Byb3BlcnR5XCI6IFwiY3VzdG9tZXJcIlxuICAgICAgfSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImFjY291bnRjYXJkXCJcbiAgICB9LFxuICAgIFwidXBkYXRlLWNhcmRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiUFVUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2N1c3RvbWVyLmlkfS9jYXJkcy97aWR9XCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHtcbiAgICAgICAgXCJhc1Byb3BlcnR5XCI6IFwiY3VzdG9tZXJcIlxuICAgICAgfSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImFjY291bnRjYXJkXCJcbiAgICB9LFxuICAgIFwiZGVsZXRlLWNhcmRcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjdXN0b21lclNlcnZpY2V9e2N1c3RvbWVyLmlkfS9jYXJkcy97aWR9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJpZFwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB7XG4gICAgICAgIFwiYXNQcm9wZXJ0eVwiOiBcImN1c3RvbWVyXCJcbiAgICAgIH0sXG4gICAgICBcInJldHVyblR5cGVcIjogXCJhY2NvdW50Y2FyZFwiXG4gICAgfSxcbiAgICBcImFkZC1jb250YWN0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9L2NvbnRhY3RzXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjb250YWN0XCJcbiAgICB9LFxuICAgIFwiZ2V0LWNvbnRhY3RzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9L2NvbnRhY3RzXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjb250YWN0c1wiXG4gICAgfSxcbiAgICBcImRlbGV0ZS1jb250YWN0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrY3VzdG9tZXJTZXJ2aWNlfXtjdXN0b21lci5pZH0vY29udGFjdHMve2lkfVwiLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiaWRcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJjdXN0b21lclwiXG4gICAgICB9LFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwiY29udGFjdFwiXG4gICAgfSxcbiAgICBcImdldC1jcmVkaXRzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NyZWRpdFNlcnZpY2V9XCIsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJzdG9yZWNyZWRpdHNcIlxuICAgIH1cbiAgfSxcbiAgXCJzdG9yZWNyZWRpdFwiOiB7XG4gICAgXCJhc3NvY2lhdGUtdG8tc2hvcHBlclwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2NyZWRpdFNlcnZpY2V9e2NvZGV9L2Fzc29jaWF0ZS10by1zaG9wcGVyXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9XG4gIH0sXG4gIFwic3RvcmVjcmVkaXRzXCI6IHtcbiAgICBcInRlbXBsYXRlXCI6IFwieytjcmVkaXRTZXJ2aWNlfVwiLFxuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwic3RvcmVjcmVkaXRcIlxuICB9LFxuICBcImNvbnRhY3RcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17YWNjb3VudElkfS9jb250YWN0cy97aWR9XCIsXG4gICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gIH0sXG4gIFwiY29udGFjdHNcIjoge1xuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwiY29udGFjdFwiXG4gIH0sXG4gIFwibG9naW5cIjogXCJ7K3VzZXJTZXJ2aWNlfWxvZ2luXCIsXG4gIFwiYWRkcmVzc1wiOiB7XG4gICAgXCJ2YWxpZGF0ZS1hZGRyZXNzXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2FkZHJlc3NWYWxpZGF0aW9uU2VydmljZX1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjoge1xuICAgICAgICBcImFzUHJvcGVydHlcIjogXCJhZGRyZXNzXCJcbiAgICAgIH0sXG4gICAgICBcIm92ZXJyaWRlUG9zdERhdGFcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImFkZHJlc3NcIlxuICAgIH1cbiAgfSxcbiAgXCJvcmRlclwiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH1cIixcbiAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgXCJjcmVhdGVcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXs/Y2FydElkKn1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImNhcnRJZFwiLFxuICAgICAgXCJub0JvZHlcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJ1cGRhdGUtc2hpcHBpbmctaW5mb1wiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9mdWxmaWxsbWVudGluZm9cIixcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic2hpcG1lbnRcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJzZXQtdXNlci1pZFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQVVRcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L3VzZXJzXCIsXG4gICAgICBcIm5vQm9keVwiOiB0cnVlLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwidXNlclwiXG4gICAgfSxcbiAgICBcImNyZWF0ZS1wYXltZW50XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L3BheW1lbnRzL2FjdGlvbnNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJwZXJmb3JtLXBheW1lbnQtYWN0aW9uXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L3BheW1lbnRzL3twYXltZW50SWR9L2FjdGlvbnNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcInBheW1lbnRJZFwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIFwiYXBwbHktY291cG9uXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vY291cG9ucy97Y291cG9uQ29kZX1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImNvdXBvbkNvZGVcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwibm9Cb2R5XCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJjb3Vwb25cIlxuICAgIH0sXG4gICAgXCJyZW1vdmUtY291cG9uXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtpZH0vY291cG9ucy97Y291cG9uQ29kZX1cIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImNvdXBvbkNvZGVcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJyZW1vdmUtYWxsLWNvdXBvbnNcIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytvcmRlclNlcnZpY2V9e2lkfS9jb3Vwb25zXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiZ2V0LWF2YWlsYWJsZS1hY3Rpb25zXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L2FjdGlvbnNcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZSxcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcIm9yZGVyYWN0aW9uc1wiXG4gICAgfSxcbiAgICBcInBlcmZvcm0tb3JkZXItYWN0aW9uXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L2FjdGlvbnNcIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImFjdGlvbk5hbWVcIixcbiAgICAgIFwib3ZlcnJpZGVQb3N0RGF0YVwiOiBbXG4gICAgICAgIFwiYWN0aW9uTmFtZVwiXG4gICAgICBdLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImFkZC1vcmRlci1ub3RlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17aWR9L25vdGVzXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWUsXG4gICAgICBcInJldHVyblR5cGVcIjogXCJvcmRlcm5vdGVcIlxuICAgIH1cbiAgfSxcbiAgXCJybWFcIjoge1xuICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3JldHVyblNlcnZpY2V9XCJcbiAgICB9XG4gIH0sXG4gIFwicm1hc1wiOiB7XG4gICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcmV0dXJuU2VydmljZX17P18qfVwiLFxuICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICBcInN0YXJ0SW5kZXhcIjogMCxcbiAgICAgIFwicGFnZVNpemVcIjogNVxuICAgIH0sXG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJybWFcIlxuICB9LFxuICBcInNoaXBtZW50XCI6IHtcbiAgICBcImRlZmF1bHRzXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17b3JkZXJJZH0vZnVsZmlsbG1lbnRpbmZvXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9LFxuICAgIFwiZ2V0LXNoaXBwaW5nLW1ldGhvZHNcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtvcmRlcklkfS9zaGlwbWVudHMvbWV0aG9kc1wiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic2hpcHBpbmdtZXRob2RzXCJcbiAgICB9XG4gIH0sXG4gIFwicGF5bWVudFwiOiB7XG4gICAgXCJjcmVhdGVcIjoge1xuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrb3JkZXJTZXJ2aWNlfXtvcmRlcklkfS9wYXltZW50cy9hY3Rpb25zXCIsXG4gICAgICBcImluY2x1ZGVTZWxmXCI6IHRydWVcbiAgICB9XG4gIH0sXG4gIFwiYWNjb3VudGNhcmRcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K2N1c3RvbWVyU2VydmljZX17aWR9L2NhcmRzXCJcbiAgfSxcbiAgXCJhY2NvdW50Y2FyZHNcIjoge1xuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwiYWNjb3VudGNhcmRcIlxuICB9LFxuICBcImNyZWRpdGNhcmRcIjoge1xuICAgIFwiZGVmYXVsdHNcIjoge1xuICAgICAgXCJ1c2VJZnJhbWVUcmFuc3BvcnRcIjogXCJ7K3BheW1lbnRTZXJ2aWNlfS4uLy4uL0Fzc2V0cy9tb3p1X3JlY2VpdmVyLmh0bWxcIlxuICAgIH0sXG4gICAgXCJzYXZlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3BheW1lbnRTZXJ2aWNlfVwiLFxuICAgICAgXCJyZXR1cm5UeXBlXCI6IFwic3RyaW5nXCJcbiAgICB9LFxuICAgIFwidXBkYXRlXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcGF5bWVudFNlcnZpY2V9e2NhcmRJZH1cIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcInN0cmluZ1wiXG4gICAgfSxcbiAgICBcImRlbFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJERUxFVEVcIixcbiAgICAgIFwic2hvcnRjdXRQYXJhbVwiOiBcImNhcmRJZFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrcGF5bWVudFNlcnZpY2V9e2NhcmRJZH1cIlxuICAgIH1cbiAgfSxcbiAgXCJjcmVkaXRjYXJkc1wiOiB7XG4gICAgXCJjb2xsZWN0aW9uT2ZcIjogXCJjcmVkaXRjYXJkXCJcbiAgfSxcbiAgXCJvcmRlcm5vdGVcIjoge1xuICAgIFwidGVtcGxhdGVcIjogXCJ7K29yZGVyU2VydmljZX17b3JkZXJJZH0vbm90ZXMve2lkfVwiXG4gIH0sXG4gIFwiZG9jdW1lbnRcIjoge1xuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2Ntc1NlcnZpY2V9ey9kb2N1bWVudExpc3ROYW1lLGRvY3VtZW50SWR9L3s/dmVyc2lvbixzdGF0dXN9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJkb2N1bWVudElkXCIsXG4gICAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgICBcImRvY3VtZW50TGlzdE5hbWVcIjogXCJkZWZhdWx0XCJcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiZG9jdW1lbnRieW5hbWVcIjoge1xuICAgIFwiZ2V0XCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K2Ntc1NlcnZpY2V9e2RvY3VtZW50TGlzdE5hbWV9L2RvY3VtZW50VHJlZS97ZG9jdW1lbnROYW1lfS97P2ZvbGRlclBhdGgsdmVyc2lvbixzdGF0dXN9XCIsXG4gICAgICBcInNob3J0Y3V0UGFyYW1cIjogXCJkb2N1bWVudE5hbWVcIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwiZG9jdW1lbnRMaXN0TmFtZVwiOiBcImRlZmF1bHRcIlxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJhZGRyZXNzc2NoZW1hc1wiOiBcInsrcmVmZXJlbmNlU2VydmljZX1hZGRyZXNzc2NoZW1hc1wiLFxuICBcIndpc2hsaXN0XCI6IHtcbiAgICBcImdldFwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9e2lkfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlXG4gICAgfSxcbiAgICBcImdldC1ieS1uYW1lXCI6IHtcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX1jdXN0b21lcnMve2N1c3RvbWVyQWNjb3VudElkfS97bmFtZX1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJnZXQtZGVmYXVsdFwiOiB7XG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9Y3VzdG9tZXJzL3tjdXN0b21lckFjY291bnRJZH0vbXlfd2lzaGxpc3RcIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJjcmVhdGUtZGVmYXVsdFwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9XCIsXG4gICAgICBcImRlZmF1bHRQYXJhbXNcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJteV93aXNobGlzdFwiLFxuICAgICAgICBcInR5cGVUYWdcIjogXCJkZWZhdWx0XCJcbiAgICAgIH0sXG4gICAgICBcIm92ZXJyaWRlUG9zdERhdGFcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJhZGQtaXRlbVwiOiB7XG4gICAgICBcInZlcmJcIjogXCJQT1NUXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9e2lkfS9pdGVtcy9cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJkZWxldGUtYWxsLWl0ZW1zXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIkRFTEVURVwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfXtpZH0vaXRlbXMvXCJcbiAgICB9LFxuICAgIFwiZGVsZXRlLWl0ZW1cIjoge1xuICAgICAgXCJ2ZXJiXCI6IFwiREVMRVRFXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieyt3aXNobGlzdFNlcnZpY2V9e2lkfS9pdGVtcy97aXRlbUlkfVwiLFxuICAgICAgXCJpbmNsdWRlU2VsZlwiOiB0cnVlLFxuICAgICAgXCJzaG9ydGN1dFBhcmFtXCI6IFwiaXRlbUlkXCJcbiAgICB9LFxuICAgIFwiZWRpdC1pdGVtXCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBVVFwiLFxuICAgICAgXCJ0ZW1wbGF0ZVwiOiBcInsrd2lzaGxpc3RTZXJ2aWNlfXtpZH0vaXRlbXMve2l0ZW1JZH1cIixcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH0sXG4gICAgXCJhZGQtaXRlbS10by1jYXJ0XCI6IHtcbiAgICAgIFwidmVyYlwiOiBcIlBPU1RcIixcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcImNhcnRpdGVtXCIsXG4gICAgICBcInRlbXBsYXRlXCI6IFwieytjYXJ0U2VydmljZX1jdXJyZW50L2l0ZW1zL1wiXG4gICAgfSxcbiAgICBcImdldC1pdGVtcy1ieS1uYW1lXCI6IHtcbiAgICAgIFwicmV0dXJuVHlwZVwiOiBcIndpc2hsaXN0aXRlbXNcIixcbiAgICAgIFwidGVtcGxhdGVcIjogXCJ7K3dpc2hsaXN0U2VydmljZX1jdXN0b21lcnMve2N1c3RvbWVyQWNjb3VudElkfS97bmFtZX0vaXRlbXN7P3N0YXJ0SW5kZXgscGFnZVNpemUsc29ydEJ5LGZpbHRlcn1cIixcbiAgICAgIFwiZGVmYXVsdFBhcmFtc1wiOiB7XG4gICAgICAgIFwic29ydEJ5XCI6IFwiVXBkYXRlRGF0ZSBhc2NcIlxuICAgICAgfSxcbiAgICAgIFwiaW5jbHVkZVNlbGZcIjogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgXCJ3aXNobGlzdHNcIjoge1xuICAgIFwiY29sbGVjdGlvbk9mXCI6IFwid2lzaGxpc3RcIlxuICB9XG59IiwiLy8gQkVHSU4gT0JKRUNUXHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBBcGlSZWZlcmVuY2U7XHJcbnZhciBBcGlDb2xsZWN0aW9uOyAvLyBsYXp5IGxvYWRpbmcgdG8gcHJldmVudCBjaXJjdWxhciBkZXBcclxuXHJcbnZhciBBcGlPYmplY3RDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKHR5cGUsIGRhdGEsIGlhcGkpIHtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGEgfHwge307XHJcbiAgICB0aGlzLmFwaSA9IGlhcGk7XHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG59O1xyXG5cclxuQXBpT2JqZWN0Q29uc3RydWN0b3IucHJvdG90eXBlID0ge1xyXG4gICAgY29uc3RydWN0b3I6IEFwaU9iamVjdENvbnN0cnVjdG9yLFxyXG4gICAgZ2V0QXZhaWxhYmxlQWN0aW9uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgQXBpUmVmZXJlbmNlID0gQXBpUmVmZXJlbmNlIHx8IHJlcXVpcmUoJy4vcmVmZXJlbmNlJyk7XHJcbiAgICAgICAgcmV0dXJuIEFwaVJlZmVyZW5jZS5nZXRBY3Rpb25zRm9yKHRoaXMudHlwZSk7XHJcbiAgICB9LFxyXG4gICAgcHJvcDogZnVuY3Rpb24oaywgdikge1xyXG4gICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGsgPT09IFwic3RyaW5nXCIpIHJldHVybiB0aGlzLmRhdGFba107XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGsgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBoYXNoa2V5IGluIGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGsuaGFzT3duUHJvcGVydHkoaGFzaGtleSkpIHRoaXMucHJvcChoYXNoa2V5LCBrW2hhc2hrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2tdID0gdjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn07XHJcblxyXG51dGlscy5hZGRFdmVudHMoQXBpT2JqZWN0Q29uc3RydWN0b3IpO1xyXG5cclxuQXBpT2JqZWN0Q29uc3RydWN0b3IudHlwZXMgPSB7XHJcbiAgICBjYXJ0OiByZXF1aXJlKCcuL3R5cGVzL2NhcnQnKSxcclxuICAgIGNyZWRpdGNhcmQ6IHJlcXVpcmUoJy4vdHlwZXMvY3JlZGl0Y2FyZCcpLFxyXG4gICAgY3VzdG9tZXI6IHJlcXVpcmUoJy4vdHlwZXMvY3VzdG9tZXInKSxcclxuICAgIGxvZ2luOiByZXF1aXJlKCcuL3R5cGVzL2xvZ2luJyksXHJcbiAgICBvcmRlcjogcmVxdWlyZSgnLi90eXBlcy9vcmRlcicpLFxyXG4gICAgcHJvZHVjdDogcmVxdWlyZSgnLi90eXBlcy9wcm9kdWN0JyksXHJcbiAgICBzaGlwbWVudDogcmVxdWlyZSgnLi90eXBlcy9zaGlwbWVudCcpLFxyXG4gICAgdXNlcjogcmVxdWlyZSgnLi90eXBlcy91c2VyJyksXHJcbiAgICB3aXNobGlzdDogcmVxdWlyZSgnLi90eXBlcy93aXNobGlzdCcpXHJcbn07XHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLmh5ZHJhdGVkVHlwZXMgPSB7fTtcclxuXHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLmdldEh5ZHJhdGVkVHlwZSA9IGZ1bmN0aW9uKHR5cGVOYW1lKSB7XHJcbiAgICBBcGlSZWZlcmVuY2UgPSBBcGlSZWZlcmVuY2UgfHwgcmVxdWlyZSgnLi9yZWZlcmVuY2UnKTtcclxuICAgIGlmICghKHR5cGVOYW1lIGluIHRoaXMuaHlkcmF0ZWRUeXBlcykpIHtcclxuICAgICAgICB2YXIgYXZhaWxhYmxlQWN0aW9ucyA9IEFwaVJlZmVyZW5jZS5nZXRBY3Rpb25zRm9yKHR5cGVOYW1lKSxcclxuICAgICAgICAgICAgcmVmbGVjdGVkTWV0aG9kcyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBhdmFpbGFibGVBY3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLnNldE9wKHJlZmxlY3RlZE1ldGhvZHMsIGF2YWlsYWJsZUFjdGlvbnNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmh5ZHJhdGVkVHlwZXNbdHlwZU5hbWVdID0gdXRpbHMuaW5oZXJpdCh0aGlzLCB1dGlscy5leHRlbmQoe30sIHJlZmxlY3RlZE1ldGhvZHMsIHRoaXMudHlwZXNbdHlwZU5hbWVdIHx8IHt9KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5oeWRyYXRlZFR5cGVzW3R5cGVOYW1lXTtcclxufTtcclxuXHJcbkFwaU9iamVjdENvbnN0cnVjdG9yLmNyZWF0ZSA9IGZ1bmN0aW9uKHR5cGVOYW1lLCByYXdKU09OLCBhcGkpIHtcclxuICAgIEFwaVJlZmVyZW5jZSA9IEFwaVJlZmVyZW5jZSB8fCByZXF1aXJlKCcuL3JlZmVyZW5jZScpO1xyXG4gICAgdmFyIHR5cGUgPSBBcGlSZWZlcmVuY2UuZ2V0VHlwZSh0eXBlTmFtZSk7XHJcbiAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICAvLyBmb3IgZm9yd2FyZCBjb21wYXRpYmlsaXR5IHRoZSBBUEkgc2hvdWxkIHJldHVybiBhIHJlc3BvbnNlLFxyXG4gICAgICAgIC8vIGV2ZW4gb25lIHRoYXQgaXQgZG9lc24ndCB1bmRlcnN0YW5kXHJcbiAgICAgICAgcmV0dXJuIHJhd0pTT047XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZS5jb2xsZWN0aW9uT2YpIHtcclxuICAgICAgICAvLyBsYXp5IGxvYWQgdG8gcHJldmVudCBjaXJjdWxhciBkZXBcclxuICAgICAgICBBcGlDb2xsZWN0aW9uID0gQXBpQ29sbGVjdGlvbiB8fCByZXF1aXJlKCcuL2NvbGxlY3Rpb24nKTtcclxuICAgICAgICByZXR1cm4gQXBpQ29sbGVjdGlvbi5jcmVhdGUodHlwZU5hbWUsIHJhd0pTT04sIGFwaSwgdHlwZS5jb2xsZWN0aW9uT2YpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBBcGlPYmplY3RUeXBlID0gdGhpcy5nZXRIeWRyYXRlZFR5cGUodHlwZU5hbWUpO1xyXG5cclxuICAgIHJldHVybiBuZXcgQXBpT2JqZWN0VHlwZSh0eXBlTmFtZSwgcmF3SlNPTiwgYXBpKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBpT2JqZWN0Q29uc3RydWN0b3I7XHJcblxyXG4vLyBFTkQgT0JKRUNUXHJcblxyXG4vKioqKioqKioqKiovIiwiLy8gQkVHSU4gUkVGRVJFTkNFXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XHJcbnZhciBBcGlDb2xsZWN0aW9uO1xyXG52YXIgQXBpT2JqZWN0ID0gcmVxdWlyZSgnLi9vYmplY3QnKTtcclxudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnLi9tZXRob2RzLmpzb24nKTtcclxuXHJcbmVycm9ycy5yZWdpc3Rlcih7XHJcbiAgICAnTk9fUkVRVUVTVF9DT05GSUdfRk9VTkQnOiAnTm8gcmVxdWVzdCBjb25maWd1cmF0aW9uIHdhcyBmb3VuZCBmb3IgezB9LnsxfScsXHJcbiAgICAnTk9fU0hPUlRDVVRfUEFSQU1fRk9VTkQnOiAnTm8gc2hvcnRjdXQgcGFyYW1ldGVyIGF2YWlsYWJsZSBmb3IgezB9LiBQbGVhc2Ugc3VwcGx5IGEgY29uZmlndXJhdGlvbiBvYmplY3QgaW5zdGVhZCBvZiBcInsxfVwiLidcclxufSk7XHJcblxyXG52YXIgYmFzaWNPcHMgPSB7XHJcbiAgICBnZXQ6ICdHRVQnLFxyXG4gICAgdXBkYXRlOiAnUFVUJyxcclxuICAgIGNyZWF0ZTogJ1BPU1QnLFxyXG4gICAgZGVsOiAnREVMRVRFJ1xyXG59O1xyXG52YXIgY29weVRvQ29uZiA9IFsndmVyYicsICdyZXR1cm5UeXBlJywgJ25vQm9keSddLFxyXG4gICAgY29weVRvQ29uZkxlbmd0aCA9IGNvcHlUb0NvbmYubGVuZ3RoO1xyXG52YXIgcmVzZXJ2ZWRXb3JkcyA9IHtcclxuICAgIHRlbXBsYXRlOiB0cnVlLFxyXG4gICAgZGVmYXVsdFBhcmFtczogdHJ1ZSxcclxuICAgIHNob3J0Y3V0UGFyYW06IHRydWUsXHJcbiAgICBkZWZhdWx0czogdHJ1ZSxcclxuICAgIHZlcmI6IHRydWUsXHJcbiAgICByZXR1cm5UeXBlOiB0cnVlLFxyXG4gICAgbm9Cb2R5OiB0cnVlLFxyXG4gICAgaW5jbHVkZVNlbGY6IHRydWUsXHJcbiAgICBjb2xsZWN0aW9uT2Y6IHRydWUsXHJcbiAgICBvdmVycmlkZVBvc3REYXRhOiB0cnVlLFxyXG4gICAgdXNlSWZyYW1lVHJhbnNwb3J0OiB0cnVlLFxyXG4gICAgY29uc3RydWN0OiB0cnVlLFxyXG4gICAgcG9zdGNvbnN0cnVjdDogdHJ1ZSxcclxufTtcclxudmFyIEFwaVJlZmVyZW5jZSA9IHtcclxuXHJcbiAgICBiYXNpY09wczogYmFzaWNPcHMsXHJcbiAgICB1cmxzOiB7fSxcclxuXHJcbiAgICBnZXRBY3Rpb25zRm9yOiBmdW5jdGlvbih0eXBlTmFtZSkge1xyXG4gICAgICAgIEFwaUNvbGxlY3Rpb24gPSBBcGlDb2xsZWN0aW9uIHx8IHJlcXVpcmUoJy4vY29sbGVjdGlvbicpO1xyXG4gICAgICAgIGlmICghb2JqZWN0VHlwZXNbdHlwZU5hbWVdKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIGFjdGlvbnMgPSBbXSxcclxuICAgICAgICAgICAgaXNTaW1wbGVUeXBlID0gKHR5cGVvZiBvYmplY3RUeXBlc1t0eXBlTmFtZV0gPT09IFwic3RyaW5nXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGEgaW4gYmFzaWNPcHMpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2ltcGxlVHlwZSB8fCAhKGEgaW4gb2JqZWN0VHlwZXNbdHlwZU5hbWVdKSlcclxuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc1NpbXBsZVR5cGUpIHtcclxuICAgICAgICAgICAgZm9yIChhIGluIG9iamVjdFR5cGVzW3R5cGVOYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEgJiYgb2JqZWN0VHlwZXNbdHlwZU5hbWVdLmhhc093blByb3BlcnR5KGEpICYmICFyZXNlcnZlZFdvcmRzW2FdKVxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaCh1dGlscy5jYW1lbENhc2UoYSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBkZWNsYXJlZFR5cGUgPSAob2JqZWN0VHlwZXNbdHlwZU5hbWVdLmNvbGxlY3Rpb25PZiA/IEFwaUNvbGxlY3Rpb24gOiBBcGlPYmplY3QpLnR5cGVzW3R5cGVOYW1lXTtcclxuICAgICAgICBpZiAoZGVjbGFyZWRUeXBlKSB7XHJcbiAgICAgICAgICAgIGZvciAoYSBpbiBkZWNsYXJlZFR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1NpbXBsZVR5cGUgfHwgISh1dGlscy5kYXNoQ2FzZShhKSBpbiBvYmplY3RUeXBlc1t0eXBlTmFtZV0gJiYgIXJlc2VydmVkV29yZHNbYV0pICYmIHR5cGVvZiBkZWNsYXJlZFR5cGVbYV0gPT09IFwiZnVuY3Rpb25cIikgYWN0aW9ucy5wdXNoKGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWN0aW9ucztcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0UmVxdWVzdENvbmZpZzogZnVuY3Rpb24ob3BlcmF0aW9uLCB0eXBlTmFtZSwgY29uZiwgY29udGV4dCwgb2JqKSB7XHJcblxyXG4gICAgICAgIHZhciByZXR1cm5PYmosIHRwdERhdGE7XHJcblxyXG4gICAgICAgIC8vIGdldCBvYmplY3QgdHlwZSBmcm9tIG91ciByZWZlcmVuY2VcclxuICAgICAgICB2YXIgb1R5cGUgPSBvYmplY3RUeXBlc1t0eXBlTmFtZV07XHJcblxyXG4gICAgICAgIC8vIHRoZXJlIG1heSBub3QgYmUgb25lXHJcbiAgICAgICAgaWYgKCFvVHlwZSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTk9fUkVRVUVTVF9DT05GSUdfRk9VTkQnLCB0eXBlTmFtZSwgJycpO1xyXG5cclxuICAgICAgICAvLyBnZXQgc3BlY2lmaWMgZGV0YWlscyBvZiB0aGUgcmVxdWVzdGVkIG9wZXJhdGlvblxyXG4gICAgICAgIGlmIChvcGVyYXRpb24pIG9wZXJhdGlvbiA9IHV0aWxzLmRhc2hDYXNlKG9wZXJhdGlvbik7XHJcbiAgICAgICAgaWYgKG9UeXBlW29wZXJhdGlvbl0pIG9UeXBlID0gb1R5cGVbb3BlcmF0aW9uXTtcclxuXHJcbiAgICAgICAgLy8gc29tZSBvVHlwZXMgYXJlIGEgc2ltcGxlIHRlbXBsYXRlIGFzIGEgc3RyaW5nXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvVHlwZSA9PT0gXCJzdHJpbmdcIikgb1R5cGUgPSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBvVHlwZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIHRoZSBkZWZhdWx0cyBhdCB0aGUgcm9vdCBvYmplY3QgdHlwZSBzaG91bGQgYmUgY29waWVkIGludG8gYWxsIG9wZXJhdGlvbiBjb25maWdzXHJcbiAgICAgICAgaWYgKG9iamVjdFR5cGVzW3R5cGVOYW1lXS5kZWZhdWx0cykgb1R5cGUgPSB1dGlscy5leHRlbmQoe30sIG9iamVjdFR5cGVzW3R5cGVOYW1lXS5kZWZhdWx0cywgb1R5cGUpO1xyXG5cclxuICAgICAgICAvLyBhIHRlbXBsYXRlIGlzIHJlcXVpcmVkXHJcbiAgICAgICAgaWYgKCFvVHlwZS50ZW1wbGF0ZSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTk9fUkVRVUVTVF9DT05GSUdfRk9VTkQnLCB0eXBlTmFtZSwgb3BlcmF0aW9uKTtcclxuXHJcbiAgICAgICAgcmV0dXJuT2JqID0ge307XHJcbiAgICAgICAgdHB0RGF0YSA9IHt9O1xyXG5cclxuICAgICAgICAvLyBjYWNoZSB0ZW1wbGF0ZXMgbGF6aWx5XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvVHlwZS50ZW1wbGF0ZSA9PT0gXCJzdHJpbmdcIikgb1R5cGUudGVtcGxhdGUgPSB1dGlscy51cml0ZW1wbGF0ZS5wYXJzZShvVHlwZS50ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGUgcmVxdWVzdGluZyBvYmplY3QncyBkYXRhIGl0c2VsZiB0byB0aGUgdHB0IGNvbnRleHRcclxuICAgICAgICBpZiAob1R5cGUuaW5jbHVkZVNlbGYgJiYgb2JqKSB7XHJcbiAgICAgICAgICAgIGlmIChvVHlwZS5pbmNsdWRlU2VsZi5hc1Byb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICB0cHREYXRhW29UeXBlLmluY2x1ZGVTZWxmLmFzUHJvcGVydHldID0gb2JqLmRhdGFcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRwdERhdGEgPSB1dGlscy5leHRlbmQodHB0RGF0YSwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzaG9ydGN1dHBhcmFtIGFsbG93cyB5b3UgdG8gdXNlIHRoZSBtb3N0IGNvbW1vbmx5IHVzZWQgY29uZiBwcm9wZXJ0eSBhcyBhIHN0cmluZyBvciBudW1iZXIgYXJndW1lbnRcclxuICAgICAgICBpZiAoY29uZiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjb25mICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGlmICghb1R5cGUuc2hvcnRjdXRQYXJhbSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnTk9fU0hPUlRDVVRfUEFSQU1fRk9VTkQnLCB0eXBlTmFtZSwgY29uZik7XHJcbiAgICAgICAgICAgIHRwdERhdGFbb1R5cGUuc2hvcnRjdXRQYXJhbV0gPSBjb25mO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29uZikge1xyXG4gICAgICAgICAgICAvLyBhZGQgdGhlIGNvbmYgYXJndWVkIGRpcmVjdGx5IGludG8gdGhpcyByZXF1ZXN0IGZuIHRvIHRoZSB0cHQgY29udGV4dFxyXG4gICAgICAgICAgICB1dGlscy5leHRlbmQodHB0RGF0YSwgY29uZik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkZWZhdWx0IHBhcmFtcyBhZGRlZCB0byB0ZW1wbGF0ZSwgYnV0IG92ZXJyaWRkZW4gYnkgZXhpc3RpbmcgdHB0IGRhdGFcclxuICAgICAgICBpZiAob1R5cGUuZGVmYXVsdFBhcmFtcykgdHB0RGF0YSA9IHV0aWxzLmV4dGVuZCh7fSwgb1R5cGUuZGVmYXVsdFBhcmFtcywgdHB0RGF0YSk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBzdHVmZiB0aGF0IHRoZSBVcmlUZW1wbGF0ZSBwYXJzZXIgY2FuJ3QgcGFyc2VcclxuICAgICAgICBmb3IgKHZhciB0dmFyIGluIHRwdERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmdldFR5cGUodHB0RGF0YVt0dmFyXSkgPT0gXCJBcnJheVwiKSB0cHREYXRhW3R2YXJdID0gSlNPTi5zdHJpbmdpZnkodHB0RGF0YVt0dmFyXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBmdWxsVHB0Q29udGV4dCA9IHV0aWxzLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIF86IHRwdERhdGFcclxuICAgICAgICB9LCBjb250ZXh0LmFzT2JqZWN0KCdjb250ZXh0LScpLCB1dGlscy5mbGF0dGVuKHRwdERhdGEsIHt9KSwgQXBpUmVmZXJlbmNlLnVybHMpO1xyXG4gICAgICAgIHJldHVybk9iai51cmwgPSBvVHlwZS50ZW1wbGF0ZS5leHBhbmQoZnVsbFRwdENvbnRleHQpO1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29weVRvQ29uZkxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChjb3B5VG9Db25mW2pdIGluIG9UeXBlKSByZXR1cm5PYmpbY29weVRvQ29uZltqXV0gPSBvVHlwZVtjb3B5VG9Db25mW2pdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9UeXBlLnVzZUlmcmFtZVRyYW5zcG9ydCkge1xyXG4gICAgICAgICAgICAvLyBjYWNoZSB0ZW1wbGF0ZXMgbGF6aWx5XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb1R5cGUudXNlSWZyYW1lVHJhbnNwb3J0ID09PSBcInN0cmluZ1wiKSBvVHlwZS51c2VJZnJhbWVUcmFuc3BvcnQgPSB1dGlscy51cml0ZW1wbGF0ZS5wYXJzZShvVHlwZS51c2VJZnJhbWVUcmFuc3BvcnQpO1xyXG4gICAgICAgICAgICByZXR1cm5PYmouaWZyYW1lVHJhbnNwb3J0VXJsID0gb1R5cGUudXNlSWZyYW1lVHJhbnNwb3J0LmV4cGFuZChmdWxsVHB0Q29udGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvVHlwZS5vdmVycmlkZVBvc3REYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBvdmVycmlkZGVuRGF0YTtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmdldFR5cGUob1R5cGUub3ZlcnJpZGVQb3N0RGF0YSkgPT0gXCJBcnJheVwiKSB7XHJcbiAgICAgICAgICAgICAgICBvdmVycmlkZGVuRGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdE9LID0gMDsgdE9LIDwgb1R5cGUub3ZlcnJpZGVQb3N0RGF0YS5sZW5ndGg7IHRPSysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcnJpZGRlbkRhdGFbb1R5cGUub3ZlcnJpZGVQb3N0RGF0YVt0T0tdXSA9IHRwdERhdGFbb1R5cGUub3ZlcnJpZGVQb3N0RGF0YVt0T0tdXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG92ZXJyaWRkZW5EYXRhID0gdHB0RGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm5PYmoub3ZlcnJpZGVQb3N0RGF0YSA9IG92ZXJyaWRkZW5EYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0dXJuT2JqO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRUeXBlOiBmdW5jdGlvbih0eXBlTmFtZSkge1xyXG4gICAgICAgIHJldHVybiBvYmplY3RUeXBlc1t0eXBlTmFtZV07XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwaVJlZmVyZW5jZTtcclxuXHJcbi8vIEVORCBSRUZFUkVOQ0VcclxuXHJcbi8qKioqKioqKioqKi8iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGNvdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wKCdpdGVtcycpO1xyXG4gICAgICAgIGlmICghaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCkgcmV0dXJuIDA7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLnJlZHVjZShpdGVtcywgZnVuY3Rpb24gKHRvdGFsLCBpdGVtKSB7IHJldHVybiB0b3RhbCArIGl0ZW0ucXVhbnRpdHk7IH0sIDApO1xyXG4gICAgfVxyXG59OyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZXJyb3JzLnJlZ2lzdGVyKHtcclxuICAgICAgICAnQ0FSRF9UWVBFX01JU1NJTkcnOiAnQ2FyZCB0eXBlIG1pc3NpbmcuJyxcclxuICAgICAgICAnQ0FSRF9OVU1CRVJfTUlTU0lORyc6ICdDYXJkIG51bWJlciBtaXNzaW5nLicsXHJcbiAgICAgICAgJ0NWVl9NSVNTSU5HJzogJ0NhcmQgc2VjdXJpdHkgY29kZSBtaXNzaW5nLicsXHJcbiAgICAgICAgJ0NBUkRfTlVNQkVSX1VOUkVDT0dOSVpFRCc6ICdDYXJkIG51bWJlciBpcyBpbiBhbiB1bnJlY29nbml6ZWQgZm9ybWF0LicsXHJcbiAgICAgICAgJ01BU0tfUEFUVEVSTl9JTlZBTElEJzogJ1N1cHBsaWVkIG1hc2sgcGF0dGVybiBkaWQgbm90IG1hdGNoIGEgdmFsaWQgY2FyZCBudW1iZXIuJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGNoYXJzSW5DYXJkTnVtYmVyUkUgPSAvW1xccy1dL2c7XHJcblxyXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVDYXJkTnVtYmVyKG9iaiwgY2FyZE51bWJlcikge1xyXG4gICAgICAgIHZhciBtYXNrQ2hhcmFjdGVyID0gb2JqLm1hc2tDaGFyYWN0ZXI7XHJcbiAgICAgICAgaWYgKCFjYXJkTnVtYmVyKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIChjYXJkTnVtYmVyLmluZGV4T2YobWFza0NoYXJhY3RlcikgIT09IC0xKSB8fCBsdWhuMTAoY2FyZE51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbHVobjEwKHMpIHtcclxuICAgICAgICAvLyBsdWhuIDEwIGFsZ29yaXRobSBmb3IgY2FyZCBudW1iZXJzXHJcbiAgICAgICAgdmFyIGksIG4sIGMsIHIsIHQ7XHJcbiAgICAgICAgciA9IFwiXCI7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KHMuY2hhckF0KGkpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmIChjID49IDAgJiYgYyA8PSA5KSByID0gYyArIHI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyLmxlbmd0aCA8PSAxKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdCA9IFwiXCI7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KHIuY2hhckF0KGkpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmIChpICUgMiAhPSAwKSBjICo9IDI7XHJcbiAgICAgICAgICAgIHQgPSB0ICsgYztcclxuICAgICAgICB9XHJcbiAgICAgICAgbiA9IDA7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYyA9IHBhcnNlSW50KHQuY2hhckF0KGkpLCAxMCk7XHJcbiAgICAgICAgICAgIG4gPSBuICsgYztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChuICE9IDAgJiYgbiAlIDEwID09IDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhcmROdW1iZXJNYXNrKG9iaiwgY2FyZE51bWJlcikge1xyXG4gICAgICAgIHZhciBtYXNrUkUgPSBuZXcgUmVnRXhwKG9iai5tYXNrUGF0dGVybiksXHJcbiAgICAgICAgICAgIG1hdGNoZXMgPSBjYXJkTnVtYmVyLm1hdGNoKG1hc2tSRSksXHJcbiAgICAgICAgICAgIHRvRGlzcGxheSA9IGNhcmROdW1iZXIsXHJcbiAgICAgICAgICAgIHRvU2VuZCA9IFtdLFxyXG4gICAgICAgICAgICBtYXNrQ2hhcmFjdGVyID0gb2JqLm1hc2tDaGFyYWN0ZXIsXHJcbiAgICAgICAgICAgIHRlbXBNYXNrID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKCFtYXRjaGVzKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdNQVNLX1BBVFRFUk5fSU5WQUxJRCcpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0ZW1wTWFzayA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2hlc1tpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGVtcE1hc2sgKz0gbWFza0NoYXJhY3RlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b0Rpc3BsYXkgPSB0b0Rpc3BsYXkucmVwbGFjZShtYXRjaGVzW2ldLCB0ZW1wTWFzayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaSA9IHRvRGlzcGxheS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICB0b1NlbmQudW5zaGlmdCh0b0Rpc3BsYXkuY2hhckF0KGkpID09PSBtYXNrQ2hhcmFjdGVyID8gY2FyZE51bWJlci5jaGFyQXQoaSkgOiBtYXNrQ2hhcmFjdGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JqLm1hc2tlZENhcmROdW1iZXIgPSB0b0Rpc3BsYXk7XHJcbiAgICAgICAgcmV0dXJuIHRvU2VuZC5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYWtlUGF5bG9hZChvYmopIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG9iai5kYXRhLCBtYXNrQ2hhcmFjdGVyID0gb2JqLm1hc2tDaGFyYWN0ZXIsIG1hc2tlZERhdGE7XHJcbiAgICAgICAgaWYgKCFkYXRhLnBheW1lbnRPckNhcmRUeXBlKSBlcnJvcnMudGhyb3dPbk9iamVjdChvYmosICdDQVJEX1RZUEVfTUlTU0lORycpO1xyXG4gICAgICAgIGlmICghZGF0YS5jYXJkTnVtYmVyUGFydE9yTWFzaykgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnQ0FSRF9OVU1CRVJfTUlTU0lORycpO1xyXG4gICAgICAgIGlmICghZGF0YS5jdnYpIGVycm9ycy50aHJvd09uT2JqZWN0KG9iaiwgJ0NWVl9NSVNTSU5HJyk7XHJcbiAgICAgICAgbWFza2VkRGF0YSA9IHRyYW5zZm9ybS50b0NhcmREYXRhKGRhdGEpXHJcbiAgICAgICAgdmFyIGNhcmROdW1iZXIgPSBtYXNrZWREYXRhLmNhcmROdW1iZXIucmVwbGFjZShjaGFyc0luQ2FyZE51bWJlclJFLCAnJyk7XHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZUNhcmROdW1iZXIob2JqLCBjYXJkTnVtYmVyKSkgZXJyb3JzLnRocm93T25PYmplY3Qob2JqLCAnQ0FSRF9OVU1CRVJfVU5SRUNPR05JWkVEJyk7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgYWRkIG51bWJlclBhcnQgaWYgdGhlIGN1cnJlbnQgY2FyZCBudW1iZXIgaXNuJ3QgYWxyZWFkeSBtYXNrZWRcclxuICAgICAgICBpZiAoY2FyZE51bWJlci5pbmRleE9mKG1hc2tDaGFyYWN0ZXIpID09PSAtMSkgbWFza2VkRGF0YS5udW1iZXJQYXJ0ID0gY3JlYXRlQ2FyZE51bWJlck1hc2sob2JqLCBjYXJkTnVtYmVyKTtcclxuICAgICAgICBkZWxldGUgbWFza2VkRGF0YS5jYXJkTnVtYmVyO1xyXG5cclxuICAgICAgICByZXR1cm4gbWFza2VkRGF0YTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdmFyIHRyYW5zZm9ybSA9IHtcclxuICAgICAgICBmaWVsZHM6IHtcclxuICAgICAgICAgICAgXCJjYXJkTnVtYmVyXCI6IFwiY2FyZE51bWJlclBhcnRPck1hc2tcIixcclxuICAgICAgICAgICAgXCJwZXJzaXN0Q2FyZFwiOiBcImlzQ2FyZEluZm9TYXZlZFwiLFxyXG4gICAgICAgICAgICBcImNhcmRob2xkZXJOYW1lXCI6IFwibmFtZU9uQ2FyZFwiLFxyXG4gICAgICAgICAgICBcImNhcmRUeXBlXCI6IFwicGF5bWVudE9yQ2FyZFR5cGVcIixcclxuICAgICAgICAgICAgXCJjYXJkSWRcIjogXCJwYXltZW50U2VydmljZUNhcmRJZFwiLFxyXG4gICAgICAgICAgICBcImN2dlwiOiBcImN2dlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b1N0b3JlZnJvbnREYXRhOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgc3RvcmVmcm9udERhdGEgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2VydmljZUZpZWxkIGluIHRoaXMuZmllbGRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VydmljZUZpZWxkIGluIGRhdGEpIHN0b3JlZnJvbnREYXRhW3RoaXMuZmllbGRzW3NlcnZpY2VGaWVsZF1dID0gZGF0YVtzZXJ2aWNlRmllbGRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdG9yZWZyb250RGF0YTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvQ2FyZERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzZXJ2aWNlRmllbGQgaW4gdGhpcy5maWVsZHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkc1tzZXJ2aWNlRmllbGRdIGluIGRhdGEpIGNhcmREYXRhW3NlcnZpY2VGaWVsZF0gPSBkYXRhW3RoaXMuZmllbGRzW3NlcnZpY2VGaWVsZF1dXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNhcmREYXRhO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1hc2tDaGFyYWN0ZXI6IFwiKlwiLFxyXG4gICAgICAgIG1hc2tQYXR0ZXJuOiBcIl4oXFxcXGQrPylcXFxcZHs0fSRcIixcclxuICAgICAgICBzYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGlzVXBkYXRlID0gdGhpcy5wcm9wKHRyYW5zZm9ybS5maWVsZHMuY2FyZElkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBpLmFjdGlvbih0aGlzLCAoaXNVcGRhdGUgPyAndXBkYXRlJyA6ICdzYXZlJyksIG1ha2VQYXlsb2FkKHRoaXMpKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucHJvcCh0cmFuc2Zvcm0udG9TdG9yZWZyb250RGF0YSh7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZE51bWJlcjogc2VsZi5tYXNrZWRDYXJkTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGN2djogc2VsZi5wcm9wKCdjdnYnKS5yZXBsYWNlKC9cXGQvZywgc2VsZi5tYXNrQ2hhcmFjdGVyKSxcclxuICAgICAgICAgICAgICAgICAgICBjYXJkSWQ6IGlzVXBkYXRlIHx8IHJlc1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKCdzeW5jJywgdXRpbHMuY2xvbmUoc2VsZi5kYXRhKSwgc2VsZi5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNhdmVUb0N1c3RvbWVyOiBmdW5jdGlvbiAoY3VzdG9tZXJJZCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChjYXJkSWQpIHtcclxuICAgICAgICAgICAgICAgIGNhcmRJZCA9IGNhcmRJZCB8fCBzZWxmLnByb3AoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VzdG9tZXIgPSBzZWxmLmFwaS5jcmVhdGVTeW5jKCdjdXN0b21lcicsIHsgaWQ6IGN1c3RvbWVySWQgfSk7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucGFzc0Zyb20oY3VzdG9tZXIsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1c3RvbWVyLmFkZENhcmQoc2VsZi5kYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRPcmRlckRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNhcmROdW1iZXJQYXJ0T3JNYXNrOiB0aGlzLm1hc2tlZENhcmROdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBjdnY6IHRoaXMuZGF0YS5jdnYsXHJcbiAgICAgICAgICAgICAgICBuYW1lT25DYXJkOiB0aGlzLmRhdGEubmFtZU9uQ2FyZCxcclxuICAgICAgICAgICAgICAgIHBheW1lbnRPckNhcmRUeXBlOiB0aGlzLmRhdGEucGF5bWVudE9yQ2FyZFR5cGUgfHwgdGhpcy5kYXRhLmNhcmRUeXBlLFxyXG4gICAgICAgICAgICAgICAgcGF5bWVudFNlcnZpY2VDYXJkSWQ6IHRoaXMuZGF0YS5wYXltZW50U2VydmljZUNhcmRJZCB8fCB0aGlzLmRhdGEuY2FyZElkLFxyXG4gICAgICAgICAgICAgICAgaXNDYXJkSW5mb1NhdmVkOiB0aGlzLmRhdGEuaXNDYXJkSW5mb1NhdmVkIHx8IHRoaXMuZGF0YS5wZXJzaXN0Q2FyZCxcclxuICAgICAgICAgICAgICAgIGV4cGlyZU1vbnRoOiB0aGlzLmRhdGEuZXhwaXJlTW9udGgsXHJcbiAgICAgICAgICAgICAgICBleHBpcmVZZWFyOiB0aGlzLmRhdGEuZXhwaXJlWWVhclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbn0oKSk7IiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHBvc3Rjb25zdHJ1Y3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMub24oJ3N5bmMnLCBmdW5jdGlvbiAoanNvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGpzb24gJiYganNvbi5hdXRoVGlja2V0ICYmIGpzb24uYXV0aFRpY2tldC5hY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXBpLmNvbnRleHQuVXNlckNsYWltcyhqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXBpLmZpcmUoJ2xvZ2luJywganNvbi5hdXRoVGlja2V0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYXZlUGF5bWVudENhcmQ6IGZ1bmN0aW9uICh1bm1hc2tlZENhcmREYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcywgY2FyZCA9IHRoaXMuYXBpLmNyZWF0ZVN5bmMoJ2NyZWRpdGNhcmQnLCB1bm1hc2tlZENhcmREYXRhKSxcclxuICAgICAgICAgICAgICAgIGlzVXBkYXRlID0gISEodW5tYXNrZWRDYXJkRGF0YS5wYXltZW50U2VydmljZUNhcmRJZCB8fCB1bm1hc2tlZENhcmREYXRhLmlkKTtcclxuICAgICAgICAgICAgZXJyb3JzLnBhc3NGcm9tKGNhcmQsIHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gY2FyZC5zYXZlKCkudGhlbihmdW5jdGlvbiAoY2FyZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBheWxvYWQgPSB1dGlscy5jbG9uZShjYXJkLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5jYXJkTnVtYmVyUGFydCA9IHBheWxvYWQuY2FyZE51bWJlclBhcnRPck1hc2sgfHwgcGF5bG9hZC5jYXJkTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pZCA9IHBheWxvYWQucGF5bWVudFNlcnZpY2VDYXJkSWQ7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZC5jYXJkTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQuY2FyZE51bWJlclBhcnRPck1hc2s7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZC5wYXltZW50U2VydmljZUNhcmRJZDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpc1VwZGF0ZSA/IHNlbGYudXBkYXRlQ2FyZChwYXlsb2FkKSA6IHNlbGYuYWRkQ2FyZChwYXlsb2FkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWxldGVQYXltZW50Q2FyZDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlQ2FyZChpZCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5hcGkuZGVsKCdjcmVkaXRjYXJkJywgaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFN0b3JlQ3JlZGl0czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXRzID0gdGhpcy5hcGkuY3JlYXRlU3luYygnc3RvcmVjcmVkaXRzJyk7XHJcbiAgICAgICAgICAgIGVycm9ycy5wYXNzRnJvbShjcmVkaXRzLCB0aGlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWRpdHMuZ2V0KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRTdG9yZUNyZWRpdDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXQgPSB0aGlzLmFwaS5jcmVhdGVTeW5jKCdzdG9yZWNyZWRpdCcsIHsgY29kZTogaWQgfSk7XHJcbiAgICAgICAgICAgIGVycm9ycy5wYXNzRnJvbShjcmVkaXQsIHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gY3JlZGl0LmFzc29jaWF0ZVRvU2hvcHBlcigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gYXMgb2YgMTIvMzAvMjAxMyBwYXJ0aWFsIHVwZGF0ZXMgb24gY3VzdG9tZXIgd2lsbFxyXG4gICAgICAgIC8vIGJsYW5rIG91dCB0aGVzZSB2YWx1ZXMgdW5sZXNzIHRoZXkgYXJlIGluY2x1ZGVkXHJcbiAgICAgICAgLy8gVE9ETzogcmVtb3ZlIGFzIHNvb24gYXMgVEZTIzIxNzc1IGlzIGZpeGVkXHJcbiAgICAgICAgZ2V0TWluaW11bVBhcnRpYWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdGhpcy5wcm9wKCdmaXJzdE5hbWUnKSxcclxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiB0aGlzLnByb3AoJ2xhc3ROYW1lJyksXHJcbiAgICAgICAgICAgICAgICBlbWFpbEFkZHJlc3M6IHRoaXMucHJvcCgnZW1haWxBZGRyZXNzJylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBpLmFjdGlvbih0aGlzLCAndXBkYXRlJywgdXRpbHMuZXh0ZW5kKHRoaXMuZ2V0TWluaW11bVBhcnRpYWwoKSwgdXRpbHMuY2xvbmUoZGF0YSkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7IiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8vIGhhdmVyc2luZVxyXG4gICAgLy8gQnkgTmljayBKdXN0aWNlIChuaWl4KVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25paXgvaGF2ZXJzaW5lXHJcblxyXG4gICAgdmFyIGhhdmVyc2luZSA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gcmFkaWFuc1xyXG4gICAgICAgIHZhciB0b1JhZCA9IGZ1bmN0aW9uIChudW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bSAqIE1hdGguUEkgLyAxODBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBoYXZlcnNpbmUoc3RhcnQsIGVuZCwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgbWlsZXMgPSAzOTYwXHJcbiAgICAgICAgICAgIHZhciBrbSA9IDYzNzFcclxuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuXHJcbiAgICAgICAgICAgIHZhciBSID0gb3B0aW9ucy51bml0ID09PSAna20nID8ga20gOiBtaWxlc1xyXG5cclxuICAgICAgICAgICAgdmFyIGRMYXQgPSB0b1JhZChlbmQubGF0aXR1ZGUgLSBzdGFydC5sYXRpdHVkZSlcclxuICAgICAgICAgICAgdmFyIGRMb24gPSB0b1JhZChlbmQubG9uZ2l0dWRlIC0gc3RhcnQubG9uZ2l0dWRlKVxyXG4gICAgICAgICAgICB2YXIgbGF0MSA9IHRvUmFkKHN0YXJ0LmxhdGl0dWRlKVxyXG4gICAgICAgICAgICB2YXIgbGF0MiA9IHRvUmFkKGVuZC5sYXRpdHVkZSlcclxuXHJcbiAgICAgICAgICAgIHZhciBhID0gTWF0aC5zaW4oZExhdCAvIDIpICogTWF0aC5zaW4oZExhdCAvIDIpICtcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnNpbihkTG9uIC8gMikgKiBNYXRoLnNpbihkTG9uIC8gMikgKiBNYXRoLmNvcyhsYXQxKSAqIE1hdGguY29zKGxhdDIpXHJcbiAgICAgICAgICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMSAtIGEpKVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGhyZXNob2xkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50aHJlc2hvbGQgPiAoUiAqIGMpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUiAqIGNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KSgpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgZ2V0QnlMYXRMb25nOiBmdW5jdGlvbiAob3B0cykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24oJ2xvY2F0aW9ucycsICdnZXQtYnktbGF0LWxvbmcnLCB7XHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZTogb3B0cy5sb2NhdGlvbi5jb29yZHMubGF0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICBsb25naXR1ZGU6IG9wdHMubG9jYXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb2xsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25zID0gY29sbC5kYXRhLml0ZW1zO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxvY2F0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uc1tpXS5kaXN0YW5jZSA9IGhhdmVyc2luZShvcHRzLmxvY2F0aW9uLmNvb3JkcywgeyBsYXRpdHVkZTogbG9jYXRpb25zW2ldLmdlby5sYXQsIGxvbmdpdHVkZTogbG9jYXRpb25zW2ldLmdlby5sbmcgfSkudG9GaXhlZCgxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdXRpbHMuY2xvbmUoY29sbC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZmlyZSgnc3luYycsIGRhdGEsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdldEZvclByb2R1Y3Q6IGZ1bmN0aW9uIChvcHRzKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNvbGwsXHJcbiAgICAgICAgICAgICAgICAvLyBub3QgcnVubmluZyB0aGUgbWV0aG9kIG9uIHNlbGYgc2luY2UgaXQgc2hvdWxkbid0IHN5bmMgdW50aWwgaXQncyBiZWVuIHByb2Nlc3NlZCFcclxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IG9wdHMubG9jYXRpb24gP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuYWN0aW9uKCdsb2NhdGlvbnMnLCAnZ2V0LWJ5LWxhdC1sb25nJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiBvcHRzLmxvY2F0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGU6IG9wdHMubG9jYXRpb24uY29vcmRzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgfSkgOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuZ2V0KCdsb2NhdGlvbnMnKTtcclxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdGlvbi50aGVuKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xsID0gYztcclxuICAgICAgICAgICAgICAgIHZhciBjb2RlcyA9IHV0aWxzLm1hcChjb2xsLmRhdGEuaXRlbXMsIGZ1bmN0aW9uIChsb2MpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jLmNvZGU7XHJcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcsJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5hcGkuYWN0aW9uKCdwcm9kdWN0JywgJ2dldEludmVudG9yeScsIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9kdWN0Q29kZTogb3B0cy5wcm9kdWN0Q29kZSxcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbkNvZGVzOiBjb2Rlc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGludmVudG9yeSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGosXHJcbiAgICAgICAgICAgICAgICAgICAgaWxlbixcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnMgPSBjb2xsLmRhdGEuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgaW52ZW50b3JpZXMgPSBpbnZlbnRvcnkuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRMb2NhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsb2NhdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBpbGVuID0gaW52ZW50b3JpZXMubGVuZ3RoOyBqIDwgaWxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnZlbnRvcmllc1tqXS5sb2NhdGlvbkNvZGUgPT09IGxvY2F0aW9uc1tpXS5jb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbnNbaV0ucXVhbnRpdHkgPSBpbnZlbnRvcmllc1tqXS5zdG9ja0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRzLmxvY2F0aW9uKSBsb2NhdGlvbnNbaV0uZGlzdGFuY2UgPSBoYXZlcnNpbmUob3B0cy5sb2NhdGlvbi5jb29yZHMsIHsgbGF0aXR1ZGU6IGxvY2F0aW9uc1tpXS5nZW8ubGF0LCBsb25naXR1ZGU6IGxvY2F0aW9uc1tpXS5nZW8ubG5nIH0pLnRvRml4ZWQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZlbnRvcmllcy5zcGxpY2UoaiwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0geyBpdGVtczogdXRpbHMuY2xvbmUodmFsaWRMb2NhdGlvbnMpIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoJ3N5bmMnLCBkYXRhLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KCkpOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcG9zdGNvbnN0cnVjdDogZnVuY3Rpb24gKHR5cGUsIGpzb24pIHtcclxuICAgICAgICB2YXIgYWNjZXNzVG9rZW47XHJcbiAgICAgICAgaWYgKGpzb24uYXV0aFRpY2tldCAmJiBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgYWNjZXNzVG9rZW4gPSBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgfSBlbHNlIGlmIChqc29uLmFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuID0ganNvbi5hY2Nlc3NUb2tlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBpLmNvbnRleHQuVXNlckNsYWltcyhhY2Nlc3NUb2tlbik7XHJcbiAgICAgICAgICAgIHRoaXMuYXBpLmZpcmUoJ2xvZ2luJywganNvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsInZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9kZWZhdWx0Jyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBBcGlSZWZlcmVuY2UgPSByZXF1aXJlKCcuLi9yZWZlcmVuY2UnKTtcclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZXJyb3JzLnJlZ2lzdGVyKHtcclxuICAgICAgICAnQklMTElOR19JTkZPX01JU1NJTkcnOiAnQmlsbGluZyBpbmZvIG1pc3NpbmcuJyxcclxuICAgICAgICAnUEFZTUVOVF9UWVBFX01JU1NJTkdfT1JfVU5SRUNPR05JWkVEJzogJ1BheW1lbnQgdHlwZSBtaXNzaW5nIG9yIHVucmVjb2duaXplZC4nLFxyXG4gICAgICAgICdQQVlNRU5UX01JU1NJTkcnOiAnRXhwZWN0ZWQgYSBwYXltZW50IHRvIGV4aXN0IG9uIHRoaXMgb3JkZXIgYW5kIG9uZSBkaWQgbm90LicsXHJcbiAgICAgICAgJ1BBWVBBTF9UUkFOU0FDVElPTl9JRF9NSVNTSU5HJzogJ0V4cGVjdGVkIHRoZSBhY3RpdmUgcGF5bWVudCB0byBpbmNsdWRlIGEgcGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkIGFuZCBpdCBkaWQgbm90LicsXHJcbiAgICAgICAgJ09SREVSX0NBTk5PVF9TVUJNSVQnOiAnT3JkZXIgY2Fubm90IGJlIHN1Ym1pdHRlZC4gSXMgb3JkZXIgY29tcGxldGU/JyxcclxuICAgICAgICAnQUREX0NPVVBPTl9GQUlMRUQnOiAnQWRkaW5nIGNvdXBvbiBmYWlsZWQgZm9yIHRoZSBmb2xsb3dpbmcgcmVhc29uOiB7MH0nLFxyXG4gICAgICAgICdBRERfQ1VTVE9NRVJfRkFJTEVEJzogJ0FkZGluZyBjdXN0b21lciBmYWlsZWQgZm9yIHRoZSBmb2xsb3dpbmcgcmVhc29uOiB7MH0nXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgT3JkZXJTdGF0dXMySXNDb21wbGV0ZSA9IHt9O1xyXG4gICAgT3JkZXJTdGF0dXMySXNDb21wbGV0ZVtDT05TVEFOVFMuT1JERVJfU1RBVFVTRVMuU1VCTUlUVEVEXSA9IHRydWU7XHJcbiAgICBPcmRlclN0YXR1czJJc0NvbXBsZXRlW0NPTlNUQU5UUy5PUkRFUl9TVEFUVVNFUy5BQ0NFUFRFRF0gPSB0cnVlO1xyXG4gICAgT3JkZXJTdGF0dXMySXNDb21wbGV0ZVtDT05TVEFOVFMuT1JERVJfU1RBVFVTRVMuUEVORElOR19SRVZJRVddID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgT3JkZXJTdGF0dXMySXNSZWFkeSA9IHt9O1xyXG4gICAgT3JkZXJTdGF0dXMySXNSZWFkeVtDT05TVEFOVFMuT1JERVJfQUNUSU9OUy5TVUJNSVRfT1JERVJdID0gdHJ1ZTtcclxuICAgIE9yZGVyU3RhdHVzMklzUmVhZHlbQ09OU1RBTlRTLk9SREVSX0FDVElPTlMuQUNDRVBUX09SREVSXSA9IHRydWU7XHJcblxyXG5cclxuICAgIHZhciBQYXltZW50U3RyYXRlZ2llcyA9IHtcclxuICAgICAgICBcIlBheXBhbEV4cHJlc3NcIjogZnVuY3Rpb24gKG9yZGVyLCBiaWxsaW5nSW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gb3JkZXIuY3JlYXRlUGF5bWVudCh7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5Vcmw6IGJpbGxpbmdJbmZvLnBheXBhbFJldHVyblVybCxcclxuICAgICAgICAgICAgICAgIGNhbmNlbFVybDogYmlsbGluZ0luZm8ucGF5cGFsQ2FuY2VsVXJsXHJcbiAgICAgICAgICAgIH0pLmVuc3VyZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGF5bWVudCA9IG9yZGVyLmdldEN1cnJlbnRQYXltZW50KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXBheW1lbnQpIGVycm9ycy50aHJvd09uT2JqZWN0KG9yZGVyLCAnUEFZTUVOVF9NSVNTSU5HJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXBheW1lbnQucGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkKSBlcnJvcnMudGhyb3dPbk9iamVjdChvcmRlciwgJ1BBWVBBTF9UUkFOU0FDVElPTl9JRF9NSVNTSU5HJyk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBBcGlSZWZlcmVuY2UudXJscy5wYXlwYWxFeHByZXNzICsgKEFwaVJlZmVyZW5jZS51cmxzLnBheXBhbEV4cHJlc3MuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBcInRva2VuPVwiICsgcGF5bWVudC5wYXltZW50U2VydmljZVRyYW5zYWN0aW9uSWQ7IC8vdXRpbHMuZm9ybWF0U3RyaW5nKENPTlNUQU5UUy5CQVNFX1BBWVBBTF9VUkwsIHBheW1lbnQucGF5bWVudFNlcnZpY2VUcmFuc2FjdGlvbklkKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJDcmVkaXRDYXJkXCI6IGZ1bmN0aW9uIChvcmRlciwgYmlsbGluZ0luZm8pIHtcclxuICAgICAgICAgICAgdmFyIGNhcmQgPSBvcmRlci5hcGkuY3JlYXRlU3luYygnY3JlZGl0Y2FyZCcsIGJpbGxpbmdJbmZvLmNhcmQpO1xyXG4gICAgICAgICAgICBlcnJvcnMucGFzc0Zyb20oY2FyZCwgb3JkZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gY2FyZC5zYXZlKCkudGhlbihmdW5jdGlvbihjYXJkKSB7XHJcbiAgICAgICAgICAgICAgICBiaWxsaW5nSW5mby5jYXJkID0gY2FyZC5nZXRPcmRlckRhdGEoKTtcclxuICAgICAgICAgICAgICAgIG9yZGVyLnByb3AoJ2JpbGxpbmdJbmZvJywgYmlsbGluZ0luZm8pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyLmNyZWF0ZVBheW1lbnQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIkNoZWNrXCI6IGZ1bmN0aW9uIChvcmRlciwgYmlsbGluZ0luZm8pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9yZGVyLmNyZWF0ZVBheW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGFkZENvdXBvbjogZnVuY3Rpb24oY291cG9uQ29kZSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwcGx5Q291cG9uKGNvdXBvbkNvZGUpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0KCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnRocm93T25PYmplY3Qoc2VsZiwgJ0FERF9DT1VQT05fRkFJTEVEJywgcmVhc29uLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZE5ld0N1c3RvbWVyOiBmdW5jdGlvbiAobmV3Q3VzdG9tZXJQYXlsb2FkKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuYXBpLmFjdGlvbignY3VzdG9tZXInLCAnY3JlYXRlU3RvcmVmcm9udCcsIG5ld0N1c3RvbWVyUGF5bG9hZCkudGhlbihmdW5jdGlvbiAoY3VzdG9tZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNldFVzZXJJZCgpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMudGhyb3dPbk9iamVjdChzZWxmLCAnQUREX0NVU1RPTUVSX0ZBSUxFRCcsIHJlYXNvbi5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVQYXltZW50OiBmdW5jdGlvbihleHRyYVByb3BzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFwaS5hY3Rpb24odGhpcywgJ2NyZWF0ZVBheW1lbnQnLCB1dGlscy5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiB0aGlzLmFwaS5jb250ZXh0LkN1cnJlbmN5KCkudG9VcHBlckNhc2UoKSxcclxuICAgICAgICAgICAgICAgIGFtb3VudDogdGhpcy5wcm9wKCdhbW91bnRSZW1haW5pbmdGb3JQYXltZW50JyksXHJcbiAgICAgICAgICAgICAgICBuZXdCaWxsaW5nSW5mbzogdGhpcy5wcm9wKCdiaWxsaW5nSW5mbycpXHJcbiAgICAgICAgICAgIH0sIGV4dHJhUHJvcHMgfHwge30pKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFN0b3JlQ3JlZGl0OiBmdW5jdGlvbihwYXltZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVBheW1lbnQoe1xyXG4gICAgICAgICAgICAgICAgYW1vdW50OiBwYXltZW50LmFtb3VudCxcclxuICAgICAgICAgICAgICAgIG5ld0JpbGxpbmdJbmZvOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bWVudFR5cGU6ICdTdG9yZUNyZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVDcmVkaXRDb2RlOiBwYXltZW50LnN0b3JlQ3JlZGl0Q29kZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFBheW1lbnQ6IGZ1bmN0aW9uIChwYXltZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBiaWxsaW5nSW5mbyA9IHBheW1lbnQgfHwgdGhpcy5wcm9wKCdiaWxsaW5nSW5mbycpO1xyXG4gICAgICAgICAgICBpZiAoIWJpbGxpbmdJbmZvKSBlcnJvcnMudGhyb3dPbk9iamVjdCh0aGlzLCAnQklMTElOR19JTkZPX01JU1NJTkcnKTtcclxuICAgICAgICAgICAgaWYgKCFiaWxsaW5nSW5mby5wYXltZW50VHlwZSB8fCAhKGJpbGxpbmdJbmZvLnBheW1lbnRUeXBlIGluIFBheW1lbnRTdHJhdGVnaWVzKSkgZXJyb3JzLnRocm93T25PYmplY3QodGhpcywgJ1BBWU1FTlRfVFlQRV9NSVNTSU5HX09SX1VOUkVDT0dOSVpFRCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gUGF5bWVudFN0cmF0ZWdpZXNbYmlsbGluZ0luZm8ucGF5bWVudFR5cGVdKHRoaXMsIGJpbGxpbmdJbmZvKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEFjdGl2ZVBheW1lbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHBheW1lbnRzID0gdGhpcy5wcm9wKCdwYXltZW50cycpLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlUGF5bWVudHMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKHBheW1lbnRzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHBheW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBheW1lbnRzW2ldLnN0YXR1cyA9PT0gQ09OU1RBTlRTLlBBWU1FTlRfU1RBVFVTRVMuTkVXKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVQYXltZW50cy5wdXNoKHV0aWxzLmNsb25lKHBheW1lbnRzW2ldKSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYWN0aXZlUGF5bWVudHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRDdXJyZW50UGF5bWVudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBhY3RpdmVQYXltZW50cyA9IHRoaXMuZ2V0QWN0aXZlUGF5bWVudHMoKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGFjdGl2ZVBheW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlUGF5bWVudHNbaV0ucGF5bWVudFR5cGUgIT09IFwiU3RvcmVDcmVkaXRcIikgcmV0dXJuIGFjdGl2ZVBheW1lbnRzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRBY3RpdmVTdG9yZUNyZWRpdHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgYWN0aXZlUGF5bWVudHMgPSB0aGlzLmdldEFjdGl2ZVBheW1lbnRzKCksXHJcbiAgICAgICAgICAgICAgICBjcmVkaXRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBhY3RpdmVQYXltZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2ZVBheW1lbnRzW2ldLnBheW1lbnRUeXBlID09PSBcIlN0b3JlQ3JlZGl0XCIpIGNyZWRpdHMudW5zaGlmdChhY3RpdmVQYXltZW50c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNyZWRpdHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB2b2lkUGF5bWVudDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBvYmogPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wZXJmb3JtUGF5bWVudEFjdGlvbih7XHJcbiAgICAgICAgICAgICAgICBwYXltZW50SWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogQ09OU1RBTlRTLlBBWU1FTlRfQUNUSU9OUy5WT0lEXHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJhd0pTT04pIHtcclxuICAgICAgICAgICAgICAgIGlmIChyYXdKU09OIHx8IHJhd0pTT04gPT09IDAgfHwgcmF3SlNPTiA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmF3SlNPTi5iaWxsaW5nSW5mbztcclxuICAgICAgICAgICAgICAgICAgICBvYmouZGF0YSA9IHV0aWxzLmNsb25lKHJhd0pTT04pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai51bnN5bmNlZDtcclxuICAgICAgICAgICAgICAgIG9iai5maXJlKCdzeW5jJywgcmF3SlNPTiwgb2JqLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgb2JqLmFwaS5maXJlKCdzeW5jJywgb2JqLCByYXdKU09OLCBvYmouZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNoZWNrb3V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZUFjdGlvbnMgPSB0aGlzLnByb3AoJ2F2YWlsYWJsZUFjdGlvbnMnKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQ29tcGxldGUoKSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGF2YWlsYWJsZUFjdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZhaWxhYmxlQWN0aW9uc1tpXSBpbiBPcmRlclN0YXR1czJJc1JlYWR5KSByZXR1cm4gdGhpcy5wZXJmb3JtT3JkZXJBY3Rpb24oYXZhaWxhYmxlQWN0aW9uc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXJyb3JzLnRocm93T25PYmplY3QodGhpcywgJ09SREVSX0NBTk5PVF9TVUJNSVQnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzQ29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhT3JkZXJTdGF0dXMySXNDb21wbGV0ZVt0aGlzLnByb3AoJ3N0YXR1cycpXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyIsInZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9kZWZhdWx0Jyk7XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYWRkVG9XaXNobGlzdDogZnVuY3Rpb24gKHBheWxvYWQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGxpc3QgPSB0aGlzLmFwaS5jcmVhdGVTeW5jKCd3aXNobGlzdCcsIHsgY3VzdG9tZXJBY2NvdW50SWQ6IHBheWxvYWQuY3VzdG9tZXJBY2NvdW50SWQgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3QuZ2V0T3JDcmVhdGUoKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXJyb3JzLnBhc3NGcm9tKGxpc3QsIHNlbGYpO1xyXG4gICAgICAgICAgICByZXR1cm4gbGlzdC5hZGRJdGVtKHtcclxuICAgICAgICAgICAgICAgIHF1YW50aXR5OiBwYXlsb2FkLnF1YW50aXR5LFxyXG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlOiBwYXlsb2FkLmN1cnJlbmN5Q29kZSB8fCBzZWxmLmFwaS5jb250ZXh0LkN1cnJlbmN5KCksXHJcbiAgICAgICAgICAgICAgICBsb2NhbGVDb2RlOiBwYXlsb2FkLmxvY2FsZUNvZGUgfHwgc2VsZi5hcGkuY29udGV4dC5Mb2NhbGUoKSxcclxuICAgICAgICAgICAgICAgIHByb2R1Y3Q6IHNlbGYuZGF0YVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBhZGRUb0NhcnRGb3JQaWNrdXA6IGZ1bmN0aW9uIChvcHRzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVG9DYXJ0KHV0aWxzLmV4dGVuZCh7fSwgdGhpcy5kYXRhLCB7XHJcbiAgICAgICAgICAgIGZ1bGZpbGxtZW50TWV0aG9kOiBDT05TVEFOVFMuRlVMRklMTE1FTlRfTUVUSE9EUy5QSUNLVVBcclxuICAgICAgICB9LCBvcHRzKSk7XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBnZXRTaGlwcGluZ01ldGhvZHNGcm9tQ29udGFjdDogZnVuY3Rpb24gKGNvbnRhY3QpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHNlbGYudXBkYXRlKHsgZnVsZmlsbG1lbnRDb250YWN0OiBzZWxmLnByb3AoJ2Z1bGZpbGxtZW50Q29udGFjdCcpIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRTaGlwcGluZ01ldGhvZHMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHBvc3Rjb25zdHJ1Y3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5vbignc3luYycsIGZ1bmN0aW9uIChqc29uKSB7XHJcbiAgICAgICAgICAgIGlmIChqc29uICYmIGpzb24uYXV0aFRpY2tldCAmJiBqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBpLmNvbnRleHQuVXNlckNsYWltcyhqc29uLmF1dGhUaWNrZXQuYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcGkuZmlyZSgnbG9naW4nLCBqc29uLmF1dGhUaWNrZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlQW5kTG9naW46IGZ1bmN0aW9uKHBheWxvYWQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCFwYXlsb2FkKSBwYXlsb2FkID0gdGhpcy5kYXRhO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShwYXlsb2FkKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYubG9naW4oe1xyXG4gICAgICAgICAgICAgICAgZW1haWxBZGRyZXNzOiBwYXlsb2FkLmVtYWlsQWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXlsb2FkLnBhc3N3b3JkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZVdpdGhDdXN0b21lcjogZnVuY3Rpb24gKHBheWxvYWQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQW5kTG9naW4ocGF5bG9hZCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmFwaS5hY3Rpb24oJ2N1c3RvbWVyJywgJ2NyZWF0ZScsIHtcclxuICAgICAgICAgICAgICAgIHVzZXJJZDogc2VsZi5wcm9wKCdpZCcpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoY3VzdG9tZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1c3RvbWVyLmFkZENvbnRhY3Qoe1xyXG4gICAgICAgICAgICAgICAgZW1haWw6IHNlbGYucHJvcCgnZW1haWxBZGRyZXNzJyksXHJcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWU6IHNlbGYucHJvcCgnZmlyc3ROYW1lJyksXHJcbiAgICAgICAgICAgICAgICBsYXN0TmFtZU9yU3VybmFtZTogc2VsZi5wcm9wKCdsYXN0TmFtZScpLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzczoge31cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07IiwidmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycycpLFxyXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICBlcnJvcnMucmVnaXN0ZXIoe1xyXG4gICAgICAgICdOT19JVEVNU19JTl9XSVNITElTVCc6ICdObyBpdGVtcyBpbiB3aXNobGlzdC4nLFxyXG4gICAgICAgICdOT19NQVRDSElOR19JVEVNX0lOX1dJU0hMSVNUJzogJ05vIHdpc2hsaXN0IGl0ZW0gbWF0Y2hpbmcgSUQgezB9J1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGdldEl0ZW0gPSBmdW5jdGlvbiAobGlzdCwgaXRlbSkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IGxpc3QucHJvcCgnaXRlbXMnKTtcclxuICAgICAgICBpZiAoIWl0ZW1zIHx8IGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JzLnRocm93T25PYmplY3QobGlzdCwgJ05PX0lURU1TX0lOX1dJU0hMSVNUJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gaXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtc1tpXS5pZCA9PT0gaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcnMudGhyb3dPbk9iamVjdChsaXN0LCAnTk9fTUFUQ0hJTkdfSVRFTV9JTl9XSVNITElTVCcsIGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0T3JDcmVhdGU6IGZ1bmN0aW9uIChjaWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KHsgY3VzdG9tZXJBY2NvdW50SWQ6IGNpZCB9KS50aGVuKGZ1bmN0aW9uIChsaXN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdDtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY3JlYXRlRGVmYXVsdCh7IGN1c3RvbWVyQWNjb3VudElkOiBjaWQgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkSXRlbVRvQ2FydEJ5SWQ6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZEl0ZW1Ub0NhcnQoZ2V0SXRlbSh0aGlzLCBpdGVtKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gb3ZlcnJpZGluZyBnZXQgdG8gYWx3YXlzIHVzZSBnZXRJdGVtc0J5TmFtZSB0byBnZXQgdGhlIGl0ZW1zIGNvbGxlY3Rpb25cclxuICAgICAgICAgICAgLy8gc28gaXRlbXMgYXJlIGFsd2F5cyBzb3J0ZWQgYnkgdXBkYXRlIGRhdGVcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJdGVtc0J5TmFtZSgpLnRoZW4oZnVuY3Rpb24gKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnByb3AoJ2l0ZW1zJywgaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKCdzeW5jJywgc2VsZi5kYXRhLCBzZWxmKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyIsIi8vIEJFR0lOIFVUSUxTXHJcbi8vIE1hbnkgb2YgdGhlc2UgcG9hY2hlZCBmcm9tIGxvZGFzaFxyXG5cclxuICAgIHZhciBtYXhGbGF0dGVuRGVwdGggPSAyMDtcclxuXHJcbiAgICB2YXIgTWljcm9FdmVudCA9IHJlcXVpcmUoJ21pY3JvZXZlbnQnKTtcclxuICAgIHZhciBpc05vZGUgPSB0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzLnRpdGxlID09PSBcIm5vZGVcIjtcclxuICAgIHZhciB1dGlscyA9IHtcclxuICAgICAgICBleHRlbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHNyYywgY29weSwgbmFtZSwgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1swXSxcclxuICAgICAgICAgICAgICAgIGkgPSAxLFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcclxuICAgICAgICAgICAgICAgIGlmICgob3B0aW9ucyA9IGFyZ3VtZW50c1tpXSkgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3RcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5ID0gb3B0aW9uc1tuYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3BcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gY29weSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3B5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSA9IGNvcHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb25lOiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7IC8vIGNoZWFwIGNvcHkgOilcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZsYXR0ZW46IGZ1bmN0aW9uIChvYmosIGludG8sIHByZWZpeCwgc2VwYXJhdG9yLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBpZiAoZGVwdGggPT09IDApIHRocm93IFwiQ2Fubm90IGZsYXR0ZW4gY2lyY3VsYXIgb2JqZWN0LlwiO1xyXG4gICAgICAgICAgICBpZiAoIWRlcHRoKSBkZXB0aCA9IG1heEZsYXR0ZW5EZXB0aDtcclxuICAgICAgICAgICAgaW50byA9IGludG8gfHwge307XHJcbiAgICAgICAgICAgIHNlcGFyYXRvciA9IHNlcGFyYXRvciB8fCBcIi5cIjtcclxuICAgICAgICAgICAgcHJlZml4ID0gcHJlZml4IHx8ICcnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAga2V5ID0gbjtcclxuICAgICAgICAgICAgICAgIHZhbCA9IG9ialtuXTtcclxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgIShcclxuICAgICAgICAgICAgICAgICAgICAgIHZhbCBpbnN0YW5jZW9mIEFycmF5IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWwgaW5zdGFuY2VvZiBEYXRlIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWwgaW5zdGFuY2VvZiBSZWdFeHApXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmZsYXR0ZW4odmFsLnRvSlNPTiA/IHZhbC50b0pTT04oKSA6IHZhbCwgaW50bywgcHJlZml4ICsga2V5ICsgc2VwYXJhdG9yLCBzZXBhcmF0b3IsIC0tZGVwdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50b1twcmVmaXggKyBrZXldID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGludG87XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbmhlcml0OiBmdW5jdGlvbiAocGFyZW50LCBtb3JlKSB7XHJcbiAgICAgICAgICAgIHZhciBBcGlJbmhlcml0ZWRPYmplY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25zdHJ1Y3QpIHRoaXMuY29uc3RydWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBvc3Rjb25zdHJ1Y3QpIHRoaXMucG9zdGNvbnN0cnVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBBcGlJbmhlcml0ZWRPYmplY3QucHJvdG90eXBlID0gdXRpbHMuZXh0ZW5kKG5ldyBwYXJlbnQoKSwgbW9yZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBBcGlJbmhlcml0ZWRPYmplY3Q7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXA6IGZ1bmN0aW9uIChhcnIsIGZuLCBzY29wZSkge1xyXG4gICAgICAgICAgICB2YXIgbmV3QXJyID0gW10sIGxlbiA9IGFyci5sZW5ndGg7XHJcbiAgICAgICAgICAgIHNjb3BlID0gc2NvcGUgfHwgd2luZG93O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdBcnJbaV0gPSBmbi5jYWxsKHNjb3BlLCBhcnJbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBuZXdBcnI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWR1Y2U6IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCBhY2N1bXVsYXRvcikge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAtMSxcclxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgYWNjdW11bGF0b3IgPSBjYWxsYmFjayhhY2N1bXVsYXRvciwgY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzbGljZTogZnVuY3Rpb24oYXJyYXlMaWtlT2JqLCBpeCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyYXlMaWtlT2JqLCBpeCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbmRleE9mOiAoZnVuY3Rpb24obmF0aXZlSW5kZXhPZikge1xyXG4gICAgICAgICAgICByZXR1cm4gKG5hdGl2ZUluZGV4T2YgJiYgdHlwZW9mIG5hdGl2ZUluZGV4T2YgPT09IFwiZnVuY3Rpb25cIikgPyBmdW5jdGlvbihhcnIsIHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hdGl2ZUluZGV4T2YuY2FsbChhcnIsIHZhbCk7XHJcbiAgICAgICAgICAgIH0gOiBmdW5jdGlvbiAoYXJyLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gdmFsKSByZXR1cm4gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSksXHJcbiAgICAgICAgZm9ybWF0U3RyaW5nOiBmdW5jdGlvbih0cHQpIHtcclxuICAgICAgICAgICAgdmFyIGZvcm1hdHRlZCA9IHRwdCwgb3RoZXJBcmdzID0gdXRpbHMuc2xpY2UoYXJndW1lbnRzLCAxKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG90aGVyQXJncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkID0gZm9ybWF0dGVkLnNwbGl0KCd7JyArIGkgKyAnfScpLmpvaW4ob3RoZXJBcmdzW2ldIHx8ICcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0dGVkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0T3A6IGZ1bmN0aW9uKHByb3RvLCBmbk5hbWUpIHtcclxuICAgICAgICAgICAgcHJvdG9bZm5OYW1lXSA9IGZ1bmN0aW9uIChjb25mKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcGkuYWN0aW9uKHRoaXMsIGZuTmFtZSwgY29uZik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRUeXBlOiAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcmVUeXBlID0gL1xcW29iamVjdCAoXFx3KylcXF0vO1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRoaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSByZVR5cGUuZXhlYyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpbmcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KCkpLFxyXG4gICAgICAgIGNhbWVsQ2FzZTogKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHJkYXNoQWxwaGEgPSAvLShbXFxkYS16XSkvZ2ksXHJcbiAgICAgICAgICAgICAgICBjY2NiID0gZnVuY3Rpb24gKG1hdGNoLCBsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGwudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoc3RyLCBmaXJzdENhcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChmaXJzdENhcCA/IHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zdWJzdHJpbmcoMSkgOiBzdHIpLnJlcGxhY2UocmRhc2hBbHBoYSwgY2NjYik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSgpKSxcclxuXHJcbiAgICAgICAgZGFzaENhc2U6IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciByY2FzZSA9IC8oW2Etel0pKFtBLVpdKS9nLFxyXG4gICAgICAgICAgICAgICAgcnN0ciA9IFwiJDEtJDJcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHIucmVwbGFjZShyY2FzZSwgcnN0cikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KCkpLFxyXG5cclxuICAgICAgICByZXF1ZXN0OiBpc05vZGUgPyBmdW5jdGlvbihtZXRob2QsIHVybCwgaGVhZGVycywgZGF0YSwgc3VjY2VzcywgZmFpbHVyZSwgaWZyYW1lUGF0aCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLCBhcmd1bWVudHMsIFwicmVxdWVzdFwiKTtcclxuICAgICAgICB9IDogZnVuY3Rpb24gKG1ldGhvZCwgdXJsLCBoZWFkZXJzLCBkYXRhLCBzdWNjZXNzLCBmYWlsdXJlLCBpZnJhbWVQYXRoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgeGhyO1xyXG4gICAgICAgICAgICBpZiAoaWZyYW1lUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgeGhyID0gbmV3IElmcmFtZVhIUihpZnJhbWVQYXRoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHhociA9IG5ldyAod2luZG93LlhNTEh0dHBSZXF1ZXN0ID8gd2luZG93LlhNTEh0dHBSZXF1ZXN0IDogd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKSkoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIGZhaWx1cmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IHRpbWVkIG91dC4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogJ1RJTUVPVVQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9LCB4aHIpO1xyXG4gICAgICAgICAgICB9LCA2MDAwMCk7XHJcbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGpzb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIucmVzcG9uc2VUZXh0ICYmIHhoci5yZXNwb25zZVRleHQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiVW5hYmxlIHRvIHBhcnNlIHJlc3BvbnNlOiBcIiArIHhoci5yZXNwb25zZVRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiAnVU5LTk9XTidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHhociwgZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDAgfHwgeGhyLnN0YXR1cyA9PT0gMzA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MoanNvbiwgeGhyKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlKGpzb24gfHwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IGZhaWxlZCwgbm8gcmVzcG9uc2UgZ2l2ZW4uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogeGhyLnN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgeGhyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHhoci5vcGVuKG1ldGhvZCB8fCAnR0VUJywgdXJsKTtcclxuICAgICAgICAgICAgaWYgKGhlYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGggaW4gaGVhZGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoZWFkZXJzW2hdKSB4aHIuc2V0UmVxdWVzdEhlYWRlcihoLCBoZWFkZXJzW2hdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIHhoci5zZW5kKG1ldGhvZCAhPT0gJ0dFVCcgJiYgZGF0YSk7XHJcbiAgICAgICAgICAgIHJldHVybiB4aHI7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGlwZWxpbmU6IGZ1bmN0aW9uICh0YXNrcyAvKiBpbml0aWFsQXJncy4uLiAqLykge1xyXG4gICAgICAgICAgICAvLyBTZWxmLW9wdGltaXppbmcgZnVuY3Rpb24gdG8gcnVuIGZpcnN0IHRhc2sgd2l0aCBtdWx0aXBsZVxyXG4gICAgICAgICAgICAvLyBhcmdzIHVzaW5nIGFwcGx5LCBidXQgc3Vic2VxdWVuY2UgdGFza3MgdmlhIGRpcmVjdCBpbnZvY2F0aW9uXHJcbiAgICAgICAgICAgIHZhciBydW5UYXNrID0gZnVuY3Rpb24gKGFyZ3MsIHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJ1blRhc2sgPSBmdW5jdGlvbiAoYXJnLCB0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2soYXJnKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suYXBwbHkobnVsbCwgYXJncyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdXRpbHMud2hlbi5hbGwoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkudGhlbihmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHV0aWxzLndoZW4ucmVkdWNlKHRhc2tzLCBmdW5jdGlvbiAoYXJnLCB0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1blRhc2soYXJnLCB0YXNrKTtcclxuICAgICAgICAgICAgICAgIH0sIGFyZ3MpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB3aGVuOiByZXF1aXJlKCd3aGVuJyksXHJcbiAgICAgICAgdXJpdGVtcGxhdGU6IHJlcXVpcmUoJ3VyaXRlbXBsYXRlJyksXHJcblxyXG4gICAgICAgIGFkZEV2ZW50czogZnVuY3Rpb24gKGN0b3IpIHtcclxuICAgICAgICAgICAgTWljcm9FdmVudC5taXhpbihjdG9yKTtcclxuICAgICAgICAgICAgY3Rvci5wcm90b3R5cGUub24gPSBjdG9yLnByb3RvdHlwZS5iaW5kO1xyXG4gICAgICAgICAgICBjdG9yLnByb3RvdHlwZS5vZmYgPSBjdG9yLnByb3RvdHlwZS51bmJpbmQ7XHJcbiAgICAgICAgICAgIGN0b3IucHJvdG90eXBlLmZpcmUgPSBjdG9yLnByb3RvdHlwZS50cmlnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB1dGlscztcclxuLy8gRU5EIFVUSUxTXHJcblxyXG4vKioqKioqKioqLyJdfQ==
(9)
});
