#!/usr/bin/env node
/* node js/check-accounts.js — ONE RANK PER ACCOUNT, AND STAFF ONLY BY APPLICATION (400), through the real doGet/doPost.
   Ranks, sign-up, the Tutor tick refused, an application approved into Staff, a child's PIN to the owner. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;
const rule = (ok, why, got) => { asked++; if (!ok) bad.push(why + (got !== undefined ? ' — ' + JSON.stringify(got).slice(0, 300) : '')); };
/* NOT 0000, which `register` refuses (`pinWeak_`); built, so no PIN is written into a public file. */
const NEW_PIN = ['4', '8', '2', '6'].join('');
const MAIL = [];
const mailApp = { sendEmail(m) { MAIL.push(m); }, getRemainingDailyQuota: () => 100 };
const mailTo = (addr, from) => MAIL.slice(from || 0).filter(m => String(m.to).split(',').indexOf(addr) !== -1);
const base = { pin: '0000', verified: 'TRUE', city: 'London' };
const P = (id, role, first, email, more) => Object.assign({ person_id: id, role, first_name: first, last_name: 'Test',
  handle: first.toLowerCase() + '_kind' + id.length, email }, base, more || {});

/* THE PRIVATE APPLICANTS' FOLDER: every file it is given, and whether anything tried to share one. */
const DRIVE = { files: [], shared: 0 };
const folder = { createFile(blob) { const id = 'F' + (DRIVE.files.length + 1); DRIVE.files.push({ id, blob });
  return { getId: () => id, setSharing: () => { DRIVE.shared++; } }; } };
const driveApp = { getFolderById: id => (id === 'apply-folder-test' ? folder : null), getFileById: () => null, Access: {}, Permission: {} };
function world(more) {
  const b = backend({ MailApp: mailApp, DriveApp: driveApp });
  if (!(more && more.noFolder)) b.ev("PropertiesService.getScriptProperties().setProperty('APPLY_FOLDER', 'apply-folder-test')");
  b.seed('people', [
    P('P-A1', 'admin', 'Hal', 'admin@example.org'),
    P('P-T1', 'tutor', 'Ada', 'tutor@example.org', { rate_per_hour: 25 }),
    P('P-C1', 'client', 'Pat', 'pat@example.org', { date_of_birth: '01/05/1980' }),
    P('P-S1', 'student', 'Sam', 'sam@example.org'),
    P('P-Y1', 'student', 'Yan', 'yan@example.org', { date_of_birth: '01/03/2014' }),
    P('P-K1', 'student', 'Kit', ''),
  ].concat((more && more.people) || []));
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-C1', child_id: 'P-K1', state: 'accepted' }]);
  if (more && more.config) b.seed('config', more.config);
  const tok = {};
  ['admin@example.org', 'tutor@example.org', 'pat@example.org', 'sam@example.org', 'yan@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d;
  });
  const as = (who, body) => b.post(Object.assign({ token: (tok[who] || {}).token || '' }, body));
  return { b, tok, as };
}
const PIC = 'data:image/jpeg;base64,QUJD';
const FULL = { action: 'applyTeach', subjects: 'Maths (GCSE), Physics (A level)', qualifications: 'BSc Physics', dbsNumber: '001234567890',
  dbsIssued: '2025-01-10', dbsUpdate: 'TRUE', rightToWork: 'yes', experience: 'Two years', availability: 'm16,m17', area: 'Merton',
  fullName: 'Pat Test', phone: '07000 000001', email: 'pat@example.org', address: '1 Test Street, London', postcode: 'sw19 1aa', dob: '1980-05-01', rate: '30',
  ref1Name: 'Ref One', ref1Relationship: 'Head of department', ref1Email: 'ref1@example.org', ref1Phone: '07000 000002',
  ref2Name: 'Ref Two', ref2Relationship: 'Former employer', ref2Email: 'ref2@example.org', ref2Phone: '07000 000000',
  idDoc: PIC, rtwDoc: PIC, qualDocs: [PIC, PIC], statement: 'I like explaining things.', cvLink: '', consent: 'TRUE' };

/* ---------- 1. RANKS FROM THE CELLS THAT ARE ALREADY THERE ---------- */
{
  const { b } = world();
  const rank = (role, listed) => b.ev('rankOf(' + JSON.stringify({ role, listed: listed || '' }) + ')');
  [['admin', '', 'admin'], ['admin, tutor', '', 'admin'], ['tutor', 'TRUE', 'staff'], ['teacher', '', 'staff'],
   ['tutor, client', 'PENDING', 'client'], ['student, tutor', 'PENDING', 'student'], ['teacher', 'PENDING', 'client'],
   ['client', '', 'client'], ['parent', '', 'client'], ['student, client', '', 'client'], ['student', '', 'student'],
   ['pupil', '', 'student'], ['', '', 'client'], ['head of boxing', '', 'client']].forEach(([role, listed, want]) => {
    rule(rank(role, listed) === want, 'rankOf("' + role + '", listed "' + listed + '") is ' + rank(role, listed) + ', wanted ' + want);
  });
  rule(b.ev("isChild_({ role: 'student, tutor', listed: 'PENDING' })") === true && b.ev("isChild_({ role: 'student, client' })") === false,
    'isChild_ is not rank Student');
}

/* ---------- 2. SIGN-UP: ANYBODY, AS A STUDENT OR A CLIENT ---------- */
{
  const { b, tok } = world();
  const c = b.post({ action: 'register', who: 'parent', first_name: 'Cara', last_name: 'Client', email: 'cara@example.org', pin: NEW_PIN });
  const s = b.post({ action: 'register', who: 'student', first_name: 'Stu', last_name: 'Dent', email: 'stu@example.org', pin: NEW_PIN });
  const row = first => b.ev("JSON.stringify(rankOf(read(TAB.people).rows.find(r => r.first_name === '" + first + "')))");
  rule(c.success && JSON.parse(row('Cara')) === 'client', 'signing up as a client did not make a Client', c);
  rule(s.success && JSON.parse(row('Stu')) === 'student', 'signing up as a student did not make a Student', s);
  rule(tok['pat@example.org'].rank === 'client' && tok['admin@example.org'].rank === 'admin' && tok['tutor@example.org'].rank === 'staff'
    && tok['sam@example.org'].rank === 'student', 'the sign-in reply does not carry each rank',
    ['pat', 'admin', 'tutor', 'sam'].map(k => (tok[k + '@example.org'] || {}).rank));
}

/* ---------- 3. THE TUTOR TICK IS NOT A WAY IN; AN APPLICATION IS ---------- */
{
  const { b, as, tok } = world();
  const tick = as('pat@example.org', { action: 'setMyRoles', roles: ['tutor', 'client'] });
  rule(!tick.success && tick.why === 'apply' && !tick.writes && b.row('P-C1').role === 'client', 'a client ticked themselves Tutor', tick);
  const admin = as('admin@example.org', { action: 'setMyRoles', roles: ['tutor', 'client'] });
  rule(admin.success, 'an admin could not tick their own Tutor', admin);

  const half = as('pat@example.org', Object.assign({}, FULL, { ref2Name: '', consent: '' }));
  rule(!half.success && half.why === 'missing' && /references/.test(half.error) && /consent/.test(half.error) && !half.writes,
    'an application without the second reference and the consent tick was taken', half);
  const noDbs = as('pat@example.org', Object.assign({}, FULL, { dbsNumber: '', dbsNeeded: '' }));
  rule(!noDbs.success && /DBS/.test(noDbs.error), 'an application with neither a DBS nor "I need one" was taken', noDbs);
  const noId = as('pat@example.org', Object.assign({}, FULL, { idDoc: '' }));
  rule(!noId.success && /photo of your ID/.test(noId.error) && !DRIVE.files.length, 'an application without a photo ID was taken (or a file kept)', noId);
  const noUpd = as('pat@example.org', Object.assign({}, FULL, { dbsUpdate: '' }));
  rule(!noUpd.success && /Update Service/.test(noUpd.error), 'a DBS number without the Update Service tick was taken', noUpd);
  const halfRef = as('pat@example.org', Object.assign({}, FULL, { ref2Relationship: '' }));
  rule(!halfRef.success && /relationship/.test(halfRef.error), 'a referee with no relationship was taken', halfRef);
  const noRate = as('pat@example.org', Object.assign({}, FULL, { rate: '' }));
  rule(!noRate.success && /hourly rate/.test(noRate.error), 'an application with no hourly rate was taken', noRate);
  const badCv = as('pat@example.org', Object.assign({}, FULL, { cvLink: 'javascript:alert(1)' }));
  rule(!badCv.success, 'a CV link that is not https was taken', badCv);
  const young = as('yan@example.org', FULL);
  rule(!young.success && /adults/.test(young.error), 'a twelve-year-old (by date of birth) could apply to teach', young);
  const noDob = as('sam@example.org', FULL);
  rule(!noDob.success && noDob.why === 'dob' && !noDob.writes, 'an account with no date of birth could apply to teach (no date of birth is underage, 450)', noDob);
  const staff = as('tutor@example.org', FULL);
  rule(!staff.success && /already/.test(staff.error), 'a tutor already teaching could apply', staff);

  /* NO APPLY_FOLDER SCRIPT PROPERTY: refused, nothing written and nothing kept. */
  {
    const w2 = world({ noFolder: true });
    const r = w2.as('pat@example.org', FULL);
    rule(!r.success && r.why === 'no-folder' && (w2.b.tabs.applications || [[]]).length <= 1 && !DRIVE.files.length, 'an application was taken with no private folder set', r);
  }
  const m0 = MAIL.length;
  const sent = as('pat@example.org', Object.assign({}, FULL, { personId: 'P-S1' }));
  const apps = b.tabs.applications;
  rule(sent.success && sent.application && sent.application.status === 'new', 'a whole application was not taken', sent);
  rule(apps && apps.length === 2 && apps[1][apps[0].indexOf('person_id')] === 'P-C1' && apps[1][apps[0].indexOf('status')] === 'new',
    'the application was not one row under the token\'s person (not the personId the phone sent)', apps && apps.slice(1));
  rule(mailTo('admin@example.org', m0).some(m => /application to teach/i.test(m.subject)), 'the owner was not emailed about the application');
  const cell = k => apps && apps[1] && apps[1][apps[0].indexOf(k)];
  rule(DRIVE.files.length === 4 && !DRIVE.shared, 'the four document photos were not kept, privately, in the folder', DRIVE);
  rule(/^https:\/\/drive\.google\.com\/file\/d\/F1\/view$/.test(cell('id_doc')) && /F2/.test(cell('rtw_doc')) && String(cell('qual_docs')).split(' ').length === 2,
    'the sheet does not hold the documents\' links', [cell('id_doc'), cell('rtw_doc'), cell('qual_docs')]);
  rule(cell('postcode') === 'SW19 1AA' && cell('full_name') === 'Pat Test' && cell('ref1_relationship') === 'Head of department' && cell('ref2_phone') === '07000 000000'
    && String(cell('dbs_update_consent')).toUpperCase() === 'TRUE' && String(cell('rate')) === '30' && !/base64/.test(JSON.stringify(apps[1])), 'the application\'s fields were not each in their column (or a photo was)', apps && [apps[0].slice(22), apps[1].slice(22)]);
  rule(!mailTo('admin@example.org', m0).some(m => /SW19|07000|drive\.google/.test(m.body)), 'the owner\'s email carried the address, a phone or a document link');
  rule(!mailTo('admin@example.org', m0).some(m => /ref1@|001234567890/.test(m.body)), 'the owner\'s email carried a reference or the DBS number');
  const twice = as('pat@example.org', FULL);
  rule(!twice.success && twice.why === 'already', 'a second application while the first waits was taken', twice);

  /* ADMIN ONLY, AT THE GATE. */
  const peek = as('pat@example.org', { action: 'listApplications' });
  rule(!peek.success && !peek.applications, 'a client could list the applications', peek);
  const tutorPeek = as('tutor@example.org', { action: 'listApplications' });
  rule(!tutorPeek.success && !tutorPeek.applications, 'a tutor who is not an admin could list the applications', tutorPeek);
  const asGet = who => JSON.stringify(b.get({ token: (tok[who] || {}).token || '' }));
  rule(['', 'pat@example.org', 'tutor@example.org', 'admin@example.org'].every(w => !/SW19 1AA|Head of department|drive\.google\.com\/file\/d\/F1/.test(asGet(w))),
    'doGet carried an application\'s details to a phone');
  const self = as('pat@example.org', { action: 'decideApplication', id: 'x', status: 'approved' });
  rule(!self.success, 'a client could decide an application', self);
  const list = as('admin@example.org', { action: 'listApplications' });
  const mine = (list.applications || [])[0] || {};
  rule(list.success && list.open === 1 && mine.personId === 'P-C1' && mine.ref1_email === 'ref1@example.org' && /F1/.test(mine.id_doc) && mine.postcode === 'SW19 1AA' && mine.name === 'Pat Test',
    'the admin was not sent the application whole', list);

  /* INTERVIEW, THEN APPROVE: Staff, listed, on the public tutor list, told by email. */
  const m1 = MAIL.length;
  const iv = as('admin@example.org', { action: 'decideApplication', id: mine.id, status: 'interview' });
  rule(iv.success && iv.status === 'interview' && b.ev("rankOf(findPerson('', 'P-C1'))") === 'client', 'Interview did not keep them a client', iv);
  rule(mailTo('pat@example.org', m1).some(m => /talk to you/.test(m.body)), 'the applicant was not emailed about the interview');
  const odd = as('admin@example.org', { action: 'decideApplication', id: mine.id, status: 'hired' });
  rule(!odd.success, 'a status that is not one was written', odd);
  const before = (b.get({}).tutors || []).some(t => t.personId === 'P-C1');
  const yes = as('admin@example.org', { action: 'decideApplication', id: mine.id, status: 'approved' });
  rule(yes.success && yes.rank === 'staff', 'Approve did not make them Staff', yes);
  rule(/tutor/.test(b.row('P-C1').role) && /client/.test(b.row('P-C1').role) && String(b.row('P-C1').listed).toUpperCase() === 'TRUE',
    'Approve did not write tutor (keeping client) and listed', b.row('P-C1'));
  b.ev('clearCache()'); try { b.ev('clearPayloadCache()'); } catch (e) {}
  rule(!before && (b.get({}).tutors || []).some(t => t.personId === 'P-C1'), 'the approved tutor is not on the public tutor list');
  rule(mailTo('pat@example.org', m1).some(m => /approved/.test(m.body)), 'the applicant was not emailed the approval');
  const back = b.post({ action: 'verifyLogin', email: 'pat@example.org', pin: '0000' });
  rule(back.rank === 'staff' && back.application && back.application.status === 'approved', 'signing in again does not say Staff and approved',
    { rank: back.rank, application: back.application });
  const list2 = as('admin@example.org', { action: 'listApplications' });
  rule(list2.open === 0, 'an approved application is still counted open', list2.open);
}

/* ---------- 4. A CHILD'S FORGOTTEN PIN GOES TO THE OWNER; `owner_email` NEVER REACHES A PHONE ---------- */
{
  const { b } = world({ config: [{ key: 'owner_email', value: 'boss@example.org' }] });
  const m0 = MAIL.length;
  const fp = b.post({ action: 'forgotPin', who: 'kit_kind4' });
  rule(fp.success && mailTo('boss@example.org', m0).length === 1 && !mailTo('pat@example.org', m0).length && !mailTo('admin@example.org', m0).length,
    'a child\'s forgotten PIN did not go to owner_email alone', { fp, to: MAIL.slice(m0).map(m => m.to) });
  const m1 = MAIL.length;
  const own = b.post({ action: 'forgotPin', who: 'pat@example.org' });
  rule(own.success && mailTo('pat@example.org', m1).length === 1 && !mailTo('boss@example.org', m1).length, 'an adult\'s own reset left their own inbox', own);
  const vars = ((b.get({}).constants || {}).vars) || {};
  rule(!('owner_email' in vars) && JSON.stringify(b.get({})).indexOf('boss@example.org') === -1, 'owner_email was sent to a phone');
}

/* ---------- 5. THE LIBRARY'S WORDS ARE FOR MEMBERS — signed out, libItems is refused ---------- */
{
  const { b } = world();
  const out = b.post({ action: 'libItems', ids: ['Q-1'] });
  rule(!out.success && !out.items, 'libItems answered somebody signed out', out);
}

if (bad.length) {
  console.log('WRONG (' + bad.length + ')\n  ' + bad.join('\n  '));
  console.log('FAILED — ' + bad.length + ' of ' + asked + '. Ranks, sign-up or applications are not what docs/accounts.md says.');
  process.exit(1);
}
console.log('OK — ' + asked + ' rules: ranks from the old cells, sign-up as Student or Client, Staff only by application and an admin\'s yes, a child\'s PIN to the owner.');
