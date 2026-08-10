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
  const jobCard = j => {
    const dates = String(j.sessionDates || '').split(/[,\n]/).filter(x => x.trim()).length;
    const mine = USER && norm(j.tutor) === norm(USER.name);
    /* WHO IS IN IT. The tutor takes a slot, and every seat asked for takes one — so a session for
       two has three of its four filled and one going, which is the thing somebody scanning this
       list actually wants to know. */
    const seats = Number(j.students || j.maxStudents) || 0;
    const taken = (j.tutor ? 1 : 0) + seats;
    return `<div class="rc rc-stub tap" data-do="job"
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
  const blankJobCard = () => `<div class="rc rc-stub rc-blank tap" data-do="new-booking">
      <div class="rc-stub-top">
        <span class="rc-stub-what">Ask for a session</span>
        <span class="rc-stub-cost">£—</span>
      </div>
      <div class="rc-stub-mid">
        ${/* THE SAME TWO OUTLINES a real stub draws when it has no photographs — a building and a
              person. Built by `facesFor` with nothing to find, so the blank card and a session
              with no venue or tutor yet look identical, which they should: they are the same
              state at two moments. Written out here would be a second copy of those drawings. */''}
        ${facesFor('', '', 'rc-stub-pics')}
        <div class="rc-stub-said">
          <span>Subject · where · when</span>
          <span class="rc-stub-who">No tutor yet</span>
        </div>
      </div>
      <div class="rc-stub-line rc-stub-foot">
        <span>Nothing booked</span>
        ${rosterPips(0, 0)}
        <span>Tap to start</span>
      </div>
    </div>`;

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
    USER
      ? blankJobCard()
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
    ...mine.map(jobCard),
    ...open.map(jobCard),
    !jobs.length ? '<p class="empty">No sessions yet.</p>' : '',
  ].filter(Boolean);
}

/* ONE SESSION, ONE PANE.
   Eight stubs on a pane made the pane a list, and the whole point of a pane is that it is ONE
   thing — you swipe to the next rather than scan down. A session is a receipt, and a receipt is a
   document: it gets a card of its own.
   The first pane is the asking. Everything after it is one session each, in the order `bookBlocks`
   already puts them — yours first, then the open ones. */
function bookPages() {
  const blocks = bookBlocks();
  /* One block, one pane. The carry-forward that used to be here existed to stick a "Yours" or
     "Open" heading onto the session under it; there are no headings now, so there is nothing to
     carry and nothing that can be left behind at the end. */
  const out = blocks.slice();
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
  subjects: [], level: '', n: '', loc: '', hosting: '',
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
  const open = code => (!haveT || tAvail[code]) && (!haveV || vAvail[code]);

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
      return { h, code, open: open(code) };
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
const BOOK_STEPS = [
  { id: 'subjects', label: 'What are we working on?', multi: true,
    options: () => (subjectRows() || []).map(x => x.name) },

  { id: 'level', label: 'What level?',
    options: () => ((DATA.dropdowns || {}).levels || []) },

  { id: 'n', label: 'How many students?',
    options: () => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      const out = [];
      for (let i = 1; i <= Math.min(12, lim.max); i++) out.push(String(i));
      return out;
    },
    why: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_());
      if (Number(v) > lim.max) return 'more than ' + (lim.why.max || 'the limit') + ' allows';
      if (Number(v) < lim.min) return (lim.why.min || 'the minimum') + ' needs ' + lim.min;
      return '';
    } },

  { id: 'loc', label: 'Where?',
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
  { id: 'hosting', label: 'Are you providing the space?',
    options: () => {
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
  { id: 'slots', label: 'When?', grid: true,
    options: () => slotGrid().rows.length ? ['grid'] : [] },

  { id: 'interval', label: 'Over what period?',
    options: () => (DATA.intervals || []).map(x => x.label || x.term).filter(Boolean) },

  /* SHARING THE COST. The pricing chain divides by `splitShares` and has since the beginning —
     three families in one session each pay a third — and the form never set it, so the feature
     existed and could not be reached. It is asked last but one because it changes the price
     without changing the session. */
  /* NAMING SOMEONE IS SPLITTING WITH THEM. The old form learned this the hard way: a count
     chosen separately from the addresses is two statements of one fact, and choosing three while
     naming two leaves neither the price nor the invitation list knowing which is true.
     So there is no number to pick. The count IS how many addresses have been given. */
  { id: 'split', label: 'Sharing the cost with anyone?', emails: true,
    options: () => ['emails'] },

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
  { id: 'openTo', label: 'May another family join this?',
    options: () => ['Yes — anyone may ask', 'No — just us'],
    why: () => '' },

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
  { id: 'kids', label: 'Which of your children is this for?', multi: true,
    /* EVERY CHILD IS OFFERED. This used to hand back only as many names as there were seats —
       so booking two seats showed Danile two of her three children and she could not choose WHICH
       two. The seat count limits HOW MANY you may tick, and it has never had anything to say about
       which names exist.

       That is the same mistake `why` was written to prevent, one line further down: an option that
       does not fit is MARKED with the reason and left on the list, because a list that quietly
       drops things seems to have decided for you — and the thing it drops is often the one you
       meant. Removing them here contradicted the rule the next line states. */
    options: () => (USER && (USER.children || USER.kids) || []).filter(Boolean),
    /* Once you have ticked as many as you paid for, the rest say why. Still there, still readable,
       and tickable the moment you untick one — which is how you change your mind about which two
       of three are coming. */
    why: v => {
      const seats = Number(BOOKING.n) || 0;
      const on = (BOOKING.kids || []).length;
      return (seats && on >= seats && (BOOKING.kids || []).indexOf(v) === -1)
        ? 'that is ' + seats + ' seat' + (seats === 1 ? '' : 's') + ' already' : '';
    } },

  { id: 'tutor', label: 'Anyone in particular?',
    options: () => ['No preference'].concat(
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
function bookPrice() {
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
}

on('new-booking', () => {
  if (!USER) { toast('Sign in to book'); go('me'); return; }
  drawBooker();
});

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

on('split-add', () => { (BOOKING.split = BOOKING.split || []).push(''); drawBooker(); });
on('split-set', el => {
  const list = BOOKING.split || [];
  list[Number(el.dataset.k)] = el.value;
  BOOKING.split = list;
  /* NOT redrawn. Rebuilding the sheet on every keystroke destroys the box being typed into — the
     same fault the Stuff search box was built around. The price catches up when Done is pressed. */
});
/* Marked done the same way every other multi-answer step is, so one mechanism says whether a
   question is finished rather than two. */
on('split-done', () => {
  BOOKING.done = (BOOKING.done || []).concat((BOOKING.done || []).indexOf('split') === -1 ? ['split'] : []);
  drawBooker();
});

/* Answering one. A multi toggles, everything else replaces and moves on. */
on('book-pick', el => {
  const step = bookStep_(el.dataset.step);
  const v = el.dataset.value;
  if (!step) return;
  /* Changing an answer takes you back to the card rather than onwards through questions you have
     already answered. */
  const wasEditing = BOOKING.editing === step.id;
  /* A GRID IS TICKED, NOT PICKED. `book-slot` owns it, and letting this one through would write a
     single code string over the list of them — after which everything that reads the slots as a
     list throws, several functions away from the press that caused it. */
  if (step.grid) return;
  if (step.multi) {
    const list = BOOKING[step.id] || [];
    const at = list.indexOf(v);
    if (at === -1) {
      /* AN OPTION THAT SAYS WHY IT DOES NOT FIT MAY NOT BE TICKED.
         `why` marked the option and drew it faintly, and nothing here ever asked — so the mark was
         decoration and a parent could tick four children into two seats. UNTICKING is always
         allowed, whatever `why` says: that is how you change your mind about which two of three
         are coming, and refusing it would trap somebody on their first choice. */
      const no = step.why ? step.why(v) : '';
      if (no) { toast(no); return; }
      list.push(v);
    } else {
      list.splice(at, 1);
    }
    BOOKING[step.id] = list;
  } else {
    BOOKING[step.id] = v;
    if (wasEditing) BOOKING.editing = '';
  }
  drawBooker();
});

/* Pressing a value on the card. It reopens that question and keeps everything else — which is the
   difference between changing your mind and starting again. */
on('book-edit', el => { BOOKING.editing = el.dataset.step; drawBooker(); });
/* And backing out of one without changing it. */
on('book-back', () => { BOOKING.editing = ''; drawBooker(); });

/* Going back to change one. It is emptied rather than the whole booking reset — everything after
   it stays answered, because changing the venue does not mean you changed your mind about the
   subject. */
on('book-undo', el => {
  const step = bookStep_(el.dataset.step);
  if (!step) return;
  if (step.emails) BOOKING.split = [];
  else BOOKING[step.id] = step.grid ? [] : (step.multi ? [] : '');
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
      push(r.label, plain, c.mul, c.rate, c.total,
        { end: gi === inGroup.length - 1, step: asked, key: r.key });
    });
  });

  const dates = (L.sessionDates || []).map(d => fmtDate(d));
  push('Dates', dates.length ? dates.join(', ') : '—', '', '',
    dates.length ? dates.length + ' dates' : '', { free: true, dates: true });
  push('Status', 'Unsent', '', '', '', { free: true });
  push('Possession', 'Yours', '', '', '', { free: true });
  push('Lifecycle', 'Uncreated', '', '', '', { free: true });
  return rows;
}

function bookBreakdown(L) {
  if (!L) return '<p class="note">Not enough answered to price it yet.</p>';

  /* Photographs of the two things chosen — the room and the person. A booking is largely about
     whether you like the look of both, and a card that names them without showing them is a receipt
     rather than an offer.
     One lookup, shared with the job stub. This was written out here and about to be written again
     there, which is two ways of finding a venue's photograph and two ways for one of them to stop
     finding it. */
  const photos = facesFor(BOOKING.loc, BOOKING.tutor);

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
  const out = breakdownRows(L).map(receiptRow);

  const bars = receiptBars(BOOK_STEPS.map(st => {
    const v = BOOKING[st.id];
    return st.id + ':' + (Array.isArray(v) ? v.join(',') : String(v ?? ''));
  }).concat(['slots:' + (BOOKING.slots || []).join(','),
             'split:' + (BOOKING.split || []).join(',')]).join('|'));

  return receiptHtml({
    photos,
    lines: [venueName, BOOKING.tutor || 'No tutor yet', when],
    rows: out,
    total: money(L.total),
    aside: L.W ? L.W + ' session' + (L.W === 1 ? '' : 's') : '',
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
    thanks: 'Nothing is booked until you ask for it.',
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
  return `<div class="${cls || 'bk-photos'}">
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
    slots.push({ role: 'Seat ' + (i + 1),
                 name: names[i] || 'Child',
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

function receiptHtml(r) {
  return `<div class="rc">
    <div class="rc-head">
      <h2>@family.</h2>
      ${(r.lines || []).map(l => `<p>${esc(l)}</p>`).join('')}
    </div>
    ${r.photos || ''}
    <div class="rc-rule"></div>
    <div class="bk-row rc-cols">
      <span class="bk-n">#</span><span class="bk-k">Item</span><span class="bk-v"></span>
      <span class="bk-m">×</span><span class="bk-r">Rate</span><span class="bk-t">Total</span>
    </div>
    <div class="rc-rule"></div>
    <div class="bk">${(r.rows || []).join('')}</div>
    <div class="rc-rule"></div>
    <div class="bk-row rc-total">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(r.totalLabel || 'To pay')}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r">${esc(r.aside || '')}</span>
      <span class="bk-t">${esc(r.total || '')}</span>
    </div>
    ${r.roster ? `<div class="rc-rule"></div>${r.roster}` : ''}
    <div class="rc-rule"></div>
    <div class="rc-bars">${(r.bars || []).join('')}</div>
    <p class="rc-thanks">${esc(r.thanks || '')}</p>
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
  const value = r.hours
    ? `<span class="bk-hrs">${((slotGrid().rows.find(x => x.prefix === r.hours.day)
        || { hours: [] }).hours).map(h => `<span class="bk-hr${
          (BOOKING.slots || []).indexOf(h.code) !== -1 ? ' on' : ''}">${h.h}</span>`).join('')}</span>`
    : r.dates ? `<span class="bk-dates">${esc(r.v)}</span>`
    : esc(r.v);
  return `<div class="bk-row ${cls}">
    <span class="bk-n">${esc(r.n)}</span>
    <span class="bk-k">${esc(r.k)}</span>
    <span class="bk-v${r.step ? ' bk-pick" data-do="book-edit" data-step="' + esc(r.step) : ''}"
      >${value}</span>
    <span class="bk-m">${esc(r.mul)}</span>
    <span class="bk-r">${esc(r.rate)}</span>
    <span class="bk-t">${esc(r.total)}</span>
  </div>`;
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
  push('Sharing with', j.splitEmails || 'Just you');
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
function jobReceipt(j) {
  const rows = jobRows(j);
  const mine = USER && norm(j.tutor) === norm(USER.name);
  return receiptHtml({
    lines: [j.venue || 'No venue', j.tutor || 'No tutor yet', j.term || ''].filter(Boolean),
    rows: rows.map(receiptRow),
    totalLabel: mine ? 'You earn' : 'To pay',
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
function joinBlock(j) {
  if (!j || !j.canAsk || !USER) return '';
  return `<div class="join">
    <p class="join-say">${esc(j.seatsGoing)} seat${j.seatsGoing === 1 ? '' : 's'} going on this one.
      The family who booked it are happy to share.</p>
    <button class="btn" data-do="job-join" data-id="${esc(String(j.id || j.jobId || ''))}">
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
function redrawBooker_(draw) {
  const body = $('sheet-body');
  const was = body ? body.scrollTop : 0;
  draw();
  const now = $('sheet-body');
  if (!now || !was) return;
  requestAnimationFrame(() => {
    now.scrollTop = Math.min(was, Math.max(0, now.scrollHeight - now.clientHeight));
  });
}