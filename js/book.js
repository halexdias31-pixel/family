/* @family. — book.js ONE FILE, SPLIT. § */


/* ---------- BOOK § */
/** Everything on the Book screen, in order. */
/* `openClassCard` WAS HERE — the coupon card, a torn ticket with a Take one button. Nothing draws
   one: the open classes are a dropdown on the booking form, not a kind in Find. */


  /* ---------- `jobCard` WAS HERE, AND IT HAS NO CALLERS LEFT § */


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

/* `pastCard_` WAS HERE. § */

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

/* The hour a session starts, off `16:00` or the `4pm` some older rows hold. NaN when there is none. */
function startHour_(t) {
  const m = /(\d{1,2})(?::\d{2})?\s*(am|pm)?/i.exec(String(t || ''));
  if (!m) return NaN;
  let h = Number(m[1]);
  if (m[2] && /pm/i.test(m[2]) && h < 12) h += 12;
  if (m[2] && /am/i.test(m[2]) && h === 12) h = 0;
  return h;
}

/* ---------- YOUR SESSIONS, AS THE SEVEN DAYS OF ONE WEEK § */
function weekSessions_(when) {
  const mon = mondayOf_(when);
  const out = [];
  (typeof myJobs_ === 'function' ? myJobs_() : []).forEach(j => {
    if (!S_(j.day || j.weekday) || !S_(j.time)) return;
    if (/cancel/i.test(String(j.status || ''))) return;
    const from = startHour_(j.time);
    if (!isFinite(from)) return;
    const to = from + Math.max(1, Number(j.hours) || 2);
    for (let i = 0; i < 7; i++) {
      const date = new Date(mon); date.setDate(mon.getDate() + i);
      if (jobOn_(j, date)) out.push({ j, day: i, date, from, to });
    }
  });
  return out;
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
/* `on('signin')` WAS HERE — `toast('Sign-in screen next')`, behind the gold button on the signed-out booking card. § */
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
  discType: '', discValue: '', discCode: '', discBy: '',
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

/* The hours of one block, off `SLOT_HOURS` — never a second list of numbers. */
function blockHours_(i) {
  const from = SLOT_BLOCKS[i].from;
  const to = i + 1 < SLOT_BLOCKS.length ? SLOT_BLOCKS[i + 1].from : 99;
  return SLOT_HOURS.filter(h => h >= from && h < to);
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
  const vAvail = availSet_((sp && sp.avail) || (venue && venue.avail));
  const haveT = Object.keys(tAvail).length, haveV = Object.keys(vAvail).length;

  /* NOTHING SET WAS READ AS EVERYTHING FREE, and for a TUTOR that is over. § */
  /* ---------- AND WHAT THE TUTOR IS ALREADY TEACHING § */
  const tBusy = (t && t.busy) || {};
  /* AND WHAT THE ROOM ALREADY HOLDS (434): the server refuses a clash, so the grid says so first. */
  const sBusy = (sp && sp.busy) || {};
  const tNone = !!t && !haveT;
  const open = code => !tNone && (!haveT || tAvail[code]) && (!haveV || vAvail[code]) && !tBusy[code] && !sBusy[code];
  /* WHY it is not free, so the grid can say. A tutor who does not work Tuesdays and a tutor who is
     already teaching that Tuesday look identical greyed out, and only one of them is worth asking
     about a different week. */
  /* `whyShut` rather than `why` — there is already a `why` below for the grid as a WHOLE ("nobody
     has set any hours yet"), and this is per cell. Two different questions and they were one word
     apart from being the same variable. */
  const whyShut = code => tNone ? 'no hours set'
    : tBusy[code] ? 'teaching ' + tBusy[code]
    : sBusy[code] ? 'room booked'
    : (haveT && !tAvail[code]) ? 'not available'
    : (haveV && !vAvail[code]) ? 'venue closed' : '';

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
  const ticked = Array.isArray(BOOKING.slots) ? BOOKING.slots : [];
  const works = r => haveT && r.hours.some(h => tAvail[h.code]);
  const days = (t && rows.some(works))
    ? rows.filter(r => works(r) || r.hours.some(h => ticked.indexOf(h.code) !== -1))
    : rows;

  const why = anyOpen ? ''
    : tNone ? 'That tutor hasn\u2019t set their hours yet, so they cannot be booked by name. Choose No preference, or another tutor.'
    : !haveT && !haveV ? 'Nobody has set any hours yet.'
    : !haveT ? 'That venue is open, but the tutor has no hours set.'
    : !haveV ? 'The tutor has hours, but that venue has none set.'
    : 'The tutor’s hours and the venue’s do not overlap.';
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
    /* ---------- "your own booking" WAS HERE AND IT WAS THE ROW READ BACK TO YOU § */
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
  /* ---------- WHAT KIND OF SESSION: TUTORING, A PRACTICAL OR A TRIP (docs/history/353) § */
  { id: 'format', label: 'What kind of session?', short: 'Format', only: 'book',
    fallback: () => 'Tutoring',
    options: () => BOOK_FORMATS.slice() },
  /* THE PRACTICALS ARE `data/practicals.json`, by name, in the order a person looks one up. § */
  { id: 'practical', label: 'Which practical?', short: 'Practical', only: 'practical',
    options: () => uniq((DATA.practicals || []).map(p => p.name))
      .sort((a, b) => a.localeCompare(b)) },
  /* THE TRIPS TAB IS EMPTY TODAY, and the row says so rather than drawing a dash a person reads as a
     dropdown that failed to load. A trip with no row still prices its teaching; it just has no tickets. */
  { id: 'trip', label: 'Which trip?', short: 'Trip', only: 'trip',
    fallback: () => (DATA.trips || []).length ? '' : 'None yet',
    options: () => uniq((DATA.trips || []).map(t => t.name)) },

  { id: 'subjects', label: 'What are we working on?', short: 'Subject', multi: true,
    options: () => (subjectRows() || []).map(x => x.name) },

  { id: 'level', label: 'What level?', short: 'Level',
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
      return t && t.listed === false ? v + ' · not listed' : v;
    },
    /* ---------- A TUTOR WITH NO HOURS CANNOT BE CHOSEN, AND SAYS WHY § */
    off: v => tutorNoHours_(v) ? 'hasn\'t set their hours yet' : '',
    /* ---------- A WAITING LIST HAS NO TUTOR YET, AND THE ROW WAS SHOWING THE LAST ONE § */
    fallback: () => isWaiting_() ? 'No preference' : '',
    why: v => {
      if (v === 'No preference') return '';
      /* AND SAID ON THE ROW TOO, for a name that arrived some other way — a saved form, a tutor who
         unticked their last hour while somebody had them chosen. The send refuses it as well. */
      if (tutorNoHours_(v)) return 'hasn\'t set their hours yet, so cannot be booked by name';
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
    options: () => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_(), BOOKING.loc);
      const out = [];
      const top = Math.max(lim.min, Math.min(lim.min + 3, lim.max));
      for (let i = lim.min; i <= top; i++) out.push(String(i));
      /* A TRIP TAKES AS MANY CHILDREN AS ITS ROW SAYS, `max_children`, and not one more — the ticket
         office and the risk assessment were both written for that number. */
      const cap = tripCap_();
      return cap ? out.filter(x => Number(x) <= cap) : out;
    },
    /* THE REFUSALS ONLY: a number outside what the room and the tutor allow. The note that used to
       sit beside this — what each number means, one sentence per option — is gone with the other
       three; see `stepRows_`. */
    /* THE SAME THREE ARGUMENTS AS THE LIST ABOVE, and that is what makes this the refusal for a number the list cannot offer rather than a second opinion about what § */
    why: v => {
      const lim = seatLimits(spaceFor(BOOKING.loc), tutorRow_(), BOOKING.loc);
      if (Number(v) > lim.max) return 'more than ' + (lim.why.max || 'the limit') + ' allows';
      if (tripCap_() && Number(v) > tripCap_()) return 'more than this trip takes (' + tripCap_() + ' children)';
      /* ---------- IN THE ROW'S OWN UNITS, WHICH THIS PRINTED THE OTHER ONE OF § */
      if (Number(v) < lim.min) {
        const need = Math.max(0, lim.min - 1);
        return (lim.why.min || 'the minimum') + ' needs ' + need
             + ' extra seat' + (need === 1 ? '' : 's');
      }
      return '';
    } },

  /* NOT ON A TRIP (docs/history/353): the place is the trip's, and its cost is the tickets. */
  { id: 'loc', label: 'Where?', short: 'Venue', only: 'wait, tutoring, practical',
    options: () => ['At home'].concat(bookableSpaces().map(x => x.label)),
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
  { id: 'hosting', label: 'Are you providing the space?', short: 'Space', only: 'wait, tutoring, practical',
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
    options: () => isWaiting_() ? [] : ['emails'] },

  /* ---------- WOULD YOU SHARE WITH SOMEBODY YOU DO NOT KNOW? § */
  /* THE JOIN QUESTION WAS HERE, AND IT ASKED SOMETHING THE SEATS ALREADY ANSWER. § */

  /* ---------- WHOSE CHILDREN ARE THESE? § */
  { id: 'kids', label: 'Which of your children is this for?', short: 'Child', multi: true,
    /* EVERY CHILD IS OFFERED. § */
    /* ---------- WHOSE CHILDREN, WHICH IS NOT ALWAYS YOURS § */
    options: () => {
      if (isWaiting_()) return [];
      const forWhom = BOOKING.client || (USER && USER.name) || '';
      if (USER && norm(forWhom) !== norm(USER.name)) {
        const c = (DATA.clients || []).find(x => norm(x.name) === norm(forWhom));
        return ((c && c.children) || []).filter(Boolean).concat([UNNAMED]);
      }
      return (USER && (USER.children || USER.kids) || []).filter(Boolean).concat([UNNAMED]);
    },
    /* ---------- AND ONE UNNAMED SEAT, ALWAYS OFFERED § */

    /* Once you have ticked as many as you paid for, the rest say why. Still there, still readable,
       and tickable the moment you untick one — which is how you change your mind about which two
       of three are coming. */
    why: v => {
      const seats = Number(BOOKING.n) || 0;
      const on = (BOOKING.kids || []).length;
      /* THE UNNAMED SEAT IS NEVER THE ONE THAT IS FULL. § */
      if (v === UNNAMED) return '';
      return (seats && on >= seats && (BOOKING.kids || []).indexOf(v) === -1)
        ? 'that is ' + seats + ' seat' + (seats === 1 ? '' : 's') + ' already' : '';
    },
  },


];

const tutorRow_ = () => (DATA.tutors || []).find(t => norm(t.title) === norm(BOOKING.tutor)) || null;

/* ---------- HAS THIS TUTOR SAID WHEN THEY CAN TEACH § */
function tutorNoHours_(name) {
  if (!name || norm(name) === norm('No preference')) return false;
  const t = (DATA.tutors || []).find(x => norm(x.title) === norm(name));
  return !!t && !Object.keys(availSet_(t.avail)).length;
}

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
    loc: BOOKING.loc === 'At home' ? '' : BOOKING.loc,
    /* The answer, or the rule when it has not been given: a venue that charges nothing is hosted
       whether or not anybody said so. */
    hosting: BOOKING.hosting ? BOOKING.hosting === 'Yes'
                             : (BOOKING.loc === 'At home' || isHome(BOOKING.loc)),
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
    /* THE FORMAT AND WHAT IT NAMES (docs/history/353). § */
    format: bookFormat_(BOOKING.format), practical: BOOKING.practical || '', trip: BOOKING.trip || '',
    /* AN ADMIN'S ALONE, and asked here as well as hidden on the form: a draft carried from an admin's
       session to a family's on one device must not price their booking with the admin's discount. */
    discount: (typeof isAdmin === 'function' && isAdmin() && !isWaiting_() && BOOKING.discType)
      ? { type: BOOKING.discType, value: BOOKING.discValue, code: BOOKING.discCode, by: BOOKING.discBy || 'Business' }
      : null,
  }, bookFormat_(BOOKING.format) === 'Trip' ? { loc: '', hosting: false } : {});
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
  BOOKING.discType = BOOKING.discValue = BOOKING.discCode = BOOKING.discBy = '';
  /* AND WHICH LIST IS OPEN, for the same reason: it is about the form rather than about the
     booking. A reset with it left set would draw the next booking's first page as a picker for a
     question nobody had pressed. */
  BOOKING.picking = '';
  /* AND THE DRAFT OF IT — sent, or started again, is not a booking to bring back (`bookKeep_`). § */
  if (keepDraft) return;
  try {
    draftDrop_('book', 'form');
    BOOK_STEPS.forEach(st => { if (st.emails) draftDrop_('book', 'emails:' + st.id); });
  } catch (e) {}
}

/* ---------- THE FORM SURVIVES A RELOAD (docs/history/317) § */
const bookBlank_ = () => Object.keys(BOOKING).every(k => k === 'done' || k === 'picking'
  || ![].concat(BOOKING[k] == null ? [] : BOOKING[k]).join('').trim());
/* WHOSE FORM IS IN `BOOKING` — the draft it was read from or last written to. See `bookFollow_`. */
let BOOK_WHO = '';
/* THE FORM AS ITS DRAFT IS WRITTEN — one function, so another tab's copy can be told from this one's. */
function bookJson_() {
  const o = {};
  Object.keys(BOOKING).forEach(k => { if (k !== 'picking') o[k] = BOOKING[k]; });
  return JSON.stringify(o);
}
function bookKeep_() {
  if (typeof draftKeep_ !== 'function') return;
  try {
    BOOK_WHO = draftWho_();
    if (bookBlank_()) draftDrop_('book', 'form'); else draftKeep_('book', 'form', bookJson_());
  } catch (e) {}
}
/* `who` IS ONLY EVER `'device'`: the device's form, read in for the person it is marked as (`bookFollow_`). */
function bookBack_(who) {
  if (typeof draftRead_ !== 'function') return;
  BOOK_WHO = who || draftWho_();
  try {
    const raw = draftRead_('book', 'form', undefined, who);
    if (raw === null) return;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return;
    const plain = v => typeof v === 'string' || typeof v === 'number';
    Object.keys(o).forEach(k => {
      if (k === 'picking') return;
      const v = o[k];
      if (plain(v) || (Array.isArray(v) && v.every(plain))) BOOKING[k] = Array.isArray(v) ? v.slice() : v;
    });
  } catch (e) {}
}
bookBack_();
/* ---------- SENT IS NOT A DRAFT (`draftSent_`, data.js) § */
function bookSending_(going) {
  try {
    [['form']].concat(BOOK_STEPS.filter(st => st.emails).map(st => ['emails:' + st.id])).forEach(([id]) => {
      if (going) draftSent_('book', id); else draftSentBack_('book', id);
    });
  } catch (e) {}
}
/* ---------- AND ANOTHER TAB'S FORM IS THIS TAB'S (the `storage` listener in data.js) § */
function bookElsewhere_(v, old) {
  try {
    const mine = bookJson_();
    if (v !== null ? v === mine : old !== mine) return;
    resetBooking_(true);
    bookBack_();
    if ($('bookr') && typeof redrawBooker_ === 'function' && typeof paintBook_ === 'function') redrawBooker_(paintBook_);
  } catch (e) {}
}
/* ---------- AND THE FORM IS THE PERSON'S, ON A SHARED iPAD § */
function bookFollow_(signingIn) {
  if (typeof draftWho_ !== 'function') return;
  const now = draftWho_();
  if (now === BOOK_WHO) return;
  if (BOOK_WHO === 'device' && now !== 'device') {
    const may = typeof ansMayMove_ === 'function'
      ? ansMayMove_(draftKey_('book', 'form', 'device'), draftKey_('book', 'form', now)) : 'later';
    if (may === 'own' && bookBlank_()) bookBack_('device');
    if (may && !bookBlank_()) {
      /* THEIR OWN DRAFT FIRST, then the device's form joined to it. */
      try { bookJoin_(draftRead_('book', 'form', undefined, now)); } catch (e) {}
      bookKeep_();
      try {
        draftDrop_('book', 'form', 'device');
        BOOK_STEPS.forEach(st => { if (st.emails) bookEmailsCarry_(st, now); });
      } catch (e) {}
      return;
    }
  }
  resetBooking_(true);
  if (signingIn) BOOK_WHO = now; else bookBack_();
}
/* ---------- TWO FORMS OF ONE PERSON'S, PUT TOGETHER — `ansJoin_`'s rule (answers.js), for a form § */
function bookJoin_(raw) {
  if (raw === null || raw === undefined) return;
  let o = null;
  try { o = JSON.parse(raw); } catch (e) { return; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return;
  const plain = v => typeof v === 'string' || typeof v === 'number';
  const blank = v => ![].concat(v == null ? [] : v).join('').trim();
  Object.keys(o).forEach(k => {
    if (k === 'picking') return;
    const mine = o[k], here = BOOKING[k];
    if (Array.isArray(mine) && mine.every(plain)) {
      const list = mine.slice();
      [].concat(blank(here) ? [] : here).forEach(x => { if (!list.some(y => norm(y) === norm(x))) list.push(x); });
      const st = bookStep_(k);
      if (st && st.multi && typeof st.options === 'function') {
        try {
          const offered = (st.options() || []).map(norm);
          const at_ = x => { const i = offered.indexOf(norm(x)); return i === -1 ? offered.length : i; };
          list.sort((a, b) => at_(a) - at_(b));
        } catch (e) {}
      }
      BOOKING[k] = list;
    } else if (plain(mine) && !blank(mine)) {
      if (k === 'note') {
        const add = String(here == null ? '' : here).trim();
        BOOKING.note = !add || String(mine).indexOf(add) !== -1 ? String(mine) : String(mine).replace(/\s+$/, '') + '\n\n' + add;
      } else if (blank(here)) BOOKING[k] = mine;
    }
  });
}
/* THE ADDRESSES TYPED ON THE DEVICE'S FORM AND NOT YET LEFT, into the person's: § */
function bookEmailsCarry_(st, now) {
  const id = 'emails:' + st.id;
  const dev = draftRead_('book', id, undefined, 'device');
  if (dev === null) return;
  if (typeof ansMayMove_ === 'function' && !ansMayMove_(draftKey_('book', id, 'device'), draftKey_('book', id, now))) return;
  const mine = draftRead_('book', id, undefined, now);
  const all = [];
  [mine, dev].forEach(v => String(v == null ? '' : v).split(',').map(x => x.trim()).filter(Boolean)
    .forEach(x => { if (!all.some(y => norm(y) === norm(x))) all.push(x); }));
  /* `from` IS THE LIST THE BOX WILL BE DRAWN OVER (`stepInput_`), so the box draws this draft. */
  const saved = (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ');
  if (all.length) draftKeep_('book', id, all.join(', '), false, saved);
  draftDrop_('book', id, 'device');
}

/* `on('new-booking')` AND `on('book-close')` WERE HERE. § */

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

/* ---------- AND THE SAME TOGGLE ONE GRID ALONG § */
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
/* ---------- A DROPDOWN ANSWERED § */
/* ---------- TICKING ONE ANSWER OF SEVERAL § */
function bookToggle_(step, v) {
  if (v) {
    const list = BOOKING[step.id] || [];
    const at = list.findIndex(x => norm(x) === norm(v));
    if (at === -1) list.push(v); else list.splice(at, 1);
    /* ---------- KEPT IN THE ORDER THE QUESTION OFFERS THEM, NOT THE ORDER THEY WERE TICKED § */
    try {
      const offered = (step.options() || []).map(norm);
      const at_ = x => { const i = offered.indexOf(norm(x)); return i === -1 ? offered.length : i; };
      list.sort((a, b) => at_(a) - at_(b));
    } catch (err) {}
    BOOKING[step.id] = list;
  }
  /* ANSWERED THE MOMENT THERE IS SOMETHING IN IT. § */
  BOOKING.done = uniq((BOOKING.done || []).concat([step.id]));
  if (!(BOOKING[step.id] || []).length) {
    BOOKING.done = (BOOKING.done || []).filter(id => id !== step.id);
  }
}

document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-set"]');
  if (!el) return;
  const step = bookStep_(el.dataset.step);
  if (!step) return;

  /* A SEVERAL-OF-A-LIST QUESTION IS NEVER A SELECT — it is checkboxes, answered by `book-many-pick`. § */
  if (step.multi) return;
  /* AN OPTION THE LIST DREW DISABLED IS NOT TAKEN HOWEVER IT ARRIVES — a keyboard, an old browser
     that lets a disabled option through, a hand-built event. Said, and the row redrawn on what it
     held. */
  const no = step.off && el.value ? String(step.off(el.value) || '') : '';
  if (no) { toast(el.value + ' ' + no); drawBooker(); return; }
  BOOKING[step.id] = el.value || '';
  BOOKING.done = (BOOKING.done || []).filter(id => id !== step.id);

  /* ---------- SWITCHING THE KIND CLEARS THE ANSWER ONLY THE OTHER KIND COULD HAVE GIVEN § */
  if (step.id === 'how') BOOKING.tutor = '';

  /* ---------- CHOOSING A CLASS ANSWERS FOUR OTHER QUESTIONS § */
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

/* `on('book-pick')` WAS HERE — the handler for the option cards in the panel. § */

/* ---------- `on('book-edit')` IS GONE, AND IT WAS THE ONE CONTROL ON THE CARD DRAWN IN GOLD § */

/* NO REDRAW. Every other control on the paper changes what the receipt says, so it repaints; this
   one changes nothing but itself, and repainting would take the cursor out of the box the moment
   somebody clicked away mid-sentence. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-note"]');
  if (el) BOOKING.note = el.value || '';
});
/* AND AS IT IS TYPED, into the form's draft (`bookKeep_`) — still no redraw, for the reason above: a
   reload mid-sentence used to lose a note nobody had clicked away from yet (317). */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-note"]');
  if (!el) return;
  BOOKING.note = el.value || '';
  bookKeep_();
});

/* ---------- THE SPLIT, TYPED § */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-emails"]');
  if (!el) return;
  const step = bookStep_(el.dataset.step);
  if (!step) return;
  const list = String(el.value || '').split(',').map(x => x.trim()).filter(Boolean);
  BOOKING[step.id] = list;
  /* AN ANSWER NOW, SO NO LONGER A DRAFT OF ITS OWN — `BOOKING`'s draft has it (`stepInput_`). */
  try { draftDrop_('book', 'emails:' + step.id); } catch (err) {}
  BOOKING.done = list.length
    ? uniq((BOOKING.done || []).concat([step.id]))
    : (BOOKING.done || []).filter(id => id !== step.id);
  drawBooker();
});

/* `on('book-more')` WAS HERE — the Done button that closed a multiple-choice question. § */

/* THE CARD. Photographs, then every priced row, then the dates, then where it stands. § */
/* THE ROWS OF THE RECEIPT, AS DATA. § */
/* ---------- WHICH TERM A WAITING LIST IS FOR § */
function waitTerm_() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const terms = intervals_().filter(t => norm(t.kind) !== 'holiday');
  const dt = v => parseDMY(v);
  const running = terms.find(t => dt(t.opensOn) && dt(t.closesOn)
    && now >= dt(t.opensOn) && now <= dt(t.closesOn));
  const next = terms.filter(t => dt(t.opensOn) && dt(t.opensOn) > now)
    .sort((a, b) => dt(a.opensOn) - dt(b.opensOn))[0];
  return running || next || null;
}

/* HOW MANY FAMILIES ARE SPLITTING IT, IN ONE WORDING. § */
function familiesSay_(n) {
  const k = Math.max(1, Number(n) || 1);
  /* ONE FAMILY IS NOT A SPLIT, AND "1 family" ON A ROW CALLED `Shared by` READS AS A FAULT. § */
  if (k === 1) return 'Just you';
  return k + ' families';
}

function breakdownRows(L) {
  const fmt = { money, esc, pct: x => x };
  const rows = [];
  let line = 0;
  const push = (k, v, mul, rate, total, opts) => rows.push(Object.assign({
    n: (opts && opts.free) ? '' : String(++line).padStart(3, '0'),
    k, v: v || '', mul: mul || '', rate: rate || '', total: total || '',
  }, opts || {}));

  /* ---------- WHO IT IS FOR, AT THE TOP § */
  /* READ FROM THE BOOKING, NOT FROM `L`. § */
  /* ---------- "NOBODY YET" IS AN ANSWER, NOT A NAME § */
  const forWhom = BOOKING.client === NOBODY ? '' : (BOOKING.client || (USER && USER.name) || '');
  if (forWhom) push('For', esc(forWhom), '', '', '', { free: true, who: true });

  /* ---------- A WAITING LIST HAS A DIFFERENT BREAKDOWN, AND WAS SHOWN THE WRONG ONE § */
  if (isWaiting_()) {
    const w = bookPrice();
    if (!w) return rows;
    /* WHAT KIND OF THING THIS IS, FIRST. § */
    push('Kind', 'Waiting list class', '', '', '', { free: true });
    push('A seat', esc(BOOKING.loc || 'no venue'), '', money(w.chargePerHour) + '/h',
      money(w.perSeatSession), { end: true, step: 'loc' });
    push('Shared by', familiesSay_(w.seats), '', '', '', { free: true });
    push('Per session', esc(w.hours) + ' hours', '', '', '', { free: true });

    const term = waitTerm_();
    if (term) {
      /* ---------- `Running`, `Weeks left` AND A `For` HOLDING THE TERM WERE ALL HERE § */
      /* ---------- AND WHAT THE TERM WOULD COME TO § */
      if (term.weeks) {
        push('About', esc(term.weeks) + ' × ' + money(w.perSeatSession),
          '', '', money(w.perSeatSession * term.weeks), { est: true });
      }
    }

    /* THE FIVE STAGES, NONE OF THEM TICKED — for the same reason as the ones on the ordinary form below, and a waiting list nobody has joined is not a special case. § */
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
      /* ---------- `Hours a week` WAS THE THIRD ROW TO SAY THE SAME THING § */
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
      /* AN UNANSWERED ROW SHOWS A DASH, the same as one on the unpriced card — see `stepRows_`. § */
      /* THE SAME DROPDOWN THE UNPRICED CARD USES. § */
      const st = asked ? bookStep_(asked) : null;
      const sel = st ? stepControl_(st) : '';
      push(r.label, plain || (asked ? '—' : ''), c.mul, c.rate, c.total,
        /* ---------- `step` IS ALWAYS THE STEP, EVEN WHEN THE ROW HAS A CONTROL § */
        /* ---------- NO WEEK HANGS OFF A PRICED ROW ANY MORE § */
        { end: gi === inGroup.length - 1, step: asked, key: r.key, sel: sel });
    });
  });

  /* ---------- AND THE COUNT OF FAMILIES IS ON BOTH DOCUMENTS NOW § */
  /* ---------- WHAT THE FORMAT ADDS, AT ITS OWN ROWS (docs/history/353) § */
  const e = L.earn || {}, share = x => money(x / (L.splitShares || 1));
  const kids = Math.max(1, Number(L.n) || 1);
  if (L.format === 'Practical') {
    const pr = bookPractical_(BOOKING.practical);
    if (pr && !e.uncosted) {
      push('Materials', kids + ' × ' + money(pr.costPerRun) + (pr.setupCost ? ' + ' + money(pr.setupCost) + ' set-up' : ''),
        e.materialsCost && e.materialsCharge !== e.materialsCost
          ? '× ' + Math.round(e.materialsCharge / e.materialsCost * 100) / 100 : '',
        '', share(e.materialsCharge));
    } else if (pr) push('Materials', 'not costed yet', '', '', '', { free: true });
  }
  if (L.format === 'Trip') {
    const tr = bookTrip_(BOOKING.trip);
    if (tr) {
      push('Tickets', kids + ' × ' + money(tr.ticketChild) + ' + ' + money(tr.ticketAdult) + ' adult',
        '', '', share(e.tickets));
      push('Travel', kids + ' × ' + money(tr.travelPerChild), '', '', share(e.travel));
    }
  }
  push('Shared by', familiesSay_(L.splitShares), '', '', '', { free: true });

  /* ---------- AND IT IS EVERY DATE AGAIN, WHICH IS THE OWNER'S CALL AND THE SECOND TIME ROUND § */
  /* ---------- AND HOW MANY OF THEM THERE ARE GOES IN THE COLUMN THAT COUNTS § */
  const dates = (L.sessionDates || []).map(d => fmtDate(d));
  push('Dates', dates.length ? dates.join(', ') : '—',
       dates.length > 1 ? '× ' + dates.length : '', '', '', { free: true, dates: true });

  /* ---------- WHERE THIS ONE IS, TOO § */
  stageRows_(null).forEach(r => rows.push(r));
  push('Status', '—', '', '', '', { free: true });
  /* ---------- THREE ROWS SAYING THE SAME NOTHING § */
  return rows;
}

/* ---------- A ROW IS ITS OWN QUESTION § */
function stepSelect_(st) {
  const opts = st.options().filter(Boolean);
  /* WHAT A LOCKED MULTI HAS TICKED — the one reason a multi reaches this function. */
  const chosen = st.multi ? (BOOKING[st.id] || []) : [];
  /* ---------- A FALLBACK HAS TO REACH THE CONTROL, NOT ONLY THE TEXT § */
  /* READ ONCE, BECAUSE TWO PLACES IN THIS FUNCTION WANT IT: the value a single-answer control opens
     on and the text a LOCKED row prints. It was inlined into the first alone, so a locked multi never
     saw it — see the note below. */
  const fb = st.fallback ? String(st.fallback() || '') : '';
  const v = st.multi ? '' : (BOOKING[st.id] || fb);

  /* ---------- A SETTLED ANSWER IS TEXT, NOT A CONTROL § */
  if (stepLocked_(st)) {
    const said = st.emails
      ? (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ')
      /* ---------- AND A LOCKED MULTI HAD NO FALLBACK EITHER § */
      : st.multi ? (chosen.join(', ') || fb)
      : (st.label_ && v ? st.label_(v) : v);   /* `v` already carries the fallback — see above */
    return `<span class="bk-set">${esc(String(said || '—'))}</span>`;
  }
  const isOn = o => norm(o) === norm(v);
  /* ---------- THE BLANK OPTION DOES NOT REPEAT AN ANSWER ON THE LIST § */
  const said = o => String(st.label_ ? st.label_(o) : o);
  const dup = !!fb && opts.some(o => norm(said(o)) === norm(fb));
  /* DISABLED, NOT ABSENT. The row keeps its height, its label and its answer; only the pointer
     changes. A form whose rows come and go cannot be learnt. */
  const off = stepLocked_(st);
  /* AN OPTION THAT CANNOT BE TAKEN IS DRAWN AND DISABLED, its reason beside its name — see `off` on
     the tutor step. The one already chosen is left pressable, so the row can show it. */
  const noOf = o => st.off ? String(st.off(o) || '') : '';
  const words = o => said(o) + (noOf(o) ? ' · ' + noOf(o) : '');
  const blank = dup ? '\u2014' : (fb || '\u2014');
  const sel = `<select class="bk-sel" id="${bkCtl_(st.id)}" data-do="book-set" data-step="${esc(st.id)}"
      ${off ? 'disabled' : ''} aria-label="${esc(st.label)}">
    <option value=""${!v || !opts.some(isOn) ? ' selected' : ''}>${esc(blank)}</option>
    ${opts.map(o => `<option value="${esc(o)}"${isOn(o) ? ' selected' : ''}${
        noOf(o) && !isOn(o) ? ' disabled' : ''}>${esc(words(o))}</option>`).join('')}
  </select>`;
  /* ---------- AN ANSWER TOLD APART BY ITS END IS DRAWN IN WORDS, WITH THE SELECT LAID OVER THEM § */
  if (!st.wrap) return sel;
  const picked = opts.filter(isOn).pop();
  return `<span class="bk-face"><span class="bk-said" aria-hidden="true">${
    esc(picked !== undefined ? words(picked) : blank)}</span>${sel}</span>`;
}

/* ---------- THE NOTE IS A ROW LIKE THE REST § */
function noteRow_() {
  return { n: '', k: 'Note', v: '', mul: '', rate: '', total: '', step: '',
    ctl: bkCtl_('note'),
    sel: `<input class="bk-in bk-in-l" id="${bkCtl_('note')}" type="text" data-do="book-note"
      value="${esc(BOOKING.note || '')}" placeholder="anything else we should know"
      aria-label="Anything else we should know">` };
}

/* ---------- TYPING INTO A ROW § */
function stepInput_(st) {
  const v = (BOOKING[st.id] || []).filter(x => String(x).trim()).join(', ');
  /* `readonly`, NOT `disabled`. A locked text box should still be readable and selectable — somebody
     joining a class may well want to copy the addresses already on it. */
  /* THE ADDRESSES AS TYPED ARE A DRAFT of their own (data.js; 317) until `change` makes them answers — typed and reloaded before leaving the box, they were not in § */
  return `<input class="bk-in" id="${bkCtl_(st.id)}" type="text" data-do="book-emails" data-step="${esc(st.id)}"
    value="${esc(draftVal_('book', 'emails:' + st.id, v))}"${draftAttr_('book', 'emails:' + st.id, v)} placeholder="—" aria-label="${esc(st.label)}"
    ${stepLocked_(st) ? 'readonly' : ''} autocomplete="off" spellcheck="false">`;
}

/* ---------- PICKING SEVERAL ANSWERS WAS FOUR TAPS FOR TWO SUBJECTS § */
function stepMulti_(st) {
  const chosen = BOOKING[st.id] || [];
  const fb = st.fallback ? String(st.fallback() || '') : '';
  const said = chosen.join(', ') || fb;
  /* `aria-expanded` AND `aria-controls`, which is the disclosure pattern every screen reader knows:
     the button says whether its list is open and which element that list is. */
  return `<button type="button" class="bk-sel bk-many${said ? '' : ' is-unset'}" id="${bkCtl_(st.id)}"
    data-do="book-many" data-step="${esc(st.id)}" aria-controls="bk-many-${esc(st.id)}"
    aria-expanded="${manyOpen_(st) ? 'true' : 'false'}"
    aria-label="${esc(st.label)}">${esc(said || '—')}</button>`;
}

/* WHICH QUESTION'S LIST IS OPEN. § */
function manyOpen_(st) {
  if (!st || BOOKING.picking !== st.id) return false;
  if (stepLocked_(st)) { BOOKING.picking = ''; return false; }
  return true;
}

/* ---------- THE LIST, UNDER ITS ROW § */
function stepManyList_(st) {
  if (!manyOpen_(st)) return '';
  let opts = [];
  try { opts = (st.options() || []).filter(Boolean); } catch (e) {}
  const chosen = BOOKING[st.id] || [];
  const on = o => chosen.some(c => norm(c) === norm(o));
  return `<div class="bk-many-list many-list" id="bk-many-${esc(st.id)}" role="group"
      aria-label="${esc(st.label)}">${opts.length ? opts.map(o => `<label class="check many-opt">
        <input type="checkbox" data-do="book-many-pick" data-step="${esc(st.id)}" value="${esc(o)}"${
        on(o) ? ' checked' : ''}><span class="box"></span><span>${esc(st.label_ ? st.label_(o) : o)}</span></label>`).join('')
      : '<p class="muted">Nothing to choose here yet.</p>'}</div>`;
}

/* ON THE SCREEN YOU ARE ON, ON THE PAGE IN FRONT OF YOU. § */
function dropOnFront_(row) {
  const host = row.closest('.screen');
  if (!host || host.id !== 's-' + AT) return false;
  /* WHICH PAGE, OFF `PAGE` RATHER THAN OFF `.page.on`. § */
  const page = row.closest('.page');
  if (page) {
    const kids = host.querySelectorAll(':scope > .page');
    const pos = Array.prototype.indexOf.call(kids, page);
    const p = typeof logIndex_ === 'function' ? logIndex_(AT, pos) : pos;
    if (p !== (PAGE[AT] || 0)) return false;
  }
  return true;
}

/* ---------- THE ROW'S LABEL IS THE ROW'S CONTROL'S LABEL § */
const bkCtl_ = id => 'bk-ctl-' + String(id || '').replace(/[^\w-]/g, '');
document.addEventListener('click', e => {
  if (e.defaultPrevented) return;
  const lab = e.target && e.target.closest && e.target.closest('label.bk-k[for]');
  const sel = lab && lab.control;
  if (!sel || sel.tagName !== 'SELECT' || sel.disabled || typeof sel.showPicker !== 'function') return;
  try { sel.showPicker(); } catch (err) { /* not rendered, or no activation: the label's focus stands */ }
});

on('book-many', el => {
  const st = bookStep_(el.dataset.step);
  if (!st || stepLocked_(st)) return;
  /* PRESSING THE OPEN ONE SHUTS IT, which is what every disclosure does; pressing another moves the
     one open list there, so the card never carries two. */
  BOOKING.picking = BOOKING.picking === st.id ? '' : st.id;
  drawBooker();
  if (BOOKING.picking) bookManyShow_(st.id);
});

/* ---------- AND THE LIST JUST OPENED IS BROUGHT ONTO THE SCREEN § */
function tickListShow_(find, still) {
  const fit = () => {
    const got = find();
    const list = got && got.list, head = (got && got.head) || list;
    const pane = list && list.closest('.pane');
    if (!pane || (still && !still()) || pane.scrollHeight <= pane.clientHeight) return;
    const pr = pane.getBoundingClientRect(), lr = list.getBoundingClientRect(), hr = head.getBoundingClientRect();
    const by = Math.min(lr.bottom - pr.bottom + 8, hr.top - pr.top - 8);
    if (by > 1) pane.scrollTop += by;
  };
  setTimeout(fit, 120);
  setTimeout(fit, 420);
}
function bookManyShow_(id) {
  tickListShow_(() => {
    const ctl = document.getElementById(bkCtl_(id));
    return { list: $('bk-many-' + id), head: ctl && ctl.closest('.bk-row') };
  }, () => BOOKING.picking === id);
}

/* A BOX TICKED OR UNTICKED. § */
on('book-many-pick', el => {
  const st = bookStep_(el.dataset.step);
  if (!st || stepLocked_(st)) return;
  const v = el.value;
  const has = (BOOKING[st.id] || []).some(x => norm(x) === norm(v));
  if (has !== !!el.checked) bookToggle_(st, v);
  drawBooker();
});

/* EVERY `<select>` IS THE PLATFORM'S OWN AGAIN THE OWNER, 9 OCTOBER: § */

/* ---------- ELEVEN HOURS, SAID ONCE § */
function slotHead_(hours) {
  return `<div class="slot-row slot-head" aria-hidden="true">
    <span class="slot-day"></span>
    <div class="slot-hours">
      ${hours.map(h => `<span class="slot-hh">${h}</span>`).join('')}
    </div>
  </div>`;
}

/* ---------- AND THE WEEK ROUND IT, BECAUSE THERE WERE THREE OF THESE § */
/* ---------- THE WEEK AS SEVEN ROWS OF THE CARD, NOT ONE BLOCK UNDER ONE ROW § */
function weekRows_(days, cell, opts) {
  const o = opts || {};
  const cols = ((days[0] || {}).hours || []).map(h => (typeof h === 'object' ? h.h : h));
  return days.map((d, i) => ({
    n: '', k: String(d.label), v: '',
    /* ---------- HOW MANY HOURS THAT DAY IS, IN THE COLUMN THAT MULTIPLIES § */
    mul: d.mul ? '\u00d7 ' + d.mul : '', rate: '', total: '',
    /* THE STEP EVERY ONE OF THESE ROWS BELONGS TO. `bookBreakdown` matches a price line to its
       question on `id`, and seven rows answering one question all carry the same one. */
    id: o.id || '',
    /* ---------- THE ANSWER IS DRAWN, NOT WRITTEN § */
    /* ---------- AND A TEN-COLUMN STRIP HAS NO ROOM TO LETTER EVERY COLUMN § */
    strip: (i === 0 ? (o.ruler
              ? '<span class="wk-hh wk-rule" aria-hidden="true">'
                + esc(String(cols[0])) + ' \u2013 ' + esc(String(cols[cols.length - 1])) + '</span>'
              : '<span class="wk-hh" aria-hidden="true">'
                + cols.map(h => '<span class="slot-hh">' + esc(String(h)) + '</span>').join('')
                + '</span>') : '')
      + '<span class="slot-hours">' + d.hours.map(h => cell(h, d)).join('') + '</span>',
    /* A DAY WITH NOTHING OPEN COLLAPSES. § */
    shut: !!d.shut,
    off: !!o.off,
    /* ---------- ONE SENTENCE, UNDER THE LAST DAY § */
    say: (i === days.length - 1 && o.say) ? { text: String(o.say), warn: false } : null,
  }));
}

/* `o.chars` IS HOW MUCH OF A DAY'S NAME TO PRINT — two by default, for the reason under it. The
   settings card has the room for three (`Mon`, `Tue`) and reads better with them; see `availGrid_`. */
function weekGrid_(days, cell, o) {
  o = o || {};
  const chars = o.chars || 2;
  const cols = ((days[0] || {}).hours || []).map(h => (typeof h === 'object' ? h.h : h));
  return `<div class="slot-grid">
    ${slotHead_(cols)}
    ${/* ---------- NO DAY HERE COLLAPSES ANY MORE, SO THIS NO LONGER DRAWS ONE § */
          ''}
    ${days.map(d => `<div class="slot-row">
      ${/* TWO LETTERS. Three cost 14px of a row where every pixel is a cell’s width — and Mo/Tu/
            We/Th/Fr/Sa/Su reads as fast as MON/TUE at a third of the room. One letter would not:
            T and S are each two days. */''}
      <span class="slot-day">${esc(String(d.label).slice(0, chars))}</span>
      <div class="slot-hours">${d.hours.map(h => cell(h, d)).join('')}</div>
    </div>`).join('')}
  </div>`;
}

/* ---------- THE WAITING LIST'S WEEK, IN BLOCKS § */
function blockWeekRows_() {
  const on = BOOKING.avail || [];
  /* ---------- `is-blocks` HAS GONE AND `blk` HAS NOT § */
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
        ${/* THE PHRASE ITSELF, not a code. § */
              ''}
        data-do="book-block" data-when="${esc(phrase)}"></button>`;
    },
    { id: 'avail' });
}

/* ---------- THE WEEK, ON THE PAPER § */
function stepWeekRows_(st) {
  /* ---------- ALWAYS DRAWN § */
  if (!st.grid) return [];

  /* ---------- ONE WEEK ON THE CARD, AND WHICH ONE DEPENDS ON THE BRANCH § */
  if (st.grid === 'blocks') return isWaiting_() ? blockWeekRows_() : [];
  if (isWaiting_()) return [];

  const g = slotGrid();
  const on = BOOKING.slots || [];
  const off = stepLocked_(st);
  /* `g.days`, NOT `g.rows`: § */
  return weekRows_(
    g.days.map(r => ({ label: r.label, hours: r.hours, shut: !r.hours.some(h => h.open),
                       /* THE TICKS THEMSELVES, counted where they are read. */
                       mul: r.hours.filter(h => on.indexOf(h.code) !== -1).length })),
    (h, d) => `<button class="hr${on.indexOf(h.code) !== -1 ? ' on' : ''}${
      (h.open && !off) ? '' : ' shut'}" ${(h.open && !off) ? '' : 'disabled'}
      ${/* THE REASON, not just "not available". An hour the tutor never works and an hour they are
            already teaching are the same grey box, and only the second is worth trying a different
            week for. */''}
      title="${h.h}:00${h.open ? '' : ' — ' + esc(h.why || 'not available')}"
      ${/* THE NAME THE CELL USED TO CARRY AS TEXT. § */
            ''}
      aria-label="${esc(d.label)} ${h.h}:00${h.open ? '' : ', ' + esc(h.why || 'not available')}"
      data-do="book-slot" data-code="${esc(h.code)}"></button>`,
    { id: st.id, off: off, ruler: true,
      /* ---------- A WEEK NOBODY IS FREE FOR IS STILL DRAWN § */
      say: g.anyOpen ? '' : g.why });
}

/* Which steps open something under their row rather than answering in it. */
/* ---------- A FIELD THAT CANNOT BE ANSWERED IS SHOWN, NOT REMOVED § */
const FIXED_BY_CLASS = ['subjects', 'level', 'loc', 'n'];

function stepLocked_(st) {
  if (joinedJob_() && FIXED_BY_CLASS.indexOf(st.id) !== -1) return true;
  try { return !(st.grid || st.emails || st.options().filter(Boolean).length); }
  catch (e) { return true; }
}

/* The control a row carries. § */
function stepControl_(st) {
  if (st.grid) return '';
  if (st.emails) return stepInput_(st);
  /* A QUESTION TAKING SEVERAL ANSWERS OPENS A LIST OF CHECKBOXES UNDER ITS ROW — see `stepMulti_`. A
     locked one has nothing to open, so it falls through to the text `stepSelect_` draws for a
     settled answer. */
  if (st.multi && !stepLocked_(st)) return stepMulti_(st);
  return stepSelect_(st);
}

/* ---------- EVERY QUESTION AS A ROW, ANSWERED OR NOT § */
/* WHICH OF THE FORM'S TWO BRANCHES THIS IS, in one place. § */
/* AND THE FORMAT, ON AN INSTANT CLASS (docs/history/353): § */
function bookOn_() { return isWaiting_() ? 'wait' : 'book, ' + norm(bookFormat_(BOOKING.format)); }
/* THE TRIP'S SEAT CAP, or nought for none — `n` offers no more and refuses more. */
function tripCap_() {
  if (isWaiting_() || bookFormat_(BOOKING.format) !== 'Trip') return 0;
  const t = bookTrip_(BOOKING.trip);
  return t && Number(t.maxChildren) > 0 ? Number(t.maxChildren) : 0;
}

function stepRows_() {
  let line = 0;
  /* ONE FILTER, AND IT IS NOT ABOUT WHETHER A QUESTION CAN BE ANSWERED YET — see `stepLocked_` for why a question with nothing to offer is greyed rather than § */
  const on = bookOn_();
  return BOOK_STEPS
    .filter(st => onlyHas_(st.only, on))
    /* ---------- ONE STEP IS NOT ALWAYS ONE ROW § */
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
        /* ---------- THE WHOLE RUN, NOT ITS START § */
        ? bookRuns().map(r => r.dayName + ' ' + r.hour + ':00–' + (r.hour + r.hours) + ':00')
            .join(', ')
        /* A MULTI WITH NOTHING TICKED FALLS BACK LIKE ANY OTHER STEP. § */
        : st.multi ? ((v || []).join(', ') || (st.fallback ? st.fallback() : ''))
        /* ---------- A QUESTION WITH AN OBVIOUS ANSWER SHOWS IT § */
        : (st.label_ ? st.label_(v) : (v || (st.fallback ? st.fallback() : '')));
      return [{ n: String(++line).padStart(3, '0'),
               k: st.short || st.id,
               /* AN EM DASH, NOT AN EMPTY CELL. A blank looks like a row that failed to draw; a
                  dash looks like a blank somebody is expected to fill, which is what it is. */
               v: String(text || '—'),
               mul: '', rate: '', total: '',
               /* THE STEP THIS ROW STANDS FOR. § */
               id: st.id,
               sel: stepControl_(st),
               /* THE CONTROL THE ROW'S LABEL IS FOR — see `bkCtl_`. Only when one was drawn: a locked
                  row is text and a grid row has none, and a `for` naming nothing is a label that lies. */
               ctl: st.grid ? '' : st.emails || !stepLocked_(st) ? bkCtl_(st.id) : '',
               /* THE LIST OF CHECKBOXES UNDER A SEVERAL-OF-A-LIST ROW, when it is the one open —
                  see `stepManyList_`. Markup, like `sel`, and drawn by `receiptRow` after the row. */
               many: st.multi && !st.grid ? stepManyList_(st) : '',
               /* ---------- `why` WAS WRITTEN OUT ON FOUR STEPS AND DRAWN NOWHERE § */
               /* ---------- AND THE ASIDES ARE GONE, WHICH IS THE THIRD TIME OF ASKING § */
               say: (() => {
                 /* ---------- NOTHING IS SAID ABOUT AN ANSWER NOBODY HAS GIVEN § */
                 const answered = st.multi ? (v || []).length
                   : String(v == null ? '' : v).trim() !== '';
                 /* ---------- AND NOTHING IS SAID ABOUT A QUESTION THIS BRANCH CANNOT ASK § */
                 if (!answered || stepLocked_(st)) return null;
                 const w = st.why ? String(st.why(v) || '') : '';
                 return w ? { text: w, warn: true } : null;
               })() }];
    });
}

/* `BOOK_ROWS` STOOD HERE and it was a list the card kept for something else to read. § */

/* THE SPINE — ONE ROW LIST, TWO DOCUMENTS. § */
/* ---------- THE FORM IS THE ARCHETYPE, SO THE FORM IS WHERE THIS COMES FROM § */
/* ---------- FOUR LABELS WERE TOO LONG FOR THEIR OWN COLUMN § */
/* ---------- `only` — WHICH DOCUMENT CAN EVER FILL THIS ROW § */
/* WHERE A BOOKING HAS GOT TO, AS FIVE TICKS RATHER THAN ONE SENTENCE. § */
/* ---------- AND EVERY TICK CARRIES THE DAY IT HAPPENED § */
const JOB_STAGES = [
  /* THE ROW EXISTS, SO IT WAS ASKED FOR. § */
  { row: 'Requested', is: j => true,
    when: j => S_(j.createdAt) || evAt_(j, 'Request', 1) },
  /* ---------- PUT TO A TUTOR, WHICH FOR MOST BOOKINGS IS THE SAME MOMENT AS THE ASKING § */
  { row: 'Applied for', is: j => true,
    when: j => evAt_(j, 'Apply', 1) || S_(j.createdAt) || evAt_(j, 'Request', 1) },
  /* THE BUSINESS HAS SAID YES. § */
  { row: 'Accepted',  is: j => jobAccepted_(j),
    when: j => evAt_(j, 'Accept', -1) },
  /* MONEY HAS MOVED. A seat at `Booked` is the machine's own record of a payment — `jobStage_` reads the same seats to decide which of the four documents this is § */
  { row: 'Paid',      is: j => jobStage_(j) === 'receipt',
    when: j => evAt_(j, 'Confirm', paidNeeds_(j)) },
  /* THE FIRST PLANNED SESSION IS IN THE PAST. § */
  { row: 'Started',   is: j => datePassed_(j.startDate), when: j => S_(j.startDate) },
  { row: 'Completed', is: j => datePassed_(j.endDate),   when: j => S_(j.endDate) },
];

/* THE nTH EVENT OF A KIND, AND `-1` IS THE LAST. § */
function evAt_(j, action, n) {
  const all = (j && j.events || []).filter(e => norm(e && e.action) === norm(action));
  if (!all.length) return '';
  const e = n === -1 ? all[all.length - 1] : all[n - 1];
  return e ? S_(e.at) : '';
}

/* HOW MANY BOOKED SEATS `jobStage_` IS WAITING FOR — one on a session, the whole house on a waiting list. § */
function paidNeeds_(j) {
  return norm(j && j.kind) === 'waitlist' ? seatsOf_(j) : 1;
}

/* HAS THIS DAY BEEN AND GONE. § */
function datePassed_(v) {
  const d = parseDMY(v);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d <= today;
}

/* ONE BUILDER, BOTH DOCUMENTS — which is the whole of what stops them drifting, the same argument `weekRows_` makes for the three week grids. § */
function stageRows_(j) {
  let on = true;
  return JOB_STAGES.map(st => {
    /* THE CHAIN. Once one is unticked, nothing below it can be — see the note above. `on` carries
       that down the list rather than each test repeating the ones before it. */
    on = on && !!j && !!st.is(j);
    /* ---------- ONE DATE FORMAT FOR THE FIVE, DECIDED HERE AND NOT IN FIVE PLACES § */
    const at = on && st.when ? st.when(j) : '';
    return { n: '', k: st.row, v: (at && fmtDate(at)) || '',
             mul: '', rate: '', total: '', free: true, tick: on };
  });
}

const SPINE_EXTRA = [
  /* THE FORMAT'S PRICE LINES, on the question that caused them (docs/history/353). */
  { after: 'Practical', row: 'Materials', only: 'practical' },
  { after: 'Trip',      row: 'Tickets',   only: 'trip' },
  { after: 'Trip',      row: 'Travel',    only: 'trip' },
  { after: 'Subject', row: 'Extra subj.' },
  { after: 'When',    row: 'Per session', only: 'wait' },
  /* `Sharing` IS PUSHED BY `jobRows` AND BY NOTHING ELSE — measured, one push in this file. The
     form asks the question as `Split` and names the answer there. */
  { after: 'Split',   row: 'Sharing',     only: 'receipt' },
  /* ---------- THE TALLY OF EVERYBODY'S ANSWER TO `When free`, UNDER THAT QUESTION § */
  { after: 'When free', row: 'Can come',  only: 'receipt' },
  /* ---------- PINNED TO THE FOOT RATHER THAN TO WHICHEVER QUESTION IS LAST § */
  { after: '',        row: 'About',     only: 'wait' },
  { after: '',        row: 'Dates' },
  { after: '',        row: 'Note' },
  /* THE TWO WAITING-LIST ROWS. § */
  { after: '',        row: 'A seat',    only: 'wait' },
  /* ---------- `Shared by` BELONGS TO THE FORM, ON BOTH ITS BRANCHES § */
  { after: '',        row: 'Shared by', only: 'book, wait' },
  /* LAST, ALWAYS. Where a booking has got to is the closing of the document, after everything it is about — which is where a receipt puts it and where the form now § */
  ...JOB_STAGES.map(st => ({ after: '', row: st.row, tick: true })),
  { after: '',        row: 'Status' },
];

const SPINE = (() => {
  const out = [];
  const tail = SPINE_EXTRA.filter(x => !x.after).map(x => x.row);
  BOOK_STEPS.forEach(st => {
    if (!st.short) return;
    /* ---------- A WEEK STEP IS SEVEN ROWS AND THEY ARE THE SAME SEVEN ON BOTH BRANCHES § */
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
/* `Total: ''` DROPS THE ROW. § */
/* `Extra subjects` → `Extra subj.` WAS THE ONE SHORTENING THAT NEVER REACHED ITS PUSH SITE. § */
/* `Students` → `Extra seats`, WHICH MOVED WITH THE STEP'S OWN `short`. § */
const SPINE_ALIAS = { Students: 'Extra seats', Host: 'Space', Total: '',
                      'Extra subjects': 'Extra subj.' };

/* One row name to the one document that can fill it, read off the two lists that declare rows so there is no third one to keep in step. § */
/* WHICH DOCUMENTS A FLAG NAMES, READ THE SAME WAY BY BOTH READERS. § */
function onlyHas_(only, on) {
  if (!only || !on) return true;
  const want = String(only).split(',').map(x => x.trim()).filter(Boolean);
  return String(on).split(',').map(x => x.trim()).some(o => want.indexOf(o) !== -1);
}

const ONLY_ON = (() => {
  const m = {};
  SPINE_EXTRA.forEach(x => { if (x.only) m[x.row] = x.only; });
  BOOK_STEPS.forEach(st => { if (st.only && st.short) m[st.short] = st.only; });
  return m;
})();

/* ---------- AND WHICH SPINE ROWS ARE A TICK RATHER THAN A VALUE § */
const TICK_ROW = (() => {
  const m = {};
  SPINE_EXTRA.forEach(x => { if (x.tick) m[x.row] = true; });
  return m;
})();

/* ---------- PUT ROWS IN SPINE ORDER, AND FILL WHAT IS MISSING § */
/* ---------- AND ONE OF THE TWO DOCUMENTS DOES NOT WANT THE DASHES § */
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
  /* WHICH DOCUMENT IS ASKING. § */
  const on = (opts && opts.on) || '';
  /* ---------- AND A ROW WHOSE FIGURES WENT ONTO A QUESTION IS NOT A ROW TO INVENT § */
  const gone = (opts && opts.said) || {};
  const out = SPINE.map(k => (say[k] || (fill && !gone[k]
    && onlyHas_(ONLY_ON[k], on) ? {
    /* `blank` MARKS A ROW THE SPINE ADDED because neither document had one — it holds its place in the sequence and takes half the height of a row with something in § */
    n: '', k: k, v: TICK_ROW[k] ? '' : '—', mul: '', rate: '', total: '', free: true,
    faint: !TICK_ROW[k], blank: !TICK_ROW[k], tick: TICK_ROW[k] ? false : undefined,
  } : null))).filter(Boolean);
  return out.concat(extra);
}

function bookBreakdown(L, foot) {
  /* ---------- THE TWO PHOTOGRAPHS ARE GONE § */
  /* `L` IS NULL UNTIL ENOUGH IS ANSWERED TO COST IT — no subjects, or no venue on a shared class. § */

  const venueName = BOOKING.loc || 'No venue yet';
  const now = new Date();
  const when = fmtDate(now) + ' ' + String(now.getHours()).padStart(2, '0')
    + ':' + String(now.getMinutes()).padStart(2, '0');

  /* ---------- ONE LIST, AND IT IS THE FORM § */
  const steps = stepRows_();
  /* A CHILD'S FORM HAS THE QUESTIONS AND NO FIGURES (398) — no priced rows, no figure columns, no total. */
  const kid = childView_();
  const priced = L && !kid ? breakdownRows(L) : [];

  /* ---------- WHICH PRICED LINES BELONG TO A QUESTION § */
  /* ONE RULE, ASKED TWICE. § */
  /* ---------- THE BASE LINE MERGES ONTO THE TUTOR ROW LIKE EVERY OTHER PRICED LINE § */
  const ownRow = r => true;

  /* ---------- THE BASE LINE SAID THE TUTOR'S NAME, AND SO DID THE TUTOR ROW § */
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

  /* WHAT THE QUESTIONS ALREADY SAY, both by name and by which step they stand for. § */
  const said = {};
  const mine = {};
  steps.forEach(r => { said[norm(r.k)] = true; mine[r.id] = true; });

  /* ---------- A CONSEQUENCE SITS UNDER THE ANSWER THAT CAUSED IT § */
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

  /* THE SPINE APPLIED AS THE LIST IS BUILT, not to a `const` afterwards — which is what the last version did, and `Assignment to constant variable` took the whole § */
  /* `on` SAYS WHICH OF THE FORM'S TWO BRANCHES THIS IS, so the other one's rows are not invented as dashes — see the note over `SPINE_EXTRA`. § */
  /* ---------- A DAY THE WEEK LEFT OUT IS NOT A DAY TO INVENT § */
  const weekDrew = steps.filter(r => r.strip).map(r => r.k);
  const weekLeft = {};
  if (weekDrew.length) SLOT_DAYS.forEach(([, label]) => { if (weekDrew.indexOf(label) === -1) weekLeft[label] = true; });
  const rows = spineRows_(body
    .concat(leftover.filter(p => !placed[p.key]))
    .concat([noteRow_()]), { on: bookOn_(), said: Object.assign({}, merged, weekLeft) });
  /* ---------- THE PICTURE IS DRAWN FROM THIS LIST, NOT FROM ITS OWN § */
  /* ---------- ONE SEQUENCE OF LINE NUMBERS, COUNTED AFTER THE MERGE § */
  let seq = 0;
  rows.forEach(r => { if (r.n !== '') r.n = String(++seq).padStart(3, '0'); });

  const out = rows.map(receiptRow);

  return receiptHtml({
    /* ---------- THE HEAD SAID WHAT THE ROWS SAY § */
    lines: [],
    /* WHO, so `breakdownRows` can put it at the top — the admin may have changed it, so it is read
       from the booking rather than assumed to be whoever is looking. */
    client: BOOKING.client || (USER && USER.name) || '',
    /* DRAW THE COLUMN HEADER. § */
    cols: !kid,
    rows: out,
    noTotal: kid,
    /* ---------- £0.00 IS NOT A PRICE, IT IS AN ANSWER NOBODY GAVE § */
    total: (L && L.total > 0) ? money(L.total) : '—',
    /* AN ADMIN'S DISCOUNT LINE, DIRECTLY ABOVE COST — `discountRow_`; nothing for anybody else. */
    before: discountRow_(L),
    /* AN ADMIN'S TWO MORE ROWS, AND THE TOTAL'S LABEL SAYING WHOSE FIGURE IT IS — `formMoney_`. */
    totalLabel: costLabel_(L) || undefined,
    more: formMoney_(L).more,
    /* THE ONE SENTENCE UNDER A NEGATIVE NET — an admin's, from the same `formMoney_`. */
    moreSay: formMoney_(L).say || '',
    /* PASSED STRAIGHT THROUGH. The actions are built where the rest of the booking's wording is —
       see `drawBooker_` — and printed where a receipt's footer goes. */
    foot: foot || '',
    /* `aside` WAS HERE — "36 sessions", beside the figure on the total bar. § */
    /* ---------- THE ROSTER IS NOT ON EITHER DOCUMENT § */
    /* ---------- THE SKIN WAS ONE WORD HERE, AND NOW THERE IS NO WORD § */
  });
}

/* THE RECEIPT ITSELF — paper, head, columns, rows, total, barcode. § */
/* ---------- THE ROSTER § */
/* THE TWO FACES: the room and the person. § */
/* `facesOf_` WENT TOO — it looked up the venue and tutor photographs, and the last thing wanting
   them was the pair of grey squares at the top of the shared picture, removed earlier tonight. */




function rosterHtml(o) {
  const tutor = o.tutor || '';
  const seats = Math.max(0, Number(o.seats) || 0);
  const names = (o.names || []).filter(Boolean);

  const slots = [];
  slots.push({ role: 'Tutor', name: tutor, filled: !!tutor, tutor: true });
  for (let i = 0; i < seats; i++) {
    /* A SEAT SOMEBODY HAS PAID FOR IS TAKEN, whether or not it has a name on it. § */
    /* NAMED IF WE KNOW, "Child" IF WE DO NOT. § */
    /* "SOMEONE ELSE" IS AN ANSWER, NOT A NAME. § */
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
      ${/* ---------- AN EMPTY SEAT SAID "OPEN" TWICE § */
            ''}
      <span class="rost-name">${esc(sl.filled ? (sl.name || sl.role) : 'Open')}</span>
      ${sl.filled ? `<span class="rost-role">${esc(sl.role)}</span>` : ''}
    </div>`).join('')}
  </div>`;
}

/* `facesFor` AND `rosterPips` WENT WITH `jobCard`. § */

/* FOUR OBJECTS, NOT ONE OBJECT IN FOUR MOODS. § */
/* ---------- WHAT EACH COLUMN IS, IN ONE SMALL ROW AT THE TOP § */
function spineHead_(r) {
  if (!r || !r.cols || !(r.rows || []).length) return '';
  return `<div class="bk-row is-cols">
    <span class="bk-n"></span>
    <span class="bk-k">Q</span>
    <span class="bk-v">A</span>
    <span class="bk-m">×</span>
    <span class="bk-r">+/h</span>
    <span class="bk-t">+</span>
  </div>`;
}

function receiptHtml(r) {
  /* ---------- `kind`, `SKIN` AND `STAGE` STOOD HERE, AND ONE OF THEM WAS ALREADY DEAD § */
  /* `.is-done` STAYS, and it is not a skin. It marks the SAVED document so the hour grid tightens —
     a record does not need rows you can press — which is a layout, not a colour. */
  const done = r.done ? ' is-done' : '';
  return `<div class="rc${done}">
    <div class="rc-head">
      ${/* ---------- THE SHOP NAME WAS FOR A RECEIPT, AND THIS IS NOT ONE ANY MORE § */
            ''}
      ${/* THE THREE LINES ON ONE LINE. § */
           ''}
      ${(r.lines || []).filter(Boolean).length
        ? `<p>${(r.lines || []).filter(Boolean).map(esc).join(' · ')}</p>` : ''}
    </div>
    ${/* `r.photos` WAS HERE. Nothing passes photos to a receipt any more — see `bookBreakdown`. */''}
    ${/* ---------- AND THE RULE ABOVE THE ROWS IS THE HEADER'S OWN § */
         ''}
    ${spineHead_(r) ? '' : '<div class="rc-rule"></div>'}
    ${/* THE OLD COLUMN HEADINGS ARE STILL GONE, and `spineHead_` is not them. § */
         ''}
    ${/* ---------- THE TOTAL IS A ROW OF THE TABLE NOW, NOT A BAR BESIDE IT § */
         ''}
    ${/* ---------- `r.more`: WHO GETS WHAT, FOR THE ONE PERSON ALLOWED TO KNOW § */
         ''}
    <div class="bk">${spineHead_(r)}${(r.rows || []).join('')}${r.before || ''}${r.noTotal ? '' : `<div class="bk-row rc-total">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(r.totalLabel || 'Cost')}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r"></span>
      <span class="bk-t">${esc(r.total || '')}</span>
    </div>`}${(r.more || []).map(m => `<div class="bk-row rc-total rc-more${m.cls ? ' ' + esc(m.cls) : ''}">
      <span class="bk-n"></span>
      <span class="bk-k">${esc(m.k)}</span>
      <span class="bk-v"></span>
      <span class="bk-m"></span>
      <span class="bk-r"></span>
      <span class="bk-t">${esc(m.t)}</span>
    </div>`).join('')}${r.moreSay ? `<p class="bk-say rc-money-say">${esc(r.moreSay)}</p>` : ''}</div>
    ${/* THE ROSTER SLOT IS STILL HERE and nothing fills it — see the notes above. § */
          ''}
    ${r.roster ? `<div class="rc-rule"></div>${r.roster}` : ''}
    <div class="rc-rule"></div>
    ${/* ---------- WHAT YOU DO WITH IT, ON IT § */
          ''}
    ${r.foot || ''}
    ${/* THE BARCODE WAS HERE. § */
          ''}
    ${/* THE FOOTER LINE IS DRAWN ONLY IF THERE IS ONE. § */
          ''}
    ${/* THE REFERENCE, WHEN THERE IS ONE. § */
          ''}
    ${r.ref ? `<p class="rc-ref">${esc(r.ref)}</p>` : ''}
  </div>`;
}

/** One row of a receipt, from the shape `breakdownRows` and `jobRows` both produce. */
function receiptRow(r) {
  /* `wide` — A TITLE IS NOT A VALUE. § */
  const cls = [r.blank ? 'is-blank' : '',
               r.day ? 'bk-day' : '', r.end ? 'bk-end' : '', r.free ? 'bk-free' : '',
               r.wide ? 'is-wide' : '',
               /* THE WEEK'S OWN THREE. `bk-wk` lays the strip out in the answer cell, `is-shut`
                  collapses a day nobody works, `is-off` greys a week that cannot be answered. */
               r.strip ? 'bk-wk' : '', r.strip && r.shut ? 'is-shut' : '',
               r.strip && r.off ? 'is-off' : '',
               /* AND THE LIST'S TALLY, whose bars take the empty figure tracks — see `.bk-tally`. */
               r.tally ? 'bk-tally' : '', r.cls || '']
    .filter(Boolean).join(' ');
  /* A DAY SHOWS ITS HOURS, drawn rather than written — the same row of boxes the picker uses, so a day on the receipt and a day in the grid are visibly the same § */
  /* A DROPDOWN WHERE THERE IS ONE, and it replaces the value rather than sitting beside it: § */
  /* ---------- A DAY'S HOURS ARE ITS ANSWER § */
  /* ---------- A STAGE IS A MARK, NOT A VALUE § */
  /* THE BOX LAST, BECAUSE `.bk-v` IS RIGHT-ALIGNED AND FIVE BOXES HAVE TO BE ONE COLUMN. § */
  const value = r.tick !== undefined
    ? `${S_(r.v) ? `<span class="bk-when">${esc(r.v)}</span> ` : ''}<span
       class="bk-tick${r.tick ? ' on' : ''}" role="img" aria-label="${
       r.tick ? 'done' : 'not yet'}">✓</span>`
    : r.strip ? r.strip
    : r.sel ? r.sel
    /* A TALLY IS MARKUP FOR `strip`'S REASON — `whenCouldHtml` draws it, and nothing else does. */
    : r.tally ? r.tally
    : r.hours
    ? `<span class="bk-hrs">${((slotGrid().rows.find(x => x.prefix === r.hours.day)
        || { hours: [] }).hours).map(h => `<span class="bk-hr${
          (BOOKING.slots || []).indexOf(h.code) !== -1 ? ' on' : ''}">${h.h}</span>`).join('')}</span>`
    : r.dates ? `<span class="bk-dates">${esc(r.v)}</span>`
    : esc(r.v);
  /* ---------- A ROW WITH NO FIGURES DOES NOT NEED THE FIGURE COLUMNS § */
  /* ---------- A QUESTION KEEPS ITS COLUMNS WHETHER OR NOT IT HAS FIGURES § */
  /* AND A DAY ROW NEVER COLLAPSES TO THE NARROW COLUMN EITHER, for the reason the grid row had it: § */
  const bare = (!r.id || !!r.open || !!r.strip) && !S_(r.mul) && !S_(r.rate) && !S_(r.total);
  /* ---------- THE ROW ABOVE A GRID IS A HEADING, NOT A FIELD § */
  /* AND A DAY ROW LOSES ITS DASHED UNDERLINE FOR THE SAME REASON THE `When` ROW DID: § */
  /* AND A TALLY'S BARS ARE ITS ANSWER IN THE SAME WAY — a dashed "an answer goes here" under a
     count of answers already given is the card advertising a blank that is full. */
  const heads = !!r.open || !!r.strip || !!r.tally;
  return `<div class="bk-row ${cls}${bare ? ' is-bare' : ''}${heads ? ' is-head' : ''}">
    <span class="bk-n">${esc(r.n)}</span>
    ${/* A ROW WITH A CONTROL LABELS IT — see `bkCtl_`. `for` before `class`, so the receipt's own
          readers that look for `class="bk-k">` find the words either way. */
      r.ctl && r.sel ? `<label for="${esc(r.ctl)}" class="bk-k">${esc(r.k)}</label>`
                     : `<span class="bk-k">${esc(r.k)}</span>`}
    <span class="bk-v">${heads && String(r.v) === '\u2014' ? '' : value}</span>
    <span class="bk-m">${esc(r.mul)}</span>
    <span class="bk-r">${esc(r.rate)}</span>
    <span class="bk-t">${esc(r.total)}</span>
    ${/* ---------- THE WEEK IS A CELL OF THIS ROW NOW, NOT A BLOCK AFTER IT § */
          ''}
    ${r.open || ''}
  </div>${r.say ? `<p class="bk-say${r.say.warn ? ' is-warn' : ''}">${esc(r.say.text)}</p>` : ''}${
    /* THE CHECKBOXES OF A SEVERAL-OF-A-LIST ROW THAT IS OPEN, under the row and the full width of the card — see `stepManyList_`. § */
    r.many || ''}`;
}

/* A SAVED JOB, AS A RECEIPT OF WHAT WAS ASKED FOR. § */
function jobRows(j) {
  const rows = [];
  let line = 0;
  const push = (k, v, total, opts) => {
    /* A ROW WITH NOTHING IN IT IS SKIPPED — a job with no tutor should not print an empty Tutor line. § */
    if ((v === '' || v == null) && !total) return;
    rows.push(Object.assign({
      n: (opts && opts.free) ? '' : String(++line).padStart(3, '0'),
      k, v: String(v), mul: '', rate: '', total: total || '',
    }, opts || {}));
  };

  push('Subject', j.subject || '');
  push('Level', j.level || '');
  /* ---------- FOUR ROWS WERE READING NAMES THE PAYLOAD HAS NEVER SENT § */
  /* ---------- AND THE COUNT IS THE EXTRAS, BECAUSE THAT IS WHAT THE FORM ASKED § */
  push('Students', seatsOf_(j) ? String(Math.max(0, seatsOf_(j) - 1)) : '');
  push('Venue', j.venue || j.location || '');
  push('Host', TRUEish_(j.clientHosts) ? 'You' : 'We book the room');
  /* ---------- SEVEN DAY ROWS WHERE THE `When` ROW WAS § */
  jobWeekRows_(j).forEach(r => rows.push(r));
  push('Per session', j.hours ? j.hours + ' hour' + (Number(j.hours) === 1 ? '' : 's') : '');
  push('Term', j.term || '');
  /* "JUST YOU" IS WRONG ON A WAITING LIST, and on an open one it is the opposite of true: § */
  /* ---------- AND ON AN OPEN SESSION IT WAS THE OPPOSITE OF TRUE TOO § */
  const going = Number(j.seatsGoing) || 0;
  const seatsFree = 'Open — ' + going + ' seat' + (going === 1 ? '' : 's') + ' free';
  push('Sharing', norm(j.kind) === 'waitlist'
    ? (going > 0 ? seatsFree : 'Full')
    : (j.splitEmails
      || (going > 0 && TRUEish_(j.openToOthers) ? seatsFree : 'Just you')));
  /* ---------- WHEN THE FAMILIES ON A LIST CAN COME, AS A LINE OF THE LIST'S OWN PAPER § */
  const wc = j.whenCould;
  if (wc && (wc.slots || []).length) {
    push('Can come', wc.slots.map(s => s.slot + ' ' + s.n + '/' + wc.people).join(', '), '',
         { free: true, tally: whenCouldHtml(j) });
  }
  /* ---------- WHEN IT RUNS, AND WHAT THE TERM WOULD COME TO § */
  if (norm(j.kind) === 'waitlist') {
    const iv = intervals_().find(x => norm(x.label || x.term) === norm(j.term)) || null;
    /* ---------- `For` MEANS THE CLIENT, AND HERE IT MEANT THE TERM § */
    /* `Running` AND `Weeks left` WERE TWO PUSHES HERE and went with the form's — see the note by the waiting-list branch above. § */
    /* AND ONLY WHERE THERE IS A PRICE. `doGet` withholds it from a tutor who is not also paying —
       see `jobMoney_` — and "6 × £0.00" would print the hole as a figure. */
    if (iv && iv.weeks && j.price && !childView_()) {
      /* "ABOUT", because the weeks are what is LEFT and nothing runs until the seats fill. A
         precise total here would be a promise the list cannot keep. */
      push('About', iv.weeks + ' × ' + money(j.price || 0), money((j.price || 0) * iv.weeks));
    }
  }

  if (j.tutor) push('Tutor', j.tutor);

  /* ---------- `dates` IS WHAT THE SERVER SENDS AND THIS ASKED FOR `sessionDates` § */
  const dates = String(j.dates || j.sessionDates || '')
    .split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  /* THE SAME EVERY-DATE LIST AS THE BOOKING CARD — see the note there. § */
  /* ---------- HOW MANY DATES IS NOT A FIGURE, AND THE FIGURE COLUMN IS SIZED FOR MONEY § */
  /* THE SAME COUNT AS THE BOOKING CARD, THROUGH `opts` BECAUSE THIS `push` HARDCODES `mul: ''`. § */
  push('Dates', dates.length ? dates.join(', ') : '—', '',
       { free: true, dates: true, mul: dates.length > 1 ? '× ' + dates.length : '' });

  /* WHAT THE MONEY DOES, for whoever is allowed to see it. § */
  if (j.price && !childView_()) push('Total', '', money(j.price), { free: true });
  /* `Tutor is paid` AND `Left over` WERE ROWS HERE. § */

  /* ---------- WHERE IT IS, AND WHERE IT IS GOING § */
  stageRows_(j).forEach(r => rows.push(r));
  push('Status', jobStatusSaid_(j), '', { free: true });
  /* THE SAME ORDER THE FORM USES, so a receipt does not reshuffle what somebody just filled in — and NOT a dash for every question this job cannot answer. § */
  return spineRows_(rows, { fill: false });
}

/** A job, on the same paper a booking is drawn on. */
/* WHICH OF THE FOUR A SAVED BOOKING IS. § */
/* ---------- THE WEEK, ON A RECEIPT, WITH THE BOOKED HOURS LIT § */
/* ---------- THE SAME SEVEN ROWS ON THE RECEIPT § */
function jobWeekRows_(j) {
  const days = String((j && j.weekday) || '').split(',').map(norm).filter(Boolean);
  const start = parseInt(String((j && (j.time || j.startTime)) || '').split(':')[0], 10);
  const hrs = Math.max(1, Number(j && (j.hours || j.hoursPerSession)) || 1);
  const hours = SLOT_HOURS;
  return weekRows_(
    SLOT_DAYS.map(([, label]) => {
      const runs = days.indexOf(norm(label)) !== -1;
      /* THE SAME FIGURE THE FORM PRINTS, off the row rather than off the ticks — a saved job holds `hours_per_session` and one span, so a day it runs on is that many § */
      return { label: label, hours: hours, on: runs, mul: runs ? hrs : 0 };
    }),
    (h, d) => {
      const lit = d.on && isFinite(start) && h >= start && h < start + hrs;
      return `<button class="hr${lit ? ' on' : ''}${lit ? '' : ' shut'}" disabled
        title="${h}:00" aria-label="${esc(d.label)} ${h}:00"></button>`;
    },
    { off: true, ruler: true });
}

/* ---------- `moneyBlock` STOOD HERE, AND THE FIGURES ARE ROWS OF THE PAPER NOW § */

/* ---------- HOW MANY SEATS A SESSION HAS § */
const seatsOf_ = j => Math.max(0, Number((j && (j.maxKids || j.maxStudents)) || 0));

/* ---------- `jobSaid_` STOOD HERE, AND THE STAGE IS FIVE TICKS NOW § */

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

/* HAS IT BEEN ACCEPTED YET — which is a different question from which of the four it is. § */
function jobAccepted_(j) {
  /* THE TWO SIDES SPEAK DIFFERENT WORDS, and reading them as one list is why this said "pending" on a session that had been accepted. § */
  const seats = j.slots || [];
  if (!seats.length) return false;
  const clientsOk = seats.every(sl => /^(agreed|paying|booked)$/i.test(String(sl.status || '')));
  /* A TUTOR IS OPTIONAL. § */
  const tutorsOk = (j.tutorSlots || []).every(sl => /^confirmed$/i.test(String(sl.status || '')));
  return clientsOk && tutorsOk;
}

/* ---------- THREE PEOPLE, THREE FIGURES, AND EACH SEES THEIR OWN § */
function jobMoney_(j) {
  const has = v => v !== '' && v != null && isFinite(Number(v));
  const say = v => has(v) ? money(Number(v)) : '—';
  if (typeof isAdmin === 'function' && isAdmin()) {
    /* A WAITING LIST'S `price` IS ONE SEAT, NOT A TOTAL — `doGet` says so beside it — so "Client pays" over it would name the per-seat figure as everything the § */
    const seat = norm(j.kind) === 'waitlist';
    return { label: seat ? 'Each seat pays' : 'Client pays', total: say(j.price),
             more: [{ k: 'Tutor earns', t: say(j.tutorPay) },
                    { k: 'Admin earns', t: say(j.adminKeeps) }] };
  }
  /* A CHILD'S SESSION HAS NO FIGURE ON IT (398) — `jobReceipt` draws no total row. */
  if (childView_()) return { label: null, total: '', more: [], none: true };
  const me = USER ? norm(USER.name) : '';
  const teaches = !!me && (norm(j.tutor) === me
    || (j.tutorSlots || []).some(t => norm(t.name) === me));
  const pays = !!me && (j.slots || []).some(sl => norm(sl.client) === me);
  if (teaches && !pays) return { label: 'You earn', total: say(j.tutorPay), more: [] };
  return { label: null, total: money(j.price || 0), more: [] };
}

/* AND THE FORM, WHILE IT IS BEING PRICED — for an admin only, and only once `priceFrom` has said what the tutor and the business would take. § */
/* ---------- AND THE MONEY BLOCK, WHICH IS THOSE TWO ROWS GROWN UP (docs/history/353) § */
/* ---------- WHAT THE JOB ROW KEEPS OF THE MONEY BLOCK § */
function bookMoneySend_(L) {
  const e = L && L.earn;
  if (!e) return {};
  const p2 = x => String(Math.round((Number(x) || 0) * 100) / 100);
  const pr = L.format === 'Practical' ? bookPractical_(BOOKING.practical) : null;
  const tr = L.format === 'Trip' ? bookTrip_(BOOKING.trip) : null;
  const out = {
    format: L.format || 'Tutoring', practicalId: pr ? pr.id : '', tripId: tr ? (tr.tripId || '') : '',
    gross: p2(e.charged), tutorPayout: p2(e.tutorPayout), venueCost: p2(e.venue),
    materialsCharge: p2(e.materialsCharge), materialsCost: p2(e.materialsCost),
    ticketsCost: p2(e.ticketsCost), cardFees: p2(e.cardFees), netProfit: p2(e.net),
  };
  if (e.discount > 0) {
    Object.assign(out, { discountType: e.discountType, discountValue: String(e.discountValue),
      discountCode: e.discountCode, discountAbsorbedBy: e.absorbedBy });
  }
  return out;
}

/* ---------- COST, WITH THE DISCOUNT SHOWN AS A SUM § */
function costLabel_(L) {
  const base = formMoney_(L).label;
  const e = L && L.earn;
  if (!e || !(e.discount > 0) || !(L.total > 0)) return base;
  const k = L.splitShares || 1;
  return (base || 'Cost') + ' · ' + money((e.charged + e.discount) / k) + ' \u2212 ' + money(e.discount / k) + ' =';
}
/* ---------- THE DISCOUNT LINE: AN ADMIN'S FORM, SO IT HAS CONTROLS, NOT TILES (docs/history/353) § */
function discountRow_(L) {
  if (!(typeof isAdmin === 'function' && isAdmin()) || isWaiting_() || !L || !L.earn) return '';
  const e = L.earn;
  const opt = (v, label, on) => `<option value="${esc(v)}"${on ? ' selected' : ''}>${esc(label)}</option>`;
  const at = f => `class="bk-${f === 'discType' || f === 'discBy' ? 'sel' : 'in'}" id="${bkCtl_(f)}" data-do="book-disc" data-field="${f}"`;
  /* ONE LINE PER THING (421): each control is its own row, label left, value right, like Level or Format. */
  const row = (cls, k, f, sel, total) => receiptRow({ n: '', k, v: '', mul: '', rate: '', total: total || '',
    cls, ctl: bkCtl_(f), sel });
  const out = [row('rc-disc', 'Discount', 'discType',
    `<select ${at('discType')} aria-label="Discount">${opt('', 'No discount', !BOOKING.discType)}${
      opt('%', '% off teaching', BOOKING.discType === '%')}${opt('£', '£ off total', BOOKING.discType === '£')}</select>`,
    e.discount > 0 ? '− ' + money(e.discount / (L.splitShares || 1)) : '—')];
  if (!BOOKING.discType) return out.join('');
  out.push(row('rc-disc-more', 'How much', 'discValue', `<input ${at('discValue')} type="number" inputmode="decimal" min="0"
      step="0.01" value="${esc(BOOKING.discValue)}" placeholder="—" aria-label="How much">`));
  out.push(row('rc-disc-more', 'Code or reason', 'discCode', `<input ${at('discCode')} type="text"
      value="${esc(BOOKING.discCode)}" placeholder="—" aria-label="Code or reason">`));
  out.push(row('rc-disc-more', 'Absorbed by', 'discBy', `<select ${at('discBy')} aria-label="Absorbed by">${
    opt('Business', 'Business', BOOKING.discBy !== 'Shared with tutor')}${
    opt('Shared with tutor', 'Shared with tutor', BOOKING.discBy === 'Shared with tutor')}</select>`));
  return out.join('');
}
/* KEPT AS IT IS TYPED, REDRAWN ON A CHANGE. § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('input[data-do="book-disc"]');
  if (!el || ['discValue', 'discCode'].indexOf(el.dataset.field) === -1) return;
  BOOKING[el.dataset.field] = String(el.value || ''); bookKeep_();
});
/* A CODE FROM THE TAB BRINGS ITS OWN TERMS. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="book-disc"]');
  if (!el || !(typeof isAdmin === 'function' && isAdmin())) return;
  const f = el.dataset.field;
  if (['discType', 'discValue', 'discCode', 'discBy'].indexOf(f) === -1) return;
  BOOKING[f] = String(el.value || '').trim();
  if (f === 'discCode') {
    const c = (DATA.promoCodes || []).find(x => norm(x.code) === norm(BOOKING.discCode));
    if (c) Object.assign(BOOKING, { discCode: c.code, discType: c.type, discValue: String(c.value), discBy: c.absorbedBy });
  }
  drawBooker();
});

function formMoney_(L) {
  if (!(typeof isAdmin === 'function' && isAdmin())) return { label: null, more: [] };
  if (!L || !(L.total > 0) || !isFinite(Number(L.tutorPay))) return { label: null, more: [] };
  const e = L.earn;
  if (!e) return { label: 'Client pays', more: [] };
  const more = [{ k: 'Charged', t: money(e.charged), cls: 'rc-money' }];
  if (e.discount > 0) {
    /* NO MINUS: `Charged` above is already the figure after it, so this says what was given and who
       gave it rather than being taken off a second time. */
    more.push({ k: 'Discount · ' + (e.absorbedBy === 'Shared with tutor' ? 'shared with tutor' : 'business'),
                t: money(e.discount), cls: 'rc-money' });
  }
  if (L.format === 'Practical') {
    /* CHARGED IN THE LABEL, COST IN THE FIGURE: the figure column is the subtraction, and the kit's cost is
       what goes out — the charge is already inside `Charged` above. */
    more.push(e.uncosted ? { k: 'Materials', t: 'not costed', cls: 'rc-money' }
      : { k: 'Materials · charged ' + money(e.materialsCharge), t: '\u2212 ' + money(e.materialsCost), cls: 'rc-money' });
  }
  if (e.venue > 0) more.push({ k: 'Venue', t: '\u2212 ' + money(e.venue), cls: 'rc-money' });
  if (L.format === 'Trip') more.push({ k: 'Tickets & travel', t: '\u2212 ' + money(e.ticketsCost), cls: 'rc-money' });
  more.push({ k: 'Tutor payout', t: '\u2212 ' + money(e.tutorPayout), cls: 'rc-money' });
  more.push({ k: 'Card fees', t: e.cardFees > 0 ? '\u2212 ' + money(e.cardFees) : money(0), cls: 'rc-money' });
  /* ROUNDED TO THE PENNY BEFORE THE SIGN IS ASKED, so a net of −0.000000001 (floating point on a one-child
     session) is £0.00 in ink rather than "−£0.00" in red with a sentence saying it costs you nothing. */
  const net = Math.round(e.net * 100) / 100;
  const pct = e.charged > 0 ? Math.round(net / e.charged * 1000) / 10 : 0;
  /* THE PERCENTAGE IN THE LABEL, THE MONEY IN THE FIGURE: one figure per figure column (421) — both at 390 ran past the card. */
  more.push({ k: 'Net profit · ' + pct + '%', t: (net < 0 ? '\u2212 ' : '') + money(Math.abs(net)),
              cls: 'rc-money rc-net' + (net < 0 ? ' is-bad' : '') });
  return { label: 'Client pays', more,
           say: net < 0 ? 'This booking costs you ' + money(-net) + '.' : '' };
}

function jobReceipt(j, foot) {
  const rows = jobRows(j);
  const pay = jobMoney_(j);
  const stage = jobStage_(j);
  return receiptHtml({
    /* ---------- THE SAME SKIN AS THE FORM, WHICH IS THE WHOLE POINT § */
    /* `done` MARKED THE SAVED DOCUMENT so the screen skin's blinking cursor could be turned off. § */
    done: true,
    stage: stage,
    /* THE JOB'S OWN KIND, WHICH IS NOT THE STAGE. § */
    was: norm(j.kind) || 'session',
    /* SO THE STAMP CAN SAY WHICH. An application that has been accepted and one that is still
       waiting are the same object at two moments, and the difference is the whole point of the
       stamp. */
    accepted: jobAccepted_(j),
    /* `location` IS WHAT THE PAYLOAD SENDS FOR A CLASS, and this read `venue` — which the jobs list uses and `clientClasses` does not. § */
    lines: [j.venue || j.location || 'No venue', j.tutor || 'No tutor yet', j.term || '']
      .filter(Boolean),
    /* AND THE RECEIPT DRAWS IT TOO. This said `Detail` where the form said `Answer`, because nothing
       on a receipt is being asked; both are `A` now and the distinction has nowhere to show. */
    cols: !pay.none,
    rows: rows.map(receiptRow),
    /* WHAT THE FIGURE IS, and it is not the same sentence at every stage. § */
    totalLabel: pay.label
      || (stage === 'application' ? 'It would come to'
        : stage === 'waitlist' ? 'Your seat'
        : 'Cost'),
    total: pay.total,
    noTotal: !!pay.none,
    more: pay.more,
    /* ---------- THE SESSION'S ACTIONS ARE PRINTED ON IT, LIKE THE FORM'S § */
    foot: foot || '',
    /* ---------- THE STATUS WORD IS NOT AN ASIDE ON THE TOTAL § */
    /* NO ROSTER HERE EITHER — see the note on the form. The chairs are `Your sessions`, one widget
       per class, which is the view that answers "who is in it". */
    ref: 'Session ' + esc(String(j.id || j.jobId || '')),
  });
}

/* ---------- ASKING TO JOIN SOMEBODY ELSE'S SESSION IS A TILE ON ITS PAPER NOW § */
/* ---------- THE STEP THAT WAS NOT THERE AT ALL § */
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
      ${childView_() ? '' : row('Per child', money(f.price))}
      ${row('Places', full ? 'Full' : f.left + ' left of ' + f.seats)}
    </div>
    ${USER
      ? (full
          ? '<p class="faint">This one is full.</p>'
          /* A PLACE IS PAID FOR, so a child asks a parent (398). */
          : childView_() ? '<p class="faint">Ask a parent to sign you up.</p>'
          : `<button class="btn" data-do="fest-join" data-id="${esc(f.id)}">Come along</button>`)
      : '<p class="faint">Sign in to come along.</p>'}
  </div>`;
}


/* ---------- WHEN THE FAMILIES ON A LIST CAN COME § */
function whenCouldHtml(j) {
  const w = j && j.whenCould;
  if (!w || !w.slots || !w.slots.length) return '';
  /* A COUNT OUT OF NOBODY IS NOT A BAR. `people` is the number of families who answered, so it is
     never below a slot's own count — but a payload that sent it blank would draw `Infinity%`. */
  const of = Math.max(1, Number(w.people) || 0);
  return `<div class="wc">${w.slots.map(s => `<div class="wc-row${s.all ? ' is-all' : ''}">
      <span class="wc-n">${esc(s.n)}/${esc(w.people)}</span>
      <span class="wc-slot">${esc(s.slot)}</span>
      <i style="--f:${Math.min(100, (Number(s.n) || 0) / of * 100).toFixed(0)}%"></i>
    </div>`).join('')}</div>`;
}

/* ---------- `joinBlock` STOOD HERE, UNDER THE PAPER, AND IT IS THREE PIECES OF THE PAPER NOW § */

/* REDRAW WITHOUT MOVING. § */
/* ---------- KEEPING THE PLACE ACROSS A REDRAW § */
function redrawBooker_(draw) {
  const before = $('bookr');
  const pane = before && before.closest('.pane');
  const was = pane ? pane.scrollTop : 0;
  const held = bookFocusOf_(before);
  draw();
  bookFocusBack_(held);
  if (!was) return;
  const after = $('bookr');
  const now = after && after.closest('.pane');
  if (!now) return;
  requestAnimationFrame(() => {
    now.scrollTop = Math.min(was, Math.max(0, now.scrollHeight - now.clientHeight));
  });
}

/* ---------- AND THE FOCUS STAYS ON WHAT WAS JUST ANSWERED § */
function bookFocusOf_(card) {
  const a = document.activeElement;
  if (!card || !a || a === document.body || !card.contains(a) || !a.dataset || !a.dataset.do) return null;
  const fine = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  const tick = a.tagName === 'INPUT' && a.type === 'checkbox';
  if (!(tick || a.tagName === 'BUTTON' || (a.tagName === 'SELECT' && fine))) return null;
  return { tag: a.tagName, data: bookDataOf_(a), value: tick ? a.value : null };
}
const bookDataOf_ = el => JSON.stringify(Object.keys(el.dataset).sort().map(k => [k, el.dataset[k]]));
function bookFocusBack_(k) {
  if (!k) return;
  const card = $('bookr');
  if (!card) return;
  const el = [...card.querySelectorAll('[data-do]')].find(x => x.tagName === k.tag && bookDataOf_(x) === k.data
    && (k.value === null || x.value === k.value));
  if (el && !el.disabled && document.activeElement !== el) { try { el.focus({ preventScroll: true }); } catch (e) {} }
}

/* BOOKING, AS A COLUMN `bookingPages_` ALREADY BUILDS THIS and has done since the form was folded into the funnel — it answers `What for · Booking`, and it § */
screen('booking', () => pages('booking', bookingPages_({ column: true })));
