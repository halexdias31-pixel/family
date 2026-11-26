/* post-content.gs: doPost's handlers for tutor listing, stars, suggestions and media (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* ---------- THE LINK EDITOR IS GONE AND IT NEVER HAD A DOOR § */

/* ---------- THREE RESOURCE HANDLERS WERE HERE § */

/* listing a tutor ------------------------------------------------------------------------- `listed` decides whether a tutor appears on the site at all. § */
/* ---------- IT LOOKED THE PERSON UP ITSELF, AND HALF THE ROSTER HAS NO `full_name` § */
function postSetListed_(body, action, began) {
  const t = read(TAB.people);
  const who = findPerson(S(body.who), S(body.whoId));
  if (!who) return refuse_('err-no-such-person', 'not-found');
  /* Written as the word rather than as a blank when off — blank already MEANS listed, for
     every row that predates the column, so an empty cell cannot also mean hidden. */
  setCell(t, who, 'listed', TRUE_(body.on) ? 'TRUE' : 'FALSE');
  clearCache();
  return jsonOut({ success: true, listed: TRUE_(body.on) });
}

/* JOINING A WAITLIST --------------------------------------------------------------------- A DIFFERENT PRODUCT IN THE SAME SHAPE. § */
/* ---------- OPENING A WAITING LIST WITH NOBODY ON IT § */
/* ---------- STARRING SOMETHING, AND UNSTARRING IT § */
function postSpotlight_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return refuse_('err-sign-in-first', 'not-signed-in');
  if (!isAdminPerson(S(body.name))) return jsonOut({ error: 'Admins only.' });
  const kind = norm(body.kind), itemId = S(body.itemId);
  if (!kind || !itemId) return jsonOut({ error: 'Nothing to spotlight.' });

  const t = read(TAB.spotlight);
  const row = t.rows.find(r => norm(r.kind) === kind && key(r.item_id) === key(itemId));
  const on = TRUE_(body.on) ? 'TRUE' : '';
  if (row) {
    setCell(t, row, 'on', on);
    setCell(t, row, 'who', S(me.person_id));
    setCell(t, row, 'at', new Date());
  } else {
    addRow(t, {
      spot_id: 'S-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      kind: kind, item_id: itemId, on: on, who: S(me.person_id), at: new Date(),
    });
  }
  clearCache();
  return jsonOut({ success: true, on: !!on });
}

function postFavourite_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return refuse_('err-sign-in-first', 'not-signed-in');
  const kind = norm(body.kind), itemId = S(body.itemId);
  if (!kind || !itemId) return jsonOut({ error: 'Nothing to favourite.' });

  const t = read(TAB.favourites);
  const mine = t.rows.find(r => key(r.person_id) === key(me.person_id)
    && norm(r.kind) === kind && key(r.item_id) === key(itemId));

  if (TRUE_(body.on)) {
    /* ALREADY THERE IS A SUCCESS, not an error. Two taps on a slow connection, or the same
       thing starred on a phone and a laptop, must not produce a complaint about something the
       person plainly wanted. */
    if (!mine) {
      addRow(t, {
        fav_id: 'F-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        person_id: S(me.person_id), kind: kind, item_id: itemId,
        at: new Date(),
      });
    }
  } else if (mine) {
    /* DELETED, NOT FLAGGED. An unfavourite leaves nothing worth keeping — there is no history
       anybody wants of things somebody stopped liking, and a tab full of dead rows makes the
       live ones slower to find. */
    delRow(t, mine);
  }
  clearCache();
  return jsonOut({ ok: true, on: TRUE_(body.on) });
}

/* ---------- SUGGEST A CHANGE (494): one `claude_notes` row ----------
   An admin's is open at once and in the Drive file; anybody else's waits (`pending`) for Confirm or Dismiss. */
function postReportQuestion_(body, action, began) {
  body.kind = 'question'; body.itemId = 'q:' + S(body.questionId).trim();
  return postSuggest_(body, 'suggest', began);
}

function postReport_(body, action, began) {
  return postSuggest_(body, 'suggest', began);
}

function postSuggest_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id) || !rankAtLeast_(me, 'student')) return refuse_('err-sign-in-first', 'not-signed-in');
  const kind = norm(body.kind);
  if (!REPORT_KIND_RE.test(kind)) return jsonOut({ error: 'Which thing? Nothing was sent.' });
  const item = S(body.itemId).trim();
  /* AN ID MAY BE A NAME (498), spaces and brackets and all. */
  if (item.length > REPORT_FIELD_MAX || !/^[A-Za-z0-9][A-Za-z0-9 _.:|#\/()'&,+-]*$/.test(item) || (kind === 'question' && !/^q:./.test(item)))
    return jsonOut({ error: 'Which one? Nothing was sent.' });
  /* A FLAG IS THE WHOLE SUGGESTION (owner, 16 Nov): no words, no files; only the snapshot of the screen (18 Nov). Off withdraws the person's own. */
  const on = norm(body.flag) !== 'off';
  const pid0 = S(me.person_id), key0 = kind + '|' + item;
  if (!on) {
    const busy0 = withWriteLock_(() => {
      clearCache();
      const t0 = read(TAB.claude_notes);
      t0.rows.filter(r => S(r.made_by) === pid0 && S(r.item_id) === key0 && flagRow_(r)).forEach(r => setCells(t0, r, { status: 'withdrawn', done_at: new Date() }));
    });
    if (busy0) return busy0;
    clearCache();
    return jsonOut({ success: true, flag: false, myFlags: myFlags_(pid0), reportedItems: reportedItems_() });
  }
  const note = FLAG_NOTE;
  const admin = rankAtLeast_(me, 'admin');
  /* AND THE FUNNEL PATH ON FIND (498) and the screen it was seen on, so the owner can find the same thing. */
  const path = S(body.path).replace(/\s+/g, ' ').trim().slice(0, 300);
  const device = /^(phone|tablet|computer)$/.test(S(body.device)) ? S(body.device) : '';
  const noteAll = [note, path ? 'Path: ' + path : '', device ? 'Seen on: ' + device : ''].filter(Boolean).join('\n');
  let out = {}, made = null;
  const wroteBefore = POST_WROTE;
  const busy = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.claude_notes);
    if (!t.sheet) out = { error: 'Suggestions are not set up yet — an admin opening the site sets them up.', why: 'no-tab' };
    else {
      const pid = S(me.person_id), key = kind + '|' + item;
      /* ONE FLAG PER THING PER PERSON while it waits: on twice is on. */
      const had = t.rows.find(r => S(r.made_by) === pid && S(r.item_id) === key && flagRow_(r));
      if (had) out = { success: true, already: true };
      else {
        made = suggestRow_(t, pid, kind, item, reportCut_(body.label, REPORT_FIELD_MAX), noteAll, admin ? 'open' : 'pending');
        out = { success: true, serious: admin, id: made.note_id };
      }
    }
  });
  if (busy) return busy;
  /* THE PICTURE OF WHAT WAS SEEN (owner, 18 Nov) goes to a private "Flag snapshots" folder in the Claude inbox — never shared
     (children's data) — and its link is added to the note. A picture that fails leaves the flag as it is. */
  if (made) { try { const link = flagShotKeep_(body.shot, made.note_id); if (link) { const tn = read(TAB.claude_notes); const r = tn.rows.find(x => S(x.note_id) === made.note_id); if (r) setCell(tn, r, 'note', S(r.note) + '\nSnapshot: ' + link); } } catch (err) { out.shotError = S(err && err.message || err); } }
  if (made && admin) { clearCache(); out.notes = claudeNotesOpen_(); try { out.file = claudeNotesWrite_(out.notes); } catch (err) { out.fileError = S(err && err.message || err); } }
  if (out.success) { clearCache(); out.flag = true; out.myFlags = myFlags_(S(me.person_id)); out.reportedItems = reportedItems_(); }
  if (made && !admin && POST_WROTE && !wroteBefore) POST_WROTE = false;
  return jsonOut(out);
}

const FLAG_SHOT_MAX = 600000;
function flagShotKeep_(raw, id) {
  const v = S(raw);
  const m = v.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+\/=]+)$/);
  if (!m || v.length > FLAG_SHOT_MAX) return '';
  const file = inboxFolderAt_(['Flag snapshots'], true).createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], S(id) + (m[1] === 'image/png' ? '.png' : '.jpg')));
  return driveFileUrl_(file.getId());
}

/* ---------- FILES FOR CLAUDE (515): one part of one file into Drive "Claude inbox". Admin only, at the gate; nothing goes in the sheet. */
function postSuggestUpload_(body, action, began) {
  return jsonTry_(() => inboxPart_(body));
}

/* ---------- THE SUGGESTIONS WAITING, FOR THE BUSINESS COLUMN (494). Admin only, at the gate. ---------- */
function postListSuggestions_(body, action, began) {
  clearCache();
  const list = claudeNotesPending_();
  return jsonOut({ success: true, open: list.length, suggestions: list.slice(0, REPORTS_LIST_MAX) });
}

/* ---------- AND ONE DECIDED: confirm sends it to Notes for Claude, dismiss drops it ---------- */
function postDecideSuggestion_(body, action, began) {
  const how = norm(body.decision);
  if (how !== 'confirm' && how !== 'dismiss') return jsonOut({ error: 'Confirm or dismiss.' });
  let out = {};
  const busy = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.claude_notes);
    const row = t.sheet ? t.rows.find(r => S(r.note_id) && S(r.note_id) === S(body.id) && norm(r.status) === 'pending') : null;
    if (!row) out = { error: 'That suggestion is not there any more.' };
    else {
      setCells(t, row, how === 'confirm' ? { status: 'open' } : { status: 'dismissed', done_at: new Date() });
      out = { success: true, id: S(row.note_id), decision: how };
    }
  });
  if (busy) return busy;
  if (out.success) {
    clearCache();
    out.notes = claudeNotesOpen_();
    out.reportedItems = reportedItems_();
    if (how === 'confirm') { try { out.file = claudeNotesWrite_(out.notes); } catch (err) { out.fileError = S(err && err.message || err); } }
  }
  return jsonOut(out);
}

/* ---------- NOTES FOR CLAUDE (484): an admin's words on one widget or card, a row in `claude_notes` and the Drive file rewritten ---------- */
function postClaudeNoteAdd_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return refuse_('err-not-authorised', 'not-allowed');
  let out = {};
  const busy = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.claude_notes);
    if (!t.sheet) out = { error: 'Notes are not set up yet — an admin opening the site sets them up.', why: 'no-tab' };
    else if (action === 'claudeNoteAdd') {
      const note = S(body.note).trim().slice(0, CLAUDE_NOTE_MAX), item = S(body.itemId).trim().slice(0, 120);
      if (!note) out = { error: 'Write what should change first.' };
      else if (!item) out = { error: 'Which widget? Nothing was sent.' };
      else {
        const id = 'N-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        addRow(t, { note_id: id, made_at: new Date(), made_by: S(me.person_id), column: S(body.column).trim().slice(0, 40),
                    item_id: item, item_label: S(body.itemLabel).trim().slice(0, 200), note: note, status: 'open', done_at: '' });
        out = { success: true, id: id };
      }
    } else {
      const row = t.rows.find(r => S(r.note_id) && S(r.note_id) === S(body.id));
      if (!row) out = { error: 'That note is not there any more.' };
      else { setCells(t, row, { status: 'done', done_at: new Date() }); out = { success: true, id: S(row.note_id) }; }
    }
  });
  if (busy) return busy;
  if (out.success) {
    clearCache();
    out.notes = claudeNotesOpen_();
    try { out.file = claudeNotesWrite_(out.notes); } catch (err) { out.fileError = S(err && err.message || err); }
  }
  return jsonOut(out);
}

/* ---------- THE FILMS, FILLED FROM THE NOTFLIX FOLDER § */
function postFilmsSync_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !whoMay_(me, 'admin')) return jsonOut({ error: 'Only an admin can sync the films.' });
  let out;
  try { out = filmsSync_({ budgetMs: FILMS_SYNC_BUDGET_MS }); }
  catch (err) { return jsonOut({ error: 'The films could not be synced: ' + S(err && err.message || err) }); }
  if (out.error) return jsonOut({ error: out.error, why: out.why });
  return jsonOut(Object.assign({ success: true }, out, { films: filmsFor_(me), sync: filmsSyncSays_() }));
}

