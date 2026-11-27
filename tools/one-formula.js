#!/usr/bin/env node
/* @family. — tools/one-formula.js THE DERIVED-QUESTION CHECK (rule 1.75; owner 27 Nov: questions from the government documents' own
   equations). A child given "The force is 98 N and the mass is 7 kg. Calculate the acceleration in m/s²." must find that the answer they are
   marked against is the one the document's equation gives, and that each unit is the right one for its quantity. Over every template of
   data/settings/qgen-derived.json (tools/spec-formulas.js), 40 seeds each, read as the child reads it (the numbers and units in its words, the
   answer in its key):
     - the numbers satisfy the equation as the stored source prints it (read afresh here from data/settings/curriculum/<country>/sources);
     - each number's unit has its quantity's dimensions, and so has the answer's; every equation used balances in units; a value the
       documents give (g=10 N/kg) has its quantity's units;
     - every template says what it asks (`made`), and the file is the one tools/spec-formulas.js makes (a hand edit fails).
   `--prove` breaks each and fails unless every break is caught (run every time, as tools/spec-tree.js does). Run by tools/build.js after one-gen. */
'use strict';
const { main } = require('./lib/gen.js');
const SF = require('./spec-formulas.js');
const QG = require('./lib/qgen.js');

const SEEDS = 40;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function data() {
  const src = SF.readSources('uk'), U = SF.solveUnits(src), V = SF.unitsShown(src, U);
  return { S: src, U, V, stored: SF.stored(), built: SF.build() };
}

function problems(d) {
  const bad = [], Src = d.S, U = d.U, V = d.V, D = d.stored;
  if (SF.fileText(D) !== SF.fileText(d.built)) bad.push(SF.OUT + ' is not the file tools/spec-formulas.js makes from the sources (a hand edit, or stale): run node tools/spec-formulas.js');
  const dimsOf = n => U.dims[U.entOf[SF.headOf(n)]];
  const unitDims = (u, what) => { const a = SF.parseUnit(u, V.symDims); if (!a) { bad.push(what + ': unit "' + u + '" is none the documents give'); return null; } return SF.atomDims(a, V.symDims); };
  /* every equation used balances in units */
  Src.eqs.forEach(e => {
    if (e.skip) return;
    const F = SF.termsOf(e), sum = SF.BASE.map(() => 0);
    if (F.terms.some(t => !dimsOf(t.name))) return;
    F.terms.forEach(t => dimsOf(t.name).forEach((x, j) => { sum[j] += t.e * x; }));
    if (sum.some(x => Math.abs(x) > 1e-9)) bad.push('"' + e.text + '": its units do not balance');
  });
  Object.keys(Src.constants).forEach(n => { const c = Src.constants[n], cd = unitDims(c.unit, 'the value ' + c.symbol + '=' + c.value); if (cd && dimsOf(n) && !SF.sameDims(cd, dimsOf(n))) bad.push(c.symbol + '=' + c.value + ' ' + c.unit + ': not the units of ' + n); });
  const made = new Map((D.made || []).map(m => [m.id, m]));
  (D.templates || []).forEach(t => {
    const m = made.get(t.id), say = s => bad.push(t.id + ': ' + s);
    if (!m) return say('no `made` entry: what it asks is unsaid');
    const e = Src.eqs[m.equation];
    if (!e || e.skip) return say('its equation ' + m.equation + ' is none the sources give');
    const F = SF.termsOf(e);
    if (![m.target].concat(m.givens).every(n => F.terms.some(x => x.name === n))) return say('asks about a quantity "' + e.text + '" does not have');
    let fails = 0;
    for (let s = 1; s <= SEEDS && fails < 3; s++) {
      let q; try { q = QG.generate(t, s); } catch (x) { say('seed ' + s + ': ' + x.message); fails++; continue; }
      const vals = {}, units = {};
      const miss = m.givens.find(g => {
        const r = new RegExp('\\bthe ' + esc(g) + ' is (-?\\d+(?:\\.\\d+)?)(?: ([^,]*?))??(?=, the | and the |\\. Calculate )', 'i').exec(q.text);
        if (!r) return true; vals[g] = +r[1]; units[g] = r[2] || ''; return false;
      });
      const a = new RegExp('Calculate the ' + esc(m.target) + '(?: in (.+?))?\\.$').exec(q.text), k = /^\s*(-?\d+(?:\.\d+)?)/.exec(q.key.split('|')[0]);
      if (miss || !a || !k) { say('"' + q.text + '" does not read as its givens and target' + (miss ? ' (' + miss + ')' : '')); fails++; continue; }
      vals[m.target] = +k[1]; units[m.target] = a[1] || '';
      let p = 1; F.terms.forEach(x => { p *= Math.pow(vals[x.name], x.e); });
      if (!(Math.abs(p - F.K) <= 1e-6 * Math.abs(F.K))) { say('"' + q.text + '" answer ' + q.key + ': does not satisfy ' + e.text); fails++; continue; }
      Object.keys(units).forEach(n => {
        const ud = unitDims(units[n], t.id + ' ' + n); if (!ud) { fails++; return; }
        if (!SF.sameDims(ud, dimsOf(n))) { say('"' + q.text + '": ' + n + ' in "' + units[n] + '", not a unit of ' + n); fails++; }
      });
    }
  });
  return bad;
}

const clone = x => JSON.parse(JSON.stringify(x));
const first = d => d.stored.templates[0];
const BREAKS = [
  { name: 'an answer off by one', d: d => { d.stored = clone(d.stored); first(d).key = first(d).key.replace('{ans}', '{+ans + 1}'); } },
  { name: 'a given in the wrong unit', d: d => { d.stored = clone(d.stored); const m = d.stored.made[0], g = m.givens[0], u = m.units[g]; first(d).text = first(d).text.replace(g + ' is {g0} ' + u, g + ' is {g0} ' + (u === 'J' ? 'N' : 'J')); } },
  { name: 'the answer in the wrong unit', d: d => { d.stored = clone(d.stored); const m = d.stored.made[0], u = m.units[m.target]; first(d).text = first(d).text.replace(' in ' + u + '.', ' in ' + (u === 's' ? 'm' : 's') + '.'); } },
  { name: 'an equation misread', d: d => { const e = d.S.eqs.find(x => !x.skip); e.rhs.f[0].e = -e.rhs.f[0].e; } },
  { name: 'a unit the documents do not give', d: d => { d.stored = clone(d.stored); const m = d.stored.made[0], g = m.givens[0]; first(d).text = first(d).text.replace(g + ' is {g0} ' + m.units[g], g + ' is {g0} furlongs'); } },
  { name: 'a template saying nothing of what it asks', d: d => { d.stored = clone(d.stored); d.stored.made.shift(); } },
  { name: 'the derived file edited by hand', d: d => { d.stored = clone(d.stored); d.stored.retired['sc-quadrat'] = d.stored.templates[0].id; } },
];

function run() {
  const d = data(), bad = problems(d);
  if (bad.length) { console.error('one-formula: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 30).join('\n  ')); throw new Error('one-formula check failed'); }
  const missed = BREAKS.filter(b => { const x = data(); b.d(x); return !problems(x).length; }).map(b => b.name);
  if (missed.length) throw new Error('one-formula --prove: missed ' + missed.join(', '));
  const D = d.stored;
  console.log('one-formula: ' + D.templates.length + ' derived templates x ' + SEEDS + ' seeds, each answer satisfying its equation as the documents print it and every unit its quantity\'s; '
    + D.equations.filter(e => !e.skip).length + ' equations balanced in units; ' + Object.keys(D.retired).length + ' hand template(s) retired; --prove ' + BREAKS.length + ' breaks caught');
}

main(module, run);
module.exports = { run, problems, BREAKS };
