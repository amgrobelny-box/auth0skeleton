'use strict';
var Config = require('../util/Config');
var Auth0Config = Config.getConfig('auth0');

var ManagementClient = require('auth0').ManagementClient;
var management = new ManagementClient({
  token: Auth0Config.apiToken,
  domain: Auth0Config.domain
});

let Auth0Tools = function () { };

// Used to normalize a weird JSON structure in Auth0's response
Auth0Tools.prototype.normalizeAppMetadata = function (req) {
  if ('user' in req && '_json' in req.user && 'app_metadata' in req.user._json && 'boxId' in req.user._json.app_metadata) {
    console.log("Normalizing user object...");
    req.user.app_metadata = {};
    req.user.app_metadata.boxId = req.user._json.app_metadata.boxId;
  }
  return req;
}

Auth0Tools.prototype.updateAppMetadata = function (auth0UserId, boxAppUserId) {
  return new Promise(function (resolve, reject) {
    console.log("Updating Auth0 app_metadata...");
    var params = { id: auth0UserId };
    var metadata = {
      boxId: boxAppUserId
    }
    management.updateAppMetadata(params, metadata, function (err, user) {
      if (err) { reject(err) }
      console.log("Auth0 app_metadata updated!");
      resolve(user);
    });
  });
}

module.exports = new Auth0Tools();