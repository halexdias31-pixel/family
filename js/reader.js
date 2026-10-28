/* ================= SPEED READ (403): ONE WORD AT A TIME, AT A FIXED POINT ================= */
/* Each word where the eye already is, its recognition letter (~35% in) gold on the guide. A tile on cards; a Tools widget. */

const SPEED_MIN = 150, SPEED_MAX = 700, SPEED_STEP = 25;
const SPEED = { words: [], i: 0, wpm: 300, playing: false, timer: 0, wait: 0, x: null };
try { const w = Number(localStorage.getItem('speedWpm')); if (w >= SPEED_MIN && w <= SPEED_MAX) SPEED.wpm = w; } catch (e) {}

/* WHICH THINGS HAVE WORDS LONG ENOUGH TO BE WORTH IT. */
function speedFor_(x) {
  if (!x || !x.key) return false;
  if (x.kind === 'content' || x.kind === 'practical' || x.kind === 'project') return true;
  /* A QUESTION'S WORDS ARE SHORT (502, rule `speed-long`): Universal gives it Speed read too */
  if (x.kind === 'question') return (typeof ruleOn_ === 'function' && !ruleOn_('speed-long')) && !!speedText_(x);
  return x.kind === 'bible' && !!x.bb;
}
function speedTile_(x) {
  if (!speedFor_(x)) return '';
  return tile_({ icon: 'speed', label: 'Speed read', note: 'one word at a time', act: 'speed-open', data: { key: x.key } });
}

/* THE WORDS OF A THING, in the order its card shows them; '' while they are still in the Ledger or on their way. */
function speedText_(x) {
  if (!x) return '';
  const r = x.row || {};
  const add = (out, v) => { [].concat(v || []).forEach(i => {
    const t = i && typeof i === 'object' ? [i.name, i.text].filter(Boolean).join(': ') : i;
    const p = plainText_(t);
    if (p) out.push(p);
  }); return out; };
  if (x.kind === 'content') return add(add(add([x.name], r.words), r.formulas), r.points).join('\n\n');
  if (x.kind === 'practical') return add(add(add([x.name], r.aim), r.steps), r.outcome).join('\n\n');
  if (x.kind === 'question') return add([], [x.lead, x.html].concat((x.stems || []).map(p => p && p.html)).filter(Boolean)).join('\n\n');
  if (x.kind === 'project') return add(add(add([x.name], r.summary), r.makes), r.steps).join('\n\n');
  if (x.kind === 'bible' && x.bb) {
    const d = typeof BIBLE !== 'undefined' && BIBLE.books[x.bb.n];
    const v = d && d.chapters[Number(x.ch) - 1] && d.chapters[Number(x.ch) - 1][Number(x.v) - 1];
    return v ? String(v).replace(/^#\s*/, '').replace(/[\[\]]/g, '') : '';
  }
  return '';
}

/* ---------- THE WORDS, EACH WITH HOW LONG IT STAYS ---------- */
function speedWords_(text) {
  const out = [];
  String(text || '').split(/\n\s*\n/).forEach(par => {
    const ws = par.split(/\s+/).filter(Boolean);
    ws.forEach((w, j) => out.push({ w: w, end: j === ws.length - 1 }));
  });
  return out;
}
/* THE RECOGNITION LETTER: about 35% into the letters, not counting the punctuation round them. */
function speedOrp_(w) {
  const lead = (/^[^A-Za-z0-9À-ɏ]*/.exec(w) || [''])[0].length;
  const core = w.slice(lead).replace(/[^A-Za-z0-9À-ɏ]+$/, '');
  const n = Math.max(1, core.length);
  return Math.min(w.length - 1, lead + Math.max(0, Math.ceil(n * 0.35) - 1));
}
/* A COMMA HOLDS TWICE AS LONG, A FULL STOP THREE TIMES, A PARAGRAPH'S END LONGER STILL; a long word a little longer. */
function speedMs_(o) {
  const base = 60000 / SPEED.wpm;
  let k = 1;
  if (o.w.replace(/[^A-Za-z0-9]/g, '').length > 8) k *= 1.3;
  if (/[.!?]["'”’)]*$/.test(o.w)) k *= 3;
  else if (/[,;:—–-]["'”’)]*$/.test(o.w)) k *= 2;
  if (o.end) k *= 1.4;
  return base * k;
}

/* ---------- THE OVERLAY ---------- */
function speedSheet_() {
  return `<div class="rsvp" id="rsvp">
    <div class="rsvp-stage" aria-live="off">
      <span class="rsvp-tick rsvp-tick-t" aria-hidden="true"></span>
      <div class="rsvp-word" id="rsvp-word">${loading_()}</div>
      <span class="rsvp-tick rsvp-tick-b" aria-hidden="true"></span>
    </div>
    <p class="faint rsvp-at" id="rsvp-at"></p>
    <div class="tile-row rsvp-tiles">
      ${tile_({ icon: 'undo', label: 'Back', note: 'a sentence', act: 'speed-back' })}
      ${tile_({ icon: 'play', label: 'Play', act: 'speed-play', cls: 'rsvp-play' })}
    </div>
    <label class="rsvp-speed"><span id="rsvp-wpm-say">${SPEED.wpm} words a minute</span>
      <input type="range" id="rsvp-wpm" min="${SPEED_MIN}" max="${SPEED_MAX}" step="${SPEED_STEP}" value="${SPEED.wpm}"></label>
  </div>`;
}
function speedOpen_(title, text, x) {
  speedStop_();
  SPEED.x = x || null;
  SPEED.words = [];
  SPEED.i = 0;
  openSheet(title || 'Speed read', speedSheet_(), speedClose_);
  if (text) speedLoad_(text);
  else speedAwait_(x);
}
function speedLoad_(text) {
  SPEED.words = speedWords_(text);
  SPEED.i = 0;
  clearInterval(SPEED.wait); SPEED.wait = 0;
  const el = $('rsvp-word');
  if (!el) return;
  if (!SPEED.words.length) { el.innerHTML = '<p class="empty">No words to read.</p>'; return; }
  speedShow_();
}
/* WAITING FOR THE WORDS: the Ledger's (`libItems`) or a book of the Bible — the three dots until they come. */
function speedAwait_(x) {
  if (x && x.kind === 'bible' && x.bb && typeof bibleLoad_ === 'function') {
    bibleLoad_(x.bb.n).then(() => {
      if (SPEED.x !== x) return;
      const t = speedText_(x);
      if (t) speedLoad_(t);
      else { const el = $('rsvp-word'); if (el) el.innerHTML = '<p class="empty">This verse did not arrive.</p>'; }
    });
    return;
  }
  if (typeof libWant_ === 'function') libWant_(x);
  const el = $('rsvp-word');
  if (el && typeof libSlim_ === 'function' && libSlim_(x) && typeof libSay_ === 'function') el.innerHTML = libSay_(x);
  SPEED.wait = setInterval(() => {
    if (SPEED.x !== x) { clearInterval(SPEED.wait); SPEED.wait = 0; return; }
    if (typeof libSlim_ === 'function' && libSlim_(x)) return;
    speedLoad_(speedText_(x));
  }, 400);
}
function speedShow_() {
  const el = $('rsvp-word'), o = SPEED.words[SPEED.i];
  if (!el || !o) return;
  const at = speedOrp_(o.w);
  el.innerHTML = `<span class="rsvp-pre">${esc(o.w.slice(0, at))}</span><span class="rsvp-orp">${esc(o.w.charAt(at))}</span><span class="rsvp-post">${esc(o.w.slice(at + 1))}</span>`;
  const say = $('rsvp-at');
  if (say) say.textContent = (SPEED.i + 1) + ' of ' + SPEED.words.length;
}
function speedPaintPlay_() {
  document.querySelectorAll('.rsvp-play').forEach(el => tileSet_(el, SPEED.playing
    ? { icon: 'pause', label: 'Pause', on: true } : { icon: 'play', label: 'Play', on: false }));
}
function speedTick_() {
  SPEED.timer = 0;
  if (!SPEED.playing || !$('rsvp')) { SPEED.playing = false; speedPaintPlay_(); return; }
  speedShow_();
  const o = SPEED.words[SPEED.i];
  SPEED.timer = setTimeout(() => {
    if (SPEED.i >= SPEED.words.length - 1) { SPEED.playing = false; speedPaintPlay_(); return; }
    SPEED.i++;
    speedTick_();
  }, speedMs_(o));
}
function speedStop_() {
  SPEED.playing = false;
  clearTimeout(SPEED.timer); SPEED.timer = 0;
  speedPaintPlay_();
}
function speedClose_() {
  speedStop_();
  clearInterval(SPEED.wait); SPEED.wait = 0;
  SPEED.x = null;
}

on('speed-open', el => {
  const k = el && el.getAttribute('data-key');
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  if (!x && typeof bibleByKey_ === 'function') x = bibleByKey_(k);
  if (!x) return;
  speedOpen_(x.name || 'Speed read', speedText_(x), x);
});
on('speed-play', () => {
  if (!SPEED.words.length) return;
  if (SPEED.playing) { speedStop_(); return; }
  if (SPEED.i >= SPEED.words.length - 1) SPEED.i = 0;
  SPEED.playing = true;
  speedPaintPlay_();
  speedTick_();
});
/* BACK A SENTENCE: to the start of the one being read, or, at its start already, the one before. */
on('speed-back', () => {
  if (!SPEED.words.length) return;
  const ends = i => i >= 0 && /[.!?]["'”’)]*$/.test(SPEED.words[i].w);
  let i = SPEED.i - 1;
  while (i > 0 && !ends(i - 1)) i--;
  if (i >= SPEED.i - 1) { i = Math.max(0, i - 1); while (i > 0 && !ends(i - 1)) i--; }
  SPEED.i = Math.max(0, i);
  clearTimeout(SPEED.timer);
  if (SPEED.playing) speedTick_(); else speedShow_();
});
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'rsvp-wpm') return;
  SPEED.wpm = Math.min(SPEED_MAX, Math.max(SPEED_MIN, Number(e.target.value) || 300));
  const say = $('rsvp-wpm-say');
  if (say) say.textContent = SPEED.wpm + ' words a minute';
  try { localStorage.setItem('speedWpm', String(SPEED.wpm)); } catch (err) {}
});

/* ---------- THE TOOLS WIDGET: PASTE, THEN READ ---------- */
function initSpeedRead() {
  const t = $('sr-text');
  if (t && !t.value) { try { t.value = localStorage.getItem('speedDraft') || ''; } catch (e) {} }
}
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'sr-text') return;
  try { localStorage.setItem('speedDraft', e.target.value); } catch (err) {}
});
on('sr-read', () => {
  const t = $('sr-text');
  const text = t ? String(t.value || '').trim() : '';
  if (!text) { toast('Paste some text first'); return; }
  speedOpen_('Speed read', text, null);
});
