var constants = require('../../../constants');

module.exports = function(Client) {
  return Client.sub({
    getAllApplications: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/{?_*}"
    }),
    getApplication: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/{applicationId}"
    }),
    getApplicationVersion: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}"
    }),
    getPackages: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages"
    }),
    getPackage: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}"
    }),
    getPackageItemsMetadata: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files"
    }),
    getPackageItemMetadata: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files/?itemPath={itempath}"
    }),
    getPackageFilesZip: Client.method({
      method: constants.verbs.GET,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/zip"
    }),
    addPackage: Client.method({
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages"
    }),
    changePackageFileNameOrPath: Client.method({
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files/change-name-or-path"
    }),
    addPackageFile: Client.method({
      method: constants.verbs.POST,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
    }),
    updatePackageFile: Client.method({
      method: constants.verbs.PUT,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
    }),
    deletePackageFile: Client.method({
      method: constants.verbs.DELETE,
      url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
    })
  });
};
