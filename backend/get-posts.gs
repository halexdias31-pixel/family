/* @family. — doGet's payload: the calendar, and what is the viewer's own. Called from doGet in doget.gs (1140). */

/* Exams and birthdays for the calendar. */
function getCalendar_(meAskedId, viewerIsAdmin, vis, payload) {
  /* EXAMS AND BIRTHDAYS — the two things a calendar has to know about a person. § */
  {
    const meId = meAskedId;
    /* Your own family, as BOTH SIDES have agreed it. A claim nobody answered is a request and
       not a relationship, so it opens nobody's diary. */
    const family = meId ? [meId]
      .concat(acceptedChildren(meId).map(x => S(x.person_id)))
      .concat(acceptedParents(meId).map(x => S(x.person_id)))
      .concat(siblingsOf(meId).map(x => S(x.person_id))) : [];
    const maySee = id => viewerIsAdmin || (S(id) && family.indexOf(S(id)) !== -1 && (!vis || !!vis[S(id)]));

    read(TAB.exams).rows.forEach(r => {
      if (!S(r.person_id) || !S(r.exam_date)) return;
      if (!ON_(r.active)) return;
      if (!maySee(r.person_id)) return;
      const who = findPerson(S(r.person_id));
      payload.exams.push({
        id: S(r.exam_id), personId: S(r.person_id),
        who: who ? nameFor_(who) : '',
        subject: S(r.subject), label: S(r.label),
        date: fmtDate(r.exam_date), kind: norm(r.kind) === 'mock' ? 'mock' : 'exam',
        board: S(r.board), rowIndex: r._row,
      });
    });

    /* ---------- AND THE TWO EXAM DATES A STUDENT KEEPS ON THEIR OWN PAGE § */
    const examOn = {};
    payload.exams.forEach(x => { examOn[S(x.personId) + '|' + S(x.date)] = true; });
    read(TAB.people).rows.forEach(r => {
      if (!maySee(r.person_id)) return;
      [['exam_small_date', 'mock', 'Small exam'], ['exam_big_date', 'exam', 'Big exam']].forEach(([col, kind, label]) => {
        const d = sheetDate(r[col]);
        if (!d) return;
        const k = S(r.person_id) + '|' + fmtDate(d);
        if (examOn[k]) return;
        examOn[k] = true;
        payload.exams.push({ id: S(r.person_id) + ':' + col, personId: S(r.person_id),
          who: nameFor_(r), subject: '', label: label, date: fmtDate(d), kind: kind,
          board: '', rowIndex: 0 });
      });
    });

    read(TAB.people).rows.forEach(r => {
      const d = sheetDate(r.date_of_birth);
      if (!d) return;
      if (!maySee(r.person_id)) return;
      payload.birthdays.push({
        name: nameFor_(r),
        day: d.getDate(), month: d.getMonth() + 1,
      });
    });
  }
}

/* Discount codes, seat prices, the viewer's own stars, answers and links, the spotlight, closures. */
function getViewerBits_(meAsked, viewerIsAdmin, payload) {
  /* ---------- THE DISCOUNT CODES, TO AN ADMIN ALONE (docs/history/353) § */
  if (viewerIsAdmin) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    read(TAB.promo_codes).rows.forEach(r => {
      if (!S(r.code)) return;
      const ends = S(r.expires) ? sheetDate(r.expires) : null;
      const spent = N(r.max_uses) > 0 && N(r.used) >= N(r.max_uses);
      payload.promoCodes.push({
        code: S(r.code), type: S(r.type) === '%' ? '%' : '£', value: N(r.value),
        absorbedBy: /^shared/i.test(S(r.absorbed_by)) ? 'Shared with tutor' : 'Business',
        off: !ON_(r.active) ? 'switched off' : (ends && ends < today) ? 'expired' : spent ? 'used up' : '',
      });
    });
  }

  /* ---------- WHAT A WAITING-LIST SEAT COSTS, WORKED OUT HERE § */
  /* AND ONE PER ROOM, UNDER THE LABEL THE PHONE LOOKS IT UP BY. § */
  try {
    payload.waitlistSeat = {};
    read(TAB.venues).rows.forEach(v => {
      const at = S(v.name);
      if (!at) return;
      const labels = [at].concat(read(TAB.rooms).rows
        .filter(x => key(x.venue) === key(at) && ON_(x.active) && S(x.name))
        .map(x => at + ' \u2014 ' + S(x.name)));
      labels.forEach(label => {
        const w = waitlistPrice(label);
        if (w) payload.waitlistSeat[label] = {
          perHour: w.perSeatHour, perSession: w.perSeatSession,
          seats: w.seats, hours: w.hours,
        };
      });
    });
  } catch (err) { payload.waitlistSeat = {}; }

  /* WHAT THIS PERSON HAS STARRED. Theirs only — a favourite is a private thing and there is no
     screen anywhere that wants somebody else's. Sent as the bare keys, which is the shape the
     Find screen already holds them in. */
  /* `favouritesOf_`, so the sign-in reply sends the same list (`loginReplyFor_`). */
  try {
    payload.favourites = favouritesOf_(meAsked);
  } catch (err) { payload.favourites = []; }

  /* ---------- WHAT THIS PERSON LAST SENT FOR EACH QUESTION, AND — FOR AN ADMIN — HOW EVERYBODY IS DOING § */
  try {
    payload.submissions = submissionsFor_(meAsked, viewerIsAdmin);
  } catch (err) { payload.submissions = { for: '', mine: {} }; }

  /* ---------- THE VIEWER'S OWN FAVOURITE LINKS (509), and nobody else's: fresh every load, never kept in the cached body. */
  try { payload.favLinks = favLinksOf_(meAsked); } catch (err) { payload.favLinks = []; }

  /* ---------- WHEN THE FILMS WERE LAST FILLED FROM DRIVE, FOR THE ADMIN AND NOBODY ELSE § */
  if (viewerIsAdmin) {
    try { payload.filmsSync = filmsSyncSays_(); } catch (err) { payload.filmsSync = { at: '', more: false }; }
    /* THE SETUP CARD ON YOU (361) — versions, run-once jobs, triggers. Fresh every time, like filmsSync. */
    try { payload.setup = setupStatus_(); } catch (err) { payload.setup = { error: String(err && err.message || err) }; }
    /* THE OPEN NOTES FOR CLAUDE (484), the admin's alone. */
    try { payload.claudeNotes = claudeNotesOpen_(); } catch (err) { payload.claudeNotes = []; }
  }

  /* ---------- WHAT AN ADMIN REPORTED AND NOBODY HAS FIXED (486): `kind|id` only, so a card can say "flagged to fix" ---------- */
  try { payload.reportedItems = reportedItems_(); } catch (err) { payload.reportedItems = []; }
  /* AND THE VIEWER'S OWN FLAGS (owner, 16 Nov), so each flag tile is drawn on or off. */
  try { payload.myFlags = meAsked ? myFlags_(meAsked.person_id) : []; } catch (err) { payload.myFlags = []; }

  /* ---------- AND THE SHOP WINDOW, WHICH IS THE SAME LIST FOR EVERYBODY § */
  /* AND A TAB WITH NO ROWS SENDS NO KEY, because the filter below cannot tell "an admin switched the last one off" from "nobody has ever spotlit anything" — both § */
  try {
    const spotRows = read(TAB.spotlight).rows;
    if (spotRows.length) {
      payload.spotlight = spotRows
        .filter(r => TRUE_(r.on))
        .map(r => S(r.item_id))
        .filter(Boolean);
    } else delete payload.spotlight;
  } catch (err) { delete payload.spotlight; }

  /* THE DAYS NOBODY IS TAUGHT — bank holidays and INSET days. § */
  try { payload.closures = closures(); }
  catch (err) { payload.closures = []; }

  /* `payload.splashOff` WAS HERE, always []: the splashes are read off the repository (data/settings) and nothing read this key (433). */
}
