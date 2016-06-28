var express = require('express');
var router = express.Router();
var passport = require('passport');

var Config = require('../util/Config');
var Auth0Config = Config.getConfig('auth0');

var BoxTools = require('../util/BoxTools');
const fs = require('fs');
const path = require('path');
const fileName = 'test.txt';
const filePath = path.join(__dirname, '../', fileName);

var loginEnv = {
  AUTH0_CLIENT_ID: Auth0Config.clientId,
  AUTH0_DOMAIN: Auth0Config.domain,
  AUTH0_CALLBACK_URL: Auth0Config.callbackUrl || 'http://localhost:3000/callback'
}

var ManagementClient = require('auth0').ManagementClient;
var management = new ManagementClient({
  token: Auth0Config.apiToken,
  domain: Auth0Config.domain
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express', env: loginEnv });
});

router.get('/login',
  function (req, res) {
    res.render('login', { env: loginEnv });
  });

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function (req, res) {
    if (!('app_metadata' in req.user._json) || req.user._json.app_metadata === undefined || !('boxId' in req.user._json.app_metadata)) {
      console.log("Creating new App User and assigning boxId...");
      var requestParams = {
        body: {
          name: req.user.displayName,
          is_platform_access_only: true
        }
      };
      req.adminAPIClient.post('/users', requestParams, req.adminAPIClient.defaultResponseHandler(function (err, data) {
        console.log(err);
        console.log(data);
        var params = { id: req.user.id };
        var metadata = {
          boxId: data.id
        };

        management.updateAppMetadata(params, metadata, function (err, user) {
          if (err) {
            // Handle error.
            console.error(err);
          }
          req.user.app_metadata = user.app_metadata;
          BoxTools.generateUserToken(req.boxClient, req.user.app_metadata.boxId, req.userTokenExpirationPeriod, function (err, accessTokenInfo) {
            if (err) {
              console.log(err);
            }
            req.user.boxAccessTokenObject = accessTokenInfo;
            var userClient = req.boxClient.getBasicClient(accessTokenInfo.accessToken);
            userClient.folders.create('0', "Test Folder", function (err, folder) {
              var file = fs.readFileSync(filePath);
              userClient.files.uploadFile('0', fileName, file, function (err, file) {
                res.redirect('/user');
              })
            });
          });
        });
      }));
    } else {
      console.log("Has existing boxId");
      req = BoxTools.normalizeAppMetadata(req);
      BoxTools.generateUserToken(req.boxClient, req.user.app_metadata.boxId, req.userTokenExpirationPeriod, function (err, accessTokenInfo) {
        if (err) {
          console.log(err);
        }
        req.user.boxAccessTokenObject = accessTokenInfo;
        console.log(accessTokenInfo);
        res.redirect('/user');
      });
    }
  });

module.exports = router;
