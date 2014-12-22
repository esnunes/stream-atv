var path = require('path'),
    fs = require('fs'),
    rsvp = require('rsvp');


module.exports = function (fullPath) {
  var folders = fullPath.split(path.sep);

  var result = folders.reduce(function (prev, folder) {
    if (prev instanceof Error) return prev;

    var p = '/' + folder;
    if (prev) p = path.join(prev, folder);

    try {
      fs.mkdirSync(p);
    } catch (e) {
      if (e.code !== 'EEXIST') return e;
    }

    return p;
  });

  if (result instanceof Error) return rsvp.reject(result);

  return rsvp.resolve(result);
};
