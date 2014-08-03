var DEVELOPER = 1,
    SHOPPER = 2,
    TENANT = 4,
    SITE = 8,
    MASTERCATALOG = 16,
    CATALOG = 32,
    NONE = 64,
    all,
    hOP = Object.prototype.hasOwnProperty;

// some contexts are always additive
SITE |= TENANT;
CATALOG |= MASTERCATALOG;
SHOPPER |= SITE | CATALOG;

all = {
  scopes: {
    DEVELOPER: DEVELOPER,
    SHOPPER: SHOPPER,
    TENANT: TENANT,
    SITE: SITE,
    MASTERCATALOG: MASTERCATALOG,
    CATALOG: CATALOG,
    NONE: NONE
  },
  verbs: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },
  headerPrefix: 'x-vol-',
  headers: {
    APPCLAIMS: 'app-claims',
    USERCLAIMS: 'user-claims',
    TENANT: 'tenant',
    SITE: 'site',
    MASTERCATALOG: 'mastercatalog',
    CATALOG: 'catalog',
    DATAVIEWMODE: 'dataview-mode'
  }
};

for (var h in all.headers) {
  if (hOP.call(all.headers, h)) {
    all.headers[h] = all.headerPrefix + all.headers[h];
  }
}

module.exports = all;
