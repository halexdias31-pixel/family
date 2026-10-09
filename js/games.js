/* ==================================================================================================
   @family. — games.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   games.js is number 16 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- TIMES TABLES SPRINT -----------------------------------------------------------------
   IT DESTROYED ITS OWN SCREEN ON THE FIRST LINE THAT RAN.

   `$('tt-question')` is the CONTAINER — the div holding the question, the answer box, the clock
   and the score. Setting `.textContent` on it replaced all four children with the string
   "7 × 8", so the input the next line reached for no longer existed. The question element is
   `tt-q`, one level in.

   Three more, each fatal on its own: the container was never un-hidden, so nothing would have
   shown even if it had survived; `tt-play` was un-hidden inside a parent that had just been
   hidden, which does nothing; and `endTimesTables` was called at zero seconds and has never
   existed, so the sixty-second mark threw a ReferenceError into a bare setInterval.
--------------------------------------------------------------------------------------------- */
const ttQuestion = () => ({ a: 1 + Math.floor(Math.random() * 12),
                            b: 1 + Math.floor(Math.random() * 12) });

function ttAsk() {
  ttState.cur = ttQuestion();
  const q = $('tt-q');
  if (q) q.textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
}

function startTimesTables() {
  if (!$('tt-q')) return;
  clearInterval(ttState && ttState.timer);     // a second Start must not run two clocks
  ttState = { score: 0, left: 60, cur: ttQuestion(), timer: null, asked: 0 };

  $('tt-idle')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  $('tt-question')?.classList.remove('hidden');   // the line that was missing entirely
  $('tt-score').textContent = '0';
  $('tt-time').textContent = '60';
  $('tt-feedback').textContent = '';
  ttAsk();

  const input = $('tt-answer');
  input.value = '';
  input.focus();

  ttState.timer = setInterval(() => {
    if (!ttState) return;
    ttState.left--;
    const t = $('tt-time');
    if (t) { t.textContent = ttState.left; t.classList.toggle('bad', ttState.left <= 10); }
    if (ttState.left <= 0) endTimesTables();
  }, 1000);

  /* Checked on every keystroke, with no Enter to press. "72" typed one digit at a time passes
     through "7", which is wrong for 8×9 and right for nothing — so a wrong number is never
     marked wrong, it is simply not yet right. A child typing the second digit of a correct
     answer must not be told they have failed. */
  input.oninput = () => {
    if (!ttState) return;
    /* Named `answer`, not `val`. There is a global `val()` that reads an input by id, and a local
       shadowing it inside a function that also reads inputs is a trap set for whoever edits this
       next. */
    const answer = parseInt(input.value, 10);
    if (isNaN(answer)) return;
    if (answer === ttState.cur.a * ttState.cur.b) {
      ttState.score++;
      ttState.asked++;
      $('tt-score').textContent = ttState.score;
      $('tt-feedback').textContent = '✓';
      ttAsk();
      input.value = '';
    }
  };
}

/**
 * SIXTY SECONDS, UP. Called by the clock and by the give-up button, and safe to call twice —
 * the interval is cleared first, so a tap landing in the same tick as the timeout cannot run
 * this over the top of itself.
 */
/* The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle
   state — and a clock left running behind a screen that no longer has a question on it would go
   on ticking into elements that have been thrown away. */
function initTables() {
  if (!$('tt-idle')) return;
  if (ttState) { clearInterval(ttState.timer); ttState = null; }
  $('tt-idle')?.classList.remove('hidden');
  $('tt-question')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  paintBoard_('tt-board', 'ttHighscore');
}

function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  const best = Math.max(Number(USER && USER.ttHighscore) || 0, score);
  ttState = null;

  $('tt-question')?.classList.add('hidden');
  const over = $('tt-over');
  if (over) {
    over.classList.remove('hidden');
    over.innerHTML = `
      <p class="mono" style="font-size:2rem;text-align:center;margin:.6rem 0">${score}</p>
      <p class="note" style="text-align:center">${
        score === 0 ? 'None. It happens — try a slower start.'
      : score >= best && score > 0 && score > (Number(USER && USER.ttHighscore) || 0)
        ? 'A new best.'
      : 'Your best is ' + best + '.'}</p>
      <button class="btn" data-do="tt-start" style="margin-top:.5rem">Again</button>`;
  }

  /* Kept only if it beats the old one, and only for somebody signed in. The server decides
     whether it stuck — `saveTtHighscore` returns the figure it actually holds, so a phone that
     was offline does not go on claiming a record that was never written. */
  if (USER && score > (Number(USER.ttHighscore) || 0)) {
    const was = Number(USER.ttHighscore) || 0;
    USER.ttHighscore = score;
    api({ action: 'saveTtHighscore',
      name: USER.name, personId: USER.personId, score })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        if (typeof d.best === 'number') USER.ttHighscore = d.best;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        /* ---------- AND THE ROW THE BOARD READS, WHICH THIS NEVER TOUCHED --------------------
           `USER` IS THE PLAYER'S OWN COPY AND `DATA.students` / `DATA.tutors` ARE WHAT THE HIGH
           SCORES ARE BUILT FROM. Writing one and not the other was invisible while the only
           reader was this card's own `Your best is`; with a board under it the two disagree on
           screen — a new record announced above a list that still shows the old one, until the
           next payload lands. `gameOver` in receipt.js already did this for Flappy Bird and this
           did not, which is why it is worth the lines rather than the assumption. */
        const meRow = (DATA.students || []).concat(DATA.tutors || []).filter(mineIs_)[0];
        if (meRow) meRow.ttHighscore = Number(USER.ttHighscore) || 0;
        paintBoard_('tt-board', 'ttHighscore');
      })
      .catch(() => {
        /* Said quietly rather than left as a lie. A child told they set a record and finding it
           gone next visit has nothing to explain it. */
        USER.ttHighscore = was;
        const over2 = $('tt-over');
        if (over2) over2.insertAdjacentHTML('beforeend',
          '<p class="faint" style="text-align:center">Not saved — no connection.</p>');
      });
  }
}

/* ---------- WHAT THE DISPLAY SAYS, TURNED BACK INTO ARITHMETIC ------------------------------------
   THE KEYPAD TYPES ÷ × − AND π, because that is what a calculator shows and what an exam paper
   prints. None of them are operators to a JavaScript evaluator, so they are translated here — once,
   next to the only line that needs it.

   THE MINUS IS THE ONE THAT WOULD HAVE BITTEN. `−` (U+2212) is not `-` (hyphen-minus); it looks
   identical at this size and parses as nothing at all, so `7 − 3` would have come back Error while
   reading perfectly correctly on screen. That is the worst shape of bug: right in front of you and
   invisible.

   BOTH SPELLINGS ARE ACCEPTED, so a sum typed on a hardware keyboard with `*` and `/` still works
   and anything already in the history keeps evaluating. */
const calcNormalise_ = t => String(t || '')
  .replace(/\u00d7/g, '*')
  .replace(/\u00f7/g, '/')
  .replace(/\u2212/g, '-')
  .replace(/\u03c0/g, 'pi');

function initMiniCalc() {
  const disp = $('mc-display');
  if (!disp) return;

  /* THE STATE. `at` is where the caret sits — an index BETWEEN characters, so 0 is before the
     first and expr.length is after the last. Everything below inserts and deletes there rather
     than at the end, which is the whole difference an arrow key makes. */
  let expr = '', at = 0;
  /* Every finished sum, oldest first, and where we are in it. `-1` means "not looking back",
     which is a different state from "looking at the newest" — pressing ▼ off the end has to
     return the working line, not hand back the last answer again. */
  const past = [];
  let back = -1;
  let fresh = false;         // the display holds an answer rather than something being typed

  const render = () => {
    const t = expr || '';
    disp.innerHTML = t
      ? esc(t.slice(0, at)) + '<span class="mc-caret"></span>' + esc(t.slice(at))
      : '<span class="mc-zero">0</span><span class="mc-caret"></span>';
    disp.scrollLeft = disp.scrollWidth;      // a long sum scrolls to where you are typing
  };

  /* Put something in at the caret and step past it. A multi-character token — `sin(`, `sqrt(` —
     moves the caret by its whole length, so the next digit lands inside the bracket. */
  const put = t => { expr = expr.slice(0, at) + t + expr.slice(at); at += t.length; };

  const recall = dir => {
    if (!past.length) return;
    /* From the working line ▲ goes to the newest; from inside the history it steps outwards. ▼
       off the end returns to an empty line rather than sticking on the last answer. */
    if (back === -1) { if (dir < 0) back = past.length - 1; else return; }
    else back = Math.min(past.length - 1, Math.max(-1, back + (dir < 0 ? -1 : 1)));
    expr = back === -1 ? '' : past[back];
    at = expr.length;
    fresh = false;
  };

  window._mcClick = (v) => {
    /* Anything that is not a movement leaves the history. Editing a recalled sum makes it a new
       one — otherwise ▲ from a half-edited line would step from where the original sat. */
    if (v !== 'up' && v !== 'down') back = -1;

    if (v === 'left')  { at = Math.max(0, at - 1); fresh = false; return render(); }
    if (v === 'right') { at = Math.min(expr.length, at + 1); fresh = false; return render(); }
    if (v === 'up')    { recall(-1); return render(); }
    if (v === 'down')  { recall(1);  return render(); }

    if (v === '=') {
      if (!expr || expr === 'Error') return;
      const was = expr;
      try {
        let t = calcNormalise_(expr);
        /* ---------- THE BRACKET THE KEY OPENED, CLOSED FOR YOU --------------------------------------
           REPORTED AS "calulator sin cos and tan doesnt really work". Measured: `sin(30)` is 0.5,
           `cos(60)` is 0.5 and `tan(45)` is 1, all correct. `sin(30` -- with no closing bracket --
           is **Error**, and that is the whole complaint: the `sin` key puts in `sin(` and every
           calculator anybody has held closes it for them. Press sin, 3, 0, = on a Casio and you get
           0.5; here you had to remember a bracket the machine had opened on your behalf.

           ONLY AT `=`, and only the ones left open, so nothing is added to what is on screen while
           it is being typed and an expression that is already balanced is untouched. */
        const open = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
        if (open > 0) t += ')'.repeat(open);
        // degree trig
        t = t.replace(/\b(sin|cos|tan)\(/g, '$1(DEG*');
        let result;
        /* `window.math` IS NEVER LOADED BY ANYTHING HERE, measured across index.html and every
           file in `js/` -- so the branch below has never run and the fallback is what the
           calculator has always been. It stays because it is the right thing to use IF a maths
           library is ever added, and because deleting it would leave the fallback looking like a
           fallback for nothing. The arithmetic was proved on the path that actually runs. */
        if (window.math) {
          result = window.math.evaluate(t, { pi: Math.PI, DEG: Math.PI / 180 });
        } else {
          t = t.replace(/pi/g, Math.PI).replace(/DEG/g, Math.PI / 180)
               .replace(/sqrt/g, 'Math.sqrt').replace(/sin/g, 'Math.sin')
               .replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/\^/g, '**');
          result = Function('"use strict";return (' + t + ')')();
        }
        expr = String(Math.round(result * 1e10) / 1e10);
        /* The SUM is remembered, not the answer. Going back to change one number in it is the
           reason anybody looks back at all, and an answer cannot be edited into a question. */
        if (past[past.length - 1] !== was) past.push(was);
        if (past.length > 30) past.shift();
        fresh = true;
      } catch { expr = 'Error'; fresh = false; }
      at = expr.length;
      return render();
    }

    if (v === 'C') { expr = ''; at = 0; fresh = false; return render(); }

    if (v === 'del') {
      /* Backspace AT THE CARET. It used to take the last character whatever the caret said,
         which with arrows would delete the wrong end of the sum. */
      if (expr === 'Error') { expr = ''; at = 0; return render(); }
      if (at > 0) { expr = expr.slice(0, at - 1) + expr.slice(at); at--; }
      fresh = false;
      return render();
    }

    if (expr === 'Error') { expr = ''; at = 0; fresh = false; }
    /* AFTER AN ANSWER: a digit starts a new sum, an operator continues from the answer.
       `5 + 3 =` then `× 2` is what almost everybody means, and clearing the 8 first would be the
       calculator throwing away what it had just told them. */
    if (fresh) {
      if (/^[0-9.]$/.test(v)) { expr = ''; at = 0; }
      fresh = false;
    }
    put(v);
    render();
  };

  render();
}

/* ---------- THE TIMER ---------------------------------------------------------------------------
   IT DID NOTHING AT ALL. The toggle carried an `id` and no `data-do`, so the one delegated click
   handler never saw it; `timer-reset` had a `data-do` and no handler was ever registered; and
   there was no tick function anywhere — `paintTimer` drew a number that nothing decremented.

   IT ALSO USED TO STOP ITSELF. `initTimer` cleared the clock every time Tools was opened, so
   going to the feed to look at something and coming back reset a session halfway through. A timer
   that stops when you look away is not a timer, so the state lives outside the screen and only
   the drawing is redone.
--------------------------------------------------------------------------------------------- */

/* ONE interval, ever. A second one started without clearing the first makes the clock run at
   double speed, which is the classic way a timer loses two seconds a second. */
function timerTick() {
  clearInterval(timerState.tick);
  timerState.tick = setInterval(() => {
    if (!timerState.running) return;
    timerState.left--;
    if (timerState.left <= 0) {
      timerState.left = 0;
      timerState.running = false;
      clearInterval(timerState.tick);
      toast('Time');
      /* A sound BUILT rather than fetched — a file is a request that can fail silently, and a
         timer that ends in silence has not ended. */
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const ac = new AC();
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = 880; g.gain.value = 0.08;
          o.start(); o.stop(ac.currentTime + 0.35);
        }
      } catch {}
      navigator.vibrate?.([200, 100, 200]);
    }
    paintTimer();
  }, 1000);
}

/* Draws the clock as it stands, and picks a running one back up. Does NOT stop it. */
function initTimer() {
  paintTimer();
  if (timerState.running) timerTick();
}

on('timer-toggle', () => {
  if (!timerState.left) timerState.left = timerState.total;   // finished: play starts it again
  timerState.running = !timerState.running;
  if (timerState.running) timerTick(); else clearInterval(timerState.tick);
  paintTimer();
});

on('timer-reset', () => {
  timerState.running = false;
  clearInterval(timerState.tick);
  timerState.left = timerState.total;
  paintTimer();
});

on('timer-set', el => {
  const mins = Number(el.dataset.min) || 25;
  timerState.total = mins * 60;
  timerState.left = mins * 60;
  timerState.running = false;
  clearInterval(timerState.tick);
  paintTimer();
});

/* ---------- THE CALENDAR ------------------------------------------------------------------------
   A month, with what is ON it. An empty grid of numbers is a thing every phone already has; the
   reason to have one here is that it knows about the exams and the birthdays.

   The ARROWS were dead. `cal-back` and `cal-fwd` each carried a `data-do` and no handler was ever
   registered for either, so it has only ever been able to show this month.
--------------------------------------------------------------------------------------------- */
/* `MONTHS` was a second copy of the twelve month names, identical to `MONTH_NAMES` in data.js.
   Two lists of the same twelve words is two places to fix a typo and one of them will be missed. */

/* ---------- EVERY DATE THE APP KNOWS, NOT TWO KINDS OF IT ------------------------------------------
   ASKED FOR as part of *"calander and time table and availability ... it seems they clash"*. This drew
   the exams tab and birthdays and nothing else — so a family's sessions, the half term, the bank
   holiday the booking now skips and the festive afternoon they had been offered were all somewhere
   else in the app and none of them here, on the one surface that is ABOUT dates. Every kind below is
   READ, from the place it is written, and none of them is stored by the calendar:

     · YOUR SESSIONS — the session dates of your own jobs (`myJobs_`, `jobDates_`), so a bank holiday
       or a half term is simply a day without one.
     · TERMS AND HALF TERMS — `DATA.intervals`: a term's first and last day, every day of a half
       term, and the first and last day of a longer holiday (six weeks of dots says nothing).
     · BANK HOLIDAYS AND CLOSED DAYS — `DATA.closures`, the same list `computeSessionDates` steps over.
     · FESTIVE EVENTS — `DATA.festive`, what is on offer.
     · EXAMS — `DATA.exams`, which carries a student's own two dates from Settings now as well as the
       tab's rows, merged on the server with no duplicates (see `doGet`).

   A KIND IS ONE DOT AND ONE LINE OF THE KEY. `CAL_KINDS` is the order and the words, read by the
   dots, the key under the month and the sheet a tap opens — one list, three readers. */
const CAL_KINDS = [
  ['session', 'Session'], ['exam', 'Exam'], ['mock', 'Mock'], ['term', 'Term'],
  ['halfterm', 'Half term'], ['bank', 'Bank holiday'], ['closed', 'Closed'],
  ['festive', 'Event'], ['birthday', 'Birthday'],
];
const calKindSaid_ = k => (CAL_KINDS.find(x => x[0] === k) || [k, k])[1];

/* Everything that happens, keyed by day of the month. Built once per draw rather than searched
   per cell: forty-two cells against two lists is forty-two scans of them to shade six squares. */
function calendarMarks(y, m) {
  const out = {};
  const put = (d, mark) => { (out[d] = out[d] || []).push(mark); };
  const inMonth = d => d && d.getFullYear() === y && d.getMonth() === m;

  (DATA.exams || []).forEach(x => {
    const d = parseDMY(x.date);
    if (!d || d.getFullYear() !== y || d.getMonth() !== m) return;
    put(d.getDate(), { kind: x.kind === 'mock' ? 'mock' : 'exam',
                       label: [x.subject, x.label].filter(Boolean).join(' · ') || 'Exam',
                       who: x.who || '' });
  });

  /* A birthday has no year, which is the point: it happens every year, and a date that only
     appears once is a date somebody misses. */
  (DATA.birthdays || []).forEach(b => {
    if (Number(b.month) !== m + 1) return;
    put(Number(b.day), { kind: 'birthday', label: b.name + '’s birthday', who: b.name });
  });

  /* YOUR SESSIONS, ON THEIR OWN DATES. A job with no dates yet is not on a calendar: it has a
     weekday and no day, and the Timetable is where a standing week is drawn. */
  if (typeof USER !== 'undefined' && USER && typeof myJobs_ === 'function' && typeof jobDates_ === 'function') {
    myJobs_().forEach(j => {
      if (/cancel/i.test(String(j.status || ''))) return;
      jobDates_(j).forEach(d => {
        if (!inMonth(d)) return;
        put(d.getDate(), { kind: 'session',
          label: [j.subject || 'Session', j.time].filter(Boolean).join(' · '),
          who: j.location || '' });
      });
    });
  }

  /* THE TERMS. A term is two dates that matter — it starts, it ends — and a dot on every weekday of
     it would cover the month; a half term is a week off and every day of it is the news; a longer
     holiday is its first and last day, for the term's reason. */
  const each = (a, b, fn) => {
    const d = new Date(a);
    for (let i = 0; d <= b && i < 400; i++) { fn(new Date(d)); d.setDate(d.getDate() + 1); }
  };
  (typeof intervals_ === 'function' ? intervals_() : (DATA.intervals || [])).forEach(x => {
    const a = parseDMY(x.startDate), b = parseDMY(x.endDate);
    if (!a || !b) return;
    const name = x.label || x.term || '';
    if (x.kind === 'half-term') {
      each(a, b, d => { if (inMonth(d)) put(d.getDate(), { kind: 'halfterm', label: name, who: '' }); });
    } else {
      const kind = x.kind === 'holiday' ? 'halfterm' : 'term';
      if (inMonth(a)) put(a.getDate(), { kind, label: name + ' starts', who: '' });
      if (inMonth(b)) put(b.getDate(), { kind, label: name + ' ends', who: '' });
    }
  });

  /* BANK HOLIDAYS AND CLOSED DAYS — the list the booking steps over. A festive one is drawn below
     from `DATA.festive`, which says more about it. */
  (DATA.closures || []).forEach(c => {
    const d = parseDMY(c && c.date);
    if (!inMonth(d) || c.kind === 'festive') return;
    put(d.getDate(), { kind: c.kind === 'bank' ? 'bank' : 'closed', label: c.name || 'Closed', who: '' });
  });

  (DATA.festive || []).forEach(f => {
    const d = parseDMY(f && f.date);
    if (!inMonth(d)) return;
    put(d.getDate(), { kind: 'festive', label: f.name || f.holiday || 'An event', who: f.venue || '' });
  });

  return out;
}

/* THE KEY, UNDER THE MONTH: one dot and one word for every kind that is on THIS month, in
   `CAL_KINDS`' order. Only what is drawn, because a key of nine for a month holding two is a key
   nobody reads. */
function calKey_(marks) {
  const on = {};
  Object.keys(marks).forEach(d => marks[d].forEach(x => { on[x.kind] = 1; }));
  const kinds = CAL_KINDS.filter(([k]) => on[k]);
  return kinds.length ? `<div class="cal-key">${kinds.map(([k, said]) =>
    `<span><i class="dot ${k}"></i>${esc(said)}</span>`).join('')}</div>` : '';
}

function initCalendar() {
  if (!$('cal-body')) return;
  const now = new Date();
  CAL_VIEW = CAL_VIEW || { y: now.getFullYear(), m: now.getMonth() };
  drawCalendar();
}

function drawCalendar() {
  const host = $('cal-body');
  if (!host) return;
  const y = calView().y, m = CAL_VIEW.m;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDay = (new Date(y, m, 1).getDay() + 6) % 7;   // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const label = $('cal-label');
  if (label) label.textContent = `${MONTH_NAMES[m]} ${y}`;

  const marks = calendarMarks(y, m);
  const cells = [];
  ['M','T','W','T','F','S','S'].forEach(d => cells.push(`<span class="cal-h">${d}</span>`));
  for (let i = 0; i < startDay; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const isToday = new Date(y, m, d).getTime() === today.getTime();
    const on = marks[d] || [];
    /* A DOT PER KIND, not per event. Three exams on one day is one exam dot — the square is a few
       millimetres across, and what it has to say is "something is here". */
    const kinds = CAL_KINDS.map(k => k[0]).filter(k => on.some(x => x.kind === k));
    cells.push(`<span class="cal-d${isToday ? ' cal-today' : ''}${on.length ? ' has' : ''}"
        ${on.length ? `data-do="cal-day" data-d="${d}"` : ''}>${d}${
      kinds.length ? `<span class="cal-dots">${
        kinds.map(k => `<i class="dot ${k}"></i>`).join('')}</span>` : ''}</span>`);
  }
  host.innerHTML = cells.join('');
  /* THE KEY IS ITS OWN ELEMENT AFTER THE GRID, not a cell of it: `.cal` is a seven-column grid and
     anything put inside it would be laid out as days. Found or made beside `#cal-body`. */
  let key = host.parentNode && host.parentNode.querySelector('.cal-key-box');
  if (!key && host.parentNode) {
    key = document.createElement('div');
    key.className = 'cal-key-box';
    host.parentNode.insertBefore(key, host.nextSibling);
  }
  if (key) key.innerHTML = calKey_(marks);
}

/* CAL_VIEW is filled by initCalendar, which `wake` runs before the screen can be touched — so
   this cannot be null in practice. It is guarded anyway: a null that is safe only because of an
   ordering assumption is the same shape as every other silent failure on the list. */
const calView = () => (CAL_VIEW = CAL_VIEW
  || { y: new Date().getFullYear(), m: new Date().getMonth() });

on('cal-back', () => {
  calView().m--;
  if (CAL_VIEW.m < 0) { CAL_VIEW.m = 11; CAL_VIEW.y--; }
  drawCalendar();
});
on('cal-fwd', () => {
  calView().m++;
  if (CAL_VIEW.m > 11) { CAL_VIEW.m = 0; CAL_VIEW.y++; }
  drawCalendar();
});

/* WHAT IS ON THAT DAY. A dot says something is there and nothing else, and a mark you cannot open
   is a mark whose meaning you have to remember. */
on('cal-day', el => {
  const d = Number(el.dataset.d);
  const order = k => CAL_KINDS.findIndex(x => x[0] === k);
  const on = (calendarMarks(calView().y, CAL_VIEW.m)[d] || []).slice().sort((a, b) => order(a.kind) - order(b.kind));
  openSheet(d + ' ' + MONTH_NAMES[CAL_VIEW.m], on.map(x => `
    ${/* NOT A LABEL AND A VALUE, which is why it is written out rather than built by `row`.
          The label carries a coloured dot and the value carries a second line naming whose exam it
          is — two pieces each, not one. A helper that took markup on both sides would be a helper
          that formats nothing, and every caller would be passing it the whole row anyway.
          Four shapes cover a sheet; the fifth is where a shared piece stops being shared. */''}
    <div class="row">
      <span class="k"><i class="dot ${x.kind}"></i> ${esc(calKindSaid_(x.kind))}</span>
      <span class="v">${mark(x.label)}${x.who && x.kind !== 'birthday'
        ? `<br><span class="faint">${esc(x.who)}</span>` : ''}</span>
    </div>`).join(''));
});

/* ---------- CHESS, TWO PLAYERS ROUND ONE PHONE ------------------------------------------------------
   ASKED FOR AS "make chess 2 player. also make it more stable and better in recognition." Measured
   before anything was written, and the second half was worse than it sounded: THE BOARD COULD NOT BE
   PLAYED AT ALL. `drawChess` drew sixty-four `<span data-sq>` with no `data-do`, the tap handler it
   was written for (`chessTap`) had been deleted as dead, and the dispatcher only answers `data-do` —
   so a tap on a piece did nothing, on every phone, while the line under the board said "Your move".
   `check/press.js` could not see it, because a control with no action is not in its queue.

   So every square is a `<button data-do="chess-sq">`. That is also what makes a swipe safe: a drag
   that starts on the board produces a click, and `PRESS_MOVED` in shell.js swallows exactly that
   click before the dispatcher sees it — so scrolling past the board never picks a piece up.

   EVERYTHING ON THE BOARD IS DRAWN FROM STATE — the position, the picked square, the pending
   promotion, the last move — and never left on the DOM by a handler. A repaint rebuilds the card,
   and a highlight that lived only in the markup would vanish while the selection it showed stayed:
   the `REEL_HELD` fault. And it draws by CLASS rather than by id, because a starred chess widget is
   a second board on the Saved column and `$()` would only ever find the first.

   NO FLIP. The board stays white-at-the-bottom and the line above it says whose move it is, in
   words. Turning the board every move is what a two-player app on a table does; on a phone held by
   one person and passed across, it is the picture jumping under the hand reaching for it. */
const CH_FILES = 'abcdefgh';
const CH_NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const chSide_ = s => s === CH_WHITE ? 'White' : 'Black';
const chSq_ = i => CH_FILES[file(i)] + (8 - rank(i));

function chessReset_() {
  CHESS = newGame(); CHESS_HIST = []; CHESS_PICK = -1; CHESS_PROMO = null; CHESS_LAST = null; CHESS_ARM = 0;
}

function initChess() {
  if (!$('chess-board')) return;
  if (!CHESS) chessReset_();
  drawChess();
}

/* THE GAME IS OVER, and why. Mate and stalemate come from the rules; the fifty-move rule and bare
   kings are the two draws a kitchen-table game actually reaches — without them two kings chase each
   other round an empty board for ever with the line underneath saying whose move it is. */
function chessEnd_(pos) {
  const end = outcome(pos);
  if (end) return end;
  if (pos.halfmove >= 100) return 'fifty';
  const rest = pos.board.filter(p => p !== '_' && p.toLowerCase() !== 'k');
  if (!rest.length || (rest.length === 1 && /[bn]/i.test(rest[0]))) return 'material';
  return null;
}

function chessStatus_() {
  const end = chessEnd_(CHESS);
  const side = chSide_(CHESS.turn), other = chSide_(CHESS.turn === CH_WHITE ? CH_BLACK : CH_WHITE);
  if (end === 'mate') return `Checkmate — ${other} wins.`;
  if (end === 'stalemate') return `Stalemate — ${side} has no legal move. A draw.`;
  if (end === 'fifty') return 'A draw — fifty moves each with no capture and no pawn move.';
  if (end === 'material') return 'A draw — neither side has enough left to checkmate.';
  if (CHESS_PROMO) return `${side} — promote the pawn to:`;
  return inCheck(CHESS, CHESS.turn) ? `${side} to move — check!` : `${side} to move`;
}

function drawChess(note) {
  if (!CHESS) return;
  const mine = CHESS_PICK >= 0 ? legalMoves(CHESS).filter(m => m.from === CHESS_PICK) : [];
  const checked = inCheck(CHESS, CHESS.turn) ? kingSquare(CHESS, CHESS.turn) : -1;
  const board = CHESS.board.map((p, i) => {
    const cls = ['sq', 'chess-sq', (file(i) + rank(i)) % 2 ? 'dk' : 'lt'];
    if (i === CHESS_PICK) cls.push('pick');
    /* A CAPTURE IS RINGED AND A QUIET MOVE IS A DOT — and en passant is a capture that lands on an
       empty square, so it is asked of the move rather than of what is standing on the square. */
    const hit = mine.find(m => m.to === i);
    if (hit) cls.push(p !== '_' || hit.enpassant ? 'take' : 'can');
    if (CHESS_LAST && (i === CHESS_LAST.from || i === CHESS_LAST.to)) cls.push('last');
    if (i === checked) cls.push('chk');
    if (p !== '_') cls.push(isWhite(p) ? 'wp' : 'bp');
    const who = p === '_' ? '' : ', ' + (isWhite(p) ? 'white ' : 'black ') + CH_NAME[p.toLowerCase()];
    return `<button type="button" class="${cls.join(' ')}" data-do="chess-sq" data-sq="${i}"
      aria-label="${chSq_(i)}${who}">${p === '_' ? '' : GLYPH[p]}</button>`;
  }).join('');
  /* PROMOTION IS ASKED, NOT ASSUMED. The queen is first and is what nearly everybody wants, but an
     under-promotion to a knight is the one move that sometimes wins, and a board that quietly
     queens has taken the decision off the player. The row replaces the controls while it is up, so
     there is nothing else to press. */
  const promo = CHESS_PROMO ? 'QRBN'.split('').map(q => {
    const g = CHESS.turn === CH_WHITE ? q : q.toLowerCase();
    return `<button type="button" class="btn quiet chess-pro ${CHESS.turn === CH_WHITE ? 'wp' : 'bp'}"
      data-do="chess-promo" data-p="${q}" aria-label="${CH_NAME[q.toLowerCase()]}">${GLYPH[g]}</button>`;
  }).join('') : '';
  const armed = Date.now() - CHESS_ARM < 3000;
  document.querySelectorAll('.chess-game').forEach(root => {
    const b = root.querySelector('.chess'); if (b) b.innerHTML = board;
    const s = root.querySelector('.chess-say');
    if (s) { s.textContent = note || chessStatus_(); s.classList.toggle('is-note', !!note); }
    const pr = root.querySelector('.chess-promo'); if (pr) { pr.innerHTML = promo; pr.hidden = !promo; }
    const ctl = root.querySelector('.chess-ctl'); if (ctl) ctl.hidden = !!promo;
    const u = root.querySelector('[data-do="chess-undo"]'); if (u) u.disabled = !CHESS_HIST.length;
    const n = root.querySelector('[data-do="chess-new"]'); if (n) n.textContent = armed ? 'Tap again to start over' : 'New game';
  });
}

function chessPlay_(m) {
  CHESS_HIST.push({ pos: CHESS, last: CHESS_LAST });
  CHESS = play(CHESS, m);
  CHESS_LAST = { from: m.from, to: m.to };
  CHESS_PICK = -1; CHESS_PROMO = null; CHESS_ARM = 0;
  drawChess();
}

/* A TAP. Three things it can mean and they are tried in the order a player means them: the second
   tap of a move, picking a piece of your own, and anything else — which says WHY nothing happened
   rather than doing nothing, because a board that ignores a tap reads as a board that missed it. */
on('chess-sq', el => {
  if (!CHESS) chessReset_();
  const i = Number(el.dataset.sq);
  if (chessEnd_(CHESS)) return drawChess('The game is over — New game to play again.');
  if (CHESS_PROMO) return drawChess();
  const moves = legalMoves(CHESS);
  if (CHESS_PICK >= 0) {
    const hits = moves.filter(m => m.from === CHESS_PICK && m.to === i);
    if (hits.length) {
      if (hits.some(m => m.promote)) { CHESS_PROMO = { from: CHESS_PICK, to: i }; return drawChess(); }
      return chessPlay_(hits[0]);
    }
  }
  const p = CHESS.board[i];
  if (p !== '_' && colourOf(p) === CHESS.turn) {
    CHESS_PICK = CHESS_PICK === i ? -1 : i;        // the same piece again puts it back down
    if (CHESS_PICK >= 0 && !moves.some(m => m.from === i))
      return drawChess(`That ${CH_NAME[p.toLowerCase()]} has no legal move${inCheck(CHESS, CHESS.turn) ? ' — you are in check' : ''}.`);
    return drawChess();
  }
  const wasPicked = CHESS_PICK >= 0;
  CHESS_PICK = -1;
  if (wasPicked) return drawChess(inCheck(CHESS, CHESS.turn) ? 'Not legal — you are in check.' : 'That piece cannot go there.');
  if (p !== '_') return drawChess(`It is ${chSide_(CHESS.turn)}'s move.`);
  drawChess();
});

on('chess-promo', el => {
  if (!CHESS_PROMO) return drawChess();
  const m = legalMoves(CHESS).find(x => x.from === CHESS_PROMO.from && x.to === CHESS_PROMO.to && x.promote === el.dataset.p);
  if (m) chessPlay_(m); else { CHESS_PROMO = null; drawChess(); }
});

/* UNDO takes back one move, either side's — two people at one board agree on that out loud, and an
   app that refused it would be stricter than the table. With a promotion half-chosen it cancels
   that instead, which is the smaller undo and the one being reached for. */
on('chess-undo', () => {
  if (!CHESS) return;
  if (CHESS_PROMO) { CHESS_PROMO = null; CHESS_PICK = -1; return drawChess(); }
  const h = CHESS_HIST.pop();
  if (h) { CHESS = h.pos; CHESS_LAST = h.last; }
  CHESS_PICK = -1; CHESS_ARM = 0;
  drawChess();
});

/* NEW GAME THROWS A GAME AWAY, so a game in progress asks twice — the label says so and goes back
   by itself. A finished game or an empty board starts over at once: there is nothing to lose. */
on('chess-new', () => {
  const live = CHESS && CHESS_HIST.length && !chessEnd_(CHESS);
  if (live && Date.now() - CHESS_ARM >= 3000) {
    CHESS_ARM = Date.now();
    setTimeout(() => drawChess(), 3100);
    return drawChess();
  }
  chessReset_();
  drawChess();
});


/* ---------- THE REELS ---------------------------------------------------------------------------
   One fact at a time, full card, tap for another.

   IT DREW NOTHING — a black rectangle, which is what `--sunk` looks like in an empty div. The
   first line called `tpl.feedSlide(it)` and the next `feedPicture(it.pic)`, and neither `tpl` nor
   `feedPicture` was carried over from the markup that burned. The ReferenceError went into
   `wake`'s catch, which is there so one broken game does not take the other three with it — and
   which turns a crash into a blank.

   NO PHOTOGRAPH. The old version fetched one per card from a search term: a key, a rate limit, an
   attribution line, and a card that goes blank the day the key expires. The background is DRAWN
   from the fact's own subject instead — the same words used as a seed rather than as a query — so
   it is instant, works with no connection, and is the same every time you see that fact.
--------------------------------------------------------------------------------------------- */

/* A colour from a string. Two hues a little apart so the gradient has somewhere to go, and the
   SUBJECT decides them — so every Space card is a family of blues and every Animals card its own
   green, without anybody choosing ninety colours. */
function feedColours(seed) {
  const h = hashOf(String(seed || '?'));
  const a = h % 360;
  const b = (a + 25 + (h >> 9) % 40) % 360;
  /* THE THIRD COLOUR IS TEXT — the subject's label — so its lightness is chosen against the card's
     lightest stop for EVERY hue, not by eye on one. At 62% it passed on the greens and failed on the
     blues and purples, down to 3.42:1 at hue 240; `check/ui.js` caught it only when a Study fact
     happened to be dealt, which is why it came and went between runs. Swept over all 360 hues: 68%
     clears 4.5 by a hair, 70% clears it everywhere with the worst at 5.02:1. */
  return [`hsl(${a} 42% 18%)`, `hsl(${b} 38% 9%)`, `hsl(${a} 60% 70%)`];
}

/* The card. The HEADING is the fact, so it takes the space; the body is why, so it is small. */
/* ---------- WHERE A CLIP IS, AND THE ONLY KIND THERE IS NOW ---------------------------------------
   A `clip` IS A VIDEO FILE — a path beside this site (`data/reels/x.mp4`) or a whole `http(s)` URL
   to one. That is the one thing a `<video>` can mute, autoplay, loop and pause, which is what every
   other line of the Reels column is written against.

   THERE USED TO BE TWO MORE KINDS AND BOTH ENDED IN SOMEBODY ELSE'S PLAYER IN AN IFRAME. A Google
   Drive id climbed a ladder of two download addresses and then fell to Drive's `/preview` embed —
   which on a real phone is where it always landed (a screenshot showed Google's scrubber, CC, 1x and
   a black letterbox). An Instagram reel had no address a `<video>` could read at all and went
   straight to Instagram's embed. Both: no autoplay, no mute, no pause from this column, and another
   company's chrome round the picture.

   REMOVED ON THE OWNER'S WORD — "remove the embedded reels. they suck." — and removed whole rather
   than switched off: `clipFrame_`, `reelFrame_`, the iframe half of `clipsStop_` and `reelTurn_`, and
   the download ladder are all gone. A dormant embed route behind a flag is a second mode nothing
   presses, which is `orderPrints`.

   SO A ROW THAT CAN ONLY BE EMBEDDED IS NOT A REEL AND IS DROPPED FROM THE LIST, rather than drawn as
   a slide that never plays. `clipPlayable_` is the one test and `clipsNow_` filters on it, so the
   column, the "One more thing" widget and the pager all agree about what counts. `check-reels.js`
   refuses such a row in `FEED_FACTS` outright, so the code's own list cannot grow one again. */
const CLIP_EMBED_ONLY = /(?:^|\/\/)(?:www\.)?instagram\.com\//i;
function clipPlayable_(clip) {
  const c = String(clip || '').trim();
  if (!c || CLIP_EMBED_ONLY.test(c)) return false;
  /* A SCHEME MEANS A WHOLE ADDRESS, and only http(s) is a file a browser will fetch into a
     `<video>`. No scheme and a slash is a path into this repository. No scheme and NO slash is a
     Drive id — the one kind that can only ever be embedded — and is refused. */
  if (/^[a-z][a-z0-9+.-]*:/i.test(c)) return /^https?:\/\//i.test(c);
  return c.indexOf('/') !== -1;
}
function clipSrc_(clip) {
  return clipPlayable_(clip) ? String(clip).trim() : '';
}
function feedSlide(it) {
  const c = feedColours(it.subject);
  /* A SLIDE WITH NO WORDS DRAWS NO WORDS. Every fact has a heading, so for fifty-eight of these
     this branch never fires; a clip does not need one, and an empty `<h3>` over a video is a black
     bar with a subject label floating in it. See the note on the fifth field in chess.js. */
  const words = (it.heading || it.body) ? `<div class="feed-text">
      <span class="feed-subject">${esc(it.subject)}</span>
      ${it.heading ? `<h3 class="feed-head">${esc(it.heading)}</h3>` : ''}
      ${it.body ? `<p class="feed-body">${esc(it.body)}</p>` : ''}
    </div>` : '';

  /* `has-photo` WHEN THERE ARE FRAMES, NOT WHEN THERE IS AN ELEMENT. It was on the first paint
     here, on the argument that a video is a picture that moves — and a video that has not arrived
     is not a picture at all: the class hides the subject's initial and whitens the words over a
     slide that is still its own gradient. `reelPlay_` adds it on `loadeddata`, which is the same
     moment and the same reason the photograph branch adds it in `reelsWatch_`. Caught on a
     screenshot, which this file has now recorded as the last word on a drawing five times.

     NO `src` YET. Fifty-eight videos asked for at once is fifty-eight downloads for the one you are
     looking at, which is the same arithmetic `reelsWatch_` already makes about the photographs —
     `preload="none"` is a hint browsers are free to ignore and an absent `src` is not. */
  if (it.clip) {
    /* ---------- THE FIRST FRAME ARRIVES FIRST, AND THAT IS MOST OF "IT TAKES LONG TO LOAD" --------
       REPORTED AS "the reel isnt loading. or it takes long to load". Measured, the two clips in this
       repository are 576x576, 104 and 92 seconds long, 7.3 and 7.9 MB — so on a phone there really
       are several seconds between the tap and the first frame, and what was on the screen for all of
       them was `.feed-art`'s gradient with a letter on it. A column whose whole content is a video,
       showing no video, is indistinguishable from a broken one. That is this repository's oldest
       shape wearing a stopwatch: *it has not arrived* drawn exactly like *there is nothing here*.

       A POSTER IS ~20KB AND IT IS THE CLIP'S OWN FIRST FRAME, so the slide is the right picture
       immediately and the video fades in over it when it is ready. Nothing about the clip is
       changed: re-encoding the owner's video to make it smaller is a lossy edit to their material
       and a judgement that is theirs, and it is written down in `data/reels/README.md` instead.

       DERIVED FROM THE CLIP'S PATH, NOT A SIXTH FIELD. `x.mp4` beside `x.jpg` is one convention
       with nothing to keep in step — the `images` note's argument against a numbered column, one
       step along — and `check-reels.js` prints any clip missing one. Only for a path: a Drive id
       has no poster to derive and an absolute URL is somebody else's server. A poster that 404s
       draws nothing, which is exactly what this slide did before, so it degrades to the old
       behaviour rather than to a hole. */
    const poster = /^[a-z]+:/i.test(it.clip) || it.clip.indexOf('/') < 0
      ? '' : String(it.clip).replace(/\.[a-z0-9]+$/i, '') + '.jpg';
    /* `has-photo` FROM THE FIRST PAINT WHERE THERE IS A POSTER, and only there. The note over
       `reelPlay_` says why that class waits for `loadeddata`: the scrim and the white words over a
       slide that is still its own gradient are furniture for a picture that has not arrived. A
       poster IS the picture arriving, so the same sentence puts the class on now — and a clip with
       no poster still waits, exactly as before. */
    return `<div class="feed-art is-clip${poster ? ' has-photo' : ''}" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
      <span class="feed-mark">${esc(initial(it.subject))}</span>
      <video class="feed-vid" data-clip="${esc(it.clip)}"${poster ? ` poster="${esc(poster)}"` : ''}
             playsinline muted loop preload="none"></video>
      <span class="feed-credit"></span>
      ${words}
    </div>`;
  }

  return `<div class="feed-art" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
    <span class="feed-mark">${esc(initial(it.subject))}</span>
    ${/* WHO THE PICTURE BELONGS TO. Empty until one arrives, and it has to be there from the
          start rather than added later — an element appearing under a photograph shifts the card
          the moment somebody starts reading it. */''}
    <span class="feed-credit"></span>
    ${words}
  </div>`;
}
/* ==================================================================================================
   CONNECT 4, OTHELLO AND HERD MENTALITY

   THREE GAMES, ONE SHAPE. Each has an `init` in here, drawn into an id its markup already contains
   — the same arrangement Flabby Pird and Times Tables use, because a fourth way of starting a game
   is a fourth thing to remember when one of them stops working. Connect 4 and Othello are `WIDGETS`
   entries in map.js that name theirs; Herd Mentality is a game inside Word games now, and the
   `herd` row of `WORD_GAMES` names `initHerd` instead.

   NOTHING RUNS BETWEEN TURNS. No animation loop, no timer, no interval — the board is redrawn when
   somebody taps and sits still otherwise. That is why none of these three needs a `stop`, and it is
   worth saying out loud: `stop` exists for Flabby Pird because sixty frames a second behind a screen
   nobody is looking at is a flat battery. A board that only moves when tapped costs nothing parked.
   STILL TRUE NOW CONNECT 4'S COUNTERS FALL: the drop is a CSS animation on the one counter just
   played, which the browser runs once and finishes — there is nothing here to start or to stop.

   THE BOARDS ARE BUTTONS, NOT A CANVAS. A canvas would mean hit-testing taps against pixel
   coordinates and redrawing to show a hover; a grid of real `<button>`s gets the tap target, the
   keyboard, the focus ring and the press animation from the stylesheet, for free and correctly.
================================================================================================== */

/* ---------- CONNECT 4 ----------------------------------------------------------------------------
   SEVEN COLUMNS, SIX ROWS, and the whole column is the target rather than the cell. You do not
   choose a square in this game — you choose a column and gravity chooses the square, so a grid of
   42 taps would be offering 35 choices that do not exist.

   THE OPPONENT IS THREE RULES IN ORDER: win if it can, block if it must, otherwise play towards the
   middle. That is beatable by anybody who is paying attention and unbeatable by anybody who is not,
   which is the right difficulty for a game somebody opens for four minutes between lessons.
--------------------------------------------------------------------------------------------- */
const C4_W = 7, C4_H = 6;
let c4 = null;

/* THE TWO SIDES, NAMED ONCE. The board draws `p1`/`p2` and the line under it says the word — two
   spellings of one fact is what this repository writes about `handle` and `username`, and here it
   would be a red disc announced as yellow. */
const C4_NAME = { 1: 'Red', 2: 'Yellow' };

function initConnect4() {
  const host = $('c4-board');
  if (!host) return;
  /* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS. Coming back to a board you left half-played
     sounds kind and is not: the widget is reopened by a swipe, so "where was I" would be answered
     by a game you had forgotten starting. */
  /* `last` IS THE COUNTER JUST PLAYED, which is the one that falls — see `c4Paint`. `win` is the
     line that ended the game, which is ringed. */
  c4 = { cells: new Array(C4_W * C4_H).fill(0), turn: 1, over: false, said: 'Red starts — tap a column.',
         last: null, win: null };
  c4Paint();
}

const c4At = (x, y) => c4.cells[y * C4_W + x];

/* THE LOWEST EMPTY SQUARE IN A COLUMN, or -1 when it is full. Everything else asks this. */
function c4Drop_(cells, x) {
  for (let y = C4_H - 1; y >= 0; y--) if (!cells[y * C4_W + x]) return y;
  return -1;
}

/* FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter. Eight would be
   double-counting: a line and its reverse are the same line.

   IT RETURNS THE SQUARES, NOT A YES. It answered true or false, so "Red wins." appeared under a
   board that did not say where — and on a full board of 42 discs, finding the four that did it is
   a game of its own. Now it hands back every square of every line of four or more through the
   counter just played (a drop can finish two lines at once, or join two and one into five), and an
   empty list is the old false. */
function c4Line_(cells, x, y, who) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const won = [];
  dirs.forEach(([dx, dy]) => {
    const line = [y * C4_W + x];
    for (const s of [1, -1]) {
      for (let i = 1; i < 4; i++) {
        const nx = x + dx * i * s, ny = y + dy * i * s;
        if (nx < 0 || nx >= C4_W || ny < 0 || ny >= C4_H) break;
        if (cells[ny * C4_W + nx] !== who) break;
        line.push(ny * C4_W + nx);
      }
    }
    if (line.length >= 4) line.forEach(i => { if (won.indexOf(i) < 0) won.push(i); });
  });
  return won;
}

function c4Play_(x) {
  if (!c4 || c4.over) return;
  const y = c4Drop_(c4.cells, x);
  /* A FULL COLUMN PLAYS NOTHING, SO NOTHING FALLS: `last` is not set, and the paint that showed the
     previous counter has already spent it — see `c4Paint`. */
  if (y < 0) { c4.said = 'That column is full.'; return; }
  c4.cells[y * C4_W + x] = c4.turn;
  c4.last = { x, y };
  const line = c4Line_(c4.cells, x, y, c4.turn);
  if (line.length) {
    c4.over = true;
    c4.win = line;
    c4.said = C4_NAME[c4.turn] + ' wins.';
  } else if (c4.cells.every(Boolean)) {
    c4.over = true; c4.said = 'Full board — a draw.';
  } else {
    c4.turn = c4.turn === 1 ? 2 : 1;
    c4.said = C4_NAME[c4.turn] + '\u2019s go.';
  }
}

/* ---------- `c4Reply_` WAS HERE, AND IT WAS THE OPPONENT ------------------------------------------
   THREE RULES IN ORDER — win if it can, block if it must, otherwise play towards the middle — and
   the note above this block argued it was the right difficulty for four minutes between lessons.
   Asked for outright: "connect 4 should be not against pc but 2 player."

   IT IS A BETTER GAME ON THIS APP THAN ON A DESKTOP, which is the half worth keeping: a phone on a
   table between two people is exactly what a board game is, and the thing this widget could never
   be is a second person. `Tools` and `Games` are columns you open beside somebody, and Articulate
   and Charades already work that way.

   THE AI IS DELETED RATHER THAN SWITCHED OFF. A dormant opponent behind a flag is a second mode
   nothing presses, which is `orderPrints` — and the three rules are four lines somebody can write
   again if a solo mode is ever wanted. */

/* ---------- THE COUNTER FALLS, AND THE FOUR THAT WON ARE RINGED --------------------------------------
   ASKED FOR AS "refine connect 4 add dropping animation of counters." A counter used to appear in
   its square: the board is rebuilt through `innerHTML` on every tap, so there was no moment between
   the empty square and the full one for anything to move in.

   SO THE ONE NEW COUNTER IS MARKED, AND CSS DROPS IT. `c4-new` goes on the square just played and
   `--c4-fall` says how many rows it falls — its own row plus one, so it starts one row above the top
   edge, where `.c4`'s `overflow: hidden` keeps it out of sight until it enters. The rebuilt board is
   otherwise identical, so only that counter moves; the forty-one that were already there do not
   twitch. The fall, the small bounce and the reduced-motion exemption are all in style.css.

   `last` IS SPENT BY THE PAINT THAT SHOWS IT. A board painted again for any other reason — a
   refused tap on a full column, a repaint — must not drop the same counter twice, so the mark is
   read once here and cleared.

   THE WIN IS RINGED (`c4-win`) because "Red wins." under a board does not say where. Both class
   names carry the `c4-` prefix for the reason the maze's walls now do: a bare `.new` or `.win` is a
   name any later component can take without knowing, and the maze found out what that costs.

   THE TURN HAS A DISC BESIDE IT, in the side's own colour — two people at one phone glance at the
   line under the board to see whose go it is, and a red disc is read before the word "Red" is. Not
   on a draw, which is nobody's. `aria-hidden`, because the sentence already says the colour. */
function c4Paint() {
  const host = $('c4-board');
  if (!host || !c4) return;
  const last = c4.last;
  c4.last = null;
  const win = c4.win || [];
  let html = '';
  for (let y = 0; y < C4_H; y++) {
    for (let x = 0; x < C4_W; x++) {
      const v = c4At(x, y);
      const fell = last && last.x === x && last.y === y;
      /* THE WHOLE COLUMN IS ONE TARGET, so every square in it carries the same `data-x` and the
         same label. A screen reader hears "column 4" six times rather than 42 unnamed squares. */
      html += `<button class="c4-cell${v ? (v === 1 ? ' p1' : ' p2') : ''}${fell ? ' c4-new' : ''}${
        win.indexOf(y * C4_W + x) >= 0 ? ' c4-win' : ''}" data-do="c4-drop"
        data-x="${x}" aria-label="Column ${x + 1}"${fell ? ` style="--c4-fall:${y + 1}"` : ''}${
        c4.over ? ' disabled' : ''}></button>`;
    }
  }
  host.innerHTML = html;
  const said = $('c4-said');
  if (said) {
    const draw = c4.over && !win.length;
    said.innerHTML = (draw ? '' : `<i class="c4-turn ${c4.turn === 1 ? 'p1' : 'p2'}" aria-hidden="true"></i>`)
      + esc(c4.said);
  }
}

on('c4-drop', el => {
  c4Play_(Number(el.getAttribute('data-x')));
  c4Paint();
});

on('c4-again', () => { initConnect4(); });

/* ---------- OTHELLO ------------------------------------------------------------------------------
   EIGHT BY EIGHT, four in the middle to start, and a move is only legal if it brackets a line of the
   opponent between the square you played and one of yours. That rule is the whole game, so it is
   written once — `othFlips_` returns the squares a move would turn, and everything else asks it:
   the legality of a tap, the list of hints, and the flipping itself.

   PASSING IS PART OF THE RULES, NOT AN ERROR. A player with no legal move misses a turn, and if
   neither can move the game is over — which is how Othello ends with the board not full, and the
   reason the end test is "nobody can move" rather than "no empty squares".
--------------------------------------------------------------------------------------------- */
const OTH_N = 8;
let oth = null;

const OTH_NAME = { 1: 'Red', 2: 'Blue' };

function initOthello() {
  if (!$('oth-board')) return;
  const cells = new Array(OTH_N * OTH_N).fill(0);
  const m = OTH_N / 2;
  cells[(m - 1) * OTH_N + (m - 1)] = 2; cells[(m - 1) * OTH_N + m] = 1;
  cells[m * OTH_N + (m - 1)] = 1;       cells[m * OTH_N + m] = 2;
  oth = { cells, turn: 1, over: false, said: 'Red starts.' };
  othPaint();
}

function othFlips_(cells, i, who) {
  if (cells[i]) return [];
  const x0 = i % OTH_N, y0 = (i / OTH_N) | 0, them = who === 1 ? 2 : 1, out = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue;
    const run = [];
    let x = x0 + dx, y = y0 + dy;
    while (x >= 0 && x < OTH_N && y >= 0 && y < OTH_N && cells[y * OTH_N + x] === them) {
      run.push(y * OTH_N + x); x += dx; y += dy;
    }
    /* THE LINE ONLY COUNTS IF IT IS CLOSED BY ONE OF YOURS. A run that walks off the edge, or into
       an empty square, brackets nothing — which is the half of this rule that is easy to forget. */
    if (run.length && x >= 0 && x < OTH_N && y >= 0 && y < OTH_N && cells[y * OTH_N + x] === who) {
      out.push(...run);
    }
  }
  return out;
}

const othMoves_ = (cells, who) => {
  const out = [];
  for (let i = 0; i < cells.length; i++) if (othFlips_(cells, i, who).length) out.push(i);
  return out;
};

const othScore_ = cells => cells.reduce((a, v) => (v === 1 ? [a[0] + 1, a[1]] : v === 2 ? [a[0], a[1] + 1] : a), [0, 0]);

function othPlay_(i, who) {
  const flips = othFlips_(oth.cells, i, who);
  if (!flips.length) return false;
  oth.cells[i] = who;
  flips.forEach(j => { oth.cells[j] = who; });
  return true;
}

/* WHOSE TURN IT IS NEXT, which is not simply "the other one". */
function othAdvance_() {
  const other = oth.turn === 1 ? 2 : 1;
  if (othMoves_(oth.cells, other).length) { oth.turn = other; oth.said = OTH_NAME[other] + '\u2019s go.'; return; }
  if (othMoves_(oth.cells, oth.turn).length) {
    oth.said = OTH_NAME[other] + ' has no move \u2014 ' + OTH_NAME[oth.turn] + ' goes again.';
    return;                                            // the same player goes again
  }
  oth.over = true;
  const [b, w] = othScore_(oth.cells);
  oth.said = b === w ? `Level, ${b}\u2013${w}.`
           : b > w ? `Red wins, ${b}\u2013${w}.` : `Blue wins, ${w}\u2013${b}.`;
}

/* ---------- `othReply_` WAS HERE, AND SO WERE THE RINGS -------------------------------------------
   CORNERS FIRST, THEN THE BIGGEST FLIP — a real little opponent, and the whole of it is deleted for
   the reason `c4Reply_` is: "should be 2 player not against cpu". Othello across a table is the game
   Othello is.

   AND THE HINTS WENT WITH IT, asked for in the same breath — "dont show the locations players can
   pic". They were argued for as teaching, and the argument does not survive the second player:
   `othMoves_(cells, 1)` is one side's answer, drawn on a board the other side is reading. Working
   out where you may play IS Othello.

   SO EVERY EMPTY SQUARE IS PRESSABLE and an illegal one says why. It was `disabled` unless it was
   a legal move, which is the ring in another form — a screen reader reading the board would have
   heard exactly the same list. A press that does nothing at all is what `check/press.js` exists to
   report, and a line under the board answers the press without answering the question. */

function othPaint() {
  const host = $('oth-board');
  if (!host || !oth) return;
  let html = '';
  for (let i = 0; i < oth.cells.length; i++) {
    const v = oth.cells[i];
    html += `<button class="oth-cell${v === 1 ? ' p1' : v === 2 ? ' p2' : ''}"
      data-do="oth-play" data-i="${i}" aria-label="Row ${((i / OTH_N) | 0) + 1} column ${(i % OTH_N) + 1}"
      ${v || oth.over ? 'disabled' : ''}></button>`;
  }
  host.innerHTML = html;
  const [b, w] = othScore_(oth.cells);
  const sc = $('oth-score'); if (sc) sc.textContent = b + ' \u2013 ' + w;
  const said = $('oth-said'); if (said) said.textContent = oth.said;
}

on('oth-play', el => {
  if (!oth || oth.over) return;
  /* THE TAP IS ALWAYS ANSWERED, and what it says is the rule rather than the answer: "nothing to
     trap there" is true of every illegal square and names none of the legal ones. */
  if (!othPlay_(Number(el.getAttribute('data-i')), oth.turn)) {
    oth.said = 'Nothing to trap there \u2014 ' + OTH_NAME[oth.turn] + ' again.';
    othPaint();
    return;
  }
  othAdvance_();
  othPaint();
});

on('oth-again', () => { initOthello(); });

/* ---------- HERD MENTALITY -----------------------------------------------------------------------
   ONE QUESTION AT A TIME, SHUFFLED. The game is that everybody answers out loud and you score by
   matching the room rather than by being right — so the app's whole job is to hand out a question
   and get out of the way. No timer, no scoring, no turn order: those live at the table, and putting
   them on the phone would make somebody operate the app instead of playing.

   SHUFFLED ONCE, THEN DEALT. Picking at random each tap repeats — with 30 questions the chance of a
   repeat inside ten taps is better than four in five — and a repeat reads as the app being broken.
   A shuffled pack cannot repeat until it is exhausted, and then it reshuffles and says so.

   THE SHEET IS THE AUTHORITY AND THE CODE IS THE FALLBACK, which is the pattern `brand()` sets for
   everything here: fill the `herd` tab and these are replaced without a deploy; leave it empty and
   the game still works. An empty tab must never produce an empty game.
--------------------------------------------------------------------------------------------- */
const HERD_BUILTIN = [
  'Name something you would find in a school bag.',
  'Name a subject that should not exist.',
  'Name something that is always late.',
  'Name a snack that is worth the money.',
  'Name something you would take to a desert island.',
  'Name an animal that would be rubbish as a pet.',
  'Name something everybody says they will do and nobody does.',
  'Name the best day of the week.',
  'Name something that is better cold than hot.',
  'Name a smell that reminds you of school.',
  'Name something you always lose.',
  'Name a film everybody has seen.',
  'Name something that is harder than it looks.',
  'Name a word people spell wrong.',
  'Name something you would never share.',
  'Name a place that is always too cold.',
  'Name something that takes far too long.',
  'Name a sound that makes everybody look up.',
  'Name something you own too many of.',
  'Name a rule everybody breaks.',

  /* ---------- AND EIGHTY MORE, SO THE DECK IS A HUNDRED — AND FOUR HUNDRED MORE AT THE FOOT --
     THE COUNT WAS THE COMPLAINT and the deck was half of it: twenty questions is a deck you
     reach the end of in a lesson, which is what made the round counter under it true enough
     to be annoying. A hundred is a number nobody reaches.

     TEN OF THESE WERE THROWN OUT BEFORE THEY GOT HERE, by a reviewer that had to try to
     refute the deck rather than approve it, and every one of the ten is worth knowing:
     `Name a colour` and `Name a shape` have nothing to decide (blue, and circle-or-square);
     `Name something you would find in a library` has exactly one answer; `Name a reason a
     train is late` rewards knowing rather than guessing, and splits an adult from a child;
     `Name a school trip everybody goes on` and `Name a pudding they serve at school` are
     both the rule about never asking a child what their family has, in a costume; and four
     were near-duplicates of cards already above them. A question with one obvious answer is
     not a herd question, because there is no herd to match. */
  'Name a biscuit.', 'Name a flavour of crisps.', 'Name something people put on toast.',
  'Name a sandwich filling.', 'Name a vegetable children leave on the side of the plate.',
  'Name a topping on a pizza.', 'Name something people put on chips.',
  'Name a pudding that is better with custard.', 'Name a drink for a cold day.',
  'Name a food that is better the next day.',
  'Name something you would never eat for breakfast.', 'Name something that melts too quickly.',
  'Name an animal you would see at the zoo.', 'Name a bird you see in a garden.',
  'Name an animal that is faster than you.', 'Name a farm animal.', 'Name a sea creature.',
  'Name something a dog does that a cat never would.',
  'Name something a teacher says every day.', 'Name something everybody wants the last one of.',
  'Name something you are not allowed to bring into school.',
  'Name a PE activity nobody looks forward to.',
  'Name something every classroom has on the wall.', 'Name an excuse for late homework.',
  'Name something that happens on the last day of term.',
  'Name something sold at a school fair.', 'Name something written on a whiteboard.',
  'Name something everybody borrows and never gives back.',
  'Name a chore nobody volunteers for.', 'Name something found down the back of a sofa.',
  'Name something everybody keeps in a kitchen drawer.',
  'Name something that is always running out.', 'Name a noise a house makes at night.',
  'Name something you would find in a shed.',
  'Name something that only works if you give it a thump.',
  'Name something you would use to prop a door open.', 'Name something you do before bed.',
  'Name something that makes a room feel cosy.', 'Name something the weather ruins.',
  'Name something you need when it rains.', 'Name a month with nothing good in it.',
  'Name something you would find on a British beach.', 'Name something you do on a wet Sunday.',
  'Name a kind of shop on every high street.', 'Name something you see from a bus window.',
  'Name something that is always too hot to eat straight away.',
  'Name something you hear at a railway station.', 'Name something that only happens in summer.',
  'Name something you pack and never use.', 'Name a way to pass the time on a long journey.',
  'Name something that goes wrong on a car journey.', 'Name something you would take camping.',
  'Name a country with better weather than here.', 'Name a way to travel.', 'Name a board game.',
  'Name a playground game.', 'Name a sport played with a ball.',
  'Name something you only ever use once a year.', 'Name a card game.',
  'Name something that is always missing a piece.',
  'Name an instrument that is loud to practise.', 'Name something that takes ages to dry.',
  'Name a number between one and ten.', 'Name something that is always covered in fingerprints.',
  'Name a fairy tale.', 'Name a nursery rhyme.', 'Name a superhero.',
  'Name something that is always tangled.', 'Name a job that starts very early.',
  'Name something that is impossible to open.', 'Name something that is always sticky.',
  'Name something that is never as good as the advert.',
  'Name something that is never charged when you need it.', 'Name something in a first aid kit.',
  'Name something everybody pretends to enjoy.',
  'Name something people say when they are not listening.',
  'Name a phrase adults use far too often.', 'Name something you cannot do quietly.',
  'Name something that is worth queueing for.', 'Name something that is easier with two people.',
  'Name something yellow.', 'Name something round.', 'Name a fruit you would find in a lunchbox.',
  'Name something you eat with a spoon.', 'Name something you eat with your hands.',
  'Name a breakfast cereal.', 'Name a flavour of ice cream.', 'Name a kind of cake.',
  'Name something you would find at a birthday party.', 'Name something you blow.',
  'Name something that bounces.', 'Name something that floats.', 'Name something that sinks.',
  'Name something that rolls.', 'Name something with wheels.', 'Name something with wings.',
  'Name something with a tail.', 'Name something with stripes.', 'Name something with buttons.',
  'Name something with a lid.', 'Name something with a handle.', 'Name something with keys.',
  'Name something that beeps.', 'Name something that ticks.', 'Name something that buzzes.',
  'Name something that rings.', 'Name something that squeaks.',
  'Name something that smells horrible.', 'Name something that is soft.',
  'Name something that is prickly.', 'Name something that is slimy.',
  'Name something that is shiny.', 'Name something that is heavy.',
  'Name something that is very light.', 'Name something that is cold to touch.',
  'Name something that is very quiet.', 'Name something that is very small.',
  'Name something that is enormous.', 'Name something that is very long.',
  'Name something that is always wet.', 'Name something that is red.',
  'Name something that is blue.', 'Name something that is orange.', 'Name something that is purple.',
  'Name something that is black and white.', 'Name something that is brown.',
  'Name something made of wood.', 'Name something made of glass.', 'Name something made of plastic.',
  'Name something made of metal.', 'Name something made of rubber.', 'Name something you can fold.',
  'Name something you can pour.', 'Name something you can squeeze.', 'Name something you can climb.',
  'Name something you can throw.', 'Name something you can catch.', 'Name something you can ride.',
  'Name something you can plant.', 'Name something you can wear on your head.',
  'Name something you can wear on your feet.', 'Name something you wear to the beach.',
  'Name something people wear to a wedding.', 'Name something you wear to bed.',
  'Name a part of your face.', 'Name a part of your body that you have two of.',
  'Name something you do with your feet.', 'Name something you do when you are bored.',
  'Name something you do when you are nervous.', 'Name something you do when you are happy.',
  'Name something you do in the bath.', 'Name something you do at the park.',
  'Name something you do at the beach.', 'Name something you do in the snow.',
  'Name something you do on a sunny day.', 'Name something you do at a sleepover.',
  'Name something you do after school.', 'Name something you do on your birthday.',
  'Name something you do when you cannot sleep.', 'Name something that makes you laugh.',
  'Name something that makes you sneeze.', 'Name something that makes you jump.',
  'Name something that makes you yawn.', 'Name something that makes you hungry.',
  'Name something that makes you thirsty.', 'Name something that is scary in the dark.',
  'Name something that is fun to do with a friend.', 'Name something you find in a fridge.',
  'Name something you find in a bathroom.', 'Name something you find in a garden.',
  'Name something you find in a park.', 'Name something you find in a playground.',
  'Name something you find in a library.', 'Name something you find in a hospital.',
  'Name something you find at a funfair.', 'Name something you find in a forest.',
  'Name something you find in the sky.', 'Name something you find under the sea.',
  'Name something you find in space.', 'Name something you find in a castle.',
  'Name something you find in a toy box.', 'Name something you find in a toolbox.',
  'Name something you find in a handbag.', 'Name something you find in your pocket.',
  'Name something you find in a classroom.', 'Name something you find in a sports bag.',
  'Name something you find on a desk.', 'Name something you find on a Christmas tree.',
  'Name something you find at a bus stop.', 'Name something you find in a cinema.',
  'Name something you find in a swimming pool.', 'Name something you find at a football match.',
  'Name something you find on a pirate ship.', 'Name something you find in a haunted house.',
  'Name something you find in a spaceship.', 'Name an animal that lives in the jungle.',
  'Name an animal that lives in the Arctic.', 'Name an animal that lives in a tree.',
  'Name an animal that can swim.', 'Name an animal that can climb.', 'Name an animal that hops.',
  'Name an animal that is very slow.', 'Name an animal that is very small.',
  'Name an animal with a long neck.', 'Name an animal with a long tail.',
  'Name an animal with big ears.', 'Name an animal that is black and white.',
  'Name an animal people are scared of.', 'Name an animal that sleeps all day.',
  'Name an animal you might see in a garden.', 'Name an animal in a nursery rhyme.',
  'Name a baby animal.', 'Name an insect.', 'Name a creepy-crawly.', 'Name a dinosaur.',
  'Name a dog\'s name.', 'Name a cat\'s name.', 'Name a name for a goldfish.',
  'Name something a dog chews.', 'Name something a cat chases.', 'Name a job where you help people.',
  'Name a job where you work outside.', 'Name a job where you work with animals.',
  'Name a job you would like to try for a day.', 'Name a job in a hospital.',
  'Name a job in a school.', 'Name a job where you drive.', 'Name a job on a film set.',
  'Name a famous wizard.', 'Name a famous bear.', 'Name a famous mouse.', 'Name a famous pig.',
  'Name a famous duck.', 'Name a cartoon character.', 'Name a character from a fairy tale.',
  'Name a baddie from a film.', 'Name a princess.', 'Name a monster.', 'Name a robot from a film.',
  'Name a character in a Christmas story.', 'Name a Roald Dahl book.',
  'Name a film with animals in it.', 'Name a film that makes people cry.',
  'Name a film with a song everybody knows.', 'Name a TV show for children.',
  'Name a cartoon on TV.', 'Name a song everybody knows the words to.',
  'Name a song you sing at a party.', 'Name a dance.', 'Name a musical instrument you blow.',
  'Name a musical instrument with strings.', 'Name a sport you do in water.',
  'Name a sport you do on your own.', 'Name a sport with a net.', 'Name a sport in the Olympics.',
  'Name a sport people watch on TV.', 'Name a football team.', 'Name something a footballer does.',
  'Name something at sports day.', 'Name a game you play in the car.',
  'Name a game you play at Christmas.', 'Name a game you play with dice.',
  'Name a game with a chasing part.', 'Name a toy that needs batteries.',
  'Name a toy that is older than you.', 'Name a type of puzzle.', 'Name something you build with.',
  'Name something you colour with.', 'Name something you draw.', 'Name something that has a face but is not a person.',
  'Name a number people think is lucky.', 'Name a number bigger than a hundred.',
  'Name a word that rhymes with light.', 'Name a word that starts with Z.',
  'Name a word that means big.', 'Name a word that means happy.', 'Name a word you shout.',
  'Name something you say on the phone.', 'Name something you say when you meet someone.',
  'Name something you say when you are sorry.', 'Name something you say when you hurt yourself.',
  'Name something parents say too often.', 'Name something children say too often.',
  'Name something teachers say when it is noisy.', 'Name something you say at the dinner table.',
  'Name a way to say hello.', 'Name a greeting in another language.', 'Name a country.',
  'Name a country in Europe.', 'Name a famous building.', 'Name a place people visit in London.',
  'Name a planet.', 'Name something in the solar system.', 'Name something about the Moon.',
  'Name something you see in winter.', 'Name something you see in spring.',
  'Name something you see in autumn.', 'Name something you do on a bike.', 'Name a day people look forward to.',
  'Name something you celebrate.', 'Name a festival.', 'Name something you eat at a party.',
  'Name something you eat on bonfire night.', 'Name something you eat at the cinema.',
  'Name something you eat at the seaside.', 'Name something you eat for lunch.',
  'Name something you eat for tea.', 'Name something you eat cold.', 'Name something you dip.',
  'Name something you peel.', 'Name something you crunch.', 'Name something you bake.',
  'Name something you fry.', 'Name something you boil.', 'Name something you grate.',
  'Name something you put in soup.', 'Name something you put in a smoothie.',
  'Name something you put on a pizza that is a bit odd.', 'Name something you put in a pie.',
  'Name something on a burger.', 'Name a fruit.', 'Name a vegetable.', 'Name a berry.',
  'Name a nut.', 'Name something made from eggs.', 'Name something made from milk.',
  'Name something made from flour.', 'Name something made with chocolate.', 'Name a crunchy snack.',
  'Name a drink.', 'Name a juice.', 'Name a sauce.', 'Name something that is sour.',
  'Name something that is salty.', 'Name something that is sweet.',
  'Name a food that is bright green.', 'Name a food that is white.', 'Name a food children hate.',
  'Name a food people argue about.', 'Name something that goes with fish.',
  'Name something that goes with beans.', 'Name something in a picnic basket.',
  'Name a room in a house.', 'Name something in a bedroom.', 'Name something in a kitchen.',
  'Name something in a living room.', 'Name something on a wall.', 'Name something on a shelf.',
  'Name something in a cupboard.', 'Name something under a bed.',
  'Name something by the front door.', 'Name something you plug in.',
  'Name something that needs batteries.', 'Name something with a switch.',
  'Name something that goes round and round.', 'Name something that goes up and down.',
  'Name something that opens and shuts.', 'Name something you turn.', 'Name something you push.',
  'Name something you press.', 'Name something you tie.', 'Name something you zip.',
  'Name something you wash.', 'Name something you fix.', 'Name something you share.',
  'Name something you collect.', 'Name something you count.', 'Name something you keep in a box.',
  'Name something you keep in your bag.', 'Name something you keep in a drawer.',
  'Name something you forget to bring.', 'Name something you lose at school.',
  'Name something that breaks easily.', 'Name something that gets dirty quickly.',
  'Name something that goes mouldy.', 'Name something that needs a password.',
  'Name something that is hard to carry.', 'Name something that is hard to draw.',
  'Name something that is hard to spell.', 'Name something that is hard to say.',
  'Name something that is easy to learn.', 'Name something you learn in primary school.',
  'Name something you learn to do as a baby.', 'Name something you learn to ride.',
  'Name a times table people find hard.', 'Name a school subject with lots of homework.',
  'Name something in a science lab.', 'Name something you do in art.',
  'Name something you do in music.', 'Name something you learn in history.',
  'Name something you learn in geography.', 'Name a school rule.', 'Name a school club.',
  'Name something in a school assembly.', 'Name something teachers carry.',
  'Name a reason to go to the office at school.', 'Name something that happens on a snow day.',
  'Name something you see on the way to school.', 'Name something in a fairy tale forest.',
  'Name something a witch has.', 'Name something a pirate has.', 'Name something a knight has.',
  'Name something a clown has.', 'Name something a chef has.', 'Name something a doctor has.',
  'Name something a builder has.', 'Name something a firefighter has.',
  'Name something a baby needs.', 'Name something a dog needs.', 'Name something a snowman has.',
  'Name something a superhero wears.', 'Name something the tooth fairy leaves.',
  'Name something the Easter bunny brings.', 'Name something on a birthday cake.',
  'Name something in a party bag.', 'Name a fancy dress costume.',
  'Name something scary at Halloween.', 'Name something you see at a firework display.',
  'Name something you see at a circus.', 'Name something you see at the aquarium.',
  'Name something you see at a train station.', 'Name something you see in a garden centre.',
  'Name something you see at the vet.', 'Name something you see in the countryside.',
  'Name something you see on a motorway.', 'Name something you see in a river.',
  'Name something you see at night.', 'Name something you hear in the morning.',
  'Name something you hear at the seaside.', 'Name something you hear in a classroom.',
  'Name something you hear in a kitchen.', 'Name something you hear at a football match.',
  'Name something that comes in pairs.', 'Name something that comes in a tin.',
  'Name something that comes in a jar.', 'Name something that comes in a box.',
  'Name something that has a hole in it.', 'Name something that has a lot of legs.',
  'Name something that has feathers.', 'Name something that has scales.',
  'Name something that has a shell.', 'Name something that grows.', 'Name something that shrinks.',
  'Name something that changes colour.', 'Name something that goes pop.',
  'Name something that goes bang.', 'Name something that falls from the sky.',
  'Name something that flies.', 'Name something that swims.', 'Name something that crawls.',
  'Name something that glows in the dark.', 'Name something that is always cold.',
  'Name something that is always hot.', 'Name something that is always changing.',
  'Name something that is always full.', 'Name something that is always empty.',
  'Name something you should not touch.', 'Name something you should never run with.',
  'Name something you should always wash.', 'Name something that is good for you.',
  'Name something that keeps you warm.', 'Name something that keeps you cool.',
  'Name something that keeps you dry.', 'Name something that wakes you up.',
  'Name something that cheers you up.', 'Name something you do to get fit.',
  'Name something you do to relax.', 'Name something that is nice to give.',
  'Name something that is nice to hear.', 'Name something that is nice to smell.',
  'Name a way to say thank you.', 'Name a way to make a friend.', 'Name a good name for a robot.',
  'Name a good name for a dragon.', 'Name a good name for a unicorn.',
  'Name a good name for a spaceship.', 'Name a good name for a band.',
  'Name a good name for a café.', 'Name a good name for a school hamster.',
  'Name a good name for a new sweet.'
];

let herd = null;

/* FISHER–YATES, NOT `sort(() => Math.random() - 0.5)`. The sort trick is the famous wrong one: the
   comparator is inconsistent, so the result is neither uniform nor stable and some browsers barely
   move the list at all. Twelve characters more for a shuffle that is actually a shuffle. */
function herdShuffle_(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function herdPack_() {
  /* THE SHEET FIRST, AND ONLY IF IT SAYS ANYTHING. `|| []` then a length test rather than `||` on
     the array itself: an empty tab arrives as an empty array, which is truthy, so it would replace
     the built-ins with nothing and leave the game blank. */
  const rows = ((typeof DATA !== 'undefined' && DATA.herd) || [])
    .filter(r => r && r.active !== false && String(r.question || '').trim())
    .map(r => String(r.question).trim());
  return rows.length ? rows : HERD_BUILTIN;
}

/* ---------- THERE IS NO ROUND, AND THERE NEVER SHOULD HAVE BEEN ONE ------------------------------
   REPORTED AS "herd mentality shouldnt be that 20 question round thing. should be much simpler,
   just questions on random. and random each time."

   THE COUNTER WAS THE WHOLE OF IT. The deal was already a Fisher-Yates shuffle and already
   reshuffled at the end, so the questions really were random — and the card said `3 of 20 · round
   2` underneath them, which is a scoreboard for a game that has no score and turns an endless
   deal into a twenty-question test you are part-way through. A number on screen is a claim that
   the number matters.

   SO THE COUNT IS GONE AND THE DEAL IS UNCHANGED. Shuffled, dealt one at a time, reshuffled when
   it runs out — which with five hundred questions is a thing nobody reaches in a lesson. The shuffle
   is still Fisher-Yates and the reason is still the one above it: a bag beats picking at random
   every tap, because picking at random repeats, and a question you have just answered coming
   straight back is the one thing that reads as broken. */
function initHerd() {
  if (!$('herd-q')) return;
  herd = { pack: herdShuffle_(herdPack_()), at: 0 };
  herdPaint();
}

function herdPaint() {
  const q = $('herd-q');
  if (!q || !herd) return;
  q.textContent = herd.pack[herd.at] || '';
}

on('herd-next', () => {
  if (!herd) return;
  herd.at++;
  /* RESHUFFLED WHEN IT RUNS OUT, silently. Nothing says so, because nothing needs to: five hundred
     questions later is not a moment anybody is keeping track of. */
  if (herd.at >= herd.pack.length) {
    herd.pack = herdShuffle_(herdPack_());
    herd.at = 0;
  }
  herdPaint();
});

/* ---------- MAZE -------------------------------------------------------------------------------
   A GRID, FOUR WALLS PER CELL, AND EXACTLY ONE WAY THROUGH. Carved by a depth-first walk that never
   revisits a cell, which is what makes the result a TREE: between any two squares there is one path
   and no loops, so the maze is always solvable and never has a shortcut somebody could stumble onto.

   IT IS NOT SWIPED, AND THAT IS THE ONE DESIGN DECISION WORTH THE SPACE. Up, down, left and right
   are exactly the four gestures this app navigates by -- a maze that read them would fight the
   pager on the one screen it lives on, and the loser would be the swipe, which is how you get to
   every other widget. `touch-action` cannot help: the column and the card need the same four
   directions. So it is a pad of four buttons, each a real fingertip, and the arrow keys for anybody
   on a keyboard. CLAUDE.md records what a blanket `touch-action` cost on the notepad; this is the
   same argument made before rather than after.

   THE SHORTEST WAY IS COUNTED, NOT GUESSED. A breadth-first walk from the entrance gives the fewest
   moves that can possibly solve it, so "out in 52, the shortest way is 38" is a fact about the maze
   rather than a score invented to have one. It is computed when the maze is built, so finishing
   costs nothing.

   THE TRAIL IS THE WHOLE PLAYABILITY ON A PHONE. Eleven squares across a card is about 24 pixels
   each, and without a mark of where you have been a dead end looks exactly like a corridor you have
   not tried. Faint, because it is a memory aid rather than part of the maze.
--------------------------------------------------------------------------------------------- */
const MAZE_N = 11;
/* ONE BIT PER WALL, so a cell is a number and carving is two lines. Read as compass points
   everywhere below, which is why the pad's buttons carry the same four letters. */
const MZ_N = 1, MZ_E = 2, MZ_S = 4, MZ_W = 8;
const MZ_DIRS = {
  n: { dx: 0, dy: -1, bit: MZ_N, back: MZ_S },
  e: { dx: 1, dy: 0, bit: MZ_E, back: MZ_W },
  s: { dx: 0, dy: 1, bit: MZ_S, back: MZ_N },
  w: { dx: -1, dy: 0, bit: MZ_W, back: MZ_E }
};
let maze = null;

const mzAt_ = (x, y) => y * MAZE_N + x;
const mzIn_ = (x, y) => x >= 0 && x < MAZE_N && y >= 0 && y < MAZE_N;

/* EVERY WALL UP, THEN A WALK THAT KNOCKS THEM DOWN. Iterative rather than recursive: a 121-cell
   maze is fine either way and a bigger one would not be, and a stack written out is a stack you can
   see the size of. */
function mzBuild_() {
  const cells = new Array(MAZE_N * MAZE_N).fill(MZ_N | MZ_E | MZ_S | MZ_W);
  const seen = new Array(MAZE_N * MAZE_N).fill(false);
  const stack = [[0, 0]];
  seen[0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    /* THE NEIGHBOURS NOT YET REACHED, shuffled, because taking them in a fixed order carves the
       same maze every time and taking the first one always carves a staircase. */
    const open = Object.keys(MZ_DIRS).filter(k => {
      const d = MZ_DIRS[k];
      return mzIn_(x + d.dx, y + d.dy) && !seen[mzAt_(x + d.dx, y + d.dy)];
    });
    if (!open.length) { stack.pop(); continue; }
    const k = open[Math.floor(Math.random() * open.length)];
    const d = MZ_DIRS[k];
    const nx = x + d.dx, ny = y + d.dy;
    /* BOTH SIDES OF THE SAME WALL. A wall belongs to two cells and removing it from one leaves a
       door you can walk through in one direction only — which draws correctly and plays wrongly. */
    cells[mzAt_(x, y)] &= ~d.bit;
    cells[mzAt_(nx, ny)] &= ~d.back;
    seen[mzAt_(nx, ny)] = true;
    stack.push([nx, ny]);
  }
  return cells;
}

/* THE FEWEST MOVES THERE ARE. Breadth-first, so the first time the exit is reached is by the
   shortest route — depth-first would find A route and call it the answer. */
function mzShortest_(cells) {
  const dist = new Array(MAZE_N * MAZE_N).fill(-1);
  const q = [0];
  dist[0] = 0;
  for (let i = 0; i < q.length; i++) {
    const at = q[i], x = at % MAZE_N, y = (at / MAZE_N) | 0;
    Object.keys(MZ_DIRS).forEach(k => {
      const d = MZ_DIRS[k];
      if (cells[at] & d.bit) return;                       // a wall is not a way out
      const nx = x + d.dx, ny = y + d.dy;
      if (!mzIn_(nx, ny) || dist[mzAt_(nx, ny)] !== -1) return;
      dist[mzAt_(nx, ny)] = dist[at] + 1;
      q.push(mzAt_(nx, ny));
    });
  }
  return dist[MAZE_N * MAZE_N - 1];
}

/* ---------- A MAZE IS KEPT UNTIL IT IS FINISHED, OR UNTIL `New maze` ------------------------------
   IT WAS REBUILT FROM NOTHING EVERY TIME THE WIDGET STARTED, for the reason `initConnect4` gives:
   the widget is reopened by a swipe, so a half-walked maze would be answering "where was I" about a
   game you had forgotten starting. That argument is about a swipe. What it also caught was a
   REPAINT — `startScreen_` starts every widget on the column again whenever a payload lands or
   anything saves — and measured, a repaint mid-walk dealt different cells and put you back at the
   top left with nought moves, under a finger that was halfway to the exit. Word Search, Scramble
   and Scrabble all keep theirs; this was the one that did not.

   SO `start` KEEPS A MAZE THAT IS STILL BEING WALKED and deals only when there is none or the last
   one is finished — a finished maze has nothing left to do but be replaced, and the next time the
   column starts is the natural moment. `New maze` is the one thing that throws a walk away, which
   is the one thing that should. */
function initMaze() {
  if (!$('maze-grid')) return;
  if (!maze || maze.over) mzDeal_();
  mazePaint();
}

function mzDeal_() {
  const cells = mzBuild_();
  /* NOTHING SAID AT THE START, because the line under the heading already says where you are going
     and this sat under it repeating it word for word -- which is the fault CLAUDE.md records where
     every widget printed its own name twice. It speaks when there is something to say. */
  maze = { cells, x: 0, y: 0, moves: 0, best: mzShortest_(cells),
           trail: { 0: true }, over: false, said: '' };
}

function mzMove_(k) {
  if (!maze || maze.over) return;
  const d = MZ_DIRS[k];
  if (!d) return;
  /* A WALL STOPS YOU AND SAYS NOTHING. Every other game here answers an illegal move by ignoring
     it; a maze that announced "there is a wall there" would be saying what the screen already
     shows, once per attempt, which is most of playing one. */
  if (maze.cells[mzAt_(maze.x, maze.y)] & d.bit) return;
  const nx = maze.x + d.dx, ny = maze.y + d.dy;
  if (!mzIn_(nx, ny)) return;
  maze.x = nx; maze.y = ny;
  maze.moves++;
  maze.trail[mzAt_(nx, ny)] = true;
  if (nx === MAZE_N - 1 && ny === MAZE_N - 1) {
    maze.over = true;
    maze.said = maze.moves === maze.best
      ? 'Out in ' + maze.moves + ' — the shortest way there is.'
      : 'Out in ' + maze.moves + '. The shortest way is ' + maze.best + '.';
  }
}

function mazePaint() {
  const host = $('maze-grid');
  if (!host || !maze) return;
  let html = '';
  for (let y = 0; y < MAZE_N; y++) {
    for (let x = 0; x < MAZE_N; x++) {
      const v = maze.cells[mzAt_(x, y)];
      /* THE WALLS ARE `mz-n`/`mz-e`/`mz-s`/`mz-w`, AND THEY WERE `wn`/`we`/`ws`/`ww`. Reported as
         "maz game is glitched." The word search arrived with its grid on the bare class `.ws` —
         `display: grid`, a top margin and a max width — and every maze cell with a south wall
         carried `ws` too, so 71 of 121 cells became small grids of their own: 16.6px tall in a
         24.7px row, doubled walls, walls that did not meet, gaps in the outer edge and a squashed
         gold square. Nothing threw and nothing overflowed. A two-letter class with no prefix is a
         name any later component can take without knowing, so the prefix is the fix rather than
         renaming the word search: the maze's own names now say whose they are. */
      const cls = ['mz-cell'];
      if (v & MZ_N) cls.push('mz-n');
      if (v & MZ_E) cls.push('mz-e');
      if (v & MZ_S) cls.push('mz-s');
      if (v & MZ_W) cls.push('mz-w');
      if (maze.trail[mzAt_(x, y)]) cls.push('been');
      if (x === maze.x && y === maze.y) cls.push('you');
      if (x === MAZE_N - 1 && y === MAZE_N - 1) cls.push('out');
      html += '<i class="' + cls.join(' ') + '"></i>';
    }
  }
  /* NOT A LIST OF 121 SQUARES TO A SCREEN READER. The cells are decoration for the one fact that
     matters, which is where you are and how far there is to go — so the grid says that in a
     sentence and the squares are hidden from it. */
  host.innerHTML = html;
  host.setAttribute('aria-label',
    'Maze, row ' + (maze.y + 1) + ' of ' + MAZE_N + ', column ' + (maze.x + 1) + ' of ' + MAZE_N
    + (maze.over ? ', out' : ''));
  const said = $('maze-said'); if (said) said.textContent = maze.said;
  const n = $('maze-moves'); if (n) n.textContent = String(maze.moves);
}

on('maze-go', el => { mzMove_(el.getAttribute('data-d')); mazePaint(); });
on('maze-again', () => { mzDeal_(); mazePaint(); });

/* THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU. Guarded on the press not
   being inside a field — arrows in a textarea move the caret, and a game stealing that would break
   typing on a screen it is not even on.

   "IN FRONT OF YOU" WAS `$('maze-grid')` EXISTING, AND IT EXISTS ALMOST EVERYWHERE. All of the
   Games column's pages are built, it is drawn whenever Tools or Saved is beside you, and its
   markup stays in the document once drawn. Measured: two arrow presses on the Find column moved a
   maze nobody could see. So it asks `dropOnFront_` in book.js — "on the screen you are on, on the
   page in front of you", which is exactly this question; it was written for the dropdown panel and
   outlived it (note 315), so there is still one copy of it — and asks it of every copy of the grid,
   because a starred maze is on the Saved column too.

   AND ONE KEY IS ONE MOVE. The pager listens for the same four keys on `window`, which this
   `document` listener runs before — and measured on the maze page, ArrowDown walked the maze AND
   turned the column to the next widget. So while a maze is being walked in front of you the arrows
   are the maze's, `stopPropagation` keeps them from the pager, and that holds when a wall stops the
   move too: a key that moved you on one press and threw you off the page on the next would be
   worse than either. A FINISHED maze gives them back, so arrowing away from "Out in 38" works. */
function mzInFront_() {
  if (typeof AT === 'undefined') return false;
  const sheet = $('sheet');
  if (sheet && !sheet.classList.contains('hidden')) return false;
  return [...document.querySelectorAll('[id="maze-grid"]')].some(g => (typeof dropOnFront_ === 'function'
    ? dropOnFront_(g)
    : !!(g.closest('.screen') && g.closest('.screen').id === 's-' + AT)));
}

document.addEventListener('keydown', e => {
  if (!maze || maze.over) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t && (t.isContentEditable || (t.closest && t.closest('input, textarea, select')))) return;
  const k = { ArrowUp: 'n', ArrowRight: 'e', ArrowDown: 's', ArrowLeft: 'w' }[e.key];
  if (!k || !mzInFront_()) return;
  e.preventDefault();
  e.stopPropagation();
  mzMove_(k);
  mazePaint();
});

/* ==================================================================================================
   SENTENCE SCRAMBLE — the words of one sentence, cut up and shuffled; tap them back into order.

   ASKED FOR AS "Sentence Scramble - Groups race to arrange cut-up paper words into a grammatically
   correct sentence." The paper version is a sentence cut into words with scissors, and that decides
   what a chip carries: THE WORD AS IT WAS PRINTED, capital letter, comma and full stop included. A
   strip of paper keeps its punctuation, and the capital on the first word and the full stop on the
   last are the two clues every child uses first — they are part of the game, not a giveaway.

   ONE AREA OF CHIPS THAT NEVER MOVES, and the sentence being built written out above it. Two areas
   — a pool and a line the chips travel into — is the paper version laid out faithfully and it is two
   blocks of 44px rows on a card a phone has 534px for; and a chip that leaves the pool reflows every
   chip after it, so the word your finger was going for next has moved. A used chip stays where it
   was, dimmed, and tapping it again takes that word back out of the sentence. Nothing jumps.

   MORE THAN ONE RIGHT ORDER IS A REAL CASE, and the owner's brief says so: a sentence whose words can
   be validly arranged more than one way must accept every one of them or not be in the list. An
   entry that is an ARRAY is the sentence followed by its other valid orders, and `ssRight_` accepts
   any of them. `check-widgets.js` refuses an alternative that is not the same chips, because an
   alternative that uses a word the pool does not have is one nobody can ever build.

   WHAT WAS WEEDED OUT, so the next sentence added is held to the same rule. A sentence where two
   noun phrases can swap and still make sense ("The teacher thanked the student"), a floating adverb
   ("quickly", "loudly", "carefully" mid-sentence), an adjective that fits either noun, or two names
   in symmetric roles — each of those is a sentence with a second right answer that a child would be
   told is wrong. Each was either rewritten until only one order makes sense, or listed with its
   alternative. A grammatical NONSENSE order ("The oven took the bread out of the baker") is marked
   wrong, and that is the right answer: the brief is a sentence that is correct, not merely parsed.

   NO TIMER AND NO SCORE, for the reason Herd Mentality gives: "Groups race" is the people at the
   table racing each other, and the race is theirs to run. The app deals, checks, and deals again.

   THE SENTENCE SURVIVES A REPAINT, which is Scrabble's rule: `repaint` runs whenever a payload lands,
   and a half-built sentence that dealt itself again would throw away what somebody had tapped. New
   sentence or Skip is the only thing that throws one away.
================================================================================================== */
const SS_BANDS = [['KS2', 'KS2 · ages 7–11'], ['KS3', 'KS3 · ages 11–14'], ['KS4', 'KS4 · GCSE']];

const SS_SENTENCES = {
  /* KS2 — simple and compound sentences, fronted adverbials with their comma, relative clauses,
     apostrophes, questions, commands and exclamations: what the Year 3–6 grammar list asks for. */
  KS2: [
    'My sister plays the piano every evening.',
    'The hungry fox crept towards the henhouse.',
    'We packed our bags because the bus was leaving early.',
    'After lunch, the children played football on the field.',
    'Can you pass me the salt, please?',
    'Remember to close the door when you leave.',
    'What a beautiful rainbow that is!',
    'The boy who lost his shoe hopped all the way home.',
    'Our class visited the museum, which was full of dinosaur bones.',
    'Mum’s car would not start this morning.',
    'The dog’s tail wagged when he saw his lead.',
    'Although it was raining, we went for a walk.',
    'I could not sleep, so I read my book.',
    'The swimmers dived into the pool at the sound of the whistle.',
    'Please wash your hands before dinner.',
    'The children’s paintings were hung in the hall.',
    'If you are tired, you should go to bed.',
    'Grandpa told us a story about a dragon.',
    'The cake, which Dad baked, was delicious.',
    'Our teacher smiled because everyone had finished their work.',
    'Have you ever seen a shooting star?',
    'The kite flew high above the trees.',
    'Lily’s brother is taller than her.',
    'The farmer fed the pigs before breakfast.',
    'Carefully, she carried the eggs across the kitchen.',
    'There are seven days in a week.',
    'Tom kicked the ball and it smashed the window.',
    ['The baby giggled when the puppy licked her face.',
     'The puppy giggled when the baby licked her face.'],
    'We will visit our cousins in the summer holidays.',
    'My favourite subject at school is science.',
    'The moon lit up the path through the woods.',
    'When the bell rang, everyone rushed outside.',
    'Have you finished your homework yet?',
    'The giant’s footsteps shook the ground.',
    'Stop running in the corridor!',
    'Ben, who is my best friend, lives next door.',
    'The flowers grew tall because they had lots of sunshine.',
    'She wasn’t hungry, so she didn’t eat her lunch.',
    'Owls hunt for mice at night.',
    'The pirate buried his treasure on a deserted island.',
    'I’ve lost my pencil case again!',
    'The bus driver waited for the last passenger.',
    'Despite the wind, the boat reached the harbour safely.',
    'Those muddy boots belong to my dad.',
    'A spider spun a web in the corner of the room.',
    'We clapped at the end of the show.',
    'Where did you put the scissors?',
    'The rabbit hopped out of its burrow and sniffed the air.',
    'Everyone cheered as the winner crossed the line.',
    'My grandma knits warm jumpers for the whole family.',
    'The library is closed on Sundays.',
    'Because he was late, Sam ran to school.',
    'The ice cream melted in the hot sun.',
    'Our neighbour’s cat climbed onto the shed roof.',
    'How many legs does a spider have?',
    'The knight drew his sword and charged at the dragon.',
    'Mum asked me to tidy my bedroom.',
    ['The leaves turn orange and fall in autumn.', 'The leaves fall and turn orange in autumn.'],
    'It was so cold that the pond froze.',
    'The hedgehog curled into a tight ball.',
    'Did you remember to feed the fish?',
    'Running across the playground, Mia tripped over her laces.',
    'The postman left a parcel by the front door.',
    'Is it your turn to walk the dog?',
    'The tallest tower in the city has fifty floors.',
    'Wait for the green man before you cross.',
  ],
  /* KS3 — subordinate and relative clauses, the passive, conditionals, semicolons, inversion for
     emphasis, and lists with their commas. */
  KS3: [
    'The cake sank because the oven had not been heated properly.',
    'Having finished the race, the runners collapsed onto the grass.',
    'The castle, which was built in 1066, still stands today.',
    'If I had known about the party, I would have come.',
    'The novel was written by a teenager in just six weeks.',
    'She was nervous; nevertheless, she stepped onto the stage.',
    'Not only did he win, but he also broke the record.',
    'The volcano erupted without warning, destroying several villages.',
    'Although the film was long, nobody in the audience left early.',
    'The detective examined the footprints that had been left in the mud.',
    'Climate change is affecting wildlife all over the world.',
    'My uncle, a keen gardener, grows his own vegetables.',
    'Whoever finishes first will receive a prize.',
    'The students were told to bring a calculator and a ruler.',
    'Unless you apologise, she will never speak to you again.',
    'The bridge, which had stood for centuries, collapsed in the flood.',
    'Rarely have I seen such a spectacular sunset.',
    'The ancient Egyptians built pyramids as tombs for their kings.',
    'We could hear the waves crashing against the rocks below.',
    'The scientist, who had worked through the night, made a breakthrough.',
    'Despite being injured, the goalkeeper refused to leave the pitch.',
    ['The museum is closed while the new gallery is being built.',
     'The new gallery is closed while the museum is being built.'],
    'Tired and hungry, the explorers set up camp for the night.',
    'The more you practise, the better you become.',
    'Shakespeare wrote many of his plays for the Globe Theatre.',
    'The puppy, which had been abandoned, was adopted by a kind family.',
    'As soon as the alarm sounded, the building was evacuated.',
    'The witness claimed that she had seen a man running away.',
    ['Plants need light, water and carbon dioxide to grow.',
     'Plants need light, carbon dioxide and water to grow.'],
    'The teacher, smiling, handed back the test papers.',
    ['Neither the coach nor the players expected the result.',
     'Neither the players nor the coach expected the result.'],
    'The village was cut off after heavy snow blocked the roads.',
    'Some people believe that the house is haunted.',
    'The athlete trained every day so that she could compete in the Olympics.',
    'Wearing a disguise, the spy slipped past the guards.',
    'The town’s oldest resident celebrated her hundredth birthday.',
    'It is important to drink plenty of water during exercise.',
    'The storm had passed, but fallen trees blocked every road.',
    'When the curtain rose, the audience fell silent.',
    'The fossil, discovered by a schoolgirl, is millions of years old.',
    ['You should revise regularly rather than cramming the night before.',
     'You should regularly revise rather than cramming the night before.'],
    'The cheetah is the fastest land animal in the world.',
    'Should you need any help, please ask a member of staff.',
    'The ship sank after it struck an iceberg.',
    ['Many of the trees in the forest were planted a century ago.',
     'Many of the trees were planted in the forest a century ago.'],
    'The company apologised for the delay and offered a refund.',
    'Having read the instructions, I assembled the bookshelf.',
    'There is no evidence that the vaccine causes harm.',
    'The poem describes a soldier’s memories of the war.',
    'Because the river had flooded, the match was postponed.',
    'The headteacher announced that the school would close early.',
    'Hardly anyone noticed when the lights went out.',
    'The recipe calls for two eggs, flour and a pinch of salt.',
    'The orchestra played so beautifully that some people cried.',
    'Our planet is the only one known to support life.',
  ],
  /* KS4 — the sentences a GCSE essay is built from: participle and absolute phrases, the subjunctive,
     inversion after a negative, colons and semicolons, and the vocabulary of literature and science
     answers. */
  KS4: [
    'Had the government acted sooner, thousands of lives might have been saved.',
    'The evidence suggests that the fire was started deliberately.',
    'Macbeth’s ambition, fuelled by the witches’ prophecy, leads to his downfall.',
    'It is essential that every student submit their coursework on time.',
    'The writer uses pathetic fallacy to reflect the character’s despair.',
    'Not until the final chapter is the murderer’s identity revealed.',
    'Social media, despite its benefits, can have a harmful effect on teenagers.',
    ['The results were inconclusive; further research is therefore required.',
     'The results were inconclusive; therefore further research is required.'],
    ['Whereas the first poem celebrates nature, the second presents it as threatening.',
     'Whereas the second poem celebrates nature, the first presents it as threatening.'],
    'Scrooge, once bitter and lonely, is transformed by the end.',
    'The protesters demanded that the factory be closed immediately.',
    'Only by working together can we solve the climate crisis.',
    'The narrator’s use of the first person creates a sense of intimacy.',
    'Inflation rose sharply, causing the price of food to increase.',
    'Were the bridge to collapse, the town would be cut off completely.',
    'The data, which was collected over ten years, reveals a clear trend.',
    'Although she was offered a promotion, she chose to retire.',
    'The author presents the city as a place of danger and corruption.',
    'The candidate who receives the most votes will become mayor.',
    'Language is constantly evolving, as new words enter everyday use.',
    'The theme of isolation is explored throughout the play.',
    'Under no circumstances should the fire doors be left open.',
    'The reaction speeds up when the temperature is increased.',
    'In the final stanza, the speaker reflects on what has been lost.',
    'Priestley uses the Inspector as a mouthpiece for his own views.',
    'The industrial revolution transformed the way people lived and worked.',
    'So convincing was his argument that the jury acquitted him.',
    ['The juxtaposition of light and dark highlights the contrast between good and evil.',
     'The juxtaposition of dark and light highlights the contrast between good and evil.'],
    'What the tragedy ultimately reveals is the destructive power of jealousy.',
    'Exercise not only improves fitness but also reduces stress.',
    'The colonies gained independence after decades of resistance.',
    'Despite repeated warnings, the climbers continued towards the summit.',
    'Her refusal to conform makes her a symbol of rebellion.',
    'The lower the temperature, the slower the particles move.',
    'Having been rejected by society, the creature seeks revenge.',
    'It could be argued that the ending is deliberately ambiguous.',
    'The report, published last week, criticises the government’s response.',
    'Never before had the village witnessed such a celebration.',
    'The metaphor suggests that memory is both fragile and precious.',
    'Carbon dioxide is released when fossil fuels are burned.',
    'If the treaty had been signed, the war might have been avoided.',
    'The speaker’s tone shifts from anger to acceptance.',
    'Unemployment, which had been falling, began to rise again.',
    'The poet’s use of enjambment mirrors the flow of the river.',
    'Tybalt’s death marks the turning point of the play.',
    'Antibiotics are ineffective against viruses because viruses lack cells.',
    'To what extent is Lady Macbeth responsible for the murder?',
    'The government introduced the policy, hoping to reduce traffic.',
    'The setting, a remote island, heightens the sense of danger.',
    'Few could have predicted how quickly the empire would fall.',
    'Although widely praised, the film failed to make a profit.',
    'The second law of thermodynamics states that entropy always increases.',
  ],
};

/* THE WORDS OF AN ENTRY, AS CHIPS. Split on spaces and nothing else, so a comma or a full stop stays
   on the word it was printed against — which is what a strip of cut paper does. */
function ssOrders_(entry) {
  return (Array.isArray(entry) ? entry : [entry]).map(s => String(s).trim().split(/\s+/));
}

/* RIGHT IF IT IS ANY OF THE STATED ORDERS, compared word by word as TEXT rather than chip by chip, so
   two chips that both say "the" are interchangeable — which they are on paper too. */
function ssRight_(entry, words) {
  const got = (words || []).join(' ');
  return ssOrders_(entry).some(o => o.join(' ') === got);
}

/* HOW MANY WORDS FROM THE START ARE RIGHT, against whichever stated order agrees for longest. That is
   the one hint the card gives, and it is the one a teacher gives: "you're right up to here". */
function ssPrefix_(entry, words) {
  let best = 0;
  ssOrders_(entry).forEach(o => {
    let n = 0;
    while (n < o.length && n < words.length && o[n] === words[n]) n++;
    if (n > best) best = n;
  });
  return best;
}

/* ONE PILE PER BAND, dealt from the top and shuffled again when it runs out — the promise `impDraw_`
   makes: no sentence comes round twice until the band has. */
const SS_PILE = {};
function ssDraw_(band) {
  const list = SS_SENTENCES[band] || SS_SENTENCES.KS2;
  if (!SS_PILE[band] || !SS_PILE[band].length) SS_PILE[band] = herdShuffle_(list.map((_, i) => i));
  return list[SS_PILE[band].pop()];
}

function ssBand_(b) {
  if (b !== undefined) {
    try { localStorage.setItem('ss-band', b); } catch (e) {}
    return b;
  }
  let v = 'KS2';
  try { v = localStorage.getItem('ss-band') || 'KS2'; } catch (e) {}
  return SS_SENTENCES[v] ? v : 'KS2';
}

let SS = null;

/* SHUFFLED UNTIL IT IS NOT ALREADY RIGHT. A deal that came out in order is a sentence handed over
   solved, and with five words that is one deal in a hundred and twenty. */
function ssDeal_(band) {
  const entry = ssDraw_(band);
  const words = ssOrders_(entry)[0];
  let chips = herdShuffle_(words);
  for (let i = 0; i < 20 && ssRight_(entry, chips); i++) chips = herdShuffle_(words);
  SS = { band: band, entry: entry, chips: chips, picked: [], verdict: '', said: '' };
}

/* DRAWN FROM THE STATE, the `REEL_HELD` rule, and EVERY CONTROL IS BUILT HERE — the Scrabble
   lesson: Check is not on the page until there is a sentence to check. */
function ssPaint() {
  const box = $('ss-box'), said = $('ss-said'), sel = $('ss-level');
  if (!box || !SS) return;
  if (sel) sel.value = SS.band;
  const right = SS.verdict === 'right';
  const words = SS.picked.map(i => SS.chips[i]);
  const all = SS.picked.length === SS.chips.length;
  box.innerHTML = `<p class="ss-built${right ? ' is-right' : ''}${SS.verdict === 'wrong' ? ' is-wrong' : ''}">`
    + (words.length ? esc(words.join(' ')) : '<span class="ss-empty">Tap the first word</span>')
    + `</p>`
    /* NO CHIPS ONCE IT IS RIGHT. The strip above says the whole sentence, and a pool of fourteen
       dimmed chips under it is fourteen things that look pressable and do nothing — and at 320px
       they were what shrank the card to 88% to fit. */
    + (right ? '' : `<div class="ss-chips">`
      + SS.chips.map((w, i) => {
          const used = SS.picked.indexOf(i) !== -1;
          return `<button class="ss-chip${used ? ' used' : ''}" data-do="ss-word" data-i="${i}"`
            + ` aria-pressed="${used}">${esc(w)}</button>`;
        }).join('')
      + `</div>`)
    + `<div class="ss-acts">`
    + (right
        ? `<button class="btn" data-do="ss-next">Next sentence</button>`
        : `<button class="btn" data-do="ss-check"${all ? '' : ' disabled'}>Check</button>`
          + `<button class="btn quiet" data-do="ss-new">Skip</button>`)
    + `</div>`;
  if (said) said.textContent = SS.said;
}

function initScramble() {
  if (!$('ss-box')) return;
  const sel = $('ss-level');
  if (sel && !sel.options.length) {
    sel.innerHTML = SS_BANDS.map(b => `<option value="${b[0]}">${esc(b[1])}</option>`).join('');
  }
  if (!SS) ssDeal_(ssBand_());
  ssPaint();
}

on('ss-word', el => {
  if (!SS || SS.verdict === 'right') return;
  const i = parseInt(el.getAttribute('data-i'), 10);
  if (!(i >= 0 && i < SS.chips.length)) return;
  const at = SS.picked.indexOf(i);
  if (at === -1) SS.picked.push(i); else SS.picked.splice(at, 1);
  SS.verdict = ''; SS.said = '';
  ssPaint();
});
on('ss-check', () => {
  if (!SS || SS.picked.length !== SS.chips.length) return;
  const words = SS.picked.map(i => SS.chips[i]);
  if (ssRight_(SS.entry, words)) {
    SS.verdict = 'right';
    SS.said = 'That’s it.';
  } else {
    const n = ssPrefix_(SS.entry, words);
    SS.verdict = 'wrong';
    SS.said = n === 0 ? 'Not quite — the first word isn’t right. Tap a word to take it back.'
      : 'Not quite — the first ' + (n === 1 ? 'word is' : n + ' words are') + ' right.'
        + ' Tap a word to take it back.';
  }
  ssPaint();
});
/* NEXT AND SKIP ARE THE SAME DEAL WITH DIFFERENT WORDS ON THEM: one after a sentence is right, the
   other to give up on one that is not. Two names so each button says what it is for — and "Skip"
   rather than "New sentence", which wrapped onto two lines beside Check at 320px. */
on('ss-next', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-new', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-level', el => {
  const b = SS_SENTENCES[el.value] ? el.value : 'KS2';
  ssBand_(b);
  ssDeal_(b);
  ssPaint();
});

/* ==================================================================================================
   WORD SEARCH — a grid of letters with a list of words hidden in it.

   ASKED FOR AS "He also used to like mazes and word searches". The maze was already here.

   A TAP ON THE FIRST LETTER AND A TAP ON THE LAST, NOT A DRAG, and the maze is the precedent for why.
   Up, down, left and right are the four gestures this app navigates by, so a word search that read a
   finger dragged across the grid would fight the pager on the one screen it lives on — and the only
   way to win that fight is `data-noswipe` over the whole grid, which is most of the card, which is a
   card you cannot swipe off. The pen pad pays that price with a padlock you have to press first; a
   word search would have to pay it on every word. Two taps cost nothing: a tap is a click, the app
   already tells a click from a drag (`PRESS_MOVED` in shell.js swallows the click a swipe produces),
   so a swipe that starts on the grid still turns the page and arms nothing. It also works with a
   mouse, a pen and a keyboard, which a drag would have had to be written three times for.

   A CELL CANNOT BE 44px, which is the maze's and Scrabble's arithmetic: ten of them is 440px and the
   narrowest phone here is 320. `ACCEPTED_TAP` in check/ui.js carries the numbers. What makes it
   liveable is what makes an hour cell liveable: a wrong tap costs nothing. A first tap on the wrong
   letter is replaced by tapping the right one, and a second tap that is not in a line with the first
   simply starts again from there.

   YOUNGER PUZZLES READ FORWARDS ONLY — left to right, top to bottom, and down the diagonal — which is
   the brief's "forward only for younger", and is what makes a first word search possible at all.
   Older ones hide words in all eight directions.

   THE FILLER IS CHECKED FOR WORDS NOBODY SHOULD FIND, and the arithmetic is why that is not
   paranoia. A three-letter word has a one-in-17,576 chance at any one place and direction, and a
   ten-by-ten grid has about 800 of those — so a given three-letter word turns up by chance in about
   one grid in twenty, on a site whose players are children. `WS_NOT` is the backend's handle
   blocklist (`HANDLE_BLOCKED` in constants.gs) and `check-widgets.js` refuses the two disagreeing;
   the grid is read in all eight directions whatever the puzzle's own, because a child reads them all.

   THE PUZZLE SURVIVES A REPAINT, Scrabble's rule again: half the words found and then a payload
   landing must not deal a new grid. New puzzle is the only thing that does.
================================================================================================== */
const WS_DIRS = { e: [1, 0], s: [0, 1], se: [1, 1], ne: [1, -1],
                  w: [-1, 0], n: [0, -1], nw: [-1, -1], sw: [-1, 1] };
const WS_FORWARD = ['e', 's', 'se'];

/* EVERY THEME SAYS ITS OWN SIZE, HOW MANY WORDS, AND WHETHER THEY ONLY READ FORWARDS, because "for
   younger" is a fact about the theme rather than a second control to set. The Years 5–6 spellings are
   a younger list with older words — "dictionary" is ten letters — so they get the bigger grid and
   keep the forward rule. The spelling lists are the statutory Years 3–4 and 5–6 words from the
   national curriculum's English appendix, cut to what fits the grid. */
const WS_THEMES = [
  { id: 'y34', name: 'Years 3–4 spellings', young: true, size: 8, n: 6, words: [
    'accident', 'actual', 'address', 'answer', 'appear', 'arrive', 'believe', 'bicycle', 'breath',
    'build', 'busy', 'business', 'calendar', 'caught', 'centre', 'century', 'certain', 'circle',
    'complete', 'consider', 'continue', 'decide', 'describe', 'early', 'earth', 'eight', 'enough',
    'exercise', 'extreme', 'famous', 'February', 'forward', 'fruit', 'grammar', 'group', 'guard',
    'guide', 'heard', 'height', 'history', 'imagine', 'increase', 'interest', 'island', 'learn',
    'length', 'library', 'material', 'medicine', 'mention', 'minute', 'natural', 'naughty', 'notice',
    'occasion', 'often', 'opposite', 'ordinary', 'peculiar', 'perhaps', 'popular', 'position',
    'possess', 'possible', 'potatoes', 'pressure', 'probably', 'promise', 'purpose', 'quarter',
    'question', 'recent', 'regular', 'reign', 'remember', 'sentence', 'separate', 'special',
    'straight', 'strange', 'strength', 'suppose', 'surprise', 'though', 'thought', 'through',
    'various', 'weight', 'woman', 'women'] },
  { id: 'animals', name: 'Animals', young: true, size: 8, n: 6, words: [
    'badger', 'beaver', 'camel', 'cheetah', 'dolphin', 'eagle', 'ferret', 'gerbil', 'giraffe',
    'gorilla', 'hamster', 'hedgehog', 'jaguar', 'koala', 'leopard', 'lizard', 'lobster', 'meerkat',
    'octopus', 'ostrich', 'otter', 'panda', 'parrot', 'penguin', 'pigeon', 'rabbit', 'reindeer',
    'salmon', 'squirrel', 'tiger', 'toucan', 'turtle', 'walrus', 'weasel', 'whale', 'zebra'] },
  { id: 'sci2', name: 'Science, KS2', young: true, size: 8, n: 6, words: [
    'magnet', 'light', 'shadow', 'mirror', 'plant', 'root', 'stem', 'flower', 'seed', 'pollen',
    'force', 'gravity', 'friction', 'circuit', 'battery', 'switch', 'bulb', 'wire', 'solid',
    'liquid', 'melt', 'freeze', 'rock', 'soil', 'fossil', 'skeleton', 'muscle', 'teeth', 'lungs',
    'habitat', 'planet', 'orbit', 'moon', 'sound', 'vibrate', 'magnify'] },
  { id: 'y56', name: 'Years 5–6 spellings', young: true, size: 10, n: 7, words: [
    'amateur', 'ancient', 'apparent', 'attached', 'available', 'average', 'awkward', 'bargain',
    'bruise', 'category', 'cemetery', 'committee', 'community', 'conscience', 'conscious',
    'correspond', 'criticise', 'curiosity', 'definite', 'desperate', 'determined', 'develop',
    'dictionary', 'disastrous', 'embarrass', 'equipment', 'especially', 'exaggerate', 'excellent',
    'existence', 'familiar', 'foreign', 'forty', 'frequently', 'government', 'guarantee', 'harass',
    'hindrance', 'identity', 'immediate', 'individual', 'interfere', 'interrupt', 'language',
    'leisure', 'lightning', 'marvellous', 'muscle', 'necessary', 'neighbour', 'nuisance', 'occupy',
    'occur', 'parliament', 'persuade', 'physical', 'prejudice', 'privilege', 'profession',
    'programme', 'queue', 'recognise', 'recommend', 'relevant', 'restaurant', 'rhyme', 'rhythm',
    'sacrifice', 'secretary', 'shoulder', 'signature', 'sincere', 'soldier', 'stomach',
    'sufficient', 'suggest', 'symbol', 'system', 'thorough', 'twelfth', 'variety', 'vegetable',
    'vehicle', 'yacht'] },
  { id: 'sci34', name: 'Science, KS3–4', young: false, size: 10, n: 8, words: [
    'atom', 'element', 'compound', 'molecule', 'electron', 'proton', 'neutron', 'nucleus',
    'isotope', 'enzyme', 'osmosis', 'diffusion', 'mitosis', 'chromosome', 'velocity', 'momentum',
    'energy', 'current', 'voltage', 'resistance', 'wavelength', 'frequency', 'catalyst',
    'reaction', 'oxidation', 'acid', 'alkali', 'neutral', 'density', 'pressure', 'organism',
    'ecosystem', 'predator', 'species', 'hormone', 'insulin', 'glucose', 'vaccine', 'antibody',
    'bacteria', 'virus', 'gene', 'protein', 'neuron'] },
  { id: 'maths', name: 'Maths', young: false, size: 10, n: 8, words: [
    'fraction', 'decimal', 'percent', 'integer', 'prime', 'factor', 'multiple', 'square', 'cube',
    'radius', 'diameter', 'triangle', 'polygon', 'angle', 'parallel', 'vertex', 'volume', 'area',
    'perimeter', 'symmetry', 'equation', 'formula', 'gradient', 'sequence', 'ratio', 'average',
    'median', 'mode', 'range', 'algebra', 'quadratic', 'tangent', 'sine', 'cosine', 'vector',
    'hexagon', 'pentagon', 'circle', 'cylinder', 'product', 'quotient', 'inverse'] },
  { id: 'geog', name: 'Geography', young: false, size: 10, n: 8, words: [
    'river', 'mountain', 'valley', 'volcano', 'glacier', 'desert', 'climate', 'weather', 'erosion',
    'delta', 'estuary', 'tributary', 'meander', 'continent', 'country', 'capital', 'equator',
    'latitude', 'longitude', 'ocean', 'island', 'tsunami', 'earthquake', 'tectonic', 'magma',
    'rainforest', 'tundra', 'savanna', 'population', 'migration', 'settlement', 'urban', 'rural',
    'contour', 'compass', 'monsoon', 'drought', 'flood', 'coast'] },
];

/* A COPY OF `HANDLE_BLOCKED` FROM backend/constants.gs, and `check-widgets.js` fails if the two
   differ. A copy rather than a fetch because the backend list never reaches the phone, and a
   word search must not wait on a network to decide what it may print; a check rather than trust
   because a copy kept by hand is the second reader this repository keeps finding. */
const WS_NOT = [
  'anal', 'anus', 'arse', 'bastard', 'bitch', 'bollock', 'boner', 'clit', 'cock', 'coon', 'cum',
  'cunt', 'dick', 'dildo', 'dyke', 'fag', 'fanny', 'fuck', 'gash', 'gook', 'incest', 'jizz',
  'kike', 'knob', 'minge', 'nigg', 'nonce', 'paedo', 'pedo', 'penis', 'piss', 'porn', 'prick',
  'pussy', 'queer', 'rape', 'retard', 'scrote', 'semen', 'sex', 'shag', 'shit', 'slag', 'slut',
  'smeg', 'spastic', 'spic', 'sperm', 'tits', 'titty', 'tosser', 'tranny', 'twat', 'vagina',
  'wank', 'whore', 'wog', 'nazi', 'hitler', 'kkk', 'isis', 'suicide', 'selfharm',
];

/* THE LETTERS OF A WORD, which is what goes in the grid: capitals, nothing but A to Z. */
const wsKey_ = w => String(w).toUpperCase().replace(/[^A-Z]/g, '');

/* DOES THE GRID SPELL ANYTHING ON `WS_NOT`, read from every cell in every one of the eight
   directions. */
function wsRude_(grid, size) {
  const bad = WS_NOT.map(wsKey_);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      for (const k of Object.keys(WS_DIRS)) {
        const [dx, dy] = WS_DIRS[k];
        let s = '';
        for (let i = 0, cx = x, cy = y; i < 8 && cx >= 0 && cy >= 0 && cx < size && cy < size;
             i++, cx += dx, cy += dy) s += grid[cy * size + cx];
        if (bad.some(b => s.startsWith(b))) return true;
      }
    }
  }
  return false;
}

/* ONE PUZZLE. Longest words first, because they are the hard ones to fit and a short word fits in
   whatever is left. A word that is inside another one already placed — "angle" and "triangle",
   "sine" and "cosine" — is skipped, because finding the short one inside the long one would be
   finding the wrong word. Returns null only if sixty whole attempts fail, which on these sizes does
   not happen; the caller says so rather than drawing an empty grid. */
function wsBuild_(theme) {
  const size = theme.size, dirs = theme.young ? WS_FORWARD : Object.keys(WS_DIRS);
  const words = theme.words.filter(w => { const k = wsKey_(w); return k.length >= 3 && k.length <= size; });
  for (let attempt = 0; attempt < 60; attempt++) {
    const grid = new Array(size * size).fill('');
    const placed = [];
    /* THE DEAL IS THE FIRST `n` OF A SHUFFLE, AND ONLY THE DEAL IS PLACED LONGEST-FIRST. The first
       version sorted three puzzles' worth of words by length and placed from the top, so every grid got
       the LONGEST six of eighteen — and a younger 8x8 drew six eight-letter words, six whole rows of
       words with two rows of filler between them: a list of rows rather than a puzzle. The rest of the
       shuffle are spares, used only when a word will not fit or sits inside one already placed.
       AND ONE WORD AT MOST RUNS THE WHOLE WIDTH OF THE GRID, because two such words can only share a
       line by crossing at one letter, so the third and fourth end up parallel and the grid reads in
       one direction. */
    const pool = [];
    let full = 0;
    for (const w of herdShuffle_(words)) {
      if (pool.length >= theme.n * 3) break;
      if (wsKey_(w).length === size) { if (full) continue; full++; }
      pool.push(w);
    }
    const byLen = (a, b) => wsKey_(b).length - wsKey_(a).length;
    pool.splice(0, theme.n, ...pool.slice(0, theme.n).sort(byLen));
    for (const word of pool) {
      if (placed.length >= theme.n) break;
      const key = wsKey_(word);
      if (placed.some(p => p.key.indexOf(key) !== -1 || key.indexOf(p.key) !== -1)) continue;
      for (let t = 0; t < 150; t++) {
        const [dx, dy] = WS_DIRS[dirs[Math.floor(Math.random() * dirs.length)]];
        const x0 = Math.floor(Math.random() * size), y0 = Math.floor(Math.random() * size);
        const x1 = x0 + dx * (key.length - 1), y1 = y0 + dy * (key.length - 1);
        if (x1 < 0 || y1 < 0 || x1 >= size || y1 >= size) continue;
        const cells = [];
        let ok = true;
        for (let i = 0; i < key.length; i++) {
          const at = (y0 + dy * i) * size + (x0 + dx * i);
          if (grid[at] && grid[at] !== key[i]) { ok = false; break; }
          cells.push(at);
        }
        if (!ok) continue;
        cells.forEach((at, i) => { grid[at] = key[i]; });
        placed.push({ word: word, key: key, cells: cells, found: false });
        break;
      }
    }
    if (placed.length < theme.n) continue;
    const empty = [];
    grid.forEach((c, i) => { if (!c) empty.push(i); });
    for (let r = 0; r < 40; r++) {
      empty.forEach(i => { grid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); });
      if (!wsRude_(grid, size)) {
        placed.sort((a, b) => a.word.localeCompare(b.word));
        return { theme: theme.id, size: size, grid: grid, words: placed, got: [], sel: null, said: '' };
      }
    }
  }
  return null;
}

const wsTheme_ = id => WS_THEMES.find(t => t.id === id) || WS_THEMES[0];

function wsThemeId_(id) {
  if (id !== undefined) {
    try { localStorage.setItem('ws-theme', id); } catch (e) {}
    return id;
  }
  let v = WS_THEMES[0].id;
  try { v = localStorage.getItem('ws-theme') || v; } catch (e) {}
  return wsTheme_(v).id;
}

let WS = null;

function wsDeal_(id) {
  WS = wsBuild_(wsTheme_(id));
  if (!WS) WS = { theme: id, size: 0, grid: [], words: [], got: [], sel: null,
                  said: 'That puzzle would not fit together. Press New puzzle.' };
}

/* THE CELLS FROM ONE TAP TO ANOTHER, or null if the two are not on one line — across, down, or a
   true diagonal. The same cell twice is not a line either. */
function wsLine_(size, a, b) {
  const ax = a % size, ay = (a / size) | 0, bx = b % size, by = (b / size) | 0;
  const dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
  const nx = Math.abs(bx - ax), ny = Math.abs(by - ay);
  if (a === b || (nx && ny && nx !== ny)) return null;
  const len = Math.max(nx, ny) + 1, out = [];
  for (let i = 0; i < len; i++) out.push((ay + dy * i) * size + (ax + dx * i));
  return out;
}

/* THE SECOND TAP. Read either way, because a child who taps the last letter first has still found
   the word — and in an older puzzle the word may be written backwards anyway. */
function wsPick_(i) {
  const g = WS;
  if (!g || !g.size || !(i >= 0 && i < g.grid.length)) return;
  if (g.words.every(w => w.found)) return;
  if (g.sel === null) { g.sel = i; g.said = ''; return; }
  if (g.sel === i) { g.sel = null; g.said = ''; return; }
  const cells = wsLine_(g.size, g.sel, i);
  if (!cells) { g.sel = i; g.said = 'Not in a straight line — that letter is the new start.'; return; }
  const s = cells.map(c => g.grid[c]).join('');
  const r = s.split('').reverse().join('');
  const hit = g.words.find(w => !w.found && (w.key === s || w.key === r));
  g.sel = null;
  if (!hit) { g.said = 'That’s not one of the words.'; return; }
  hit.found = true;
  hit.cells = cells;
  cells.forEach(c => { if (g.got.indexOf(c) === -1) g.got.push(c); });
  const left = g.words.filter(w => !w.found).length;
  g.said = left ? 'Found ' + hit.word + '. ' + left + ' to go.'
                : 'All ' + g.words.length + ' found!';
}

function wsPaint() {
  const box = $('ws-grid'), list = $('ws-words'), said = $('ws-said'), sel = $('ws-theme');
  if (!box || !WS) return;
  if (sel) sel.value = WS.theme;
  const done = WS.words.length && WS.words.every(w => w.found);
  box.style.setProperty('--ws-n', String(WS.size || 1));
  box.innerHTML = WS.grid.map((c, i) => {
    const cls = ['ws-c'];
    if (WS.got.indexOf(i) !== -1) cls.push('got');
    if (WS.sel === i) cls.push('sel');
    return `<button class="${cls.join(' ')}" data-do="ws-cell" data-i="${i}"`
      + ` aria-pressed="${WS.sel === i}"${done ? ' disabled' : ''}>${esc(c)}</button>`;
  }).join('');
  if (list) {
    list.innerHTML = WS.words.map(w => w.found
      ? `<li class="got"><s>${esc(w.word)}</s></li>` : `<li>${esc(w.word)}</li>`).join('');
  }
  if (said) said.textContent = WS.said;
}

function initWordSearch() {
  if (!$('ws-grid')) return;
  const sel = $('ws-theme');
  if (sel && !sel.options.length) {
    const group = (young, label) => `<optgroup label="${label}">`
      + WS_THEMES.filter(t => t.young === young)
          .map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')
      + '</optgroup>';
    sel.innerHTML = group(true, 'Younger — words read forwards')
                  + group(false, 'Older — words go any way');
  }
  if (!WS) wsDeal_(wsThemeId_());
  wsPaint();
}

on('ws-cell', el => { wsPick_(parseInt(el.getAttribute('data-i'), 10)); wsPaint(); });
on('ws-again', () => { wsDeal_(WS ? WS.theme : wsThemeId_()); wsPaint(); });
on('ws-theme', el => { wsDeal_(wsThemeId_(wsTheme_(el.value).id)); wsPaint(); });

/* ==================================================================================================
   ARTICULATE — describe it without saying it.

   ASKED FOR AS "can we add articulate to the games widgets". The board game: you land on a
   category, and for thirty seconds you describe as many of its words as you can without saying the
   word, a word that rhymes with it, or its initials. Your team guesses. Got it, or pass.

   THE SPINNER IS THE ONE PIECE THAT DOES NOT SURVIVE. On the board the category is decided by where
   your counter lands, which is a fact about a board this app does not have — so the category is
   chosen, which is the same decision one step earlier and is also the screen this widget needs
   anyway: six buttons is a first page that explains the game without a paragraph.

   THIRTY SECONDS WAS THE GAME'S OWN NUMBER AND IT IS NINETY NOW — see `ROUND_GAMES`. The deck is
   nearer a hundred words a category, and nobody gets through a hundred in ninety seconds, so a
   round still never repeats a word.

   NO SCORE IS KEPT BETWEEN ROUNDS. Articulate is scored by moving a counter, which is a thing the
   people playing do; an app that remembered it would be keeping half a game and inviting somebody
   to look for the other half. The round's own count is on screen while it matters and gone after.
================================================================================================== */
const ART_DECK = {
  Object: ['umbrella', 'kettle', 'stapler', 'ladder', 'trampoline', 'harmonica', 'wheelbarrow',
           'telescope', 'zip', 'hoover', 'candle', 'passport', 'skateboard', 'saucepan',
           'toothbrush', 'seatbelt', 'chandelier', 'padlock', 'compass', 'radiator',
           'hourglass', 'lawnmower', 'wheelie bin', 'megaphone', 'jigsaw puzzle', 'escalator',
           'washing line', 'hammock', 'weathervane', 'drawing pin',
           'toaster', 'microwave', 'fridge', 'dishwasher', 'washing machine', 'calculator', 'ruler',
           'rubber', 'sellotape', 'scissors', 'glue stick', 'paperclip', 'envelope', 'stamp',
           'postcard', 'calendar', 'alarm clock', 'doorbell', 'letterbox', 'doormat', 'coat hanger',
           'clothes peg', 'ironing board', 'frying pan', 'rolling pin', 'whisk', 'colander',
           'cheese grater', 'tin opener', 'teapot', 'mug', 'lunchbox', 'flask', 'backpack',
           'suitcase', 'wallet', 'keyring', 'torch', 'battery', 'plug', 'remote control',
           'headphones', 'microphone', 'keyboard', 'computer mouse', 'printer', 'lamp', 'pillow',
           'duvet', 'curtain', 'sponge', 'flannel', 'hairdryer', 'comb', 'mirror', 'tweezers',
           'plaster', 'thermometer', 'stethoscope', 'crutches', 'highchair', 'bunk bed', 'sofa',
           'beanbag', 'deckchair', 'parasol', 'bucket and spade', 'goggles'
  ],
  Nature: ['avalanche', 'hedgehog', 'thunderstorm', 'coral reef', 'acorn', 'glacier', 'moth',
           'quicksand', 'rainbow', 'beaver', 'tide', 'fossil', 'cactus', 'eclipse', 'swamp',
           'pollen', 'volcano', 'otter', 'frost', 'mushroom',
           'badger', 'waterfall', 'dandelion', 'tadpole', 'whirlpool', 'icicle', 'puffin',
           'nettle', 'sand dune', 'conker',
           'earthquake', 'tornado', 'hurricane', 'tsunami', 'lightning', 'fog', 'drizzle',
           'hailstone', 'snowflake', 'puddle', 'rock pool', 'cave', 'cliff', 'island', 'desert',
           'meadow', 'pond', 'stream', 'geyser', 'lava', 'crater', 'meteor', 'comet',
           'shooting star', 'full moon', 'sunrise', 'sunset', 'dew', 'breeze', 'gale', 'drought',
           'flood', 'iceberg', 'seaweed', 'starfish', 'seahorse', 'walrus', 'polar bear', 'reindeer',
           'fox', 'mole', 'woodlouse', 'ladybird', 'dragonfly', 'slug', 'beetle', 'ant', 'wasp',
           'grasshopper', 'robin', 'swan', 'eagle', 'pigeon', 'seagull', 'crow', 'parrot', 'toucan',
           'ostrich', 'hummingbird', 'panda', 'koala', 'hippo', 'rhino', 'cheetah', 'leopard',
           'wolf', 'deer'
  ],
  Action: ['juggling', 'whispering', 'sneezing', 'hitchhiking', 'tiptoeing', 'yawning',
           'hibernating', 'shrugging', 'wrestling', 'queueing', 'gargling', 'skimming a stone',
           'blushing', 'haggling', 'eavesdropping', 'sprinting', 'knitting', 'shivering',
           'applauding', 'daydreaming',
           'whistling', 'somersaulting', 'sleepwalking', 'abseiling', 'tying a shoelace',
           'blowing out candles', 'plaiting hair', 'revising', 'snorkelling', 'sulking',
           'bouncing', 'tickling', 'winking', 'stretching', 'kneeling', 'crawling', 'hopping',
           'skipping', 'galloping', 'marching', 'limping', 'waddling', 'wobbling', 'shuffling',
           'clapping', 'pointing', 'nodding', 'bowing', 'curtseying', 'saluting', 'waving',
           'hugging', 'snoring', 'humming', 'chewing', 'nibbling', 'slurping', 'sipping', 'munching',
           'blinking', 'frowning', 'squinting', 'sniffing', 'scratching', 'hiding', 'peeping',
           'tidying', 'dusting', 'sprinkling', 'spreading', 'grating', 'unwrapping', 'folding',
           'sharpening', 'colouring', 'doodling', 'scribbling', 'spelling', 'counting', 'measuring',
           'weighing', 'rhyming', 'guessing', 'cheating', 'bragging', 'apologising', 'complaining',
           'interrupting', 'fidgeting', 'dawdling', 'rummaging', 'recycling', 'volunteering',
           'hula hooping', 'leapfrogging'
  ],
  World: ['Iceland', 'the Sahara', 'Mount Everest', 'the Amazon', 'Venice', 'the Great Wall',
          'Antarctica', 'Tokyo', 'the Nile', 'Stonehenge', 'the Alps', 'Cairo', 'New Zealand',
          'the Panama Canal', 'Lisbon', 'the Dead Sea', 'Kenya', 'Niagara Falls', 'Sicily',
          'the Arctic Circle',
           'the Eiffel Tower', 'Loch Ness', 'the Grand Canyon', 'Big Ben', 'Machu Picchu',
           'the Channel Tunnel', 'the Colosseum', 'the Taj Mahal', 'the Lake District',
           'the Sydney Opera House',
          'Paris', 'Rome', 'New York', 'the London Eye', 'Buckingham Palace',
          'the Statue of Liberty', 'the Pyramids', 'the Leaning Tower of Pisa',
          'the Great Barrier Reef', 'the Mississippi', 'the Thames', 'the Pacific Ocean',
          'the Mediterranean', 'the North Pole', 'the South Pole', 'the Equator', 'Australia',
          'Canada', 'Brazil', 'Mexico', 'Egypt', 'India', 'China', 'Japan', 'Greece', 'Spain',
          'Scotland', 'Wales', 'Ireland', 'Jamaica', 'Hawaii', 'Hollywood', 'Mount Kilimanjaro',
          'Ben Nevis', 'Snowdon', 'the Himalayas', 'the Rocky Mountains', 'the Andes', 'Siberia',
          'the Outback', 'the Serengeti', 'the Galapagos Islands', 'Amsterdam', 'Berlin',
          'Barcelona', 'Edinburgh Castle', 'Blackpool Tower', 'the Angel of the North',
          'Hadrian\'s Wall', 'the Isle of Wight', 'Cornwall', 'the Giant\'s Causeway', 'Mount Fuji',
          'the Golden Gate Bridge', 'the White House', 'Mount Rushmore', 'Uluru', 'the Caribbean',
          'Rio de Janeiro', 'Greenland', 'Timbuktu', 'Hong Kong', 'Tower Bridge',
          'St Paul\'s Cathedral', 'Windsor Castle', 'the Shard', 'the Norwegian fjords'
  ],
  Person: ['a lifeguard', 'a blacksmith', 'a referee', 'an astronaut', 'a plumber', 'a busker',
           'a detective', 'a midwife', 'a lighthouse keeper', 'a beekeeper', 'a paramedic',
           'a librarian', 'a sculptor', 'a chimney sweep', 'a surgeon', 'a tour guide',
           'a lollipop lady', 'an archaeologist', 'a barista', 'a train driver',
           'a window cleaner', 'a magician', 'a vet', 'a shepherd', 'a park ranger',
           'a goalkeeper', 'a puppeteer', 'a weather forecaster', 'a caretaker',
           'a stunt double',
           'a nurse', 'a dentist', 'a pilot', 'a firefighter', 'a police officer', 'a postman',
           'a farmer', 'a chef', 'a baker', 'a butcher', 'a builder', 'an electrician',
           'a carpenter', 'a hairdresser', 'a teacher', 'a head teacher', 'a dinner lady',
           'a gardener', 'a zookeeper', 'a pirate', 'a knight', 'a king', 'a queen', 'a princess',
           'a wizard', 'a fortune teller', 'a clown', 'an acrobat', 'a ringmaster', 'a ballerina', 'a DJ',
           'a newsreader', 'a journalist', 'a photographer', 'an author', 'a poet', 'a scientist',
           'an inventor', 'an explorer', 'a mountaineer', 'a sailor', 'a spy', 'a judge', 'a mayor',
           'a prime minister', 'a bus driver', 'a taxi driver', 'a lorry driver', 'a mechanic',
           'a pharmacist', 'an optician', 'a cashier', 'a shopkeeper', 'a waiter', 'a jockey',
           'a cowboy', 'a lumberjack', 'a fisherman', 'a scuba diver', 'a babysitter', 'a twin',
           'a grandma', 'a pen pal', 'a toddler', 'a teenager', 'a football manager'
  ],
  Random: ['jet lag', 'a leap year', 'homesickness', 'a power cut', 'déjà vu', 'the alphabet',
           'a rumour', 'a traffic jam', 'small talk', 'a nickname', 'bad luck', 'an alibi',
           'a bargain', 'a heatwave', 'stage fright', 'a countdown', 'an echo', 'a punchline',
           'a shortcut', 'a coincidence',
           'a tongue twister', 'a time capsule', 'a sleepover', 'a riddle', 'a head start',
           'a false alarm', 'a cliffhanger', 'an apology', 'a wild goose chase',
           'a wrong number',
           'a secret', 'a surprise', 'a promise', 'a joke', 'a nightmare', 'a wish', 'half term',
           'a fire drill', 'a school report', 'a hiccup', 'the giggles', 'brain freeze',
           'pins and needles', 'butterflies in your stomach', 'a lucky charm', 'a high five',
           'a thumbs up', 'a group photo', 'a password', 'a spelling test', 'a penalty shoot-out',
           'a world record', 'a to-do list', 'a shopping list', 'a recipe', 'a timetable',
           'a deadline', 'the weekend', 'Monday morning', 'a bank holiday', 'midnight',
           'the dawn chorus', 'a lie-in', 'a nap', 'bedtime', 'a bedtime story', 'a happy ending',
           'a plot twist', 'a spoiler', 'a sequel', 'an encore', 'a standing ovation', 'a mascot',
           'a trophy', 'a medal', 'a certificate', 'a gold star', 'beginner\'s luck',
           'a second chance', 'a fresh start', 'musical chairs', 'pass the parcel',
           'a treasure hunt', 'a secret code', 'an emoji', 'the internet', 'gravity', 'electricity',
           'friendship', 'kindness', 'patience', 'courage', 'curiosity', 'boredom', 'excitement',
           'teamwork', 'a compliment'
  ],
};

/* ==================================================================================================
   CHARADES — the same round, mimed instead of described.

   ASKED FOR AS "add cherades widget game as well... idk whats difference between cherades and
   articulate in this case to be honest." It is a fair question and the answer decides both decks:

     ARTICULATE is DESCRIBED. You may say anything except the word, a rhyme and its initials. So
       its deck can hold an abstract noun — `stage fright`, `a lighthouse keeper`, `deja vu`.
     CHARADES is MIMED. No words, no sounds, no pointing at something in the room. So every entry
       has to be something a BODY can show: a title everybody knows the shape of, or a thing you
       physically do. An abstract noun is a dead charades card.

   THAT IS WHY THE DECKS ARE DIFFERENT AND WHY THE ROUND IS THE SAME, which is exactly the split
   this repository keeps making between an ENGINE and the rows it reads. One implementation, two
   decks, two verbs — a second copy of "deal a word, count thirty, keep score" would be the
   `documents_()` fault in a fourth costume.

   SIXTY SECONDS RATHER THAN THIRTY, and it is not a preference: a mime takes longer to read than a
   sentence does, and Articulate's thirty is the board game's own number while charades has never
   had one. */
const CHA_DECK = {
  /* THIRTY EACH ONCE (four hundred more were added later, plus `Animal` and `Sport`, which are
     things a body can SHOW), AND `Action` IS THE ONE THAT HAD TO BE STRONGEST — it is the category that
     always plays, because a title only works if the room has seen it and a thing you DO always
     works. Eleven cards were thrown out by a reviewer before they got here, and the sharpest
     was `trying to do a handstand against a wall`: charades is MIMED, so the mime of a
     handstand IS a handstand, in somebody else's front room, next to the furniture. Five quiz
     shows went because a desk and a buzzer mime as nothing, and `The Snowman` went because it
     is a Christmas card dealt in June. `Countdown` went for both reasons AND a third: it
     collided with ARTICULATE's `a countdown`, and the two games are pages of ONE column, so
     the same word could be dealt twice in a sitting. That collision is checked now rather
     than remembered — see `check-widgets.js`. */
  Film: [
    'Jurassic Park', 'Finding Nemo', 'Toy Story', 'Paddington', 'The Lion King', 'Frozen',
    'Harry Potter', 'Shrek', 'E.T. the Extra-Terrestrial', 'The Wizard of Oz', 'Mary Poppins',
    'Chitty Chitty Bang Bang', '101 Dalmatians', 'Wallace and Gromit', 'Chicken Run',
    'Despicable Me', 'Ratatouille', 'Up', 'The Incredibles', 'Ice Age', 'Star Wars',
    'The Sound of Music', 'Peter Pan', 'Moana', 'Kung Fu Panda', 'How to Train Your Dragon',
    'Babe', 'Nanny McPhee', 'Madagascar', 'Night at the Museum',
    'Cars', 'Coco', 'Encanto', 'Inside Out', 'Zootropolis', 'Tangled', 'Aladdin',
    'The Little Mermaid', 'Beauty and the Beast', 'Cinderella', 'Snow White and the Seven Dwarfs',
    'Sleeping Beauty', 'Mulan', 'Pinocchio', 'Dumbo', 'Bambi', 'Lady and the Tramp', 'Robin Hood',
    'The Aristocats', 'Hercules', 'Tarzan', 'Lilo and Stitch', 'Brave', 'WALL-E', 'Monsters Inc',
    'A Bug\'s Life', 'Luca', 'Turning Red', 'Soul', 'Onward', 'Elemental', 'Big Hero 6',
    'Wreck-It Ralph', 'Bolt', 'Minions', 'The Secret Life of Pets', 'Sing', 'Trolls',
    'The Lego Movie', 'Cloudy with a Chance of Meatballs', 'Rio', 'Happy Feet', 'Megamind',
    'Bee Movie', 'Shark Tale', 'The Boss Baby', 'Puss in Boots', 'Spider-Man', 'Batman', 'Superman',
    'Annie', 'Oliver!', 'The Greatest Showman', 'Grease', 'Hook', 'Jumanji', 'Back to the Future',
    'Honey I Shrunk the Kids', 'Free Willy', 'Beethoven', 'Stuart Little', 'The Karate Kid',
    'Cool Runnings', 'Space Jam', 'The Parent Trap', 'The Goonies', 'Flushed Away', 'Early Man',
    'My Neighbour Totoro', 'Sonic the Hedgehog'
  ],
  TV: [
    'Bake Off', 'Doctor Who', 'Strictly Come Dancing', 'Blue Peter', 'Top Gear',
    'Only Fools and Horses', 'Match of the Day', 'Ninja Warrior', 'Peppa Pig', 'Postman Pat',
    'Fireman Sam', 'Thomas the Tank Engine', 'Bob the Builder', 'Teletubbies', 'Shaun the Sheep',
    'Horrible Histories', 'Mr Tumble', 'Robot Wars', 'Rastamouse', 'Art Attack',
    'SpongeBob SquarePants', 'Scooby Doo', 'Tom and Jerry', 'The Simpsons', 'Danger Mouse',
    'Mr Bean', 'Gladiators', 'Dragons Den', 'The Repair Shop', 'The Crystal Maze',
    'Bluey', 'Paw Patrol', 'Hey Duggee', 'In the Night Garden', 'Something Special', 'Balamory',
    'Tweenies', 'Noddy', 'The Clangers', 'The Wombles', 'Pingu', 'Bananas in Pyjamas', 'Pokémon',
    'Newsround', 'Countryfile', 'Gardeners\' World', 'Antiques Roadshow', 'Blue Planet',
    'Springwatch', 'Top of the Pops', 'EastEnders', 'Coronation Street', 'Emmerdale', 'Neighbours',
    'Casualty', 'Dad\'s Army', 'Fawlty Towers', 'Blackadder', 'Grange Hill', 'Tracy Beaker',
    'Thunderbirds', 'Ben and Holly\'s Little Kingdom', 'Octonauts', 'Sarah and Duck', 'Numberblocks',
    'Mister Maker', 'Andy\'s Dinosaur Adventures', 'Britain\'s Got Talent',
    'The Great British Sewing Bee', 'The Masked Singer', 'Dancing on Ice', 'Changing Rooms',
    'Grand Designs', 'Total Wipeout', 'Record Breakers', 'The Muppet Show', 'Sesame Street',
    'Fraggle Rock', 'Power Rangers', 'Teenage Mutant Ninja Turtles'
  ],
  Book: [
    'Matilda', 'The Gruffalo', 'Treasure Island', 'The Hobbit', 'Robinson Crusoe',
    'Charlie and the Chocolate Factory', 'James and the Giant Peach', 'The BFG',
    'Fantastic Mr Fox', 'The Twits', 'The Lion the Witch and the Wardrobe', 'The Jungle Book',
    'Alice in Wonderland', 'The Wind in the Willows', 'Winnie the Pooh',
    'The Very Hungry Caterpillar', 'Where the Wild Things Are', 'The Railway Children',
    'The Secret Garden', 'Swallows and Amazons', 'Black Beauty', 'The Tiger Who Came to Tea',
    'Room on the Broom', 'The Worst Witch', 'Horrid Henry', 'Diary of a Wimpy Kid',
    'Stig of the Dump', 'The Iron Man', 'Around the World in Eighty Days', 'The Cat in the Hat',
    'Charlotte\'s Web', 'The Borrowers', 'The Tale of Peter Rabbit',
    'The Owl Who Was Afraid of the Dark', 'Dear Zoo', 'We\'re Going on a Bear Hunt',
    'The Snail and the Whale', 'Stick Man', 'Zog', 'The Smartest Giant in Town', 'Tiddler',
    'Superworm', 'The Highway Rat', 'Monkey Puzzle', 'Each Peach Pear Plum', 'Pippi Longstocking',
    'Heidi', 'Oliver Twist', 'Great Expectations', 'The Famous Five', 'The Secret Seven',
    'Malory Towers', 'The Magic Faraway Tree', 'The Little Prince', 'Gulliver\'s Travels',
    'Moby Dick', 'Frankenstein', 'Kidnapped', 'The Three Musketeers', 'War Horse',
    'Private Peaceful', 'Holes', 'Wonder', 'The Midnight Gang', 'Gangsta Granny', 'Billionaire Boy',
    'Mr Stink', 'The Witches', 'The Enormous Crocodile', 'George\'s Marvellous Medicine',
    'Danny the Champion of the World', 'Esio Trot', 'The Magic Finger', 'Percy Jackson',
    'Tom\'s Midnight Garden', 'The Enormous Turnip', 'The Little Red Hen',
    'Goldilocks and the Three Bears', 'The Three Little Pigs', 'Jack and the Beanstalk',
    'Little Red Riding Hood', 'Hansel and Gretel', 'Rapunzel', 'The Ugly Duckling',
    'The Princess and the Pea'
  ],
  Song: [
    'Happy Birthday', 'Twinkle Twinkle Little Star', 'YMCA', 'We Will Rock You',
    'Row Row Row Your Boat', 'The Hokey Cokey', 'The Wheels on the Bus',
    'Head Shoulders Knees and Toes', 'If You Are Happy and You Know It',
    'Old MacDonald Had a Farm', 'Incy Wincy Spider', 'I Am a Little Teapot', 'Five Little Ducks',
    'Ten Green Bottles', 'One Man Went to Mow', 'The Grand Old Duke of York',
    'London Bridge is Falling Down', 'Baa Baa Black Sheep', 'Humpty Dumpty',
    'Hickory Dickory Dock', 'Jack and Jill', 'Pop Goes the Weasel', 'Twist and Shout',
    'The Animals Went in Two by Two', 'You Are My Sunshine', 'The Macarena',
    'Singing in the Rain', 'Yellow Submarine', 'Walking on Sunshine', 'Here Comes the Sun',
    'Mary Had a Little Lamb', 'Hey Diddle Diddle', 'Little Bo Peep', 'Little Miss Muffet',
    'Hot Cross Buns', 'Oranges and Lemons', 'Ring a Ring o\' Roses', 'The Farmer\'s in His Den',
    'Polly Put the Kettle On', 'Sing a Song of Sixpence', 'Three Blind Mice', 'Rock-a-bye Baby',
    'Wind the Bobbin Up', 'Miss Polly Had a Dolly', 'Five Little Speckled Frogs',
    'Five Little Monkeys Jumping on the Bed', 'Ten in the Bed', 'Baby Shark', 'Let It Go',
    'Old King Cole', 'Doctor Foster', 'Little Jack Horner', 'Pat-a-Cake', 'This Old Man',
    'Here We Go Round the Mulberry Bush', 'Bingo', 'Five Currant Buns', 'Alice the Camel',
    'Dancing Queen', 'Don\'t Stop Me Now', 'Shake It Off', 'Happy', 'Can\'t Stop the Feeling',
    'Uptown Funk', 'Who Let the Dogs Out', 'I\'m a Believer', 'Stayin\' Alive', 'Hey Jude',
    'Octopus\'s Garden', 'All You Need Is Love', 'Let It Be', 'Somewhere Over the Rainbow',
    'The Lion Sleeps Tonight', 'Hakuna Matata', 'Under the Sea', 'A Whole New World',
    'How Far I\'ll Go', 'We Don\'t Talk About Bruno', 'Supercalifragilisticexpialidocious',
    'The Bare Necessities', 'I Just Can\'t Wait to Be King', 'You\'ve Got a Friend in Me',
    'Circle of Life', 'Let\'s Go Fly a Kite', 'Do-Re-Mi'
  ],
  Action: [
    'building a flat-pack wardrobe', 'walking a dog that will not walk',
    'carrying too many shopping bags', 'putting up a tent in the wind', 'trying to open a jar',
    'wrapping an awkward present', 'getting chewing gum off a shoe', 'parallel parking',
    'changing a duvet cover', 'steering a shopping trolley with a wonky wheel',
    'getting stuck halfway out of a jumper', 'blowing up a balloon until it goes pop',
    'eating a chip that is far too hot', 'untangling a pair of headphones',
    'doing up a tie for the first time', 'catching a spider under a glass to put it outside',
    'carrying a full mug of tea across a room', 'swatting a fly that keeps landing on you',
    'pulling on a pair of wet wellies', 'cleaning a window that is still smeary',
    'painting a ceiling and getting drips on your face', 'peeling a satsuma in one long piece',
    'hunting for your keys at the bottom of a deep bag',
    'skipping with a rope that keeps catching your feet',
    'washing up in rubber gloves that are too big', 'fishing the last crisp out of the packet',
    'running for a train and just missing it', 'threading a needle and missing every time',
    'icing a cake with a wobbly hand', 'folding a big map back up the way it was',
    'flipping a pancake', 'walking across an icy pavement', 'blowing bubbles',
    'building a sandcastle before the tide comes in', 'mowing the lawn',
    'planting a seed and watering it', 'hanging out the washing on a windy day', 'ironing a shirt',
    'hoovering under the sofa', 'making a bed', 'washing a car', 'changing a light bulb',
    'taking a selfie', 'posting a letter', 'walking on hot sand without shoes',
    'walking through deep mud', 'playing hide and seek', 'brushing a horse', 'milking a cow',
    'feeding the ducks', 'flying a kite', 'kneading bread dough', 'chopping onions and crying',
    'eating a big plate of spaghetti', 'eating a sandwich that is too big to bite',
    'drinking through a straw', 'licking an ice cream before it drips',
    'opening a window that is stuck', 'wading into a cold sea', 'pumping up a bike tyre',
    'squeezing onto a crowded bus', 'finding a seat in a dark cinema',
    'trying to sneeze and it will not come', 'putting on sun cream', 'lifting a very heavy rucksack',
    'climbing into a sleeping bag', 'rowing a boat', 'catching a boot on a fishing line',
    'hammering a nail and hitting your thumb', 'sawing a plank of wood', 'painting a fence',
    'hanging wallpaper', 'washing a dog that does not want a bath', 'carrying a sleeping baby',
    'pushing a pram up a hill', 'feeding a baby with a spoon', 'spinning a plate on a stick',
    'walking along a tightrope', 'standing still as a statue', 'conducting an orchestra',
    'playing the drums', 'playing the violin', 'playing the piano', 'playing the trumpet',
    'playing the guitar', 'singing into a hairbrush', 'dancing at a disco', 'sweeping the floor',
    'mopping a slippery floor', 'scrubbing a very dirty pan', 'setting the table',
    'carrying a tray of drinks', 'cracking an egg into a bowl', 'stirring a giant pot of soup',
    'typing a very long email', 'sending a text with cold fingers',
    'reading a newspaper in the wind', 'knocking over a line of dominoes',
    'making a paper aeroplane', 'putting on gloves that are too tight',
    'walking in shoes that are too big', 'trying on a hat in a mirror', 'sewing on a button',
    'hanging a picture straight', 'looking for the TV remote', 'trying to get a signal on a phone',
    'hailing a taxi', 'directing traffic', 'getting a splinter out',
    'stepping on a building brick in bare feet', 'eating a slice of lemon', 'digging a hole',
    'picking apples from a tree', 'watering the garden with a hose'
  ],
  Animal: [
    'a kangaroo', 'a penguin', 'an elephant', 'a monkey', 'a giraffe', 'a snake', 'a crab', 'a frog',
    'a chicken', 'a gorilla', 'a lion', 'a crocodile', 'a flamingo', 'a rabbit', 'a horse', 'an owl',
    'a bat', 'a butterfly', 'a spider', 'a bee', 'a duck', 'a dog', 'a cow', 'a pig', 'a sheep',
    'a tortoise', 'a snail', 'a seal', 'a dolphin', 'a shark', 'an octopus', 'a jellyfish',
    'a peacock', 'a sloth', 'a meerkat', 'a bear', 'a tiger', 'a camel', 'a squirrel', 'a chameleon',
    'a woodpecker', 'a caterpillar', 'a worm', 'a mouse'
  ],
  Sport: [
    'football', 'tennis', 'golf', 'cricket', 'rugby', 'basketball', 'netball', 'swimming', 'fencing',
    'archery', 'ten-pin bowling', 'darts', 'snooker', 'table tennis', 'badminton', 'canoeing',
    'sailing', 'surfing', 'skiing', 'snowboarding', 'ice skating', 'cycling', 'weightlifting',
    'horse riding', 'javelin', 'shot put', 'hurdles', 'long jump', 'a relay race', 'a sack race',
    'an egg and spoon race', 'a three-legged race', 'tug of war', 'hockey', 'baseball', 'volleyball',
    'karate', 'yoga', 'rock climbing', 'water polo', 'curling', 'boxing'
  ],
}

/* ==================================================================================================
   ONE ROUND, TWO GAMES.

   `secs` IS THE ONLY NUMBER, `deck` IS THE ONLY CONTENT and `say` IS THE ONLY SENTENCE that differ.
   Everything else — dealing without repeats, the clock, the count, the three states the card can be
   in — is written once. A third game of this shape is a row here.

   THE DECK IS A FUNCTION rather than the object, so a deck replaced at runtime is read rather than
   captured. Same reason `factsNow_` is a call and not a constant. */
/* NINETY AND A HUNDRED AND EIGHTY, ASKED FOR IN THOSE WORDS: "for articulate give like 90 seconds.
   for cherades give like 3 minutes." The board game's thirty is the right number for the board
   game — a counter moving round a track is the score, and a short round keeps the track moving.
   Round a table with no board, a round IS the turn, and thirty seconds is two cards and a laugh.
   The note on Charades below argued sixty from the same principle (a mime reads slower than a
   sentence) and three minutes keeps that ratio at twice Articulate's. The clock is drawn as m:ss by
   `roundClock_`, because "180s left" is a number somebody has to divide. */
const ROUND_GAMES = {
  art: { secs: 90, deck: () => ART_DECK, name: 'Articulate',
         say: 'Describe it. Not the word, not a rhyme, not the initials.' },
  cha: { secs: 180, deck: () => CHA_DECK, name: 'Charades',
         say: 'Act it out. No words, no sounds, no pointing.' },
};

function roundClock_(secs) {
  const n = Math.max(0, secs | 0);
  return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
}

/* ONE STATE PER GAME, not one shared. Both cards can be on the screen at once — they are two pages
   of the same column — and a single state would have the second one wiping the first's clock. */
const roundAt = { art: null, cha: null };

function roundPick_(k) {
  /* THE CATEGORY IS CHOSEN FOR YOU, and that is the change the owner asked for: "less friction if
     it just decides topic and the thing". It was six buttons, which is a decision nobody wanted to
     make and a screen between somebody and the game. On the board the category is decided by where
     your counter lands — random is closer to that than a menu ever was. The chip on the card still
     says which one came up, because you have to know what you are describing. */
  const deck = ROUND_GAMES[k].deck();
  const cats = Object.keys(deck);
  return cats[Math.floor(Math.random() * cats.length)];
}

function roundStop_(k) {
  const s = roundAt[k];
  if (s && s.timer) { clearInterval(s.timer); s.timer = 0; }
}

/* DRAWN FROM THE STATE, never patched by the handler that changed it — the `REEL_HELD` rule. A
   mark a press puts on the element is a mark the next repaint throws away while the state keeps
   it, and the result is a card showing one thing while the app believes another. */
function roundPaint(k) {
  const g = ROUND_GAMES[k];
  const card = $(k + '-card'), said = $(k + '-said'), left = $(k + '-left'), got = $(k + '-got');
  if (!card || !g) return;
  const s = roundAt[k];
  if (!s || s.phase === 'idle') {
    card.innerHTML = `<button class="art-go" data-do="rg-start" data-g="${esc(k)}">Start</button>`;
    if (said) said.textContent = g.say;
    if (left) left.textContent = roundClock_(g.secs);
    if (got) got.textContent = '0';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-cat-of">${esc(s.cat)}</p>`;
    if (said) said.textContent = 'Start again for another.';
    if (left) left.textContent = roundClock_(0);
    return;
  }
  card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
    <p class="art-word">${esc(s.word || '')}</p>`;
  if (said) said.textContent = g.say;
  if (left) left.textContent = roundClock_(s.left);
  if (got) got.textContent = String(s.score);
}

function roundNext_(k) {
  const s = roundAt[k];
  if (!s) return;
  /* DEALT FROM A SHUFFLED PILE, refilled when it empties, so one round cannot show a word twice —
     which is the whole reason a category does not have to be enormous to behave as though it were.
     `herdShuffle_` because it is Fisher-Yates and the sort trick is the famous wrong one; the note
     over it says why. */
  if (!s.pile.length) s.pile = herdShuffle_(ROUND_GAMES[k].deck()[s.cat] || []);
  s.word = s.pile.pop() || '';
}

function initRound(k) {
  if (!$(k + '-card')) return;
  roundStop_(k);
  roundAt[k] = null;
  roundPaint(k);
}

on('rg-start', el => {
  const k = el.getAttribute('data-g');
  const g = ROUND_GAMES[k];
  if (!g) return;
  roundStop_(k);
  const cat = roundPick_(k);
  roundAt[k] = { phase: 'go', cat: cat, score: 0, left: g.secs, word: '',
                 pile: herdShuffle_(g.deck()[cat] || []), timer: 0 };
  roundNext_(k);
  roundAt[k].timer = setInterval(() => {
    const s = roundAt[k];
    if (!s || s.phase !== 'go') return;
    s.left--;
    if (s.left <= 0) { s.phase = 'done'; roundStop_(k); }
    roundPaint(k);
  }, 1000);
  roundPaint(k);
});

/* GOT IT AND PASS ARE THE SAME MOVE with one number different, so they are one handler — two would
   be two places to get "deal the next one" wrong. */
on('rg-next', el => {
  const k = el.getAttribute('data-g');
  const s = roundAt[k];
  if (!s || s.phase !== 'go') return;
  if (el.getAttribute('data-got') === '1') s.score++;
  roundNext_(k);
  roundPaint(k);
});

on('rg-again', el => {
  const k = el.getAttribute('data-g');
  if (!ROUND_GAMES[k]) return;
  roundStop_(k);
  roundAt[k] = null;
  roundPaint(k);
});

/* ==================================================================================================
   IMPOSTER — three or more people, one phone, one word that everybody knows but one of them.

   ASKED FOR AS "add one of those word imposter games to games column. like you know when theres 3
   or more people and everyone knows the word except 1 person and he has to pretend like he knows
   and they go round in a circle saying associated words."

   THE PHONE IS THE ONLY THING THAT KNOWS WHO THE IMPOSTER IS, so it is dealt like the Scrabble rack:
   passed round, one player at a time, and nothing secret is on the screen between two of them.
   "Pass to Player 3" is what the next player sees, and the word only comes up when THEY press for
   it. A card that showed the word and then said "pass it on" would put it in front of whoever takes
   the phone.

   THE IMPOSTER IS TOLD THE CATEGORY AND NOTHING ELSE, which is the rule every version of this game
   that is fun to play uses. With nothing at all to go on, the imposter's first word is a guess and
   the round is over before it starts; with the category — Food, not "pizza" — they can say
   something that sounds right and the game is whether the others notice.

   WHO GOES FIRST IS DRAWN FROM EVERYBODY, THE IMPOSTER INCLUDED. Leaving the imposter out would be
   kinder to them and would tell the room something: in a game of three, "Player 2 starts" would
   rule Player 2 out, and the whole game is not knowing.

   NO SCORE AND NO TIMER, for the reason Herd Mentality gives: the voting and the arguing are the
   game, and they happen out loud. The app deals, keeps the secret, and says who it was at the end.

   THE ROUND SURVIVES A REPAINT, WHICH IS SCRABBLE'S RULE AND NOT THE MAZE'S. `repaint` runs whenever
   a payload lands, and a round half-dealt that dealt itself again would hand some players a second
   word. `initImposter` redraws what is in progress. What `stop` does instead is HIDE a word left on
   the screen, because a column swiped away and back is exactly how the next person sees it.

   ---------- A SMALL LINE, A BIG LINE AND ONE BUTTON ----------------------------------------------
   REPORTED AS "Can you make the imposter game more simple and intuitive while adding more categories
   and words. It’s info over load on the reading parts like reading theme and word extra" (8 Oct).
   Every screen carried a sentence: "Player 2 of 4" over "Hand the phone to Player 2" over "Nobody
   else looks"; "Nobody else knows. Blend in."; "goes first. One word each, round the circle — then
   vote."; "Caught? The imposter still wins by guessing the word." Each was true and none was needed
   past the first round, and every one of them was a paragraph somebody had to read out to a child
   with the phone in their hand — which, on the card, is reading the secret out loud. So a screen is
   a small line, a big line and one button, and `check-flow.js` counts: no more than four words on
   the pass, the card and the play screens, the dealt word and its category aside.

   THE CATEGORY WENT FROM A PLAYER'S CARD, which was the "reading theme and word" half: somebody who
   has been told "pizza" does not need telling it is a food. It is the imposter's hint and nobody
   else's, and the whole table sees it on the play screen once everybody has looked.

   THE BIG LINE AND THE BUTTON DO NOT MOVE from the first "Pass to" to "Reveal". Every one of those
   screens draws the same slots — small line, big line, small line, button, and with Read aloud on the
   speaker's room under the button — empty or not, so the card is one height on all of them. The
   phone goes to children who cannot read the button yet, and "the gold one under the big word" has to
   be the same place every time. Show, Hide and Listen carry the app's own marks (`TILE_ICONS`): an open eye, a
   shut one and a speaker, so the three a child presses alone are known by picture as well as place.

   AND THE SAME PLACE CUTS BOTH WAYS: a double tap lands its second tap on the button just drawn
   there. Measured in Chromium with a touch double tap at 390, the review of 8 October: on Show it
   flashed the card and passed the turn on unseen; on Hide it opened the NEXT player's card in this
   player's hands; on the last Hide it went straight to Reveal before a word had been said. So Show,
   Hide and Reveal ignore a press that comes within `IMP_GAP` of the last one — see
   `impTooSoon_`. The button stays where it is; it is the second tap that goes.
================================================================================================== */
const IMP_MIN = 3, IMP_MAX = 12;

/* THE WORDS ARE THINGS, NOT IDEAS. Articulate's deck can hold `stage fright`, because it is
   described one sentence at a time; this one is talked about ONE WORD at a time, round a circle,
   so a card has to be something everybody can say three different true words about — and
   something a child in the room has heard of.

   TWENTY-SEVEN CATEGORIES OF THIRTY, 810 cards, where there were eleven of twenty-two (242) — "while
   adding more categories and words", in the same note as the simpler screens. SPLIT FINER AS WELL AS
   GROWN, because the category is the imposter's whole hint: "Animals" over a shark, a bee and a
   hamster told them almost nothing, and "Sea life" tells them enough to say "salty" and sound right.
   THIRTY IN EVERY ONE, because the pile below is every (category, word) pair, so a category's share
   of the rounds is its share of the cards — a category of forty beside one of twenty would come up
   twice as often for no reason anybody chose. `check-widgets.js` holds the shape: at least 25
   categories, at least 30 words in each, no word twice anywhere (`hairdresser` in Jobs and
   `hairdresser’s` in Places were the same card in the old deck), and no word that says its own
   category, which is the hint handing the imposter half the answer (`school bus` and `school trip`
   were in School).

   ABOUT HALF OF THESE ARE ALSO IN ARTICULATE OR CHARADES, AND THAT IS ALLOWED. `check-widgets.js`
   refuses one word in both of those two, because a word described and then mimed is a word the
   room already knows the answer to. Nothing like that can happen here: the word is dealt at random
   from 810, only one person is trying to work it out, and a card from an hour ago tells them
   nothing about which one came up. Keeping ordinary words out to satisfy a rule written for a
   different game would leave the imposter a deck of words nobody can talk about. */
const IMP_DECK = {
  Food: [
    'pizza', 'burger', 'sandwich', 'spaghetti', 'fish and chips', 'fish fingers', 'hot dog', 'soup',
    'cereal', 'porridge', 'beans on toast', 'jacket potato', 'roast dinner', 'sausage roll',
    'curry', 'lasagne', 'omelette', 'boiled egg', 'macaroni cheese', 'shepherd’s pie', 'meatballs',
    'crumpet', 'bangers and mash', 'fried rice', 'sushi', 'tacos', 'nachos', 'fry-up',
    'spring rolls', 'dumplings',
  ],
  'Fruit and veg': [
    'apple', 'banana', 'orange', 'strawberry', 'grapes', 'carrot', 'watermelon', 'pineapple',
    'tomato', 'cucumber', 'pear', 'lemon', 'cherry', 'peas', 'broccoli', 'sweetcorn', 'blueberry',
    'mango', 'peach', 'plum', 'kiwi', 'coconut', 'lettuce', 'onion', 'pumpkin', 'sprouts', 'pepper',
    'avocado', 'celery', 'mushroom',
  ],
  'Sweets and treats': [
    'chocolate', 'ice cream', 'lollipop', 'biscuit', 'cupcake', 'doughnut', 'popcorn', 'crisps',
    'candyfloss', 'jelly', 'marshmallow', 'milkshake', 'brownie', 'sprinkles', 'bubblegum',
    'waffle', 'candy cane', 'pick and mix', 'slushie', 'fudge', 'crumble', 'trifle', 'cheesecake',
    'jam tart', 'flapjack', 'scone', 'hot cross bun', 'mince pie', 'Swiss roll', 'rocky road',
  ],
  'In the kitchen': [
    'fridge', 'kettle', 'toaster', 'microwave', 'oven', 'sink', 'plate', 'bowl', 'fork', 'mug',
    'frying pan', 'dishwasher', 'saucepan', 'teapot', 'wooden spoon', 'rolling pin', 'whisk',
    'tea towel', 'apron', 'chopping board', 'blender', 'baking tray', 'washing-up liquid', 'grater',
    'sieve', 'peeler', 'tin opener', 'measuring jug', 'ladle', 'spatula',
  ],
  'At home': [
    'bed', 'sofa', 'bath', 'television', 'stairs', 'toothbrush', 'window', 'key', 'mirror', 'lamp',
    'soap', 'curtains', 'wardrobe', 'carpet', 'bin', 'doorbell', 'remote control', 'duvet',
    'washing machine', 'vacuum cleaner', 'alarm clock', 'hairdryer', 'letterbox', 'radiator',
    'bookcase', 'chimney', 'attic', 'iron', 'mop', 'hot-water bottle',
  ],
  'In the garden': [
    'swing', 'trampoline', 'sunflower', 'paddling pool', 'watering can', 'shed', 'pond', 'barbecue',
    'sandpit', 'tree house', 'lawnmower', 'wheelbarrow', 'spade', 'rose', 'fence', 'gate',
    'bird feeder', 'greenhouse', 'hosepipe', 'rake', 'flowerpot', 'scarecrow', 'gnome', 'tulip',
    'seeds', 'weeds', 'washing line', 'hammock', 'vegetable patch', 'compost heap',
  ],
  Toolbox: [
    'hammer', 'screwdriver', 'ladder', 'saw', 'torch', 'drill', 'nail', 'batteries', 'sticky tape',
    'tape measure', 'brick', 'light bulb', 'padlock', 'paint roller', 'paint pot', 'spanner',
    'hard hat', 'wallpaper', 'magnifying glass', 'superglue', 'chain', 'plank', 'safety goggles',
    'plunger', 'nuts and bolts', 'pliers', 'scaffolding', 'sandpaper', 'workbench', 'crane',
  ],
  Clothes: [
    'socks', 'jumper', 'T-shirt', 'jeans', 'pyjamas', 'shorts', 'wellies', 'trainers', 'skirt',
    'raincoat', 'hoodie', 'scarf', 'gloves', 'woolly hat', 'sunglasses', 'slippers',
    'dressing gown', 'swimming costume', 'flip-flops', 'cap', 'leggings', 'tracksuit', 'helmet',
    'tie', 'belt', 'dungarees', 'nappy', 'kilt', 'high heels', 'earmuffs',
  ],
  'The body': [
    'nose', 'eye', 'ear', 'mouth', 'hand', 'foot', 'hair', 'teeth', 'arm', 'leg', 'tummy', 'knee',
    'toes', 'thumb', 'tongue', 'elbow', 'neck', 'shoulder', 'chin', 'heart', 'brain', 'skeleton',
    'beard', 'skin', 'forehead', 'wrist', 'ankle', 'muscles', 'freckles', 'fingerprint',
  ],
  'Wild animals': [
    'elephant', 'lion', 'monkey', 'giraffe', 'tiger', 'zebra', 'panda', 'kangaroo', 'crocodile',
    'polar bear', 'hippo', 'rhino', 'koala', 'camel', 'fox', 'owl', 'squirrel', 'hedgehog', 'frog',
    'bat', 'badger', 'eagle', 'flamingo', 'ostrich', 'peacock', 'toucan', 'sloth', 'meerkat',
    'otter', 'chameleon',
  ],
  'Pets and farm animals': [
    'dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'goldfish', 'horse', 'cow', 'pig', 'sheep',
    'chicken', 'duck', 'mouse', 'tortoise', 'pony', 'donkey', 'goat', 'budgie', 'parrot', 'rat',
    'goose', 'turkey', 'bull', 'cockerel', 'llama', 'ferret', 'lizard', 'reindeer', 'gerbil',
    'pigeon',
  ],
  'Sea life': [
    'shark', 'dolphin', 'whale', 'octopus', 'jellyfish', 'crab', 'starfish', 'penguin', 'seal',
    'turtle', 'seahorse', 'lobster', 'clownfish', 'orca', 'seaweed', 'squid', 'stingray', 'walrus',
    'pufferfish', 'coral', 'puffin', 'eel', 'prawn', 'narwhal', 'swordfish', 'tuna', 'oyster',
    'salmon', 'sea urchin', 'barnacle',
  ],
  Minibeasts: [
    'spider', 'bee', 'ladybird', 'butterfly', 'ant', 'snail', 'worm', 'caterpillar', 'slug',
    'beetle', 'wasp', 'fly', 'grasshopper', 'dragonfly', 'moth', 'centipede', 'woodlouse',
    'tadpole', 'stick insect', 'cobweb', 'beehive', 'daddy-long-legs', 'earwig', 'mosquito', 'flea',
    'maggot', 'chrysalis', 'praying mantis', 'pond skater', 'water boatman',
  ],
  Nature: [
    'rainbow', 'volcano', 'waterfall', 'tornado', 'snowflake', 'puddle', 'lightning', 'mountain',
    'river', 'forest', 'cave', 'island', 'desert', 'jungle', 'icicle', 'cloud', 'iceberg', 'lake',
    'conker', 'acorn', 'pine cone', 'cactus', 'palm tree', 'dandelion', 'hailstones',
    'stinging nettle', 'bluebell', 'daisy', 'nest', 'autumn leaves',
  ],
  Space: [
    'moon', 'sun', 'star', 'rocket', 'astronaut', 'alien', 'Earth', 'Mars', 'Saturn', 'Jupiter',
    'shooting star', 'telescope', 'flying saucer', 'black hole', 'satellite', 'crater', 'asteroid',
    'comet', 'solar system', 'galaxy', 'eclipse', 'Northern Lights', 'Pluto', 'Venus', 'Neptune',
    'Mercury', 'countdown', 'launch pad', 'mission control', 'constellation',
  ],
  'At the seaside': [
    'sandcastle', 'bucket and spade', 'shell', 'seagull', 'waves', 'rock pool', 'beach ball',
    'pier', 'lighthouse', 'suncream', 'deckchair', 'beach hut', 'rubber ring', 'pebbles',
    'stick of rock', 'snorkel', 'flippers', 'donkey ride', 'fishing net', 'lifeboat', 'cliff',
    'windbreak', 'parasol', 'cool box', 'helter-skelter', 'pedalo', 'postcard', 'bodyboard',
    'wetsuit', 'anchor',
  ],
  'Fairy tales': [
    'castle', 'dragon', 'witch', 'giant', 'unicorn', 'mermaid', 'princess', 'king', 'knight',
    'magic wand', 'Cinderella', 'Goldilocks', 'Three Little Pigs', 'Snow White', 'Red Riding Hood',
    'Big Bad Wolf', 'Gingerbread Man', 'Peter Pan', 'genie', 'troll', 'beanstalk',
    'Sleeping Beauty', 'Rapunzel', 'Pinocchio', 'Hansel and Gretel', 'wishing well', 'throne',
    'potion', 'Ugly Duckling', 'Puss in Boots',
  ],
  Countries: [
    'England', 'Scotland', 'Wales', 'France', 'Spain', 'Ireland', 'America', 'Australia', 'Italy',
    'China', 'Japan', 'India', 'Egypt', 'Germany', 'Canada', 'Jamaica', 'Mexico', 'Greece',
    'Brazil', 'Switzerland', 'Holland', 'New Zealand', 'Poland', 'South Africa', 'Kenya',
    'Portugal', 'Pakistan', 'Nigeria', 'Thailand', 'Peru',
  ],
  'Around town': [
    'playground', 'supermarket', 'zoo', 'swimming pool', 'cinema', 'library', 'hospital', 'café',
    'airport', 'theme park', 'museum', 'soft play', 'church', 'shopping centre', 'traffic lights',
    'zebra crossing', 'bowling alley', 'aquarium', 'hotel', 'campsite', 'petrol station', 'theatre',
    'stadium', 'fountain', 'skate park', 'chemist’s', 'nursery', 'phone box', 'mosque',
    'skyscraper',
  ],
  'Famous places': [
    'Big Ben', 'Eiffel Tower', 'London Eye', 'Buckingham Palace', 'Pyramids', 'Statue of Liberty',
    'North Pole', 'Tower Bridge', 'Stonehenge', 'Mount Everest', 'Great Wall', 'Leaning Tower',
    'Loch Ness', 'Sydney Opera House', 'Wembley', 'Antarctica', 'Sahara', 'Tower of London',
    'Niagara Falls', 'Grand Canyon', 'Taj Mahal', 'Colosseum', 'Venice', 'Great Barrier Reef',
    'Sphinx', 'Wimbledon', 'Hollywood', 'Hadrian’s Wall', 'Jurassic Coast', 'Land’s End',
  ],
  Jobs: [
    'teacher', 'doctor', 'firefighter', 'police officer', 'nurse', 'farmer', 'chef', 'vet', 'pilot',
    'builder', 'dentist', 'postman', 'hairdresser', 'baker', 'lifeguard', 'scientist', 'artist',
    'shopkeeper', 'dinner lady', 'lollipop lady', 'magician', 'waiter', 'plumber', 'mechanic',
    'detective', 'paramedic', 'actor', 'butcher', 'photographer', 'window cleaner',
  ],
  Sport: [
    'football', 'tennis', 'cricket', 'rugby', 'basketball', 'netball', 'golf', 'gymnastics',
    'skiing', 'ice skating', 'karate', 'hockey', 'rounders', 'surfing', 'badminton', 'horse riding',
    'dodgeball', 'skateboarding', 'diving', 'sack race', 'trophy', 'referee', 'climbing', 'sailing',
    'volleyball', 'rowing', 'high jump', 'hurdles', 'marathon', 'weightlifting',
  ],
  School: [
    'ruler', 'scissors', 'pencil case', 'homework', 'lunchbox', 'uniform', 'crayons', 'rubber',
    'playtime', 'desk', 'glue stick', 'whiteboard', 'paintbrush', 'book bag', 'PE kit',
    'sports day', 'spelling test', 'assembly', 'gold star', 'calculator', 'exercise book',
    'sharpener', 'glitter', 'globe', 'magnet', 'microscope', 'nativity play', 'show and tell',
    'coat peg', 'lost property',
  ],
  Transport: [
    'car', 'bicycle', 'aeroplane', 'train', 'double-decker bus', 'scooter', 'helicopter',
    'fire engine', 'ambulance', 'tractor', 'taxi', 'lorry', 'digger', 'motorbike', 'submarine',
    'hot-air balloon', 'ice-cream van', 'pushchair', 'caravan', 'sledge', 'canoe', 'speedboat',
    'go-kart', 'ferry', 'cruise ship', 'tram', 'cable car', 'monster truck', 'cement mixer', 'raft',
  ],
  Celebrations: [
    'birthday party', 'Christmas', 'Halloween', 'Easter egg', 'wedding', 'Bonfire Night',
    'presents', 'balloons', 'sleepover', 'fancy dress', 'picnic', 'disco', 'Valentine’s Day',
    'Mother’s Day', 'Pancake Day', 'April Fools’ Day', 'New Year’s Eve', 'Chinese New Year',
    'Diwali', 'Eid', 'Hanukkah', 'Holi', 'advent calendar', 'cracker', 'piñata', 'bunting',
    'carnival', 'World Book Day', 'harvest festival', 'pantomime',
  ],
  'Toys and games': [
    'teddy bear', 'doll', 'kite', 'bubbles', 'hide and seek', 'jigsaw', 'robot', 'puppet', 'yo-yo',
    'skipping rope', 'building blocks', 'slime', 'dice', 'marbles', 'snakes and ladders',
    'bouncy castle', 'hopscotch', 'pass the parcel', 'stickers', 'hula hoop', 'playing cards',
    'dominoes', 'chess', 'noughts and crosses', 'treasure hunt', 'Simon says', 'roller skates',
    'spinning top', 'pogo stick', 'jack-in-the-box',
  ],
  Music: [
    'guitar', 'drums', 'piano', 'violin', 'trumpet', 'recorder', 'microphone', 'headphones',
    'triangle', 'tambourine', 'maracas', 'xylophone', 'radio', 'harp', 'cymbals', 'choir',
    'karaoke', 'pop star', 'concert', 'ballet', 'talent show', 'lullaby', 'orchestra', 'saxophone',
    'bagpipes', 'harmonica', 'trombone', 'tuba', 'castanets', 'accordion',
  ],
};

/* ONE PILE OF EVERY (category, word) PAIR, shuffled once and dealt from the top, so no word comes
   round twice until the whole deck has — which is the same promise `roundNext_` makes, one level
   up, because here the category changes every round too. */
let IMP_PILE = [];
function impDraw_() {
  if (!IMP_PILE.length) {
    const all = [];
    Object.keys(IMP_DECK).forEach(c => IMP_DECK[c].forEach(w => all.push([c, w])));
    IMP_PILE = herdShuffle_(all);
  }
  return IMP_PILE.pop();
}

/* HOW MANY PLAY IS KEPT ON THE DEVICE, because it is the same four people at the same table next
   week. The try is the house rule for storage: a browser that refuses it still gets a game. */
function impCount_(n) {
  if (n !== undefined) {
    try { localStorage.setItem('imp-n', String(n)); } catch (e) {}
    return n;
  }
  let v = 4;
  try { v = parseInt(localStorage.getItem('imp-n'), 10) || 4; } catch (e) {}
  return Math.max(IMP_MIN, Math.min(IMP_MAX, v));
}

/* ---------- READ ALOUD, FOR THE ONES WHO CANNOT READ YET -------------------------------------------
   ASKED FOR AS "For the imposter game can you have have it so young ones who can’t read can play.
   Like it will read it out for them." (8 Oct.)

   THE BROWSER'S OWN VOICE — `speechSynthesis` — and nothing else: no network, no key, nothing to
   install, and it works on the iPad at the table with the wifi off. A British voice where the phone
   has one, a little slower than its own pace. Where there is no voice at all the switch is not drawn
   and the game is exactly the one above, which is the house rule about anything that can be absent.

   ONE SWITCH, OFF UNTIL SOMEBODY TURNS IT ON, and remembered like the player count: it is the same
   family at the same table next week. Off by default because a phone that starts talking in a
   classroom is a phone that gets put away.

   THE SECRET IS NEVER SAID BY ITSELF. A phone that read the word out as the card came up would tell
   the whole table — the one thing this game cannot survive. So the card has LISTEN, pressed by the
   person holding it, said at a little over half volume, and pressable again for "say it again". The
   pass screen is what tells them how, and it TELLS them, out loud, because a child who cannot read
   the card cannot read that sentence either.

   AND IT TELLS THEM IN THE ORDER THE PRESSES GO. It said "Hold the phone to your ear, then press
   Show" — but Show makes no sound, so a child who did exactly that heard nothing, and the gold button
   now under their thumb was Hide: the obvious next press, and it passed their turn on without them
   ever hearing the word (the review of 8 October). So it names the speaker, and puts the ear last.

   WHAT EVERYBODY MAY HEAR IS SAID BY ITSELF — whose turn it is, who starts, who it was — and only on
   the press that brings that screen up. A browser lets a page talk in answer to a tap (Safari refuses
   a first `speak()` outside one), and a press is also the only moment somebody is listening for it.
   So `impPaint` has no voice: a repaint, a payload landing, a column swiped back to, all say nothing.

   AND WHAT IS STILL BEING SAID IS CUT OFF FIRST. Hide, Play again, Players and leaving the column
   each start with `impHush_`, before anything else they do — a word half-spoken when the phone is
   handed on finishes in the next player's ear otherwise, and `speak()` queues rather than replaces. */
function impCanSay_() {
  try { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance); } catch (e) { return false; }
}
function impAloud_(on) {
  if (on !== undefined) {
    try { localStorage.setItem('imp-aloud', on ? '1' : '0'); } catch (e) {}
    return on;
  }
  let v = false;
  try { v = localStorage.getItem('imp-aloud') === '1'; } catch (e) {}
  return v && impCanSay_();
}
function impHush_() {
  try { if (impCanSay_()) window.speechSynthesis.cancel(); } catch (e) {}
}
/* `lang` AS WELL AS `voice`, because Chrome hands back no voices at all until its list has loaded —
   the first round of the day would get whatever the phone defaults to. `lang` is a request any
   engine honours with the list empty; `voice` is the exact one when there is a list to pick from. */
function impSay_(text, quiet) {
  if (!impAloud_()) return;
  try {
    const ss = window.speechSynthesis;
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    const gb = (typeof ss.getVoices === 'function' ? ss.getVoices() || [] : [])
      .find(v => /^en[-_]GB/i.test(String(v.lang || '')));
    if (gb) u.voice = gb;
    u.rate = 0.9;
    u.volume = quiet ? 0.6 : 1;
    ss.speak(u);
  } catch (e) {}
}
/* WHAT A SCREEN SAYS WHEN A PRESS BRINGS IT UP — only the ones nothing secret is on. The card says
   nothing until Listen, which is `imp-listen` below and not here. */
function impAnnounce_() {
  const s = IMP, player = i => 'Player ' + (i + 1);
  if (s.phase === 'deal' && !s.shown) impSay_(player(s.at) + '. Press Show, then the speaker, and hold the phone to your ear.');
  else if (s.phase === 'play') impSay_(s.cat + '. ' + player(s.first) + ' starts.');
  else if (s.phase === 'reveal') impSay_('The imposter was ' + player(s.imp) + '. The word was ' + s.word + '.');
}

/* `phase` IS ONE OF idle · deal · play · reveal, and `at` is whose turn it is to look while dealing.
   `shown` is whether that player's card is up — the one piece of state that must never outlive the
   person holding the phone, which is what `impHide_` is for. */
const IMP_IDLE = () => ({ phase: 'idle', n: 0, at: 0, shown: false, imp: 0, first: 0, cat: '', word: '' });
let IMP = IMP_IDLE();

/* ---------- A SECOND TAP IS NOT A SECOND PRESS -------------------------------------------------
   SHOW, HIDE AND REVEAL ARE DRAWN ON THE SAME PIXELS, which is the design — and a double tap, the
   most common thing a five-year-old does to a button, then presses two screens in one go. Measured
   in Chromium with two touch taps 120ms apart: Show then Hide (the card flashed and the turn moved
   on unseen), Hide then the next player's Show (Player 1 holding Player 2's card), the last Hide then
   Reveal (the imposter named before anybody had played). Deal and Play again overlap Show's box too.

   SO THOSE THREE IGNORE A PRESS WITHIN `IMP_GAP` OF THE LAST PRESS. Every deliberate press
   here is further apart than that by a mile — a word is read, a phone is handed across a table, a
   round is played — so the only press it can cost is a second tap, and a child whose press was
   swallowed simply presses again. 600ms rather than a phone's own double-tap window (300–500ms),
   because a small child's two taps are slower than an adult's.

   `performance.now()` ON BOTH SIDES, rather than the event's `timeStamp`: one clock, and no browser's
   idea of what `timeStamp` counts from to trust. NOT A CSS `pointer-events` FADE-IN either, which the
   review prototyped and which works — but `prefers-reduced-motion` cuts every animation in style.css
   to .01ms, so the guard would vanish for exactly the people who asked for less to happen.

   ONLY FOR A PRESS THAT CAME WITH AN EVENT. The click listener in shell.js always passes one; a check
   or a state calling `ACTIONS[...]` straight is not a finger, and walks a whole round in one tick.

   TIMED FROM THE LAST PRESS, NOT FROM THE CARD BEING DRAWN. It was the draw, and a card is drawn by
   more than a press: a repaint when a payload lands, a return to the column. `check/press.js` found
   it (8 Oct) — it arrives on a card and presses inside 600ms of the draw, and Show, Hide and Reveal
   did nothing, which is exactly what a child gets who presses the moment the column slides back. A
   double tap is two PRESSES close together, so that is what is measured: Deal, Show, Hide, Reveal
   and Play again each stamp the time they acted (`impPressed_`), and only a press that close behind
   one of them is the second tap. */
const IMP_GAP = 600;
let IMP_PRESSED = -Infinity;
function impTooSoon_(e) {
  if (!e) return false;
  try { return performance.now() - IMP_PRESSED < IMP_GAP; } catch (err) { return false; }
}
function impPressed_(e) {
  if (!e) return;
  try { IMP_PRESSED = performance.now(); } catch (err) {}
}

function impDeal_(n) {
  const [cat, word] = impDraw_();
  IMP = { phase: 'deal', n: n, at: 0, shown: false,
          imp: Math.floor(Math.random() * n), first: Math.floor(Math.random() * n),
          cat: cat, word: word };
}

/* THE SLOTS EVERY SCREEN FROM "Pass to" TO "Reveal" IS DRAWN IN — see "the big line and the button
   do not move" above. An empty slot is drawn empty rather than left out, which is the whole trick: the
   stylesheet gives it its height either way.

   AND THE SPEAKER'S ROOM IS KEPT ON THE SCREENS WITHOUT ONE. The first version only hung the card from
   its top, so that Listen under the button pushed nothing up inside the card — and the screenshots at
   320 and 390 still had Hide 36px above where Show had been, because the column centres the whole
   widget in the pane and a card 72px taller is centred 36px higher. So it is the card's HEIGHT that
   has to be the same, and `foot` is Listen on a card and an empty 64px (with Listen's 20px over it)
   on the pass and play screens while Read aloud is on; with it off there is no speaker anywhere and
   nothing to keep room for. */
function impFrame_(over, big, under, button, foot) {
  return `<p class="art-cat-of imp-lab">${esc(over)}</p>
    <p class="art-word imp-big">${esc(big)}</p>
    <p class="art-cat-of imp-lab">${esc(under)}</p>
    ${button}${foot || ''}`;
}
/* THE MARK BESIDE THE WORD, NOT INSTEAD OF IT — `tile_`'s own rule turned round, because a gold button
   that a reader reads and a non-reader recognises has to carry both. WRITTEN OUT AT EACH BUTTON rather
   than built by a helper from its action's name: `check-doors.js` pairs every `data-do` it can read
   with a handler, and the first version here built three of them from a variable and left Show, Hide
   and Reveal as "a handler with no door". FUNCTIONS AND NOT STRINGS, because tiles.js loads after this
   file: a `const` built at load would call `tileIcon_` before there is one — which `check.js` let
   through when this was written, and reports now. */
const impShow_ = () => `<button class="art-go imp-go" data-do="imp-show">${tileIcon_('show')}<span>Show</span></button>`;
const impHideBtn_ = () => `<button class="art-go imp-go" data-do="imp-hide">${tileIcon_('hide')}<span>Hide</span></button>`;
const impReveal_ = () => `<button class="art-go imp-go" data-do="imp-reveal"><span>Reveal</span></button>`;

/* DRAWN FROM THE STATE, the `REEL_HELD` rule — the handlers change `IMP` and ask for a paint, and
   nothing is ever patched onto the element. EVERY CONTROL IS BUILT HERE rather than written into
   the widget's markup, which is the Scrabble lesson: a button that is on the page before it can do
   anything is one `check/press.js` presses and correctly reports dead. AND NOTHING HERE SPEAKS — see
   "read aloud" above. */
function impPaint() {
  const card = $('imp-card'), acts = $('imp-acts');
  if (!card) return;
  const s = IMP;
  const player = i => 'Player ' + (i + 1);
  if (acts) acts.innerHTML = '';
  if (s.phase === 'idle') {
    const n = impCount_();
    /* THE SWITCH IS A FORM'S CONTROL, so it is a button (CLAUDE.md: a FORM has buttons) — with the
       word, because the adult setting the game up is the one person here who reads it. */
    const on = impAloud_();
    card.innerHTML = `<p class="art-cat-of">Players</p>
      <div class="imp-count">
        <button class="imp-step" data-do="imp-count" data-d="-1" aria-label="One player fewer"
          ${n <= IMP_MIN ? 'disabled' : ''}>&minus;</button>
        <span class="art-score" id="imp-n">${n}</span>
        <button class="imp-step" data-do="imp-count" data-d="1" aria-label="One player more"
          ${n >= IMP_MAX ? 'disabled' : ''}>+</button>
      </div>
      ${impCanSay_() ? `<button class="imp-aloud${on ? ' on' : ''}" data-do="imp-aloud"
        aria-pressed="${on ? 'true' : 'false'}">${tileIcon_('speak')}<span>Read aloud</span><span
        class="imp-sw" aria-hidden="true"></span></button>` : ''}
      <button class="art-go" data-do="imp-start">Deal</button>`;
    return;
  }
  const aloud = impAloud_();
  const room = aloud ? '<span class="imp-foot" aria-hidden="true"></span>' : '';
  if (s.phase === 'deal' && !s.shown) {
    card.innerHTML = impFrame_('Pass to', player(s.at), '', impShow_(), room);
    return;
  }
  if (s.phase === 'deal') {
    const me = s.at === s.imp;
    card.innerHTML = impFrame_('', me ? 'Imposter' : s.word, me ? 'Hint: ' + s.cat : '', impHideBtn_(),
      aloud ? tile_({ icon: 'speak', label: 'Listen', act: 'imp-listen', tone: 'listen' }) : '');
    return;
  }
  if (s.phase === 'play') {
    card.innerHTML = impFrame_(s.cat, player(s.first) + ' starts', '', impReveal_(), room);
    return;
  }
  card.innerHTML = `<p class="art-over">Imposter</p>
    <p class="art-score">${esc(player(s.imp))}</p>
    <p class="art-over">Word</p>
    <p class="art-word">${esc(s.word)}</p>`;
  if (acts) {
    acts.innerHTML = `<button class="btn" data-do="imp-again">Play again</button>
      <button class="btn quiet" data-do="imp-players">Players</button>`;
  }
}

function initImposter() {
  if (!$('imp-card')) return;
  impPaint();
}

/* A WORD LEFT UP WHEN THE COLUMN GOES IS A WORD THE NEXT PERSON SEES, so leaving hides it. The
   round is kept — this is `stop`, not `New game` — and whoever was looking presses Show again. And a
   word still being SAID is a word the next person hears, so the voice stops first. */
function impHide_() {
  impHush_();
  /* AND REPAINTED, not just forgotten: the column is still in the document off to one side, so a
     word left in its markup is a word the next repaint of anything is not obliged to remove. */
  if (IMP.phase === 'deal' && IMP.shown) { IMP.shown = false; impPaint(); }
}

on('imp-count', el => {
  const d = parseInt(el.getAttribute('data-d'), 10) || 0;
  impCount_(Math.max(IMP_MIN, Math.min(IMP_MAX, impCount_() + d)));
  impPaint();
});
on('imp-aloud', () => { impAloud_(!impAloud_()); impPaint(); });
on('imp-start', (el, e) => { impHush_(); impPressed_(e); impDeal_(impCount_()); impPaint(); impAnnounce_(); });
/* SHOW, HIDE AND REVEAL TAKE `(el, e)` FOR `impTooSoon_` — see "a second tap is not a second press". */
on('imp-show', (el, e) => {
  if (IMP.phase !== 'deal' || IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = true;
  impPaint();
});
/* THE ONLY PLACE THE SECRET IS SPOKEN, and only with the card up — so only by the person who pressed
   Show. Hushed first so a second press says it again rather than queueing a second copy behind it.

   THE TWO LINES ARE THE SAME SHAPE AND ABOUT THE SAME LENGTH, because the table can hear HOW LONG a
   phone talks even where it cannot make out a word. It was "Pizza." (about 0.6s) against "You’re the
   imposter. The hint is food." (about 3s), so whichever phone talked five times longer was the
   imposter's — and in one round every player's line is the same length, so the odd one out stood
   out. Counted in syllables over all 810 cards: 2 against 11 on average before; 10.6 against 10.6
   now, and within two syllables of each other for 72% of cards. The word said TWICE is the other
   half of it: the first is said while the phone is still going up, the second at the ear.

   STARTED ON THE TAP AND NOT AFTER A PAUSE, though the review offered one (1.2–1.5s, so the phone is
   at the ear first). Safari will only start speech in answer to a tap until something has spoken,
   and a delayed line is not in answer to one; nothing here can try that on an iPhone, and a Listen
   that says nothing on the family's own phone is worse than one that starts a moment early. */
on('imp-listen', () => {
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  impHush_();
  const w = String(IMP.word);
  impSay_(IMP.at === IMP.imp
    ? 'You’re the imposter. Your hint is ' + String(IMP.cat).toLowerCase() + '.'
    : 'Your word is ' + w + '. Your word is ' + w + '.', true);
});
/* HUSHED BEFORE THE GUARD, so a second tap that is ignored still stops the voice — which is never
   wrong when the phone may be on its way to somebody else. */
on('imp-hide', (el, e) => {
  impHush_();
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = false;
  if (IMP.at < IMP.n - 1) IMP.at++;
  else IMP.phase = 'play';
  impPaint();
  impAnnounce_();
});
/* GUARDED BEFORE THE HUSH, the other way round from Hide: a second tap of the last Hide lands here,
   and the line it would cut off is "Food. Player 3 starts." — which the table is meant to hear. */
on('imp-reveal', (el, e) => {
  if (IMP.phase !== 'play') return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impHush_();
  IMP.phase = 'reveal';
  impPaint();
  impAnnounce_();
});
on('imp-again', (el, e) => { impHush_(); impPressed_(e); impDeal_(IMP.n || impCount_()); impPaint(); impAnnounce_(); });
on('imp-players', () => { impHush_(); IMP = IMP_IDLE(); impPaint(); });

/* ==================================================================================================
   FOUR CLASSROOM GAMES — Just a Minute, Taboo, Hot Seat and 20 Questions.

   ASKED FOR AS A LIST, in the owner's own descriptions:
     "Just a Minute - A student speaks continuously about a random topic for 60 seconds without
      hesitating."
     "Taboo - Students describe a secret word without using a list of forbidden related words."
     "Hot Seat - The class shouts clues to help a student guess the word written on the board
      behind them."
     "20 Questions - The class asks up to 20 yes or no questions to deduce a secret person, place,
      or thing."
   THE LIST HAD A FIFTH, ALIBI, AND IT IS GONE — see the note where its section was, above
   `PARTY_GAMES`.

   NOT `ROUND_GAMES`, AND THE REASON IS ONE LINE OF `initRound`. That engine throws the round away
   every time the widget starts — `roundAt[k] = null` — and a widget starts on every `repaint`,
   which runs whenever a payload lands or anything saves. Articulate and Charades live with that;
   these four were asked to keep their round through a repaint, and changing `initRound` under two
   games nobody asked about is a change nobody asked for. So the clock is written once more, here,
   for four — which is the same argument `ROUND_GAMES` makes for two.

   THE CLOCK IS A DEADLINE, NOT A COUNTDOWN. `setInterval(…, 1000)` with `left--` loses up to a
   second every time it is cleared and set again, and `toolsStart_` clears and sets every widget on
   every repaint. So a running round holds `ends` (a moment) and a held one holds `left` (a length),
   and the number on the screen is always one subtracted from the other.

   `stop` IS CALLED IN TWO DIFFERENT SITUATIONS AND THEY MUST NOT BE TREATED ALIKE. `toolsStart_`
   calls `toolsStop_` before every start, so a repaint with the Games column in front is a stop and
   a start a moment apart; leaving the column is a stop on its own. `go` has already moved `AT` when
   it stops the widgets, so `partyHere_` can tell them apart: a repaint carries on as if nothing
   happened, and a column left behind is PAUSED until somebody presses Resume — a minute that runs
   out while the phone is on another screen is a round nobody played.

   NO SCORE IS KEPT BETWEEN ROUNDS, for Articulate's reason: the round's own count is on the screen
   while it matters, and a running total belongs to the people playing.
================================================================================================== */
/* ---------- THE DECKS ------------------------------------------------------------------------------
   EVERY ONE IS ABOUT SOMETHING A CHILD IN THE ROOM HAS HEARD OF, because a tutor is the one reading
   it out and a card nobody can talk about is a round that stops dead.

   AND NO ENTRY IS IN TWO OF THE WORD DECKS ON THIS COLUMN — these four and Articulate's and
   Charades' — which `check-widgets.js` enforces, for the reason it gives about `Countdown`: a word
   dealt twice in one sitting is a word the room already knows the answer to. Imposter is left out
   of that comparison on purpose, and its own note says why.

   JUST A MINUTE'S TOPICS ARE BROAD ON PURPOSE. A minute is long; "Hats" can fill it and "the
   history of the bowler hat" cannot. */
const JAM_DECK = [
  'My perfect Saturday', 'The best invention ever', 'Breakfast', 'My dream holiday',
  'Rainy days', 'Forests', 'Learning to ride a bike', 'Space travel', 'The perfect sandwich',
  'Why homework exists', 'Being the youngest', 'Being the oldest', 'Snow days', 'Board games',
  'The seaside', 'The perfect pet', 'Pets I would like', 'Things that make me laugh', 'Ice cream flavours',
  'Superheroes', 'If I ruled the world', 'Inventing a new sport', 'My bedroom', 'Going underground',
  'The smell of rain', 'Shoes', 'Grandparents', 'Camping', 'The moon', 'Wild animals', 'Nature walks',
  'Video games', 'Bath time', 'Autumn leaves', 'Sleep', 'Musical instruments',
  'The journey to school', 'Tidying up', 'Splashing about', 'Animals in the sea', 'Animals at night', 'The ocean floor',
  'Trees', 'My favourite colour', 'Hats', 'Birds in the garden', 'Things I would invent', 'Time travel',
  'Being invisible for a day', 'Flying cars', 'The best smell in the world', 'Cooking',
  'Gardening', 'Maths', 'Why we go to school', 'My favourite animal', 'Mobile phones', 'Tiny things', 'The sun',
  'Mountains', 'Rivers', 'Treasure', 'Things that need batteries', 'A day without screens', 'Ghost stories', 'The Romans',
  'The ancient Egyptians', 'Things that fly', 'Farm animals', 'Big cats', 'The jungle', 'The Arctic',
  'My best friend', 'Lucky things', 'Keeping a secret', 'Making new friends', 'Being brave', 'Things I am good at', 'Something I would like to learn', 'Old toys', 'Staying up late',
  'Farms', 'Circuses', 'Theme parks', 'Roller coasters', 'Running', 'Dancing', 'Singing',
  'Drawing', 'Reading', 'Writing stories', 'Comics', 'Cartoons', 'Haircuts', 'Teeth',
  'My favourite book', 'Manners', 'Shopping', 'Money', 'Saving up', 'Pocket money', 'Chores', 'Weather',
  'Thunder', 'Windy days', 'Summer holidays', 'The first day of school', 'Lost property',
  'Lunchtime', 'Packed lunches', 'School dinners', 'Digging in the garden', 'Origami',
  'Lego', 'Slime', 'Magic tricks', 'Quiet places', 'Building a den', 'Picnics', 'Big cities',
  'Bread', 'Cheese', 'Getting up in the morning', 'Vegetables I like', 'Vegetables I do not like', 'Fruit',
  'Cereal', 'Toast', 'Soup', 'Puddings', 'Sweets', 'Biscuits', 'My best day ever',
  'The worst present I ever got', 'What I want to be when I grow up', 'Holidays at home',
  'Car journeys', 'Aeroplanes', 'Boats', 'Buses', 'Lazy Sundays', 'Tall buildings', 'Museums',
  'Football boots', 'Pet fish', 'My favourite film', 'Cats', 'Sports day', 'Hamsters', 'School trips',
  'Fairy tales', 'People I look up to', 'Bugs in the garden', 'Stars', 'Planets', 'Saving the planet', 'Swimming lessons',
  'Mysteries', 'Kings and queens', 'Puzzles', 'Myths and legends', 'Numbers', 'Shapes', 'Team games',
  'Hot places', 'Seasons', 'Winter', 'Spring', 'Summer', 'Autumn',
];

/* TABOO: THE WORD, THEN THE FIVE YOU MAY NOT SAY. The five are the words anybody would reach for
   first — which is the whole game — so they are the obvious ones, not the clever ones. */
const TABOO_DECK = [
  ['pizza', 'cheese', 'Italy', 'slice', 'tomato', 'topping'],
  ['library', 'books', 'borrow', 'quiet', 'read', 'shelves'],
  ['birthday', 'cake', 'candles', 'party', 'present', 'age'],
  ['snowman', 'snow', 'carrot', 'winter', 'build', 'melt'],
  ['space suit', 'space', 'astronaut', 'helmet', 'wear', 'moon'],
  ['dinosaur', 'extinct', 'T. rex', 'fossil', 'reptile', 'Jurassic'],
  ['penalty kick', 'football', 'goal', 'spot', 'shoot', 'keeper'],
  ['eye patch', 'pirate', 'eye', 'cover', 'black', 'one'],
  ['toothpaste', 'teeth', 'brush', 'tube', 'mint', 'white'],
  ['volcanic eruption', 'lava', 'mountain', 'explode', 'ash', 'hot'],
  ['cornflakes', 'cereal', 'breakfast', 'milk', 'bowl', 'corn'],
  ['ice skates', 'ice', 'rink', 'blades', 'skate', 'boots'],
  ['jelly beans', 'sweets', 'jelly', 'beans', 'colourful', 'chewy'],
  ['rainforest', 'trees', 'Amazon', 'jungle', 'wet', 'animals'],
  ['homework', 'school', 'teacher', 'evening', 'worksheet', 'due'],
  ['pencil case', 'pens', 'school', 'zip', 'bag', 'pencils'],
  ['hula hoop', 'hips', 'spin', 'circle', 'plastic', 'wiggle'],
  ['cobweb', 'spider', 'web', 'dust', 'corner', 'sticky'],
  ['bicycle', 'pedal', 'wheels', 'ride', 'helmet', 'bike'],
  ['popcorn', 'cinema', 'corn', 'pop', 'butter', 'snack'],
  ['ghost', 'scary', 'haunted', 'boo', 'sheet', 'spirit'],
  ['castle', 'king', 'tower', 'moat', 'drawbridge', 'stone'],
  ['rocket', 'space', 'launch', 'blast off', 'astronaut', 'fly'],
  ['dragon', 'fire', 'wings', 'breathe', 'myth', 'scales'],
  ['sticky tape', 'stick', 'roll', 'clear', 'wrap', 'Sellotape'],
  ['lifejacket', 'boat', 'float', 'water', 'safety', 'wear'],
  ['pyjamas', 'bed', 'sleep', 'night', 'wear', 'clothes'],
  ['zebra', 'stripes', 'horse', 'Africa', 'black', 'white'],
  ['scrambled eggs', 'eggs', 'breakfast', 'toast', 'mix', 'yellow'],
  ['hospital', 'doctor', 'nurse', 'ill', 'ward', 'ambulance'],
  ['combine harvester', 'farm', 'wheat', 'field', 'machine', 'crops'],
  ['robot', 'machine', 'metal', 'beep', 'computer', 'program'],
  ['unicorn', 'horn', 'horse', 'magic', 'rainbow', 'myth'],
  ['scuba tank', 'diving', 'air', 'underwater', 'oxygen', 'back'],
  ['raincoat', 'rain', 'wet', 'coat', 'hood', 'waterproof'],
  ['throne', 'king', 'queen', 'chair', 'royal', 'sit'],
  ['carrot', 'orange', 'vegetable', 'rabbit', 'root', 'eat'],
  ['magnet', 'attract', 'metal', 'fridge', 'north', 'pull'],
  ['tape measure', 'measure', 'metres', 'long', 'ruler', 'centimetres'],
  ['skeleton', 'bones', 'body', 'skull', 'Halloween', 'ribs'],
  ['cocoon', 'caterpillar', 'butterfly', 'silk', 'change', 'wrap'],
  ['train', 'track', 'station', 'carriage', 'railway', 'driver'],
  ['safari', 'Africa', 'animals', 'jeep', 'lions', 'wild'],
  ['sunflower', 'yellow', 'tall', 'seeds', 'petals', 'flower'],
  ['bathtub', 'water', 'bubbles', 'wash', 'bathroom', 'soak'],
  ['honey', 'bee', 'sweet', 'sticky', 'jar', 'golden'],
  ['clock', 'time', 'hands', 'tick', 'hour', 'wall'],
  ['moustache', 'face', 'hair', 'lip', 'beard', 'shave'],
  ['lettuce', 'salad', 'green', 'leaves', 'vegetable', 'rabbit'],
  ['treasure map', 'X', 'pirate', 'dig', 'gold', 'island'],
  ['microscope', 'small', 'lens', 'science', 'look', 'cells'],
  ['banana', 'yellow', 'fruit', 'peel', 'monkey', 'bunch'],
  ['scarecrow', 'farm', 'birds', 'straw', 'field', 'crows'],
  ['roller blades', 'skates', 'wheels', 'roll', 'boots', 'skating'],
  ['suit of armour', 'knight', 'metal', 'wear', 'castle', 'protect'],
  ['lemon', 'yellow', 'sour', 'fruit', 'juice', 'citrus'],
  ['firework', 'bang', 'sky', 'night', 'November', 'sparkle'],
  ['midnight snack', 'night', 'food', 'kitchen', 'sleep', 'eat'],
  ['school bus', 'yellow', 'children', 'ride', 'driver', 'morning'],
  ['paintbrush', 'paint', 'art', 'bristles', 'colour', 'canvas'],
  ['zip wire', 'slide', 'rope', 'fast', 'harness', 'trees'],
  ['igloo', 'ice', 'snow', 'house', 'cold', 'dome'],
  ['boomerang', 'Australia', 'throw', 'come back', 'curved', 'wood'],
  ['spaceship', 'alien', 'fly', 'space', 'UFO', 'rocket'],
  ['tooth fairy', 'tooth', 'pillow', 'money', 'night', 'fairy'],
  ['toffee apple', 'apple', 'sticky', 'sweet', 'stick', 'fair'],
  ['strawberry', 'red', 'fruit', 'seeds', 'cream', 'summer'],
  ['climbing frame', 'climb', 'playground', 'bars', 'monkey', 'park'],
  ['hot chocolate', 'drink', 'warm', 'cocoa', 'mug', 'marshmallows'],
  ['magic wand', 'magic', 'wizard', 'spell', 'stick', 'wave'],
  ['garden', 'grass', 'flowers', 'outside', 'plants', 'shed'],
  ['bakery', 'bread', 'cakes', 'shop', 'oven', 'bake'],
  ['swimming pool', 'water', 'swim', 'dive', 'lane', 'chlorine'],
  ['broccoli', 'green', 'vegetable', 'tree', 'healthy', 'florets'],
  ['tractor', 'farm', 'field', 'drive', 'wheels', 'plough'],
  ['alien', 'space', 'green', 'Mars', 'UFO', 'planet'],
  ['handbag', 'bag', 'carry', 'purse', 'shoulder', 'strap'],
  ['football pitch', 'grass', 'goal', 'lines', 'play', 'match'],
  ['snowball', 'snow', 'throw', 'cold', 'round', 'fight'],
  ['school bell', 'ring', 'school', 'break', 'loud', 'lesson'],
  ['marshmallow', 'soft', 'pink', 'white', 'toast', 'sweet'],
  ['abacus', 'beads', 'count', 'maths', 'wires', 'add'],
  ['zoo', 'animals', 'cages', 'visit', 'keeper', 'lion'],
  ['blanket', 'bed', 'warm', 'cover', 'wool', 'snuggle'],
  ['bubblegum', 'chew', 'blow', 'pink', 'sticky', 'pop'],
  ['egg cup', 'egg', 'boiled', 'breakfast', 'cup', 'spoon'],
  ['bookcase', 'books', 'shelves', 'wood', 'library', 'furniture'],
  ['traffic lights', 'red', 'green', 'amber', 'road', 'stop'],
  ['gravy', 'sauce', 'roast', 'brown', 'meat', 'dinner'],
  ['rollercoaster', 'ride', 'fast', 'theme park', 'loop', 'scream'],
  ['potato', 'chips', 'vegetable', 'mash', 'jacket', 'crisps'],
  ['cardigan', 'wool', 'jumper', 'buttons', 'wear', 'knit'],
  ['bridge', 'river', 'cross', 'over', 'water', 'road'],
  ['rainstorm', 'rain', 'wet', 'clouds', 'umbrella', 'heavy'],
  ['satchel', 'bag', 'leather', 'school', 'strap', 'books'],
  ['surfboard', 'waves', 'sea', 'beach', 'stand', 'ride'],
  ['playground', 'swings', 'slide', 'school', 'break', 'play'],
  ['nest', 'bird', 'eggs', 'tree', 'twigs', 'build'],
  ['leaf', 'tree', 'green', 'autumn', 'fall', 'plant'],
  ['oasis', 'desert', 'water', 'palm', 'sand', 'island'],
  ['pillow fight', 'pillow', 'feathers', 'bed', 'hit', 'sleepover'],
  ['mud', 'dirty', 'wet', 'brown', 'puddle', 'pig'],
  ['crisps', 'packet', 'salt', 'potato', 'crunch', 'snack'],
  ['wooden spoon', 'spoon', 'stir', 'kitchen', 'wood', 'cooking'],
  ['snowboard', 'snow', 'mountain', 'board', 'ski', 'slope'],
  ['cupcake', 'cake', 'icing', 'small', 'bake', 'sprinkles'],
  ['birdhouse', 'bird', 'box', 'garden', 'nest', 'wood'],
  ['lily pad', 'pond', 'frog', 'float', 'leaf', 'water'],
  ['map', 'directions', 'country', 'lost', 'paper', 'roads'],
  ['grandad', 'old', 'grandma', 'family', 'dad', 'grandparent'],
  ['bus stop', 'wait', 'bus', 'sign', 'road', 'shelter'],
  ['ketchup', 'red', 'sauce', 'tomato', 'chips', 'bottle'],
  ['science fair', 'science', 'experiment', 'school', 'project', 'show'],
  ['doorknob', 'door', 'handle', 'turn', 'open', 'round'],
  ['hot-water bottle', 'warm', 'bed', 'rubber', 'cold', 'fill'],
  ['fingerprint', 'finger', 'print', 'police', 'clue', 'swirl'],
  ['stopwatch', 'time', 'race', 'seconds', 'start', 'clock'],
  ['bookworm', 'read', 'books', 'worm', 'library', 'love'],
  ['greenhouse', 'glass', 'plants', 'garden', 'warm', 'grow'],
  ['cuckoo clock', 'bird', 'time', 'Switzerland', 'wooden', 'hour'],
  ['water bottle', 'drink', 'plastic', 'fill', 'thirsty', 'lid'],
  ['snowdrop', 'flower', 'white', 'winter', 'spring', 'snow'],
  ['goldfish', 'orange', 'bowl', 'pet', 'swim', 'memory'],
  ['tennis racket', 'ball', 'strings', 'hit', 'court', 'sport'],
  ['skyscraper', 'tall', 'building', 'city', 'floors', 'lift'],
  ['rubber duck', 'bath', 'yellow', 'toy', 'float', 'quack'],
  ['sunglasses', 'sun', 'eyes', 'dark', 'summer', 'wear'],
  ['shepherd’s pie', 'potato', 'mince', 'meat', 'oven', 'dinner'],
  ['moon landing', 'moon', 'astronaut', 'Apollo', 'step', 'space'],
  ['pin cushion', 'pins', 'sewing', 'needle', 'soft', 'prick'],
  ['braces', 'teeth', 'metal', 'dentist', 'straighten', 'smile'],
  ['cardboard box', 'cardboard', 'brown', 'packing', 'move', 'square'],
];

/* HOT SEAT: THINGS, NOT IDEAS. The class shouts clues at somebody who cannot see the word, so it has
   to be a thing everybody in the room can describe in a hurry. */
const HOT_DECK = [
  'pineapple', 'sledge', 'lantern', 'footstool', 'mittens', 'lobster', 'saxophone', 'windmill',
  'fire engine', 'wardrobe', 'doughnut', 'tiara', 'paddling pool', 'snorkel', 'coconut',
  'treehouse', 'jet ski', 'yo-yo', 'wellington boots', 'xylophone', 'raft', 'pumpkin',
  'scooter', 'spanner', 'radish', 'watermelon', 'cauliflower', 'bagpipes', 'snowplough',
  'ferris wheel', 'hot-air balloon', 'cannon', 'parachute', 'shopping basket', 'apron',
  'tambourine', 'tuba', 'sausage', 'meringue', 'kiwi fruit', 'avocado', 'mango', 'cherry',
  'grapes', 'plum', 'pepper', 'cucumber', 'sweetcorn', 'peas', 'fish pie', 'lasagne',
  'burrito', 'crumpet', 'fish and chips', 'hosepipe', 'flapjack', 'trifle', 'custard',
  'porridge', 'muffin', 'croissant', 'bagel', 'pretzel', 'waffle', 'smoothie', 'milkshake',
  'lemonade', 'orange juice', 'kazoo', 'cello', 'flute', 'recorder', 'harp', 'banjo',
  'accordion', 'maracas', 'triangle', 'cymbals', 'ukulele', 'drumsticks', 'helicopter',
  'canoe', 'tram', 'police car', 'motorbike', 'lorry', 'ferry', 'cable car', 'go-kart',
  'tandem', 'unicycle', 'roller skates', 'pogo stick', 'space hopper', 'helter-skelter',
  'climbing wall', 'bowling ball', 'dartboard', 'chessboard', 'playing cards', 'dice',
  'marbles', 'teddy bear', 'rocking horse', 'doll’s house', 'toy garage', 'kaleidoscope',
  'magnifying glass', 'binoculars', 'globe', 'atlas', 'dictionary', 'encyclopaedia',
  'notebook', 'pencil sharpener', 'protractor', 'set square', 'highlighter', 'crayon',
  'felt-tip pen', 'chalk', 'blackboard', 'easel', 'paint palette', 'clay', 'glitter',
  'tinsel', 'bauble', 'stocking', 'wreath', 'snow globe', 'cracker', 'paper chain', 'stilts',
  'bus ticket', 'feather duster', 'nutcracker', 'tutu', 'gazebo', 'fountain', 'bird table',
];

/* 20 QUESTIONS: A PERSON, A PLACE OR A THING, and the people are from history lessons and books
   rather than from this week's news — a living celebrity is a card some families would rather not
   have read out, and one a ten-year-old may never have heard of. */
const TWQ_DECK = {
  Person: [
    'Isaac Newton', 'Florence Nightingale', 'Albert Einstein', 'William Shakespeare',
    'Queen Victoria', 'Henry VIII', 'Charles Darwin', 'Marie Curie', 'Neil Armstrong',
    'Amelia Earhart', 'Leonardo da Vinci', 'Mary Seacole', 'Julius Caesar', 'Cleopatra',
    'Tutankhamun', 'Rosa Parks', 'Nelson Mandela', 'Martin Luther King', 'Emmeline Pankhurst',
    'Winston Churchill', 'Isambard Kingdom Brunel', 'Ada Lovelace', 'Alan Turing',
    'Grace Darling', 'Guy Fawkes', 'King Arthur', 'Father Christmas', 'Charles Dickens',
    'Sherlock Holmes', 'Boudicca', 'Thomas Edison', 'Galileo', 'Christopher Columbus',
    'Beatrix Potter', 'Roald Dahl', 'Mozart', 'Elizabeth I', 'Louis Braille', 'Sir Francis Drake',
    'Mickey Mouse', 'Wonder Woman', 'Anne Frank', 'Jane Austen', 'Captain Cook',
  ],
  Place: [
    'Mars', 'Jupiter', 'Saturn', 'Venus', 'Neptune', 'Africa', 'Lapland', 'London', 'Cardiff',
    'Disneyland', 'a dentist’s waiting room', 'a lifeboat station', 'a fish market', 'a fire station',
    'an attic', 'a bamboo forest', 'a coral island', 'a farmyard',
    'a football stadium', 'a swimming baths', 'a canal boat', 'a space station',
    'a log cabin', 'a bus garage', 'an aquarium', 'a toy shop', 'a post office',
    'a seesaw', 'a vegetable patch', 'a haunted house', 'the top of a mountain',
    'the bottom of the sea', 'a matchbox', 'a supermarket checkout', 'a laundrette',
    'a car wash', 'a petrol station', 'a harbour', 'a pet shop', 'a sweet shop',
    'an ice rink', 'a village hall', 'a cruise ship', 'a recording studio',
  ],
  Thing: [
    'a cork', 'a teaspoon', 'a safety pin', 'a paper clip', 'a fork', 'a door handle',
    'a flower pot', 'a light switch', 'a piggy bank', 'a crown', 'a sugar cube', 'a pine cone',
    'a pine needle', 'a pebble', 'a seashell', 'a raindrop', 'a cloud', 'a pair of glasses',
    'a thimble', 'a key', 'a coin', 'a banknote', 'a tennis ball', 'a rugby ball',
    'a cricket bat', 'a golf club', 'a hockey stick', 'a frisbee', 'a bowl of cereal',
    'a slice of toast', 'a boiled egg', 'an apple core', 'a peach stone', 'a jam jar',
    'a cup of tea', 'a glass of milk', 'a bar of soap', 'a towel', 'a sock', 'a woolly hat',
    'a nail file', 'a car tyre', 'a traffic cone', 'a lunch tray',
  ],
};

const PARTY = { jam: null, tab: null, hot: null, twq: null };
const PARTY_TICK = {};

/* EVERY ROUND IS DEALT FROM A SHUFFLED PILE, refilled when it runs out — `herdShuffle_` for the
   reason its own note gives — so nothing comes round twice until everything has. */
const PARTY_PILE = {};
function partyDraw_(key, list) {
  if (!PARTY_PILE[key] || !PARTY_PILE[key].length) PARTY_PILE[key] = herdShuffle_(list);
  return PARTY_PILE[key].pop();
}

function partyMs_(s) { return s ? (s.ends ? Math.max(0, s.ends - Date.now()) : (s.left || 0)) : 0; }
function partyClock_(s) { return roundClock_(Math.ceil(partyMs_(s) / 1000)); }

/* WHERE A STOP CAME FROM: is this game's own card on the screen in front? Asked of the DOM rather
   than of the column's name, and the first version is why. It said `AT === 'saved'` counts as here,
   because the Saved column holds starred games — true of a STARRED game and false of every other,
   so swiping from Games to Saved left a Taboo minute running on a card that was on no screen, and it
   ran out there: the exact fault the pause exists for. A repaint with the Games column in front still
   finds the card, because `paint` has put the new markup in before `toolsStart_` stops anything. */
function partyHere_(k) {
  if (typeof AT === 'undefined') return true;
  const scr = document.getElementById('s-' + AT);
  return !!(scr && scr.querySelector('#' + k + '-card'));
}

function partyRun_(k) {
  const s = PARTY[k];
  if (!s) return;
  clearInterval(PARTY_TICK[k]);
  s.run = true;
  s.ends = Date.now() + s.left;
  PARTY_TICK[k] = setInterval(() => partyTick_(k), 250);
}

function partyHold_(k) {
  clearInterval(PARTY_TICK[k]);
  PARTY_TICK[k] = 0;
  const s = PARTY[k];
  if (s && s.ends) { s.left = partyMs_(s); s.ends = 0; }
}

/* THE TICK WRITES THE CLOCK AND NOTHING ELSE. A full paint four times a second would rebuild the
   buttons under somebody's finger — a press that lands on an element replaced mid-tap is a press
   that does nothing. The card is painted when the STATE changes; the clock is the one thing that
   changes on its own. */
function partyTick_(k) {
  const s = PARTY[k];
  if (!s || !s.ends) { partyHold_(k); return; }
  if (partyMs_(s) <= 0) {
    partyHold_(k);
    s.left = 0;
    s.run = false;
    PARTY_GAMES[k].end(s);
    PARTY_GAMES[k].paint();
    return;
  }
  const c = $(k + '-left');
  if (c) c.textContent = partyClock_(s);
}

/* THE WIDGET'S `start`: redraw what is in progress, and set a clock running again if a repaint is
   all that stopped it. */
function partyStart_(k) {
  const s = PARTY[k];
  if (s && s.run && !s.ends && s.left > 0) partyRun_(k);
  if (PARTY_GAMES[k]) PARTY_GAMES[k].paint();
}

/* THE WIDGET'S `stop`. Always holds the clock; pauses the round only when the column has really
   gone. A secret on the screen goes with it, which is Imposter's rule: a column swiped away and
   back is exactly how the next person would see it. */
function partyStop_(k) {
  partyHold_(k);
  if (partyHere_(k)) return;
  const s = PARTY[k];
  if (!s) return;
  s.run = false;
  if (k === 'twq' && s.phase === 'shown') s.phase = 'hand';
  if (PARTY_GAMES[k]) PARTY_GAMES[k].paint();
}

on('party-resume', el => {
  const k = el.getAttribute('data-g');
  const s = PARTY[k];
  if (!s || s.phase !== 'go' || s.left <= 0) return;
  partyRun_(k);
  PARTY_GAMES[k].paint();
});

/* ONE PAINT FOR THE PAUSED CARD, because all four timed games pause the same way and say nothing
   secret while they do. Hot Seat calls the same card before its first word, which is the same
   moment: the phone has to be facing the right way before the clock moves. */
function partyHeld_(k, head, line, go) {
  return `<p class="art-cat-of">${esc(head)}</p>
    <p class="party-clock" id="${esc(k)}-left">${partyClock_(PARTY[k])}</p>
    ${line ? `<p class="imp-pass">${esc(line)}</p>` : ''}
    <button class="art-go" data-do="party-resume" data-g="${esc(k)}">${esc(go || 'Resume')}</button>`;
}

function partyBits_(k) {
  return { card: $(k + '-card'), acts: $(k + '-acts'), said: $(k + '-said') };
}

/* ---------- JUST A MINUTE -------------------------------------------------------------------------
   THE RADIO GAME'S THREE RULES ARE THE THREE BUTTONS. Hesitation, repetition and deviation are what
   the listeners catch, so each is a tally rather than a buzzer that stops the clock: in a classroom
   the point is to keep talking, and the count afterwards is the conversation about why. */
function jamPaint() {
  const { card, acts, said } = partyBits_('jam');
  if (!card) return;
  const s = PARTY.jam;
  if (!s) {
    card.innerHTML = `<button class="art-go" data-do="jam-start">Start</button>`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Talk for a minute. No hesitation, no repetition, no deviation.';
    return;
  }
  const t = s.tally;
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-word">${esc(s.topic)}</p>
      <p class="party-sum">Hesitation ${t.h} &middot; Repetition ${t.r} &middot; Deviation ${t.d}</p>`;
    if (acts) acts.innerHTML = `<button class="btn" data-do="jam-start">Next topic</button>`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    card.innerHTML = partyHeld_('jam', 'Paused', s.topic);
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">Talk about</p>
    <p class="art-word">${esc(s.topic)}</p>
    <p class="party-clock" id="jam-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      <button class="btn quiet party-call" data-do="jam-call" data-c="h">Hesitation<b>${t.h}</b></button>
      <button class="btn quiet party-call" data-do="jam-call" data-c="r">Repetition<b>${t.r}</b></button>
      <button class="btn quiet party-call" data-do="jam-call" data-c="d">Deviation<b>${t.d}</b></button>
    </div>`;
  }
  if (said) said.textContent = 'Tap one when somebody catches the speaker out.';
}

on('jam-start', () => {
  partyHold_('jam');
  PARTY.jam = { phase: 'go', topic: partyDraw_('jam', JAM_DECK), left: 60000, ends: 0, run: false,
                tally: { h: 0, r: 0, d: 0 } };
  partyRun_('jam');
  jamPaint();
});
on('jam-call', el => {
  const s = PARTY.jam;
  const c = el.getAttribute('data-c');
  if (!s || s.phase !== 'go' || !s.run || !(c in s.tally)) return;
  s.tally[c]++;
  jamPaint();
});

/* ---------- TABOO ---------------------------------------------------------------------------------
   THE FORBIDDEN WORDS ARE ON THE CARD UNDER THE WORD, because that is the card: the describer reads
   both, and whoever is watching for a slip reads the second half. Correct and Pass are one handler
   with one number different, Articulate's argument. */
function tabPaint() {
  const { card, acts, said } = partyBits_('tab');
  if (!card) return;
  const s = PARTY.tab;
  if (!s) {
    card.innerHTML = `<button class="art-go" data-do="tab-start">Start</button>`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Whoever is watching listens for a word from the list.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-over">correct &middot; ${s.passed} passed</p>`;
    if (acts) acts.innerHTML = `<button class="btn" data-do="tab-start">Next round</button>`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    /* THE WORD IS NOT ON A PAUSED CARD: whoever picks the phone up next may be on the other side. */
    card.innerHTML = partyHeld_('tab', 'Paused', s.score + ' correct so far');
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  const [word, ...ban] = s.card;
  card.innerHTML = `<p class="art-cat-of">Describe</p>
    <p class="art-word">${esc(word)}</p>
    <p class="art-over">Don’t say</p>
    <ul class="tab-ban">${ban.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <p class="party-clock" id="tab-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      <button class="btn" data-do="tab-next" data-got="1">Correct</button>
      <button class="btn quiet" data-do="tab-next" data-got="0">Pass</button>
    </div>`;
  }
  if (said) said.textContent = s.score + ' correct so far.';
}

on('tab-start', () => {
  partyHold_('tab');
  PARTY.tab = { phase: 'go', card: partyDraw_('tab', TABOO_DECK), score: 0, passed: 0,
                left: 60000, ends: 0, run: false };
  partyRun_('tab');
  tabPaint();
});
on('tab-next', el => {
  const s = PARTY.tab;
  if (!s || s.phase !== 'go' || !s.run) return;
  if (el.getAttribute('data-got') === '1') s.score++; else s.passed++;
  s.card = partyDraw_('tab', TABOO_DECK);
  tabPaint();
});

/* ---------- HOT SEAT ------------------------------------------------------------------------------
   THE WORD IS FOR THE CLASS AND NOT FOR THE ONE IN THE SEAT, so the phone is held up facing the room
   and the word only comes up once it is. Every round starts on the card that says so, with the clock
   still — the same card a round left behind comes back to, because it is the same moment. */
function hotPaint() {
  const { card, acts, said } = partyBits_('hot');
  if (!card) return;
  const s = PARTY.hot;
  if (!s) {
    card.innerHTML = `<button class="art-go" data-do="hot-start">Start</button>`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Whoever is in the hot seat sits with their back to the screen.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-over">guessed</p>`;
    if (acts) acts.innerHTML = `<button class="btn" data-do="hot-start">Next player</button>`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    card.innerHTML = partyHeld_('hot', s.left < 60000 ? 'Paused' : 'Ready',
      'Hold the phone up so only the class can see it.', 'Show the word');
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'The one in the hot seat does not look.';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">Clues for</p>
    <p class="art-word hot-word">${esc(s.word)}</p>
    <p class="party-clock" id="hot-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      <button class="btn" data-do="hot-next" data-got="1">Got it</button>
      <button class="btn quiet" data-do="hot-next" data-got="0">Pass</button>
    </div>`;
  }
  if (said) said.textContent = s.score + ' guessed so far.';
}

on('hot-start', () => {
  partyHold_('hot');
  PARTY.hot = { phase: 'go', word: partyDraw_('hot', HOT_DECK), score: 0, left: 60000, ends: 0,
                run: false };
  hotPaint();
});
on('hot-next', el => {
  const s = PARTY.hot;
  if (!s || s.phase !== 'go' || !s.run) return;
  if (el.getAttribute('data-got') === '1') s.score++;
  s.word = partyDraw_('hot', HOT_DECK);
  hotPaint();
});

/* ---------- 20 QUESTIONS --------------------------------------------------------------------------
   ONE PERSON KNOWS AND HOLDS THE PHONE, so it is dealt like Imposter's card: "hand the phone to
   whoever answers", Show me, then Hide — and only then the counter. Telling the room whether it is a
   person, a place or a thing is the classroom version's own first clue ("animal, vegetable or
   mineral"), so the category stays on the card and the answer does not.

   YES AND NO ARE BOTH ONE QUESTION ASKED. The count is the game; which way each went is what the
   class is keeping in its head. No timer, so `stop` has nothing to hold — only a secret to hide. */
const TWQ_MAX = 20;

function twqPaint() {
  const { card, acts, said } = partyBits_('twq');
  if (!card) return;
  const s = PARTY.twq;
  if (!s) {
    card.innerHTML = `<button class="art-go" data-do="twq-start">Choose a secret</button>`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'One of you holds the phone and answers; everybody else asks.';
    return;
  }
  if (s.phase === 'hand') {
    card.innerHTML = `<p class="imp-pass">Hand the phone to <b>whoever answers</b></p>
      <button class="art-go" data-do="twq-show">Show me</button>`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Nobody else looks.';
    return;
  }
  if (s.phase === 'shown') {
    card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
      <p class="art-word">${esc(s.word)}</p>
      <button class="art-go" data-do="twq-hide">Hide it</button>`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Remember it, then hide it.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">${s.asked >= TWQ_MAX ? 'Out of questions' : 'It was'}</p>
      <p class="art-word">${esc(s.word)}</p>
      <p class="art-over">${s.asked} of ${TWQ_MAX} questions asked</p>`;
    if (acts) acts.innerHTML = `<button class="btn" data-do="twq-start">Play again</button>`;
    if (said) said.textContent = '';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">It’s a ${esc(s.cat.toLowerCase())}</p>
    <p class="art-score">${s.asked} <span class="party-of">of ${TWQ_MAX}</span></p>
    <p class="art-over">questions asked</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      <button class="btn" data-do="twq-ask">Yes</button>
      <button class="btn" data-do="twq-ask">No</button>
    </div>
    <button class="btn quiet party-more" data-do="twq-reveal">Reveal</button>`;
  }
  if (said) said.textContent = 'Answer each question, then tap how you answered.';
}

on('twq-start', () => {
  const [cat, word] = partyDraw_('twq', Object.keys(TWQ_DECK)
    .reduce((all, c) => all.concat(TWQ_DECK[c].map(w => [c, w])), []));
  PARTY.twq = { phase: 'hand', cat: cat, word: word, asked: 0 };
  twqPaint();
});
on('twq-show', () => { if (PARTY.twq && PARTY.twq.phase === 'hand') { PARTY.twq.phase = 'shown'; twqPaint(); } });
on('twq-hide', () => { if (PARTY.twq && PARTY.twq.phase === 'shown') { PARTY.twq.phase = 'play'; twqPaint(); } });
on('twq-ask', () => {
  const s = PARTY.twq;
  if (!s || s.phase !== 'play') return;
  s.asked++;
  if (s.asked >= TWQ_MAX) s.phase = 'done';
  twqPaint();
});
on('twq-reveal', () => { if (PARTY.twq && PARTY.twq.phase === 'play') { PARTY.twq.phase = 'done'; twqPaint(); } });

/* ---------- ALIBI WAS HERE, AND IS DELETED ON REQUEST -------------------------------------------
   ASKED FOR IN THE SAME LIST AS THE OTHER FOUR, and then: "delete alibi game." A case card, two
   suspects interviewed on two clocks, the same six questions to each and a verdict — the one game
   on this engine that was an interview rather than a word, which is why it had kept a card of its
   own when the other four moved into Word games.

   DELETED RATHER THAN SWITCHED OFF, for `c4Reply_`'s reason: a dormant game behind a flag is a
   second mode nothing presses. The four decks went with it — 121 crimes, 24 times, 46 places and
   122 questions — because a deck nothing deals is weight on every phone for nobody. `an alibi` is
   still an Articulate card, and should be: that one is a word to describe, not this game. */

/* WHAT EACH GAME DOES WHEN ITS CLOCK RUNS OUT, and how it draws. Read by the tick, `partyStart_` and
   `partyStop_`, so a fifth timed game is a row here. */
const PARTY_GAMES = {
  jam: { paint: jamPaint, end: s => { s.phase = 'done'; } },
  tab: { paint: tabPaint, end: s => { s.phase = 'done'; } },
  hot: { paint: hotPaint, end: s => { s.phase = 'done'; } },
  twq: { paint: twqPaint, end: () => {} },
};

/* ==================================================================================================
   SCRABBLE — two, three or four people, one phone.

   ASKED FOR AS "add scrable to games tool. 2/3/4 player". The board game: 15x15, a hundred tiles,
   seven on a rack, words crossing words, and the premium squares underneath them.

   THERE IS NO DICTIONARY AND THAT IS A DECISION RATHER THAN A GAP. A usable English word list is
   about 280,000 entries and two and a half megabytes — the size of the whole question library, for
   one game widget, on a site this repository has already spent two rounds making open faster on a
   phone. And it is not what the game needs: in real Scrabble a word STANDS unless somebody
   challenges it, and with two to four people looking at one phone the challenge is the person
   opposite saying "that is not a word". That is the same argument Herd Mentality already makes
   about scoring — the part that is people arguing is the part an app should leave to them.

   WHAT IS CHECKED IS THE GEOMETRY, WHICH IS THE PART PEOPLE ACTUALLY GET WRONG: the first word
   through the centre, everything in one line, no gaps, and after the first move at least one new
   tile touching what is already there. None of that is a matter of opinion and all of it is easy to
   do by accident, so the app refuses it and says which rule was broken.

   THE RACK IS SECRET, SO THE PHONE IS HANDED OVER RATHER THAN PASSED. Between turns the board stays
   up and the rack is replaced by "hand the phone to <name>" and one tap. Without it the next player
   reads the previous one's tiles on the way past, which is not a thing that can happen with a real
   rack and is the one part of this game a single screen genuinely changes.

   AND IT IS NOT REBUILT ON EVERY PAINT, WHICH IS THE OPPOSITE OF THE MAZE. `initMaze` starts a new
   maze each time the widget opens, and its note says why: a half-walked maze is a game you have
   forgotten starting. A Scrabble game is forty minutes and four people, and `repaint` runs whenever
   a payload lands or anything saves — so this keeps whatever is in progress and redraws it. `New
   game` is the way to start another, which is the only way it should ever be lost.
================================================================================================== */
const SCR_N = 15;

/* THE STANDARD ENGLISH SET — 100 tiles, and the two blanks are the empty string. Written as
   letter/count/value triples rather than a hundred entries, because a list of a hundred is a list
   nobody proof-reads. Asserted below: it comes to 100 and it comes to 187 points. */
const SCR_SET = [
  ['A', 9, 1], ['B', 2, 3], ['C', 2, 3], ['D', 4, 2], ['E', 12, 1], ['F', 2, 4], ['G', 3, 2],
  ['H', 2, 4], ['I', 9, 1], ['J', 1, 8], ['K', 1, 5], ['L', 4, 1], ['M', 2, 3], ['N', 6, 1],
  ['O', 8, 1], ['P', 2, 3], ['Q', 1, 10], ['R', 6, 1], ['S', 4, 1], ['T', 6, 1], ['U', 4, 1],
  ['V', 2, 4], ['W', 2, 4], ['X', 1, 8], ['Y', 2, 4], ['Z', 1, 10], ['', 2, 0],
];
const SCR_VALUE = {};
SCR_SET.forEach(t => { SCR_VALUE[t[0]] = t[2]; });

/* ---------- THE PREMIUM SQUARES, BUILT FROM ONE QUADRANT --------------------------------------
   THE BOARD IS SYMMETRIC ABOUT BOTH MIDDLES, so eight rows of eight describe all 225 and a typo in
   a 225-character string cannot hide in them. `T`/`D` are word premiums, `t`/`d` letter premiums,
   and the centre — bottom right of the quadrant — is the star, which scores as a double word on the
   first move exactly as the printed board does. */
const SCR_QUAD = [
  'T..d...T',
  '.D...t..',
  '..D...d.',
  'd..D...d',
  '....D...',
  '.t...t..',
  '..d...d.',
  'T..d...D',
];
function scrPrem_(i) {
  const r = (i / SCR_N) | 0, c = i % SCR_N;
  return SCR_QUAD[Math.min(r, SCR_N - 1 - r)][Math.min(c, SCR_N - 1 - c)];
}
const SCR_MID = ((SCR_N * SCR_N) - 1) / 2;

let scrabble = null;

/* Fisher-Yates, for the reason `herdShuffle_` gives: `sort(() => Math.random() - .5)` is the famous
   wrong one and deals the same few orders far too often. */
function scrShuffle_(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function scrBag_() {
  const bag = [];
  SCR_SET.forEach(t => { for (let i = 0; i < t[1]; i++) bag.push(t[0]); });
  return scrShuffle_(bag);
}

function scrDraw_(g, rack) {
  while (rack.length < 7 && g.bag.length) rack.push(g.bag.pop());
}

function scrNew_(n) {
  const g = { bag: scrBag_(), players: [], turn: 0, board: new Array(SCR_N * SCR_N).fill(null),
              placed: [], sel: null, swap: null, blank: null, first: true,
              handover: false, passes: 0, over: false, said: '' };
  for (let i = 0; i < n; i++) {
    const rack = [];
    scrDraw_(g, rack);
    g.players.push({ name: 'Player ' + (i + 1), rack, score: 0 });
  }
  return g;
}

/* ---------- WHERE THE TILES ARE, ASKED OF THE BOARD RATHER THAN REMEMBERED --------------------
   A SQUARE HOLDS EITHER A COMMITTED TILE OR ONE OF THIS TURN'S, and the two have to be told apart
   for scoring — a premium counts only under a tile placed this turn. Keeping a second list of
   "which squares are new" is the second reader this repository keeps paying for, so the tile itself
   carries `fresh` and committing a turn clears it. */
function scrAt_(g, i) { return g.board[i]; }

function scrPlace_(g, i, rackIndex) {
  const p = g.players[g.turn];
  const letter = p.rack[rackIndex];
  g.board[i] = { letter: letter || '?', blank: letter === '', fresh: true, from: rackIndex };
  g.placed.push(i);
}

function scrRecall_(g) {
  g.placed.forEach(i => { g.board[i] = null; });
  g.placed = [];
  g.sel = null;
  g.blank = null;
}

/* ---------- THE RULES THAT ARE NOT A MATTER OF OPINION ----------------------------------------
   Each returns the sentence it refuses with, so the card can say WHICH rule was broken rather than
   "not a valid move" — a refusal that does not say why is one you learn nothing from, which is the
   argument this repository already makes about a toast saying "Sent" for a message that was not. */
function scrIllegal_(g) {
  if (!g.placed.length) return 'Put some tiles down first.';
  const rows = {}, cols = {};
  g.placed.forEach(i => { rows[(i / SCR_N) | 0] = 1; cols[i % SCR_N] = 1; });
  const oneRow = Object.keys(rows).length === 1, oneCol = Object.keys(cols).length === 1;
  if (!oneRow && !oneCol) return 'All your tiles have to be in one row or one column.';

  /* NO GAPS, counting the tiles that were already there — a word may bridge a letter somebody else
     played, and that is not a gap. */
  const step = oneRow ? 1 : SCR_N;
  const sorted = g.placed.slice().sort((a, b) => a - b);
  for (let i = sorted[0]; i <= sorted[sorted.length - 1]; i += step) {
    if (!g.board[i]) return 'There is a gap in your word.';
  }

  if (g.first) {
    if (g.placed.indexOf(SCR_MID) < 0) return 'The first word has to cover the middle square.';
    if (g.placed.length < 2) return 'The first word needs at least two letters.';
    return '';
  }
  /* AND IT HAS TO TOUCH SOMETHING. After the first move a word floating on its own is the one
     mistake that looks perfectly reasonable on screen. */
  const touches = g.placed.some(i => {
    const r = (i / SCR_N) | 0, c = i % SCR_N;
    return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([rr, cc]) => {
      if (rr < 0 || cc < 0 || rr >= SCR_N || cc >= SCR_N) return false;
      const t = g.board[rr * SCR_N + cc];
      return !!t && !t.fresh;
    });
  });
  return touches ? '' : 'Your word has to touch a tile that is already down.';
}

/* ---------- WHAT IT SCORES ---------------------------------------------------------------------
   THE MAIN WORD AND EVERY CROSS WORD A NEW TILE MAKES, which is the half of Scrabble scoring people
   forget: a single tile laid beside an existing word scores that word again as well as its own.
   A premium counts only under a tile placed THIS turn, which is what `fresh` is for; word premiums
   multiply after every letter premium in the same word has been applied. */
function scrWordAt_(g, i, step) {
  let start = i;
  while (start - step >= 0 && scrSameLine_(start, start - step, step) && g.board[start - step]) {
    start -= step;
  }
  const out = [];
  for (let j = start; j < SCR_N * SCR_N && g.board[j]; j += step) {
    out.push(j);
    if (!scrSameLine_(j, j + step, step)) break;
  }
  return out;
}

/* A STEP OF 1 MAY NOT CROSS A ROW END, which an index alone cannot say — 14 and 15 are adjacent
   numbers and opposite ends of the board. */
function scrSameLine_(a, b, step) {
  if (b < 0 || b >= SCR_N * SCR_N) return false;
  return step === SCR_N || ((a / SCR_N) | 0) === ((b / SCR_N) | 0);
}

function scrScoreWord_(g, idx) {
  let sum = 0, mult = 1;
  idx.forEach(i => {
    const t = g.board[i];
    let v = t.blank ? 0 : (SCR_VALUE[t.letter] || 0);
    if (t.fresh) {
      const p = scrPrem_(i);
      if (p === 'd') v *= 2;
      else if (p === 't') v *= 3;
      else if (p === 'D') mult *= 2;
      else if (p === 'T') mult *= 3;
    }
    sum += v;
  });
  return sum * mult;
}

function scrScore_(g) {
  const rows = {}, cols = {};
  g.placed.forEach(i => { rows[(i / SCR_N) | 0] = 1; cols[i % SCR_N] = 1; });
  const acrossMain = Object.keys(rows).length === 1 && g.placed.length > 1;
  const main = acrossMain ? scrWordAt_(g, g.placed[0], 1) : scrWordAt_(g, g.placed[0], SCR_N);
  const words = [];
  if (main.length > 1) words.push(main);
  /* A one-tile move belongs to both directions and neither is "the main word", so both are gathered
     the same way as a cross word and the pair is scored once each. */
  g.placed.forEach(i => {
    const cross = acrossMain || g.placed.length === 1 ? scrWordAt_(g, i, SCR_N) : scrWordAt_(g, i, 1);
    if (cross.length > 1 && !words.some(w => w[0] === cross[0] && w.length === cross.length)) {
      words.push(cross);
    }
    if (g.placed.length === 1) {
      const other = scrWordAt_(g, i, 1);
      if (other.length > 1 && !words.some(w => w[0] === other[0] && w.length === other.length)) {
        words.push(other);
      }
    }
  });
  let total = words.reduce((n, w) => n + scrScoreWord_(g, w), 0);
  /* SEVEN TILES IS FIFTY, which is the game's own number and the thing everybody plays for. */
  if (g.placed.length === 7) total += 50;
  return { total, words: words.length };
}

function scrPlay_(g) {
  const why = scrIllegal_(g);
  if (why) { g.said = why; return; }
  const { total } = scrScore_(g);
  const p = g.players[g.turn];
  p.score += total;
  /* THE RACK LOSES THE TILES THAT WENT DOWN, by index, highest first — splicing low-to-high moves
     every index after the one removed and takes the wrong tile off next. */
  g.placed.map(i => g.board[i].from).sort((a, b) => b - a).forEach(n => { p.rack.splice(n, 1); });
  g.placed.forEach(i => { g.board[i].fresh = false; delete g.board[i].from; });
  const bingo = g.placed.length === 7;
  g.placed = [];
  g.sel = null;
  g.first = false;
  g.passes = 0;
  scrDraw_(g, p.rack);
  g.said = p.name + ' scored ' + total + (bingo ? ' — all seven, fifty on top.' : '.');
  /* THE GAME ENDS WHEN SOMEBODY GOES OUT AND THERE IS NOTHING LEFT TO DRAW. Everybody else's rack
     comes off their score and goes on to the finisher's, which is what the printed rules say and is
     also the reason anybody ever plays a short word to get rid of a Q. */
  if (!p.rack.length && !g.bag.length) { scrFinish_(g, p); return; }
  scrNext_(g);
}

function scrFinish_(g, out) {
  let picked = 0;
  g.players.forEach(q => {
    if (q === out) return;
    const left = q.rack.reduce((n, l) => n + (SCR_VALUE[l] || 0), 0);
    q.score -= left;
    picked += left;
  });
  if (out) out.score += picked;
  g.over = true;
  g.handover = false;
  const best = g.players.slice().sort((a, b) => b.score - a.score);
  g.said = best[0].score === best[1].score
    ? 'A draw on ' + best[0].score + '.'
    : best[0].name + ' wins on ' + best[0].score + '.';
}

function scrNext_(g) {
  g.turn = (g.turn + 1) % g.players.length;
  g.sel = null;
  g.blank = null;
  g.swap = null;
  /* THE HAND-OVER IS THE STATE, not a message. Until the next player taps, the rack is not drawn at
     all — a rack you can read on the way past is a rack that is not secret. */
  g.handover = true;
}

function scrPass_(g) {
  scrRecall_(g);
  g.passes++;
  g.said = g.players[g.turn].name + ' passed.';
  /* TWICE ROUND AND NOBODY CAN MOVE. The printed rules end it after six scoreless turns; two
     passes each is the same idea at any number of players and needs no second counter. */
  if (g.passes >= g.players.length * 2) { scrFinish_(g, null); return; }
  scrNext_(g);
}

function scrSwapDo_(g) {
  const p = g.players[g.turn];
  const marked = (g.swap || []).slice().sort((a, b) => b - a);
  if (!marked.length) { g.swap = null; g.said = ''; return; }
  if (marked.length > g.bag.length) {
    g.said = 'Only ' + g.bag.length + ' left in the bag — you can swap that many.';
    return;
  }
  const back = marked.map(n => p.rack[n]);
  marked.forEach(n => { p.rack.splice(n, 1); });
  scrDraw_(g, p.rack);
  back.forEach(l => g.bag.push(l));
  scrShuffle_(g.bag);
  g.passes++;
  g.said = p.name + ' swapped ' + back.length + '.';
  if (g.passes >= g.players.length * 2) { scrFinish_(g, null); return; }
  scrNext_(g);
}

function initScrabble() {
  if (!$('scr-board')) return;
  scrabblePaint();
}

function scrCellsHtml_(g) {
  let html = '';
  for (let i = 0; i < SCR_N * SCR_N; i++) {
    const t = g ? g.board[i] : null;
    const p = scrPrem_(i);
    const cls = ['scr-sq'];
    if (p === 'T') cls.push('tw'); else if (p === 'D') cls.push('dw');
    else if (p === 't') cls.push('tl'); else if (p === 'd') cls.push('dl');
    if (i === SCR_MID) cls.push('mid');
    if (t) cls.push('has');
    if (t && t.fresh) cls.push('new');
    const v = t && !t.blank ? (SCR_VALUE[t.letter] || 0) : 0;
    /* ---------- A SQUARE IS ONLY A CONTROL WHILE THERE IS A GAME ------------------------------
       THE BOARD IS DRAWN EITHER WAY, because an empty board under the 2/3/4 buttons says what you
       are about to play on. What it is NOT, before anybody has started, is 225 buttons that do
       nothing — which is what `check/press.js` found and named. An `<i>` is what the maze's cells
       already are, for the same reason: it is a picture until it is a control. */
    if (!g) { html += '<i class="' + cls.join(' ') + '"></i>'; continue; }
    html += '<button class="' + cls.join(' ') + '" data-do="scr-cell" data-i="' + i + '"'
      + ' aria-label="Row ' + (((i / SCR_N) | 0) + 1) + ' column ' + ((i % SCR_N) + 1)
      + (t ? ', ' + (t.blank ? 'blank as ' : '') + t.letter : '') + '">'
      + (t ? esc(t.letter) + (v ? '<i>' + v + '</i>' : '') : '') + '</button>';
  }
  return html;
}

function scrRackHtml_(g) {
  const p = g.players[g.turn];
  if (g.handover) {
    return '<p class="scr-hand">Hand the phone to <b>' + esc(p.name) + '</b>.</p>'
      + '<button class="btn" data-do="scr-hand">I have it</button>';
  }
  /* ---------- TWENTY-SIX LETTERS, AND NOT AS TWENTY-SIX BUTTONS ------------------------------
     THE FIRST VERSION WAS AN ALPHABET OF 44px KEYS and it was the right shape and the wrong size:
     six to a row at 320px is five rows, 220px, which takes the rack and all four actions past the
     pane's own fold — the fault `check/cards.js` and `check/ui.js` both exist to catch, on a card
     that was already 22px inside it. A select is one control, opens the phone's own picker, and is
     the shape this app already uses everywhere somebody chooses from a closed list. */
  if (g.blank !== null) {
    let opts = '<option value="">The blank is…</option>';
    for (let n = 0; n < 26; n++) {
      const l = String.fromCharCode(65 + n);
      opts += '<option value="' + l + '">' + l + '</option>';
    }
    return '<p class="scr-say">What is the blank?</p>'
      + '<select class="scr-sel" data-do="scr-blank" aria-label="What the blank stands for">'
      + opts + '</select>';
  }
  /* ---------- A TILE THAT IS ON THE BOARD IS NOT ON THE RACK ---------------------------------
     WITHOUT THIS YOU COULD PLAY ONE TILE TWICE. Placing a tile leaves it on the rack until the turn
     is committed — deliberately, because taking a tile back has to put it somewhere — so selecting
     the same rack slot again put a second copy of the same letter on the board, and the commit then
     spliced one index for two squares. Asked of the BOARD rather than kept as a second list: every
     placed square already carries the rack index it came from, and a list beside it is one more
     thing to get back in step when a tile is picked up again. */
  const used = {};
  g.placed.forEach(i => { used[g.board[i].from] = 1; });

  let html = '<div class="scr-rack">';
  p.rack.forEach((l, n) => {
    const marked = g.swap && g.swap.indexOf(n) >= 0;
    const gone = !!used[n];
    html += '<button class="scr-tile' + (g.sel === n ? ' on' : '') + (marked ? ' mark' : '')
      + (gone ? ' used' : '') + '" data-do="scr-rack" data-i="' + n + '" aria-label="'
      + (gone ? 'That tile is on the board' : l ? 'Tile ' + l : 'Blank tile') + '">'
      + (gone || !l ? '' : esc(l) + '<i>' + (SCR_VALUE[l] || 0) + '</i>') + '</button>';
  });
  html += '</div>';
  return html;
}

function scrabblePaint() {
  const host = $('scr-board');
  if (!host) return;
  const g = scrabble;
  host.innerHTML = scrCellsHtml_(g);

  const who = $('scr-who');
  const rack = $('scr-rack-box');
  const acts = $('scr-acts');
  const said = $('scr-said');
  const start = $('scr-start');

  if (!g) {
    if (start) start.hidden = false;
    if (who) who.textContent = '';
    if (rack) rack.innerHTML = '';
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  /* THE PLAYER-COUNT ROW COMES BACK WHEN THE GAME IS OVER, because at that point "2, 3 or 4
     players" IS "new game" and a second control saying so is a second thing to press. While a game
     is running it is hidden and `New game` sits in the action row, where it means abandon this one. */
  if (start) start.hidden = !g.over;

  if (who) {
    who.innerHTML = g.players.map((p, n) =>
      '<span class="scr-p' + (n === g.turn && !g.over ? ' on' : '') + '">'
      + esc(p.name) + ' <b>' + p.score + '</b></span>').join('');
  }
  if (rack) rack.innerHTML = g.over ? '' : scrRackHtml_(g);
  if (acts) {
    /* BUILT, NOT HIDDEN. See the note beside the empty div in map.js: a hidden control is still a
       control to anything that presses the page, and four of these do nothing between turns. */
    /* EVERY ACTION WRITTEN OUT AS A LITERAL, not built from a list. `check-doors.js` follows
       `data-do="x"` with a string in it and cannot follow a variable — the first version mapped an
       array and took the doors from 137 to 132, reporting all five handlers as unreachable. A red
       with nothing behind it is the one thing every list in this project exists to prevent, and
       CLAUDE.md already records the same correction on `banner()`. */
    const playLabel = g.swap
      ? (g.swap.length ? 'Swap ' + g.swap.length : 'Cancel swap')
      : 'Play';
    acts.innerHTML = (g.over || g.handover || g.blank !== null) ? ''
      : '<button class="scr-act" data-do="scr-play">' + esc(playLabel) + '</button>'
      + '<button class="scr-act" data-do="scr-recall">Take back</button>'
      + '<button class="scr-act" data-do="scr-swap">Swap</button>'
      + '<button class="scr-act" data-do="scr-pass">Pass</button>'
      + '<button class="scr-act" data-do="scr-again">New game</button>';
  }
  if (said) {
    said.textContent = g.said
      || (g.over ? '' : (g.bag.length + ' left in the bag.'));
  }
}

on('scr-new', el => {
  const n = Math.max(2, Math.min(4, Number(el.getAttribute('data-n')) || 2));
  scrabble = scrNew_(n);
  scrabblePaint();
});

on('scr-again', () => { scrabble = null; scrabblePaint(); });

on('scr-hand', () => {
  if (!scrabble) return;
  scrabble.handover = false;
  scrabble.said = '';
  scrabblePaint();
});

on('scr-rack', el => {
  const g = scrabble;
  if (!g || g.over || g.handover || g.blank !== null) return;
  const n = Number(el.getAttribute('data-i'));
  /* A TILE ALREADY ON THE BOARD CANNOT BE PICKED UP TWICE — take it off the square to get it back,
     which is the same gesture as on the table. */
  if (g.placed.some(i => g.board[i].from === n)) return;
  if (g.swap) {
    const at = g.swap.indexOf(n);
    if (at >= 0) g.swap.splice(at, 1); else g.swap.push(n);
  } else {
    g.sel = g.sel === n ? null : n;
  }
  scrabblePaint();
});

on('scr-cell', el => {
  const g = scrabble;
  if (!g || g.over || g.handover || g.blank !== null || g.swap) return;
  const i = Number(el.getAttribute('data-i'));
  const t = g.board[i];
  /* TAP A TILE YOU JUST PUT DOWN AND IT COMES BACK. A committed one does not, which is what `fresh`
     already says — so there is no separate list of what may be picked up. */
  if (t) {
    if (!t.fresh) return;
    g.board[i] = null;
    g.placed = g.placed.filter(x => x !== i);
    g.said = '';
    scrabblePaint();
    return;
  }
  if (g.sel === null) { g.said = 'Pick a tile first.'; scrabblePaint(); return; }
  const letter = g.players[g.turn].rack[g.sel];
  scrPlace_(g, i, g.sel);
  g.said = '';
  /* A BLANK IS NOT A LETTER UNTIL SOMEBODY SAYS SO, and it is worth nought whatever they say. The
     square is taken now and the letter arrives a tap later, so the picker cannot be answered about
     a square that is no longer the one you tapped. */
  if (letter === '') g.blank = i; else g.sel = null;
  scrabblePaint();
});

/* A CHANGE RATHER THAN A PRESS, because the control is a select — the same shape `book-note` and
   `book-emails` already use, and for the same reason: a select answers on change and never on
   click. */
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="scr-blank"]');
  if (!el) return;
  const g = scrabble;
  if (!g || g.blank === null) return;
  const l = String(el.value || '').toUpperCase();
  if (!/^[A-Z]$/.test(l)) return;
  const t = g.board[g.blank];
  if (t) t.letter = l;
  g.blank = null;
  g.sel = null;
  scrabblePaint();
});

on('scr-play', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  if (g.swap) { scrSwapDo_(g); scrabblePaint(); return; }
  scrPlay_(g);
  scrabblePaint();
});

on('scr-recall', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrRecall_(g);
  g.said = '';
  scrabblePaint();
});

on('scr-swap', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrRecall_(g);
  g.swap = g.swap ? null : [];
  g.said = g.swap ? 'Tap the tiles to put back, then Swap.' : '';
  scrabblePaint();
});

on('scr-pass', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrPass_(g);
  scrabblePaint();
});

/* ---------- THE TIMETABLE ---------------------------------------------------------------------------
   ASKED FOR AS *"timetable widget ... like weekly timetable"*. A student's school week, or a tutor's
   standing sessions: a day, a time, a subject, a line of note.

   ON THE ACCOUNT WHEN SIGNED IN, ON THE DEVICE WHEN NOT. It began on the device only, under `whoIs_`,
   and that made it the one week in the app that disagreed with itself across phones: a tutor's week
   written on a laptop was not on their phone. It is saved to the `timetable` cell on your own row now
   (`saveTimetable`, the docket's pattern — see `tmtSave_`) and comes back with the sign-in reply.
   Signed out it still works under the bare key, because a timetable is not a thing anybody should
   need an account to write down; and the FIRST time somebody signed in opens it with nothing on the
   account, whatever this phone already held under their key is carried up rather than lost.

   AND YOUR BOOKED SESSIONS ARE IN IT, LOCKED. Asked as part of *"calander and time table and
   availability ... it seems they clash"*: `Your week` drew the sessions booked here and this drew what
   somebody wrote, two weeks of one person side by side. The booked ones are read from `jobs` through
   `weekSessions_` (book.js) every time it is drawn — this week's dates, so a half term or a bank
   holiday is simply a day without the session — and are never stored here, because a copy of a
   booking is a copy that goes stale. Tapping one opens the session, as `Your week` did; you write
   your own lessons around them. `Your week` is gone; this is the one week view.

   ONE DAY AT A TIME, AND THAT IS A MEASUREMENT. A seven-column grid of lessons is 35px a column on a
   320px phone, which holds "Ma" of Maths and no time at all. A day is a list, and a week is the chips
   over it — Monday to Friday unless the weekend is asked for, because five 44px chips is the most
   that fit one row of a 320px card and a school week is five days.

   A LESSON IS ITS SUMMARY LINE UNTIL IT IS TAPPED, the qualification shelf's shape: six lessons as
   six 44px lines fit the pane, where six lessons as three open boxes each are three screens of
   scrolling. One open at a time, in place — no sheet, no pop-up. */
const TMT_DAY_NAMES = SLOT_DAYS.map(d => d[1]);   // Monday … Sunday, the list book.js already holds
let TMT_DAY = -1;      // which day is on screen; -1 until the first draw picks today
let TMT_OPEN = '';     // the id of the lesson whose boxes are showing

const tmtKey_ = () => 'tmt' + (whoIs_() ? ':' + whoIs_() : '');
let TMT_TIMER = null;

/* A timetable, or null — from the cell's text, the device's text, or anything else. The shape is
   checked rather than trusted, because a cell somebody typed into would otherwise be drawn as a week
   and then saved back over. */
function tmtParse_(raw) {
  try {
    const t = typeof raw === 'string' ? JSON.parse(raw || 'null') : raw;
    if (t && Array.isArray(t.days) && t.days.length === 7 && t.days.every(Array.isArray)) return t;
  } catch (e) {}
  return null;
}
const tmtEmpty_ = () => ({ weekend: false, days: [[], [], [], [], [], [], []] });
function tmtLocal_() {
  try { return tmtParse_(localStorage.getItem(tmtKey_())); } catch (e) { return null; }
}

function tmtRead_() {
  if (typeof USER !== 'undefined' && USER) {
    const mine = tmtParse_(USER.timetable);
    if (mine) return mine;
    /* ---------- THE FIRST TIME ON THE ACCOUNT, WHAT THIS PHONE HELD COMES WITH YOU ----------------
       Nothing on the account yet, and a week on this phone under your own key — the only place it
       could have been before today. Carried up once: saving it fills `USER.timetable`, so the next
       read takes the account's copy and this branch is never reached again. An empty week on the
       account (everything removed on purpose) is still a week, so it is not re-filled from here. */
    const here = tmtLocal_();
    if (here && here.days.some(d => d.length)) { tmtSave_(here); return here; }
    return tmtEmpty_();
  }
  return tmtLocal_() || tmtEmpty_();
}
/* ---------- KEPT ON THE PHONE FIRST, THEN SENT ---------------------------------------------------
   `docketSave`'s order and for its reason: a lesson that waits for a round trip before it is on the
   list feels broken on a train. Debounced, because a subject typed letter by letter is one intention
   and not nine writes to a spreadsheet cell. A failure is SAID — a week that looks saved and is not
   is found out on the other phone, which is the whole reason this is on the account. */
function tmtSave_(t) {
  if (typeof USER !== 'undefined' && USER) {
    USER.timetable = JSON.stringify(t);
    try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
    clearTimeout(TMT_TIMER);
    TMT_TIMER = setTimeout(() => {
      if (!USER) return;
      api({ action: 'saveTimetable', name: USER.name, personId: USER.personId || '',
            timetable: USER.timetable })
        .then(d => { if (d && d.error) throw new Error(d.error); })
        .catch(err => toast('Timetable not saved — ' + String((err && err.message) || 'no connection.')));
    }, 900);
    return;
  }
  try { localStorage.setItem(tmtKey_(), JSON.stringify(t)); }
  catch (e) { toast('Not saved — this browser is not keeping anything.'); }
}

/* ---------- THE COLOUR IS THE SUBJECT'S, NOT THE LESSON'S ------------------------------------------
   Maths is one colour on Monday and on Thursday with nothing to choose — a colour picker per lesson
   would be seven places to make Maths blue. Ten hues declared on `.tmt`, the chess board's rule: they
   are this widget's convention and nothing else in the app wants them.

   HANDED OUT AND REMEMBERED, NOT HASHED. The first version hashed the subject's letters into eight
   hues, and a screenshot of an ordinary Monday showed Chemistry and History in the same red: five
   subjects in eight colours collide four times in five (8·7·6·5·4 / 8⁵ is 0.21). So each subject gets
   the first colour no other subject is wearing, kept in `colours` so it does not move when a subject is
   added earlier in the week, and given back when the last lesson in that subject goes. Up to ten
   subjects never share; past ten it is the least-worn hue, which is the best ten colours can do. */
const TMT_HUES = 10;
/* LETTERS IN ANY ALPHABET, NOT a-z. The first version kept `[a-z0-9]` — `spellKey_`'s reduction —
   and that reduces `Ελληνικά` to nothing, so a Greek lesson, in an app whose library carries Greek
   papers, drew with no colour at all; `Français` and `Español` lost a letter each. A key only has to
   tell two subjects apart and fold `Maths` onto `maths`, which is what lower-casing and dropping the
   spaces and punctuation does in every script. */
const tmtSubKey_ = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/* Brings `t.colours` in line with the subjects actually in the week. Answers whether it changed. */
function tmtColours_(t) {
  const was = JSON.stringify(t.colours || {});
  const have = {};
  t.days.forEach(d => (d || []).forEach(l => { const k = tmtSubKey_(l.subject); if (k) have[k] = 1; }));
  const c = {};
  Object.keys(t.colours || {}).forEach(k => { if (have[k]) c[k] = t.colours[k]; });
  Object.keys(have).forEach(k => { if (!(k in c)) c[k] = tmtFreeHue_(c); });
  t.colours = c;
  return JSON.stringify(c) !== was;
}
function tmtFreeHue_(c) {
  const worn = new Array(TMT_HUES).fill(0);
  Object.values(c).forEach(i => { if (worn[i] !== undefined) worn[i]++; });
  return worn.indexOf(Math.min(...worn));
}
/* What a subject is wearing — or, while it is still being typed, what it WOULD wear. */
function tmtColour_(t, subject) {
  const k = tmtSubKey_(subject);
  if (!k) return '';
  const c = t.colours || {};
  return 'var(--tmt-' + (k in c ? c[k] : tmtFreeHue_(c)) + ')';
}

/* "09:00" sorts as text, and a lesson with no time yet goes last rather than first. */
const tmtOrder_ = (a, b) => {
  const x = a.at || '99', y = b.at || '99';
  return x < y ? -1 : x > y ? 1 : 0;
};

function tmtRow_(l, t) {
  const c = tmtColour_(t, l.subject);
  const style = c ? ` style="--tmt-c:${c}"` : '';
  const id = esc(l.id);
  if (l.id !== TMT_OPEN) {
    return `<button type="button" class="tmt-row" data-do="tmt-open" data-id="${id}"${style}>
      <span class="tmt-at">${esc(l.at || '--:--')}</span>
      <span class="tmt-what"><span class="tmt-sub">${esc(l.subject || 'Untitled')}</span>${
        l.note ? `<span class="tmt-note">${esc(l.note)}</span>` : ''}</span></button>`;
  }
  /* A FORM, SO BUTTONS. `Done` shuts it and puts it in time order; `Remove` takes it off. Everything
     typed is kept on every keystroke — see the `input` listener — so Done is not a Save and nothing is
     lost by swiping away without pressing it. */
  return `<div class="tmt-ed"${style}>
      <div class="tmt-ed-top">
        <input class="tmt-in tmt-time" type="time" data-id="${id}" data-f="at"
               value="${esc(l.at || '')}" aria-label="Starts at">
        <input class="tmt-in" data-id="${id}" data-f="subject" value="${esc(l.subject || '')}"
               placeholder="Subject" autocomplete="off">
      </div>
      <input class="tmt-in" data-id="${id}" data-f="note" value="${esc(l.note || '')}"
             placeholder="Note — room, teacher, homework" autocomplete="off">
      <div class="btn-row">
        <button type="button" class="btn quiet" data-do="tmt-open" data-id="${id}">Done</button>
        <button type="button" class="btn danger" data-do="tmt-drop" data-id="${id}">Remove</button>
      </div>
    </div>`;
}

/* ---------- A BOOKED SESSION, LOCKED ----------------------------------------------------------------
   Its own row and not a lesson: no boxes, no Remove, because it is not this widget's to change — it
   is a booking, and it is changed where bookings are. Tapping it opens the session (`job`, the
   handler `Your week`'s blocks used), so the one week view still leads to the receipt. Green on its
   edge, the colour a session has always been here; the hours and the place on its second line. */
function tmtBooked_(s) {
  const hh = h => String(h).padStart(2, '0') + ':00';
  const id = esc(String(s.j.id || s.j.jobId || ''));
  return `<button type="button" class="tmt-row is-booked" data-do="job" data-id="${id}">
      <span class="tmt-at">${hh(s.from)}</span>
      <span class="tmt-what"><span class="tmt-sub">${esc(s.j.subject || 'Session')}</span><span
        class="tmt-note">Booked · ${hh(s.from)}\u2013${hh(s.to)}${
        s.j.location ? ' · ' + esc(s.j.location) : ''}</span></span></button>`;
}

function tmtHtml_() {
  const t = tmtRead_();
  if (tmtColours_(t)) tmtSave_(t);
  /* THIS WEEK'S BOOKED SESSIONS, one entry per day each runs — see `weekSessions_`. Signed out there
     are none, and nothing about the written week depends on them. */
  const booked = (typeof USER !== 'undefined' && USER && typeof weekSessions_ === 'function')
    ? weekSessions_() : [];
  /* A SESSION AT THE WEEKEND SHOWS THE WEEKEND, whether or not the box is ticked — a booking on a
     Saturday hidden behind a tickbox is the clash this was asked to remove. */
  const shown = (t.weekend || booked.some(s => s.day > 4)) ? 7 : 5;
  if (TMT_DAY < 0) TMT_DAY = (new Date().getDay() + 6) % 7;      // Monday-first, as SLOT_DAYS is
  if (TMT_DAY >= shown) TMT_DAY = 0;
  const hh = h => String(h).padStart(2, '0') + ':00';
  const rows = (t.days[TMT_DAY] || []).map(l => ({ at: l.at || '99', html: () => tmtRow_(l, t) }))
    .concat(booked.filter(s => s.day === TMT_DAY).map(s => ({ at: hh(s.from), html: () => tmtBooked_(s) })))
    .sort(tmtOrder_);
  const chips = TMT_DAY_NAMES.slice(0, shown).map((n, i) =>
    `<button type="button" class="tmt-day${i === TMT_DAY ? ' on' : ''}${
      (t.days[i] || []).length || booked.some(s => s.day === i) ? ' has' : ''}"
             data-do="tmt-day" data-day="${i}" aria-pressed="${i === TMT_DAY}"
             aria-label="${n}">${n.slice(0, 3)}</button>`).join('');
  return `<div class="tmt">
    <div class="tmt-days n${shown}">${chips}</div>
    <div class="tmt-list">${rows.length ? rows.map(r => r.html()).join('')
      : `<p class="faint tmt-none">Nothing on ${TMT_DAY_NAMES[TMT_DAY]}.</p>`}</div>
    ${/* ONE ROW FOR BOTH, because a full Monday at 320 is the card that runs out of height first and
          a line of its own for a tickbox is 44px of it. */''}
    <div class="tmt-foot"><button type="button" class="btn quiet" data-do="tmt-add">Add a lesson</button>
      <label class="check tmt-wkend"><input type="checkbox" data-do="tmt-weekend"${t.weekend ? ' checked' : ''}>
        <span class="box"></span><span>Weekend</span></label></div>
  </div>`;
}

/* EVERY COPY, BY CLASS. The Saved column draws this same markup, so `$()` would hand the second copy
   the first one's box — the `$('msg-text')` fault `cartPaint_` is written against one file along. */
function tmtPaint_() {
  const html = tmtHtml_();
  document.querySelectorAll('.tmt-box').forEach(el => { el.innerHTML = html; });
}
function initTimetable() { tmtPaint_(); }

/* ---------- A LESSON SHUT WITH NOTHING IN IT IS NOT A LESSON ------------------------------------
   `Add a lesson` writes a row before anything is typed — it has to, or the boxes would have nowhere
   to keep a keystroke — so pressing it by mistake and then Done, or another day, or another lesson,
   left an `Untitled` line for ever, and the only way off it was Remove. Shutting a lesson with no
   subject and no note takes it away instead: an empty line is not something anybody wrote down.
   The TIME does not count, because Add filled that in, not the person. */
function tmtShut_() {
  if (!TMT_OPEN) return;
  const t = tmtRead_();
  let gone = false;
  t.days = t.days.map(d => (d || []).filter(l => {
    const blank = l.id === TMT_OPEN && !String(l.subject || '').trim() && !String(l.note || '').trim();
    if (blank) gone = true;
    return !blank;
  }));
  if (gone) tmtSave_(t);
  TMT_OPEN = '';
}

on('tmt-day', el => {
  TMT_DAY = Number(el.dataset.day) || 0;
  tmtShut_();
  tmtPaint_();
});

/* THE BOX IS FOUND BEFORE THE REPAINT, because the repaint replaces the element that was pressed and
   `closest` on a detached node finds nothing. */
on('tmt-open', el => {
  const want = TMT_OPEN === el.dataset.id ? '' : el.dataset.id;
  tmtShut_();
  TMT_OPEN = want;
  const box = el.closest('.tmt-box');
  tmtPaint_();
  if (TMT_OPEN) box?.querySelector(`.tmt-in[data-f="subject"][data-id="${TMT_OPEN}"]`)?.focus();
});

on('tmt-add', el => {
  tmtShut_();
  const t = tmtRead_();
  const day = t.days[TMT_DAY] || (t.days[TMT_DAY] = []);
  /* AN HOUR AFTER THE LAST ONE, because lessons follow each other and the next time is usually the
     one somebody would have typed. Nine o'clock for an empty day. */
  const last = day.map(l => l.at).filter(Boolean).sort().pop();
  const h = last ? Math.min(23, Number(last.slice(0, 2)) + 1) : 9;
  const id = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  day.push({ id, at: String(h).padStart(2, '0') + (last ? last.slice(2) : ':00'), subject: '', note: '' });
  tmtSave_(t);
  TMT_OPEN = id;
  const box = el.closest('.tmt-box');
  tmtPaint_();
  box?.querySelector(`.tmt-in[data-f="subject"][data-id="${id}"]`)?.focus();
});

on('tmt-drop', el => {
  const t = tmtRead_();
  t.days = t.days.map(d => (d || []).filter(l => l.id !== el.dataset.id));
  tmtSave_(t);
  TMT_OPEN = '';
  tmtPaint_();
});

/* A CHECKBOX, SO IT IS READ AFTER IT HAS MOVED — the box has already changed by the time this runs. */
on('tmt-weekend', el => {
  const t = tmtRead_();
  t.weekend = !!el.checked;
  tmtSave_(t);
  if (!t.weekend && TMT_DAY > 4) TMT_DAY = 4;
  tmtPaint_();
});

/* KEPT ON EVERY KEYSTROKE AND NOT REDRAWN. A redraw would take the caret out of the box mid-word;
   the summary line catches up when the lesson is shut.

   `change` AS WELL AS `input`, for the time box. A phone's own time wheel has not always fired
   `input` as it turns — older iOS fired only `change`, as the wheel was put away — and a time that
   reached the box and not the store is a lesson that goes back to nine o'clock when it is shut.
   Both write the same value, so a browser that fires both writes it twice and nothing else. */
function tmtKeep_(e) {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('tmt-in')) return;
  const t = tmtRead_();
  for (const d of t.days) {
    const l = (d || []).find(x => x.id === el.dataset.id);
    if (l) { l[el.dataset.f] = el.value; tmtSave_(t); break; }
  }
  /* THE COLOUR FOLLOWS THE SUBJECT AS IT IS TYPED, so what it will be is visible before Done. */
  if (el.dataset.f === 'subject') {
    const ed = el.closest('.tmt-ed');
    const c = tmtColour_(t, el.value);
    if (ed) { if (c) ed.style.setProperty('--tmt-c', c); else ed.style.removeProperty('--tmt-c'); }
  }
}
document.addEventListener('input', tmtKeep_);
document.addEventListener('change', tmtKeep_);

/* ==================================================================================================
   WORD GAMES — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20 Questions, Imposter and Herd
   Mentality in one widget. The note over the `wordgames` entry in map.js is the argument; this is
   the switch.

   EACH BODY IS THE CARD IT USED TO BE, minus its own `.card` and heading: a sentence, the game's
   `<k>-card` and whatever its engine builds round it. The engines find their parts by id exactly as
   before, so a body here is the only thing that moved. */
const WORD_GAMES = [
  { k: 'art', name: 'Articulate', start: () => initRound('art'), stop: () => roundStop_('art'),
    body: `<p class="sub">Describe it without saying it. Ninety seconds.</p>
    <div id="art-card" class="art"></div>
    <div class="art-row">
      <button class="btn" data-do="rg-next" data-g="art" data-got="1">Got it</button>
      <button class="btn quiet" data-do="rg-next" data-g="art" data-got="0">Pass</button>
    </div>
    <p class="faint art-meta"><span id="art-left">1:30</span> left &middot;
      <b id="art-got">0</b> so far</p>
    <p class="note" id="art-said"></p>
    <button class="btn quiet" data-do="rg-again" data-g="art">New round</button>` },
  { k: 'cha', name: 'Charades', start: () => initRound('cha'), stop: () => roundStop_('cha'),
    body: `<p class="sub">Act it out. No words, no sounds. Three minutes.</p>
    <div id="cha-card" class="art"></div>
    <div class="art-row">
      <button class="btn" data-do="rg-next" data-g="cha" data-got="1">Got it</button>
      <button class="btn quiet" data-do="rg-next" data-g="cha" data-got="0">Pass</button>
    </div>
    <p class="faint art-meta"><span id="cha-left">3:00</span> left &middot;
      <b id="cha-got">0</b> so far</p>
    <p class="note" id="cha-said"></p>
    <button class="btn quiet" data-do="rg-again" data-g="cha">New round</button>` },
  { k: 'tab', name: 'Taboo', party: true,
    body: `<p class="sub">Describe the word without the words under it. Sixty seconds.</p>` },
  { k: 'hot', name: 'Hot Seat', party: true,
    body: `<p class="sub">The class gives clues; the one in the hot seat guesses. Sixty seconds.</p>` },
  { k: 'jam', name: 'Just a Minute', party: true,
    body: `<p class="sub">Talk about the topic for sixty seconds without stopping.</p>` },
  { k: 'twq', name: '20 Questions', party: true,
    body: `<p class="sub">Twenty yes-or-no questions to find a person, a place or a thing.</p>` },
  { k: 'imp', name: 'Imposter', start: () => initImposter(), stop: () => impHide_(),
    /* NO NOTE LINE UNDER THE CARD. `#imp-said` was here and said a sentence on every screen — see
       "a small line, a big line and one button" over `IMP_MIN`. With nothing left to write to it, an
       empty paragraph would only be a margin. */
    body: `<p class="sub">Everyone gets the word but one. Find the imposter.</p>
    <div id="imp-card" class="art"></div>
    <div id="imp-acts" class="art-row"></div>` },
  /* HERD MENTALITY, MOVED IN BY THE OWNER — "heard mentality is a word game so should go there." It
     was left out of the merge on the builder's reasoning (a question everybody answers at once is
     not a word to get across), and that was a call nobody had asked for. Its engine is untouched:
     `initHerd` deals into `#herd-q` exactly as it did on its own card.

     THE WRAPPER CARRIES TWO NAMES AND BOTH ARE LOAD-BEARING. `id="herd-card"` because every game in
     this list draws into a `<k>-card`, and `check-flow.js` asks for one per option in the dropdown;
     `class="herd-card"` because `.herd-card .herd-q` is what sets the question large enough to be
     read across a table — without it the question drops to body text and the game is a phone one
     person reads to themselves.

     NO `stop`, because nothing runs: no clock, no secret on the screen. A question left up when the
     column goes is a question anybody may see. */
  { k: 'herd', name: 'Herd Mentality', start: () => initHerd(), stop: () => {},
    body: `<div id="herd-card" class="herd-card">
    <p class="sub">Everybody answers. You want to match the room, not be right.</p>
    <p class="herd-q" id="herd-q"></p>
    <button class="btn" data-do="herd-next">Next question</button>
    </div>` },
];

/* A party game's body is its sentence and the frame `PARTY_GAMES[k].paint` fills — the same three
   elements for all four, so they are written once here rather than four times above. */
function wgBody_(g) {
  if (!g.party) return g.body;
  return g.body + `
    <div id="${g.k}-card" class="art"></div>
    <div id="${g.k}-acts" class="party-acts"></div>
    <p class="note" id="${g.k}-said" style="text-align:center;margin:.5rem 0 0"></p>`;
}

function wgGame_(k) { return WORD_GAMES.find(g => g.k === k) || WORD_GAMES[0]; }

/* REMEMBERED ON THE DEVICE, `ws-theme`'s rule: the game a family played last week is the one they
   open to, and a remembered key nothing answers any more falls back to the first. */
function wgChosen_() {
  let k = '';
  try { k = localStorage.getItem('wg-game') || ''; } catch (e) {}
  return wgGame_(k).k;
}

/* WHAT THE WIDGET'S MARKUP CARRIES — read by the getter on the `wordgames` entry in map.js, so a
   repaint puts the chosen game's card down with everything else rather than an empty slot. */
function wgOptions_() {
  const k = wgChosen_();
  return WORD_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function wgSlot_() {
  const g = wgGame_(wgChosen_());
  return `<div data-g="${esc(g.k)}" class="wg-game">${wgBody_(g)}</div>`;
}

function initWordGames() {
  const slot = $('wg-slot'), sel = $('wg-pick');
  if (!slot) return;
  const g = wgGame_(wgChosen_());
  if (sel && sel.value !== g.k) sel.innerHTML = wgOptions_();
  /* REBUILT ONLY WHEN THE GAME CHANGED. A repaint runs `start` on markup `paint` has just replaced,
     so the slot is empty and gets its body; a start on a slot already holding this game's body (a
     second start without a repaint) leaves it alone, which is what keeps a button under a finger. */
  const now = slot.firstElementChild;
  if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = wgSlot_();
  if (g.party) partyStart_(g.k);
  else g.start();
}

function wordGamesStop_() {
  WORD_GAMES.forEach(g => {
    try { if (g.party) partyStop_(g.k); else g.stop(); }
    catch (e) { console.warn('[word games]', g.k, e); }
  });
}

on('wg-pick', el => {
  const k = wgGame_(el.value).k;
  try { localStorage.setItem('wg-game', k); } catch (e) {}
  /* THE OLD GAME IS STOPPED AFTER ITS CARD HAS LEFT THE DOCUMENT, which is the order that makes its
     own stop read it as "the column is gone": Articulate's clock stops, a party round pauses until
     somebody comes back and presses Resume, Imposter's word is hidden. */
  const slot = $('wg-slot');
  if (slot) slot.innerHTML = '';
  wordGamesStop_();
  initWordGames();
});

/* ==================================================================================================
   TOUCH TYPING — the `typing` widget on the Tools column. The note over its entry in map.js says why
   it is a tool; this is the engine.

   ASKED FOR AS *"Add a widget for keyboard practice with no eyes like that one website in links"*
   and again as *"add keyboard tool widget."* The website is L082 in data/settings/links.json,
   TypingClub, "Learn to touch-type." So it is that shape and nothing bigger: a line to copy, a
   keyboard drawn on the card with each key in the colour of the finger that presses it and the NEXT
   key lit, so the eyes stay on the screen and the hands learn where things are by themselves. WPM
   and accuracy under it, and a ladder of five lessons that opens one rung at a time.

   `kt-`, NOT `tt-`. `.tt` and `#tt-*` are the Times Tables sprint (map.js, docs/history/235), and a
   second widget sharing a prefix is a stylesheet rule that lands on both.

   NO `stop`, ON PURPOSE. There is no clock running: WPM is worked out from the time of the first and
   the latest keystroke, at the keystroke, so a card nobody is typing into costs nothing — and a
   widget with no `stop` is drawn with its page, five pages ahead, rather than popping in on arrival.
   See `drawWidget_` in find.js for why that matters. */

/* THE LADDER. `keys` is every letter the lesson may use; `fresh` is what it adds, and a line leans
   towards words that hold one, because a home-row word in the top-row lesson practises nothing new.
   Capitals and punctuation add no LETTERS — they add the shift key and the marks — so they are
   flags rather than a longer `keys`. */
const KT_HOME = 'asdfghjkl', KT_TOP = 'qwertyuiop', KT_LOW = 'zxcvbnm';
const KT_LESSONS = [
  { name: 'Home row',    keys: KT_HOME,                          fresh: KT_HOME },
  { name: 'Top row',     keys: KT_HOME + KT_TOP,                 fresh: KT_TOP },
  { name: 'Bottom row',  keys: KT_HOME + KT_TOP + KT_LOW,        fresh: KT_LOW },
  { name: 'Capitals',    keys: KT_HOME + KT_TOP + KT_LOW,        fresh: '', caps: true },
  { name: 'Punctuation', keys: KT_HOME + KT_TOP + KT_LOW + "'",  fresh: "'", caps: true, marks: true },
];
/* "AS ACCURACY HOLDS": three lines at nine in ten or better opens the next rung. Speed is not asked
   for — a touch typist who is accurate gets fast, and one who is fast and looking at their hands has
   learnt the wrong thing, which is the whole of what this widget is for. */
const KT_HOLD = 0.9, KT_LINES_TO_OPEN = 3;

/* ONE LIST, FILTERED PER LESSON, rather than five lists. A word in the home-row list with a `t` in it
   would be a key the lesson has not taught yet, and five hand-kept lists are five chances to write
   one; filtering by `keys` makes that impossible. The home-row words are first because only they
   survive the first filter — nine letters and no vowel but `a` is a short dictionary. */
const KT_WORDS = (
  'a as ad add all ask asks dad fad fall falls flag flags flask gas glad glass had half hall has ' +
  'lad lads lag lass sad salad shall flash dash hash sash slash alas gala jags ' +
  'the they their there here her were we you your it is to too at of off out our quite quiet ' +
  'type tree free fire wire write route power pretty paper party report opera equal usual ' +
  'house south photo tissue trip ship shop stop sure true what that this with sheet ' +
  'zebra zero zone box fox mix next six exam extra van vote very cave move back black cabin ' +
  'blank bank came come name climb maze lazy jazz and for have from will one would about which ' +
  'when make can like time just know take people into year good some could them see other than ' +
  'then now look only over think also after use two how work first well way even new want because ' +
  "any these give day most don't it's can't won't isn't we're you're that's let's"
).split(' ');
/* Capitals are practised on names as well as on the first word of a sentence, because a name is
   where a capital turns up in the middle of a line. */
const KT_NAMES = ['London', 'Paris', 'Monday', 'Friday', 'Sam', 'Kit', 'Zoe', 'Max', 'Ben', 'June'];

/* THE KEYBOARD, AND WHICH FINGER OWNS EACH KEY. Columns, not keys, decide the finger: the index
   fingers take two columns each and the right little finger takes everything past the `o`. 0-3 are
   the left hand little to index, 4-7 the right hand index to little, 8 the thumbs. */
const KT_ROWS = ['qwertyuiop', "asdfghjkl;'", 'zxcvbnm,./'];
const KT_COL_FINGER = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7];
/* WHAT A SHIFTED MARK IS UNDER. A capital is its own letter; these are not. */
const KT_SHIFTED = { '?': '/', ':': ';', '"': "'", '<': ',', '>': '.' };

function ktFinger_(base) {
  if (base === ' ') return 8;
  for (const row of KT_ROWS) { const i = row.indexOf(base); if (i >= 0) return KT_COL_FINGER[i]; }
  return -1;
}
/* The keycap a character is on, and whether shift is held for it. */
function ktCap_(ch) {
  if (KT_SHIFTED[ch]) return { base: KT_SHIFTED[ch], shift: true };
  const lo = ch.toLowerCase();
  return { base: lo, shift: lo !== ch };
}

/* ---------- KEPT ON THE DEVICE, UNDER WHOEVER IS SIGNED IN ----------------------------------------
   The timetable's rule and its key pattern: `whoIs_` is the same answer the answer boxes use, so two
   students sharing a laptop climb two ladders. Signed out it still works under the bare key. Kept:
   the lesson somebody is on, how far up they have opened, how many lines each lesson has held, and
   the best speed — the LINE itself is not kept, because a half-typed line from last week is not
   something anybody wants to come back to.
   A FUNCTION, NOT A `const` ARROW like `tmtKey_`, so it reaches `window` and a journey can clear it
   without a hook of its own in check-flow's export list. */
function ktKey_() { const w = typeof whoIs_ === 'function' ? whoIs_() : ''; return 'kt' + (w ? ':' + w : ''); }
function ktRead_() {
  try {
    const p = JSON.parse(localStorage.getItem(ktKey_()) || 'null');
    if (p && Array.isArray(p.held)) {
      p.open = Math.max(0, Math.min(KT_LESSONS.length - 1, Number(p.open) || 0));
      p.at = Math.max(0, Math.min(p.open, Number(p.at) || 0));
      while (p.held.length < KT_LESSONS.length) p.held.push(0);
      return p;
    }
  } catch (e) {}
  return { at: 0, open: 0, held: KT_LESSONS.map(() => 0), best: 0, lines: 0 };
}
function ktSave_(p) {
  try { localStorage.setItem(ktKey_(), JSON.stringify(p)); }
  catch (e) { /* A browser keeping nothing still types — it just forgets the ladder on reload. */ }
}

/* THE LINE IN HAND. In memory, and stamped with who it belongs to, so a sign-in on the same machine
   does not hand the next person the last one's half-finished line and score. `ktNow_` is a function
   for the same reason `ktKey_` is: a journey reads the line through it. */
let KT = null;
function ktFresh_(who, p, said, last) {
  return { who, p, line: ktLine_(p.at), pos: 0, right: 0, wrong: 0, t0: 0, t1: 0, miss: '',
           said: said || '', last: last || null };
}
function ktNow_() {
  const who = ktKey_();
  if (!KT || KT.who !== who) KT = ktFresh_(who, ktRead_());
  return KT;
}

/* A LESSON BY ITS NUMBER, the first for one that is not there. A function rather than an index into
   the `const` wherever it is wanted, because only a function declaration reaches `window` — and the
   journey in check-flow reads every lesson's letters through this to ask what each line may hold. */
function ktLesson_(n) { return KT_LESSONS[n] || KT_LESSONS[0]; }
function ktLessonCount_() { return KT_LESSONS.length; }

/* A LINE OF ABOUT FORTY CHARACTERS — two rows of the card on a 320 phone, one on a laptop. */
function ktLine_(n) {
  const L = ktLesson_(n);
  const fits = w => [...w.toLowerCase()].every(c => L.keys.includes(c));
  const pool = KT_WORDS.filter(fits);
  const fresh = L.fresh ? pool.filter(w => [...w].some(c => L.fresh.includes(c))) : [];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const words = [];
  let len = 0;
  while (len < 38) {
    /* NOT THE SAME WORD TWICE RUNNING. The home row's dictionary is thirty words, and the first
       screenshot drew "alas alas" — which is practising one word, not the row. Asked of the word as
       it will be drawn, names included: the first guard ran before a name was chosen and the journey
       caught "Friday Friday". */
    const was = words.length ? words[words.length - 1].toLowerCase().replace(/[^a-z']/g, '') : '';
    let w = '';
    for (let tries = 0; tries < 8 && (!w || w.toLowerCase() === was); tries++) {
      w = L.caps && Math.random() < 0.15 ? pick(KT_NAMES)
        : fresh.length && Math.random() < 0.6 ? pick(fresh) : pick(pool);
    }
    if (L.caps && (!words.length || Math.random() < 0.3)) w = w[0].toUpperCase() + w.slice(1);
    /* MARKS BETWEEN WORDS, not a mark per word: one gap in three, and a full stop or a question mark
       starts the next word with a capital, as a sentence would. */
    if (L.marks && words.length && Math.random() < 0.3) {
      const m = pick([',', ',', '.', '?', ';', ':']);
      words[words.length - 1] += m;
      if (m === '.' || m === '?') w = w[0].toUpperCase() + w.slice(1);
    }
    words.push(w);
    len += w.length + 1;
  }
  return words.join(' ') + (L.marks ? '.' : '');
}

/* ---------- WHAT A LINE SCORES ------------------------------------------------------------------
   WPM IS THE TYPISTS' WORD — five characters, spaces included — so a line of short words and a line
   of long ones are measured alike. Accuracy is right keys over all keys. A wrong key does NOT move
   the line on — the cursor waits for the right one, keybr's rule rather than TypingClub's — and is
   counted, so a line cannot be finished by mashing and the next key lit is always the one wanted. */
function ktWpm_(s) {
  const ms = (s.t1 || 0) - (s.t0 || 0);
  return ms > 0 && s.right > 1 ? Math.round((s.right / 5) / (ms / 60000)) : 0;
}
function ktAcc_(s) {
  const all = s.right + s.wrong;
  return all ? s.right / all : 1;
}

/* ONE KEY. `ch` is the character typed, from whichever door it came in by. */
function ktType_(ch) {
  const s = ktNow_();
  const want = s.line[s.pos];
  if (want === undefined) return;
  const now = Date.now();
  if (!s.t0) s.t0 = now;
  s.t1 = now;
  if (ch === want) { s.pos++; s.right++; s.miss = ''; }
  else { s.wrong++; s.miss = ch; }
  if (s.pos >= s.line.length) ktDone_(s);
}

function ktDone_(s) {
  const p = s.p;
  const wpm = ktWpm_(s), acc = ktAcc_(s);
  p.lines = (p.lines || 0) + 1;
  p.best = Math.max(p.best || 0, wpm);
  let said = `Last line: ${wpm} wpm, ${Math.round(acc * 100)}% right.`;
  if (acc >= KT_HOLD) {
    p.held[p.at] = (p.held[p.at] || 0) + 1;
    if (p.at === p.open && p.open < KT_LESSONS.length - 1 && p.held[p.at] >= KT_LINES_TO_OPEN) {
      p.open++;
      said += ` ${KT_LESSONS[p.open].name} is open.`;
    }
  } else {
    said += ` Under ${Math.round(KT_HOLD * 100)}% does not count — slow down, eyes on the screen.`;
  }
  ktSave_(p);
  KT = ktFresh_(s.who, p, said, { wpm, acc });
}

/* ---------- DRAWN ---------------------------------------------------------------------------------
   THE KEYBOARD IS A PICTURE, NOT A KEYPAD. It is `aria-hidden` and nothing on it can be pressed: on
   a laptop the keys are under the fingers, and on a phone the phone's own keyboard is the one being
   typed on. So its keys are about 18px at 320 and that is not a breach of the 44px rule — nothing
   on it is a target. The one target is the line, which is what focuses the hidden box. */
function ktKeyHtml_(base, label, next, miss, extra) {
  const f = ktFinger_(base);
  const cls = ['kt-k', 'f' + (f < 0 ? 8 : f)];
  if (KT_ROWS[1].indexOf(base) >= 0 && KT_ROWS[1].indexOf(base) < 10) cls.push('home');
  if (base === 'f' || base === 'j') cls.push('bump');
  if (next) cls.push('next');
  if (miss) cls.push('miss');
  if (extra) cls.push(extra);
  return `<span class="${cls.join(' ')}">${esc(label)}</span>`;
}

function ktBoardHtml_(want, miss) {
  const w = want ? ktCap_(want) : null;
  const m = miss ? ktCap_(miss).base : '';
  /* SHIFT ON THE OTHER HAND, which is the rule a touch typist is taught: the left little finger holds
     shift for a letter the right hand types, and the other way round. */
  const wf = w ? ktFinger_(w.base) : -1;
  const shL = !!(w && w.shift && wf >= 4 && wf <= 7), shR = !!(w && w.shift && wf >= 0 && wf <= 3);
  const row = r => [...r].map(c => ktKeyHtml_(c, c, !!w && w.base === c, m === c)).join('');
  /* THE SHIFTS ARE NAMED BY A KEY ON THEIR OWN SIDE — `z` and `/` — only so `ktFinger_` gives them
     the left and right little finger's colours without a second table. */
  return `<div class="kt-kb" aria-hidden="true">
    <div class="kt-r kt-r1">${row(KT_ROWS[0])}</div>
    <div class="kt-r kt-r2">${row(KT_ROWS[1])}</div>
    <div class="kt-r kt-r3">${ktKeyHtml_('z', '⇧', shL, false, 'kt-sh')}${row(KT_ROWS[2])}${
      ktKeyHtml_('/', '⇧', shR, false, 'kt-sh')}</div>
    <div class="kt-r kt-r4">${ktKeyHtml_(' ', 'space', !!w && w.base === ' ', m === ' ', 'kt-sp')}</div>
  </div>`;
}

function ktViewHtml_() {
  const s = ktNow_(), p = s.p;
  const L = ktLesson_(p.at);
  const cur = s.line[s.pos] === undefined ? '' : s.line[s.pos];
  const wpm = s.pos ? ktWpm_(s) : (s.last ? s.last.wpm : 0);
  const acc = s.right + s.wrong ? ktAcc_(s) : (s.last ? s.last.acc : 1);
  /* THE RUNGS ARE A PICKER, the timetable's day chips: 44px, the open ones pressable, the shut ones
     drawn and disabled so the ladder can be seen before it is climbed. */
  const rungs = KT_LESSONS.map((l, i) => {
    const shut = i > p.open;
    return `<button type="button" class="kt-rung${i === p.at ? ' on' : ''}${(p.held[i] || 0) >= KT_LINES_TO_OPEN ? ' held' : ''}"
             data-do="kt-lesson" data-n="${i}" aria-pressed="${i === p.at}"${shut ? ' disabled' : ''}
             aria-label="${esc(l.name)}${shut ? ' (not open yet)' : ''}">${i + 1}</button>`;
  }).join('');
  const toGo = p.at === p.open && p.open < KT_LESSONS.length - 1
    ? Math.max(0, KT_LINES_TO_OPEN - (p.held[p.at] || 0)) : 0;
  /* THE LINE IS ONE BUTTON WITH NO WHITESPACE INSIDE IT — the spans run on — because a gap between
     them in the markup is a space drawn in the middle of the line that nobody is meant to type. */
  return `<div class="kt-rungs">${rungs}</div>
    <p class="kt-lesson"><b>${esc(L.name)}</b>${toGo
      ? ` <span class="faint">· ${toGo} more at ${Math.round(KT_HOLD * 100)}% opens ${esc(KT_LESSONS[p.at + 1].name)}</span>`
      : ''}</p>
    <button type="button" class="kt-line" data-do="kt-focus" aria-label="Type this line: ${esc(s.line)}"><span class="kt-done">${
      esc(s.line.slice(0, s.pos))}</span><span class="kt-cur${s.miss ? ' miss' : ''}${cur === ' ' ? ' sp' : ''}">${
      esc(cur)}</span><span class="kt-rest">${esc(s.line.slice(s.pos + 1))}</span></button>
    <p class="kt-hint"><span class="kt-go">Tap the line, then type.</span><span class="kt-on">Eyes here, not on your hands.</span></p>
    <div class="kt-stats"><span><b class="kt-wpm">${wpm}</b> wpm</span><span><b class="kt-acc">${
      Math.round(acc * 100)}%</b> right</span>${p.best ? `<span class="faint">best ${p.best}</span>` : ''}</div>
    ${ktBoardHtml_(cur, s.miss)}
    <p class="note kt-said" aria-live="polite">${esc(s.said || '')}</p>
    <p class="faint kt-real">Made for a real keyboard. A phone's own keys work, but the point is not looking down.</p>`;
}

/* EVERY COPY, BY CLASS — the Saved column draws this markup again, the timetable's reason. And THE
   BOX IS KEPT: only `.kt-view` is rewritten, because rewriting the hidden input on every keystroke
   would take the focus away from it and the next key would land on the page. */
function ktPaint_() {
  const html = ktViewHtml_();
  document.querySelectorAll('.kt-box').forEach(el => {
    let v = el.querySelector(':scope > .kt-view');
    if (!v) {
      el.innerHTML = `<input class="kt-in" type="text" autocomplete="off" autocapitalize="off"
        autocorrect="off" spellcheck="false" enterkeyhint="next" aria-label="Type here">
        <div class="kt-view"></div>`;
      v = el.querySelector(':scope > .kt-view');
    }
    v.innerHTML = html;
    el.classList.toggle('typing', document.activeElement === el.querySelector('.kt-in'));
  });
}
function initTyping() { ktPaint_(); }

/* ---------- HOW KEYS GET IN ------------------------------------------------------------------------
   THROUGH A HIDDEN BOX THAT HAS THE FOCUS, which is what keeps the app's own key listeners out of
   it: the pager's arrows (shell.js) and the maze's (games.js) both stand down inside an input.

   AND ON `keydown`, IN THE CAPTURE PHASE, with the event stopped there. Not every listener stands
   down: Flabby Pird's takes the space bar with `preventDefault` whenever its canvas is anywhere in
   the document, and the games column's pages sit in the document beside this one — so a space typed
   here could be eaten before it reached the box. Caught on the way DOWN, at the document, nothing
   further along ever sees it.

   `input` IS THE SECOND DOOR, for a phone. Its keyboard sends `keydown` with the key "Unidentified"
   and puts the character straight into the box, so whatever arrives there is read and the box is
   emptied. A key handled on `keydown` is `preventDefault`ed, so it never arrives twice. */
document.addEventListener('keydown', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('kt-in')) return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
  if (e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); return; }
  if (!e.key || e.key.length !== 1) return;     // Tab, Escape, the arrows: theirs, not ours
  e.preventDefault();
  e.stopPropagation();
  ktType_(e.key);
  ktPaint_();
}, true);

document.addEventListener('input', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('kt-in')) return;
  const got = String(el.value || '');
  el.value = '';
  if (!got) return;
  [...got].forEach(ktType_);
  ktPaint_();
});

/* THE CARD SAYS WHETHER IT IS LISTENING. A typist who clicked elsewhere and goes on typing is typing
   into nothing, so the hint under the line changes and the line loses its lit letter. */
document.addEventListener('focusin', e => {
  if (e.target && e.target.classList && e.target.classList.contains('kt-in')) {
    e.target.closest('.kt-box')?.classList.add('typing');
  }
});
document.addEventListener('focusout', e => {
  if (e.target && e.target.classList && e.target.classList.contains('kt-in')) {
    e.target.closest('.kt-box')?.classList.remove('typing');
  }
});

/* FOCUSED IN THE TAP ITSELF, synchronously — iOS opens its keyboard only for a focus inside the
   gesture that asked for it. `preventScroll`, because the pane is a window onto a pager and a
   browser scrolling a focused box into view moves the pages under the person. */
function ktFocus_(at) {
  const box = at && at.closest && at.closest('.kt-box');
  const input = box && box.querySelector('.kt-in');
  if (!input) return;
  try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
  /* ONLY IF THE FOCUS TOOK. A card on a page parked off to the side cannot hold it — measured: the
     focus call returns and `activeElement` is still the body — and a card that said "Eyes here" while
     nothing was listening would be typed into for a whole line before anybody noticed. */
  box.classList.toggle('typing', document.activeElement === input);
}
on('kt-focus', el => ktFocus_(el));

on('kt-lesson', el => {
  const s = ktNow_();
  const n = Number(el.dataset.n) || 0;
  if (n > s.p.open) return;
  s.p.at = n;
  ktSave_(s.p);
  KT = ktFresh_(s.who, s.p);
  /* THE BOX IS FOUND BEFORE THE REPAINT; the rung pressed is replaced by it. And the typing goes on:
     a click on a rung took the focus off the hidden box, so it is handed straight back. */
  const box = el.closest('.kt-box');
  ktPaint_();
  if (box) ktFocus_(box);
});


/* ==================================================================================================
   VIDEOS — A SEARCH BOX, A LIST, A PLAYER IN THE CARD, AND A FULL SCREEN TILE

   ASKED FOR AS "videos would be in the games column. its one new widget. its a video searcher you
   type in. and there should be a full screen button." — and earlier as "Video cool videos database
   for reals and movies". The roster entry is `videos` in map.js, last on the Games column.

   WHAT IT SEARCHES, AND IT IS TWO LISTS THE APP ALREADY HAS OR THE OWNER FILLS:
     - `data/videos.json` — the curated database, one row per video: `title`, `url`, `kind`
       (film | clip; an old "reel" reads as a clip), `tags`, `age`, `notes`, `active`. The owner
       fills it; a row is switched off with `active: false` rather than deleted, the shop's convention.
     - NOT the reels. They were a third list here and were taken out: *"the video widget shouldn't
       acknowledge reels."* The Reel column is where they live.
     - the films — `DATA.films`, which the backend sends to an admin and to NOBODY ELSE (note 068 in
       docs/history). `|| []` is the ordinary fallback and here it is also the whole gate, exactly
       as it is in find.js: nothing in this file decides who may see a film.
       AND THEY ARE WHATEVER IS IN THE NOTFLIX FOLDER — *"Ensure the video searcher is hooked up. Let
       admin be able to search up films which are in the notflix folder on gdrive."* (9 Oct). This card
       was wired all along and an admin found nothing: the films tab was empty, and nothing filled it
       from Drive. `filmsSync` does now (backend/content.gs), and THIS CARD IS WHERE IT IS ASKED FOR —
       on its own for an admin once the last whole pass is a day old, and by hand from a silver Sync
       from Drive tile that only an admin is drawn. See `filmsSyncDue_` below and note 305.

   NOT ALL OF YOUTUBE. A live search of YouTube needs a YouTube Data API key in the page, which in a
   public repository is a published key; that is the owner's decision and it has not been taken. So
   the box searches what is listed, and says how many it searched, rather than pretending to be
   YouTube.

   ---------- WHY YOUTUBE IS EMBEDDED HERE WHEN THE REELS' EMBEDS WERE TAKEN OUT ----------------------
   The owner's word on the reels was "remove the embedded reels. they suck." — see `clipPlayable_`
   above. What sucked was a COLUMN that autoplays, mutes and pauses, falling through to a Drive or
   Instagram iframe it could do none of that to. This card does none of that: nothing plays until a
   row is tapped, and the person then drives the player themselves. A YouTube link has no address a
   `<video>` can read, so the choice for one is an embed or nothing — and the youtube-NOCOOKIE host,
   which sets no tracking cookie until the video is actually played. An `.mp4` plays in a `<video>`,
   as a reel does. A Drive film plays in neither, for the reason note 068 gives (a 3 GB `.mkv`), so
   its row is a door to Drive, marked as one.

   THE LIST IS FETCHED ON FIRST OPEN, NOT AT BOOT. Every visitor pays for the payload and the
   library; a list of videos is for the ones who come to this card. `?t=LOAD` is the same stamp the
   boot fetches carry, so the service worker's exact-URL cache hands back a fresh copy after a deploy
   and never the old one.
================================================================================================== */
const VID_KINDS = ['film', 'clip'];
let VIDEOS_LIST = null;          // null: not asked yet. []: asked, and there is nothing in it
let VIDEOS_ASKED = null;         // the one request in flight, so two copies of the card ask once
const VID = { q: '', at: '' };   // what is typed, and the key of the row in the player

/* A ROW IS ONE SHAPE WHEREVER IT CAME FROM, built here once rather than at each reader. `how` is
   how it plays: `yt` in an iframe, `file` in a `<video>`, `out` a door to somewhere else. */
function vidHow_(url) {
  const u = String(url || '').trim();
  if (vidYouTubeId_(u)) return 'yt';
  if (typeof clipPlayable_ === 'function' && clipPlayable_(u)
      && /\.(mp4|webm|m4v|mov|ogv)(?:[?#]|$)/i.test(u)) return 'file';
  if (/^https?:\/\//i.test(u)) return 'out';
  return '';
}

/* EVERY SHAPE A YOUTUBE ADDRESS COMES IN when somebody copies it: the watch page, the share link,
   a Short, an embed, and the nocookie host itself. An id is eleven characters of [A-Za-z0-9_-]; a
   match on anything looser would embed a playlist page or a channel as a broken player. */
function vidYouTubeId_(url) {
  const u = String(url || '').trim();
  const m = u.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i);
  return m ? m[1] : '';
}

function videosAll_() {
  const out = [];
  const seen = new Set();
  /* ONE ROW PER ADDRESS — and a row with no address (a film not in the Drive yet) by its own key, or
     every placeholder after the first would be taken for the first. */
  const add = r => {
    const at = r.url || ('#' + r.key);
    if (!r.title || !r.how || seen.has(at)) return;
    seen.add(at);
    out.push(r);
  };
  /* THE OWNER'S LIST FIRST, so a video they typed in that is also a film is shown with their title
     and tags rather than the film's — theirs is the one somebody wrote on purpose. */
  (VIDEOS_LIST || []).forEach((r, i) => {
    if (!r || typeof r !== 'object') return;
    if (r.active !== undefined && typeof libOn === 'function' && !libOn(r.active)) return;
    const url = String(r.url || '').trim();
    const kind = VID_KINDS.indexOf(String(r.kind || '').toLowerCase()) !== -1
      ? String(r.kind).toLowerCase() : 'clip';
    add({ key: 'v' + i, title: String(r.title || '').trim(), url, kind, how: vidHow_(url),
          tags: String(r.tags || ''), age: String(r.age || '').trim(), notes: String(r.notes || '') });
  });
  /* THE REELS WERE HERE, numbered by address and listed as "Reel 1", "Reel 2". Taken out:
     *"the video widget shouldn't acknowledge reels."* Reels are the Reel column's, and listing them
     again here made one thing two places to find it. A row of the owner's own list that was typed
     with kind "reel" is shown as a clip -- it is still a video somebody chose. */
  /* ---------- A FILM, A SERIES OR A DOCUMENTARY — AND ONE THAT IS NOT IN THE DRIVE YET ---------------
     `label` IS WHAT IT IS, because every film row said "Film" — a five-season show and a documentary
     included. The words an admin types for a kind are in `tags` with it: `series` and `tv`, `documentary`,
     `film` and `movie`, and the folder's audience (`kids`, `adults`).
     A PLACEHOLDER IS LISTED, not dropped. It was skipped without a word, so an admin searching for a
     film asked for by name was told "Nothing matches that" where Find says "Not in the drive yet" —
     two answers to one question. It is a row that says so and opens nothing (`how: 'none'`). */
  ((typeof DATA !== 'undefined' && DATA.films) || []).forEach((f, i) => {
    if (!f || !f.title) return;
    const url = String(f.url || '').trim();
    const k = String(f.kind || '').toLowerCase();
    const label = k === 'series' ? 'Series' : k === 'documentary' ? 'Documentary' : 'Film';
    const words = k === 'series' ? 'series tv show' : k === 'documentary' ? 'documentary' : 'film movie';
    const door = !f.placeholder && /^https?:\/\//i.test(url);
    add({ key: 'f' + (f.id || i), title: String(f.title), url: door ? url : '', kind: 'film', label: label,
          how: door ? 'out' : 'none', none: f.placeholder ? 'not in the Drive yet' : 'no Drive link yet',
          tags: [f.year, f.director, f.lead, words, f.audience].filter(Boolean).join(' '),
          age: f.audience === 'kids' ? 'kids' : '', notes: String(f.notes || '') });
  });
  return out;
}

/* EVERY WORD TYPED HAS TO BE SOMEWHERE IN THE ROW — title, tags, kind, notes. An "any word" match
   gets LONGER as you type a second word, which is the opposite of what typing into a search box is
   for; "narrows as you type" was the request. */
/* AND A PLURAL FINDS ITS SINGULAR: `films`, `documentaries`, `movies` — the folder's own words are
   plurals, and they are what an admin who has the folder in mind will type. */
function videosFound_(q) {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const all = videosAll_();
  if (!words.length) return all;
  const has = (hay, w) => hay.indexOf(w) !== -1
    || (w.length > 3 && /ies$/.test(w) && hay.indexOf(w.slice(0, -3) + 'y') !== -1)
    || (w.length > 3 && /s$/.test(w) && hay.indexOf(w.slice(0, -1)) !== -1);
  return all.filter(r => {
    const hay = [r.title, r.tags, r.kind, r.notes, r.age].join(' ').toLowerCase();
    return words.every(w => has(hay, w));
  });
}

function vidPlayer_(r) {
  if (!r) return '<p class="faint vid-hint">Tap a video to play it here.</p>';
  if (r.how === 'yt') {
    /* `referrerpolicy` IS NOT DECORATION: YouTube's embed refuses to play (error 153) for a page
       that sends no referrer. `autoplay` is allowed because the tap that chose the row is the
       gesture that asked for it. */
    return `<iframe class="vid-player" src="https://www.youtube-nocookie.com/embed/${esc(vidYouTubeId_(r.url))}?rel=0&amp;playsinline=1&amp;autoplay=1"
      title="${esc(r.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  /* `playsinline`, OR AN IPHONE TAKES EVERY TAP STRAIGHT TO ITS OWN FULL SCREEN and the card never
     holds the video at all — which would make the Full screen tile the only way NOT to be full
     screen. */
  return `<video class="vid-player" src="${esc(r.url)}" controls playsinline preload="metadata"></video>`;
}

function vidRow_(r) {
  const flag = r.label || (r.kind === 'film' ? 'Film' : 'Clip');
  const sub = [r.age, r.how === 'out' ? 'opens in a new tab' : r.how === 'none' ? r.none : '']
    .filter(Boolean).join(' · ');
  const inner = `<span class="vid-t">${esc(r.title)}</span>
      <span class="vid-k">${esc(flag)}${sub ? ' · ' + esc(sub) : ''}</span>`;
  /* NOTHING TO OPEN, AND IT SAYS SO — not a button that does nothing when pressed. */
  if (r.how === 'none') return `<li><div class="vid-row is-off">${inner}</div></li>`;
  /* A DOOR IS A LINK, NOT A BUTTON THAT PRETENDS TO PLAY. `out` is absolute http(s), tested in
     `vidHow_` — `tile_`'s rule for the one way out of this app. */
  if (r.how === 'out') {
    return `<li><a class="vid-row is-out" href="${esc(r.url)}" target="_blank" rel="noopener">${inner}</a></li>`;
  }
  return `<li><button type="button" class="vid-row${VID.at === r.key ? ' on' : ''}" data-do="vid-play"
      data-k="${esc(r.key)}">${inner}</button></li>`;
}

/* THE LIST AND THE PLAYER ARE REPAINTED; THE BOX IS NOT. Rewriting the `<input>` on every keystroke
   would drop the keyboard on a phone after one letter — the flinch the note over `tile_`'s "filling
   the shape" records. So the box is built once per copy and only its siblings change. */
function vidPaint_(only) {
  const boxes = document.querySelectorAll('.vid-box');
  if (!boxes.length) return;
  const all = videosAll_();
  const found = videosFound_(VID.q);
  const playing = all.find(r => r.key === VID.at) || null;
  /* A COUNT RATHER THAN A SILENCE: "3 of 12 videos" says the box searched something, where an
     empty list under a search box looks exactly like a search that never ran. */
  const said = VIDEOS_LIST === null && !all.length ? 'Looking for videos…'
    : !all.length ? 'No videos listed yet.'
    : found.length === all.length ? all.length + (all.length === 1 ? ' video' : ' videos')
    : found.length + ' of ' + all.length + ' videos';
  boxes.forEach(box => {
    if (!box.querySelector('.vid-q')) {
      box.innerHTML = `<input class="vid-q" type="search" placeholder="Search videos…"
        autocomplete="off" enterkeyhint="search" aria-label="Search videos">
      <div class="vid-stage"></div>
      <div class="tile-row vid-acts"></div>
      <div class="vid-admin"></div>
      <p class="faint vid-said"></p>
      <ul class="vid-list"></ul>`;
    }
    /* ---------- THE ADMIN'S ROW: SYNC FROM DRIVE, AND WHEN IT LAST RAN ----------------------------------
       ONLY FOR AN ADMIN, and an EMPTY ELEMENT for everybody else — no tile, no sentence, no word that says
       films exist. `isAdmin()` decides what is DRAWN; what is SENT is the backend's, and a student's
       payload has no film and no stamp in it to draw from. Silver, like every admin control (tiles.js).
       The sentence beside the tile is the tile's note made visible: a 44px plate has no room for "synced
       an hour ago", and that is the line the admin is looking for. */
    const adm = box.querySelector('.vid-admin');
    if (adm) {
      const mine = typeof isAdmin === 'function' && isAdmin();
      const said = mine ? filmsSyncSaid_() : '';
      const html = mine ? `<div class="tile-row">${tile_({ icon: 'sync', label: 'Sync from Drive', note: said,
          act: 'vid-sync', tone: 'admin', cls: FILMSYNC.asking ? 'is-busy' : '', off: !!FILMSYNC.asking })}
        <span class="vid-synced">${esc(said)}</span></div>` : '';
      if (adm.dataset.html !== html) { adm.innerHTML = html; adm.dataset.html = html; }
    }
    const q = box.querySelector('.vid-q');
    if (q && document.activeElement !== q && q.value !== VID.q) q.value = VID.q;
    if (only !== 'list') {
      const stage = box.querySelector('.vid-stage');
      const want = playing ? playing.key : '';
      /* ONLY WHEN IT CHANGED: rebuilding the player on a keystroke would restart the video under
         somebody who is searching for the next one while this one plays. */
      if (stage && (stage.dataset.k || '') !== want) {
        stage.innerHTML = vidPlayer_(playing);
        stage.dataset.k = want;
        stage.classList.toggle('on', !!playing);
      }
      const acts = box.querySelector('.vid-acts');
      if (acts) acts.innerHTML = tile_({ icon: 'full', label: 'Full screen', act: 'vid-full',
                                          off: !playing });
    }
    box.querySelector('.vid-said').textContent = said;
    /* FORTY ROWS, AND THEN A SENTENCE SAYING THERE ARE MORE — the count above said "60 videos" over a
       list that stopped at forty with nothing to say the rest existed. */
    box.querySelector('.vid-list').innerHTML = found.length
      ? found.slice(0, 40).map(vidRow_).join('')
        + (found.length > 40 ? `<li class="faint vid-none">${found.length - 40} more — type to narrow the list.</li>` : '')
      : (all.length ? '<li class="faint vid-none">Nothing matches that.</li>' : '');
  });
}

function videosAsk_() {
  if (VIDEOS_LIST !== null) return Promise.resolve(VIDEOS_LIST);
  if (VIDEOS_ASKED) return VIDEOS_ASKED;
  const stamp = window.LOAD ? '?t=' + window.LOAD : '';
  VIDEOS_ASKED = Promise.resolve()
    .then(() => fetch('data/videos.json' + stamp, { cache: 'default' }))
    .then(res => (res && res.ok) ? res.json() : [])
    .catch(() => [])
    /* AN ARRAY OR NOTHING. A missing file, a 404 page or a half-written edit is "no list", and the
       reels and films still search — an empty or broken file must still produce a working card. */
    .then(rows => { VIDEOS_LIST = Array.isArray(rows) ? rows : []; VIDEOS_ASKED = null; return VIDEOS_LIST; });
  return VIDEOS_ASKED;
}

function initVideos() {
  vidPaint_();
  videosAsk_().then(() => vidPaint_());
  /* AN ADMIN'S CARD KEEPS THE FILMS CURRENT ON ITS OWN — once per person per visit, when the last whole
     pass is a day old or a pass is part-way. `initVideos` runs again when the payload lands and when
     somebody signs in, so the first call that can see an admin's stamp is the one that asks. */
  if (filmsSyncDue_()) filmsSyncRun_(false);
}

/* ==================================================================================================
   THE FILMS FROM DRIVE — ASKED FOR BY THE CARD, FOR AN ADMIN

   `DATA.filmsSync` IS THE ADMIN'S AND NOBODY ELSE'S: `{ at, more, folder, found }`, the end of the last
   whole pass through the Notflix folder. Absent from every other payload, and absent from an older
   backend's — which is why its absence, and not the role, is what stops the card asking: a sync posted
   to a backend that has never heard of it would be a refusal on every visit.

   THE REPLY CARRIES THE LIST. `filmsSync` answers with the films as `doGet` builds them and the stamp
   beside them, so the card is current the moment it answers — no reload, and no rebuild of a payload
   that never held the films anyway (`payloadWithFresh_` in backend/doget.gs). A pass too big for one
   run answers `more`, and the card asks again, a few times, until the pass is whole.

   A REPLY FOR SOMEBODY WHO HAS GONE IS DROPPED. A sync takes seconds, and a shared iPad can be signed
   out and handed on in that time; films written into the next person's `DATA` would be the one thing
   `signedOut_` exists to prevent.
================================================================================================== */
const FILMS_STALE_MS = 24 * 60 * 60 * 1000;   // a day — `FILMS_SYNC_*` in backend/constants.gs says why
const FILMS_ROUNDS = 6;                        // a part-way pass is asked to go on at most this often
/* `autoFor` — whom the card has already synced for on its own this visit, so a sync that FAILS (no folder
   found, the backend not yet deployed) is said once in the admin's line and not posted again on every
   return to the column. `err` is that sentence, until a sync succeeds. */
const FILMSYNC = { asking: null, autoFor: '', err: '' };

function filmsSyncDue_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return false;
  const s = typeof DATA !== 'undefined' && DATA && DATA.filmsSync;
  if (!s || typeof s !== 'object' || FILMSYNC.asking) return false;
  const who = String((USER && (USER.personId || USER.name)) || '');
  if (FILMSYNC.autoFor === who) return false;
  const at = Date.parse(s.at || '');
  return !!s.more || !at || Date.now() - at > FILMS_STALE_MS;
}

function filmsSyncSaid_() {
  if (FILMSYNC.asking) return 'Syncing the films from Drive…';
  if (FILMSYNC.err) return 'Not synced — ' + FILMSYNC.err;
  const s = typeof DATA !== 'undefined' && DATA && DATA.filmsSync;
  if (!s || typeof s !== 'object') return 'Films from the Notflix folder in Drive';
  if (s.more) return 'Films part-synced from Drive';
  if (!s.at) return 'Films not synced from Drive yet';
  const f = s.found || {};
  const n = (Number(f.films) || 0) + (Number(f.series) || 0) + (Number(f.documentaries) || 0);
  return 'Films synced from Drive ' + ago(s.at) + (s.found ? ' · ' + n + ' in the folder' : '');
}

/* THE REPLY INTO `DATA`, and Find told: its lists are kept against `DATA` by identity, and this changes
   `DATA` in place. */
function filmsAdopt_(d) {
  if (!d || typeof DATA === 'undefined' || !DATA) return;
  if (Array.isArray(d.films)) DATA.films = d.films;
  if (d.sync && typeof d.sync === 'object') DATA.filmsSync = d.sync;
  if (typeof stuffForget_ === 'function') stuffForget_();
}

function filmsSyncRun_(byHand) {
  if (FILMSYNC.asking) return FILMSYNC.asking;
  const who = String((USER && (USER.personId || USER.name)) || '');
  const token = USER && USER.token;
  FILMSYNC.autoFor = who;
  const still = () => !!USER && USER.token === token;
  let rounds = 0;
  const once = () => send({ action: 'filmsSync', personId: (USER && USER.personId) || '' }).then(d => {
    if (!still()) return null;
    FILMSYNC.err = '';
    filmsAdopt_(d);
    if (d && d.more && ++rounds < FILMS_ROUNDS) { vidPaint_(); return once(); }
    return d;
  });
  /* ONLY ITS OWN `asking` IS CLEARED WHEN IT ENDS. `signedOut_` lets go of a sync in flight, so the next
     admin can start one of their own; this one ending later must not mark that one finished. */
  const mine = once()
    .then(d => { if (byHand && d) toast(d.message || 'Films synced.'); return d; },
          err => { if (still()) { FILMSYNC.err = why_(err); if (byHand) toast(FILMSYNC.err); } return null; })
    .then(d => { if (FILMSYNC.asking === mine) FILMSYNC.asking = null; vidPaint_(); return d; });
  FILMSYNC.asking = mine;
  vidPaint_();
  return mine;
}

/* THE TILE. Asked again here rather than trusted from the drawing — a tile is not a permission, and the
   backend asks a third time. */
on('vid-sync', () => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  filmsSyncRun_(true);
});

/* LEAVING THE COLUMN STOPS IT — the Reels column's lesson in note 047: a clip somebody turned the
   sound up on went on talking from a screen two swipes away. An iframe cannot be paused from here,
   so the player is emptied, and a tap on the row starts it again. */
function videosStop_() {
  VID.at = '';
  if (document.querySelector('.vid-box')) vidPaint_();
}

document.addEventListener('input', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('vid-q')) return;
  VID.q = String(el.value || '');
  vidPaint_('list');
});

on('vid-play', el => {
  VID.at = String(el.dataset.k || '');
  vidPaint_();
});

/* ---------- FULL SCREEN, AND THE IPHONE IS THE ONE THAT DOES IT DIFFERENTLY -------------------------
   `requestFullscreen` on the player itself, so what fills the screen is the picture and not the
   card with a search box round it. Older Safari wants `webkitRequestFullscreen`; Safari on an iPhone
   has no element full screen at all and offers ONLY `webkitEnterFullscreen`, which exists on a
   `<video>` and nowhere else — so a YouTube embed on an iPhone goes full screen from its own button
   in the player, and this says so rather than doing nothing. */
on('vid-full', el => {
  const box = el.closest('.vid-box');
  const p = box && box.querySelector('.vid-stage .vid-player');
  if (!p) { toast('Pick a video first.'); return; }
  const iphone = () => {
    if (p.webkitEnterFullscreen) { try { p.webkitEnterFullscreen(); return; } catch (e) {} }
    toast('Use the full screen button in the player.');
  };
  try {
    if (p.requestFullscreen) {
      const r = p.requestFullscreen();
      if (r && r.catch) r.catch(iphone);
      return;
    }
    if (p.webkitRequestFullscreen) { p.webkitRequestFullscreen(); return; }
  } catch (e) {}
  iphone();
});
