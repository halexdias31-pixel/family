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
const see = {};
rows.forEach(r => {
  if (r && r.kind === 'see' && P.SEE_ROLES.indexOf(r.role) !== -1 && typeof r.allow === 'boolean') { (see[r.action] = see[r.action] || {})[r.role] = r.allow; return; }
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
/* WHO SEES A SETTINGS CARD IS THIS TABLE ONLY (93): every setting-for.json card has a `see` row per role, and setting-for.json says no role. */
let cards = [];
try { cards = JSON.parse(fs.readFileSync(path.join(O, 'data/settings/setting-for.json'), 'utf8')); } catch (e) { bad.push('setting-for.json not read: ' + e.message); }
cards.forEach(c => {
  const k = c && String(c.card || '').trim();
  if (!k) return;
  P.SEE_ROLES.forEach(r => { if (typeof (see[k] || {})[r] !== 'boolean') bad.push('setting ' + k + ' × ' + r + ': no `see` row in permissions.json'); });
  ['for', 'role', 'min_rank'].forEach(f => { if (f in c) bad.push('setting-for.json: ' + k + ' says `' + f + '` — who sees it is permissions.json\'s `see` rows'); });
});
Object.keys(see).filter(k => !cards.some(c => c && String(c.card).trim() === k)).forEach(k => bad.push('`see` row for ' + k + ': no such card in setting-for.json'));
/* AND NO CODE ASKS A ROLE FOR A SETTINGS CARD: the settings doors ask `settingMay_`/`seeMay_` alone. */
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
const ROLE_ASK = /\brankAtLeast_\(|\bisAdmin\(\)|\bhasRole\(|\bmyRole_\(\)|\.rank\s*===|\.role\s*===/;
/* THE PICTURE CARD'S PHOTO UPLOAD is a field inside a card, not who sees it; two lines, until it has its own row. */
const ALLOW = { 'me-settings': 2 };
[['find-doors', /SETTINGS BY ACCOUNT TYPE[\s\S]*?\nfunction settingPart_/], ['find-aloud', /settingMay_\('door:checks'\)[^\n]*/], ['me-settings', /[\s\S]*/]].forEach(([n, re]) => {
  let src = '';
  try { src = fs.readFileSync(path.join(O, 'js', n + '.js'), 'utf8'); } catch (e) { bad.push('js/' + n + '.js not read'); return; }
  const part = (strip(src).match(re) || [''])[0], hits = part.split('\n').filter(l => ROLE_ASK.test(l));
  if (hits.length > (ALLOW[n] || 0)) bad.push(n + '.js asks a role for a settings card ' + hits.length + ' time(s) (budget ' + (ALLOW[n] || 0) + '): ' + hits.map(l => l.trim().slice(0, 80)).join(' | '));
});
console.log(bad.length ? bad.map(b => '  ' + b).join('\n') : '  none');
console.log(bad.length ? 'FAILED — ' + bad.length + ' disagreement(s).'
  : 'OK — ' + Object.keys(access).length + ' actions × ' + P.ROLES.length + ' roles: ' + rows.length + ' rows agree with ACTION_ACCESS; ' + cards.length + ' settings each have their `see` rows.');
process.exit(bad.length ? 1 : 0);
