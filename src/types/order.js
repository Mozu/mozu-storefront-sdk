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
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.PROCESSING] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.ERRORED] = true;
    OrderStatus2IsComplete[CONSTANTS.ORDER_STATUSES.COMPLETED] = true;

    var OrderStatus2IsReady = {};
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.SUBMIT_ORDER] = true;
    OrderStatus2IsReady[CONSTANTS.ORDER_ACTIONS.ACCEPT_ORDER] = true;

    function getPaymentDate(p) {
        return new Date(p.auditInfo.createDate);
    }

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
        createPayment: function (extraProps) {
            var self = this;

            return self.api.action(self, 'createPayment', utils.extend({
                currencyCode: self.api.context.Currency().toUpperCase(),
                amount: self.prop('amountRemainingForPayment'),
                newBillingInfo: self.prop('billingInfo')
            }, extraProps || {}))/*.then(function (updatedOrder) {
                

                // creating a payment can trigger a discount (discounts now support payment types)
                // this would mean the order total can change, and the previous 'amountRemainingForPayment' which we used
                // to create the payment might not be valid. 
                return self.get().then(function () {

                    var payment = self.getActivePayments().sort(function(a, b) {
                        var aDate = getPaymentDate(a),
                            bDate = getPaymentDate(b);
                        if (aDate > bDate) return -1;
                        if (bDate > aDate) return 1;
                        return 0;
                    })[0];
                    if (payment.paymentType === "StoreCredit" || payment.paymentType === "GiftCard") {
                        return self;
                    }

                    var newRemainingBalance = self.prop('amountRemainingForPayment');

                    if (newRemainingBalance === 0) {
                        return self;
                    }

                    var newAmount = payment.amountRequested + newRemainingBalance;

                    self.voidPayment(payment.id);

                    var billingInfo = payment.billingInfo;

                    return self.api.action(self, 'createPayment', utils.extend({
                        currencyCode: self.api.context.Currency().toUpperCase(),
                        amount: newAmount,
                        newBillingInfo: billingInfo
                    }, extraProps || {}));
                    
                });
            })*/;

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
            if (payments && payments.length !== 0) {
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
                        });
                    });
                }
            }
            errors.throwOnObject(this, 'ORDER_CANNOT_SUBMIT');
        },
        isComplete: function () {
            return !!OrderStatus2IsComplete[this.prop('status')];
        },

        addExtendedProperty: function (extendedProperty) {
            // Expect extendedPropert to contain a key/value pair, if it doesn't we need to fail with incorrect data.
            if (!extendedProperty) {
                errors.throwOnObject(this, '');
            }

            return this.api.action(this, 'addExtendedProperty', {
                // Fill in the data from extendedProperty here!
                'key': extendedProperty.key,
                'value': extendedProperty.value
            });
        },

        addExtendedProperties: function (extendedProperties) {
            // Expect extendedProperties to contain a list of key/value pair, if it doesn't we need to fail with incorrect data.
            if (!extendedProperties) {
                extendedProperties = [];
            }

            return this.api.action(this, 'addExtendedProperties', extendedProperties);
        },

        removeExtendedProperties: function (extendedPropertyKeys) {
            // Expect extendedPropertyKeys to contain a list of key/value pair, if it doesn't we need to fail with incorrect data.
            if (!extendedPropertyKeys) {
                extendedPropertyKeys = [];
            }

            return this.api.action(this, 'addExtendedProperties', extendedPropertyKeys);
        }
    };
}());