var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var Auth0Config = require('../util/Config').getConfig('auth0');

var strategy = new Auth0Strategy({
    domain:       Auth0Config.domain,
    clientID:     Auth0Config.clientId,
    clientSecret: Auth0Config.clientSecret,
    callbackURL:  Auth0Config.callbackUrl
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = strategy;