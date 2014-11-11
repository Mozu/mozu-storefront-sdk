//module.exports = {
//    validateStrict: function () {
//        return this.validateAddress.apply(this, arguments);
//    },
//    validateLenient: function (conf) {
//        var self = this;
//        return this.validateAddress.apply(this, arguments).otherwise(function (error) {
//            // sink errors when validating lenient--act as if the address is fine
//            return conf;
//        });
//    }
//}