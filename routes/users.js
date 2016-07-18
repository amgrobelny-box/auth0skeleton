var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var jwt = require('express-jwt');
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
  var userClient = req.boxClient.getBasicClient(req.user.boxAccessTokenObject.accessToken);
  userClient.folders.get('0', null, function(err, folder) {
    res.render('user', { user: req.user, env: loginEnv, boxAccessTokenRefreshUrl: req.boxAccessTokenRefreshUrl, baseFolder: folder  });
  });
});

router.use(jwt({
  secret: new Buffer(Auth0Config.clientSecret, 'base64'),
  audience: Auth0Config.clientId
}));

router.post('/', function (req, res, next) {
  res.send(req.user);
});

module.exports = router;
