'use strict';

let BoxTools = function () { };

BoxTools.prototype.generateUserToken = function (boxClient, boxId, userTokenExpirationPeriod, callback) {
  console.log("Starting token generation...");
  var userClient = boxClient.getAppAuthClient('user', boxId);
  userClient._session.tokenManager.getTokensJWTGrant('user', boxId, function (err, accessTokenInfo) {
    console.log("Setting access token...");
    if (err) {
      console.log(err);
      callback(err, null);
    }
    accessTokenInfo.expiresAt = accessTokenInfo.acquiredAtMS + userTokenExpirationPeriod;
    console.log(accessTokenInfo.expiresAt);
    console.log(new Date(accessTokenInfo.expiresAt) > Date.now());
    callback(null, accessTokenInfo);
  });
};

BoxTools.prototype.normalizeAppMetadata = function (req) {
  if ('user' in req && '_json' in req.user && 'app_metadata' in req.user._json && 'boxId' in req.user._json.app_metadata) {
    console.log("Normalizing user object...");
    req.user.app_metadata = {};
    req.user.app_metadata.boxId = req.user._json.app_metadata.boxId;
  }
  return req;
}

module.exports = new BoxTools();