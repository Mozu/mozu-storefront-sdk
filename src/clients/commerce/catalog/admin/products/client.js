var sub = require('../../../../../utils/sub'),
    makeClient = require('../../../../../utils/make-client'),
    makeMethod = require('../../../../../utils/make-method'),
    constants = require('../../../../../constants'),
    Client = require('../../../../../client');

module.exports = sub(Client, {
  getProducts: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/?startIndex={startIndex}&pageSize={pageSize}&sortBy={sortBy}&filter={filter}&q={q}&qLimit={qLimit}&noCount={noCount}"
  }),
  getProduct: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
  }),
  getProductInCatalogs: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
  }),
  getProductInCatalog: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
  }),
  addProduct: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.POST,
    url: "{+tenantPod}api/commerce/catalog/admin/products/"
  }),
  addProductInCatalog: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.POST,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
  }),
  updateProduct: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.PUT,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
  }),
  updateProductInCatalogs: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.PUT,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
  }),
  updateProductInCatalog: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.PUT,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
  }),
  deleteProduct: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.DELETE,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
  }),
  deleteProductInCatalog: makeMethod({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.DELETE,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
  })
});