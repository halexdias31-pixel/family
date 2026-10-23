#!/usr/bin/env node
/* node js/check-profile.js — YOUR SETTINGS, SAVED AND READ BACK, THROUGH THE REAL BACKEND § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

/* THE HARNESS IS `check-gas-load.js` NOW — written here, lifted out when `check-aimark.js` needed the
   same backend in the same scope. One copy, so a service stubbed for one check is stubbed for both. */
const { backend } = require('./check-gas-load.js');

/* ---------- THE PEOPLE -------------------------------------------------------------------------- */
const base = {
  pin: '0000', verified: 'TRUE', listed: true, dbs_checked: true, xp: 10, credits: 5,
  city: 'London', town: 'Mitcham', borough: 'Merton', postcode: 'ZZ1 1ZZ', address: '1 Example Road',
  phone: '+44 7700 900123', date_of_birth: new Date(1990, 2, 4),
  photo: 'https://example.org/p.jpg',
};
const tutor = Object.assign({}, base, {
  person_id: 'P-T1', role: 'tutor', first_name: 'Ada', last_name: 'Tutor',
  handle: 'adatutor', email: 'tutor@example.org',
  headline: 'Friendly maths tutor', video: 'https://example.org/v.mp4', years_experience: 5,
  favourite_colour: 'Blue', adjective_1: 'calm', adjective_2: 'clear', adjective_3: 'kind',
  travel_km: 10, rate_per_hour: 20, extra_seat_rate: 0.5, max_students: 4, min_students: 1,
  age_min: 8, age_max: 16,
  availability: 'm09,m10,tu15,sa11',
});
const admin = Object.assign({}, tutor, { person_id: 'P-A1', role: 'admin', first_name: 'Hal', last_name: 'Admin',
  handle: 'haladmin', email: 'admin@example.org' });
const parent = Object.assign({}, base, { person_id: 'P-C1', role: 'client', first_name: 'Pat', last_name: 'Parent',
  handle: 'patparent', email: 'parent@example.org' });
const student = Object.assign({}, base, { person_id: 'P-S1', role: 'student', first_name: 'Sam', last_name: 'Student',
  handle: 'samstudent', email: 'student@example.org',
  date_of_birth: new Date(2010, 6, 21), exam_small_date: new Date(2027, 4, 14), exam_big_date: new Date(2027, 5, 10) });
const PEOPLE = [admin, tutor, parent, student];
/* ---------- THEIR QUALIFICATIONS AND LIBRARY CARDS, AS ROWS ON TABS OF THEIR OWN § */
const QUAL_ROWS = [];
['P-A1', 'P-T1'].forEach(pid => QUAL_ROWS.push(
  { person_id: pid, subject: 'Maths', level: 'A-Level', institution: 'Edexcel', grade: 'B', completed: '2019', teach: 'TRUE', can_teach: 'FALSE' },
  { person_id: pid, subject: 'Physics', level: 'GCSE', institution: 'AQA', grade: '8', completed: '2017', teach: 'FALSE', can_teach: 'TRUE' },
  { person_id: pid, subject: 'Bible and Theology', level: 'Degree', completed: 'Present', teach: 'FALSE', can_teach: 'FALSE' },
  { person_id: pid, subject: 'PGCE', teach: 'FALSE', can_teach: 'FALSE' },
  { person_id: pid, subject: 'QTS', teach: 'FALSE', can_teach: 'FALSE' }));
const LIB_ROWS = [];
PEOPLE.forEach(p => LIB_ROWS.push(
  { person_id: p.person_id, library: 'Merton', card_number: '12345678', pin: '0000' },
  { person_id: p.person_id, library: 'Sutton Central', card_number: '87654321', pin: '0000' }));

/* ---------- WHAT THE FORM POSTS ------------------------------------------------------------------ */
const BOX = /^(qual_\d+_(teach|spec))$|^(m|tu|w|th|f|sa|su)\d\d$/;
function formOf(list, profile) {
  const names = [];
  list.forEach(f => {
    if (f === 'phone') names.push('phone_cc', 'phone_no');
    else if (f === 'date_of_birth') names.push('dob_d', 'dob_m', 'dob_y');
    else names.push(f);
  });
  const out = {};
  names.forEach(f => {
    const v = profile[f];
    out[f] = BOX.test(f) ? (/^(true|yes|1)$/i.test(String(v)) ? 'TRUE' : 'FALSE')
                         : String(v === undefined || v === null ? '' : v).trim();
  });
  return out;
}
/* One field per page to change, and what the form will show for it after signing in again. */
const CHANGE = [
  ['headline', 'A new headline'], ['town', 'Wimbledon'], ['phone_no', '7700 900999'],
  ['lib1_name', 'Wimbledon'], ['qual_2_received', '2016'], ['rate_per_hour', '26'],
  ['tu16', 'TRUE'], ['exam_small_date', '2027-05-20'], ['first_name', 'Patricia'],
  /* THE PHOTOGRAPH SHELF'S FIRST BOX: a packed cell like the library's, so the change has to go in
     through `photosIn` and come back out through `photosOut` to be read back at all. */
  ['photos_1', 'https://example.org/second.jpg'],
];

const bad = [];
let saves = 0, rounds = 0, shuffles = 0;
const b = backend();
b.seed('people', PEOPLE);
b.seed('qualifications', QUAL_ROWS);
b.seed('library_cards', LIB_ROWS);
const tokens = {};
PEOPLE.forEach(p => {
  const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
  if (!d.success) { bad.push(p.person_id + ': could not sign in — ' + d.error); return; }
  tokens[p.person_id] = d;
});
if (!Object.keys(tokens).length) {
  console.log('Nobody could sign in, so NOTHING was checked — not a pass.');
  process.exit(1);
}

/* 1. THE SIGN-IN REPLY'S PROFILE IS `profileOf_`, EVERY KEY OF IT. */
PEOPLE.forEach(p => {
  const reply = tokens[p.person_id]; if (!reply) return;
  const want = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === ${JSON.stringify(p.person_id)}))`);
  const diff = Object.keys(want).filter(k => JSON.stringify(want[k]) !== JSON.stringify((reply.profile || {})[k]));
  if (diff.length) bad.push(p.person_id + ': the sign-in reply\'s profile is not profileOf_ on ' + diff.length
    + ' key(s) — ' + diff.slice(0, 6).join(', ') + ' — so the settings form opens without them and a Save writes them back');
});

/* 2, 3, 4. EVERY PAGE, EVERY ROLE: a no-change Save succeeds and writes nothing; a change comes back. */
const GROUPS = { admin: 'PROFILE_GROUPS', tutor: 'PROFILE_GROUPS', client: 'CLIENT_GROUPS', student: 'STUDENT_GROUPS' };
PEOPLE.forEach(p => {
  const reply = tokens[p.person_id]; if (!reply) return;
  const groups = b.ev(GROUPS[p.role]);
  Object.keys(groups).forEach(g => {
    const ask = fields => b.post({ action: 'updateProfile', token: tokens[p.person_id].token, name: reply.name,
      personId: p.person_id, target: reply.name, targetId: p.person_id, fields });
    let profile = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === ${JSON.stringify(p.person_id)}))`);
    const same = ask(formOf(groups[g], profile)); saves++;
    if (!same.success) { bad.push(p.person_id + ' · ' + g + ': a Save with nothing changed was refused — ' + same.error); return; }
    if (same.writes) bad.push(p.person_id + ' · ' + g + ': a Save with nothing changed wrote ' + same.writes + ' cell(s)');
    const pick = CHANGE.find(([f]) => formOf(groups[g], profile)[f] !== undefined);
    if (!pick) return;
    const fields = formOf(groups[g], profile); fields[pick[0]] = pick[1];
    const moved = ask(fields); saves++;
    if (!moved.success) { bad.push(p.person_id + ' · ' + g + ': changing ' + pick[0] + ' was refused — ' + moved.error); return; }
    const again = b.post({ action: 'verifyLogin', email: b.row(p.person_id).email, pin: '0000' });
    tokens[p.person_id] = again;
    const got = (again.profile || {})[pick[0]];
    rounds++;
    if (String(got) !== String(pick[1]) && !(pick[1] === 'TRUE' && /^true$/i.test(String(got))))
      bad.push(p.person_id + ' · ' + g + ': ' + pick[0] + ' saved as "' + pick[1] + '" and came back after signing in as "' + got + '"');
  });
});

/* 5. A REFUSED SAVE HAS WRITTEN NOTHING. § */
{
  const reply = tokens['P-A1'];
  const profile = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === 'P-A1'))`);
  const fields = formOf(b.ev('PROFILE_GROUPS')['Contact & address'] || ['email', 'phone', 'date_of_birth'], profile);
  Object.assign(fields, { email: 'parent@example.org', phone_no: '7700 900555', dob_d: '9', dob_m: '9', dob_y: '1999' });
  const d = b.post({ action: 'updateProfile', token: reply.token, name: reply.name, personId: 'P-A1',
    target: reply.name, targetId: 'P-A1', fields });
  if (d.success) bad.push('a Contact Save carrying another account\'s e-mail was accepted');
  else if (d.writes) bad.push('a Contact Save refused ("' + d.error + '") had already written ' + d.writes + ' cell(s)');
}

/* 6. NOBODY SAVES SOMEBODY ELSE'S ROW, and an admin still may. */
{
  const t = tokens['P-T1'];
  const d = b.post({ action: 'updateProfile', token: t.token, name: t.name, personId: 'P-T1',
    target: 'Pat Parent', targetId: 'P-C1', fields: { town: 'Nowhere' } });
  if (d.success || d.writes) bad.push('a tutor saved a parent\'s row');
  const a = tokens['P-A1'];
  const e = b.post({ action: 'updateProfile', token: a.token, name: a.name, personId: 'P-A1',
    target: 'Pat Parent', targetId: 'P-C1', fields: { town: 'Sutton' } });
  if (!e.success) bad.push('an admin could not save a parent\'s row — ' + e.error);
}

/* 7. A NEW PIN KEEPS THE PHONE THAT CHANGED IT SIGNED IN. */
{
  const t = tokens['P-S1'];
  const d = b.post({ action: 'changePin', token: t.token, name: t.name, personId: 'P-S1', currentPin: '0000', newPin: '4826' });
  if (!d.success) bad.push('changePin was refused — ' + d.error);
  else if (!d.token) bad.push('changePin answered with no token, so the phone that changed the PIN is signed out on the server and still looks signed in');
  else {
    const old = b.post({ action: 'myProfile', token: t.token, name: t.name, personId: 'P-S1' });
    if (old.success) bad.push('the session from before the PIN change still works');
    if (old.why !== 'signed-out') bad.push('a dead session is not answered with why: "signed-out", so the phone cannot tell');
    const fresh = b.post({ action: 'myProfile', token: d.token, name: t.name, personId: 'P-S1' });
    if (!fresh.success) bad.push('the token changePin handed back does not work — ' + fresh.error);
  }
}

/* 8. `myProfile` IS YOUR OWN ROW, WHOEVER YOU CLAIM TO BE. */
{
  const t = tokens['P-C1'];
  const d = b.post({ action: 'myProfile', token: t.token, name: 'Hal Admin', personId: 'P-A1' });
  if (!d.success || d.personId !== 'P-C1') bad.push('myProfile answered for ' + d.personId + ' when the token is P-C1');
}

/* 9. THE PAYLOAD A STRANGER GETS DOES NOT DEPEND ON WHO THE URL SAYS THEY ARE. */
{
  const a = tokens['P-A1'];
  b.get({ person: 'P-A1', name: 'Hal Admin', token: a.token });
  const stranger = b.get({ person: 'P-A1', name: 'Hal Admin' });
  if ((stranger.students || []).length) bad.push('a request with the admin\'s id and name in the URL and NO token was served '
    + (stranger.students || []).length + ' student(s) — the cache is keyed on the URL');
}

/* 9. THE BUSINESS RECORDS: § */
{
  const a = tokens['P-A1'], t = tokens['P-T1'];
  const as = (who, body) => b.post(Object.assign({ token: who.token, name: who.name }, body));
  const page = over => [
    Object.assign({ id: 'pub_liability', title: 'Public liability insurance', category: 'Insurance',
      provider: 'Hiscox', reference: 'PL-1', due_on: '2027-03-12' }, over || {}),
    { id: 'prof_indemnity', title: 'Professional indemnity insurance', category: 'Insurance',
      provider: '', reference: '', due_on: '' },
  ];
  const no = as(t, { action: 'listRecords' });
  if (no.success || no.records) bad.push('a tutor was answered listRecords — the business records are an admin\'s');
  if (as(t, { action: 'saveRecordsPage', records: page() }).success) bad.push('a tutor was allowed saveRecordsPage');
  const refused = as(a, { action: 'saveRecordsPage', records: page({ due_on: '2027-13-40' }) });
  if (refused.success) bad.push('a page carrying a date that does not exist was saved');
  else if (refused.writes) bad.push('a refused page had already written ' + refused.writes + ' cell(s)');
  const saved = as(a, { action: 'saveRecordsPage', records: page() });
  if (!saved.success) bad.push('an admin could not save a page of records — ' + saved.error);
  const list = as(a, { action: 'listRecords' });
  const got = (list.records || []).find(r => r.id === 'pub_liability');
  if (!got) bad.push('a saved record did not come back from listRecords by its slug');
  else if (got.due_on !== '2027-03-12' || got.reference !== 'PL-1') bad.push('pub_liability came back as ' + JSON.stringify(got));
  if ((list.records || []).some(r => r.id === 'prof_indemnity')) bad.push('an item left empty was written as a row');
  const again = as(a, { action: 'saveRecordsPage', records: page() });
  if (!again.success || again.writes) bad.push('saving an unchanged page wrote ' + again.writes + ' cell(s)');
  const moved = as(a, { action: 'saveRecordsPage', records: page({ reference: 'PL-2' }) });
  const back = (as(a, { action: 'listRecords' }).records || []).filter(r => r.id === 'pub_liability');
  if (!moved.success || back.length !== 1 || back[0].reference !== 'PL-2')
    bad.push('changing a saved item did not update its one row — ' + JSON.stringify(back));
}

/* 10. NO PRESS FOR A HANDLE (364): it is a template, so `randomiseHandle` is gone and writes nothing. */
{
  const t = tokens['P-T1'];
  const before = b.row('P-T1').handle, w0 = b.log.writes;
  const gone = b.post({ action: 'randomiseHandle', token: t.token, name: t.name, personId: 'P-T1' });
  if (gone.success || b.row('P-T1').handle !== before || b.log.writes !== w0)
    bad.push('randomiseHandle is still an action — ' + JSON.stringify(gone));
  /* AND THE TYPED BOX IS GONE FROM THE SERVER TOO, not only from the phone. */
  const typed = b.post({ action: 'changeHandle', token: tokens['P-T1'].token, name: tokens['P-T1'].name,
    personId: 'P-T1', handle: 'ada_whatever' });
  if (typed.success || typed.writes) bad.push('changeHandle is still an action — a typed handle reached the sheet');
  /* A BIRTHDAY SAVED NEVER MOVES A HANDLE (367): the handle is the year joined, not the day born. */
  const st = tokens['P-A1'], was = b.row('P-S1').handle;
  const dob = b.post({ action: 'updateProfile', token: st.token, name: st.name, personId: 'P-A1',
    target: 'Sam Student', targetId: 'P-S1', fields: { dob_d: '3', dob_m: '4', dob_y: '2011' } });
  if (!dob.success || b.row('P-S1').handle !== was) bad.push('a birthday saved moved the handle — ' + JSON.stringify({ dob, handle: b.row('P-S1').handle }));
}

/* 10. THE AGE RANGE: A YOUNGEST OLDER THAN THE OLDEST IS REFUSED BEFORE ANYTHING IS WRITTEN, so is an age that is not on the list, and a real change comes back. § */
{
  const t = tokens['P-T1'];
  const groups = b.ev('PROFILE_GROUPS');
  const ask = fields => b.post({ action: 'updateProfile', token: tokens['P-T1'].token, name: t.name,
    personId: 'P-T1', target: t.name, targetId: 'P-T1', fields });
  const now = () => b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === 'P-T1'))`);
  if ((groups['About you'] || []).indexOf('age_min') === -1 || (groups['About you'] || []).indexOf('age_max') === -1) {
    bad.push('the age range is not on About you, so a tutor has nowhere to say which ages they teach');
  } else {
    const before = now();
    [[{ age_min: '16', age_max: '8' }, 'the youngest after the oldest'],
     [{ age_min: 'Adults', age_max: '11' }, 'adults only, up to eleven'],
     [{ age_min: '2' }, 'an age that is not on the list'],
     [{ age_max: 'teenagers' }, 'a word that is not on the list']].forEach(([ages, what]) => {
      const fields = Object.assign(formOf(groups['About you'], before), { headline: 'Moved by a refused save' }, ages);
      const d = ask(fields);
      if (d.success) bad.push('About you with ' + what + ' was saved');
      else if (d.writes) bad.push('About you with ' + what + ' was refused ("' + d.error + '") having already written ' + d.writes + ' cell(s)');
    });
    if (now().headline !== before.headline) bad.push('a refused age range moved the headline anyway');
    const fields = Object.assign(formOf(groups['About you'], before), { age_min: '11', age_max: 'Adults' });
    const d = ask(fields);
    if (!d.success) bad.push('a real age range (11 to Adults) was refused — ' + d.error);
    else {
      const again = b.post({ action: 'verifyLogin', email: b.row('P-T1').email, pin: '0000' });
      tokens['P-T1'] = again;
      const pr = again.profile || {};
      if (String(pr.age_min) !== '11' || String(pr.age_max) !== 'Adults')
        bad.push('the age range saved as 11 to Adults came back as "' + pr.age_min + '" to "' + pr.age_max + '"');
      /* AND THE PAYLOAD SAYS IT THE WAY THE CARD READS IT: a number and the word. */
      const pay = b.get({ token: again.token });
      const me = (pay.tutors || []).find(x => x.personId === 'P-T1');
      if (!me) bad.push('the tutor is not in the payload, so the age range could not be read back');
      else if (me.ageMin !== 11 || me.ageMax !== 'Adults')
        bad.push('the payload sends the age range as ' + JSON.stringify(me.ageMin) + ' to ' + JSON.stringify(me.ageMax)
          + ', where the card reads a number and the word "Adults"');
      /* AND THE TWO LISTS THE FORM DRAWS FROM ARE THE ONES THE RULE ASKS ABOUT. */
      const v = pay.validations || {};
      const list = b.ev('AGE_OPTIONS');
      if (JSON.stringify(v.age_min) !== JSON.stringify(list) || JSON.stringify(v.age_max) !== JSON.stringify(list))
        bad.push('validations does not carry AGE_OPTIONS for both ends, so the form offers ages the server refuses');
    }
  }
}

/* 10. WHO IS SENT WHICH FIGURE ON A SESSION, BY THE REAL `doGet`. § */
{
  b.seed('jobs', [{ job_id: 'J-MONEY', status: 'active', subject: 'Maths', level: 'GCSE',
    weekday: 'Tuesday', start_time: '16:00', hours_per_session: 1, venue: 'Online',
    price_total: 270, tutor_pay: 135, admin_profit: 81, max_students: 4, open_to_others: 'FALSE' }]);
  /* NAMES READ OFF THE ROWS AS THEY ARE NOW — the saves above rename the parent, and a roster
     naming somebody who no longer exists is a session nobody is on. */
  const nameOf = pid => { const r = b.row(pid); return (r.first_name + ' ' + r.last_name).trim(); };
  b.seed('events', [
    { event_id: 'E1', at: new Date(2026, 8, 22), job_id: 'J-MONEY', actor: nameOf('P-C1'), role: 'client', action: 'Request' },
    { event_id: 'E2', at: new Date(2026, 8, 23), job_id: 'J-MONEY', actor: nameOf('P-T1'), role: 'tutor', action: 'Request' },
  ]);
  /* AND THE PAYLOAD CACHE, NOT ONLY THE ROW CACHE. § */
  b.ev('clearCache()'); b.ev('clearPayloadCache()');
  const asWho = pid => {
    const t = tokens[pid]; if (!t) return null;
    const d = b.get({ person: pid, name: t.name, token: t.token });
    return (d.liveJobs || d.clientClasses || []).find(j => j.id === 'J-MONEY') || null;
  };
  const has = v => v !== '' && v != null;
  const c = asWho('P-C1'), t = asWho('P-T1'), a = asWho('P-A1');
  if (!c || !t || !a) bad.push('the seeded session did not reach ' + [!c && 'the client', !t && 'the tutor', !a && 'the admin'].filter(Boolean).join(', ') + ' — so who sees which figure was NOT checked');
  else {
    if (Number(c.price) !== 270) bad.push('the client was sent a price of ' + JSON.stringify(c.price) + ', wanted 270');
    if (has(c.tutorPay) || has(c.adminKeeps)) bad.push('the client was sent the split — tutorPay ' + JSON.stringify(c.tutorPay) + ', adminKeeps ' + JSON.stringify(c.adminKeeps));
    if (has(t.price)) bad.push('the tutor was sent the client\'s total, ' + JSON.stringify(t.price));
    if (Number(t.tutorPay) !== 135) bad.push('the tutor was sent tutorPay ' + JSON.stringify(t.tutorPay) + ', wanted 135');
    if (has(t.adminKeeps)) bad.push('the tutor was sent what the admin keeps, ' + JSON.stringify(t.adminKeeps));
    if (Number(a.price) !== 270 || Number(a.tutorPay) !== 135 || Number(a.adminKeeps) !== 81) {
      bad.push('the admin was sent price ' + a.price + ', tutorPay ' + a.tutorPay + ', adminKeeps ' + a.adminKeeps + ' — wanted 270, 135, 81');
    }
  }
}

/* 10. YOUR OWN FAMILY, THROUGH THE REAL `doGet`, AND NOBODY ELSE'S. § */
{
  const f = backend();
  const mk = (id, role, first, last) => Object.assign({}, base, { person_id: id, role, first_name: first,
    last_name: last, full_name: first + ' ' + last, handle: first.toLowerCase() + '_calm' + id.slice(-2),
    username: first.toLowerCase(), email: id.toLowerCase() + '@example.org' });
  f.seed('people', [mk('P-PA', 'client', 'Anna', 'Parent'), mk('P-PB', 'client', 'Bea', 'Parent'),
                    mk('P-SA', 'student', 'Abe', 'Child'), mk('P-SB', 'student', 'Ben', 'Child'),
                    mk('P-SC', 'student', 'Cal', 'Child'), mk('P-AD', 'admin', 'Ada', 'Boss')]);
  /* AND SIBLINGS, ON *"students should be able to see their parents and siblings likewise"*. § */
  f.seed('family', [
    { link_id: 'L1', parent_id: 'P-PA', child_id: 'P-SA', state: 'accepted' },
    { link_id: 'L5', parent_id: 'P-PA', child_id: 'P-SC', state: 'accepted' },
    { link_id: 'L2', parent_id: 'P-PB', child_id: 'P-SB', state: 'accepted' },
    { link_id: 'L3', parent_id: 'P-PB', child_id: 'P-SA', state: 'asked' },
    { link_id: 'L4', parent_id: 'P-PA', child_id: 'P-SB', state: 'refused' },
  ]);
  const tok = id => {
    const d = f.post({ action: 'verifyLogin', email: id.toLowerCase() + '@example.org', pin: '0000' });
    if (!d.success) bad.push('family: ' + id + ' could not sign in — ' + d.error);
    return d;
  };
  const fam = (d, label) => {
    if (!Array.isArray(d.family)) { bad.push('family: ' + label + ' was sent no `family` list at all'); return []; }
    if (d.family.some(x => x.email || x.phone || x.address || x.date_of_birth))
      bad.push('family: ' + label + ' was sent a private field on a family card');
    return d.family.map(x => x.relation + ':' + x.personId).sort().join(',');
  };
  const want = (label, got, exp) => { if (got !== exp) bad.push('family: ' + label + ' was sent [' + got + '] — wanted [' + exp + ']'); };
  /* AND STAMPED WITH WHOSE IT IS — the phone draws nothing whose `familyFor` is not the signed-in id. */
  const stamp = (d, label, exp) => { if (S(d.familyFor) !== exp) bad.push('family: ' + label + ' was stamped familyFor [' + S(d.familyFor) + '] — wanted [' + exp + ']'); return d; };
  const S = v => (v === undefined || v === null) ? '' : String(v);
  const sa = tok('P-SA'), pa = tok('P-PA'), pb = tok('P-PB'), sc = tok('P-SC');
  if (sa.token) want('the student P-SA', fam(stamp(f.get({ person: 'P-SA', name: sa.name, token: sa.token }), 'P-SA', 'P-SA'), 'P-SA'), 'sibling:P-SC');
  if (sc.token) want('the student P-SC', fam(stamp(f.get({ token: sc.token }), 'P-SC', 'P-SC'), 'P-SC'), 'sibling:P-SA');
  if (pa.token) want('the parent P-PA', fam(stamp(f.get({ person: 'P-PA', name: pa.name, token: pa.token }), 'P-PA', 'P-PA'), 'P-PA'), 'child:P-SA,child:P-SC');
  if (pb.token) want('the parent P-PB', fam(stamp(f.get({ person: 'P-PB', name: pb.name, token: pb.token }), 'P-PB', 'P-PB'), 'P-PB'), 'child:P-SB');
  want('a stranger whose URL names P-SA', fam(stamp(f.get({ person: 'P-SA', name: 'Abe Child' }), 'stranger', ''), 'stranger'), '');
  /* ---------- EVERYONE, ON AN ADMIN'S PEOPLE COLUMN, AND ON NOBODY ELSE'S § */
  {
    const ad = tok('P-AD');
    const ev = d => (Array.isArray(d.everyone) ? d.everyone : []).map(x => x.personId).sort().join(',');
    if (ad.token) {
      const d = f.get({ token: ad.token });
      want('the admin\'s `everyone`', ev(d), 'P-PA,P-PB,P-SA,P-SB,P-SC');
      if ((d.everyone || []).some(x => Object.keys(x).some(k => ['personId', 'title', 'handle', 'role', 'image'].indexOf(k) === -1)))
        bad.push('everyone: a field beyond what a card draws was sent — ' + JSON.stringify((d.everyone || [])[0]));
      if ((d.everyone || []).some(x => !x.title || !x.role)) bad.push('everyone: a row was sent with no name or role');
    }
    if (sa.token) want('a student\'s `everyone`', ev(f.get({ token: sa.token })), '');
    if (pa.token) want('a parent\'s `everyone`', ev(f.get({ token: pa.token })), '');
    want('a stranger whose URL names the admin', ev(f.get({ person: 'P-AD', name: 'Ada Boss' })), '');
  }
  /* THE REQUEST THAT BECOMES A LINK goes to the child it names and nobody else: § */
  const claimsOf = d => (Array.isArray(d.claims) ? d.claims : []).map(c => c.from).sort().join(',');
  const sb = tok('P-SB');
  /* BY HER WHOLE NAME (docs/history/342, round 2). § */
  if (sa.token) want('the claims sent to P-SA', claimsOf(f.get({ token: sa.token })), 'Bea Parent');
  if (sb.token) want('the claims sent to P-SB', claimsOf(f.get({ token: sb.token })), '');
  /* A CHILD OF ANOTHER FAMILY, AND AN ASKED LINK: Ben shares no ACCEPTED parent with Abe or Cal. */
  if (sb.token) want('the student P-SB (only an asked and a refused link to the other family)',
    fam(f.get({ token: sb.token }), 'P-SB'), '');
  if (pb.token) want('the claims sent to the parent who asked', claimsOf(f.get({ token: pb.token })), '');
  want('the claims sent to a stranger whose URL names P-SA', claimsOf(f.get({ person: 'P-SA', name: 'Abe Child' })), '');
  /* AND ANSWERING IT IS WHAT MAKES THE FAMILY: yes on L3 puts Bea on Abe's list, and Abe's claims
     empty. Only the child may answer — the parent who asked is refused. */
  if (sa.token && pb.token) {
    const row = ((f.get({ token: sa.token }).claims || [])[0] || {}).rowIndex;
    const byParent = f.post({ action: 'answerClaim', token: pb.token, rowIndex: row, accept: true });
    if (!byParent || !byParent.error) bad.push('family: the parent who asked could answer their own claim');
    const yes = f.post({ action: 'answerClaim', token: sa.token, rowIndex: row, accept: true });
    if (!yes || !yes.success) bad.push('family: P-SA could not accept Bea\'s claim — ' + JSON.stringify(yes));
    const after = f.get({ token: sa.token });
    want('P-SA after saying yes to Bea', fam(after, 'P-SA after yes'), 'sibling:P-SB,sibling:P-SC');
    if (sb.token) want('P-SB after Abe said yes to Bea', fam(f.get({ token: sb.token }), 'P-SB after yes'), 'sibling:P-SA');
    want('the claims left for P-SA after answering', claimsOf(after), '');
  }
}

/* 11. A STUDENT WITH NO EMAIL, THROUGH THE REAL `doPost`. § */
{
  const f = backend();
  const mk = (id, role, first, extra) => Object.assign({}, base, { person_id: id, role, first_name: first,
    last_name: 'Test', handle: first.toLowerCase() + '_calm', email: '' }, extra || {});
  f.seed('people', [mk('P-NP', 'client', 'Pat', { email: 'pat@example.org' }),
                    mk('P-NK', 'student', 'Kit'), mk('P-NL', 'student', 'Lee')]);
  f.seed('family', [{ link_id: 'L1', parent_id: 'P-NP', child_id: 'P-NK', state: 'accepted' }]);
  const inn = f.post({ action: 'verifyLogin', email: 'Kit_Calm', pin: '0000' });
  if (!inn || !inn.success) bad.push('no-email: a child with no address could not sign in by handle — ' + JSON.stringify(inn));
  /* AND A ROW THAT HAS AN ADDRESS ANSWERS TO ITS HANDLE TOO — the reverse of what this said until "have the students be able to login with their handles too"*. § */
  const viaHandle = f.post({ action: 'verifyLogin', email: '@Pat_Calm ', pin: '0000' });
  const viaMail = f.post({ action: 'verifyLogin', email: 'pat@example.org', pin: '0000' });
  if (!viaHandle || !viaHandle.success) bad.push('handle: a row that HAS an address could not sign in by its handle — ' + JSON.stringify(viaHandle));
  else if (!viaMail || !viaMail.success || String(viaHandle.personId) !== String(viaMail.personId) || String(viaHandle.personId) !== 'P-NP')
    bad.push('handle: the handle door and the address door resolved different people — ' + (viaHandle.personId) + ' vs ' + ((viaMail || {}).personId));
  const noSuch = f.post({ action: 'verifyLogin', email: 'nobody_calm', pin: '0000' });
  if (noSuch && noSuch.success) bad.push('handle: a handle nobody has signed somebody in');
  /* A CHILD NOBODY CAN BE WRITTEN FOR IS TOLD SO — it said "a new PIN is on its way … the parent's
     inbox" over an inbox that does not exist. */
  const leeSaid = f.post({ action: 'forgotPin', who: 'lee_calm' });
  if (!leeSaid || leeSaid.success || leeSaid.why !== 'no-inbox')
    bad.push('no-email: forgotPin for a child with no address and no parent did not say nobody could be written to — ' + JSON.stringify(leeSaid));
  const leeStill = f.post({ action: 'verifyLogin', email: 'lee_calm', pin: '0000' });
  if (!leeStill || !leeStill.success) bad.push('no-email: a child with no linked parent had their PIN changed by a stranger');
  const said = f.post({ action: 'forgotPin', who: 'kit_calm' });
  if (!said || !said.success) bad.push('no-email: forgotPin for a linked child did not answer — ' + JSON.stringify(said));
  /* AND THE OLD PIN STILL WORKS — the reverse of what this said until the emailed PIN went BESIDE the old one (`authResetUse_`): § */
  const kitOld = f.post({ action: 'verifyLogin', email: 'kit_calm', pin: '0000' });
  if (!kitOld || !kitOld.success) bad.push('no-email: asking for a new PIN stopped the old one working — anybody who knows the handle can lock the child out');
}

/* 12. A PROFILE PICTURE, THROUGH THE REAL `doPost`. § */
let photos = 0;
{
  const f = backend();
  f.seed('people', PEOPLE);
  f.seed('config', [{ key: 'photos_folder', value: 'https://drive.google.com/drive/folders/FOLDER-photos-0001' }]);
  f.ev(`(function () {
    const made = [];
    globalThis.__MADE = made;
    DriveApp.Access = { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK' };
    DriveApp.Permission = { VIEW: 'VIEW' };
    DriveApp.getFolderById = id => (id === 'FOLDER-photos-0001' ? { createFile: blob => {
      const file = { id: 'FILE' + made.length + '-abcdefghijklmnopqrstu', shared: '', blob,
        setSharing: (a, p) => { file.shared = a + '/' + p; return file; }, getId: () => file.id };
      made.push(file); return file; } } : null);
    Utilities.newBlob = (bytes, type, name) => ({ type, name, size: (bytes || []).length });
  })()`);
  const tk = {};
  ['P-T1', 'P-C1'].forEach(pid => {
    const p = PEOPLE.find(x => x.person_id === pid);
    const d = f.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (d && d.success) tk[pid] = d; else bad.push('photo: ' + pid + ' could not sign in — ' + JSON.stringify(d));
  });
  const JPEG = 'data:image/jpeg;base64,' + Buffer.from('a square face, 600 by 600').toString('base64');
  if (tk['P-T1'] && tk['P-C1']) {
    const parentWas = f.row('P-C1').photo;
    const mine = f.post({ action: 'savePhoto', token: tk['P-T1'].token, name: tk['P-T1'].name,
      personId: 'P-T1', data: JPEG });
    const made = f.ev('__MADE');
    if (!mine || !mine.success) bad.push('photo: a signed-in tutor could not save a picture — ' + JSON.stringify(mine));
    else {
      photos++;
      if (!/^https:\/\/drive\.google\.com\/file\/d\/FILE0-/.test(mine.photo)) bad.push('photo: the reply carried "' + mine.photo + '", not the Drive address of the file it kept');
      if (f.row('P-T1').photo !== mine.photo) bad.push('photo: the reply said ' + mine.photo + ' and the tutor\'s cell holds ' + f.row('P-T1').photo);
      if (!made.length || made[0].shared !== 'ANYONE_WITH_LINK/VIEW') bad.push('photo: the file was kept but not shared by link, so it is a broken square on every other phone');
      if (made.length && !/^photo-P-T1-\d+\.jpg$/.test(made[0].blob.name)) bad.push('photo: the file is called "' + (made[0].blob && made[0].blob.name) + '", wanted photo-P-T1-<time>.jpg');
    }
    /* SOMEBODY ELSE'S ID POSTED: the gate writes `personId` from the token, so the asker's own row. */
    const other = f.post({ action: 'savePhoto', token: tk['P-T1'].token, name: 'Pat Parent', personId: 'P-C1', data: JPEG });
    if (f.row('P-C1').photo !== parentWas) bad.push('photo: a tutor\'s savePhoto naming P-C1 changed the PARENT\'s picture');
    if (!other || !other.success || f.row('P-T1').photo !== other.photo) bad.push('photo: a savePhoto naming somebody else did not land on the asker\'s own row');
    else photos++;
    /* SIGNED OUT: refused, and nothing written — not the cell, and no file in the folder. */
    const files = f.ev('__MADE.length');
    const out = f.post({ action: 'savePhoto', name: 'Ada Tutor', personId: 'P-T1', data: JPEG });
    if (out && out.success) bad.push('photo: savePhoto with no token was allowed');
    else if (out.writes || f.ev('__MADE.length') !== files) bad.push('photo: a refused savePhoto had already written a cell or a file');
    /* NOT A PICTURE: refused by name, nothing kept. A link too — the picker never sends one. */
    [['data:text/html;base64,' + Buffer.from('<b>hi</b>').toString('base64'), 'an HTML file'],
     ['https://example.org/somebody-else.jpg', 'a link'], ['', 'nothing']].forEach(([data, what]) => {
      const was = f.row('P-T1').photo, n = f.ev('__MADE.length');
      const d = f.post({ action: 'savePhoto', token: tk['P-T1'].token, name: tk['P-T1'].name, personId: 'P-T1', data });
      if (d && d.success) bad.push('photo: ' + what + ' was accepted as a profile picture');
      if (f.row('P-T1').photo !== was || f.ev('__MADE.length') !== n) bad.push('photo: refusing ' + what + ' still wrote something');
    });
    /* REMOVE: the cell is blank, so the card draws the initial again. */
    const gone = f.post({ action: 'savePhoto', token: tk['P-C1'].token, name: tk['P-C1'].name, personId: 'P-C1', remove: true });
    if (!gone || !gone.success || f.row('P-C1').photo !== '') bad.push('photo: Remove did not blank the parent\'s picture — ' + JSON.stringify(gone));
    else photos++;
    if (f.row('P-T1').photo === '') bad.push('photo: the parent\'s Remove blanked the TUTOR\'s picture');
  }
  /* AND THE POSTS FOLDER IS THE FALLBACK, so the picker works with no new row in the config tab. */
  if (!/getPostFolder\(\)/.test(String(f.ev('getPhotoFolder_')))) bad.push('photo: getPhotoFolder_ no longer falls back to the posts folder');
}

/* 12b. ONE OF THE ELEVEN, THROUGH THE REAL `doPost` AND `doGet`. § */
let pictures = 0;
{
  const f = backend();
  const kid = Object.assign({}, base, { person_id: 'P-K7', role: 'student', first_name: 'Kit', last_name: 'Kid',
    handle: 'kit_kind07', email: 'kit7@example.org', avatar: 'skin:3|hair:curls|shirt:4',
    photo: 'https://example.org/kit-face.jpg' });
  const pal = Object.assign({}, base, { person_id: 'P-K8', role: 'student', first_name: 'Lou', last_name: 'Pal',
    handle: 'lou_glad08', email: 'lou8@example.org', avatar: '' });
  const mum = Object.assign({}, base, { person_id: 'P-C7', role: 'client', first_name: 'Mo', last_name: 'Kid',
    handle: 'mo_warm07', email: 'mo7@example.org' });
  const ada = Object.assign({}, tutor, { avatar: 'skin:1|hair:long|faceware:glasses' });
  f.seed('people', [admin, ada, parent, kid, pal, mum]);
  f.seed('family', [{ link_id: 'L-K7', parent_id: 'P-C7', child_id: 'P-K7', state: 'accepted' }]);
  f.seed('posts', [{ post_id: 'PO-K7', author: 'Kit Kid', posted_by: 'Kit Kid', image: 'https://example.org/p.jpg',
                     approved: 'APPROVED', active: 'TRUE' }]);
  const tk = {};
  [['P-T1', tutor.email], ['P-K7', kid.email], ['P-K8', pal.email], ['P-C7', mum.email], ['P-A1', admin.email]].forEach(([pid, em]) => {
    const d = f.post({ action: 'verifyLogin', email: em, pin: '0000' });
    if (d && d.success) tk[pid] = d; else bad.push('pictures: ' + pid + ' could not sign in — ' + JSON.stringify(d));
  });
  const choose = (pid, choice) => f.post({ action: 'savePhoto', token: tk[pid].token, name: tk[pid].name, personId: pid, choice });
  const fresh = params => { f.ev('clearCache()'); f.ev('clearPayloadCache()'); return f.get(params); };
  const CHOICES = f.ev('PFP_CHOICES');
  /* THE TWO LISTS ARE ONE LIST. The phone's drawings are read out of js/links.js itself, by name. */
  {
    const src = require('fs').readFileSync(require('path').join(__dirname, 'links.js'), 'utf8');
    const block = (src.match(/const PFP_ART = \{([\s\S]*?)\n\};/) || [])[1] || '';
    const drawn = [...block.matchAll(/^  ([a-z]+): \{ name:/gm)].map(m => m[1]);
    const phone = ['pfp:avatar'].concat(drawn.map(n => 'pfp:' + n));
    if (!Array.isArray(CHOICES) || CHOICES.length !== 11) bad.push('pictures: the backend keeps ' + JSON.stringify(CHOICES) + ', wanted eleven tokens');
    else if (JSON.stringify(phone) !== JSON.stringify(CHOICES)) bad.push('pictures: the phone draws ' + JSON.stringify(phone) + ' and the backend keeps ' + JSON.stringify(CHOICES) + ' — one list, in one order');
  }
  if (tk['P-T1'] && tk['P-K7'] && tk['P-C7'] && tk['P-K8'] && tk['P-A1'] && Array.isArray(CHOICES)) {
    /* EVERY ONE IS KEPT, EXACTLY, AND THE FIGURE RIDES ONLY WITH THE FIGURE. */
    CHOICES.forEach(c => {
      const d = choose('P-T1', c);
      if (!d || !d.success) { bad.push('pictures: the tutor\'s ' + c + ' was refused — ' + JSON.stringify(d)); return; }
      if (d.photo !== c || f.row('P-T1').photo !== c) { bad.push('pictures: ' + c + ' came back "' + d.photo + '" and the cell holds "' + f.row('P-T1').photo + '"'); return; }
      if (c === 'pfp:avatar' ? d.avatar !== ada.avatar : ('avatar' in d)) { bad.push('pictures: the reply to ' + c + ' carried avatar ' + JSON.stringify(d.avatar)); return; }
      pictures++;
    });
    const loud = choose('P-T1', ' PFP:Owl ');
    if (!loud.success || f.row('P-T1').photo !== 'pfp:owl') bad.push('pictures: " PFP:Owl " was not kept as pfp:owl — ' + JSON.stringify(loud) + ' / ' + f.row('P-T1').photo);
    else pictures++;
    /* ANYTHING ELSE, REFUSED WITH THE CELL AS IT WAS. A link at the GRID's door too — it takes a token. */
    [['https://example.org/me.jpg', 'a link at the grid\'s door'], ['pfp:unicorn', 'a picture nobody drew'], ['pfp:', 'an empty token'],
     ['fox', 'a bare name'], ['pfp:fox|pfp:owl', 'two tokens'], ['<svg onload=alert(1)>', 'markup']].forEach(([c, what]) => {
      const was = f.row('P-T1').photo;
      const d = choose('P-T1', c);
      if (d && d.success) bad.push('pictures: ' + what + ' (' + c + ') was kept as a picture');
      else if (f.row('P-T1').photo !== was || d.writes) bad.push('pictures: refusing ' + what + ' still wrote');
      else pictures++;
    });
    const anon = f.post({ action: 'savePhoto', name: 'Ada Tutor', personId: 'P-T1', choice: 'pfp:fox' });
    if (anon && anon.success) bad.push('pictures: a choice with no token was kept');
    /* `updateProfile` — AN ADMIN'S EDITOR, THE OTHER DOOR TO THE CELL: a link, nothing or a token. */
    const ed = photo => f.post({ action: 'updateProfile', token: tk['P-A1'].token, name: tk['P-A1'].name, personId: 'P-A1',
      target: 'Ada Tutor', targetId: 'P-T1', fields: { photo } });
    [['pfp:rocket', true], ['https://example.org/ada-new.jpg', true], ['', true], ['a photo of me smiling', false],
     ['pfp:unicorn', false], ['javascript:alert(1)', false]].forEach(([v, ok]) => {
      const was = f.row('P-T1').photo;
      const d = ed(v);
      if (ok && (!d.success || f.row('P-T1').photo !== v)) bad.push('pictures: the admin\'s editor could not keep "' + v + '" — ' + JSON.stringify(d));
      else if (!ok && (d.success || f.row('P-T1').photo !== was)) bad.push('pictures: the admin\'s editor kept "' + v + '" as somebody\'s face');
      else pictures++;
    });

    /* THE FACE REACHES OTHERS, AND THE FIGURE ONLY WITH THE FIGURE. */
    choose('P-T1', 'pfp:avatar');
    let row = (fresh({}).tutors || []).find(t => t.personId === 'P-T1');
    if (!row || row.image !== 'pfp:avatar' || row.avatar !== ada.avatar) bad.push('pictures: a visitor was sent the tutor as ' + JSON.stringify(row && { image: row.image, avatar: row.avatar }) + ', wanted pfp:avatar and her figure');
    else pictures++;
    choose('P-T1', 'pfp:guitar');
    row = (fresh({}).tutors || []).find(t => t.personId === 'P-T1');
    if (!row || row.image !== 'pfp:guitar' || ('avatar' in row)) bad.push('pictures: after the guitar a visitor was sent ' + JSON.stringify(row && { image: row.image, avatar: row.avatar }) + ' — the figure must not ride with any other face');
    else pictures++;

    /* A CHILD. Before: what every student and a stranger are sent of them. */
    const pupil = () => fresh({ token: tk['P-K8'].token });
    const keysOf = d => JSON.stringify((d.students || []).map(r => Object.keys(r).sort().join(',')));
    const beforeKeys = keysOf(pupil());
    const feedFace = () => ((fresh({}).posts || []).find(p => p.id === 'PO-K7') || {});
    /* A DRESSED CHILD'S PHOTOGRAPH NEVER REACHED THE FEED (the old line sent the wearable string in its
       place) and does not now. */
    const fp = feedFace();
    if (fp.avatar === kid.photo || JSON.stringify(fp).indexOf('kit-face.jpg') !== -1) bad.push('pictures: a dressed child\'s photograph was put on the public feed — ' + JSON.stringify(fp));
    else pictures++;
    const k1 = choose('P-K7', 'pfp:avatar');
    if (!k1.success || k1.avatar !== kid.avatar) bad.push('pictures: the child\'s figure was not kept — ' + JSON.stringify(k1));
    const fam = (fresh({ token: tk['P-C7'].token }).family || []).find(x => x.personId === 'P-K7');
    if (!fam || fam.image !== 'pfp:avatar' || fam.avatar !== kid.avatar) bad.push('pictures: the parent\'s card of the child is ' + JSON.stringify(fam) + ', wanted pfp:avatar with the figure');
    else pictures++;
    const all = (fresh({ token: tk['P-A1'].token }).everyone || []).find(x => x.personId === 'P-K7');
    if (!all || all.image !== 'pfp:avatar' || all.avatar !== kid.avatar) bad.push('pictures: the admin\'s card of the child is ' + JSON.stringify(all) + ', wanted pfp:avatar with the figure');
    else pictures++;
    const afterKeys = keysOf(pupil());
    const pupilBody = JSON.stringify(pupil());
    if (afterKeys !== beforeKeys) bad.push('pictures: the students list every student is sent changed shape when a child chose a picture — ' + beforeKeys + ' became ' + afterKeys);
    else if (/pfp:/.test(JSON.stringify(pupil().students || [])) || pupilBody.indexOf('kit-face.jpg') !== -1) bad.push('pictures: another student was sent the child\'s picture');
    else pictures++;
    const stranger = JSON.stringify(Object.assign({}, fresh({}), { posts: [] }));
    if (stranger.indexOf('kit_kind07') !== -1 || stranger.indexOf('P-K7') !== -1) bad.push('pictures: a stranger was sent something of the child outside the feed');
    else pictures++;
    /* THE FEED: a token always (a fox, or the figure the old line already sent), never the photo. */
    const ff = feedFace();
    if (ff.avatar !== 'pfp:avatar' || ff.figure !== kid.avatar) bad.push('pictures: the child\'s post face is ' + JSON.stringify({ avatar: ff.avatar, figure: ff.figure }) + ', wanted pfp:avatar with the figure');
    else pictures++;
    choose('P-K7', 'pfp:fox');
    const ff2 = feedFace();
    if (ff2.avatar !== 'pfp:fox' || ('figure' in ff2)) bad.push('pictures: after the fox the child\'s post face is ' + JSON.stringify({ avatar: ff2.avatar, figure: ff2.figure }));
    else pictures++;
  }
}
/* 12b, AND A CHILD WITH A SECOND ROLE IS STILL A CHILD. § */
{
  const f = backend();
  const kit = Object.assign({}, base, { person_id: 'P-K9', role: 'student', first_name: 'Kit', last_name: 'Nine',
    handle: 'kit_nine09', email: 'kit9@example.org', avatar: 'skin:3|hair:curls', photo: 'https://example.org/kit9-face.jpg' });
  const kai = Object.assign({}, base, { person_id: 'P-K10', role: 'student, client', first_name: 'Kai', last_name: 'Ten',
    handle: 'kai_ten10', email: 'kai10@example.org', avatar: 'skin:2', photo: 'https://example.org/kai10-face.jpg' });
  const kim = Object.assign({}, base, { person_id: 'P-K11', role: 'student, tutor', first_name: 'Kim', last_name: 'Eleven',
    handle: 'kim_elev11', email: 'kim11@example.org', avatar: '', photo: 'https://example.org/kim11-face.jpg' });
  f.seed('people', [admin, kit, kai, kim]);
  f.seed('posts', [['PO-K9', 'Kit Nine'], ['PO-K10', 'Kai Ten'], ['PO-K11', 'Kim Eleven']].map(([id, a]) => ({ post_id: id, author: a,
    posted_by: a, image: 'https://example.org/p.jpg', approved: 'APPROVED', active: 'TRUE' })));
  const face = id => { f.ev('clearCache()'); f.ev('clearPayloadCache()'); return ((f.get({}).posts || []).find(p => p.id === id) || {}); };
  const lg = f.post({ action: 'verifyLogin', email: kit.email, pin: '0000' });
  const tick = lg && lg.success
    ? f.post({ action: 'setMyRoles', token: lg.token, name: lg.name, personId: 'P-K9', roles: ['student', 'tutor'] }) : null;
  if (!tick || !tick.success || !/tutor/.test(String(f.row('P-K9').role))) {
    bad.push('pictures: the dressed child could not tick Tutor, so the second-role case was NOT asked — ' + JSON.stringify(tick));
  } else {
    const k9 = face('PO-K9');
    if (JSON.stringify(k9).indexOf('kit9-face.jpg') !== -1) bad.push('pictures: a dressed child who ticked Tutor ("' + f.row('P-K9').role + '") was put on the public feed by their photograph — ' + JSON.stringify({ avatar: k9.avatar }));
    else pictures++;
  }
  const k10 = face('PO-K10');
  if (JSON.stringify(k10).indexOf('kai10-face.jpg') !== -1) bad.push('pictures: a dressed child held as "student, client" was put on the public feed by their photograph — ' + JSON.stringify({ avatar: k10.avatar }));
  else pictures++;
  const k11 = face('PO-K11');
  if (k11.avatar !== kim.photo) bad.push('pictures: a child with no figure dressed lost the face the old line sent them — ' + JSON.stringify({ avatar: k11.avatar }) + ', wanted their link');
  else pictures++;
}

/* 13. YOUR ROLES, THROUGH THE REAL `doPost` AND `doGet`. § */
let roleRules = 0;
{
  const f = backend();
  const kid = Object.assign({}, base, { person_id: 'P-K1', role: 'student', first_name: 'Kit', last_name: 'Kid',
    handle: 'kitkid', email: 'kid@example.org', listed: '' });
  const boxer = Object.assign({}, tutor, { person_id: 'P-B1', role: 'tutor, head of boxing', first_name: 'George',
    last_name: 'Boxer', handle: 'georgeboxer', email: 'boxer@example.org' });
  /* `listed` BLANK for the parent, as on every row that predates the column — blank MEANS listed,
     which is exactly why a tick has to write the word rather than leave the cell alone. */
  const pat = Object.assign({}, parent, { listed: '' });
  f.seed('people', [admin, tutor, pat, student, kid, boxer]);
  const future = new Date(); future.setDate(future.getDate() + 30);
  const ddmm = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  /* ADA IS TEACHING A SESSION NEXT MONTH that Pat has paid for; J-OPEN is a job open to any tutor. */
  f.seed('jobs', [{ job_id: 'J-LIVE', status: 'active', session_dates: ddmm(future), venue: 'Online' },
                  { job_id: 'J-OPEN', status: 'unconfirmed', session_dates: ddmm(future), venue: 'Online', stealable: 'TRUE' }]);
  f.seed('events', [
    { event_id: 'E1', job_id: 'J-LIVE', actor: 'Pat Parent', role: 'client', action: 'Request' },
    { event_id: 'E2', job_id: 'J-LIVE', actor: 'Ada Tutor', role: 'tutor', action: 'Accept', target: 'Pat Parent' },
    { event_id: 'E3', job_id: 'J-LIVE', actor: 'Pat Parent', role: 'client', action: 'Confirm' },
    { event_id: 'E4', job_id: 'J-OPEN', actor: 'Sam Student', role: 'client', action: 'Request' }]);
  const tk = {};
  [admin, tutor, pat, student, kid, boxer].forEach(p => {
    const d = f.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (d && d.success) tk[p.person_id] = d; else bad.push('roles: ' + p.person_id + ' could not sign in — ' + JSON.stringify(d));
  });
  const set = (pid, roles, extra) => f.post(Object.assign({ action: 'setMyRoles', token: tk[pid] && tk[pid].token,
    name: tk[pid] && tk[pid].name, personId: pid, roles }, extra || {}));
  const cell = pid => String(f.row(pid).role);
  const rule = (ok, said) => { if (ok) roleRules++; else bad.push('roles: ' + said); };
  if (Object.keys(tk).length === 6) {
    /* THE SIGN-IN REPLY SAYS WHETHER A TUTOR IS WAITING, so the phone's staff test can ask. */
    rule(tk['P-T1'].tutorPending === false, 'the sign-in reply carries no tutorPending:false for an approved tutor');

    /* SIGNED OUT: refused, nothing written. */
    const was = cell('P-C1');
    const out = f.post({ action: 'setMyRoles', name: 'Pat Parent', personId: 'P-C1', roles: ['client', 'student'] });
    rule(!(out && out.success) && !out.writes && cell('P-C1') === was, 'setMyRoles with no token was allowed, or wrote');

    /* OWN ROW ONLY: the tutor's token naming the parent's id changes the TUTOR's row. */
    const pw = cell('P-C1');
    const other = set('P-T1', ['tutor', 'student'], { personId: 'P-C1', name: 'Pat Parent' });
    rule(cell('P-C1') === pw, 'a tutor\'s setMyRoles naming P-C1 changed the PARENT\'s roles');
    rule(other && other.success && cell('P-T1') === 'tutor, student', 'a setMyRoles naming somebody else did not land on the asker\'s own row — '
      + JSON.stringify(other) + ' / ' + cell('P-T1'));

    /* ADMIN CANNOT BE TICKED — not alone, not beside a real role — and nothing is written. */
    const grab = set('P-C1', ['client', 'admin']);
    rule(!(grab && grab.success) && !grab.writes && !/admin/.test(cell('P-C1')), 'a parent ticked themselves Admin — ' + JSON.stringify(grab));
    rule(/given by @family/.test(String(grab && grab.error)), 'refusing Admin did not say it is given rather than chosen — ' + (grab && grab.error));
    /* AND AN ADMIN'S OWN ADMIN SURVIVES, with no approval wait on their own Tutor tick. */
    const ad = set('P-A1', ['client']);
    rule(ad && ad.success && cell('P-A1') === 'admin, client', 'an admin\'s save did not keep admin — ' + cell('P-A1'));
    const ad2 = set('P-A1', ['tutor', 'client']);
    rule(ad2 && ad2.success && !ad2.tutorPending && String(f.row('P-A1').listed) !== 'PENDING', 'an admin\'s own Tutor tick was held for approval');

    /* AT LEAST ONE. */
    const none = set('P-C1', []);
    rule(!(none && none.success) && !none.writes, 'a save with nothing ticked was accepted');

    /* A TITLE IS CARRIED THROUGH. */
    const gb = set('P-B1', ['tutor', 'student']);
    rule(gb && gb.success && cell('P-B1') === 'tutor, student, head of boxing', 'the title was lost — ' + cell('P-B1'));

    /* THE GATE ON TUTOR. Pat ticks it: role and the PENDING word, nothing else. */
    const tick = set('P-C1', ['tutor', 'client']);
    rule(tick && tick.success && tick.tutorPending === true, 'ticking Tutor did not come back pending — ' + JSON.stringify(tick));
    rule(cell('P-C1') === 'tutor, client' && String(f.row('P-C1').listed) === 'PENDING',
      'ticking Tutor wrote role "' + cell('P-C1') + '" and listed "' + f.row('P-C1').listed + '" — wanted tutor, client / PENDING');
    const named = list => (list.tutors || []).find(t => t.personId === 'P-C1');
    rule(!named(f.get({})), 'a pending tutor was sent to an anonymous visitor');
    const asAdmin = named(f.get({ token: tk['P-A1'].token }));
    rule(asAdmin && asAdmin.listed === false && asAdmin.pending === true, 'the admin was not sent the pending tutor, marked pending — '
      + JSON.stringify(asAdmin && { listed: asAdmin.listed, pending: asAdmin.pending }));
    const claim = f.post({ action: 'move', token: tk['P-C1'].token, name: 'Pat Parent', personId: 'P-C1', jobId: 'J-OPEN', role: 'tutor', move: 'Request' });
    rule(!(claim && claim.success), 'a pending tutor took an open session as its tutor');
    rule(!f.ev('read(TAB.events).rows').some(e => e.job_id === 'J-OPEN' && e.actor === 'Pat Parent'), 'a refused claim still wrote an event');
    /* BOOKED BY THE ADMIN: a child does not book (398) — her phone has no price to send. */
    const book = f.post({ action: 'createJob', token: tk['P-A1'].token, name: tk['P-A1'].name, personId: 'P-A1', requestedTutor: 'Pat Parent',
      subject: 'Maths', level: 'GCSE', day: 'Monday', time: '16:00', location: 'Online', dates: ddmm(future), hours: 2, price: 40 });
    rule(!(book && book.success) && /not taking bookings/.test(String(book && book.error)), 'a pending tutor could be booked by name — ' + JSON.stringify(book));
    /* MESSAGING AS WHAT THEY ARE, NOT AS WHAT THEY TICKED: Kit (only a student) ticks Tutor and is still
       a student to the policy — may not write to a tutor. */
    const kt = set('P-K1', ['tutor', 'student']);
    rule(kt && kt.success && kt.tutorPending, 'a student could not ask to tutor — ' + JSON.stringify(kt));
    rule(f.ev("actingRole_(findPerson('P-K1'))") === 'student', 'a pending tutor who is a student acts as ' + f.ev("actingRole_(findPerson('P-K1'))"));
    const msg = f.post({ action: 'sendMessage', token: tk['P-K1'].token, name: 'Kit Kid', personId: 'P-K1', to: 'Ada Tutor', toId: 'P-T1', body: 'hello' });
    rule(!(msg && msg.success), 'a student who ticked Tutor could message a tutor');
    /* THE YES: the admin's Listed switch, and Pat is a tutor everywhere. */
    const yes = f.post({ action: 'setListed', token: tk['P-A1'].token, name: 'Hal Admin', personId: 'P-A1', who: 'Pat Parent', whoId: 'P-C1', on: true });
    rule(yes && yes.success && !f.ev("tutorPending_(findPerson('P-C1'))") && !!named(f.get({})), 'the admin\'s Listed switch did not approve the pending tutor');

    /* A CHILD'S ACCOUNT CANNOT MAKE ITSELF A CLIENT. Kit is a student (with a pending Tutor tick). */
    const kc = set('P-K1', ['client', 'student']);
    rule(!(kc && kc.success) && !kc.writes && !/client/.test(cell('P-K1')), 'a student-only account ticked itself Client — ' + JSON.stringify(kc));

    /* NOTHING DROPPED FROM UNDER A SESSION. Ada teaches J-LIVE next month; Pat pays for it. */
    const adaWas = cell('P-T1');
    const drop = set('P-T1', ['student']);
    rule(!(drop && drop.success) && !drop.writes && cell('P-T1') === adaWas && /1 session as a tutor/.test(String(drop && drop.error)),
      'unticking Tutor under a live session was not refused with the count — ' + JSON.stringify(drop) + ' / ' + cell('P-T1'));
    const pd = set('P-C1', ['tutor']);
    rule(!(pd && pd.success) && /as a client/.test(String(pd && pd.error)), 'unticking Client under a paid session was not refused — ' + JSON.stringify(pd));
    /* …and once the session is over, the same untick goes through. */
    f.ev("(function(){ const t = read(TAB.jobs); setCell(t, t.rows.find(j => j.job_id === 'J-LIVE'), 'status', 'ended'); })()");
    const drop2 = set('P-T1', ['student']);
    rule(drop2 && drop2.success && cell('P-T1') === 'student', 'unticking Tutor after the session ended was still refused — ' + JSON.stringify(drop2));

    /* AND THE ALIASES: a cell typed as `parent` reads as Client and saves as the canonical word. */
    f.ev("(function(){ const t = read(TAB.people); setCell(t, findPerson('P-B1'), 'role', 'parent'); })()");
    rule(JSON.stringify(f.ev("selfRolesOf_(findPerson('P-B1'))")) === '["client"]', 'a `parent` cell does not read as Client');
    const al = set('P-B1', ['client', 'student']);
    rule(al && al.success && cell('P-B1') === 'client, student', 'a `parent` cell saved as "' + cell('P-B1') + '", wanted client, student');
  }
}

/* 14. THE DAYS NOBODY IS TAUGHT, THROUGH THE REAL `doGet`. § */
let closed = 0;
{
  const f = backend();
  const y = new Date().getFullYear();
  f.seed('holidays', [
    { holiday_id: 'H1', name: 'Staff training', date: '05/01/' + (y + 1), year: y + 1, kind: 'inset' },
    { holiday_id: 'H2', name: 'Halloween', date: '31/10/' + y, year: y, kind: 'observance', active: 'TRUE',
      event_name: 'Pumpkin carving', venue: 'Colliers Wood Library', price_per_child: 12 },
    { holiday_id: 'H3', name: "Valentine's Day", date: '14/02/' + (y + 1), year: y + 1, kind: 'observance', active: 'FALSE' },
  ]);
  const got = {};
  (f.get({}).closures || []).forEach(c => { got[c.date] = c; });
  const want = (date, kind, said) => {
    if (got[date] && got[date].kind === kind) closed++;
    else bad.push('closures: ' + said + ' (' + date + ') is ' + (got[date] ? 'sent as ' + got[date].kind : 'not sent'));
  };
  want('25/12/' + y, 'bank', 'Christmas Day this year');
  const ny = new Date(y + 1, 0, 1);
  while (ny.getDay() === 0 || ny.getDay() === 6) ny.setDate(ny.getDate() + 1);
  want('0' + ny.getDate() + '/01/' + (y + 1), 'bank', "next New Year's Day, on the weekday it is kept");
  want('05/01/' + (y + 1), 'inset', 'the INSET day typed on the holidays tab');
  want('31/10/' + y, 'festive', 'the Halloween event the business is running');
  if (got['14/02/' + (y + 1)]) bad.push("closures: Valentine's Day, an observance nobody switched on, closes teaching");
}

/* 15. A BOOKING BY NAME, AGAINST THE TUTOR'S WEEK, THROUGH THE REAL `createJob`. § */
let hoursRules = 0;
{
  const f = backend();
  const nia = Object.assign({}, tutor, { person_id: 'P-T2', first_name: 'Nia', last_name: 'Nohours',
    handle: 'nianohours', email: 'nia@example.org', availability: '' });
  /* THE BOOKER IS A SECOND PARENT, who is on none of these sessions: a child does not book (398). */
  const booker = Object.assign({}, parent, { person_id: 'P-C2', first_name: 'Quinn', last_name: 'Booker',
    handle: 'quinnbooker', email: 'quinn@example.org' });
  f.seed('people', [admin, tutor, parent, student, nia, booker]);
  f.seed('config', [{ key: 'max_open_requests', value: 20 }]);
  const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const mondayAfter = n => { const d = day(n); while (d.getDay() !== 1) d.setDate(d.getDate() + 1); return d; };
  const dmy = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  /* ADA TEACHES MONDAY 09:00 FOR THREE WEEKS FROM NEXT WEEK — her own tick, a live roster. */
  const m1 = mondayAfter(7);
  f.seed('jobs', [{ job_id: 'J-ADA', status: 'active', weekday: 'Monday', start_time: '09:00', hours_per_session: 1,
    subject: 'Maths', venue: 'Online', session_dates: [m1, plus(m1, 7), plus(m1, 14)].map(dmy).join(', ') }]);
  f.seed('events', [
    { event_id: 'E1', job_id: 'J-ADA', actor: 'Pat Parent', role: 'client', action: 'Request' },
    { event_id: 'E2', job_id: 'J-ADA', actor: 'Ada Tutor', role: 'tutor', action: 'Accept', target: 'Pat Parent' }]);
  const tk = f.post({ action: 'verifyLogin', email: booker.email, pin: '0000' });
  const jobs = () => f.ev('read(TAB.jobs).rows.length');
  const ask = (tutorName, extra) => {
    const was = jobs();
    const d = f.post(Object.assign({ action: 'createJob', token: tk.token, name: 'Quinn Booker', personId: 'P-C2',
      requestedTutor: tutorName, subject: 'Maths', level: 'GCSE', location: 'Online', hours: 1, price: 30 }, extra));
    return { d, wrote: jobs() - was };
  };
  const rule = (ok, said) => { if (ok) hoursRules++; else bad.push('tutor hours: ' + said); };
  if (!tk || !tk.success) bad.push('tutor hours: the booking parent could not sign in — ' + JSON.stringify(tk));
  else {
    let r = ask('Nia Nohours', { day: 'Saturday', time: '11:00', slots: 'sa11', dates: dmy(day(40)) });
    rule(!r.d.success && /hasn.t set their hours/.test(String(r.d.error)) && !r.wrote,
      'a tutor with no hours was booked by name, or the refusal wrote a job — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Saturday', time: '11:00', slots: 'sa11', dates: dmy(day(40)) });
    rule(r.d.success && r.wrote === 1, 'Ada could not be booked inside her own week (Saturday 11:00) — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Sunday', time: '10:00', slots: 'su10', dates: dmy(day(40)) });
    rule(!r.d.success && /does not teach at Sunday 10:00/.test(String(r.d.error)) && !r.wrote,
      'an hour outside Ada\'s week was booked, or refused without naming it — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Saturday, Sunday', time: '11:00', slots: 'sa11,su10', dates: dmy(day(47)) });
    rule(!r.d.success && /does not teach at Sunday 10:00/.test(String(r.d.error)) && !r.wrote,
      'a booking whose SECOND day is outside Ada\'s week went through — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Monday', time: '09:00', slots: 'm09', dates: [plus(m1, 7), plus(m1, 14)].map(dmy).join(', ') });
    rule(!r.d.success && /already teaching at Monday 9:00|already teaching at Monday 09:00/.test(String(r.d.error)) && !r.wrote,
      'Monday 09:00 was sold twice in the weeks Ada already teaches it — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Monday', time: '09:00', slots: 'm09', dates: [plus(m1, 70), plus(m1, 77)].map(dmy).join(', ') });
    rule(r.d.success && r.wrote === 1, 'Monday 09:00 after Ada\'s session has ended was refused as busy — ' + JSON.stringify(r.d));
    r = ask('No preference', { day: 'Sunday', time: '10:00', slots: 'su10', dates: dmy(day(40)) });
    rule(r.d.success && r.wrote === 1, 'a booking with no tutor named was refused — ' + JSON.stringify(r.d));
    r = ask('Ada Tutor', { day: 'Sunday', time: '10:00', dates: dmy(day(54)) });
    rule(!r.d.success && /does not teach at Sunday 10:00/.test(String(r.d.error)) && !r.wrote,
      'an older phone sending no slots booked Ada outside her week — ' + JSON.stringify(r.d));
  }
}

/* 16. THE TIMETABLE, KEPT ON THE ACCOUNT, THROUGH THE REAL `doPost`. § */
let timetables = 0;
{
  const f = backend();
  f.seed('people', PEOPLE);
  const tk = {};
  ['P-S1', 'P-C1'].forEach(pid => {
    const p = PEOPLE.find(x => x.person_id === pid);
    const d = f.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (d && d.success) tk[pid] = d; else bad.push('timetable: ' + pid + ' could not sign in — ' + JSON.stringify(d));
  });
  const week = subj => JSON.stringify({ weekend: false, colours: {},
    days: [[{ id: 'L1', at: '09:00', subject: subj, note: '' }], [], [], [], [], [], []] });
  const rule = (ok, said) => { if (ok) timetables++; else bad.push('timetable: ' + said); };
  if (tk['P-S1'] && tk['P-C1']) {
    const parentWas = String(f.row('P-C1').timetable);
    const mine = f.post({ action: 'saveTimetable', token: tk['P-S1'].token, name: tk['P-S1'].name, personId: 'P-S1', timetable: week('Maths') });
    rule(mine && mine.success && /Maths/.test(String(f.row('P-S1').timetable)), 'a student could not keep their timetable — ' + JSON.stringify(mine));
    const other = f.post({ action: 'saveTimetable', token: tk['P-S1'].token, name: 'Pat Parent', personId: 'P-C1', timetable: week('Latin') });
    rule(String(f.row('P-C1').timetable) === parentWas && /Latin/.test(String(f.row('P-S1').timetable)),
      'a saveTimetable naming P-C1 wrote the PARENT\'s cell, or not the asker\'s — ' + JSON.stringify(other));
    const out = f.post({ action: 'saveTimetable', name: 'Sam Student', personId: 'P-S1', timetable: week('Art') });
    rule(!(out && out.success) && !out.writes, 'saveTimetable with no token was allowed, or wrote');
    ['not json', JSON.stringify({ days: [[], []] }), JSON.stringify({ days: 'monday' })].forEach(junk => {
      const was = String(f.row('P-S1').timetable);
      const d = f.post({ action: 'saveTimetable', token: tk['P-S1'].token, name: tk['P-S1'].name, personId: 'P-S1', timetable: junk });
      rule(!(d && d.success) && String(f.row('P-S1').timetable) === was, 'a timetable of the wrong shape (' + junk.slice(0, 20) + ') was kept');
    });
    const again = f.post({ action: 'verifyLogin', email: student.email, pin: '0000' });
    rule(again && /Latin/.test(String(again.timetable)), 'the sign-in reply does not carry the timetable back — ' + String(again && again.timetable));
  }
}

/* 17. A STUDENT'S TWO EXAM DATES REACH THE CALENDAR, ONCE EACH, THROUGH THE REAL `doGet`. § */
let examDates = 0;
{
  const f = backend();
  f.seed('people', PEOPLE);
  f.seed('exams', [{ exam_id: 'X1', person_id: 'P-S1', subject: 'Maths', label: 'Paper 1', exam_date: '10/06/2027', kind: 'exam', active: 'TRUE' }]);
  const tok = pid => f.post({ action: 'verifyLogin', email: PEOPLE.find(p => p.person_id === pid).email, pin: '0000' });
  const s = tok('P-S1'), c = tok('P-C1'), a = tok('P-A1');
  const of = (t, pid) => (f.get({ token: t.token }).exams || []).filter(x => x.personId === pid)
    .map(x => x.date + ' ' + x.kind + ' ' + (x.subject || x.label)).sort().join(', ');
  const rule = (ok, said) => { if (ok) examDates++; else bad.push('exam dates: ' + said); };
  if (s && s.success && c && c.success && a && a.success) {
    const mine = of(s, 'P-S1');
    rule(mine === '10/06/2027 exam Maths, 14/05/2027 mock Small exam',
      'the student\'s own calendar holds [' + mine + '], wanted the tab\'s Maths on 10/06 once and the Small exam on 14/05');
    rule(of(a, 'P-S1') === mine, 'the admin is not sent the student\'s exam dates');
    rule(of(c, 'P-S1') === '', 'a parent who is not the student\'s family was sent their exam dates: ' + of(c, 'P-S1'));
  } else bad.push('exam dates: somebody could not sign in');
}

/* 17b. THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR — AN ADMIN'S, AND BLANK IS NOT NOUGHT (docs/history/345). § */
let cutRules = 0;
{
  const rule = (ok, said) => { if (ok) cutRules++; else bad.push('the cut of an extra seat: ' + said); };
  const t = b.post({ action: 'verifyLogin', email: 'tutor@example.org', pin: '0000' });
  const a = b.post({ action: 'verifyLogin', email: 'admin@example.org', pin: '0000' });
  if (!t.success || !a.success) bad.push('the cut of an extra seat: the tutor or the admin could not sign in, so it was NOT checked');
  else {
    const ask = (who, pid, targetId, cut) => b.post({ action: 'updateProfile', token: who.token, name: who.name, personId: pid,
      target: who.name, targetId, fields: { extra_seat_cut: cut } });
    const cell = pid => b.row(pid).extra_seat_cut;
    const sent = pid => { const r = (b.get({}).tutors || []).find(x => x.personId === pid); return r ? r.extraSeatCut : 'no tutor row'; };
    /* A STAMP FROM LONG AGO, so an admin's edit that stamped it again would show — and long enough ago that the
       tutor's own clock is not what refuses them below. */
    const h = b.tabs.people[0], at = h.indexOf('pricing_changed_at');
    const ri = b.tabs.people.findIndex((x, i) => i > 0 && x[h.indexOf('person_id')] === 'P-T1');
    const OLD = new Date(2020, 0, 2);
    if (at < 0 || ri < 0) bad.push('the cut of an extra seat: no pricing_changed_at column or no tutor row, so the clock was NOT checked');
    else b.tabs.people[ri][at] = OLD;
    const show = pid => JSON.stringify({ cell: cell(pid), sent: sent(pid) });
    rule(cell('P-T1') === '' && sent('P-T1') === '', 'a tutor with no cut of their own is not stored and sent blank: ' + show('P-T1'));
    const t1 = ask(t, 'P-T1', 'P-T1', '0.2');
    rule(!t1.success && /Only @family/.test(String(t1.error)) && !t1.writes && cell('P-T1') === '',
      'a tutor setting their own cut was not refused, or something was written — ' + JSON.stringify(t1) + ' ' + show('P-T1'));
    const t0 = ask(t, 'P-T1', 'P-T1', '0');
    rule(!t0.success && !t0.writes && cell('P-T1') === '', 'a tutor taking the cut from blank to nought was not refused — ' + JSON.stringify(t0));
    const a2 = ask(a, 'P-A1', 'P-T1', '0.2');
    rule(a2.success && Number(cell('P-T1')) === 0.2 && sent('P-T1') === 0.2,
      'an admin setting a tutor\'s cut to 0.2 was refused or did not arrive — ' + (a2.error || show('P-T1')));
    rule(at >= 0 && new Date(b.row('P-T1').pricing_changed_at).getTime() === OLD.getTime(),
      'an admin moving the cut stamped the tutor\'s pricing_changed_at (' + b.row('P-T1').pricing_changed_at + ') — the tutor\'s month started over a number they cannot touch');
    const a0 = ask(a, 'P-A1', 'P-T1', '0');
    rule(a0.success && cell('P-T1') === 0 && sent('P-T1') === 0, 'nought is not stored and sent as nought (no cut) — ' + (a0.error || show('P-T1')));
    const ab = ask(a, 'P-A1', 'P-T1', '');
    rule(ab.success && cell('P-T1') === '' && sent('P-T1') === '', 'blank after nought is not stored and sent as blank (the default) — ' + (ab.error || show('P-T1')));
    [['15', 'pounds typed into a fraction'], ['-1', 'a share below nothing']].forEach(([v, why]) => {
      const r = ask(a, 'P-A1', 'P-T1', v);
      rule(!r.success && !r.writes && cell('P-T1') === '', 'an admin\'s cut of ' + v + ' (' + why + ') was not refused, or was written — ' + JSON.stringify(r) + ' ' + show('P-T1'));
    });
    const own = ask(a, 'P-A1', 'P-A1', '0.15');
    rule(own.success && Number(cell('P-A1')) === 0.15, 'an admin could not set their own cut — ' + (own.error || JSON.stringify(cell('P-A1'))));
    /* THE TUTOR'S OWN RATE PAGE, SAVED WITH NOTHING TOUCHED — every box, the cut among them as it was drawn. */
    ask(a, 'P-A1', 'P-T1', '0.1');
    const prof = b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === 'P-T1'))`);
    const page = formOf(b.ev('PROFILE_GROUPS')['Your rate and group size'] || [], prof);
    const same = b.post({ action: 'updateProfile', token: t.token, name: t.name, personId: 'P-T1', target: t.name, targetId: 'P-T1', fields: page });
    rule('extra_seat_cut' in page && same.success && !same.writes,
      'a tutor\'s no-change Save of the rate page, carrying the cut as drawn, was refused or wrote — ' + (same.error || same.writes + ' cell(s)'));
  }
}

/* 18. THE CARD: WHERE A TUTOR'S FIELDS ARE EDITED NOW, AND WHETHER EVERY ONE IS STILL SAVED (docs/history/330). § */
let cardRules = 0;
{
  const fs = require('fs'), path = require('path'), vm = require('vm');
  let acorn = null;
  try { acorn = require(path.join(__dirname, '..', 'node_modules', 'acorn')); } catch (e) {}
  const meSrc = fs.readFileSync(path.join(__dirname, 'me.js'), 'utf8');
  const want = ['RETIRED_FIELDS_', 'CARD_SECTIONS', 'cardSent_', 'cardSections_', 'cardFields_', 'cardSettingsGroups_',
                'CARD_BOOL_', 'TRUEish_', 'cardSame_', 'CARD_HOUR_', 'CARD_WHOLE_', 'cardChanged_',
                /* docs/history/339: the library cards' fields, which Settings takes off and Tools draws. */
                'isLibraryCard_', 'notLibrary_', 'libFieldsOf_'];
  const got = {};
  if (acorn) {
    acorn.parse(meSrc, { ecmaVersion: 'latest' }).body.forEach(n => {
      if (n.type === 'FunctionDeclaration' && want.indexOf(n.id.name) !== -1) got[n.id.name] = meSrc.slice(n.start, n.end);
      if (n.type === 'VariableDeclaration') n.declarations.forEach(d => {
        if (d.id && want.indexOf(d.id.name) !== -1) got[d.id.name] = 'const ' + meSrc.slice(d.start, d.end) + ';';
      });
    });
  }
  const lost = want.filter(k => !got[k]);
  if (lost.length) bad.push('the card: ' + lost.join(', ') + ' could not be read out of js/me.js — the card was NOT checked');
  else {
    const groups = JSON.parse(JSON.stringify(b.ev('PROFILE_GROUPS')));
    const editable = JSON.parse(JSON.stringify(b.ev('PROFILE_EDITABLE')));
    const phone = vm.createContext({ DATA: { profileFields: groups } });
    vm.runInContext(want.map(k => got[k]).join('\n') + '\nthis.__card = { CARD_SECTIONS, cardFields_, cardSettingsGroups_, cardChanged_, cardSections_, notLibrary_, libFieldsOf_ };', phone);
    const card = phone.__card;
    const rule = (ok, said) => { if (ok) cardRules++; else bad.push('the card: ' + said); };
    const onCard = card.cardFields_();
    const all = Object.keys(groups).reduce((a, g) => a.concat(groups[g]), []).filter(f => f !== 'library_note');
    const named = [].concat(...card.CARD_SECTIONS.map(s => s.fields || []));
    rule(named.every(f => editable.indexOf(f) !== -1), 'it names ' + named.filter(f => editable.indexOf(f) === -1).join(', ') + ', which updateProfile lets nobody write');
    rule(onCard.every(f => editable.indexOf(f) !== -1), 'it draws ' + onCard.filter(f => editable.indexOf(f) === -1).join(', ') + ', which updateProfile lets nobody write');
    /* SESSION LENGTH IS ON THE CARD AND WRITABLE (the review of 330: the brief listed it with the pricing fields, and nobody could write it). § */
    rule(['min_hours', 'max_hours'].every(f => editable.indexOf(f) !== -1 && onCard.indexOf(f) !== -1),
      'session length is ' + (editable.indexOf('min_hours') === -1 ? 'not writable through updateProfile' : 'not on the card') + ' — the card\'s At a glance prints it, and a tutor has to be able to change it there');
    const left = card.cardSettingsGroups_(groups);
    const kept = Object.keys(left).reduce((a, g) => a.concat(left[g]), []);
    const nowhere = all.filter(f => onCard.indexOf(f) === -1 && kept.indexOf(f) === -1);
    rule(!nowhere.length, nowhere.join(', ') + ' is on neither the card nor a Settings page — a field a tutor may write with no box anywhere');
    const twice = onCard.filter(f => kept.indexOf(f) !== -1);
    rule(!twice.length, twice.join(', ') + ' is on the card and on Settings — two places to edit one field');
    const gone = Object.keys(groups).filter(g => !left[g]).sort();
    rule(JSON.stringify(gone) === JSON.stringify(['About you', 'Availability', 'Photos', 'Qualifications', 'Your rate and group size']),
      'the pages Settings stops drawing are ' + JSON.stringify(gone));
    rule(JSON.stringify(Object.keys(left)) === JSON.stringify(['Contact & address', 'Library cards'])
         && left['Contact & address'].indexOf('venues_ok') === -1 && left['Contact & address'].indexOf('email') !== -1,
      'the pages Settings still draws are ' + JSON.stringify(left));

    /* ---------- EVERYBODY'S OWN CARD, SETTINGS AND THE TOOLS COLUMN: EVERY FIELD IN EXACTLY ONE PLACE (docs/history/339) § */
    const libs = JSON.parse(JSON.stringify(b.ev('LIBRARY_FIELDS'))).slice().sort();
    const flat = g => Object.keys(g).reduce((a, k) => a.concat(g[k]), []).filter(f => f !== 'library_note');
    const notLibrary_flat = g => Object.keys(g).reduce((a, k) => a.concat(g[k]), []);
    const maps = { tutor: groups, client: JSON.parse(JSON.stringify(b.ev('CLIENT_GROUPS'))),
                   student: JSON.parse(JSON.stringify(b.ev('STUDENT_GROUPS'))) };
    const whose = [['tutor', false], ['tutor', true], ['client', true], ['student', true]];
    whose.forEach(([role, bare]) => {
      const G = maps[role], all = flat(G);
      const who = role + (role === 'tutor' ? (bare ? ' with no public card' : ' with a public card') : '');
      const secs = card.cardSections_({ own: true, sent: all, bare });
      const onCardOwn = [].concat(...secs.map(x => x.list));
      const kept = notLibrary_flat(card.notLibrary_(card.cardSettingsGroups_(G, onCardOwn)));
      const tools = card.libFieldsOf_(G);
      const nowhere = all.filter(f => onCardOwn.indexOf(f) === -1 && kept.indexOf(f) === -1 && tools.indexOf(f) === -1);
      rule(!nowhere.length, 'a ' + who + ': ' + nowhere.join(', ') + ' is on neither their card, Settings nor Tools');
      const twice = all.filter(f => [onCardOwn, kept, tools].filter(l => l.indexOf(f) !== -1).length > 1);
      rule(!twice.length, 'a ' + who + ': ' + twice.join(', ') + ' is drawn in two places');
      rule(JSON.stringify(tools.slice().sort()) === JSON.stringify(libs) && !kept.some(f => /^lib\d+_/.test(f)),
        'a ' + who + '\'s library cards are ' + JSON.stringify(tools) + ' on Tools and ' + JSON.stringify(kept.filter(f => /^lib\d+_/.test(f))) + ' on Settings — wanted the server\'s fifteen on Tools and none on Settings');
      rule(onCardOwn.every(f => editable.indexOf(f) !== -1), 'a ' + who + '\'s card offers ' + onCardOwn.filter(f => editable.indexOf(f) === -1).join(', ') + ', which updateProfile lets nobody write');
      const ids = secs.map(x => x.id);
      rule(ids.indexOf('figure') === ids.indexOf('picture') + 1 && ids.indexOf('handle') === ids.indexOf('name') + 1 && ids[0] === 'picture',
        'a ' + who + '\'s card offers the sections ' + JSON.stringify(ids) + ' — wanted the figure straight after the picture and the handle straight after the name');
      if (bare) rule(JSON.stringify(ids) === '["picture","figure","name","handle"]', 'a ' + who + '\'s card, which prints only a face and a name, offers ' + JSON.stringify(ids));
    });
    /* SOMEBODY ELSE'S CARD — an admin on a tutor's — offers neither your figure nor your handle. */
    rule(!card.cardSections_().some(x => x.id === 'figure' || x.id === 'handle'), 'a card edited by somebody else offers the figure or the handle');

    /* THE TUTOR'S OWN CARD, THROUGH THE REAL `doPost`. Not the rate: the tutor moved it on a Settings page
       above, so the month's clock is running — which is the point of `cardChanged_` sending only what moved. */
    const t1 = b.post({ action: 'verifyLogin', email: 'tutor@example.org', pin: '0000' });
    const a1 = b.post({ action: 'verifyLogin', email: 'admin@example.org', pin: '0000' });
    const profOf = pid => b.ev(`profileOf_(read(TAB.people).rows.find(r => r.person_id === ${JSON.stringify(pid)}))`);
    const form = (base, change) => {
      const now = {};
      onCard.filter(f => f !== 'photo').forEach(f => { now[f] = String(base[f] == null ? '' : base[f]); });
      Object.keys(now).forEach(f => { if (/^(m|tu|w|th|f|sa|su)\d\d$|_teach$|_spec$/.test(f)) now[f] = /^true$/i.test(now[f]) ? 'TRUE' : 'FALSE'; });
      return Object.assign(now, change);
    };
    if (!t1.success || !a1.success) bad.push('the card: the tutor or the admin could not sign in');
    else {
      const base = profOf('P-T1');
      const fields = card.cardChanged_(base, form(base, { headline: 'Edited on the card', favourite_colour: 'Teal',
        sa14: 'TRUE', photos_2: 'https://example.org/third.jpg', qual_1_grade: 'A*' }));
      const keys = Object.keys(fields);
      rule(keys.filter(k => !/^(m|tu|w|th|f|sa|su)\d\d$|^photos_\d+$|^qual_\d+/.test(k)).sort().join(',') === 'favourite_colour,headline'
           && keys.filter(k => /^(m|tu|w|th|f|sa|su)\d\d$/.test(k)).length === 70 && keys.filter(k => /^photos_\d+$/.test(k)).length === 8
           && keys.filter(k => /^qual_\d+/.test(k)).length === 70,
        'cardChanged_ built ' + keys.length + ' fields — wanted the two plain ones that moved and the three packed cells whole');
      const d = b.post({ action: 'updateProfile', token: t1.token, name: t1.name, personId: 'P-T1', target: t1.name, targetId: 'P-T1', fields });
      rule(d.success, 'the tutor\'s card Save was refused — ' + d.error);
      const back = (b.post({ action: 'verifyLogin', email: 'tutor@example.org', pin: '0000' }).profile) || {};
      rule(back.headline === 'Edited on the card' && back.favourite_colour === 'Teal' && /^true$/i.test(String(back.sa14))
           && /^true$/i.test(String(back.m09)) && back.photos_2 === 'https://example.org/third.jpg' && back.qual_1_grade === 'A*'
           && back.qual_2 === base.qual_2 && back.photos_1 === base.photos_1,
        'the tutor\'s card did not come back as saved: ' + JSON.stringify({ headline: back.headline, sa14: back.sa14, m09: back.m09, photos_2: back.photos_2, qual_1_grade: back.qual_1_grade, qual_2: back.qual_2 }));
      /* HOW LONG A SESSION IS, FROM THE CARD: § */
      const hrs = (ch) => b.post({ action: 'updateProfile', token: t1.token, name: t1.name, personId: 'P-T1', target: t1.name, targetId: 'P-T1',
        fields: card.cardChanged_(profOf('P-T1'), form(profOf('P-T1'), ch)) });
      const h1 = hrs({ min_hours: '2', max_hours: '3' });
      rule(h1.success && String(b.row('P-T1').min_hours) === '2' && String(b.row('P-T1').max_hours) === '3',
        'a tutor\'s session length from the card was not saved — ' + (h1.error || JSON.stringify([b.row('P-T1').min_hours, b.row('P-T1').max_hours])));
      const h2 = hrs({ min_hours: '4', max_hours: '2' });
      rule(!h2.success && /shortest session/.test(String(h2.error)) && String(b.row('P-T1').min_hours) === '2',
        'a shortest session longer than the longest was not refused, or was written — ' + JSON.stringify(h2));
      const h3 = hrs({ max_hours: '1.5' });
      rule(!h3.success && /whole number of hours/.test(String(h3.error)) && String(b.row('P-T1').max_hours) === '3',
        'a session length off the list was not refused, or was written — ' + JSON.stringify(h3));
      const shown = (b.get({}).tutors || []).find(x => x.personId === 'P-T1') || {};
      rule(shown.minHours === 2 && shown.maxHours === 3, 'doGet does not send the saved session length on the card: ' + JSON.stringify([shown.minHours, shown.maxHours]));
      /* AN ADMIN ON THE TUTOR'S CARD: their row, not the admin's, and no profile handed back. */
      const before = JSON.stringify(profOf('P-A1'));
      const e = b.post({ action: 'updateProfile', token: a1.token, name: a1.name, personId: 'P-A1', target: 'Ada Tutor', targetId: 'P-T1',
        fields: card.cardChanged_(profOf('P-T1'), form(profOf('P-T1'), { headline: 'Edited by the admin', rate_per_hour: '31' })) });
      rule(e.success && e.profile === null, 'an admin\'s save of a tutor\'s card was refused or handed back a profile — ' + (e.error || JSON.stringify(e.profile && 'a profile')));
      const row = b.row('P-T1');
      rule(String(row.headline) === 'Edited by the admin' && String(row.rate_per_hour) === '31', 'the admin\'s save did not reach the tutor\'s row: ' + row.headline + ', ' + row.rate_per_hour);
      rule(JSON.stringify(profOf('P-A1')) === before, 'an admin saving a tutor\'s card changed the admin\'s own row');
      /* A TUTOR ON SOMEBODY ELSE'S CARD: refused, and nothing written. */
      const t2 = b.post({ action: 'verifyLogin', email: 'tutor@example.org', pin: '0000' });
      const no = b.post({ action: 'updateProfile', token: t2.token, name: t2.name, personId: 'P-T1', target: 'Hal Admin', targetId: 'P-A1', fields: { headline: 'Not mine' } });
      rule(!no.success && !no.writes, 'a tutor saved the admin\'s card');
      /* `getProfile` FILLS AN ADMIN'S FORM, AND IS NOBODY ELSE'S. */
      const g = b.post({ action: 'getProfile', token: a1.token, name: a1.name, personId: 'P-A1', target: 'P-T1' });
      rule(g.success && g.profile && Object.prototype.hasOwnProperty.call(g.profile, 'phone_cc') && g.profile.headline === 'Edited by the admin',
        'getProfile did not hand the admin the tutor\'s whole form — ' + (g.error || 'no phone_cc'));
      const gt = b.post({ action: 'getProfile', token: t2.token, name: t2.name, personId: 'P-T1', target: 'P-A1' });
      rule(!gt.success && !gt.profile, 'a tutor was handed somebody else\'s form by getProfile');
    }
  }
}

/* 19. PEOPLE MADE, CHANGED AND REMOVED BY AN ADMIN, THROUGH THE REAL `doPost` (373). Anybody else is refused. */
let peopleRules = 0;
{
  const f = backend();
  const mk = (id, role, first, last) => Object.assign({}, base, { person_id: id, role, first_name: first, last_name: last,
    handle: first.toLowerCase() + '_calm', email: id.toLowerCase() + '@example.org' });
  f.seed('people', [mk('P-AD', 'admin', 'Ada', 'Boss'), mk('P-PA', 'client', 'Anna', 'Parent'),
                    mk('P-SA', 'student', 'Abe', 'Child'), mk('P-TU', 'tutor', 'Tia', 'Tutor')]);
  f.seed('family', [{ link_id: 'L1', parent_id: 'P-PA', child_id: 'P-SA', state: 'accepted' }]);
  const rule = (ok, said) => { peopleRules++; if (!ok) bad.push('people: ' + said); };
  const tok = id => f.post({ action: 'verifyLogin', email: id.toLowerCase() + '@example.org', pin: '0000' });
  const ad = tok('P-AD'), pa = tok('P-PA'), tu = tok('P-TU');
  const as = (who, body) => f.post(Object.assign({ token: who.token, personId: who.personId }, body));
  const peopleN = () => f.tabs.people.length, famN = () => f.tabs.family.length;
  if (!ad.success || !pa.success || !tu.success) bad.push('people: a seeded person could not sign in, so the admin rules were NOT checked');
  else {
    /* NOBODY BUT AN ADMIN: each of the three refused, and nothing written. */
    [pa, tu].forEach(w => {
      const n = peopleN();
      rule(!as(w, { action: 'personGet', targetId: 'P-SA' }).success, w.personId + ' was handed a person by personGet');
      rule(!as(w, { action: 'personSave', firstName: 'Zed', lastName: 'Nobody', roles: ['admin'] }).success && peopleN() === n, w.personId + ' made a person');
      rule(!as(w, { action: 'personSave', targetId: 'P-SA', firstName: 'Zed', lastName: 'Child', roles: ['student'] }).success
        && f.row('P-SA').first_name === 'Abe', w.personId + ' changed somebody else');
      rule(!as(w, { action: 'personDelete', targetId: 'P-SA' }).success && peopleN() === n, w.personId + ' deleted a person');
    });
    /* MADE: a template handle, joined today, a fresh PIN that signs them in, their parent linked. */
    const made = as(ad, { action: 'personSave', firstName: 'Nia', lastName: 'Newby', roles: ['student'], dob: '2015-03-02', parentIds: ['P-PA'] });
    const id = made.person && made.person.personId;
    rule(made.success && id && /^na\d{4}$/.test(made.handle) && /^\d{6}$/.test(made.pin), 'adding a person said ' + JSON.stringify(made));
    if (id) {
      const row = f.row(id);
      rule(row.role === 'student' && row.handle === made.handle && String(row.joined_on) !== '', 'the new row is not a student with the handle it was given and a day joined');
      rule(f.post({ action: 'verifyLogin', email: made.handle, pin: made.pin }).success, 'the new person could not sign in with the handle and PIN the admin was shown');
      rule(f.tabs.family.some(r => r.indexOf('P-PA') !== -1 && r.indexOf(id) !== -1), 'the parent ticked was not linked to the new child');
      rule(made.person.title === 'Nia' && made.person.role === 'Student', 'the card sent back is not the one the column draws: ' + JSON.stringify(made.person));
      /* CHANGED: name, email, parents off. The handle does not move with the first name. */
      const got = as(ad, { action: 'personGet', targetId: id });
      rule(got.success && got.person.lastName === 'Newby' && got.person.dob === '2015-03-02' && got.person.parentIds.join() === 'P-PA'
        && got.parents.some(p => p.personId === 'P-PA'), 'personGet did not fill the form: ' + JSON.stringify(got));
      const ed = as(ad, { action: 'personSave', targetId: id, firstName: 'Niamh', lastName: 'Newby', roles: ['student'], email: 'niamh@example.org', parentIds: [] });
      const after = f.row(id);
      rule(ed.success && after.first_name === 'Niamh' && after.handle === made.handle && after.email === 'niamh@example.org', 'editing did not write the name and email, or moved the handle: ' + JSON.stringify(ed));
      rule(!f.tabs.family.some(r => r.indexOf(id) !== -1), 'unticking the parent left the link');
      rule(!as(ad, { action: 'personSave', targetId: id, firstName: 'Niamh', lastName: 'Newby', roles: ['student'], email: 'p-pa@example.org' }).success, 'two people were given one email address');
      /* REMOVED, with every family row naming them. */
      as(ad, { action: 'personSave', targetId: id, firstName: 'Niamh', lastName: 'Newby', roles: ['student'], parentIds: ['P-PA'] });
      const n = peopleN();
      const del = as(ad, { action: 'personDelete', targetId: id });
      rule(del.success && peopleN() === n - 1 && !f.tabs.family.some(r => r.indexOf(id) !== -1), 'deleting did not remove the row and their family links: ' + JSON.stringify(del));
    }
    /* NEVER YOURSELF, NEVER THE LAST ADMIN, AND NEVER YOUR OWN CARD THROUGH HERE. */
    rule(!as(ad, { action: 'personDelete', targetId: 'P-AD' }).success && f.row('P-AD').role === 'admin', 'an admin deleted themselves');
    rule(!as(ad, { action: 'personSave', targetId: 'P-AD', firstName: 'Ada', lastName: 'Boss', roles: ['tutor'] }).success, 'an admin took their own admin away here');
    rule(!as(ad, { action: 'personSave', firstName: 'Abe', lastName: 'Child', roles: ['student'] }).success, 'a second person was made with a name already on the tab');
    const n = famN();
    rule(as(ad, { action: 'personDelete', targetId: 'P-SA' }).success && famN() === n - 1, 'deleting a linked child left their family row');
  }
}

console.log(bad.length ? 'WRONG (' + bad.length + ')' : 'WRONG (0)');
bad.forEach(x => console.log('  ' + x));
console.log('');
console.log('people: ' + PEOPLE.length + '   saves: ' + saves + '   changes read back after signing in again: ' + rounds
  + '   handles randomised: ' + shuffles + '   pictures saved: ' + photos + '   picture-choice rules held: ' + pictures + '   role rules held: ' + roleRules
  + '   closed days sent: ' + closed + '   tutor-hours rules held: ' + hoursRules + '   timetable rules held: ' + timetables
  + '   exam-date rules held: ' + examDates + '   card rules held: ' + cardRules + '   seat-cut rules held: ' + cutRules
  + '   people-admin rules held: ' + peopleRules);
if (bad.length) {
  console.log('FAILED — a Save that does not stick, or writes what nobody asked, is the one on the screen that only exists to change what the sheet holds.');
  process.exit(1);
}
console.log('OK — every settings page saves for every role, writes nothing when nothing changed, and reads back what was saved; every field a tutor edits on their card is one they may write and has exactly one place.');
