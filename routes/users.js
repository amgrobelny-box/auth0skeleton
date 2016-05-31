var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var router = express.Router();

var Config = require('../util/Config');
var Auth0Config = Config.getConfig('auth0');
var loginEnv = {
  AUTH0_CLIENT_ID: Auth0Config.clientId,
  AUTH0_DOMAIN: Auth0Config.domain,
  AUTH0_CALLBACK_URL: Auth0Config.callbackUrl || 'http://localhost:3000/callback'
}

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  console.log("This is the user model...");
  console.log(req.user);
  if('user' in req && '_json' in req.user && 'app_metadata' in req.user._json && 'box_id' in req.user._json.app_metadata) {
    console.log("Normalizing user object...");
    req.user.app_metadata = {};
    req.user.app_metadata.box_id = req.user._json.app_metadata.box_id;
  }
  res.render('user', { user: req.user, env: loginEnv  });
});

module.exports = router;
