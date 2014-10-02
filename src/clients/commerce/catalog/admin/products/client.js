var constants = require('../../../../../constants'),
    Client = require('../../../../../client');

module.exports = Client.sub({
  getProducts: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/?startIndex={startIndex}&pageSize={pageSize}&sortBy={sortBy}&filter={filter}&q={q}&qLimit={qLimit}&noCount={noCount}"
  }),
  getProduct: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
  }),
  getProductInCatalogs: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
  }),
  getProductInCatalog: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
  }),
  addProduct: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.POST,
    url: "{+tenantPod}api/commerce/catalog/admin/products/"
  }),
  addProductInCatalog: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.POST,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
  }),
  updateProduct: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.PUT,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
  }),
  updateProductInCatalogs: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.PUT,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
  }),
  updateProductInCatalog: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.PUT,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
  }),
  deleteProduct: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.DELETE,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
  }),
  deleteProductInCatalog: Client.method({
    scope: constants.scopes.MASTERCATALOG,
    method: constants.verbs.DELETE,
    url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
  })
});