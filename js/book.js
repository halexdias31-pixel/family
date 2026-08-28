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
function bookBlocks() {
  const jobs = DATA.liveJobs || DATA.jobs || [];
  const mine = USER ? jobs.filter(j => norm(j.client) === norm(USER.name)
                                    || norm(j.tutor) === norm(USER.name)) : [];
  const open = jobs.filter(j => !mine.includes(j));

  /* A STUB ON THE LIST, THE WHOLE RECEIPT ON TAP.
     The full receipt was drawn for every job — torn ends, twelve numbered lines, a roster and a
     barcode each — and five of those is a screen you scroll for a minute to find one thing on.
     A receipt's job is to be COMPLETE. A list's job is to be SCANNABLE. Those pull against each
     other and the answer is not a compromise between them: it is the stub here and the receipt on
     tap, each doing the thing it is for.
     Still on paper, still torn at the ends, so it is recognisably the same document folded up. */
  /* ---------- AN OPEN CLASS IS AN OFFER, AND LOOKED LIKE ADMIN -------------------------------------
     IT WAS THE SAME GREY STUB AS A SESSION ALREADY BOOKED, with "4 free" tucked in a corner. That
     is the right treatment for a thing you own and the wrong one for a thing being offered to you:
     in a list of your own bookings, an invitation drawn like a receipt reads as somebody else's
     business and gets scrolled past.

     A TICKET, NOT A CARD. The seat price large enough to read across a room, the seats left stated
     as a count, and a torn edge down the side. That is the whole of what makes a coupon work —
     scarcity said plainly and a number you do not have to squint at. */
  const openClassCard = j => {
    const seats = Number(j.seatsGoing) || 0;
    /* ---------- "3 OF 3 SEATS LEFT" ON A CLASS OF FOUR ---------------------------------------------
       `j.capacity` IS NEVER SET BY ANYTHING. Nothing in the client, the backend or the payload
       writes that name, so `Number(j.capacity)` was always NaN and the fallback took over — and the
       fallback was `seats`, which makes the total equal the seats left and prints "3 of 3" whatever
       the real class size is. It reads as a full class and a free one in the same breath, and it
       could never have read anything else.

       THE FIELDS THE REST OF THE FILE USES. `waitlist` capacity is resolved as
       `j.maxKids || j.maxStudents` at the foot of this file, which comes off the venue's
       `max_students` — 4 at Colliers Wood. `j.capacity` is kept at the front in case the payload
       ever grows one, but it is no longer the only thing asked.

       AND THE TOTAL CANNOT BE SMALLER THAN WHAT IS LEFT. If the numbers ever disagree the seats
       left are the ones somebody is about to act on, so they win and the total follows. */
    const cap = Math.max(Number(j.capacity || j.maxKids || j.maxStudents) || 4, seats);
    /* `job`, THE SAME DOOR THE ORDINARY CARD USES. I wrote `job-open`, which no handler answers —
       a coupon that looks pressable and does nothing, which `check-doors` named immediately. The
       card looks different; what it opens is the same thing. */
    return `<div class="cpn tap" data-do="job" data-id="${esc(j.id)}">
      <div class="cpn-l">
        <span class="cpn-kind">Waiting list class</span>
        <h3>${esc(j.subject || 'Maths and English')}</h3>
        <p>${esc([j.location || j.venue, j.term].filter(Boolean).join(' · ') || 'Colliers Wood')}</p>
        ${/* A COUNT, NOT A BAR. "2 of 4 seats left" is a fact; a progress bar of how full somebody
              else's booking is would be decoration pretending to be information. */''}
        <span class="cpn-left">${seats} of ${cap} seat${cap === 1 ? '' : 's'} left</span>
      </div>
      <div class="cpn-r">
        <b>${esc(money(j.price || 0))}</b>
        <span>a seat</span>
        <i>Take one</i>
      </div>
    </div>`;
  };

  const jobCard = j => {
    const dates = String(j.sessionDates || '').split(/[,\n]/).filter(x => x.trim()).length;
    const mine = USER && norm(j.tutor) === norm(USER.name);
    /* WHO IS IN IT. The tutor takes a slot, and every seat asked for takes one — so a session for
       two has three of its four filled and one going, which is the thing somebody scanning this
       list actually wants to know. */
    const seats = Number(j.students || j.maxStudents) || 0;
    const taken = (j.tutor ? 1 : 0) + seats;
    /* THE STUB IS THE SAME DOCUMENT FOLDED UP, so it is the same kind of document. Without this
       the list showed torn receipts for everything while opening one showed a form — and the list
       is the screen people actually look at. */
    const st = jobStage_(j);
    const SK = { application: ' app', waitlist: ' wl', receipt: '' };
    /* THE STUB SAYS IT TOO. The list is where somebody looks to see whether anything has moved, so
       an accepted booking that looks identical on the list is an acceptance nobody can see. */
    const ok = st === 'application' && jobAccepted_(j) ? ' is-accepted' : '';
    return `<div class="rc rc-stub rc-${esc(st)}${SK[st] || ''}${ok} tap" data-do="job"
        data-id="${esc(String(j.id || j.jobId || ''))}">
      <div class="rc-stub-top">
        <span class="rc-stub-what">${esc(j.subject || 'Session')}${
          j.level ? ' · ' + esc(j.level) : ''}</span>
        <span class="rc-stub-cost">${money(mine ? (j.tutorPay || 0) : (j.price || 0))}</span>
      </div>
      <div class="rc-stub-mid">
        ${facesFor(j.venue, j.tutor, 'rc-stub-pics')}
        <div class="rc-stub-said">
          <span>${esc([j.venue, j.weekday, j.time].filter(Boolean).join(' · ') || 'Not set')}</span>
          <span class="rc-stub-who">${esc(j.tutor || 'No tutor yet')}</span>
        </div>
      </div>
      ${/* SEATS GOING, on the stub, where somebody scanning the list will see it. A session with
             room is the only reason to look twice at a booking that is not yours, and nothing on
             the card has ever said there was any. */''}
      ${j.canAsk ? `<div class="rc-stub-line rc-stub-open">
          <span>${esc(j.seatsGoing)} seat${j.seatsGoing === 1 ? '' : 's'} going</span>
          <span class="rc-stub-ask">Tap to ask</span>
        </div>` : ''}
      <div class="rc-stub-line rc-stub-foot">
        <span>${esc(j.status || 'Open')}</span>
        ${rosterPips(seats, taken)}
        <span>${dates ? dates + ' session' + (dates === 1 ? '' : 's') : 'No dates yet'}</span>
      </div>
    </div>`;
  };

  /* AN EMPTY ONE, to start a booking with. Every field is blank on purpose: this is the document
     you are about to fill in, and showing it filled with examples would be showing you somebody
     else's session.
     `data-do="new-booking"` is the same handler the button used, so tapping the paper opens the
     questions exactly as pressing the button did. */
  /* `blankJobCard` WAS HERE — the grey outline card with "Ask for a session" on it. It was a
     picture of a receipt that you tapped to be given a receipt, and the real one draws from the
     first question now, so there is nothing left for a placeholder to hold the place of. */

  /* Built as blocks rather than one string, because the pager needs the pieces and this screen's
     pieces are already separate things — the blank one, and a receipt per session. */
  return [
    /* ---------- THE FIRST CARD IS A BLANK RECEIPT ------------------------------------------------
       It was a button, and a button on a column of receipts is a different KIND of thing sitting
       where a card should be — you swipe past four documents and then a control, and the eye has
       to change gear for it.

       A blank one says the same thing better. It is the same paper, torn at the same ends, with
       every field where it will be once you have answered — so what you are being offered is
       visibly "one of these, empty", and filling it in is what the questions do. Nothing has to
       explain that; the shape does it.

       Built by `jobCard` with an empty job rather than by markup of its own, so a change to a
       receipt changes this too. A second version of the paper would be one that drifts. */
    /* ---------- THE BOOKER IS THE FIRST CARD, ALWAYS ------------------------------------------
       THE BLANK PAPER WAS A TEASER FOR A FORM. It showed two grey outlines, "Subject · where ·
       when" and four empty pips — a picture of a receipt, which you tapped to be shown the actual
       thing somewhere else. Two objects for one job, and the first of them could not be used.

       The real paper does everything the blank one did — it is visibly empty, it is visibly a
       receipt, it invites you to fill it in — and it is also the form. So there is one card. */
    USER
      ? bookerCard()
      : `<div class="card"><h3>Sign in to book</h3>
           <p class="sub">You need an account to ask for a session.</p>
           <button class="btn" data-do="signin">Sign in</button></div>`,
    /* NO "YOURS" AND "OPEN" HEADINGS.
       Each session is a pane of its own, so a heading sat alone above a single receipt — a section
       rule with one thing under it, which is a rule about nothing.
       And the receipt already says it. Its foot line carries the status — "Open", "unconfirmed",
       "active" — printed on the document, where somebody reading the document is already looking.
       Two places saying the same thing, and the one on the paper is the one that is right.
       Yours still come before the open ones; that is the order, and it no longer needs announcing. */
    /* ---------- WHAT THE CALENDAR IS OFFERING, ABOVE THE SESSIONS -----------------------------
       IT PUTS ITSELF THERE. Nobody publishes these: a holiday has a date, its row says how many
       days before it should appear, and six weeks before Christmas a card is on every client's
       screen. The week after, it is gone. A flag somebody sets is a thing to remember twice — once
       to turn on and once to turn off — and the second one never happens, which is how a business
       ends up advertising a Christmas party in February.

       ABOVE the sessions, because it is time-limited and they are not. Somebody's own booking will
       be there next week; the thing with a date on it might not. */
    ...(DATA.festive || []).map(festiveCard),
    ...mine.map(jobCard),
    /* THE OPEN ONES AS COUPONS, the owned ones as cards — they are two different kinds of thing
       and were drawn identically. */
    ...open.map(openClassCard),
    /* NO "NO SESSIONS YET".
       It was a pane of its own — a whole screen you swipe to, holding one grey sentence saying
       there is nothing on it. That is a widget whose entire content is the announcement of its own
       emptiness, and it takes up the same space as a real session.

       THE BLANK CARD ABOVE ALREADY SAYS IT, and says it usefully: "Ask for a session · Nothing
       booked · Tap to start" is the same fact plus the thing to do about it. Two things saying
       nothing-is-here, and only one of them offers a way out of that state.

       An empty list should be empty, not a list containing an apology. */
  ].filter(Boolean);
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
function weekGrid() {
  const jobs = (DATA.liveJobs || DATA.jobs || []).filter(j => {
    /* A session with no day or no time has not been settled yet — a waitlist, or a request nobody
       has put in the diary. It belongs on the list, not in a grid that says where to be. */
    return S_(j.day) && S_(j.time);
  });
  if (!jobs.length) {
    return `<div class="card"><h3>Your week</h3>
      <p class="sub">Nothing in the diary yet. Sessions appear here once a day and a time are
        settled.</p></div>`;
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

  return `<div class="card"><h3>Your week</h3>
    <div class="wk" style="--cols:${days.length}">
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
    <p class="faint">Tap a block to open it.</p>
  </div>`;
}

/* ---------- REPAINTING BOOK WITHOUT LOSING THE PLACE ----------------------------------------------
   The booker is a card on the first page now, so answering a question means redrawing that page —
   not the whole column, which would throw away the pager position of anybody who had swiped down
   to look at an existing session before coming back.

   THE FIRST PAGE ONLY. `bookPages` rebuilds every block from the same job data; only block zero
   can have changed, because only block zero holds the booker. */
function paintBook_() {
  const host = $('s-book');
  if (!host) return;
  const pane = host.querySelector(':scope > .page > .pane');
  if (!pane) return;
  pane.innerHTML = bookBlocks()[0] || '';
}

function bookPages() {
  const blocks = bookBlocks();
  /* One block, one pane. The carry-forward that used to be here existed to stick a "Yours" or
     "Open" heading onto the session under it; there are no headings now, so there is nothing to
     carry and nothing that can be left behind at the end. */
  /* THE WEEK IS NOT IN THIS COLUMN ANY MORE — it is on You, the last of the four. It moved to the
     end of Book first, which was the right instinct in the wrong column: Book is where you MAKE a
     session, and a grid of ones already settled is a different question from the one this column
     asks. `weekGrid` still lives in this file because it is built from the same job data as the
     cards above; only where it is drawn has changed. */
  const out = blocks;
  return out.length ? out : [''];
}

/* The second argument was a header action — a "Sign in" link in the top right for anybody who was
   not. There is no header, so it went nowhere; the Book screen's own first card already says
   "Sign in to book" with a button on it, which is where somebody is actually looking. */
screen('book', () => pages('book', bookPages()));
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
  interval: '', tutor: '', service: '',
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* The day codes the availability grids are written in. `m16` is Monday at four. */
const SLOT_DAYS = [['m', 'Monday'], ['tu', 'Tuesday'], ['w', 'Wednesday'], ['th', 'Thursday'],
                   ['f', 'Friday'], ['sa', 'Saturday'], ['su', 'Sunday']];

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
  /* TEN TILL EIGHT, and eight is included — a session starting at eight is a session, and a grid
     that stops at the last START time has to explain itself. Eleven columns rather than fourteen,
     which is three fewer boxes sharing the same row and so three-fourteenths more width for each
     of them. */
  const hours = [];
  for (let h = 10; h <= 20; h++) hours.push(h);
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
  return runs.sort((a, b) => a.day.localeCompare(b.day) || a.hour - b.hour);
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

  /* A CLASS IS MATHS AND ENGLISH, and that is what the class IS rather than something to pick.
     Written into the booking below so the receipt and the backend agree without asking. */
  { id: 'subjects', label: 'What are we working on?', short: 'Subject', multi: true,
    options: () => isWaiting_() ? [] : (subjectRows() || []).map(x => x.name) },

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
  { id: 'slots', label: 'When?', short: 'When', grid: true,
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
  { id: 'avail', label: 'When could you come?', short: 'Free', multi: true,
    options: () => isWaiting_()
      ? ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings',
         'Weekends', 'Flexible — whatever suits']
      : [],
    why: () => '' },

  /* AND NO TERM, for the same reason as the day. */
  { id: 'interval', label: 'Over what period?', short: 'Term',
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
    note: v => v === NOBODY ? 'the list opens empty, and families join it'
      : (norm(v) === norm((USER && USER.name) || '') ? 'your own booking' : '') },

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
  for (const step of BOOK_STEPS) {
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
  const iv = (DATA.intervals || []).find(x => (x.label || x.term) === BOOKING.interval) || {};
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
    interval: BOOKING.interval, weeks: iv.weeks || 0,
    startDate: iv.startDate || '', endDate: iv.endDate || '', lastSun: iv.lastSun || iv.endDate || '',
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
  /* The two that are not answers: what has been finished with, and which question is being
     changed. Both are about the FORM rather than about the booking, and both must go. */
  BOOKING.done = [];
  BOOKING.editing = '';
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
  BOOKING.editing = '';
  drawBooker();
});

/* `on('book-pick')` WAS HERE — the handler for the option cards in the panel. There is no panel for
   a list of options any more; a list of options is a `<select>` on its row, answered by `book-set`.
   See the note where the cards were, in receipt.js.

   `on('book-back')` AND `on('book-undo')` WENT WITH IT, and both were right to go: "Leave it as it
   is" and "Clear it" were buttons on that panel, and clearing is what choosing "—" does on a single
   row and what picking a ticked option again does on a multi one. */

/* ---------- OPENING THE TWO THAT ARE NOT DROPDOWNS -------------------------------------------------
   `book-edit` IS STILL NEEDED, which is easy to miss now that eleven of the thirteen questions are
   answered without it. The week grid and the split emails have no control on their row — they are
   drawn as a panel — so pressing that row is the only way to reach either, and this is what marks
   which one is open.

   IT IS NOT A GENERAL EDIT ANY MORE. Every other row carries its own select and is changed in
   place, so nothing else emits this — see `receiptRow`, which only writes it when there is no
   dropdown for the row. */
on('book-edit', el => { BOOKING.editing = el.dataset.step; drawBooker(); });

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
  BOOKING.editing = '';
  drawBooker();
});

/* Finished with a multiple-choice question. Recorded, so it stops being asked — and so that
   coming back to it later reopens it rather than treating one tick as the whole answer. */
on('book-more', el => {
  const id = (el && el.dataset && el.dataset.step) || (nextBookStep() || {}).id;
  if (id) BOOKING.done = uniq((BOOKING.done || []).concat([id]));
  BOOKING.editing = '';
  drawBooker();
});

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
    push('Shared between', esc(w.seats) + ' families', '', '', '', { free: true });
    push('Each session', esc(w.hours) + ' hours', '', '', '', { free: true });

    /* ---------- WHICH TERM, AND WHEN IT RUNS ------------------------------------------------------
       THE FORM SHOWED NEITHER. The waiting-list branch skips the "over what period" question on
       purpose — a list has no dates until it fills and somebody sets a day — and the card then said
       nothing about WHEN at all, which reads as "this might be for any time" on the one decision a
       family is making in August.

       THE TERM IS A DATE LOOKUP, not a question. A list opened now is for the term running now, or
       the next to start if today is a holiday: nobody opens a list for a term already half gone.
       `DATA.intervals` is already on the phone with every term's dates on it, so this is a find
       rather than a second copy of the school year. */
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const terms = (DATA.intervals || []).filter(t => norm(t.kind) !== 'holiday');
    const dt = v => { const d = new Date(v); return isNaN(d) ? null : d; };
    const running = terms.find(t => dt(t.opensOn) && dt(t.closesOn)
      && now >= dt(t.opensOn) && now <= dt(t.closesOn));
    const next = terms.filter(t => dt(t.opensOn) && dt(t.opensOn) > now)
      .sort((a, b) => dt(a.opensOn) - dt(b.opensOn))[0];
    const term = running || next;
    if (term) {
      push('For', esc(term.label || term.term), '', '', '', { free: true });
      /* THE DATES IT COVERS, because "Autumn 1" is a name and a family wants the weeks. */
      if (term.opensOn && term.closesOn) {
        push('Running', esc(fmtDate(term.opensOn)) + ' to ' + esc(fmtDate(term.closesOn)),
          '', '', '', { free: true });
      }
      /* ---------- AND WHAT THE TERM WOULD COME TO ---------------------------------------------
         A PER-SESSION FIGURE IS NOT WHAT ANYBODY IS DECIDING. "£19.00 a seat" answers a question
         nobody asked; "seven weeks, so about £133" is the number a family weighs against the month.
         The card had every part of that sum on it — the seat price, the weeks — and left the
         multiplication to the reader.

         "ABOUT", AND SAID SO. The weeks are what is LEFT in the term, so a list opened halfway
         through is honestly cheaper; and nothing runs until the seats fill, so the real figure
         depends on when that happens. A precise-looking total would be a promise this cannot keep. */
      if (term.weeks) {
        push('Weeks left', esc(term.weeks), '', '', '', { free: true });
        push('About', esc(term.weeks) + ' × ' + money(w.perSeatSession),
          '', '', money(w.perSeatSession * term.weeks), { est: true });
      }
    }

    push('Status', 'Not open yet', '', '', '', { free: true });
    return rows;
  }

  ['rate', 'shape'].forEach(group => {
    const inGroup = PRICE_ROWS.filter(r => r.group === group);

    if (group === 'shape') {
      bookRuns().forEach(r => {
        push(r.dayName, r.hour + ':00–' + (r.hour + r.hours) + ':00', '', '', '',
          { day: true, step: 'slots', hours: r });
      });
      if (L.hoursPerWeek) {
        push('Hours a week', '', '× ' + L.hoursPerWeek, '',
          L.weeksBooked ? money(runningAfter('hoursweek', L)) : '', { day: true });
      }
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
        { end: gi === inGroup.length - 1, step: sel ? '' : asked, key: r.key, sel: sel,
          open: st ? stepGrid_(st) : '' });
    });
  });

  const dates = (L.sessionDates || []).map(d => fmtDate(d));
  push('Dates', dates.length ? dates.join(', ') : '—', '', '',
    dates.length ? dates.length + ' dates' : '', { free: true, dates: true });
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
  const v = st.multi ? '' : BOOKING[st.id];
  const isOn = o => st.multi
    ? chosen.some(c => norm(c) === norm(o))
    : norm(o) === norm(v);
  return `<select class="bk-sel" data-do="book-set" data-step="${esc(st.id)}"
      aria-label="${esc(st.label)}">
    ${/* THE FIRST OPTION IS ALWAYS SELECTED ON A MULTI, because the select is a way of picking the
          NEXT one rather than a display of what is picked — the row above it already shows that. */''}
    <option value=""${(st.multi || !v) ? ' selected' : ''}>—</option>
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
  return `<input class="bk-in" type="text" data-do="book-emails" data-step="${esc(st.id)}"
    value="${esc(v)}" placeholder="—" aria-label="${esc(st.label)}"
    autocomplete="off" spellcheck="false">`;
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

   `open` IS PER-ROW, NOT A MODE. `BOOKING.editing` still says which row is showing its grid, and
   pressing the row again closes it — the same fact it always held, now expressed on the paper. */
function stepGrid_(st) {
  if (!st.grid || BOOKING.editing !== st.id) return '';
  const g = slotGrid();
  const on = BOOKING.slots || [];
  const runs = bookRuns();
  if (!g.anyOpen) return `<div class="bk-open"><p class="note">${esc(g.why)}</p></div>`;
  return `<div class="bk-open">
    <p class="faint">Tick the hours. Two together is a two-hour session; another day is another
      session that week.</p>
    <div class="slot-grid">
      ${g.rows.map(r => `<div class="slot-row">
        <span class="slot-day">${esc(r.label.slice(0, 3))}</span>
        <div class="slot-hours">
          ${r.hours.map(h => `<button class="hr${on.indexOf(h.code) !== -1 ? ' on' : ''}${
            h.open ? '' : ' shut'}" ${h.open ? '' : 'disabled'}
            ${/* THE REASON, not just "not available". An hour the tutor never works and an hour they
                  are already teaching are the same grey box, and only the second is worth trying a
                  different week for. */''}
            title="${h.h}:00${h.open ? '' : ' — ' + esc(h.why || 'not available')}"
            data-do="book-slot" data-code="${esc(h.code)}">${h.h}</button>`).join('')}
        </div>
      </div>`).join('')}
    </div>
    ${runs.length ? `<p class="note">${runs.map(r =>
        esc(r.dayName) + ' ' + r.hour + ':00–' + (r.hour + r.hours) + ':00').join(' · ')}</p>` : ''}
  </div>`;
}

/* Which steps open something under their row rather than answering in it. */
function stepIsPanel_(st) { return !!st.grid; }

/* The control a row carries. One answer here so `stepRows_` and `breakdownRows` cannot draw a
   different thing for the same step. */
function stepControl_(st) {
  if (stepIsPanel_(st)) return '';
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
function stepRows_() {
  let line = 0;
  return BOOK_STEPS.filter(st =>
      st.grid || st.emails || st.options().filter(Boolean).length)
    .map(st => {
      const v = BOOKING[st.id];
      const text = st.emails
        ? ((BOOKING.split || []).filter(x => String(x).trim()).join(', '))
        : st.grid
        ? bookRuns().map(r => r.dayName.slice(0, 3) + ' ' + r.hour + ':00').join(', ')
        : st.multi ? (v || []).join(', ')
        : (st.label_ ? st.label_(v) : (v || ''));
      return { n: String(++line).padStart(3, '0'),
               k: st.short || st.id,
               /* AN EM DASH, NOT AN EMPTY CELL. A blank looks like a row that failed to draw; a
                  dash looks like a blank somebody is expected to fill, which is what it is. */
               v: String(text || '—'),
               mul: '', rate: '', total: '',
               /* `step` STILL MARKS IT PRESSABLE for the three that open a panel; `sel` is the
                  dropdown for everything else. A row never has both. */
               step: stepIsPanel_(st) ? st.id : '',
               sel: stepControl_(st),
               open: stepGrid_(st) };
    });
}

function bookBreakdown(L) {
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

  /* ONE LIST, walked twice — here into HTML and in `receiptCanvas` into pixels. Which rows exist is
     decided once, so a row added to the card cannot go missing from the shared picture. */
  /* ONE LIST, walked twice — here into HTML and in `receiptCanvas` into pixels. Which rows exist
     is decided once, so a row added to the card cannot go missing from the shared picture. */
  /* ONE LIST, walked twice — here into HTML and in `receiptCanvas` into pixels. Which rows exist
     is decided once, so a row added to the card cannot go missing from the shared picture. */
  /* PRICED ROWS WHERE THERE IS A PRICE, the plain question list where there is not. They are the
     same document either way — same paper, same columns, same pressable values — so the card does
     not change shape underneath somebody the moment their answers become costable. */
  /* THE NOTE GOES LAST, after every question and before the total — it is the thing you add once
     the rest is said, and on a real docket that is exactly where the handwriting goes. */
  const out = (L ? breakdownRows(L) : stepRows_()).concat([noteRow_()]).map(receiptRow);

  const bars = receiptBars(BOOK_STEPS.map(st => {
    const v = BOOKING[st.id];
    return st.id + ':' + (Array.isArray(v) ? v.join(',') : String(v ?? ''));
  }).concat(['slots:' + (BOOKING.slots || []).join(','),
             'split:' + (BOOKING.split || []).join(',')]).join('|'));

  return receiptHtml({
    lines: [venueName, BOOKING.tutor || 'No tutor yet', when],
    /* WHO, so `breakdownRows` can put it at the top — the admin may have changed it, so it is read
       from the booking rather than assumed to be whoever is looking. */
    client: BOOKING.client || (USER && USER.name) || '',
    rows: out,
    /* ---------- £0.00 IS NOT A PRICE, IT IS AN ANSWER NOBODY GAVE ---------------------------------
       The card said COST £0.00 as soon as a subject was picked, because a total with no seats and no
       hours in it multiplies out to nothing. A zero on a receipt means FREE, and that is a promise
       this form is in no position to make. A dash means not yet, which is the truth. */
    total: (L && L.total > 0) ? money(L.total) : '—',
    aside: (L && L.W) ? L.W + ' session' + (L.W === 1 ? '' : 's') : '',
    /* The tutor, then a seat for each student, then whoever is splitting it. */
    roster: rosterHtml({
      tutor: BOOKING.tutor, seats: Number(BOOKING.n) || 0,
      client: USER && USER.name,
      /* THE CHILDREN, in the order they were ticked. Whoever is splitting the cost is a different
         fact — those are other FAMILIES, not other children, and putting their addresses in the
         chairs was saying that a parent was sitting in one. */
      names: (BOOKING.kids || []).filter(Boolean),
    }),
    bars,
    /* THE TERMINAL. Nothing has been sent, so there is no row anywhere and nothing to be a record
       OF — which is exactly what a screen is: the entering of a thing, before the thing. */
    kind: 'screen',
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
/* WHICH ROOM AND WHICH PERSON. The two rows behind a booking, found once — a venue can be named
   by one of its rooms, so the room's own venue is what has to be looked up, and getting that wrong
   means a photograph that is simply never found for half the bookings. */
function facesOf_(venueName, tutorName) {
  const sp = spaceFor(venueName);
  return {
    venue: (DATA.venues || []).find(x => norm(x.title) === norm(sp ? sp.venue : venueName)),
    tutor: (DATA.tutors || []).find(x => norm(x.title) === norm(tutorName)),
  };
}

/* THE ONLY CALLER LEFT PASSES `rc-stub-pics`. The booking card's pair is gone — see
   `bookBreakdown` — so the default is the stub's class rather than `bk-photos`, which nothing
   styles any more. */
function facesFor(venueName, tutorName, cls) {
  const { venue, tutor } = facesOf_(venueName, tutorName);
  const figure = kind => `<span class="bk-none"><svg viewBox="0 0 64 52" aria-hidden="true">${
    kind === 'venue'
      ? `<path d="M14 42V22l18-11 18 11v20z" fill="none" stroke="currentColor" stroke-width="2"/>
         <rect x="28" y="30" width="8" height="12" fill="currentColor" opacity=".45"/>`
      : `<circle cx="32" cy="20" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
         <path d="M16 46a16 16 0 0 1 32 0" fill="none" stroke="currentColor" stroke-width="2"/>`
  }</svg></span>`;
  const one = (img, kind) => img
    ? `<img src="${esc(pic(img))}" alt="" loading="lazy">` : figure(kind);
  return `<div class="${cls || 'rc-stub-pics'}">
      ${one(venue && venue.image, 'venue')}
      ${one(tutor && tutor.image, 'tutor')}
    </div>`;
}

/**
 * THE ROSTER AS PIPS, small enough for a stub.
 *
 * The full roster is four named slots with faces; this is the same fact at a glance — how many
 * seats are taken and how many are going. On a list, "3 of 4" plus four marks tells you whether
 * there is room without reading anything.
 */
function rosterPips(seats, taken) {
  const total = Math.max(4, seats + 1);
  const full = Math.max(0, Math.min(total, taken));
  let out = '';
  for (let i = 0; i < total; i++) {
    out += `<i class="pip${i < full ? ' on' : ''}${i === 0 ? ' tut' : ''}"></i>`;
  }
  const open = total - full;
  return `<span class="rc-stub-slots">${out}<em>${
    open ? open + ' free' : 'full'}</em></span>`;
}

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
      <span class="rost-name">${esc(sl.filled ? (sl.name || sl.role) : 'Open')}</span>
      <span class="rost-role">${esc(sl.role)}</span>
    </div>`).join('')}
  </div>`;
}

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
function receiptHtml(r) {
  /* `kind` says which of the four this is. Defaulting to a receipt keeps every existing caller
     drawing exactly what it drew before, so nothing that works today can be changed by this. */
  const kind = r.kind || 'receipt';
  const SKIN = { screen: ' scr', application: ' app', waitlist: ' wl', receipt: '' };
  const STAGE = {
    screen: 'Asking for a session',
    application: r.accepted ? 'Accepted — waiting for payment'
                           : 'Application — waiting to be accepted',
    waitlist: 'You are on the waiting list',
    /* ---------- A PAID RECEIPT STILL SAYS WHICH IT WAS -------------------------------------------
       IT SAID NOTHING, AND THAT LOST A FACT WORTH KEEPING. Once a waiting list fills it becomes a
       receipt like any other, and a blank stage made a class that four families waited weeks to
       fill look identical to one somebody booked outright on a Tuesday.

       The two were paid for on different terms — a fixed seat price against a whole session — so a
       receipt that does not say which cannot be checked against what was actually agreed. The
       `kind` column has recorded it correctly all along; nothing was reading it back out at this
       point. */
    receipt: r.was === 'waitlist' ? 'A shared class — one seat' : '',
  };
  /* ACCEPTED, on an application, changes the stamp and nothing else — it is the same form, answered.
     `is-accepted` rather than a different kind, because a different kind would be a different
     object and this is emphatically the same one. */
  const okd = kind === 'application' && r.accepted ? ' is-accepted' : '';
  return `<div class="rc rc-${esc(kind)}${SKIN[kind] || ''}${okd}">
    ${STAGE[kind] ? `<p class="rc-stage">${esc(STAGE[kind])}</p>` : ''}
    <div class="rc-head">
      <h2>@family.</h2>
      ${/* THE THREE LINES ON ONE LINE. Venue, tutor and term were a paragraph each, three deep at
           the top of every card — and they are one fact, not three: where and with whom and when.
           Joined with a middot, they read at a glance and give back two lines of height. */''}
      ${(r.lines || []).filter(Boolean).length
        ? `<p>${(r.lines || []).filter(Boolean).map(esc).join(' · ')}</p>` : ''}
    </div>
    ${/* `r.photos` WAS HERE. Nothing passes photos to a receipt any more — see `bookBreakdown`. */''}
    <div class="rc-rule"></div>
    ${/* THE COLUMN HEADINGS ARE GONE. "# Item × Rate Total" over four rows that are plainly a
         number, a thing, a multiplier and a price — six words explaining a layout nobody was
         confused by, and the widest band of text on the card. A receipt is read by shape rather
         than by heading, and the shape was already doing the work. */''}
    <div class="bk">${(r.rows || []).join('')}</div>
    <div class="rc-rule"></div>
    <div class="bk-row rc-total">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(r.totalLabel || 'Cost')}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r">${esc(r.aside || '')}</span>
      <span class="bk-t">${esc(r.total || '')}</span>
    </div>
    ${r.roster ? `<div class="rc-rule"></div>${r.roster}` : ''}
    <div class="rc-rule"></div>
    <div class="rc-bars">${(r.bars || []).join('')}</div>
    ${/* THE FOOTER LINE IS DRAWN ONLY IF THERE IS ONE. It said "Nothing is booked until you ask for
          it" under every unsent booking — true, and already obvious from the question sitting under
          the card and the button that sends it. A card that has to explain its own state is a card
          whose state is not visible; this one's is. */''}
    ${r.thanks ? `<p class="rc-thanks">${esc(r.thanks)}</p>` : ''}
  </div>`;
}

/** One row of a receipt, from the shape `breakdownRows` and `jobRows` both produce. */
function receiptRow(r) {
  const cls = [r.day ? 'bk-day' : '', r.end ? 'bk-end' : '', r.free ? 'bk-free' : '']
    .filter(Boolean).join(' ');
  /* A DAY SHOWS ITS HOURS, drawn rather than written — the same row of boxes the picker uses, so
     a day on the receipt and a day in the grid are visibly the same thing.
     Decided here rather than by the caller patching the markup afterwards: this function knows what
     a row looks like, and a caller that has to reach into the string it was given is a caller doing
     this function's job badly. */
  /* A DROPDOWN WHERE THERE IS ONE, and it replaces the value rather than sitting beside it: the
     select already shows what is chosen, and a cell that printed the answer AND a control showing
     the same answer would be the row saying it twice. */
  const value = r.sel ? r.sel
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
  const bare = !S_(r.mul) && !S_(r.rate) && !S_(r.total);
  return `<div class="bk-row ${cls}${bare ? ' is-bare' : ''}">
    <span class="bk-n">${esc(r.n)}</span>
    <span class="bk-k">${esc(r.k)}</span>
    <span class="bk-v${r.step ? ' bk-pick" data-do="book-edit" data-step="' + esc(r.step) : ''}"
      >${value}</span>
    <span class="bk-m">${esc(r.mul)}</span>
    <span class="bk-r">${esc(r.rate)}</span>
    <span class="bk-t">${esc(r.total)}</span>
  </div>${r.open || ''}`;
}

/** Forty-four bars from a seed. Same booking, same code, for ever. */
function receiptBars(seedStr) {
  let seed = hashOf(String(seedStr)) >>> 0;
  const bars = [];
  for (let i = 0; i < 44; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    bars.push(`<i style="width:${1 + (seed % 3)}px"></i>`);
  }
  return bars;
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
  push('Students', j.students || j.maxStudents || '');
  push('Venue', j.venue || '');
  push('Host', TRUEish_(j.clientHosts) ? 'You' : 'We book the room');
  push('When', [j.weekday, j.time].filter(Boolean).join(' '));
  push('Each session', j.hours ? j.hours + ' hour' + (Number(j.hours) === 1 ? '' : 's') : '');
  push('Term', j.term || '');
  /* "JUST YOU" IS WRONG ON A WAITING LIST, and on an open one it is the opposite of true: the whole
     point is that other families join. `splitEmails` is for a session somebody splits with people
     they know; a list is shared with whoever turns up, which is a different fact and wants
     different words. */
  push('Sharing with', norm(j.kind) === 'waitlist'
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
    if (j.term) push('For', j.term);
    if (iv && iv.opensOn && iv.closesOn) {
      push('Running', fmtDate(iv.opensOn) + ' to ' + fmtDate(iv.closesOn));
    }
    if (iv && iv.weeks) {
      push('Weeks left', String(iv.weeks));
      /* "ABOUT", because the weeks are what is LEFT and nothing runs until the seats fill. A
         precise total here would be a promise the list cannot keep. */
      push('About', iv.weeks + ' × ' + money(j.price || 0), money((j.price || 0) * iv.weeks));
    }
  }

  if (j.tutor) push('Tutor', j.tutor);

  const dates = String(j.sessionDates || '').split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  push('Dates', dates.length ? dates.join(', ') : '—',
    dates.length ? dates.length + ' dates' : '', { free: true, dates: true });

  /* WHAT THE MONEY DOES, for whoever is allowed to see it. A client sees what they pay; a tutor
     sees what they earn; an admin sees both and the difference. Same receipt, three readings —
     which is better than three screens that can disagree. */
  if (j.price) push('Total', '', money(j.price), { free: true });
  if (isAdmin() || (USER && norm(j.tutor) === norm(USER.name))) {
    if (j.tutorPay) push('Tutor is paid', '', money(j.tutorPay), { free: true });
  }
  if (isAdmin() && j.profit) push('Left over', '', money(j.profit), { free: true });

  push('Status', j.status || 'Open', '', { free: true });
  if (j.createdAt) push('Asked for', String(j.createdAt), '', { free: true });
  return rows;
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
function jobStage_(j) {
  const paid = (j.slots || []).filter(sl => /^booked$/i.test(String(sl.status || '')));
  if (norm(j.kind) === 'waitlist') {
    const seats = Number(j.maxKids || j.maxStudents) || 4;
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
    kind: stage,
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
    aside: j.status || '',
    roster: rosterHtml({
      tutor: j.tutor, seats: Number(j.students || j.maxStudents) || 0,
      client: j.client,
      /* THE CHILDREN, the same as the booking form showed. This used to put the CLIENT in the
         first chair and the other families' email addresses in the rest — so a saved session
         showed a parent and two addresses sitting where three children should be, and it did not
         match the receipt the same parent had been shown while booking. */
      names: (j.forChildren || []).filter(Boolean),
    }),
    bars: receiptBars([j.id, j.jobId, j.subject, j.venue, j.price].join('|')),
    thanks: 'Session ' + esc(String(j.id || j.jobId || '')),
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
function payBlock(j) {
  if (!j || !USER) return '';
  if (jobStage_(j) !== 'application' || !jobAccepted_(j)) return '';
  /* THEIRS. A tutor is paid rather than paying, and another family's booking is not yours to
     settle — both are refused by the backend, and neither should be offered. */
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  if (!mine) return '';
  return `<div class="join">
    <p class="join-say">Accepted. ${esc(money(j.price || 0))} to confirm your place.</p>
    <button class="btn" data-do="job-pay" data-id="${esc(String(j.id || j.jobId || ''))}">
      Pay and confirm</button>
    <p class="faint">You are taken to Stripe. Nothing is booked until the payment comes back
      confirmed — and then this becomes a receipt.</p>
  </div>`;
}

/* ---------- A FESTIVE EVENT, AS A CARD ------------------------------------------------------------
   NOT A RECEIPT, NOT A FORM, NOT A TICKET. It is an invitation — the thing that arrives through a
   door before any of the others exist. So it is drawn as one: the occasion large, the date and the
   place under it, what it costs a child, and how many places are left.

   THE PLACES LEFT ARE THE URGENCY and they are real rather than manufactured. "4 of 12 taken" is a
   fact about a room; a countdown would be a device. If it fills, the card says so and stops asking.

   ANYBODY SIGNED IN CAN SEE IT. That is the entire point of a festive event — it is the one thing
   on this site that goes to every family whether or not they have ever booked anything. */
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