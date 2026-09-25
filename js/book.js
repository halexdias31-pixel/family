/* ==================================================================================================
   @family. — book.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   book.js is number 14 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- BOOK --------------------------------------------------------------------------------
   The classes that exist, and the way to ask for one that does not. The pricing chain underneath
   this is the one carried over whole — the screen only has to show what it says.
--------------------------------------------------------------------------------------------- */
/** Everything on the Book screen, in order. */
/* `openClassCard` WAS HERE — the coupon card, a torn ticket with a Take one button. Nothing draws
   one: the open classes are a dropdown on the booking form, not a kind in Find. */


  /* ---------- `jobCard` WAS HERE, AND IT HAS NO CALLERS LEFT ----------------------------------------
   THE FOLDED STUB — subject, day, price, a stamp and a dotted tear — made for a LIST of sessions
   you would then open one of. Three things drew it and none of them does now: the You column was
   folded into the funnel, `Booking · Receipts` opens the whole receipt on its own page rather than a
   fold that opens a sheet, and `Your sessions` is a roster of who is in each class rather than a
   pile of small documents.

   REMOVED RATHER THAN LEFT. A session has exactly two faces now — the receipt and the roster — and
   a third that nothing calls is a third somebody will call again by accident, and then there will
   be three shapes to keep in step. If a list of folds is ever wanted, it is `jobReceipt` with a
   class on it, not a second builder. */


/* ---------- THE BOOKING PAGES ARE THE FORM, AND ONLY THE FORM -------------------------------------
   `bookBlocks` USED TO BE THE WHOLE COLUMN: the form, your sessions, the open classes and whatever
   the calendar was advertising, in one list. That was right when it WAS a column — one place for
   everything to do with booking.

   IT IS A FUNNEL ANSWER NOW, and a funnel already knows how to keep different kinds of thing apart:
   your sessions are `Receipts` and the open classes are `Coupons`, each a kind of its own under
   "What for · Booking", each found by asking for it. See `KINDS` in find.js.

   SO WHAT IS LEFT HERE IS THE FORM. The festive cards went to Posts, which is where the business
   talking already lives — a holiday offer is an announcement with a date on it, and it was only
   ever here because bookings were.

   SIGNED OUT, IT IS A SIGN-IN CARD. The column drew one; the form drew unconditionally after the
   move, which meant a visitor got twelve fields they could fill in and no way to send any of it.
   The button toasts rather than opening anything, which is the state sign-in has been in for a
   while — but a dead end that says what it is beats a form that silently cannot work. */
function bookBlocks() {
  if (!USER) {
    return [`<div class="card"><h3>Sign in to book</h3>
      <p class="sub">You need an account to ask for a session.</p>
      <button class="btn" data-do="signin">Sign in</button></div>`];
  }
  /* ---------- THE FORM, THEN WHAT IS ALREADY BOOKED, THEN WHAT IS FINISHED -----------------------
     THE PAST ONES HAD NOWHERE TO BE. `myJobs_` has always held every session a person is in, live
     and finished together, and the only things reading it were the week grid — which draws one week
     and so cannot show last term at all — and the open-class split. So a receipt for a session that
     has happened existed in the payload and appeared on no screen in the app.

     HERE, BECAUSE THIS IS WHERE BOOKING IS. Somebody looking for what they paid for a session in
     March is on the same errand as somebody booking one for June: they answered "What for ·
     Booking" to get here, and the answer to "what did last term cost" should not be behind a
     different question.

     LAST, BECAUSE IT IS THE LEAST URGENT THING ON THE PAGE. The form is what somebody came for; a
     finished session is a record. The funnel pages these in order, so the receipts are a swipe past
     the form rather than something in front of it. */
  /* ---------- THE FORM, AND ONLY THE FORM, AGAIN --------------------------------------------------
     `pastCard_` WAS HERE and its receipts are results now — `Booking · Receipts`, beside Classes and
     Waitlists, each a kind of its own. A page holding a list of them AND a searchable list of the
     same rows is the duplication this evening has already produced twice, and the funnel version is
     the better one: it counts them, it can be searched, and it separates finished from running
     rather than lumping both under "past". */
  /* THE SAME MONEY BLOCK UNDER THE FORM, and for the sharper reason: the figures move as the
     questions are answered, which is exactly when you want to see what a booking would leave you. */
  const L = typeof bookPrice === 'function' ? bookPrice() : null;
  /* BELOW THE FORM, NOT AS A SECOND PAGE. Each element of this array is a page somebody swipes to,
     and the booking they just made is not somewhere else — it is the answer to the form they are
     looking at. Same string, under the money block. */
  return [bookerCard()
    + (typeof moneyBlock === 'function'
       ? moneyBlock({ tutor: BOOKING.tutor, tutorPay: L && L.tutorPay, profit: L && L.profit })
       : '')
    + askedBlock_()].concat(myJobPages_()).filter(Boolean);
}

/* ---------- YOUR SESSIONS CAME BACK TO THIS COLUMN, AND THE NOTE ABOVE IS WHY IT HAD TO ------------
   READ THE PARAGRAPH TWO ABOVE THIS ONE BEFORE CHANGING ANYTHING HERE. It says `pastCard_` was
   taken off this column *because* the receipts had become results in the funnel — "a page holding a
   list of them AND a searchable list of the same rows is the duplication this evening has already
   produced twice". That was right while both existed. Booking has now left the funnel entirely (see
   `FUNNEL_NOT_FOR` in find.js), so the half that was kept is the half that was deleted, and every
   session a person has ever had would have been on no screen in the app at all.

   SO THE TWO CHANGES ARE ONE CHANGE. Removing an answer and restoring what it was the only route to
   belong in the same commit, or the gap between them is a live site where somebody cannot find what
   they paid for in March — which is the exact case the deleted note named.

   ONE PAGE EACH, NOT A LIST, AND NOT A NEW RENDERER. `jobPage_` is the same builder `Booking ·
   Receipts` drew with — the receipt, the money and the way in — so a session looks identical to how
   it looked yesterday and there is still exactly one function that draws one. That is the rule this
   file keeps breaking and the rule `accountPages_` cites: two renderers for one thing is two things
   to keep in step.

   NEWEST FIRST, because the session somebody is looking for is almost always the last one — and
   because the form is page one, so the first swipe should land on what is happening now rather than
   on a receipt from two years ago. `myJobs_` is the one place that knows whose sessions are whose;
   nothing here re-derives it. */
/* ---------- THE ORDER IS ONE FUNCTION, BECAUSE TWO THINGS NEED TO AGREE ABOUT IT ------------------
   `myJobPages_` BUILDS THE PAGES AND `on('job')` HAS TO FIND ONE. Sorting in both places is two
   sorts that must stay identical for ever — the fault this file records under `documents_()`, under
   `paperIdOf_` and under `factsNow_`: a second reader of one thing is a second chance to disagree
   about it. Tapping Thursday and landing on Tuesday's receipt is what that disagreement looks like.

   `OPEN_JOB` IS THE SECOND HALF, AND IT IS `ASKED_JOB`'S OWN PATTERN. The week grid draws
   `DATA.liveJobs` — every session, because an admin's week is everybody's — and `myJobs_` returns
   only the ones you are in. So an admin tapping a session they are neither the tutor nor the client
   of has no page to be sent to, and sending them nowhere is the silent failure this whole change is
   about. One id, held in memory, drawn as a page: a reload drops it, which is right for something
   you opened rather than something you own. */
let OPEN_JOB = '';

function myJobsOrdered_() {
  if (!USER || typeof myJobs_ !== 'function') return [];
  const mine = myJobs_().slice();
  /* THE ONE BEING LOOKED AT, IF IT IS NOT ALREADY YOURS. Added at the front rather than sorted in,
     because it is the thing that was just tapped and the first swipe past the form should land on
     it — the same reasoning `askedBlock_` uses for the booking just sent. */
  const all = (DATA.liveJobs || DATA.jobs || []);
  const idOf = j => String((j && (j.id || j.jobId)) || '');
  const open = OPEN_JOB && !mine.some(j => idOf(j) === String(OPEN_JOB))
    ? all.find(j => idOf(j) === String(OPEN_JOB)) : null;
  return (open ? [open] : []).concat(mine
    .sort((a, b) => String((b && b.startDate) || '').localeCompare(String((a && a.startDate) || ''))))
    /* NOT THE ONE ALREADY UNDER THE FORM. `askedBlock_` draws the booking just sent, on page one,
       and drawing it again three pages down is the same receipt twice — which is how a person comes
       to believe they booked two sessions. Matched on the id, which is what `ASKED_JOB` holds. */
    .filter(j => !(ASKED_JOB && idOf(j) === String(ASKED_JOB)));
}

function myJobPages_() {
  if (typeof jobPage_ !== 'function') return [];
  return myJobsOrdered_().map(j => jobPage_(j)).filter(Boolean);
}

/* WHICH PAGE OF THE BOOKING COLUMN A SESSION IS ON, or -1. Page 0 is the form, so the receipts
   start at 1 — read off the same list that builds them rather than counted a second time. */
function jobPageAt_(id) {
  const n = myJobsOrdered_().findIndex(j => String((j && (j.id || j.jobId)) || '') === String(id));
  return n < 0 ? -1 : n + 1;
}

/* THE RECEIPT FOR THE BOOKING JUST SENT — see `ASKED_JOB` above for why it is one and not a list.

   IT IS LOOKED UP EVERY DRAW rather than kept as HTML, so the document says where the booking has
   got to NOW. That matters within one visit: an admin accepting a session while the family still
   has the page open moves `Stage` from "Asked for — waiting on us" to "Accepted — waiting for
   payment" on the next `load()`, with nothing here to tell. Storing the drawn markup would have
   frozen the one row somebody is watching.

   AND IT DISAPPEARS IF THE JOB DOES. A declined booking leaves the payload and this finds nothing,
   which is the honest outcome — better than a stale receipt for a session that is not happening.
   `jobReceipt` is the same builder the session sheet uses, so this cannot drift from it. */
function askedBlock_() {
  if (!ASKED_JOB) return '';
  const jobs = (DATA && (DATA.liveJobs || DATA.jobs)) || [];
  const j = jobs.find(x => String((x && (x.id || x.jobId)) || '') === String(ASKED_JOB));
  if (!j) return '';
  return typeof jobReceipt === 'function' ? jobReceipt(j) : '';
}

/* ---------- WHEN A SESSION IS OVER --------------------------------------------------------------
   OFF `endDate`, WHICH THE PAYLOAD ALREADY SENDS — the last of `session_dates`, computed in
   `doget.gs` beside `startDate`. Nothing had to be added at either end.

   A SESSION WITH NO DATES IS NOT PAST. An empty `endDate` means nobody has said when it runs yet,
   which is a booking still being arranged — the newest thing a person has, and the last thing that
   should be filed under finished. So the test is explicit about having a date at all rather than
   letting an empty string fall through a comparison.

   THE WHOLE DAY COUNTS. A session at four this afternoon is not history at nine this morning, and
   an `endDate` of today read as "past" would move it into the receipts on the morning of the day it
   happens. Compared against the START of today, so today is always still live. */
function jobIsPast_(j) {
  const end = String((j && j.endDate) || '').trim();
  if (!end) return false;
  const d = typeof parseDMY === 'function' ? parseDMY(end) : new Date(end);
  if (!d || isNaN(+d)) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d < today;
}

/* `pastJobs_` WENT WITH `pastCard_`. `stuffItems` sorts the three kinds itself, off `jobIsPast_` and
   `isWaitJob_` directly, because it needs all three in one pass rather than one list at a time. */
/* ---------- A LIVE CLASS IS ONE THAT IS ACTUALLY RUNNING ------------------------------------------
   THIS WAS "EVERYTHING NOT PAST", so a request nobody had answered and a session paid for last week
   were both `Your sessions` — which is how two unconfirmed bookings came to be listed as live
   classes for a family who has never paid for anything. The widget was right about the rows and
   wrong about the word.

   `jobStage_` ALREADY KNOWS. It returns `receipt` once money has moved and `application` until
   then, which is exactly the line: a class is live when it has been agreed AND paid for. Reused
   rather than re-derived, so the widget and the stamp can never disagree about what has happened.

   EVERYTHING ELSE IS STILL THERE, under `Booking · Receipts` — one receipt per session at every
   stage, which is where a booking somebody is waiting to hear about belongs. Nothing is hidden;
   what changed is that a word now means what it says. */
const liveJobs_ = () => myJobs_()
  .filter(j => !jobIsPast_(j) && jobStage_(j) === 'receipt');

/* `pastCard_` WAS HERE. The finished sessions are `Booking · Receipts` in the funnel now — one
   answer, counted like every other, searchable by subject. `jobIsPast_` stays because `stuffItems`
   and the sessions widget both need to know which side of today a session falls on. */

/* ---------- ONE WIDGET PER SESSION, NOT ONE WIDGET OF SESSIONS -------------------------------------
   `Your sessions` WAS A SINGLE WIDGET WITH EVERY ROSTER STACKED INSIDE IT — a card headed with your
   name for it, then a heading and a roster, then a rule, then another heading and another roster.
   Which is a list again, and the reason the folded stubs went was that a list of sessions is not
   what somebody wants: they want a session.

   ONE EACH, NAMED FOR ITSELF. `Maths · GCSE · Monday` is a thing you can search for, count, star and
   open; "Your sessions" is a container you then have to read. The funnel already counts and filters
   results, so a widget per session means Booking says how many you are in, and typing "maths" finds
   the one.

   `msgWidgets_` HAS DONE THIS SINCE MESSAGES WERE BUILT — a widget per conversation rather than one
   inbox — and `allWidgets` concatenates them for exactly this reason. Same shape, same place, no
   new machinery.

   THE ROSTER IS THE WHOLE BODY. No subject line inside it, because the widget's own name is the
   subject; no stage line, because that is on the receipt where the money is. What is left is the
   thing this answers: who is in it, and how many seats are free. */
function liveWidgets_() {
  if (!USER || typeof liveJobs_ !== 'function') return [];
  return liveJobs_().slice()
    .sort((x, y) => String(x.startDate || '').localeCompare(String(y.startDate || '')))
    .map(j => {
      const id = String(j.id || j.jobId || '');
      const when = [j.weekday, j.time].filter(Boolean).join(' ');
      const name = [[j.subject, j.level].filter(Boolean).join(' · ') || 'Session', when]
        .filter(Boolean).join(' · ');
      return {
        id: 'live:' + id,
        kind: 'tool',
        /* UNDER BOOKING, LIKE THE RECEIPTS. Its kind is `tool` because it is a widget; nobody looks
           for a class among the timers. See `forLabel` and `kindLabel` in find.js. */
        groups: 'Booking',
        label: 'Your sessions',
        name: name,
        what: 'Who is in it',
        into: 'live-body-' + id,
        start: () => fillRoster_(id),
        html: '<div class="card"><h3>' + esc(name) + '</h3>'
            + '<div id="live-body-' + esc(id) + '"></div></div>',
      };
    });
}

/** The seats for one session. Redrawn on open, so a seat taken since the last load shows. */
function fillRoster_(jobId) {
  const el = $('live-body-' + jobId);
  if (!el) return;
  const j = (typeof myJobs_ === 'function' ? myJobs_() : [])
    .find(x => String(x.id || x.jobId || '') === String(jobId));
  if (!j) {
    /* IT WENT WHILE THE WIDGET WAS OPEN — withdrawn, or cancelled by us. Said rather than left
       blank, because an empty roster reads as a class nobody has joined. */
    el.innerHTML = `<p class="empty">This session is no longer yours.</p>`;
    return;
  }
  el.innerHTML = rosterHtml({
    tutor: j.tutor || '',
    seats: seatsOf_(j),
    names: (j.slots || []).map(sl => sl.client).filter(Boolean),
  });
}

/* WHOSE SESSIONS ARE WHOSE. Asked in one place because `Receipts` and `Coupons` are the two halves
   of one split, and two functions doing halves of a split is how a job ends up in both or neither. */
function myJobs_() {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  return USER ? jobs.filter(j => norm(j.client) === norm(USER.name)
                              || norm(j.tutor) === norm(USER.name)) : [];
}

function openJobs_() {
  const mine = myJobs_();
  return (DATA.liveJobs || DATA.jobs || []).filter(j => !mine.includes(j));
}

/* ONE SESSION, ONE PANE.
   Eight stubs on a pane made the pane a list, and the whole point of a pane is that it is ONE
   thing — you swipe to the next rather than scan down. A session is a receipt, and a receipt is a
   document: it gets a card of its own.
   The first pane is the asking. Everything after it is one session each, in the order `bookBlocks`
   already puts them — yours first, then the open ones. */
/* ---------- THE WEEK, AS A GRID -------------------------------------------------------------------
   WHAT A BOOKING LIST CANNOT TELL YOU: whether Tuesday is free. The cards say when each session is,
   one at a time, and a person holding four of them is doing the arithmetic in their head — which is
   the thing a timetable exists to stop.

   ONE WEEK, NOT A DATE RANGE. Every session here repeats weekly at the same hour, so the week IS
   the shape: seven columns, the hours the business runs, and a block where something sits. A
   calendar spread over a term would say the same thing eleven times.

   WHOSE WEEK IT IS depends on who is looking, and that falls out of what the payload already sends:
   a client is only sent their own sessions and the open ones, a tutor is sent what they teach, an
   admin is sent everything. So this draws whatever arrived and needs no rule of its own.

   THE HOURS ARE NOT HARDCODED — the grid runs from the earliest to the latest hour anything is
   actually booked at, so a week with nothing before four in the afternoon does not draw seven empty
   morning rows. */
/* THE WIDGET'S OWN STARTER. `startWidget_` calls this once the container is on screen — see the
   `week` entry in `WIDGETS`. Kept beside `weekGrid` rather than in map.js, because what it draws is
   this file's job and map.js only knows where it goes. */
function initWeek() {
  const el = $('week-body');
  if (el) el.innerHTML = weekGrid();
}

function weekGrid() {
  const jobs = (DATA.liveJobs || DATA.jobs || []).filter(j => {
    /* A session with no day or no time has not been settled yet — a waitlist, or a request nobody
       has put in the diary. It belongs on the list, not in a grid that says where to be. */
    return S_(j.day) && S_(j.time);
  });
  /* ---------- THE GRID, WITHOUT THE CARD AROUND IT ------------------------------------------------
     THIS RETURNED A WHOLE CARD, heading and all, because it was a block in the `You` column. It is a
     widget now — the card and the heading are the widget's, drawn by `WIDGETS` like every other
     tool's — so this returns only the thing that is actually a week. */
  if (!jobs.length) {
    return `<p class="sub">Nothing in the diary yet. Sessions appear here once a day and a time are
      settled.</p>`;
  }

  const DAYS = [['Mon','Mon'],['Tue','Tue'],['Wed','Wed'],['Thu','Thu'],
                ['Fri','Fri'],['Sat','Sat'],['Sun','Sun']];
  const hourOf = t => Number(String(t).split(':')[0]) || 0;
  const spans = jobs.map(j => {
    const h = hourOf(j.time);
    return { j, from: h, to: h + Math.max(1, Number(j.hours) || 2) };
  });
  const first = Math.min.apply(null, spans.map(s => s.from));
  const last  = Math.max.apply(null, spans.map(s => s.to));
  const hours = [];
  for (let h = first; h < last; h++) hours.push(h);

  /* Which days have anything at all. A week where nobody teaches at the weekend should not spend a
     third of a phone screen on Saturday and Sunday. */
  const used = DAYS.filter(([d]) => spans.some(s => norm(s.j.day).indexOf(norm(d)) === 0));
  const days = used.length ? used : DAYS.slice(0, 5);

  const at = (d, h) => spans.find(s =>
    norm(s.j.day).indexOf(norm(d)) === 0 && h >= s.from && h < s.to);

  return `<div class="wk" style="--cols:${days.length}">
      <div class="wk-h"></div>
      ${days.map(([, label]) => `<div class="wk-h">${esc(label)}</div>`).join('')}
      ${hours.map(h => `
        <div class="wk-t">${String(h).padStart(2, '0')}</div>
        ${days.map(([d]) => {
          const hit = at(d, h);
          if (!hit) return '<div class="wk-c"></div>';
          /* THE TOP HOUR CARRIES THE WORDS, the rest of the block is the same colour and empty —
             so a two-hour session reads as one block rather than as the same label twice. */
          const head = hit.from === h;
          return `<div class="wk-c is-on${head ? ' is-head' : ''}"
                       data-do="job" data-id="${esc(String(hit.j.id || hit.j.jobId || ''))}">
            ${head ? `<b>${esc(hit.j.subject || 'Session')}</b>
                      <span>${esc(hit.j.location || '')}</span>` : ''}
          </div>`;
        }).join('')}
      `).join('')}
    </div>
    <p class="faint">Tap a block to open it.</p>`;
}

/* ---------- REPAINTING BOOK WITHOUT LOSING THE PLACE ----------------------------------------------
   The booker is a card on the first page now, so answering a question means redrawing that page —
   not the whole column, which would throw away the pager position of anybody who had swiped down
   to look at an existing session before coming back.

   THE FIRST PAGE ONLY. `bookPages` rebuilds every block from the same job data; only block zero
   can have changed, because only block zero holds the booker. */
/* ---------- REPAINTING THE BOOKER, WHEREVER IT IS -------------------------------------------------
   IT LIVED ON ITS OWN COLUMN and this rewrote that column's first pane. There is no such column:
   the booker is a page on Find, behind "What for · Booking", and answering a question can change
   how many pages there are — the hours grid unfolding, a saved thing starred.

   SO `paintStuff` DOES IT. It already rebuilds the pages around the question page and already
   knows not to touch the search box mid-word, which is exactly the guarantee this needs. One
   repainter for one screen, rather than two that have to agree about what is on it. */
function paintBook_() {
  /* ---------- WHICHEVER SCREEN THE FORM IS ACTUALLY ON -------------------------------------------
     THIS REPAINTED `s-stuff` AND NOTHING ELSE, and it was right for exactly as long as the form
     lived only inside the funnel. `bookingPages_` answers `What for · Booking` there — and it also
     builds the Booking COLUMN, `screen('booking', ...)` a few hundred lines down. Same markup, two
     hosts, and this knew about one of them.

     REPORTED AS "grid not working when click", AND THAT IS THE WHOLE OF IT. On the column, pressing
     an hour ran the handler, toggled `BOOKING.slots`, called `drawBooker()` — and repainted a
     screen that was not even on the display, leaving the cell the SAME DOM NODE it had been before.
     Measured: `BOOKING.slots` came back `["m10"]` with `.hr.on` still at 0. The app's own press log
     named the shape exactly — *"the handler ran and did nothing"*, the fourth of the four causes it
     lists, which is the one that looks identical to the other three from outside.

     AND IT WAS NEVER ONLY THE GRID. Every `drawBooker()` caller is on this path — the edit row, the
     undo, the dropdowns — so on the column nothing derived was redrawing either. A `<select>` shows
     its own new value natively without any help, which is why the answers appeared to work while
     the grid and the running cost did not: the half that needed no repaint was the half that looked
     fine.

     ASKED OF THE DOM, NOT REMEMBERED. `#bookr` is the form's own wrapper and `.screen` is the
     section it is in, so the answer to "where is this drawn" comes from where it IS — the same move
     as `msg-send` walking up to its nearest `.msg-form` and `me-save` to its own container, both
     written after an id was handed to the wrong element. A flag saying which host is in use would
     be a third thing to keep in step with the two that already exist. */
  const host = $('bookr') && $('bookr').closest('.screen');
  const id = host && String(host.id).indexOf('s-') === 0 ? host.id.slice(2) : '';

  /* THE FUNNEL KEEPS ITS PLACE, which is what `paintStuff(true)` is for and what a plain `paint`
     would throw away — the strip of result pages and which one you are on. */
  if (id === 'stuff') { if (typeof paintStuff === 'function') paintStuff(true); return; }

  /* ANY OTHER HOST IS AN ORDINARY SCREEN. `redrawBooker_` puts the scroll back either way. */
  if (id && typeof paint === 'function') { paint(id); return; }

  /* NOWHERE TO BE FOUND — the form is not on screen at all, so there is nothing to repaint and the
     state it just changed is read the next time something draws it. Silent on purpose: this runs on
     every answer, and a toast about an invisible form is noise. */
}

/* `bookPages` WAS HERE — one pane per block for the Book column. `bookingPages_` in find.js does the
   same job for the funnel, which is where the blocks are drawn now. `bookBlocks` is unchanged and
   is what both ever called. */

/* The second argument was a header action — a "Sign in" link in the top right for anybody who was
   not. There is no header, so it went nowhere; the Book screen's own first card already says
   "Sign in to book" with a button on it, which is where somebody is actually looking. */
/* `screen('book')` WAS HERE. A screen with no tab is a screen nobody can reach, and `bookPages` was
   its only caller — the same blocks are pages on Find now, assembled by `bookingPages_` there. */
/* `on('soon')` was here — "Not moved across yet", for screens that had not been rebuilt during
   the rewrite. They all have been, and nothing has carried `data-do="soon"` for a long time. */
on('signin', () => toast('Sign-in screen next'));
/* ================================================================================================
   THE BOOKER.

   Nine things have to be known before a session can be asked for: subject, level, how many
   students, where, which days, what time, how long, for how many weeks, and whether a particular
   tutor. Put on one screen that is a form nobody finishes on a phone.

   SO IT IS THE SAME FUNNEL AS FIND. One question at a time, each answer narrowing the next, and
   the price appearing the moment it can be worked out rather than at the end. Which is not a
   stylistic echo — it is the same problem. A booking is a search through everything you COULD ask
   for, and the questions that matter depend on the answers already given: nobody is asked about a
   tier at KS3, and nobody is asked which room when the venue has one.

   TWO RULES CARRIED OVER, both learned the hard way on the finding screen:

     A QUESTION EVERYONE ANSWERS THE SAME WAY IS NOT ASKED. One venue means no venue question. One
     interval means no interval question. It is not a shortcut, it is the difference between a form
     and a conversation.

     AN ANSWER IS NEVER TAKEN AWAY. Choosing a small room after asking for six students does not
     silently drop you to four. The conflict is SHOWN — the room says why it does not fit — and it
     is yours to resolve. `setOptions` has done this for the old form since the beginning and the
     reasoning is written out there; this obeys the same rule for the same reason.
================================================================================================ */
/* EVERY ANSWER STARTS EMPTY, including the numbers.
   `n` began at 1 and `hours` at 0 — sensible defaults, and both counted as ANSWERED, so the
   booker never asked how many students were coming and quietly booked for one. A default is the
   app answering on somebody's behalf and then showing them the answer as though they gave it,
   which is the same fault `setOptions` was written to avoid on the old form.
   They become numbers in `bookSpec`, which is where a number is actually needed. */
const BOOKING = {
  /* `note` — the free-text line at the foot of the paper. An answer like any other, which is why it
     is here and not read off the box at the moment somebody presses send. */
  note: '',
  subjects: [], level: '', n: '', loc: '', hosting: '',
  /* WHEN A FAMILY ON A WAITING LIST CAN ACTUALLY COME. Only asked of a class — an ordinary session
     picks exact hours on the grid, which is a stronger answer than any of these. */
  avail: [],
  /* `m16` codes — Monday at four. One list replaces days, time and length, because ticking two
     adjacent hours says all three at once. */
  slots: [],
  /* Which questions have been finished with. A multiple-choice question needs telling. */
  done: [],
  /* The addresses of the other families, and whether the question has been put at all. */
  /* WHO ELSE IS SHARING THE COST, stored under the STEP'S OWN ID like every other answer.

     It was `splitWith`, with a second field `splitAsked` saying whether the question had been put
     — two names, neither of them the step's id, for one question. Every other step in this file
     answers at `BOOKING[step.id]`, so this one needed a special case in `bookAnswered_`, another
     in `book-undo`, and a third in the chip row. Three exceptions to a rule that has no other
     exceptions is not a rule.

     `splitAsked` is gone as well, because `done` already does its job: a question you can answer
     several times is finished when you SAY it is, which is exactly the case a list of email
     addresses is — and nought addresses is a real answer that an empty list cannot express on its
     own. `done` was written for the multiple-choice steps and this is one, in everything but the
     shape of the control. */
  split: [],
  /* WHICH OF YOUR OWN CHILDREN THIS IS FOR. Names, chosen from the ones on your account.
     Empty is a real answer and the common one — a parent booking for a friend's children, or for a
     child who has no account here. That is why the seats say "Child" rather than your name: a seat
     is a person and we do not know which, and inventing one is worse than admitting it. */
  kids: [],
  /* A LIST NOW — see the `interval` step. `resetBooking_` reads `st.multi` and would set `[]`
     anyway; this literal is what the form is built from on the very first draw, before anything
     has been reset, and a string here would have `bookPick` push onto a `String` and throw. */
  interval: [], tutor: '', service: '',
};

/* ---------- THE ONE YOU JUST ASKED FOR ------------------------------------------------------------
   SENDING A BOOKING LOOKED LIKE LOSING IT. `resetBooking_()` empties every answer and `load()`
   fetches the new job — so the screen a person was looking at went blank, a toast said "Asked", and
   the twelve answers they had spent a minute on were nowhere. The session existed; it was two
   swipes away under `Booking · Receipts`, which is not where somebody is looking a second after
   pressing send.

   SO THE ANSWER COMES BACK, UNDER THE BLANK FORM. One id, set by whichever of the three send paths
   succeeded, and `askedBlock_` draws that job's receipt below the booker. The form is ready for the
   next booking and the last one is still on the page, which is what "it worked" looks like.

   ONE JOB, NOT A LIST, and that is the whole care here. `bookBlocks` used to draw every live job
   under the form and the note above it says why that went: the funnel already has a searchable
   list of them, and a page holding both is the duplication this file has produced twice. A
   confirmation of the thing you just did is not that list — it is one document, and it is only
   here because you pressed send.

   IN MEMORY, SO IT GOES WHEN THE PAGE DOES. There is nothing to clear and nothing to keep in step:
   asking for a second session replaces it, and a reload drops it, which is right — it is a receipt
   for this visit, not a preference. */
let ASKED_JOB = '';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* The day codes the availability grids are written in. `m16` is Monday at four. */
const SLOT_DAYS = [['m', 'Monday'], ['tu', 'Tuesday'], ['w', 'Wednesday'], ['th', 'Thursday'],
                   ['f', 'Friday'], ['sa', 'Saturday'], ['su', 'Sunday']];

/* ---------- NINE TILL SIX, WRITTEN ONCE ------------------------------------------------------------
   `for (let h = 10; h <= 20; h++)` WAS WRITTEN OUT IN TWO PLACES — `slotGrid()` and the receipt's
   week — and the waiting-list blocks below would have been a third. That is survivable while all
   three agree and is the shape this repository records under `needs_print` / `print_required` and
   under `handle` / `username`: one fact in several places, and nothing comparing them.

   IT MATTERS MORE HERE THAN IT DID, because `SLOT_BLOCKS` is DERIVED from this span. A morning is
   whichever of these hours falls before noon — so moving the day to nine gives the morning block a
   third hour with nothing to edit, and it cannot end up describing hours the grid beside it does
   not offer. That is the note this block carried BEFORE the span moved, written as a hypothetical.
   It is what happened.

   ---------- AND THE SPAN IT MOVED TO IS THE ONE THE SHEET ALREADY HELD ------------------------------
   ASKED FOR AS *"make it go from 9-6 instead of 10- to 8"*, and the two ends were not equally free
   to move. `AVAIL_HOURS` in `constants.gs` is `[9 … 19]` — the hours a tutor's own availability
   grid offers, and the cells `slotGrid` looks a code up in.

   SO THE TWO SPANS DISAGREED AT BOTH ENDS, silently, since the booking grid was written:

     · HOUR 20 HAD NO AVAILABILITY CELL AT ALL. `tAvail['m20']` is `undefined` for everybody, so any
       tutor who had ticked a single hour was unavailable at eight in the evening on every day of
       the week, for ever. The column was drawn, pressable-looking and permanently grey.
     · HOUR 9 HAD ONE AND NOTHING COULD BOOK IT. A tutor ticking nine o'clock was recording a fact
       the booking form never asked about.

   NINE TO EIGHTEEN SITS INSIDE `AVAIL_HOURS` AT BOTH ENDS, so that disagreement is gone rather than
   moved. It is not luck: the span being asked for is narrower than the sheet's on both sides, and
   the rule for anything wider is that `AVAIL_HOURS` has to move first — the column would otherwise
   be grey for everyone the moment they set any hours at all.

   SIX IS INCLUDED, as eight was: a session STARTING at six is a session, and a grid that stops at
   the last start time has to explain itself. Ten columns rather than eleven, which is one fewer box
   sharing the row and so a tenth more width for each of them. */
const SLOT_HOURS = [];
for (let h = 9; h <= 18; h++) SLOT_HOURS.push(h);

/* ---------- MORNING, AFTERNOON, EVENING — THE WAITING LIST'S OWN COLUMNS ---------------------------
   ASKED FOR AS *"i want the grid blocks to form into chunks for morning, afternoon, evening ect."*,
   and it replaces a dropdown of five phrases: `Weekday mornings`, `Weekday afternoons`, `Weekday
   evenings`, `Weekends`, `Flexible`. The old note over that question is still right about WHY the
   answer must be broad — *"asking a family to tick specific hours for a session that may run in six
   weeks is asking them to promise something nobody can promise"* — and wrong about the shape: a
   week is a SHAPE you read, which is the argument the hour grid has carried since it was written,
   and "Weekdays" as one word cannot say that Tuesday is the one evening that does not work.

   PER DAY, SO IT IS THE SAME OBJECT AS THE GRID ABOVE IT. Seven rows, the same day letters, the
   same builder — three columns instead of eleven. A family that means "weekday evenings" presses
   five cells, and a family whose Tuesday is football can say so, which the five phrases could not.

   `from` IS THE ONLY NUMBER, and each block takes the span's hours from there up to the next one.
   Morning is what starts before noon; evening is after five, which is what "after school" and
   "after work" both mean for this business. A block with no hours in the span simply has none. */
/* ---------- `head` IS THE COLUMN LABEL AND `name` IS THE WORD THAT GETS STORED ---------------------
   THEY HAVE TO BE TWO FIELDS, and that is the whole reason this is not a one-line edit. `name` goes
   through `blockPhrase_` into the cell as `Monday morning`, which is what `waitlistWhen` splits and
   tallies on the backend — so shortening it would leave every row written before today saying
   `morning` and every row after it saying `morn`, counted as two different answers. That is two
   spellings of one answer, which is the fault this repository records under `level`, `exam_wave`,
   `topics` and `company`, and the one place it must not happen is a tally somebody reads to decide
   when to open a class.

   SO THE SHORTENING IS VISUAL ONLY. The header is a label on a column; the cell's own `title` and
   `aria-label` are still `blockPhrase_`, so a screen reader and a long press both get the full
   word. Measured at the width the owner asked for: `Afternoon` is 34.5px of ink in a 34.5px box at
   390 and WRAPS ONTO TWO LINES at 320, which makes the header ragged and taller than its own row —
   `Aft` is about 11px in 27.8. */
const SLOT_BLOCKS = [
  { key: 'morning',   name: 'Morning',   head: 'Morn', from: 0 },
  { key: 'afternoon', name: 'Afternoon', head: 'Aft',  from: 12 },
  { key: 'evening',   name: 'Evening',   head: 'Eve',  from: 17 },
];

/* ---------- WHAT THE ROW SAYS, WHICH IS NOT WHAT IS STORED ------------------------------------------
   `Monday evening, Tuesday evening, Wednesday evening` IS WHAT THE GRID WRITES and it is the wrong
   thing to print on a receipt line: measured at 390px with two blocks ticked, that row was 62px —
   three wrapped lines in an 81px value column — and it grows by a line every time somebody presses
   another cell. A row whose height depends on how much of the week suits you is the card changing
   shape under the thumb answering it, which is the fault `SPINE` records about folding.

   SO IT IS GROUPED BY BLOCK AND THE DAYS ARE SHORTENED: `Mon\u2013Fri evenings`, `Sat \u00b7 Sun
   mornings`. At most three phrases whatever is ticked, because there are three blocks — so the row
   has a ceiling rather than growing, and it reads as the sentence somebody would actually say.

   THE STORED LIST IS UNTOUCHED, and that separation is the same one the hour grid already makes:
   `BOOKING.slots` holds `m13, m14` and the row prints `Monday 13:00\u201315:00`, because
   `waitlistWhen` on the backend counts the PHRASES and a grouped string would be one vote for a
   thing nobody ticked. What is drawn is a rendering; what is sent is the answer.

   A RUN OF THREE OR MORE DAYS BECOMES A RANGE, because `Mon \u00b7 Tue \u00b7 Wed \u00b7 Thu
   \u00b7 Fri` is five times the room for one fact, and two is not a run worth a dash: `Mon \u00b7
   Tue` is no longer than `Mon\u2013Tue` and does not claim a span. */
function blockSay_(list) {
  const on = list || [];
  const out = [];
  SLOT_BLOCKS.forEach(b => {
    /* IN THE WEEK'S OWN ORDER, off `SLOT_DAYS`, so Sunday cannot sort to the front. */
    const days = [];
    SLOT_DAYS.forEach(([, label], i) => {
      if (on.indexOf(blockPhrase_(label, b)) !== -1) days.push(i);
    });
    if (!days.length) return;
    const runs = [];
    days.forEach(i => {
      const last = runs[runs.length - 1];
      if (last && last.to === i - 1) last.to = i; else runs.push({ from: i, to: i });
    });
    const short = i => String(SLOT_DAYS[i][1]).slice(0, 3);
    out.push(runs.map(r => r.to - r.from >= 2 ? short(r.from) + '\u2013' + short(r.to)
                         : r.to === r.from ? short(r.from)
                         : short(r.from) + ' \u00b7 ' + short(r.to)).join(' \u00b7 ')
             + ' ' + b.name.toLowerCase() + 's');
  });
  return out.join(', ');
}

/* The hours of one block, off `SLOT_HOURS` — never a second list of numbers. */
function blockHours_(i) {
  const from = SLOT_BLOCKS[i].from;
  const to = i + 1 < SLOT_BLOCKS.length ? SLOT_BLOCKS[i + 1].from : 99;
  return SLOT_HOURS.filter(h => h >= from && h < to);
}

/* ---------- WHAT IS STORED IS THE SENTENCE, NOT A CODE --------------------------------------------
   `Monday morning`, because that is what `waitlistWhen` counts. It splits the event message on
   commas and tallies the phrases, so ANY phrase works and no backend change is needed — and the
   tutor reading "Monday evening · 4 of 4" is reading the answer rather than decoding `m-evening`.

   LOWER CASE ON THE BLOCK, because it is the middle of a sentence and `Monday Morning` is a title
   nobody wrote. The day keeps its capital: it is a proper noun either way. */
const blockPhrase_ = (dayName, b) => dayName + ' ' + b.name.toLowerCase();

/* ---------- WHEN, AS ONE QUESTION -----------------------------------------------------------------
   This was three: which day, what time, how long. It is one, and the reason is written in the old
   file at `onSlotTick` — a session length chosen separately from the hours ticked meant two
   controls describing one thing, and everything that function did existed to force them to agree.
   Tick two hours on Monday and you have said the day, the time AND the length. Tick two more on
   Wednesday and you have a second session a week, which three separate questions could not express
   at all.

   AND IT ONLY OFFERS HOURS SOMEBODY CAN ACTUALLY TEACH IN. The tutor's availability and the
   venue's, overlapped. My three questions offered every hour of every day and would happily have
   booked a tutor who does not work Sundays into a library that shuts at four.
--------------------------------------------------------------------------------------------- */

/** An availability grid as a set of `m16` codes, from whatever shape the payload uses. */
function availSet_(a) {
  const out = {};
  if (!a) return out;
  if (Array.isArray(a)) { a.forEach(k => { out[norm(k)] = true; }); return out; }
  Object.keys(a).forEach(k => {
    const v = a[k];
    if (v === false || v === '' || v === 0) return;
    /* Either `{ m16: true }` or `{ m: [16,17] }` — both shapes exist in the sheet's history. */
    if (Array.isArray(v)) v.forEach(h => { out[norm(k) + String(h).padStart(2, '0')] = true; });
    else out[norm(k)] = true;
  });
  return out;
}

/** Which hours can be booked, and why not when there are none. */
function slotGrid() {
  const t = tutorRow_();
  const sp = spaceFor(BOOKING.loc);
  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(BOOKING.loc));
  const tAvail = availSet_(t && t.avail);
  const vAvail = availSet_((sp && sp.avail) || (venue && venue.avail));
  const haveT = Object.keys(tAvail).length, haveV = Object.keys(vAvail).length;

  /* NOTHING SET IS NOT THE SAME AS NOTHING FREE. A tutor with no hours in the sheet has not said
     they are unavailable — nobody has said anything — so every hour is offered and the sheet is
     the thing to fix. Refusing everything would be the app inventing a constraint. */
  /* ---------- AND WHAT THE TUTOR IS ALREADY TEACHING ---------------------------------------------
     `avail` says when they CAN work; `busy` says when they already are. Two facts, kept apart on
     purpose — see `busyHours` in booking.gs for why un-ticking the availability cell would be
     destructive rather than helpful.

     THE EFFECT IS THE SAME AND THE DAMAGE IS NOT: an hour they are teaching is offered as taken,
     and the moment that session is cancelled the hour comes back on its own, because nothing was
     ever removed from anything. */
  const tBusy = (t && t.busy) || {};
  const open = code => (!haveT || tAvail[code]) && (!haveV || vAvail[code]) && !tBusy[code];
  /* WHY it is not free, so the grid can say. A tutor who does not work Tuesdays and a tutor who is
     already teaching that Tuesday look identical greyed out, and only one of them is worth asking
     about a different week. */
  /* `whyShut` rather than `why` — there is already a `why` below for the grid as a WHOLE ("nobody
     has set any hours yet"), and this is per cell. Two different questions and they were one word
     apart from being the same variable. */
  const whyShut = code => tBusy[code] ? 'teaching ' + tBusy[code]
    : (haveT && !tAvail[code]) ? 'not available'
    : (haveV && !vAvail[code]) ? 'venue closed' : '';

  /* EVERY DAY AND EVERY HOUR, ALWAYS — the ones nobody is free for greyed rather than removed.
     A grid that changes shape as you choose things cannot be read: you cannot tell a Tuesday the
     tutor does not work from a Tuesday that was never offered, and the row moving under your thumb
     as you pick a venue is the same fault the dropdowns had before they started showing WHY an
     option does not fit instead of dropping it. */
  /* THE SPAN IS `SLOT_HOURS` AND THE ARGUMENT FOR ITS TWO ENDS IS WRITTEN THERE — including why the
     late end cannot be pushed past `AVAIL_HOURS` without moving that first. */
  const hours = SLOT_HOURS;
  const rows = SLOT_DAYS.map(([prefix, label]) => ({
    prefix, label,
    hours: hours.map(h => {
      const code = prefix + String(h).padStart(2, '0');
      /* AND WHY NOT, carried on the cell so the grid can say it rather than just greying out. A
         tutor who does not work Tuesdays and a tutor already teaching that Tuesday look identical
         when a box is simply dim, and only one of those is worth trying a different week for. */
      return { h, code, open: open(code), why: whyShut(code) };
    }),
  }));
  const anyOpen = rows.some(r => r.hours.some(h => h.open));

  const why = anyOpen ? ''
    : !haveT && !haveV ? 'Nobody has set any hours yet.'
    : !haveT ? 'That venue is open, but the tutor has no hours set.'
    : !haveV ? 'The tutor has hours, but that venue has none set.'
    : 'The tutor’s hours and the venue’s do not overlap.';
  return { rows, why, anyOpen };
}

/**
 * THE TICKED HOURS, GROUPED INTO SESSIONS.
 *
 * A run of adjacent hours in one day IS a session, and its length IS the session length. Carried
 * over whole from `lessonRuns`, because it is the rule that lets one grid answer three questions.
 */
function bookRuns() {
  /* A LIST, WHATEVER HAPPENED. Anything that writes a string here is a bug elsewhere, and it
     should not become a crash three functions away from its cause. */
  const on = (Array.isArray(BOOKING.slots) ? BOOKING.slots : []).map(c => ({
    day: String(c).replace(/\d+$/, ''), hour: Number(String(c).match(/\d+$/) || 0),
  }));
  const runs = [];
  on.forEach(t => {
    /* The first hour of a run is one with nothing ticked directly before it in the same day. */
    if (on.some(x => x.day === t.day && x.hour === t.hour - 1)) return;
    let hours = 1;
    while (on.some(x => x.day === t.day && x.hour === t.hour + hours)) hours++;
    const dayName = (SLOT_DAYS.find(d => d[0] === t.day) || [])[1] || t.day;
    runs.push({ day: t.day, dayName, hour: t.hour, hours });
  });
  /* ---------- IN THE WEEK'S OWN ORDER, OFF `SLOT_DAYS` -----------------------------------------
     THIS SORTED THE CODE PREFIXES ALPHABETICALLY — `f`, `m`, `sa`, `su`, `th`, `tu`, `w` — which is
     Friday, Monday, Saturday, Sunday, Thursday, Tuesday, Wednesday. Measured: a Monday-and-Friday
     booking, which is the commonest two-day shape there is, came back `Friday, Monday`.

     AND IT IS NOT ONLY THE READING ORDER, because three things are taken from the FIRST run. The
     day list goes on the receipt and into the job's `weekday` cell; `time` is the first run's hour
     and becomes `start_time`; `hours` is the first run's length and becomes `hours_per_session`,
     which `priceLooksWrong` then measures the total against. So a Monday 10-12 with a Friday 16-18
     recorded its start as 16:00, and a Monday 10-12 / Wednesday 15-16 / Friday 09-12 recorded a
     three-hour session because Friday sorted first. The comment above says the first run names the
     session, and it meant the first of the WEEK.

     THE TOTAL IS UNAFFECTED, which is why nothing showed: the money is built from `hoursPerWeek`
     and the real session dates (see `priceFrom`), and both are sums over every run.

     `blockSay_` ALREADY LEARNED THIS — *"in the week's own order, off `SLOT_DAYS`, so Sunday cannot
     sort to the front"* — on the waiting list's week, written months after this one. One lesson,
     applied to one of the two weeks, which is this repository's oldest shape. */
  const dayAt_ = d => { const i = SLOT_DAYS.findIndex(x => x[0] === d); return i === -1 ? 99 : i; };
  return runs.sort((a, b) => dayAt_(a.day) - dayAt_(b.day) || a.hour - b.hour);
}

/* Every question, in the order somebody assembles a booking: WHAT, then WHO FOR, then WHERE, then
   WHEN, then HOW LONG, then WHO BY. `multi` means several answers are normal rather than an edge
   case — two subjects in one session is a thing people do, one venue is not.
   `why` is what makes an option that does not fit visible instead of absent. */
/* IS THIS A SHARED CLASS. Asked in one place and read everywhere, because the alternative is the
   same string comparison written nine times and one of them eventually spelt differently. */
/* ---------- WHICH BRANCH, AND WHY THE NAME CHANGED -----------------------------------------------
   IT WAS CALLED `isClass_` AND IT MEANT THE WAITING LIST. That was survivable while the button said
   "a shared class", and it is actively misleading now the two are called "start a class" and "join
   a waiting list" — because under the old name, the branch for STARTING a class was the one where
   `isWaiting_()` returned FALSE. A reader would have to test it to believe it.

   The real difference is waiting, so the name is `isWaiting_` and the test looks for "wait".
   Matched as a substring rather than the whole string, so rewording the button again cannot
   silently send every booking down the wrong branch. */
/* THE ANSWER FOR A SEAT NOBODY HAS DECIDED ABOUT. Named once so the option, the check that exempts
   it from the seat cap, and the roster that turns it into "Child" all mean the same string — three
   copies of a literal is two chances to change one and not the others. */
const UNNAMED = 'Someone else';

/* THE ANSWER THAT MEANS THE LIST HAS NOBODY ON IT YET. Named once, because the option, the refusal
   on the session branch and the send that turns it into `openWaitlist` all have to mean one
   string. */
const NOBODY = 'Nobody yet — just open it';

const isWaiting_ = () => /wait/i.test(String(BOOKING.how || ''));

/* ---------- THE CLASSES ON OFFER, NAMED FOR A DROPDOWN --------------------------------------------
   WHAT SOMEBODY NEEDS TO TELL TWO APART: what is taught, where, and how much room is left. The day
   and the time are deliberately absent — a waiting list has neither until it fills, which is the
   whole difference between it and an instant class.

   ONE FUNCTION, because the label is also the KEY. A step stores the string somebody chose, so
   finding the job again means matching that string — and a second copy of this, written slightly
   differently, would match nothing and silently drop the class from the booking. */
const NEW_LIST = 'Start a new one';

function openClassLabel_(j) {
  const left = Math.max(0, (Number(j.maxKids) || 0) - (Number(j.currentKids) || 0));
  /* WHEN IT RUNS, FOR ONE THAT ALREADY DOES. A waiting list has no day — that is what makes it a
     list — but an instant class does, and it is the fact somebody choosing between two of them
     needs most. Left off where there is none rather than printed empty. */
  const when = isWaitJob_(j) ? '' : [j.weekday, j.time].filter(Boolean).join(' ');
  return [j.subject || 'Class', j.location || j.venue, when,
          left ? left + ' seats left' : 'full']
    .filter(Boolean).join(' · ');
}

/* ---------- A LIST AND A CLASS ARE JOINED DIFFERENTLY -------------------------------------------
   `kind` IS ON THE PAYLOAD and says which. A waiting list is a thing that exists to be joined —
   you buy a seat and the server prices it. A class that is already running belongs to the family
   who booked it, and joining is a REQUEST to them.

   BOTH ARE JOINABLE AND ONLY ONE WAS OFFERED. The form asked "a list already going, or a new one?"
   only after somebody said "waiting list class", so a class with two seats left and a subject you
   wanted was invisible unless you happened to be looking at the right card. `canAsk` — computed by
   the backend, which knows whether the owner opened it to others — has been on every one of them
   the whole time. */
const isWaitJob_ = j => norm(j && j.kind) === 'waitlist';

/* The job behind the chosen label, or null for "start a new one" and for a class that has gone
   since the page loaded. */
function joinedJob_() {
  const v = BOOKING.joining;
  if (!v || v === NEW_LIST) return null;
  return (openJobs_() || []).find(j => openClassLabel_(j) === v) || null;
}

const BOOK_STEPS = [
  /* ---------- WHICH OF THE TWO THINGS THIS IS -----------------------------------------------------
     THEY ARE NOT THE SAME PRODUCT AND THE FORM CANNOT PRETEND THEY ARE.

     A session of your own is a negotiation: you pick the subjects, the level, the seats, the venue,
     the day, the term, and a tutor if you have a view. Everything about it is yours to set, and the
     price falls out of what you chose.

     A shared class is the opposite of all of that. One seat, Maths and English, no tutor to pick,
     no day yet — and a price that is FIXED before anybody joins, because four families are buying
     the same seat and have to be shown the same number. What you choose is the venue and the level,
     and that is genuinely all.

     SO IT FORKS HERE, at the first question, and every question that belongs only to a session
     offers nothing when the answer is a class. `nextBookStep` skips a question with no options —
     the same rule that already hides the children question from somebody with no children — so the
     fork needs no new machinery and cannot fall out of step with itself. */
  /* ---------- THE TRADE-OFF, SAID PLAINLY ---------------------------------------------------------
     THE TWO OPTIONS SAID "A session of your own" AND "A shared class — join the waiting list",
     which describes the paperwork and not the choice. Somebody reading that has no idea which one
     costs more, which one is certain, or what they are giving up either way — and it is the only
     question in the form where the two answers lead to genuinely different bargains.

     WHAT THE CHOICE ACTUALLY IS:

       BOOK IT YOURSELF — certain, and you carry the cost. The time is yours from the moment you
       pay. Take every seat and it is private; take one and the rest may fill up later, which
       brings the price down for everybody. You do not have to wait to find out.

       JOIN A CLASS — cheaper, and it is a gamble. One seat, a fixed price per child, and it only
       runs if enough others take a seat too. Nothing is charged until it does.

     `why` CARRIES THE DETAIL rather than the label, because a label long enough to explain a
     bargain is a label nobody finishes reading. The short version is on the button and the reason
     sits under it. */
  /* ---------- THE TRADE-OFF, IN ONE LINE EACH -----------------------------------------------------
     `why` IS CALLED ONCE PER OPTION, WITH THAT OPTION. I ignored the argument and returned the same
     two paragraphs both times — so each button carried the full explanation of BOTH choices,
     including the one it was not. Every word on the screen twice, and half of it describing the
     button next to it.

     ONE SHORT LINE EACH, and it names the thing that differs rather than everything that is true.
     What separates these two is certainty against price: one is yours the moment you pay, the other
     is cheaper and might not happen. That is the whole decision, and it fits on a line. */
  /* ---------- WHO IT IS FOR IS THE FIRST QUESTION ------------------------------------------------
     ASKED FOR AS *"the 'for' field should be before 'Kind'"*, and the order of this list IS the
     order of both documents — so moving the question moves the row on the form and on the receipt
     together. It reads the way somebody says it out loud: who this is for, then what kind of thing
     it is. It was last because it is admin-only and skips itself for everybody else, which is an
     argument about who is asked rather than about where it belongs.

     THE FIVE ROWS PINNED TO IT HAD TO COME OFF, and that is the half that would have gone wrong in
     silence. `Dates`, `Note`, `About`, `A seat` and `Shared by` were pinned `after: 'For'` because
     `For` was the last question — so moving it to the front would have carried the dates, the note
     and the two waiting-list lines up to the top of the card with it. They are pinned to the TAIL
     now instead, which is what they were always for: a foot that does not care which question
     happens to be last is a foot that survives the next reordering. Same fault the note over the
     old pinning already records about using an index.

     `check-spine.js` IS WHAT MAKES THIS SAFE TO DO AT ALL — one order, both documents, and a row
     that falls off the spine is a failure rather than a row quietly drawn somewhere else. */
  /* NO TUTOR TO CHOOSE. The class is priced against a tutor nobody picked, which is precisely
     what makes the seat cost what it costs. */
  /* ---------- WHOSE BOOKING IT IS ------------------------------------------------------------------
     ADMIN ONLY, AND IT SKIPS ITSELF FOR EVERYBODY ELSE. A client has exactly one answer to this and
     being asked it is being asked to confirm they are themselves — so the options list comes back
     empty and `nextBookStep` passes over it, which is the same rule that already hides the children
     question from somebody with no children. No new machinery, and nothing to keep in step.

     WHY AN ADMIN NEEDS IT: somebody rings up and you book it for them. Without this the receipt
     says the booking belongs to whoever was holding the phone, which is you. */
  { id: 'client', label: 'Who is this for?', short: 'For',
    /* WHOEVER IS SIGNED IN, UNTIL SOMEBODY SAYS OTHERWISE. The same expression `bookPrice`,
       `breakdownRows` and the submitted job have each carried privately — said once here instead,
       so the row cannot disagree with what is actually sent. */
    fallback: () => (USER && USER.name) || '',
    options: () => {
      if (!isAdmin()) return [];
      const me = (USER && USER.name) || '';
      /* `DATA.people` AND `hasRole_` BOTH NEVER EXISTED — I wrote them from memory of what a
         codebase like this usually has. The payload sends `tutors` and `students` and now
         `clients`, filtered server-side to admins, which is the right place for that decision:
         a list the browser has to be trusted not to show is a list that has already been sent. */
      const names = (DATA.clients || []).map(p => p.name).filter(Boolean);
      /* ---------- AND NOBODY AT ALL, WHICH IS HOW A LIST IS OPENED ---------------------------------
         EVERY OPTION WAS A PERSON, so an admin could not say "this is for nobody yet" — and that is
         exactly what opening a waiting list before a campaign IS. The list has to exist with zero
         families on it, so the first person who arrives finds one to join rather than one to start.

         FIRST IN THE LIST ON A WAITING LIST, LAST OTHERWISE. On the waiting-list branch it is the
         likely answer; on an ordinary booking it is a strange one, and the order should say which.

         A SESSION FOR NOBODY IS STILL REFUSED — see `why` below. Nobody sits in the chair at a
         session somebody booked outright, and offering it there would be offering a booking that
         cannot happen. */
      const people = [me].concat(names.filter(n => norm(n) !== norm(me))).filter(Boolean);
      return isWaiting_() ? [NOBODY].concat(people) : people.concat([NOBODY]);
    },

    /* A SESSION FOR NOBODY IS REFUSED — nobody sits in the chair at a session somebody booked
       outright, so offering it there would be offering a booking that cannot happen. */
    why: v => (v === NOBODY && !isWaiting_())
      ? 'a session needs somebody in it — this opens a waiting list' : '',
    /* ---------- "your own booking" WAS HERE AND IT WAS THE ROW READ BACK TO YOU -----------------
       REPORTED AS *"There seems to be writing under one of the fields at the top. It's redundant or
       unnecessary."* It was the first note on the card, under the first field, and it printed
       `your own booking` beneath a row already reading `For — <your own name>`. One fact drawn
       twice, which is the fault this repository records where the roster's `name` put an `<h3>`
       above every widget's own heading: both were correct, and both were on the screen at once.

       THE OTHER BRANCH STAYS, because it is not the row said again. `Nobody yet — just open it` is
       what you PICKED; *the list opens empty, and families join it* is what happens NEXT, and
       nothing else on the card says it. That is the line between a note worth its thirteen pixels
       and a caption. */
    note: v => v === NOBODY ? 'the list opens empty, and families join it' : '' },

  { id: 'how', label: 'How would you like to book?', short: 'Kind',
    /* BOTH ARE "START", because both are things you set going — the difference is whether it runs
       now or waits for company. "Join a waiting list" was wrong twice over: there may be no list to
       join, and you are the one opening it. */
    /* THE TWO KINDS, NAMED. "Start a class" and "Start a waiting list" describe the ACT; what a
       family ends up with is an INSTANT CLASS or a WAITING LIST CLASS, and those are the words that
       belong on the card afterwards too. Naming the thing rather than the button lets the form, the
       receipt and the saved job all say the same noun.
       `isWaiting_` still matches on "wait", which both old and new wording contain. */
    options: () => ['Instant class', 'Waiting list class'],
    /* A NOTE, NOT A REFUSAL — both of these are things you may pick. */
    note: v => /wait/i.test(String(v))
      ? 'Cheaper, but it waits — it runs once enough others take a seat.'
      : 'It happens. Yours from the moment you pay, and others can join later.' },

  /* ---------- JOINING ONE, OR STARTING ONE ----------------------------------------------------------
     THE OPEN CLASSES WERE CARDS IN FIND, each with a "Take a seat" button — a whole findable kind
     for a handful of rows, and a second way to make a booking that did not look like the first one.
     Somebody wanting a class had to know to go looking for one; somebody filling in this form was
     never told they existed.

     THEY ARE AN ANSWER TO A QUESTION THIS FORM WAS ALREADY ASKING. "Waiting list class" is chosen
     one row above; the only thing left to know is whether it is a list that already exists or a new
     one, and that is a dropdown like every other field on the paper.

     "START A NEW ONE" IS FIRST AND IS NOT A CLASS. Opening a list and joining one are both waiting
     list classes and the form has to let you say which — leaving it out would mean nobody could ever
     open the first list at a new venue.

     ASKED ONLY WHEN IT APPLIES. An empty option list is how every other step here says "not this
     time", and `nextBookStep` skips one — so on an instant class this row does not exist. */
  { id: 'joining', label: 'Something already going, or a new one?', short: 'Class',
    /* THE ONES OF THE KIND BEING ASKED FOR. Say "waiting list" and the lists are offered; say
       "instant" and the classes already running with room in them are. Nothing is offered before
       the kind is chosen, because the two are joined by different verbs and a mixed list would ask
       somebody to tell them apart from a label. */
    options: () => {
      if (!BOOKING.how) return [];
      const want = isWaiting_();
      return [NEW_LIST].concat((openJobs_() || [])
        .filter(j => isWaitJob_(j) === want)
        .filter(j => want || j.canAsk)
        .map(openClassLabel_));
    } },

  /* A CLASS IS MATHS AND ENGLISH, and that is what the class IS rather than something to pick.
     Written into the booking below so the receipt and the backend agree without asking. */
  /* ---------- IT WAS ALWAYS MULTI AND NOTHING ON THE CARD SAID SO --------------------------------
     ASKED FOR AS *"subject drop down should allow multi select"*, and measured before anything was
     changed: `multi: true` has been on this step since it was written, the `change` handler
     toggles rather than replaces, a chosen option comes back with a ✓ in front of it, and the row
     reads "Maths, English Language" once two are picked. Every part of it works.

     WHAT WAS MISSING IS THE SENTENCE. A closed dropdown showing "—" is a dropdown you pick ONE
     thing from, everywhere else anybody has used one — so nothing invited a second tap, and a
     feature nobody knows is there is a feature that is not. The note is drawn under the row now
     (see `stepRows_`, which found seven of these written and drawn nowhere), which is the one place
     it can be said without a second control to keep in step.

     IT SPEAKS WHILE THERE IS SOMETHING TO SAY. Once two are chosen the row says so itself and the
     line would be explaining a thing already on the screen — the fault this file records where the
     roster's name printed an `<h3>` above every widget's own heading. */
  { id: 'subjects', label: 'What are we working on?', short: 'Subject', multi: true,
    options: () => isWaiting_() ? [] : (subjectRows() || []).map(x => x.name),
    note: () => (BOOKING.subjects || []).length > 1 ? ''
      : 'Pick as many as apply \u2014 choosing again adds one, and a ticked one comes back off.' },

  { id: 'level', label: 'What level?', short: 'Level',
    options: () => ((DATA.dropdowns || {}).levels || []) },

  /* ONE SEAT EACH. The price is the room and the teaching divided by the seats, so a family
     taking two would be buying half the class at a quarter of the cost. */
  /* ---------- HOW MANY SEATS, AND WHAT THE REST OF THEM COST YOU ---------------------------------
     THE NUMBER IS NOT JUST A HEAD COUNT. Take every seat and the session is private and you pay for
     all of it; take fewer and the empty ones may fill later, which brings the price down for
     everybody who is in it. That is the second half of the bargain the fork above offered, and the
     question asked it as though it were only arithmetic. */
  /* ---------- HOW MANY EXTRA, NOT HOW MANY IN TOTAL -----------------------------------------------
     "HOW MANY SEATS" MADE SOMEBODY COUNT THEMSELVES IN. A parent booking for one child had to work
     out that the answer was 1, and a parent wanting one other family had to work out that it was 2
     — arithmetic in a question that should not need any.

     THE VALUE IS STILL THE TOTAL. `n` is read by the pricing, the room capacity and the roster, and
     changing what the number MEANS would put every one of them out by one. `label_` changes only
     what is written on the option, so the question reads in extras and the booking still stores the
     count everything downstream expects. Presentation moved; the data did not. */
  /* ---------- WHO TEACHES IT IS ASKED EARLY, NOT LAST -----------------------------------------------
     IT WAS THE FINAL QUESTION, and on the receipt that put `Tutor` twenty rows down among the
     arithmetic — under the term rows and `Split` — when it is one of the three things
     anybody actually looks for. The order of this list IS the order of both documents now, so
     moving the question is the whole change: the form asks it here and the receipt prints it here.

     AFTER `Level` AND NOT BEFORE `Subject`, because the tutor list is filtered by what and at what
     level — asking who before what would offer everybody and then quietly narrow it. Subject, level,
     then who, which is the order somebody says it out loud.

     THE ROWS PINNED AFTER IT MOVE TOO, so they are re-pinned to `For` — the last question now.
     `Dates`, `Note` and the two waiting-list lines belong at the foot, not beside the tutor. */
  { id: 'tutor', label: 'Anyone in particular?', short: 'Tutor',
    options: () => isWaiting_() ? [] : ['No preference'].concat(
      (DATA.tutors || []).filter(t => t.listed !== false && t.title).map(t => t.title)),
    why: v => {
      if (v === 'No preference') return '';
      const t = (DATA.tutors || []).find(x => norm(x.title) === norm(v));
      if (!t || !BOOKING.subjects.length) return '';
      const teaches = (t.teaches || []).map(x => norm(String(x).replace(/\s*\([^)]*\)/, '')));
      const missing = BOOKING.subjects.filter(sub => teaches.indexOf(norm(sub)) === -1);
      return missing.length ? 'does not teach ' + missing.join(', ') : '';
    } },
  { id: 'n', label: 'How many extra seats?', short: 'Seats',
    label_: v => Number(v) === 1 ? 'Just mine'
      : Number(v) === 2 ? 'One more seat'
      : (Number(v) - 1) + ' more seats',
    options: () => {
      /* A class is one seat and the seat is the price, so there is nothing to choose. */
      if (isWaiting_()) return [];
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      const out = [];
      for (let i = 1; i <= Math.min(12, lim.max); i++) out.push(String(i));
      return out;
    },
    /* THE REFUSALS ONLY: a number outside what the room and the tutor allow. */
    why: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      if (Number(v) > lim.max) return 'more than ' + (lim.why.max || 'the limit') + ' allows';
      if (Number(v) < lim.min) return (lim.why.min || 'the minimum') + ' needs ' + lim.min;
      return '';
    },
    /* AND WHAT EACH NUMBER MEANS, which is a note — every one of these is pickable. */
    note: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      if (Number(v) > lim.max || Number(v) < lim.min) return '';
      /* SAID AGAINST THE NUMBER THEY HAVE PICKED, not as general advice. "Others may join" means
         nothing until you know whether you have left room for them, and the answer is different
         for every number on this list. */
      /* THE TOP OPTION READS AS A CONTRADICTION OTHERWISE. Labelled "3 more seats" and noted "the
         whole session, privately" — more people and private at once. It IS private, because the
         extra seats are yours and nobody else can take them, and that is the thing to say. */
      if (Number(v) >= lim.max) return 'the room is yours — nobody else can join';
      /* THE VERB HAS TO AGREE TOO. "the other 1 seat stay open" — I pluralised the noun and left
         the verb, which is the half-done version of this fix and reads worse than not bothering.
         And "1" written as a numeral where a word belongs: "the last seat" is what a person says. */
      /* THE TAIL WAS THE SAME ON EVERY OPTION — "if somebody takes one, everybody pays less" under
         all four, which is three repetitions of a fact that only needs stating once. What differs
         is the number of seats left, so that is all each line says now. */
      const left = lim.max - Number(v);
      return left === 1 ? 'one seat left open for somebody else'
                        : left + ' seats left open — a cheaper session if they fill';
      /* THE WHY STILL COUNTS IN SEATS REMAINING, which is the same fact either way — how many are
         left does not depend on whether you counted yourself in. */
    } },

  { id: 'loc', label: 'Where?', short: 'Venue',
    options: () => ['At home'].concat(bookableSpaces().map(x => x.label)),
    why: v => {
      const sp = spaceFor(v);
      /* The seat count is already chosen by now, so a room too small says so rather than
         quietly resetting it. */
      if (sp && Number(sp.max) && BOOKING.n > Number(sp.max)) {
        return 'holds ' + sp.max + ', you asked for ' + BOOKING.n;
      }
      return '';
    } },

  /* "I'LL HOST" IS A CHOICE, and it was an inference — turned on only when somebody picked "At
     home", so a client who wanted to provide the room at a paid venue could not say so and never
     saw the saving. The rule the pricing chain has always followed is written at `const V`: the
     client provides the space, so they pay no venue rent, and it is AUTO-ON AND LOCKED for a venue
     that costs nothing.
     Locked is what `nextBookStep` already does with a one-answer question — a free venue offers
     only "Yes", so it is filled in and never asked. Nothing special is needed for the lock; it
     falls out of the rule that a question with one answer is not a question. */
  /* A CLASS IS AT A VENUE. Somebody's front room is not a place three other families are going. */
  { id: 'hosting', label: 'Are you providing the space?', short: 'Space',
    options: () => {
      if (isWaiting_()) return [];
      const rate = venueRate_();
      /* Nothing to charge means nothing to decide: hosting is already true and asking would be
         the app consulting somebody about a fact. */
      return rate > 0 ? ['No', 'Yes'] : ['Yes'];
    },
    /* The saving was spelled out here and it is already on the card: the Host row shows
       − £15.00/h against the venue's + £15.00/h, one line apart. Saying it twice made the option
       longer to read than the question. */
    label_: v => v === 'Yes' ? 'Yes — no room hire' : 'No — we book the room' },

  /* ONE QUESTION WHERE THERE WERE THREE. `days`, `time` and `hours` all described the same
     fact, which is the mistake the old file had already found and removed: two controls for one
     thing means code whose whole job is making them agree.
     `grid` rather than a list, so it is drawn by hand below rather than as options. */
  /* NO DAY YET. It is settled when the list fills — a time promised now is a promise about a room
     nobody has booked, made to four families who have not all joined. */
  /* `grid: 'hours'` RATHER THAN `true`. There are two weeks on this form now — eleven hours for a
     session, three blocks for a waiting list — and `stepRows_` renders their values differently:
     one is `bookRuns()`, a span with a start and an end, and the other is a list of phrases. A
     boolean could not tell them apart and the runs branch would have run over the blocks. */
  /* ---------- `week: true` MAKES THIS STEP SEVEN ROWS RATHER THAN ONE -----------------------------
     `short` IS NOT A LABEL ANY MORE, IT IS AN ANCHOR. No row is drawn called "When": the seven days
     are the questions and `SPINE` holds their names in this step's place. What `short` still does is
     hold the position — `SPINE_EXTRA`'s `{ after: 'When', row: 'Per session' }` pins itself to it,
     so that row lands after Sunday without naming a day. */
  { id: 'slots', label: 'When?', short: 'When', grid: 'hours', week: true,
    options: () => isWaiting_() ? [] : slotGrid().rows.length ? ['grid'] : [] },

  /* ---------- WHEN COULD YOU COME? ----------------------------------------------------------------
     A CLASS HAS NO DAY YET, and that is the whole reason to ask this. An ordinary session picks
     exact hours off the grid — a stronger answer than any of these, which is why the grid question
     is the one a class does not get. A waiting list is four families who have not met, and the day
     is chosen AFTER they have all joined. Somebody has to know what would suit them.

     BROAD, NOT EXACT. Asking a family to tick specific hours for a session that may run in six
     weeks is asking them to promise something nobody can promise — and four exact grids rarely
     overlap at all, so the answer would be no class. "Weekday evenings" from four families is
     something you can actually schedule against.

     SEVERAL ANSWERS, because most families have more than one. And `Flexible` is on the list
     rather than implied by ticking everything: a parent who means "whatever suits you" should be
     able to say it in one tap, and it reads differently from six ticks — one is a preference and
     the other is an offer.

     IT IS NOT STORED ON THE JOB. Four families on one list have four different answers, and the
     job is one row — so it goes on each family's own JOINING EVENT, where it is theirs by
     construction and needs no column. See `joinWaitlist`. */
  /* ---------- "FREE" MEANT FREE OF CHARGE TO EVERY READER --------------------------------------
     The question is "when could you come?" and the column said `Free`, on a card whose other
     columns are money. Nobody reads that as availability — they read it as a price of nothing, on a
     row sitting two lines from a running total.

     `When free` IS NINE CHARACTERS and the column holds nine. It also pairs with `When` directly
     above it, which is the settled day for an instant class; these are the two halves of the same
     question and now look like it. */
  /* ---------- AND IT IS THE WEEK NOW, NOT FIVE PHRASES -------------------------------------------
     IT WAS A MULTI-SELECT: `Weekday mornings`, `Weekday afternoons`, `Weekday evenings`,
     `Weekends`, `Flexible — whatever suits`. Everything the note above says about the answer being
     BROAD is still true and is why the columns are blocks rather than hours; what changed is that
     the week is drawn, which is the argument the hour grid has always carried — *"which hours are
     free across a week is a SHAPE"* — and five phrases in a dropdown destroyed exactly that.

     `grid: 'blocks'` MAKES `stepControl_` DRAW NOTHING and `stepGrid_` draw the week, which is the
     path the When row has taken since the panel was removed. `multi` stays because the answer is
     still a list and `BOOKING.avail` is still initialised to `[]` by the same line.

     `options` IS EMPTY AND THAT IS NOT WHAT LOCKS IT. `stepLocked_` tests `st.grid` FIRST, so a
     grid step is answerable with no options — which is how the hour week has always worked. */
  /* ---------- AND IT IS NOT ON AN ORDINARY BOOKING AT ALL -------------------------------------
     REPORTED AS *"When free field is redundant now as we are using the grid bit."* Measured on the
     ordinary form: a row reading `When free  —`, with no control, no week and nothing that can ever
     fill it — directly under the When row, which had just answered the same question to the hour.
     `stepGrid_` draws the blocks only on the waiting branch and `options()` is empty, so
     `stepControl_` draws nothing either: a question with no way to answer it, printed under the
     answer.

     THE RULE IS THE ONE `only:` ALREADY STATES on `SPINE_EXTRA`, and the distinction it draws is
     the whole of why this is a deletion rather than a lock. A row you have not answered YET keeps
     its dash — you are about to answer it, and a line appearing under your thumb moves everything
     below it. A row this BRANCH can never answer was never on this document: an ordinary booking
     does not become a waiting list.

     `When` IS NOT MARKED AND THAT ASYMMETRY IS DELIBERATE. On a waiting list it is a dash too — and
     it says *no day yet*, which is TRUE of that booking and becomes a real day once the list fills.
     `When free` on an instant booking is not a fact about the booking; it is a question already
     answered one row above, more precisely, by the grid that prompted this. */
  { id: 'avail', label: 'When could you come?', short: 'When free', multi: true,
    only: 'wait',
    grid: 'blocks', week: true, options: () => [], why: () => '' },

  /* AND NO TERM, for the same reason as the day. */
  /* ---------- SEVERAL TERMS, BECAUSE A BOOKING IS RARELY ONE OF THEM ------------------------------
     ASKED FOR AS *"Let term be multi select."* It was one choice, so a family who wanted the whole
     of the autumn had to book Autumn 1 and then book Autumn 2 — two jobs, two prices, two receipts,
     for one arrangement that never changes. Every other question on this form that can have more
     than one answer already takes them.

     THE SESSIONS ARE COUNTED PER TERM AND ADDED, NOT FROM THE FIRST START TO THE LAST END. That
     distinction is the whole of why this is worth more than one line: `Autumn 1` and `Autumn 2` have
     the October half term between them, and a window drawn end to end would bill a family for a week
     the school is shut. `bookSpec` sends `windows`, one per chosen term, and `priceFrom` walks
     them — see the note there.

     `multi: true` IS ALL THE CONTROL NEEDED. `stepControl_` already draws a toggling dropdown with
     a tick beside what is chosen, `bookPick` already toggles, `bookAnswered_` already reads a list,
     and `stepRows_` already joins one for the row. Nothing about this step is special except what
     it means. */
  /* ---------- AND ON A WAITING LIST IT ANSWERS ITSELF ----------------------------------------
     THE QUESTION IS NOT ASKED ON THAT BRANCH and the card still has to say when. `fallback` is the
     hook the `client` step already uses for exactly this shape — *"the row shows what the booking
     would be submitted as, which is the only honest thing for it to show"* — and here what it would
     be submitted as is whatever term is running. Nothing is written into `BOOKING`, so `bookSpec`
     still prices from an empty list and a family has answered nothing they did not answer. */
  { id: 'interval', label: 'Over what period?', short: 'Term', multi: true,
    fallback: () => { const t = isWaiting_() ? waitTerm_() : null;
                      return t ? (t.label || t.term) : ''; },
    options: () => isWaiting_() ? [] : (DATA.intervals || []).map(x => x.label || x.term).filter(Boolean) },

  /* SHARING THE COST. The pricing chain divides by `splitShares` and has since the beginning —
     three families in one session each pay a third — and the form never set it, so the feature
     existed and could not be reached. It is asked last but one because it changes the price
     without changing the session. */
  /* NAMING SOMEONE IS SPLITTING WITH THEM. The old form learned this the hard way: a count
     chosen separately from the addresses is two statements of one fact, and choosing three while
     naming two leaves neither the price nor the invitation list knowing which is true.
     So there is no number to pick. The count IS how many addresses have been given. */
  /* SHARING IS THE WHOLE PRODUCT here — there is nobody to invite, because the other three seats
     are for whoever joins the list. */
  { id: 'split', label: 'Sharing the cost with anyone?', short: 'Split', emails: true,
    options: () => isWaiting_() ? [] : ['emails'] },

  /* ---------- WOULD YOU SHARE WITH SOMEBODY YOU DO NOT KNOW? --------------------------------
     ASKED, NEVER ASSUMED, and this is the question the whole join mechanism rests on.

     The step above takes email addresses — families you already know and are inviting. This is a
     different question: whether a family you have never met may ask to join. Nothing had ever put
     it, and without it the only way to open a session to strangers would be to decide on their
     behalf that a shared booking means a public one. It does not.

     WHY IT IS WORTH ASKING AT ALL. A session with one child in it and three seats going is three
     empty chairs the tutor is paid for by one family. Somebody joining makes it cheaper for both
     and fuller for you, which is the whole economics of group tuition — but only if the family
     whose booking it is said yes first.

     DEFAULT IS NO, by being a question with two answers and no preselection. A default of yes on a
     question about who may sit with your child is a default nobody should be handed. */
  /* THE JOIN QUESTION WAS HERE, AND IT ASKED SOMETHING THE SEATS ALREADY ANSWER.
     "May another family join this?" is a checkbox about sharing, and a family who wants the room to
     itself buys the remaining seats — which is a decision made with money, in the same form, and
     unambiguous in a way a tick is not. One fewer question between somebody and a booking.

     SO EVERY ORDINARY SESSION IS OPEN, and that is the half worth saying out loud: `open_to_others`
     still exists and the backend still refuses a join without it, so leaving it FALSE would have
     switched the whole join mechanism off rather than opening it up. It is written TRUE in
     `receipt.js`, and the seats decide. */

  /* ---------- WHOSE CHILDREN ARE THESE? -----------------------------------------------------
     A parent with three children on their account books three seats, and until now every one of
     those seats was anonymous — so the tutor arrived at a library knowing a booking existed and
     not who was coming, and you could not tell one of Danile's bookings from another.

     ONE TICKLIST, NOT A YES/NO EACH. Three children is three questions and six taps to say what
     one list says in one or two, and the ticklist has an answer the questions do not: ticking
     NOTHING means none of them, which is a parent booking for somebody else's children and is a
     perfectly ordinary thing to do. A run of yes/no cannot say that without you answering No three
     times to get to the same place.

     Only asked of somebody who HAS children on their account, and only when there are seats to put
     them in — `nextBookStep` skips a question with no options, so a client with none never sees it
     and nothing has to remember that. */
  { id: 'kids', label: 'Which of your children is this for?', short: 'Child', multi: true,
    /* EVERY CHILD IS OFFERED. This used to hand back only as many names as there were seats —
       so booking two seats showed Danile two of her three children and she could not choose WHICH
       two. The seat count limits HOW MANY you may tick, and it has never had anything to say about
       which names exist.

       That is the same mistake `why` was written to prevent, one line further down: an option that
       does not fit is MARKED with the reason and left on the list, because a list that quietly
       drops things seems to have decided for you — and the thing it drops is often the one you
       meant. Removing them here contradicted the rule the next line states. */
    /* ---------- WHOSE CHILDREN, WHICH IS NOT ALWAYS YOURS -----------------------------------------
       THIS READ `USER.children` AND ONLY EVER THAT. An admin who had just chosen a client on the
       question above was still offered their own children — or told there were none — because
       choosing a client changed the booking and this was reading the account. Two different people
       and the form only knew about one of them.

       THE CLIENT'S CHILDREN WHEN ONE HAS BEEN CHOSEN, and yours otherwise, which is the ordinary
       case and unchanged. */
    options: () => {
      if (isWaiting_()) return [];
      const forWhom = BOOKING.client || (USER && USER.name) || '';
      if (USER && norm(forWhom) !== norm(USER.name)) {
        const c = (DATA.clients || []).find(x => norm(x.name) === norm(forWhom));
        return ((c && c.children) || []).filter(Boolean).concat([UNNAMED]);
      }
      return (USER && (USER.children || USER.kids) || []).filter(Boolean).concat([UNNAMED]);
    },
    /* ---------- AND ONE UNNAMED SEAT, ALWAYS OFFERED -----------------------------------------------
       THE NAMED CHILDREN WERE THE ONLY ANSWERS, and that forced a family to know things they often
       do not. Two seats and three children: which two are coming may be Sunday's problem. A cousin
       is staying that week. A friend is being brought along. All of those are ordinary, and none of
       them could be said — the form insisted on a name for every seat it was about to charge for.

       "SOMEONE ELSE" IS APPENDED RATHER THAN REPLACING ANYTHING, and it can be ticked more than
       once by ticking it and picking another seat: it is the answer for a seat nobody has decided
       about yet, so the receipt says `Child` for that one and everything else proceeds. */

    /* Once you have ticked as many as you paid for, the rest say why. Still there, still readable,
       and tickable the moment you untick one — which is how you change your mind about which two
       of three are coming. */
    why: v => {
      const seats = Number(BOOKING.n) || 0;
      const on = (BOOKING.kids || []).length;
      /* THE UNNAMED SEAT IS NEVER THE ONE THAT IS FULL. It is what you tick BECAUSE you cannot
         name somebody, so refusing it for want of a free seat would refuse the only answer left —
         and its explanation is a NOTE, below, because it is an option you may take. */
      if (v === UNNAMED) return '';
      return (seats && on >= seats && (BOOKING.kids || []).indexOf(v) === -1)
        ? 'that is ' + seats + ' seat' + (seats === 1 ? '' : 's') + ' already' : '';
    },
    note: v => v === UNNAMED ? 'the seat is booked, the name can wait' : '' },


];

const tutorRow_ = () => (DATA.tutors || []).find(t => norm(t.title) === norm(BOOKING.tutor)) || null;

/* What the chosen place costs an hour — the ROOM's own rate where there is one, because a small
   room and a large one at the same venue are different prices and the building's single figure
   could only ever be right for one of them. */
function venueRate_() {
  if (!BOOKING.loc || BOOKING.loc === 'At home') return 0;
  const sp = spaceFor(BOOKING.loc);
  if (sp) return Number(sp.rate) || 0;
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(BOOKING.loc));
  return v ? Number(v.bestRate) || 0 : 0;
}

const bookStep_ = id => BOOK_STEPS.find(s => s.id === id);

/** Has this one been answered? A multi is answered when it holds anything. */
function bookAnswered_(step) {
  /* A QUESTION YOU CAN ANSWER SEVERAL TIMES IS FINISHED WHEN YOU SAY IT IS.
     This returned true the moment ONE thing was ticked — so picking Maths counted as an answer,
     the booker moved straight on, and the Done button that would have let you add Physics was
     never drawn. Both multiple-choice questions were single-choice in practice: subjects, and the
     hours grid, where it meant you could book one hour and never two.
     `done` is the list of questions somebody has finished with. */
  if (step.multi || step.grid) {
    const any = step.grid ? (Array.isArray(BOOKING.slots) && BOOKING.slots.length > 0)
                          : (BOOKING[step.id] || []).length > 0;
    return any && (BOOKING.done || []).indexOf(step.id) !== -1;
  }
  /* Answered by SAYING so, since nought is a legitimate answer and an empty list cannot be told
     apart from an unanswered one. */
  /* An emails step finishes the way a multiple-choice one does — when it is marked done. There is
     no separate flag for it any more. */
  if (step.emails) return (BOOKING.done || []).indexOf(step.id) !== -1;
  const v = BOOKING[step.id];
  /* EMPTY IS UNANSWERED. NOTHING ELSE IS.
     This also refused '0', from when `hours` started at 0 and had to be told apart from a real
     answer. Everything starts empty now, so that guard had nothing left to protect — and it made
     "Just us", which is nought other families, impossible to record: the question was answered,
     the answer was thrown away, and it was asked again for ever.
     A zero is an answer. It is the answer to most of the questions worth asking. */
  return String(v ?? '') !== '';
}

/**
 * THE NEXT QUESTION WORTH ASKING, or nothing left.
 *
 * Skipped when answered, and skipped when there is only one thing it could be — in which case the
 * answer is filled in on the way past. One venue is not a choice, and asking is the app pretending
 * to consult somebody it has already decided for.
 */
function nextBookStep() {
  const on = bookOn_();
  for (const step of BOOK_STEPS) {
    /* THE OTHER BRANCH'S QUESTIONS ARE NOT ASKED — see the `only:` note on the `avail` step. It
       changes nothing today, because that step offers no options and this loop already skips a
       question with nothing to offer. It is here so `only:` means ONE thing rather than two: a
       branch-only step added tomorrow WITH a list would otherwise be dropped from the card by
       `stepRows_` and then asked by the funnel, which is the worst of both — a question on screen
       that the document it belongs to does not have a row for. */
    if (step.only && step.only !== on) continue;
    if (bookAnswered_(step)) continue;
    const opts = step.options().filter(Boolean);
    if (!opts.length) continue;                    // nothing to offer: leave it unanswered
    /* A GRID AND AN EMAIL LIST ARE NOT ONE-ANSWER QUESTIONS. Both declare a single option because
       they are drawn rather than listed — and the fill-in-the-only-answer rule took that literally,
       writing the string 'emails' into the booking and skipping the question entirely. The rule is
       about a LIST with one entry in it; these have no list. */
    if (opts.length === 1 && !step.multi && !step.grid && !step.emails) {
      BOOKING[step.id] = opts[0];                  // the only answer there is
      continue;
    }
    return step;
  }
  return null;
}

/** What the pricing chain wants, out of what has been answered so far. */
function bookSpec() {
  /* ---------- EVERY TERM CHOSEN, IN DATE ORDER ---------------------------------------------------
     THIS WAS `.find(...)` AGAINST A STRING. The step takes several answers now, so it is a filter —
     and the ORDER is the sheet's rather than the order somebody happened to tick, because the spine
     row reads them out and "Spring 1, Autumn 2" is a sentence about the wrong school year.
     `DATA.intervals` arrives chronologically from `doGet` (see the `computed` block there), so
     keeping its order is the whole of it. Nothing sorts by parsed date: a term whose dates are the
     wrong way round is a fault `dateFault` already reports, and sorting on it would hide it.

     A STRING STILL WORKS, deliberately. `check-flow.js` seeds `BOOKING` directly and an older
     saved form could hold one, so a bare name is read as a list of one rather than throwing. */
  const want = Array.isArray(BOOKING.interval) ? BOOKING.interval
             : (BOOKING.interval ? [BOOKING.interval] : []);
  const ivs = (DATA.intervals || [])
    .filter(x => want.some(w => norm(w) === norm(x.label || x.term)));
  const first = ivs[0] || {};
  const last = ivs[ivs.length - 1] || {};
  const runs = bookRuns();
  /* The session length IS the length of a run — not a separate answer that has to be reconciled
     with the hours ticked. Where runs differ, the first one names the session; the total hours a
     week is what the price is actually built from. */
  const hours = runs.length ? runs[0].hours : 0;
  const perWeek = runs.reduce((n, r) => n + r.hours, 0);
  const days = [...new Set(runs.map(r => r.dayName))];
  const firstHour = runs.length ? String(runs[0].hour).padStart(2, '0') + ':00' : '';
  return {
    subjects: BOOKING.subjects, level: BOOKING.level, n: Number(BOOKING.n) || 1,
    loc: BOOKING.loc === 'At home' ? '' : BOOKING.loc,
    /* The answer, or the rule when it has not been given: a venue that charges nothing is hosted
       whether or not anybody said so. */
    hosting: BOOKING.hosting ? BOOKING.hosting === 'Yes'
                             : (BOOKING.loc === 'At home' || isHome(BOOKING.loc)),
    /* HOW MANY OTHERS, counted from the addresses given rather than picked separately. */
    splitOthers: (BOOKING.split || []).filter(x => String(x).trim()).length,
    day: days.join(', '), time: firstHour,
    hours: hours,
    /* EVERY TICKED HOUR, added up. Two on Monday and two on Wednesday is four a week — and the
       chain multiplies by weeks, so passing one session's length would price a two-day booking as
       a one-day one. Counted from the grid rather than multiplied out, so two hours on Monday and
       one on Friday is three, which no amount of days-times-length can express. */
    hoursPerWeek: perWeek,
    /* The runs themselves, so the chain can work out the real session dates across every day. */
    runs: runs.map(r => ({ dayName: r.dayName, day: r.day, hours: r.hours })),
    /* ---------- THE SPAN, AND THE WINDOWS INSIDE IT --------------------------------------------
       `startDate` / `endDate` / `lastSun` ARE THE OUTER SPAN and are kept because half a dozen
       readers still want one pair of dates — `price-rows.js`, the receipt, the breakdown. With one
       term they are exactly what they always were.

       `windows` IS WHAT THE SESSIONS ARE COUNTED FROM, one per chosen term, and it is the reason
       this is not just a longer string: Autumn 1 and Autumn 2 have the October half term between
       them, so an outer span would bill a family for a week nobody teaches. `priceFrom` walks
       the list where there is one and falls back to the single pair where there is not — a live
       job prices from `spec.slots` and never reaches either. */
    interval: ivs.map(x => x.label || x.term).join(', '),
    weeks: ivs.reduce((n, x) => n + (Number(x.weeks) || 0), 0),
    startDate: first.startDate || '', endDate: last.endDate || '',
    lastSun: last.lastSun || last.endDate || '',
    windows: ivs.map(x => ({ startDate: x.startDate || '',
                             lastSun: x.lastSun || x.endDate || '' })),
    tutor: BOOKING.tutor === 'No preference' ? '' : BOOKING.tutor,
  };
}

/* The price so far, or nothing. Shown from the moment it can be worked out rather than at the end
   — the whole point of asking in this order is that somebody can stop when it gets too dear. */
/* ---------- A WAITING LIST IS PRICED A DIFFERENT WAY, AND WAS NOT PRICED AT ALL ------------------
   `if (!BOOKING.subjects.length) return null` KILLED IT. A waiting list never asks for subjects —
   it is Maths and English by definition, which is why the question is skipped — so `subjects` is
   always empty on that branch and the card said "not enough answered to price it yet" no matter how
   much had been answered. It could never have priced one.

   THE SUM IS THE ONE THE BACKEND ALREADY USES, restated here rather than invented: the room's hourly
   cost plus the open tutor rate, plus the extra-seat charge for the seats beyond the first, all
   divided by the number of seats. Four families splitting one room and one tutor.

   ROUNDED AT THE SEAT, NOT AT THE TOTAL, for the same reason `waitlistPrice` does it: the seat is
   what somebody is charged, and rounding the total first leaves four seats that do not add up to
   it. The two must agree to the penny or the card and the receipt disagree in public. */
function waitPrice_() {
  /* ---------- THE ANSWER, NOT THE INGREDIENTS ---------------------------------------------------
     THIS DID THE SUM ITSELF from three config numbers, and two of the three did not exist on the
     phone — `DATA.config` is not a thing the payload sends, and the venue rate is `bestRate` rather
     than either name I guessed. Both would have come back undefined and priced every room at zero:
     a seat price that looks plausible and is wrong by the whole cost of the room, which is worse
     than no price because nothing about it looks like a fault.

     AND EVEN WITH THE RIGHT NAMES IT WAS THE WRONG SHAPE. `waitlistPrice` in the backend is what a
     seat is actually charged at; a second copy of that arithmetic here is one sum in two languages,
     free to drift the first time either is touched. The backend now sends the figure per venue. */
  const w = (DATA.waitlistSeat || {})[BOOKING.loc];
  if (!w || !(w.perHour > 0)) return null;
  return {
    chargePerHour: w.perHour,
    perSeatSession: w.perSession,
    seats: w.seats, hours: w.hours,
  };
}

function bookPrice() {
  if (isWaiting_()) {
    /* THE VENUE IS THE ONLY ANSWER IT NEEDS. Level does not change what a seat costs, and the day
       is not settled until the list fills — so a list can be priced the moment somebody says where. */
    if (!BOOKING.loc) return null;
    const w = waitPrice_();
    return (w && w.chargePerHour > 0) ? w : null;
  }
  if (!BOOKING.subjects.length) return null;
  const L = priceFrom(bookSpec());
  return (L && L.chargePerHour > 0) ? L : null;
}

/* ---------- BACK TO NOTHING, FROM THE STEP LIST ITSELF -------------------------------------------
   THE RESET WAS A HAND-WRITTEN LIST OF KEYS, and it was missing two of them.

     `done`  — which says "you have finished answering this question". Left behind, the NEXT booking
               believes subjects, hours, sharing and children are all already answered and walks
               straight past every one of them.
     `kids`  — so the next booking arrived with the same children ticked.

   Neither is exotic. They were simply added to the form later than the list was written, which is
   what always happens to a list that has to be kept in step with something else by hand — the
   third copy of the step names, after `BOOK_STEPS` and `BOOKING`.

   So it is derived. Every step's answer is cleared because every step is asked, and a step added
   tomorrow is cleared without anybody remembering this function exists. */
function resetBooking_() {
  BOOK_STEPS.forEach(st => {
    /* A list question gets an empty list and a single one gets an empty string, because that is
       what each is tested against — `[].length` for one, `''` for the other. Handing a multi step
       an empty string would make `.length` read 0 and look right until something pushed to it. */
    BOOKING[st.id] = (st.multi || st.grid || st.emails) ? [] : '';
  });
  /* THE ONE THAT IS NOT AN ANSWER: what has been finished with. It is about the FORM rather than
     about the booking, and it must go with the rest.

     `BOOKING.editing` WAS CLEARED HERE TOO, and in two other places, and read nowhere — see the
     note over the deleted `book-edit`. */
  BOOKING.done = [];
  BOOKING.note = '';
}

/* `on('new-booking')` AND `on('book-close')` WERE HERE. One opened the form and one shut it, and
   both existed because the form was a thing you opened. It is the first card on Book now — there is
   no moment when it is not there, so there is no opening it and nothing to close. */

/* Ticking an hour. Adjacent ticks become one session; the grid is redrawn so the summary under it
   keeps up. */
on('book-slot', el => {
  const code = el.dataset.code;
  const list = BOOKING.slots || [];
  const at = list.indexOf(code);
  if (at === -1) list.push(code); else list.splice(at, 1);
  BOOKING.slots = list;
  drawBooker();
});

/* ---------- AND THE SAME TOGGLE ONE GRID ALONG ------------------------------------------------------
   `book-slot` KEEPS HOUR CODES AND THIS KEEPS SENTENCES, which is the only difference: the cell
   carries the phrase it stands for, so there is nothing to build here and no second spelling of
   "Monday morning" to keep in step with the one the grid drew.

   IT WRITES `BOOKING.avail` AND NEVER `BOOKING.slots`. Those are two different facts and the
   second is priced: `bookRuns()` reads it, the total multiplies by it, and a waiting list putting
   hours in there would look like a booked session to everything downstream. A waiting list has no
   hours — that is the whole reason this grid exists. */
on('book-block', el => {
  const when = el.dataset.when;
  const list = BOOKING.avail || [];
  const at = list.indexOf(when);
  if (at === -1) list.push(when); else list.splice(at, 1);
  BOOKING.avail = list;
  drawBooker();
});

/* `on('split-add')`, `on('split-set')` AND `on('split-done')` WERE HERE — the three handlers for
   the panel of email boxes. One text field replaced all of it; `book-emails` reads it. */


/* Answering one. A multi toggles, everything else replaces and moves on. */
/* ---------- A DROPDOWN ANSWERED --------------------------------------------------------------------
   `change`, NOT A TAP. Every other control in this app is `data-do` on a press; a select is answered
   by choosing, which fires `change` and never a click — so the shell's press handler would never
   hear it. Bound here rather than added to the shell, because this is the only select in the app
   that answers a question.

   AN EMPTY CHOICE CLEARS THE STEP, which is what the "—" option is: putting a field back to unset
   without a separate control for it. `done` goes too, or a cleared field would refuse to be asked
   again — the same fault `book-undo` had. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-set"]');
  if (!el) return;
  const step = bookStep_(el.dataset.step);
  if (!step) return;

  if (step.multi) {
    /* TOGGLE, AND NEVER ON THE DASH. Choosing "—" on a multi is choosing nothing — it is what the
       select falls back to after every pick — so it must not clear the list somebody has built. */
    const v = el.value;
    if (v) {
      const list = BOOKING[step.id] || [];
      const at = list.findIndex(x => norm(x) === norm(v));
      if (at === -1) list.push(v); else list.splice(at, 1);
      /* ---------- KEPT IN THE ORDER THE QUESTION OFFERS THEM, NOT THE ORDER THEY WERE TICKED -----
         THE TERM STEP IS WHAT MADE THIS MATTER. `stepRows_` joins the list onto one row, so ticking
         Autumn 2 and then Autumn 1 read back as "Autumn 2, Autumn 1" — a sentence about the wrong
         school year, on the row somebody checks before they pay.

         AGAINST `options()` RATHER THAN SORTED, because the offered order is the only order this
         form knows: chronological for terms, whatever the sheet says for subjects. A comparator on
         the option index says "read them back the way you read them" for every multi at once.

         A GRID STEP IS UNTOUCHED BY CONSTRUCTION. `avail` offers no options, so every key is −1,
         every comparison is 0, and a stable sort leaves the list exactly as it was. Wrapped anyway:
         an `options()` that throws must not take a tick with it. */
      try {
        const offered = (step.options() || []).map(norm);
        const at_ = x => { const i = offered.indexOf(norm(x)); return i === -1 ? offered.length : i; };
        list.sort((a, b) => at_(a) - at_(b));
      } catch (err) {}
      BOOKING[step.id] = list;
    }
    /* ANSWERED THE MOMENT THERE IS SOMETHING IN IT. `done` was how a multiple-choice question said
       "I have finished adding", which existed because the panel moved on to the next question as
       soon as you picked once. Nothing moves on any more — the whole form is on screen — so the
       list being non-empty is the whole of what "answered" means here. */
    BOOKING.done = uniq((BOOKING.done || []).concat([step.id]));
    if (!(BOOKING[step.id] || []).length) {
      BOOKING.done = (BOOKING.done || []).filter(id => id !== step.id);
    }
  } else {
    BOOKING[step.id] = el.value || '';
    BOOKING.done = (BOOKING.done || []).filter(id => id !== step.id);
  }

  /* ---------- CHOOSING A CLASS ANSWERS FOUR OTHER QUESTIONS ------------------------------------
     A LIST THAT IS ALREADY GOING HAS A VENUE, A LEVEL AND A SUBJECT, decided by whoever opened it
     and not up for negotiation by the fifth person to join. Asking again would be offering somebody
     a choice that cannot be honoured — and the answer they gave would then disagree with the class
     they are joining.

     WRITTEN IN, NOT SKIPPED. The rows stay on the paper showing what the class is, because that is
     what somebody joining most needs to see. Their dropdowns still exist and still work: change one
     and you are describing a different class from the one you picked, which is worth being able to
     do and worth being able to see.

     CLEARED WHEN THE CLASS IS UNCHOSEN, or a switch to "start a new one" would carry the last
     class's venue into a booking nobody attached it to. */
  if (step.id === 'joining') {
    const j = joinedJob_();
    BOOKING.subjects = j && j.subject ? [j.subject] : [];
    BOOKING.level    = (j && j.level) || '';
    BOOKING.loc      = (j && (j.location || j.venue)) || '';
    BOOKING.n        = j ? '1' : '';
    ['subjects', 'level', 'loc', 'n'].forEach(id => {
      BOOKING.done = j ? uniq((BOOKING.done || []).concat([id]))
                       : (BOOKING.done || []).filter(x => x !== id);
    });
  }

  /* AND UNCHOOSING THE KIND UNCHOOSES THE CLASS. "Instant" with a waiting list still named on the
     row below is the form contradicting itself. */
  if (step.id === 'how' && !isWaiting_()) BOOKING.joining = '';

  drawBooker();
});

/* `on('book-pick')` WAS HERE — the handler for the option cards in the panel. There is no panel for
   a list of options any more; a list of options is a `<select>` on its row, answered by `book-set`.
   See the note where the cards were, in receipt.js.

   `on('book-back')` AND `on('book-undo')` WENT WITH IT, and both were right to go: "Leave it as it
   is" and "Clear it" were buttons on that panel, and clearing is what choosing "—" does on a single
   row and what picking a ticked option again does on a multi one. */

/* ---------- `on('book-edit')` IS GONE, AND IT WAS THE ONE CONTROL ON THE CARD DRAWN IN GOLD --------
   REPORTED AS "grid not working when click", AND THIS IS THE HALF UNDERNEATH THE HALF THAT WAS
   FIXED. `paintBook_` was repainting a screen the booking column is not on, so no press on this
   card did anything; that is repaired. This one still did nothing afterwards, and had done nothing
   since the grid stopped folding.

   `stepGrid_` SAYS "ALWAYS OPEN" IN ITS FIRST LINE and gives the reason — a panel that unfolds
   changes the card's height under the thumb reaching for it. The moment that was true there was
   nothing left for this to open: `stepIsPanel_` returned `!!st.grid`, so the ONE row marked
   pressable was the one row whose panel is always drawn. The handler set `BOOKING.editing`,
   `drawBooker()` rebuilt the card byte for byte identically, and nothing anywhere read the field —
   written in four places, read in none, which is this repository's oldest shape and is already
   recorded here under `figure`, `orderPrints`, the four message actions, `exam_date` and `wow`.

   AND IT WAS NOT INVISIBLE, WHICH IS WHY IT MATTERS. `.bk-pick` gave that value a GOLD underline
   and a pointer cursor, and gold in this app means the one thing on the card to press. So the When
   row advertised itself, in the app's own vocabulary, as the control for the week — and a person
   pressing the row rather than the cells got nothing, twice over.

   FOUND BY `check/press.js`, which exists for exactly this question and found it on its second
   honest run. No check here could have: the wiring was perfect — a `data-do` with a handler, a
   handler with a door — and `check/ui.js` measures whether a control can be read and hit, which a
   dead one passes perfectly. */

/* NO REDRAW. Every other control on the paper changes what the receipt says, so it repaints; this
   one changes nothing but itself, and repainting would take the cursor out of the box the moment
   somebody clicked away mid-sentence. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-note"]');
  if (el) BOOKING.note = el.value || '';
});

/* ---------- THE SPLIT, TYPED --------------------------------------------------------------------
   COMMAS, AND EMPTIES DROPPED. Somebody typing a list leaves a trailing comma or a double one, and
   an empty string in `BOOKING.split` counts as a person on every screen that reads the length — the
   roster, the price per family, the "split N ways" line. Cleaned here, once, where it is read in.

   `done` FOLLOWS WHETHER THERE IS ANYONE IN IT. It used to be set by a Done button on the panel;
   with no panel, having typed somebody in IS the answer, and clearing the box is unanswering it. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-emails"]');
  if (!el) return;
  const step = bookStep_(el.dataset.step);
  if (!step) return;
  const list = String(el.value || '').split(',').map(x => x.trim()).filter(Boolean);
  BOOKING[step.id] = list;
  BOOKING.done = list.length
    ? uniq((BOOKING.done || []).concat([step.id]))
    : (BOOKING.done || []).filter(id => id !== step.id);
  drawBooker();
});

/* `on('book-more')` WAS HERE — the Done button that closed a multiple-choice question. Nothing draws
   one: a multi answer is a toggling dropdown and is finished when the list has something in it, and
   the hours grid closes by pressing its own row again. The handler outlived both. */

/**
 * THE CARD. Photographs, then every priced row, then the dates, then where it stands.
 *
 * The order is the old one and it is right: what you are buying, what it costs and how that was
 * arrived at, when it happens, and only then its state. State last because what a booking IS is
 * what somebody came to read; where it STANDS is what they check afterwards.
 */
/**
 * THE ROWS OF THE RECEIPT, AS DATA.
 *
 * Split out of `bookBreakdown` when the same receipt had to be drawn onto a canvas as well as into
 * HTML. Two renderers walking one list is duplication of PAINTING; two renderers each deciding
 * which rows exist would be duplication of MEANING, and that is the kind that drifts — a row added
 * to the card and not to the picture makes a shared receipt that quietly disagrees with the screen.
 */
/* ---------- WHICH TERM A WAITING LIST IS FOR ------------------------------------------------------
   A LIST OPENED NOW IS FOR THE TERM RUNNING NOW, or the next to start if today is a holiday: nobody
   opens a list for a term already half gone. `DATA.intervals` is on the phone with every term's
   dates on it, so this is a find rather than a second copy of the school year.

   NOT A QUESTION, WHICH IS WHY IT IS A LOOKUP. The waiting-list branch skips "over what period" on
   purpose — a list has no dates until it fills and somebody sets a day — so the answer has to come
   from the calendar or the card says nothing about when at all.

   A FUNCTION RATHER THAN A LOCAL, because two things want it now: the `About` estimate inside
   `breakdownRows`, and the `interval` step's `fallback`, which is what actually puts the term on the
   card. Two lookups would be two answers to which term this is.

   ---------- `new Date('02/11/2026')` IS THE SECOND OF NOVEMBER TO A PERSON AND THE ELEVENTH OF
   FEBRUARY TO A BROWSER ------------------------------------------------------------------------
   THIS READ `v => { const d = new Date(v); … }` AND EVERY DATE HERE IS `dd/mm/yyyy` — `fmtDate`
   writes them that way and `opensOn`/`closesOn` come straight from it. So every comparison was
   against a date in the American order: a term opening on 2 November was read as 11 February, which
   is in the past, so it was never "next"; one closing on 23 October parsed as month 23 and came back
   `null`, so it was never "running" either.

   WHICH MEANS THIS HAS BEEN SILENT RATHER THAN WRONG — the lookup found nothing, the caller's
   `if (term)` was false, and the card simply had no term on it. Nothing threw and nothing looked
   broken, which is why it survived: a row that is absent reads as a row nobody has filled in.

   `parseDMY` IS THE APP'S OWN READER and is right about both orders: it takes the three numbers in
   the order this business writes them, and falls back to `new Date` only for a string that is not a
   date at all. One parser, in core.js, used by everything that reads one. */
function waitTerm_() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const terms = (DATA.intervals || []).filter(t => norm(t.kind) !== 'holiday');
  const dt = v => parseDMY(v);
  const running = terms.find(t => dt(t.opensOn) && dt(t.closesOn)
    && now >= dt(t.opensOn) && now <= dt(t.closesOn));
  const next = terms.filter(t => dt(t.opensOn) && dt(t.opensOn) > now)
    .sort((a, b) => dt(a.opensOn) - dt(b.opensOn))[0];
  return running || next || null;
}

function breakdownRows(L) {
  const fmt = { money, esc, pct: x => x };
  const rows = [];
  let line = 0;
  const push = (k, v, mul, rate, total, opts) => rows.push(Object.assign({
    n: (opts && opts.free) ? '' : String(++line).padStart(3, '0'),
    k, v: v || '', mul: mul || '', rate: rate || '', total: total || '',
  }, opts || {}));

  /* ---------- WHO IT IS FOR, AT THE TOP ----------------------------------------------------------
     THE RECEIPT NEVER SAID WHOSE IT WAS. The client is stored on the booking and shown in the
     roster at the foot, and the breakdown itself — the part somebody reads to check the money is
     right — never named them. On a card with one booking on it that is survivable; on a screen an
     admin is scrolling through it means every receipt looks like everybody else's.

     FIRST ROW, and marked `free` so it takes no line number: it is not a charge, it is who the
     charges are for. A numbered row that costs nothing reads as a mistake in the arithmetic. */
  /* READ FROM THE BOOKING, NOT FROM `L`. `L` is the PRICING — rates, multipliers, a total — and it
     has no idea who the booking is for. I reached for `L.client` because it was the object to hand,
     which is the same mistake as reading the receipt's stage where the job's kind belonged: two
     objects in scope, one of them plausible, and the wrong one fails silently as an empty string.
     `BOOKING.client` is where an admin's change lands, so it is what has to be read. */
  /* ---------- "NOBODY YET" IS AN ANSWER, NOT A NAME -----------------------------------------------
     IT WENT STRAIGHT ONTO THE RECEIPT: "For Nobody yet — just open it", and worse, the children
     note read "No children are on Nobody yet — just open it's account". The option is a way of
     saying there is no client, and every line that then treated it as one produced a sentence
     nobody could take seriously.

     SO THE ROW IS OMITTED. A list with nobody on it has nobody to name, and a "For" line saying so
     at length is worse than no line — the empty seats already say it. */
  const forWhom = BOOKING.client === NOBODY ? '' : (BOOKING.client || (USER && USER.name) || '');
  if (forWhom) push('For', esc(forWhom), '', '', '', { free: true, who: true });

  /* ---------- A WAITING LIST HAS A DIFFERENT BREAKDOWN, AND WAS SHOWN THE WRONG ONE ---------------
     IT PRINTED THE WHOLE SESSION TABLE AT ZERO: "Tuition · No preference · £0.00", "Subject" with
     nothing beside it, "Extra seats 0", "Venue £0.00" — twelve rows describing a sum that is not
     how a seat is priced, every one of them empty because none of those questions was asked.

     A SEAT IS ONE FIGURE. The room and the tutor, split four ways — so the breakdown is those three
     facts and nothing else. Rows that describe a calculation nobody performed are worse than no
     rows: they look like a price that came out at zero. */
  if (isWaiting_()) {
    const w = bookPrice();
    if (!w) return rows;
    /* WHAT KIND OF THING THIS IS, FIRST. Nothing on the card said it was a waiting list — you had
       to infer it from "Not open yet" three rows down, or from the absence of a date. The one fact
       that changes what somebody is agreeing to should not be the one they work out. */
    push('Kind', 'Waiting list class', '', '', '', { free: true });
    push('A seat', esc(BOOKING.loc || 'no venue'), '', money(w.chargePerHour) + '/h',
      money(w.perSeatSession), { end: true, step: 'loc' });
    push('Shared by', esc(w.seats) + ' families', '', '', '', { free: true });
    push('Per session', esc(w.hours) + ' hours', '', '', '', { free: true });

    const term = waitTerm_();
    if (term) {
      /* ---------- `Running`, `Weeks left` AND A `For` HOLDING THE TERM WERE ALL HERE -------------
         REMOVED ON REQUEST: *"Remove weeks left running bit."* `Running` printed the term's two
         dates and `Weeks left` printed a bare number, one under the other.

         WHAT IS LOST IS THE DATES, and it is worth writing down rather than discovering: a family
         reading `Autumn 1` now has to know when Autumn 1 is. The count itself is not lost — it is
         the multiplier on the `About` row below, where it is doing arithmetic somebody can follow
         rather than sitting on a line of its own.

         AND THE TERM'S OWN ROW IS NOT PUSHED FROM HERE AT ALL, which is the part that took
         measuring. It went into `For` — the row that means the CLIENT, the exact fault `jobRows`
         fixed on the receipt and wrote up — and a push naming a question is DROPPED: `bookBreakdown`
         builds `said` from every step's label and filters the priced rows against it, *"anything
         naming a question twice is dropped"*. `For` is a step and so is `Term`, so a push under
         either name has never reached the card under any label. The row belongs to the `interval`
         STEP, and it fills itself through that step's `fallback` — see it in `BOOK_STEPS`. */
      /* ---------- AND WHAT THE TERM WOULD COME TO ---------------------------------------------
         A PER-SESSION FIGURE IS NOT WHAT ANYBODY IS DECIDING. "£19.00 a seat" answers a question
         nobody asked; "seven weeks, so about £133" is the number a family weighs against the month.
         The card had every part of that sum on it — the seat price, the weeks — and left the
         multiplication to the reader.

         "ABOUT", AND SAID SO. The weeks are what is LEFT in the term, so a list opened halfway
         through is honestly cheaper; and nothing runs until the seats fill, so the real figure
         depends on when that happens. A precise-looking total would be a promise this cannot keep. */
      if (term.weeks) {
        push('About', esc(term.weeks) + ' × ' + money(w.perSeatSession),
          '', '', money(w.perSeatSession * term.weeks), { est: true });
      }
    }

    /* THE FIVE STAGES, NONE OF THEM TICKED — for the same reason as the ones on the ordinary form
       below, and a waiting list nobody has joined is not a special case. `stageRows_(null)` is the
       one builder both documents use; see `JOB_STAGES` for why an unsent booking shows the five
       ahead of it rather than a dash. */
    stageRows_(null).forEach(r => rows.push(r));
    return rows;
  }

  ['rate', 'shape'].forEach(group => {
    const inGroup = PRICE_ROWS.filter(r => r.group === group);

    if (group === 'shape') {
      bookRuns().forEach(r => {
        push(r.dayName, r.hour + ':00–' + (r.hour + r.hours) + ':00', '', '', '',
          { day: true, step: 'slots', hours: r });
      });
      /* ---------- `Hours a week` WAS THE THIRD ROW TO SAY THE SAME THING ---------------------------
         `When` ALREADY READS "Monday 12:00–13:00", and the day rows above already print each run
         with its hours. A row whose whole content is "× 1" adds a multiplier and no fact — and on a
         document people read to check the money, a line with no value in the value column reads as
         something that failed to fill in.
         THE FIGURE IT CARRIED IS NOT LOST: it multiplies into the Term total two rows down, which is
         the line that says what the weeks actually cost. */
    }

    inGroup.forEach((r, gi) => {
      if (r.show && !r.show(L)) return;
      const c = priceCells(r, L, fmt);
      const plain = r.value
        ? String(r.value(L)).replace(/<span class="note">[\s\S]*?<\/span>/g, '')
                            .replace(/<[^>]*>/g, '').trim()
        : '';
      const asked = { base: 'tutor', subject: 'subjects', level: 'level', students: 'n',
                      venue: 'loc', host: 'hosting', term: 'interval',
                      split: 'split' }[r.key];
      /* AN UNANSWERED ROW SHOWS A DASH, the same as one on the unpriced card — see `stepRows_`.
         "Level" with an empty value drew a bare dashed underline and nothing else, which reads as a
         row that failed rather than a blank waiting for you. Only on rows somebody can answer:
         a computed row with no value has nothing to fill in. */
      /* THE SAME DROPDOWN THE UNPRICED CARD USES. A row does not change how it is answered the
         moment the booking becomes costable — `asked` names the step this row stands for, and if
         that step is a plain list it gets a select here exactly as it does in `stepRows_`. */
      const st = asked ? bookStep_(asked) : null;
      const sel = st ? stepControl_(st) : '';
      push(r.label, plain || (asked ? '—' : ''), c.mul, c.rate, c.total,
        /* ---------- `step` IS ALWAYS THE STEP, EVEN WHEN THE ROW HAS A CONTROL --------------------
           THIS SAID `sel ? '' : asked`, blanked so a row carrying a dropdown would not also be
           pressable. That was right when these rows WERE the card. They are not: `bookBreakdown`
           merges them onto the form's rows now, and it finds the right one by this field — so
           blanking it meant every priced line failed to find its question and printed as a row of
           its own, with the figures stranded away from the answer that caused them. Which is
           exactly what "the multiplier is gone" was. */
        /* ---------- NO WEEK HANGS OFF A PRICED ROW ANY MORE --------------------------------------
           THIS DREW `stepGrid_(st)` so a priced row standing for the When step kept its grid. The
           week is not a block under a row now — it is seven rows of the card with the day names as
           their labels — so there is nothing to hang, and `bookBreakdown` merges figures onto those
           rows by `step` exactly as it does onto any other question's. */
        { end: gi === inGroup.length - 1, step: asked, key: r.key, sel: sel });
    });
  });

  /* ---------- SIX DATES IS A SPAN, NOT A LIST -----------------------------------------------------
     EVERY DATE, COMMA-SEPARATED, WRAPPED TO SIX LINES on the card and was truncated mid-date on the
     shared picture — "05/10" with the year cut off, and the sixth missing entirely. Nobody reads a
     weekly booking date by date; what they check is when it starts, when it ends, and how many.
     FIRST TO LAST, WITH THE COUNT WHERE THE COUNT ALREADY WAS. One line, nothing to wrap, nothing to
     truncate. A single session still prints its one date rather than a span of itself. */
  const dates = (L.sessionDates || []).map(d => fmtDate(d));
  const span = !dates.length ? '—'
    : dates.length === 1 ? dates[0]
    : dates[0] + ' – ' + dates[dates.length - 1];
  push('Dates', span, '', '',
    dates.length ? dates.length + ' date' + (dates.length === 1 ? '' : 's') : '', { free: true, dates: true });

  /* ---------- WHERE THIS ONE IS, TOO ---------------------------------------------------------------
     THREE ROWS WERE REMOVED FROM HERE — "STATUS · UNSENT", "POSSESSION · YOURS", "LIFECYCLE ·
     UNCREATED" — and they deserved to go: three lines all reporting that a form had not been sent,
     in words about a row in a spreadsheet, on the one document where there is no row yet.

     ONE LINE COMES BACK, IN THE SAME WORDS THE RECEIPT USES. `jobSaid_` has four sentences and this
     is the first of them, so a booking reads the same before and after it is sent: the form says
     "Asked for — waiting on us" is what will happen, and the receipt for the same session says it
     has. Same vocabulary, one place, no second table of words to keep in step.

     AND `Status` COMES WITH IT. It was left off on the grounds that a form nobody has sent has no
     seats — true, and the wrong conclusion: the point of these two lines is that the document reads
     the SAME from the first question to the last payment, and a row that appears only once the
     thing is saved is a row that changes shape at exactly the moment somebody is checking it.
     It says what it is: nobody in it yet. Which is a fact about the booking, not a blank.

     ---------- AND THEY ARE DASHES NOW, WHICH IS THE ASKED-FOR BEHAVIOUR AND THE CONSISTENT ONE ----
     The paragraph above argued for sentences: that a row appearing only once the booking is saved
     changes shape at the moment somebody is checking it. The first half of that still holds and is
     why the rows are still HERE rather than added on send.

     WHAT IT GOT WRONG IS THE FILLING. Every other unanswered row on this form already prints `—`
     — see the `plain || (asked ? '—' : '')` a few lines up — so two rows carrying sentences while
     the twenty above them carry dashes is the inconsistency, not the fix for one. A blank that
     reads like every other blank is a blank somebody can skim past; "Not asked for yet" reads as
     content and stops the eye on the one row that has nothing to say.

     ---------- AND `Stage` IS FIVE TICK ROWS NOW, WHICH IS THE THIRD ANSWER AND THE RIGHT ONE ------
     The paragraph above is the argument between a SENTENCE and a DASH, and both are one row trying
     to say where a booking has got to. Five boxes say it without a vocabulary to learn, and an
     empty one is the same "nothing to report yet" a dash was carrying — with the difference that it
     also says what WILL be reported. `stageRows_(null)` is the unsent form's five; see
     `JOB_STAGES`. `jobSaid_` is gone with the row it was written for.

     `Status` KEEPS ITS DASH. It is the seat statuses — Waiting, Agreed, Paying, Booked — which is
     not a stage anything reaches but a list of who among several families is where, and a form
     nobody has sent has no seats to list. */
  stageRows_(null).forEach(r => rows.push(r));
  push('Status', '—', '', '', '', { free: true });
  /* ---------- THREE ROWS SAYING THE SAME NOTHING --------------------------------------------------
     "STATUS · UNSENT", "POSSESSION · YOURS", "LIFECYCLE · UNCREATED". Three lines, on a form nobody
     has sent, all reporting that it has not been sent — which the card already says at the bottom,
     says by having a "Ask for it" button on it, and says by existing at all.

     They are also the wrong VOCABULARY for the reader. A parent filling in a booking has no use for
     lifecycle or possession; those are words about the row in the sheet, and this is the one stage
     where there is no row in the sheet. Once it IS sent it becomes a job, and `jobRows` prints a
     real status from real data — which is where a status line earns its place.

     `Dates` STAYS. It is a fact about the booking rather than about the record of it, and it is the
     one row here somebody would actually check. */
  return rows;
}

/* ---------- A ROW IS ITS OWN QUESTION ---------------------------------------------------------------
   THE LIST OF OPTIONS UNDER THE CARD IS GONE. It was the last piece of the wizard: the card showed
   every field, and then the same screen showed a list of answers to whichever one was current — so
   the thing you were filling in and the way you filled it in were two objects, and the second one
   was as tall as the first.

   THE VALUE CELL IS A `<select>`. A field with a fixed set of answers is what a dropdown is FOR, and
   a phone already knows how to show one — a wheel, over the top, dismissed by choosing. That is the
   whole interaction, it costs no height at all, and every row can be open to being changed at once
   rather than one at a time in an order the form decides.

   A QUESTION WITH SEVERAL ANSWERS IS STILL A DROPDOWN. `subjects` and `kids` take more than one, and
   the obvious move — `<select multiple>` — is the one to avoid: on a phone it renders as a list box
   with its own scrollbar, which is the panel again in a worse shape.

   SO PICKING TOGGLES. Choose Maths and it joins the list; choose it again and it leaves. The row
   shows what is in the list, the options show a tick against the ones that are, and the select
   drops back to "—" after every pick so the next one is one tap away. It is the same gesture as the
   single-answer rows and it needs nothing new on screen.

   ONE STEP GENUINELY CANNOT BE ONE. `slots` is a week to tick — seven days of hours, which is not a
   choice from a list and cannot be a dropdown. It keeps the panel, and it opens only when you press
   its row.

   `split` IS TYPING, NOT CHOOSING, so it is a text box in its row rather than a panel of email
   fields. Addresses separated by commas: one line instead of a stack of labelled inputs and a
   ＋ button, and the row already had to show them joined by commas anyway.

   AN UNANSWERED SELECT SHOWS A DASH as its first option, so a field nobody has filled reads the same
   as it did before and cannot be submitted by accident. */
function stepSelect_(st) {
  const opts = st.options().filter(Boolean);
  const chosen = st.multi ? (BOOKING[st.id] || []) : [];
  /* ---------- A FALLBACK HAS TO REACH THE CONTROL, NOT ONLY THE TEXT -------------------------------
     `receiptRow` DRAWS THE DROPDOWN INSTEAD OF THE VALUE when a row has one — rightly, since a
     select already shows what is chosen and printing both would be the row saying it twice. Which
     means a fallback that only reaches the row's TEXT is a fallback an admin never sees: their
     "Who is this for?" has a list of families on it, so the select wins, and the select had nothing
     selected because `BOOKING.client` is only set by choosing.
     So the same one rule is read here too. The control opens on whoever is signed in — which is
     what the booking would be submitted as — and picking a family still overwrites it. */
  /* READ ONCE, BECAUSE THREE PLACES IN THIS FUNCTION WANT IT: the value a single-answer control
     opens on, the text a LOCKED row prints, and the first option of an open multi. It was inlined
     into the first of those alone, so a multi never saw it — see the two notes below. */
  const fb = st.fallback ? String(st.fallback() || '') : '';
  const v = st.multi ? '' : (BOOKING[st.id] || fb);

  /* ---------- A SETTLED ANSWER IS TEXT, NOT A CONTROL ----------------------------------------------
     A LOCKED SELECT STILL SHOWED "—" ON A MULTI. The dropdown on a multiple-answer row is a way of
     picking the NEXT one, so its own selection is always the blank — the chosen list was supposed to
     be read off the row's value, and the control replaced it. Which is why joining a class showed
     "Subject · —" directly under "Class · Maths, English Language": the answer was there, and the
     thing drawn on top of it could not say so.

     SO WHEN NOTHING CAN BE PICKED, NOTHING IS DRAWN THAT PICKS. Plain text, which also wraps — a
     select cannot, and "Colliers Wood Library" was being cut to "Colliers …" in a column wide enough
     for the whole thing over two lines. */
  if (stepLocked_(st)) {
    const said = st.emails
      ? (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ')
      /* ---------- AND A LOCKED MULTI HAD NO FALLBACK EITHER ---------------------------------
         THE LINE BELOW ALREADY SAYS `v` CARRIES IT and this one, one branch up, did not — so the
         `interval` step on a waiting list printed a dash over a term it had already worked out.
         That step is locked on that branch by construction (`stepLocked_` reads `options()`, which
         is empty there), so this IS the branch it takes, every time. */
      : st.multi ? (chosen.join(', ') || fb)
      : (st.label_ && v ? st.label_(v) : v);   /* `v` already carries the fallback — see above */
    return `<span class="bk-set">${esc(String(said || '—'))}</span>`;
  }
  const isOn = o => st.multi
    ? chosen.some(c => norm(c) === norm(o))
    : norm(o) === norm(v);
  /* DISABLED, NOT ABSENT. The row keeps its height, its label and its answer; only the pointer
     changes. A form whose rows come and go cannot be learnt. */
  const off = stepLocked_(st);
  return `<select class="bk-sel" data-do="book-set" data-step="${esc(st.id)}"
      ${off ? 'disabled' : ''} aria-label="${esc(st.label)}">
    ${/* THE FIRST OPTION IS ALWAYS SELECTED ON A MULTI, because the select is a way of picking the
          NEXT one rather than a display of what is picked. WHICH MEANS IT HAS TO SAY WHAT IS PICKED:
          it is the only label on the row, so leaving it as "—" made a row with three subjects on it
          read as empty. */''}
    ${/* AND AN OPEN MULTI WITH NOTHING TICKED SHOWS THE FALLBACK, for the same reason the locked
          one does. No step reaches this today — `interval` is the only multi with a fallback and it
          is locked wherever that fallback answers — and writing the dash here instead would be a
          third place for one rule, which is how the other two came to disagree. */''}
    <option value=""${(st.multi || !v) ? ' selected' : ''}>${
      st.multi && chosen.length ? esc(chosen.join(', ')) : esc(fb || '—')}</option>
    ${opts.map(o => `<option value="${esc(o)}"${(!st.multi && isOn(o)) ? ' selected' : ''}
      >${st.multi && isOn(o) ? '✓ ' : ''}${esc(st.label_ ? st.label_(o) : o)}</option>`).join('')}
  </select>`;
}

/* ---------- THE NOTE IS A ROW LIKE THE REST -------------------------------------------------------
   IT WAS A LABELLED TEXTAREA UNDER THE CARD, the last thing on the form that was not on the paper.
   Everything else somebody types or picks is a line on the receipt; this was a box below it with a
   heading of its own, which made it look like a different kind of question when it is the same kind
   as all the others — a thing you tell us.

   IT LIVES IN `BOOKING` NOW, not in the DOM. `book-send` read it straight off `#book-note`, which
   worked only because that box happened to still be on screen at the moment you pressed send. A
   redraw between typing and sending — starting the grid, changing a subject — would have wiped it
   silently. Kept with the answers, it survives every redraw the way every other answer does.

   NO FIGURES, SO IT SPANS. `receiptRow` gives a row with no multiplier, rate or total the full
   width for its value, which is what a sentence needs and what a right-aligned 55px column would
   have made impossible. */
function noteRow_() {
  return { n: '', k: 'Note', v: '', mul: '', rate: '', total: '', step: '',
    sel: `<input class="bk-in bk-in-l" type="text" data-do="book-note"
      value="${esc(BOOKING.note || '')}" placeholder="anything else we should know"
      aria-label="Anything else we should know">` };
}

/* ---------- TYPING INTO A ROW --------------------------------------------------------------------
   Same shape as `stepSelect_` and for the same reason: the answer belongs in the row, not under the
   card. Read on `change` rather than on every keystroke — redrawing the whole receipt per letter
   would take the focus out of the box mid-word. */
function stepInput_(st) {
  const v = (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ');
  /* `readonly`, NOT `disabled`. A locked text box should still be readable and selectable — somebody
     joining a class may well want to copy the addresses already on it. */
  return `<input class="bk-in" type="text" data-do="book-emails" data-step="${esc(st.id)}"
    value="${esc(v)}" placeholder="—" aria-label="${esc(st.label)}"
    ${stepLocked_(st) ? 'readonly' : ''} autocomplete="off" spellcheck="false">`;
}

/* ---------- ELEVEN HOURS, SAID ONCE --------------------------------------------------------------
   SEVENTY-SEVEN NUMBERS FOR ELEVEN FACTS. Every day drew its own `10 11 12 … 20`, so the week was
   154 characters of digits in 77 boxes — and the numbers were identical down every column, because
   `slotGrid()` builds the hour span ONCE and every day in `SLOT_DAYS` maps over the same list. The
   repetition was not a coincidence to be tidied; it was structural, and so is the fix.

   `.hr`'S OWN NOTE ALREADY SAID WHY THIS IS SAFE: "a grid of numbers is scanned rather than read —
   you are looking for the shape of the ticked boxes, not reading eleven figures". A cell's number
   was never the thing being read. The COLUMN it sits in is, and a column needs a heading rather
   than a hundred and fifty-four repetitions of one.

   ONE HELPER, CALLED BY BOTH GRIDS. `jobGrid_` was deliberately built out of the form's own markup
   — its own comment says "the form's markup, down to the class names" — because a receipt drawn
   with different elements is a receipt that drifts the next time the grid is restyled. A header
   written twice would put that back, one element up. Same argument as `documents_()`, `factsNow_`
   and `childrenOf`.

   `aria-hidden`, BECAUSE THE CELLS CARRY THEIR OWN HOUR. A screen reader walking the grid gets
   "Monday 14:00" off each button's own label rather than a stray row of numerals with no context —
   which is what the header is for a pair of eyes and exactly not what it is for a reader. */
function slotHead_(hours) {
  return `<div class="slot-row slot-head" aria-hidden="true">
    <span class="slot-day"></span>
    <div class="slot-hours">
      ${hours.map(h => `<span class="slot-hh">${h}</span>`).join('')}
    </div>
  </div>`;
}

/* ---------- AND THE WEEK ROUND IT, BECAUSE THERE WERE THREE OF THESE ------------------------------
   THE SAME SEVEN ROWS WERE WRITTEN OUT IN THREE PLACES: the booking form, `jobGrid_` on the
   receipt, and `availGrid_` in `me.js` — where a TUTOR ticks the hours they can teach. That third
   one carries its own note saying *"the same grid the booker uses … answering it in two different
   shapes would be two things to learn"*, and the hour header proved the note right by breaking it:
   two of the three gained a header row and a joined bar, and the tutor's kept printing all
   seventy-seven numbers. A comment forbidding the drift is not a thing that stops it.

   WHAT DIFFERS BETWEEN THEM IS THE CELL AND NOTHING ELSE. One is a button you press, one is a
   button you cannot, one is a label wrapping a checkbox `me-save` reads. So the cell is the
   argument and everything round it — the header, the day label, the row, which days collapse —
   is here, once.

   `days` IS `[{ label, hours, shut }]` and `cell(hour, day)` returns the innards. The hours of the
   first day name the columns, which is true by construction everywhere this is used: `slotGrid()`
   builds one hour span and every day maps over it, the receipt counts 10 to 20, and a tutor's
   codes are that same span grouped by prefix. */
/* ---------- THE WEEK AS SEVEN ROWS OF THE CARD, NOT ONE BLOCK UNDER ONE ROW ------------------------
   ASKED FOR AS *"get rid of When and instead have the day names be the field questions. So it
   becomes Monday field Tuesday field Wednesday field."* — the fourth round of one complaint, and
   the one that dissolves it instead of trading against it.

   EVERY OTHER ARRANGEMENT WAS A CHOICE BETWEEN TWO BAD ONES. The week was a block hanging off a
   `When` row: indent it to the answer column and its left edge lines up but its right edge cannot,
   because eleven pressable cells need 240px and the answer column beside three figure columns is
   78px. Written, reverted, written, reverted — see the notes in `style.css`.

   A DAY IS A QUESTION. "Monday · which hours" is a field with a label, exactly like "Subject · which
   one", so it belongs on a row of the card rather than inside a picture drawn beside one. The day
   name moves out of the grid's own 1.5rem gutter and into the label column every other question
   uses, and the eleven hours become that row's answer. Nothing is nested, nothing is indented, and
   the phrase "the input column" stops needing a rule to enforce it: the hours ARE in it, because
   they are what the row answers.

   AND IT COSTS NOTHING IN WIDTH. The cells were 17.6px at 390 inside the old indented block and
   they are 17.6px here, because a day row carries no figures and so gives its three figure tracks
   to the answer — which is what every other unpriced row on the card now does too.

   THE HOUR NUMBERS RIDE ON THE FIRST ROW. They are one fact about eleven columns, so drawing them
   once is the same argument that took them out of seventy-seven cells: `slotHead_`'s note records
   it. They sit above Monday's strip inside Monday's own answer cell rather than on a row of their
   own, because a row of their own would need a name, a place in `SPINE` and a label column holding
   nothing. */
function weekRows_(days, cell, opts) {
  const o = opts || {};
  const cols = ((days[0] || {}).hours || []).map(h => (typeof h === 'object' ? h.h : h));
  return days.map((d, i) => ({
    n: '', k: String(d.label), v: '',
    mul: '', rate: '', total: '',
    /* THE STEP EVERY ONE OF THESE ROWS BELONGS TO. `bookBreakdown` matches a price line to its
       question on `id`, and seven rows answering one question all carry the same one. */
    id: o.id || '',
    /* ---------- THE ANSWER IS DRAWN, NOT WRITTEN --------------------------------------------------
       `strip` IS MARKUP AND `v` IS TEXT, which is why it is a field of its own rather than a flag on
       `v`: the renderer escapes a value and must not escape this. Same shape as `sel`, which is how
       a dropdown already reaches the value cell. */
    strip: (i === 0 ? '<span class="wk-hh" aria-hidden="true">'
              + cols.map(h => '<span class="slot-hh">' + esc(String(h)) + '</span>').join('')
              + '</span>' : '')
      + '<span class="slot-hours">' + d.hours.map(h => cell(h, d)).join('') + '</span>',
    /* A DAY WITH NOTHING OPEN COLLAPSES. It is still drawn — a missing Wednesday and a Wednesday
       nobody works are different facts, which is the same reason a shut hour is greyed rather than
       removed — but it does not need a thumb-sized row, because there is nothing on it to press. */
    shut: !!d.shut,
    off: !!o.off,
    /* ---------- ONE SENTENCE, UNDER THE LAST DAY --------------------------------------------------
       THE WEEK'S OWN REASON, where the week ends rather than where it starts: "nobody has set any
       hours yet" is about the seven rows above it, and a note printed over a control is a note you
       read before you know what it is about. It used to replace the grid entirely, which threw away
       the one thing a greyed week still says — WHICH hours are shut and why. */
    say: (i === days.length - 1 && o.say) ? { text: String(o.say), warn: false } : null,
  }));
}

function weekGrid_(days, cell) {
  const cols = ((days[0] || {}).hours || []).map(h => (typeof h === 'object' ? h.h : h));
  return `<div class="slot-grid">
    ${slotHead_(cols)}
    ${/* A DAY WITH NOTHING OPEN COLLAPSES. It is still drawn — a missing Wednesday and a Wednesday
          nobody works are different facts, which is the same reason a shut hour is greyed rather
          than removed — but it does not need a thumb-sized row, because there is nothing on it to
          press. Four working days and three closed ones costs half what seven equal rows did. */''}
    ${days.map(d => `<div class="slot-row${d.shut ? ' is-shut' : ''}">
      ${/* TWO LETTERS. Three cost 14px of a row where every pixel is a cell’s width — and Mo/Tu/
            We/Th/Fr/Sa/Su reads as fast as MON/TUE at a third of the room. One letter would not:
            T and S are each two days. */''}
      <span class="slot-day">${esc(String(d.label).slice(0, 2))}</span>
      <div class="slot-hours">${d.hours.map(h => cell(h, d)).join('')}</div>
    </div>`).join('')}
  </div>`;
}

/* ---------- THE WAITING LIST'S WEEK, IN BLOCKS ------------------------------------------------------
   THE SAME BUILDER AS THE HOUR WEEK, THREE CELLS INSTEAD OF ELEVEN. `weekGrid_`'s own note says
   what differs between the grids in this app is THE CELL and nothing else, and that holds here:
   the header, the day letters, the row and the collapse rule are all its.

   NOTHING IS GREYED, AND THAT IS THE QUESTION BEING ASKED. The hour week greys an hour the tutor
   does not work or the venue is shut for — right, because it offers hours that can be BOOKED. This
   asks when the FAMILY can come, of a class with no tutor, no room and no day yet; greying a block
   by whoever happens to be selected now would be answering a different question with the first
   question's data. Every block is offerable and the shape on screen is entirely the family's.

   THE SAME CELL AS THE WEEK ABOVE IT, AND 44px WAS MEASURED AND REFUSED. Three columns could pay
   the tap-target rule where eleven cannot — but the waiting-list card has three pixels of headroom
   in its pane, and a 44px block week is 330px against the hour week's 162 and runs 216px past the
   fold. The arithmetic, and the second and better reason, are written where that rule is not, in
   `style.css` beside `.hr`.

   A DAY NOBODY WANTS IS NOT REMOVED. `shut` collapses a row on the hour week when the tutor works
   none of it; here there is nothing to be shut, so every row is full height and the week is seven
   equal rows — which is what makes it readable as a week rather than as a list. */
function blockWeekRows_() {
  const on = BOOKING.avail || [];
  /* ---------- `is-blocks` HAS GONE AND `blk` HAS NOT ----------------------------------------------
     `is-blocks` SAID "THIS WEEK MAY START AT THE VALUE COLUMN", back when the hour week could not.
     Both weeks are rows of the card now, so it had no reader left and a class with no rule behind it
     is `.favwrap.is-fav` — markup that reads as a decision and does nothing.

     `blk` IS THE OPPOSITE AND IT WAS DROPPED BY MISTAKE. It is the one thing that differs between
     this week and the hour week — three cells a row can pay a real fingertip where eleven cannot —
     and without it the blocks quietly took the hour week's 14px when that grid was made thinner.
     Nothing on screen said so; `check-css.js` did, by naming `blk` as a class styled and nowhere
     produced. */
  return weekRows_(
    SLOT_DAYS.map(([, label]) => ({
      label: label,
      /* `h` IS WHAT THE HEADER GETS — the hour number on the other two weeks and the block's name
         here, which is the one thing that differs in the strip above the first row. */
      hours: SLOT_BLOCKS.map(b => ({ h: b.head, block: b, day: label })),
    })),
    (c) => {
      const phrase = blockPhrase_(c.day, c.block);
      return `<button class="hr blk${on.indexOf(phrase) !== -1 ? ' on' : ''}"
        title="${esc(phrase)}" aria-label="${esc(phrase)}"
        ${/* THE PHRASE ITSELF, not a code. It is what gets stored and what `waitlistWhen` counts,
              so the handler has nothing to assemble and there is no second place for "Monday
              morning" to be spelled — which is the fault this file records under `handle` and
              `username`. */''}
        data-do="book-block" data-when="${esc(phrase)}"></button>`;
    },
    { id: 'avail' });
}

/* ---------- THE WEEK, ON THE PAPER ------------------------------------------------------------------
   THE LAST PANEL, AND THE ONE WORTH KEEPING AS A GRID. Every other question is a list, and a list is
   a dropdown. Hours are not: which hours are free across a week is a SHAPE — you read it by seeing
   Tuesday afternoon is solid and Thursday morning is not — and a dropdown of seventy-seven options
   destroys exactly the thing you were looking at.

   SO IT KEEPS ITS GRID AND LOSES ITS PANEL. It opens underneath the When row, inside the receipt,
   rather than below the card and after everything else. Same markup, same buttons, drawn where the
   answer belongs.

   IT SPANS THE WHOLE ROW because it is not a value in a column — it is the control for the row above
   it, and squeezing seven days into the 55px value column would be worse than the panel was.

   IT IS NOT A MODE AND THERE IS NOTHING TO OPEN. This note used to say `BOOKING.editing` held which
   row was showing its grid and that pressing the row again closed it. That stopped being true in
   the paragraph below — the grid is drawn whenever the When row is — and the control, the field and
   this sentence all outlived it by months. See the note over the deleted `book-edit`. */
function stepWeekRows_(st) {
  /* ---------- ALWAYS DRAWN --------------------------------------------------------------------
     IT UNFOLDED WHEN YOU PRESSED THE ROW ONCE, and folding is the thing to avoid: the card changed
     height under your thumb, every row below it moved, and whether the week was on screen depended
     on something you had to discover. Seven rows of the paper, every time, which is the point — a
     card whose size does not move is a card you can learn. */
  if (!st.grid) return [];

  /* ---------- ONE WEEK ON THE CARD, AND WHICH ONE DEPENDS ON THE BRANCH -------------------------
     A WAITING LIST GETS THE BLOCKS AND NOT BOTH, and they share the seven row names — `SPINE` holds
     Monday to Sunday once and whichever branch is live fills them. Two weeks stacked with one of
     them dead is a different object, and on a card whose pane caps at 805px it is most of the paper
     spent on one question with half of it unanswerable. */
  if (st.grid === 'blocks') return isWaiting_() ? blockWeekRows_() : [];
  if (isWaiting_()) return [];

  const g = slotGrid();
  const on = BOOKING.slots || [];
  const off = stepLocked_(st);
  return weekRows_(
    g.rows.map(r => ({ label: r.label, hours: r.hours, shut: !r.hours.some(h => h.open) })),
    (h, d) => `<button class="hr${on.indexOf(h.code) !== -1 ? ' on' : ''}${
      (h.open && !off) ? '' : ' shut'}" ${(h.open && !off) ? '' : 'disabled'}
      ${/* THE REASON, not just "not available". An hour the tutor never works and an hour they are
            already teaching are the same grey box, and only the second is worth trying a different
            week for. */''}
      title="${h.h}:00${h.open ? '' : ' — ' + esc(h.why || 'not available')}"
      ${/* THE NAME THE CELL USED TO CARRY AS TEXT. With the hours in one strip above the first row
            the box is empty, and an empty button has no accessible name at all — so the day and the
            hour are said here, which is more than the bare numeral ever managed. */''}
      aria-label="${esc(d.label)} ${h.h}:00${h.open ? '' : ', ' + esc(h.why || 'not available')}"
      data-do="book-slot" data-code="${esc(h.code)}"></button>`,
    { id: st.id, off: off,
      /* ---------- A WEEK NOBODY IS FREE FOR IS STILL DRAWN -------------------------------------
         IT USED TO BE REPLACED BY THE SENTENCE, which threw away the half a greyed week still says:
         which hours are shut and why each one is. The reason goes under the last day instead, which
         is where a note about the seven rows above it belongs. */
      say: g.anyOpen ? '' : g.why });
}

/* Which steps open something under their row rather than answering in it. */
/* ---------- A FIELD THAT CANNOT BE ANSWERED IS SHOWN, NOT REMOVED ----------------------------------
   ROWS USED TO DISAPPEAR. `stepRows_` skipped any step whose `options()` came back empty, so
   choosing "waiting list class" deleted Subject, Level, When and Term off the card, and choosing a
   class to join deleted four more. The paper reshaped itself under every answer, which is the
   opposite of what a form should do — you cannot learn where anything is if it moves.

   EVERY QUESTION HAS A ROW, ALWAYS. What changes is whether you can answer it, which is a state of
   the control rather than a reason to remove the line. A greyed row still says what the booking is:
   "Level · 11+, and not yours to change" is information; a missing Level row is a question you are
   left wondering about.

   TWO REASONS TO LOCK ONE:
     · NOTHING TO OFFER — a class has no day to pick, an instant booking has no list to join.
     · ALREADY DECIDED — the class you are joining has a subject, a level, a venue and one seat,
       chosen by whoever opened it. Those are shown, filled in, and not up for negotiation by the
       fifth person to join. */
const FIXED_BY_CLASS = ['subjects', 'level', 'loc', 'n'];

function stepLocked_(st) {
  if (joinedJob_() && FIXED_BY_CLASS.indexOf(st.id) !== -1) return true;
  try { return !(st.grid || st.emails || st.options().filter(Boolean).length); }
  catch (e) { return true; }
}

/* The control a row carries. One answer here so `stepRows_` and `breakdownRows` cannot draw a
   different thing for the same step.

   `st.grid` DIRECTLY, WHERE THIS READ `stepIsPanel_(st)`. That predicate was `!!st.grid` under a
   name describing a panel that no longer exists — see the note over the deleted `book-edit` — and
   a wrapper whose name is wrong about what it tests is worse than no wrapper. The week is its own
   control, drawn under the row by `stepGrid_`, so the row itself carries no dropdown. */
function stepControl_(st) {
  if (st.grid) return '';
  return st.emails ? stepInput_(st) : stepSelect_(st);
}

/* ---------- EVERY QUESTION AS A ROW, ANSWERED OR NOT -----------------------------------------------
   THE PAPER USED TO ARRIVE LATE. `breakdownRows` builds a row per thing that has a PRICE, so before
   anything was answered there was nothing to draw and the card said "not enough answered to price
   it yet" — a sentence where the document should have been. And even part-way through, a question
   still to come left no trace: you could not see that a venue was expected until the venue question
   arrived.

   SO THE UNANSWERED ONES ARE DRAWN TOO, as rows with a blank in the value column, pressable like
   every answered one. The card is the whole form from the first moment: what it will ask, what you
   have said, and what it costs so far, in one object that fills in rather than appears at the end.

   `short` IS THE COLUMN NAME. A step's `label` is a question — "How would you like to book?" — and
   a question does not fit a 4.4rem column or read like a receipt line. Every step carries a short
   noun beside its question now, which is the word a till roll would print.

   A QUESTION WITH NOTHING TO OFFER IS NOT DRAWN. `nextBookStep` skips those and never asks them —
   the subjects question on a shared class, the children question for somebody with no children —
   so a row for one would be a line nobody can ever fill in. */
/* WHICH OF THE FORM'S TWO BRANCHES THIS IS, in one place. `stepRows_` drops the other branch's
   questions and `bookBreakdown` tells `spineRows_` not to invent them as dashes — two readings of
   one fact, and a second `isWaiting_() ? 'wait' : 'book'` written out is the second reader this
   file keeps finding. The words are the ones `SPINE_EXTRA`'s `only:` already uses. */
function bookOn_() { return isWaiting_() ? 'wait' : 'book'; }

function stepRows_() {
  let line = 0;
  /* ONE FILTER, AND IT IS NOT ABOUT WHETHER A QUESTION CAN BE ANSWERED YET — see `stepLocked_` for
     why a question with nothing to offer is greyed rather than dropped, and the `only:` note on the
     `avail` step for the one thing that is dropped: a question belonging to the branch this card is
     not on. */
  const on = bookOn_();
  return BOOK_STEPS
    .filter(st => !(st.only && st.only !== on))
    /* ---------- ONE STEP IS NOT ALWAYS ONE ROW ---------------------------------------------------
       A WEEK IS SEVEN. `flatMap` rather than `map` because the When question is answered on seven
       lines of the card — Monday to Sunday, each with its hours in the answer column — and a step
       that draws no week on this branch contributes none at all. See `weekRows_`. */
    .flatMap(st => {
      if (st.week) return stepWeekRows_(st);
      const v = BOOKING[st.id];
      const text = st.emails
        ? ((BOOKING.split || []).filter(x => String(x).trim()).join(', '))
        : st.grid === 'blocks'
        /* GROUPED — see `blockSay_`. The stored list is one phrase per cell and this is the
           sentence they add up to, which is the same split the hour grid makes between `m13, m14`
           and `Monday 13:00–15:00`. */
        ? blockSay_(v)
        : st.grid
        /* ---------- THE WHOLE RUN, NOT ITS START -----------------------------------------------
           THIS SAID "Mon 13:00" and the grid printed "Monday 13:00–15:00" underneath it — the same
           answer twice, and the row had the less useful half. A session is a span; when it ENDS is
           what somebody checks against the rest of their day, and the start alone cannot say
           whether two ticked hours are one two-hour session or two separate ones.

           The full form is on the row now and the line under the grid has gone with it. */
        ? bookRuns().map(r => r.dayName + ' ' + r.hour + ':00–' + (r.hour + r.hours) + ':00')
            .join(', ')
        /* A MULTI WITH NOTHING TICKED FALLS BACK LIKE ANY OTHER STEP. It could not before: this
           branch sits above the `fallback` line and returned `''` for an empty list, so the one
           step that has both — `interval`, which takes several terms and answers itself on a
           waiting list — would have shown a dash over an answer it already knew. */
        : st.multi ? ((v || []).join(', ') || (st.fallback ? st.fallback() : ''))
        /* ---------- A QUESTION WITH AN OBVIOUS ANSWER SHOWS IT ---------------------------------
           "FOR" SAT EMPTY WHILE EVERY OTHER PART OF THE APP ALREADY KNEW. `BOOKING.client` is only
           set when somebody CHOOSES — which for an admin booking on behalf of a family is the whole
           point of the row, and for everybody else is a question with one possible answer. So the
           three places that actually use it all wrote `BOOKING.client || USER.name`, and the row
           that DISPLAYS it did not: signed in as Daniel, the booking priced itself for Daniel,
           saved itself for Daniel, and printed "For —".

           `fallback` PUTS THAT ONE RULE ON THE STEP. The row shows what the booking would be
           submitted as, which is the only honest thing for it to show, and choosing anything else
           still overwrites it exactly as before. */
        : (st.label_ ? st.label_(v) : (v || (st.fallback ? st.fallback() : '')));
      return [{ n: String(++line).padStart(3, '0'),
               k: st.short || st.id,
               /* AN EM DASH, NOT AN EMPTY CELL. A blank looks like a row that failed to draw; a
                  dash looks like a blank somebody is expected to fill, which is what it is. */
               v: String(text || '—'),
               mul: '', rate: '', total: '',
               /* THE STEP THIS ROW STANDS FOR. `bookBreakdown` matches a price line to its
                  question on this, which is how the hours and the rate land on the Tutor row.

                  `step:` WAS HERE TOO AND IT MARKED THE ROW PRESSABLE — see the note over the
                  deleted `book-edit`. Nothing read it but the markup that drew a gold underline
                  under a control that did nothing. */
               id: st.id,
               sel: stepControl_(st),
               /* ---------- SEVEN EXPLANATIONS WRITTEN OUT AND DRAWN NOWHERE -------------------
                  `why` AND `note` ARE DEFINED ON SEVEN STEPS AND WERE READ BY NOTHING. Measured:
                  `st.why(` and `st.note(` do not occur anywhere in `js/`. So the form could tell
                  you that the tutor you picked does not teach your subject, that you have ticked
                  more children than you have seats, that a waiting list is cheaper but waits, and
                  that an unnamed seat is still a booked seat — and said none of it. This
                  repository's oldest shape, already recorded under `figure`, `orderPrints`, the
                  four message actions, `exam_date` and `wow`.

                  A `why` IS A REFUSAL AND A `note` IS AN ASIDE, which is why they are one field
                  with a flag rather than two rows. A refusal says the answer on the row is wrong
                  for the booking — nothing else on the card says so, and a dropdown that accepts
                  an impossible answer in silence is worse than one that refuses it. An aside says
                  what the answer MEANS, and recedes.

                  THE REFUSAL WINS WHERE BOTH SPEAK, because you cannot act on an aside about an
                  answer you have to change. */
               say: (() => {
                 /* ---------- NOTHING IS SAID ABOUT AN ANSWER NOBODY HAS GIVEN ------------------
                    THE FIRST RUN PRINTED "the minimum needs 1" IN GOLD UNDER AN EMPTY SEATS ROW.
                    Every one of these predicates takes the chosen value and tests it, so an unset
                    step hands them `''` and several have something to say about it — which on the
                    card is the form refusing a question it has not asked yet. A refusal before the
                    answer is the shape this file records where a missing fact was drawn as a
                    negative one.

                    ASKED OF THE ANSWER RATHER THAN OF THE STEP, so a multi with nothing ticked and
                    a dropdown left on the dash are both silent by the same test. */
                 const answered = st.multi ? (v || []).length
                   : String(v == null ? '' : v).trim() !== '';
                 /* ---------- AND NOTHING IS SAID ABOUT A QUESTION THIS BRANCH CANNOT ASK --------
                    FOUND BY A DECLARED STATE, on the waiting-list form: the Subject row is locked
                    there — `options()` is `[]` when `isWaiting_()`, because a class's subject is
                    settled by whoever opens it — and directly under the greyed dash sat *"Pick as
                    many as apply — choosing again adds one, and a ticked one comes back off."*
                    Instructions for using a control that cannot be used.

                    That is the same fault as the caption over the week grid this file already
                    removed: a sentence about an action, printed where the action is not available.
                    It is also 27px on a card that is 33px past its pane at 768, which is what made
                    it worth looking for rather than worth arguing about. */
                 if (stepLocked_(st)) return null;
                 if (!answered && !(st.multi && st.note)) return null;
                 const w = (answered && st.why) ? String(st.why(v) || '') : '';
                 if (w) return { text: w, warn: true };
                 /* A MULTI'S NOTE IS ALLOWED TO SPEAK BEFORE THERE IS AN ANSWER, and it is
                    the only one that is: "you may pick more than one" is worth knowing precisely
                    while nothing is picked, which is the opposite of a refusal. */
                 const n = st.note ? String(st.note(v) || '') : '';
                 return n ? { text: n, warn: false } : null;
               })() }];
    });
}

/* THE ROWS THE CARD LAST DREW. Read by `receiptCanvas` so a shared picture is the document on the
   screen rather than a second attempt at it. */
let BOOK_ROWS = [];

/* ==================================================================================================
   THE SPINE — ONE ROW LIST, TWO DOCUMENTS.

   THE BOOKING FORM AND THE RECEIPT WERE BUILT BY TWO FUNCTIONS that had drifted apart line by line.
   The form said `Seats`, the receipt said `Students`. The form said `Space`, the receipt said
   `Host`. The receipt had `Running`, `Weeks left` and `About` that the form had never heard of, and
   the form had `Kind`, `Class`, `Split` and `When free` that the receipt dropped. Their orders
   disagreed. Every fix all evening had to be made twice, and twice it was made once.

   THIS IS THE ONE ORDER. Taken from the FORM, because that is the document somebody meets first and
   the order they learn — a receipt that reshuffles what they just filled in is a receipt they have
   to read from scratch.

   EVERY ROW APPEARS ON BOTH. A row with nothing to say prints a dash rather than being left out,
   because a document whose SHAPE changes with its contents cannot be read at a glance: you find a
   line by where it is, and "where it is" has to be the same every time. That is the whole point of
   a printed form.

   ADDING A ROW MEANS ADDING IT HERE, and both documents get it. `check-spine.js` fails if either
   builder emits a label that is not on this list, which is what stops the drift coming back.
================================================================================================== */
/* ---------- THE FORM IS THE ARCHETYPE, SO THE FORM IS WHERE THIS COMES FROM ------------------------
   THE FIRST VERSION OF THIS WAS THE FORM'S ORDER TYPED OUT BY HAND, which is a copy — and a copy is
   a thing that goes stale the first time somebody adds a question to `BOOK_STEPS` and does not think
   to come here. That is the exact failure the spine exists to stop, reintroduced one level up.

   SO THE QUESTIONS ARE READ OFF THE STEPS. Every step's `short` IS a spine row, in the order the
   form asks them, taken from the one list that already decides what the form looks like. Add a
   question to the form and the receipt grows a row for it, with no second place to remember.

   AND THE ROWS THAT ARE NOT QUESTIONS ARE DECLARED HERE, because they have nowhere else to come
   from: `Extra subjects` is arithmetic, `About` is looked up from the term,
   `Stage` and `Status` and `Asked for` only exist once a booking has been sent. Each is pinned
   AFTER the question it belongs with rather than given an index, so inserting a step upstream moves
   them along with it instead of leaving them stranded at a number that no longer means anything. */
/* ---------- FOUR LABELS WERE TOO LONG FOR THEIR OWN COLUMN ----------------------------------------
   `Extra subjects`, `Each session`, `Sharing with` and `Shared between` all broke onto a second
   line, so four rows on every document were twice the height of the twenty-three around them — and
   a document read by position is hardest to read when the positions are uneven.

   SHORTENED RATHER THAN THE COLUMN WIDENED. The column is 6.2em because the VALUE column needs what
   is left; giving it two more would take them off the answers, which are the part somebody is
   actually reading. `Per session`, `Sharing`, `Shared by`, `Extra subj.` — each still says what it
   is beside the figure that follows it.

   `Extra subj.` KEEPS ITS FULL STOP. It is the one genuine abbreviation of the four, and a shortened
   word that does not admit it is a word somebody reads twice. */
/* ---------- `only` — WHICH DOCUMENT CAN EVER FILL THIS ROW -------------------------------------
   THE SPINE IS THE UNION OF THREE DOCUMENTS AND THE FORM WAS PRINTING ALL THREE. Measured on a
   priced ordinary booking at 390px: nine rows drew a dash and EIGHT of them were another document's
   — `A seat`, `Shared by`, `Per session` and `About` are pushed only
   inside `if (isWaiting_()) { … return rows; }`, which an ordinary booking never enters, and
   `Sharing` and `Asked for` are pushed only by `jobRows`, which is the receipt.

   `SPINE`'S OWN ARGUMENT IS ABOUT ONE DOCUMENT, and it still holds: *"a document whose SHAPE
   changes with its contents cannot be read at a glance: you find a line by where it is"* — so a
   row you have not answered YET keeps its place, because you are about to answer it and everything
   below it would move. A row this branch cannot answer at all is not that: nothing you do on this
   form will ever fill it, so it never moves anything, and it was never on this document.

   IT ONLY GOVERNS THE INVENTED DASH. If a builder pushes the row, the row is drawn, whatever this
   says — so a branch that starts pushing `Per session` needs nothing changed here, and a flag that
   goes stale can hide nothing. The order is untouched, `check-spine.js` reads the labels both
   builders push rather than the markup, and the receipt passes `fill: false` so none of this
   reaches it. */
/* ==================================================================================================
   WHERE A BOOKING HAS GOT TO, AS FIVE TICKS RATHER THAN ONE SENTENCE.

   ASKED FOR AS *"it needs a line for requested and it gets ticked automatically by system. Then
   line for accepted, then line for paid, then line for started. Then line for completed. All tick
   boxes."*

   WHAT WAS THERE was `Stage` — one row carrying one of `jobSaid_`'s four sentences ("Asked for —
   waiting on us", "Accepted — waiting for payment") — and `Asked for`, a date. A sentence says
   where you are; it cannot say what the shape of the whole thing is, so "how far along is this"
   took reading a line and knowing the vocabulary. Five ticks say it at a glance, and the first
   un-ticked one IS what happens next, which is the half the sentence was carrying.

   SO `Stage` IS GONE AND SO IS `jobSaid_`. The ticks and the sentence are the same fact drawn two
   ways, which is the fault recorded in CLAUDE.md where every widget printed its own name twice —
   and that function's own note claimed three readers ("the receipt row, the booking form and the
   stamp on the card"). Measured before deleting it: one. The stamp went with the four receipt
   skins and the form pushes a literal dash, so the sentence had one home and it was this row.

   `Asked for` IS GONE TOO, and it is the other half of the same duplication: it is the DATE of the
   Requested tick, so it is that row's value rather than a row of its own. It had never drawn —
   `created_at` is written by three handlers and `doGet` sent it nowhere, so the guard
   `if (j.createdAt)` in `jobRows` could not fire. The date arrives now because this row reads it.

   ---------- NOBODY TICKS THESE BY HAND, AND THAT IS WHY THERE ARE NO CHECKBOXES IN THEM ----------
   Every one of the five is already derivable from what the machine holds — the roster the backend
   folds out of the events, and the session dates. A tick somebody could press would be a SECOND
   source for a fact the roster already answers, which is the drift this file records under
   `documents_()`, `factsNow_` and `childrenOf`: two places to say one thing, and the one a person
   maintains is the one that goes wrong.

   So they are a MARK rather than a CONTROL. `.check` is this app's only checkbox and it is a
   `<label>` round an `<input>` at a 44px floor; five of those is 220px of pressable nothing on a
   card whose headroom has been measured in single pixels. `.bk-tick` borrows that control's
   argument — a visible edge, a ghost ✓ in an empty box, gold when it is done — at receipt-row size.

   ---------- EACH ONE ASKS ITS OWN QUESTION, AND THEN THE ONE ABOVE IT -----------------------------
   A CHAIN, because that is what a progression means and because the calendar alone is not evidence
   that a lesson happened. A session accepted but never paid for, whose start date has passed, would
   tick `Started` off the clock — the app claiming teaching took place that nobody paid for. Read as
   a chain it cannot: `Started` needs `Paid`, which needs `Accepted`, which needs the seats agreed.

   AND CANCELLATION FALLS OUT OF IT FOR FREE. `jobAccepted_` answers false on an empty roster, and
   `participantsOf` empties the roster when everybody has gone — so a cancelled booking ticks
   `Requested` and stops, with nothing here that knows the word.

   WHAT IT CANNOT SAY, said rather than implied: `Started` and `Completed` are read off the PLANNED
   dates, because that is the only record there is. A session paid for and then not taught still
   ticks. A "the lesson happened" record would be a column and a person to maintain it, which is
   exactly what the paragraph above refuses. */
/* ---------- AND EVERY TICK CARRIES THE DAY IT HAPPENED -------------------------------------------
   ASKED FOR AS *"The tick boxes have a date for when it got requested. When other things get ticked
   they should also have a date."*

   THE DATES WERE ALREADY ON THE PHONE and nothing was reading them. `doGet` has put
   `events: eventsForJob(jobId)` on every job since the roster was derived from the log — six
   fields per row, `at` among them — and the only reader anywhere in `js/` was nothing at all. That
   is this repository's oldest shape once more, and the fix needs no backend change: `Accepted` and
   `Paid` are days the job's own log already records.

   `at` IS DAY-GRANULAR. `eventsForJob` puts it through `fmtDate`, so the time `logEvent` wrote is
   thrown away and what arrives is `dd/mm/yyyy`. That is exactly right as a label and useless as a
   sort key, so nothing here sorts by it: the log is append-only and ARRAY ORDER is the order things
   happened in.

   ---------- WHICH EVENT, AND THE TWO ANSWERS ARE OPPOSITE ENDS OF THE LIST --------------------
   EACH DATE IS TAKEN TO MATCH ITS OWN PREDICATE, which is the only rule that stays right when the
   predicates differ:

     `Accepted` needs EVERY seat agreed, so it became true at the LAST `Accept`.
     `Paid` needs a seat BOOKED, and `jobStage_` counts how many — one for a session, all of them
     for a waiting list — so it became true at the Nth `Confirm`.

   THE LAST `Accept` IS EXACT FOR EVERY STATE THE APP CAN REACH, and that took checking rather than
   assuming. Two things could have broken it. An `Edit` drops everybody un-booked back to Waiting,
   so a re-Accept follows — and the last Accept is that re-Accept, which is the right day. And the
   admin's Accept writes one event per participant on every press, so pressing it twice would move
   the date with nothing having changed — except that `bmActionsFor` withholds `ACT.ACCEPT` from a
   seat already at `Agreed`, and `check-flow.js` asserts an admin is only offered it on a booking
   that is waiting. So the second press is not a thing the app offers.

   `Confirm` IS THE ONE VERB THAT REACHES `Booked` and it is a bare string in three places rather
   than a member of `ACT` — `dopost.gs` writes it twice, `booking.gs` reads it once. Named here
   where it is read, because the phone has no `ACT` to reach for.

   ---------- A TICK WITH NO DATE IS A TICK, AND A DATE WITH NO TICK IS A LIE -------------------
   `stageRows_` computes the value only when the tick is on, so an un-ticked row is blank by
   construction. That is deliberate for `Started` and `Completed`, whose dates are the PLANNED ones
   and are known in advance: putting a future date in the column that everywhere else means *the
   day this became true* would make one column mean two things, told apart only by whether the box
   beside it is filled. The plan is already on the card — `Dates` prints the range and the count.

   And where a ticked stage has no event to date it, it draws the tick and nothing else. Printing a
   dash or the word unknown would be content where a blank is skimmed past; inventing a nearby
   event's date would be the `cost: 0` shape on a document somebody keeps. */
const JOB_STAGES = [
  /* THE ROW EXISTS, SO IT WAS ASKED FOR. This is the one the owner described as ticked by the
     system, and it is ticked by the booking's own existence rather than by anything writing a cell:
     `jobRows` only ever runs on a job, and a job is a row on the jobs tab.

     `created_at` IS THE JOB'S OWN CELL and the first `Request` is the fallback, because that column
     is newer than the tab: a job made before it existed has a blank cell and an event log that
     still says exactly when somebody asked. */
  { row: 'Requested', is: j => true,
    when: j => S_(j.createdAt) || evAt_(j, 'Request', 1) },
  /* THE BUSINESS HAS SAID YES. `jobAccepted_` is the same function the receipt has always used and
     its note is the argument: an accepted application is still an application, because money has
     not moved, and both facts are true at once. */
  { row: 'Accepted',  is: j => jobAccepted_(j),
    when: j => evAt_(j, 'Accept', -1) },
  /* MONEY HAS MOVED. A seat at `Booked` is the machine's own record of a payment — `jobStage_`
     reads the same seats to decide which of the four documents this is, so the tick and the
     document cannot disagree.

     AND THE SAME ARITHMETIC DECIDES THE DATE. `jobStage_` needs one booked seat on a session and
     a full house on a waiting list, so the `Confirm` that ticked it is the first or the last, and
     `paidNeeds_` is that count rather than a second reading of the rule. */
  { row: 'Paid',      is: j => jobStage_(j) === 'receipt',
    when: j => evAt_(j, 'Confirm', paidNeeds_(j)) },
  /* THE FIRST PLANNED SESSION IS IN THE PAST. `startDate` and `endDate` are sent by `doGet` off the
     job's own `session_dates`, so this needs nothing new in the sheet — and they are the dates the
     two ticks are READ from, so a tick and its date cannot disagree here by construction. */
  { row: 'Started',   is: j => datePassed_(j.startDate), when: j => S_(j.startDate) },
  { row: 'Completed', is: j => datePassed_(j.endDate),   when: j => S_(j.endDate) },
];

/* THE nTH EVENT OF A KIND, AND `-1` IS THE LAST. Array order is the order they were written, which
   is the only ordering there is — `at` is a day and two things can happen on one day. A job with
   no log, or too few of that kind, answers with nothing rather than with the nearest thing. */
function evAt_(j, action, n) {
  const all = (j && j.events || []).filter(e => norm(e && e.action) === norm(action));
  if (!all.length) return '';
  const e = n === -1 ? all[all.length - 1] : all[n - 1];
  return e ? S_(e.at) : '';
}

/* HOW MANY BOOKED SEATS `jobStage_` IS WAITING FOR — one on a session, the whole house on a waiting
   list. Read here so the tick and its date are made of one rule; a waiting list with no seat count
   cannot be full, which is `jobStage_`'s own early answer, and `0` here means the same thing. */
function paidNeeds_(j) {
  return norm(j && j.kind) === 'waitlist' ? seatsOf_(j) : 1;
}

/* HAS THIS DAY BEEN AND GONE. `parseDMY` is the app's one reader of a `dd/mm/yyyy` cell and it
   zeroes the time, so this is a comparison of days rather than of moments — a session at four this
   afternoon has not started at nine this morning, and it has by tomorrow. An unparseable or absent
   date is not passed, which is the right answer for a booking with no dates yet. */
function datePassed_(v) {
  const d = parseDMY(v);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d <= today;
}

/* ONE BUILDER, BOTH DOCUMENTS — which is the whole of what stops them drifting, the same argument
   `weekRows_` makes for the three week grids. `j` is null on the form: five rows, none ticked, so
   an unsent booking shows the five stages ahead of it and pressing Send ticks the first. That is
   `SPINE`'s own rule about a document not changing shape at the moment somebody is checking it,
   which is why these are NOT marked `only: 'receipt'` — the form and the receipt are one document
   across time, and the placeholder is the point. */
function stageRows_(j) {
  let on = true;
  return JOB_STAGES.map(st => {
    /* THE CHAIN. Once one is unticked, nothing below it can be — see the note above. `on` carries
       that down the list rather than each test repeating the ones before it. */
    on = on && !!j && !!st.is(j);
    /* ---------- ONE DATE FORMAT FOR THE FIVE, DECIDED HERE AND NOT IN FIVE PLACES ---------------
       THE THREE SOURCES SPELL A DAY THREE WAYS. `createdAt` and an event's `at` both go through
       the backend's `fmtDate` and arrive as `dd/mm/yyyy`; `startDate` and `endDate` are cut
       straight out of the `session_dates` cell and are whatever somebody typed. So `Accepted
       25/09/2026` sat above `Started 06/10/26` — one column, two spellings, on a document read by
       running your eye down it.

       `fmtDate` IS THE APP'S OWN VOICE and the `Dates` row three lines up already speaks it, so
       this is the format the card had rather than a new one. Applied where the value is built, so
       no `when` has to remember — and it passes through anything it cannot parse, which is the
       right answer for a cell nobody has normalised. */
    const at = on && st.when ? st.when(j) : '';
    return { n: '', k: st.row, v: (at && fmtDate(at)) || '',
             mul: '', rate: '', total: '', free: true, tick: on };
  });
}

const SPINE_EXTRA = [
  { after: 'Subject', row: 'Extra subj.' },
  { after: 'When',    row: 'Per session', only: 'wait' },
  /* `Sharing` IS PUSHED BY `jobRows` AND BY NOTHING ELSE — measured, one push in this file. The
     form asks the question as `Split` and names the answer there. */
  { after: 'Split',   row: 'Sharing',     only: 'receipt' },
  /* ---------- PINNED TO THE FOOT RATHER THAN TO WHICHEVER QUESTION IS LAST -----------------------
     THESE FIVE HAVE NOW BEEN RE-PINNED TWICE, and both times the row they hung off had moved. They
     were on `Tutor` while `Tutor` was last and went to `For` when it became last; `For` is the
     FIRST question now, and pinning them there would have carried the dates, the note and the two
     waiting-list lines to the top of the card. The note that used to sit here said pinning is what
     makes a move visible where an index would be silent — true, and it still leaves the rows
     following a question around the form for a reason that has nothing to do with either of them.

     AN EMPTY `after` IS THE TAIL, which is where they belong by description: they are the foot of
     the document, after everything it is about. That is immune to which question is last, so this
     cannot need repinning a third time — and the tail keeps SPINE_EXTRA's own order, so they still
     come out in front of `Stage`, `Status` and `Asked for`. */
  { after: '',        row: 'About',     only: 'wait' },
  { after: '',        row: 'Dates' },
  { after: '',        row: 'Note' },
  /* THE TWO WAITING-LIST ROWS. `check-spine.js` found these the first time it ran: the form printed
     `A seat` and `Shared between` and the receipt printed neither, so the one document that says
     what a seat costs and how many families share it was the one nobody was handed. */
  { after: '',        row: 'A seat',    only: 'wait' },
  { after: '',        row: 'Shared by', only: 'wait' },
  /* LAST, ALWAYS. Where a booking has got to is the closing of the document, after everything it is
     about — which is where a receipt puts it and where the form now puts it too.

     NONE OF THE FIVE IS MARKED `only:`, AND THAT IS A DECISION RATHER THAN AN OVERSIGHT. By the
     rule above they would go — they are pushed by `jobRows` and by the form's two branches, never
     by a builder that can only reach one document. `check-flow.js` refused exactly that argument
     when it was made about `Asked for`, and the reason is the one `SPINE` opens with: the form and
     the receipt are one document across TIME, so a row that appears only once the thing is saved
     is a row that changes shape at the moment somebody is checking it. The waiting-list rows above
     are a different branch of the FORM, which is one document across nothing — an ordinary booking
     never becomes a waiting list.

     `Stage` AND `Asked for` STOOD HERE. See `JOB_STAGES`: the sentence is what the five ticks say
     in words, and the date is the `Requested` tick's own value. */
  ...JOB_STAGES.map(st => ({ after: '', row: st.row, tick: true })),
  { after: '',        row: 'Status' },
];

const SPINE = (() => {
  const out = [];
  const tail = SPINE_EXTRA.filter(x => !x.after).map(x => x.row);
  BOOK_STEPS.forEach(st => {
    if (!st.short) return;
    /* ---------- A WEEK STEP IS SEVEN ROWS AND THEY ARE THE SAME SEVEN ON BOTH BRANCHES -----------
       MONDAY TO SUNDAY ONCE, not twice. Both week steps — hours for a session, blocks for a waiting
       list — answer the same seven questions, and only one of them is ever on the card, so they
       share the row names rather than each contributing a set. Deduped here rather than by ordering
       the two steps carefully, because an order is a thing to keep in step and this is not.

       `st.short` STILL ANCHORS ITS EXTRAS. It names no row now; it is the name `SPINE_EXTRA` pins
       to, so `Per session` still lands directly after Sunday. */
    if (st.week) SLOT_DAYS.forEach(([, label]) => {
      if (out.indexOf(label) === -1) out.push(label);
    });
    else out.push(st.short);
    SPINE_EXTRA.forEach(x => { if (x.after === st.short) out.push(x.row); });
  });
  /* AN EXTRA PINNED TO A STEP THAT NO LONGER EXISTS would vanish silently, which is the same class
     of fault as everything else tonight. Anything unplaced goes on the end, where it is visible,
     and `check-spine.js` reports it. */
  SPINE_EXTRA.forEach(x => {
    if (x.after && out.indexOf(x.row) === -1) out.push(x.row);
  });
  return out.concat(tail);
})();

/* THE RECEIPT'S OLD NAMES FOR SPINE ROWS. Kept as a translation rather than renamed at the twenty
   call sites, so a `push` anywhere in this file still lands on the right line. */
/* `Total: ''` DROPS THE ROW. The receipt pushed a `Total` line AND the paper prints a total bar at
   the foot — so £151.82 appeared twice, four rows apart, on the document whose entire job is to say
   what something costs. The form has only the bar. The bar wins: it is the thing set apart from the
   rows, which is what a total is. */
/* `Extra subjects` → `Extra subj.` WAS THE ONE SHORTENING THAT NEVER REACHED ITS PUSH SITE. The
   note above records four labels shortened to fit the 6.2em column; three of them were shortened
   where they are pushed, and this one lives in `price-rows.js` as `label: 'Extra subjects'`. So
   `SPINE.indexOf('Extra subjects')` was −1, the row fell through to `extra`, and a priced booking
   drew it at the FOOT of the card — below `Status` — while `Extra subj.` drew a dash up beside
   `Subject` where `AFTER` had carefully placed it. One fact, twice, in two places, on the live
   form. Measured: nine dashes and a stray `Extra subjects` row after `Status`. */
const SPINE_ALIAS = { Students: 'Seats', Host: 'Space', Total: '',
                      'Extra subjects': 'Extra subj.' };

/* One row name to the one document that can fill it, read off the two lists that declare rows so
   there is no third one to keep in step.

   BOTH, BECAUSE A STEP CAN BE BRANCH-ONLY TOO. `SPINE` is built from every step's `short`, so a
   question `stepRows_` correctly drops would come straight back as an invented dash under the same
   name — the row removed and then re-added by the function two hundred lines down. The flag is
   declared once, beside the row it belongs to, wherever that row is declared. */
const ONLY_ON = (() => {
  const m = {};
  SPINE_EXTRA.forEach(x => { if (x.only) m[x.row] = x.only; });
  BOOK_STEPS.forEach(st => { if (st.only && st.short) m[st.short] = st.only; });
  return m;
})();

/* ---------- AND WHICH SPINE ROWS ARE A TICK RATHER THAN A VALUE --------------------------------
   AN INVENTED ROW HAS TO KNOW, and a blank form is where it is invented: `breakdownRows` does not
   run until there is enough answered to price the booking, so on the form somebody has just opened
   all five stages come from `spineRows_`. Without this they would draw a dash, and the same five
   rows would draw an empty box the moment a price appeared — one document in two shapes, which is
   the fault the spine exists to stop.

   READ OFF `SPINE_EXTRA` FOR `ONLY_ON`'S REASON: the flag is declared once, beside the row it
   belongs to, rather than listed a second time here. */
const TICK_ROW = (() => {
  const m = {};
  SPINE_EXTRA.forEach(x => { if (x.tick) m[x.row] = true; });
  return m;
})();

/* ---------- PUT ROWS IN SPINE ORDER, AND FILL WHAT IS MISSING -------------------------------------
   NEITHER BUILDER IS REWRITTEN. Each still produces whatever rows it can, in whatever order suits
   the code that makes them; this puts them in the one order and adds a dash for every spine row
   neither produced. One function, so the two documents cannot disagree about order even if somebody
   edits one builder and forgets the other.

   ANYTHING NOT ON THE SPINE KEEPS ITS PLACE AT THE END — the day rows, the seat lines, whatever a
   branch prints for itself. The spine fixes the skeleton, not every bone. */
/* ---------- AND ONE OF THE TWO DOCUMENTS DOES NOT WANT THE DASHES --------------------------------
   REPORTED AS "its so fucking clunky long looking", about the receipt. Measured at 390px on a real
   session — subject, level, tutor, venue, six dates, a price: the card is 683px and **fourteen of
   its twenty-eight rows are a dash**, 168px of it, a quarter of the document spent saying nothing
   fourteen times.

   THE ARGUMENT ABOVE IS ABOUT A DOCUMENT YOU FILL IN, and it is right about one. "You find a line
   by where it is" is how you use a FORM: the rows you have not answered yet are the rows you are
   about to, and one appearing under your thumb as you answer moves everything below it — which is
   the complaint this file already records about the week grid folding. A form keeps its dashes.

   A RECEIPT IS NOT FILLED IN. It is read once, about one session, and nobody counts down it to find
   `Tutor` — they look for the word. A row that says a fact does not exist is not a fact; on a
   printed receipt it is the line the shop leaves off.

   THE SPINE IS UNTOUCHED AND SO IS ITS GUARD. This changes which rows are DRAWN, not what a row is
   called or where it sits: what survives is still in spine order, `SPINE_ALIAS` still resolves the
   old names, and `check-spine.js` reads the LABELS both builders push rather than the markup — so
   the drift it exists to stop (`Seats` against `Students`, `Space` against `Host`) is caught
   exactly as before. Proved by putting a stray label back.

   `fill` DEFAULTS TO TRUE, so the form is the untouched caller and the receipt is the one that asks
   for something different. A default that changes the form's behaviour from a line in the receipt's
   builder is the kind of action at a distance this file keeps finding. */
function spineRows_(rows, opts) {
  const say = {};
  const extra = [];
  rows.forEach(r => {
    const k = SPINE_ALIAS[r.k] !== undefined ? SPINE_ALIAS[r.k] : r.k;
    /* AN ALIAS TO NOTHING IS A ROW THAT SHOULD NOT BE DRAWN, not a row with no home — see `Total`
       above. It was falling through to `extra` and printing at the foot anyway, which is the
       opposite of what the alias says. */
    if (SPINE_ALIAS[r.k] === '') return;
    if (!k) { extra.push(r); return; }
    if (SPINE.indexOf(k) === -1) { extra.push(r); return; }
    if (!say[k]) say[k] = Object.assign({}, r, { k: k });
  });
  const fill = !opts || opts.fill !== false;
  /* WHICH DOCUMENT IS ASKING. `ONLY_ON` is built from `SPINE_EXTRA`, so the flag is declared once
     beside the row it belongs to rather than listed again here. No `on` means invent everything,
     which is what every caller that does not know about branches gets. */
  const on = (opts && opts.on) || '';
  /* ---------- AND A ROW WHOSE FIGURES WENT ONTO A QUESTION IS NOT A ROW TO INVENT ----------------
     `A seat` IS PUSHED BY THE WAITING BRANCH AND CARRIES `step: 'loc'`, so `bookBreakdown` merges
     its rate and total onto the Venue row and marks it used — which is right: the venue IS what a
     seat is priced from, and printing `Colliers Wood Library · £12.00/h · £24.00` twice under two
     names is the duplication that merge exists to stop.

     WHAT WAS LEFT IS THE NAME. The row never reached here, so the spine saw a key nothing had
     filled and invented a dash for it — on the one branch the row belongs to, under a label whose
     content is four lines above. A blank that can never fill, which is exactly what `only:` was
     added to stop one kind of.

     `check-spine.js` CANNOT SEE THIS and does not claim to: it reads what the builders PUSH, and
     `A seat` is genuinely pushed. The merge happens afterwards, in `bookBreakdown`, which is the one
     place that knows — so it is the one place that can say so. */
  const gone = (opts && opts.said) || {};
  const out = SPINE.map(k => (say[k] || (fill && !gone[k]
    && !(on && ONLY_ON[k] && ONLY_ON[k] !== on) ? {
    /* `blank` MARKS A ROW THE SPINE ADDED because neither document had one — it holds its place in
       the sequence and takes half the height of a row with something in it. See `.bk-row.is-blank`.
       A TICK ROW IS NOT BLANK IN THAT SENSE: an empty box is its answer, so it keeps a full row's
       height and draws the mark unticked. See `TICK_ROW`. */
    n: '', k: k, v: TICK_ROW[k] ? '' : '—', mul: '', rate: '', total: '', free: true,
    faint: !TICK_ROW[k], blank: !TICK_ROW[k], tick: TICK_ROW[k] ? false : undefined,
  } : null))).filter(Boolean);
  return out.concat(extra);
}

function bookBreakdown(L, foot) {
  /* ---------- THE TWO PHOTOGRAPHS ARE GONE --------------------------------------------------------
     THEY WERE HALF THE CARD. Two squares side by side, each a full 1:1 at half the card's width —
     about 180px of height before a single row of the booking was drawn, and on the first question
     both of them were empty outlines, so the largest thing on the screen said nothing at all.

     THEY WERE ARGUED FOR AS AN OFFER rather than a receipt: you are choosing a room and a person,
     and you want to see them. That is true on the VENUE card and the TUTOR card, where the photo is
     the point and is what you press. Here it is the same picture a second time, under the name it
     already says on the Venue and Tutor rows.

     The job stubs keep theirs — `rc-stub-pics` draws them small, two to a line beside the text,
     which costs nothing and is what tells one saved session from another at a glance. */
  /* `L` IS NULL UNTIL ENOUGH IS ANSWERED TO COST IT — no subjects, or no venue on a shared class.
     Everything below reads it for figures, so each read is guarded rather than the whole card being
     refused. The paper exists from the first question; only the numbers arrive late. */

  const venueName = BOOKING.loc || 'No venue yet';
  const now = new Date();
  const when = fmtDate(now) + ' ' + String(now.getHours()).padStart(2, '0')
    + ':' + String(now.getMinutes()).padStart(2, '0');

  /* ---------- ONE LIST, AND IT IS THE FORM ---------------------------------------------------------
     THIS CHOSE ONE LIST OR THE OTHER, and the two are not the same length. `stepRows_` is the form —
     every question, one row each. `breakdownRows` is the invoice, built from `PRICE_ROWS`, which
     only has lines for things that COST something.

     SO THE FORM VANISHED THE MOMENT IT COULD BE PRICED. Answer a subject and a level and Kind,
     Seats, Space, When, Split, Child and Tutor were gone from the card — still being asked by
     `nextBookStep`, with nowhere left to answer them. Nothing threw. The rows were simply not
     drawn, which is why it read as "not everything is showing".

     THE QUESTIONS ARE THE ROWS AND THE PRICES DECORATE THEM. A price line already names the step it
     came from — `asked` in `breakdownRows` has mapped them all along — so the multiplier, the rate
     and the running total land on the question that caused them.

     WHAT IS LEFT OVER GOES AFTER: "Extra subjects", "Hours a week", each booked day, everything the
     class branch prints. Those are consequences of answers rather than answers, so they sit below
     the questions and above the total.

     AND ANYTHING NAMING A QUESTION TWICE IS DROPPED. `breakdownRows` prints "For" and "Kind" as free
     lines of its own; both are steps with rows three lines above — the same fact stated once as an
     answer you can change and once as a figure you cannot.

     THE NOTE IS LAST, which on a real docket is where the handwriting goes.

     ONE LIST, walked twice — here into HTML and in `receiptCanvas` into pixels. Which rows exist is
     decided once, so a row added to the card cannot go missing from the shared picture. */
  const steps = stepRows_();
  const priced = L ? breakdownRows(L) : [];

  /* ---------- WHICH PRICED LINES BELONG TO A QUESTION -----------------------------------------
     ALL BUT THE BASE. `PRICE_ROWS` maps its base line to the tutor step, because pressing it should
     open the tutor question — but "Tuition · × 10 · £10.00/h" is what you are being charged FOR,
     not an answer you gave, and a receipt without a base line is a receipt that has lost its
     subject. It stays its own row at the foot, where the other consequences are. */
  /* ONE RULE, ASKED TWICE. A line either belongs to a question or it does not, and both the merge
     and the leftovers below have to agree — the first version said it in two places and the base
     line fell through the gap: excluded from merging, then dropped by a filter that saw it named a
     step and assumed it had merged. It vanished off the card entirely. */
  /* ---------- THE BASE LINE MERGES ONTO THE TUTOR ROW LIKE EVERY OTHER PRICED LINE ---------------
     `Tutor · Halex Dias` AND `Tuition · Halex Dias · × 10 · £10.00/h` ARE ONE FACT PRINTED TWICE.
     The base was held out of the merge so it could keep a row of its own at the foot — right when
     this was an invoice, where "Tuition" is the line that says what you are being charged for. On a
     card that ALREADY asks "Tutor" three rows above, it is the same name twice: once as something
     you can change and once as something you cannot.

     `asked` ALREADY MAPS IT. `base: 'tutor'` has been in that table all along, so the merge knows
     exactly where the line belongs — it was only the exclusion here stopping it. The hours, the
     rate and the total land on the Tutor row, which is the question that produced them, and the
     second row stops existing rather than being blanked and left. */
  const ownRow = r => true;

  /* ---------- THE BASE LINE SAID THE TUTOR'S NAME, AND SO DID THE TUTOR ROW ----------------------
     `PRICE_ROWS` gives the base line the tutor as its value — right when it was an invoice on its
     own, where "Tuition · Halex Dias · × 10 · £10.00/h" is one readable line. On a card that also
     asks "Tutor" as a question three rows above, it is the same name printed twice, once as
     something you can change and once as something you cannot.

     THE FIGURES ARE WHAT THE LINE IS FOR. The hours, the rate and the total have no question behind
     them; the name does, and it already has its row. */
  /* THE FIGURES, NOT THE NAME. Merged onto the Tutor row, whose value is already the tutor. */
  priced.forEach(r => { if (r.key === 'base') r.v = ''; });

  const byStep = {};
  priced.forEach(r => {
    if (!ownRow(r)) return;
    if (r.step && !byStep[r.step]) byStep[r.step] = r;
  });
  /* WHICH PRICED ROWS WERE CONSUMED BY A QUESTION, under the name the spine knows them by — so
     `spineRows_` does not invent a blank for a row whose figures are already on the card. */
  const merged = {};
  steps.forEach(r => {
    const p = byStep[r.id];
    if (!p) return;
    r.mul = p.mul; r.rate = p.rate; r.total = p.total;
    p.used = true;
    const k = SPINE_ALIAS[p.k] !== undefined ? SPINE_ALIAS[p.k] : p.k;
    if (k) merged[k] = true;
  });

  /* WHAT THE QUESTIONS ALREADY SAY, both by name and by which step they stand for. The name alone
     was not enough: `PRICE_ROWS` calls the hosting line "Host" and the step calls it "Space", so it
     survived the check and printed the same fact twice under two words. Matching on the step id as
     well catches that however either is worded. */
  const said = {};
  const mine = {};
  steps.forEach(r => { said[norm(r.k)] = true; mine[r.id] = true; });

  /* ---------- A CONSEQUENCE SITS UNDER THE ANSWER THAT CAUSED IT ---------------------------------
     EVERYTHING LEFT OVER WAS APPENDED AT THE FOOT, in whatever order `PRICE_ROWS` happened to
     produce it — so "Extra subjects", which is the count of subjects beyond the first, printed
     itself between the Tutor row and the Dates, nowhere near the Subject row it is entirely about.
     It reads as a stray charge rather than as an explanation of one.

     WHICH STEP IT FOLLOWS, SAID ONCE. `asked` maps a priced row to the step that ANSWERS it, and
     these are rows no step answers — the arithmetic that follows from one. Same shape, different
     question, so a second small table rather than a special case: the row is placed straight after
     the step it belongs to, and anything not named here still falls to the foot as before. */
  const AFTER = { complexity: 'subjects' };

  const leftover = priced.filter(r =>
    !r.used && !said[norm(r.k)] && !(ownRow(r) && mine[r.step]));

  const placed = {};
  const body = [];
  steps.forEach(r => {
    body.push(r);
    leftover.forEach(p => {
      if (placed[p.key] || AFTER[p.key] !== r.id) return;
      placed[p.key] = true;
      body.push(p);
    });
  });

  /* THE SPINE APPLIED AS THE LIST IS BUILT, not to a `const` afterwards — which is what the last
     version did, and `Assignment to constant variable` took the whole screen down with it. One
     expression, so there is nothing to reassign and no order for the two steps to get wrong. */
  /* `on` SAYS WHICH OF THE FORM'S TWO BRANCHES THIS IS, so the other one's rows are not invented as
     dashes — see the note over `SPINE_EXTRA`. Through `bookOn_()`, which is the same answer
     `stepRows_` drops the other branch's questions on: the row must not be re-added here under the
     name the filter just removed, and one reader is what makes that impossible rather than
     remembered. It resolves to `isWaiting_()`, the one test the branch itself is taken on. */
  const rows = spineRows_(body
    .concat(leftover.filter(p => !placed[p.key]))
    .concat([noteRow_()]), { on: bookOn_(), said: merged });
  /* ---------- THE PICTURE IS DRAWN FROM THIS LIST, NOT FROM ITS OWN --------------------------------
     THE COMMENT ABOVE HAS SAID "ONE LIST, WALKED TWICE" SINCE IT WAS WRITTEN, AND IT WAS NOT TRUE.
     `receiptCanvas` called `breakdownRows(L)` again and drew whatever came back — the raw priced
     lines, before any of the work this function does. So the card merged the base line onto the
     Tutor row and the picture did not; the card put Extra subjects under Subject and the picture
     put it at the foot; the card showed the questions and the picture showed only the charges.
     Two documents of the same booking, and the one people actually send is the one nobody was
     looking at.

     PUT WHERE THE CANVAS CAN REACH IT rather than passed as an argument, because `receiptCanvas` is
     called from a share button that has no idea a card was ever drawn — and the card is always
     drawn before it can be shared. One assignment, and the picture is the screen. */
  /* ---------- ONE SEQUENCE OF LINE NUMBERS, COUNTED AFTER THE MERGE ------------------------------
     `stepRows_` NUMBERS 1..n AND `breakdownRows` NUMBERS 1..n, SEPARATELY — which was fine while
     they were two documents and is nonsense now that they are one. Merged, the picture printed
     "003 Subject" then "003 Extra subjects", and "009 When free" then "009 Hours a week": two
     rows claiming the same line, twice, on the receipt somebody sends to a parent.

     COUNTED HERE, ONCE, IN THE ORDER THE ROWS ACTUALLY END UP IN — which is the only place that
     knows it, since the order is decided four lines above. A `free` row keeps its blank: it is not
     a charge, and a numbered row that costs nothing reads as an error in the arithmetic. */
  let seq = 0;
  rows.forEach(r => { if (r.n !== '') r.n = String(++seq).padStart(3, '0'); });

  BOOK_ROWS = rows;
  const out = rows.map(receiptRow);

  return receiptHtml({
    /* ---------- THE HEAD SAID WHAT THE ROWS SAY -----------------------------------------------
       "No venue yet · No tutor yet · 29/08/26 00:29" sat above a Venue row and a Tutor row holding
       exactly those two facts, one line apart, and the clock was the time the card happened to be
       drawn — which on a form nobody has sent is not a fact about anything.

       A REAL RECEIPT KEEPS ITS HEAD, because it left the shop and the reader needs to know where and
       when. A form on screen has not left anything, and the answers are directly underneath. */
    lines: [],
    /* WHO, so `breakdownRows` can put it at the top — the admin may have changed it, so it is read
       from the booking rather than assumed to be whoever is looking. */
    client: BOOKING.client || (USER && USER.name) || '',
    /* THE COLUMN HEADER'S WORD FOR THE INPUT COLUMN — see `spineHead_`. A form is answered. */
    cols: 'Answer',
    rows: out,
    /* ---------- £0.00 IS NOT A PRICE, IT IS AN ANSWER NOBODY GAVE ---------------------------------
       The card said COST £0.00 as soon as a subject was picked, because a total with no seats and no
       hours in it multiplies out to nothing. A zero on a receipt means FREE, and that is a promise
       this form is in no position to make. A dash means not yet, which is the truth. */
    total: (L && L.total > 0) ? money(L.total) : '—',
    /* PASSED STRAIGHT THROUGH. The actions are built where the rest of the booking's wording is —
       see `drawBooker_` — and printed where a receipt's footer goes. */
    foot: foot || '',
    aside: (L && L.W) ? L.W + ' session' + (L.W === 1 ? '' : 's') : '',
    /* ---------- THE ROSTER IS NOT ON EITHER DOCUMENT ----------------------------------------------
       IT WAS ON THE RECEIPT, THEN ON BOTH, AND NOW ON NEITHER — and the last move is the right one
       for a reason the first two missed. The chairs are not a row of a document: they are a view of
       a session, the same as the week grid is a view of a timetable. `Your sessions` is built to be
       exactly that view, one widget per class, and it is where somebody asking "who is in this" now
       goes.

       ON A DOCUMENT IT WAS ALWAYS EITHER A REPEAT OR A SURPRISE. On the form it drew chairs from the
       Seats row and the Child row printed directly above it. On the receipt it drew names that no
       row mentions — which sounds like an argument for keeping it, and is really an argument for it
       being somewhere of its own rather than smuggled onto the end of a price list.

       WHAT THE DOCUMENTS KEEP is the count: `Seats` says how many, `Sharing with` says who else. A
       receipt is what was agreed and what it costs. Who turned up is a different question. */
    /* ---------- THE SKIN WAS ONE WORD HERE, AND NOW THERE IS NO WORD --------------------------------
       THIS SAID `kind: 'receipt'`, and the note under it was proud that the whole choice of costume
       for this document had come down to a single line: the form had been a green terminal, and
       changing it to cream paper — and back — was one edit.

       THAT WAS TRUE AND IT WAS STILL THE WRONG SHAPE. One line to pick between four palettes is one
       line that decides which of four sets of rules a control on this card obeys, and the set nobody
       remembers is the one the next control gets wrong. There is one palette now — the app's — so
       there is nothing to pick and no line to pick it with. `receiptHtml` says why at length. */
  });
}

/**
 * THE RECEIPT ITSELF — paper, head, columns, rows, total, barcode.
 *
 * Extracted so a SAVED job can be printed on the same paper as a booking being built. They are the
 * same document at two moments: one is what you are asking for, the other is what you asked for,
 * and a client comparing the two should not have to work out whether a difference is real or just
 * two screens drawn by different code.
 */
/* ---------- THE ROSTER ------------------------------------------------------------------------------
   Four slots: the tutor, and one for each seat. The shape a game lobby uses — Halo's fireteam, a
   Destiny fireteam, an Xbox party — and it is used here for the reason those use it: it makes the
   size of the group a PICTURE rather than a number, and it makes an empty slot look like an
   invitation instead of an absence.

   That second part is the useful one. "Sharing with: 2 other families" is a fact somebody has to
   read and think about. Two filled slots and two open ones is a thing you look at and immediately
   understand you could fill — which is exactly what splitting a session is, and it was previously
   buried in a question most people skipped.

   FOUR UNLESS THERE ARE MORE. Four is the lobby size everybody recognises, and a session of six
   still has to show six — a roster that hides two of the people in the room is worse than one that
   is the wrong shape.
--------------------------------------------------------------------------------------------- */
/**
 * THE TWO FACES: the room and the person.
 *
 * Pulled out of `bookBreakdown` when a job stub needed them as well — the same lookup was about to
 * be written a second time, and two ways of finding a venue's photograph is two ways for one of
 * them to stop finding it.
 *
 * Greyed by the stylesheet, because a receipt has one ink.
 */
/* `facesOf_` WENT TOO — it looked up the venue and tutor photographs, and the last thing wanting
   them was the pair of grey squares at the top of the shared picture, removed earlier tonight. */




function rosterHtml(o) {
  const tutor = o.tutor || '';
  const seats = Math.max(0, Number(o.seats) || 0);
  const names = (o.names || []).filter(Boolean);

  const slots = [];
  slots.push({ role: 'Tutor', name: tutor, filled: !!tutor, tutor: true });
  for (let i = 0; i < seats; i++) {
    /* A SEAT SOMEBODY HAS PAID FOR IS TAKEN, whether or not it has a name on it. A parent booking
       three seats has three children coming and has told us none of their names — the slot reads
       "Booked" rather than repeating its own label, which is what happened when the name fell back
       to the role and every unnamed seat printed "Seat 2 · Seat 2". */
    /* NAMED IF WE KNOW, "Child" IF WE DO NOT.
       This used to put the CLIENT's name on the first seat, which is wrong in the ordinary case: a
       parent booking is a parent booking FOR somebody, and the person in the chair is the child,
       not the person paying. So the seats take the names actually given — the children ticked at
       booking — and anything left over says "Child", which is true and admits what it does not
       know. It used to say "Booked", which describes the seat rather than who is in it. */
    /* "SOMEONE ELSE" IS AN ANSWER, NOT A NAME. It is what a family ticks when they do not yet know
       who is coming, so on the roster it reads the same as an empty seat: `Child`. Printing the
       option back at them would be the form repeating their own words as though it had learned
       something. */
    slots.push({ role: 'Seat ' + (i + 1),
                 name: (names[i] && names[i] !== UNNAMED) ? names[i] : 'Child',
                 filled: true });
  }
  /* Pad to four. An open slot is drawn as open rather than left off, because the empty ones are
     the ones that say something. */
  while (slots.length < 4) slots.push({ role: 'Open', name: '', filled: false });

  return `<div class="rost">
    ${slots.map(sl => `<div class="rost-slot${sl.filled ? ' on' : ''}${sl.tutor ? ' tut' : ''}">
      <span class="rost-pic">${sl.filled
        ? avatarFor(sl.name || sl.role, 34, '')
        : '<span class="rost-plus">+</span>'}</span>
      ${/* ---------- AN EMPTY SEAT SAID "OPEN" TWICE -------------------------------------------
            The slot is padded with `{ role: 'Open', name: '' }`, and the name line falls back to
            'Open' when there is no name — so a free seat printed Open above OPEN, one word stacked
            on itself in two type sizes. Three of the four seats are usually empty, so most of the
            roster was that.

            ONE LINE WHEN THERE IS ONE THING TO SAY. A taken seat still has two: who is in it, and
            which seat it is. */''}
      <span class="rost-name">${esc(sl.filled ? (sl.name || sl.role) : 'Open')}</span>
      ${sl.filled ? `<span class="rost-role">${esc(sl.role)}</span>` : ''}
    </div>`).join('')}
  </div>`;
}

/* `facesFor` AND `rosterPips` WENT WITH `jobCard`. Both existed only to draw the fold: the two
   photographs at its head and the row of dots counting its seats. The roster draws whole faces and
   the receipt draws whole rows, so neither has a caller. Same reasoning as `jobCard` above — a
   helper nothing calls is a helper somebody calls again by accident. */

/* ==================================================================================================
   FOUR OBJECTS, NOT ONE OBJECT IN FOUR MOODS.

   A booking passes through four states and each is a DIFFERENT KIND OF PAPER in the real world.
   Drawing them as one document with the edges changed was the mistake: it said "this is a receipt,
   slightly" about three things that are not receipts at all.

     screen        the terminal you type into. Nothing exists yet — there is no row, no id, no
                   record. Somebody at a counter is entering it in front of you.
     application   you have ASKED. It is a form that has been handed in and not yet answered, which
                   is a real object with a real name, and nobody mistakes one for a receipt.
     waitlist      you are in a QUEUE. Not a form and not a purchase — a numbered ticket, the thing
                   you hold while you wait for a seat.
     receipt       ACCEPTED. Money has moved and this is the proof. Only now is it paper off a till.

   THE TRANSITION IS ACCEPTANCE, both ways. A regular session becomes a receipt when it is accepted;
   a waitlist becomes a receipt when the seats fill and it is accepted. Two paths, one destination,
   and the destination is the only one that is a receipt.

   ONE ROW LIST UNDERNEATH ALL FOUR. The rows, the roster and the arithmetic are built once and
   walked once — the shared picture reads the same list, and a second layout is how the screen and
   the picture come to disagree.
================================================================================================== */
/* ---------- WHAT EACH COLUMN IS, IN ONE SMALL ROW AT THE TOP -------------------------------------
   ASKED FOR AS *"label each column at the top. Small"*, and the word that matters is the last one.
   THIS CARD HAD COLUMN HEADINGS ONCE and they were deleted — the note where they were says they were
   *"six words explaining a layout nobody was confused by, and the widest band of text on the card"*.
   Half of that has stopped being true: the report that brought them back is somebody counting the
   columns and asking which is which. The other half is why this is .58rem of uppercase tracking
   rather than a band: a heading that costs a line of reading is the thing that was right to delete.

   THE STUB HEAD IS BLANK, which is what a table does with the column its row names live in. A word
   over "For / Kind / Subject" would be a label for labels.

   AND IT IS THE SAME ROW AS EVERY OTHER ROW, `.bk-row` and the six spans, so the labels sit over
   their columns by construction rather than by a second set of widths that can disagree. That is
   `weekGrid_`'s header one card out, and the fault it avoids is the one this stylesheet keeps
   paying for.

   THE VALUE COLUMN'S WORD COMES FROM THE CALLER because the two documents are not the same
   sentence: the form is what you ANSWER and the receipt is what was DECIDED. Same move as
   `fieldsHtml(head)`, and cheaper than a second builder differing by one word. */
function spineHead_(r) {
  if (!r || !r.cols || !(r.rows || []).length) return '';
  return `<div class="bk-row is-cols">
    <span class="bk-n"></span>
    <span class="bk-k"></span>
    <span class="bk-v">${esc(r.cols)}</span>
    <span class="bk-m">×</span>
    <span class="bk-r">Rate</span>
    <span class="bk-t">Total</span>
  </div>`;
}

function receiptHtml(r) {
  /* ---------- `kind`, `SKIN` AND `STAGE` STOOD HERE, AND ONE OF THEM WAS ALREADY DEAD -------------
     `kind` PICKED ONE OF FOUR COSTUMES — screen, application, waitlist, receipt — and appended a
     class that chose a palette in the stylesheet. All four callers pass the same one now, so it
     chose nothing; the three skins it could no longer reach are deleted, and the argument for why
     is kept at their old place in `style.css`.

     `STAGE` WAS THIRTY LINES OF PROSE OVER A MAP NOTHING READ. It built the sentence for each of
     the four stages and was never interpolated into the markup — the heading it fed was removed in
     an earlier pass and the map was left behind, complete with a note explaining which of the four
     stages keeps its wording and why. `.rc-stage` styled its output in four places and matched
     nothing; `check-css` had been naming it as a class styled but never produced, in a list of 28.

     THE STAGE IS STILL SAID. `jobSaid_` returns the sentence and `jobReceipt` puts it in a row with
     Status and Asked for, which is where somebody checking where a booking has got to looks. A row
     rather than a costume: readable, the same size in every language, and impossible to render as
     a palette the next control on this card forgets about. */
  /* `.is-done` STAYS, and it is not a skin. It marks the SAVED document so the hour grid tightens —
     a record does not need rows you can press — which is a layout, not a colour. */
  const done = r.done ? ' is-done' : '';
  return `<div class="rc${done}">
    <div class="rc-head">
      ${/* ---------- THE SHOP NAME WAS FOR A RECEIPT, AND THIS IS NOT ONE ANY MORE -------------------
            A till roll names the shop because it LEAVES the shop — it is evidence, held by somebody
            who might need to say where it came from. That argument already dropped it from the form
            being filled in, on the grounds that a form on screen has not left anything.

            THE SAME SENTENCE FINISHES THE JOB. Nothing drawn by this function leaves: it is on
            screen, inside the app, under a tab bar with the shop's name on it, above a button with
            the shop's own wording on it. The ONE thing that does leave is the picture
            `receiptCanvas` draws for WhatsApp, and that keeps the name — it is the only copy of
            this document a stranger ever holds. */''}
      ${/* THE THREE LINES ON ONE LINE. Venue, tutor and term were a paragraph each, three deep at
           the top of every card — and they are one fact, not three: where and with whom and when.
           Joined with a middot, they read at a glance and give back two lines of height. */''}
      ${(r.lines || []).filter(Boolean).length
        ? `<p>${(r.lines || []).filter(Boolean).map(esc).join(' · ')}</p>` : ''}
    </div>
    ${/* `r.photos` WAS HERE. Nothing passes photos to a receipt any more — see `bookBreakdown`. */''}
    ${/* ---------- AND THE RULE ABOVE THE ROWS IS THE HEADER'S OWN ------------------------------
         A `.rc-rule` HERE AND A DASHED BORDER UNDER `.is-cols` IS TWO LINES DOING ONE JOB, and the
         second one is labelled. It is not tidiness: the waiting-list card has three pixels of
         headroom in its pane at 390 and eight at 768 — measured, and written up where the block
         week is — so the header had to be paid for out of something. `.rc-rule` is 1px and
         `.22rem` either side, which is 8px at 768, and that is most of what the header costs.

         WITHOUT A HEADER THE RULE STAYS, because then nothing else closes the block above off. */''}
    ${spineHead_(r) ? '' : '<div class="rc-rule"></div>'}
    ${/* THE OLD COLUMN HEADINGS ARE STILL GONE, and `spineHead_` is not them. "# Item × Rate Total" over four rows that are plainly a
         number, a thing, a multiplier and a price — six words explaining a layout nobody was
         confused by, and the widest band of text on the card. A receipt is read by shape rather
         than by heading, and the shape was already doing the work. */''}
    <div class="bk">${spineHead_(r)}${(r.rows || []).join('')}</div>
    <div class="rc-rule"></div>
    <div class="bk-row rc-total">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(r.totalLabel || 'Cost')}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r">${esc(r.aside || '')}</span>
      <span class="bk-t">${esc(r.total || '')}</span>
    </div>
    ${/* THE ROSTER SLOT IS STILL HERE and nothing fills it — see the notes above. Kept rather than
          cut out, because `rosterHtml` is what `Your sessions` draws and this is the one line that
          would put chairs back on a document if that ever turns out to be right. Removing it would
          mean rediscovering where they went. */''}
    ${r.roster ? `<div class="rc-rule"></div>${r.roster}` : ''}
    <div class="rc-rule"></div>
    ${/* ---------- WHAT YOU DO WITH IT, ON IT --------------------------------------------------------
          THE BUTTONS SAT UNDER THE PAPER, on the page, with nothing behind them. The pane on that
          page is transparent — the receipt is the box — so "Ask for it" and the share mark were
          floating on black beneath a card they plainly belonged to, and the gap between the two
          read as a rendering fault rather than as a layout.

          THEY ARE PART OF THE DOCUMENT. A till receipt does not have its buttons printed on a
          separate slip; the thing you press to commit belongs on the thing being committed.

          LAST, because it is what the document is FOR. It used to go before the barcode, on the
          grounds that nothing goes after the end of a receipt; with the barcode gone the buttons
          are the end, which is the right place for the one thing anybody presses. */''}
    ${r.foot || ''}
    ${/* THE BARCODE WAS HERE. Its own stylesheet note convicted it: "decoration and priced as such
          — 44 bars off a hash, and it is there because a till receipt has one." Nothing scanned it
          and nothing could; it was the most receipt-shaped thing on a document that is also the
          booking form and the basket. `receiptBars` went with it, and so did the `bars:` all three
          callers were passing. */''}
    ${/* THE FOOTER LINE IS DRAWN ONLY IF THERE IS ONE. It said "Nothing is booked until you ask for
          it" under every unsent booking — true, and already obvious from the question sitting under
          the card and the button that sends it. A card that has to explain its own state is a card
          whose state is not visible; this one's is. */''}
    ${/* THE REFERENCE, WHEN THERE IS ONE. It was `r.thanks` in a `.rc-thanks` and it has never held
          a thank-you — `jobReceipt` puts "Session 42" in it, which is the number somebody quotes
          when they ring up about a booking. Named for what it carries, because this file is read
          far more often than it is written. */''}
    ${r.ref ? `<p class="rc-ref">${esc(r.ref)}</p>` : ''}
  </div>`;
}

/** One row of a receipt, from the shape `breakdownRows` and `jobRows` both produce. */
function receiptRow(r) {
  /* `wide` — A TITLE IS NOT A VALUE. The six columns are sized for a booking: a short label and a
     short answer with three figures beside them. A basket line is the other shape entirely — one
     long name and one price — and squeezed into the 4.5em value column, "Paper 31: Statistics —
     June 2022" came out one word per line, six lines tall, with the price clipped off the edge.

     So a row can say it is the wide kind and the grid becomes two columns. Decided here, with the
     rest of what a row looks like, rather than by the caller patching the string afterwards. */
  const cls = [r.blank ? 'is-blank' : '',
               r.day ? 'bk-day' : '', r.end ? 'bk-end' : '', r.free ? 'bk-free' : '',
               r.wide ? 'is-wide' : '',
               /* THE WEEK'S OWN THREE. `bk-wk` lays the strip out in the answer cell, `is-shut`
                  collapses a day nobody works, `is-off` greys a week that cannot be answered. */
               r.strip ? 'bk-wk' : '', r.strip && r.shut ? 'is-shut' : '',
               r.strip && r.off ? 'is-off' : '']
    .filter(Boolean).join(' ');
  /* A DAY SHOWS ITS HOURS, drawn rather than written — the same row of boxes the picker uses, so
     a day on the receipt and a day in the grid are visibly the same thing.
     Decided here rather than by the caller patching the markup afterwards: this function knows what
     a row looks like, and a caller that has to reach into the string it was given is a caller doing
     this function's job badly. */
  /* A DROPDOWN WHERE THERE IS ONE, and it replaces the value rather than sitting beside it: the
     select already shows what is chosen, and a cell that printed the answer AND a control showing
     the same answer would be the row saying it twice. */
  /* ---------- A DAY'S HOURS ARE ITS ANSWER --------------------------------------------------------
     `strip` IS MARKUP AND IS NOT ESCAPED, which is why it is its own field rather than a flag on
     `v` — the same distinction `sel` already draws for a dropdown. It is built by `weekRows_` and by
     nothing else, so there is one place that decides what a day row looks like. */
  /* ---------- A STAGE IS A MARK, NOT A VALUE ------------------------------------------------------
     `tick` IS THREE-VALUED AND THAT IS DELIBERATE: `true` is done, `false` is not yet, and absent
     is not one of these rows at all. A plain boolean could not tell the third from the second, and
     every row on this card would have grown a box.

     IT IS NOT A CHECKBOX AND IT IS NOT PRESSABLE — see `JOB_STAGES` for why nobody ticks these by
     hand. So the state is an `aria-label` rather than a hidden word: a ✓ that is the same glyph
     ticked and unticked, told apart by colour alone, says nothing at all to a screen reader and
     nothing to anybody who cannot separate gold from grey. */
  /* THE BOX LAST, BECAUSE `.bk-v` IS RIGHT-ALIGNED AND FIVE BOXES HAVE TO BE ONE COLUMN. Written
     the other way round — box, then date — the four stages with nothing beside them put their box
     on the card's edge and `Requested` put its box wherever its date started, so the five ticks
     came out at two different x positions. A progression you read DOWN cannot be ragged across,
     and the date is the subordinate half of that row either way. Caught on a screenshot, which is
     the only thing that could have: every row measured correctly and none of them overflowed. */
  const value = r.tick !== undefined
    ? `${S_(r.v) ? `<span class="bk-when">${esc(r.v)}</span> ` : ''}<span
       class="bk-tick${r.tick ? ' on' : ''}" role="img" aria-label="${
       r.tick ? 'done' : 'not yet'}">✓</span>`
    : r.strip ? r.strip
    : r.sel ? r.sel
    : r.hours
    ? `<span class="bk-hrs">${((slotGrid().rows.find(x => x.prefix === r.hours.day)
        || { hours: [] }).hours).map(h => `<span class="bk-hr${
          (BOOKING.slots || []).indexOf(h.code) !== -1 ? ' on' : ''}">${h.h}</span>`).join('')}</span>`
    : r.dates ? `<span class="bk-dates">${esc(r.v)}</span>`
    : esc(r.v);
  /* ---------- A ROW WITH NO FIGURES DOES NOT NEED THE FIGURE COLUMNS ------------------------------
     "STATUS · UNCONFIRMED" AND "YOUR SEAT · UNCONFIRMED" CLASHED, and the grid is why: the
     multiplier, rate and total columns are a fixed 151 pixels plus their gaps, reserved on EVERY
     row — including the ones that have nothing to put in them. On a phone card that left 59 pixels
     for the value, and "unconfirmed" needs about 74.

     So a row carrying no numbers says so, and the value runs to the end of the card. Nothing moves
     on the rows that do have figures; the columns still line up down the card, because a row that
     spans has no figures to line up with. */
  /* ---------- A QUESTION KEEPS ITS COLUMNS WHETHER OR NOT IT HAS FIGURES ------------------------
     `is-bare` COLLAPSES A ROW TO TWO COLUMNS so a value with no figures beside it can use the width
     they would have taken. That is right on a receipt, where a bare row is an aside — "Shared
     between · 4 families" — among priced ones.

     ON A FORM IT MADE THE FIELDS DIFFERENT WIDTHS. Subject has no surcharge so its box ran the
     width of the card; Venue has one so its box was 4.5em and cut "Sutton Library" to "Sutton Li…".
     Two editable fields, one above the other, in two sizes — and which size a field got depended on
     whether the answer in it happened to cost anything.

     SO A ROW THAT IS A QUESTION NEVER COLLAPSES. `id` is set by `stepRows_` and by nothing else, so
     asking for it is asking "is this a field somebody fills in". The asides still collapse, which is
     what the rule was for.

     EXCEPT THE ROW ABOVE A GRID, WHICH HAS NO FIELD TO KEEP THE SAME WIDTH AS ANYTHING. `r.open`
     is the week hanging under it, and the note below records that such a row loses its dashed
     underline precisely because it is a heading rather than a box — *"the answer goes in the week
     below it"*. There is no control on the line, so the argument above it does not apply: nothing
     can come out a different size from the field under it, because there is no field.

     WHAT IT BUYS IS THE ROW'S OWN SUMMARY ON ONE LINE. Measured at 390px, the value column is 81px
     and both grid summaries are sentences: `Monday 13:00–15:00, Wednesday 15:00–16:00` for the
     hours and `Mon · Tue evenings` for the blocks. The second wrapped to two lines at two blocks
     ticked and grew by a line with every press — a row whose height depends on how much of the week
     suits you, which is the shape `SPINE` objects to about folding. Spanning, it is 240px and one
     line, and the waiting-list card comes back inside its pane.

     THE FIGURE GUARD STAYS, so a grid row that ever carries a price keeps its columns with nothing
     here to change. */
  /* AND A DAY ROW NEVER COLLAPSES TO THE NARROW COLUMN EITHER, for the reason the grid row had it:
     eleven pressable cells need 240px and the answer column beside three figure tracks is 78px, so
     a day row that kept them would have a five-pixel cell. It is the same exception, and it is the
     last one — `strip` is what carries a control that cannot be squeezed. */
  const bare = (!r.id || !!r.open || !!r.strip) && !S_(r.mul) && !S_(r.rate) && !S_(r.total);
  /* ---------- THE ROW ABOVE A GRID IS A HEADING, NOT A FIELD -------------------------------------
     REPORTED AS *"the 'when' dotted line is redundant as the grid is right underneath it."* It is.
     A dashed underline on this card means *an answer goes here*, and on the When row the answer
     goes in the week below it — so the row was advertising a blank that could never be filled in on
     that line, with the real control two pixels under it. And an unanswered one printed a dash as
     well, which is the same claim a second time.

     THE SUMMARY STAYS WHERE THERE IS ONE. `stepRows_` reads the ticked hours back as
     "Monday 12:00–14:00, Wednesday 15:00–16:00", which is the one thing the picture cannot say at a
     glance — whether two ticked boxes are a two-hour session or two separate ones. That is a
     caption on the grid rather than a value in a column, so it is drawn and the line under it is
     not.

     ASKED OF `r.open`, WHICH IS THE GRID ITSELF. Both documents hang the week off that field — see
     `jobRows` — so the receipt's When row loses its dash for the same reason without being told
     separately, and a row that stops carrying a grid gets its underline back with nothing here to
     change. */
  /* AND A DAY ROW LOSES ITS DASHED UNDERLINE FOR THE SAME REASON THE `When` ROW DID: the underline
     means *an answer goes here*, and on these rows the answer is the row of boxes itself. A dashed
     line under a strip of cells is the card advertising a blank that is already filled in. */
  const heads = !!r.open || !!r.strip;
  return `<div class="bk-row ${cls}${bare ? ' is-bare' : ''}${heads ? ' is-head' : ''}">
    <span class="bk-n">${esc(r.n)}</span>
    <span class="bk-k">${esc(r.k)}</span>
    <span class="bk-v">${heads && String(r.v) === '\u2014' ? '' : value}</span>
    <span class="bk-m">${esc(r.mul)}</span>
    <span class="bk-r">${esc(r.rate)}</span>
    <span class="bk-t">${esc(r.total)}</span>
    ${/* ---------- THE WEEK IS A CELL OF THIS ROW NOW, NOT A BLOCK AFTER IT --------------------
          ASKED AS *"is it possible to have the grid be in the 2nd column like the other stuff."*
          It was a sibling of the row, so it started at the CARD's left edge — under the label
          column, where no other answer on the card begins — and every value beside it starts two
          thirds of an inch further in. One left edge for the answers is most of what makes this
          read as a document.

          PLACED BY THE GRID RATHER THAN MEASURED AGAIN. The obvious version is `margin-left: 6.2em`
          on the week, which is the label column's own floor written in a second place — and that
          column is `minmax(6.2em, max-content)`, so a long label widens it and the margin would not
          follow. As a CELL it takes whatever the browser worked out, and `grid-column` is the one
          declaration that differs between the two weeks.

          AND A NOTE ON A GRID ROW NOW SITS UNDER THE WEEK rather than between the row and it. No
          grid step carries one today, so nothing moved; it is the better order if one ever does,
          because a sentence about a control belongs under the control. */''}
    ${r.open || ''}
  </div>${r.say ? `<p class="bk-say${r.say.warn ? ' is-warn' : ''}">${esc(r.say.text)}</p>` : ''}`;
}

/**
 * A SAVED JOB, AS A RECEIPT OF WHAT WAS ASKED FOR.
 *
 * Built from what the job ROW actually holds, not by re-pricing it. Re-pricing would produce a
 * fuller chain of multipliers and would be the wrong document: a receipt records what was agreed,
 * and rates move. A session asked for in September should still say what September said.
 */
function jobRows(j) {
  const rows = [];
  let line = 0;
  const push = (k, v, total, opts) => {
    /* A ROW WITH NOTHING IN IT IS SKIPPED — a job with no tutor should not print an empty Tutor
       line. But "nothing in it" means no VALUE and no TOTAL: the money rows carry their figure in
       the total column and an empty value, and this dropped every one of them, so a client saw a
       receipt of their booking with no price on it. */
    if ((v === '' || v == null) && !total) return;
    rows.push(Object.assign({
      n: (opts && opts.free) ? '' : String(++line).padStart(3, '0'),
      k, v: String(v), mul: '', rate: '', total: total || '',
    }, opts || {}));
  };

  push('Subject', j.subject || '');
  push('Level', j.level || '');
  /* ---------- FOUR ROWS WERE READING NAMES THE PAYLOAD HAS NEVER SENT --------------------------
     FOUND BY COMPARING EVERY `j.<field>` THIS FUNCTION READS against every key `doGet` puts on a
     job — sixteen against forty-seven — which is `check-payload.js`'s question asked one level
     down, where it cannot go: that check compares top-level `DATA.*` keys, so a field inside a row
     that nothing sends is invisible to it. Six came back, and four of them were drawing something.

     `Students` READ `j.students` AND `j.maxStudents`, and the payload sends `maxKids`. So the row
     was absent from every real receipt — `push` skips a row with no value, so not even a dash.
     `seatsOf_` is the app's one reader of "how many seats", already used by the roster and the
     stamp, so asking it here is the `documents_()` argument rather than a third spelling. The
     `|| ''` matters: it answers 0 for a job with no seat count and `push` would print "Students 0".

     `Venue` READ `j.venue` AND THE PAYLOAD SENDS `location`. `jobReceipt`'s own header already
     tries both, with the note *"both names are tried, because two lists genuinely use two"* — it
     was found once, for the line under the title, and not for the row. Same fix, same reason.

     `Host` AND `Sharing` were the other two and they are repaired at the other end, in `doGet`:
     both were drawing a CONFIDENT WRONG ANSWER rather than nothing — "We book the room" to a
     family hosting at home, and "Just you" on a session split three ways — so a name tried here
     would have been a second guess at a fact the sheet holds and the payload was not carrying. */
  push('Students', seatsOf_(j) || '');
  push('Venue', j.venue || j.location || '');
  push('Host', TRUEish_(j.clientHosts) ? 'You' : 'We book the room');
  /* ---------- SEVEN DAY ROWS WHERE THE `When` ROW WAS ---------------------------------------------
     THE FORM ASKS ON SEVEN LINES NOW and the receipt answers on the same seven, in the same place,
     built by the same function — which is what stops the two documents drifting. The old single
     `When` row said "Monday, Friday 10:00" and hung the picture underneath it; the day names are
     the labels, so the sentence had nowhere left to be that was not a second copy of the picture. */
  jobWeekRows_(j).forEach(r => rows.push(r));
  push('Per session', j.hours ? j.hours + ' hour' + (Number(j.hours) === 1 ? '' : 's') : '');
  push('Term', j.term || '');
  /* "JUST YOU" IS WRONG ON A WAITING LIST, and on an open one it is the opposite of true: the whole
     point is that other families join. `splitEmails` is for a session somebody splits with people
     they know; a list is shared with whoever turns up, which is a different fact and wants
     different words. */
  push('Sharing', norm(j.kind) === 'waitlist'
    ? (Number(j.seatsGoing) > 0 ? 'Open — ' + j.seatsGoing + ' seat'
        + (Number(j.seatsGoing) === 1 ? '' : 's') + ' free' : 'Full')
    : (j.splitEmails || 'Just you'));
  /* ---------- WHEN IT RUNS, AND WHAT THE TERM WOULD COME TO ---------------------------------------
     THE SAVED CARD SHOWED NONE OF IT. The booking form works out the term, its dates and an
     estimate; the card the same list turns into showed "Dates —" and a per-session figure, so the
     one screen a family comes BACK to knew less than the screen they filled in.

     THE TERM IS ON THE JOB — `term_name`, written when the list was opened — and its dates come off
     `DATA.intervals` by name. So this is a lookup rather than a second copy of the school year. */
  if (norm(j.kind) === 'waitlist') {
    const iv = (DATA.intervals || []).find(x => norm(x.label || x.term) === norm(j.term)) || null;
    /* ---------- `For` MEANS THE CLIENT, AND HERE IT MEANT THE TERM -------------------------------
       ON THE FORM `For` IS WHO THE SESSION IS FOR — the family paying. On a waiting list it was
       pushed with the TERM in it, and there is a `Term` row four lines up, so the receipt printed
       the school term twice under two names while never once saying whose booking it was. The
       spine put them next to each other and made it obvious.
       DROPPED, because `Term` already says it. `For` now means one thing on both documents. */
    /* `Running` AND `Weeks left` WERE TWO PUSHES HERE and went with the form's — see the note by
       the waiting-list branch above. Both documents lose the same two rows in the same commit,
       which is what `check-spine.js` exists to make unavoidable: a row on one and not the other is
       the drift it was written for. */
    if (iv && iv.weeks) {
      /* "ABOUT", because the weeks are what is LEFT and nothing runs until the seats fill. A
         precise total here would be a promise the list cannot keep. */
      push('About', iv.weeks + ' × ' + money(j.price || 0), money((j.price || 0) * iv.weeks));
    }
  }

  if (j.tutor) push('Tutor', j.tutor);

  /* ---------- `dates` IS WHAT THE SERVER SENDS AND THIS ASKED FOR `sessionDates` -----------------
     THE PAYLOAD HAS NEVER CARRIED THAT NAME. `doGet` builds the run with `sessionDatesOf(j)` and
     ships it as `dates: dates.join(', ')` — so this read `undefined` on every real job and the
     `Dates` row printed a dash on every receipt anybody has ever been handed. A row about WHEN the
     sessions are, on the document whose whole job is to record them.

     NOTHING COULD SEE IT, and the reason is the one this repository keeps finding: `check/states.js`
     seeds a job carrying `sessionDates`, so the lab has been measuring the name the CODE reads
     rather than the name the SERVER sends — the same fault as the fixture stating `focus` as a
     string `doGet` does not send. The state seeds `dates` now.

     BOTH NAMES, because a job object is also built elsewhere and `j.venue || j.location` two rows
     up already carries the same argument: two lists genuinely use two spellings, and a receipt that
     can only read one of them is a receipt that goes blank when it meets the other. */
  const dates = String(j.dates || j.sessionDates || '')
    .split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  /* THE SAME SPAN AS THE BOOKING CARD — see the note there. A job's receipt and the form it came
     from must not disagree about how a run of dates is written. */
  /* ---------- HOW MANY DATES IS NOT A FIGURE, AND THE FIGURE COLUMN IS SIZED FOR MONEY -----------
     "6 dates" WAS IN THE TOTAL COLUMN AND OVERFLOWED IT BY 18 TO 21 PIXELS at all four widths.
     Two things meet: `.bk-t` is `--mono`, and the column is `7.5ch` measured against the ROW's
     proportional font — so a track sized for seven narrow characters was handed seven wide ones.
     It is exactly wide enough for `£270.00`, which is what it was measured for, and every other
     thing that column has ever held is money.

     SO THE COUNT GOES WITH THE DATES, which is the fact it is about: a run of dates and how many
     there are is one answer, not a value and a total. The row carries no figure now, so it takes
     the whole width — which also stops the range itself wrapping to two lines in a 71px column.

     FOUND BY `check/ui.js` ON ITS FIRST RUN WITH A RECEIPT ON THE SCREEN. It had never had one —
     see the note beside the `booking` state in that file — so this had been on every receipt with
     more than one date for as long as receipts have had dates. */
  push('Dates', !dates.length ? '—'
    : (dates.length === 1 ? dates[0] : dates[0] + ' – ' + dates[dates.length - 1])
      + (dates.length > 1 ? '  ·  ' + dates.length + ' dates' : ''),
    '', { free: true, dates: true });

  /* WHAT THE MONEY DOES, for whoever is allowed to see it. A client sees what they pay; a tutor
     sees what they earn; an admin sees both and the difference. Same receipt, three readings —
     which is better than three screens that can disagree. */
  if (j.price) push('Total', '', money(j.price), { free: true });
  /* `Tutor is paid` AND `Left over` WERE ROWS HERE. They are not on the spine and they are not on
     the paper: what a tutor earns and what is left over are facts about the BUSINESS, and a
     document a client is handed should not have lines on it that vanish depending on who is
     holding it. `moneyBlock` floats them underneath, where the tile row and the join offer already
     sit — see below. */

  /* ---------- WHERE IT IS, AND WHERE IT IS GOING --------------------------------------------------
     `Status` PRINTED THE SHEET'S OWN CELL — "unconfirmed", "active", "cancelled" — which is a word
     about a row in a spreadsheet, not about a session. And there was nothing at all saying where in
     its life the thing had got to, which is the one question somebody opening a receipt is actually
     asking: has anybody agreed to this, do I owe money, is it done.

     SIX LINES, ALL DERIVED. Five ticks say where in its life it has got to — see `JOB_STAGES` —
     and `Status` keeps the seat statuses, which is what the machine is actually tracking: Waiting,
     Agreed, Paying, Booked. That second one is not a summary of the first: a session where one
     family has paid and another has not is one line here and could not be one tick above.

     `Stage` WAS ONE OF `jobSaid_`'s FOUR SENTENCES and `Asked for` was the date under it. Both are
     in the ticks now — the first as the shape of them, the second as `Requested`'s own value.

     PLAIN WORDS. A parent has no use for "lifecycle" or "possession"; they want to know whether it
     is settled. */
  stageRows_(j).forEach(r => rows.push(r));
  push('Status', jobStatusSaid_(j), '', { free: true });
  /* THE SAME ORDER THE FORM USES, so a receipt does not reshuffle what somebody just filled in —
     and NOT a dash for every question this job cannot answer. See the note over `spineRows_`: the
     dashes are what makes a form readable while it is being filled in, and they are a quarter of a
     receipt spent saying nothing fourteen times. Order from the spine, rows from the booking. */
  return spineRows_(rows, { fill: false });
}

/** A job, on the same paper a booking is drawn on. */
/* WHICH OF THE FOUR A SAVED BOOKING IS.
   Read off the ROSTER, which the backend folds out of the events and sends on every seat — so
   there is no fifth place for this to come from and nothing to keep in step.

     a waitlist that has not filled     a ticket in a queue
     a waitlist everybody has paid for  a receipt: it was accepted, and that is the whole test
     a session nobody has paid for      an application, handed in and waiting
     a session somebody has paid for    a receipt

   ACCEPTANCE IS THE LINE, not payment exactly — but on this system they are the same moment: the
   only thing that writes `Booked` is the payment coming back confirmed. */
/* ---------- THE WEEK, ON A RECEIPT, WITH THE BOOKED HOURS LIT -------------------------------------
   THE FORM HAS SEVEN ROWS OF TAPPABLE HOURS AND THE RECEIPT HAD NOTHING — so the tallest, most
   recognisable part of the document vanished the moment it was sent, and a family checking when
   their session runs had to read `Monday 12:00–13:00` off a line instead of seeing it.

   THE SAME GRID, ANSWERED. Same seven rows, same eleven hours, same cells — the booked ones lit and
   nothing tappable. It is the picture of the week the form asked for, showing the answer rather
   than the question, which is what every other row on a receipt does.

   BUILT FROM THE JOB, NOT FROM `slotGrid()`. That reads the tutor's and venue's free hours, which
   is a question about what COULD be booked; a receipt is about what WAS. So a session on Monday at
   12 for two hours lights Monday 12 and 13, and every other cell is simply a cell. */
/* ---------- THE SAME SEVEN ROWS ON THE RECEIPT --------------------------------------------------
   A BOOKING MAY RUN ON MORE THAN ONE DAY, AND THE ROW SAYS SO. This once compared the whole cell to
   one day name — `weekday` holds what `bookSpec` sent, which is every day the booking runs joined
   with commas, so `norm('Monday') === norm('Monday, Friday')` is false for Monday AND for Friday and
   a two-day booking lit NOTHING. Measured: 2 cells on a one-day job, 0 on a two-day one.

   ONE SPAN, SHOWN ON EVERY DAY, because that is what the job row holds: `start_time` and
   `hours_per_session` are single cells. Where the runs really differ the row is already a
   simplification of them — see `bookSpec`, where the first run of the week names the session.

   `weekRows_`, NOT A SECOND SET OF MARKUP. The form and the receipt draw a day the same way down to
   the class names, so a week restyled once is restyled on both. Disabled, because nothing on a
   receipt is answerable. */
function jobWeekRows_(j) {
  const days = String((j && j.weekday) || '').split(',').map(norm).filter(Boolean);
  const start = parseInt(String((j && (j.time || j.startTime)) || '').split(':')[0], 10);
  const hrs = Math.max(1, Number(j && (j.hours || j.hoursPerSession)) || 1);
  const hours = SLOT_HOURS;
  return weekRows_(
    SLOT_DAYS.map(([, label]) => ({ label: label, hours: hours,
                                    on: days.indexOf(norm(label)) !== -1 })),
    (h, d) => {
      const lit = d.on && isFinite(start) && h >= start && h < start + hrs;
      return `<button class="hr${lit ? ' on' : ''}${lit ? '' : ' shut'}" disabled
        title="${h}:00" aria-label="${esc(d.label)} ${h}:00"></button>`;
    },
    { off: true });
}

/* ---------- WHAT THE BUSINESS TAKES, UNDERNEATH RATHER THAN ON IT ---------------------------------
   TWO ROWS USED TO SIT BETWEEN `Total` AND `Stage`, drawn only for an admin or the tutor — so the
   same receipt had a different number of lines depending on who opened it, and a client comparing
   theirs with what you see would find rows they have no explanation for.

   A DOCUMENT IS THE SAME DOCUMENT FOR EVERYBODY. What it costs is on the paper because that is what
   was agreed; what the tutor earns and what is left over are the business's own arithmetic ABOUT
   that agreement, and they belong beside it rather than in it. Floating under the card, the way the
   tile row and the join offer already do.

   AND THE SAME BLOCK UNDER THE FORM, while a booking is still being priced — the figures move as
   the questions are answered, which is exactly when you want to see them. */
function moneyBlock(o) {
  if (!o) return '';
  const admin = typeof isAdmin === 'function' && isAdmin();
  const theirs = USER && o.tutor && norm(o.tutor) === norm(USER.name);
  if (!admin && !theirs) return '';
  const pay = Number(o.tutorPay) || 0;
  const left = Number(o.profit) || 0;
  if (!pay && !left) return '';
  return `<div class="money-note">
    ${pay ? `<span><b>${esc(money(pay))}</b> to the tutor</span>` : ''}
    ${(admin && left) ? `<span><b>${esc(money(left))}</b> left over</span>` : ''}
  </div>`;
}

/* ---------- HOW MANY SEATS A SESSION HAS ----------------------------------------------------------
   `Number(j.maxKids || j.maxStudents) || 4` WAS WRITTEN IN TWO PLACES — the roster and the fullness
   test — and that trailing `|| 4` is a hard-coded default in the one comparison that decides whether
   a waiting list has filled. A job with a blank `max_students` fills at four whatever the room holds
   and whatever `waitlist_seats` says.

   THE JOB CARRIES ITS OWN NUMBER. `max_students` is written at booking from `waitlistPrice`, which
   now takes it from the room — so the seat count a list was PRICED at is the seat count it FILLS at,
   by construction rather than by two places agreeing.

   AND WHEN IT IS BLANK, SAY SO RATHER THAN GUESS. Zero draws no chairs and never reports a list as
   full, which is visible and wrong-looking; four draws four chairs and quietly closes a list early,
   which is invisible and wrong. Of the two, the one somebody notices is the one to have. */
const seatsOf_ = j => Math.max(0, Number((j && (j.maxKids || j.maxStudents)) || 0));

/* ---------- `jobSaid_` STOOD HERE, AND THE STAGE IS FIVE TICKS NOW --------------------------------
   IT RETURNED ONE OF FOUR SENTENCES — "Paid — booked", "On the waiting list", "Accepted — waiting
   for payment", "Asked for — waiting on us" — and its own note claimed three readers: *"the receipt
   row, the booking form and the stamp on the card"*. Measured before deleting it: ONE. The stamp
   went when the four receipt skins became one document, and the form pushes a literal dash.

   THE SENTENCES ARE NOT LOST, THEY ARE THE PICTURE. `JOB_STAGES` draws the same four facts as a row
   of ticks, and the first un-ticked one is "what happens next" — which is the half a sentence was
   doing that a single stage word could not. Keeping both would be one fact drawn twice on the same
   card, which is what this repository already records about the roster's `name` printing an `<h3>`
   above every widget's own heading.

   `jobStage_` AND `jobAccepted_` SURVIVE IT. They are the tests two of the five ticks are made of,
   and `jobStage_` still says which of the four documents a saved booking is. */

/* AND WHAT THE SEATS SAY, which is the machine's own record rather than a summary of it. A session
   where one family has paid and another has not is one line here and could not be one tick above. */
function jobStatusSaid_(j) {
  const seats = (j.slots || []).map(sl => String(sl.status || '').trim()).filter(Boolean);
  if (!seats.length) return 'nobody in it yet';
  const by = {};
  seats.forEach(s => { by[s] = (by[s] || 0) + 1; });
  return Object.keys(by).map(s => (by[s] > 1 ? by[s] + ' × ' : '') + s).join(', ');
}

function jobStage_(j) {
  const paid = (j.slots || []).filter(sl => /^booked$/i.test(String(sl.status || '')));
  if (norm(j.kind) === 'waitlist') {
    const seats = seatsOf_(j);
    if (!seats) return 'waitlist';   // unpriced: it cannot be full
    return paid.length >= seats ? 'receipt' : 'waitlist';
  }
  return paid.length ? 'receipt' : 'application';
}

/* HAS IT BEEN ACCEPTED YET — which is a different question from which of the four it is.
   AN ACCEPTED APPLICATION IS STILL AN APPLICATION. Money has not moved, so it is not a receipt;
   what has changed is that the business has said yes and the family may now pay. Both facts are
   true at once and the widget has to say both, or accepting a booking looks like it did nothing —
   which is exactly how it looked, because the card was identical before and after.

   AGREED IS THE WORD THE MACHINE USES for "the terms are settled". Everybody in the room has to be
   at it: one family agreed out of three is a session still being negotiated. */
function jobAccepted_(j) {
  /* THE TWO SIDES SPEAK DIFFERENT WORDS, and reading them as one list is why this said "pending"
     on a session that had been accepted. A client seat carries the machine's own status — Waiting,
     Agreed, Paying, Booked. A tutor seat carries `Applied` or `Confirmed`, which `doGet` derives
     before sending. Checking both against the same four words meant every tutor read as not-agreed
     and no session could ever be accepted.
     Asked of each side in its own vocabulary. */
  const seats = j.slots || [];
  if (!seats.length) return false;
  const clientsOk = seats.every(sl => /^(agreed|paying|booked)$/i.test(String(sl.status || '')));
  /* A TUTOR IS OPTIONAL. A session with none yet can still be accepted by the business — the
     teaching is arranged afterwards — so an empty tutor list is not a reason to withhold it. What
     must not happen is a tutor sitting at `Applied` while the family is told it is settled. */
  const tutorsOk = (j.tutorSlots || []).every(sl => /^confirmed$/i.test(String(sl.status || '')));
  return clientsOk && tutorsOk;
}

function jobReceipt(j) {
  const rows = jobRows(j);
  const mine = USER && norm(j.tutor) === norm(USER.name);
  const stage = jobStage_(j);
  return receiptHtml({
    /* ---------- THE SAME SKIN AS THE FORM, WHICH IS THE WHOLE POINT --------------------------------
       THERE WERE FOUR LOOKS — screen, application, waiting list, receipt — and the same session
       wore three of them over its life. That went first: one document at every stage. This is the
       last of it, and it goes further, because sharing an ORDER while keeping two appearances left
       every size, weight and colour to be guessed at twice.

       ONE SKIN, AND IT IS THE FORM'S. Not because the green screen is prettier than cream paper,
       but because the form is the archetype: whatever its type size, its column widths, its row
       rules and its grid cells turn out to be, the receipt is those things by construction rather
       than by somebody matching them by eye. Restyle the form and the receipt has already followed.

       PAPER IT IS. The note above said the choice was one word and that the property worth having
       was that there is only one to pick — so here is that word being changed, on both documents,
       in the same breath. A booking form that looks like the receipt it becomes explains itself:
       this is what you will be holding.

       `stage` IS STILL COMPUTED AND STILL PASSED — the wording reads it. */
    /* `done` MARKED THE SAVED DOCUMENT so the screen skin's blinking cursor could be turned off.
       There is no cursor on paper, so with both documents on the receipt skin this decides nothing.
       Left in place: the screen skin is one word away for either of them, and a flag that goes and
       comes back is a flag somebody has to work out the meaning of twice. */
    done: true,
    stage: stage,
    /* THE JOB'S OWN KIND, WHICH IS NOT THE STAGE. `kind` above is which of the four documents this
       is — screen, application, waitlist, receipt — and it changes as the booking moves. `was` is
       what the job IS, and never changes: a shared class stays a shared class after it fills.
       Passed separately because the paid receipt needs both, and reading one for the other is the
       mistake I made writing this — `r.kind` at the stamp was the stage, so the line meant to say
       "a shared class" could never have fired. */
    was: norm(j.kind) || 'session',
    /* SO THE STAMP CAN SAY WHICH. An application that has been accepted and one that is still
       waiting are the same object at two moments, and the difference is the whole point of the
       stamp. */
    accepted: jobAccepted_(j),
    /* `location` IS WHAT THE PAYLOAD SENDS FOR A CLASS, and this read `venue` — which the jobs list
       uses and `clientClasses` does not. So every waiting list said "No venue" while the sheet held
       one, and the venue is the single most useful thing on a waiting-list card: it is the whole of
       what somebody is deciding about. Both names are tried, because two lists genuinely use two. */
    lines: [j.venue || j.location || 'No venue', j.tutor || 'No tutor yet', j.term || '']
      .filter(Boolean),
    /* AND THE RECEIPT'S, which is not "Answer": nothing on it is being asked. */
    cols: 'Detail',
    rows: rows.map(receiptRow),
    /* WHAT THE FIGURE IS, and it is not the same sentence at every stage. "To pay" was the default
       everywhere, which is the app telling somebody they owe money for a thing nobody has agreed to
       yet — and even on a settled receipt it is a demand where a statement of fact would do.
       "Cost" says what the number IS without saying what anybody should do about it. */
    totalLabel: mine ? 'You earn'
      : stage === 'application' ? 'It would come to'
      : stage === 'waitlist' ? 'Your seat'
      : 'Cost',
    total: money(mine ? (j.tutorPay || 0) : (j.price || 0)),
    /* ---------- THE STATUS WORD IS NOT AN ASIDE ON THE TOTAL -----------------------------------
       IT SAT BESIDE THE FIGURE — "IT WOULD COME TO   unconfirmed   £151.82" — a raw cell from the
       jobs tab, in a slot meant for a remark ABOUT the money ("6 sessions"). It is neither: it is a
       fact about the booking, and it now has two rows of its own further up, in words rather than
       in the sheet's vocabulary.

       AND IT DID NOT FIT. The label is `nowrap` and up to sixteen characters at this stage, so on a
       narrow card the word and the label drew over each other. Removing it fixes the collision and
       the duplication in one go — which is usually the sign that the thing should not have been
       there. */
    aside: '',
    /* NO ROSTER HERE EITHER — see the note on the form. The chairs are `Your sessions`, one widget
       per class, which is the view that answers "who is in it". */
    ref: 'Session ' + esc(String(j.id || j.jobId || '')),
  });
}

/* ---------- ASKING TO JOIN SOMEBODY ELSE'S SESSION ------------------------------------------------
   Under the receipt, because that is where the terms are: the subject, the day, the venue, the price
   and how many seats are left are all on the document in front of you, and asking to join is
   agreeing to those. A button on the list would be agreeing to a summary.

   IT IS AN ASK, AND THE WORD MATTERS. The family whose booking it is has said other people MAY
   join; they have not said THIS person may. What this sends is a Request — the same move a tutor
   makes when applying — which lands in the lobby and waits for somebody to say yes. A button
   labelled "Join" would promise something it cannot deliver. */
/* ---------- THE STEP THAT WAS NOT THERE AT ALL ----------------------------------------------------
   ACCEPTED, AND THEN NOTHING. The backend has had `createCheckout` and `finalizePayment` since
   payment was built — Stripe session, verified return leg, the Confirm event that is the only thing
   in the whole system that reaches `Booked`. The app never offered a way to start it. So a booking
   could be asked for and accepted and then sat there for ever, and the receipt at the end of it was
   a document nothing could ever produce.

   ONLY WHEN IT IS THEIRS AND ONLY WHEN IT IS AGREED. The backend checks both again — it charges from
   the RECEIPT rather than from the job, so what is asked for here cannot change what is charged —
   but a button offered to somebody who cannot use it is a button that gives an error for a reason
   they cannot see. */
/* `payBlock` AND `leaveBlock` WERE HERE. Both are marks in the tile row under the card now —
   `jobTiles_` in tiles.js — which is where every other kind in this app keeps its actions, and the
   reasoning is written there. */

function festiveCard(f) {
  const full = f.left <= 0;
  return `<div class="fest">
    <p class="fest-when">${esc(f.holiday)} · ${esc(f.date)}</p>
    <h3 class="fest-name">${esc(f.name)}</h3>
    ${f.blurb ? `<p class="fest-say">${mark(f.blurb)}</p>` : ''}
    <div class="fest-rows">
      ${row('Where', f.venue)}
      ${row('Per child', money(f.price))}
      ${row('Places', full ? 'Full' : f.left + ' left of ' + f.seats)}
    </div>
    ${USER
      ? (full
          ? '<p class="faint">This one is full.</p>'
          : `<button class="btn" data-do="fest-join" data-id="${esc(f.id)}">Come along</button>`)
      : '<p class="faint">Sign in to come along.</p>'}
  </div>`;
}


/* ---------- WHEN THE FAMILIES ON A LIST CAN COME --------------------------------------------------
   EACH ANSWER BELONGS TO THE FAMILY WHO GAVE IT, not to the class. Somebody joining says when THEY
   could come; the class has no day and will not have one until enough people have said. So this is
   a tally of separate answers rather than a property of the session — and the backend keeps it that
   way, logging each against that family's own join event.

   WHAT IT IS FOR: the tutor has one question to answer, which is what day suits everybody, and
   until now the only way to answer it was to read the event log by hand. The slot everybody offered
   is marked, because that is the answer when there is one. */
function whenCouldHtml(j) {
  const w = j.whenCould;
  if (!w || !w.slots || !w.slots.length) return '';
  return `<div class="wc">
    <p class="wc-say">When the ${w.people} of them can come</p>
    ${w.slots.map(s => `<div class="wc-row${s.all ? ' is-all' : ''}">
      <span class="wc-n">${esc(s.n)}/${esc(w.people)}</span>
      <span class="wc-slot">${esc(s.slot)}</span>
      <i style="--f:${(s.n / w.people * 100).toFixed(0)}%"></i>
    </div>`).join('')}
  </div>`;
}

function joinBlock(j) {
  if (!j || !j.canAsk || !USER) return '';

  /* ---------- TWO KINDS OF JOINING, AND THEY ARE NOT THE SAME ACT --------------------------------
     A WAITLIST ALREADY SHOWS ITSELF TO EVERYBODY. `joinWaitlist` writes `open_to_others` TRUE, and
     `doGet` sends any open booking with seats left to every client — no names, just the shape of it.
     So a class advertises itself the moment somebody starts one, which is exactly right and needed
     no work.

     WHAT WAS WRONG WAS THE BUTTON. It sent `move`/`Request` for both, which is how you ask to share
     somebody ELSE'S booking: the family who own it decide, nothing is priced, and you become an
     ordinary participant. On a class that is the wrong act in every particular — there is no family
     to ask, the seat has a fixed price, and joining is supposed to write you your own receipt at
     that price and record when you can come. Two doors onto one list, producing two different kinds
     of record, and only one of them a real waitlist seat.

     ASKING TO SHARE is a request to strangers who booked something. JOINING A LIST is buying a seat
     in a thing that exists to be joined. The button says which, and goes where it should. */
  const isList = norm(j.kind) === 'waitlist';
  const id = esc(String(j.id || j.jobId || ''));

  if (isList) return `<div class="join">
    <p class="join-say">${esc(j.seatsGoing)} seat${j.seatsGoing === 1 ? '' : 's'} left on this
      class.${j.price ? ' ' + esc(money(j.price)) + ' a seat.' : ''}</p>
    ${whenCouldHtml(j)}
    <button class="btn" data-do="job-take-seat" data-id="${id}">Take a seat</button>
    <p class="faint">Maths and English, one seat each. Nobody is charged until every seat is
      taken.</p>
  </div>`;

  return `<div class="join">
    <p class="join-say">${esc(j.seatsGoing)} seat${j.seatsGoing === 1 ? '' : 's'} going on this one.
      The family who booked it are happy to share.</p>
    <button class="btn" data-do="job-join" data-id="${id}">
      Ask to join</button>
    <p class="faint">They will be asked, and you will hear either way. Nothing is charged until it
      is agreed.</p>
  </div>`;
}

/**
 * REDRAW WITHOUT MOVING.
 *
 * Every answer rebuilds the whole sheet — the options change, the breakdown grows a row — and the
 * sheet scrolls back to the top each time, so the thing you were looking at leaves the screen at
 * the moment you touch it. On a list of eleven venues that means scrolling back down after every
 * single tap.
 *
 * The position is taken before the rebuild and put back after it, in the frame after the markup
 * lands — before that, the new content has no height and the scroll would be clamped to zero.
 * Clamped to the new height, because the page after an answer is usually shorter.
 */
/* ---------- KEEPING THE PLACE ACROSS A REDRAW ------------------------------------------------------
   Answering a question rebuilds the whole card, and a rebuild puts the scroll back at the top —
   which on the last question, where the answers and the running price sit above a long list of
   options, throws somebody back to the start of a card they had scrolled to the bottom of.

   IT SCROLLED `#sheet-body` and there is no sheet. The pane the booker lives in is the scroller
   now, and it is found from the card rather than named directly: the card knows which pane it is
   in, and nothing else has to agree about the shell's structure. */
function redrawBooker_(draw) {
  const before = $('bookr');
  const pane = before && before.closest('.pane');
  const was = pane ? pane.scrollTop : 0;
  draw();
  if (!was) return;
  const after = $('bookr');
  const now = after && after.closest('.pane');
  if (!now) return;
  requestAnimationFrame(() => {
    now.scrollTop = Math.min(was, Math.max(0, now.scrollHeight - now.clientHeight));
  });
}

/* ==================================================================================================
   BOOKING, AS A COLUMN

   `bookingPages_` ALREADY BUILDS THIS and has done since the form was folded into the funnel — it
   answers `What for · Booking`, and it already knows to stand aside once a second question has been
   answered, because `Booking · Tutors` is somebody browsing rather than somebody filling a form in.

   A COLUMN DOES NOT REPEAT THAT REASONING, it skips it. There is no funnel state here and no second
   question to have answered, so the form is simply the screen — which is what it is to anybody who
   swiped here on purpose.
================================================================================================== */
screen('booking', () => pages('booking', bookingPages_({ column: true })));
