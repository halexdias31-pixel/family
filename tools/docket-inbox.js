#!/usr/bin/env node
/* @family. — tools/docket-inbox.js DOCKET INBOX (rule 1.75, owner 25 Nov; one list, 25 Nov night): rows dropped in the private Ledger tab docket_inbox
   (title, replaces; `list` and `note` are ignored) reach the owner's Docket on an admin page load. Run in the backend vm on a made-up docket and made-up
   rows: docketInboxRun_ puts each row as an undated one-off {title} at the end of the one list "Docket" (made when missing), skips a title already there
   (any case), removes the items `replaces` names (" | ", any case) putting the new one in the first one's place, a row with no title and a `replaces`
   only removes (owner, 25 Nov night: DELETE-ONLY), backs the old cell up (backup_docket_inbox: time, old cell, titles) before saving, clears the rows
   read (header kept), and with no rows changes nothing; it is called from setupOnAdminLoad_. Each rule proved by mutation. No real item text here. */
'use strict';
const fs = require('fs'), path = require('path');
const { report, main } = require('./lib/gen.js');
const { world } = require('./docket-onelist.js');

const HEAD = ['title', 'note', 'list', 'replaces'];
const DOCKET = () => [{ name: 'Docket', items: [{ title: 'Floss', repeat: '8h' }, { title: 'Made-up task one' }, { title: 'Old made-up A' }, { title: 'Old made-up B' },
  { title: 'Made-up keep' }, { title: 'Gone made-up C' }, { title: 'Gone made-up D' }] }];
const ROWS = [['Made-up task two', 'a made-up note', ''], ['made-up TASK one', '', 'Docket'], ['Made-up task three', '', ''],
  ['Made-up later', '', 'Someday'], ['', 'blank title', ''], ['Made-up merged', '', '', 'old MADE-UP a | Old made-up B | not there'],
  ['', '', '', 'gone MADE-UP c | Gone made-up D']];

function scene(rows) {
  const w = world(DOCKET);
  if (rows) w.B.tabs.docket_inbox = w.B.sheet('docket_inbox', [HEAD.slice()].concat(rows.map(r => r.slice())));
  const was = w.cell();
  w.ctx.clearCache();
  const said = w.ctx.docketInboxRun_();
  const after = JSON.parse(w.cell());
  return { said, was, cell: w.cell(), after, inbox: w.B.tabs.docket_inbox, backup: w.B.tabs.backup_docket_inbox, cap: w.ctx.$('DOCKET_CELL_MAX') };
}
const D = m => m.after.lists[0].items;
const RULES = [
  ['rows land at the end of the one list as undated one-offs, title only (note and list ignored)', m => { const d = D(m);
    return m.after.lists.length === 1 && m.after.lists[0].name === 'Docket'
      && d.map(i => i.title).join('|') === 'Floss|Made-up task one|Made-up merged|Made-up keep|Made-up task two|Made-up task three|Made-up later'
      && d.slice(1).every(i => Object.keys(i).join() === 'title'); }],
  ['replaces: the named items (any case) are gone, the new one in the first one\'s place, named in the backup', m => !D(m).some(i => /^old made-up/i.test(i.title))
    && D(m)[2].title === 'Made-up merged' && !!m.backup && /replaced \(4\): Old made-up A \| Old made-up B \| Gone made-up C \| Gone made-up D/.test(m.backup.v[0][2])],
  ['a delete-only row (no title, replaces) removes, adds nothing', m => !D(m).some(i => /^gone made-up/i.test(i.title)) && D(m).every(i => i.title)],
  ['a title already there (any case) is skipped', m => D(m).filter(i => /^made-up task one$/i.test(i.title)).length === 1],
  ['other items untouched', m => JSON.stringify(D(m)[0]) === JSON.stringify(DOCKET()[0].items[0])],
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
    a => { D({ after: a })[4].repeat = '8h'; },
    a => { D({ after: a }).splice(4, 1); },
    a => { D({ after: a })[4].note = 'a made-up note'; },
    a => { D({ after: a }).push({ title: 'Old made-up A' }); },
    a => { D({ after: a }).push({ title: 'Gone made-up C' }); },
    a => { D({ after: a }).push({ title: '' }); },
    a => { const x = D({ after: a }); x.splice(1, 2, x[2], x[1]); },
    a => { a.lists.push({ name: 'Someday', items: [] }); },
    a => { D({ after: a }).push({ title: 'MADE-UP TASK ONE' }); },
    a => { D({ after: a })[0].repeat = ''; },
  ].map(b => () => { const a = cp(m.after); b(a); return wa(a); });
  breaks.push(() => Object.assign({}, m, { inbox: { v: [HEAD, ROWS[0]] } }), () => Object.assign({}, m, { backup: null }),
    () => Object.assign({}, m, { backup: { v: [[0, '{}', 'added']] } }),
    () => Object.assign({}, m, { backup: { v: [[0, m.was, m.backup.v[0][2].replace(/ \| Gone made-up C \| Gone made-up D/, '')]] } }), () => Object.assign({}, m, { cell: 'x'.repeat(m.cap + 1) }));
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
