#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-forms.js ONE FORM MAKER (84a): forms.json and form.js agree, and no app file draws a raw box beyond its budget. */
const fs = require('fs'), path = require('path');
const O = path.join(__dirname, '..');
const bad = [];
const data = JSON.parse(fs.readFileSync(path.join(O, 'data/settings/forms.json'), 'utf8'));
const src = fs.readFileSync(path.join(O, 'js/form.js'), 'utf8');
const m = src.match(/const FORM_SPECS = (\{[\s\S]*?\n\});/);
let code = null;
try { code = m && JSON.parse(m[1]); } catch (e) { bad.push('FORM_SPECS in js/form.js is not plain JSON: ' + e.message); }
if (!code) bad.push('FORM_SPECS not found in js/form.js');
else ['kinds', 'rules', 'cards'].forEach(k => {
  if (JSON.stringify(code[k]) !== JSON.stringify(data[k])) bad.push('FORM_SPECS.' + k + ' differs from data/settings/forms.json — copy the file into form.js');
});
/* EVERY RULE NAMES A KIND, AND THE LAST CATCHES EVERYTHING. */
(data.rules || []).forEach(r => { if ((data.kinds || []).indexOf(r.kind) === -1) bad.push('rule ' + r.match + ': no kind ' + r.kind); });
if (!data.rules || data.rules[data.rules.length - 1].match !== '') bad.push('the last rule must match everything ("")');
/* THE RATCHET: a raw box in any app file (index.html's FILES) but the maker's own over its budget fails; under it, lower the budget. */
const left = data.leftovers || {};
const files = require('../tools/file-lists.js').appFiles().filter(f => f !== 'form').map(f => f + '.js');
files.forEach(f => {
  const n = (fs.readFileSync(path.join(O, 'js', f), 'utf8').match(/<(input|select|textarea)\b/g) || []).length;
  const b = left[f] ? left[f].n : 0;
  if (n > b) bad.push(f + ': ' + n + ' raw input/select/textarea, budget ' + b + ' — draw it with formCard_ (js/form.js)');
  else if (n < b) bad.push(f + ': ' + n + ' raw boxes, budget ' + b + ' — lower its budget in data/settings/forms.json');
});
Object.keys(left).forEach(f => { if (files.indexOf(f) === -1) bad.push('forms.json leftovers names ' + f + ', which this check does not read'); });
if (bad.length) { console.log('check-forms: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-forms: ok — ' + (data.rules || []).length + ' field rules, ' + Object.keys(data.cards || {}).length + ' card spec(s), ' + Object.keys(left).length + ' files on budget');
