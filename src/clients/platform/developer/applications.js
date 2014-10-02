var constants = require('../../../constants');

module.exports = function(Client) {
  return Client.sub({
    getAllApplications: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/{?_*}"
    }),
    getApplication: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/{applicationId}"
    }),
    getApplicationVersion: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}"
    }),
    getPackages: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages"
    }),
    getPackage: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}"
    }),
    getPackageItemsMetadata: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files"
    }),
    getPackageItemMetadata: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files/?itemPath={itempath}"
    }),
    getPackageFilesZip: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/zip"
    }),
    addPackage: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages"
    }),
    changePackageFileNameOrPath: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files/change-name-or-path"
    }),
    addPackageFile: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
    }),
    updatePackageFile: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.PUT,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
    }),
    deletePackageFile: Client.method({
      scope: constants.scopes.DEVELOPER,
      method: constants.verbs.DELETE,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
    })
  });
};
