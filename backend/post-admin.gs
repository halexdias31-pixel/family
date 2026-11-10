/* post-admin.gs: doPost's handlers for phone notifications, the inbox, records, errors, staff, the digest and site words (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* PHONE NOTIFICATIONS (492): the card's four actions, all in push.gs. */
function postPushState_(body, action, began) {
  return jsonOut(pushAction_(action, body));
}

/* THE EMAIL WIDGET (493): the owner's Gmail, read-only, admin only (gated twice), never kept — inbox.gs. */
function postInboxList_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
  return jsonOut(inboxList_(body));
}

/* --- admin: everyone ---------------------------------------------------------------------- */
/* THE BUSINESS RECORDS — admin only by `ACTION_ACCESS`, and read by a POST rather than sent in
   the payload, because the payload is cached and goes to every visitor. See records.gs. */
function postListRecords_(body, action, began) {
  return jsonOut(recordsAction_(action, body));
}

function postListBizChecks_(body, action, began) {
  return jsonOut(bizChecksAction_(action, body));
}

/* checker ticks (1050), owner's inbox (1060) */
function postListOwnerAnswers_(body, action, began) {
  return jsonOut(ownerAnswersAction_(action, body));
}

/* ---------- AN ERROR FROM A PHONE (O5): counted on its row, and its first sighting is one note for Claude ---------- */
function postClientError_(body, action, began) {
  try { return jsonOut(clientError_(body)); } catch (err) { return jsonOut({ error: S(err && err.message || err) }); }
}

function postHealthLog_(body, action, began) {
  try { return jsonOut(healthLog_(body)); } catch (err) { return jsonOut({ error: S(err && err.message || err) }); }
}

function postListClientErrors_(body, action, began) {
  clearCache();
  return jsonOut({ success: true, errors: clientErrorsList_() });
}

/* ---------- APPLYING TO TEACH (400): Staff only by application and an admin's yes ---------- */
function postApplyTeach_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ error: 'Sign in first.' });
  if (rankAtLeast_(me, 'staff')) return jsonOut({ error: 'You teach here already.' });
  /* NO DATE OF BIRTH IS UNDERAGE (450): asked for, rather than refused as a child. */
  if (personAge_(me) === null) return jsonOut({ error: 'Applications to teach are for adults: add your date of birth on You first.', why: 'dob' });
  if (!adultOk_(me)) return jsonOut({ error: 'Applications to teach are for adults (18 and over).' });
  const cut = (v, n) => S(v).trim().slice(0, n || APPLICATION_FIELD_MAX);
  const f = {
    subjects: cut(body.subjects, APPLICATION_TEXT_MAX), qualifications: cut(body.qualifications, APPLICATION_TEXT_MAX),
    dbs_number: cut(body.dbsNumber, 40), dbs_issued: cut(body.dbsIssued, 20), dbs_needed: TRUE_(body.dbsNeeded) ? 'TRUE' : 'FALSE',
    right_to_work: norm(body.rightToWork) === 'yes' ? 'yes' : norm(body.rightToWork) === 'no' ? 'no' : '',
    experience: cut(body.experience, APPLICATION_TEXT_MAX), availability: cut(body.availability, APPLICATION_TEXT_MAX),
    area: cut(body.area), ref1_name: cut(body.ref1Name), ref1_contact: cut(body.ref1Contact),
    ref2_name: cut(body.ref2Name), ref2_contact: cut(body.ref2Contact),
    statement: cut(body.statement, APPLICATION_TEXT_MAX), cv_link: cut(body.cvLink, 300),
    consent: TRUE_(body.consent) ? 'TRUE' : 'FALSE',
  };
  const missing = [];
  if (!f.subjects) missing.push('the subjects and levels you teach');
  if (!f.right_to_work) missing.push('whether you have the right to work in the UK');
  if (f.dbs_needed !== 'TRUE' && !(f.dbs_number && f.dbs_issued)) missing.push('your DBS number and issue date, or "I need one"');
  if (!(f.ref1_name && f.ref1_contact && f.ref2_name && f.ref2_contact)) missing.push('two references, each with a name and a contact');
  if (!f.statement) missing.push('a short statement');
  if (f.consent !== 'TRUE') missing.push('the consent tick');
  if (missing.length) return jsonOut({ error: 'Please add ' + missing.join(', ') + '. Nothing was sent.', why: 'missing' });
  if (f.cv_link && !/^https:\/\//i.test(f.cv_link)) return jsonOut({ error: 'The CV link must start with https://. Nothing was sent.' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — try again in a moment.', why: 'busy' });
  let out = {};
  try {
    clearCache();
    const t = read(TAB.applications);
    if (!t.sheet) out = { error: 'Applications are not set up yet — an admin opening the site sets them up.', why: 'no-tab' };
    else if (t.rows.some(x => S(x.person_id) === S(me.person_id) && APPLICATION_OPEN.indexOf(norm(x.status) || 'new') !== -1)) {
      out = { error: 'Your application is already with us — we will be in touch.', why: 'already' };
    } else {
      addRow(t, Object.assign({ application_id: 'A-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        at: new Date(), person_id: S(me.person_id), handle: S(me.handle), status: 'new', status_at: '' }, f));
      out = { success: true };
    }
  } finally {
    lock.releaseLock();
  }
  if (!out.success) return jsonOut(out);
  /* THE OWNER IS TOLD — the application itself is read in the Business column, so the mail carries no references or DBS number. */
  const owner = ownerEmail_();
  if (owner) {
    try {
      mailOut_({ to: owner, name: BRAND_NAME, subject: 'A new application to teach',
        body: personDisplayName(me) + (S(me.handle) ? ' (@' + S(me.handle) + ')' : '') + ' has applied to teach: '
            + f.subjects + '.\n\nRead it and say yes, interview or no in the Business column:\n\n' + SITE_URL + '\n' });
    } catch (err) {}
  }
  return jsonOut({ success: true, application: applicationOf_(me) });
}

function postListApplications_(body, action, began) {
  clearCache();
  const t = read(TAB.applications);
  if (!t.sheet) return jsonOut({ success: true, open: 0, applications: [], missing: true });
  const people = read(TAB.people).rows;
  const list = t.rows.map(r => {
    const p = people.find(x => S(x.person_id) === S(r.person_id));
    const o = { id: S(r.application_id), at: appMs_(r.at), status: norm(r.status) || 'new', statusAt: appMs_(r.status_at),
                personId: S(r.person_id), handle: S(r.handle), name: p ? personDisplayName(p) : S(r.handle) };
    SCHEMA.applications.slice(6).forEach(k => { o[k] = S(r[k]); });
    return o;
  }).sort((a, b) => b.at - a.at);
  return jsonOut({ success: true, open: list.filter(a => APPLICATION_OPEN.indexOf(a.status) !== -1).length,
                   applications: list.slice(0, REPORTS_LIST_MAX) });
}

/* ---------- A TUTOR'S MONTHLY STATEMENT (405): their own, or — for an admin — any tutor's. Asked of the token's row, never the body's id. */
function postPayStatement_(body, action, began) {
  clearCache();
  const me = findPerson('', S(body.personId));
  if (!me) return jsonOut({ error: 'Please sign in again.' });
  const admin = hasRole(me, 'admin');
  const want = S(body.tutorId);
  if (!admin && !rankAtLeast_(me, 'staff')) return jsonOut({ error: 'Statements are for tutors.', why: 'staff' });
  if (!admin && want && want !== S(me.person_id)) return jsonOut({ error: 'You can see only your own statement.', why: 'own' });
  const who = want && admin ? findPerson('', want) : me;
  if (!who || !(hasRole(who, 'tutor') || hasRole(who, 'admin'))) return jsonOut({ error: 'No tutor with that id.' });
  const st = payStatement_(who, S(body.month));
  if (!st) return jsonOut({ error: 'Which month? Send it as 2026-10.' });
  return jsonOut(Object.assign({ success: true }, st));
}

/* ---------- WHO TEACHES (Staff, and admins holding Tutor; not a waiting applicant), AND WHICH TERMS EACH AGREED TO (405) — admin only. */
function postListStaff_(body, action, began) {
  clearCache();
  const staff = read(TAB.people).rows.filter(r => hasRole(r, 'tutor') && rankAtLeast_(r, 'staff') && personDisplayName(r))
    .map(r => ({ personId: S(r.person_id), name: personDisplayName(r), handle: S(r.handle), rank: rankOf(r),
                 termsVersion: S(r.agreement_version), termsAt: r.agreement_signed_at instanceof Date ? fmtDateTime(r.agreement_signed_at) : S(r.agreement_signed_at),
                 dbsCheckedOn: isoDate_(r.dbs_checked_on), dbsNumber: S(r.dbs_number) }));
  return jsonOut({ success: true, staff: staff });
}

/* "CHECKED TODAY" ON A TUTOR'S DBS (10 Nov): the admin ran the online check; the date restarts the 12 months. */
function postTutorDbsChecked_(body, action, began) {
  const t = read(TAB.people);
  const r = t.rows.find(x => S(x.person_id) && S(x.person_id) === S(body.tutorId));
  if (!r) return jsonOut({ error: 'No tutor with that id.' });
  const on = Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd');
  if (!setCell(t, r, 'dbs_checked_on', on)) return jsonOut({ error: 'The people tab has no dbs_checked_on column yet: open the /exec address with ?setup=1 once.' });
  setCell(t, r, 'dbs_checked', 'TRUE');
  clearCache();
  return jsonOut({ success: true, personId: S(r.person_id), dbsCheckedOn: on });
}

function postDecideApplication_(body, action, began) {
  const status = norm(body.status);
  if (APPLICATION_STATUSES.indexOf(status) < 0 || status === 'new') return jsonOut({ error: 'Not a decision an application can have.' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — try again in a moment.', why: 'busy' });
  let out = {}, who = null;
  try {
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
  } finally {
    lock.releaseLock();
  }
  if (!out.success) return jsonOut(out);
  /* THE TUTOR LIST IS IN THE STORED PAYLOAD — `setListed`'s reason. */
  if (status === 'approved') clearCache();
  const said = { approved: 'Good news — your application to teach with ' + BRAND_NAME + ' has been approved. You are listed as a tutor now: sign in to fill in your card.',
                 interview: 'Thank you for applying to teach with ' + BRAND_NAME + '. We would like to talk to you — we will be in touch to arrange a time.',
                 declined: 'Thank you for applying to teach with ' + BRAND_NAME + '. We are not able to take your application further this time.' }[status];
  if (who && S(who.email) && !addressPending_(who)) {
    try { mailOut_({ to: S(who.email), name: BRAND_NAME, subject: 'Your application to teach', body: 'Hello ' + (S(who.first_name) || '') + ',\n\n' + said + '\n\n' + SITE_URL + '\n' }); out.emailed = true; } catch (err) {}
  }
  out.rank = rankOf(who);
  return jsonOut(out);
}

/* ---------- WHAT THE WEEKLY PARENT EMAIL WOULD SAY THIS WEEK § */
function postDigestPreview_(body, action, began) {
  try {
    return jsonOut(digestPreviewOut_(new Date(), body.words && typeof body.words === 'object' ? body.words : null));
  } catch (err) {
    return jsonOut({ error: 'The preview could not be built: ' + S(err && err.message || err) });
  }
}

/* ---------- "SEND LAST WEEK" ON A PARENT'S CARD (378): admin only (`ACTION_ACCESS`), sent whatever weekly_digest says. */
function postDigestSendNow_(body, action, began) {
  try {
    const got = digestSendNow_([S(body.targetId)], new Date())[0] || { error: 'No parent was named — nothing was sent.' };
    return jsonOut(got.error ? { error: got.error } : { success: true, said: got.said, sent: got.sent, questions: got.questions || 0 });
  } catch (err) {
    return jsonOut({ error: 'Nothing was sent: ' + S(err && err.message || err) });
  }
}

/* ---------- "SHOW PIN" ON A PERSON'S CARD (452): the gate already wanted an admin; asked again of the token's row by rank. */
function postPinShow_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
  const who = S(body.targetId) ? findPerson('', S(body.targetId)) : null;
  if (!who || key(who.person_id) !== key(body.targetId)) return jsonOut({ error: 'Nobody by that id is on the people tab.' });
  /* A CELL THE SHEET MADE A NUMBER lost its leading zeros (`authPinLost_`); four digits are put back. */
  const pin = typeof who.pin === 'number' ? String(who.pin).padStart(4, '0') : S(who.pin);
  return jsonOut(pin ? { success: true, pin } : { success: true, pin: '', said: 'No PIN' });
}

/* ---------- THE ADMIN'S LAYOUT (462, 463): the site-wide order of widgets, one `layout` row on config ---------- */
/* NO RESET (477): the layout an admin makes is THE layout; nothing empties it. */
function postLayoutSave_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
  const raw = body.layout;
  if (typeof raw === 'string' && raw.length > LAYOUT_MAX) return jsonOut({ error: 'That layout is too big to keep.' });
  const clean = layoutClean_(raw);
  if (!clean) return jsonOut({ error: 'That layout could not be read. Nothing was saved.' });
  const value = JSON.stringify(clean);
  const t = read(TAB.config);
  if (!t.sheet) return jsonOut({ error: 'There is no config tab to keep the layout on.' });
  const row = t.rows.find(r => norm(r.key) === LAYOUT_KEY);
  if (row) setCell(t, row, 'value', value);
  else addRow(t, { key: LAYOUT_KEY, value: value, what_it_does: 'The site-wide order of widgets and which are deleted, set by each widget\'s admin tiles (462, 463). Empty: the code\'s own order.' });
  clearCache();
  return jsonOut({ success: true, layout: clean });
}

/* ---------- THE RULES CARD (496): one rule set Exception or Universal, or the last change undone; locked rules refused ---------- */
function postRulesSave_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
  const t = read(TAB.config);
  if (!t.sheet) return jsonOut({ error: 'There is no config tab to keep the rules on.' });
  const row = t.rows.find(r => norm(r.key) === RULES_KEY);
  const now = rulesClean_(row ? row.value : '') || { set: {}, hist: [] };
  const is = id => now.set[id] === 'universal' ? 'universal' : 'exception';
  if (body.undo) {
    const last = now.hist.pop();
    if (!last) return jsonOut({ error: 'There is no rule change to undo.' });
    if (last.was === 'universal') now.set[last.id] = 'universal'; else delete now.set[last.id];
  } else {
    const id = S(body.rule), to = S(body.to);
    if (RULE_IDS.indexOf(id) === -1) return jsonOut({ error: 'There is no rule by that name.' });
    if (RULES_LOCKED.indexOf(id) !== -1) return jsonOut({ error: 'That rule is locked.' });
    if (to !== 'exception' && to !== 'universal') return jsonOut({ error: 'A rule is Exception or Universal.' });
    const was = is(id);
    if (was === to) return jsonOut({ success: true, rules: now });
    if (to === 'universal') now.set[id] = 'universal'; else delete now.set[id];
    now.hist.push({ id: id, was: was, to: to, at: new Date().toISOString() });
    now.hist = now.hist.slice(-RULES_HIST_MAX);
  }
  const value = JSON.stringify(now);
  if (row) setCell(t, row, 'value', value);
  else addRow(t, { key: RULES_KEY, value: value, what_it_does: 'The Rules card (496): exceptions made universal, and the last twenty changes for Undo. Empty: every exception as the code has it.' });
  clearCache();
  return jsonOut({ success: true, rules: now });
}

/* ---------- EDIT WORDS IN PLACE (497): `set: {key: text}` and `reset: [key]` merged into config's one `words` row ---------- */
function postWordsSave_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
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

/* ---------- THE WEEKLY EMAIL'S WORDS (491): the four `digest_*` config rows, blank meaning the default ---------- */
function postDigestWordsSave_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
  const w = body.words && typeof body.words === 'object' ? body.words : {};
  const t = read(TAB.config);
  if (!t.sheet) return jsonOut({ error: 'There is no config tab to keep the words on.' });
  const out = {};
  Object.keys(DIGEST_WORDS).forEach(k => {
    if (!(k in w)) return;
    const v = S(w[k]).slice(0, DIGEST_WORD_MAX);
    const row = t.rows.find(r => norm(r.key) === k);
    if (row) setCell(t, row, 'value', v);
    else addRow(t, { key: k, value: v, what_it_does: 'The weekly parent email (491): blank is "' + DIGEST_WORDS[k] + '". {child} {parent} {count} {span} are filled in.' });
    out[k] = v;
  });
  clearCache();
  return jsonOut({ success: true, words: out });
}

/* THE @FAMILY SHARE OF AN EXTRA SEAT (8 Nov): config B, the one value `seatShare_` prices with, 0 to 2 of the rate; admin only. */
/* ONE BUSINESS SETTING (owner, 9 Nov): every money rule — share B, fees, discounts, rates — is a config row set from the one Business list; only these keys. */
const BUSINESS_SETTING_KEYS = ['M', 'w', 's', 'c', 'B', 'b', 'a', 'h', 'max_students_per_job', 'max_open_requests', 'open_rate', 'open_tutor_rate',
  'waitlist_seats', 'waitlist_extra_seat', 'travel_on_client', 'print_rate_per_page', 'print_minimum', 'postage_flat'];
function postBusinessSettingSave_(body) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Only @family. sets its business settings. Nothing was saved.' });
  const k = S(body.key), v = S(body.value);
  if (BUSINESS_SETTING_KEYS.indexOf(k) < 0) return jsonOut({ error: 'That is not a business setting. Nothing was saved.' });
  if (!/^\d*\.?\d+$/.test(v) || Number(v) > 100000) return jsonOut({ error: 'A business setting is a number, 0 or more. Nothing was saved.' });
  if (k === 'B' && Number(v) > 2) return jsonOut({ error: "@family.'s share is a number from 0 to 2, where 0.5 is half. Nothing was saved." });
  const t = read(TAB.config);
  if (!t.sheet) return jsonOut({ error: 'There is no config tab to keep the setting on.' });
  const row = t.rows.find(r => S(r.key) === k);
  if (row) setCell(t, row, 'value', Number(v));
  else addRow(t, { key: k, value: Number(v), what_it_does: (CONFIG_DEFAULTS.find(d => d[0] === k) || [])[2] || '' });
  clearCache();
  return jsonOut({ success: true, key: k, value: Number(v) });
}
