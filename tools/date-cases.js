#!/usr/bin/env node
/* @family. — tools/date-cases.js THE DATE CHECK (rule 1.75, owner 20 Nov): one date reader, one today, one time zone. js/core.js `dateOf_` and
   `todayIso_` and their copies in backend/cards-gen.gs are run on one table: each must give the expected day, and the two copies must agree.
   25/10 is never month 25; the BST change days and either side of London's midnight keep their day. One wrong fails the build. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
process.env.TZ = 'Europe/London';                       // the Apps Script project's own zone (backend/appsscript.json), and the owner's devices
const NAMES = ['dateOf_', 'tz_', 'todayIso_'];
function grab(src, name, file) {
  const lines = src.split('\n');
  const at = lines.findIndex(l => l.startsWith('function ' + name + '(') || l.startsWith('const ' + name + ' '));
  if (at < 0) throw new Error('date-cases: ' + file + ' has no top-level ' + name);
  if (lines[at].startsWith('const ')) return lines[at];
  const out = [];
  for (let i = at; i < lines.length; i++) { out.push(lines[i]); if (/^}/.test(lines[i])) break; }
  return out.join('\n');
}
function copyOf(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/settings.json'), 'utf8'));
  const box = { SHARED_SETTINGS: settings, Intl, Date };
  vm.runInNewContext(NAMES.map(n => grab(src, n, file)).join('\n') + '\nthis.dateOf_ = dateOf_; this.todayIso_ = todayIso_;', box);
  return box;
}
const p = n => String(n).padStart(2, '0');
const said = d => d ? d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) : null;
/* Each case: [what, input, want] for dateOf_ (want as yyyy-mm-dd HH:MM local, or null); `time` keeps the clock; `today` runs todayIso_ on an instant. */
const CASES = [
  ['DD/MM/YY', '08/11/26', '2026-11-08 00:00'],
  ['D/M/YY', '8/1/26', '2026-01-08 00:00'],
  ['DD/MM/YYYY', '25/10/2026', '2026-10-25 00:00'],
  ['DD-MM-YYYY', '25-10-2026', '2026-10-25 00:00'],
  ['DD.MM.YYYY', '25.10.2026', '2026-10-25 00:00'],
  ['25/10 is never month 25', '25/10/26', '2026-10-25 00:00'],
  ['month-first is refused, not guessed', '10/25/2026', null],
  ['month-first short is refused', '10/25/26', null],
  ['day and month without a year are not a date', '25/10', null],
  ['no 31 November', '31/11/2026', null],
  ['29 Feb in a leap year', '29/02/2028', '2028-02-29 00:00'],
  ['no 29 Feb in 2026', '29/02/2026', null],
  ['weekday before it', 'Sun 25/10/2026', '2026-10-25 00:00'],
  ['a day inside words', '25/10/2026 (half term)', '2026-10-25 00:00'],
  ['ISO', '2026-10-25', '2026-10-25 00:00'],
  ['ISO is not read as 26/10/25', '2026-10-25', '2026-10-25 00:00'],
  ['ISO short parts', '2026-3-9', '2026-03-09 00:00'],
  ['ISO month 13 is nothing', '2026-13-01', null],
  ['ISO with a time, the day', '2026-10-25 14:30', '2026-10-25 00:00'],
  ['ISO with a time, kept', '2026-10-25 14:30', '2026-10-25 14:30', 'time'],
  ['ISO T with seconds, kept', '2026-11-20T09:05:07', '2026-11-20 09:05', 'time'],
  ['DD/MM/YYYY with a time, kept', '25/10/2026 23:59', '2026-10-25 23:59', 'time'],
  ['DD/MM/YY with a time, kept', '08/11/26 16:00', '2026-11-08 16:00', 'time'],
  ['UTC stamp in BST is an hour on', '2026-07-01T12:00:00.000Z', '2026-07-01 13:00', 'time'],
  ['UTC stamp in GMT is itself', '2026-11-20T12:00:00Z', '2026-11-20 12:00', 'time'],
  ['UTC 23:30 in BST is the next London day', '2026-06-30T23:30:00Z', '2026-07-01 00:00'],
  ['a sheet Date', new Date(2026, 9, 25, 15, 45), '2026-10-25 00:00'],
  ['a sheet Date, kept', new Date(2026, 9, 25, 15, 45), '2026-10-25 15:45', 'time'],
  ['ms', new Date(2026, 2, 29, 12, 0).getTime(), '2026-03-29 12:00', 'time'],
  ['a Date as text', 'Sun Oct 25 2026 10:00:00 GMT+0000', '2026-10-25 10:00', 'time'],
  ['blank', '', null],
  ['nonsense', 'soon', null],
  ['BST starts: 29/03/2026', '29/03/2026', '2026-03-29 00:00'],
  ['BST starts: 03:30, after the skipped hour', '2026-03-29 03:30', '2026-03-29 03:30', 'time'],
  ['BST ends: 25/10/2026', '25/10/2026', '2026-10-25 00:00'],
  ['BST ends: the day after', '26/10/2026', '2026-10-26 00:00'],
  /* todayIso_: the London day of an instant. */
  ['today: GMT, a second before midnight', '2026-11-20T23:59:59Z', '2026-11-20', 'today'],
  ['today: GMT, midnight', '2026-11-21T00:00:00Z', '2026-11-21', 'today'],
  ['today: BST, a second before midnight', '2026-07-01T22:59:59Z', '2026-07-01', 'today'],
  ['today: BST, midnight (23:00 UTC)', '2026-07-01T23:00:00Z', '2026-07-02', 'today'],
  ['today: the night BST starts, 00:59 UTC', '2026-03-29T00:59:00Z', '2026-03-29', 'today'],
  ['today: BST starts, the eve at 23:59 UTC', '2026-03-28T23:59:00Z', '2026-03-28', 'today'],
  ['today: the night BST ends, 23:30 UTC the eve', '2026-10-24T23:30:00Z', '2026-10-25', 'today'],
  ['today: BST ends, 22:59 UTC the eve', '2026-10-24T22:59:00Z', '2026-10-24', 'today'],
  ['today: BST ended, 23:59 UTC that day', '2026-10-25T23:59:00Z', '2026-10-25', 'today'],
  ['today: BST ended, midnight UTC', '2026-10-26T00:00:00Z', '2026-10-26', 'today'],
];
function run() {
  const site = copyOf('js/core.js'), back = copyOf('backend/cards-gen.gs'), bad = [];
  const one = (c, [what, v, want, how]) => how === 'today' ? c.todayIso_(new Date(v)) : said(c.dateOf_(v, how === 'time'));
  CASES.forEach(k => {
    const a = one(site, k), b = one(back, k);
    if (a !== b) bad.push(k[0] + ': site ' + a + ', backend ' + b);
    else if (a !== k[2]) bad.push(k[0] + ': ' + JSON.stringify(String(k[1])) + ' read ' + a + ', wanted ' + k[2]);
  });
  if (bad.length) { console.error('date-cases: ' + bad.length + ' of ' + CASES.length + ' wrong\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('date-cases: ' + CASES.length + ' cases, both copies agree');
}
module.exports = { run };
if (require.main === module) run();
