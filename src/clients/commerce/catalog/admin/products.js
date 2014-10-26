var constants = require('../../../../constants'),
    Client = require('../../../../client');

module.exports = function(Client) {
  return Client.sub({
    getProducts: Client.method({
      url: "{+tenantPod}api/commerce/catalog/admin/products/?startIndex={startIndex}&pageSize={pageSize}&sortBy={sortBy}&filter={filter}&q={q}&qLimit={qLimit}&noCount={noCount}"
    }),
    getProduct: Client.method({
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
    }),
    getProductInCatalogs: Client.method({
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
    }),
    getProductInCatalog: Client.method({
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
    }),
    addProduct: Client.method({
      method: constants.verbs.POST,
      url: "{+tenantPod}api/commerce/catalog/admin/products/"
    }),
    addProductInCatalog: Client.method({
      method: constants.verbs.POST,
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
    }),
    updateProduct: Client.method({
      method: constants.verbs.PUT,
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
    }),
    updateProductInCatalogs: Client.method({
      method: constants.verbs.PUT,
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs"
    }),
    updateProductInCatalog: Client.method({
      method: constants.verbs.PUT,
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
    }),
    deleteProduct: Client.method({
      method: constants.verbs.DELETE,
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}"
    }),
    deleteProductInCatalog: Client.method({
      method: constants.verbs.DELETE,
      url: "{+tenantPod}api/commerce/catalog/admin/products/{productCode}/ProductInCatalogs/{catalogId}"
    })
  });
};