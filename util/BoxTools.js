'use strict';
const fs = require('fs');
let BoxTools = function () { };

BoxTools.prototype.createNewAppUser = function (boxAdminClient, displayName) {
  return new Promise(function (resolve, reject) {
    var requestParams = {
      body: {
        name: displayName,
        is_platform_access_only: true
      }
    };

    boxAdminClient.post('/users', requestParams, boxAdminClient.defaultResponseHandler(function (err, data) {
      if (err) { reject(err) }
      console.log("New App User created!");
      console.log(data);
      resolve(data);
    }));
  });
}

BoxTools.prototype.generateUserToken = function (boxClient, boxId, userTokenExpirationPeriod) {
  return new Promise(function (resolve, reject) {
    console.log("Starting token generation...");
    console.log(boxClient.getAppUserTokens);
    boxClient.getAppUserTokens(boxId, function (err, accessTokenInfo) {
      if (err) { reject(err) }
      console.log("Setting access token...");
      console.log(accessTokenInfo);
      accessTokenInfo.expiresAt = accessTokenInfo.acquiredAtMS + userTokenExpirationPeriod;
      console.log(accessTokenInfo.expiresAt);
      console.log(new Date(accessTokenInfo.expiresAt) > Date.now());
      resolve(accessTokenInfo);
    })
  })
}

BoxTools.prototype.setupForNewAppUser = function (boxUserClient, testFileName, testFilePath, testFolderName) {
  return new Promise(function (resolve, reject) {
    console.log("Creating folder...");
    boxUserClient.folders.create('0', testFolderName, function (err, folder) {
      if (err) { reject(err) }
      console.log("Folder created!");
      var file = fs.readFileSync(testFilePath);
      console.log("Read file...");
      boxUserClient.files.uploadFile('0', testFileName, file, function (err, file) {
        console.log("File uploaded!");
        console.log(err);
        console.log(file);
        if (err) { reject(err) }
        resolve(file);
      })

    });
  });
}

module.exports = new BoxTools();