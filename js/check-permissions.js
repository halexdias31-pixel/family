#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-permissions.js THE ONE TABLE AND ACTION_ACCESS AGREE (86a): identical allow/deny for every action × role, and the generated block is current. */
'use strict';
const fs = require('fs'), path = require('path');
const P = require('../tools/permissions.js');
const O = path.join(__dirname, '..');
let rows = [];
try { rows = JSON.parse(fs.readFileSync(path.join(O, 'data/settings/permissions.json'), 'utf8')); } catch (e) {
  console.log('check-permissions: data/settings/permissions.json not read (' + e.message + ') — nothing was checked'); process.exit(1);
}
const { access, kid } = P.backendRules();
const bad = [];
const tbl = {};
rows.forEach(r => {
  if (!r || r.kind !== 'action' || P.ROLES.indexOf(r.role) < 0 || typeof r.allow !== 'boolean') { bad.push('a malformed row: ' + JSON.stringify(r)); return; }
  (tbl[r.action] = tbl[r.action] || {})[r.role] = r.allow;
});
Object.keys(access).forEach(a => P.ROLES.forEach(role => {
  const want = P.allowOf(access[a], role, kid.indexOf(a) !== -1), got = (tbl[a] || {})[role];
  if (got !== want) bad.push(a + ' × ' + role + ': table ' + got + ', ACTION_ACCESS ' + want);
}));
Object.keys(tbl).filter(a => !(a in access)).forEach(a => bad.push(a + ': in the table, not in ACTION_ACCESS'));
/* THE BACKEND READS THE GENERATED BLOCK, so a stale one is a disagreement too. */
const gate = fs.readFileSync(P.GS_PATH, 'utf8');
if (gate !== P.gsInto(gate, rows)) bad.push('the PERMISSIONS block in backend/booking.gs is stale — node tools/permissions.js');
if (!/function accessDenied[\s\S]{0,200}permNeed_\(action\)/.test(gate)) bad.push('accessDenied does not read the table first (permNeed_)');
console.log(bad.length ? bad.map(b => '  ' + b).join('\n') : '  none');
console.log(bad.length ? 'FAILED — ' + bad.length + ' disagreement(s).'
  : 'OK — ' + Object.keys(access).length + ' actions × ' + P.ROLES.length + ' roles: ' + rows.length + ' rows agree with ACTION_ACCESS.');
process.exit(bad.length ? 1 : 0);
