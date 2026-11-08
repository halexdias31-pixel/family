require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-migrate.js OLD SHEET ROWS (owner, 8 Nov): read as before until "Tidy old rows" runs, rewritten once, read the same after. */
'use strict';
const fs = require('fs'), path = require('path');
const { backend } = require('./check-gas-load');

const FX = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'check', 'fixtures', 'old-rows.json'), 'utf8'));
const bad = [];
const want = (ok, what) => { if (!ok) bad.push(what); else console.log('  ok  ' + what); };

const b = backend();
b.seed('people', FX.people.map(p => Object.assign({ pin: '0000', verified: 'TRUE', city: 'London' }, p)));
b.seed('reports', FX.reports);
b.seed('posts', FX.posts);
const cell = (tab, idCol, id, col) => { const g = b.tabs[tab], h = g[0]; const r = g.find((x, i) => i > 0 && x[h.indexOf(idCol)] === id); return r ? r[h.indexOf(col)] : undefined; };
/* WHAT THE READERS SAY, asked the same way before and after. */
const readers = () => {
  b.ev('clearCache(); OLD_ROWS_SEEN_ = null;');
  return JSON.parse(b.ev(`JSON.stringify({
    rank: ['P-L1', 'P-L2', 'P-C1'].map(id => rankOf(findPerson('', id))),
    self: ['P-L1', 'P-L2'].map(id => selfRolesOf_(findPerson('', id)).join(',')),
    reports: read(TAB.reports).rows.map(reportRow_),
  })`));
};
const pics = () => { b.ev('clearCache()'); return ((b.get({}).posts) || []).map(p => p.id + ':' + p.imageW + 'x' + p.imageH).sort().join(' '); };

/* ---------- BEFORE: the old shapes still read as they always did */
const before = readers();
want(!b.props.OLD_ROWS_TIDIED, 'the flag is not set before the job has run');
want(before.rank.join() === 'client,staff,client', 'before: a `parent` row ranks client and `teacher, guardian` staff — ' + before.rank);
want(before.reports[0].kind === 'question' && before.reports[0].item_id === 'q:Q-9' && before.reports[0].status === 'open'
  && before.reports[1].status === 'dismissed', 'before: an old report reads as an open question with its `q:` item');
const picsBefore = pics();

/* ---------- THE JOB: admin only, through doPost */
const tok = {};
['P-A1', 'P-C1'].forEach(pid => {
  const p = FX.people.find(x => x.person_id === pid);
  const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
  if (!d.success) { bad.push('could not sign ' + pid + ' in: ' + JSON.stringify(d)); return; }
  tok[pid] = d;
});
const as = (pid, body) => b.post(Object.assign({ token: (tok[pid] || {}).token, name: (tok[pid] || {}).name, personId: pid }, body));
const no = as('P-C1', { action: 'tidyOldRows' });
want(!no.success && !b.props.OLD_ROWS_TIDIED, 'a client cannot run Tidy old rows');
const yes = as('P-A1', { action: 'tidyOldRows' });
want(yes.success && yes.changed === 5 && yes.tidied, 'the admin runs it: 5 rows rewritten, flag set — ' + JSON.stringify(yes));
want(!!b.props.OLD_ROWS_TIDIED, 'the flag is a Script Property');

/* ---------- THE ROWS ARE TODAY'S SHAPE */
want(cell('people', 'person_id', 'P-L1', 'role') === 'client', 'people: `parent` became `client`');
want(cell('people', 'person_id', 'P-L2', 'role') === 'tutor, client', 'people: `teacher, guardian` became `tutor, client`');
want(cell('reports', 'report_id', 'R-1', 'kind') === 'question' && cell('reports', 'report_id', 'R-1', 'item_id') === 'q:Q-9'
  && cell('reports', 'report_id', 'R-1', 'status') === 'open', 'reports: the blanks are written');
want(cell('reports', 'report_id', 'R-2', 'status') === 'dismissed', 'reports: `not a problem` became `dismissed`');
want(cell('posts', 'post_id', 'PO-1', 'image_w') === 800 && cell('posts', 'post_id', 'PO-2', 'image_w') === 640, 'posts: an unsized picture is 800 x 1000; a sized one is left alone');

/* ---------- AFTER: the guarded readers, now without the old-shape branches, say the same */
const after = readers();
want(JSON.stringify(after.rank) === JSON.stringify(before.rank) && JSON.stringify(after.self) === JSON.stringify(before.self), 'after: ranks and roles read the same — ' + after.rank);
want(JSON.stringify(after.reports) === JSON.stringify(before.reports), 'after: reports read the same');
const picsAfter = pics();
want(/PO-1:800x1000/.test(picsAfter) && /PO-2:640x480/.test(picsAfter), 'after: the site gets the sizes (' + picsAfter + '; before ' + picsBefore + ')');

/* ---------- AGAIN: nothing left to do */
const again = as('P-A1', { action: 'tidyOldRows' });
want(again.success && again.changed === 0, 'a second run changes nothing');

if (bad.length) { console.log('FAILED — old rows:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — old sheet rows are read until Tidy old rows runs, rewritten once, and read the same after.');
