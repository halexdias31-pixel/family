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
        let t = expr.replace(/π/g, 'pi');
        // degree trig
        t = t.replace(/\b(sin|cos|tan)\(/g, '$1(DEG*');
        let result;
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

function chessTap(sq) {
  if (!CHESS || CHESS_BUSY || CHESS.turn !== CH_WHITE || outcome(CHESS)) return;

  // Tapping one of your own pieces always selects it — which is what a player expects when they
  // change their mind mid-move, rather than the tap being read as an illegal destination.
  if (colourOf(CHESS.board[sq]) === CH_WHITE) {
    CHESS_PICK = CHESS_PICK === sq ? -1 : sq;
    drawChess();
    return;
  }
  if (CHESS_PICK < 0) return;

  const moves = legalMoves(CHESS).filter(m => m.from === CHESS_PICK && m.to === sq);
  if (!moves.length) { CHESS_PICK = -1; drawChess(); return; }

  // A promoting pawn offers four moves to the same square. Ask, rather than assuming a queen —
  // a rook is the right answer often enough to matter, and always queening is how a player loses
  // to stalemate they did not intend.
  let move = moves[0];
  if (moves.length > 1 && moves[0].promote) {
    const want = (prompt('Promote to Q, R, B or N?', 'Q') || 'Q').toUpperCase();
    move = moves.find(m => m.promote === want) || moves[0];
  }

  CHESS_HIST.push(CHESS);
  CHESS = play(CHESS, move);
  CHESS_PICK = -1;
  drawChess();

  if (outcome(CHESS)) return;

  /* The engine thinks on a timeout so the board repaints first — otherwise the browser shows your
     move and its reply in the same frame, and it looks as though nothing happened. */
  CHESS_BUSY = true;
  say('Thinking…');
  setTimeout(() => {
    /* ONE STRENGTH. There was a menu under the board offering Gentle, Steady and Tough — three
       decisions to take before a first move, on a widget somebody opened to play chess. Steady is
       what it always defaulted to and what almost nobody changed. */
    const depth = 2;
    const reply = bestMove(CHESS, depth);
    if (reply) { CHESS_HIST.push(CHESS); CHESS = play(CHESS, reply); }
    CHESS_BUSY = false;
    drawChess();
  }, 60);
}

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
function feedSlide(it) {
  const c = feedColours(it.subject);
  return `<div class="feed-art" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
    <span class="feed-mark">${esc(initial(it.subject))}</span>
    ${/* WHO THE PICTURE BELONGS TO. Empty until one arrives, and it has to be there from the
          start rather than added later — an element appearing under a photograph shifts the card
          the moment somebody starts reading it. */''}
    <span class="feed-credit"></span>
    <div class="feed-text">
      <span class="feed-subject">${esc(it.subject)}</span>
      <h3 class="feed-head">${esc(it.heading)}</h3>
      <p class="feed-body">${esc(it.body)}</p>
    </div>
  </div>`;
}