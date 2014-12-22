var rsvp = require('rsvp'),
    captions = require('node-captions'),
    path = require('path'),
    fs = require('fs'),
    Iconv = require('iconv').Iconv;


module.exports = function (from, toPath) {
  var deferred = rsvp.defer();

  var to = path.join(toPath, 'subtitle.vtt');

  var i = new Iconv('iso-8859-1', 'utf-8');
  var data = i.convert(fs.readFileSync(from));

  captions.srt.parse(data, function (err, data) {
    if (err) return deferred.reject(err);

    try {
      fs.writeFileSync(to, captions.vtt.generate(captions.srt.toJSON(data)), 'utf8');
      deferred.resolve();
    } catch (e) {
      deferred.reject(e);
    }
  });

  return deferred.promise;
};
