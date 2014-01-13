// EXPOSE DEBUGGING STUFF
Mozu.Utils = utils;
Mozu.ApiContext = ApiContext;
Mozu.ApiInterface = ApiInterface;
Mozu.ApiObject = ApiObject;
Mozu.ApiCollection = ApiCollection;
Mozu.ApiReference = ApiReference;

Mozu._expose = function (r) {
    Mozu.lastResult = r;
    console.log(r && r.inspect ? r.inspect() : r);
};

Mozu.ApiObject.prototype.inspect = function () {
    return JSON.stringify(this.data, true, 2);
};