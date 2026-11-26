#!/usr/bin/env node
/* @family. — tools/shared-lists.js THE SHARED-LISTS CHECK (rule 1.1 by rule 1.75, owner 20 Nov): a list or a limit the site and the backend both
   keep is written once, in data/settings/settings.json (or default-pictures.json), and generated to both sides as SHARED_SETTINGS (cards-gen);
   never a hand copy. A parent would notice the drift as a picture one side does not know, or a box that takes more than the server keeps.
   Counted site-wide over every list in LISTS. Prints the count; a hand mirror fails the build. tools/build.js runs it. */
'use strict';
const vm = require('vm');
const { text, srcFiles, main } = require('./lib/gen.js');
const json = f => JSON.parse(text(f));

/* EACH SHARED LIST OR LIMIT: the backend constant and where SHARED_SETTINGS holds it. */
const LISTS = [
  ['PFP_PICTURES', 'pictures'],
  ['RULE_IDS', 'siteRules.ids'], ['RULES_LOCKED', 'siteRules.locked'],
  ['PHOTO_MAX', 'limits.photoMax'], ['JOB_MAX', 'limits.jobMax'], ['LIBRARY_CARDS', 'limits.libraryCards'],
  ['FAV_LINKS_MAX', 'limits.favLinksMax'], ['FAV_TITLE_MAX', 'limits.favTitleMax'], ['FAV_URL_MAX', 'limits.favUrlMax'],
  ['DIGEST_WORD_MAX', 'limits.digestWordMax'],
];
const at = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
/* THE GENERATED BLOCK, as each side carries it. */
function sharedOf(file) {
  const m = /const SHARED_SETTINGS = (\{.*\});\n/.exec(text(file));
  if (!m) throw new Error('shared-lists: ' + file + ' has no SHARED block');
  return JSON.parse(m[1]);
}
/* A TOP-LEVEL `const`/`function` by name, up to its first top-level end (one line or a block closed at column 0). */
function grab(src, name, file) {
  const lines = src.split('\n');
  const i = lines.findIndex(l => new RegExp('^(const|function) ' + name + '\\b').test(l) || new RegExp('^const .*\\b' + name + ' =').test(l));
  if (i < 0) throw new Error('shared-lists: no ' + name + ' in ' + file);
  const out = [];
  const block = /^function /.test(lines[i]) || /\{\s*$/.test(lines[i]);
  for (let j = i; j < lines.length; j++) { out.push(lines[j]); if (block ? /^}/.test(lines[j]) : /;\s*$/.test(lines[j])) break; }
  return out.join('\n');
}

function find() {
  const bad = [];
  const gs = text('backend/constants.gs');
  const want = json('data/settings/settings.json');
  want.pictures = json('data/settings/default-pictures.json').map(r => String(r.picture || '').trim()).filter(Boolean);
  const strip = o => JSON.parse(JSON.stringify(o, (k, v) => (k === '_about' ? undefined : v)));
  const sides = { 'js/core.js': sharedOf('js/core.js'), 'backend/constants.gs': sharedOf('backend/constants.gs') };
  /* 1. EACH IS THE SOURCE'S, ON BOTH SIDES, AND THE BACKEND CONSTANT READS IT (no literal). */
  for (const [name, p] of LISTS) {
    const src = JSON.stringify(strip(at(want, p)));
    if (src === undefined) { bad.push(name + ': no `' + p + '` in the source'); continue; }
    Object.entries(sides).forEach(([f, s]) => { if (JSON.stringify(at(s, p)) !== src) bad.push(name + ': ' + f + ' is stale (run cards-gen)'); });
    const line = grab(gs, name, 'backend/constants.gs');
    if (line.indexOf('SHARED_SETTINGS.' + p) === -1) bad.push(name + ': backend/constants.gs mirrors it by hand');
  }
  /* AND NO HAND COPY ON THE SITE: no js/ file names a backend constant with a literal. */
  for (const p of srcFiles('js', /\.js$/)) {
    const f = p.slice(3), s = text(p);
    for (const [name] of LISTS) if (new RegExp('\\b(const|let|var)\\s+' + name + '\\s*=\\s*[\\[{\\d\'"]').test(s)) bad.push(name + ': js/' + f + ' mirrors it by hand');
  }
  /* PICTURES: links.js draws exactly the source's, and reads the list from SHARED_SETTINGS. */
  const links = text('js/links.js');
  const art = Object.keys(vm.runInNewContext('(' + /const PFP_ART = (\{[\s\S]*?\n\});/.exec(links)[1] + ')'));
  if (art.join() !== want.pictures.join()) bad.push('pictures: js/links.js PFP_ART draws ' + art.join(',') + ', the source is ' + want.pictures.join(','));
  if (!/const PFP_PICTURES = SHARED_SETTINGS\.pictures;/.test(links)) bad.push('pictures: js/links.js does not read SHARED_SETTINGS.pictures');
  /* RULES: js/rules.js registers exactly the source's ids, a `lock` on exactly the locked ones. */
  const rules = vm.runInNewContext('(' + /const RULES = (\[[\s\S]*?\n\]);/.exec(text('js/rules.js'))[1] + ')');
  const ids = rules.map(r => r.id).sort(), lockd = rules.filter(r => r.lock).map(r => r.id).sort();
  if (ids.join() !== want.siteRules.ids.slice().sort().join()) bad.push('rules: js/rules.js registers ' + ids.join(',') + ', the source has ' + want.siteRules.ids.slice().sort().join(','));
  if (lockd.join() !== want.siteRules.locked.slice().sort().join()) bad.push('rules: js/rules.js locks ' + lockd.join(',') + ', the source locks ' + want.siteRules.locked.slice().sort().join(','));

  return { lists: LISTS.length, bad };
}
function run() {
  const { lists, bad } = find();
  const hand = bad.filter(b => /by hand|stale/.test(b)).length;
  console.log('shared-lists: ' + lists + ' lists, ' + hand + ' hand-mirrored, ' + (bad.length - hand) + ' other mismatch(es)');
  bad.slice(0, 30).forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('shared-lists: ' + bad.length + ' problem(s); write each in data/settings/settings.json and run cards-gen');
}
module.exports = { run, find };
main(module, run);
