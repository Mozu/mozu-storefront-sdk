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