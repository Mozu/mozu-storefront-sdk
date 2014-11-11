var utils = require('../utils');
module.exports = {
    count: function () {
        var items = this.prop('items');
        if (!items || !items.length) return 0;
        return utils.reduce(items, function (total, item) { return total + item.quantity; }, 0);
    }
};