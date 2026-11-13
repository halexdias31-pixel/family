/* @family. — tools.js THE TIMER, THE CALENDAR, THE TIMETABLE AND TOUCH TYPING: Find's Tools cards (owner, 12 Nov), back from games.js (docs/history/1110). */

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

on('timer-reset', el => {
  if (!sure_(el, 'Reset it?')) return;
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
/* THE MONTH ON SCREEN, { y, m }; null until the card first starts. */
let CAL_VIEW = null;
/* `MONTHS` was a second copy of the twelve month names, identical to `MONTH_NAMES` in data.js.
   Two lists of the same twelve words is two places to fix a typo and one of them will be missed. */

/* ---------- A PLAIN CALENDAR (466) ----------
   The owner: "It's a plain calendar." No terms, sessions, exams or holidays are laid on it; term end dates are the Term dates widget. */

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

  const cells = [];
  ['M','T','W','T','F','S','S'].forEach(d => cells.push(`<span class="cal-h">${d}</span>`));
  for (let i = 0; i < startDay; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const isToday = new Date(y, m, d).getTime() === today.getTime();
    cells.push(`<span class="cal-d${isToday ? ' cal-today' : ''}" data-d="${d}">${d}</span>`);
  }
  host.innerHTML = cells.join('');
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
        .catch(err => toast('Timetable not saved — ' + why_(err)));
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
    return tile_({ form: true, look: 'tmt-row', act: 'tmt-open', data: { id: l.id }, attrs: style.trim(),
      html: `<span class="tmt-at">${esc(l.at || '--:--')}</span><span class="tmt-what"><span class="tmt-sub">${esc(l.subject || 'Untitled')}</span>${
        l.note ? `<span class="tmt-note">${esc(l.note)}</span>` : ''}</span>` });
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
        ${tile_({ form: true, label: 'Done', act: 'tmt-open', data: { id: id }, kind: 'quiet' })}
        ${tile_({ form: true, label: 'Remove', act: 'tmt-drop', data: { id: id }, kind: 'danger' })}
      </div>
    </div>`;
}

/* A BOOKED SESSION WAS DRAWN HERE, LOCKED. The timetable is only its own lessons now: nothing syncs into it (466). */
function tmtHtml_() {
  const t = tmtRead_();
  /* NOT SAVED WHEN DRAWN AHEAD (`AHEAD.running`, shell.js; docs/history/341). § */
  if (tmtColours_(t) && !(typeof AHEAD !== 'undefined' && AHEAD.running)) tmtSave_(t);
  const shown = t.weekend ? 7 : 5;
  if (TMT_DAY < 0) TMT_DAY = (new Date().getDay() + 6) % 7;      // Monday-first, as SLOT_DAYS is
  if (TMT_DAY >= shown) TMT_DAY = 0;
  const rows = (t.days[TMT_DAY] || []).map(l => ({ at: l.at || '99', html: () => tmtRow_(l, t) }))
    .sort(tmtOrder_);
  const chips = TMT_DAY_NAMES.slice(0, shown).map((n, i) =>
    tile_({ form: true, look: 'tmt-day' + (i === TMT_DAY ? ' on' : '') + ((t.days[i] || []).length ? ' has' : ''),
      act: 'tmt-day', data: { day: i }, pressed: i === TMT_DAY, aria: n, label: n.slice(0, 3) })).join('');
  return `<div class="tmt">
    <div class="tmt-days n${shown}">${chips}</div>
    <div class="tmt-list">${rows.length ? rows.map(r => r.html()).join('')
      : empty_('Nothing on ' + TMT_DAY_NAMES[TMT_DAY] + '.')}</div>
    ${/* ONE ROW FOR BOTH, because a full Monday at 320 is the card that runs out of height first and
          a line of its own for a tickbox is 44px of it. */''}
    <div class="tmt-foot">${tile_({ form: true, label: 'Add a lesson', act: 'tmt-add', kind: 'quiet' })}
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
  if (!sure_(el, 'Remove it?')) return;
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
  'zebra zero zone box fox mix next fix exam extra van vote very cave move back black cabin ' +
  'blank bank came come name climb maze lazy jazz and for have from will one would about which ' +
  'when make can like time just know take people into year good some could them see other than ' +
  'then now look only over think also after use too how work first well way even new want because ' +
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
    return tile_({ form: true, look: 'kt-rung' + (i === p.at ? ' on' : '') + ((p.held[i] || 0) >= KT_LINES_TO_OPEN ? ' held' : ''),
      act: 'kt-lesson', data: { n: i }, pressed: i === p.at, off: shut, aria: l.name + (shut ? ' (not open yet)' : ''), label: i + 1 });
  }).join('');
  const toGo = p.at === p.open && p.open < KT_LESSONS.length - 1
    ? Math.max(0, KT_LINES_TO_OPEN - (p.held[p.at] || 0)) : 0;
  /* THE LINE IS ONE BUTTON WITH NO WHITESPACE INSIDE IT — the spans run on — because a gap between
     them in the markup is a space drawn in the middle of the line that nobody is meant to type. */
  return `<div class="kt-rungs">${rungs}</div>
    <p class="kt-lesson"><b>${esc(L.name)}</b>${toGo
      ? ` <span>· ${toGo} more at ${Math.round(KT_HOLD * 100)}% opens ${esc(KT_LESSONS[p.at + 1].name)}</span>`
      : ''}</p>
    ${tile_({ form: true, look: 'kt-line', act: 'kt-focus', aria: 'Type this line: ' + s.line, html: `<span class="kt-done">${
      esc(s.line.slice(0, s.pos))}</span><span class="kt-cur${s.miss ? ' miss' : ''}${cur === ' ' ? ' sp' : ''}">${
      esc(cur)}</span><span class="kt-rest">${esc(s.line.slice(s.pos + 1))}</span>` })}
    <p class="kt-hint"><span class="kt-go">Tap the line, then type.</span><span class="kt-on">Eyes here, not on your hands.</span></p>
    <div class="kt-stats"><span><b class="kt-wpm">${wpm}</b> wpm</span><span><b class="kt-acc">${
      Math.round(acc * 100)}%</b> right</span>${p.best ? `<span>best ${p.best}</span>` : ''}</div>
    ${ktBoardHtml_(cur, s.miss)}
    <p class="note kt-said" aria-live="polite">${esc(s.said || '')}</p>
    <p class="kt-real">Made for a real keyboard. A phone's own keys work, but the point is not looking down.</p>`;
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



/* ---------- ONE MORE THING: a fact a card, tap for the next (owner, 12 Nov: a tool again). Words only; a clip opens where it lives. */
function feedColours(seed) {
  /* ONE OF THE TEN SUBJECT COLOURS (the timetable's tokens), fading to the page; the subject's word in ink. */
  return [`var(--tmt-${hashOf(String(seed || '?')) % 10})`, 'var(--bg)', 'var(--ink)'];
}
function feedSlide(it) {
  const c = feedColours(it.subject);
  const clip = it.clip && /^https?:\/\//i.test(it.clip) ? `<div class="tile-row">${tile_({ icon: 'film', label: 'Watch', note: 'the clip', act: 'file-view', data: { url: it.clip, title: it.heading || 'The clip' } })}</div>` : '';
  return `<div class="feed-art" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
    <span class="feed-mark">${esc(initial(it.subject))}</span>
    <span class="feed-credit"></span>
    <div class="feed-text">
      <span class="feed-subject">${esc(it.subject)}</span>
      ${it.heading ? `<h3 class="feed-head">${esc(it.heading)}</h3>` : ''}
      ${it.body ? `<p class="feed-body">${esc(it.body)}</p>` : ''}${clip}
    </div>
  </div>`;
}
