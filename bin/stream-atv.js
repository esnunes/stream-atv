#!/usr/bin/env node

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    rsvp = require('rsvp'),
    rimraf = require('rimraf'),
    api = require('..');


var pkgInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), { encoding: 'utf8' }));


program
  .version(pkgInfo.version)
  .usage('[options] [video] [subtitle]')
  .option('-i, --stdin', 'Reads video file path from stdin', false)
  .parse(process.argv);


if (!program.stdin && !program.args.length) return program.help();


var ctx = {},
    VIDEO_EXT = /\.3g2$|\.3gp$|\.3gp2$|\.3gpp$|\.60d$|\.ajp$|\.asf$|\.asx$|\.avchd$|\.avi$|\.bik$|\.bix$|\.box$|\.cam$|\.dat$|\.divx$|\.dmf$|\.dv$|\.dvr-ms$|\.evo$|\.flc$|\.fli$|\.flic$|\.flv$|\.flx$|\.gvi$|\.gvp$|\.h264$|\.m1v$|\.m2p$|\.m2ts$|\.m2v$|\.m4e$|\.m4v$|\.mjp$|\.mjpeg$|\.mjpg$|\.mkv$|\.moov$|\.mov$|\.movhd$|\.movie$|\.movx$|\.mp4$|\.mpe$|\.mpeg$|\.mpg$|\.mpv$|\.mpv2$|\.mxf$|\.nsv$|\.nut$|\.ogg$|\.ogm$|\.omf$|\.ps$|\.qt$|\.ram$|\.rm$|\.rmvb$|\.swf$|\.ts$|\.vfw$|\.vid$|\.video$|\.viv$|\.vivo$|\.vob$|\.vro$|\.wm$|\.wmv$|\.wmx$|\.wrap$|\.wvx$|\.wx$|\.x264$|\.xvid$/,
    SUBTITLE_EXT = /\.srt$/;


var show = function () {
  console.log('streaming to apple tv');
};


var fail = function (err) {
  console.error('[stream-atv]', err);
};


var streamToAppleTv = function () {
  console.log('searching for apple tv device...');
  return api.streamToAppleTv(ctx.baseUrl);
};


var createPlaylist = function () {
  console.log('creating playlist');
  return api.createPlaylist(ctx.tmp, ctx.baseUrl, ctx.subtitlePath ? true : false);
};


var segmentVideo = function () {
  console.log('segmenting video...');
  return api.segmentVideo(ctx.videoPath, ctx.tmp, ctx.baseUrl);
};


var segmentSubtitle = function () {
  if (!ctx.subtitlePath) return rsvp.resolve();

  console.log('converting subtitle to vtt and segmenting it...');
  return api.convertAndSegmentSubtitle(ctx.subtitlePath, ctx.tmp, ctx.baseUrl);
};


var startServer = function () {
  var store = function (baseUrl) {
    ctx.baseUrl = baseUrl;
    console.log('http server started at [%s]', baseUrl);
  };

  return api.startServer(ctx.tmp)
    .then(store);
};


var checkVideoPath = function () {
  if (ctx.videoPath) console.log('video file [%s]', ctx.videoPath);
  if (ctx.subtitlePath) console.log('subtitle file [%s]', ctx.subtitlePath);

  if (!ctx.videoPath) return rsvp.reject('no video path found');
};


var stdin = function () {
  if (!program.stdin) {
    ctx.videoPath = program.args[0];
    if (program.args.length === 2) ctx.subtitlePath = program.args[1];

    return rsvp.resolve();
  }

  var deferred = rsvp.defer();

  var buf = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    buf += chunk;
  });

  process.stdin.on('end', function () {
    buf = buf.replace(/\r/g, '');
    buf = buf.split('\n');

    buf.forEach(function (line) {
      if (VIDEO_EXT.test(line)) ctx.videoPath = line;
      if (SUBTITLE_EXT.test(line)) ctx.subtitlePath = line;
    });

    deferred.resolve();
  });

  return deferred.promise;
};


var prepareTmp = function () {
  var store = function (tmp) {
    ctx.tmp = tmp;
    console.log('storing temporary files at [%s]', ctx.tmp);
  };

  return api.prepareTmp()
    .then(store);
};


prepareTmp()
  .then(stdin)
  .then(checkVideoPath)
  .then(startServer)
  .then(segmentSubtitle)
  .then(segmentVideo)
  .then(createPlaylist)
  .then(streamToAppleTv)
  .then(show, fail);


// error handling and graceful exit

process.stdin.resume();


var exitHandler = function (options, err) {
  if (options.cleanup && ctx.tmp) {
    console.log('removing tmp folder [ %s ]', ctx.tmp);
    rimraf.sync(ctx.tmp);
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
};


//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));


//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));


//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
