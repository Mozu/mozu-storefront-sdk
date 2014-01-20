var utils = require('../utils');
module.exports = {
    count: function () {
        return this.data.totalQuantity || 0;
    }
};