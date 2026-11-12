#!/usr/bin/env node
/* THE STABILITY SCORE (730): 100% less a penalty per signal, read from the repo alone — no network, no clock, no run. */
// Weights (points off per unit, each signal capped):
// exceptions   0.10 per entry in a check's written-exception list (ACCEPTED, *_OK, KNOWN*, ALLOW*), cap 20
// catches      0.02 per empty catch in js/ (tools/catches.js, the count check-catches gates), cap 15
// ceilings     0.002 per unit of every raised *_MAX ratchet in the checks, cap 10
// special      0.05 per per-facet or per-kind special case (`facet === '…'`, `kind === '…'`) outside the checks, cap 10
// dead         0.30 per function nothing calls (tools/dead.js, the list check-dead fails on), cap 10
// longfiles    0.50 per js/ or backend file over 3000 lines, cap 10
// longfns      0.05 per top-level function over 150 lines, cap 10
// markers      0.20 per TODO / FIXME / HACK / XXX outside the checks, cap 5
// duplicates   0.02 per repeated non-trivial line (60+ characters, seen 3+ times) in js/, cap 10
// TIERS (860): the score weighs core files only (data/settings/tiers.json); the secondary files' figures are `secondary`, shown apart.
// A red check is not scored: check-all fails it outright, and slowness depends on the machine. `--check` compares data/stability.json.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const list = d => { try { return fs.readdirSync(path.join(ROOT, d)).sort(); } catch (e) { return []; } };
const jsApp = list('js').filter(f => f.endsWith('.js') && !f.startsWith('check')).map(f => 'js/' + f);
const jsCheck = list('js').filter(f => /^check.*\.js$/.test(f)).map(f => 'js/' + f).concat(list('check').filter(f => f.endsWith('.js')).map(f => 'check/' + f));
const gs = list('backend').filter(f => f.endsWith('.gs')).map(f => 'backend/' + f);
const TIERS = (() => { try { return JSON.parse(read('data/settings/tiers.json')); } catch (e) { return {}; } })();
/* A FILE'S TIER: an app file by its name, a check by its suite entry; the backend, index.html and style.css are core. */
const tierOf = f => {
  let m = /^js\/(?!check)([\w-]+)\.js$/.exec(f);
  if (m) return (TIERS.files || {})[m[1]] || 'core';
  m = /^(?:js\/)?(check[\w\/.-]*\.js)$/.exec(f.replace(/^js\/(check)/, '$1'));
  if (m) { const k = Object.keys(TIERS.checks || {}).find(c => c.split(' ')[0] === m[1]); return k ? TIERS.checks[k] : 'core'; }
  return 'core';
};
let TIER = 'core';
const mine = f => tierOf(f) === TIER;
const noComments = s => s.replace(/(^|[\s;{}(),])\/\*[\s\S]*?\*\//g, '$1').replace(/(^|\s)\/\/[^\n]*/g, '$1');

function exceptions() {
  let n = 0; const where = {};
  jsCheck.filter(mine).forEach(f => {
    const s = noComments(read(f));
    for (const m of s.matchAll(/const (\w*(?:ACCEPTED|_OK|KNOWN|ALLOW)\w*) = (\[|\{|new Set\(\[)([\s\S]*?)\n\s*(?:\]|\}|\]\))\)?;/g)) {
      const k = m[3].split('\n').filter(l => /^\s*(['"`{\[]|[\w$]+\s*:)/.test(l)).length || (m[3].trim() ? m[3].split(',').filter(x => x.trim()).length : 0);
      if (k) { n += k; where[f + ' ' + m[1]] = k; }
    }
  });
  return { n, where };
}
const catches = () => ({ n: require('./catches.js').emptyCatches(jsApp.filter(mine)).length });   // the one count (tools/catches.js)
function ceilings() {
  let n = 0; const where = {};
  jsCheck.filter(mine).forEach(f => { for (const m of read(f).matchAll(/^const (\w+_MAX) = (\d+);/gm)) { n += Number(m[2]); where[f + ' ' + m[1]] = Number(m[2]); } });
  return { n, where };
}
function special() {
  let n = 0; const where = {};
  jsApp.filter(mine).forEach(f => { const k = (noComments(read(f)).match(/\b(?:facet|kind)\s*===?\s*'[^']+'/g) || []).length; if (k) { n += k; where[f] = k; } });
  return { n, where };
}
let DEAD = null;
function dead() {
  if (TIER !== 'core') return { n: 0 };
  if (DEAD) return DEAD;
  const names = require('./dead.js').deadFunctions().map(d => d.name + ' (' + d.file + ')');   // the one list (tools/dead.js)
  return (DEAD = { n: names.length, where: names.length ? { 'check-dead': names.slice(0, 40).join(', ') } : {} });
}
function longfiles() {
  const where = {};
  jsApp.concat(gs).filter(mine).forEach(f => { const k = read(f).split('\n').length; if (k > 3000) where[f] = k; });
  return { n: Object.keys(where).length, where };
}
function longfns() {
  const where = {};
  jsApp.concat(gs).filter(mine).forEach(f => {
    const L = read(f).split('\n');
    for (let i = 0; i < L.length; i++) {
      const m = /^(?:async )?function (\w+)/.exec(L[i]);
      if (!m) continue;
      let j = i + 1;
      while (j < L.length && L[j] !== '}') j++;
      if (j - i > 150) where[f + ' ' + m[1]] = j - i;
      i = j;
    }
  });
  return { n: Object.keys(where).length, where };
}
function markers() {
  let n = 0; const where = {};
  jsApp.concat(gs, ['index.html', 'style.css']).filter(mine).forEach(f => { const k = (read(f).match(/\b(?:TODO|FIXME|HACK|XXX)\b/g) || []).length; if (k) { n += k; where[f] = k; } });
  return { n, where };
}
function duplicates() {
  const seen = {};
  jsApp.filter(mine).forEach(f => noComments(read(f)).split('\n').map(l => l.trim()).filter(l => l.length >= 60).forEach(l => { seen[l] = (seen[l] || 0) + 1; }));
  const rep = Object.keys(seen).filter(l => seen[l] >= 3);
  return { n: rep.reduce((a, l) => a + seen[l] - 1, 0), where: { lines: rep.length } };
}

const SIGNALS = [
  ['exceptions', 'Written exceptions in the checks', 0.10, 20, exceptions],
  ['catches', 'Empty catches (tools/catches.js)', 0.02, 15, catches],
  ['ceilings', 'Raised ratchet ceilings (*_MAX)', 0.002, 10, ceilings],
  ['special', 'Per-facet and per-kind special cases', 0.05, 10, special],
  ['dead', 'Code nothing calls', 0.30, 10, dead],
  ['longfiles', 'Files over 3000 lines', 0.50, 10, longfiles],
  ['longfns', 'Functions over 150 lines', 0.05, 10, longfns],
  ['markers', 'TODO / FIXME / HACK markers', 0.20, 5, markers],
  ['duplicates', 'Repeated long lines', 0.02, 10, duplicates],
];
function scored(tier) {
  TIER = tier;
  const signals = SIGNALS.map(([id, label, weight, cap, fn]) => {
    const r = fn();
    return { id, label, count: r.n, weight, cap, off: Math.round(Math.min(cap, r.n * weight) * 10) / 10, where: r.where || {} };
  });
  const off = signals.reduce((a, s) => a + s.off, 0);
  const score = Math.max(0, Math.round((100 - off) * 10) / 10);
  const verdict = score >= 85 ? 'Solid: little is held together by exceptions.' : score >= 70 ? 'Steady, with duct tape worth paying down.'
    : score >= 50 ? 'Shaky: exceptions and special cases are piling up.' : 'Fragile: the exceptions outweigh the rules.';
  TIER = 'core';
  return { score, verdict, signals: signals.slice().sort((a, b) => b.off - a.off || a.id.localeCompare(b.id)) };
}
/* THE SCORE IS CORE'S; the secondary tier's is beside it, never in it. */
function stability() {
  const core = scored('core'), sec = scored('secondary');
  return { v: 2, tier: 'core', score: core.score, verdict: core.verdict, signals: core.signals, secondary: sec };
}
module.exports = { stability };
if (require.main === module) {
  const file = path.join(ROOT, 'data', 'stability.json'), want = JSON.stringify(stability(), null, 1) + '\n';
  if (process.argv.includes('--check')) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (now === want) { console.log('OK — data/stability.json is current (' + JSON.parse(want).score + '%).'); process.exit(0); }
    console.log('FAILED — data/stability.json is stale: run node tools/stability.js'); process.exit(1);
  }
  fs.writeFileSync(file, want);
  console.log('wrote data/stability.json: ' + JSON.parse(want).score + '%');
}
