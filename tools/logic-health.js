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

/* MANGLED (1040 r11): a drawn text is mangled when its letters neither hold nor sit inside any source value's letters (a dropped or changed letter). */
function MANGLED(t, src) { const k = x => String(x).toLowerCase().replace(/[^a-z0-9]/g, ''), a = k(t);
  return !!a && !src.some(s => { const b = k(s); return b && (a.indexOf(b) !== -1 || b.indexOf(a) !== -1); }); }
/* MUTATION PROOF: the check must catch an s dropped by a backslash lost in a template (the r11 bug) and pass the true text. */
if (!MANGLED('Hi tory of the Chri tian Church', ['History of the Christian Church']) || MANGLED('History of the Christian Church, vol. 1: Apostolic', ['History of the Christian Church']))
  { console.error('logic-health: the mangled-text check fails its own mutation test'); process.exit(2); }
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
    const MANGLED = ${MANGLED.toString()};
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
        /* MENU SENSE (920): two answers one letter or an s apart, and an answer that keeps no card. */
        const near = (a, b) => { if (a === b) return true; if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false;
          let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(i + 1) === b.slice(i + 1) || a.slice(i) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i); };
        const ks = values.map(v => String(v.show || v.value).toLowerCase().replace(/[^a-z0-9]/g, '')), dup = [];
        ks.forEach((a, i) => ks.forEach((b, j) => { if (j > i && near(a, b) && a.replace(/\\d/g, '#') !== b.replace(/\\d/g, '#')) dup.push((values[i].show || values[i].value) + ' ~ ' + (values[j].show || values[j].value)); }));
        const dead = values.filter(v => !v.n).map(v => v.show || v.value);
        /* A THIN MENU (920, owner's 5-a-day screenshot): fewer than two answers that keep a card, Doesn't matter not counted. */
        const real = values.filter(v => v.n > 0 && !v.any && !/^(?:doesn.?t matter|any)$/i.test(String(v.show || v.value).trim()));
        const thin = real.length < 2 ? real.map(v => v.show || v.value) : null;
        /* A COUNT OF 0 DRAWN: the asked facet's whole tally (before chips are taken out) may not hold an answer that keeps nothing. */
        const zero = ((facetTally_(items, f) || {}).values || []).filter(v => !v.n).map(v => v.show || v.value);
        /* ANSWER WORDS (920): what the menu said, the chip says after the pick and the card's tag line says (tagSay or answerSay_) must be one text. */
        const norm = t => String(t == null ? '' : t).replace(/<[^>]*>/g, '').replace(/\\s+/g, ' ').trim();
        const words = [], mangled = [], was = STUFF.filters;
        values.slice(0, 12).forEach(v => { const menu = norm(v.show || v.value);
          STUFF.filters = filters.concat([{ field: f.field, value: v.value }]);
          let chip = '', tag = ''; try { chip = norm(chipText_(STUFF.filters[filters.length], filters.length)); } catch (e) { chip = '?'; }
          /* THE TAG THE CARD REALLY DRAWS (find-figures: tagSay, else answerSay_), not a raw facetSay_ the card never shows. */
          try { tag = norm(f.tagSay ? f.tagSay(v.value) : answerSay_(f, v.value) || v.value); } catch (e) { tag = '?'; }
          if (chip !== menu || tag !== menu) words.push('menu "' + menu + '", chip "' + chip + '", tag "' + tag + '"');
          /* MANGLED TEXT (1040 r11): each drawn text must hold, or sit inside, a source value letter for letter. */
          const src = [String(v.value)].concat(items.flatMap(x => facetOwn_(f, x)).filter(t => spellKey_(t) === spellKey_(v.value)).map(String));
          [['menu', menu], ['chip', chip], ['tag', tag]].forEach(([w, t]) => { if (t !== '?' && MANGLED(t, src)) mangled.push(w + ' "' + t + '" vs source "' + src[src.length - 1] + '"'); }); });
        STUFF.filters = was;
        /* MERGED VALUES (920): an answer that holds two other answers of the same menu (or one twice) is two values joined; its source rows. */
        const merged = [], low = values.map(v => String(v.value).toLowerCase());
        const at = (a, b) => { const out = []; for (let p = a.indexOf(b); p >= 0; p = a.indexOf(b, p + 1)) if ((p === 0 || a[p - 1] === ' ') && (p + b.length === a.length || a[p + b.length] === ' ')) out.push(p); return out; };
        low.forEach((a, i) => { const hits = low.map((b, j) => j !== i && b.length > 3 ? at(a, b).map(p => [p, p + b.length + 1, b]) : []).flat();
          const apart = hits.filter(h => hits.some(g => g[2] !== h[2] && (g[0] >= h[1] || h[0] >= g[1])));
          const inner = [...new Set(apart.map(h => h[2]))];
          const twice = low.some((b, j) => j !== i && b.length > 3 && at(a, b).length > 1);
          if (inner.length >= 2 || twice) { const rows = items.filter(x => facetOwn_(f, x).some(t => String(t).toLowerCase() === a)).slice(0, 3).map(x => (x.kind || '?') + ':' + (x.id || x.key || x.name));
            merged.push('"' + values[i].value + '" holds ' + (inner.slice(0, 2).map(b => '"' + b + '"').join(' + ') || 'one answer twice') + ' — rows ' + rows.join(', ')); } });
        return { n: items.length, field: f.field, label: f.label, answers: values.map(v => [v.value, v.show || v.value, v.n]), bad, askable, split, dup: dup.slice(0, 3), dead: dead.slice(0, 3), thin, zero: zero.slice(0, 3), words: words.slice(0, 3), mangled: mangled.slice(0, 3), merged: merged.slice(0, 3) };
      });
      if (!r) continue;
      nodes.push(Object.assign({ path: filters.map(g => [g.field, g.value]), ms: Date.now() - t1 }, r));
      if (r.field && filters.length < ${MAX_DEPTH} && !numberedRun_(r.answers.map(a => ({ value: a[0], show: a[1] }))))
        r.answers.slice().sort((a, b) => b[2] - a[2]).slice(0, ${MAX_CHILDREN})
          .forEach(a => queue.push(filters.concat([{ field: r.field, value: a[0] }])));
    }
    /* TAG ASKED (920): every facet a front-page card carries as a tag, with its label, to compare with the questions ever asked. */
    const carried = inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.q = ''; STUFF.admit = null; const all = stuffFiltered();
      return facetList().map(G => { const has = all.filter(x => { try { return asList_(G.tagOf ? G.tagOf(x, '') : facetOwn_(G, x)).some(v => String(v == null ? '' : v).trim()); } catch (e) { return false; } });
        /* ASKED ON ITS OWN CARDS: the walk stops at grids and its cap; a facet the rules would ask once its cards are reached (a long one as the paged list) is askable. */
        let why; try { why = facetWhy_(has, G, true); } catch (e) { why = 'unread: ' + e.message; }
        return { field: G.field, label: G.label, cards: has.length, why }; })
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
  /* ASKABLE COUNTS AS ASKED: a facet the funnel offers below the walk's depth is a question a finger can reach. */
  const everAsked = new Set(asked.map(nd => nd.field).concat(got.flatMap(nd => nd.askable || [])));
  const tagAsked = carried.filter(c => !everAsked.has(c.field) && c.why).sort((a, b) => b.cards - a.cards);
  const menuSense = [];
  asked.forEach(nd => {
    if (nd.answers.length < 2 && !nd.bad.single) menuSense.push({ where: where(nd), kind: 'single', say: nd.label + ' asked with one answer' });
    (nd.dup || []).forEach(d => menuSense.push({ where: where(nd), kind: 'spelling', say: nd.label + ': ' + d }));
    (nd.dead || []).forEach(d => menuSense.push({ where: where(nd), kind: 'dead-end', say: nd.label + ': ' + d + ' keeps no card' }));
    if (nd.thin) menuSense.push({ where: where(nd), kind: 'thin', say: nd.label + ' asked with ' + nd.thin.length + ' real answer(s)' + (nd.thin.length ? ' (' + nd.thin.join(', ') + ')' : '') + ' besides Doesn\'t matter' });
    (nd.zero || []).forEach(d => menuSense.push({ where: where(nd), kind: 'zero-count', say: nd.label + ': ' + d + ' drawn with a count of 0' }));
    (nd.words || []).forEach(d => menuSense.push({ where: where(nd), kind: 'answer-words', say: nd.label + ': ' + d }));
    (nd.mangled || []).forEach(d => menuSense.push({ where: where(nd), kind: 'mangled-text', say: nd.label + ': ' + d }));
    (nd.merged || []).forEach(d => menuSense.push({ where: where(nd), kind: 'merged-value', say: nd.label + ': ' + d }));
    if (nd.bad.single) menuSense.push({ where: where(nd), kind: 'single', say: nd.label + ' asked with one answer' });
  });
  got.forEach(nd => { delete nd.split; delete nd.dup; delete nd.dead; delete nd.thin; delete nd.zero; delete nd.words; delete nd.mangled; delete nd.merged; });
  const out = { score, questions: asked.length, healthy: asked.length - sick.length,
    walked: { nodes: got.length, maxNodes: MAX_NODES, maxDepth: MAX_DEPTH, maxChildren: MAX_CHILDREN, sample: SAMPLE },
    rules: Object.keys(RULES).map(k => ({ id: k, label: RULES[k], count: counts[k] })),
    cannot: 'Whether a card is filed under the right answer, or an answer has the best name: content and categorisation need a person.',
    top, menuRule, tagAsked, menuSense };
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
