var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

router.get('/:id', ensureLoggedIn, function (req, res, next) {
  if (req.user && req.user.boxAccessTokenObject) {
    var userClient = req.boxClient.getBasicClient(req.user.boxAccessTokenObject.accessToken);
    userClient.files.get(req.params.id, null, function (err, file) {
      if (err) {
        res.redirect('/user');
        return;
      }
      res.render('fileDetail', { user: req.user, file: file });
    });
  }
});

router.get('/thumbnail/:id', function (req, res) {

  var userClient = req.boxClient.getBasicClient(req.user.boxAccessTokenObject.accessToken);
  // API call to get the thumbnail for a file.  This can return either the
  // specific thumbnail image or a URL pointing to a placeholder thumbnail.
  console.log("Inside the thumbnail request");
  userClient.files.getThumbnail(req.params.id, {}, function (err, data) {

    if (err) {
      res.status(err.statusCode || 500).json(err);
      return;
    }

    if (data.file) {
      // We got the thumbnail file, so send the image bytes back
      res.send(data.file);
    } else if (data.location) {
      // We got a placeholder URL, so redirect the user there
      res.redirect(data.location);
    } else {
      // Something went wrong, so return a 500
      res.status(500).end();
    }
  });
});

router.get('/preview/:id', function (req, res) {

  var userClient = req.boxClient.getBasicClient(req.user.boxAccessTokenObject.accessToken);
  // The Box file object has a field called "expiring_embed_link", which can
  // be used to embed a preview of the file.  We'll fetch this field only.
  userClient.files.get(req.params.id, { fields: 'expiring_embed_link' }, function (err, data) {

    if (err) {
      res.redirect('/user');
      return;
    }

    res.render('filePreview', {
      file: data
    });
  })
});

router.get('/download/:id', function (req, res) {

  var userClient = req.boxClient.getBasicClient(req.user.boxAccessTokenObject.accessToken);
  // API call to get the temporary download URL for the user's file
  userClient.files.getDownloadURL(req.params.id, null, function (err, url) {

    if (err) {
      res.redirect('/user');
      return;
    }

    // Redirect to the download URL, which will cause the user's browser to
    // start the download
    res.redirect(url);
  });
});

module.exports = router;