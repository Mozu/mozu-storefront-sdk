var extend = require('node.extend'),
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

extend(Client.prototype, {
  commerce: makeClient('commerce'),
  // content: makeClient('./content/client'),
  // event: makeClient('./event/client'),
  platform: makeClient('platform'),
  root: function() {
    return new Client(this);
  },
});

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


var u = require('util');
Client.prototype.setAvailableTenants = function(arr) {
  this.context.availableTenants = arr;
  setTenantPodFromId(this, this.getTenant());
}

module.exports = Client;
