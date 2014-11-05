var extend = require('node.extend'),
    sub = require('./utils/sub'),
    makeMethod = require('./utils/make-method'),
    makeClient = require('./utils/make-client'),
    constants = require('./constants'),
    findWhere = require('./utils/find-where'),
    rdashAlpha = /-([\da-z])/gi,
    cccb = function (match, l) {
        return l.toUpperCase();
    },
    cutoff = constants.headerPrefix.length;

function Client(cfg) {
  extend(this, cfg);
  this.defaultRequestOptions = this.defaultRequestOptions || {};
}

extend(Client, {
  method: makeMethod,
  sub: function() {
    return makeClient(sub.apply(this, [Client].concat([].slice.call(arguments)))); 
  }
});

Client.prototype.root = function() {
  return new Client(this);
};

function camelCase (str) {
  return (str.charAt(0).toUpperCase() + str.substring(1)).replace(rdashAlpha, cccb);
};

function createAccessor(name) {
  var accessorName = camelCase(name.substring(cutoff));
  Client.prototype['get' + accessorName] = function() {
    return this.context[name];
  };
  Client.prototype['set' + accessorName] = function(val) {
    this.context[name] = this.context[name + "Id"] = val;
    return this;
  };
}

for (var h in constants.headers) {
  if (Object.prototype.hasOwnProperty.call(constants.headers, h)) {
    createAccessor(constants.headers[h]);
  }
}

function setTenantPodFromId(client, tenantId, forceDelete) {
  var tenant = findWhere(client.context.availableTenants || [], { id: tenantId });
  if (tenant) {
    client.context.tenantPod = "https://" + tenant.domain + "/";
  } else if (forceDelete) {
    delete client.context.tenantPod;
  }
}

var existingSetTenant = Client.prototype.setTenant;
Client.prototype.setTenant = function(tenantId) {
  existingSetTenant.call(this, tenantId);
  setTenantPodFromId(this, tenantId, true);
};


Client.prototype.setAvailableTenants = function(arr) {
  this.context.availableTenants = arr;
  setTenantPodFromId(this, this.getTenant());
}

extend(Client.prototype, {
  commerce: require('./clients/commerce')(Client),
  content: require('./clients/content')(Client),
  event: require('./clients/event')(Client),
  platform: require('./clients/platform')(Client)
});

module.exports = Client;
