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

/* Everything that happens, keyed by day of the month. Built once per draw rather than searched
   per cell: forty-two cells against two lists is forty-two scans of them to shade six squares. */
function calendarMarks(y, m) {
  const out = {};
  const put = (d, mark) => { (out[d] = out[d] || []).push(mark); };

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

  return out;
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
    const kinds = uniq(on.map(x => x.kind));
    cells.push(`<span class="cal-d${isToday ? ' cal-today' : ''}${on.length ? ' has' : ''}"
        ${on.length ? `data-do="cal-day" data-d="${d}"` : ''}>${d}${
      kinds.length ? `<span class="cal-dots">${
        kinds.map(k => `<i class="dot ${k}"></i>`).join('')}</span>` : ''}</span>`);
  }
  host.innerHTML = cells.join('');
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
  const on = calendarMarks(calView().y, CAL_VIEW.m)[d] || [];
  openSheet(d + ' ' + MONTH_NAMES[CAL_VIEW.m], on.map(x => `
    ${/* NOT A LABEL AND A VALUE, which is why it is written out rather than built by `row`.
          The label carries a coloured dot and the value carries a second line naming whose exam it
          is — two pieces each, not one. A helper that took markup on both sides would be a helper
          that formats nothing, and every caller would be passing it the whole row anyway.
          Four shapes cover a sheet; the fifth is where a shared piece stops being shared. */''}
    <div class="row">
      <span class="k"><i class="dot ${x.kind}"></i> ${esc(
        x.kind === 'birthday' ? 'Birthday' : x.kind === 'mock' ? 'Mock' : 'Exam')}</span>
      <span class="v">${mark(x.label)}${x.who && x.kind !== 'birthday'
        ? `<br><span class="faint">${esc(x.who)}</span>` : ''}</span>
    </div>`).join(''));
});

function initChess() {
  if (!$('chess-board')) return;
  if (!CHESS) { CHESS = newGame(); CHESS_HIST = []; }
  drawChess();
}

function drawChess() {
  const el = $('chess-board');
  if (!el || !CHESS) return;
  const legal = CHESS_PICK >= 0
    ? legalMoves(CHESS).filter(m => m.from === CHESS_PICK).map(m => m.to)
    : [];
  el.innerHTML = CHESS.board.map((p, i) => {
    const dark = (file(i) + rank(i)) % 2 === 1;
    const cls = ['sq', dark ? 'dk' : 'lt'];
    if (i === CHESS_PICK) cls.push('pick');
    if (legal.includes(i)) cls.push(p === '_' ? 'can' : 'take');
    /* WHOSE PIECE IT IS, as a class. Uppercase is white in this file's board notation, and that
       is the only thing that decides its colour now — the glyph is the same either way. */
    if (p !== '_') cls.push(p === p.toUpperCase() ? 'wp' : 'bp');
    return `<span class="${cls.join(' ')}" data-sq="${i}">${p === '_' ? '' : GLYPH[p]}</span>`;
  }).join('');
  say();
}

/* `chessTap` was here — the tap handler for a board square, from before the board was drawn by
   `drawChess` and wired through `data-do`. Nothing has called it since. */


function say(msg) {
  const el = $('chess-say');
  if (!el) return;
  if (msg) { el.textContent = msg; return; }
  const end = outcome(CHESS);
  if (end === 'mate') {
    el.textContent = CHESS.turn === CH_WHITE ? 'Checkmate — the computer wins.' : 'Checkmate — you win.';
  } else if (end === 'stalemate') {
    el.textContent = 'Stalemate. Nobody wins.';
  } else if (inCheck(CHESS, CHESS.turn)) {
    el.textContent = CHESS.turn === CH_WHITE ? 'You are in check.' : 'Check.';
  } else {
    el.textContent = CHESS.turn === CH_WHITE ? 'Your move.' : 'Thinking…';
  }
}

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
  return [`hsl(${a} 42% 18%)`, `hsl(${b} 38% 9%)`, `hsl(${a} 60% 62%)`];
}

/* The card. The HEADING is the fact, so it takes the space; the body is why, so it is small. */
/* ---------- WHERE A CLIP IS ----------------------------------------------------------------------
   A `clip` IS A DRIVE FILE ID OR A WHOLE URL, and the difference is a slash. An id is what somebody
   copies out of the address bar of a file they have just uploaded; a URL is what a clip hosted
   anywhere else looks like. Anything with a slash in it is left exactly as typed, so this can never
   mangle an address it did not recognise — the `.xlsx` trap in `check-tabs.js` one column along.

   TWO ADDRESSES FOR ONE DRIVE FILE, AND THEY ARE NOT INTERCHANGEABLE. `uc?export=download` answers
   with the BYTES, which is what a `<video>` needs — it can be muted, autoplayed, paused when the
   slide leaves and sized to the column. `/preview` answers with an HTML PLAYER, which can only be
   an iframe: Google's own chrome, no autoplay, nothing this code can control. The first is the one
   worth having and it is also the one that is not documented, so `reelClip_` in posts.js uses it
   and falls back to the second the moment the browser says the video errored.

   NEITHER CAN BE TESTED FROM HERE. Every Google host is blocked from the agent's environment by
   network policy, so which of the two a real browser gets is a fact one open of the live site
   settles and nothing in this repository can. That is exactly why there are two. */
/* ---------- A LADDER, BECAUSE ONE ADDRESS WAS A GUESS AND THE PHONE SETTLED IT ------------------
   REPORTED WITH A SCREENSHOT OF THE LIVE SITE: the reel was playing inside GOOGLE'S OWN PLAYER —
   its scrubber, its 10-second skips, CC, 1x, an expand button and a black letterbox round the lot.
   That is the `error` fallback doing exactly what it was written to do, which means the FIRST
   address had failed on a real phone. Everything about the look and everything about "why does it
   not start by itself" follows from that one fact: an iframe from another origin cannot be styled,
   cannot be muted from here, and will not autoplay.

   `uc?export=download` IS THE OLD SPELLING. Google moved direct downloads to
   `drive.usercontent.google.com/download`, and the old address answers a redirect — or an HTML
   interstitial, which a `<video>` reports as an error because it is not a video. So the newer one
   is tried first and the old one second, which costs nothing when the first works.

   IT IS A LIST RATHER THAN A CHOICE, because **no version of this can be tested from here**: every
   Google host is blocked from this environment by network policy, which is why the wrong address
   shipped in the first place. A ladder is the shape that does not need me to be right — each rung
   is a real attempt, `error` moves to the next, and the iframe is the last one rather than the
   second. One open of the live site settles which rung wins, and nothing here has to guess.

   A FULL URL IS USED AS GIVEN AND IS THE REAL ANSWER. `clip` takes an address, so a file served
   from anywhere — including beside this site — is one rung with no fallbacks and no chrome. */
function clipSrcs_(clip) {
  const c = String(clip || '').trim();
  if (!c) return [];
  if (/[:/]/.test(c)) return [c];
  const id = encodeURIComponent(c);
  return [
    'https://drive.usercontent.google.com/download?id=' + id + '&export=download',
    'https://drive.google.com/uc?export=download&id=' + id,
  ];
}
/* ---------- THE IFRAME IS DRIVE'S PLAYER, SO IT ONLY EXISTS FOR A DRIVE ID -----------------------
   IT USED TO RETURN THE ADDRESS ITSELF, and for an address that is the same file through a worse
   door. The whole reason a `/preview` iframe is worth having is that it is a DIFFERENT SERVER doing
   a different thing — Drive hands `<video>` a redirect or an interstitial and hands its own player
   a stream. Nothing of the kind is true of a file beside this site: if the browser cannot play
   `data/reels/x.mp4` in a `<video>`, it cannot play it in an iframe either, because it is the same
   decoder on the same bytes. What the swap costs is real — Google's chrome, no autoplay, no mute,
   and the sound button removed on the way past.

   PROVED HERE RATHER THAN REASONED ABOUT, and the container is what made it testable. The Chromium
   in this environment is built WITHOUT the proprietary codecs — `canPlayType('video/mp4;
   codecs="avc1.42E01E"')` comes back empty — so a real H.264 clip errors for real, which is the one
   failure this repository could never previously reach. The column drew an iframe over a file that
   was there, 200 OK, serving ranges correctly.

   SO A DEAD LOCAL CLIP STAYS A `<video>`, and `.feed-vid` is transparent for exactly this: the
   slide underneath is `.feed-art`'s own gradient with the subject's initial on it, which is a
   finished thing rather than a hole. That is the sentence written over the transparency rule and
   over the photograph slide that waits for `img.onload`. */
function clipFrame_(clip) {
  const c = String(clip || '').trim();
  if (!c || /[:/]/.test(c)) return '';
  return 'https://drive.google.com/file/d/' + encodeURIComponent(c) + '/preview';
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
    return `<div class="feed-art is-clip" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
      <span class="feed-mark">${esc(initial(it.subject))}</span>
      <video class="feed-vid" data-clip="${esc(it.clip)}" playsinline muted loop preload="none"></video>
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

   THREE GAMES, ONE SHAPE. Each is a `WIDGETS` entry in map.js naming an `init` in here, drawn into
   an id the card already contains — the same arrangement Flabby Pird and Times Tables use, because
   a fourth way of starting a game is a fourth thing to remember when one of them stops working.

   NOTHING RUNS BETWEEN TURNS. No animation loop, no timer, no interval — the board is redrawn when
   somebody taps and sits still otherwise. That is why none of these three needs a `stop`, and it is
   worth saying out loud: `stop` exists for Flabby Pird because sixty frames a second behind a screen
   nobody is looking at is a flat battery. A board that only moves when tapped costs nothing parked.

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

function initConnect4() {
  const host = $('c4-board');
  if (!host) return;
  /* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS. Coming back to a board you left half-played
     sounds kind and is not: the widget is reopened by a swipe, so "where was I" would be answered
     by a game you had forgotten starting. */
  c4 = { cells: new Array(C4_W * C4_H).fill(0), turn: 1, over: false, said: 'Your go — tap a column.' };
  c4Paint();
}

const c4At = (x, y) => c4.cells[y * C4_W + x];

/* THE LOWEST EMPTY SQUARE IN A COLUMN, or -1 when it is full. Everything else asks this. */
function c4Drop_(cells, x) {
  for (let y = C4_H - 1; y >= 0; y--) if (!cells[y * C4_W + x]) return y;
  return -1;
}

/* FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter. Eight would be
   double-counting: a line and its reverse are the same line. */
function c4Wins_(cells, x, y, who) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  return dirs.some(([dx, dy]) => {
    let n = 1;
    for (const s of [1, -1]) {
      for (let i = 1; i < 4; i++) {
        const nx = x + dx * i * s, ny = y + dy * i * s;
        if (nx < 0 || nx >= C4_W || ny < 0 || ny >= C4_H) break;
        if (cells[ny * C4_W + nx] !== who) break;
        n++;
      }
    }
    return n >= 4;
  });
}

function c4Play_(x) {
  if (!c4 || c4.over) return;
  const y = c4Drop_(c4.cells, x);
  if (y < 0) return;                                  // full column: the tap does nothing, loudly
  c4.cells[y * C4_W + x] = c4.turn;
  if (c4Wins_(c4.cells, x, y, c4.turn)) {
    c4.over = true;
    c4.said = c4.turn === 1 ? 'You win.' : 'It wins. Again?';
  } else if (c4.cells.every(Boolean)) {
    c4.over = true; c4.said = 'Full board — a draw.';
  } else {
    c4.turn = c4.turn === 1 ? 2 : 1;
    c4.said = c4.turn === 1 ? 'Your go.' : 'Thinking…';
  }
}

/* THE THREE RULES, IN ORDER. Written as one loop over the legal columns rather than three passes,
   because three passes over the same seven columns is three places to get the bounds wrong. */
function c4Reply_() {
  if (!c4 || c4.over) return;
  const legal = [];
  for (let x = 0; x < C4_W; x++) if (c4Drop_(c4.cells, x) >= 0) legal.push(x);
  if (!legal.length) return;

  const findFor = who => legal.find(x => {
    const y = c4Drop_(c4.cells, x);
    const t = c4.cells.slice();
    t[y * C4_W + x] = who;
    return c4Wins_(t, x, y, who);
  });

  /* WIN, THEN BLOCK. In that order and not the other way round: a move that wins ends the game, so
     blocking first would decline a win to prevent a reply that never comes. */
  let pick = findFor(2);
  if (pick === undefined) pick = findFor(1);
  if (pick === undefined) {
    /* TOWARDS THE MIDDLE, because the centre column sits on more possible fours than any other. */
    pick = legal.slice().sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3))[0];
  }
  c4Play_(pick);
}

function c4Paint() {
  const host = $('c4-board');
  if (!host || !c4) return;
  let html = '';
  for (let y = 0; y < C4_H; y++) {
    for (let x = 0; x < C4_W; x++) {
      const v = c4At(x, y);
      /* THE WHOLE COLUMN IS ONE TARGET, so every square in it carries the same `data-x` and the
         same label. A screen reader hears "column 4" six times rather than 42 unnamed squares. */
      html += `<button class="c4-cell${v ? (v === 1 ? ' you' : ' them') : ''}" data-do="c4-drop"
        data-x="${x}" aria-label="Column ${x + 1}"${c4.over ? ' disabled' : ''}></button>`;
    }
  }
  host.innerHTML = html;
  const said = $('c4-said'); if (said) said.textContent = c4.said;
}

on('c4-drop', el => {
  const x = Number(el.getAttribute('data-x'));
  c4Play_(x);
  c4Paint();
  /* THE REPLY IS A BEAT LATER, so the disc you dropped is on screen before the answer lands. Played
     immediately, both discs appear in the same frame and it reads as one move. */
  if (!c4.over && c4.turn === 2) setTimeout(() => { c4Reply_(); c4Paint(); }, 260);
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

function initOthello() {
  if (!$('oth-board')) return;
  const cells = new Array(OTH_N * OTH_N).fill(0);
  const m = OTH_N / 2;
  cells[(m - 1) * OTH_N + (m - 1)] = 2; cells[(m - 1) * OTH_N + m] = 1;
  cells[m * OTH_N + (m - 1)] = 1;       cells[m * OTH_N + m] = 2;
  oth = { cells, turn: 1, over: false, said: 'Your go — black.' };
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
  if (othMoves_(oth.cells, other).length) { oth.turn = other; return; }
  if (othMoves_(oth.cells, oth.turn).length) {
    oth.said = (other === 1 ? 'You have' : 'It has') + ' no move — going again.';
    return;                                            // the same player goes again
  }
  oth.over = true;
  const [b, w] = othScore_(oth.cells);
  oth.said = b === w ? `Level, ${b}–${w}.` : b > w ? `You win, ${b}–${w}.` : `It wins, ${w}–${b}.`;
}

/* CORNERS FIRST, THEN THE BIGGEST FLIP. Greedy alone plays badly in Othello — the move that turns
   the most discs early is usually the one that hands over an edge — and a corner can never be
   flipped back, which is the one piece of strategy worth hard-coding. */
function othReply_() {
  if (!oth || oth.over) return;
  const moves = othMoves_(oth.cells, 2);
  if (!moves.length) { othAdvance_(); return; }
  const CORNERS = [0, OTH_N - 1, OTH_N * (OTH_N - 1), OTH_N * OTH_N - 1];
  const corner = moves.find(i => CORNERS.indexOf(i) !== -1);
  const pick = corner !== undefined
    ? corner
    : moves.slice().sort((a, b) => othFlips_(oth.cells, b, 2).length - othFlips_(oth.cells, a, 2).length)[0];
  othPlay_(pick, 2);
  othAdvance_();
  if (!oth.over && oth.turn === 2) { othReply_(); return; }   // it passed back to itself
  if (!oth.over) oth.said = 'Your go.';
}

function othPaint() {
  const host = $('oth-board');
  if (!host || !oth) return;
  const hints = oth.over || oth.turn !== 1 ? [] : othMoves_(oth.cells, 1);
  let html = '';
  for (let i = 0; i < oth.cells.length; i++) {
    const v = oth.cells[i];
    const can = hints.indexOf(i) !== -1;
    html += `<button class="oth-cell${v === 1 ? ' b' : v === 2 ? ' w' : ''}${can ? ' can' : ''}"
      data-do="oth-play" data-i="${i}" aria-label="Row ${((i / OTH_N) | 0) + 1} column ${(i % OTH_N) + 1}"
      ${can ? '' : 'disabled'}></button>`;
  }
  host.innerHTML = html;
  const [b, w] = othScore_(oth.cells);
  const sc = $('oth-score'); if (sc) sc.textContent = b + ' – ' + w;
  const said = $('oth-said'); if (said) said.textContent = oth.said;
}

on('oth-play', el => {
  if (!oth || oth.over || oth.turn !== 1) return;
  if (!othPlay_(Number(el.getAttribute('data-i')), 1)) return;
  othAdvance_();
  othPaint();
  if (!oth.over && oth.turn === 2) setTimeout(() => { othReply_(); othPaint(); }, 300);
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
   it runs out — which with a hundred questions is a thing nobody reaches in a lesson. The shuffle
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
  /* RESHUFFLED WHEN IT RUNS OUT, silently. Nothing says so, because nothing needs to: a hundred
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

function initMaze() {
  if (!$('maze-grid')) return;
  /* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS, for the reason `initConnect4` gives: the
     widget is reopened by a swipe, so a half-walked maze would be answering "where was I" about a
     game you had forgotten starting. */
  const cells = mzBuild_();
  /* NOTHING SAID AT THE START, because the line under the heading already says where you are going
     and this sat under it repeating it word for word -- which is the fault CLAUDE.md records where
     every widget printed its own name twice. It speaks when there is something to say. */
  maze = { cells, x: 0, y: 0, moves: 0, best: mzShortest_(cells),
           trail: { 0: true }, over: false, said: '' };
  mazePaint();
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
      const cls = ['mz-cell'];
      if (v & MZ_N) cls.push('wn');
      if (v & MZ_E) cls.push('we');
      if (v & MZ_S) cls.push('ws');
      if (v & MZ_W) cls.push('ww');
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
on('maze-again', () => { initMaze(); });

/* THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU. Guarded on the element
   existing the way Flabby Pird's is, and on the press not being inside a field — arrows in a
   textarea move the caret, and a game stealing that would break typing on a screen it is not even
   on. `preventDefault` only once a move was possible, so an arrow that does nothing here still does
   whatever it would have done. */
document.addEventListener('keydown', e => {
  if (!maze || !$('maze-grid')) return;
  if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
  const k = { ArrowUp: 'n', ArrowRight: 'e', ArrowDown: 's', ArrowLeft: 'w' }[e.key];
  if (!k) return;
  e.preventDefault();
  mzMove_(k);
  mazePaint();
});

/* ==================================================================================================
   ARTICULATE — describe it without saying it.

   ASKED FOR AS "can we add articulate to the games widgets". The board game: you land on a
   category, and for thirty seconds you describe as many of its words as you can without saying the
   word, a word that rhymes with it, or its initials. Your team guesses. Got it, or pass.

   THE SPINNER IS THE ONE PIECE THAT DOES NOT SURVIVE. On the board the category is decided by where
   your counter lands, which is a fact about a board this app does not have — so the category is
   chosen, which is the same decision one step earlier and is also the screen this widget needs
   anyway: six buttons is a first page that explains the game without a paragraph.

   THIRTY SECONDS, WHICH IS THE GAME'S OWN NUMBER, and the reason the deck is only about twenty
   words a category: nobody gets through twenty in thirty seconds, so a round never repeats a word
   and the list does not have to be huge to behave as though it were.

   NO SCORE IS KEPT BETWEEN ROUNDS. Articulate is scored by moving a counter, which is a thing the
   people playing do; an app that remembered it would be keeping half a game and inviting somebody
   to look for the other half. The round's own count is on screen while it matters and gone after.
================================================================================================== */
const ART_DECK = {
  Object: ['umbrella', 'kettle', 'stapler', 'ladder', 'trampoline', 'harmonica', 'wheelbarrow',
           'telescope', 'zip', 'hoover', 'candle', 'passport', 'skateboard', 'saucepan',
           'toothbrush', 'seatbelt', 'chandelier', 'padlock', 'compass', 'radiator'],
  Nature: ['avalanche', 'hedgehog', 'thunderstorm', 'coral reef', 'acorn', 'glacier', 'moth',
           'quicksand', 'rainbow', 'beaver', 'tide', 'fossil', 'cactus', 'eclipse', 'swamp',
           'pollen', 'volcano', 'otter', 'frost', 'mushroom'],
  Action: ['juggling', 'whispering', 'sneezing', 'hitchhiking', 'tiptoeing', 'yawning',
           'hibernating', 'shrugging', 'wrestling', 'queueing', 'gargling', 'skimming a stone',
           'blushing', 'haggling', 'eavesdropping', 'sprinting', 'knitting', 'shivering',
           'applauding', 'daydreaming'],
  World: ['Iceland', 'the Sahara', 'Mount Everest', 'the Amazon', 'Venice', 'the Great Wall',
          'Antarctica', 'Tokyo', 'the Nile', 'Stonehenge', 'the Alps', 'Cairo', 'New Zealand',
          'the Panama Canal', 'Lisbon', 'the Dead Sea', 'Kenya', 'Niagara Falls', 'Sicily',
          'the Arctic Circle'],
  Person: ['a lifeguard', 'a blacksmith', 'a referee', 'an astronaut', 'a plumber', 'a busker',
           'a detective', 'a midwife', 'a lighthouse keeper', 'a beekeeper', 'a paramedic',
           'a librarian', 'a sculptor', 'a chimney sweep', 'a surgeon', 'a tour guide',
           'a lollipop lady', 'an archaeologist', 'a barista', 'a train driver'],
  Random: ['jet lag', 'a leap year', 'homesickness', 'a power cut', 'déjà vu', 'the alphabet',
           'a rumour', 'a traffic jam', 'small talk', 'a nickname', 'bad luck', 'an alibi',
           'a bargain', 'a heatwave', 'stage fright', 'a countdown', 'an echo', 'a punchline',
           'a shortcut', 'a coincidence'],
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
  Film:   ['Jurassic Park', 'Finding Nemo', 'Toy Story', 'Paddington', 'The Lion King',
           'Frozen', 'Harry Potter', 'Jaws'],
  TV:     ['Bake Off', 'Doctor Who', 'Strictly Come Dancing', 'Blue Peter', 'Top Gear',
           'Only Fools and Horses', 'Match of the Day', 'Countdown'],
  Book:   ['Matilda', 'The Gruffalo', 'Harry Potter', 'Treasure Island', 'Oliver Twist',
           'The Hobbit', 'Charlotte\'s Web', 'Robinson Crusoe'],
  Song:   ['Happy Birthday', 'Twinkle Twinkle Little Star', 'YMCA', 'Sweet Caroline',
           'We Will Rock You', 'Jingle Bells', 'Row Row Row Your Boat', 'The Hokey Cokey'],
  Action: ['building a flat-pack wardrobe', 'walking a dog that will not walk',
           'carrying too many shopping bags', 'putting up a tent in the wind',
           'trying to open a jar', 'wrapping an awkward present',
           'getting chewing gum off a shoe', 'parallel parking'],
};

/* ==================================================================================================
   ONE ROUND, TWO GAMES.

   `secs` IS THE ONLY NUMBER, `deck` IS THE ONLY CONTENT and `say` IS THE ONLY SENTENCE that differ.
   Everything else — dealing without repeats, the clock, the count, the three states the card can be
   in — is written once. A third game of this shape is a row here.

   THE DECK IS A FUNCTION rather than the object, so a deck replaced at runtime is read rather than
   captured. Same reason `factsNow_` is a call and not a constant. */
const ROUND_GAMES = {
  art: { secs: 30, deck: () => ART_DECK, name: 'Articulate',
         say: 'Describe it. Not the word, not a rhyme, not the initials.' },
  cha: { secs: 60, deck: () => CHA_DECK, name: 'Charades',
         say: 'Act it out. No words, no sounds, no pointing.' },
};

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
    if (left) left.textContent = String(g.secs);
    if (got) got.textContent = '0';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-cat-of">${esc(s.cat)}</p>`;
    if (said) said.textContent = 'Start again for another.';
    if (left) left.textContent = '0';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
    <p class="art-word">${esc(s.word || '')}</p>`;
  if (said) said.textContent = g.say;
  if (left) left.textContent = String(s.left);
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
