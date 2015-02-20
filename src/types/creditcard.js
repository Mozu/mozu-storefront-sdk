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