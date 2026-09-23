/* ==================================================================================================
   @family. — check-reels.js

   THE README IN `data/reels/` ASKED FOR THIS FILE AND SAID WHEN TO WRITE IT: "A missing file is a
   dark reel. The path is not checked by anything yet, because there is nothing here to check — the
   first clip that lands is when that check is worth writing." Two have landed.

   A DARK REEL IS THE WORST SHAPE THIS COLUMN HAS. `reelPlay_` sets the `src`, the browser reports an
   error, and the ladder swaps the element for an iframe on the same address — so a clip whose path
   is one character wrong does not read as a broken link. It reads as Google's player, or as a black
   rectangle, and the column looks like a feature that half-works rather than a file that is not
   there. Nothing in the app can tell the two apart, because from a phone they are the same event.

   FOUR QUESTIONS, AND EVERY ONE OF THEM IS A FAULT THAT HAPPENED OR NEARLY DID:

     the file is there        a path typed by hand against a name nobody re-reads
     the spelling is exact    GitHub Pages is CASE-SENSITIVE and a laptop is not. Both clips arrived
                              as `.MP4`; a row saying `.mp4` would have worked on every machine it
                              was written on and 404'd in production — the `_scope.js` shape that
                              `.nojekyll` closed, in a second column
     a browser can play it    `avc1` is the one video codec every phone decodes. This check reads
                              the container rather than trusting the extension, because a `.mp4`
                              holding HEVC plays on an iPhone and not on an Android
     `moov` BEFORE `mdat`     the one that is invisible without opening the file. An MP4 whose index
                              sits at the END cannot start until the WHOLE file has arrived, so an
                              eight-megabyte clip is eight megabytes before the first frame rather
                              than a few hundred kilobytes. Every tool writes it either way and
                              nothing about the file says which

   WHAT IT CANNOT ANSWER, said here rather than implied. Whether the picture DECODES is settled by a
   phone: the Chromium in this container is built without the proprietary codecs, so `canPlayType`
   on H.264 comes back empty and a real `<video>` here always errors. Reading the container is the
   half a checker can do; the other half is one open of the live site. Same sentence this repository
   already writes about which Drive address wins.

   RUN IT:  node js/check-reels.js
================================================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ---------- WHAT COUNTS AS A PATH INTO THIS REPOSITORY --------------------------------------------
   `clipSrcs_` treats anything with a colon or a slash in it as an address and everything else as a
   Drive id. A Drive id is not this check's business — it is somebody else's server, and the ladder
   in `reelPlay_` is what deals with it. What IS this check's business is the third case: an address
   with no scheme, which is a file that has to be in the tree beside this one. */
const isRepoPath = c => !!c && !/^[a-z][a-z0-9+.-]*:/i.test(c) && c.indexOf('/') !== -1;

/* ---------- THE CLIPS, READ OUT OF THE ARRAY RATHER THAN OUT OF A COPY OF IT ----------------------
   `FEED_FACTS` is a literal in `chess.js` and the fifth field is the clip. Cut out by the same
   method `check-marking.js` uses on the marking functions: the alternative is a second list here,
   which is a second thing to keep in step — the fault recorded under `childrenOf`, under
   `link`/`source_url` and under `factsNow_`. */
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

/* ---------- THE CONTAINER, AS TOP-LEVEL BOXES -----------------------------------------------------
   An MP4 is a list of boxes, each a four-byte big-endian size and a four-byte name. Only the top
   level is walked for the order question, and `moov` is descended once for the codec: the sample
   description under each track names it, and that name is the thing a browser matches on. */
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
    if (!isRepoPath(r.clip)) { seen.push({ r: r, where: 'elsewhere' }); return; }

    const file = path.join(ROOT, r.clip);
    if (!file.startsWith(ROOT)) {
      bad.push('row ' + r.n + ': ' + r.clip + ' climbs out of the repository');
      return;
    }
    if (!fs.existsSync(file)) {
      /* THE SPELLING, NAMED SEPARATELY. A path that is right but for its case is the one that works
         on the machine it was typed on, and it is worth saying so rather than reporting a missing
         file somebody can see in the folder. */
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

    /* ---------- AND WHETHER IT HAS A FIRST FRAME TO SHOW WHILE IT DOWNLOADS ----------------------
       `feedSlide` DERIVES THE POSTER FROM THE CLIP'S OWN PATH — `x.mp4` beside `x.jpg` — so there is
       no column to keep in step and nothing to spell wrongly. What there IS, is a file that can
       quietly not be there: a `poster` that 404s draws nothing and the slide goes back to being a
       gradient for the several seconds the clip takes, which is the complaint this was added for.
       Invisible from inside the app, which is why it is counted here.

       PRINTED RATHER THAN FAILED, for the reason the weight is: a clip with no poster works, it is
       simply slower to look like something. A number somebody can act on beats a rule that refuses
       a clip. */
    const still = file.replace(/\.[a-z0-9]+$/i, '') + '.jpg';
    let poster = 0;
    try { poster = fs.existsSync(still) ? fs.statSync(still).size : 0; } catch (e) {}

    seen.push({ r: r, where: 'here', f: f, poster: poster });
  });

  console.log('\nREELS');
  seen.forEach(s => {
    if (s.where === 'elsewhere') {
      console.log('  row ' + s.r.n + '  ' + s.r.clip.slice(0, 44) + '   (not in this repository)');
      return;
    }
    console.log('  row ' + s.r.n + '  ' + s.r.clip);
    console.log('         ' + (s.f.size / 1048576).toFixed(1) + ' MB · '
      + (s.f.codecs.join(' + ') || '?') + ' · '
      + (s.f.faststart ? 'moov first' : 'MOOV LAST')
      + ' · ' + (s.poster ? 'poster ' + (s.poster / 1024).toFixed(0) + ' KB' : 'NO POSTER'));
  });
  if (!seen.length) console.log('  none');

  /* ---------- WEIGHT IS PRINTED AND NOT REFUSED ---------------------------------------------------
     The README says under about ten megabytes each is comfortable, and that is a judgement about
     somebody's data allowance rather than a fault in the file. A number somebody can act on beats a
     threshold that stops a clip going up. */
  const here = seen.filter(s => s.where === 'here');
  const heavy = here.filter(s => s.f.size > 10 * 1048576);
  const total = here.reduce((n, s) => n + s.f.size, 0);
  const noStill = here.filter(s => !s.poster);
  console.log('\nclips in this repository: ' + here.length
    + ' · ' + (total / 1048576).toFixed(1) + ' MB in all'
    + (heavy.length ? ' · ' + heavy.length + ' over 10 MB' : '')
    + (noStill.length ? ' · ' + noStill.length + ' with no poster' : ' · every one has a poster'));

  console.log('\nA REEL THAT WOULD BE DARK  (' + bad.length + ')');
  if (!bad.length) console.log('  none');
  bad.forEach(b => console.log('  ' + b));

  if (bad.length) {
    console.log('FAILED — a clip the column cannot fetch does not look like a missing file. It '
              + 'looks like the feature not working.');
    process.exitCode = 1;
  } else {
    console.log('OK — every clip named in FEED_FACTS is a file that is there, spelled the way the '
              + 'row spells it, and shaped so a phone can start it before it has all of it.');
  }
}

run();
