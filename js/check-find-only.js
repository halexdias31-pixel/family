#!/usr/bin/env node
require('../check/quiet');
/* @family. — check-find-only.js FIND IS THE ONLY WAY AROUND (owner, 14 Nov, step 3, rule 5.8): every screen in TAB_ORDER is surveyed in */
/* data/settings/find-only.json; one marked `moved` has no column, no screen code, no <section>, no columns.json row, and its old name */
/* opens its Find branch (screens-moved.json); the columns still standing are listed in check/find-only-ratchet.json, a list that only */
/* gets shorter (`--lower` after a move). */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), RATCHET = path.join(ROOT, 'check/find-only-ratchet.json'), bad = [];
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SURVEY = JSON.parse(read('data/settings/find-only.json'));
const boot = read('js/shell-boot.js'), m = /const TAB_ORDER = \[([\s\S]*?)\];/.exec(boot);
if (!m) { console.log('FAIL — TAB_ORDER is not in js/shell-boot.js'); process.exit(1); }
/* THE TABS TABLE ONLY: SETTING_GROUPS (shell-boot.js) names the moved settings as card groups, which is not a column. */
const tabsSrc = (/const TABS = \[([\s\S]*?)\n\];/.exec(boot) || [, boot])[1];
const tabs = [...m[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]);
const columns = JSON.parse(read('data/settings/columns.json')).map(r => r.screen);
const moved = {}; JSON.parse(read('data/settings/screens-moved.json')).forEach(r => { moved[r.screen] = r.to; });
const html = read('index.html');
const js = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /\.js$/.test(f) && !/^check/.test(f)).map(f => [f, read('js/' + f)]);

/* THE SURVEY IS WHOLE: every column is listed, each with a known status and the facts the owner reads. */
const rows = SURVEY.screens || [], ids = rows.map(r => r.id);
tabs.forEach(t => { if (ids.indexOf(t) < 0) bad.push(`column ${t} is in TAB_ORDER but not surveyed in data/settings/find-only.json`); });
rows.concat(SURVEY.flows || []).forEach(r => {
  if (!SURVEY.statuses[r.status]) bad.push(`${r.id}: unknown status ${r.status}`);
  if (r.status !== 'flow' && ['name', 'shows', 'who', 'reached', 'data'].some(k => !String(r[k] || '').trim())) bad.push(`${r.id}: name, shows, who, reached and data are all needed`);
});

/* A MOVED SCREEN HAS NO COLUMN AND ITS OLD NAME OPENS ITS FIND BRANCH. */
rows.filter(r => r.status === 'moved').forEach(r => {
  const id = r.id;
  if (tabs.indexOf(id) >= 0) bad.push(`${id} is moved but still in TAB_ORDER`);
  if (columns.indexOf(id) >= 0) bad.push(`${id} is moved but still in data/settings/columns.json`);
  if (html.indexOf(`id="s-${id}"`) >= 0) bad.push(`${id} is moved but index.html still has its <section id="s-${id}">`);
  if (new RegExp(`\\bid:\\s*'${id}'`).test(tabsSrc)) bad.push(`${id} is moved but js/shell-boot.js still lists it in TABS`);
  js.forEach(([f, s]) => { if (new RegExp(`\\bscreen\\(\\s*['"]${id}['"]`).test(s)) bad.push(`js/${f} still registers screen('${id}')`); });
  if (!/^find:/.test(moved[id] || '')) bad.push(`${id} is moved but data/settings/screens-moved.json sends it nowhere in Find`);
  else if (r.to && r.to !== moved[id]) bad.push(`${id}: find-only.json says ${r.to}, screens-moved.json ${moved[id]}`);
});
/* A REDIRECT NAMES THE SAME BRANCH screens-moved.json DOES. */
rows.filter(r => r.status === 'redirect').forEach(r => { if (moved[r.id] !== r.to) bad.push(`${r.id}: find-only.json says ${r.to}, screens-moved.json ${moved[r.id] || 'nothing'}`); });

/* THE RATCHET: columns still standing (TAB_ORDER less Find); never one more, never a new one, lowered when one goes. */
const left = tabs.filter(t => (rows.find(r => r.id === t) || {}).status !== 'find').sort();
const R = JSON.parse(fs.readFileSync(RATCHET, 'utf8'));
if (process.argv.includes('--lower')) { R.left = left; R.total = left.length; fs.writeFileSync(RATCHET, JSON.stringify(R, null, 1) + '\n'); console.log(`ratchet lowered to ${left.length}`); }
else {
  if (left.length > R.total) bad.push(`${left.length} columns outside Find, ratchet allows ${R.total} — the list only goes down`);
  left.filter(t => (R.left || []).indexOf(t) < 0).forEach(t => bad.push(`column ${t} is new: build it as a Find branch, not a screen`));
  if (left.length < R.total) bad.push(`only ${left.length} columns left but the ratchet says ${R.total}: run node js/check-find-only.js --lower`);
}
if (bad.length) { bad.forEach(b => console.log('  ' + b)); console.log(`FAILED — ${bad.length} find-only problem(s).`); process.exit(1); }
const n = s => rows.filter(r => r.status === s).length;
console.log(`OK — ${rows.length} screens surveyed (${n('moved')} moved, ${n('redirect')} redirect, ${n('column')} column, ${n('off')} off) and ${(SURVEY.flows || []).length} flows; ${left.length} column(s) left outside Find.`);
