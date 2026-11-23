#!/usr/bin/env node
/* @family. — tools/one-list.js THE ONE-LIST CHECK (rule 1.75, UNIFY NEXT 2, 22 Nov): every list in data/settings/*.json has one home.
   Fails the build on (1) the same list of 3+ words written out in two settings files; (2) outside settings.json, a list equal to the
   permission tiers (settings.json `roles.tiers`) or to a `roles.may` word's tiers, which a file names instead (actions.json "tiers",
   "signedIn", "grownUp"); (3) a content.json family writing the board, subject, level or key stage its expected-papers.json line holds;
   (4) a level in settings.json `levels.list` off the one ladder — no rung and no key stage — that does not say `ladder: false` (UNIFY AFTER 4:
   Functional Skills was one, so it sorted after the ladder and no key-stage filter held it). */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const { ROOT } = require('./lib/gen.js');
/* Data, not settings lists: facts, approved pictures and question aliases are rows of their own. */
const SKIP = new Set(['facts.json', 'gallery-approved.json', 'question-aliases.json']);

function files() {
  return fs.readdirSync(path.join(ROOT, 'data', 'settings')).filter(f => f.endsWith('.json') && !SKIP.has(f)).sort()
    .map(f => ({ f, j: SD.json('data/settings/' + f) }));
}
function lists(j, each, p = '') {
  if (Array.isArray(j)) {
    if (j.length && j.every(x => typeof x === 'string')) each(j, p);
    j.forEach((x, i) => lists(x, each, p + '[' + i + ']'));
  } else if (j && typeof j === 'object') Object.keys(j).forEach(k => lists(j[k], each, p + '.' + k));
}
const keyOf = a => JSON.stringify([...new Set(a.map(s => s.toLowerCase()))].sort());

function scan() {
  const bad = [], all = files(), S = SD.settings(), T = S.roles.tiers, home = {};
  /* (1) one list, two files */
  const seen = new Map();
  all.forEach(({ f, j }) => lists(j, (a, p) => {
    if (a.length < 3) return;
    const k = keyOf(a);
    if (!seen.has(k)) seen.set(k, new Map());
    if (!seen.get(k).has(f)) seen.get(k).set(f, p);
  }));
  seen.forEach(at => { if (at.size > 1) bad.push('the same list in ' + [...at].map(([f, p]) => f + p).join(' and ')); });
  /* (2) a tier list written out where a name says it */
  home[keyOf(T)] = 'tiers';
  Object.keys(S.roles.may).forEach(w => {
    const m = S.roles.may[w];
    if (!m || typeof m !== 'object' || m.rank || m.owner) return;
    const t = T.filter(x => (!m.tiers || m.tiers.includes(x)) && (!m.notTiers || !m.notTiers.includes(x)));
    if (t.length > 1 && !home[keyOf(t)]) home[keyOf(t)] = w;
  });
  all.filter(x => x.f !== 'settings.json').forEach(({ f, j }) => lists(j, (a, p) => {
    if (a.length > 1 && a.every(x => T.includes(x)) && home[keyOf(a)]) bad.push(f + p + ': ' + JSON.stringify(a) + ' is "' + home[keyOf(a)] + '" (settings.json roles)');
  }));
  /* (3) a content family copying its qualification's line */
  const exp = {}; (SD.json('data/settings/expected-papers.json') || []).forEach(e => { exp[e.label] = e; });
  const stage = {}; S.levels.list.forEach(l => { stage[l.level] = l.stages[0]; });
  ((SD.json('data/settings/content.json') || {}).families || []).forEach(fam => {
    const e = fam.qualification && exp[fam.qualification];
    if (!e) return;
    const c = fam.card || {}, same = [];
    if (fam.board === e.board) same.push('board');
    [['subject', e.subject], ['level', e.level], ['exam_board', e.board], ['company', e.board], ['key_stage', stage[e.level]]]
      .forEach(([k, v]) => { if (c[k] !== undefined && c[k] === v) same.push('card.' + k); });
    if (same.length) bad.push('content.json ' + fam.family + ': ' + same.join(', ') + ' copied from expected-papers.json "' + fam.qualification + '"');
  });
  /* (4) every school level on the one ladder */
  S.levels.list.forEach(l => { if (!l.rung && !(l.stages || []).length && l.ladder !== false) bad.push('settings.json levels.list "' + l.level + '" has no rung and no key stage: give it its key stage, or `ladder: false`'); });
  return { bad, files: all.length, lists: seen.size, levels: S.levels.list.length };
}

async function run() {
  const r = scan();
  console.log('one-list: ' + r.lists + ' word lists across ' + r.files + ' settings files, each in one place; ' + r.levels + ' levels each on the ladder or marked off it');
  if (r.bad.length) {
    r.bad.forEach(b => console.log('  ' + b));
    throw new Error('one-list: ' + r.bad.length + ' problem(s) — a list written out twice (name the one home instead) or a level off the ladder');
  }
}
module.exports = { run, scan };
if (require.main === module) run().catch(e => { console.error(e.message); process.exit(1); });
