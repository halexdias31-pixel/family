#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-rules.js THE RULES (496): every `ruleOn_` id is registered, every rule is asked somewhere, the backend knows the same ids, and every known exception marker sits beside its rule. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rd = p => { try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch (e) { return null; } };
const fail = [];

const reg = rd('js/rules.js'), cons = rd('backend/constants.gs');
if (!reg || !cons) { console.log('COULD NOT RUN — js/rules.js or backend/constants.gs is missing'); process.exit(1); }
const block = ((/const RULES = \[([\s\S]*?)\n\];/.exec(reg) || [])[1] || '') + '\n';
const rules = [...block.matchAll(/\{ id: '([a-z0-9-]+)'([\s\S]*?)\},?\n/g)].map(m => ({ id: m[1], lock: /\block: '/.test(m[2]) }));
if (rules.length < 5) { console.log('COULD NOT RUN — the RULES registry in js/rules.js could not be read'); process.exit(1); }
const ids = rules.map(r => r.id);

/* EVERY ASK, in every js file but the checks. */
const asked = {};
const files = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f));
files.forEach(f => {
  const s = rd('js/' + f);
  for (const m of s.matchAll(/ruleOn_\('([^']+)'\)/g)) (asked[m[1]] = asked[m[1]] || []).push(f);
  for (const m of s.matchAll(/ruleOn_\((?!'|id\)|k\)|r\.id\))/g)) fail.push(f + ': ruleOn_ asked with a name check-rules cannot read — write the id as a literal');
});
Object.keys(asked).forEach(id => { if (ids.indexOf(id) === -1) fail.push('ruleOn_(\'' + id + '\') in ' + asked[id].join(', ') + ' is not in RULES (js/rules.js)'); });
ids.forEach(id => { if (!asked[id]) fail.push('rule `' + id + '` is registered and nothing asks ruleOn_(\'' + id + '\') — flipping it would change nothing'); });

/* THE BACKEND SAVES ONLY WHAT IT KNOWS: the same ids, and the same locked ones. */
const arr = name => (((new RegExp('const ' + name + ' = \\[([\\s\\S]*?)\\];')).exec(cons) || [])[1] || '').match(/'[^']+'/g) || [];
const bIds = arr('RULE_IDS').map(x => x.slice(1, -1)), bLocked = arr('RULES_LOCKED').map(x => x.slice(1, -1));
if (bIds.slice().sort().join() !== ids.slice().sort().join()) fail.push('RULE_IDS in backend/constants.gs is not the RULES list in js/rules.js');
if (bLocked.slice().sort().join() !== rules.filter(r => r.lock).map(r => r.id).sort().join()) fail.push('RULES_LOCKED in backend/constants.gs is not the locked rules in js/rules.js');

/* KNOWN EXCEPTION MARKERS: each line that makes one must be within a few lines of the rule that governs it. A new marker without a rule fails. */
const MARKERS = [
  { re: /in WIDGET_WHOLE\b/, rule: 'whole-widgets' },
  { re: /LAYOUT_KEEP\.indexOf/, rule: 'keep-basket' },
  { re: /'Tell the admin'/, rule: 'tell-admin' },
  { re: /min_age: (SCRIPTURE_MIN_AGE|18)\b|viewerOfAge_\((SCRIPTURE_MIN_AGE|18)\)/, rule: 'scripture-age', none: true },
  { re: /all\.find\(has\) \|\| all\[0\]/, rule: 'library-one-card' },
  { re: /!adminCol_\([a-z]\) \|\| adminCol_\(cardHome0_/, rule: 'admin-cols' },
  { re: /finderMembersOnly_\(F\);/, rule: 'finder-members' },
  { re: /closest\('\.me-form'\)/, rule: 'form-save-row', file: 'tiles.js' },
];
let seen = 0;
files.forEach(f => {
  const lines = rd('js/' + f).split('\n');
  lines.forEach((ln, i) => MARKERS.forEach(m => {
    if (!m.re.test(ln) || (m.file && m.file !== f)) return;
    seen++;
    if (m.none) return fail.push(f + ':' + (i + 1) + ' a fixed scripture age — ask scriptureMinAge_(), which asks `scripture-age`');
    const near = lines.slice(Math.max(0, i - 4), i + 5).join('\n');
    if (near.indexOf("ruleOn_('" + m.rule + "')") === -1 && !/suggestTell_|wholeBars_|basketKept_|adminKeep_|formOwn/.test(near)) fail.push(f + ':' + (i + 1) + ' an exception marker with no rule beside it — register it in RULES and ask ruleOn_(\'' + m.rule + '\')');
  }));
});
/* 44px OUTSIDE A TILE: keypad and multiple choice are the registered ones; the CSS that undoes them is keyed on the rule. */
const css = rd('style.css') || '';
if (css.indexOf(':root[data-uni~="tap-44"]') === -1) fail.push('style.css has no `:root[data-uni~="tap-44"]` — the tap-44 rule changes nothing');
if (css.indexOf(':root[data-uni~="search-icon"]') === -1) fail.push('style.css has no `:root[data-uni~="search-icon"]` — the search-icon rule changes nothing');

if (fail.length) { console.log('FAILED — the rules registry:\n  ' + fail.join('\n  ')); process.exit(1); }
console.log('OK — ' + ids.length + ' rules (' + rules.filter(r => r.lock).length + ' locked), each asked, the backend agreeing, ' + seen + ' exception markers each beside its rule');
