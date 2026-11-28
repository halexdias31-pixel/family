#!/usr/bin/env node
/* @family. — tools/archive-move.js THE PERSONAL ARCHIVE (rule 1.75; owner 27 Nov: "Tools › Library cards, the notepad field and any notes / sticky
   notes become ONE kind, Archive: an entry is a title, free fields (e.g. card number, login) and text. Migrate existing library cards, then remove
   the Library cards tool"). backend/access.gs archive28NovRun_ in the backend vm on made-up library cards and notepads of two made-up people:
   every card is an entry of its own person (its library the title, else "Library card"; Card number and PIN as free fields), every notepad the
   entry "Notepad" with its words; none dropped or doubled; the backup tab holds every old card and notepad first; the old card rows gone and the
   notepad cells emptied; a re-run a no-op; the reply names no login. And as a person would see it: an entry is seen by its person (and an admin)
   and no other; a new one is its writer's; another person cannot change it; the form keeps no draft; the kind is declared once, in kinds.json.
   MIGRATIONS runs the job; the Library cards tool and the notepad action are gone. Each rule of the move proved by breaking the result (--prove
   prints it). No real names, cards or logins here, by design. Run by tools/build.js. */
'use strict';
const { report, main, text, bare } = require('./lib/gen.js');
const SD = require('./lib/site-data.js');
const { world } = require('./docket-onelist.js');

const CARDS = [
  { person_id: 'P-OWN', library: 'Made-up Library A', card_number: '000111', pin: '9911' },
  { person_id: 'P-OWN', library: 'Made-up Library B', card_number: '000222', pin: '' },
  { person_id: 'P-KID', library: '', card_number: '000333', pin: '8822' },
];
const PADS = { 'P-OWN': 'made-up notepad line one\nmade-up line two', 'P-KID': 'made-up kid note' };
function scene() {
  const w = world(() => [{ name: 'Docket', items: [] }]);
  const rows = w.B.tabs.items.v, own = rows.find(r => r[0] === 'P-OWN'), p = JSON.parse(own[2]);
  p.notepad = PADS['P-OWN']; own[2] = JSON.stringify(p);
  rows.push(['P-KID', 'person', JSON.stringify({ person_id: 'P-KID', role: 'student', first_name: 'Made', last_name: 'Kid', email: 'kid@example.test', notepad: PADS['P-KID'] })]);
  rows.push(['P-TWO', 'person', JSON.stringify({ person_id: 'P-TWO', role: 'student', first_name: 'Made', last_name: 'Two', email: 'two@example.test' })]);
  CARDS.forEach(c => rows.push([c.person_id + ':' + c.library, 'library_card', JSON.stringify(c)]));
  const C = w.ctx, person = id => JSON.parse(rows.find(r => r[0] === id)[2]);
  const archive = () => rows.filter(r => r[1] === 'archive').map(r => JSON.parse(r[2]));
  const run = () => { C.clearCache(); return C.archive28NovRun_(); };
  const said = run(), after = archive(), backup = w.B.tabs.backup_archive_28nov, bkLen = backup ? backup.v.length : 0;
  const again = run(), afterAgain = archive();
  /* AS A PERSON SEES IT, through the one action `item`. */
  C.clearCache();
  const viewer = id => C.itemViewer_(C.read(C.TAB ? C.TAB.people : 'people').rows.find(r => r.person_id === id));
  const sees = id => { C.clearCache(); return (C.itemRead_({ kind: 'archive' }, viewer(id)).items || []).map(i => i.data); };
  const kidSees = sees('P-KID'), twoSees = sees('P-TWO'), ownSees = sees('P-OWN');
  const wrote = C.itemWrite_({ kind: 'archive', item: { archive_id: 'arc-made-up', title: 'Made-up login', fields: 'Login: made-up\nPassword: made-up', text: '' } }, viewer('P-KID'));
  C.clearCache();
  const stolen = C.itemWrite_({ kind: 'archive', item: { archive_id: 'arc-made-up', title: 'changed' } }, viewer('P-TWO'));
  return { said, again, after, afterAgain, backup, bkLen, bkLenAgain: backup ? backup.v.length : 0,
    cardsLeft: rows.filter(r => r[1] === 'library_card').length, padOwn: person('P-OWN').notepad, padKid: person('P-KID').notepad,
    kidSees, twoSees, ownSees, wrote, stolen, kidAfter: sees('P-KID') };
}
const E = (m, t) => m.after.filter(e => e.title === t);
const RULES = [
  ['every card is an entry of its own person, its library the title', m => E(m, 'Made-up Library A').length === 1 && E(m, 'Made-up Library A')[0].person_id === 'P-OWN' && E(m, 'Made-up Library B')[0].person_id === 'P-OWN'],
  ['a card with no library is titled "Library card"', m => E(m, 'Library card').length === 1 && E(m, 'Library card')[0].person_id === 'P-KID'],
  ['card number and PIN are its free fields, an empty one left out', m => E(m, 'Made-up Library A')[0].fields === 'Card number: 000111\nPIN: 9911' && E(m, 'Made-up Library B')[0].fields === 'Card number: 000222'],
  ['every notepad is the entry "Notepad" of its person, its words the text', m => E(m, 'Notepad').length === 2 && E(m, 'Notepad').some(e => e.person_id === 'P-OWN' && e.text === PADS['P-OWN']) && E(m, 'Notepad').some(e => e.person_id === 'P-KID' && e.text === PADS['P-KID'])],
  ['none dropped or doubled (five entries)', m => m.after.length === 5 && new Set(m.after.map(e => e.archive_id)).size === 5],
  ['the backup holds every old card and notepad, once', m => !!m.backup && m.bkLen === 5 && m.backup.v.some(r => r[1] === 'library_card' && /000111/.test(r[3])) && m.backup.v.some(r => r[1] === 'notepad' && r[3] === PADS['P-KID'])],
  ['the old card rows are gone and the notepads emptied', m => m.cardsLeft === 0 && !m.padOwn && !m.padKid],
  ['a re-run is a no-op', m => /nothing to do/.test(m.again) && JSON.stringify(m.afterAgain) === JSON.stringify(m.after) && m.bkLenAgain === m.bkLen],
  ['the reply names no card number or PIN', m => !/000111|9911|000333|8822/.test(m.said)],
  ['an entry is seen by its person and an admin, and no other person', m => m.kidSees.every(e => e.person_id === 'P-KID') && m.kidSees.length === 2 && m.twoSees.length === 0 && m.ownSees.length === 5],
  ['a new entry is its writer\'s, and another person cannot change it', m => m.wrote && m.wrote.ok && m.kidAfter.some(e => e.archive_id === 'arc-made-up' && e.person_id === 'P-KID') && m.stolen && !m.stolen.ok],
];
function prove(m) {
  const cp = o => JSON.parse(JSON.stringify(o));
  const breaks = [x => { x.after.pop(); }, x => { x.after.push(x.after[0]); }, x => { x.after[0].person_id = 'P-KID'; }, x => { x.after[2].title = ''; },
    x => { x.after[0].fields = 'Card number: 000111'; }, x => { x.after[3].text = ''; }, x => { x.backup = null; }, x => { x.cardsLeft = 1; }, x => { x.padKid = 'x'; },
    x => { x.again = 'moved'; }, x => { x.said += ' 9911'; }, x => { x.twoSees = [{}]; }, x => { x.stolen = { ok: true }; }];
  return breaks.map((b, i) => { const x = Object.assign({}, m, { after: cp(m.after), twoSees: cp(m.twoSees) }); b(x);
    return RULES.some(([, r]) => { try { return !r(x); } catch (e) { return true; } }) ? -1 : i; }).filter(i => i >= 0);
}
function run() {
  const bad = [], checks = [];
  let m = null; try { m = scene(); } catch (e) { console.log(e.stack); }
  if (!m) checks.push(['archive28NovRun_ ran', () => false]);
  else {
    RULES.forEach(([n, f]) => checks.push([n, () => f(m)]));
    checks.push(['every break of the result caught', () => { const missed = prove(m);
      if (missed.length || process.argv.includes('--prove')) console.log('  --prove: ' + (missed.length ? 'missed break(s) ' + missed.join(', ') : 'every break caught'));
      return !missed.length; }]);
  }
  const K = SD.kinds(), A = K.archive || {}, acc = text('backend/access.gs'), map = text('js/map.js'), actions = text('data/settings/actions.json');
  const job = (/\nfunction archive28NovRun_\(\) \{[\s\S]*?\n\}\n/.exec(acc) || [''])[0];
  checks.push(['the kind is declared once, in kinds.json: a title, free fields and text, found from the store', () => !!A.list && ['title', 'fields', 'text'].every(f => A.list.fields.some(F => F.f === f)) && (A.find || {}).from === 'store' && (A.sheet.owner || [])[0] === 'person_id']);
  checks.push(['only its person and an admin see it', () => String((A.see || {}).who).split(',').map(s => s.trim()).sort().join() === 'admin,self']);
  checks.push(['its form keeps no draft (a login is never kept on the phone)', () => Object.values(A.forms || {}).every(f => !f.draft)]);
  checks.push(['the move logs nothing', () => !!job && !/Logger\.|console\./.test(bare(job, { comments: true }))]);
  checks.push(['MIGRATIONS runs it, retried until it works', () => /\{ id: 'archive-28nov',\s*retry: true,[\s\S]*?run: \(\) => archive28NovRun_\(\) \}/.test(acc)]);
  checks.push(['the Library cards tool and the notepad action are gone', () => !/id: 'libcards'/.test(map) && !/notepad:save/.test(actions) && !/libcards/.test(text('data/settings/tiers.json'))]);
  checks.forEach(([name, f]) => { let ok = false; try { ok = f(); } catch (x) { ok = false; } if (!ok) bad.push(name); });
  console.log('archive-move: ' + checks.length + ' rules' + (m ? ' (' + m.said + ')' : '') + '; ' + bad.length + ' broken' + (bad.length ? ': ' + bad.join(' | ') : ''));
  report('archive-move', bad, 'archive rule(s) broken');
  return { n: checks.length, bad: bad.length };
}
module.exports = { run, scene };
main(module, run);
