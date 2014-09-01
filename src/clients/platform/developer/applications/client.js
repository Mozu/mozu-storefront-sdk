var sub = require('../../../../utils/sub'),
    makeMethod = require('../../../../utils/make-method'),
    makeClient = require('../../../../utils/make-client'),
    constants = require('../../../../constants'),
    Client = require('../../../../client');

module.exports = sub(Client, {
  getAllApplications: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/{?_*}"
  }),
  getApplication: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/{applicationId}"
  }),
  getApplicationVersion: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}"
  }),
  getPackages: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages"
  }),
  getPackage: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}"
  }),
  getPackageItemsMetadata: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files"
  }),
  getPackageItemMetadata: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files/?itemPath={itempath}"
  }),
  getPackageFilesZip: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.GET,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/zip"
  }),
  addPackage: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages"
  }),
  changePackageFileNameOrPath: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files/change-name-or-path"
  }),
  addPackageFile: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.POST,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
  }),
  updatePackageFile: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.PUT,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
  }),
  deletePackageFile: makeMethod({
    scope: constants.scopes.DEVELOPER,
    method: constants.verbs.DELETE,
    url: "{+homePod}api/platform/developer/applications/applicationVersions/{applicationVersionId}/packages/{packageId}/files?filePath={filepath}"
  })
});
