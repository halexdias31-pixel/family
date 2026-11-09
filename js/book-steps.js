/* @family. — book.js ONE FILE, SPLIT. § */


/* ---------- BOOK § */
/** Everything on the Book screen, in order. */
/* `openClassCard` WAS HERE — the coupon card, a torn ticket with a Take one button. Nothing draws
   one: the open classes are a dropdown on the booking form, not a kind in Find. */


/* ---------- THE BOOKING PAGES ARE THE FORM, AND ONLY THE FORM § */
function bookBlocks() {
  if (!USER) {
    return [`<div class="card"><h3>Booking</h3>
      <p class="sub">Sign in to book — your account is a few screens to the right.</p></div>`];
  }
  /* ---------- THE FORM, THEN WHAT IS ALREADY BOOKED, THEN WHAT IS FINISHED § */
  /* ---------- THE FORM, AND ONLY THE FORM, AGAIN § */
  /* THE MONEY BLOCK THAT STOOD UNDER THE FORM IS GONE — an admin's three figures are rows of the
     paper now, see `formMoney_`. It never drew here anyway: see the note where `moneyBlock` was. */
  /* BELOW THE FORM, NOT AS A SECOND PAGE. Each element of this array is a page somebody swipes to,
     and the booking they just made is not somewhere else — it is the answer to the form they are
     looking at. Same string. */
  /* THE PAGE IS ALWAYS THE FORM. § */
  bookPrefill_();
  return [bookerCard() + askedBlock_()].concat(myJobPages_()).filter(Boolean);
}

/* ---------- YOUR SESSIONS CAME BACK TO THIS COLUMN, AND THE NOTE ABOVE IS WHY IT HAD TO § */
/* ---------- THE ORDER IS ONE FUNCTION, BECAUSE TWO THINGS NEED TO AGREE ABOUT IT § */
let OPEN_JOB = '';

function myJobsOrdered_() {
  if (!USER || typeof myJobs_ !== 'function') return [];
  const mine = myJobs_().slice();
  /* THE ONE BEING LOOKED AT, IF IT IS NOT ALREADY YOURS. § */
  const all = (DATA.liveJobs || DATA.jobs || []);
  const idOf = j => String((j && (j.id || j.jobId)) || '');
  const open = OPEN_JOB && !mine.some(j => idOf(j) === String(OPEN_JOB))
    ? all.find(j => idOf(j) === String(OPEN_JOB)) : null;
  return (open ? [open] : []).concat(mine
    .sort((a, b) => String((b && b.startDate) || '').localeCompare(String((a && a.startDate) || ''))))
    /* NOT THE ONE ALREADY UNDER THE FORM. § */
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

/* THE RECEIPT FOR THE BOOKING JUST SENT — see `ASKED_JOB` above for why it is one and not a list. § */
function askedBlock_() {
  if (!ASKED_JOB) return '';
  const jobs = (DATA && (DATA.liveJobs || DATA.jobs)) || [];
  const j = jobs.find(x => String((x && (x.id || x.jobId)) || '') === String(ASKED_JOB));
  if (!j) return '';
  /* WITH ITS TILES: the bare receipt left the booking just sent with no Accept, Apply or pick (owner, 8 Nov). */
  if (typeof jobPage_ === 'function') return jobPage_(j);
  return typeof jobReceipt === 'function' ? jobReceipt(j) : '';
}

/* ---------- WHEN A SESSION IS OVER § */
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
/* ---------- A LIVE CLASS IS ONE THAT IS ACTUALLY RUNNING § */
const liveJobs_ = () => myJobs_()
  .filter(j => !jobIsPast_(j) && jobStage_(j) === 'receipt');


/* ---------- ONE WIDGET PER SESSION, NOT ONE WIDGET OF SESSIONS § */
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
        /* UNDER TOOLS ON FIND (790): it was filed under Booking, which the funnel does not offer, and shown on the Tools column, which went into Find. */
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

/* ONE SESSION, ONE PANE. § */
/* ---------- `weekGrid` AND `initWeek` STOOD HERE — `Your week`, FOLDED INTO THE TIMETABLE § */

/* ---------- WHICH DAYS A SESSION RUNS ON, AND WHETHER IT IS RUNNING ON ONE § */
const DAY3_ = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** The days a job runs on, Monday-first indices — every day of `Monday, Friday`, not the first. */
function jobDays_(j) {
  return String((j && (j.weekday || j.day)) || '').split(',')
    .map(x => DAY3_.indexOf(norm(x).slice(0, 3))).filter(i => i !== -1)
    .filter((i, k, a) => a.indexOf(i) === k);
}

/** Its session dates as midnight Dates, off the comma list the job row carries. */
function jobDates_(j) {
  return String((j && j.dates) || '').split(',').map(x => parseDMY(x.trim())).filter(Boolean);
}

/** Does this job meet on this date? See the note above for the answers and their order. */
function jobOn_(j, date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  if (jobDays_(j).indexOf((d.getDay() + 6) % 7) === -1) return false;
  const list = jobDates_(j);
  if (list.length) return list.some(x => x.getTime() === d.getTime());
  const from = parseDMY(j.startDate), to = parseDMY(j.endDate);
  return (!from || d >= from) && (!to || d <= to);
}

/* The Monday of the week holding `when`, at midnight — the week every "this week" here means. */
function mondayOf_(when) {
  const d = new Date(when || Date.now()); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/* ---------- REPAINTING BOOK WITHOUT LOSING THE PLACE § */
/* ---------- REPAINTING THE BOOKER, WHEREVER IT IS § */
function paintBook_() {
  /* ---------- WHICHEVER SCREEN THE FORM IS ACTUALLY ON § */
  const host = $('bookr') && $('bookr').closest('.screen');
  const id = host && String(host.id).indexOf('s-') === 0 ? host.id.slice(2) : '';

  /* THE FUNNEL KEEPS ITS PLACE, which is what `paintStuff(true)` is for and what a plain `paint`
     would throw away — the strip of result pages and which one you are on. */
  if (id === 'stuff') { if (typeof paintStuff === 'function') paintStuff(true); return; }

  /* ANY OTHER HOST IS AN ORDINARY SCREEN. `redrawBooker_` puts the scroll back either way. */
  if (id && typeof paint === 'function') { paint(id); return; }

  /* NOWHERE TO BE FOUND — the form is not on screen at all, so there is nothing to repaint and the state it just changed is read the next time something draws it. § */
}

/* `bookPages` WAS HERE — one pane per block for the Book column. `bookingPages_` in find.js does the
   same job for the funnel, which is where the blocks are drawn now. `bookBlocks` is unchanged and
   is what both ever called. */

/* The second argument was a header action — a "Sign in" link in the top right for anybody who was not. § */
/* `screen('book')` WAS HERE. A screen with no tab is a screen nobody can reach, and `bookPages` was
   its only caller — the same blocks are pages on Find now, assembled by `bookingPages_` there. */
/* `on('soon')` was here — "Not moved across yet", for screens that had not been rebuilt during
   the rewrite. They all have been, and nothing has carried `data-do="soon"` for a long time. */
/* THE BOOKER. Nine things have to be known before a session can be asked for: § */
/* EVERY ANSWER STARTS EMPTY, including the numbers. § */
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
  /* WHO ELSE IS SHARING THE COST, stored under the STEP'S OWN ID like every other answer. § */
  split: [],
  /* WHICH OF YOUR OWN CHILDREN THIS IS FOR. § */
  kids: [],
  /* A LIST NOW — see the `interval` step. § */
  interval: [], tutor: '', service: '',
  /* WHICH QUESTION'S LIST IS OPEN, or '' for the form. Here rather than in the DOM for the reason
     `note` is: a redraw rebuilds the page, and state kept in the markup is state a redraw loses. */
  picking: '',
  /* AN ADMIN'S DISCOUNT (docs/history/353) — not a step, because it is not a question the family is asked: § */
  discValue: '',
};

/* ---------- THE ONE YOU JUST ASKED FOR § */
let ASKED_JOB = '';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* The day codes the availability grids are written in. `m16` is Monday at four. */
const SLOT_DAYS = [['m', 'Monday'], ['tu', 'Tuesday'], ['w', 'Wednesday'], ['th', 'Thursday'],
                   ['f', 'Friday'], ['sa', 'Saturday'], ['su', 'Sunday']];

/* ---------- NINE TILL SIX, WRITTEN ONCE § */
const SLOT_HOURS = [];
for (let h = 9; h <= 18; h++) SLOT_HOURS.push(h);

/* ---------- MORNING, AFTERNOON, EVENING — THE WAITING LIST'S OWN COLUMNS § */
/* ---------- `head` IS THE COLUMN LABEL AND `name` IS THE WORD THAT GETS STORED § */
const SLOT_BLOCKS = [
  { key: 'morning',   name: 'Morning',   head: 'Morn', from: 0 },
  { key: 'afternoon', name: 'Afternoon', head: 'Aft',  from: 12 },
  { key: 'evening',   name: 'Evening',   head: 'Eve',  from: 17 },
];

/* ---------- WHAT THE ROW SAYS, WHICH IS NOT WHAT IS STORED § */
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

/* ---------- WHAT IS STORED IS THE SENTENCE, NOT A CODE § */
const blockPhrase_ = (dayName, b) => dayName + ' ' + b.name.toLowerCase();

/* ---------- WHEN, AS ONE QUESTION § */

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
  /* A CLIENT'S HOUSE KEEPS NO HOURS (445): a stray cell on its row emptied the grid; it is open whenever the tutor is. */
  const vAvail = takesAllSeats_(BOOKING.loc) ? {} : availSet_((sp && sp.avail) || (venue && venue.avail));
  const haveT = Object.keys(tAvail).length, haveV = Object.keys(vAvail).length;

  /* NOTHING SET WAS READ AS EVERYTHING FREE, and for a TUTOR that is over. § */
  /* ---------- AND WHAT THE TUTOR IS ALREADY TEACHING § */
  const tBusy = (t && t.busy) || {};
  /* AND WHAT THE ROOM ALREADY HOLDS (434): the server refuses a clash, so the grid says so first. */
  const sBusy = (sp && sp.busy) || {};
  /* A TUTOR'S WEEK IS A GUIDE, NEVER A LOCK (488): any hour may be asked and the tutor accepts or declines. Only the room shuts a cell. */
  const open = code => (!haveV || vAvail[code]) && !sBusy[code];
  /* WHY it is not free, so the grid can say. A tutor who does not work Tuesdays and a tutor who is
     already teaching that Tuesday look identical greyed out, and only one of them is worth asking
     about a different week. */
  /* `whyShut` rather than `why` — there is already a `why` below for the grid as a WHOLE ("nobody
     has set any hours yet"), and this is per cell. Two different questions and they were one word
     apart from being the same variable. */
  const whyShut = code => sBusy[code] ? 'room booked'
    : (haveV && !vAvail[code]) ? 'venue closed'
    : tBusy[code] ? 'tutor usually teaching then — they decide'
    : (haveT && !tAvail[code]) ? 'outside their usual hours — they decide' : '';

  /* EVERY DAY AND EVERY HOUR, ALWAYS — the ones nobody is free for greyed rather than removed. § */
  /* ---------- `rows` IS STILL ALL SEVEN; `days` IS WHAT THE WEEK DRAWS § */
  /* THE SPAN IS `SLOT_HOURS` AND THE ARGUMENT FOR ITS TWO ENDS IS WRITTEN THERE — including why the
     late end cannot be pushed past `AVAIL_HOURS` without moving that first. */
  const hours = SLOT_HOURS;
  const rows = SLOT_DAYS.map(([prefix, label]) => ({
    prefix, label,
    hours: hours.map(h => {
      const code = prefix + String(h).padStart(2, '0');
      /* AND WHY NOT, carried on the cell so the grid can say it rather than just greying out. § */
      return { h, code, open: open(code), why: whyShut(code) };
    }),
  }));
  const anyOpen = rows.some(r => r.hours.some(h => h.open));

  /* ---------- THE DAYS THE WEEK DRAWS § */
  const days = rows;

  const why = anyOpen ? '' : 'That venue has no free hours.';
  return { rows, days, why, anyOpen };
}

/* THE TICKED HOURS, GROUPED INTO SESSIONS. § */
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
  /* ---------- IN THE WEEK'S OWN ORDER, OFF `SLOT_DAYS` § */
  const dayAt_ = d => { const i = SLOT_DAYS.findIndex(x => x[0] === d); return i === -1 ? 99 : i; };
  return runs.sort((a, b) => dayAt_(a.day) - dayAt_(b.day) || a.hour - b.hour);
}

/* Every question, in the order somebody assembles a booking: § */
/* IS THIS A SHARED CLASS. Asked in one place and read everywhere, because the alternative is the
   same string comparison written nine times and one of them eventually spelt differently. */
/* ---------- WHICH BRANCH, AND WHY THE NAME CHANGED § */
/* THE ANSWER FOR A SEAT NOBODY HAS DECIDED ABOUT. § */
const UNNAMED = 'Someone else';

/* THE ANSWER THAT MEANS THE LIST HAS NOBODY ON IT YET. Named once, because the option, the refusal
   on the session branch and the send that turns it into `openWaitlist` all have to mean one
   string. */
const NOBODY = 'Nobody yet — just open it';

const isWaiting_ = () => /wait/i.test(String(BOOKING.how || ''));

/* ---------- THE CLASSES ON OFFER, NAMED FOR A DROPDOWN § */
const NEW_LIST = 'Start a new one';

function openClassLabel_(j) {
  const left = Math.max(0, (Number(j.maxKids) || 0) - (Number(j.currentKids) || 0));
  /* WHEN IT RUNS, FOR ONE THAT ALREADY DOES. § */
  const when = isWaitJob_(j) ? '' : [j.weekday, j.time].filter(Boolean).join(' ');
  return [j.subject || 'Class', j.location || j.venue, when,
          left ? left + ' seats left' : 'full']
    .filter(Boolean).join(' · ');
}

/* ---------- A LIST AND A CLASS ARE JOINED DIFFERENTLY § */
const isWaitJob_ = j => norm(j && j.kind) === 'waitlist';

/* The job behind the chosen label, or null for "start a new one" and for a class that has gone
   since the page loaded. */
function joinedJob_() {
  const v = BOOKING.joining;
  if (!v || v === NEW_LIST) return null;
  return (openJobs_() || []).find(j => openClassLabel_(j) === v) || null;
}

const BOOK_STEPS = [
  /* ---------- WHICH OF THE TWO THINGS THIS IS § */
  /* ---------- THE TRADE-OFF, SAID PLAINLY § */
  /* ---------- THE TRADE-OFF, IN ONE LINE EACH § */
  /* ---------- WHO IT IS FOR IS THE FIRST QUESTION § */
  /* NO TUTOR TO CHOOSE. The class is priced against a tutor nobody picked, which is precisely
     what makes the seat cost what it costs. */
  /* ---------- WHOSE BOOKING IT IS § */
  { id: 'client', label: 'Who is this for?', short: 'For',
    /* WHOEVER IS SIGNED IN, UNTIL SOMEBODY SAYS OTHERWISE. § */
    fallback: () => (USER && USER.name) || '',
    options: () => {
      if (!isAdmin()) return [];
      const me = (USER && USER.name) || '';
      /* `DATA.people` AND `hasRole_` BOTH NEVER EXISTED — I wrote them from memory of what a codebase like this usually has. § */
      const names = (DATA.clients || []).map(p => p.name).filter(Boolean);
      /* ---------- AND NOBODY AT ALL, WHICH IS HOW A LIST IS OPENED § */
      const people = [me].concat(names.filter(n => norm(n) !== norm(me))).filter(Boolean);
      return isWaiting_() ? [NOBODY].concat(people) : people.concat([NOBODY]);
    },

    /* A SESSION FOR NOBODY IS REFUSED — nobody sits in the chair at a session somebody booked
       outright, so offering it there would be offering a booking that cannot happen. */
    why: v => (v === NOBODY && !isWaiting_())
      ? 'a session needs somebody in it — this opens a waiting list' : '',
  },

  { id: 'how', label: 'How would you like to book?', short: 'Kind',
    /* BOTH ARE "START", because both are things you set going — the difference is whether it runs now or waits for company. § */
    /* THE TWO KINDS, NAMED. § */
    options: () => ['Instant class', 'Waiting list class'],
  },

  /* ---------- JOINING ONE, OR STARTING ONE § */
  { id: 'joining', label: 'Something already going, or a new one?', short: 'Class',
    /* THE ONES OF THE KIND BEING ASKED FOR. § */
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
  /* ---------- IT WAS ALWAYS MULTI AND NOTHING ON THE CARD SAID SO § */
  /* ---------- AND THEN THE SENTENCE CAME OFF AGAIN § */
  /* ---------- AND A WAITING LIST IS ASKED IT TOO § */
  /* NO `format`, `practical` OR `trip` STEP (463): trips and practicals are shop items, bought in the basket. */
  { id: 'subjects', label: 'What are we working on?', short: 'Subject', multi: true,
    options: () => (subjectRows() || []).map(x => x.name) },

  /* MIXED LEVELS IN ONE BOOKING (owner, 7 Nov): one answer, the highest qualification, and the price follows it. */
  { id: 'level', label: 'What level? (the highest among the children)', short: 'Level',
    options: () => ((DATA.dropdowns || {}).levels || []) },

  /* ONE SEAT EACH. The price is the room and the teaching divided by the seats, so a family
     taking two would be buying half the class at a quarter of the cost. */
  /* ---------- HOW MANY SEATS, AND WHAT THE REST OF THEM COST YOU § */
  /* ---------- HOW MANY EXTRA, NOT HOW MANY IN TOTAL § */
  /* ---------- WHO TEACHES IT IS ASKED EARLY, NOT LAST § */
  /* ---------- AND AN UNLISTED TUTOR IS THE SERVER'S DECISION, NOT THIS LIST'S § */
  { id: 'tutor', label: 'Anyone in particular?', short: 'Tutor',
    options: () => isWaiting_() ? [] : ['No preference'].concat(
      (DATA.tutors || []).filter(t => t.title).map(t => t.title)),
    label_: v => {
      const t = (DATA.tutors || []).find(x => norm(x.title) === norm(v));
      /* NO RATE BESIDE THE NAME (owner, 7 Nov): the price columns already say what the tutor adds. */
      return v + (t && t.listed === false ? ' · not listed' : '');
    },
    /* ---------- A WAITING LIST HAS NO TUTOR YET, AND THE ROW WAS SHOWING THE LAST ONE § */
    fallback: () => isWaiting_() ? 'No preference' : '',
    why: v => {
      if (v === 'No preference') return '';
      const t = (DATA.tutors || []).find(x => norm(x.title) === norm(v));
      if (!t || !BOOKING.subjects.length) return '';
      const teaches = (t.teaches || []).map(x => norm(String(x).replace(/\s*\([^)]*\)/, '')));
      const missing = BOOKING.subjects.filter(sub => teaches.indexOf(norm(sub)) === -1);
      return missing.length ? 'does not teach ' + missing.join(', ') : '';
    } },
  /* ---------- THE NUMBER ON THE ROW IS THE EXTRA SEATS, AND THE ONE IN `BOOKING` IS THE TOTAL § */
  { id: 'n', label: 'How many extra seats?', short: 'Extra seats',
    label_: v => String(Math.max(0, Number(v) - 1)),
    /* ---------- AND A WAITING LIST GETS TO ANSWER IT TOO § */
    /* ---------- AND IT STARTS AT THE FLOOR, NOT AT ONE § */
    /* AT HOME THE COUNT IS FIXED (owner, 8 Nov): the select is greyed, still showing every seat the tutor holds. */
    lock: () => homeSeats_() > 0,
    options: () => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_(), BOOKING.loc);
      if (homeSeats_() > 0) return [String(lim.max)];
      const out = [];
      /* ALWAYS FOUR CHOICES, so the control stays put; a number past the cap is greyed by `off`, never hidden (owner, 7 Nov). */
      for (let i = lim.min; i <= lim.min + 3; i++) out.push(String(i));
      return out;
    },
    off: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_(), BOOKING.loc);
      return Number(v) > lim.max ? (lim.why.max || 'the place') + ' holds ' + lim.max : '';
    },
    /* THE REFUSALS ONLY: a number outside what the room and the tutor allow. The note that used to
       sit beside this — what each number means, one sentence per option — is gone with the other
       three; see `stepRows_`. */
    /* THE SAME THREE ARGUMENTS AS THE LIST ABOVE, and that is what makes this the refusal for a number the list cannot offer rather than a second opinion about what § */
    why: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_(), BOOKING.loc);
      if (Number(v) > lim.max) return 'more than ' + (lim.why.max || 'the limit') + ' allows';
      /* ---------- IN THE ROW'S OWN UNITS, WHICH THIS PRINTED THE OTHER ONE OF § */
      if (Number(v) < lim.min) {
        const need = Math.max(0, lim.min - 1);
        return (lim.why.min || 'the minimum') + ' needs ' + need
             + ' extra seat' + (need === 1 ? '' : 's');
      }
      return '';
    } },

  { id: 'loc', label: 'Where?', short: 'Venue', only: 'wait, tutoring',
    options: () => bookableSpaces().map(x => x.label),
    /* THE ANSWER WRAPS. A room is "Venue — Room", and the three rooms of one building are the same
       answer until its last word — see the note at the foot of `stepSelect_`. */
    wrap: true,
    why: v => {
      const sp = spaceFor(v);
      /* The seat count is already chosen by now, so a room too small says so rather than
         quietly resetting it. */
      if (sp && Number(sp.max) && BOOKING.n > Number(sp.max)) {
        return 'holds ' + sp.max + ', you asked for ' + BOOKING.n;
      }
      return '';
    } },

  /* "I'LL HOST" IS A CHOICE, and it was an inference — turned on only when somebody picked "At home", so a client who wanted to provide the room at a paid venue § */
  /* A CLASS IS AT A VENUE. Somebody's front room is not a place three other families are going. */
  { id: 'hosting', label: 'Are you providing the space?', short: 'Space', only: 'wait, tutoring',
    /* AT THE CLIENT'S OWN HOUSE THE CLIENT IS THE SPACE (owner, 29 Oct: "the space field is redundant"): no options, so the row is text, `Yes`. */
    fallback: () => takesAllSeats_(BOOKING.loc) ? 'Yes' : '',
    options: () => {
      if (isWaiting_() || takesAllSeats_(BOOKING.loc)) return [];
      const rate = venueRate_();
      /* Nothing to charge means nothing to decide: hosting is already true and asking would be
         the app consulting somebody about a fact. */
      return rate > 0 ? ['No', 'Yes'] : ['Yes'];
    },
    /* The saving was spelled out here and it is already on the card: the Host row shows
       − £15.00/h against the venue's + £15.00/h, one line apart. Saying it twice made the option
       longer to read than the question. */
    label_: v => v === 'Yes' ? 'Yes — no room hire' : 'No — we book the room' },

  /* ONE QUESTION WHERE THERE WERE THREE. § */
  /* NO DAY YET. It is settled when the list fills — a time promised now is a promise about a room
     nobody has booked, made to four families who have not all joined. */
  /* `grid: 'hours'` RATHER THAN `true`. § */
  /* ---------- `week: true` MAKES THIS STEP SEVEN ROWS RATHER THAN ONE § */
  { id: 'slots', label: 'When?', short: 'When', grid: 'hours', week: true,
    options: () => isWaiting_() ? [] : slotGrid().rows.length ? ['grid'] : [] },

  /* ---------- WHEN COULD YOU COME? § */
  /* ---------- "FREE" MEANT FREE OF CHARGE TO EVERY READER § */
  /* ---------- AND IT IS THE WEEK NOW, NOT FIVE PHRASES § */
  /* ---------- AND IT IS NOT ON AN ORDINARY BOOKING AT ALL § */
  { id: 'avail', label: 'When could you come?', short: 'When free', multi: true,
    only: 'wait',
    grid: 'blocks', week: true, options: () => [], why: () => '' },

  /* AND NO TERM, for the same reason as the day. */
  /* ---------- SEVERAL TERMS, BECAUSE A BOOKING IS RARELY ONE OF THEM § */
  /* ---------- AND ON A WAITING LIST IT ANSWERS ITSELF § */
  { id: 'interval', label: 'Over what period?', short: 'Term', multi: true,
    fallback: () => { const t = isWaiting_() ? waitTerm_() : null;
                      return t ? (t.label || t.term) : ''; },
    /* ---------- AND IT IS OFFERED ON BOTH BRANCHES NOW § */
    options: () => intervals_().map(x => x.label || x.term).filter(Boolean) },

  /* SHARING THE COST. The pricing chain divides by `splitShares` and has since the beginning — three families in one session each pay a third — and the form never § */
  /* NAMING SOMEONE IS SPLITTING WITH THEM. § */
  /* SHARING IS THE WHOLE PRODUCT here — there is nobody to invite, because the other three seats
     are for whoever joins the list. */
  /* ---------- AND A TYPED ADDRESS IS CHECKED FOR BEING ONE § */
  { id: 'split', label: 'Sharing the cost with anyone?', short: 'Split', emails: true,
    why: () => {
      const bad = (BOOKING.split || []).map(x => String(x).trim()).filter(Boolean)
        .filter(x => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
      return bad.length ? 'not an email address: ' + bad.join(', ') : '';
    },
    /* A HOME BOOKING IS PRIVATE (owner, 8 Nov): every seat is theirs, so nobody to share with — `Just you`. */
    options: () => (isWaiting_() || homeSeats_() > 0) ? [] : ['emails'] },

  /* ---------- WOULD YOU SHARE WITH SOMEBODY YOU DO NOT KNOW? § */

  /* ---------- WHOSE CHILDREN ARE THESE? § */
  { id: 'kids', label: 'Which of your children is this for?', short: 'Child', multi: true,
    /* EVERY CHILD IS OFFERED. § */
    /* ---------- WHOSE CHILDREN, WHICH IS NOT ALWAYS YOURS § */
    options: () => {
      if (isWaiting_()) return [];
      const forWhom = BOOKING.client || (USER && USER.name) || '';
      /* THE CHOSEN CLIENT'S OWN ROW FIRST, yourself included (owner, 7 Nov: another client's children were offered); your own list only when you have no row. */
      const c = (DATA.clients || []).find(x => norm(x.name) === norm(forWhom));
      if (c || !USER || norm(forWhom) !== norm(USER.name)) return ((c && c.children) || []).filter(Boolean).concat([UNNAMED]);
      return (USER.children || USER.kids || []).filter(Boolean).concat([UNNAMED]);
    },
    /* ---------- AND ONE UNNAMED SEAT, ALWAYS OFFERED § */

    /* Once you have ticked as many as you paid for, the rest say why. Still there, still readable,
       and tickable the moment you untick one — which is how you change your mind about which two
       of three are coming. */
    /* NO "that is N seats already" (owner, 7 Nov): the seats follow the children picked — see `bookToggle_`. */
  },


];

/* A HOME BOOKING'S SEAT COUNT, the tutor's whole capacity (owner, 8 Nov); 0 when not at home or on a waiting list. */
function homeSeats_() {
  if (isWaiting_() || !takesAllSeats_(BOOKING.loc)) return 0;
  return seatLimits(null, tutorRow_(), BOOKING.loc).max;
}

/* Held in `BOOKING` itself, so the row, the price and the request all read the same total. */
function bookHomeSeats_() {
  const n = homeSeats_();
  if (!n) return;
  BOOKING.n = String(n);
  BOOKING.split = [];
  BOOKING.done = uniq((BOOKING.done || []).concat(['n']));
}

const tutorRow_ = () => (DATA.tutors || []).find(t => norm(t.title) === norm(BOOKING.tutor)) || null;

/* What the chosen place costs an hour — the ROOM's own rate where there is one, because a small
   room and a large one at the same venue are different prices and the building's single figure
   could only ever be right for one of them. */
function venueRate_() {
  if (!BOOKING.loc) return 0;
  const sp = spaceFor(BOOKING.loc);
  if (sp) return Number(sp.rate) || 0;
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(BOOKING.loc));
  return v ? Number(v.bestRate) || 0 : 0;
}

const bookStep_ = id => BOOK_STEPS.find(s => s.id === id);

/** Has this one been answered? A multi is answered when it holds anything. */
function bookAnswered_(step) {
  /* A QUESTION YOU CAN ANSWER SEVERAL TIMES IS FINISHED WHEN YOU SAY IT IS. § */
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
  /* EMPTY IS UNANSWERED. § */
  return String(v ?? '') !== '';
}

/* THE NEXT QUESTION WORTH ASKING, or nothing left. § */
function nextBookStep() {
  const on = bookOn_();
  for (const step of BOOK_STEPS) {
    /* THE OTHER BRANCH'S QUESTIONS ARE NOT ASKED — see the `only:` note on the `avail` step. § */
    if (!onlyHas_(step.only, on)) continue;
    if (bookAnswered_(step)) continue;
    const opts = step.options().filter(Boolean);
    if (!opts.length) continue;                    // nothing to offer: leave it unanswered
    /* A GRID AND AN EMAIL LIST ARE NOT ONE-ANSWER QUESTIONS. § */
    if (opts.length === 1 && !step.multi && !step.grid && !step.emails) {
      BOOKING[step.id] = opts[0];                  // the only answer there is
      continue;
    }
    return step;
  }
  return null;
}

/* ---------- ONE TERM PER NAME, AND THE NEAREST ONE § */
function intervals_() {
  const seen = {};
  return (DATA.intervals || []).filter(x => {
    const k = norm(x.label || x.term);
    if (!k || seen[k]) return false;
    seen[k] = 1;
    return true;
  });
}

/** What the pricing chain wants, out of what has been answered so far. */
function bookSpec() {
  /* ---------- EVERY TERM CHOSEN, IN DATE ORDER § */
  const want = Array.isArray(BOOKING.interval) ? BOOKING.interval
             : (BOOKING.interval ? [BOOKING.interval] : []);
  const ivs = intervals_()
    .filter(x => want.some(w => norm(w) === norm(x.label || x.term)));
  const first = ivs[0] || {};
  const last = ivs[ivs.length - 1] || {};
  const runs = bookRuns();
  /* The session length IS the length of a run — not a separate answer that has to be reconciled with the hours ticked. § */
  const hours = runs.length ? runs[0].hours : 0;
  const perWeek = runs.reduce((n, r) => n + r.hours, 0);
  const days = [...new Set(runs.map(r => r.dayName))];
  const firstHour = runs.length ? String(runs[0].hour).padStart(2, '0') + ':00' : '';
  return Object.assign({
    subjects: BOOKING.subjects, level: BOOKING.level, n: Number(BOOKING.n) || 1,
    loc: (spaceFor(BOOKING.loc) || {}).label || BOOKING.loc,
    /* The answer, or the rule when it has not been given: a venue that charges nothing is hosted
       whether or not anybody said so. */
    hosting: takesAllSeats_(BOOKING.loc) ? true : BOOKING.hosting ? BOOKING.hosting === 'Yes'
                             : isHome(BOOKING.loc),
    /* HOW MANY OTHERS, counted from the addresses given rather than picked separately. */
    splitOthers: (BOOKING.split || []).filter(x => String(x).trim()).length,
    day: days.join(', '), time: firstHour,
    hours: hours,
    /* EVERY TICKED HOUR, added up. § */
    hoursPerWeek: perWeek,
    /* The runs themselves, so the chain can work out the real session dates across every day. */
    runs: runs.map(r => ({ dayName: r.dayName, day: r.day, hours: r.hours })),
    /* ---------- THE SPAN, AND THE WINDOWS INSIDE IT § */
    interval: ivs.map(x => x.label || x.term).join(', '),
    weeks: ivs.reduce((n, x) => n + (Number(x.weeks) || 0), 0),
    startDate: first.startDate || '', endDate: last.endDate || '',
    lastSun: last.lastSun || last.endDate || '',
    windows: ivs.map(x => ({ startDate: x.startDate || '',
                             lastSun: x.lastSun || x.endDate || '' })),
    tutor: BOOKING.tutor === 'No preference' ? '' : BOOKING.tutor,
    /* AN ADMIN'S ALONE, and asked here as well as hidden on the form: a draft carried from an admin's
       session to a family's on one device must not price their booking with the admin's discount. */
    discount: (typeof isAdmin === 'function' && isAdmin() && !isWaiting_() && Number(BOOKING.discValue) > 0)
      ? { type: '%', value: BOOKING.discValue, by: 'Business' }
      : null,
  });
}

/* The price so far, or nothing. Shown from the moment it can be worked out rather than at the end
   — the whole point of asking in this order is that somebody can stop when it gets too dear. */
/* ---------- A WAITING LIST IS PRICED A DIFFERENT WAY, AND WAS NOT PRICED AT ALL § */
function waitPrice_() {
  /* ---------- THE ANSWER, NOT THE INGREDIENTS § */
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

/* ---------- BACK TO NOTHING, FROM THE STEP LIST ITSELF § */
function resetBooking_(keepDraft) {
  BOOK_STEPS.forEach(st => {
    /* A list question gets an empty list and a single one gets an empty string, because that is what each is tested against — `[].length` for one, `''` for the other. § */
    BOOKING[st.id] = (st.multi || st.grid || st.emails) ? [] : '';
  });
  /* THE ONE THAT IS NOT AN ANSWER: § */
  BOOKING.done = [];
  BOOKING.note = '';
  BOOKING.discValue = '';
  /* AND WHICH LIST IS OPEN, for the same reason: it is about the form rather than about the
     booking. A reset with it left set would draw the next booking's first page as a picker for a
     question nobody had pressed. */
  BOOKING.picking = '';
  BOOK_PREFILLED = false;
  /* AND THE DRAFT OF IT — sent, or started again, is not a booking to bring back (`bookKeep_`). § */
  if (keepDraft) return;
  try {
    draftDrop_('book', 'form');
    BOOK_STEPS.forEach(st => { if (st.emails) draftDrop_('book', 'emails:' + st.id); });
  } catch (e) {}
}

