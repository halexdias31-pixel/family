#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* check-access.js — EVERY HANDLER MUST BE CLASSIFIED IN `ACTION_ACCESS`. § */
const fs = require('fs'), path = require('path');
/* ---------- THE BACKEND IS IN `backend/`, AND `doPost.gs` IS `dopost.gs` § */
const WHERE_ = [path.join(__dirname, '..', 'backend'), path.join(__dirname, 'backend'),
                path.join(__dirname, '..'), __dirname];
const find_ = f => {
  const names = [f, f.toLowerCase(), f.charAt(0).toLowerCase() + f.slice(1)];
  for (const w of WHERE_) for (const n of names) {
    const p = path.join(w, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
};
const read = f => { try { const p = find_(f); return p ? fs.readFileSync(p, 'utf8') : ''; }
                    catch (e) { return ''; } };

const post = read('doPost.gs');
const consts = read('constants.gs');
const front = fs.readdirSync(path.join(__dirname, '..', 'js'))
  .filter(f => /\.js$/.test(f) && !/^check/.test(f))
  .map(f => read('js/' + f)).join('\n');

/* every action the backend answers to */
const handlers = [...new Set([...post.matchAll(/action === '(\w+)'/g)].map(m => m[1]))];

/* and everything named in the gate */
const tbl = consts.slice(consts.indexOf('const ACTION_ACCESS = {'));
const classified = new Set([...tbl.slice(0, tbl.indexOf('\n};')).matchAll(/(\w+)\s*:\s*'/g)]
  .map(m => m[1]));

/* and what the site actually asks for */
const asked = [...new Set([...front.matchAll(/action:\s*'(\w+)'/g)].map(m => m[1])
  .concat([...front.matchAll(/send_?\(\s*'(\w+)'/g)].map(m => m[1]))
  .concat([...front.matchAll(/send\(\s*'(\w+)'/g)].map(m => m[1])))];

/* ---------- ACTIONS WITH NO HANDLER, KNOWN ABOUT, WITH A REASON EACH § */
const ACCEPTED_MISSING = {
};

const unclassified = handlers.filter(a => !classified.has(a));
const asksForMissing = asked.filter(a => !handlers.includes(a) && !(a in ACCEPTED_MISSING));
const acceptedMissing = asked.filter(a => !handlers.includes(a) && (a in ACCEPTED_MISSING));
const askedUnclassified = asked.filter(a => handlers.includes(a) && !classified.has(a));

console.log('');
console.log('  ' + handlers.length + ' handlers, ' + classified.size + ' classified, '
  + asked.length + ' asked for by the site');
console.log('');
console.log('A HANDLER THE GATE HAS NEVER HEARD OF  (' + unclassified.length + ')');
if (!unclassified.length) console.log('  none');
unclassified.forEach(a => console.log('  ' + a
  + (asked.includes(a) ? '   <-- and the site calls it, so it is refused every time' : '')));
console.log('');
console.log('THE SITE CALLS AN ACTION THAT DOES NOT EXIST  (' + asksForMissing.length + ')');
if (!asksForMissing.length) console.log('  none');
asksForMissing.forEach(a => console.log('  ' + a));

if (acceptedMissing.length) {
  console.log('');
  console.log('KNOWN UNBUILT, WITH A REASON  (' + acceptedMissing.length + ')');
  acceptedMissing.forEach(a => console.log('  ' + a + ' — ' + ACCEPTED_MISSING[a]));
}
console.log('');
/* AN UNCLASSIFIED HANDLER IS A FAILURE WHETHER OR NOT THE SITE CALLS IT TODAY. § */
const bad = unclassified.length + asksForMissing.length;
/* THE VERDICT MUST NOT OVERSTATE ITSELF. § */
console.log(bad
  ? 'FAILED — each of these is refused before its handler runs.'
  : acceptedMissing.length
    ? 'OK — nothing NEW is unreachable. ' + acceptedMissing.length + ' known unbuilt action'
      + (acceptedMissing.length === 1 ? '' : 's') + ' above, each a feature rather than a break.'
    : 'OK — every action the site calls has a handler and a classification.');
process.exit(bad ? 1 : 0);
