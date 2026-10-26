#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-talmud.js THE TALMUD (473): every tractate and daf the index lists loads and has Gemara; licences are only CC-BY-SA or public domain. */
/* Also: the files stay small, the index stays out of the boot payload, and Find and the tiles are wired. No flags, no port. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'talmud');
const bad = [];
let ix = null;
try { ix = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')); } catch (e) { bad.push('data/talmud/index.json does not parse — NOTHING was checked: ' + e.message); }
let tractates = 0, dafim = 0, amudim = 0, bytes = 0;
const OK_LIC = { g: ['CC-BY-SA'], r: ['Public Domain', 'CC-BY-SA'], t: ['Public Domain', 'CC-BY-SA'] };
if (ix) {
  if (!Array.isArray(ix.tractates) || ix.tractates.length !== 37) bad.push('the index lists ' + (ix.tractates || []).length + ' tractates, not the Bavli\'s 37');
  const chunk = ix.chunk || 10, cache = {};
  const file = (slug, k) => {
    const key = slug + '/' + k;
    if (!(key in cache)) {
      const p = path.join(DIR, slug, k + '.json');
      try { const s = fs.readFileSync(p); bytes += s.length; if (s.length > 5e6) bad.push(key + '.json is ' + s.length + ' bytes — keep each file under 5 MB'); cache[key] = JSON.parse(s); }
      catch (e) { bad.push('data/talmud/' + key + '.json does not load: ' + e.message); cache[key] = null; }
    }
    return cache[key];
  };
  (ix.tractates || []).forEach(t => {
    tractates++;
    Object.keys(t.licences || {}).forEach(k => {
      if (OK_LIC[k].indexOf(t.licences[k].license) < 0) bad.push(t.en + ': ' + k + ' is licensed "' + t.licences[k].license + '" — only CC-BY-SA or public domain may be published');
    });
    if (!t.licences || !t.licences.g) bad.push(t.en + ' names no licence for its Gemara');
    if (!t.chapters.length || t.chapters[0].from !== t.first) bad.push(t.en + '\'s first chapter does not start on its first side');
    const empty = new Set(t.empty || []);
    for (let d = Math.floor(t.first / 2) + 1; d <= Math.floor(t.last / 2) + 1; d++) {
      dafim++;
      let some = false;
      [2 * d - 2, 2 * d - 1].filter(i => i >= t.first && i <= t.last).forEach(i => {
        amudim++;
        const f = file(t.slug, Math.floor(d / chunk));
        const a = f && f.amudim[String(i)];
        if (!a) { bad.push(t.en + ' ' + d + (i % 2 ? 'b' : 'a') + ' is not in its file'); return; }
        const has = Array.isArray(a.g) && a.g.some(s => String(s).trim());
        if (has) some = true;
        else if (!empty.has(i)) bad.push(t.en + ' ' + d + (i % 2 ? 'b' : 'a') + ' has no Gemara text and is not declared empty');
        [].concat(a.g, a.r, a.t).forEach(s => { if (/<(?!\/?(big|strong|br)>)/.test(s)) bad.push(t.en + ' ' + d + ': a tag other than big, strong or br'); });
      });
      if (!some) bad.push(t.en + ' ' + d + ' has no Gemara on either side');
    }
  });
}
if (!fs.existsSync(path.join(DIR, 'LICENSE'))) bad.push('data/talmud/LICENSE is missing — the CC BY-SA text needs its attribution');
const src = n => fs.readFileSync(path.join(ROOT, n), 'utf8');
if (!/\.\.\.\(typeof talmudItems_ === 'function' \? talmudItems_\(\) : \[\]\)/.test(src('js/find.js'))) bad.push('stuffItemsRaw_ does not list talmudItems_() — the Talmud never reaches Find');
if (!/x\.kind === 'talmud'/.test(src('js/tiles.js'))) bad.push('cardActions_ has no talmud tiles — a daf could not be opened');
if (!/'talmud'/.test(src('index.html'))) bad.push('index.html does not load js/talmud.js');
if (/data\/talmud/.test(src('backend/doget.gs'))) bad.push('the backend sends the Talmud — it is a static file, never boot payload');
if (bad.length) { console.log('check-talmud: ' + bad.length + ' FAILED'); bad.slice(0, 40).forEach(b => console.log('  ' + b)); process.exit(1); }
console.log('check-talmud: ' + tractates + ' tractates, ' + dafim + ' dafim, ' + amudim + ' sides load, each daf with Gemara (' + (bytes / 1e6).toFixed(1) + ' MB)');
