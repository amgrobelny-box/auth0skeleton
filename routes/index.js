var express = require('express');
var router = express.Router();
var passport = require('passport');

var Config = require('../util/Config');
var Auth0Config = Config.getConfig('auth0');

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
    console.log(req.user._json.app_metadata);
    if (!('app_metadata' in req.user._json) || req.user._json.app_metadata === undefined || !('box_id' in req.user._json.app_metadata)) {
      console.log("Passed check for box_id");
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
          box_id: data.id
        };

        management.updateAppMetadata(params, metadata, function (err, user) {
          if (err) {
            // Handle error.
            console.error(err);
          }
          req.user.app_metadata = user.app_metadata;
          res.redirect('/user');
        });
      }));
    } else {
      console.log("Has existing box_id");
      res.redirect('/user');
    }
  });

module.exports = router;
