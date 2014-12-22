var execFile = require('child_process').execFile,
    rsvp = require('rsvp');


module.exports = function (from, to, opts) {
  var deferred = rsvp.defer();

  opts = opts || {};

  var args = [ '-f', to ];

  if (opts.baseUrl) args.push('-b', opts.baseUrl);

  args.push(from);

  execFile('mediasubtitlesegmenter', args, null, function (err, stdout, stderr) {
    // jshint unused:false
    if (err) return deferred.reject(err);

    deferred.resolve(stdout);
  });

  return deferred.promise;
};
