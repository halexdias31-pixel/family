#!/usr/bin/env node
/* @family. — tools/finder-tags.js THE FINDER'S FIRST ANSWERS, COUNTED AT BUILD TIME (546). --check: write nothing, exit 1 when stale. */
/* Runs the real app (check/jsdom-app.js) over every file the finder reads and writes js/finder-tags.js: per view of the library (the */
/* Bible or not, each age line), the question at the start and after each first answer. The phone paints these while its files arrive. */
/* Run it after changing the library, a writings index, the facets or the kinds; check-all runs `--check` and is red while it is stale. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'js', 'finder-tags.js');
const CHECK = process.argv.includes('--check'), FULL = process.argv.includes('--full');
/* THE INPUTS' FINGERPRINT (CI after be32d73): the walk takes minutes, so --check trusts a stamp of every file the app reads, made by the last full run. */
const STAMP = path.join(ROOT, 'tools', 'finder-tags.stamp');
/* NOT INPUTS: the checks, the health and stability reports and index.html's BUILD_STAMP are written after this tool and never steer the finder. */
const SKIP = f => f === 'js/finder-tags.js' || /^js\/check[-.]/.test(f) || /^data\/(health|health-trend|stability|[\w-]+-health)\.json$/.test(f);
const inputsHash = () => {
  const crypto = require('crypto'), h = crypto.createHash('sha256');
  const walk = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)
    .flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
  const list = walk('js').concat(walk('data'), ['index.html', 'check/jsdom-app.js', 'check/fixture.json', 'tools/finder-tags.js']).filter(f => !SKIP(f));
  list.forEach(f => {
    let b = fs.readFileSync(path.join(ROOT, f));
    if (f === 'index.html') b = Buffer.from(b.toString('utf8').replace(/BUILD_STAMP\s*=\s*['"][^'"]*['"]/, 'BUILD_STAMP=""'));
    h.update(f + '\0' + b.length + '\0'); h.update(b);
  });
  return h.digest('hex');
};
const outHash = t => require('crypto').createHash('sha256').update(t).digest('hex');
/* FRESH WITHOUT A WALK: what health.js --changed asks before it warns that this file wants re-running. */
const fresh = () => { try { return fs.readFileSync(STAMP, 'utf8').trim() === inputsHash() + ' ' + outHash(fs.readFileSync(OUT, 'utf8')); } catch (e) { return false; } };
module.exports = { fresh };
/* HOW MANY ANSWERS DEEP (1070: 1 → 3): a finger taps three menus in before the library lands, and each must already be the final answer. */
const DEPTH = 3;
/* AND DEEPER WHILE A LIST IS BIG (1100): a tap over more than DEEP cards is looked up, not counted, so it settles at once on a phone at 4x; under it the live count is quick. */
const DEEP = 400, DEEPEST = 12;
/* ONLY IN THE COMMON FUNNEL, PRACTICE (1100): Library's writings run to some lists that take minutes each to ask; past depth 3 they are counted live. */
const DEEP_UNDER = /^kindLabel=Practice(&|$)/;
/* AND THE PLACES A CHECK HOLDS THE FUNNEL TO (check-writings: Religion is asked first in Library › Religious Studies). */
const NAMED = [[{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: 'Religious Studies' }]];

const HEAD = '/* @family. — js/finder-tags.js WRITTEN BY tools/finder-tags.js, NEVER BY HAND (546): the finder\'s first questions and answers, counted at build time. */\n';
/* ONE QUESTION A LINE, so a change to the library shows in a diff as the questions it changed. */
/* SHARED ONCE (dup): a question every view asks alike is written in `same` and merged into each view by finderTagsView_. */
const render = T => {
  const vs = Object.keys(T.views), line = (o, k) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(o[k]);
  const same = Object.keys(T.views[vs[0]] || {}).filter(k => vs.every(v => JSON.stringify(T.views[v][k]) === JSON.stringify(T.views[vs[0]][k])));
  const own = v => Object.keys(T.views[v]).filter(k => !same.includes(k));
  return HEAD + 'const FINDER_TAGS = {\n"facets": ' + JSON.stringify(T.facets) + ',\n"same": {\n' + same.map(k => line(T.views[vs[0]], k)).join(',\n') + '\n},\n"views": {\n'
    + vs.map(v => JSON.stringify(v) + ': {\n' + own(v).map(k => line(T.views[v], k)).join(',\n') + '\n}').join(',\n') + '\n}};\n';
};

if (require.main === module) (async () => {
  /* THE APP LOADS THIS FILE TOO: a first run, or one after a bad merge, starts from an empty one. */
  let had = null;
  try { had = fs.readFileSync(OUT, 'utf8'); } catch (e) { had = null; }
  if (CHECK && had === null) { console.error('finder-tags: js/finder-tags.js is missing. Run: node tools/finder-tags.js'); process.exit(1); }
  const IN = inputsHash();
  if (CHECK && !FULL) {
    let st = ''; try { st = fs.readFileSync(STAMP, 'utf8').trim(); } catch (e) { st = ''; }
    if (st === IN + ' ' + outHash(had)) { console.log('finder-tags: js/finder-tags.js is current (inputs unchanged since the last full run; --full to re-walk)'); process.exit(0); }
    /* A STALE STAMP FAILS AT ONCE (round 3): a walk passed here in 4 minutes and timed out in CI at 5; run the tool after every merge. */
    console.error('finder-tags: its inputs changed since the last full run. Run: node tools/finder-tags.js (or --check --full to walk)'); process.exit(1);
  }
  if (had === null || !/const FINDER_TAGS = /.test(had)) fs.writeFileSync(OUT, HEAD + 'const FINDER_TAGS = null;\n');
  const { app, tick } = require('../check/jsdom-app.js');
  /* THE LIBRARY AS THE SITE SERVES IT (check/lib-full.js, words and all), so what is counted here is what a phone counts. */
  const lib = require('../check/lib-full.js');
  const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  const A = await app(payload, (f, j) => { const t = lib.serve(path.join(ROOT, f)); return t !== null ? JSON.parse(t) : j; });
  const ev = s => A.w.__ev(s);
  /* EVERY SOURCE IN: the payload, the library and its extras, and each writings index this admin may have. */
  const t0 = Date.now();
  ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('finder-tags: the app never settled in 240s'); process.exit(2); }
    await tick(250);
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  const failed = ev('JSON.stringify([["the Bible",BIBLE],["the Talmud",TALMUD],["the Quran",QURAN],["the Hadith",HADITH],["the works",WORKS],'
    + '["the texts",TEXTS],["the pdtexts",PDTEXTS],["the Orthodox texts",ORTHO],["the hymns",HYMNS]].filter(p => p[1].failed).map(p => p[0]))');
  if (JSON.parse(failed).length) { console.error('finder-tags: these did not load, so nothing is written: ' + JSON.parse(failed).join(', ')); process.exit(2); }

  /* THE VIEWERS: an admin (the Bible, People and Settings) and a student; no age lines (1040). */
  const viewers = [{ role: 'Admin', roles: ['admin'] }, { role: 'Student', roles: ['student'], profile: {} }];
  const views = {};
  for (const v of viewers) {
    const key = ev(`(() => {
      USER = Object.assign({ name: 'T', personId: 'P-T' }, ${JSON.stringify(v)});
      stuffForget_();
      window.__at = filters => inFinder_(FINDERS.stuff, () => {
        STUFF.filters = filters; STUFF.admit = null;
        const items = stuffFiltered();
        if (!items.length) return null;
        const f = nextFacet(items) || overFacet_(items);
        if (!f) return null;
        const vs = facetValues(items, f);
        return JSON.stringify([f.field, vs.map(x => x.show && x.show !== x.value ? [x.value, x.show] : [x.value]), vs.map(x => x.n), items.length, vs.map(x => answerSay_(f, x.value))]);
      });
      return (isAdmin() ? 'admin+' : '') + (bibleFor_() ? 'bible' : '');
    })()`);
    /* EACH QUESTION ITS OWN CALL, so a long walk says where it is (PROGRESS=1). */
    const out = {}, t1 = Date.now();
    const walk = (filters, depth) => {
      const r = ev('__at(' + JSON.stringify(filters) + ')');
      if (!r) return;
      const q = JSON.parse(r), k = filters.map(f => f.field + '=' + f.value).join('&');
      out[k] = q;
      if (process.env.PROGRESS) process.stderr.write(Object.keys(out).length + ' ' + ((Date.now() - t1) / 1000 | 0) + 's ' + q[3] + ' ' + k.slice(0, 120) + '\n');
      if (depth < DEPTH || (q[3] > DEEP && depth < DEEPEST && DEEP_UNDER.test(k))) q[1].forEach(x => walk(filters.concat([{ field: q[0], value: x[0] }]), depth + 1));
    };
    walk([], 0);
    NAMED.forEach(st => walk(st, DEPTH));
    ev('inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.admit = null; })');
    /* EACH ANSWER'S WORDS WHERE THEY ARE NOT ITS PLAIN SHORT ONES (answerSay_: a paper's cover code), over the whole list, so a tag row never tallies the library. */
    out['#says'] = JSON.parse(ev(`inFinder_(FINDERS.stuff, () => { const all = stuffItems(), o = {};
      facetList().forEach(f => { const m = {}; facetTally_(all, f).values.forEach(v => { const s = v.show || v.text || v.value; if (s !== showShort_(facetSay_(f, v.value))) m[v.value] = s; });
        if (Object.keys(m).length) o[f.field] = m; });
      return JSON.stringify(o); })`));
    const got = { key: key, out: out };
    /* TWO VIEWERS ON ONE KEY MUST SEE ONE LIBRARY, or the key is missing what tells them apart. */
    if (views[got.key] && JSON.stringify(views[got.key]) !== JSON.stringify(got.out)) {
      console.error('finder-tags: two viewers share the view ' + got.key + ' and see different answers; `finderTagsView_` needs what tells them apart');
      process.exit(2);
    }
    views[got.key] = got.out;
  }
  /* THE FACETS IT WAS COUNTED WITH: a settled finder looks an answer up only while its own are these (finderTagsSame_). */
  const facets = ev('facetList().map(f => f.field).join(",")');
  A.close();
  const text = render({ views: views, facets: facets });
  if (CHECK) {
    if (text === had) { console.log('finder-tags: js/finder-tags.js is current (' + Object.keys(views).length + ' views)'); process.exit(0); }
    console.error('finder-tags: js/finder-tags.js is STALE — the finder\'s first answers have changed. Run: node tools/finder-tags.js');
    process.exit(1);
  }
  fs.writeFileSync(OUT, text);
  fs.writeFileSync(STAMP, IN + ' ' + outHash(text) + '\n');
  console.log('finder-tags: wrote js/finder-tags.js — ' + Object.keys(views).length + ' views, ' + Object.values(views).reduce((n, o) => n + Object.keys(o).length, 0) + ' questions');
  process.exit(0);
})().catch(e => { console.error('finder-tags: ' + (e && e.stack || e)); process.exit(2); });
