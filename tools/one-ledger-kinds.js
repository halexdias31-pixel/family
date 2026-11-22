#!/usr/bin/env node
/* @family. — tools/one-ledger-kinds.js NOTHING LOST WHEN A KIND LEAVES THE LEDGER (queue step 7, 22 Nov): each one-off migration that
   moves items rows out is run here on a made-up items tab — the backend loaded as Apps Script loads it, Google stubbed, the sheet an
   in-memory one. Every old row must be in the backup tab, gone from items, every other kind read the same before and after, and a
   second run must change nothing. Run by tools/build.js. */
'use strict';
const { report, main } = require('./lib/gen.js');
const { load, book } = require('./lib/backend-vm.js');

/* THE MIGRATIONS HELD HERE: its id, the kinds it moves out, the backup tab it must fill. */
const CASES = [{ id: 'dead-kinds-22nov', kinds: ['invite', 'biz_check', 'owner_answer', 'landmark', 'landmark_part', 'map_shape'], backup: 'backup_dead_kinds_22nov' }];


function madeUp(kinds) {
  const H = ['id', 'kind', 'data_1', 'data_2', 'data_3', 'data_4', 'data_5', 'data_6'];
  const J = o => JSON.stringify(o);
  const rows = [H,
    ['~moved', 'venue', J({ _headers: ['venue_id', 'name', 'postcode'] }), '', '', '', '', ''],
    ['V1', 'venue', J({ venue_id: 'V1', name: 'Library', postcode: 'SW19 2HR' }), '', '', '', '', ''],
    ['~moved', kinds[0], J({ _headers: ['a', 'b'] }), '', '', '', '', ''],
    [kinds[0] + '-1', kinds[0], J({ a: 1, b: 'x' }), '', '', '', '', ''],
    [kinds[0] + '-2', kinds[0], J({ a: 2, b: 'y' }), 'tail', '', '', '', ''],
    ['Q1', 'herd_question', J({ question_id: 'Q1', question: 'Who?', active: 'TRUE' }), '', '', '', '', ''],
    ['E1', 'client_error', J({ error_id: 'E1', last_at: '2026-11-09T00:00:00Z', count: 2, message: 'boom' }), '', '', '', '', ''],
  ];
  kinds.slice(1).forEach((k, i) => { rows.push([k + '-1', k, J({ n: i, note: 'made up' }), '', '', '', '', '']); rows.push(['V' + (i + 2), 'venue', J({ venue_id: 'V' + (i + 2), name: 'Hall ' + i }), '', '', '', '', '']); });
  rows.push(['world:city:Mitcham', 'map_shape', J({ world: 'world', kind: 'city', name: 'Mitcham' }), '', '', '', '', '']);
  return rows;
}

function run() {
  const bad = [];
  const ctx = load();
  const K = ctx.$('ITEM_STORE_KINDS'), TABS = ctx.$('TAB'), MIG = ctx.$('MIGRATIONS');
  CASES.forEach(C => {
    const m = MIG.find(x => x.id === C.id);
    if (!m) { bad.push(C.id + ': no such migration in backend/access.gs'); return; }
    C.kinds.forEach(k => { if (K.kinds[k] || (K.moved || []).indexOf(k) !== -1) bad.push(C.id + ': ' + k + ' is still a kind in kinds.json'); });
    const B = book(), items = B.sheet('items', madeUp(C.kinds));
    B.tabs.items = items;
    ctx.findSheet_ = at => (at.names[0] === TABS.items ? items : null);
    const old = items.v.slice(1).filter(r => C.kinds.indexOf(r[1]) !== -1).map(r => JSON.stringify(r));
    /* EVERY OTHER MOVED KIND, AS ITS READERS SEE IT: read(tab), and kindList_ where the kind has a `sheet.list`. */
    const readers = () => {
      const out = {};
      (K.moved || []).forEach(k => {
        const sh = K.kinds[k] && K.kinds[k].sheet;
        if (!sh || sh.to === 'events' || sh.blob || !sh.tab) return;
        ctx.clearCache();
        const t = ctx.read(sh.tab);
        out[k] = JSON.stringify({ headers: t.headers, rows: t.rows });
        if (sh.list) { ctx.clearCache(); out[k + ':list'] = JSON.stringify(ctx.kindList_(k)); }
      });
      return out;
    };
    const before = readers();
    try { m.run(); } catch (e) { bad.push(C.id + ': the first run threw: ' + e.message); return; }
    const bk = B.tabs[C.backup];
    if (!bk) { bad.push(C.id + ': no backup tab ' + C.backup); return; }
    const held = bk.v.slice(1).map(r => JSON.stringify(r));
    old.forEach(r => { if (held.indexOf(r) === -1) bad.push(C.id + ': a row is not in ' + C.backup + ': ' + r.slice(0, 80)); });
    if (JSON.stringify(bk.v[0]) !== JSON.stringify(items.v[0])) bad.push(C.id + ': the backup has not the items tab\'s columns');
    items.v.slice(1).forEach(r => { if (C.kinds.indexOf(r[1]) !== -1) bad.push(C.id + ': still in items: ' + r[0]); });
    const after = readers();
    Object.keys(before).forEach(k => { if (before[k] !== after[k]) bad.push(C.id + ': ' + k + ' reads differently after it ran'); });
    const snap = JSON.stringify(Object.keys(B.tabs).map(n => [n, B.tabs[n].v]));
    try { m.run(); } catch (e) { bad.push(C.id + ': the second run threw: ' + e.message); }
    if (JSON.stringify(Object.keys(B.tabs).map(n => [n, B.tabs[n].v])) !== snap) bad.push(C.id + ': running it twice changed something');
    if (!bad.length) console.log('one-ledger-kinds: ' + C.id + ' — ' + old.length + ' row(s) kept in ' + C.backup + ', ' + Object.keys(before).length + ' reader(s) the same, twice = once');
  });
  report('one-ledger-kinds', bad, 'migration(s) that would lose or change a row');
}
module.exports = { run };
main(module, run);
