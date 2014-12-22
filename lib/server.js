var express = require('express'),
    rsvp = require('rsvp');


module.exports = function (basePath) {
  var deferred = rsvp.defer();

  var app = express();

  express.static.mime.define({ 'application/x-mpegURL': ['.m3u8'] });
  express.static.mime.define({ 'video/MP2T': ['.ts'] });

  app.use(function (req, res, next) {
    console.log(req.url);
    next();
  });

  app.use(express.static(basePath));

  var server = app.listen(0, '0.0.0.0', function () {
    deferred.resolve(server.address().port);
  });

  return deferred.promise;
};

