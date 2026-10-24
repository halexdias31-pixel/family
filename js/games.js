/* @family. — games.js ONE FILE, SPLIT. § */


/* ---------- TIMES TABLES SPRINT § */
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

  /* Checked on every keystroke, with no Enter to press. § */
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
/* The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle state — and a clock left running behind a screen that no longer has § */
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

  /* Kept only if it beats the old one, and only for somebody signed in. § */
  if (USER && score > (Number(USER.ttHighscore) || 0)) {
    const was = Number(USER.ttHighscore) || 0;
    USER.ttHighscore = score;
    api({ action: 'saveTtHighscore',
      name: USER.name, personId: USER.personId, score })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        if (typeof d.best === 'number') USER.ttHighscore = d.best;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        /* ---------- AND THE ROW THE BOARD READS, WHICH THIS NEVER TOUCHED § */
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

/* ---------- WHAT THE DISPLAY SAYS, TURNED BACK INTO ARITHMETIC § */
const calcNormalise_ = t => String(t || '')
  .replace(/\u00d7/g, '*')
  .replace(/\u00f7/g, '/')
  .replace(/\u2212/g, '-')
  .replace(/\u03c0/g, 'pi');

function initMiniCalc() {
  const disp = $('mc-display');
  if (!disp) return;

  /* THE STATE. `at` is where the caret sits — an index BETWEEN characters, so 0 is before the first and expr.length is after the last. § */
  let expr = '', at = 0;
  /* Every finished sum, oldest first, and where we are in it. § */
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
        /* ---------- THE BRACKET THE KEY OPENED, CLOSED FOR YOU § */
        const open = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
        if (open > 0) t += ')'.repeat(open);
        // degree trig
        t = t.replace(/\b(sin|cos|tan)\(/g, '$1(DEG*');
        let result;
        /* `window.math` IS NEVER LOADED BY ANYTHING HERE, measured across index.html and every file in `js/` -- so the branch below has never run and the fallback is § */
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
    /* AFTER AN ANSWER: a digit starts a new sum, an operator continues from the answer. § */
    if (fresh) {
      if (/^[0-9.]$/.test(v)) { expr = ''; at = 0; }
      fresh = false;
    }
    put(v);
    render();
  };

  render();
}

/* ---------- THE TIMER § */

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

/* ---------- THE CALENDAR § */
/* `MONTHS` was a second copy of the twelve month names, identical to `MONTH_NAMES` in data.js.
   Two lists of the same twelve words is two places to fix a typo and one of them will be missed. */

/* ---------- EVERY DATE THE APP KNOWS, NOT TWO KINDS OF IT § */
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

  /* THE TERMS. A term is two dates that matter — it starts, it ends — and a dot on every weekday of it would cover the month; a half term is a week off and every § */
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
  /* ---------- AND UNTIL THE PAYLOAD IS IN, THE MONTH IS WAITING, NOT EMPTY § */
  if (typeof awaiting_ === 'function' && awaiting_()) {
    host.setAttribute('aria-busy', 'true');
    host.insertAdjacentHTML('beforeend', loading_());
  } else {
    host.removeAttribute('aria-busy');
  }
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

/* CAL_VIEW is filled by initCalendar, which `wake` runs before the screen can be touched — so this cannot be null in practice. § */
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
    ${/* NOT A LABEL AND A VALUE, which is why it is written out rather than built by `row`. § */
          ''}
    <div class="row">
      <span class="k"><i class="dot ${x.kind}"></i> ${esc(calKindSaid_(x.kind))}</span>
      <span class="v">${mark(x.label)}${x.who && x.kind !== 'birthday'
        ? `<br><span class="faint">${esc(x.who)}</span>` : ''}</span>
    </div>`).join(''));
});

/* ---------- CHESS, TWO PLAYERS ROUND ONE PHONE § */
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

/* THE GAME IS OVER, and why. § */
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
  /* PROMOTION IS ASKED, NOT ASSUMED. § */
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

/* A TAP. Three things it can mean and they are tried in the order a player means them: § */
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

/* UNDO takes back one move, either side's — two people at one board agree on that out loud, and an app that refused it would be stricter than the table. § */
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


/* ---------- THE REELS § */

/* A colour from a string. § */
function feedColours(seed) {
  const h = hashOf(String(seed || '?'));
  const a = h % 360;
  const b = (a + 25 + (h >> 9) % 40) % 360;
  /* THE THIRD COLOUR IS TEXT — the subject's label — so its lightness is chosen against the card's lightest stop for EVERY hue, not by eye on one. § */
  return [`hsl(${a} 42% 18%)`, `hsl(${b} 38% 9%)`, `hsl(${a} 60% 70%)`];
}

/* The card. The HEADING is the fact, so it takes the space; the body is why, so it is small. */
/* ---------- WHERE A CLIP IS, AND THE TWO KINDS THERE ARE § */
const CLIP_EMBED_ONLY = /(?:^|\/\/)(?:[a-z0-9-]+\.)*(?:instagram\.com|drive\.google\.com|docs\.google\.com)\//i;
const CLIP_YT_HOST = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:youtube\.com|youtube-nocookie\.com|youtu\.be)(?:[\/?#]|$)/i;
function clipPlayable_(clip) {
  const c = String(clip || '').trim();
  if (!c || CLIP_EMBED_ONLY.test(c)) return false;
  if (clipYt_(c)) return true;
  if (CLIP_YT_HOST.test(c)) return false;
  /* A SCHEME MEANS A WHOLE ADDRESS, and only http(s) is a file a browser will fetch into a `<video>`. § */
  if (/^[a-z][a-z0-9+.-]*:/i.test(c)) return /^https?:\/\//i.test(c);
  return c.indexOf('/') !== -1;
}
/* THE YOUTUBE ID A CLIP NAMES, or '' for a file. One question asked by `feedSlide`, `clipSrc_` and
   `clipPlayable_`, so the three cannot disagree about which kind a row is. */
function clipYt_(clip) {
  return typeof vidYouTubeId_ === 'function' ? vidYouTubeId_(clip) : '';
}
/* A FILE'S ADDRESS, FOR A `<video>`. § */
function clipSrc_(clip) {
  return clipPlayable_(clip) && !clipYt_(clip) ? String(clip).trim() : '';
}
function feedSlide(it) {
  const c = feedColours(it.subject);
  /* A SLIDE WITH NO WORDS DRAWS NO WORDS. § */
  const words = (it.heading || it.body) ? `<div class="feed-text">
      <span class="feed-subject">${esc(it.subject)}</span>
      ${it.heading ? `<h3 class="feed-head">${esc(it.heading)}</h3>` : ''}
      ${it.body ? `<p class="feed-body">${esc(it.body)}</p>` : ''}
    </div>` : '';

  /* `has-photo` WHEN THERE ARE FRAMES, NOT WHEN THERE IS AN ELEMENT. § */
  if (it.clip) {
    /* A SHORT IS ITS OWN SLIDE — a poster and a place for a player, never a `<video>`. */
    const yt = clipYt_(it.clip);
    if (yt) return feedYtSlide_(it, yt, c, words);
    /* ---------- THE FIRST FRAME ARRIVES FIRST, AND THAT IS MOST OF "IT TAKES LONG TO LOAD" § */
    const poster = /^[a-z]+:/i.test(it.clip) || it.clip.indexOf('/') < 0
      ? '' : String(it.clip).replace(/\.[a-z0-9]+$/i, '') + '.jpg';
    /* `has-photo` FROM THE FIRST PAINT WHERE THERE IS A POSTER, and only there. § */
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

/* ---------- A YOUTUBE SHORT'S SLIDE: ITS OWN PICTURE FIRST, THE PLAYER WHEN IT IS REACHED § */
const YT_POSTERS = ['oar2.jpg', 'hqdefault.jpg', 'mqdefault.jpg'];
const ytPoster_ = (id, n) => 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/' + YT_POSTERS[n];
function feedYtSlide_(it, id, c, words) {
  const out = /\/shorts\//i.test(it.clip) ? 'https://www.youtube.com/shorts/' + id
    : 'https://www.youtube.com/watch?v=' + id;
  return `<div class="feed-art is-clip is-yt has-photo" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
      <span class="feed-mark">${esc(initial(it.subject))}</span>
      <img class="feed-poster" src="${esc(ytPoster_(id, 0))}" data-yt="${esc(id)}" data-rung="0"
           alt="" referrerpolicy="no-referrer" decoding="async">
      <div class="feed-yt" data-yt="${esc(id)}"><span class="feed-yt-veil"></span></div>
      <a class="feed-yt-out" href="${esc(out)}" target="_blank" rel="noopener">Watch on YouTube</a>
      <span class="feed-credit"></span>
      ${words}
    </div>`;
}
/* THE NEXT RUNG, OR NONE. § */
function feedPosterNext_(img) {
  const n = Number(img.dataset.rung || 0) + 1;
  if (n < YT_POSTERS.length && img.dataset.yt) {
    img.dataset.rung = String(n);
    img.src = ytPoster_(img.dataset.yt, n);
    return;
  }
  const art = img.closest('.feed-art');
  img.remove();
  if (art && !art.querySelector('.feed-yt.is-live')) art.classList.remove('has-photo');
}
document.addEventListener('error', e => {
  const el = e.target;
  if (el && el.matches && el.matches('img.feed-poster')) feedPosterNext_(el);
}, true);
document.addEventListener('load', e => {
  const el = e.target;
  if (el && el.matches && el.matches('img.feed-poster') && el.naturalWidth > 0 && el.naturalWidth <= 120)
    feedPosterNext_(el);
}, true);
/* CONNECT 4, OTHELLO AND HERD MENTALITY THREE GAMES, ONE SHAPE. § */

/* ---------- CONNECT 4 § */
const C4_W = 7, C4_H = 6;
let c4 = null;

/* THE TWO SIDES, NAMED ONCE. § */
const C4_NAME = { 1: 'Red', 2: 'Yellow' };

function initConnect4() {
  const host = $('c4-board');
  if (!host) return;
  /* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS. § */
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

/* FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter. § */
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

/* ---------- `c4Reply_` WAS HERE, AND IT WAS THE OPPONENT § */

/* ---------- THE COUNTER FALLS, AND THE FOUR THAT WON ARE RINGED § */
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

/* ---------- OTHELLO § */
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

/* ---------- `othReply_` WAS HERE, AND SO WERE THE RINGS § */

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

/* ---------- HERD MENTALITY § */
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

  /* ---------- AND EIGHTY MORE, SO THE DECK IS A HUNDRED — AND FOUR HUNDRED MORE AT THE FOOT -- § */
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

/* FISHER–YATES, NOT `sort(() => Math.random() - 0.5)`. § */
function herdShuffle_(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function herdPack_() {
  /* THE SHEET FIRST, AND ONLY IF IT SAYS ANYTHING. § */
  const rows = ((typeof DATA !== 'undefined' && DATA.herd) || [])
    .filter(r => r && r.active !== false && String(r.question || '').trim())
    .map(r => String(r.question).trim());
  return rows.length ? rows : HERD_BUILTIN;
}

/* ---------- THERE IS NO ROUND, AND THERE NEVER SHOULD HAVE BEEN ONE § */
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

/* ---------- MAZE § */
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

/* ---------- A MAZE IS KEPT UNTIL IT IS FINISHED, OR UNTIL `New maze` § */
function initMaze() {
  if (!$('maze-grid')) return;
  if (!maze || maze.over) mzDeal_();
  mazePaint();
}

function mzDeal_() {
  const cells = mzBuild_();
  /* NOTHING SAID AT THE START, because the line under the heading already says where you are going and this sat under it repeating it word for word -- which is the § */
  maze = { cells, x: 0, y: 0, moves: 0, best: mzShortest_(cells),
           trail: { 0: true }, over: false, said: '' };
}

function mzMove_(k) {
  if (!maze || maze.over) return;
  const d = MZ_DIRS[k];
  if (!d) return;
  /* A WALL STOPS YOU AND SAYS NOTHING. § */
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
      /* THE WALLS ARE `mz-n`/`mz-e`/`mz-s`/`mz-w`, AND THEY WERE `wn`/`we`/`ws`/`ww`. § */
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
  /* NOT A LIST OF 121 SQUARES TO A SCREEN READER. § */
  host.innerHTML = html;
  host.setAttribute('aria-label',
    'Maze, row ' + (maze.y + 1) + ' of ' + MAZE_N + ', column ' + (maze.x + 1) + ' of ' + MAZE_N
    + (maze.over ? ', out' : ''));
  const said = $('maze-said'); if (said) said.textContent = maze.said;
  const n = $('maze-moves'); if (n) n.textContent = String(maze.moves);
}

on('maze-go', el => { mzMove_(el.getAttribute('data-d')); mazePaint(); });
on('maze-again', () => { mzDeal_(); mazePaint(); });

/* THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU. § */
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

/* SENTENCE SCRAMBLE — the words of one sentence, cut up and shuffled; tap them back into order. § */
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
    /* NO CHIPS ONCE IT IS RIGHT. § */
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
/* NEXT AND SKIP ARE THE SAME DEAL WITH DIFFERENT WORDS ON THEM: § */
on('ss-next', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-new', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-level', el => {
  const b = SS_SENTENCES[el.value] ? el.value : 'KS2';
  ssBand_(b);
  ssDeal_(b);
  ssPaint();
});

/* WORD SEARCH — a grid of letters with a list of words hidden in it. § */
const WS_DIRS = { e: [1, 0], s: [0, 1], se: [1, 1], ne: [1, -1],
                  w: [-1, 0], n: [0, -1], nw: [-1, -1], sw: [-1, 1] };
const WS_FORWARD = ['e', 's', 'se'];

/* EVERY THEME SAYS ITS OWN SIZE, HOW MANY WORDS, AND WHETHER THEY ONLY READ FORWARDS, because "for younger" is a fact about the theme rather than a second § */
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

/* A COPY OF `HANDLE_BLOCKED` FROM backend/constants.gs, and `check-widgets.js` fails if the two differ. § */
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

/* ONE PUZZLE. Longest words first, because they are the hard ones to fit and a short word fits in whatever is left. § */
function wsBuild_(theme) {
  const size = theme.size, dirs = theme.young ? WS_FORWARD : Object.keys(WS_DIRS);
  const words = theme.words.filter(w => { const k = wsKey_(w); return k.length >= 3 && k.length <= size; });
  for (let attempt = 0; attempt < 60; attempt++) {
    const grid = new Array(size * size).fill('');
    const placed = [];
    /* THE DEAL IS THE FIRST `n` OF A SHUFFLE, AND ONLY THE DEAL IS PLACED LONGEST-FIRST. § */
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

/* ARTICULATE — describe it without saying it. § */
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

/* CHARADES — the same round, mimed instead of described. § */
const CHA_DECK = {
  /* THIRTY EACH ONCE (four hundred more were added later, plus `Animal` and `Sport`, which are things a body can SHOW), AND `Action` IS THE ONE THAT HAD TO BE § */
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

/* ONE ROUND, TWO GAMES. § */
/* NINETY AND A HUNDRED AND EIGHTY, ASKED FOR IN THOSE WORDS: § */
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
  /* THE CATEGORY IS CHOSEN FOR YOU, and that is the change the owner asked for: § */
  const deck = ROUND_GAMES[k].deck();
  const cats = Object.keys(deck);
  return cats[Math.floor(Math.random() * cats.length)];
}

function roundStop_(k) {
  const s = roundAt[k];
  if (s && s.timer) { clearInterval(s.timer); s.timer = 0; }
}

/* DRAWN FROM THE STATE, never patched by the handler that changed it — the `REEL_HELD` rule. § */
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
  /* DEALT FROM A SHUFFLED PILE, refilled when it empties, so one round cannot show a word twice — which is the whole reason a category does not have to be enormous § */
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

/* IMPOSTER — three or more people, one phone, one word that everybody knows but one of them. § */
const IMP_MIN = 3, IMP_MAX = 12;

/* A CARD IS WHAT ITS PICTURE SHOWS — A THING, A FACE, A GESTURE OR A SIGN — AND NEVER AN IDEA. § */
const IMP_DECK = {
  Food: { sym: '😋', cards: [
    '🍕 pizza', '🍔 burger', '🍟 chips', '🥪 sandwich', '🍝 spaghetti', '🌭 hot dog', '🍲 soup',
    '🍛 curry', '🍣 sushi', '🌮 tacos', '🍜 noodles', '🍚 rice', '🥟 dumplings', '🥧 pie',
    '🍗 chicken leg', '🍳 fried egg', '🌯 burrito', '🥙 kebab', '🥩 steak', '🍫 chocolate', '🍬 sweets',
    '🍭 lollipop', '🍪 cookie', '🧁 cupcake', '🍩 doughnut', '🍿 popcorn', '🍰 cake', '🧇 waffle',
    '🥞 pancakes', '🧆 falafel',
  ] },
  'Fruit and veg': { sym: '🥗', cards: [
    '🍎 apple', '🍌 banana', '🍊 orange', '🍓 strawberry', '🍇 grapes', '🥕 carrot',
    '🍉 watermelon', '🍍 pineapple', '🍅 tomato', '🥒 cucumber', '🍐 pear', '🍋 lemon', '🍒 cherry',
    '🥦 broccoli', '🌽 sweetcorn', '🥔 potato', '🥭 mango', '🍑 peach', '🥝 kiwi', '🥥 coconut',
    '🥬 lettuce', '🧅 onion', '🍄 mushroom', '🥑 avocado', '🌶️ chilli', '🍈 melon', '🧄 garlic',
    '🥜 peanuts', '🍠 sweet potato', '🍆 aubergine',
  ] },
  'In the kitchen': { sym: '🥘', cards: [
    '🍽️ plate', '🥣 bowl', '🥄 spoon', '🍴 cutlery', '🔪 knife', '🥢 chopsticks',
    '🥓 bacon', '☕ cup', '🥛 milk', '🥚 egg', '🧀 cheese', '🍞 bread', '🧈 butter', '🧂 salt',
    '🥫 tin', '🍯 honey', '🧊 ice cube', '🧃 juice box', '🍼 baby bottle', '🧽 sponge', '🚰 tap',
    '⏲️ timer', '🧯 fire extinguisher', '🥤 fizzy drink', '🥡 takeaway', '🥐 croissant', '🥯 bagel',
    '🥖 baguette', '🥨 pretzel', '🗑️ bin',
  ] },
  'At home': { sym: '🏠', cards: [
    '🛏️ bed', '🛋️ sofa', '🛁 bath', '📺 television', '🚪 door', '🪑 chair', '🚽 toilet', '🔑 key',
    '🧼 soap', '🧶 wool', '⏰ alarm clock', '🚿 shower', '🧻 toilet roll', '☎️ telephone',
    '⌨️ keyboard', '💻 laptop', '🖼️ picture', '✉️ letter', '📰 newspaper', '🧳 suitcase',
    '🪒 razor', '🕰️ clock', '💳 credit card', '🖨️ printer', '📦 parcel', '📱 mobile phone',
    '🧺 basket', '🖥️ computer', '📷 camera', '👪 family',
  ] },
  Toolbox: { sym: '🧰', cards: [
    '🔨 hammer', '🔧 spanner', '🔦 torch', '🔋 batteries', '💡 light bulb', '🔒 padlock',
    '🧱 brick', '🪓 axe', '🔍 magnifying glass', '⛓️ chain', '🔩 nuts and bolts', '⛏️ pickaxe',
    '🏗️ crane', '🥽 safety goggles', '🦺 hi-vis vest', '🚧 roadworks', '⚙️ cog', '🗜️ clamp',
    '🛢️ barrel', '🧲 magnet', '🔌 plug', '📌 drawing pin', '🧷 safety pin', '⚖️ scales',
    '⛑️ helmet', '📏 ruler', '✂️ scissors', '🖌️ paintbrush', '⏱️ stopwatch', '🧭 compass',
  ] },
  Clothes: { sym: '👚', cards: [
    '🧦 socks', '🧕 headscarf', '👖 jeans', '👗 dress', '🩳 shorts', '🧥 coat', '👢 boots',
    '👟 trainers', '👞 shoes', '🧣 scarf', '🧤 gloves', '🧢 cap', '🕶️ sunglasses', '👓 glasses',
    '🩱 swimming costume', '🩲 pants', '👔 tie', '👠 high heels', '⌚ watch', '💍 ring',
    '👜 handbag', '👛 purse', '🎩 top hat', '👘 kimono', '🥻 sari', '👳 turban', '🥾 walking boots',
    '🎽 vest', '🥼 lab coat', '🎀 bow',
  ] },
  'The body': { sym: '🧍', cards: [
    '👃 nose', '👁️ eye', '👂 ear', '👄 mouth', '👅 tongue', '🦷 tooth', '🧠 brain', '🦴 bone',
    '💀 skull', '🦵 leg', '🦶 foot', '👣 footprints', '✋ hand', '😷 face mask', '☝️ finger', '✊ fist',
    '💪 muscles', '💅 nails', '❤️ heart', '🩸 blood', '🧔 beard', '👩‍🦱 curly hair',
    '👩‍🦰 red hair', '👨‍🦲 bald head', '🩹 plaster', '💉 injection', '🦠 germs', '💊 medicine',
    '🩺 stethoscope', '🦻 hearing aid',
  ] },
  Feelings: { sym: '🎭', cards: [
    '😀 happy', '😢 sad', '😭 crying', '😂 laughing', '😠 angry', '😨 scared', '😱 screaming',
    '😮 surprised', '😴 asleep', '🤢 sick', '🤒 poorly', '🤕 hurt', '🥵 hot', '🥶 cold', '😵 dizzy',
    '😍 in love', '😎 cool', '🤪 silly', '🤔 thinking', '😟 worried', '😳 embarrassed',
    '🤩 excited', '😒 grumpy', '😑 bored', '😬 nervous', '😜 cheeky', '🤧 sneezing', '🥱 yawning',
    '🤫 quiet', '🤨 suspicious',
  ] },
  Actions: { sym: '🚶', cards: [
    '🏃 running', '🛌 sleeping', '🛀 having a bath', '👋 waving', '✍️ writing',
    '🤳 taking a selfie', '🤗 hugging', '🤷 shrugging', '🤦 facepalm', '🙇 bowing', '🧎 kneeling',
    '👉 pointing', '👊 fist bump', '🙌 cheering', '🤞 fingers crossed', '👌 OK sign',
    '✌️ peace sign', '👎 thumbs down', '🗣️ talking', '💆 massage', '🙏 praying',
    '😘 blowing a kiss', '🧘 yoga', '🤝 shaking hands', '🙅 saying no', '💇 getting a haircut',
    '👍 thumbs up', '⛹️ bouncing a ball', '😉 winking', '👏 clapping',
  ] },
  People: { sym: '👥', cards: [
    '👩‍🏫 teacher', '👨‍⚕️ doctor', '👩‍🚒 firefighter', '👮 police officer', '👨‍🌾 farmer',
    '👩‍🍳 chef', '👨‍✈️ pilot', '👷 builder', '👩‍🔬 scientist', '👨‍🎨 artist', '👩‍🔧 mechanic',
    '🕵️ detective', '👨‍⚖️ judge', '👨‍💼 office worker', '👩‍💻 computer programmer', '👩‍🏭 welder',
    '💂 soldier', '🤡 clown', '🤠 cowboy', '🤹 juggler', '🏇 jockey', '👨 man', '👨‍🎤 rock star',
    '👶 baby', '👦 boy', '👧 girl', '👵 grandma', '👴 grandad', '👩‍🎓 student', '🤰 pregnant woman',
  ] },
  'Wild animals': { sym: '🐯', cards: [
    '🐘 elephant', '🦁 lion', '🐒 monkey', '🦒 giraffe', '🦧 orangutan', '🦓 zebra', '🐼 panda',
    '🦘 kangaroo', '🐊 crocodile', '🐻 bear', '🦛 hippo', '🦏 rhino', '🐨 koala', '🐪 camel',
    '🦊 fox', '🦉 owl', '🐿️ squirrel', '🐗 boar', '🦇 bat', '🦡 badger', '🦅 eagle',
    '🦩 flamingo', '🦍 gorilla', '🐃 buffalo', '🦢 swan', '🦥 sloth', '🦨 skunk', '🦦 otter',
    '🦝 raccoon', '🐆 leopard',
  ] },
  'Pets and farm animals': { sym: '🐾', cards: [
    '🐕 dog', '🐈 cat', '🐇 rabbit', '🐹 hamster', '🐟 fish', '🐎 horse', '🐄 cow', '🐖 pig',
    '🐑 sheep', '🐔 chicken', '🦆 duck', '🐁 mouse', '🐤 chick', '🐐 goat', '🐦 bird', '🦜 parrot',
    '🐀 rat', '🦃 turkey', '🐂 bull', '🐓 cockerel', '🦙 llama', '🐏 ram', '🦎 lizard', '🐍 snake',
    '🕊️ dove', '🦮 guide dog', '🐩 poodle', '🦚 peacock', '🐢 tortoise', '🐣 hatching chick',
  ] },
  'At the seaside': { sym: '🌊', cards: [
    '🦈 shark', '🐬 dolphin', '🐳 whale', '🐙 octopus', '🦀 crab', '🦞 lobster', '🦐 prawn',
    '🦑 squid', '🐡 pufferfish', '🐠 tropical fish', '🦪 oyster', '🐚 shell', '🐧 penguin',
    '🏖️ beach', '🏝️ island', '🌅 sunset', '🤿 snorkel', '🎢 roller coaster', '⚓ anchor', '🎣 fishing rod',
    '⛵ sailing boat', '🛥️ motor boat', '🎡 big wheel', '🎠 merry-go-round', '🏊 swimming', '🏄 surfing',
    '🍦 ice cream', '👙 bikini', '👒 sun hat', '👡 sandals',
  ] },
  Nature: { sym: '🏞️', cards: [
    '🌋 volcano', '⛰️ mountain', '🏜️ desert', '🌳 tree', '🌲 pine tree', '🌴 palm tree',
    '🌵 cactus', '🌸 blossom', '🌻 sunflower', '🌹 rose', '🌷 tulip', '🌼 flower', '🦂 scorpion',
    '🌾 wheat', '🍂 autumn leaves', '🦔 hedgehog', '🍀 four-leaf clover', '🌰 conker', '🌱 seedling',
    '🔥 fire', '🐝 bee', '🐞 ladybird', '🦋 butterfly', '🐜 ant', '🐌 snail', '🐛 caterpillar',
    '🦗 grasshopper', '🕷️ spider', '🕸️ cobweb', '🦟 mosquito',
  ] },
  'Space and weather': { sym: '🔭', cards: [
    '☀️ sun', '🌙 moon', '🌕 full moon', '☂️ umbrella', '⭐ star', '🌠 shooting star', '☄️ comet',
    '🪐 Saturn', '🌍 Earth', '🚀 rocket', '🛸 flying saucer', '🛰️ satellite', '👩‍🚀 astronaut',
    '👽 alien', '🌌 Milky Way', '📡 satellite dish', '🌈 rainbow', '☁️ cloud', '🌧️ rain', '🌨️ snow',
    '❄️ snowflake', '⚡ lightning', '⛈️ thunderstorm', '🌪️ tornado', '🌬️ wind', '🌫️ fog',
    '🌡️ thermometer', '☃️ snowman', '🌄 sunrise', '💧 raindrop',
  ] },
  'Fairy tales': { sym: '🧚', cards: [
    '🏰 castle', '🐉 dragon', '🧙‍♀️ witch', '🧙‍♂️ wizard', '👻 ghost', '🦄 unicorn', '🧜‍♀️ mermaid',
    '👸 princess', '🤴 prince', '👑 crown', '⚔️ sword', '🛡️ shield', '🏹 bow and arrow', '🐺 wolf',
    '🧞 genie', '🧝 elf', '🧛 vampire', '🧟 zombie', '🤥 Pinocchio', '🧹 broomstick',
    '🔮 crystal ball', '🗡️ dagger', '💎 diamond', '🗝️ old key', '📜 scroll', '🏴‍☠️ pirate flag',
    '🐸 frog', '💰 money bag', '⚰️ coffin', '👹 monster',
  ] },
  Countries: { sym: '🌐', cards: [
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales', '🇫🇷 France', '🇪🇸 Spain', '🇮🇪 Ireland',
    '🇺🇸 America', '🇦🇺 Australia', '🇮🇹 Italy', '🇨🇳 China', '🇯🇵 Japan', '🇮🇳 India',
    '🇪🇬 Egypt', '🇩🇪 Germany', '🇨🇦 Canada', '🇯🇲 Jamaica', '🇲🇽 Mexico', '🇬🇷 Greece',
    '🇧🇷 Brazil', '🇨🇭 Switzerland', '🇳🇱 Holland', '🇳🇿 New Zealand', '🇵🇱 Poland',
    '🇿🇦 South Africa', '🇰🇪 Kenya', '🇵🇹 Portugal', '🇵🇰 Pakistan', '🇳🇬 Nigeria',
    '🇹🇭 Thailand', '🇵🇪 Peru',
  ] },
  'Around town': { sym: '🏘️', cards: [
    '🏥 hospital', '🛒 supermarket', '🏫 school', '⛪ church', '🚏 bus stop', '🏨 hotel',
    '🏤 post office', '🎪 circus', '📮 postbox', '🛍️ shopping bags', '🚦 traffic lights', '🏦 bank',
    '🏛️ museum', '🏪 corner shop', '🏕️ campsite', '⛽ petrol station', '🚉 train station',
    '🏟️ stadium', '⛲ fountain', '🅿️ car park', '🏭 factory', '🕌 mosque', '🕍 synagogue',
    '🛕 temple', '🏧 cash machine', '🚻 public toilets', '🏙️ city', '🏢 office block',
    '🌉 bridge', '💈 barber’s',
  ] },
  Sport: { sym: '🏅', cards: [
    '⚽ football', '🎾 tennis', '🏏 cricket', '🏉 rugby', '🏀 basketball', '🥊 boxing', '⛳ golf',
    '🥋 karate', '🏑 hockey', '🏒 ice hockey', '🏸 badminton', '⚾ baseball',
    '🏈 American football', '🏐 volleyball', '🏆 trophy', '🤸 gymnastics', '🥍 lacrosse',
    '⛸️ ice skating', '⛷️ skiing', '🏂 snowboarding', '🥌 curling', '🤺 fencing',
    '🏋️ weightlifting', '🚣 rowing', '🚴 cycling', '🧗 climbing', '🤼 wrestling',
    '🚵 mountain biking', '🤾 handball', '🤽 water polo',
  ] },
  School: { sym: '🎒', cards: [
    '✏️ pencil', '🖊️ pen', '🖋️ fountain pen', '🖍️ crayons', '🎨 paints', '📖 book', '📓 notebook',
    '⚛️ atom', '📝 notepad', '💯 hundred', '🌟 gold star', '🔤 alphabet', '🔢 numbers',
    '🙋 hands up', '🔬 microscope', '🧪 test tube', '🧬 DNA', '🗺️ map', '📎 paper clip',
    '📋 clipboard', '📅 calendar', '🔖 bookmark', '🧮 abacus', '📐 set square', '📊 bar chart',
    '📈 graph', '📁 folder', '🍱 lunchbox', '🧫 petri dish', '🏷️ label',
  ] },
  Transport: { sym: '🚥', cards: [
    '🚗 car', '🚕 taxi', '🚓 police car', '🏎️ racing car', '🚌 bus', '🚐 minibus', '🚛 lorry',
    '🚨 siren', '🚜 tractor', '🚒 fire engine', '🚑 ambulance', '🚲 bicycle', '🏍️ motorbike',
    '🛵 moped', '🛺 tuk-tuk', '🚂 train', '🚅 bullet train', '🚇 underground', '🚝 monorail',
    '🚋 tram', '🛤️ train track', '✈️ aeroplane', '🚁 helicopter', '🚡 cable car', '🛶 canoe',
    '🚤 speedboat', '⛴️ ferry', '🛳️ cruise ship', '🚢 ship', '🦽 wheelchair',
  ] },
  Celebrations: { sym: '🎈', cards: [
    '🎂 birthday cake', '🎁 presents', '🐰 Easter bunny', '🥳 party', '🎊 confetti', '🎄 Christmas',
    '🎅 Father Christmas', '🤶 Mrs Claus', '👼 angel', '🎃 Halloween', '💌 love letter',
    '💒 wedding', '👰 bride', '🤵 groom', '💐 bouquet', '🎆 fireworks', '🎇 sparkler',
    '🧨 firecracker', '🪔 Diwali', '🕎 Hanukkah', '🏮 lantern', '🕺 disco', '🎓 graduation',
    '🦌 reindeer', '✨ sparkles', '💘 Valentine’s Day', '💏 kiss', '🎖️ medal', '🕯️ candle',
    '💑 couple',
  ] },
  'Toys and games': { sym: '🎲', cards: [
    '🧸 teddy bear', '🎎 dolls', '🤖 robot', '🦕 dinosaur', '🦖 T-Rex', '🦸 superhero', '🪁 kite',
    '🪀 yo-yo', '🥎 ball', '🥏 frisbee', '🔫 water pistol', '🛷 sledge', '🪂 parachute',
    '🧩 jigsaw', '♟️ chess', '🃏 playing cards', '🎮 controller', '🕹️ joystick', '🎱 pool',
    '🛹 skateboard', '🛴 scooter', '🎳 skittles', '🏓 table tennis', '🎯 dartboard', '🦹 villain',
    '👾 space invader', '♠️ spades', '♣️ clubs', '⛺ tent', '🥅 goal',
  ] },
  Music: { sym: '🎶', cards: [
    '🎸 guitar', '🥁 drums', '🎹 piano', '🎻 violin', '🎺 trumpet', '🎷 saxophone', '🪕 banjo',
    '📯 horn', '🔔 bell', '🔁 repeat', '🎤 microphone', '🎧 headphones', '📻 radio', '💿 CD',
    '🔊 speaker', '📣 megaphone', '⏩ fast forward', '💃 dancer', '🎼 treble clef',
    '👩‍🎤 pop star', '🩰 ballet', '🎫 ticket', '▶️ play button', '⏸️ pause button', '🔇 mute',
    '⏹️ stop button', '🤘 rock on', '⏪ rewind', '🔀 shuffle', '⏺️ record button',
  ] },
  'Signs and symbols': { sym: '🔣', cards: [
    '🛑 stop', '⛔ no entry', '⚠️ warning', '♻️ recycling', '#️⃣ hashtag', '🚼 baby changing',
    '🚭 no smoking', '📵 no phones', '🚳 no bikes', '🚸 children crossing', '✅ tick', '❌ cross',
    '❓ question mark', '❗ exclamation mark', '➕ plus', '➖ minus', '🟥 square', '➗ divide',
    '⭕ circle', '🆘 SOS', '🆕 new', '🏁 chequered flag', '🏳️ white flag', 'ℹ️ information',
    '⬆️ arrow', '🔺 triangle', '♾️ infinity', '☢️ radioactive', '🚮 litter', '📶 signal',
  ] },
};

/* EVERY CARD AS `[category, word, picture]`, read out of '🍕 pizza' at its first space — see "a card is written as it is drawn" over `IMP_DECK`. § */
function impCards_() {
  const all = [];
  Object.keys(IMP_DECK).forEach(c => ((IMP_DECK[c] || {}).cards || []).forEach(s => {
    const str = String(s), sp = str.indexOf(' ');
    const sym = sp > 0 ? str.slice(0, sp) : '';
    all.push(sym && !/[A-Za-z]/.test(sym) ? [c, str.slice(sp + 1), sym] : [c, str, '']);
  }));
  return all;
}

/* ONE PILE OF EVERY (category, word) PAIR, shuffled once and dealt from the top, so no word comes round twice until the whole deck has — which is the same § */
let IMP_PILE = [];
function impDraw_() {
  if (!IMP_PILE.length) IMP_PILE = herdShuffle_(impCards_());
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

/* ---------- READ ALOUD, FOR THE ONES WHO CANNOT READ YET § */
function impCanSay_() { return canSay_(); }
function impAloud_(on) {
  if (on !== undefined) {
    try { localStorage.setItem('imp-aloud', on ? '1' : '0'); } catch (e) {}
    return on;
  }
  let v = false;
  try { v = localStorage.getItem('imp-aloud') === '1'; } catch (e) {}
  return v && impCanSay_();
}
function impHush_() { hush_(); }
/* THE VOICE IS `say_`'s (shell.js), shared with a question's Read aloud since 394; quieter here, because the phone is passed round a table. */
function impSay_(text) {
  if (!impAloud_()) return;
  say_(text, { rate: 0.9, volume: 0.6 });
}

/* `phase` IS ONE OF idle · deal · play · reveal, and `at` is whose turn it is to look while dealing. § */
const IMP_IDLE = () => ({ phase: 'idle', n: 0, at: 0, shown: false, imp: 0, first: 0, cat: '', word: '',
                          sym: '', catSym: '' });
let IMP = IMP_IDLE();

/* ---------- A SECOND TAP IS NOT A SECOND PRESS § */
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
  const [cat, word, sym] = impDraw_();
  IMP = { phase: 'deal', n: n, at: 0, shown: false,
          imp: Math.floor(Math.random() * n), first: Math.floor(Math.random() * n),
          cat: cat, word: word, sym: sym || '', catSym: (IMP_DECK[cat] || {}).sym || '' };
}

/* THE SLOTS EVERY SCREEN FROM THE FIRST HAND-OVER TO "Reveal" IS DRAWN IN — see "the big line and the button do not move" above: § */
function impFrame_(sym, big, small, button, foot, imp) {
  return `<p class="imp-sym${imp ? ' is-imp' : ''}" aria-hidden="true">${esc(sym)}</p>
    <p class="art-word imp-big">${esc(big)}</p>
    <p class="art-cat-of imp-lab">${esc(small)}</p>
    ${button}${foot || ''}`;
}
/* THE MARK BESIDE THE WORD, NOT INSTEAD OF IT — `tile_`'s own rule turned round, because a gold button that a reader reads and a non-reader recognises has to § */
const impShow_ = () => `<button class="art-go imp-go" data-do="imp-show">${tileIcon_('show')}<span>Show</span></button>`;
const impHideBtn_ = () => `<button class="art-go imp-go" data-do="imp-hide">${tileIcon_('hide')}<span>Hide</span></button>`;
const impReveal_ = () => `<button class="art-go imp-go" data-do="imp-reveal"><span>Reveal</span></button>`;

/* ---------- READ ALOUD IS A TILE, THE REELS' SOUND TILE'S OWN PAIR § */
const impAloudTile_ = on => tile_({ icon: on ? 'sound' : 'mute', label: on ? 'Read aloud on' : 'Read aloud off',
                                    act: 'imp-aloud', cls: 'imp-aloud', on: !!on, pressed: !!on });

/* DRAWN FROM THE STATE, the `REEL_HELD` rule — the handlers change `IMP` and ask for a paint, and nothing is ever patched onto the element. § */
function impPaint() {
  const card = $('imp-card'), acts = $('imp-acts');
  if (!card) return;
  const s = IMP;
  const player = i => 'Player ' + (i + 1);
  if (acts) acts.innerHTML = '';
  if (s.phase === 'idle') {
    const n = impCount_();
    const on = impAloud_();
    card.innerHTML = `<p class="art-cat-of">Players</p>
      <div class="imp-count">
        <button class="imp-step" data-do="imp-count" data-d="-1" aria-label="One player fewer"
          ${n <= IMP_MIN ? 'disabled' : ''}>&minus;</button>
        <span class="art-score" id="imp-n">${n}</span>
        <button class="imp-step" data-do="imp-count" data-d="1" aria-label="One player more"
          ${n >= IMP_MAX ? 'disabled' : ''}>+</button>
      </div>
      ${impCanSay_() ? impAloudTile_(on) : ''}
      <button class="art-go" data-do="imp-start">Deal</button>`;
    return;
  }
  const aloud = impAloud_();
  const room = aloud ? '<span class="imp-foot" aria-hidden="true"></span>' : '';
  if (s.phase === 'deal' && !s.shown) {
    card.innerHTML = impFrame_('', player(s.at), '', impShow_(), room);
    return;
  }
  /* THE IMPOSTER'S CARD CARRIES THE CATEGORY'S PICTURE where everybody else's carries the word's — see "every card has a picture" above: § */
  if (s.phase === 'deal') {
    const me = s.at === s.imp;
    card.innerHTML = impFrame_(me ? s.catSym : s.sym, me ? 'Imposter' : s.word, me ? s.cat : '', impHideBtn_(),
      aloud ? tile_({ icon: 'speak', label: 'Listen', act: 'imp-listen', tone: 'listen' }) : '', me);
    return;
  }
  if (s.phase === 'play') {
    card.innerHTML = impFrame_(s.catSym, player(s.first) + ' starts', s.cat, impReveal_(), room);
    return;
  }
  /* THE REVEAL: who, and the word with its picture. § */
  card.innerHTML = `<p class="art-over">Imposter</p>
    <p class="art-score">${esc(player(s.imp))}</p>
    <p class="imp-sym" aria-hidden="true">${esc(s.sym)}</p>
    <p class="art-word">${esc(s.word)}</p>`;
  if (acts) {
    acts.innerHTML = `<button class="btn" data-do="imp-again">Deal</button>
      <button class="btn quiet" data-do="imp-players">Players</button>`;
  }
}

function initImposter() {
  if (!$('imp-card')) return;
  impPaint();
}

/* A WORD LEFT UP WHEN THE COLUMN GOES IS A WORD THE NEXT PERSON SEES, so leaving hides it. § */
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
on('imp-start', (el, e) => { impHush_(); impPressed_(e); impDeal_(impCount_()); impPaint(); });
/* SHOW, HIDE AND REVEAL TAKE `(el, e)` FOR `impTooSoon_` — see "a second tap is not a second press" —
   and so do the reveal's Deal and Players, below. */
on('imp-show', (el, e) => {
  if (IMP.phase !== 'deal' || IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = true;
  impPaint();
});
/* THE ONLY PLACE ANYTHING IS SPOKEN, and only with the card up — so only by the person who pressed Show. § */
on('imp-listen', () => {
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  impHush_();
  impSay_(IMP.at === IMP.imp ? 'Imposter' : String(IMP.word));
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
});
/* GUARDED BEFORE THE HUSH, the other way round from Hide. § */
on('imp-reveal', (el, e) => {
  if (IMP.phase !== 'play') return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impHush_();
  IMP.phase = 'reveal';
  impPaint();
});
/* `imp-again` IS THE REVEAL'S "Deal" — it was "Play again" until the 11 Oct trim — and deals for the same number of players without going back through the setup § */
on('imp-again', (el, e) => {
  impHush_();
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impDeal_(IMP.n || impCount_());
  impPaint();
});
on('imp-players', (el, e) => {
  impHush_();
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP = IMP_IDLE();
  impPaint();
});

/* FOUR CLASSROOM GAMES — Just a Minute, Taboo, Hot Seat and 20 Questions. § */
/* ---------- THE DECKS § */
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

/* 20 QUESTIONS: A PERSON, A PLACE OR A THING, and the people are from history lessons and books rather than from this week's news — a living celebrity is a card § */
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

/* WHERE A STOP CAME FROM: § */
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

/* THE TICK WRITES THE CLOCK AND NOTHING ELSE. § */
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

/* THE WIDGET'S `stop`. § */
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

/* ONE PAINT FOR THE PAUSED CARD, because all four timed games pause the same way and say nothing secret while they do. § */
function partyHeld_(k, head, line, go) {
  return `<p class="art-cat-of">${esc(head)}</p>
    <p class="party-clock" id="${esc(k)}-left">${partyClock_(PARTY[k])}</p>
    ${line ? `<p class="imp-pass">${esc(line)}</p>` : ''}
    <button class="art-go" data-do="party-resume" data-g="${esc(k)}">${esc(go || 'Resume')}</button>`;
}

function partyBits_(k) {
  return { card: $(k + '-card'), acts: $(k + '-acts'), said: $(k + '-said') };
}

/* ---------- JUST A MINUTE § */
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

/* ---------- TABOO § */
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

/* ---------- HOT SEAT § */
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

/* ---------- 20 QUESTIONS § */
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

/* ---------- ALIBI WAS HERE, AND IS DELETED ON REQUEST § */

/* WHAT EACH GAME DOES WHEN ITS CLOCK RUNS OUT, and how it draws. Read by the tick, `partyStart_` and
   `partyStop_`, so a fifth timed game is a row here. */
const PARTY_GAMES = {
  jam: { paint: jamPaint, end: s => { s.phase = 'done'; } },
  tab: { paint: tabPaint, end: s => { s.phase = 'done'; } },
  hot: { paint: hotPaint, end: s => { s.phase = 'done'; } },
  twq: { paint: twqPaint, end: () => {} },
};

/* SCRABBLE — two, three or four people, one phone. § */
const SCR_N = 15;

/* THE STANDARD ENGLISH SET — 100 tiles, and the two blanks are the empty string. § */
const SCR_SET = [
  ['A', 9, 1], ['B', 2, 3], ['C', 2, 3], ['D', 4, 2], ['E', 12, 1], ['F', 2, 4], ['G', 3, 2],
  ['H', 2, 4], ['I', 9, 1], ['J', 1, 8], ['K', 1, 5], ['L', 4, 1], ['M', 2, 3], ['N', 6, 1],
  ['O', 8, 1], ['P', 2, 3], ['Q', 1, 10], ['R', 6, 1], ['S', 4, 1], ['T', 6, 1], ['U', 4, 1],
  ['V', 2, 4], ['W', 2, 4], ['X', 1, 8], ['Y', 2, 4], ['Z', 1, 10], ['', 2, 0],
];
const SCR_VALUE = {};
SCR_SET.forEach(t => { SCR_VALUE[t[0]] = t[2]; });

/* ---------- THE PREMIUM SQUARES, BUILT FROM ONE QUADRANT § */
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

/* ---------- WHERE THE TILES ARE, ASKED OF THE BOARD RATHER THAN REMEMBERED § */
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

/* ---------- THE RULES THAT ARE NOT A MATTER OF OPINION § */
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

/* ---------- WHAT IT SCORES § */
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
  /* THE GAME ENDS WHEN SOMEBODY GOES OUT AND THERE IS NOTHING LEFT TO DRAW. § */
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
    /* ---------- A SQUARE IS ONLY A CONTROL WHILE THERE IS A GAME § */
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
  /* ---------- TWENTY-SIX LETTERS, AND NOT AS TWENTY-SIX BUTTONS § */
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
  /* ---------- A TILE THAT IS ON THE BOARD IS NOT ON THE RACK § */
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
  /* THE PLAYER-COUNT ROW COMES BACK WHEN THE GAME IS OVER, because at that point "2, 3 or 4 players" IS "new game" and a second control saying so is a second thing § */
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
    /* EVERY ACTION WRITTEN OUT AS A LITERAL, not built from a list. § */
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
  /* A BLANK IS NOT A LETTER UNTIL SOMEBODY SAYS SO, and it is worth nought whatever they say. § */
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

/* ---------- THE TIMETABLE § */
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
    /* ---------- THE FIRST TIME ON THE ACCOUNT, WHAT THIS PHONE HELD COMES WITH YOU § */
    const here = tmtLocal_();
    if (here && here.days.some(d => d.length)) { tmtSave_(here); return here; }
    return tmtEmpty_();
  }
  return tmtLocal_() || tmtEmpty_();
}
/* ---------- KEPT ON THE PHONE FIRST, THEN SENT § */
function tmtSave_(t) {
  if (typeof USER !== 'undefined' && USER) {
    USER.timetable = JSON.stringify(t);
    try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
    clearTimeout(TMT_TIMER);
    /* AND BOOKED TO GO AS THE PAGE GOES (`keepDue_`, data.js; docs/history/317). */
    const send = keepalive => {
      clearTimeout(TMT_TIMER);
      keepDue_('timetable', null);
      if (!USER) return;
      return api({ action: 'saveTimetable', name: USER.name, personId: USER.personId || '',
            timetable: USER.timetable }, keepalive ? { keepalive: true } : undefined)
        .then(d => { if (d && d.error) throw new Error(d.error); })
        .catch(err => toast('Timetable not saved — ' + String((err && err.message) || 'no connection.')));
    };
    TMT_TIMER = setTimeout(send, 900);
    keepDue_('timetable', send);
    return;
  }
  try { localStorage.setItem(tmtKey_(), JSON.stringify(t)); }
  catch (e) { toast('Not saved — this browser is not keeping anything.'); }
}

/* ---------- THE COLOUR IS THE SUBJECT'S, NOT THE LESSON'S § */
const TMT_HUES = 10;
/* LETTERS IN ANY ALPHABET, NOT a-z. § */
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
  /* A FORM, SO BUTTONS. `Done` shuts it and puts it in time order; `Remove` takes it off. § */
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

/* ---------- A BOOKED SESSION, LOCKED § */
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
  /* NOT SAVED WHEN DRAWN AHEAD (`AHEAD.running`, shell.js; docs/history/341). § */
  if (tmtColours_(t) && !(typeof AHEAD !== 'undefined' && AHEAD.running)) tmtSave_(t);
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

/* ---------- A LESSON SHUT WITH NOTHING IN IT IS NOT A LESSON § */
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

/* KEPT ON EVERY KEYSTROKE AND NOT REDRAWN. § */
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

/* WORD GAMES — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20 Questions, Imposter and Herd Mentality in one widget. § */
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
    /* NO NOTE LINE UNDER THE CARD. § */
    body: `<div id="imp-card" class="art"></div>
    <div id="imp-acts" class="art-row"></div>` },
  /* HERD MENTALITY, MOVED IN BY THE OWNER — "heard mentality is a word game so should go there." § */
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

/* THE PICKER AND THE CHOSEN GAME'S CARD, AND NOTHING THAT RUNS — the widget's declared `draw`, which the builder uses to draw it before anybody arrives § */
function wgPaint_() {
  const slot = $('wg-slot'), sel = $('wg-pick');
  if (!slot) return false;
  const g = wgGame_(wgChosen_());
  if (sel && sel.value !== g.k) sel.innerHTML = wgOptions_();
  /* REBUILT ONLY WHEN THE GAME CHANGED. § */
  const now = slot.firstElementChild;
  if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = wgSlot_();
  return g;
}
function initWordGames() {
  const g = wgPaint_();
  if (!g) return;
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
  /* THE OLD GAME IS STOPPED AFTER ITS CARD HAS LEFT THE DOCUMENT, which is the order that makes its own stop read it as "the column is gone": § */
  const slot = $('wg-slot');
  if (slot) slot.innerHTML = '';
  wordGamesStop_();
  initWordGames();
});

/* TOUCH TYPING — the `typing` widget on the Tools column. § */

/* THE LADDER. `keys` is every letter the lesson may use; `fresh` is what it adds, and a line leans towards words that hold one, because a home-row word in the § */
const KT_HOME = 'asdfghjkl', KT_TOP = 'qwertyuiop', KT_LOW = 'zxcvbnm';
const KT_LESSONS = [
  { name: 'Home row',    keys: KT_HOME,                          fresh: KT_HOME },
  { name: 'Top row',     keys: KT_HOME + KT_TOP,                 fresh: KT_TOP },
  { name: 'Bottom row',  keys: KT_HOME + KT_TOP + KT_LOW,        fresh: KT_LOW },
  { name: 'Capitals',    keys: KT_HOME + KT_TOP + KT_LOW,        fresh: '', caps: true },
  { name: 'Punctuation', keys: KT_HOME + KT_TOP + KT_LOW + "'",  fresh: "'", caps: true, marks: true },
];
/* "AS ACCURACY HOLDS": § */
const KT_HOLD = 0.9, KT_LINES_TO_OPEN = 3;

/* ONE LIST, FILTERED PER LESSON, rather than five lists. § */
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

/* THE KEYBOARD, AND WHICH FINGER OWNS EACH KEY. § */
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

/* ---------- KEPT ON THE DEVICE, UNDER WHOEVER IS SIGNED IN § */
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

/* THE LINE IN HAND. In memory, and stamped with who it belongs to, so a sign-in on the same machine does not hand the next person the last one's half-finished § */
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

/* A LESSON BY ITS NUMBER, the first for one that is not there. § */
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
    /* NOT THE SAME WORD TWICE RUNNING. § */
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

/* ---------- WHAT A LINE SCORES § */
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

/* ---------- DRAWN § */
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

/* EVERY COPY, BY CLASS — the Saved column draws this markup again, the timetable's reason. § */
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

/* ---------- HOW KEYS GET IN § */
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

/* FOCUSED IN THE TAP ITSELF, synchronously — iOS opens its keyboard only for a focus inside the gesture that asked for it. § */
function ktFocus_(at) {
  const box = at && at.closest && at.closest('.kt-box');
  const input = box && box.querySelector('.kt-in');
  if (!input) return;
  try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
  /* ONLY IF THE FOCUS TOOK. § */
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


/* VIDEOS — A SEARCH BAR, FOUR RESULTS UNDER IT, A PLAYER IN THE CARD, AND A FULL SCREEN TILE § */
const VID_KINDS = ['film', 'clip'];
let VIDEOS_LIST = null;          // null: not asked yet. []: asked, and there is nothing in it
let VIDEOS_ASKED = null;         // the one request in flight, so two copies of the card ask once
/* `in` IS WHICH COPY OF THE CARD PLAYS IT — the id of the column the tapped copy is on (`s-games`, `s-saved`). § */
const VID = { q: '', at: '', in: '' };   // what is typed, the key of the row in the player, and whose player
/* AT MOST FOUR RESULTS — *"max 4 results show."* (10 Oct). */
const VID_MAX = 4;

/* A ROW IS ONE SHAPE WHEREVER IT CAME FROM, built here once rather than at each reader. § */
function vidHow_(url) {
  const u = String(url || '').trim();
  if (vidYouTubeId_(u)) return 'yt';
  if (typeof clipPlayable_ === 'function' && clipPlayable_(u)
      && /\.(mp4|webm|m4v|mov|ogv)(?:[?#]|$)/i.test(u)) return 'file';
  if (/^https?:\/\//i.test(u)) return 'out';
  return '';
}

/* EVERY SHAPE A YOUTUBE ADDRESS COMES IN when somebody copies it: § */
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
  /* THE REELS WERE HERE, numbered by address and listed as "Reel 1", "Reel 2". § */
  /* ---------- A FILM, A SERIES OR A DOCUMENTARY — AND ONE THAT IS NOT IN THE DRIVE YET § */
  ((typeof DATA !== 'undefined' && DATA.films) || []).forEach((f, i) => {
    if (!f || !f.title) return;
    const url = String(f.url || '').trim();
    const k = String(f.kind || '').toLowerCase();
    const label = k === 'series' ? 'Series' : k === 'documentary' ? 'Documentary' : 'Film';
    const words = k === 'series' ? 'series tv show' : k === 'documentary' ? 'documentary' : 'film movie';
    const door = !f.placeholder && /^https?:\/\//i.test(url);
    /* `year` AND `seasons` RIDE ALONG FOR THE ROW'S META LINE -- YouTube's "3 years ago" spot (note 311).
       Both were already on the row and searched through `tags`; they were never said. */
    const seasons = Number(f.seasons) || 0;
    /* A FILE IN DRIVE PLAYS IN THE CARD; A FOLDER CANNOT. § */
    const how = !door ? 'none' : vidDriveId_(url) ? 'drive' : 'out';
    /* `fromFilms` SAYS WHERE THE ROW CAME FROM, and it is the one thing that lets a row ask Drive for a
       picture (`vidThumb_`) or for its player (`vidPlayer_`): only the backend's films list, which only
       an admin is sent, may. */
    add({ key: 'f' + (f.id || i), title: String(f.title), url: door ? url : '', kind: 'film', label: label,
          fromFilms: true,
          year: String(f.year || '').trim(),
          seasons: k === 'series' && seasons ? seasons + (seasons === 1 ? ' season' : ' seasons') : '',
          how: how, none: f.placeholder ? 'not in the Drive yet' : 'no Drive link yet',
          tags: [f.year, f.director, f.lead, words, f.audience].filter(Boolean).join(' '),
          age: f.audience === 'kids' ? 'kids' : '', notes: String(f.notes || '') });
  });
  return out;
}

/* EVERY WORD TYPED HAS TO BE SOMEWHERE IN THE ROW — title, tags, kind, notes. § */
/* AND A PLURAL FINDS ITS SINGULAR: `films`, `documentaries`, `movies` — the folder's own words are
   plurals, and they are what an admin who has the folder in mind will type. */
const vidForms_ = w => [w].concat(w.length > 3 && /ies$/.test(w) ? [w.slice(0, -3) + 'y'] : [],
                                  w.length > 3 && /s$/.test(w) ? [w.slice(0, -1)] : []);
const vidNorm_ = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

/* ---------- AND THE BEST ONE FIRST, BECAUSE ONLY FOUR ARE SHOWN § */
function videosFound_(q) {
  const whole = vidNorm_(q);
  const forms = whole.split(' ').filter(Boolean).map(vidForms_);
  /* AN EMPTY BOX FINDS NOTHING — it is the bar alone (`vidPaint_`), not "everything". */
  if (!forms.length) return [];
  const has = (hay, fs) => fs.some(f => hay.indexOf(f) !== -1);
  const rank = r => {
    const t = vidNorm_(r.title);
    if (t === whole) return 0;
    if (t.indexOf(whole) === 0) return 1;
    const tw = t.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    if (forms.every(fs => tw.some(x => fs.some(f => x.indexOf(f) === 0)))) return 2;
    if (forms.every(fs => has(t, fs))) return 3;
    return 4;
  };
  const door = r => (vidPlays_(r) ? 0 : r.how === 'out' ? 1 : 2);
  return videosAll_()
    .filter(r => {
      const hay = vidNorm_([r.title, r.tags, r.kind, r.notes, r.age].join(' '));
      return forms.every(fs => has(hay, fs));
    })
    .map(r => ({ r, k: rank(r), d: door(r) }))
    .sort((a, b) => a.k - b.k || a.d - b.d
      || a.r.title.localeCompare(b.r.title, 'en', { sensitivity: 'base', numeric: true }))
    .map(x => x.r);
}

/* WHAT PLAYS IN THE CARD: YouTube, a file, and a film from the films list that is a Drive file. */
const vidPlays_ = r => !!r && (r.how === 'yt' || r.how === 'file' || r.how === 'drive');

/* WHAT IT LOOKS LIKE: YOUTUBE'S LAYOUT AND TYPE, IN THIS APP'S BLACK AND GOLD — note 311 § */

/* EVERY PICTURE THAT FAILED THIS VISIT, by address, so the list repainted on the next keystroke draws the poster straight away rather than asking again and § */
const VID_BROKEN = new Set();

/* THE FILE ID IN A DRIVE ADDRESS: § */
function vidDriveId_(url) {
  const u = String(url || '').trim();
  const m = u.match(/^https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[^#]*&)?id=)([A-Za-z0-9_-]{6,})/i);
  return m ? m[1] : '';
}

/* THE ROW'S PICTURE, OR NOTHING — and nothing is not a fault, it is the poster. */
function vidThumb_(r) {
  if (!r) return '';
  if (r.how === 'yt') {
    const id = vidYouTubeId_(r.url);
    return id ? 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/mqdefault.jpg' : '';
  }
  /* A FILM FROM THE FOLDER, AND NOTHING ELSE — see "ONLY A ROW FROM THE FILMS LIST ASKS" above. */
  if (!r.fromFilms) return '';
  const id = vidDriveId_(r.url);
  return id ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w320' : '';
}

/* THE POSTER: what a row with no picture shows, so the list keeps ONE rhythm — every row the same 16:9 block — rather than a picture, a grey hole, a picture. § */
function vidPoster_(r) {
  return `<span class="vid-poster" aria-hidden="true">${tileIcon_(r.kind === 'film' ? 'film' : 'play')}</span>`;
}

/* THE KIND, AS EACH VIEWER ALREADY SEES IT. A student's rows are the owner's list and say Clip (or Film,
   if the owner typed it); only an admin's rows from the folder ever say Film, Series or Documentary. */
const vidFlag_ = r => r.label || (r.kind === 'film' ? 'Film' : 'Clip');

function vidPlayer_(r) {
  /* NOTHING PLAYING IS NOTHING DRAWN. The stage said "Tap a video to play it here." inside a box that was
     hidden whenever it said it; YouTube shows the list, not an empty player, and so does this. */
  if (!r) return '';
  if (r.how === 'yt') {
    /* `referrerpolicy` IS NOT DECORATION: YouTube's embed refuses to play (error 153) for a page
       that sends no referrer. `autoplay` is allowed because the tap that chose the row is the
       gesture that asked for it. */
    return `<iframe class="vid-player" src="https://www.youtube-nocookie.com/embed/${esc(vidYouTubeId_(r.url))}?rel=0&amp;playsinline=1&amp;autoplay=1"
      title="${esc(r.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  /* ---------- A FILM FROM THE FOLDER, IN DRIVE'S OWN PLAYER § */
  if (r.how === 'drive' && r.fromFilms) {
    const id = vidDriveId_(r.url);
    if (id) {
      return `<iframe class="vid-player" src="https://drive.google.com/file/d/${esc(encodeURIComponent(id))}/preview"
        title="${esc(r.title)}" allow="autoplay; fullscreen" allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    }
  }
  /* `playsinline`, OR AN IPHONE TAKES EVERY TAP STRAIGHT TO ITS OWN FULL SCREEN and the card never
     holds the video at all — which would make the Full screen tile the only way NOT to be full
     screen. */
  return `<video class="vid-player" src="${esc(r.url)}" controls playsinline preload="metadata"></video>`;
}

/* UNDER THE PLAYER: ITS TITLE AND ONE LINE — YouTube's watch page, where the first thing under the picture is what it is called. § */
function vidNow_(r) {
  if (!r) return '';
  const k = [vidFlag_(r), r.age].filter(Boolean).join(' · ');
  return `<p class="vid-now-t">${esc(r.title)}</p>${k ? `<p class="vid-now-k">${esc(k)}</p>` : ''}`;
}

function vidRow_(r) {
  const flag = vidFlag_(r);
  /* THE DIM LINE: what the row already said after its kind, which has moved to the badge — a placeholder's reason, the year, a series' seasons, the age. § */
  const sub = [r.how === 'none' ? r.none : '', r.year, r.seasons, r.age].filter(Boolean).join(' · ');
  const src = vidThumb_(r);
  /* `loading="lazy"`: a picture for a row somebody may scroll past, on a column most of which is parked
     off the glass. `decoding="async"` keeps the decode off the keystroke that drew it. */
  const img = src && !VID_BROKEN.has(src)
    ? `<img class="vid-img" src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '';
  /* THE BADGE, IN YOUTUBE'S DURATION SPOT — AND ONLY WHEN IT TELLS THIS ROW FROM ITS NEIGHBOURS. § */
  const word = flag === 'Clip' ? '' : flag;
  const out = r.how === 'out'
    ? `<span class="vid-out" role="img" aria-label="opens in a new tab">${tileIcon_('ext')}</span>` : '';
  const badge = word || out ? `<span class="vid-badge">${esc(word)}${out}</span>` : '';
  /* THE WORDS COME FIRST IN THE MARKUP, AND THE PICTURE IS DRAWN FIRST (`order` on `.vid-th`). § */
  const th = `<span class="vid-th">${vidPoster_(r)}${img}${badge}</span>`;
  const inner = `<span class="vid-txt"><span class="vid-t">${esc(r.title)}</span>${
    sub ? `<span class="vid-k">${esc(sub)}</span>` : ''}</span>${th}`;
  /* NOTHING TO OPEN, AND IT SAYS SO — not a button that does nothing when pressed. */
  if (r.how === 'none') return `<li><div class="vid-row is-off">${inner}</div></li>`;
  /* A DOOR IS A LINK, NOT A BUTTON THAT PRETENDS TO PLAY. `out` is absolute http(s), tested in
     `vidHow_` — `tile_`'s rule for the one way out of this app. */
  if (r.how === 'out') {
    return `<li><a class="vid-row is-out" href="${esc(r.url)}" target="_blank" rel="noopener">${inner}</a></li>`;
  }
  return `<li><button type="button" class="vid-row" data-do="vid-play" data-k="${esc(r.key)}">${inner}</button></li>`;
}

/* A PICTURE THAT FAILED IS TAKEN AWAY, AND THE POSTER UNDER IT IS WHAT IS LEFT. § */
const vidGone_ = im => {
  VID_BROKEN.add(im.getAttribute('src') || '');
  im.classList.add('is-gone');
};
document.addEventListener('error', e => {
  const im = e.target;
  if (!im || !im.classList || !im.classList.contains('vid-img')) return;
  vidGone_(im);
}, true);
/* AND A YOUTUBE PICTURE THAT "LOADED" AS YOUTUBE'S GREY STAND-IN. § */
document.addEventListener('load', e => {
  const im = e.target;
  if (!im || !im.classList || !im.classList.contains('vid-img')) return;
  if (!/^https:\/\/i\.ytimg\.com\//.test(im.getAttribute('src') || '')) return;
  if (im.naturalWidth > 0 && im.naturalWidth <= 120) vidGone_(im);
}, true);

/* EVERY PART OF THE CARD THAT IS WRITTEN WHOLE, AND WHAT WAS LAST WRITTEN INTO IT — so a repaint that would write the same markup writes nothing. § */
const VID_DRAWN = new WeakMap();
const vidSet_ = (el, html) => {
  if (!el || VID_DRAWN.get(el) === html) return;
  el.innerHTML = html;
  VID_DRAWN.set(el, html);
};

/* WHICH COPY OF THE CARD A BOX IS: the column it is drawn on. */
const vidCopy_ = box => ((box && box.closest && box.closest('.screen')) || {}).id || '';

/* ---------- THE BAR STAYS WHERE IT IS WHILE A SEARCH IS TYPED § */
const vidHold_ = (box, view, was, before) => {
  const res = box.querySelector('.vid-results');
  if (!res) return;
  if (view === 'results' || view === 'wait') {
    /* `res.offsetHeight` already counts the floor it was given, so this only ever rises. */
    const h = res.offsetHeight + Math.max(0, before - box.offsetHeight);
    if (h > 0) res.style.minHeight = h + 'px';
  } else if (was === 'results' || was === 'wait') res.style.minHeight = '';
};

/* THE RESULTS, THE PLAYER AND THE TILES ARE REPAINTED; THE BOX IS NOT. § */
function vidPaint_() {
  const all = videosAll_();
  const playing = VID.at ? all.find(r => r.key === VID.at && vidPlays_(r)) || null : null;
  /* A ROW THAT HAS GONE TAKES ITS PLAYER WITH IT — an admin's film after Sign out (me.js empties
     `DATA.films`), so the next paint is not a watch view of a film nobody is listed for. */
  if (!playing) { VID.at = ''; VID.in = ''; }
  /* AND THE APP'S FULL SCREEN ENDS WITH WHAT IT WAS SHOWING — leaving the column, an edit, a film that
     went, or the card redrawn under it (`vidFullOn_` says why each matters). */
  if (VID_FS.watch && (!playing || !VID_FS.watch.isConnected)) vidFullOff_();
  const boxes = [...document.querySelectorAll('.vid-box')];
  if (!boxes.length) return;
  /* ONE PLAYER, IN THE COPY THAT WAS TAPPED (`VID.in`). § */
  if (playing && !VID.in) {
    const front = typeof AT !== 'undefined' ? boxes.find(b => vidCopy_(b) === 's-' + AT) : null;
    VID.in = vidCopy_(front || boxes[0]) || 'card';
  }
  const host = playing ? boxes.find(b => (vidCopy_(b) || 'card') === VID.in) || null : null;
  const waiting = !all.length && (VIDEOS_LIST === null || (typeof awaiting_ === 'function' && awaiting_()));
  const typed = vidNorm_(VID.q) !== '';
  /* WHAT A COPY THAT IS NOT PLAYING SHOWS — the one that is shows the watch view instead. */
  const search = !typed ? 'idle' : waiting ? 'wait' : 'results';
  const found = search === 'results' ? videosFound_(VID.q) : [];
  const results = search === 'wait' ? loading_()
    : search !== 'results' ? ''
    : !all.length ? '<p class="faint vid-none">No videos listed yet.</p>'
    : !found.length ? '<p class="faint vid-none">Nothing matches that.</p>'
    : `<ul class="vid-list">${found.slice(0, VID_MAX).map(vidRow_).join('')}</ul>`
      + (found.length > VID_MAX
        ? `<p class="faint vid-more">${found.length - VID_MAX} more — keep typing to narrow</p>` : '');
  /* ---------- THE ADMIN'S ROW: SYNC FROM DRIVE, AND WHEN IT LAST RAN § */
  const mine = search === 'results' && typeof isAdmin === 'function' && isAdmin();
  const said = mine ? filmsSyncSaid_() : '';
  const admin = mine ? `<div class="tile-row">${tile_({ icon: 'sync', label: 'Sync from Drive', note: said,
      act: 'vid-sync', tone: 'admin', cls: FILMSYNC.asking ? 'is-busy' : '', off: !!FILMSYNC.asking })}
    <span class="vid-synced">${esc(said)}</span></div>` : '';
  boxes.forEach(box => {
    if (!box.querySelector('.vid-q')) {
      /* THE PILL IS A `<label>` ROUND THE BOX, so a tap on the magnifier is a tap on the box. § */
      box.innerHTML = `<label class="vid-search">${tileIcon_('search')}<input class="vid-q" type="search" placeholder="Search"
        autocomplete="off" enterkeyhint="search" aria-label="Search videos"></label>
      <div class="vid-watch">
        <div class="vid-stage"></div>
        <div class="vid-under"><div class="vid-now"></div><div class="tile-row vid-acts"></div></div>
      </div>
      <div class="vid-results"></div>
      <div class="vid-admin"></div>`;
      box.dataset.view = 'idle';
    }
    const here = box === host;
    const view = here ? 'watch' : search;
    const was = box.dataset.view || 'idle';
    /* THE HEIGHT A FILM HAD, read before anything below changes it — see `vidHold_`. */
    const before = (view === 'results' || view === 'wait') && was === 'watch' ? box.offsetHeight : 0;
    const q = box.querySelector('.vid-q');
    if (q && document.activeElement !== q && q.value !== VID.q) q.value = VID.q;
    const stage = box.querySelector('.vid-stage');
    const want = here ? playing.key : '';
    /* ONLY WHEN IT CHANGED: rebuilding the player for a repaint that changed nothing about it — the
       payload landing, a sync answering — would restart the film under somebody watching it. */
    if (stage && (stage.dataset.k || '') !== want) {
      stage.innerHTML = vidPlayer_(here ? playing : null);
      stage.dataset.k = want;
      stage.classList.toggle('on', here);
    }
    /* THE WATCH BLOCK IS THERE ONLY WHILE SOMETHING PLAYS IN THIS COPY — the player, its title and line,
       and the tiles. No empty stage and no tile with nothing to make full screen. */
    const watch = box.querySelector('.vid-watch');
    if (watch) watch.classList.toggle('on', here);
    vidSet_(box.querySelector('.vid-now'), vidNow_(here ? playing : null));
    /* FULL SCREEN, AND FOR A FILM FROM THE FOLDER, OPEN IN DRIVE BESIDE IT — the way out when Drive will not play a file in a frame § */
    const full = !!VID_FS.watch && VID_FS.watch === watch;
    vidSet_(box.querySelector('.vid-acts'), !here ? ''
      : full ? tile_({ icon: 'unfull', label: 'Exit full screen', act: 'vid-unfull' })
      : tile_({ icon: 'full', label: 'Full screen', act: 'vid-full' })
        + (playing.how === 'drive' ? tile_({ icon: 'ext', label: 'Open in Drive', note: 'in a new tab', href: playing.url }) : ''));
    vidSet_(box.querySelector('.vid-results'), here ? '' : results);
    vidSet_(box.querySelector('.vid-admin'), here ? '' : admin);
    vidHold_(box, view, was, before);
    box.dataset.view = view;
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
  /* AN ADMIN'S CARD KEEPS THE FILMS CURRENT ON ITS OWN — once per person per visit, when the last whole pass is a day old or a pass is part-way. § */
  if (filmsSyncDue_()) filmsSyncRun_(false);
}

/* THE FILMS FROM DRIVE — ASKED FOR BY THE CARD, FOR AN ADMIN § */
const FILMS_STALE_MS = 24 * 60 * 60 * 1000;   // a day — `FILMS_SYNC_*` in backend/constants.gs says why
const FILMS_ROUNDS = 6;                        // a part-way pass is asked to go on at most this often
/* `autoFor` — whom the card has already synced for on its own this visit, so a sync that FAILS (no folder found, the backend not yet deployed) is said once in § */
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

/* LEAVING THE COLUMN STOPS IT — the Reels column's lesson in note 047: § */
function videosStop_() {
  VID.at = '';
  vidFullOff_();
  /* AND THE SEARCH'S HELD HEIGHT GOES WITH THE FINGER THAT HELD IT (`vidHold_`): § */
  document.querySelectorAll('.vid-box .vid-results').forEach(r => { r.style.minHeight = ''; });
  if (document.querySelector('.vid-box')) vidPaint_();
}

/* ANY EDIT OF THE BOX LEAVES THE WATCH VIEW (note 321): § */
document.addEventListener('input', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('vid-q')) return;
  VID.q = String(el.value || '');
  VID.at = '';
  vidPaint_();
});

/* PRESSING SEARCH ON THE KEYBOARD PUTS THE KEYBOARD AWAY AND LEAVES THE RESULTS WHERE THEY ARE. § */
document.addEventListener('keydown', e => {
  const el = e.target;
  if (e.key !== 'Enter' || e.isComposing || !el || !el.classList || !el.classList.contains('vid-q')) return;
  e.preventDefault();
  el.blur();
});

/* A TAP ON A RESULT PLAYS IT IN THE CARD, in place of the results — IN THAT COPY OF THE CARD (`VID.in`) and no other. § */
on('vid-play', el => {
  VID.at = String(el.dataset.k || '');
  VID.in = vidCopy_(el) || 'card';
  const box = el.closest('.vid-box');
  const q = box && box.querySelector('.vid-q');
  if (q && document.activeElement === q) q.blur();
  vidPaint_();
});

/* FULL SCREEN — *"you can click fullscreen to make it fullscreen"* (10 Oct, note 321) § */
const VID_FS = { watch: null, box: null };

function vidFullOn_(box) {
  const watch = box && box.querySelector('.vid-watch.on');
  if (!watch || VID_FS.watch || typeof watch.showPopover !== 'function') return false;
  const title = ((box.querySelector('.vid-now-t') || {}).textContent || '').trim();
  VID_FS.watch = watch;
  VID_FS.box = box;
  box.style.minHeight = box.offsetHeight + 'px';
  watch.classList.add('is-fs');
  watch.setAttribute('data-noswipe', '');
  /* A DIALOG FOR AS LONG AS IT COVERS EVERYTHING, so a screen reader is told it is in one; an ordinary
     part of the card again the moment it does not. */
  watch.setAttribute('role', 'dialog');
  watch.setAttribute('aria-modal', 'true');
  watch.setAttribute('aria-label', title ? title + ', full screen' : 'Full screen');
  watch.setAttribute('popover', 'manual');
  try { watch.showPopover(); } catch (e) { vidFullOff_(); return false; }
  vidPaint_();
  const exit = watch.querySelector('[data-do="vid-unfull"]');
  if (exit) { try { exit.focus({ preventScroll: true }); } catch (e) {} }
  return true;
}

/* AND OFF AGAIN — by its tile, by Escape, by leaving the column, by an edit, or because the card it was
   in was drawn again. Safe to call when it is not on. */
function vidFullOff_() {
  const watch = VID_FS.watch, box = VID_FS.box;
  if (!watch) return;
  VID_FS.watch = null;
  VID_FS.box = null;
  try { watch.hidePopover(); } catch (e) {}
  ['popover', 'data-noswipe', 'role', 'aria-modal', 'aria-label'].forEach(a => watch.removeAttribute(a));
  watch.classList.remove('is-fs');
  if (box) box.style.minHeight = '';
  vidPaint_();
  const back = box && box.isConnected && box.querySelector('.vid-acts [data-do="vid-full"]');
  if (back) { try { back.focus({ preventScroll: true }); } catch (e) {} }
}

on('vid-full', el => {
  const box = el.closest('.vid-box');
  const p = box && box.querySelector('.vid-stage .vid-player');
  if (!p) { toast('Pick a video first.'); return; }
  const own = () => {
    if (vidFullOn_(box)) return;
    if (p.webkitEnterFullscreen) { try { p.webkitEnterFullscreen(); return; } catch (e) {} }
    toast('Use the full screen button in the player.');
  };
  const ask = p.requestFullscreen || p.webkitRequestFullscreen;
  if (typeof ask === 'function') {
    try {
      const r = ask.call(p);
      /* REFUSED IS NOT THE END OF IT: a browser that has the API and will not use it here (a frame it
         will not enlarge, a gesture it did not count) gets the app's own. */
      if (r && typeof r.catch === 'function') r.catch(own);
      return;
    } catch (e) {}
  }
  if (p.tagName === 'VIDEO' && p.webkitEnterFullscreen) { try { p.webkitEnterFullscreen(); return; } catch (e) {} }
  own();
});

on('vid-unfull', () => vidFullOff_());

/* ESCAPE LEAVES THE APP'S FULL SCREEN, AND THE ARROWS DO NOT TURN THE COLUMN UNDER IT. § */
document.addEventListener('keydown', e => {
  const w = VID_FS.watch;
  if (!w) return;
  if (!w.isConnected) { vidFullOff_(); return; }
  if (e.key === 'Escape' || e.key === 'Esc') {
    e.preventDefault();
    e.stopPropagation();
    vidFullOff_();
    return;
  }
  if (/^Arrow/.test(e.key || '')) e.stopPropagation();
}, true);

/* ---------- SUPERTUX: someone else's game, framed only on request (docs/history/363) */
const TUX_VERSION = 'v0.7.0';
const TUX_SOURCE = 'https://github.com/SuperTux/supertux/tree/' + TUX_VERSION;
const TUX_GET = 'https://github.com/SuperTux/supertux/releases/tag/' + TUX_VERSION;
/* The web build to frame; empty means none is set, and Play leaves for the official downloads. */
const tuxUrl_ = () => String(brand('supertux_url', '') || '').trim();
function tuxPaint_() {
  const tiles = $('tux-tiles'), lic = $('tux-licence');
  if (!tiles || !lic) return;
  const url = tuxUrl_();
  tiles.innerHTML = url
    ? tile_({ icon: 'play', label: 'Play', act: 'tux-play' }) + tile_({ icon: 'full', label: 'Full screen', href: url })
    : tile_({ icon: 'ext', label: 'Get SuperTux', href: TUX_GET });
  lic.innerHTML = `SuperTux ${TUX_VERSION} · code GPL-3.0, art CC-BY-SA / GPL ·
    <a href="${esc(TUX_SOURCE)}" target="_blank" rel="noopener" class="tux-src">source and licences</a>`;
}
function tuxPlay_() {
  const stage = $('tux-stage'), url = tuxUrl_();
  if (!stage || !url) return;
  stage.setAttribute('aria-busy', 'true');
  stage.innerHTML = loading_() + `<iframe class="tux-frame" title="SuperTux" src="${esc(url)}"
    allow="fullscreen; gamepad; autoplay" allowfullscreen></iframe>`;
  stage.querySelector('iframe').addEventListener('load', () => loaded_(stage), { once: true });
}
on('tux-play', tuxPlay_);

/* ---------- CONSOLE: an NES player, and only the player (docs/history/389; SNES, Game Boy and N64 files too, 391) */
/* The engine is jsnes (Apache-2.0), fetched only when Play is pressed. The game file is the person's own:
   picked from their device, kept in this device's IndexedDB, never uploaded or sent. */
const NES_LIB = 'https://cdn.jsdelivr.net/npm/jsnes@2.1.0/dist/jsnes.min.js';
const NES_LIB_2 = 'https://unpkg.com/jsnes@2.1.0/dist/jsnes.min.js';
const NES_DB = 'family-console', NES_HZ = 60.0988;
const NES_ = { nes: null, rom: null, saved: null, running: false, raf: 0, last: 0, acc: 0, ctx: null, img: null,
  u32: null, audio: null, node: null, ring: null, rd: 0, wr: 0, keys: {}, pads: {}, touch: {}, held: {}, lib: null,
  sys: 'nes', kind: null, axes: [0, 0, 0, 0] };
/* NES buttons in jsnes's numbering, so every input source speaks one language. */
const NES_B = { a: 0, b: 1, select: 2, start: 3, up: 4, down: 5, left: 6, right: 7 };
const NES_KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  z: 'b', Z: 'b', x: 'a', X: 'a', Enter: 'start', Shift: 'select',
  a: 'y', A: 'y', s: 'x', S: 'x', q: 'l', Q: 'l', w: 'r', W: 'r', e: 'l2', E: 'l2', r: 'r2', R: 'r2',
  i: 'cu', I: 'cu', k: 'cd', K: 'cd', j: 'cl', J: 'cl', l: 'cr', L: 'cr' };

/* THE ONE PLACE INDEXEDDB IS TOUCHED. Any failure (private window, blocked storage) is "no file kept"; a full device is remembered as `NES_.fullDb` (399). */
function nesDb_(mode, fn) {
  NES_.fullDb = false;
  const quota = e => { if (e && /quota/i.test(e.name || '')) NES_.fullDb = true; };
  return new Promise(res => {
    try {
      const rq = indexedDB.open(NES_DB, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('rom');
      rq.onerror = () => res(null);
      rq.onsuccess = () => {
        try {
          const tx = rq.result.transaction('rom', mode), r = fn(tx.objectStore('rom'));
          tx.oncomplete = () => { res(r && 'result' in r ? r.result : true); rq.result.close(); };
          tx.onerror = tx.onabort = () => { quota(tx.error); res(null); rq.result.close(); };
        } catch (e) { quota(e); res(null); }
      };
    } catch (e) { res(null); }
  });
}
const nesKept_ = () => nesDb_('readonly', s => s.get('last'));
const nesKeep_ = (bytes, kind) => nesDb_('readwrite', s => { s.put(kind || 'nes', 'kind'); return s.put(bytes, 'last'); });
const nesForgetDb_ = () => nesDb_('readwrite', s => { s.delete('kind'); return s.delete('last'); });
const nesKind_ = () => nesDb_('readonly', s => s.get('kind'));

/* iNES: "NES" then 0x1A, and at least one 16 KB bank after the 16-byte header. */
function nesValid_(u8) {
  return !!u8 && u8.length >= 16 + 16384 && u8[0] === 0x4e && u8[1] === 0x45 && u8[2] === 0x53 && u8[3] === 0x1a;
}

function nesPaint_() {
  const box = $('nes-box');
  if (!box) return;
  if (!USER) { box.innerHTML = '<p class="empty">Sign in to use the console.</p>'; return; }
  if (!box.querySelector('.nes-wrap') && !NES_.full) {
    box.innerHTML = `<div class="nes-wrap" id="nes-wrap">
      <div class="nes-stage" id="nes-stage"><canvas id="nes-canvas" class="nes-canvas" width="256" height="240"></canvas></div>
      <div class="nes-pad" id="nes-pad" aria-hidden="true">${nesPadHtml_(NES_.sys)}</div>
      <button type="button" class="nes-key nes-exit" id="nes-exit" aria-label="Leave full screen">×</button>
    </div>
    <p class="faint" id="nes-padnote" hidden>Controller connected</p>
    <div class="tile-row" id="nes-tiles"></div>
    <p class="note" id="nes-say" role="status"></p>
    <p class="faint" id="nes-sysnote" hidden></p>
    <input type="file" id="nes-file" class="nes-file" accept="${NES_ACCEPT}">
    <p class="faint">Use a game file you own. It stays on this device and is never uploaded.</p>`;
    nesPadWire_($('nes-pad'));
    $('nes-exit').addEventListener('click', () => nesFullOff_());
    /* A REDRAWN SCREEN KEEPS A RUNNING GAME: EmulatorJS's own box moves into the new stage rather than being lost with the old one. */
    const host = EMU_.ejs && EMU_.ejs.elements && EMU_.ejs.elements.parent;
    if (host && $('nes-stage')) $('nes-stage').appendChild(host);
  }
  nesSysSet_(NES_.sys);
  nesBlit_();
  nesTiles_();
  if (NES_.saved == null) Promise.all([nesKept_(), nesKind_()]).then(([b, k]) => {
    NES_.saved = b ? new Uint8Array(b) : false; NES_.kind = typeof k === 'string' ? k : null; nesTiles_(); });
}

function nesTiles_() {
  const t = $('nes-tiles');
  if (!t) return;
  const have = NES_.rom || NES_.saved;
  t.innerHTML = (NES_.running
      ? tile_({ icon: 'pause', label: 'Pause', act: 'nes-pause' })
      : tile_({ icon: 'play', label: 'Play', act: 'nes-play', note: have ? '' : 'choose a game file' }))
    + tile_({ icon: 'open', label: 'Choose file', act: 'nes-pick' })
    + (have ? tile_({ icon: 'bin', label: 'Forget file', act: 'nes-forget' }) : '')
    + tile_({ icon: NES_.lock ? 'lock' : 'unlock', label: NES_.lock ? 'Locked' : 'Lock', act: 'nes-lock',
      note: NES_.lock ? 'tap to let the page move' : 'keep the console in place' })
    + tile_({ icon: NES_.full ? 'unfull' : 'full', label: 'Full screen', act: 'nes-full' });
  nesPadShow_();
}

const nesSay_ = s => { const p = $('nes-say'); if (p) p.textContent = s || ''; };

/* THE SCRIPT, ONCE, from the pinned CDN and then its mirror. */
function nesLib_() {
  if (window.jsnes && window.jsnes.NES) return Promise.resolve(window.jsnes);
  if (NES_.lib) return NES_.lib;
  const one = src => new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = () => (window.jsnes && window.jsnes.NES ? ok(window.jsnes) : no(new Error('no engine')));
    s.onerror = () => { s.remove(); no(new Error('engine did not load')); };
    document.head.appendChild(s);
  });
  NES_.lib = one(NES_LIB).catch(() => one(NES_LIB_2)).catch(e => { NES_.lib = null; throw e; });
  return NES_.lib;
}

/* SOUND MUST BE MADE INSIDE THE TAP on iOS, so this runs synchronously in every handler that may start a game. */
function nesAudio_() {
  try {
    if (!NES_.audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      NES_.audio = new AC();
      NES_.ring = new Float32Array(8192 * 2); NES_.rd = NES_.wr = 0;
      const node = NES_.audio.createScriptProcessor(1024, 0, 2);
      node.onaudioprocess = e => {
        const L = e.outputBuffer.getChannelData(0), R = e.outputBuffer.getChannelData(1), n = NES_.ring.length;
        for (let i = 0; i < L.length; i++) {
          if (NES_.rd !== NES_.wr && NES_.running) { L[i] = NES_.ring[NES_.rd]; R[i] = NES_.ring[NES_.rd + 1]; NES_.rd = (NES_.rd + 2) % n; }
          else { L[i] = 0; R[i] = 0; }
        }
      };
      node.connect(NES_.audio.destination);
      NES_.node = node;
    }
    if (NES_.audio.state === 'suspended') NES_.audio.resume();
  } catch (e) {}
}
function nesSample_(l, r) {
  const n = NES_.ring.length, nx = (NES_.wr + 2) % n;
  if (nx === NES_.rd) return;   // full: drop rather than lag
  NES_.ring[NES_.wr] = l; NES_.ring[NES_.wr + 1] = r; NES_.wr = nx;
}

function nesFrame_(buf) {
  if (!NES_.u32) return;
  for (let i = 0; i < 61440; i++) NES_.u32[i] = 0xff000000 | buf[i];
  nesBlit_();
}
function nesBlit_() {
  const c = $('nes-canvas');
  if (!c || !NES_.img) return;
  const g = c.getContext('2d');
  if (g) g.putImageData(NES_.img, 0, 0);
}

function nesStart_(bytes) {
  const stage = $('nes-stage');
  if (!stage) return;
  const sys = nesSys_(bytes, NES_.kind);
  if (!sys) { nesSay_(NES_NOT); return; }
  if (sys !== 'nes') { emuStart_(bytes, sys); return; }
  emuEnd_(); nesSysSet_('nes');
  nesSay_('');
  stage.setAttribute('aria-busy', 'true');
  stage.insertAdjacentHTML('beforeend', loading_());
  nesLib_().then(lib => {
    loaded_(stage);
    nesStop_();
    try {
      NES_.nes = new lib.NES({ onFrame: nesFrame_, onAudioSample: NES_.ring ? nesSample_ : null,
        emulateSound: !!NES_.ring, sampleRate: NES_.audio ? NES_.audio.sampleRate : 48000 });
      NES_.nes.loadROM(bytes);
    } catch (e) { NES_.nes = null; nesSay_('This game file could not be started: ' + (e && e.message || e)); return; }
    NES_.rom = bytes;
    NES_.img = $('nes-canvas').getContext('2d').createImageData(256, 240);
    NES_.u32 = new Uint32Array(NES_.img.data.buffer);
    nesGo_();
  }).catch(() => { loaded_(stage); nesSay_('The console could not load. Check the connection and press Play again.'); });
}

function nesGo_() {
  if (EMU_.ejs) { emuGo_(); return; }
  if (!NES_.nes || NES_.running) return;
  NES_.running = true; NES_.last = 0; NES_.acc = 0;
  const loop = t => {
    if (!NES_.running) return;
    NES_.raf = requestAnimationFrame(loop);
    if (!$('nes-canvas')) { nesStop_(); return; }
    const dt = NES_.last ? Math.min(100, t - NES_.last) : 1000 / NES_HZ;
    NES_.last = t; NES_.acc += dt;
    nesPadsPoll_();
    let n = 0;
    while (NES_.acc >= 1000 / NES_HZ && n < 3) {
      try { NES_.nes.frame(); } catch (e) { nesStop_(); nesSay_('The game stopped: ' + (e && e.message || e)); return; }
      NES_.acc -= 1000 / NES_HZ; n++;
    }
    if (n === 3) NES_.acc = 0;
  };
  NES_.raf = requestAnimationFrame(loop);
  nesTiles_();
}
/* PAUSED, NOT ENDED: the game stays in memory and Play carries on from here. */
function nesStop_() {
  const was = NES_.running;
  NES_.running = false;
  cancelAnimationFrame(NES_.raf);
  NES_.held = {}; NES_.keys = {}; NES_.touch = {};
  if (NES_.nes) Object.values(NES_B).forEach(b => { try { NES_.nes.buttonUp(1, b); } catch (e) {} });
  if (EMU_.ejs) emuPause_();
  if (was) nesTiles_();
}

/* EVERY SOURCE (keys, pad, touch) IS OR-ED, then only changes reach the engine. */
function nesSync_() {
  if (EMU_.ejs) { emuSync_(); return; }
  if (!NES_.nes) return;
  Object.keys(NES_B).forEach(k => {
    const on = !!(NES_.keys[k] || NES_.pads[k] || NES_.touch[k]);
    if (on === !!NES_.held[k]) return;
    NES_.held[k] = on;
    try { on ? NES_.nes.buttonDown(1, NES_B[k]) : NES_.nes.buttonUp(1, NES_B[k]); } catch (e) {}
  });
}

/* EVERY PAD, EVERY FRAME, connected event or not: Safari shows a pad only after a press with the page focused (390). Nintendo positions: right face A, bottom B. */
function nesPadsPoll_() {
  const p = {}, axes = [0, 0, 0, 0];
  let any = false;
  try {
    [...(navigator.getGamepads ? navigator.getGamepads() : [])].forEach(g => {
      if (!g || g.connected === false) return;
      any = true;
      const b = i => !!(g.buttons && g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
      const ax = g.axes || [], x = Math.abs(ax[0] || 0) > 0.25 ? ax[0] : 0, y = Math.abs(ax[1] || 0) > 0.25 ? ax[1] : 0, std = g.mapping === 'standard';
      const four = NES_FOUR[NES_.sys], stick = NES_.sys !== 'n64';
      if (four) { if (b(1)) p.a = 1; if (b(0)) p.b = 1; if (b(3)) p.x = 1; if (b(2)) p.y = 1; }
      else { if (b(1) || b(3)) p.a = 1; if (b(0) || b(2)) p.b = 1; }
      if (b(4)) p.l = 1;
      if (b(5)) p.r = 1;
      if (std && b(6)) p.l2 = 1;
      if (std && b(7)) p.r2 = 1;
      if (b(10)) p.l3 = 1;
      if (b(11)) p.r3 = 1;
      if (b(9) || (!std && b(7))) p.start = 1;
      if (b(8) || (!std && b(6))) p.select = 1;
      if (b(12) || (stick && y < -0.5)) p.up = 1;
      if (b(13) || (stick && y > 0.5)) p.down = 1;
      if (b(14) || (stick && x < -0.5)) p.left = 1;
      if (b(15) || (stick && x > 0.5)) p.right = 1;
      const dz = v => (Math.abs(v || 0) > 0.25 ? Math.max(-1, Math.min(1, v)) : 0);
      if (!axes[0] && !axes[1]) { axes[0] = x; axes[1] = y; }
      if (!axes[2] && !axes[3]) { axes[2] = dz(ax[2]); axes[3] = dz(ax[3]); }
      /* A HAT SWITCH on axis 9 (many non-standard pads): -1 is up, clockwise in steps of 2/7, above 1 is centred. */
      const h = ax[9];
      if (!std && typeof h === 'number' && h >= -1.05 && h <= 1.05) {
        const s = Math.round((h + 1) * 3.5) % 8;
        if (s === 7 || s <= 1) p.up = 1;
        if (s >= 1 && s <= 3) p.right = 1;
        if (s >= 3 && s <= 5) p.down = 1;
        if (s >= 5 && s <= 7) p.left = 1;
      }
    });
  } catch (e) {}
  const wasStart = !!(NES_.pads && NES_.pads.start), was = Object.keys(NES_.pads || {}).length;
  NES_.pads = p; NES_.axes = axes;
  if (Object.keys(p).length && !was) { nesAudio_(); emuWake_(); }   // any press is a gesture enough to wake the sound

  if (any !== !!NES_.padOn) { NES_.padOn = any; nesPadShow_(); }
  if (p.start && !wasStart && !NES_.running) nesPadPlay_();
  nesSync_();
}

/* A CONTROLLER'S START BEGINS PLAY with a kept game; with none, it can only say so — a file picker needs a tap. */
function nesPadPlay_() {
  if (NES_.nes || EMU_.ready) { nesAudio_(); nesGo_(); return; }
  if (EMU_.ejs) return;
  const bytes = NES_.rom || NES_.saved;
  if (bytes) { nesAudio_(); nesStart_(bytes); return; }
  nesSay_('Controller connected. Choose a game file to play.');
}

/* WHILE NOTHING RUNS the game loop does not poll, so this does, for as long as the console is drawn. */
function nesPadWatch_() {
  if (NES_.watch) return;
  const tick = () => {
    if (!$('nes-wrap')) { NES_.watch = 0; return; }
    if (!NES_.running || EMU_.ejs) nesPadsPoll_();
    NES_.watch = requestAnimationFrame(tick);
  };
  NES_.watch = requestAnimationFrame(tick);
}
function nesPadUnwatch_() { cancelAnimationFrame(NES_.watch); NES_.watch = 0; }

/* THE TOUCH PAD only where there is touch and no controller. */
function nesPadShow_() {
  const pad = $('nes-pad');
  if (!pad) return;
  const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  pad.classList.toggle('on', !!(touch && !NES_.padOn && (NES_.nes || EMU_.ejs)));
  const n = $('nes-padnote');
  if (n) n.hidden = !NES_.padOn;
}

function nesPadWire_(pad) {
  if (!pad) return;
  const dirs = (el, e) => {
    const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const dead = r.width * 0.15;
    return { left: dx < -dead, right: dx > dead, up: dy < -dead, down: dy > dead };
  };
  const ptrs = new Map();
  const redo = () => {
    const t = {};
    ptrs.forEach(v => Object.keys(v).forEach(k => { if (v[k]) t[k] = 1; }));
    NES_.touch = t; nesSync_();
  };
  pad.addEventListener('pointerdown', e => {
    const k = e.target.closest('[data-k]');
    if (!k) return;
    e.preventDefault(); emuWake_();
    try { k.setPointerCapture(e.pointerId); } catch (err) {}
    ptrs.set(e.pointerId, k.dataset.k === 'dpad' ? dirs(k, e) : { [k.dataset.k]: true });
    redo();
  });
  pad.addEventListener('pointermove', e => {
    const k = e.target.closest('[data-k="dpad"]');
    if (k && ptrs.has(e.pointerId)) { ptrs.set(e.pointerId, dirs(k, e)); redo(); }
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n =>
    pad.addEventListener(n, e => { if (ptrs.delete(e.pointerId)) redo(); }));
  pad.addEventListener('contextmenu', e => e.preventDefault());
}

/* THE PADLOCK: no column swipe, wheel or arrow turn (`SWIPE.lock`, overworld.js) and no page scroll on the console. */
function nesLock_(on) {
  NES_.lock = !!on;
  try { SWIPE.lock = NES_.lock || !!NES_.full; } catch (e) {}
  const box = $('nes-box');
  if (box) box.classList.toggle('nes-locked', SWIPE.lock);
  nesTiles_();
}
['touchmove', 'wheel'].forEach(n => document.addEventListener(n, e => {
  if ((NES_.lock || NES_.full) && e.target && e.target.closest && e.target.closest('#nes-box, #nes-wrap') && e.cancelable) e.preventDefault();
}, { passive: false }));
on('nes-lock', () => nesLock_(!NES_.lock));

/* FULL SCREEN (390). The wrapper moves to <body> while full: a sliding column is transformed, and a transformed ancestor pins `fixed` to itself. */
const nesFsEl_ = () => document.fullscreenElement || document.webkitFullscreenElement || null;
function nesFullOn_() {
  const w = $('nes-wrap');
  if (!w || NES_.full) return;
  NES_.full = { parent: w.parentNode, next: w.nextSibling, real: false };
  document.body.appendChild(w);
  w.classList.add('nes-full');
  nesLock_(NES_.lock);
  nesFit_();
  const ask = w.requestFullscreen || w.webkitRequestFullscreen || w.webkitRequestFullScreen;
  if (ask) {
    try {
      const p = ask.call(w);
      NES_.full.real = true;
      if (p && p.catch) p.catch(() => { if (NES_.full) NES_.full.real = false; });
    } catch (e) {}
  }
}
function nesFullOff_() {
  const w = $('nes-wrap'), f = NES_.full;
  NES_.full = null;
  try {
    if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.webkitExitFullscreen && document.webkitFullscreenElement) document.webkitExitFullscreen();
  } catch (e) {}
  if (w) {
    w.classList.remove('nes-full');
    if (f && f.parent && f.parent.isConnected) f.parent.insertBefore(w, f.next && f.next.parentNode === f.parent ? f.next : null);
    else w.remove();
    const s = $('nes-stage'); if (s) { s.style.width = ''; s.style.height = ''; }
  }
  nesLock_(NES_.lock);
}
/* THE BIGGEST WHOLE-NUMBER SCALE when it fills nine tenths of the room, otherwise the plain fit; the system's own shape either way. */
function nesFit_() {
  const w = $('nes-wrap'), s = $('nes-stage');
  if (!NES_.full || !w || !s) return;
  const W = w.clientWidth || innerWidth, H0 = w.clientHeight || innerHeight;
  const portrait = H0 > W, pad = $('nes-pad'), padH = portrait && pad && pad.classList.contains('on') ? pad.offsetHeight + 16 : 0;
  const [dw, dh] = NES_DIMS[NES_.sys] || NES_DIMS.nes;
  const H = Math.max(60, H0 - padH - 16), fit = Math.min(W / dw, H / dh), whole = Math.floor(fit);
  const k = whole >= 1 && whole / fit >= 0.9 ? whole : fit;
  s.style.width = Math.floor(dw * k) + 'px'; s.style.height = Math.floor(dh * k) + 'px';
}
['resize', 'orientationchange'].forEach(n => addEventListener(n, () => setTimeout(nesFit_, 50)));
['fullscreenchange', 'webkitfullscreenchange'].forEach(n => document.addEventListener(n, () => {
  if (NES_.full && NES_.full.real && !nesFsEl_()) nesFullOff_(); else setTimeout(nesFit_, 50);
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && NES_.full) nesFullOff_(); });
on('nes-full', () => { if (NES_.full) nesFullOff_(); else nesFullOn_(); });

on('nes-play', () => {
  nesAudio_(); emuWake_();
  if (NES_.nes || EMU_.ready) { nesGo_(); return; }
  if (EMU_.ejs) return;   // still loading: it starts by itself
  const bytes = NES_.rom || NES_.saved;
  if (bytes) { nesStart_(bytes); return; }
  const f = $('nes-file');
  if (f) f.click();
});
on('nes-pick', () => { nesAudio_(); const f = $('nes-file'); if (f) f.click(); });
on('nes-pause', () => nesStop_());
on('nes-forget', () => {
  nesStop_();
  emuEnd_();
  NES_.nes = null; NES_.rom = null; NES_.saved = false; NES_.kind = null; NES_.img = null; NES_.u32 = null;
  const c = $('nes-canvas'); if (c) c.getContext('2d').clearRect(0, 0, 256, 240);
  nesForgetDb_().then(() => { nesTiles_(); nesSay_('Forgotten. The file is no longer kept on this device.'); });
});

document.addEventListener('change', e => {
  if (!e.target || e.target.id !== 'nes-file') return;
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  f.arrayBuffer().then(ab => {
    const u8 = new Uint8Array(ab), sys = nesSys_(u8, f.name);
    if (!sys) { nesSay_(NES_NOT); return; }
    nesStop_(); emuEnd_();
    NES_.nes = null; NES_.rom = null; NES_.saved = u8; NES_.kind = sys;
    /* put() copies the bytes as it is called, so no second copy is made first: a DS file can be 256 MB (399). */
    nesKeep_(ab, sys).then(ok => { if (ok || !NES_.fullDb) return; nesSay_(NES_ROOM); nesForgetDb_(); });
    nesStart_(u8);
  }).catch(() => nesSay_('That file could not be read.'));
});

/* KEYS ONLY WHILE A GAME RUNS, and the arrows do not turn the column under it. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (!NES_.running) return;
  const k = NES_KEYS[e.key];
  if (!k) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  e.preventDefault(); e.stopPropagation();
  NES_.keys[k] = type === 'keydown'; nesSync_();
}, true));

document.addEventListener('visibilitychange', () => { if (document.hidden) nesStop_(); });
window.addEventListener('gamepadconnected', () => { NES_.padOn = true; nesPadShow_(); nesPadWatch_(); });
window.addEventListener('gamepaddisconnected', () => nesPadsPoll_());

/* ---------- THE OTHER SYSTEMS (391): SNES, Game Boy / Color / Advance, N64 and DS (399), the person's own files.
   EmulatorJS (GPL-3.0) and its cores, pinned, fetched only when one is played. */
const NES_ACCEPT = '.nes,.sfc,.smc,.gb,.gbc,.gba,.z64,.n64,.v64,.nds,application/octet-stream,*&#47;*';
const NES_ROOM = "This device hasn't room to keep the file — pick it each time.";
const NES_NOT = 'That is not a console game file — it should be a .nes, .sfc/.smc, .gb/.gbc/.gba, .z64/.n64/.v64 or .nds file.';
/* Each system's picture in pixels, for the stage's shape and the full-screen fit. DS: its two 256x192 screens stacked, top above bottom. */
const NES_DIMS = { nes: [256, 240], snes: [256, 224], gb: [160, 144], gbc: [160, 144], gba: [240, 160], n64: [320, 240], nds: [256, 384] };
/* Systems with four face buttons read a controller by position (right A, bottom B, top X, left Y); two-button ones fold them onto A and B. */
const NES_FOUR = { snes: 1, n64: 1, nds: 1 };
const NES_NAME = { nes: 'NES', snes: 'SNES', gb: 'Game Boy', gbc: 'Game Boy Color', gba: 'Game Boy Advance', n64: 'N64', nds: 'DS' };

/* WHICH SYSTEM, from the bytes first (header magic and checksums), then the file's extension. Nothing of any game is kept here. */
function nesSys_(u8, hint) {
  if (!u8 || u8.length < 512) return null;
  const ext = String(hint || '').toLowerCase().replace(/^.*\./, '');
  if (u8[0] === 0x4e && u8[1] === 0x45 && u8[2] === 0x53 && u8[3] === 0x1a) return nesValid_(u8) ? 'nes' : null;
  if (nesDs_(u8)) return 'nds';
  const w = (u8[0] << 24 | u8[1] << 16 | u8[2] << 8 | u8[3]) >>> 0;
  if (w === 0x80371240 || w === 0x37804012 || w === 0x40123780) return 'n64';   // big-endian, byte-swapped, little-endian
  if (u8.length >= 0xc0 && u8[0xb2] === 0x96 && u8[3] === 0xea) return 'gba';   // fixed byte, and a branch as the first word
  if (u8.length >= 0x8000) {
    let x = 0;
    for (let i = 0x134; i <= 0x14c; i++) x = (x - u8[i] - 1) & 0xff;
    if (x === u8[0x14d] && (u8[0x100] === 0x00 || u8[0x100] === 0xc3)) return u8[0x143] & 0x80 ? 'gbc' : 'gb';
    const off = u8.length % 1024 === 512 ? 512 : 0;
    const ok = at => { const b = off + at; return b + 0x20 <= u8.length && ((u8[b + 0x1c] | u8[b + 0x1d] << 8) ^ (u8[b + 0x1e] | u8[b + 0x1f] << 8)) === 0xffff; };
    if (ok(0x7fc0) || ok(0xffc0)) return 'snes';
  }
  const by = { sfc: 'snes', smc: 'snes', snes: 'snes', gb: 'gb', gbc: 'gbc', gba: 'gba', z64: 'n64', n64: 'n64', v64: 'n64', nds: 'nds' };
  return by[ext] || (by[hint] ? hint : null);
}

/* A DS CARTRIDGE HEADER: the logo's fixed checksum 0xCF56 at 0x15C, and the header's own CRC-16 (over 0-0x15D) at 0x15E. */
function nesDs_(u8) {
  if (u8.length < 0x200 || u8[0x15c] !== 0x56 || u8[0x15d] !== 0xcf) return false;
  let c = 0xffff;
  for (let i = 0; i < 0x15e; i++) { c ^= u8[i]; for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xa001 : c >>> 1; }
  return c === (u8[0x15e] | u8[0x15f] << 8);
}

/* THE TOUCH PAD per system: shoulders where it has them, four face buttons in a diamond on SNES, and A, B, Z and the C buttons on N64. */
function nesPadHtml_(sys) {
  const k = (key, label, cls) => `<button type="button" class="nes-key ${cls || 'nes-round'}" data-k="${key}">${label}</button>`;
  const mid = `<div class="nes-mid">${k('select', 'Select', 'nes-small')}${k('start', 'Start', 'nes-small')}</div>`;
  const dpad = '<div class="nes-dpad" data-k="dpad"></div>';
  let top = '', face;
  if (sys === 'snes' || sys === 'nds') {
    top = k('l', 'L', 'nes-small') + k('r', 'R', 'nes-small');
    face = `<div class="nes-face">${k('x', 'X', 'nes-round nes-n')}${k('y', 'Y', 'nes-round nes-w')}${k('a', 'A', 'nes-round nes-e')}${k('b', 'B', 'nes-round nes-s')}</div>`;
  } else if (sys === 'n64') {
    top = k('l', 'L', 'nes-small') + k('l2', 'Z', 'nes-small') + k('r', 'R', 'nes-small');
    face = `<div class="nes-right"><div class="nes-ab">${k('y', 'B')}${k('b', 'A')}</div>`
      + `<div class="nes-face nes-c">${k('cu', 'C↑', 'nes-c1 nes-n')}${k('cl', 'C←', 'nes-c1 nes-w')}${k('cr', 'C→', 'nes-c1 nes-e')}${k('cd', 'C↓', 'nes-c1 nes-s')}</div></div>`;
  } else {
    if (sys === 'gba') top = k('l', 'L', 'nes-small') + k('r', 'R', 'nes-small');
    face = `<div class="nes-ab">${k('b', 'B')}${k('a', 'A')}</div>`;
  }
  return (top ? `<div class="nes-shoulders">${top}</div>` : '') + dpad + mid + face;
}

/* ONE SYSTEM AT A TIME on the stage: its shape, its pad, and the N64 line about older phones. */
function nesSysSet_(sys) {
  NES_.sys = sys || 'nes';
  const s = $('nes-stage'), pad = $('nes-pad'), note = $('nes-sysnote');
  if (s) { const [w, h] = NES_DIMS[NES_.sys]; s.style.aspectRatio = w + ' / ' + h; s.dataset.sys = NES_.sys; }
  if (pad && pad.dataset.sys !== NES_.sys) {
    pad.dataset.sys = NES_.sys; pad.innerHTML = nesPadHtml_(NES_.sys);
    pad.classList.toggle('nes-pad-top', /^(snes|gba|n64|nds)$/.test(NES_.sys));
  }
  if (note) { note.hidden = NES_.sys !== 'n64'; note.textContent = 'N64 games need a fast device; older phones may stutter.'; }
  nesFit_();
}

/* ---------- EMULATORJS, ONCE, with its menus, start button, own keys and own pad switched off: the Console's tiles and inputs drive it. */
const EMU_VER = '4.2.3';
const EMU_CDN = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];
const EMU_SRC = ['storage.js', 'gamepad.js', 'nipplejs.js', 'shaders.js', 'GameManager.js', 'compression.js', 'emulator.js'];
/* Gambatte for Game Boy and Color, mGBA for Advance (mGBA refused a Game Boy file in the test, 391). Safari on iPhone and iPad gets parallel_n64, as EmulatorJS itself chooses there. */
const EMU_CORE = { snes: 'snes9x', gb: 'gambatte', gbc: 'gambatte', gba: 'mgba', n64: 'mupen64plus_next', nds: 'melonds' };
/* RetroPad numbering (libretro): every input source's names land here. 16-23 are the sticks, sent as two half-axes each. */
const EMU_IDX = { b: 0, y: 1, select: 2, start: 3, up: 4, down: 5, left: 6, right: 7, a: 8, x: 9, l: 10, r: 11, l2: 12, r2: 13, l3: 14, r3: 15 };
const EMU_ = { ejs: null, ready: false, sys: null, key: '', base: null, lib: null, held: {}, ax: [] };

function emuLib_() {
  if (window.EmulatorJS && EMU_.base) return Promise.resolve(EMU_.base);
  if (EMU_.lib) return EMU_.lib;
  const one = src => new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = false; s.crossOrigin = 'anonymous';
    s.onload = ok;
    s.onerror = () => { s.remove(); no(new Error('engine did not load')); };
    document.head.appendChild(s);
  });
  const from = cdn => EMU_SRC.reduce((p, f) => p.then(() => one(cdn + '@emulatorjs/emulatorjs@' + EMU_VER + '/data/src/' + f)), Promise.resolve())
    .then(() => { if (!window.EmulatorJS) throw new Error('no engine'); EMU_.base = cdn; return cdn; });
  EMU_.lib = from(EMU_CDN[0]).catch(() => from(EMU_CDN[1])).catch(e => { EMU_.lib = null; throw e; });
  return EMU_.lib;
}

/* A NAME FOR THE BATTERY SAVE, from the bytes, so two games never share one; the file's own name is never used. */
function emuName_(u8, sys) {
  let h = 0x811c9dc5;
  for (let i = 0; i < u8.length; i += 1 + (u8.length >> 22)) { h ^= u8[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return 'game-' + h.toString(16) + '-' + u8.length.toString(16) + '.' + ({ snes: 'sfc', gb: 'gb', gbc: 'gbc', gba: 'gba', n64: 'z64', nds: 'nds' })[sys];
}

function emuStart_(bytes, sys) {
  const stage = $('nes-stage');
  if (!stage) return;
  const name = emuName_(bytes, sys);
  if (EMU_.ejs && EMU_.key === name) { emuGo_(); return; }
  nesStop_(); NES_.nes = null; emuEnd_();
  nesSysSet_(sys); nesSay_('');
  NES_.rom = bytes;
  stage.setAttribute('aria-busy', 'true');
  stage.insertAdjacentHTML('beforeend', loading_());
  emuLib_().then(cdn => {
    if (!$('nes-stage')) return;
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const core = sys === 'n64' && ios ? 'parallel_n64' : EMU_CORE[sys], pkg = cdn + '@emulatorjs/core-' + core + '@' + EMU_VER + '/';
    const files = { [core + '.json']: pkg + 'reports/' + core + '.json' };
    ['-wasm.data', '-legacy-wasm.data'].forEach(t => { files[core + t] = pkg + core + t; });
    const host = document.createElement('div');
    host.id = 'emu-host'; host.className = 'emu-host';
    $('nes-stage').appendChild(host);
    const none = { 0: {}, 1: {}, 2: {}, 3: {} };
    const ejs = new window.EmulatorJS('#emu-host', {
      gameUrl: bytes, gameName: name, system: core, dataPath: cdn + '@emulatorjs/emulatorjs@' + EMU_VER + '/data/',
      filePaths: files, startOnLoad: true, defaultControllers: none, noAutoFocus: true, disableLocalStorage: true,
      volume: 1, threads: false, backgroundColor: '#000', buttonOpts: {}, cheats: [] });
    EMU_.ejs = ejs; EMU_.sys = sys; EMU_.key = name; EMU_.ready = false; EMU_.held = {}; EMU_.ax = [];
    const fail = m => { if (EMU_.ejs !== ejs) return; loaded_($('nes-stage')); emuEnd_(); nesTiles_(); nesSay_('This game file could not be started: ' + (m || 'the engine stopped') + '.'); };
    const said = ejs.startGameError.bind(ejs);
    ejs.startGameError = m => { try { said(m); } catch (e) {} fail(String(m || '').replace(/\s+/g, ' ')); };
    ejs['on']('start', () => {   // EmulatorJS's own event, not a tile
      if (EMU_.ejs !== ejs) return;
      loaded_($('nes-stage'));
      EMU_.ready = true;
      try { ejs.gameManager.setKeyboardEnabled(false); } catch (e) {}
      ejs.enableMouseLock = false;   // a DS screen is touched where it is, so a mouse click must not capture the pointer (399)
      if (sys === 'nds') emuTouch_(ejs.canvas);
      if (!$('nes-wrap') || document.hidden) { try { ejs.pause(true); } catch (e) {} NES_.running = false; }
      else NES_.running = true;
      emuWake_(); nesTiles_(); nesFit_();
    });
  }).catch(() => { loaded_(stage); emuEnd_(); nesTiles_(); nesSay_('The console could not load. Check the connection and press Play again.'); });
}

/* A FINGER IS THE DS PEN: the core reads only the mouse, so the first finger on its picture is passed on as one (399). */
function emuTouch_(c) {
  if (!c || c.dataset.touch) return;
  c.dataset.touch = '1';
  let id = null;
  const as = (type, t) => c.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY, button: 0, buttons: type === 'mouseup' ? 0 : 1 }));
  const mine = e => [...e.changedTouches].find(t => t.identifier === id);
  c.addEventListener('touchstart', e => {
    e.preventDefault(); emuWake_();
    if (id !== null) return;
    const t = e.changedTouches[0]; id = t.identifier; as('mousemove', t); as('mousedown', t);
  }, { passive: false });
  c.addEventListener('touchmove', e => { e.preventDefault(); const t = mine(e); if (t) as('mousemove', t); }, { passive: false });
  ['touchend', 'touchcancel'].forEach(n => c.addEventListener(n, e => { const t = mine(e); if (t) { id = null; as('mouseup', t); } }));
}

function emuGo_() {
  if (!EMU_.ready || NES_.running) return;
  try { EMU_.ejs.play(true); } catch (e) { return; }
  NES_.running = true; emuWake_(); nesTiles_();
}
/* PAUSE KEEPS THE BATTERY SAVE: the cartridge's memory is written to this device's IndexedDB (EmulatorJS's own) at every pause. */
function emuPause_() {
  if (!EMU_.ready) return;
  emuSync_(true);
  try { EMU_.ejs.pause(true); } catch (e) {}
  try { EMU_.ejs.gameManager.saveSaveFiles(); } catch (e) {}
}
/* THE SOUND WAKES INSIDE A TAP: iOS starts EmulatorJS's audio suspended, and its own "click to resume" box is hidden with its menus. */
function emuWake_() {
  try {
    const al = EMU_.ejs && EMU_.ejs.Module && EMU_.ejs.Module.AL;
    if (al && al.currentCtx) al.currentCtx.sources.forEach(c => { const x = c.gain && c.gain.context; if (x && x.state === 'suspended') x.resume(); });
    if (al && al.currentCtx && al.currentCtx.audioCtx && al.currentCtx.audioCtx.state === 'suspended') al.currentCtx.audioCtx.resume();
  } catch (e) {}
}
function emuEnd_() {
  const ejs = EMU_.ejs;
  EMU_.ejs = null; EMU_.ready = false; EMU_.sys = null; EMU_.key = ''; EMU_.held = {}; EMU_.ax = [];
  if (ejs) {
    try { if (ejs.started) ejs.gameManager.saveSaveFiles(); } catch (e) {}
    try { ejs.callEvent('exit'); } catch (e) {}
  }
  const h = $('emu-host'); if (h) h.remove();
}

/* EVERY SOURCE OR-ED, then only changes reach the core. On N64 the arrows and the touch D-pad steer the stick, which is how its games are driven. */
function emuSync_(off) {
  const g = EMU_.ready && EMU_.ejs && EMU_.ejs.gameManager;
  if (!g) return;
  const src = k => !off && !!(NES_.keys[k] || NES_.pads[k] || NES_.touch[k]);
  const n64 = EMU_.sys === 'n64', dig = k => !off && !!(NES_.keys[k] || NES_.touch[k]);
  Object.keys(EMU_IDX).forEach(k => {
    const on = n64 && /^(up|down|left|right)$/.test(k) ? !off && !!NES_.pads[k] : src(k);
    if (on === !!EMU_.held[k]) return;
    EMU_.held[k] = on;
    try { g.simulateInput(0, EMU_IDX[k], on ? 1 : 0); } catch (e) {}
  });
  const pa = off ? [0, 0, 0, 0] : NES_.axes || [0, 0, 0, 0], one = (p, m) => (dig(p) ? 1 : 0) - (dig(m) ? 1 : 0);
  const lx = n64 && one('right', 'left') ? one('right', 'left') : pa[0], ly = n64 && one('down', 'up') ? one('down', 'up') : pa[1];
  const rx = one('cr', 'cl') || pa[2], ry = one('cd', 'cu') || pa[3];
  [lx, ly, rx, ry].forEach((v, i) => {
    const plus = Math.round(Math.max(0, v) * 0x7fff), minus = Math.round(Math.max(0, -v) * 0x7fff), at = 16 + i * 2;
    if (EMU_.ax[at] !== plus) { EMU_.ax[at] = plus; try { g.simulateInput(0, at, plus); } catch (e) {} }
    if (EMU_.ax[at + 1] !== minus) { EMU_.ax[at + 1] = minus; try { g.simulateInput(0, at + 1, minus); } catch (e) {} }
  });
}
