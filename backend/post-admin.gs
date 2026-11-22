/* post-admin.gs: doPost's handlers for phone notifications, the inbox, records, errors, staff, the digest and site words (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* checker ticks (1050) */

/* ---------- AN ERROR FROM A PHONE (O5): counted on its row, and its first sighting is one note for Claude ---------- */
function postClientError_(body) { return jsonTry_(() => clientError_(body)); }
function postHealthLog_(body) { return jsonTry_(() => healthLog_(body)); }

/* ONE WRAPPER FOR A HANDLER THAT MAY THROW: its reply as JSON, or the error said after `said`. */
function jsonTry_(run, said) {
  try { return jsonOut(run()); } catch (err) { return jsonOut({ error: S(said) + S(err && err.message || err) }); }
}

/* THE BUSINESS COLUMN'S ERRORS, most recent first (kinds.json `client_error` sheet.list). */
function postListClientErrors_() {
  clearCache();
  return { success: true, errors: read(TAB.client_errors).sheet ? kindList_('client_error') : [] };
}

/* AN APPLICATION'S TEXT, CUT TO SIZE, one key per SCHEMA.applications column. */
function applyFields_(body) {
  const cut = (v, n) => S(v).trim().slice(0, n || APPLICATION_FIELD_MAX);
  const f = {
    subjects: cut(body.subjects, APPLICATION_TEXT_MAX), qualifications: cut(body.qualifications, APPLICATION_TEXT_MAX),
    dbs_number: cut(body.dbsNumber, 40), dbs_issued: cut(body.dbsIssued, 20), dbs_needed: TRUE_(body.dbsNeeded) ? 'TRUE' : 'FALSE',
    dbs_update_consent: TRUE_(body.dbsUpdate) ? 'TRUE' : 'FALSE',
    right_to_work: norm(body.rightToWork) === 'yes' ? 'yes' : norm(body.rightToWork) === 'no' ? 'no' : '',
    experience: cut(body.experience, APPLICATION_TEXT_MAX), availability: cut(body.availability, APPLICATION_TEXT_MAX),
    area: cut(body.area), full_name: cut(body.fullName), phone: cut(body.phone, 40), email: cut(body.email),
    address: cut(body.address, 300), postcode: cut(body.postcode, 12).toUpperCase(), dob: cut(body.dob, 20),
    ref1_name: cut(body.ref1Name), ref1_relationship: cut(body.ref1Relationship), ref1_email: cut(body.ref1Email), ref1_phone: cut(body.ref1Phone, 40),
    ref2_name: cut(body.ref2Name), ref2_relationship: cut(body.ref2Relationship), ref2_email: cut(body.ref2Email), ref2_phone: cut(body.ref2Phone, 40),
    rate: Number(body.rate) > 0 && Number(body.rate) < 1000 ? String(Math.round(Number(body.rate) * 100) / 100) : '',
    statement: cut(body.statement, APPLICATION_TEXT_MAX), cv_link: cut(body.cvLink, 300),
    consent: TRUE_(body.consent) ? 'TRUE' : 'FALSE',
  };
  /* THE OLD ONE-BOX CONTACT COLUMNS stay filled, so a sheet read by eye still has each referee in one cell. */
  f.ref1_contact = [f.ref1_email, f.ref1_phone].filter(Boolean).join(' · ');
  f.ref2_contact = [f.ref2_email, f.ref2_phone].filter(Boolean).join(' · ');
  return f;
}
/* WHAT AN APPLICATION STILL LACKS: kinds.json's `apply-teach` gaps by the site's own formGaps_ (cards-gen.gs), the words the phone said first. */
function applyGaps_(f, body, pics) {
  return formGaps_(FORM_GAPS['apply-teach'], Object.assign({}, body, { qualDocs: pics }));
}
/* ---------- APPLYING TO TEACH (400): Staff only by application and an admin's yes ---------- */
function postApplyTeach_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return refuse_('err-sign-in-first', 'not-signed-in');
  if (rankAtLeast_(me, 'staff')) return jsonOut({ error: 'You teach here already.' });
  /* NO DATE OF BIRTH IS UNDERAGE (450): asked for, rather than refused as a child. */
  if (personAge_(me) === null) return jsonOut({ error: 'Applications to teach are for adults: add your date of birth on You first.', why: 'dob' });
  if (!adultOk_(me)) return jsonOut({ error: 'Applications to teach are for adults (18 and over).' });
  const f = applyFields_(body);
  const pics = [].concat(body.qualDocs || []).filter(x => /^data:image\//i.test(S(x))).slice(0, APPLY_QUAL_DOCS_MAX);
  const missing = applyGaps_(f, body, pics);
  if (missing.length) return jsonOut({ error: 'Please add ' + missing.join(', ') + '. Nothing was sent.', why: 'missing' });
  if (f.cv_link && !/^https:\/\//i.test(f.cv_link)) return jsonOut({ error: 'The CV link must start with https://. Nothing was sent.' });
  /* THE DOCUMENTS GO TO THE PRIVATE FOLDER FIRST: no folder, or a photo too big, and nothing at all is written. */
  const folder = applyFolder_();
  if (!folder) return jsonOut({ error: 'Applications cannot take documents yet — please try again later. Nothing was sent.', why: 'no-folder' });
  const docs = [S(body.idDoc), S(body.rtwDoc)].concat(pics);
  if (docs.some(d => d.length > APPLY_DOC_MAX)) return jsonOut({ error: 'One of the photos is too big — try a smaller one. Nothing was sent.', why: 'big' });
  try {
    const tag = S(me.person_id) + '-' + Date.now();
    f.id_doc = applyKeep_(folder, body.idDoc, tag + '-id');
    f.rtw_doc = applyKeep_(folder, body.rtwDoc, tag + '-right-to-work');
    f.qual_docs = pics.map((d, i) => applyKeep_(folder, d, tag + '-qualification-' + (i + 1))).join(' ');
  } catch (err) {
    return jsonOut({ error: 'The photos could not be kept — please try again. Nothing was sent.', why: 'drive' });
  }
  let out = {};
  const busy = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.applications);
    if (!t.sheet) out = { error: 'Applications are not set up yet — an admin opening the site sets them up.', why: 'no-tab' };
    else if (t.rows.some(x => S(x.person_id) === S(me.person_id) && APPLICATION_OPEN.indexOf(norm(x.status) || 'new') !== -1)) {
      out = { error: 'Your application is already with us — we will be in touch.', why: 'already' };
    } else {
      addRow(t, Object.assign({ application_id: 'A-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        at: new Date(), person_id: S(me.person_id), status: 'new', status_at: '' }, f));
      out = { success: true };
    }
  });
  if (busy) return busy;
  if (!out.success) return jsonOut(out);
  /* THE OWNER IS TOLD — the application itself is read in the Business column, so the mail carries no references or DBS number. */
  const owner = ownerEmail_();
  if (owner) {
    try {
      deliverOrThrow_(null, 'applied', { to: owner, subject: text_('mail-apply-owner-subject'),
        body: text_('mail-apply-owner-body', { who: personDisplayName(me) + (S(me.handle) ? ' (@' + S(me.handle) + ')' : ''), subjects: f.subjects, site: SITE_URL }) });
    } catch (err) { /* a failed courtesy note must not undo the work already done */ }
  }
  return jsonOut({ success: true, application: applicationOf_(me) });
}

/* THE APPLICANTS' PRIVATE FOLDER (Script Property APPLY_FOLDER, never in the repo); unset, one is made unshared and its id kept. Null only when Drive refuses. */
const APPLY_FOLDER_NAME = '@family. applications (private)';
function applyFolder_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const id = S(props.getProperty('APPLY_FOLDER')).trim().replace(/^.*\/folders\//, '').replace(/[?#].*$/, '');
    if (id) return DriveApp.getFolderById(id);
    const made = DriveApp.createFolder(APPLY_FOLDER_NAME);
    props.setProperty('APPLY_FOLDER', made.getId());
    return made;
  } catch (err) { return null; }
}
/* ONE DOCUMENT PHOTO, KEPT PRIVATE: no sharing is set, so its link opens only for whoever the folder is shared with (the admins). */
function applyKeep_(folder, raw, name) {
  const parts = S(raw).split(',');
  const type = ((parts[0] || '').match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const ext = (type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
  const blob = Utilities.newBlob(Utilities.base64Decode(parts[1] || ''), type, name + '.' + ext);
  return driveFileUrl_(folder.createFile(blob).getId());
}

function postListApplications_(body, action, began) {
  clearCache();
  const t = read(TAB.applications);
  if (!t.sheet) return jsonOut({ success: true, open: 0, applications: [], missing: true });
  const people = read(TAB.people).rows, rows = {};
  t.rows.forEach(r => { rows[S(r.application_id)] = r; });
  /* THE APPLICANT'S HANDLE AND NAME, AND EVERY ANSWER COLUMN, beside kinds.json `application` sheet.list. */
  const list = kindList_('application', t.rows).map(o => {
    const r = rows[o.id], p = people.find(x => S(x.person_id) === o.personId);
    o.status = o.status || 'new';
    Object.assign(o, { handle: p ? S(p.handle) : '', name: p ? personDisplayName(p) : '' });
    SCHEMA.applications.slice(5).forEach(k => { o[k] = S(r[k]); });
    return o;
  });
  return ({ success: true, open: list.filter(a => APPLICATION_OPEN.indexOf(a.status) !== -1).length,
                   applications: list.slice(0, REPORTS_LIST_MAX) });
}

/* ---------- A TUTOR'S MONTHLY STATEMENT (405): their own, or — for an admin — any tutor's. Asked of the token's row, never the body's id. */
function postPayStatement_(body, action, began) {
  clearCache();
  const me = findPerson('', S(body.personId));
  if (!me) return refuse_('err-sign-in-again', 'session-gone');
  const admin = whoMay_(me, 'admin');
  const want = S(body.tutorId);
  if (!admin && !rankAtLeast_(me, 'staff')) return jsonOut({ error: 'Statements are for tutors.', why: 'staff' });
  if (!admin && want && want !== S(me.person_id)) return jsonOut({ error: 'You can see only your own statement.', why: 'own' });
  const who = want && admin ? findPerson('', want) : me;
  if (!who || !(hasRole(who, 'tutor') || whoMay_(who, 'admin'))) return jsonOut({ error: 'No tutor with that id.' });
  const st = payStatement_(who, S(body.month));
  if (!st) return jsonOut({ error: 'Which month? Send it as 2026-10.' });
  return jsonOut(Object.assign({ success: true }, st));
}

/* ---------- WHO TEACHES (Staff, and admins holding Tutor; not a waiting applicant), AND WHICH TERMS EACH AGREED TO (405) — admin only. */
function postListStaff_() {
  clearCache();
  return { success: true, staff: kindList_('tutor') };
}

function postDecideApplication_(body, action, began) {
  const status = norm(body.status);
  if (APPLICATION_STATUSES.indexOf(status) < 0 || status === 'new') return jsonOut({ error: 'Not a decision an application can have.' });
  let out = {}, who = null;
  const busy = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.applications);
    const row = t.sheet ? t.rows.find(r => S(r.application_id) && S(r.application_id) === S(body.id)) : null;
    const tp = read(TAB.people);
    who = row ? tp.rows.find(x => S(x.person_id) === S(row.person_id)) : null;
    if (!row) out = { error: 'That application is not there any more.' };
    else if (!who) out = { error: 'The person who applied is not on the people tab any more.' };
    else {
      if (status === 'approved' && !applicationApprove_(tp, who).length) {
        out = { error: 'Their role could not be written — the people tab needs a `role` and a `listed` column. Nothing was changed.' };
      } else {
        setCells(t, row, { status: status, status_at: new Date() });
        out = { success: true, id: S(row.application_id), status: status };
      }
    }
  });
  if (busy) return busy;
  if (!out.success) return jsonOut(out);
  /* THE TUTOR LIST IS IN THE STORED PAYLOAD — `setListed`'s reason. */
  if (status === 'approved') clearCache();
  const said = ['approved', 'interview', 'declined'].indexOf(status) === -1 ? undefined : text_('mail-apply-' + status, { brand: BRAND_NAME });
  if (who && S(who.email) && !addressPending_(who)) {
    try { deliverOrThrow_(null, 'applied', { to: S(who.email), subject: text_('mail-apply-subject'), body: text_('mail-apply-body', { first: S(who.first_name) || '', said: said, site: SITE_URL }) }); out.emailed = true; } catch (err) { /* a failed courtesy note must not undo the work already done */ }
  }
  out.rank = rankOf(who);
  return jsonOut(out);
}

/* ---------- WHAT THE WEEKLY PARENT EMAIL WOULD SAY THIS WEEK § */
function postDigestPreview_(body) {
  return jsonTry_(() => digestPreviewOut_(new Date(), body.words && typeof body.words === 'object' ? body.words : null),
    'The preview could not be built: ');
}

/* ---------- "SEND LAST WEEK" ON A PARENT'S CARD (378): admin only (`PERMISSIONS`), sent whatever weekly_digest says. */
function postDigestSendNow_(body) {
  return jsonTry_(() => {
    const got = digestSendNow_([S(body.targetId)], new Date())[0] || { error: 'No parent was named — nothing was sent.' };
    return got.error ? { error: got.error } : { success: true, said: got.said, sent: got.sent, questions: got.questions || 0 };
  }, 'Nothing was sent: ');
}

/* ---------- "SHOW PIN" ON A PERSON'S CARD (452): the gate already wanted an admin; asked again of the token's row by rank. */
function postPinShow_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return refuse_('err-not-authorised', 'not-allowed');
  const who = S(body.targetId) ? findPerson('', S(body.targetId)) : null;
  if (!who || key(who.person_id) !== key(body.targetId)) return jsonOut({ error: 'Nobody by that id is on the people tab.' });
  /* A CELL THE SHEET MADE A NUMBER lost its leading zeros (`authPinLost_`); four digits are put back. */
  const pin = typeof who.pin === 'number' ? String(who.pin).padStart(4, '0') : S(who.pin);
  return jsonOut(pin ? { success: true, pin } : { success: true, pin: '', said: 'No PIN' });
}

/* ---------- EDIT WORDS IN PLACE (497): `set: {key: text}` and `reset: [key]` merged into config's one `words` row ---------- */
function postWordsSave_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return refuse_('err-not-authorised', 'not-allowed');
  const t = read(TAB.config);
  if (!t.sheet) return jsonOut({ error: 'There is no config tab to keep the words on.' });
  const row = t.rows.find(r => norm(r.key) === WORDS_KEY);
  const now = wordsClean_(row ? row.value : '');
  const set = wordsClean_(body.set && typeof body.set === 'object' ? body.set : {});
  Object.keys(set).forEach(k => { now[k] = set[k]; });
  (Array.isArray(body.reset) ? body.reset : []).forEach(k => { delete now[S(k)]; });
  const value = JSON.stringify(now);
  if (value.length > WORDS_MAX) return jsonOut({ error: 'Too many words to keep. Reset some first.' });
  if (row) setCell(t, row, 'value', value);
  else addRow(t, { key: WORDS_KEY, value: value, what_it_does: 'The site\'s words an admin typed in place over the code\'s (497), {card|slot: text}. Empty: the code\'s own words.' });
  clearCache();
  return jsonOut({ success: true, words: now });
}


/* A PERSON FACT (kinds.json person.facts): admin only by PERMISSIONS; one row appended, `what` from PERSON_FACT_KEYS, as_of today unless given. */
function postFactSet_(body, action, began) {
  const who = S(body.who).trim(), what = S(body.what).trim(), value = S(body.value).trim();
  if (!who || !findPerson(who)) return refuse_('err-no-such-person', 'not-found');
  if (PERSON_FACT_KEYS.indexOf(what) < 0) return jsonOut({ error: 'Not a fact this site keeps: ' + what });
  if (!value) return jsonOut({ error: 'A fact needs a value.' });
  const asOf = /^\d{4}-\d{2}-\d{2}$/.test(S(body.as_of)) ? S(body.as_of) : isoDate_(new Date());
  addRow(read(TAB.facts), { who: who, what: what, value: value, as_of: asOf });
  return jsonOut({ ok: true, fact: { who: who, what: what, value: value, as_of: asOf } });
}
