var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var Config = require('../util/Config');
var Auth0Config = Config.getConfig('auth0');

router.use(jwt({
  secret: new Buffer(Auth0Config.clientSecret, 'base64'),
  audience: Auth0Config.clientId
}));

router.post('/', function(req, res, next) {
  console.log(req.body);
  console.log("HELLO!");
  res.send('A new token!');
});

module.exports = router;