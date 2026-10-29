#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-malformed.js A NULL AND A STRING IN EVERY LIST OF DATA, then every column: nothing throws, nothing undrawn, one report (R6). */
const fs = require('fs'), path = require('path');
const { app, tick, undrawn, ROOT } = require('../check/jsdom-app');
const bad = [];
process.on('uncaughtException', e => bad.push('uncaught: ' + (e && e.message)));
const spoil = v => Array.isArray(v) ? [null, 'x'].concat(v) : v;
(async () => {
  let FIX;
  try { FIX = JSON.parse(fs.readFileSync(path.join(ROOT, 'check/fixture.json'), 'utf8')); }
  catch (e) { console.error('cannot read check/fixture.json'); process.exit(2); }
  const payload = Object.fromEntries(Object.entries(FIX).map(([k, v]) => [k, spoil(v)]));
  const spoilt = Object.values(payload).filter(Array.isArray).length;
  if (!spoilt) { console.error('the fixture has no lists to spoil — this check proves nothing'); process.exit(2); }
  const a = await app(payload, (f, j) => spoil(j));
  for (const t of a.h.TABS) {
    try { a.h.go(t.id, false, true); a.h.paint(t.id, true); } catch (e) { bad.push(t.id + ' threw ' + e.message); }
    await tick(20);
    const u = undrawn(a.w, t.id);
    if (u) bad.push(t.id + ': ' + u);
  }
  await tick(400);
  const reps = a.posts.filter(p => p.action === 'clientError');
  const rows = reps.filter(p => p.where === 'load:rows');
  if (rows.length !== 1) bad.push('expected one load:rows report, got ' + rows.length);
  reps.filter(p => p.where !== 'load:rows').forEach(p => bad.push('an error was reported: ' + p.where + ' — ' + p.message));
  const n = a.h.TABS.length;
  a.close();
  if (bad.length) { console.error('check-malformed: ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('check-malformed: ' + spoilt + ' lists spoilt, ' + n + ' columns drawn, one report');
  process.exit(0);
})().catch(e => { console.error('check-malformed could not run: ' + (e && e.stack || e)); process.exit(2); });
