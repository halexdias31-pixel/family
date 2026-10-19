/* @family. — keypad.js THE ANSWER BOX, IN TWO KINDS: § */

/* ---------- WHICH ANSWERS ARE MATHS § */
const KP_WORDED = { explain: 1, written: 1, proof: 1, drawing: 1, annotate: 1 };
/* THE NUMBER AT THE FRONT, AND EVERY WORD AFTER IT GOES. § */
const KP_LEAD = new RegExp('^(-?[\\d.,\\/\\s]*' + MARK_NUM + ')\\s*[a-z\u00b0%].*$');
const kpMathsy_ = w => {
  const s = markNorm_(w).replace(KP_LEAD, '$1').trim().replace(/\u221a|\u03c0/g, '1')
    .replace(/\s+[a-z]{1,3}(?:[\/\^][a-z0-9]+|[²³])?$/, '');
  return !!s && /[0-9a-z]/.test(s) && !/[a-z]{2,}/.test(s);
};
function ansMaths_(x) {
  if (!x) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  const t = String(x.answerType || '').trim().toLowerCase();
  if (KP_WORDED[t]) return false;
  /* a `rule:` way (markRule_) is a test, not an answer, so it says nothing about the keys */
  const ways = String(x.accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  /* A CALCULATION WITH A SCHEME THAT IS WORDS is a calculation whose answer is a sentence — "Yes,
     because 3 kg covers 45 m²" — and that is the letters' job. */
  if (t === 'calculation') return !ways.length || ways.every(kpMathsy_);
  return ways.length > 0 && ways.every(kpMathsy_);
}

/* ---------- WHICH ANSWERS ARE ESSAYS § */
const KP_ESSAY_TYPES = { written: 1, explain: 1 };
const KP_ESSAY_MARKS = 6;
const KP_ESSAY_NOT = /\bmath|statistic/i;
function ansEssay_(x) {
  if (!x || ansMaths_(x) || padWanted_(x)) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  if (KP_ESSAY_NOT.test(String(x.subject || (x.row && x.row.subject) || ''))) return false;
  return !!KP_ESSAY_TYPES[String(x.answerType || '').trim().toLowerCase()] && Number(x.marks) >= KP_ESSAY_MARKS;
}
/* AND HOW LONG IT IS, in words -- the one thing a pupil checks about an essay while writing it, so the sheet says it under itself rather than leaving it to be § */
const KP_NOT_WORD = /^[.,;:!?'"()\[\]\-‐-―‘-‟…·*\/]+$/;
function kpWordCount_(v) { return (String(v || '').match(/\S+/g) || []).filter(w => !KP_NOT_WORD.test(w)).length; }
function kpWordsSay_(n) { return n + (n === 1 ? ' word' : ' words'); }

/* ---------- THE SIGNS A SCHEME NEEDS AND THE DIGITS DO NOT HAVE § */
const KP_SIGN_RE = /[<>\u2264\u2265\u00b1]|\d\s*:\s*\d/;
function kpSigns_(x) {
  if (!x) return false;
  const accept = String(x.accept || '').trim();
  if (accept) return KP_SIGN_RE.test(accept);
  const lead = String(x.answer || '').split(/&mdash;|\u2014/)[0].replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&le;/g, '\u2264').replace(/&ge;/g, '\u2265')
    .replace(/&plusmn;/g, '\u00b1');
  return KP_SIGN_RE.test(lead);
}

/* ---------- THE KEYS § */
const KP_KEYS = [
  { t: '7' }, { t: '8' }, { t: '9' }, { t: '\u00f7', a: 'divide' },
  { t: '(', a: 'open bracket' }, { t: ')', a: 'close bracket' },
  { t: '4' }, { t: '5' }, { t: '6' }, { t: '\u00d7', a: 'times' },
  { v: '!frac', a: 'fraction', c: ' kp-op',
    t: '<span class="kp-fr"><i></i><b></b><i></i></span>' },
  { v: '!pow', a: 'power', c: ' kp-op', t: '<span class="kp-pw">x<sup>y</sup></span>' },
  { t: '1' }, { t: '2' }, { t: '3' }, { v: '-', a: 'minus', t: '\u2212' },
  { v: '!sqrt', a: 'square root', c: ' kp-op', t: '\u221a' }, { t: '\u03c0', a: 'pi', c: ' kp-op' },
  { t: '0' }, { t: '.', a: 'point' }, { t: ',', a: 'comma' }, { t: '+', a: 'plus' },
  { t: 'x', a: 'x, the letter', c: ' kp-op' }, { t: '=', a: 'equals' },
  /* `abc` IS THE LETTERS, ON THIS PAD. It was "type with the keyboard instead" and handed the box to
     the phone (see the header); now it only turns the pad over, and `123` on the letters turns it
     back. */
  { v: '!abc', a: 'letters', c: ' kp-mode', t: 'abc' },
  { v: '!left', a: 'move left', c: ' kp-mode', t: '\u2190' },
  { v: '!right', a: 'move right', c: ' kp-mode', t: '\u2192' },
  { v: ' ', a: 'space', c: ' kp-mode', t: '\u2423' },
  /* ---------- ⌫ IS RED, AND ITS MARK IS DRAWN § */
  { v: '!back', a: 'delete', c: ' kp-del',
    t: '<svg class="kp-del-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"'
     + ' stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
     + '<path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z"/><path d="m12.5 9.5 5 5M17.5 9.5l-5 5"/></svg>' },
  /* ✓ IS SEND: the same paper aeroplane as the Send tile beside the box (`ansBox_`), because it is the same act -- one mark for "mark it" wherever the child is § */
  { v: '!done', a: 'done', c: ' kp-done', icon: 'send' },
];
/* THE SIGNS ROW (`kpSigns_`), in the structures' amber because they are the keys that make an answer
   mathematical. `t` is drawn as markup, so `<` and `>` are written as entities there and typed as
   themselves through `v`. */
const KP_SIGN_KEYS = [
  { v: '<', t: '&lt;', a: 'less than', c: ' kp-op' },
  { t: '\u2264', a: 'less than or equal to', c: ' kp-op' },
  { t: '\u2265', a: 'greater than or equal to', c: ' kp-op' },
  { v: '>', t: '&gt;', a: 'greater than', c: ' kp-op' },
  { t: ':', a: 'colon, for a ratio', c: ' kp-op' },
  { t: '\u00b1', a: 'plus or minus', c: ' kp-op' },
];

/* ---------- THE LETTERS § */
const kpCh_ = (t, a, span, at) => ({ t: t, a: a || '', c: ' kp-ch', span: span || 6, at: at || 0 });
const KP_ABC = [].concat(
  'qwertyuiop'.split('').map(c => kpCh_(c)),
  'asdfghjkl'.split('').map((c, i) => kpCh_(c, '', 6, i ? 0 : 4)),
  [{ v: '!shift', a: 'capitals', c: ' kp-shift kp-mode', span: 9, t: '\u21e7' }],
  'zxcvbnm'.split('').map(c => kpCh_(c)),
  [kpCh_('\'', 'apostrophe', 9), kpCh_(',', 'comma'), kpCh_('.', 'full stop'),
   { v: ' ', a: 'space', c: ' kp-space kp-mode', span: 36, t: 'space' },
   kpCh_('?', 'question mark'), kpCh_('-', 'hyphen')]);
/* THE BOTTOM ROW, THE MATHS PAD'S OWN with `123` where `abc` was. § */
const KP_DONE_ESSAY = { v: '!done', a: 'done, put the keypad away', c: ' kp-done kp-done-k', t: 'done' };
const kpBottom_ = (words, essay) => KP_KEYS.slice(-6).map(k =>
  k.v === '!abc' ? { v: '!123', a: 'numbers and maths', c: ' kp-mode', t: '123' }
  : (words && !essay && k.v === ' ') ? { v: '!nl', a: 'new line', c: ' kp-mode', t: '\u21b5' }
  : (essay && k.v === '!done') ? KP_DONE_ESSAY : k)
  .map(k => Object.assign({}, k, { span: 10 }));
/* ---------- AN ESSAY'S LETTERS: A RETURN KEY YOU CAN SEE § */
const KP_RETURN = { v: '!nl', a: 'return, a new line', c: ' kp-mode kp-ret', span: 12,
  t: '<span class="kp-ret-i" aria-hidden="true">\u21b5</span><span class="kp-ret-k">return</span>' };
const KP_ABC_ESSAY = KP_ABC.map(k => (k.c === ' kp-space kp-mode' ? Object.assign({}, k, { span: 24 }) : k)).concat([KP_RETURN]);

/* A KEY IS A BUTTON AND NOT A TILE, the one place on a question's pages the owner's *"it should all be tiles"* does not reach, and on purpose: § */
const kpKey_ = k => `<button type="button" class="kp-key${k.c || ''}" data-do="kp-key"
  data-v="${esc(k.v != null ? k.v : k.t)}"${k.a ? ` aria-label="${esc(k.a)}"` : ''}${
  k.span ? ` style="grid-column:${k.at ? k.at + ' / ' : ''}span ${k.span}"` : ''}>${
  k.icon ? tileIcon_(k.icon) : k.t}</button>`;
/* THE PAD'S KEYS FOR A LAYOUT AND A BOX. § */
function kpPadHtml_(layer, words, signs, essay) {
  if (layer === 'abc') return (essay ? KP_ABC_ESSAY : KP_ABC).concat(kpBottom_(words, essay)).map(kpKey_).join('');
  return (signs ? KP_SIGN_KEYS : []).concat(KP_KEYS).map(k => (essay && k.v === '!done' ? KP_DONE_ESSAY : k)).map(kpKey_).join('');
}

/* ---------- THE BOX § */
const KP_HOLE = '\u03d9', KP_CARET = '\u03db';
/* `kind` 'essay' IS A WORDED BOX THAT IS A SHEET (`ansEssay_`): § */
/* `multi` IS ONE OF SEVERAL BOXES FOR ONE ANSWER (find.js `multiBoxes_`, 362): `{ n, k }`, the box's place and the answer's key. */
function kpField_(k, val, kind, signs, name, multi) {
  const essay = kind === 'essay';
  const words = kind === 'words' || essay;
  const v = val == null ? '' : String(val);
  const lock = `class="qp-ans-in kp-in" ${multi ? `data-do="qp-multi" data-n="${multi.n}" data-mk="${esc(multi.k)}"` : 'data-do="qp-ans"'} data-k="${esc(k)}" data-kp="${words ? 'words' : 'maths'}"${
    signs ? ' data-kp-signs="1"' : ''}${essay ? ' data-kp-essay="1"' : ''} aria-label="${esc(name || 'Your answer')}"
        readonly inputmode="none" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="${essay ? 'enter' : 'done'}"`;
  return `<span class="kp-field kp-${words ? 'words' : 'maths'}${essay ? ' kp-essay' + (v ? '' : ' is-blank') : ''}">
      <span class="kp-show" aria-hidden="true">${kpDraw_(v, -1, words)}</span>
      ${words ? `<textarea ${lock} rows="1">${esc(v)}</textarea>` : `<input ${lock} value="${esc(v)}">`}
    </span>`;
}

/* ---------- DRAWING WHAT HAS BEEN TYPED § */
const KP_SEL_A = '\u03dd', KP_SEL_B = '\u03df';
function kpTypeset_(v, caret, end) {
  let s = String(v == null ? '' : v).replace(/[\u03d9\u03db\u03dd\u03df]/g, '');
  if (caret >= 0 && end != null && end > caret && caret < s.length) {
    const a = Math.min(caret, s.length), b = Math.min(end, s.length);
    s = s.slice(0, a) + KP_SEL_A + s.slice(a, b) + KP_SEL_B + s.slice(b);
  } else if (caret >= 0) {
    const at = Math.min(caret, s.length);
    s = s.slice(0, at) + KP_CARET + s.slice(at);
  }
  if (!s) return '';
  const END = '(?=$|[\\s)+\\-\u00d7\u00f7=,\\/])';
  s = s.replace(/\((\u03db?)\)/g, '(' + KP_HOLE + '$1)')
    .replace(/(^|[\s(+\-\u00d7\u00f7=,])(\u03db?)\//g, '$1$2' + KP_HOLE + '/')
    .replace(new RegExp('\\/(\u03db?)' + END, 'g'), '/' + KP_HOLE + '$1')
    .replace(new RegExp('\\^(\u03db?)' + END, 'g'), '^(' + KP_HOLE + '$1)')
    .replace(new RegExp('\u221a(\u03db?)' + END, 'g'), '\u221a' + KP_HOLE + '$1');
  /* THE SLASH AS `&frasl;` AFTER ESCAPING, which is what `typeset_` stacks — `tbMath_` in find.js does the same for the textbooks. § */
  const h = typeset_(esc(s).replace(/\//g, '&frasl;').replace(/-/g, '\u2212'));
  return h.replace(/\u03d9/g, '<span class="kp-hole"></span>')
          .replace(/\u03db/g, '<span class="kp-caret"></span>')
          .replace(/\u03dd/g, '<span class="kp-sel-a"></span>').replace(/\u03df/g, '<span class="kp-sel-b"></span>');
}
/* THE BAND BETWEEN A MATHS SELECTION'S TWO ENDS, measured off the drawing and laid over it in the field (`.kp-field` is the positioned box). § */
function kpSelBand_(show) {
  const a = show.querySelector('.kp-sel-a'), b = show.querySelector('.kp-sel-b');
  const field = show.parentNode;
  if (!a || !b || !field) return;
  try {
    const f = field.getBoundingClientRect(), sr = show.getBoundingClientRect();
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const one = rb.top < ra.bottom - 1;
    const left = one ? Math.min(ra.left, rb.left) : sr.left, right = one ? Math.max(ra.right, rb.right) : sr.right;
    const top = Math.min(ra.top, rb.top), bottom = Math.max(ra.bottom, rb.bottom);
    if (right - left < 1 || bottom - top < 1) return;
    const band = document.createElement('span');
    band.className = 'kp-sel-band';
    band.setAttribute('aria-hidden', 'true');
    band.style.cssText = 'left:' + (left - f.left) + 'px;top:' + (top - f.top) + 'px;width:' + (right - left)
      + 'px;height:' + (bottom - top) + 'px';
    show.appendChild(band);
  } catch (e) { /* the two ends are still drawn */ }
}

/* A WORDED ANSWER IS DRAWN AS THE TEXT IT IS: § */
function kpDraw_(v, caret, words, end) {
  if (!words) return kpTypeset_(v, caret, end);
  const s = String(v == null ? '' : v);
  if (caret < 0) return esc(s);
  const a = Math.min(caret, s.length);
  const b = Math.max(a, Math.min(end == null ? a : end, s.length));
  return esc(s.slice(0, a)) + (b > a ? '<mark class="kp-sel">' + esc(s.slice(a, b)) + '</mark>'
    : '<span class="kp-caret"></span>') + esc(s.slice(b));
}

function kpRender_(inp) {
  const show = inp && inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show) return;
  const words = inp.getAttribute('data-kp') === 'words';
  let caret = -1, end = -1;
  if (KP_AT === inp) {
    caret = inp.selectionStart;
    end = inp.selectionEnd;
    if (caret == null) caret = end = inp.value.length;
    /* WHICH BOX AND WHERE IN IT, kept apart from the element -- see `kpLive_`. */
    KP_WAS = { k: inp.getAttribute('data-k') || '', caret: caret };
  }
  show.innerHTML = kpDraw_(inp.value, caret, words, end);
  if (caret >= 0) kpCaretSeen_(show);
  if (!words && end > caret) kpSelBand_(show);
  if (inp.hasAttribute('data-kp-essay')) kpCount_(inp);
}
/* THE ESSAY'S WORD COUNT, KEPT WITH ITS DRAWING: § */
/* AND WHETHER THE SHEET IS BLANK (`is-blank` on its field), which is what shows the hint on it -- "Press return to start a new paragraph". § */
function kpCount_(inp) {
  const field = inp.parentNode;
  if (field && field.classList) field.classList.toggle('is-blank', !inp.value);
  const box = inp.closest && inp.closest('.qp-essay');
  const out = box && box.querySelector('.qp-words');
  if (!out) return;
  const say = kpWordsSay_(kpWordCount_(inp.value));
  if (out.textContent !== say) out.textContent = say;
}
/* A WORDED DRAWING STOPS GROWING AT ABOUT FIVE LINES AND SCROLLS INSIDE (`.kp-words > .kp-show`) -- an essay's sheet at the room above the pad § */
function kpCaretSeen_(show) {
  try {
    if (show.scrollHeight <= show.clientHeight + 1) return;
    const c = show.querySelector('.kp-caret, .kp-sel');
    if (!c) return;
    const cr = c.getBoundingClientRect(), sr = show.getBoundingClientRect();
    if (cr.bottom > sr.bottom - 4) show.scrollTop += cr.bottom - sr.bottom + 8;
    else if (cr.top < sr.top + 4) show.scrollTop -= sr.top - cr.top + 8;
  } catch (e) { /* a drawing that cannot be measured is left where it is */ }
}

/* ---------- THE BOX THE PAD TYPES INTO, AFTER A REDRAW § */
let KP_WAS = null;
function kpFind_(k) {
  if (!k) return null;
  const has = root => (root ? [...root.querySelectorAll('.kp-in')].find(i => i.getAttribute('data-k') === k) : null) || null;
  return has(document.querySelector('#screen .page.on')) || has(document);
}
function kpLive_() {
  /* NOTHING NAMED IS NOTHING TO FIND: a pad put away (`kpClose_`) is not brought back by a key. */
  if (!KP_AT) return null;
  if (KP_AT.isConnected) return KP_AT;
  const now = kpFind_(KP_AT.getAttribute('data-k'));
  if (!now) { kpClose_(); return null; }
  kpTake_(now);
  return KP_AT === now ? now : null;
}
/* FOCUS THE REPLACEMENT, whose `focusin` reopens the pad on it (`kpOpen_`, which keeps the caret from `KP_WAS`). § */
function kpTake_(inp) {
  try { inp.focus({ preventScroll: true }); } catch (e) { try { inp.focus(); } catch (e2) {} }
  if (KP_AT !== inp) kpOpen_(inp);
}

/* ---------- OPENING AND CLOSING § */
let KP_AT = null;
let KP_LAYER = 'maths';
function kpPad_() {
  let pad = document.getElementById('kp');
  if (pad) return pad;
  pad = document.createElement('div');
  pad.id = 'kp';
  pad.className = 'kp';
  pad.hidden = true;
  /* `data-noswipe`: a thumb sliding between keys is not a page turn. */
  pad.setAttribute('data-noswipe', '');
  pad.setAttribute('role', 'group');
  pad.setAttribute('aria-label', 'Maths keypad');
  pad.innerHTML = kpPadHtml_('maths', false, false);
  pad.setAttribute('data-sig', 'maths:m');
  pad.setAttribute('data-layer', 'maths');
  pad.addEventListener('mousedown', e => e.preventDefault());
  /* A HELD KEY IS NOT A MENU: no long-press callout on the pad, on any platform. */
  pad.addEventListener('contextmenu', e => e.preventDefault());
  pad.addEventListener('click', kpNear_);
  pad.addEventListener('pointerdown', kpHold_);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => pad.addEventListener(ev, kpHoldStop_));
  document.body.appendChild(pad);
  /* WHAT THE BOX NOW SAYS, FOR A SCREEN READER (`kpSay_`) -- a line of its own beside the pad, because
     the pad's keys are rebuilt whenever it turns over and a live region rebuilt is a live region
     that announces nothing. */
  const say = document.createElement('span');
  say.id = 'kp-say';
  say.className = 'kp-say';
  say.setAttribute('aria-live', 'polite');
  document.body.appendChild(say);
  return pad;
}

/* THE PAD'S FACE FOR THIS BOX. § */
function kpLayout_(inp) {
  const pad = kpPad_();
  const words = !!inp && inp.getAttribute('data-kp') === 'words';
  const signs = !!inp && inp.hasAttribute('data-kp-signs');
  const essay = !!inp && inp.hasAttribute('data-kp-essay');
  const sig = KP_LAYER + (words ? ':w' : ':m') + (signs && KP_LAYER === 'maths' ? ':s' : '') + (essay ? ':e' : '');
  if (pad.getAttribute('data-sig') !== sig) {
    pad.innerHTML = kpPadHtml_(KP_LAYER, words, signs, essay);
    pad.setAttribute('data-sig', sig);
  }
  kpNextPaint_(pad, inp);
  pad.classList.toggle('is-abc', KP_LAYER === 'abc');
  pad.setAttribute('data-layer', KP_LAYER);
  pad.setAttribute('aria-label', KP_LAYER === 'abc' ? 'Letters keypad' : 'Maths keypad');
  kpShiftPaint_();
  return pad;
}
/* ✓ READS "next" IN A BOX WITH ANOTHER AFTER IT (one box per value, 362), and is Send again on the last. */
function kpNextPaint_(pad, inp) {
  const d = pad.querySelector('.kp-key.kp-done:not(.kp-done-k)');
  if (!d) return;
  const nx = !!(inp && typeof multiNext_ === 'function' && multiNext_(inp));
  if (d.classList.contains('is-next') === nx) return;
  d.classList.toggle('is-next', nx);
  d.setAttribute('aria-label', nx ? 'next box' : 'done');
  d.innerHTML = nx ? 'next' : tileIcon_('send');
}
/* `abc` AND `123`: the same pad turned over, the box keeping its focus and its caret. § */
function kpLayer_(name, inp) {
  KP_LAYER = name;
  kpLayout_(inp);
  kpAutoShift_(inp);
  kpShiftPaint_();
  kpKeepClear_(inp);
}

function kpOpen_(inp) {
  if (!inp || !inp.classList || !inp.classList.contains('kp-in')) return;
  /* FROM ONE BOX STRAIGHT TO ANOTHER, the one left behind is redrawn without its caret — two blinking
     carets on one screen is two places the next key might go. */
  const was = KP_AT;
  KP_AT = inp;
  if (was && was !== inp && was.isConnected) kpRender_(was);
  /* THE CARET GOES TO THE END ON ARRIVAL -- where the next key belongs; ← and → move it from there, and a tap on the drawing puts it where the finger was § */
  const back = !!(was && was !== inp && !was.isConnected && KP_WAS && KP_WAS.k === inp.getAttribute('data-k'));
  /* AND THE SAME BOX FOCUSED AGAIN while the pad is still on it keeps its face and its caret. */
  const same = was === inp;
  if (!back && !same) {
    KP_LAYER = inp.getAttribute('data-kp') === 'words' ? 'abc' : 'maths';
    KP_SHIFT = 'off';
  }
  const pad = kpLayout_(inp);
  pad.hidden = false;
  document.documentElement.classList.add('kp-up');
  if (!same) {
    const at = back ? Math.max(0, Math.min(KP_WAS.caret, inp.value.length)) : inp.value.length;
    try { inp.setSelectionRange(at, at); } catch (e) {}
  }
  kpRender_(inp);
  if (!back && !same) kpAutoShift_(inp);
  kpShiftPaint_();
  kpRoom_(inp, pad);
}

function kpClose_() {
  const pad = document.getElementById('kp');
  if (pad) pad.hidden = true;
  document.documentElement.classList.remove('kp-up');
  const was = KP_AT;
  KP_AT = null;
  kpHoldStop_();
  if (was) kpRender_(was);
  kpRoomBack_();
}

/* ---------- AND THE BOX STAYS ABOVE THE PAD § */
let KP_ROOM = null;
const kpBox_ = inp => {
  const essay = inp && inp.closest && inp.closest('.qp-essay');
  return (essay && essay.querySelector('.qp-sheet-foot')) || (inp && inp.closest && inp.closest('.qp-ans')) || inp;
};
/* THE PAD'S HEIGHT, FOR THE STYLESHEET: § */
function kpPadH_(pad) {
  try {
    const h = Math.round(pad.getBoundingClientRect().height);
    if (h > 0 && document.documentElement.style.getPropertyValue('--kp-h') !== h + 'px') {
      document.documentElement.style.setProperty('--kp-h', h + 'px');
    }
  } catch (e) { /* the stylesheet's own guess stands */ }
}
function kpRoom_(inp, pad) {
  kpRoomBack_();
  kpPadH_(pad);
  const box = kpBox_(inp);
  let el = inp.parentNode;
  while (el && el !== document.body) {
    const oy = getComputedStyle(el).overflowY;
    if (oy === 'auto' || oy === 'scroll') break;
    el = el.parentNode;
  }
  if (el && el !== document.body) {
    const h = pad.getBoundingClientRect().height;
    KP_ROOM = { el: el, was: el.style.paddingBottom };
    el.style.paddingBottom = h + 'px';
    const over = box.getBoundingClientRect().bottom - (pad.getBoundingClientRect().top - 12);
    if (over > 0) el.scrollTop += over;
    /* A SCROLLER WITH NOTHING LEFT TO GIVE leaves the rest to the column, below. */
    if (box.getBoundingClientRect().bottom - (pad.getBoundingClientRect().top - 12) <= 0) return;
  }
  kpLift_(inp, pad);
}
function kpRoomBack_() {
  if (KP_ROOM) {
    KP_ROOM.el.style.paddingBottom = KP_ROOM.was;
    KP_ROOM = null;
  }
  /* AND THE COLUMN PUT BACK WHERE IT WAS HELD — only if it is still the hold the lift was written on.
     A swipe away has already let go of it (`placeGrid`), and the card arrived at is centred. */
  const L = KP_LIFT;
  KP_LIFT = null;
  if (L && L.lift) {
    L.lift = 0;
    try { if (HOLD_AT === L) placeCells('y', true, 0, L.id); } catch (e) {}
  }
}
/* ---------- AND AGAIN AS IT GROWS § */
function kpKeepClear_(inp) {
  const pad = document.getElementById('kp');
  if (!pad || pad.hidden || !inp || KP_AT !== inp || !inp.isConnected) return;
  kpPadH_(pad);
  try {
    const top = pad.getBoundingClientRect().top - 12;
    let over = kpBox_(inp).getBoundingClientRect().bottom - top;
    if (over <= 0.5) return;
    if (KP_ROOM) {
      KP_ROOM.el.style.paddingBottom = pad.getBoundingClientRect().height + 'px';
      KP_ROOM.el.scrollTop += over;
      over = kpBox_(inp).getBoundingClientRect().bottom - top;
      if (over <= 0.5) return;
    }
    kpLift_(inp, pad);
  } catch (e) { /* a box that cannot be measured is left where it is */ }
}

/* ---------- AN ESSAY'S SHEET IS AS TALL AS ITS CARD HAS ROOM FOR § */
const KP_SHEET_FLOOR = 5 * 24;
function kpSheetFit_(pane) {
  try {
    const show = pane.querySelector('.qp-essay .qp-sheet .kp-show');
    if (!show) return;
    show.style.maxHeight = '';
    show.style.minHeight = '';
    const cs = getComputedStyle(pane);
    const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const over = (pane.scrollHeight - pad) - (pane.clientHeight - pad);
    const h = show.getBoundingClientRect().height;
    const floor = parseFloat(getComputedStyle(show).minHeight) || 0;
    if (!(over > 0) || !(h > 0)) return;
    const fit = Math.max(KP_SHEET_FLOOR, Math.floor(h - over - 4));
    if (fit >= h) return;
    show.style.maxHeight = fit + 'px';
    if (floor > fit) show.style.minHeight = fit + 'px';
    if (KP_AT && show.parentNode && show.parentNode.contains(KP_AT)) kpCaretSeen_(show);
  } catch (e) { /* the stylesheet's cap stands */ }
}

/* ---------- A CARD WITH NOTHING TO SCROLL IS LIFTED WHOLE § */
let KP_LIFT = null;
function kpLift_(inp, pad) {
  try {
    const pg = inp.closest('#screen .page.on');
    const host = pg && pg.parentElement;
    if (!host || host.id !== 's-' + AT) return;
    if (!HOLD_AT || HOLD_AT.id !== AT || HOLD_AT.p !== (PAGE[AT] || 0)) holdHere_(inp);
    const h = HOLD_AT;
    if (!h || h.id !== AT) return;
    h.lift = 0;
    const want = columnShift_(host, domIndex_(AT, PAGE[AT] || 0));
    const base = (host.offsetParent || host.parentElement).getBoundingClientRect().top + host.offsetTop;
    const fromTop = kpBox_(inp).getBoundingClientRect().bottom - host.getBoundingClientRect().top;
    const over = base + want + fromTop - (pad.getBoundingClientRect().top - 12);
    if (!isFinite(over) || over <= 0) return;
    h.lift = over;
    KP_LIFT = h;
    placeCells('y', true, 0, AT);
  } catch (e) { /* a box left where it was is the behaviour before this existed */ }
}

/* ---------- WHAT A KEY DOES § */
/* THE PARTNER OF THE BRACKET AT `i`, or -1. Counted, so `(2(x+1))` pairs its outer brackets. */
function kpPartner_(v, i) {
  const c = v.charAt(i);
  const step = c === '(' ? 1 : c === ')' ? -1 : 0;
  if (!step) return -1;
  for (let j = i, depth = 0; j >= 0 && j < v.length; j += step) {
    const d = v.charAt(j);
    if (d === '(' || d === ')') depth += (d === c ? 1 : -1);
    if (!depth) return j;
  }
  return -1;
}
/* ---------- HOME AND END ARE THE LINE'S, CTRL/⌘ WITH THEM THE WHOLE ANSWER'S § */
function kpLineStart_(v, i) { return i <= 0 ? 0 : v.lastIndexOf('\n', i - 1) + 1; }
function kpLineEnd_(v, i) { const n = v.indexOf('\n', i); return n < 0 ? v.length : n; }
function kpEdit_(inp, cmd) {
  const v = inp.value;
  const words = inp.getAttribute('data-kp') === 'words';
  let a = inp.selectionStart, b = inp.selectionEnd;
  if (a == null) { a = v.length; b = v.length; }
  const a0 = a, b0 = b;
  const put = (t, at) => {
    inp.value = v.slice(0, a) + t + v.slice(b);
    const c = a + (at == null ? t.length : at);
    inp.setSelectionRange(c, c);
  };
  const to = c => inp.setSelectionRange(c, c);
  const term = /[0-9a-z.\u03c0)]$/i.test(v.slice(0, a));
  if (cmd === '!frac') { if (term) put('/()', 2); else put('()/()', 1); }
  else if (cmd === '!pow') put('^()', 2);
  else if (cmd === '!sqrt') put('\u221a()', 2);
  else if (cmd === '!home') to(kpLineStart_(v, a));
  else if (cmd === '!end') to(kpLineEnd_(v, b));
  else if (cmd === '!top') to(0);
  else if (cmd === '!bottom') to(v.length);
  else if (cmd === '!left') {
    to(b > a ? a : !words && v.slice(a - 3, a) === ')/(' ? a - 3 : Math.max(0, a - 1));
  } else if (cmd === '!right') {
    to(b > a ? b : !words && v.slice(a, a + 3) === ')/(' ? a + 3 : Math.min(v.length, a + 1));
  } else if (cmd === '!back' && words) {
    if (b > a) put('');
    else if (a > 0) { inp.value = v.slice(0, a - 1) + v.slice(a); to(a - 1); }
  } else if (cmd === '!back') {
    /* WHERE A FILLED PAIR IS STEPPED OVER RATHER THAN BROKEN -- see the note above. -1: delete. */
    const c = v.charAt(a - 1);
    const sign = /[\^\u221a\/]/;
    let step = -1;
    if (b > a || a < 1 || (c === '(' && v.charAt(a) === ')')) step = -1;
    else if (c === ')' && kpPartner_(v, a - 1) >= 0) step = a - 1;
    else if (c === '(' && kpPartner_(v, a - 1) >= 0) {
      step = v.slice(a - 3, a) === ')/(' ? a - 3 : sign.test(v.charAt(a - 2)) ? a - 2 : a - 1;
    } else if (sign.test(c) && v.charAt(a) === '(' && kpPartner_(v, a) > a + 1) step = a - 1;
    if (step >= 0) to(step);
    else if (b > a) put('');
    else if (a > 0) {
      let from = a - 1, end = a;
      if (v.slice(a - 1, a + 1) === '()') {
        end = a + 1;
        if (v.slice(a + 1, a + 4) === '/()') end = a + 4;          /* ()/() with nothing in either */
        else if (/[\^\u221a\/]/.test(v.charAt(a - 2))) from = a - 2;
      }
      inp.value = v.slice(0, from) + v.slice(end);
      to(from);
    }
  } else if (cmd === '!del') {
    /* A LAPTOP'S DELETE, forward. In a maths box a bracket or a structure's sign is stepped over, never
       taken -- the stray-half rule above, from the other side -- and ⌫ then deletes from inside. */
    if (b > a) put('');
    else if (a < v.length) {
      if (!words && /[()\^\u221a\/]/.test(v.charAt(a))) to(a + 1);
      else { inp.value = v.slice(0, a) + v.slice(a + 1); to(a); }
    }
  } else put(cmd);
  /* THE SAME EVENT A KEYBOARD SENDS, so find.js's listener saves it under `ansKey_` and takes a stale verdict off it, exactly as it does for a typed letter. § */
  if (inp.value !== v) {
    kpUndoNote_(inp, v, a0, b0, cmd);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/* ---------- UNDO, BECAUSE `readonly` TOOK THE BROWSER'S § */
const KP_UNDO = new Map();
const kpMark_ = k => (typeof ansMarkable_ === 'function' && ansMarkable_(k) && typeof ansGoneOf_ === 'function' ? ansGoneOf_(k) : null);
function kpUndoNote_(inp, was, a, b, cmd) {
  const k = inp.getAttribute('data-k') || '';
  let h = KP_UNDO.get(k);
  if (!h) { h = { back: [], fwd: [], kind: '', at: -1, t: 0 }; KP_UNDO.set(k, h); }
  const kind = a !== b ? '' : (cmd === '!back' || cmd === '!del') ? 'del'
    : (cmd.length === 1 && cmd !== '\n') ? 'type' : '';
  const now = Date.now();
  const word = kind === 'type' && !/\s/.test(cmd) && /\s/.test(was.charAt(a - 1));
  if (!(kind && kind === h.kind && a === h.at && now - h.t < 2000 && !word)) {
    h.back.push({ v: was, a: a, b: b, mark: kpMark_(k) });
    if (h.back.length > 200) h.back.shift();
  }
  h.fwd = [];
  h.kind = kind;
  h.at = inp.selectionStart;
  h.t = now;
}
function kpUndo_(inp, redo) {
  const k = inp.getAttribute('data-k') || '';
  const h = KP_UNDO.get(k);
  const from = h && (redo ? h.fwd : h.back);
  if (!from || !from.length) return;
  const to = from.pop();
  (redo ? h.back : h.fwd).push({ v: inp.value, a: inp.selectionStart, b: inp.selectionEnd, mark: kpMark_(k) });
  h.kind = '';
  inp.value = to.v;
  try { inp.setSelectionRange(Math.min(to.a, to.v.length), Math.min(to.b, to.v.length)); } catch (e) {}
  /* THE SAME EVENT AS ANY EDIT, so find.js's listener stores it — told that it is a value put back, and
     whose it was then. */
  const fire = () => inp.dispatchEvent(new Event('input', { bubbles: true }));
  if (typeof ansPutBack_ === 'function') ansPutBack_(k, to.mark || null, fire); else fire();
  kpAfter_(inp, '');
}

/* ---------- A KEY, FROM THE PAD OR A KEYBOARD § */
const KP_WORD_SIGN = { '!frac': '/', '!pow': '^', '!sqrt': '\u221a' };
function kpType_(inp, cmd, typed) {
  const words = inp.getAttribute('data-kp') === 'words';
  let c = cmd === '!nl' ? '\n' : cmd;
  if (!typed && KP_LAYER === 'abc' && /^[a-z]$/.test(c) && KP_SHIFT !== 'off') {
    c = c.toUpperCase();
    if (KP_SHIFT === 'once') KP_SHIFT = 'off';
  }
  if (words && KP_WORD_SIGN[c]) c = KP_WORD_SIGN[c];
  /* A COMMA BETWEEN VALUES IS THE NEXT BOX, where each value has its own (362). */
  if (c === ',' && inp.getAttribute('data-do') === 'qp-multi') {
    const nx = typeof multiNext_ === 'function' ? multiNext_(inp) : null;
    if (nx) return kpTake_(nx);
  }
  /* A KEY BETWEEN TWO ⇧ MAKES THEM TWO PRESSES, NOT A DOUBLE TAP -- ⇧ a ⇧ typed quickly is two capitals,
     never caps lock. */
  KP_SHIFT_AT = 0;
  kpEdit_(inp, c);
  kpAfter_(inp, c);
}
/* AFTER ANY CHANGE: the drawing, the capital for the next letter, the room above the pad, the line a
   screen reader hears. Undo comes through here too. */
function kpAfter_(inp, c) {
  kpRender_(inp);
  const pad = document.getElementById('kp');
  if (pad && inp.getAttribute('data-do') === 'qp-multi') kpNextPaint_(pad, inp);
  if (!/^!(left|right|home|end|top|bottom)$/.test(c)) kpAutoShift_(inp);
  kpShiftPaint_();
  kpKeepClear_(inp);
  kpSay_(inp);
}

/* A KEY HELD DOWN AND LET GO AFTER IT REPEATED (`kpHold_`) still sends its click at the lift; that click
   is the press already counted, and is swallowed here. */
let KP_REPEATED = false;
on('kp-key', (el) => {
  if (KP_REPEATED) { KP_REPEATED = false; return; }
  /* THE LIVE BOX, NOT THE LAST ONE NAMED -- a redraw may have replaced it (`kpLive_`). */
  const inp = kpLive_();
  if (!inp) return;
  const v = el.getAttribute('data-v') || '';
  if (v === '!done') return kpDone_(inp);
  if (v === '!abc' || v === '!123') return kpLayer_(v === '!abc' ? 'abc' : 'maths', inp);
  if (v === '!shift') return kpShiftTap_();
  kpType_(inp, v, false);
});

/* ✓ IS CHECK, where the question has a scheme to check against — the same handler the button runs, not a copy of it — and otherwise it is "I have finished" § */
/* ---------- ✓ — THE GOLD SEND KEY, AND ENTER ON A LAPTOP — RUNS THE BOX'S OWN SEND § */
function kpDone_(inp) {
  const nx = typeof multiNext_ === 'function' ? multiNext_(inp) : null;
  if (nx) return kpTake_(nx);
  const box = inp.hasAttribute('data-kp-essay') ? null : inp.closest('.qp-mark');
  const go = box && (box.querySelector('.qp-check[data-do="qp-check"]')
    || box.querySelector('.qp-send[data-do="qp-send"]')
    || box.querySelector('.qp-ai-go[data-do="qp-ai"]:not([disabled])'));
  const run = go && ACTIONS[go.getAttribute('data-do')];
  if (run) run(go);
  inp.blur();
  kpClose_();
}

/* ---------- CAPITALS § */
let KP_SHIFT = 'off';
let KP_SHIFT_AT = 0;
function kpShiftTap_() {
  const now = Date.now();
  KP_SHIFT = KP_SHIFT === 'lock' ? 'off' : now - KP_SHIFT_AT < 350 ? 'lock' : KP_SHIFT === 'off' ? 'once' : 'off';
  KP_SHIFT_AT = now;
  kpShiftPaint_();
}
function kpAutoShift_(inp) {
  if (KP_SHIFT === 'lock') return;
  if (!inp || inp.getAttribute('data-kp') !== 'words') { KP_SHIFT = 'off'; return; }
  const at = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
  const before = inp.value.slice(0, at);
  KP_SHIFT = (!before.trim() || /[.?!]\s+$/.test(before) || /\n\s*$/.test(before)) ? 'once' : 'off';
}
function kpShiftPaint_() {
  const pad = document.getElementById('kp');
  if (!pad) return;
  pad.classList.toggle('is-shift', KP_LAYER === 'abc' && KP_SHIFT !== 'off');
  const s = pad.querySelector('.kp-shift');
  if (!s) return;
  s.classList.toggle('is-on', KP_SHIFT !== 'off');
  s.classList.toggle('is-lock', KP_SHIFT === 'lock');
  s.setAttribute('aria-pressed', KP_SHIFT !== 'off' ? 'true' : 'false');
  s.setAttribute('aria-label', KP_SHIFT === 'lock' ? 'capitals locked' : 'capitals');
}

/* ---------- A TAP BETWEEN KEYS IS THE NEAREST KEY § */
function kpNear_(e) {
  const pad = e.currentTarget;
  if (e.target !== pad || !e.detail || PRESS_MOVED || PRESS_SLIDING) return;
  const ks = [...pad.querySelectorAll('.kp-key')].map(k => ({ k: k, r: k.getBoundingClientRect() }));
  const band = ks.filter(o => e.clientY >= o.r.top - 3 && e.clientY <= o.r.bottom + 3);
  let best = null, bd = Infinity;
  (band.length ? band : ks).forEach(o => {
    const dx = Math.max(o.r.left - e.clientX, 0, e.clientX - o.r.right);
    const dy = Math.max(o.r.top - e.clientY, 0, e.clientY - o.r.bottom);
    const d = dx * dx + dy * dy * 4;
    if (d < bd) { bd = d; best = o.k; }
  });
  if (best && ACTIONS['kp-key']) ACTIONS['kp-key'](best);
}

/* ---------- ⌫, ← AND → REPEAT WHILE HELD § */
let KP_HOLD = 0;
function kpHoldStop_() {
  clearTimeout(KP_HOLD);
  clearInterval(KP_HOLD);
  KP_HOLD = 0;
}
function kpHold_(e) {
  KP_REPEATED = false;
  kpHoldStop_();
  const key = e.target && e.target.closest && e.target.closest('.kp-key');
  const v = key ? key.getAttribute('data-v') || '' : '';
  if (!/^!(back|left|right)$/.test(v)) return;
  const step = () => {
    const inp = kpLive_();
    if (!inp || !key.isConnected) return kpHoldStop_();
    KP_REPEATED = true;
    kpType_(inp, v, true);
  };
  KP_HOLD = setTimeout(() => { step(); if (KP_HOLD) KP_HOLD = setInterval(step, 70); }, 450);
}

/* ---------- WHAT A SCREEN READER HEARS § */
let KP_SAY = 0;
const kpSpoken_ = v => String(v || '')
  .replace(/\(([^()]*)\)\/\(([^()]*)\)/g, '$1 over $2').replace(/\/\(([^()]*)\)/g, ' over $1')
  .replace(/\^\(([^()]*)\)/g, ' to the power $1').replace(/\u221a\(([^()]*)\)/g, 'root $1')
  .replace(/-/g, ' minus ').replace(/\s+/g, ' ').trim();
function kpSay_(inp) {
  clearTimeout(KP_SAY);
  KP_SAY = setTimeout(() => {
    const say = document.getElementById('kp-say');
    if (!say || KP_AT !== inp) return;
    const v = inp.value;
    say.textContent = inp.getAttribute('data-kp') === 'words'
      ? v.split(/[.?!\n]\s*/).filter(s => s.trim()).slice(-1).join('').slice(-160) : kpSpoken_(v);
  }, 600);
}

/* ---------- A TAP ON THE BOX § */
const kpOfTap_ = t => {
  const lab = t && t.closest && t.closest('label.qp-ans');
  return lab ? lab.querySelector('.kp-in') : null;
};
document.addEventListener('mousedown', e => { if (kpOfTap_(e.target)) e.preventDefault(); }, true);
document.addEventListener('click', e => {
  const inp = kpOfTap_(e.target);
  if (!inp) return;
  e.preventDefault();
  if (PRESS_MOVED || PRESS_SLIDING) return;
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  let at = null;
  if (show && show.contains(e.target) && e.detail && inp.value) {
    try { at = kpHit_(inp, show, e.clientX, e.clientY); } catch (err) { at = null; }
  }
  kpTake_(inp);
  if (KP_AT !== inp || at == null) return;
  try { inp.setSelectionRange(at, at); } catch (err) {}
  kpRender_(inp);
  kpAutoShift_(inp);
  kpShiftPaint_();
}, true);

/* ---------- WHERE IN THE ANSWER A FINGER LANDED § */
function kpHit_(inp, show, x, y) {
  return inp.getAttribute('data-kp') === 'words' ? kpHitWords_(show, x, y) : kpHitMaths_(inp, show, x, y);
}
function kpHitWords_(show, x, y) {
  const texts = [];
  const walk = document.createTreeWalker(show, NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) texts.push(t);
  const index = (node, off) => {
    let n = 0;
    for (const t of texts) { if (t === node) return n + off; n += t.length; }
    return null;
  };
  let node = null, off = 0;
  try {
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p) { node = p.offsetNode; off = p.offset; }
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(x, y);
      if (r) { node = r.startContainer; off = r.startOffset; }
    }
  } catch (e) { node = null; }
  if (node && node.nodeType === 3 && show.contains(node)) {
    const i = index(node, off);
    if (i != null) return i;
  }
  let best = texts.reduce((n, t) => n + t.length, 0), bd = Infinity, n = 0;
  const rg = document.createRange();
  for (const t of texts) {
    for (let i = 0; i < t.length; i++) {
      rg.setStart(t, i); rg.setEnd(t, i + 1);
      const b = rg.getBoundingClientRect();
      if (!b.width && !b.height) continue;
      const dy = y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0;
      const mid = (b.left + b.right) / 2;
      const d = dy * 1000 + Math.abs(x - (x < mid ? b.left : b.right));
      if (d < bd) { bd = d; best = n + i + (x < mid ? 0 : 1); }
    }
    n += t.length;
  }
  return best;
}
function kpHitMaths_(inp, show, x, y) {
  const sr = show.getBoundingClientRect();
  const host = document.createElement('div');
  host.className = 'kp-hit';
  host.style.cssText = 'position:fixed;left:' + sr.left + 'px;top:' + sr.top + 'px;width:' + sr.width
    + 'px;visibility:hidden;pointer-events:none;contain:layout style paint';
  let html = '';
  for (let i = 0; i <= inp.value.length; i++) {
    html += '<span class="kp-show" style="position:absolute;left:0;top:0;width:' + sr.width + 'px">'
      + kpTypeset_(inp.value, i) + '</span>';
  }
  host.innerHTML = html;
  document.body.appendChild(host);
  let best = inp.value.length, bd = Infinity;
  try {
    [...host.children].forEach((g, i) => {
      const c = g.querySelector('.kp-caret');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left - x) + 2 * Math.abs((r.top + r.bottom) / 2 - y);
      if (d < bd) { bd = d; best = i; }
    });
  } finally { host.remove(); }
  return best;
}

document.addEventListener('focusin', e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpOpen_(t);
});
document.addEventListener('focusout', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in')) return;
  /* AFTER THE FOCUS HAS LANDED, so a move from one box straight to another hands the pad over
     rather than closing and reopening it. */
  setTimeout(() => {
    const now = document.activeElement;
    if (now && now.classList && now.classList.contains('kp-in')) return;
    /* TAKEN AWAY, NOT LEFT: § */
    if (KP_AT === t && !t.isConnected) {
      const again = kpFind_(t.getAttribute('data-k'));
      if (again) { kpTake_(again); return; }
    }
    if (KP_AT === t) kpClose_();
  }, 0);
});
/* A TYPED KEY AND A MOVED CARET REDRAW THE DRAWING. `input` covers what changed the value; `keyup`
   covers a laptop's keys, which `kpKeys_` below has already sent through the pad. */
['input', 'keyup'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpRender_(t);
}));

/* ---------- A LAPTOP'S KEYBOARD, AND AN iPAD'S § */
function kpKeys_(e) {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in') || e.isComposing || e.keyCode === 229) return;
  const words = t.getAttribute('data-kp') === 'words';
  const essay = words && t.hasAttribute('data-kp-essay');
  const k = e.key || '';
  let altGr = false;
  try { altGr = !!(e.getModifierState && e.getModifierState('AltGraph')); } catch (err) {}
  if (!altGr && e.ctrlKey && e.altKey && !e.metaKey && k.length === 1) altGr = true;
  let cmd = null;
  if (k === 'Enter') {
    e.preventDefault();
    const done = essay ? (e.ctrlKey || e.metaKey) : !(words && e.shiftKey);
    if (done) return kpDone_(t);
    cmd = '\n';
  } else if (k === 'Escape') {
    e.preventDefault();
    t.blur();
    kpClose_();
    return;
  } else if ((e.ctrlKey || e.metaKey) && !altGr && (k === 'Home' || k === 'End')) {
    /* THE WHOLE ANSWER'S START OR END (`kpLineStart_`), with ⇧ the selection to it. */
    e.preventDefault();
    if (KP_AT !== t) kpOpen_(t);
    if (e.shiftKey) return kpExtend_(t, k, true);
    return kpType_(t, k === 'Home' ? '!top' : '!bottom', true);
  } else if ((e.ctrlKey || e.metaKey) && !altGr) {
    const c = k.toLowerCase();
    const redo = (c === 'z' && e.shiftKey) || (c === 'y' && e.ctrlKey && !e.metaKey);
    if (c === 'z' || redo) {
      e.preventDefault();
      if (KP_AT !== t) kpOpen_(t);
      return kpUndo_(t, redo);
    }
    if (c === 'x') return kpCut_(e, t);
    return;
  } else if (e.shiftKey && /^(ArrowLeft|ArrowRight|Home|End)$/.test(k)) {
    e.preventDefault();
    if (KP_AT !== t) kpOpen_(t);
    return kpExtend_(t, k);
  } else if (e.shiftKey && words && (k === 'ArrowUp' || k === 'ArrowDown')) {
    e.preventDefault();
    if (KP_AT !== t) kpOpen_(t);
    return kpLine_(t, k === 'ArrowUp' ? -1 : 1, true);
  } else if (k === 'Backspace') cmd = '!back';
  else if (k === 'Delete') cmd = '!del';
  else if (k === 'ArrowLeft') cmd = '!left';
  else if (k === 'ArrowRight') cmd = '!right';
  else if (k === 'Home') cmd = '!home';
  else if (k === 'End') cmd = '!end';
  else if ((k === 'ArrowUp' || k === 'ArrowDown') && words) cmd = k;
  else if (k.length === 1) cmd = !words && k === '*' ? '\u00d7' : k;
  if (cmd == null) return;
  e.preventDefault();
  if (KP_AT !== t) kpOpen_(t);
  if (cmd === 'ArrowUp' || cmd === 'ArrowDown') return kpLine_(t, cmd === 'ArrowUp' ? -1 : 1);
  kpType_(t, cmd, true);
}
document.addEventListener('keydown', kpKeys_, true);
/* ↑ AND ↓ IN A WORDED BOX: § */
function kpLine_(inp, dir, grow) {
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show) return;
  const v = inp.value;
  let s = inp.selectionStart, e = inp.selectionEnd;
  if (s == null) s = e = v.length;
  const back = inp.selectionDirection === 'backward';
  const anchor = back ? e : s;
  const from = grow ? (back ? s : e) : (dir < 0 ? s : e);
  show.innerHTML = kpDraw_(v, from, true);
  const c = show.querySelector('.kp-caret');
  if (!c) return kpRender_(inp);
  const r = c.getBoundingClientRect();
  const lh = parseFloat(getComputedStyle(show).lineHeight) || r.height || 20;
  const at = kpHitWords_(show, r.left, r.top + r.height / 2 + dir * lh);
  if (grow) return kpSelect_(inp, anchor, at);
  try { inp.setSelectionRange(at, at); } catch (err) {}
  kpRender_(inp);
}
/* ⇧ WITH ← → HOME END: the selection's moving end goes one character, or to an end, and its anchor --
   where it began -- stays, whichever side of it the moving end has crossed to. */
function kpExtend_(inp, k, whole) {
  const v = inp.value;
  let s = inp.selectionStart, e = inp.selectionEnd;
  if (s == null) s = e = v.length;
  const back = inp.selectionDirection === 'backward';
  const anchor = back ? e : s;
  let to = back ? s : e;
  if (k === 'ArrowLeft') to = Math.max(0, to - 1);
  else if (k === 'ArrowRight') to = Math.min(v.length, to + 1);
  else if (k === 'Home') to = whole ? 0 : kpLineStart_(v, to);
  else if (k === 'End') to = whole ? v.length : kpLineEnd_(v, to);
  kpSelect_(inp, anchor, to);
}
function kpSelect_(inp, anchor, to) {
  try { inp.setSelectionRange(Math.min(anchor, to), Math.max(anchor, to), to < anchor ? 'backward' : 'forward'); } catch (e) {}
  kpRender_(inp);
}
/* CTRL/⌘+X: THE SELECTION TO THE CLIPBOARD, THEN TAKEN OUT THROUGH THE PAD'S EDIT. § */
let KP_CUT = false;
function kpCut_(e, t) {
  e.preventDefault();
  if (!(t.selectionEnd > t.selectionStart)) return;
  KP_CUT = false;
  try { document.execCommand('cut'); } catch (err) {}
  if (KP_CUT) return;
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
  if (!copied) return;
  if (KP_AT !== t) kpOpen_(t);
  kpType_(t, '!back', true);
}
document.addEventListener('cut', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in')) return;
  KP_CUT = true;
  e.preventDefault();
  const a = t.selectionStart, b = t.selectionEnd;
  if (!(b > a)) return;
  try { e.clipboardData.setData('text/plain', t.value.slice(a, b)); } catch (err) { return; }
  if (KP_AT !== t) kpOpen_(t);
  kpType_(t, '!back', true);
}, true);
/* A PASTE ON A LAPTOP arrives on the readonly box carrying its text (measured) and is typed through
   the pad's edit like any key -- into a maths box as one line, because an `<input>` holds one. */
document.addEventListener('paste', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in')) return;
  e.preventDefault();
  let s = '';
  try { s = (e.clipboardData && e.clipboardData.getData('text')) || ''; } catch (err) { s = ''; }
  if (!s) return;
  if (KP_AT !== t) kpOpen_(t);
  kpType_(t, t.getAttribute('data-kp') === 'words' ? s.replace(/\r\n?/g, '\n') : s.replace(/\s*[\r\n]+\s*/g, ' '), true);
}, true);


/* MARK WITH AI — A WORDED ANSWER, MARKED BY GEMINI AGAINST THE SCHEME THE CARD ALREADY HOLDS. § */
let AI_OFF = false;

function aiOffered_() {
  if (AI_OFF) return false;
  try { return (DATA.features || []).indexOf('aiMark') !== -1 && DATA.aiMarking !== false; }
  catch (e) { return false; }
}

/* ---------- NOT KNOWN YET IS NOT OFF (review of 10 Oct) § */
function aiUndecided_() {
  if (AI_OFF) return false;
  try { return typeof awaiting_ === 'function' && awaiting_() && !(DATA && Array.isArray(DATA.features)); }
  catch (e) { return false; }
}

function aiWanted_(x) {
  if (!x || ansMaths_(x) || padWanted_(x)) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  if (String(x.accept || '').trim()) return false;
  return !!String(x.answer || '').trim();
}

/* THE TILE ALONE, GOLD AND ROUND IN THE ANSWER BAR WHERE SEND STANDS ON A BOX WITH A SCHEME -- the bar, its verdict line and the sentence under it are § */
function aiTile_(x) {
  if (!aiWanted_(x)) return '';
  const wait = aiUndecided_();
  if (!wait && !aiOffered_()) return '';
  return tile_({ icon: 'spark', label: 'Mark with AI', note: 'out of the marks', act: 'qp-ai', cls: wait ? 'qp-ai-go qp-ai-wait' : 'qp-ai-go', tone: 'send', off: wait });
}
/* ---------- AND DECIDED WHERE IT STANDS, THE MOMENT THE PAYLOAD SAYS (`adoptMarks_`, shell.js) § */
function aiDecided_() {
  if (aiUndecided_() || !aiOffered_()) return;
  document.querySelectorAll('.qp-ai-go.qp-ai-wait').forEach(b => {
    b.classList.remove('qp-ai-wait');
    b.disabled = false;
  });
}

/* THE QUESTION AS WORDS. § */
function aiPlain_(html) {
  const s = String(html || '')
    .replace(/<sup>([^<]*)<\/sup>\s*(?:&frasl;|\u2044)\s*<sub>([^<]*)<\/sub>/g, '($1)/($2)')
    .replace(/<sup>([^<]*)<\/sup>/g, '^($1)')
    .replace(/<(br|\/p|\/li|\/div|\/tr)\b[^>]*>/gi, '\n');
  let t = '';
  try { t = new DOMParser().parseFromString(s, 'text/html').body.textContent || ''; }
  catch (e) { t = s.replace(/<[^>]*>/g, ' '); }
  return t.replace(/[ \t\u00a0]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

/* ---------- HOW MUCH GOES TO GEMINI, AND THE SAME NUMBERS ON THE SERVER § */
const AI_ANSWER_MAX = 20000, AI_QUESTION_MAX = 8000, AI_SCHEME_MAX = 8000;

function aiQuestion_(x) {
  const parts = (x.stems || []).map(p => p && p.html).concat([x.lead, x.html]);
  return parts.map(aiPlain_).filter(Boolean).join('\n\n').slice(0, AI_QUESTION_MAX);
}

function aiScheme_(x) {
  const note = String(x.examinerNote || '').trim();
  return (aiPlain_(x.answer) + (note ? '\nExaminer\u2019s note: ' + note : '')).slice(0, AI_SCHEME_MAX);
}

/* ---------- AND WHEN THERE IS NO TILE, A LINE SAYING WHY § */
function aiWhyNot_(x) {
  if (!aiWanted_(x) || aiOffered_()) return '';
  if (!(typeof whoIs_ === 'function' && whoIs_())) return '';
  return AI_OFF ? 'AI marking isn\u2019t switched on' : 'AI marking isn\u2019t switched on yet';
}

/* AND THE BOX KEEPS A WAY TO SEND. § */
function aiOff_(said) {
  AI_OFF = true;
  document.querySelectorAll('.qp-ai').forEach(box => {
    box.classList.add('is-off');
    const b = box.querySelector('.qp-ai-go');
    const send = typeof subSendTile_ === 'function' ? subSendTile_() : '';
    if (b && send) {
      const t = document.createElement('div');
      t.innerHTML = send;
      if (t.firstElementChild) b.replaceWith(t.firstElementChild);
    } else if (b) b.disabled = true;
    const out = box.querySelector('.qp-verdict');
    const say = said || 'AI marking isn\u2019t switched on';
    if (out) out.textContent = say;
    /* WHAT THIS LINE SAID, so `subVerdictPaint_` (js/submit.js) keeps it only while it still says it: a
       verdict that has replaced it is taken off by the next key, as on every box. */
    box.setAttribute('data-off-said', say);
  });
}

/* ---------- A BACKEND THAT READS THE WHOLE ESSAY SAYS SO (`aiMarkWhole` in `features`) § */
const AI_ANSWER_OLD = 2000;
function aiWhole_() {
  try { return (DATA.features || []).indexOf('aiMarkWhole') !== -1; }
  catch (e) { return false; }
}
const aiCount_ = n => String(n).replace(/\B(?=(\d{3})+$)/g, ',');

/* ---------- AN ESSAY'S MARK STAYS WHILE IT IS REVISED, AND ACROSS A RELOAD § */
const AI_KEPT = new Map();
function aiKeep_(k, rec) {
  if (!k) return;
  AI_KEPT.set(k, rec);
  try { localStorage.setItem('aiMark:' + k, JSON.stringify(rec)); } catch (e) { /* this visit only */ }
}
function aiKept_(k) {
  if (!k) return null;
  if (AI_KEPT.has(k)) return AI_KEPT.get(k);
  let rec = null;
  try { rec = JSON.parse(localStorage.getItem('aiMark:' + k) || 'null'); } catch (e) { rec = null; }
  if (!rec || typeof rec.a !== 'string' || typeof rec.v !== 'string') return null;
  AI_KEPT.set(k, rec);
  return rec;
}
/* WHAT THE ROW SHOWS FOR A KEPT MARK against the answer as it is now -- read by `ansBox_` when the card
   is drawn and by the `input` listener as it is typed into. */
function aiKeptView_(k, now) {
  const rec = aiKept_(k);
  if (!rec) return null;
  const fresh = String(now == null ? '' : now) === rec.a;
  return { fresh: fresh, cls: fresh ? (rec.c === 'is-right' ? 'is-right' : 'is-near') : 'is-stale',
           verdict: rec.v + (fresh ? '' : ' \u00b7 before your changes'), why: String(rec.f || '') };
}
function aiKeptPaint_(box, inp) {
  const view = aiKeptView_(inp.getAttribute('data-k'), inp.value);
  if (!view) return false;
  /* ONE OF THE THREE, and a forced `toggle` writes nothing that is already so -- this is asked on every key typed into an essay that has a kept mark. § */
  ['is-right', 'is-near', 'is-stale'].forEach(c => box.classList.toggle(c, c === view.cls));
  const out = box.querySelector('.qp-verdict');
  if (out && out.textContent !== view.verdict) out.textContent = view.verdict;
  const why = box.nextElementSibling;
  if (why && why.classList.contains('qp-ai-why') && why.textContent !== view.why) why.textContent = view.why;
  return true;
}

on('qp-ai', (el) => {
  const box = el.closest('.qp-ai');
  const card = el.closest('.qcard');
  const inp = card && card.querySelector('.qp-multi-val, .qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  const why = box && box.nextElementSibling && box.nextElementSibling.classList.contains('qp-ai-why')
    ? box.nextElementSibling : null;
  if (!inp || !out || el.disabled) return;
  /* AN ESSAY'S KEPT POINTS STAY UNDER IT UNTIL NEW ONES ARRIVE (`aiKeep_`): a request that fails must not
     take away the only feedback the pupil has. A short answer's sentence goes, as it always did. */
  const essayBox = box.classList.contains('qp-essay');
  box.classList.remove('is-right', 'is-near');
  if (why && !essayBox) why.textContent = '';
  /* NOTHING TYPED IS NOT A WRONG ANSWER, and it is not worth a request either. */
  if (!inp.value.trim()) { out.textContent = 'Write something first'; return; }
  if (typeof USER !== 'object' || !USER || !USER.token) { out.textContent = 'Sign in to have it marked'; return; }
  const x = ansItem_(inp.getAttribute('data-k'));
  if (!x) { out.textContent = 'Could not find this question'; return; }
  const sent = inp.value;
  /* TOO LONG IS SAID, NEVER CUT: a mark for part of an essay, shown as a mark for the essay, is the fault
     the 2,000-character cut was. */
  if (sent.length > AI_ANSWER_MAX) { out.textContent = 'Too long to mark \u2014 ' + aiCount_(AI_ANSWER_MAX) + ' characters at most'; return; }
  /* AND A BACKEND THAT HAS NOT BEEN PULLED YET WOULD CUT IT -- `aiWhole_` above. */
  if (sent.length > AI_ANSWER_OLD && !aiWhole_()) {
    out.textContent = 'The AI marker reads only the first ' + aiCount_(AI_ANSWER_OLD) + ' characters until it is updated \u2014 this is '
      + aiCount_(sent.length) + ', so it was not sent';
    return;
  }
  /* THE SOUND IS WOKEN NOW, INSIDE THE TAP, and held awake until the reply, because the verdict lands after the network and an iPad lets a page start sound only § */
  const k = inp.getAttribute('data-k');
  const letGo = typeof markWait_ === 'function' ? markWait_() : null;
  const here = typeof markWhere_ === 'function' && markWhere_(k);
  el.disabled = true;
  /* THE TILE'S OWN RING WHILE IT WAITS (`.tile.is-busy`), on the tile as well as the row: a disabled
     tile loses its plate, which says "nothing to press" -- the wrong sentence for "pressed, marking". */
  box.classList.add('is-busy');
  el.classList.add('is-busy');
  out.textContent = 'Marking\u2026';
  const done = () => { el.disabled = AI_OFF; box.classList.remove('is-busy'); el.classList.remove('is-busy'); if (letGo) letGo(); };
  /* `essay` ASKS FOR THE LEVELLED MARKING (`aiMarkAsk_` in dopost.gs): § */
  const essay = ansEssay_(x);
  api({ action: 'aiMark', personId: USER.personId || '', question: aiQuestion_(x), scheme: aiScheme_(x),
        answer: sent, marks: Number(x.marks) || 1, essay: essay })
    .then(d => {
      done();
      if (d && d.why === 'ai-off') return aiOff_(d.message);
      /* A VERDICT IS ABOUT THE ANSWER IT MARKED. § */
      if (inp.value !== sent && !essayBox) { out.textContent = ''; return; }
      if (!d || !d.success) {
        out.textContent = (d && (d.message || d.error)) || 'Could not mark that just now';
        return;
      }
      const full = d.awarded >= d.available;
      const said = d.awarded + ' of ' + d.available + ' mark' + (d.available === 1 ? '' : 's') + ' \u00b7 AI';
      if (essayBox) {
        aiKeep_(inp.getAttribute('data-k'), { a: sent, v: said, f: String(d.feedback || ''), c: full ? 'is-right' : 'is-near' });
      } else {
        box.classList.add(full ? 'is-right' : 'is-near');
        out.textContent = said;
        if (why) why.textContent = d.feedback || '';
      }
      /* MARKED IS A SUBMISSION — the answer and its marks, `ai:3/4`, one event on the account like a Check (js/submit.js). § */
      const a = Number(d.awarded), m = Number(d.available);
      /* HEARD ONLY WHERE IT WAS ASKED FOR: this card still on the page in front, with the app in sight --
         `'late'`, through the context the press woke; anywhere else, `'none'`. */
      if (typeof subRecord_ === 'function') {
        subRecord_(k, sent,
          Number.isInteger(a) && Number.isInteger(m) && a >= 0 && m >= 1 && a <= m && m < 1000 ? 'ai:' + a + '/' + m : 'sent',
          here && markWhere_(k) ? 'late' : 'none');
      }
      /* AND THEN THE ESSAY'S LINE, FROM WHAT IS KEPT — after the record, so the verdict line and the
         submission it now reads agree (`subVerdictPaint_` asks both). */
      if (essayBox) aiKeptPaint_(box, inp);
    })
    .catch(() => {
      done();
      out.textContent = 'Could not reach the marker \u2014 try again';
    });
});

/* TYPING TAKES THE AI'S SENTENCE OFF, as find.js's listener takes the verdict off every box — that one draws the verdict line from the latest submission now § */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  const box = el && el.closest('.qp-ai');
  if (!box || box.classList.contains('is-busy') || box.classList.contains('is-off')) return;
  if (box.classList.contains('qp-essay')) return;
  const why = box.nextElementSibling;
  if (why && why.classList.contains('qp-ai-why')) why.textContent = '';
});

/* ---------- ROOM TO WRITE: THE ANSWER ON A WHOLE-SCREEN SHEET (359) */
/* An Expand tile beside every typed box; the sheet holds the same answer under the same key, wraps it over as many lines
   as it needs, and stands over the app above the pad, upright or sideways. */
function kpWideTile_(k) {
  return tile_({ icon: 'open', label: 'Expand', note: 'room to write', act: 'kp-wide', cls: 'kp-wide-go', data: { k: k } });
}
function kpWideShut_() {
  const el = document.querySelector('body > .kp-wide');
  if (!el) return;
  const inp = el.querySelector('.kp-in');
  const k = inp ? inp.getAttribute('data-k') : '';
  el.remove();
  document.documentElement.classList.remove('kp-wide-up');
  kpClose_();
  /* THE CARD'S OWN BOX TAKES WHAT WAS WRITTEN, and its verdict, if any, is about an answer no longer there. */
  document.querySelectorAll('.kp-in').forEach(i => {
    if (!inp || i.getAttribute('data-k') !== k || i.value === inp.value) return;
    i.value = inp.value;
    kpRender_(i);
    const mark = i.closest('.qp-mark');
    if (mark && typeof subVerdictPaint_ === 'function') subVerdictPaint_(mark, i);
  });
}
on('kp-wide', el => {
  const k = el.getAttribute('data-k') || '';
  const card = el.closest('.qcard') || document;
  const from = [...card.querySelectorAll('.kp-in')].find(i => i.getAttribute('data-k') === k);
  if (!from) return;
  kpWideShut_();
  const kind = from.hasAttribute('data-kp-essay') ? 'essay' : from.getAttribute('data-kp') === 'words' ? 'words' : 'maths';
  const sheet = document.createElement('div');
  sheet.className = 'kp-wide';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'Room to write');
  sheet.innerHTML = `<div class="tile-row kp-wide-top">${tile_({ icon: 'tick', label: 'Done', note: 'back to the question', act: 'kp-wide-done', tone: 'send' })}</div>
    <label class="qp-ans kp-wide-ans" aria-label="Your answer">${kpField_(k, from.value, kind, from.hasAttribute('data-kp-signs'))}</label>`;
  document.body.appendChild(sheet);
  document.documentElement.classList.add('kp-wide-up');
  kpTake_(sheet.querySelector('.kp-in'));
});
on('kp-wide-done', () => kpWideShut_());
