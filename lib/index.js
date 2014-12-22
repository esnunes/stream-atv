var mkdirp = require('./utils/mkdirp'),
    uuid = require('node-uuid'),
    os = require('os'),
    path = require('path'),
    mediasubtitlesegmenter = require('./utils/mediasubtitlesegmenter'),
    mediafilesegmenter = require('./utils/mediafilesegmenter'),
    server = require('./server'),
    ip = require('ip'),
    fs = require('fs'),
    vtt = require('./utils/vtt'),
    airplay = require('./utils/airplay');


var api = module.exports = {};


api.prepareTmp = function () {
  var basePath = path.join(os.tmpdir(), 'stream-atv', uuid.v4());

  var mkdirSubtitle = mkdirp.bind(mkdirp, path.join(basePath, 'subtitle'));
  var mkdirVideo = mkdirp.bind(mkdirp, path.join(basePath, 'video'));

  var result = function () {
    return basePath;
  };

  return mkdirSubtitle()
    .then(mkdirVideo)
    .then(result);
};


api.startServer = function (basePath) {
  var setBaseUrl = function (port) {
    return 'http://' + ip.address() + ':' + port;
  };

  return server(basePath)
    .then(setBaseUrl);
};


api.convertAndSegmentSubtitle = function (subPath, tmpFolder, baseUrl) {
  var subFolder = path.join(tmpFolder, 'subtitle');
  var vttFile = path.join(subFolder, 'subtitle.vtt');

  var segment = mediasubtitlesegmenter.bind(mediasubtitlesegmenter, vttFile, subFolder, { baseUrl: baseUrl + '/subtitle' });
  return vtt(subPath, subFolder)
    .then(segment);
};


api.segmentVideo = function (videoPath, tmpFolder, baseUrl) {
  var videoFolder = path.join(tmpFolder,  'video');

  return mediafilesegmenter(videoPath, videoFolder, { baseUrl: baseUrl + '/video' });
};


api.createPlaylist = function (tmpFolder, baseUrl, addSubtitle) {
  var lines = [];
  lines.push('#EXTM3U');

  if (addSubtitle) {
    lines.push('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",DEFAULT=YES,AUTOSELECT=YES,URI="' + baseUrl + '/subtitle/prog_index.m3u8",LANGUAGE="en"');
    lines.push('#EXT-X-STREAM-INF:BANDWIDTH=2500000,SUBTITLES="subs"');
  } else {
    lines.push('#EXT-X-STREAM-INF:BANDWIDTH=2500000');
  }

  lines.push(baseUrl + '/video/prog_index.m3u8');

  fs.writeFileSync(path.join(tmpFolder, 'prog_index.m3u8'), lines.join('\n'), { encoding: 'utf8' });
};


api.streamToAppleTv = function (baseUrl) {
  return airplay(baseUrl + '/prog_index.m3u8');
};
