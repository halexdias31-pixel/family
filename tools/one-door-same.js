#!/usr/bin/env node
/* @family. — tools/one-door-same.js THE SAME ANSWER BY EITHER DOOR (queue step 6, 22 Nov): the handlers that once told their verbs apart by the
   old action name now read the kind:verb and the kind's sheet (kinds.json `sheet.list`). A parent's or tutor's phone still posts the old names,
   so each merged action is run here on made-up rows — the backend loaded as Apps Script loads it, Google stubbed, the sheet an in-memory one —
   and its answer held against tools/data/one-door-same.json, the answers the handlers gave before the cut. The item door must give the same.
   `--write` records the answers anew. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const BV = require('./lib/backend-vm.js');
const AT = BV.AT;
const { ROOT, report, main } = require('./lib/gen.js');
const GOLD = path.join(ROOT, 'tools/data/one-door-same.json');

function load() {
  const ctx = BV.load({ dir: process.env.DOOR_SAME_BACKEND || undefined, at: true, random: 0.4242 });
  ctx.$('this.PUSH_PROPS_LIST = PUSH_PROPS;');
  return ctx;
}

/* THE MADE-UP SHEET: people, work on file, phones, media, records, errors, applications, notes. */
function sheet(ctx) {
  const D = s => new ctx.Date(s);
  const P = (id, role, first, extra) => Object.assign({ person_id: id, role: role, roles: role, first_name: first, last_name: 'Test', handle: first.toLowerCase(), email: first.toLowerCase() + '@x.test' }, extra || {});
  return {
    people: [P('P001', 'admin', 'Ann'), P('P002', 'tutor', 'Ada', { rank: 'staff', agreement_version: 'v3', agreement_signed_at: D('2026-10-01T09:00:00Z'), dbs_checked_on: D('2026-09-01T00:00:00Z'), dbs_number: '001122' }),
             P('P003', 'student', 'Finn'), P('P004', 'client', 'Cara'), P('P005', 'tutor', 'Tom', { rank: 'staff', agreement_signed_at: 'not yet' })],
    work_files: [{ work_id: 'WF-1', person_id: 'P003', uploaded_by: 'P003', uploaded_at: D('2026-11-01T10:00:00Z'), title: 'Fractions', subject: 'Maths', pages: 'f1 f2', deleted_at: '' },
                 { work_id: 'WF-2', person_id: 'P003', uploaded_by: 'P002', uploaded_at: D('2026-11-02T10:00:00Z'), title: 'Essay', subject: 'English', pages: 'f3', deleted_at: '' },
                 { work_id: 'WF-3', person_id: 'P004', uploaded_by: 'P004', uploaded_at: D('2026-11-03T10:00:00Z'), title: 'Hers', subject: '', pages: 'f4', deleted_at: '' }],
    push_tokens: [{ token_id: 'PT1', person_id: 'P003', token: 'tok-a', device: 'iPad', off: 'posts', added_on: D('2026-11-01T00:00:00Z') }],
    media: [{ media_id: 'video:dQw4w9WgXcQ', kind: 'video', yt_id: 'dQw4w9WgXcQ', title: 'Old', subject: 'Maths', age: '', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', hidden: 'FALSE', added_by: 'P001', added_on: D('2026-10-01T00:00:00Z'), updated_on: D('2026-10-01T00:00:00Z') }],
    records: [{ record_id: 'insurance', category: 'Cover', title: 'Insurance', provider: 'Acme', reference: 'R1', due_on: D('2027-01-01T00:00:00Z'), cost: '120', link: '', notes: 'n', active: 'TRUE', updated_at: D('2026-10-01T09:00:00Z') },
              { record_id: 'old_one', category: '', title: 'Old', provider: '', reference: '', due_on: '', cost: '', link: '', notes: '', active: 'FALSE', updated_at: '' }],
    client_errors: [{ error_id: 'E1', first_at: D('2026-11-01T00:00:00Z'), last_at: D('2026-11-05T00:00:00Z'), count: 3, devices: 2, message: 'boom', where: 'a.js:1', version: '9', screen: 'find' },
                    { error_id: 'E2', first_at: '2026-11-02T00:00:00Z', last_at: '2026-11-09T00:00:00Z', count: '', devices: '1', message: 'bang', where: '', version: '9', screen: '' },
                    { error_id: '', message: 'no id' }],
    applications: [{ application_id: 'A1', person_id: 'P004', at: D('2026-11-01T00:00:00Z'), status: '', status_at: '', subjects: 'Maths', qualifications: 'BSc' },
                   { application_id: 'A2', person_id: 'P003', at: D('2026-11-04T00:00:00Z'), status: 'Declined', status_at: D('2026-11-05T00:00:00Z'), subjects: 'Art' }],
    claude_notes: [{ note_id: 'N-1', status: 'pending', at: D('2026-11-03T00:00:00Z'), by: 'P004', text: 'More maths', kind: 'idea' }],
  };
}

function fake(ctx) {
  const rows = sheet(ctx), tabs = {};
  Object.keys(rows).forEach(n => { tabs[n] = { sheet: { name: n }, headers: Object.keys(rows[n][0] || {}), rows: rows[n].map((r, i) => Object.assign({ _row: i + 2 }, r)) }; });
  let files = 0, props = {};
  Object.assign(ctx, {
    read: n => tabs[n] || (tabs[n] = { sheet: n === 'applications' || n === 'records' ? null : { name: n }, headers: [], rows: [] }),
    clearCache: () => {}, clearPayloadCache: () => {},
    jsonOut: o => JSON.parse(JSON.stringify(o)),
    setCells: (t, r, o) => { Object.assign(r, o); return true; },
    setCell: (t, r, k, v) => { r[k] = v; return true; },
    addRow: (t, o) => { t.rows.push(Object.assign({ _row: t.rows.length + 2 }, o)); return true; },
    delRow: (t, r) => { const i = t.rows.indexOf(r); if (i < 0) return false; t.rows.splice(i, 1); return true; },
    withWriteLock_: fn => fn(),
    findPerson: (name, id) => tabs.people.rows.find(p => p.person_id === id) || null,
    authWhoIs_: tok => tabs.people.rows.find(p => 'tok-' + p.person_id === tok) || null,
    gateDenied_: () => '',
    acceptedParents: of => (of === 'P003' ? [tabs.people.rows[3]] : []),
    workFileFolder_: () => ({ createFile: () => ({ getId: () => 'new' + (++files) }) }),
    workFileData_: (id, thumb) => (thumb ? 'thumb:' : 'page:') + id,
    pushProps_: () => { const o = {}; ctx.PUSH_PROPS_LIST.forEach(k => { o[k] = 'set'; }); return o; },
    getPostFolder: () => ({}), driveKeep_: (f, d, n) => 'https://drive.test/' + n,
    handsRead_: () => JSON.parse(JSON.stringify(props.hands || {})), handsWrite_: all => { props.hands = all; },
    lensLog_: () => {},
  });
  return tabs;
}

const JPG = 'data:image/jpeg;base64,AAAA';
/* EACH CASE: the old action name, its kind:verb, who asks and what else the phone sends. */
const CASES = [
  ['workFilesOf', 'workfile:list', 'P003', {}], ['workFilesOf', 'workfile:list', 'P004', { of: 'P003' }], ['workFilesOf', 'workfile:list', 'P002', { of: 'P004' }],
  ['workFileOpen', 'workfile:read', 'P003', { id: 'WF-1' }], ['workFileOpen', 'workfile:read', 'P004', { id: 'WF-1' }], ['workFileOpen', 'workfile:read', 'P003', { id: 'WF-3' }],
  ['workFileSave', 'workfile:save', 'P003', { pages: [JPG, JPG], title: ' Long division ', subject: 'Maths' }], ['workFileSave', 'workfile:save', 'P003', { pages: ['nope'] }],
  ['workFileDelete', 'workfile:delete', 'P003', { id: 'WF-2' }], ['workFileDelete', 'workfile:delete', 'P004', { id: 'WF-1' }],
  ['pushState', 'push:read', 'P003', {}], ['pushState', 'push:read', 'P001', {}],
  ['pushSubscribe', 'push:save', 'P003', { fcmToken: 'tok-b', device: 'Phone' }], ['pushSubscribe', 'push:save', 'P003', { fcmToken: '' }],
  ['pushSet', 'pushsetting:save', 'P003', { kind: 'bookings', on: false }], ['pushSet', 'pushsetting:save', 'P003', { kind: 'nonsense', on: true }],
  ['pushUnsubscribe', 'push:delete', 'P003', { fcmToken: 'tok-a' }],
  ['mediaSave', 'media:save', 'P001', { kind: 'video', url: 'https://youtu.be/dQw4w9WgXcQ', title: 'New title', subject: 'Maths' }],
  ['mediaSave', 'media:save', 'P001', { kind: 'reel', url: 'https://youtube.com/shorts/abcdefghijk', title: 'A reel' }],
  ['mediaSave', 'media:save', 'P001', { kind: 'video', url: 'not a link', title: 'x' }],
  ['mediaDelete', 'media:delete', 'P001', { kind: 'video', id: 'dQw4w9WgXcQ' }], ['mediaDelete', 'media:delete', 'P001', { kind: 'video', id: 'zzzzzzzzzzz' }],
  ['mediaHide', null, 'P001', { kind: 'reel', id: 'abcdefghijk', hidden: true }],
  ['listRecords', 'record:list', 'P001', {}],
  ['saveRecordsPage', 'record:save', 'P001', { records: [{ id: 'insurance', category: 'Cover', title: 'Insurance', provider: 'Acme2', reference: 'R1', due_on: '2027-01-01' },
    { id: 'lease', title: 'Lease', provider: 'Land', due_on: '2027-05-01' }, { id: 'empty_one', title: 'Empty' }] }],
  ['saveRecordsPage', 'record:save', 'P001', { records: [{ id: 'Bad Id', title: 'x' }] }],
  ['listClientErrors', 'clienterror:list', 'P001', {}],
  ['listApplications', 'application:list', 'P001', {}],
  ['listStaff', 'staff:list', 'P001', {}],
  ['listSuggestions', 'suggestion:list', 'P001', {}],
  ['raiseHand', 'hand:save', 'P003', { on: true, q: 'Q1', label: 'Fractions' }], ['hands', 'hand:read', 'P002', {}], ['raiseHand', 'hand:save', 'P003', { for: 'P001', on: true }],
];

/* ONE RUN OF EVERY CASE ON A FRESH SHEET, by the old name or by the item door; the reply and the rows it left. */
function runAll(door) {
  const ctx = load(), tabs = fake(ctx), out = [];
  const acts = ctx.postActions_();
  CASES.forEach(([name, kv, who, extra]) => {
    const body = Object.assign({ token: 'tok-' + who, personId: who, name: who }, JSON.parse(JSON.stringify(extra)));
    let got;
    try {
      if (door && kv) {
        const [kind, verb] = kv.split(':');
        const b = Object.assign({}, body, { action: 'item', door: verb === 'read' ? 'get' : verb });
        if (verb === 'read' || verb === 'list') b.kind = kind; else { b.item = kind; }
        got = ctx.postItem_(b, 'item', AT);
      } else got = acts[name](body, name, AT);
    } catch (e) { got = { threw: String(e && e.message || e) }; }
    out.push({ name, kv, who, reply: got });
  });
  const left = {};
  ['work_files', 'push_tokens', 'media', 'records'].forEach(n => { left[n] = tabs[n].rows.map(r => JSON.parse(JSON.stringify(r))); });
  return { out, left };
}

function run() {
  /* THE SITE'S OWN CLOCK (settings tz), whoever runs it: a time of day is said in London. */
  const tz = process.env.TZ;
  process.env.TZ = 'Europe/London';
  try { check(); } finally { if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz; }
}
function check() {
  const bad = [];
  const now = runAll(false);
  if (process.argv.includes('--write')) {
    fs.writeFileSync(GOLD, JSON.stringify(now, null, 1) + '\n');
    console.log('one-door-same: ' + now.out.length + ' answers recorded');
    return;
  }
  const gold = JSON.parse(fs.readFileSync(GOLD, 'utf8'));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  now.out.forEach((c, i) => { if (!same(c, gold.out[i])) bad.push(c.name + ' (' + c.who + '): ' + JSON.stringify(c.reply).slice(0, 200) + ' — before: ' + JSON.stringify((gold.out[i] || {}).reply).slice(0, 200)); });
  if (!same(now.left, gold.left)) bad.push('the rows left behind differ from before');
  /* THE ITEM DOOR: every case that has a kind:verb answers as its old name did. */
  const item = runAll(true);
  item.out.forEach((c, i) => {
    if (!c.kv) return;
    if (!same(c.reply, gold.out[i].reply)) bad.push('item ' + c.kv + ' (' + c.who + '): ' + JSON.stringify(c.reply).slice(0, 200) + ' — by name: ' + JSON.stringify(gold.out[i].reply).slice(0, 200));
  });
  report('one-door-same', bad, 'answer(s) changed');
  console.log('one-door-same: ' + now.out.length + ' cases by name and by the item door answer as before the cut');
}
module.exports = { run };
main(module, run);
