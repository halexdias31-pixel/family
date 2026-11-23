#!/usr/bin/env node
/* @family. — tools/docket-tidy-23nov.js THE OWNER'S SECOND DOCKET TIDY (rule 1.75; owner 23 Nov): `docket-tidy-23nov` rewrites the owner's lists, and a
   wrong rule would lose them an item. backend/access.gs docketTidy23NovRun_ is run in the backend vm (tools/lib/backend-vm.js) on a made-up docket shaped
   like the owner's (generic titles; only the ones the job itself names): the backup tab first; nothing lost (every old title and note in a title or a
   note); one daily Shopping in every list but the prayer-only ones, Ideas & notes and Overdue; the takeaway covers Meat! and Rice, and its tick (dkTick_,
   the one tick) ticks both and its untick unticks only those; two car one-offs at the desk; a second run is a no-op. Counted: every rule. Run by tools/build.js. */
'use strict';
const { report, main } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');

const OWNER = 'owner@example.test', DAY = '2026-11-20';
const it = (title, x) => Object.assign({ title }, x || {});
const DOCKET = () => [
  { name: 'eyes opend', items: [it('Jesus prayer', { repeat: 'daily' }), it('Morning prayers', { repeat: 'daily', note: 'a long prayer' }),
    it('Acknowledge that’s these schedules are the ideal thing which you need to do, but can be violated for'), it('sake of circumstances.')] },
  { name: 'Out of Shower', start: '07:00', items: [it('Jesus prayer', { repeat: 'daily' }), it('banana', { repeat: 'daily' }), it('Cereal!', { repeat: 'daily' }),
    it('Egg', { repeat: 'daily' }), it('Tuna'), it('Pack food', { repeat: 'daily' }), it('Morning shop', { repeat: 'daily', note: 'milk' }),
    it('Morning shop', { repeat: 'daily' }), it('Shopping', { note: 'bread too' }), it('old errand', { date: '2026-11-01' })] },
  { name: 'After brush teeth', items: [it('Jesus prayer', { repeat: 'daily' }), it('Yoghurt!', { repeat: 'daily' }), it('get dressed', { repeat: 'daily' })] },
  { name: '@ Desk', items: [it('Jesus prayer', { repeat: 'daily' }), it('Important Notice – Summer 2026 Examination Certificates'), it('3d print tinkercad'),
    it('shopping', { note: 'printer paper' }), it('reply to messages')] },
  { name: 'back @ desk', items: [it('A system is what it does'), it('Sleep warm'), it('plan the week')] },
  { name: 'arrived home', start: '18:00', items: [it('Jesus prayer', { repeat: 'daily' }), it('Meat!', { repeat: 'daily' }), it('Rice', { repeat: 'daily' }), it('kettle')] },
  { name: 'undercovers', items: [it('Jesus prayer', { repeat: 'daily' }), it('Evening prayers', { repeat: 'daily' })] },
];
const NO_SHOP = ['eyes opend', 'undercovers', 'Ideas & notes', 'Overdue — check'];

function world() {
  const ctx = load({ at: true, google: { Utilities: { formatDate: (d, tz, f) => (f === 'yyyy-MM-dd' ? DAY : DAY + ' 10:00'), getUuid: () => 'u' } } }), B = book();
  const person = { person_id: 'P-OWN', role: 'admin', first_name: 'Made', last_name: 'Up', email: OWNER, todo: JSON.stringify({ v: 1, lists: DOCKET() }) };
  B.tabs.items = B.sheet('items', [['id', 'kind', 'data_1'], ['owner_email', 'setting', JSON.stringify({ key: 'owner_email', value: OWNER })],
    ['P-OWN', 'person', JSON.stringify(person)]]);
  ctx.findSheet_ = at => B.tabs[at.names[0]] || null;
  B.tabs.items.getParent = () => B.ss;
  const cell = () => JSON.parse(B.tabs.items.v.find(r => r[0] === 'P-OWN')[2]).todo;
  return { ctx, B, cell, run: () => { ctx.clearCache(); return ctx.docketTidy23NovRun_(); } };
}

function run() {
  const bad = [], checks = [];
  let w, said, out, again, cellAfter, cellAgain;
  try {
    w = world(); said = w.run(); cellAfter = w.cell(); out = JSON.parse(cellAfter).lists;
    again = w.run(); cellAgain = w.cell();
  } catch (e) { console.log(e.stack); checks.push(['docketTidy23NovRun_ ran', () => false]); }
  if (out) {
    const L = n => out.find(x => x.name === n) || { items: [] }, all = out.flatMap(x => x.items);
    const text = all.map(i => (i.title || '') + '\n' + (i.note || '')).join('\n');
    const ah = L('arrived home'), at = t => ah.items.findIndex(i => i.title === t);
    const TAKE = 'Peter\'s Takeaway: sweet and sour chicken with rice box';
    const tick = (on, day) => w.ctx.dkTick_(ah.items, at(TAKE), on, day || DAY);
    const isDone = t => ah.items[at(t)].doneOn === DAY;
    checks.push(
      ['the backup tab holds the old cell, first', () => { const bk = w.B.tabs.backup_docket_23nov; return !!bk && bk.v.length === 1 && bk.v[0][1] === JSON.stringify({ v: 1, lists: DOCKET() }); }],
      ['nothing lost: every old title and note is in a title or a note', () => DOCKET().every(x => x.items.every(i => text.includes(i.title) && (!i.note || text.includes(i.note))))],
      ['one daily Shopping in every list but the prayer-only ones and Overdue; no Ideas & notes list', () => out.every(x => {
        const s = x.items.filter(i => /^(shopping|morning shop)/i.test(i.title));
        if (NO_SHOP.includes(x.name)) return s.length === 0;
        return s.length === 1 && s[0].title === 'Shopping' && s[0].repeat === 'daily' && s[0].place === 'out' && s[0].minutes === 20
          && s[0].note.startsWith('only what\'s missing; tomorrow\'s breakfast and packed food first');
      }) && !out.some(x => x.name === 'Ideas & notes') && out.some(x => x.name === 'Overdue — check')],
      ['the takeaway is daily in arrived home and covers Meat! and Rice', () => at(TAKE) >= 0 && ah.items[at(TAKE)].repeat === 'daily'
        && JSON.stringify(ah.items[at(TAKE)].covers) === '["Meat!","Rice"]'],
      ['the two car checks are one-offs at the desk', () => ['Car: find out about the airbag (warning light / check)', 'Car: wheels — balancing / wheel bearings, get checked']
        .every(t => L('@ Desk').items.filter(i => i.title === t && !i.repeat).length === 1)],
      ['covers: a tick ticks both, an untick unticks both', () => { tick(true); const on = isDone(TAKE) && isDone('Meat!') && isDone('Rice');
        tick(false); return on && !isDone(TAKE) && !isDone('Meat!') && !isDone('Rice'); }],
      ['covers: an untick undoes only what its tick set', () => { ah.items[at('Rice')].doneOn = DAY; tick(true); tick(false); const r = isDone('Rice') && !isDone('Meat!'); ah.items[at('Rice')].doneOn = ''; return r; }],
      ['covers: listTidy_ keeps it, as-is and whole', () => ['as-is', 'whole'].every(h => JSON.stringify(w.ctx.listTidy_('docket', [ah.items[at(TAKE)]], h)[0].covers) === '["Meat!","Rice"]')],
      ['the private address ticks through the one tick', () => { const lists = JSON.parse(cellAfter).lists, r = w.ctx.docketAnswer_(lists, DAY + ' 21:00', { do: 'done', what: 'peters takeaway sweet and sour' }, w.ctx.docketFill_);
        const h = lists.find(x => x.name === 'arrived home').items, d = t => h.find(i => i.title === t).doneOn === DAY; return r.changed && d(TAKE) && d('Meat!') && d('Rice'); }],
      ['a second run is a no-op', () => /already tidied/.test(again) && cellAgain === cellAfter && w.B.tabs.backup_docket_23nov.v.length === 1],
      ['under DOCKET_CELL_MAX', () => cellAfter.length <= w.ctx.$('DOCKET_CELL_MAX')]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (e) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-tidy-23nov: ' + checks.length + ' rules through docketTidy23NovRun_ and dkTick_' + (said ? ' (' + said + ')' : '') + '; ' + bad.length + ' broken');
  report('docket-tidy-23nov', bad, 'docket tidy (23 Nov) rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
