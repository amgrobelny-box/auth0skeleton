var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var Config = require('../util/Config');
var Auth0Config = Config.getConfig('auth0');

var BoxTools = require('../util/BoxTools');

router.use(jwt({
  secret: new Buffer(Auth0Config.clientSecret, 'base64'),
  audience: Auth0Config.clientId
}));

router.post('/', function (req, res, next) {

  BoxTools.generateUserToken(req.boxClient, req.user.app_metadata.boxId, req.userTokenExpirationPeriod)
    .then(function (accessTokenInfo) {
      res.send(accessTokenInfo);
    })
    .catch(function (err) {
      res.send(err);
    });
});

module.exports = router;