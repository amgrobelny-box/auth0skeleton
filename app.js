var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var passport = require('passport');
var strategy = require('./passport-strategies/auth0-strategy');
var auth0Config = require('./util/Config').getConfig('auth0');

var Config = require('./util/Config');
var BoxConfig = Config.getConfig('box');
var BoxClient = require('box-sdk');

var routes = require('./routes/index');
var users = require('./routes/users');
var userToken = require('./routes/userToken');
var fileRoute = require('./routes/file');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: auth0Config.sessionSecret,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  var boxClient = new BoxClient({
    clientID: BoxConfig.clientId,
    clientSecret: BoxConfig.clientSecret,
    appAuth: {
      keyID: BoxConfig.jwtPublicKeyId,
      privateKey: BoxConfig.privateKeyFile,
      passphrase: BoxConfig.jwtPrivateKeyPassword
    }
  });
  req.boxClient = boxClient;
  var adminAPIClient = boxClient.getAppAuthClient('enterprise', BoxConfig.enterpriseId);
  req.adminAPIClient = adminAPIClient;
  req.userTokenExpirationPeriod = BoxConfig.userTokenExpirationPeriod;
  req.boxAccessTokenRefreshUrl = BoxConfig.boxAccessTokenRefreshUrl;
  console.log(adminAPIClient);
  next();
});

app.use('/', routes);
app.use('/user', users);
app.use('/usertoken', userToken);
app.use('/files', fileRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
