var rsvp = require('rsvp'),
    airplay = require('airplay-js');


module.exports = function (url) {
  var deferred = rsvp.defer();

  var b = airplay.createBrowser();

  var found = false;

  b.on('deviceOn', function (device) {
    if (found) return;

    found = true;

    console.log('apple tv found');

    device.play(url, 0, function (res) {
      if (!res) return deferred.reject();

      deferred.resolve();
    });
  });

  b.on('deviceOff', function () {
    console.log('connection to apple tv lost');
    process.exit();
  });

  b.start();

  return deferred.promise;
};

