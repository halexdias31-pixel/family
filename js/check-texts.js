#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-texts.js MORE WRITINGS (513): every text in data/texts/index.json loads, a unit a card, each with a source and a licence. */
/* Also: every file under 2 MB, Hebrew is Hebrew and Greek is Greek, LICENSE names every folder, the items are built and keyed once,
   a scripture-like text is held to scriptureMinAge_, and Find is wired. No flags, no port. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'texts');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const bad = [], said = [];
let ix = null;
try { ix = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')); } catch (e) { bad.push('data/texts/index.json does not parse — NOTHING was checked: ' + e.message); }
let lic = '';
try { lic = fs.readFileSync(path.join(DIR, 'LICENSE'), 'utf8'); } catch (e) { bad.push('data/texts/LICENSE is missing'); }
const units = p => p[2] === 0 ? 1 : Array.isArray(p[2]) ? p[2].length : Number(p[2]);
const SCRIPT = { he: /[א-ת]/, grc: /[Ͱ-Ͽἀ-῿]/, en: /[A-Za-z]/ };
let total = 0, bytes = 0;
if (ix) {
  if (!Array.isArray(ix.texts) || ix.texts.length < 1) bad.push('the index lists no texts');
  const ids = new Set();
  (ix.texts || []).forEach(t => {
    if (ids.has(t.id)) bad.push('two texts are called ' + t.id);
    ids.add(t.id);
    ['writing', 'text', 'lang', 'source', 'licence', 'url', 'unit'].forEach(k => { if (!t[k]) bad.push(t.id + ' has no ' + k); });
    if (typeof t.scripture !== 'boolean') bad.push(t.id + ' does not say whether it is scripture-like (the age rule)');
    if (!/public domain|CC BY-SA/i.test(t.licence || '')) bad.push(t.id + '\'s licence is "' + t.licence + '" — only public domain or CC BY-SA may be published');
    if (lic.indexOf('\n' + t.id + '/') < 0 && lic.indexOf(t.id + '/ ') !== 0) bad.push('data/texts/LICENSE does not name ' + t.id + '/');
    let cards = 0, size = 0;
    (t.works || []).forEach(w => {
      if (!w.file || w.file.split('/')[0] !== t.id) bad.push(t.id + ': ' + w.name + ' is filed outside its own folder (' + w.file + ')');
      let d = null, raw = null;
      try { raw = fs.readFileSync(path.join(DIR, w.file)); d = JSON.parse(raw); } catch (e) { bad.push(t.id + ': ' + w.file + ' does not load: ' + e.message); return; }
      size += raw.length;
      if (raw.length > 2e6) bad.push(w.file + ' is ' + raw.length + ' bytes — keep each file under 2 MB');
      if (d.text !== t.id || !Array.isArray(d.chapters) || d.chapters.length !== w.parts.length) {
        bad.push(w.file + ' holds ' + (d.chapters || []).length + ' chapters for ' + w.parts.length + ' in the index');
        return;
      }
      w.parts.forEach((p, i) => {
        const want = units(p), got = d.chapters[i];
        if (!Array.isArray(got) || got.length !== want) bad.push(w.file + ' ' + (p[0] || w.name) + ': ' + (got || []).length + ' units, the index says ' + want);
        else got.forEach((s, j) => {
          if (typeof s !== 'string' || !s.trim()) bad.push(w.file + ' ' + p[0] + ' unit ' + (j + 1) + ' is empty');
          else if (!SCRIPT[t.lang] || !SCRIPT[t.lang].test(s)) bad.push(w.file + ' ' + p[0] + ' unit ' + (j + 1) + ' is not in ' + t.lang + ': ' + s.slice(0, 60));
        });
        cards += want;
      });
    });
    total += cards; bytes += size;
    said.push(t.id + ' ' + cards + ' cards, ' + size + ' bytes');
  });
}

/* THE ITEMS, built by js/texts.js itself: one per unit, keys unique, the age rule on scripture-like texts. */
if (ix) {
  const ctx = { window: {}, BIBLE_SHELF: 'Books', SCRIPTURE_SUBJECT: () => 'Religious Studies', scriptureMinAge_: () => 18, Array, String, Number, Promise };
  let adult = true;
  ctx.viewerOfAge_ = () => adult;
  vm.createContext(ctx);
  try {
    vm.runInContext(src('js/texts.js') + '\n;this.T = TEXTS; this.items = textsItems_;', ctx);
    ctx.T.index = ix;
    const all = ctx.items();
    if (all.length !== total) bad.push('textsItems_ makes ' + all.length + ' items for ' + total + ' units');
    const keys = new Set(all.map(x => x.key));
    if (keys.size !== all.length) bad.push((all.length - keys.size) + ' items share a key');
    all.forEach(x => {
      const t = ix.texts.find(v => v.id === x.tx.t);
      if (t.scripture && x.min_age !== 18) bad.push(x.key + ' is scripture-like and not held to scriptureMinAge_');
    });
    if (all.some(x => !x.libBook || !x.wtLanguage || x.kind !== 'writ')) bad.push('an item has no Which writing or no Text tag');
    adult = false;
    const young = ctx.items();
    const want = ix.texts.filter(t => !t.scripture).reduce((n, t) => n + t.works.reduce((m, w) => m + w.parts.reduce((k, p) => k + units(p), 0), 0), 0);
    if (young.length !== want) bad.push('a viewer under age is offered ' + young.length + ' items, not the ' + want + ' of the texts that are not scripture-like');
  } catch (e) { bad.push('js/texts.js does not build its items: ' + e.message); }
}

/* WIRED: loaded after works, listed by Find, asked for when a finder paints, never in the boot payload. */
const order = (src('index.html').match(/'works', 'texts'/) || [])[0];
if (!order) bad.push('index.html does not load texts right after works');
const find = src('js/find.js');
if (!/\.\.\.\(typeof textsItems_ === 'function' \? textsItems_\(\) : \[\]\)/.test(find)) bad.push('Find does not list textsItems_() — the texts never reach Find');
if (!/if \(typeof textsIndex_ === 'function'\) textsIndex_\(\);/.test(find)) bad.push('paintStuff does not ask for the texts index');
if (!/\bwrit: \{ group: 'Learning', label: 'Library', card: x => textsCard_\(x\) \}/.test(find)) bad.push('Find has no `writ` kind drawing textsCard_');
fs.readdirSync(path.join(ROOT, 'backend')).filter(f => f.endsWith('.gs')).forEach(f => {
  if (/data\/texts/.test(src('backend/' + f))) bad.push('backend/' + f + ' names data/texts — the texts are never in the boot payload');
});

if (bad.length) { console.log('check-texts: ' + bad.length + ' FAILED'); bad.slice(0, 40).forEach(b => console.log('  ' + b)); process.exit(1); }
said.forEach(s => console.log('  ' + s));
console.log('check-texts: ' + (ix.texts || []).length + ' texts, ' + total + ' cards load, each with its source and licence (' + (bytes / 1e6).toFixed(1) + ' MB)');
