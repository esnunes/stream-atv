# stream-atv

command line interface to streaming video (including subtitles) to apple tv.

## install instructions
```bash
npm install -g stream-atv
```

## usage

```bash
```

### examples

1. stream given video and subtitle to apple tv
```bash
stream-atv ~/Movies/Public.Domain.Movie.mp4 ~/Movies/Public.Domain.Movie.srt
```

2. stream-atv might be used with [os-download](https://github.com/esnunes/os-download), [download-torrent](https://github.com/esnunes/download-torrent) and [yts-search](https://github.com/esnunes/yts-search) or [eztv-search](https://github.com/esnunes/eztv-search)
```bash
yts-search "public domain movie" -q 1080p -m | download-torrent -i -d ~/Movies/ -u -o | os-download -l pob -i | stream-atv -i
```
