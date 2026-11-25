/* post-learning.gs: doPost's handlers for saved working, answers, the library and console saves (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* ---------- A PHOTO OF THE WORKING (501): kept in Drive on the submission row, MARKED BY NOTHING (owner, 16 Nov: marking is mechanical only) ---------- */
function postSaveWorking_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ success: false, message: 'Sign in to send your working.' });
  const pid = S(me.person_id);
  const id = S(body.id), k = S(body.key);
  if (!SUBMISSION_ID.test(id) || !k || k.length > 120) return jsonOut({ success: false, message: 'Which question? Nothing was sent.' });
  const pics = (Array.isArray(body.photos) ? body.photos : []).map(x => S(x).trim()).filter(Boolean);
  if (!pics.length) return jsonOut({ success: false, message: 'Add a photo of your working first.' });
  if (pics.length > WORKING_PHOTOS_MAX || pics.some(x => !/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(x) || x.length > WORKING_PHOTO_CHARS))
    return jsonOut({ success: false, message: 'Those photos could not be sent — up to ' + WORKING_PHOTOS_MAX + ' pictures, each under half a megabyte.' });
  const typed = S(body.answer).slice(0, ANSWER_TEXT_MAX);
  /* SAVED, NOT MARKED: the photos go to Drive (never shared by link) on a `sent` row, for the student, their parents and staff to see. */
  const folder = workingFolder_();
  if (!folder) return jsonOut({ success: false, message: 'Your working could not be saved just now — your photos are still here, so try again later.' });
  let saved = false;
  try {
    const links = pics.map((x, i) => workingKeep_(folder, x, 'working-' + pid + '-' + id + '-' + (i + 1)));
    withWriteLock_(() => {
        clearCache();
        const out = submissionsAppend_(pid, [{ id: id, key: k, answer: typed.trim() || WORKING_ANSWER, verdict: 'sent',
          label: S(body.label), words: S(body.words), at: body.sent, photos: links.join(' ') }], body.sent);
        if (out.wrote) { try { SpreadsheetApp.flush(); } catch (err) { /* flush is an early write; Apps Script writes at the end anyway */ } submissionsTouched_(pid); }
        saved = !out.error;
    }, { busy: () => null });
  } catch (err) { saved = false; }
  if (!saved) return jsonOut({ success: false, message: 'Your working could not be saved just now — your photos are still here, so try again later.' });
  return jsonOut({ success: true, saved: true, photos: pics.length });
}

/* ---------- AND THE PHOTOS READ BACK (501): by the student, their accepted parents, and staff or admin -- nobody else, and never in doGet ---------- */
function postWorkingOf_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ success: false, message: text_('err-sign-in-first') });
  const of = S(body.of) || S(me.person_id);
  if (!workingMaySee_(me, of)) return jsonOut({ success: false, message: 'Not yours to see.' });
  return jsonOut({ success: true, of: of, work: workingRowsOf_(of, S(body.key)) });
}

/* ---------- AN ANSWER SENT, KEPT AS AN EVENT § */
function postSubmitAnswer_(body, action, began) {
  return answersLocked_(body, SUBMISSIONS_PER_POST, 'No answer to send.', pid => {
    /* FRESH ROWS UNDER THE LOCK. A copy read before the lock was taken is the copy the other
       request was about to change — and the ids already written are what this asks of it. */
    const out = submissionsAppend_(pid, body.items.slice(0, SUBMISSIONS_PER_POST), body.sent);
    /* WRITTEN, THEN FLUSHED, THEN SAID — the stamp `submissionsFor_` keys this child's copy by moves only once the rows are on the sheet for another request to read § */
    if (out.wrote) {
      try { SpreadsheetApp.flush(); } catch (err) { /* flush is an early write; Apps Script writes at the end anyway */ }
      submissionsTouched_(pid);
    }
    return out;
  });
}

/* ---------- WHAT THE CHILD WROTE, KEPT ON THEIR ACCOUNT § */
function postSaveAnswers_(body, action, began) {
  /* FRESH ROWS UNDER THE LOCK, as `submitAnswer` reads them. */
  return answersLocked_(body, ANSWERS_PER_POST, 'No answer to save.', pid => answersUpsert_(pid, body.items.slice(0, ANSWERS_PER_POST)));
}

/* BOTH OF THEM: signed in, some items, then `write(personId)` under the lock on fresh rows; the stored payload stands. */
function answersLocked_(body, most, none, write) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return refuse_('err-sign-in-first', 'not-signed-in');
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, most);
  if (!items.length) return jsonOut({ error: none });
  let out = {};
  const busy = withWriteLock_(() => { clearCache(); out = write(S(me.person_id)); },
    { keepPayload: 'after', busy: () => refuse_('err-busy-resend', 'busy') });
  if (busy) return busy;
  if (out.error) return jsonOut({ error: out.error });
  return jsonOut({ success: true, saved: out.saved });
}

/* ---------- AND READ BACK, BY THE PERSON WHO WROTE THEM AND NOBODY ELSE § */
function postMyAnswers_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return refuse_('err-sign-in-first', 'not-signed-in');
  return jsonOut({ success: true, for: S(me.person_id), answers: answersFor_(S(me.person_id)) });
}

/* ---------- THE LIBRARY'S WORDS AND ANSWERS (397): a few items at a time, to the token's person; no daily cap (owner, 16 Nov) ---------- */
/* `libItems` WAS ITS OWN DOOR until 15 Nov (server-path slice 5): readItems reads the library through libItemsReply_ alone. */

/* THE LIBRARY READ ITSELF, as a reply object: libItems and readItems both answer through it, so their steps are one. */
function libItemsReply_(body) {
  /* A GUEST (owner, 15 Nov) reads by the device she says she is — questions too (owner, 17 Nov: kinds.json `see.who: anyone`). */
  const guest = S(body.guest).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
  const me = findPerson('', S(body.personId)) || (guest ? { person_id: 'guest:' + guest, roles: '' } : null);
  if (!me || !S(me.person_id)) return errOf_('err-sign-in-first', 'not-signed-in');
  const asked = Array.isArray(body.ids) ? body.ids : [];
  const ids = [];
  asked.forEach(v => { const t = S(v); if (/^(q|ct|pr|pj|in):[A-Za-z0-9][A-Za-z0-9 _.:#|()-]{0,159}$/.test(t) && ids.indexOf(t) === -1) ids.push(t); });
  if (!ids.length) return { error: 'Which items? Nothing was asked for.' };
  if (ids.length > LIB_PER_CALL) return { error: 'At most ' + LIB_PER_CALL + ' items at a time.' };
  if (!libReady_()) return { error: 'The library is still being copied into the Ledger — try again in a few minutes.', why: 'lib-not-ready' };
  const got = libContent_(ids);
  return { success: true, items: got.items, missing: got.missing, gen: libGen_() };
}

/* ONE WAY TO THE SERVER (step 2, slice 1): items of one kind by id, as the table allows. Beside libItems, not instead of it. */
/* A library kind is read by libItems' own steps (signed in, the same reader), so it can never give more than libItems did. */
/* AN INSERT (a reading extract) is read beside its questions (owner, 24 Nov: extracts said "Couldn't load this" — the kind was never served). */
const READ_ITEMS_LIB = { question: 'q', content: 'ct', practical: 'pr', project: 'pj', insert: 'in' };
/* THE TABLE'S ITEM KIND FOR EACH (owner, 15 Nov): a question is a question; everything else the library serves is ONE kind, `library`. */
const READ_ITEMS_SHELF = { question: 'question', content: 'library', practical: 'library', project: 'library', insert: 'question' };
function readItemsRole_(me) {
  if (!me) return 'anyone';
  if (whoMay_(me, 'admin')) return 'admin';
  return netViewerIsChild_() ? 'child' : 'member';
}
/* ONE WAY TO THE SERVER (step 2, slice 2): people and answers, each answered by its handler in `itemDoors_` (actions.json `items`). */
/* `self` is your own only; `other` is somebody else's, an admin's alone; `logged` leaves a lens_log row of ids; `blank` lets an admin ask for none (a new person's form). */
function readItemsOwn_(kind, how, body, began, verb) {
  const me = findPerson('', S(body.personId));
  const role = readItemsRole_(me);
  if (!me || !S(me.person_id) || !itemMay_(kind, verb || 'read', role)) return refuse_('err-not-authorised', 'refused');
  const ids = Array.isArray(body.ids) ? body.ids.map(S).filter(Boolean) : [];
  if (ids.length > 1) return jsonOut({ error: 'One at a time.' });
  const self = S(me.person_id), want = ids[0] || '';
  /* THE WHOLE REQUEST (step 6), who asks the token's; an admin asking after somebody else is handed only who, below. */
  const b = Object.assign({}, body, { name: personDisplayName(me), personId: self, action: kind + ':' + (verb || 'read') });
  delete b.target; delete b.targetId;
  if (how.self && (!want || want === self)) return how.self(b, kind + ':' + (verb || 'read'), began);
  /* SOMEBODY ELSE'S: an admin's alone, asked of the row the token resolved to. */
  if (!how.other || role !== 'admin' || !whoMay_(me, 'admin')) return jsonOut({ error: 'Only your own.', why: 'refused' });
  if (!want && !how.blank) return jsonOut({ error: 'Whose? Nobody was asked for.' });
  const o = { token: body.token, name: b.name, personId: self, targetId: want, target: want };
  if (how.logged && want !== self) {
    const r = read(TAB.people).rows.find(x => S(x.person_id) === want);
    if (r) lensLog_(me, r, 'readItems:' + kind, ['(opened)']);
  }
  return how.other(o, kind + ':' + (verb || 'read'), began);
}
function postReadItems_(body, action, began, verb) {
  verb = verb === 'list' ? 'list' : 'read';
  /* THE GATE IS `anyone` (15 Nov), so WHO ASKS IS THE TOKEN'S, never a personId the request names; a dead token is signed out, not a guest. */
  const who = S(body.token) ? authWhoIs_(body.token) : null;
  if (S(body.token) && !who) return refuse_('err-sign-in-again', 'signed-out');
  body = Object.assign({}, body, { personId: who ? S(who.person_id) : '', name: who ? personDisplayName(who) : '' });
  const kind = S(body.kind);
  const doors = itemDoors_();
  if (Object.prototype.hasOwnProperty.call(doors, kind + ':' + verb)) return readItemsOwn_(kind, doors[kind + ':' + verb], body, began, verb);
  if (verb === 'list' || !Object.prototype.hasOwnProperty.call(READ_ITEMS_LIB, kind)) return jsonOut({ error: 'That kind cannot be read here yet.', why: 'kind' });
  const me = who;
  if (!itemMay_(READ_ITEMS_SHELF[kind], 'read', readItemsRole_(me))) return jsonOut({ error: me ? text_('err-not-authorised') : text_('err-sign-in-first'), why: me ? 'kind' : 'signed-out' });
  const pre = READ_ITEMS_LIB[kind] + ':';
  const asked = Array.isArray(body.ids) ? body.ids : [];
  if (asked.some(v => S(v).indexOf(pre) !== 0)) return jsonOut({ error: 'Every id must be a ' + kind + ' (' + pre + '…).' });
  const out = libItemsReply_({ personId: body.personId, ids: asked, guest: me ? '' : S(body.device) || 'unknown' });
  out.kind = kind;
  return jsonOut(out);
}

/* ONE WAY TO THE SERVER (step 2, slice 3): save and delete. Gated by kind:verb (itemMay_, permissions.json item rows), then answered */
/* by its handler in `itemDoors_` (actions.json `items`) with the very same request, so the fields, checks and logging are that handler's. */
function itemsWrite_(verb, body, began) {
  const item = S(body.item), how = itemDoors_()[item + ':' + verb];
  if (!how || !how.self) return jsonOut({ error: 'That kind cannot be ' + (verb === 'save' ? 'saved' : 'deleted') + ' here yet.', why: 'kind' });
  const b = Object.assign({}, body, { action: item + ':' + verb });
  delete b.item;
  const me = findPerson('', S(b.personId));
  if (!me || !S(me.person_id) || !itemMay_(item, verb, readItemsRole_(me))) return refuse_('err-not-authorised', 'not-allowed');
  return how.self(b, item + ':' + verb, began);
}

/* THE TOOLS' COPY OF THE PRIVATE HALF — a page out, rows back in (tools/content.js library). Admin only, at the gate. */
function postLibExport_(body, action, began) {
  return jsonOut(libExport_(body.file, body.from, body.count));
}

function postLibImport_(body, action, began) {
  return jsonOut(libImport_(body.pack, findPerson('', S(body.personId))));
}

/* UPDATES A SESSION LEFT IN THE OWNER'S DRIVE (407): how many wait, and the press that imports them. Admin only, at the gate. */
function postLibImportList_(body, action, began) {
  return jsonOut(libImportList_());
}

function postLibImportDrive_(body, action, began) {
  return jsonOut(libImportDrive_(findPerson('', S(body.personId))));
}
