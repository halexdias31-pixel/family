/* @family. — doGet's payload: posts, the calendar, and what is the viewer's own. Called from doGet in doget.gs (1140). */

/* The posts, with their likes counted and yours marked. */
function getPosts_(meAsked, meAskedId, viewerIsAdmin, vis, opts, payload) {
  /* THE POSTS, with their likes counted and yours marked. § */
  {
    /* ---------- NOTHING HERE TOUCHES DRIVE § */
    const votes = read(TAB.post_votes).rows;
    const reacts = read(TAB.post_reactions).rows;
    /* READ ONCE, LIKE THE OTHER TWO. A `read` inside the post loop is one pass of the tab per
       post — the same argument the `faces` lookup below makes about the people tab. */
    const said = read(TAB.post_comments).rows;

    const me = meAskedId;

    /* Who posted it, and their face. Built once as a lookup rather than searched per post —
       fifteen people and ten posts is nothing, but a hundred posts against a growing people
       list is a hundred scans of it for no reason. */
    const faces = {};
    /* And the same people keyed by ID, for the likes — which know a person_id and not a name. § */
    const byId = {};
    read(TAB.people).rows.forEach(pp => {
      const nm = personDisplayName(pp);
      if (!nm) return;
      /* ---------- THE FACE IS THE `photo` CELL, AND THE FIGURE ONLY WHEN IT IS THE FACE § */
      const face = S(pp.photo);
      const kidHid = !photoChoice_(face) && hasRole(pp, 'student') && !!S(pp.avatar);
      /* KEYED BY THE WHOLE NAME, because that is what a post's `author` cell holds — and what goes
         OUT is `nameFor_`'s: "who reacted" names a child by their first name (the owner, 10 Oct). */
      faces[key(nm)] = {
        handle: S(pp.handle) || S(pp.first_name) || nameFor_(pp),
        avatar: kidHid ? '' : face,
        figure: faceFig_(pp).avatar,
        /* WHO, so the phone draws the author's picture as it is now, by id (474). */
        personId: S(pp.person_id),
      };
      /* ONLY WHOM THEY MAY SEE (386): a hidden reactor is not named, a hidden commenter is "Someone"; signed out, only staff are named. */
      if (S(pp.person_id) && seesPerson_(meAsked ? vis : {}, pp)) byId[S(pp.person_id)] = nameFor_(pp);
    });
    read(TAB.posts).rows.forEach(r => {
      if (!S(r.post_id)) return;
      /* A DELETED POST STILL GOES TO AN ADMIN, marked. § */
      const live = ON_(r.active);
      if (!live && !viewerIsAdmin) return;

      /* ---------- WHO SEES A POST THAT IS WAITING § */
      const state = norm(r.approved);
      const waiting = state === 'pending';
      const refused = state === 'refused';
      /* WHO PRESSED POST, not only the name on it — an admin's business post carries the brand's name (413). */
      const mine = !!meAskedId && postIsBy_(r, { person_id: meAskedId });
      if (refused && !viewerIsAdmin) return;
      if (waiting && !viewerIsAdmin && !mine) return;
      /* An author who is not in the people list still gets a name — the one typed in the row. § */
      const who = faces[key(S(r.author))]
        || { handle: S(r.author) || '@family.', avatar: '' };
      if (!who.avatar && !faces[key(S(r.author))]) {
        who.avatar = S(payload.brand.logo_square) || S(payload.brand.logo_circle);
      }

      payload.posts.push({
        id: S(r.post_id),
        /* THE CELL HOLDS THE WHOLE NAME (the sheet keeps it); what goes out is `nameFor_`'s, so a child's post is signed with their first name. § */
        author: (function () {
          const a = S(r.author);
          const pp = a ? findPerson(a) : null;
          return pp && key(personDisplayName(pp)) === key(a) ? nameFor_(pp) : a;
        })(),
        handle: who.handle,
        avatar: who.avatar,
        /* THE AUTHOR'S PERSON ID, blank for the business (474): "the profile picture should be in sync with my dp for my account". */
        authorId: S((faces[key(S(r.author))] || {}).personId),
        /* THE FIGURE, ONLY WHEN THE AUTHOR'S FACE IS THEIR FIGURE — set on `faces` above. § */
        figure: (faces[key(S(r.author))] || {}).figure,
        image: S(r.image),        // converted on the phone, the way the gallery already does it
        /* THE FIRST PICTURE'S SIZE (561); an unsized old row reads 0 (the phone's 4:5) until `migrateOldRows_` writes 800 x 1000. */
        imageW: Number(r.image_w) || 0, imageH: Number(r.image_h) || 0,
        /* EVERY PICTURE AND CLIP, THE FIRST INCLUDED, so the phone reads one list rather than stitching `image` onto the front itself — which would be a second place for § */
        media: postMediaOut_(r),
        /* THE CAPTION, RESOLVED HERE AND NOWHERE ELSE. § */
        caption: S(r.caption) || captionFromName_(S(r.file_name)),
        body: S(r.body),
        location: S(r.location),
        when: fmtDate(postWhen_(r)),
        /* THE TIMESTAMP, in milliseconds. § */
        at: postWhen_(r) ? postWhen_(r).getTime() : 0,
        pinned: TRUE_(r.pinned),
        /* Sent so an admin can SEE which ones are switched off, and switch one back. Everyone
           else never receives an inactive post, so the flag is always true for them. */
        active: live,
        /* AND WHETHER IT IS WAITING. The phone draws the mark and the buttons from this; nobody
           who should not see it has been sent it at all, so a stale copy in a browser cannot
           leak one. */
        waiting: waiting,
        refused: refused,
        /* YOURS, so the phone offers Edit while it waits and Delete always — the server checks again (`editPost`, `deletePost`). */
        mine: !!mine,
        approvedBy: S(r.approved_by),
        /* THE POLL. Options split from the cell, counts from the votes tab, and which one is
           yours — everything the phone needs to draw it without a second request. */
        poll: (function () {
          const opts = S(r.poll).split(',').map(x => x.trim()).filter(Boolean);
          if (!opts.length) return null;
          const cast = votes.filter(v => S(v.post_id) === S(r.post_id));
          const tally = {};
          opts.forEach(o => { tally[o] = 0; });
          cast.forEach(v => {
            const c = S(v.choice);
            /* A vote for an option since removed is counted for nobody rather than crashing —
               the options are a cell somebody can edit after people have voted. */
            if (tally[c] !== undefined) tally[c]++;
          });
          const mineVote = me ? cast.find(v => S(v.person_id) === me) : null;
          return {
            options: opts,
            counts: opts.map(o => tally[o]),
            total: cast.length,
            yours: mineVote ? S(mineVote.choice) : '',
          };
        })(),
        /* REACTIONS — and they are now the ONLY thing a person presses on a post. § */
        reactions: (function () {
          const emoji = reactionSet(r);
          if (!emoji.length) return null;
          const cast = reacts.filter(x => S(x.post_id) === S(r.post_id));
          const yours = me ? cast.find(x => S(x.person_id) === me) : null;
          return {
            emoji: emoji,
            /* Counted per emoji, because the phone needs a number under each face. */
            counts: emoji.map(x => cast.filter(c => S(c.emoji) === x).length),
            total: cast.length,
            yours: yours ? S(yours.emoji) : '',
            /* WHO, AND WITH WHAT. Names rather than ids — a reaction is a public thing and an id is not, and a list of P17390421 tells nobody anything. § */
            by: cast.slice(0, 40).map(x => ({
              name: byId[S(x.person_id)] || '', emoji: S(x.emoji),
            })).filter(x => x.name),
          };
        })(),
        /* ---------- WHAT PEOPLE SAID § */
        comments: (function () {
          const all = said.filter(c => S(c.post_id) === S(r.post_id) && ON_(c.active))
            .sort(function (a, b) {
              return new Date(a.said_on || 0) - new Date(b.said_on || 0);
            });
          return {
            total: all.length,
            list: all.slice(0, 60).map(function (c) {
              return {
                id: S(c.comment_id),
                name: byId[S(c.person_id)] || 'Someone',
                body: S(c.body),
                /* `fmtDateTime`, WHICH IS WHAT A MESSAGE ALREADY SENDS. § */
                at: fmtDateTime(c.said_on),
                mine: !!me && S(c.person_id) === me,
                canRemove: (!!me && S(c.person_id) === me) || viewerIsAdmin,
              };
            }),
          };
        })(),
        rowIndex: r._row,
      });
    });
    /* Pinned first, then newest. § */
    payload.posts.sort((a, b) => (b.pinned - a.pinned) || (b.at - a.at));
  }
}

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

/* Discount codes, seat prices, the viewer's own stars, answers, links and messages, the spotlight, closures. */
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
  /* AND THE VIEWER'S MESSAGES (700), so the DMs column lands with the payload instead of a cold second round trip. */
  try { payload.messages = meAsked ? messagesOf_(meAsked) : []; } catch (err) { payload.messages = []; }

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
