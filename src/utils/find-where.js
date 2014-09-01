/**
 * Utility function to look up an item from an array based on a set of properties, compare Underscore _.findWhere
 * @param  {Array} arr   The array to search
 * @param  {Object} props The properties a matching object must have
 * @return {Object, undefined}       The matching array member
 */
module.exports = function(arr, props) {
  outer: for (var i = arr.length - 1; i >= 0; i--) {
    for (var p in props) {
      if (!arr[i].hasOwnProperty(p) || arr[i][p] !== props[p]) {
        continue outer;
      }
    }
    return arr[i];
  }
};