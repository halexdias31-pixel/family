#!/usr/bin/env node
/* @family. — tools/logic-health.js THE FUNNEL'S LOGIC HEALTH (770), measured, never judged by AI. --check: write nothing, exit 1 when stale. */
/* Runs the real app (check/jsdom-app.js) as an admin, walks Find's funnel breadth first and writes data/logic-health.json: the share of */
/* questions that break none of the rules below, and the worst offenders. Run it after changing the library, the facets or the kinds. */
// The rules, each measured on the question the funnel really asks at a place (a "node"):
//   single     a question with one answer (only an answer below one already chosen may be, 680) — nothing to decide
//   rawkey     an answer that reads as a key, not words: an id (RS178…, P-9MA0-…), snake_case or camelCase
//   repeat     a question whose label was already asked on the way here (two questions called "Month")
//   subtype    a finer question asked before its coarser one: every answer here sits inside one answer of a question asked later
//   siblings   the branches under one question ask their next question in different orders, although each could ask the other's
//   echo       an answer that repeats the answer above it ("Old Testament" › "Old Testament books")
//   twins      two answers of one question that keep exactly the same cards under two names (Old Testament and Tanakh)
// What it cannot judge: whether a card is filed under the right answer, or whether an answer's name is the best word — that is
// content and categorisation, and needs a person. It reads the shape of the funnel, not the meaning of the library.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'logic-health.json');
const CHECK = process.argv.includes('--check');
/* HOW FAR THE WALK GOES: breadth first, so the questions a finger meets first are all measured; a numbered run (a grid) is a list. */
const MAX_NODES = Number(process.env.LH_NODES) || 300, MAX_DEPTH = 7, MAX_CHILDREN = 10, SAMPLE = 3000;
const RULES = {
  single: 'a question with one answer — nothing to decide',
  rawkey: 'an answer that reads as a key, not words',
  repeat: 'a question whose name was already asked on the way here',
  subtype: 'a finer question asked before its coarser one',
  siblings: 'sibling branches ask their next question in different orders',
  echo: 'an answer that repeats the answer above it',
  twins: 'two answers that keep exactly the same cards',
};

(async () => {
  let had = null;
  try { had = fs.readFileSync(OUT, 'utf8'); } catch (e) {}
  const { app, tick } = require('../check/jsdom-app.js');
  const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
  const A = await app(payload);
  const ev = s => A.w.__ev(s);
  const t0 = Date.now();
  ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('logic-health: the app never settled in 240s'); process.exit(2); }
    await tick(250);
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  if (process.env.LH_DEBUG) console.error('settled in ' + (Date.now() - t0) + 'ms');
  let got = JSON.parse(ev(`(() => {
    USER = Object.assign({ name: 'T', personId: 'P-T' }, { role: 'Admin', roles: ['admin'] });
    stuffForget_();
    const RAW = /^(?:RS\\d{6,}|[A-Z]{1,3}-[A-Z0-9]+-|[a-z]+_[a-z_]+$|[a-z]+[A-Z][A-Za-z]*$)/;
    const nodes = [], queue = [[]], said = f => f.map(x => x.show || x.value);
    const fn = (F, G, items) => { const to = {}; let any = 0;
      for (const x of items) { const a = facetOwn_(F, x), b = facetOwn_(G, x); if (!a.length || !b.length) continue;
        if (b.length !== 1) return false; const kb = spellKey_(b[0]);
        for (const v of a) { const k = spellKey_(v); if (to[k] && to[k] !== kb) return false; to[k] = kb; any++; } }
      return any > 0 && new Set(Object.values(to)).size > 1; };
    while (queue.length && nodes.length < ${MAX_NODES}) {
      const filters = queue.shift(), t1 = Date.now();
      const r = inFinder_(FINDERS.stuff, () => {
        STUFF.filters = filters; STUFF.q = ''; STUFF.admit = null;
        const items = stuffFiltered();
        if (!items.length) return null;
        const f = nextFacet(items) || overFacet_(items);
        if (!f) return { n: items.length };
        const values = facetValues(items, f);
        const bad = {};
        if (values.length < 2) bad.single = [f.label];
        const raw = values.filter(v => RAW.test(String(v.show || v.value))).map(v => v.show || v.value);
        if (raw.length) bad.rawkey = raw.slice(0, 3);
        const labels = filters.filter(g => !g.any).map(g => (facetBy(g.field) || {}).label || g.field);
        if (labels.some(l => spellKey_(l) === spellKey_(f.label))) bad.repeat = [f.label];
        /* A COARSER QUESTION STILL TO COME: asked later, two answers here, and every answer of this one inside one of its. */
        /* THE OTHER QUESTIONS ARE JUDGED ON AN EVEN SAMPLE (770: the whole library times 81 facets was the 1200 s timeout); the asked one is exact. */
        const S = items.length <= ${SAMPLE} ? items : items.filter((x, i) => i % Math.ceil(items.length / ${SAMPLE}) === 0);
        const asked = filters.map(g => g.field);
        const later = facetList().filter(G => G !== f && asked.indexOf(G.field) === -1 && facetValues(S, G).length > 1
          && facetCoverage(S, G) >= FACET_COVERAGE && fn(f, G, S) && !fn(G, f, S));
        if (later.length) bad.subtype = [f.label + ' before ' + later[0].label];
        const above = filters.filter(g => !g.any).slice(-1)[0];
        if (above) { const ka = spellKey_(above.value);
          const e = values.filter(v => { const k = spellKey_(v.show || v.value); return ka.length > 2 && k !== ka && k.indexOf(ka) !== -1; });
          if (e.length) bad.echo = e.slice(0, 3).map(v => above.value + ' › ' + (v.show || v.value)); }
        /* ONE PASS: each answer's cards folded into a hash as they come, never a filter per answer. */
        const hs = {};
        for (const x of items) { const s = String(x.key || x.name || '');
          for (const t of new Set(facetOwn_(f, x).map(spellKey_))) { let h = hs[t] || 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; hs[t] = h; } }
        const sig = values.map(v => hs[spellKey_(v.value)] || 0);
        const tw = [];
        sig.forEach((h, i) => sig.forEach((g, j) => { if (j > i && g === h && values[i].n > 1) tw.push((values[i].show || values[i].value) + ' = ' + (values[j].show || values[j].value)); }));
        if (tw.length) bad.twins = tw.slice(0, 3);
        const askable = facetList().filter(G => asked.indexOf(G.field) === -1 && !facetWhy_(S, G)).map(G => G.field);
        /* MENU RULE (920): how well each askable question splits the sample, in bits; the asked one is judged on the same sample. */
        const bits = G => { const vs = facetValues(S, G), t = vs.reduce((a, v) => a + v.n, 0); return t ? vs.reduce((a, v) => v.n ? a - v.n / t * Math.log2(v.n / t) : a, 0) : 0; };
        const split = {}; askable.concat([f.field]).forEach(k => { const G = facetBy(k); if (G) split[k] = Math.round(bits(G) * 100) / 100; });
        return { n: items.length, field: f.field, label: f.label, answers: values.map(v => [v.value, v.show || v.value, v.n]), bad, askable, split };
      });
      if (!r) continue;
      nodes.push(Object.assign({ path: filters.map(g => [g.field, g.value]), ms: Date.now() - t1 }, r));
      if (r.field && filters.length < ${MAX_DEPTH} && !numberedRun_(r.answers.map(a => ({ value: a[0], show: a[1] }))))
        r.answers.slice().sort((a, b) => b[2] - a[2]).slice(0, ${MAX_CHILDREN})
          .forEach(a => queue.push(filters.concat([{ field: r.field, value: a[0] }])));
    }
    /* TAG ASKED (920): every facet a front-page card carries as a tag, with its label, to compare with the questions ever asked. */
    const carried = inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.q = ''; STUFF.admit = null; const all = stuffFiltered();
      return facetList().map(G => ({ field: G.field, label: G.label, cards: all.filter(x => { try { return asList_(G.tagOf ? G.tagOf(x, '') : facetOwn_(G, x)).some(v => String(v == null ? '' : v).trim()); } catch (e) { return false; } }).length }))
        .filter(c => c.cards > 0); });
    inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.q = ''; STUFF.admit = null; });
    return JSON.stringify({ nodes, carried });
  })()`));
  A.close();
  const carried = got.carried; got = got.nodes;
  if (process.env.LH_DEBUG) got.slice().sort((a, b) => b.ms - a.ms).slice(0, 8).forEach(nd => console.error(nd.ms + 'ms', nd.n, nd.label, JSON.stringify(nd.path)));
  got.forEach(nd => { delete nd.ms; });

  /* SIBLINGS: under one question, a branch asking G first while a sister branch could ask G too and asked something else. */
  const at = {};
  got.forEach(nd => { at[JSON.stringify(nd.path)] = nd; });
  got.forEach(nd => {
    if (!nd.field) return;
    const kids = nd.answers.map(a => at[JSON.stringify(nd.path.concat([[nd.field, a[0]]]))]).filter(k => k && k.field);
    const off = [];
    kids.forEach(k => kids.forEach(j => {
      if (k !== j && k.field !== j.field && j.askable.indexOf(k.field) !== -1 && k.askable.indexOf(j.field) !== -1)
        off.push(k.path.slice(-1)[0][1] + ' asks ' + k.label + ', ' + j.path.slice(-1)[0][1] + ' asks ' + j.label);
    }));
    if (off.length) nd.bad.siblings = off.slice(0, 2);
  });

  const where = nd => ['Find'].concat(nd.path.map(p => p[1])).join(' › ');
  const asked = got.filter(nd => nd.field);
  const sick = asked.filter(nd => Object.keys(nd.bad).length);
  const score = asked.length ? Math.round(1000 * (asked.length - sick.length) / asked.length) / 10 : 0;
  const counts = {};
  Object.keys(RULES).forEach(k => { counts[k] = asked.filter(nd => nd.bad[k]).length; });
  /* THE WORST FIRST: most rules broken, then the most cards behind the question, then where it is. */
  const top = sick.slice().sort((a, b) => Object.keys(b.bad).length - Object.keys(a.bad).length || b.n - a.n || (where(a) < where(b) ? -1 : 1))
    .slice(0, 25).map(nd => ({ where: where(nd), asks: nd.label, cards: nd.n,
      why: Object.keys(nd.bad).map(k => RULES[k] + ': ' + nd.bad[k].join('; ')) }));
  /* MENU RULE (920): a node whose asked question splits worse than the best askable one by over a tenth of a bit. */
  const menuRule = asked.filter(nd => nd.split).map(nd => { let b = nd.field;
    Object.keys(nd.split).forEach(k => { if (nd.split[k] > nd.split[b]) b = k; });
    return { where: where(nd), asks: nd.field, bits: nd.split[nd.field], best: b, bestBits: nd.split[b], cards: nd.n }; })
    .filter(m => m.bestBits - m.bits > 0.1).sort((a, b) => (b.bestBits - b.bits) * b.cards - (a.bestBits - a.bits) * a.cards);
  const everAsked = new Set(asked.map(nd => nd.field));
  const tagAsked = carried.filter(c => !everAsked.has(c.field)).sort((a, b) => b.cards - a.cards);
  got.forEach(nd => { delete nd.split; });
  const out = { score, questions: asked.length, healthy: asked.length - sick.length,
    walked: { nodes: got.length, maxNodes: MAX_NODES, maxDepth: MAX_DEPTH, maxChildren: MAX_CHILDREN, sample: SAMPLE },
    rules: Object.keys(RULES).map(k => ({ id: k, label: RULES[k], count: counts[k] })),
    cannot: 'Whether a card is filed under the right answer, or an answer has the best name: content and categorisation need a person.',
    top, menuRule, tagAsked };
  const text = JSON.stringify(out, null, 1) + '\n';
  if (CHECK) {
    if (text === had) { console.log('logic-health: data/logic-health.json is current (' + score + '%, ' + asked.length + ' questions)'); process.exit(0); }
    console.error('logic-health: data/logic-health.json is STALE — the funnel has changed. Run: node tools/logic-health.js');
    process.exit(1);
  }
  fs.writeFileSync(OUT, text);
  console.log('logic-health: wrote data/logic-health.json — ' + score + '% of ' + asked.length + ' questions healthy, '
    + Object.keys(counts).filter(k => counts[k]).map(k => k + ' ' + counts[k]).join(', ') + ' (' + Math.round((Date.now() - t0) / 1000) + 's)');
  process.exit(0);
})().catch(e => { console.error('logic-health: ' + (e && e.stack || e)); process.exit(2); });
