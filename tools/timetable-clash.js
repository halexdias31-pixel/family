#!/usr/bin/env node
/* @family. — tools/timetable-clash.js THE TIMETABLE-CLASH CHECK (rule 1.75, owner 26 Nov, owner-only: the timetable as a tool beside the Docket,
   so no client is double-booked). One rule, js/form.js clashOf_ (kinds.json `session.clash`), copied to backend/cards-gen.gs: an overlap the same
   day is refused and named, touching ends (17:00–18:00 then 18:00–19:00) are allowed, another day is allowed, a row edited in place does not clash
   with itself, another term does not clash. Asked of the site's copy, the backend's copy, the phone's save (storeWrite_ sends nothing) and the
   backend's save (items.gs itemWrite_ writes nothing); each rule proved by mutating the served source. Made-up rows only. Run by tools/build.js. */
'use strict';
const vm = require('vm');
const { report, main, text } = require('./lib/gen.js');
const { load } = require('./lib/backend-vm.js');
const SD = require('./lib/site-data.js');

const NAMES = ['CLASH_DAYS', 'clashDays_', 'clashMin_', 'clashOf_'];
function grab(src, name) {
  const lines = src.split('\n'), at = lines.findIndex(l => l.startsWith('function ' + name + '(') || l.startsWith('const ' + name + ' '));
  if (at < 0) throw new Error('timetable-clash: no top-level ' + name);
  if (lines[at].startsWith('const ')) return lines[at];
  const out = [];
  for (let i = at; i < lines.length; i++) { out.push(lines[i]); if (/^}/.test(lines[i])) break; }
  return out.join('\n');
}
const helper = src => { const box = {}; vm.runInNewContext(NAMES.map(n => grab(src, n)).join('\n') + '\nthis.clashOf_ = clashOf_;', box); return box.clashOf_; };

const RULE = () => SD.kinds().session.clash;
const MON = { session_id: 's-1', who: 'Pupil A', days: 'Mon', start: '17:00', end: '18:00', term: '' };
const WED = { session_id: 's-2', who: 'Pupil B', days: 'Wednesday', start: '16:00', end: '17:30', term: 'Autumn' };
const ROWS = [MON, WED];
const row = o => Object.assign({ session_id: 's-new', who: 'Pupil C', term: '' }, o);
/* [what, item, want]: want a string the message must start with, or '' for allowed. */
const CASES = [
  ['an overlap the same day is refused and named', row({ days: 'monday', start: '17:30', end: '18:30' }), 'Overlaps Monday 17:00–18:00 with Pupil A'],
  ['one inside another is refused', row({ days: 'Mon-Fri', start: '17:15', end: '17:45' }), 'Overlaps Monday 17:00–18:00'],
  ['touching ends are allowed (18:00 then 18:00–19:00)', row({ days: 'Mon', start: '18:00', end: '19:00' }), ''],
  ['touching ends are allowed (16:00–17:00 then 17:00)', row({ days: 'Mon', start: '16:00', end: '17:00' }), ''],
  ['another day is allowed', row({ days: 'Tue', start: '17:00', end: '18:00' }), ''],
  ['a row edited in place does not clash with itself', Object.assign({}, MON, { end: '18:15' }), ''],
  ['an edited row still clashes with another', Object.assign({}, MON, { days: 'Mon, Wed' }), 'Overlaps Wednesday 16:00–17:30 with Pupil B'],
  ['a range of days covers its middle', row({ days: 'Tue-Thu', start: '16:00', end: '17:00' }), 'Overlaps Wednesday 16:00–17:30 with Pupil B'],
  ['another term is allowed', row({ days: 'Wed', start: '16:30', end: '17:00', term: 'Spring' }), ''],
  ['the same term clashes', row({ days: 'Wed', start: '16:30', end: '17:00', term: 'autumn' }), 'Overlaps Wednesday'],
  ['no term clashes with any term', row({ days: 'Wed', start: '16:30', end: '17:00' }), 'Overlaps Wednesday'],
];
const holds = f => CASES.every(([, item, want]) => { const got = f(RULE(), item, ROWS); return want ? got.indexOf(want) === 0 : got === ''; });

/* THE PHONE'S SAVE: storeWrite_ with the rows Find holds; a clash is toasted and nothing reaches the backend. */
function phone(src, item) {
  const box = { ITEM_KINDS: { kinds: { session: SD.kinds().session } }, STORE_ROWS_: { session: { rows: ROWS.map(r => ({ id: r.session_id, data: Object.assign({}, r) })) } },
    said: [], sent: [], lateCame_: () => {} };
  box.toast = m => box.said.push(m); box.api = b => { box.sent.push(b); return { ok: true }; };
  vm.runInNewContext(NAMES.map(n => grab(src, n)).join('\n') + '\n' + grab(src, 'storeWrite_') + '\nconst storeRow_ = (k, id) => (((STORE_ROWS_[k] || {}).rows || []).find(r => String(r.id) === String(id)) || {}).data || {};\nthis.w = storeWrite_;', box);
  return box.w('session', item).then(ok => ({ ok, said: box.said, sent: box.sent.length }));
}
/* THE BACKEND'S SAVE: itemWrite_ over an in-memory sessions tab; a clash is an error and nothing is written. */
function backend(item) {
  const ctx = load({ at: true }), wrote = [];
  ctx.__rows = ROWS.map(r => Object.assign({}, r)); ctx.__wrote = wrote;
  ctx.$(`itemMayWrite_ = () => true; clearCache = () => {}; addRow = (t, r) => __wrote.push(r); setCells = (t, r, g) => __wrote.push(g);
    read = () => ({ headers: ${JSON.stringify(SD.kinds().session.sheet.columns.concat(['kind', 'item_id']))}, rows: __rows.map(r => Object.assign({ kind: 'session' }, r)) });
    itemRows_ = k => __rows.map(r => ({ id: r.session_id, kind: k, data: Object.assign({}, r), _row: r }));`);
  ctx.__it = item;
  const out = ctx.$("itemWrite_({ kind: 'session', item: __it }, { row: {}, admin: true, id: 'owner' })");
  return { out, wrote: wrote.length };
}

function run() {
  const bad = [], checks = [], src = text('js/form.js'), gs = text('backend/cards-gen.gs'), items = text('backend/items.gs');
  const K = SD.kinds();
  checks.push(['the timetable is a tool: kinds.json session Find › Tools, beside the Docket', () => K.session.find.under === 'Tools' && K.session.find.group === K.docket.find.group && K.session.find.under === K.docket.find.under]);
  checks.push(['the timetable is the owner\'s: kinds.json session see.who admin', () => K.session.see.who === 'admin']);
  checks.push(['kinds.json session.clash names its fields', () => ['id', 'name', 'days', 'start', 'end', 'term'].every(f => K.session.sheet.columns.indexOf(RULE()[f]) !== -1)]);
  checks.push(['the site\'s clashOf_ holds every case', () => holds(helper(src))]);
  checks.push(['the backend\'s copy holds every case', () => holds(helper(gs))]);
  checks.push(['one rule: the backend\'s copy is the site\'s', () => NAMES.every(n => grab(src, n) === grab(gs, n))]);
  checks.push(['one rule: no second clash helper in items.gs', () => !/function clash/.test(items)]);
  const bk = CASES.map(([n, item, want]) => [n, backend(item), want]);
  checks.push(['the backend save refuses a clash, names it, writes nothing', () => bk.every(([, b, want]) => want ? b.out.why === 'clash' && b.out.error.indexOf(want) === 0 && !b.wrote : b.out.ok && b.wrote === 1)]);
  /* each mutation of the rule must break a case */
  const MUTS = [
    ['touching ends counted', s => s.replace('!(s < re && rs < e)', '!(s <= re && rs <= e)')],
    ['the day ignored', s => s.replace('if (d == null) continue;', 'if (false) continue;')],
    ['the term ignored', s => s.replace(' || (t && rt && t !== rt)', '')],
    ['any term separates', s => s.replace('(t && rt && t !== rt)', '(t !== rt)')],
    ['itself counted', s => s.replace('if (id && String(r[rule.id]) === id) continue;', '')],
    ['a range read as its ends', s => s.replace("for (let i = a; ; i = (i + 1) % 7) { out.push(i); if (i === b) break; }", 'out.push(a, b);')],
    ['the clash unnamed', s => s.replace("' with ' + name", "''")],
    ['never a clash', s => s.replace("if (!days.length || s == null || e == null) return '';", "return '';")],
  ];
  checks.push(['every mutation of clashOf_ caught', () => { const missed = MUTS.filter(([, m]) => { const s2 = m(src); if (s2 === src) return true; try { return holds(helper(s2)); } catch (e) { return false; } });
    if (missed.length) console.log('  missed', missed.map(x => x[0])); return !missed.length; }]);
  const P = CASES.map(([n, item, want]) => phone(src, item).then(p => want ? !p.ok && !p.sent && String(p.said[0]).indexOf(want) === 0 : p.ok && p.sent === 1));
  const PM = phone(src.replace('if (say) { toast(say); return Promise.resolve(false); }', ''), CASES[0][1]).then(p => p.sent === 1);
  return Promise.all(P.concat([PM])).then(r => {
    const pm = r.pop();
    checks.push(['the phone\'s save refuses a clash, names it, sends nothing', () => r.every(Boolean)]);
    checks.push(['the phone\'s save: dropping the refusal is caught', () => pm]);
    checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { console.log(x.stack); ok = false; } if (!ok) bad.push(name); });
    console.log('timetable-clash: ' + checks.length + ' rules, ' + CASES.length + ' cases; ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
    report('timetable-clash', bad, 'timetable-clash rule(s) broken');
    return { n: checks.length, bad: bad.length };
  });
}
module.exports = { run };
main(module, run);
