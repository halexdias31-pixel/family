#!/usr/bin/env node
/* @family. — tools/card-health.js ONE CARD'S TAGS AND CONTROLS (1040 r12), measured over the library in the real app (check/jsdom-app.js). */
/* Writes data/card-health.json, read by tools/health.js as two worklist kinds, ideal 0 each:                                              */
/*   odd-tags      a tag made of two or more of its card's other tags ("Paper 1 (Non-calculator) — June 2019" beside June, 2019), or a */
/*                 value on (almost) every card, which tells a reader nothing                                                           */
/*   dup-controls  one control twice on one card: the same data-do with the same data-* values (the magnifier in the tool row and the foot) */
/* Every question card is read (they carry the most tags); other kinds are sampled evenly, SAMPLE per kind. --check: exit 1 when stale. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'data', 'card-health.json');
const SAMPLE = Number(process.env.CH_SAMPLE) || 400, CARDS = Number(process.env.CH_CARDS) || 300, EVERYWHERE = 0.995;

/* A TAG REPEATS ANOTHER when the other's words (3+ letters or a 4-digit year) sit in it as whole words. */
function repeats(a, b) {
  const k = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const A = ' ' + k(a) + ' ', B = k(b);
  return B.length >= 3 && A.trim() !== B && A.indexOf(' ' + B + ' ') !== -1;
}
/* A COMPOSITE: a tag holding two or more of its card's other tags, apart (not one inside another) — a title, not one attribute value. */
function composite(t, others) {
  const hit = [...new Set(others)].filter(u => repeats(t, u)).sort((a, b) => b.length - a.length), kept = [];
  hit.forEach(u => { if (!kept.some(v => repeats(v, u) || repeats(u, v))) kept.push(u); });
  return kept.length >= 2 ? kept : [];
}
/* CONTROLS TWICE: the same act on the same key, once per card. */
function dups(acts) { const seen = {}, out = [];
  acts.forEach(([d, k]) => { const id = d + '|' + k; if (seen[id] === 1) out.push(d + (k ? ' (' + k + ')' : '')); seen[id] = (seen[id] || 0) + 1; });
  return out; }
/* MUTATION PROOF: the owner's screenshot must be caught, a plain tag row must pass. */
if (!repeats('Paper 1 (Non-calculator) – June 2019', 'June') || repeats('Paper 1', 'June') || repeats('Maths', 'Maths')
  || composite('Paper 1 (Non-calculator) – June 2019', ['June', '2019', 'Non-calculator']).length !== 3 || composite('Quantitative Chemistry', ['Chemistry', 'Maths']).length
  || dups([['q-mag', ''], ['read-aloud', 'k'], ['q-mag', '']]).length !== 1 || dups([['read-aloud', 'a'], ['read-aloud', 'b']]).length)
  { console.error('card-health: the odd-tags / dup-controls rules fail their own mutation test'); process.exit(2); }

(async () => {
  const { app, tick } = require('../check/jsdom-app.js');
  const A = await app(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8')));
  A.w.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [] }; A.w.SpeechSynthesisUtterance = function () {};
  const ev = s => A.w.__ev(s), t0 = Date.now();
  ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
    if (Date.now() - t0 > 240000) { console.error('card-health: the app never settled in 240s'); process.exit(2); }
    await tick(250); ev('inFinder_(FINDERS.stuff, () => stuffItems())');
  }
  const got = JSON.parse(ev(`(() => {
    USER = Object.assign({ name: 'T', personId: 'P-T' }, { role: 'Admin', roles: ['admin'] });
    stuffForget_();
    return inFinder_(FINDERS.stuff, () => { STUFF.filters = []; STUFF.q = ''; STUFF.admit = null;
      const all = stuffItems(), by = {};
      all.forEach(x => { const k = isQ_(x) ? 'q' : String(x.kind || '?'); (by[k] = by[k] || []).push(x); });
      const pick = (l, n) => l.length <= n ? l : l.filter((x, i) => i % Math.ceil(l.length / n) === 0);
      const read = [].concat(...Object.keys(by).map(k => k === 'q' ? by[k] : pick(by[k], ${SAMPLE})));
      const cards = read.map(x => { const d = document.createElement('div'); d.innerHTML = tagRow_(x);
        return { id: (x.kind || '?') + ':' + (x.key || x.name), tags: [...d.querySelectorAll('.qtag')].map(s => [s.getAttribute('data-f'), s.textContent.trim()]) }; });
      const drawn = [].concat(...Object.keys(by).map(k => pick(by[k].filter(x => x.key), k === 'q' ? ${CARDS} : 20))).map(x => {
        const d = document.createElement('div');
        try { d.innerHTML = isQ_(x) ? questionWhole_(x, questionParts_()[qId_(x)] || [x]) : stuffCard(x); } catch (e) { return null; }
        return { id: (x.kind || '?') + ':' + x.key, acts: [...d.querySelectorAll('[data-do]')].filter(b => b.getAttribute('data-do')).map(b => [b.getAttribute('data-do'), [...b.attributes].filter(a => /^data-/.test(a.name) && a.name !== 'data-do').map(a => a.value).join(' ')]) };
      }).filter(Boolean);
      return JSON.stringify({ items: all.length, cards, drawn });
    }); })()`));
  A.close();
  const work = [], counts = {};
  got.cards.forEach(c => c.tags.forEach(([f, t]) => { const k = f + '=' + t; counts[k] = (counts[k] || 0) + 1;
    const held = composite(t, c.tags.map(x => x[1]));
    if (held.length) work.push({ kind: 'odd-tags', where: c.id, say: `tag "${t}" (${f}) is a title made of the card's other tags ${held.map(u => '"' + u + '"').join(' + ')}` }); }));
  Object.keys(counts).filter(k => counts[k] >= EVERYWHERE * got.cards.length).forEach(k =>
    work.push({ kind: 'odd-tags', where: 'every card', say: `tag "${k.split('=').slice(1).join('=')}" (${k.split('=')[0]}) is on ${counts[k]} of ${got.cards.length} cards read — it tells a reader nothing (owner question)` }));
  got.drawn.forEach(c => dups(c.acts).forEach(d => work.push({ kind: 'dup-controls', where: c.id, say: `${d} drawn twice on one card` })));
  const by = k => work.filter(w => w.kind === k).length;
  const pairs = {}; work.forEach(w => { const k = w.kind === 'dup-controls' ? w.say.replace(/ \(.*\)/, '') : w.say.replace(/"[^"]*"/g, '…'); pairs[k] = (pairs[k] || 0) + 1; });
  const out = { items: got.items, tagCards: got.cards.length, drawnCards: got.drawn.length, counts: { 'odd-tags': by('odd-tags'), 'dup-controls': by('dup-controls') },
    byRule: Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 60), work: work.slice(0, 2000) };
  const text = JSON.stringify(out, null, 1) + '\n';
  if (process.argv.includes('--check')) { let had = ''; try { had = fs.readFileSync(OUT, 'utf8'); } catch (e) { had = ''; /* no file yet: stale */ }
    if (text === had) { console.log('card-health: current'); process.exit(0); } console.error('card-health: data/card-health.json is STALE'); process.exit(1); }
  fs.writeFileSync(OUT, text);
  console.log('card-health: ' + got.cards.length + ' tag rows, ' + got.drawn.length + ' cards drawn — odd-tags ' + out.counts['odd-tags'] + ', dup-controls ' + out.counts['dup-controls'] + ' (' + Math.round((Date.now() - t0) / 1000) + 's)');
  process.exit(0);
})().catch(e => { console.error('card-health: ' + (e && e.stack || e)); process.exit(2); });
