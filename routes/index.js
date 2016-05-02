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
  //TODO: Add Box AppUser creation with Node SDK
  function (req, res) {
    console.log(req.user);
    console.log(req.user.id);
    console.log(req.user.USER_ID);
    var params = { id: req.user.id };
    var metadata = {
      address: '123th Node.js Street'
    };

    management.updateUserMetadata(params, metadata, function (err, user) {
      if (err) {
        // Handle error.
        console.error(err);
      }
      console.log(user);
      res.redirect('/user');
    });
    console.log(req.user);
  });

module.exports = router;
