#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-hymns.js THE HYMNS SHELF (516): every hymn the index lists has words in its chunk, a public-domain source and a licence line. */
/* Also: no audio is hosted, the Spotify link is a search, the files stay out of the boot payload, and Find is wired. No flags, no port. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'hymns');
const bad = [];
let ix = null, words = 0, bytes = 0;
const by = {};
try { ix = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')); } catch (e) { bad.push('data/hymns/index.json does not parse — NOTHING was checked: ' + e.message); }
const TRADITIONS = ['Orthodox', 'Catholic', 'Anglican', 'Methodist', 'Protestant'];
if (ix) {
  if (!Array.isArray(ix.hymns) || ix.hymns.length < 200) bad.push('the index lists ' + (ix.hymns || []).length + ' hymns — the shelf was asked for a few hundred');
  const chunks = {}, seen = new Set();
  (ix.hymns || []).forEach(h => {
    const at = (h && h.id) || JSON.stringify(h).slice(0, 60);
    if (!/^HY-\d{4}$/.test(h.id) || seen.has(h.id)) bad.push(at + ': id missing, malformed or repeated');
    seen.add(h.id);
    ['title', 'author', 'tradition', 'season', 'source', 'licence', 'file'].forEach(k => { if (!String(h[k] || '').trim()) bad.push(at + ' has no ' + k); });
    if (TRADITIONS.indexOf(h.tradition) < 0) bad.push(at + ': tradition "' + h.tradition + '" is not one of ' + TRADITIONS.join(', '));
    if (h.year != null && !(h.year > 0 && h.year <= 1928)) bad.push(at + ': year ' + h.year + ' — only words written before 1929 are public domain here');
    if (!/^Public domain/.test(h.licence || '')) bad.push(at + ': licence "' + h.licence + '" — only public-domain words may be published');
    const pub = Number((String(h.source || '').match(/\b(1[5-9]\d\d)\)/) || [])[1]);
    if (!(pub > 0 && pub <= 1928)) bad.push(at + ': its source "' + h.source + '" names no publication year before 1929');
    by[h.tradition] = (by[h.tradition] || 0) + 1;
    if (!(h.file in chunks)) {
      try {
        const s = fs.readFileSync(path.join(DIR, h.file)); bytes += s.length;
        if (s.length > 1e6) bad.push(h.file + ' is ' + s.length + ' bytes — keep each chunk under 1 MB');
        chunks[h.file] = JSON.parse(s);
      } catch (e) { bad.push('data/hymns/' + h.file + ' does not load: ' + e.message); chunks[h.file] = null; }
    }
    const c = chunks[h.file], st = c && c.hymns && c.hymns[h.id];
    if (!Array.isArray(st) || !st.length || !st.every(v => typeof v === 'string' && v.trim())) { bad.push(at + ' has no verses in ' + h.file); return; }
    words++;
    if (st.some(v => /<|\bCopyright\b|©/.test(v))) bad.push(at + ': a verse carries markup or a copyright line');
  });
}
if (!fs.existsSync(path.join(DIR, 'LICENSE'))) bad.push('data/hymns/LICENSE is missing — the sources need their credit');
fs.readdirSync(DIR).forEach(f => { if (/\.(mp3|ogg|wav|m4a|flac|aac|opus)$/i.test(f)) bad.push('data/hymns/' + f + ' is audio — the audio is Spotify\'s, never hosted here'); });
const src = n => fs.readFileSync(path.join(ROOT, n), 'utf8');
const js = src('js/hymns.js'), find = src('js/find.js');
if (!/\.\.\.\(typeof hymnsItems_ === 'function' \? hymnsItems_\(\) : \[\]\)/.test(find)) bad.push('stuffItemsRaw_ does not list hymnsItems_() — the hymns never reach Find');
if (!/hymnsIndex_\(\)/.test(find)) bad.push('paintStuff never asks for the hymns index');
if (!/hymn: \{ group: 'Learning'/.test(find)) bad.push('the hymn kind has no card in find.js');
if (!/'hymns'/.test(src('index.html'))) bad.push('index.html does not load js/hymns.js');
if (!/open\.spotify\.com\/search\//.test(js) || !/Listen on Spotify/.test(js)) bad.push('js/hymns.js has no "Listen on Spotify" search tile');
if (/<audio|\.mp3/.test(js)) bad.push('js/hymns.js plays audio itself — it must only link to Spotify');
if (/data\/hymns/.test(src('backend/doget.gs'))) bad.push('the backend sends the hymns — they are static files, never boot payload');
if (bad.length) { console.log('check-hymns: ' + bad.length + ' FAILED'); bad.slice(0, 40).forEach(b => console.log('  ' + b)); process.exit(1); }
console.log('check-hymns: ' + words + ' hymns load with words, ' + Object.keys(by).map(k => by[k] + ' ' + k).join(', ') + ' (' + (bytes / 1e6).toFixed(2) + ' MB)');
