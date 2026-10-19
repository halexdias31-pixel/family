require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-reels.js THE README IN `data/reels/` ASKED FOR THIS FILE AND SAID WHEN TO WRITE IT: § */

const fs = require('fs');
/* THE SAME TEST `clipPlayable_` MAKES, written twice on purpose: § */
const EMBED_ONLY = /(?:^|\/\/)(?:[a-z0-9-]+\.)*(?:instagram\.com|drive\.google\.com|docs\.google\.com)\//i;
/* A YOUTUBE ADDRESS, EVERY SHAPE IT IS COPIED IN — and an id of exactly eleven characters, so a
   channel or a playlist page is not mistaken for a video. Copied for the reason the line above is. */
const YT_ID = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i;
const YT_HOST = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:youtube\.com|youtube-nocookie\.com|youtu\.be)(?:[\/?#]|$)/i;
const ytId = c => (String(c || '').trim().match(YT_ID) || [])[1] || '';
const playable = c => !!c && !EMBED_ONLY.test(c) && (!!ytId(c) || (!YT_HOST.test(c)
  && (/^[a-z][a-z0-9+.-]*:/i.test(c) ? /^https?:\/\//i.test(c) : c.indexOf('/') !== -1)));
const path = require('path');
const { cutFrom } = require('./check-marks-load.js');

const ROOT = path.join(__dirname, '..');

/* ---------- WHAT COUNTS AS A PATH INTO THIS REPOSITORY § */
const isRepoPath = c => !!c && !/^[a-z][a-z0-9+.-]*:/i.test(c) && c.indexOf('/') !== -1;

/* ---------- THE CLIPS, READ OUT OF THE ARRAY RATHER THAN OUT OF A COPY OF IT § */
function clips() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'chess.js'), 'utf8');
  const at = src.indexOf('const FEED_FACTS = [');
  if (at === -1) return null;
  let i = src.indexOf('[', at + 19), depth = 0, end = -1;
  for (let k = i; k < src.length; k++) {
    if (src[k] === '[') depth++;
    else if (src[k] === ']') { depth--; if (!depth) { end = k + 1; break; } }
  }
  if (end === -1) return null;
  let rows;
  try { rows = eval(src.slice(i, end)); } catch (e) { return null; }
  return rows.map((r, n) => ({ n: n + 1, subject: r[0], heading: r[1], clip: String(r[4] || '') }))
             .filter(r => r.clip);
}

/* ---------- THE CONTAINER, AS TOP-LEVEL BOXES § */
function boxes(buf, start, end) {
  const out = [];
  let at = start;
  while (at + 8 <= end) {
    let size = buf.readUInt32BE(at);
    const name = buf.toString('latin1', at + 4, at + 8);
    let head = 8;
    if (size === 1) { size = Number(buf.readBigUInt64BE(at + 8)); head = 16; }
    if (size === 0) size = end - at;
    if (size < head) break;
    out.push({ name: name, at: at, size: size, body: at + head });
    at += size;
  }
  return out;
}

function codecsIn(buf, moov) {
  const found = [];
  const walk = (from, to) => boxes(buf, from, to).forEach(b => {
    if (b.name === 'trak' || b.name === 'mdia' || b.name === 'minf' || b.name === 'stbl') {
      walk(b.body, b.at + b.size);
    } else if (b.name === 'stsd') {
      boxes(buf, b.body + 8, b.at + b.size).forEach(e => found.push(e.name));
    }
  });
  walk(moov.body, moov.at + moov.size);
  return found;
}

const VIDEO_OK = ['avc1'];                     // what every phone decodes
const AUDIO_OK = ['mp4a'];
const VIDEO_ANY = ['avc1', 'avc3', 'hvc1', 'hev1', 'av01', 'vp09', 'mp4v'];

function look(file) {
  const buf = fs.readFileSync(file);
  const tops = boxes(buf, 0, buf.length);
  const names = tops.map(b => b.name);
  const moov = tops.find(b => b.name === 'moov');
  const mdat = tops.find(b => b.name === 'mdat');
  return {
    size: buf.length,
    ftyp: names[0] === 'ftyp',
    faststart: !!moov && !!mdat && moov.at < mdat.at,
    codecs: moov ? codecsIn(buf, moov) : [],
    tops: names,
  };
}

/* THE APP'S OWN TEST, cut out of games.js by name with the repository's one cutter § */
function appClips_() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'games.js'), 'utf8');
  const names = ['CLIP_EMBED_ONLY', 'CLIP_YT_HOST', 'clipPlayable_', 'clipYt_', 'clipSrc_', 'vidYouTubeId_'];
  const parts = names.map(n => cutFrom(src, n));
  if (parts.some(x => !x)) return null;
  try {
    return new Function(parts.join('\n')
      + '\nreturn { clipPlayable_: clipPlayable_, clipSrc_: clipSrc_, vidYouTubeId_: vidYouTubeId_ };')();
  } catch (e) { return null; }
}

function run() {
  const rows = clips();
  if (!rows) {
    console.log('FAILED — FEED_FACTS could not be read out of js/chess.js. A check that cannot '
              + 'reach its subject must not report that the subject is fine.');
    process.exitCode = 1;
    return;
  }

  const bad = [];
  const seen = [];

  rows.forEach(r => {
    if (!playable(r.clip)) {
      bad.push('row ' + r.n + ': ' + JSON.stringify(r.clip.slice(0, 60)) + (YT_HOST.test(r.clip)
        ? ' is a YouTube page with no one video in it (a channel, a playlist, a search). Name the '
          + 'video: a watch, Shorts or youtu.be address'
        : ' can only be played in somebody else\'s embedded player (a Drive file or an Instagram '
          + 'post). Embedded reels were removed — put the video file in data/reels/ and name its path'));
      return;
    }
    /* ---------- A YOUTUBE ROW: ONE VIDEO, AND NOBODY'S SHARE TAG ON IT § */
    const yt = ytId(r.clip);
    if (yt) {
      if (/[?&]si=/i.test(r.clip)) {
        bad.push('row ' + r.n + ': ' + r.clip + ' carries a ?si= share tag — it identifies who shared '
               + 'it and the video plays the same without it. Cut it off: '
               + r.clip.replace(/[?&]si=[^&#]*/i, '').replace(/[?&]$/, ''));
        return;
      }
      seen.push({ r: r, where: 'youtube', id: yt });
      return;
    }
    if (!isRepoPath(r.clip)) { seen.push({ r: r, where: 'elsewhere' }); return; }

    const file = path.join(ROOT, r.clip);
    if (!file.startsWith(ROOT)) {
      bad.push('row ' + r.n + ': ' + r.clip + ' climbs out of the repository');
      return;
    }
    if (!fs.existsSync(file)) {
      /* THE SPELLING, NAMED SEPARATELY. § */
      const dir = path.dirname(file), base = path.basename(file);
      const near = fs.existsSync(dir)
        ? fs.readdirSync(dir).find(f => f.toLowerCase() === base.toLowerCase()) : null;
      bad.push(near
        ? 'row ' + r.n + ': ' + r.clip + ' is not there — the file is spelled "' + near
          + '". Pages is case-sensitive and a laptop is not'
        : 'row ' + r.n + ': ' + r.clip + ' — no such file');
      return;
    }

    const f = look(file);
    if (!f.ftyp) bad.push('row ' + r.n + ': ' + r.clip + ' does not open with an ftyp box — it is '
                        + 'not an MP4 whatever it is called');
    if (!f.faststart) bad.push('row ' + r.n + ': ' + r.clip + ' has its moov AFTER its mdat, so a '
                        + 'phone downloads all ' + (f.size / 1048576).toFixed(1) + ' MB before the '
                        + 'first frame. Re-write it with faststart');
    const vid = f.codecs.filter(c => VIDEO_ANY.indexOf(c) !== -1);
    if (!vid.length) bad.push('row ' + r.n + ': ' + r.clip + ' has no video track this knows about '
                        + '(' + (f.codecs.join(', ') || 'no sample descriptions') + ')');
    else if (!vid.some(c => VIDEO_OK.indexOf(c) !== -1))
      bad.push('row ' + r.n + ': ' + r.clip + ' is ' + vid.join('/') + ' rather than avc1 — it will '
             + 'play on some phones and show nothing on others');

    /* ---------- AND WHETHER IT HAS A FIRST FRAME TO SHOW WHILE IT DOWNLOADS § */
    const still = file.replace(/\.[a-z0-9]+$/i, '') + '.jpg';
    let poster = 0;
    try { poster = fs.existsSync(still) ? fs.statSync(still).size : 0; } catch (e) {}

    seen.push({ r: r, where: 'here', f: f, poster: poster });
  });

  console.log('\nREELS');
  seen.forEach(s => {
    if (s.where === 'youtube') {
      console.log('  row ' + s.r.n + '  ' + s.r.clip.slice(0, 60) + '   (YouTube ' + s.id
        + ', driven by the column — no file here; its poster is YouTube\'s thumbnail)');
      return;
    }
    if (s.where === 'elsewhere') {
      console.log('  row ' + s.r.n + '  ' + s.r.clip.slice(0, 60) + '   (a file on another server)');
      return;
    }
    console.log('  row ' + s.r.n + '  ' + s.r.clip);
    console.log('         ' + (s.f.size / 1048576).toFixed(1) + ' MB · '
      + (s.f.codecs.join(' + ') || '?') + ' · '
      + (s.f.faststart ? 'moov first' : 'MOOV LAST')
      + ' · ' + (s.poster ? 'poster ' + (s.poster / 1024).toFixed(0) + ' KB' : 'NO POSTER'));
  });
  if (!seen.length) console.log('  none');

  /* ---------- WEIGHT IS PRINTED AND NOT REFUSED § */
  const here = seen.filter(s => s.where === 'here');
  const heavy = here.filter(s => s.f.size > 10 * 1048576);
  const total = here.reduce((n, s) => n + s.f.size, 0);
  const noStill = here.filter(s => !s.poster);
  console.log('\nclips in this repository: ' + here.length
    + ' · ' + (total / 1048576).toFixed(1) + ' MB in all'
    + (heavy.length ? ' · ' + heavy.length + ' over 10 MB' : '')
    + (noStill.length ? ' · ' + noStill.length + ' with no poster' : ' · every one has a poster'));

  /* ---------- THE COPY ABOVE, HELD AGAINST THE APP'S OWN FUNCTIONS § */
  const app = appClips_();
  if (!app) {
    bad.push('clipPlayable_, clipSrc_ and vidYouTubeId_ could not be cut out of js/games.js — renamed? '
           + 'This check cannot say the app agrees with it without them');
  } else {
    const CASES = [
      ['data/reels/archetest.mp4', true, ''],
      ['https://example.org/clip.mp4', true, ''],
      ['https://youtube.com/shorts/jD2Yy_wCBLE', true, 'jD2Yy_wCBLE'],
      ['https://www.youtube.com/watch?v=abcdefghijk', true, 'abcdefghijk'],
      ['https://youtu.be/abcdefghijk', true, 'abcdefghijk'],
      ['https://www.youtube.com/embed/abcdefghijk', true, 'abcdefghijk'],
      ['https://www.youtube-nocookie.com/embed/abcdefghijk', true, 'abcdefghijk'],
      ['https://m.youtube.com/watch?feature=share&v=abcdefghijk', true, 'abcdefghijk'],
      ['1AbCdEfGhIjKlMnOpQrStUvWxYz012345', false, ''],
      ['https://drive.google.com/file/d/1AbCdEfGhIjK/view', false, ''],
      ['https://drive.google.com/uc?export=download&id=1AbCdEfGhIjK', false, ''],
      ['https://www.instagram.com/reel/Cabcdefghij/', false, ''],
      ['https://m.instagram.com/reel/Cabcdefghij/', false, ''],
      ['https://www.youtube.com/@examplechannel', false, ''],
      ['https://www.youtube.com/playlist?list=PLabcdefghijklmnop', false, ''],
      ['ftp://example.org/clip.mp4', false, ''],
    ];
    const say = (c, what, want, mine, theirs) => {
      if (mine !== want) bad.push('this check\'s copy says ' + JSON.stringify(c) + ' ' + what + ' is '
        + JSON.stringify(mine) + ', and it should be ' + JSON.stringify(want));
      if (theirs !== want) bad.push('js/games.js says ' + JSON.stringify(c) + ' ' + what + ' is '
        + JSON.stringify(theirs) + ', and it should be ' + JSON.stringify(want));
    };
    let asked = 0;
    CASES.forEach(([c, ok, id]) => {
      say(c, 'playable', ok, playable(c), !!app.clipPlayable_(c));
      say(c, '→ YouTube id', id, ytId(c), app.vidYouTubeId_(c) || '');
      if (id && app.clipSrc_(c) !== '') bad.push('js/games.js hands the YouTube clip ' + c
        + ' to a <video> as its src — a web page is not a file');
      asked++;
    });
    rows.forEach(r => {
      if (playable(r.clip) !== !!app.clipPlayable_(r.clip)) bad.push('row ' + r.n + ': this check and '
        + 'js/games.js disagree about whether ' + r.clip + ' is a reel');
    });
    console.log('\nthe app\'s clipPlayable_ / vidYouTubeId_ asked ' + asked + ' addresses and every row; '
      + 'this file\'s copy asked the same');
  }

  console.log('\nA REEL THAT WOULD BE DARK  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  bad.forEach(b => console.log('  ' + b));

  if (bad.length) {
    console.log('FAILED — a clip the column cannot fetch does not look like a missing file. It '
              + 'looks like the feature not working.');
    process.exitCode = 1;
  } else {
    console.log('OK — every clip named in FEED_FACTS is a file that is there, spelled the way the '
              + 'row spells it, and shaped so a phone can start it before it has all of it — or one '
              + 'YouTube video, with nobody\'s share tag on it.');
  }
}

run();
