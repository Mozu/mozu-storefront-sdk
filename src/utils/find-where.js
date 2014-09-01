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