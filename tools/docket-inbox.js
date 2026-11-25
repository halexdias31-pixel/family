#!/usr/bin/env node
/* @family. — tools/docket-inbox.js DOCKET INBOX (rule 1.75, owner 25 Nov): rows dropped in the private Ledger tab docket_inbox (title, note, list, replaces) reach
   the owner's Docket on an admin page load. Run in the backend vm on a made-up docket and made-up rows: docketInboxRun_ puts each row as a one-off
   {title, note?} at the end of its list ("@ Desk" when blank; a missing list made), skips a title already in that list (any case), removes the items `replaces` names (" | ", any case) putting the new one in the first one's place, backs the old cell
   up (backup_docket_inbox: time, old cell, titles) before saving, clears the rows read (header kept), and with no rows changes nothing; it is called
   from setupOnAdminLoad_. Each rule proved by mutation. No real item text here, by design. */
'use strict';
const fs = require('fs'), path = require('path');
const { report, main } = require('./lib/gen.js');
const { world } = require('./docket-slots.js');

const HEAD = ['title', 'note', 'list', 'replaces'];
const DOCKET = () => [{ name: 'Every 8 hours', start: '00:00', items: [{ title: 'Floss', repeat: '8h' }] },
  { name: '@ Desk', items: [{ title: 'Made-up task one' }, { title: 'Old made-up A' }, { title: 'Old made-up B' }, { title: 'Made-up keep' }] }];
const ROWS = [['Made-up task two', 'a made-up note', ''], ['made-up TASK one', '', '@ Desk'], ['Made-up task three', '', ''],
  ['Made-up later', '', 'Someday'], ['', 'blank title', ''], ['Made-up merged', '', '', 'old MADE-UP a | Old made-up B | not there']];

function scene(rows) {
  const w = world(DOCKET);
  if (rows) w.B.tabs.docket_inbox = w.B.sheet('docket_inbox', [HEAD.slice()].concat(rows.map(r => r.slice())));
  const was = w.cell();
  w.ctx.clearCache();
  const said = w.ctx.docketInboxRun_();
  const after = JSON.parse(w.cell());
  return { said, was, cell: w.cell(), after, inbox: w.B.tabs.docket_inbox, backup: w.B.tabs.backup_docket_inbox, cap: w.ctx.$('DOCKET_CELL_MAX') };
}
const L = (m, n) => (m.after.lists.find(x => x.name === n) || { items: [] }).items;
const RULES = [
  ['rows land at the end of @ Desk as one-offs, note kept', m => { const d = L(m, '@ Desk');
    return d.map(i => i.title).join('|') === 'Made-up task one|Made-up merged|Made-up keep|Made-up task two|Made-up task three' && d.every(i => !i.repeat && !i.slot)
      && d[3].note === 'a made-up note' && !('note' in d[4]); }],
  ['replaces: the named items (any case) are gone, the new one in the first one\'s place, named in the backup', m => !L(m, '@ Desk').some(i => /^old made-up/i.test(i.title))
    && L(m, '@ Desk')[1].title === 'Made-up merged' && !!m.backup && /replaced \(2\): @ Desk: Old made-up A \| @ Desk: Old made-up B/.test(m.backup.v[0][2])],
  ['a named list that is missing is made', m => L(m, 'Someday').length === 1 && L(m, 'Someday')[0].title === 'Made-up later' && !L(m, 'Someday')[0].repeat],
  ['a title already in the list (any case) is skipped', m => L(m, '@ Desk').filter(i => /^made-up task one$/i.test(i.title)).length === 1],
  ['other lists untouched', m => JSON.stringify(L(m, 'Every 8 hours')) === JSON.stringify(DOCKET()[0].items)],
  ['the rows are cleared, the header kept', m => !!m.inbox && m.inbox.v.length === 1 && m.inbox.v[0].join() === HEAD.join()],
  ['the backup holds the old cell and the titles, once', m => !!m.backup && m.backup.v.length === 1 && m.backup.v[0][1] === m.was
    && /Made-up task two/.test(m.backup.v[0][2]) && /skipped \(1\)/.test(m.backup.v[0][2])],
  ['under DOCKET_CELL_MAX', m => m.cell.length <= m.cap],
];
const EMPTY_RULES = [
  ['an empty tab changes nothing', e => e.cell === e.was && !e.backup && e.inbox.v.length === 1 && /nothing to do/.test(e.said)],
  ['no tab changes nothing', e => e.cell === e.was && !e.backup && /no inbox tab/.test(e.said)],
];

function prove(m, e, n) {
  const cp = o => JSON.parse(JSON.stringify(o)), wa = a => Object.assign({}, m, { after: a });
  const breaks = [
    a => { a.lists[1].items[3].repeat = 'daily'; },
    a => { a.lists[1].items.splice(3, 1); },
    a => { a.lists[1].items[3].note = ''; },
    a => { a.lists[1].items.push({ title: 'Old made-up A' }); },
    a => { const x = a.lists[1].items; x.splice(1, 2, x[2], x[1]); },
    a => { a.lists.pop(); },
    a => { a.lists[1].items.push({ title: 'MADE-UP TASK ONE' }); },
    a => { a.lists[0].items = []; },
  ].map(b => () => { const a = cp(m.after); b(a); return wa(a); });
  breaks.push(() => Object.assign({}, m, { inbox: { v: [HEAD, ROWS[0]] } }), () => Object.assign({}, m, { backup: null }),
    () => Object.assign({}, m, { backup: { v: [[0, '{}', 'added']] } }),
    () => Object.assign({}, m, { backup: { v: [[0, m.was, m.backup.v[0][2].replace(/; replaced.*/, '')]] } }), () => Object.assign({}, m, { cell: 'x'.repeat(m.cap + 1) }));
  const missed = breaks.map((f, i) => (RULES.some(([, r]) => { try { return !r(f()); } catch (x) { return true; } }) ? -1 : i)).filter(i => i >= 0);
  const eb = [() => Object.assign({}, e, { cell: e.cell + ' ' }), () => Object.assign({}, e, { backup: { v: [] } }), () => Object.assign({}, e, { inbox: { v: [] } })];
  eb.forEach((f, i) => { if (EMPTY_RULES[0][1](f())) missed.push('e' + i); });
  if (EMPTY_RULES[1][1](Object.assign({}, n, { backup: { v: [] } }))) missed.push('n0');
  return missed;
}

function run() {
  const bad = [], checks = [];
  let m, e, n;
  try { m = scene(ROWS); e = scene([]); n = scene(null); } catch (x) { console.log(x.stack); }
  if (!m || !e || !n) checks.push(['docketInboxRun_ ran', () => false]);
  else {
    RULES.forEach(([name, f]) => checks.push([name, () => f(m)]));
    checks.push(['an empty tab changes nothing', () => EMPTY_RULES[0][1](e)], ['no tab changes nothing', () => EMPTY_RULES[1][1](n)]);
    checks.push(['proved by mutation: every break caught', () => { const p = prove(m, e, n); if (p.length) console.log('missed', p); return p.length === 0; }]);
    const setup = fs.readFileSync(path.join(__dirname, '../backend/setup.gs'), 'utf8');
    const hooked = s => /id: 'docket-inbox', fn: \(\) => withWriteLock_\(\(\) => docketInboxRun_\(\)[^\n]*everyLoad: true \}/.test(s) && /KEEP_BOOKED\.filter\(job => job\.everyLoad \|\| due\)/.test(s);
    checks.push(['run on every admin page load, after the migrations', () => hooked(setup) && !hooked(setup.replace('docketInboxRun_()', 'docketInbox()'))]);
  }
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('docket-inbox: ' + checks.length + ' rules through docketInboxRun_' + (m ? ' (' + m.said + ')' : '') + '; ' + bad.length + ' broken'
    + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('docket-inbox', bad, 'docket inbox rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
