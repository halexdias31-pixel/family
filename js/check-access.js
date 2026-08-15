#!/usr/bin/env node
/* ==================================================================================================
   check-access.js — EVERY HANDLER MUST BE CLASSIFIED IN `ACTION_ACCESS`.

   `accessDenied` REFUSES ANYTHING NOT IN THAT TABLE, before the handler runs — deliberately, so a
   new action is closed until somebody decides who it is for. The cost is that a handler can be
   written, tested, shipped and deployed, and still be unreachable because one line in a table three
   files away was never added. That is exactly what happened with `openWaitlist`, and it cost hours,
   because the error — "That action is not recognised" — is indistinguishable from no handler at all.

   `check-doors` matches buttons to handlers. NOTHING MATCHED HANDLERS TO THE GATE. Every checker
   passed on a feature that could not run.
================================================================================================== */
const fs = require('fs'), path = require('path');
const read = f => { try { return fs.readFileSync(path.join(__dirname, '..', f), 'utf8'); }
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

const unclassified = handlers.filter(a => !classified.has(a));
const asksForMissing = asked.filter(a => !handlers.includes(a));
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
console.log('');
/* AN UNCLASSIFIED HANDLER IS A FAILURE WHETHER OR NOT THE SITE CALLS IT TODAY. My first version
   only failed when it could SEE the call — and `openWaitlist` is sent through a ternary
   (`forNobody ? 'openWaitlist' : 'joinWaitlist'`), which no regex over the source will find. So it
   printed the fault and passed anyway, which is the checker making the same mistake as the code it
   was written to catch. Anything unclassified fails, called or not: it can only ever be refused. */
const bad = unclassified.length + asksForMissing.length;
console.log(bad
  ? 'FAILED — each of these is refused before its handler runs.'
  : 'OK — every action the site calls has a handler and a classification.');
process.exit(bad ? 1 : 0);
