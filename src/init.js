// BEGIN INIT
var ApiContext = require('./context');
require('./affiliate-tracking-mixin').mixin(require("./interface"));
var initialGlobalContext = new ApiContext();
module.exports = initialGlobalContext;
// END INIT