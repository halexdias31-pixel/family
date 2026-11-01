#!/usr/bin/env node
/* @family. — tools/finder-tags.js THE FINDER'S FIRST ANSWERS, COUNTED AT BUILD TIME (546). --check: write nothing, exit 1 when stale. */
/* Runs the real app (check/jsdom-app.js) over every file the finder reads and writes js/finder-tags.js: per view of the library (the */
/* Bible or not, each age line), the question at the start and after each first answer. The phone paints these while its files arrive. */
/* Run it after changing the library, a writings index, the facets or the kinds; check-all runs `--check` and is red while it is stale. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'js', 'finder-tags.js');
const CHECK = process.argv.includes('--check');
/* HOW MANY ANSWERS DEEP: the start, and each first answer — what a finger can press before the files are in. */
const DEPTH = 1;
/* AND THE PLACES A CHECK HOLDS THE FUNNEL TO (check-writings: Religion is asked first in Library › Religious Studies). */
const NAMED = [[{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: 'Religious Studies' }]];

const HEAD = '/* @family. — js/finder-tags.js WRITTEN BY tools/finder-tags.js, NEVER BY HAND (546): the finder\'s first questions and answers, counted at build time. */\n';
/* ONE QUESTION A LINE, so a change to the library shows in a diff as the questions it changed. */
const render = T => HEAD + 'const FINDER_TAGS = {\n"ages": ' + JSON.stringify(T.ages) + ',\n"views": {\n'
  + Object.keys(T.views).map(v => JSON.stringify(v) + ': {\n' + Object.keys(T.views[v]).map(k => '  ' + JSON.stringify(k) + ': '
    + JSON.stringify(T.views[v][k])).join(',\n') + '\n}').join(',\n') + '\n}};\n';

(async () => {
  /* THE APP LOADS THIS FILE TOO: a first run, or one after a bad merge, starts from an empty one. */
  let had = null;
  try { had = fs.readFileSync(OUT, 'utf8'); } catch (e) {}
  if (CHECK && had === null) { console.error('finder-tags: js/finder-tags.js is missing. Run: node tools/finder-tags.js'); process.exit(1); }
  if (had === null || !/const FINDER_TAGS = /.test(had)) fs.writeFileSync(OUT, HEAD + 'const FINDER_TAGS = null;\n');
  const { app, tick } = require('../check/jsdom-app.js');
  const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  const A = await app(payload);
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

  /* THE VIEWERS: an admin (every age, the Bible), and a student at each age line any item draws, from none upwards. */
  const ages = JSON.parse(ev(`(() => { const s = new Set([0, SCRIPTURE_MIN_AGE]); USER = Object.assign({}, USER, { role: 'Admin', roles: ['admin'] });
    stuffForget_(); stuffItemsRaw_().forEach(x => s.add(itemMinAge_(x))); return JSON.stringify([...s].filter(a => isFinite(a)).sort((a, b) => a - b)); })()`));
  const viewers = [{ role: 'Admin', roles: ['admin'] }].concat(ages.map(a => ({ role: 'Student', roles: ['student'], profile: { age: a } })));
  const views = {};
  for (const v of viewers) {
    const got = JSON.parse(ev(`(() => {
      USER = Object.assign({ name: 'T', personId: 'P-T' }, ${JSON.stringify(v)});
      stuffForget_();
      const ages = ${JSON.stringify(ages)}, cap = viewerAgeCap_();
      const key = (bibleFor_() ? 'bible' : '') + '@' + ages.filter(a => a <= cap).reduce((m, a) => Math.max(m, a), 0);
      const at = filters => inFinder_(FINDERS.stuff, () => {
        STUFF.filters = filters; STUFF.q = ''; STUFF.admit = null;
        const items = stuffFiltered();
        if (!items.length) return null;
        const f = nextFacet(items) || overFacet_(items);
        return f ? [f.field, facetValues(items, f).map(x => x.show && x.show !== x.value ? [x.value, x.show] : [x.value])] : null;
      });
      const out = {};
      const walk = (filters, depth) => {
        const q = at(filters);
        if (!q) return;
        out[filters.map(f => f.field + '=' + f.value).join('&')] = q;
        if (depth < ${DEPTH}) q[1].forEach(x => walk(filters.concat([{ field: q[0], value: x[0] }]), depth + 1));
      };
      walk([], 0);
      ${JSON.stringify(NAMED)}.forEach(st => walk(st, ${DEPTH}));
      inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.q = ''; STUFF.admit = null; });
      return JSON.stringify({ key, out });
    })()`));
    /* TWO VIEWERS ON ONE KEY MUST SEE ONE LIBRARY, or the key is missing what tells them apart. */
    if (views[got.key] && JSON.stringify(views[got.key]) !== JSON.stringify(got.out)) {
      console.error('finder-tags: two viewers share the view ' + got.key + ' and see different answers; `finderTagsView_` needs what tells them apart');
      process.exit(2);
    }
    views[got.key] = got.out;
  }
  A.close();
  const text = render({ ages: ages, views: views });
  if (CHECK) {
    if (text === had) { console.log('finder-tags: js/finder-tags.js is current (' + Object.keys(views).length + ' views)'); process.exit(0); }
    console.error('finder-tags: js/finder-tags.js is STALE — the finder\'s first answers have changed. Run: node tools/finder-tags.js');
    process.exit(1);
  }
  fs.writeFileSync(OUT, text);
  console.log('finder-tags: wrote js/finder-tags.js — ' + Object.keys(views).length + ' views, ages ' + ages.join(', ')
    + ', ' + Object.values(views).reduce((n, o) => n + Object.keys(o).length, 0) + ' questions');
  process.exit(0);
})().catch(e => { console.error('finder-tags: ' + (e && e.stack || e)); process.exit(2); });
