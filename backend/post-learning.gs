/* post-learning.gs: doPost's handlers for saved working, the assistant, answers, the library and console saves (1130).
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
    const lock = LockService.getScriptLock();
    if (lock.tryLock(5000)) {
      try {
        clearCache();
        const out = submissionsAppend_(pid, [{ id: id, key: k, answer: typed.trim() || WORKING_ANSWER, verdict: 'sent',
          label: S(body.label), words: S(body.words), at: body.sent, photos: links.join(' ') }], body.sent);
        if (out.wrote) { try { SpreadsheetApp.flush(); } catch (err) { /* flush is an early write; Apps Script writes at the end anyway */ } submissionsTouched_(pid); }
        saved = !out.error;
      } finally { lock.releaseLock(); }
    }
  } catch (err) { saved = false; }
  if (!saved) return jsonOut({ success: false, message: 'Your working could not be saved just now — your photos are still here, so try again later.' });
  return jsonOut({ success: true, saved: true, photos: pics.length });
}

/* ---------- AND THE PHOTOS READ BACK (501): by the student, their accepted parents, and staff or admin -- nobody else, and never in doGet ---------- */
function postWorkingOf_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ success: false, message: 'Sign in first.' });
  const of = S(body.of) || S(me.person_id);
  if (!workingMaySee_(me, of)) return jsonOut({ success: false, message: 'Not yours to see.' });
  return jsonOut({ success: true, of: of, work: workingRowsOf_(of, S(body.key)) });
}

/* ---------- THE ASSISTANT IN MESSAGES (449): help finding things on the site, nothing more (547), five a day per person by default */
function postAskAssistant_(body, action, began) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
  if (!key) return jsonOut({ success: false, why: 'ai-off', message: 'Daive isn’t switched on yet.' });
  const who = S(body.personId);
  if (!who) return jsonOut({ success: false, message: 'Sign in to ask Daive.' });
  const cfg = config();
  /* BLANK IS THE DEFAULT, 0 SWITCHES IT OFF. */
  const capCell = S(cfg.assistant_questions_per_day);
  const cap = capCell === '' ? ASSIST_PER_DAY : Math.max(0, Math.floor(N(capCell)));
  const question = S(body.question).trim();
  if (!question) return jsonOut({ success: false, message: 'Write a question first.' });
  if (question.length > ASSIST_QUESTION_MAX) return jsonOut({ success: false,
    message: 'That is too long — ' + ASSIST_QUESTION_MAX + ' characters at most.' });
  const took = aiCapTake_(who, cap, 'AI_ASSIST');
  if (took && took.busy) return jsonOut({ success: false, why: 'busy', message: 'Daive is busy — try again in a minute.' });
  if (!took) return jsonOut({ success: false, why: 'ai-cap', left: 0, cap: cap,
    message: cap ? 'That is today’s ' + cap + ' questions used — they come back tomorrow.' : 'Daive is paused.' });
  let got = null;
  try {
    got = assistAsk_(key, aiModels_(cfg), question, body.history, body.facts, netViewerIsChild_());
  } finally {
    /* A QUESTION THAT GOT NO ANSWER GIVES ITS COUNT BACK, into the day it was taken from. */
    if (!got || got.error) aiCapGiveBack_(who, took, 'AI_ASSIST');
  }
  if (got.error) return jsonOut({ success: false, message: got.error, left: Math.max(0, cap - took.used + 1), cap: cap });
  return jsonOut({ success: true, answer: got.answer, left: Math.max(0, cap - took.used), cap: cap });
}

/* ONE OF TODAY'S AI QUESTIONS TAKEN for `who` under the cap: null once it is used up, `{ busy }` when the tally is locked. */
function aiCapTake_(who, cap, prop) {
  return cap > 0 ? aiTally_(tally => {
    const used = (Number(tally.n[who]) || 0) + 1;
    if (used > cap) return null;
    tally.n[who] = used;
    return { used: used, day: tally.day };
  }, { busy: true }, prop) : null;
}

/* AND GIVEN BACK when no answer came, into the day it was taken from. */
function aiCapGiveBack_(who, took, prop) {
  aiTally_(tally => {
    const n = Number(tally.n[who]) || 0;
    if (tally.day !== took.day || n < 1) return null;
    if (n === 1) delete tally.n[who]; else tally.n[who] = n - 1;
    return true;
  }, 'busy', prop);
}

/* ---------- AN ANSWER SENT, KEPT AS AN EVENT § */
function postSubmitAnswer_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ error: 'Sign in first.' });
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, SUBMISSIONS_PER_POST);
  if (!items.length) return jsonOut({ error: 'No answer to send.' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — it will be sent again.', why: 'busy' });
  let out = {};
  const wroteBefore = POST_WROTE;
  try {
    /* FRESH ROWS UNDER THE LOCK. A copy read before the lock was taken is the copy the other
       request was about to change — and the ids already written are what this asks of it. */
    clearCache();
    out = submissionsAppend_(S(me.person_id), items, body.sent);
    /* WRITTEN, THEN FLUSHED, THEN SAID — the stamp `submissionsFor_` keys this child's copy by moves only once the rows are on the sheet for another request to read § */
    if (out.wrote) {
      try { SpreadsheetApp.flush(); } catch (err) { /* flush is an early write; Apps Script writes at the end anyway */ }
      submissionsTouched_(S(me.person_id));
    }
  } finally {
    lock.releaseLock();
  }
  if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  if (out.error) return jsonOut({ error: out.error });
  return jsonOut({ success: true, saved: out.saved });
}

/* ---------- WHAT THE CHILD WROTE, KEPT ON THEIR ACCOUNT § */
function postSaveAnswers_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ error: 'Sign in first.' });
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, ANSWERS_PER_POST);
  if (!items.length) return jsonOut({ error: 'No answer to save.' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — it will be sent again.', why: 'busy' });
  let out = {};
  const wroteBefore = POST_WROTE;
  try {
    /* FRESH ROWS UNDER THE LOCK, as `submitAnswer` reads them. */
    clearCache();
    out = answersUpsert_(S(me.person_id), items);
  } finally {
    lock.releaseLock();
  }
  if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  if (out.error) return jsonOut({ error: out.error });
  return jsonOut({ success: true, saved: out.saved });
}

/* ---------- AND READ BACK, BY THE PERSON WHO WROTE THEM AND NOBODY ELSE § */
function postMyAnswers_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ error: 'Sign in first.' });
  return jsonOut({ success: true, for: S(me.person_id), answers: answersFor_(S(me.person_id)) });
}

/* ---------- THE LIBRARY'S WORDS AND ANSWERS (397): a few items at a time, to the token's person; no daily cap (owner, 16 Nov) ---------- */
/* `libItems` WAS ITS OWN DOOR until 15 Nov (server-path slice 5): readItems reads the library through libItemsReply_ alone. */

/* THE LIBRARY READ ITSELF, as a reply object: libItems and readItems both answer through it, so their steps are one. */
function libItemsReply_(body) {
  /* A GUEST (owner, 15 Nov) reads by the device she says she is — questions too (owner, 17 Nov: kinds.json `see.who: anyone`). */
  const guest = S(body.guest).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
  const me = findPerson('', S(body.personId)) || (guest ? { person_id: 'guest:' + guest, roles: '' } : null);
  if (!me || !S(me.person_id)) return { error: 'Sign in first.' };
  const asked = Array.isArray(body.ids) ? body.ids : [];
  const ids = [];
  asked.forEach(v => { const t = S(v); if (/^(q|ct|pr|pj):[A-Za-z0-9][A-Za-z0-9 _.:#|()-]{0,159}$/.test(t) && ids.indexOf(t) === -1) ids.push(t); });
  if (!ids.length) return { error: 'Which items? Nothing was asked for.' };
  if (ids.length > LIB_PER_CALL) return { error: 'At most ' + LIB_PER_CALL + ' items at a time.' };
  if (!libReady_()) return { error: 'The library is still being copied into the Ledger — try again in a few minutes.', why: 'lib-not-ready' };
  const got = libContent_(ids);
  return { success: true, items: got.items, missing: got.missing, gen: libGen_() };
}

/* ONE WAY TO THE SERVER (step 2, slice 1): items of one kind by id, as the table allows. Beside libItems, not instead of it. */
/* A library kind is read by libItems' own steps (signed in, the same reader), so it can never give more than libItems did. */
const READ_ITEMS_LIB = { question: 'q', content: 'ct', practical: 'pr', project: 'pj' };
/* THE TABLE'S ITEM KIND FOR EACH (owner, 15 Nov): a question is a question; everything else the library serves is ONE kind, `library`. */
const READ_ITEMS_SHELF = { question: 'question', content: 'library', practical: 'library', project: 'library' };
function readItemsRole_(me) {
  if (!me) return 'anyone';
  if (whoMay_(me, 'admin')) return 'admin';
  return netViewerIsChild_() ? 'child' : 'member';
}
/* ONE WAY TO THE SERVER (step 2, slice 2): people, answers and messages, each answered by its old door's own handler, so the fields and refusals are that door's. */
/* `self` is your own only (myProfile, myAnswers, messages); `other` is somebody else's, admin only as the old door was; `logged` leaves a lens_log row of ids; `blank` lets an admin ask for none (a new person's form). */
function readItemsOld_() {
  return {
    profile: { self: postMyProfile_, other: postLensOpen_, logged: true },
    answer: { self: postMyAnswers_ },
    message: { self: postMessages_ },
    person: { other: postPersonGet_, blank: true },
    card: { other: postGetProfile_ },
  };
}
function readItemsOwn_(kind, how, body, began) {
  const me = findPerson('', S(body.personId));
  const role = readItemsRole_(me);
  if (!me || !S(me.person_id) || !itemMay_(kind, 'read', role)) return jsonOut({ error: 'Not authorised.', why: 'refused' });
  const ids = Array.isArray(body.ids) ? body.ids.map(S).filter(Boolean) : [];
  if (ids.length > 1) return jsonOut({ error: 'One at a time.' });
  const self = S(me.person_id), want = ids[0] || '';
  const b = { token: body.token, name: personDisplayName(me), personId: self };
  if (how.self && (!want || want === self)) return how.self(b, 'readItems', began);
  /* SOMEBODY ELSE'S: an admin's alone, asked of the row the token resolved to — as the gate asked it of lensOpen, personGet and getProfile. */
  if (!how.other || role !== 'admin' || !whoMay_(me, 'admin')) return jsonOut({ error: 'Only your own.', why: 'refused' });
  if (!want && !how.blank) return jsonOut({ error: 'Whose? Nobody was asked for.' });
  b.targetId = want; b.target = want;
  if (how.logged && want !== self) {
    const r = read(TAB.people).rows.find(x => S(x.person_id) === want);
    if (r) lensLog_(me, r, 'readItems:' + kind, ['(opened)']);
  }
  return how.other(b, 'readItems', began);
}
function postReadItems_(body, action, began) {
  /* THE GATE IS `anyone` (15 Nov), so WHO ASKS IS THE TOKEN'S, never a personId the request names; a dead token is signed out, not a guest. */
  const who = S(body.token) ? authWhoIs_(body.token) : null;
  if (S(body.token) && !who) return jsonOut({ error: 'Please sign in again.', why: 'signed-out' });
  body = Object.assign({}, body, { personId: who ? S(who.person_id) : '', name: who ? personDisplayName(who) : '' });
  const kind = S(body.kind);
  const own = readItemsOld_();
  if (Object.prototype.hasOwnProperty.call(own, kind)) return readItemsOwn_(kind, own[kind], body, began);
  if (!Object.prototype.hasOwnProperty.call(READ_ITEMS_LIB, kind)) return jsonOut({ error: 'That kind cannot be read here yet.', why: 'kind' });
  const me = who;
  if (!itemMay_(READ_ITEMS_SHELF[kind], 'read', readItemsRole_(me))) return jsonOut({ error: me ? 'Not authorised.' : 'Sign in first.', why: me ? 'kind' : 'signed-out' });
  const pre = READ_ITEMS_LIB[kind] + ':';
  const asked = Array.isArray(body.ids) ? body.ids : [];
  if (asked.some(v => S(v).indexOf(pre) !== 0)) return jsonOut({ error: 'Every id must be a ' + kind + ' (' + pre + '…).' });
  const out = libItemsReply_({ personId: body.personId, ids: asked, guest: me ? '' : S(body.device) || 'unknown' });
  out.kind = kind;
  return jsonOut(out);
}

/* ONE WAY TO THE SERVER (step 2, slice 3): saveItem and deleteItem. Each kind is answered by its OLD door's own handler, with the very same request, */
/* so the fields, the checks, the refusals and the logging are that door's. `item` names the kind (`kind` is already some old doors' own field). */
function saveItemsOld_() {
  return { profile: 'updateProfile', notepad: 'saveNotepad', todo: 'saveTodo', notify: 'setNotify', answer: 'saveAnswers',
           favourite: 'favourite', message: 'readMessage', post: 'editPost', layout: 'layoutSave', words: 'wordsSave',
           listed: 'setListed', person: 'personSave', spotlight: 'spotlight', ownerAnswer: 'saveOwnerAnswer' };
}
function deleteItemsOld_() {
  return { post: 'deletePost', person: 'personDelete' };
}
/* THE OLD DOORS' HANDLERS (slice 5, 15 Nov): no longer doors of their own — a request naming one is an unknown action. */
/* Reached only through saveItem/deleteItem, behind that door's own gate (ACTION_ACCESS keeps its row), under its own name. */
function itemsDoors_() {
  return { updateProfile: postUpdateProfile_, saveNotepad: postSaveNotepad_, saveTodo: postSaveTodo_, setNotify: postSetNotify_,
           saveAnswers: postSaveAnswers_, favourite: postFavourite_, readMessage: postReadMessage_, editPost: postEditPost_,
           layoutSave: postLayoutSave_, wordsSave: postWordsSave_, setListed: postSetListed_, personSave: postPersonSave_,
           spotlight: postSpotlight_, saveOwnerAnswer: postListOwnerAnswers_, deletePost: postDeletePost_, personDelete: postPersonDelete_ };
}
function itemsWrite_(verb, body, began) {
  const item = S(body.item);
  const map = verb === 'save' ? saveItemsOld_() : deleteItemsOld_();
  if (!Object.prototype.hasOwnProperty.call(map, item)) return jsonOut({ error: 'That kind cannot be ' + (verb === 'save' ? 'saved' : 'deleted') + ' here yet.', why: 'kind' });
  const old = map[item];
  const b = Object.assign({}, body, { action: old });
  delete b.item;
  /* THE OLD DOOR'S OWN GATE, asked again by its name: signed in, an admin's door an admin's alone, a child's money refusal. */
  const denied = accessDenied(old, b);
  if (denied) return jsonOut(denied === 'Please sign in again.' ? { error: denied, why: 'signed-out' } : { error: denied });
  const me = findPerson('', S(b.personId));
  const role = readItemsRole_(me);
  if (!me || !S(me.person_id) || !itemMay_(item, verb, role)) return jsonOut({ error: 'Not authorised.', why: 'refused' });
  if (netViewerIsChild_() && permChildDenied_(old)) return jsonOut({ error: KID_ASK_PARENT, why: 'ask-a-parent' });
  return itemsDoors_()[old](b, old, began);
}

/* THE TOOLS' COPY OF THE PRIVATE HALF — a page out, rows back in (tools/lib-private.js). Admin only, at the gate. */
function postLibExport_(body, action, began) {
  return jsonOut(libExport_(body.file, body.from, body.count));
}

function postLibImport_(body, action, began) {
  return jsonOut(libImport_(body.file, body.rows));
}

/* UPDATES A SESSION LEFT IN THE OWNER'S DRIVE (407): how many wait, and the press that imports them. Admin only, at the gate. */
function postLibImportList_(body, action, began) {
  return jsonOut(libImportList_());
}

function postLibImportDrive_(body, action, began) {
  return jsonOut(libImportDrive_(findPerson('', S(body.personId))));
}
