/* @family. — keypad.js THE ANSWER BOX, IN TWO KINDS: § */
/* (round 3: one pad that types anything -- the two kinds are now only the layer it opens on.) */

/* ---------- WHICH ANSWERS ARE MATHS § */
/* THE NUMBER AT THE FRONT, AND EVERY WORD AFTER IT GOES. § */
const KP_LEAD = new RegExp('^(-?[\\d.,\\/\\s]*' + MARK_NUM + ')\\s*[a-z\u00b0%].*$');
const kpMathsy_ = w => {
  const s = markNorm_(w).replace(KP_LEAD, '$1').trim().replace(/\u221a|\u03c0/g, '1')
    .replace(/\s+[a-z]{1,3}(?:[\/\^][a-z0-9]+|[²³])?$/, '');
  return !!s && /[0-9a-z]/.test(s) && !/[a-z]{2,}/.test(s);
};
/* THE LAYER THE ONE PAD OPENS ON, read off the part's type (qtypes.js `qType_`, round 3): never a gate on what it can type. */
function ansMaths_(x) {
  if (!x) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  try { if (QT_MATHS[qType_(workRow_(x))]) return true; } catch (e) { /* the scheme's shape still says */ }
  /* a scheme every way of which is a number, a root or a band ("34 to 36 ounces") opens on the maths too */
  const ways = String(x.accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  return ways.length > 0 && ways.every(kpMathsy_);
}

/* ---------- WHICH ANSWERS ARE ESSAYS § */
/* THE SAME ONE BOX, BIGGER: a part qType_ calls an essay is written on the sheet. */
function ansEssay_(x) {
  if (!x) return false;
  try { return qType_(workRow_(x)) === 'essay'; } catch (e) { return false; }
}
/* AND HOW LONG IT IS, in words -- the one thing a pupil checks about an essay while writing it, so the sheet says it under itself rather than leaving it to be § */
const KP_NOT_WORD = /^[.,;:!?'"()\[\]\-‐-―‘-‟…·*\/]+$/;
function kpWordCount_(v) { return (String(v || '').match(/\S+/g) || []).filter(w => !KP_NOT_WORD.test(w)).length; }
function kpWordsSay_(n) { return n + (n === 1 ? ' word' : ' words'); }


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
/* THE SIGNS ROW, on every box, in the structures' amber because they are the keys that make an answer
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

/* THE VECTOR ROW (385): a column vector, top over bottom in one pair of brackets, and what goes with it. */
const KP_VEC_A = '\u27ee', KP_VEC_B = '\u27ef';
/* ONE PAD TYPES ANYTHING (round 3): this row is on every box, with the units a value needs beside the vector */
const KP_VEC_KEYS = [
  { v: '!vec', a: 'column vector', c: ' kp-op kp-vec', t: '<span class="kp-vc" aria-hidden="true"><i></i><i></i></span>' },
  { t: '%', a: 'per cent', c: ' kp-op' }, { t: '\u00a3', a: 'pounds', c: ' kp-op' },
  { t: '\u00b0', a: 'degrees', c: ' kp-op' }, { t: '\u00b2', a: 'squared, for a unit', c: ' kp-op' },
  { t: '\u00b3', a: 'cubed, for a unit', c: ' kp-op' },
];
/* AN EMPTY TOP OR BOTTOM DRAWN AS A HOLE TO TAP INTO, as the fraction's are */
const kpHoles_ = h => h.replace(/<span class="vec-(a|b)">(\u03db?)<\/span>/g, (m, w, c) => '<span class="vec-' + w + '">' + c + '<span class="kp-hole"></span></span>');
function kpVecStep_(v, a) {
  const c = v.charAt(a - 1);
  if (v.slice(a - 1, a + 2) === KP_VEC_A + ',' + KP_VEC_B) return { del: true, from: a - 1, to: a + 2 };
  if (c === KP_VEC_A || c === KP_VEC_B) return { at: a - 1 };
  if (c === ',' && v.lastIndexOf(KP_VEC_A, a - 1) > v.lastIndexOf(KP_VEC_B, a - 1)) return { at: a - 1 };
  return null;
}

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
function kpPadHtml_(layer, words, signs, essay, vec) {
  if (layer === 'abc') return (vec ? KP_VEC_KEYS.map(k => Object.assign({}, k, { span: 10 })) : []).concat(essay ? KP_ABC_ESSAY : KP_ABC).concat(kpBottom_(words, essay)).map(kpKey_).join('');
  return (vec ? KP_VEC_KEYS : []).concat(signs ? KP_SIGN_KEYS : []).concat(KP_KEYS).map(k => (essay && k.v === '!done' ? KP_DONE_ESSAY : k)).map(kpKey_).join('');
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
    signs & 1 ? ' data-kp-signs="1"' : ''}${signs & 2 ? ' data-kp-vec="1"' : ''}${essay ? ' data-kp-essay="1"' : ''} aria-label="${esc(name || 'Your answer')}"
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
  s = s.replace(/\u27ee(\u03db?),/g, '\u27ee' + KP_HOLE + '$1,').replace(/,(\u03db?)\u27ef/g, ',' + KP_HOLE + '$1\u27ef')
    .replace(/\((\u03db?)\)/g, '(' + KP_HOLE + '$1)')
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
  if (caret < 0) return vecHtml_(esc(s));
  if (s.indexOf(KP_VEC_A) !== -1) {
    /* A VECTOR IN A WORDED ANSWER: drawn stacked, the caret or the selection kept inside it by marker */
    const a0 = Math.min(caret, s.length), b0 = Math.max(a0, Math.min(end == null ? a0 : end, s.length));
    const m = s.slice(0, a0) + (b0 > a0 ? KP_SEL_A + s.slice(a0, b0) + KP_SEL_B : KP_CARET) + s.slice(b0);
    return kpHoles_(vecHtml_(esc(m))).replace(/\u03db/g, '<span class="kp-caret"></span>')
      .replace(/\u03dd/g, '<mark class="kp-sel">').replace(/\u03df/g, '</mark>');
  }
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
  kpHandles_(inp);
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
    const c = show.querySelector('.kp-caret, .kp-sel');
    if (!c) return;
    const cr = c.getBoundingClientRect(), sr = show.getBoundingClientRect();
    /* AND SIDEWAYS, in a one-line box whose answer is longer than it (385) */
    if (show.scrollWidth > show.clientWidth + 1) {
      if (cr.right > sr.right - 4) show.scrollLeft += cr.right - sr.right + 12;
      else if (cr.left < sr.left + 4) show.scrollLeft -= sr.left - cr.left + 12;
    }
    if (show.scrollHeight <= show.clientHeight + 1) return;
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
  /* EVERY BOX'S PAD HAS THE SIGNS AND THE VECTOR AND UNIT ROW (round 3); the box's kind only picks the opening layer */
  const signs = true;
  const essay = !!inp && inp.hasAttribute('data-kp-essay');
  const vec = true;
  const sig = KP_LAYER + (words ? ':w' : ':m') + (signs && KP_LAYER === 'maths' ? ':s' : '') + (essay ? ':e' : '') + (vec ? ':v' : '');
  if (pad.getAttribute('data-sig') !== sig) {
    pad.innerHTML = kpPadHtml_(KP_LAYER, words, signs, essay, vec);
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
  /* THE BOX AND ITS TOOL ROW (round 3): the row is under the box with Check last in it, so the row's foot is what stays above the pad */
  const mark = inp && inp.closest && inp.closest('.qp-mark');
  const row = mark && mark.querySelector(':scope > .qt-row');
  if (row) return row;
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
  if (cmd === '!vec') put(KP_VEC_A + ',' + KP_VEC_B, 1);
  else if (cmd === '!frac') { if (term) put('/()', 2); else put('()/()', 1); }
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
  } else if (cmd === '!back' && b === a && kpVecStep_(v, a)) {
    /* A VECTOR'S BRACKETS AND COMMA ARE STEPPED OVER, never broken; an empty one goes whole */
    const r = kpVecStep_(v, a);
    if (r.del) { inp.value = v.slice(0, r.from) + v.slice(r.to); to(r.from); } else to(r.at);
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
    else if (a === 0 && v) {
      /* ⌫ WITH NOTHING BEFORE THE CARET is never a dead key in a maths box: it takes the last character (454) */
      inp.value = v.slice(0, -1); to(inp.value.length);
    } else if (a > 0) {
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
  /* ONE SUBMIT PATH (508): ✓ presses the box's own send tile, whatever it is called — a rule-marked box's `qp-rule` was missed before. */
  const go = box && (box.querySelector('.tile.is-submit[data-do]:not([disabled])')
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
  /* THE CLICK AFTER A HOLD, A DRAG OR A DOUBLE TAP (385) sets no caret: the gesture already put it where it belongs */
  if (Date.now() < KP_SWALLOW) { KP_SWALLOW = 0; return; }
  if (PRESS_MOVED || PRESS_SLIDING) return;
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  let at = null;
  /* ONLY A TAP IN THE BOX THE PAD IS ALREADY ON places the caret; arriving lands at the end, so ⌫ deletes (454: a tap left of a wrong answer froze ⌫ at 0) */
  if (KP_AT === inp && show && show.contains(e.target) && e.detail && inp.value) {
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

/* THE AI MARKS EVERY PART NO RULE CAN (`markerOf_`, qtools.js), and is offered after key words that fall short. */
function aiWanted_(x) {
  const k = x && typeof markerOf_ === 'function' ? markerOf_(x).kind : '';
  return k === 'ai' || k === 'words';
}

/* THE TILE ALONE, GOLD AND ROUND IN THE ANSWER BAR WHERE SEND STANDS ON A BOX WITH A SCHEME -- the bar, its verdict line and the sentence under it are § */
function aiTile_(x) {
  if (!aiWanted_(x)) return '';
  const wait = aiUndecided_();
  if (!wait && !aiOffered_()) return '';
  return checkTile_({ act: 'qp-ai', cls: wait ? 'qp-ai-go qp-ai-wait' : 'qp-ai-go', off: wait });
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

/* AND THE BOX SAYS THE MARKER IS OFF; its Check stays, unpressable, until it is on. */
function aiOff_(said) {
  AI_OFF = true;
  document.querySelectorAll('.qp-ai').forEach(box => {
    box.classList.add('is-off');
    /* NEVER SWAPPED FOR A PLAIN SEND: a human never marks, so the Check waits for the AI, off */
    box.querySelectorAll('.qp-ai-go').forEach(b => { b.disabled = true; });
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
/* KEPT IN THE PART'S ONE RECORD (qtools.js `partRecAt_`), field `ai`; an old `aiMark:` key is folded into it once. */
function aiKeep_(k, rec) {
  if (!k) return;
  partRecPutAt_(partKeyOfAns_(k), 'ai', rec);
}
function aiKept_(k) {
  if (!k) return null;
  const rec = partRecAt_(partKeyOfAns_(k)).ai;
  return rec && typeof rec.a === 'string' && typeof rec.v === 'string' ? rec : null;
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

/* ---------- MARK WITH AI SAYS WHERE IT IS (456): the owner, "it just says marking ... we didn't feel blind". The one wait allowed words beside the dots. § */
const AI_STAGE_SENT_MS = 1500;   // the answer is a few KB of text: past this it has left on any connection that will answer
const AI_STAGE_SLOW_MS = 20000;  // a mark usually lands well inside this; past it, say so
const AI_STAGE_TICK_MS = 500;
function aiStageSay_(ms) {
  const s = Math.floor(ms / 1000);
  /* ONLY WHAT HAS HAPPENED: sent, then marked by Gemini in one call -- so no "reading" stage it cannot vouch for. */
  const words = ms < AI_STAGE_SENT_MS ? 'Sending your work…'
    : ms < AI_STAGE_SLOW_MS ? 'Marking against the scheme…'
    : 'Still working — this one is taking longer than usual';
  return s ? words + ' · ' + s + ' s' : words;
}
function aiStageStart_(box, out) {
  let line = box.querySelector(':scope > .qp-ai-stage');
  if (!line) {
    line = document.createElement('div');
    if (out && out.parentNode === box) out.after(line); else box.appendChild(line);
  }
  line.className = 'qp-ai-stage';
  line.setAttribute('aria-busy', 'true');
  line.innerHTML = loading_() + '<span class="qp-ai-stage-say"></span>';
  const say = line.querySelector('.qp-ai-stage-say');
  const began = Date.now();
  const paint = () => { const t = aiStageSay_(Date.now() - began); if (say.textContent !== t) say.textContent = t; };
  paint();
  const timer = setInterval(paint, AI_STAGE_TICK_MS);
  return { line: line, stop: () => clearInterval(timer) };
}
/* A MARK TAKES THE LINE AWAY; A FAILURE LEAVES A TRY AGAIN TILE IN IT, the reason being the verdict line above. */
function aiStageEnd_(st, failed) {
  st.stop();
  if (!failed) { st.line.remove(); return; }
  st.line.removeAttribute('aria-busy');
  st.line.className = 'qp-ai-stage tile-row';
  st.line.innerHTML = tile_({ icon: 'again', label: 'Try again', act: 'qp-ai-again' });
}
on('qp-ai-again', (el) => {
  const box = el.closest('.qp-ai');
  const go = box && box.querySelector('[data-do="qp-ai"]');
  if (go && !go.disabled) ACTIONS['qp-ai'](go);
});

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
  if (!inp.value.trim()) {
    /* THE PART'S ONE RECORD says whether there is working elsewhere: a drawing or photos are working, the box is the answer */
    const rec = typeof partRec_ === 'function' ? partRec_(ansItem_(inp.getAttribute('data-k')) || {}) : {};
    out.textContent = (rec.strokes || []).length || rec.photos ? 'Write your answer in the box too \u2014 the drawing and photos are your working' : 'Write something first';
    return;
  }
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
  out.textContent = '';
  const stage = aiStageStart_(box, out);
  let failed = false;
  const done = () => { el.disabled = AI_OFF; box.classList.remove('is-busy'); el.classList.remove('is-busy'); aiStageEnd_(stage, failed); if (letGo) letGo(); };
  /* `essay` ASKS FOR THE LEVELLED MARKING (`aiMarkAsk_` in dopost.gs): § */
  const essay = ansEssay_(x);
  api({ action: 'aiMark', personId: USER.personId || '', question: aiQuestion_(x), scheme: aiScheme_(x),
        answer: sent, marks: Number(x.marks) || 1, essay: essay })
    .then(d => {
      /* NO TRY AGAIN WHERE AGAIN CANNOT HELP: switched off, or today's marks used. */
      failed = (!d || !d.success) && !(d && (d.why === 'ai-off' || d.why === 'ai-cap'));
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
      failed = true;
      done();
      out.textContent = 'Could not reach the marker \u2014 check the connection';
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

/* ---------- ROOM TO WRITE, the whole-screen sheet of 359, is gone (368): the owner found it did nothing; the box wraps its own lines */

/* ---------- EDITING LIKE iOS (385): "editing a text box of text you have already written is hard and clunky". */
const KP_LOUPE_MS = 350;   // held this long without moving, a finger on the box takes the caret and the loupe comes up
const KP_SLOP_PX = 8;      // moved further than this before then, the finger was scrolling or swiping, not editing
const KP_DBL_MS = 320;     // a second tap this soon, this near, selects the word
const KP_PAD_STEP_PX = 9;  // the space bar as a trackpad: one character per this much slide
let KP_EDIT = null;        // the gesture on a box: { inp, id, x0, y0, mode: 'wait'|'loupe'|'drag'|'handle', end, anchor, timer }
let KP_TAP = null;         // the last plain tap on a box, for the double tap
let KP_SWALLOW = 0;        // a click arriving before this time ends a gesture already handled, and sets no caret
let KP_SPACE = null;       // the space bar held: { id, x0, at, on }
const kpBusy_ = () => !!(KP_EDIT && KP_EDIT.mode !== 'wait');
const kpPlace_ = (inp, x, y) => {
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show || !inp.value) return 0;
  try { return kpHit_(inp, show, x, y); } catch (e) { return inp.value.length; }
};
function kpSelect_(inp, a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  try { inp.setSelectionRange(lo, hi, a > b ? 'backward' : 'forward'); } catch (e) {}
  kpRender_(inp);
}
/* THE WORD AROUND i: letters and digits together, or the one sign there */
function kpWordAt_(v, i) {
  const w = /[0-9a-zÀ-ɏ'.]/i;
  let a = Math.min(i, v.length), b = a;
  if (!w.test(v.charAt(a)) && a > 0 && w.test(v.charAt(a - 1))) a = b = a - 1;
  if (!w.test(v.charAt(a))) return [a, Math.min(v.length, a + 1)];
  while (a > 0 && w.test(v.charAt(a - 1))) a--;
  while (b < v.length && w.test(v.charAt(b))) b++;
  return [a, b];
}
/* THE LOUPE: the box's drawing, magnified, over the finger -- where the caret is when the finger hides it */
function kpLoupe_(inp, x, y) {
  let L = document.getElementById('kp-loupe');
  if (!inp) { if (L) L.hidden = true; return; }
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show) return;
  if (!L) { L = document.createElement('div'); L.id = 'kp-loupe'; L.className = 'kp-loupe'; L.setAttribute('aria-hidden', 'true'); document.body.appendChild(L); }
  const sr = show.getBoundingClientRect(), Z = 1.6, W = 132, H = 56;
  L.hidden = false;
  L.innerHTML = '<div class="kp-loupe-in"></div>';
  const inner = L.firstChild, copy = show.cloneNode(true);
  copy.style.cssText = 'position:absolute;margin:0;left:0;top:0;width:' + sr.width + 'px;height:' + sr.height + 'px;transform-origin:0 0;transform:scale(' + Z + ')';
  inner.appendChild(copy);
  copy.style.left = (W / 2 - (x - sr.left) * Z) + 'px';
  copy.style.top = (H / 2 - (y - sr.top) * Z) + 'px';
  L.style.left = Math.max(4, Math.min(innerWidth - W - 4, x - W / 2)) + 'px';
  L.style.top = Math.max(4, y - H - 44) + 'px';
}
/* SELECTION HANDLES, at the two ends of a selection, dragged to move that end (no new buttons: they are the selection's own ends) */
function kpHandles_(inp) {
  if (inp && inp.parentNode) inp.parentNode.querySelectorAll('.kp-handle').forEach(h => h.remove());
  if (!inp || KP_AT !== inp || !(inp.selectionEnd > inp.selectionStart)) return;
  const f = inp.parentNode, show = f && f.querySelector('.kp-show');
  if (!show) return;
  const fr = f.getBoundingClientRect();
  const ends = [show.querySelector('.kp-sel-a') || show.querySelector('mark.kp-sel'), show.querySelector('.kp-sel-b') || show.querySelector('mark.kp-sel')];
  ends.forEach((el, i) => {
    if (!el) return;
    const rs = el.getClientRects(), r = i ? rs[rs.length - 1] : rs[0];
    if (!r) return;
    const h = document.createElement('span');
    h.className = 'kp-handle kp-handle-' + (i ? 'b' : 'a');
    h.setAttribute('data-end', i ? 'b' : 'a');
    h.setAttribute('aria-hidden', 'true');
    h.style.left = ((i ? r.right : r.left) - fr.left) + 'px';
    h.style.top = (r.top - fr.top) + 'px';
    h.style.height = r.height + 'px';
    f.appendChild(h);
  });
}
document.addEventListener('pointerdown', e => {
  const t = e.target;
  const h = t && t.closest && t.closest('.kp-handle');
  const f = t && t.closest && t.closest('.kp-field');
  const inp = f && f.querySelector('.kp-in');
  if (!inp) return;
  clearTimeout(KP_EDIT && KP_EDIT.timer);
  if (h && KP_AT === inp) {
    e.preventDefault();
    KP_EDIT = { inp, id: e.pointerId, mode: 'handle', end: h.getAttribute('data-end'),
                fixed: h.getAttribute('data-end') === 'a' ? inp.selectionEnd : inp.selectionStart };
    return;
  }
  KP_EDIT = { inp, id: e.pointerId, x0: e.clientX, y0: e.clientY, mode: 'wait', mouse: e.pointerType === 'mouse' };
  if (KP_EDIT.mouse) {
    /* A MOUSE PRESSES AND DRAGS TO SELECT, from where it pressed */
    if (e.button !== 0) { KP_EDIT = null; return; }
    kpTake_(inp);
    KP_EDIT.anchor = kpPlace_(inp, e.clientX, e.clientY);
    return;
  }
  const g = KP_EDIT;
  g.timer = setTimeout(() => {
    if (KP_EDIT !== g || g.mode !== 'wait') return;
    g.mode = 'loupe';
    kpTake_(inp);
    const at = kpPlace_(inp, g.x0, g.y0);
    kpSelect_(inp, at, at);
    kpLoupe_(inp, g.x0, g.y0);
  }, KP_LOUPE_MS);
}, true);
document.addEventListener('pointermove', e => {
  const g = KP_EDIT;
  if (g && g.id === e.pointerId) {
    const far = g.x0 == null ? 0 : Math.hypot(e.clientX - g.x0, e.clientY - g.y0);
    if (g.mode === 'wait') {
      if (g.mouse && far > 3 && e.buttons & 1) g.mode = 'drag';
      else if (!g.mouse && far > KP_SLOP_PX) { clearTimeout(g.timer); KP_EDIT = null; return; }
      else return;
    }
    if (e.cancelable) e.preventDefault();
    const at = kpPlace_(g.inp, e.clientX, e.clientY);
    if (g.mode === 'loupe') { kpSelect_(g.inp, at, at); kpLoupe_(g.inp, e.clientX, e.clientY); }
    else if (g.mode === 'drag') kpSelect_(g.inp, g.anchor, at);
    else if (g.mode === 'handle') kpSelect_(g.inp, g.fixed, at);
    return;
  }
  /* THE SPACE BAR AS A TRACKPAD: held and slid, the caret moves a character per step and no space is typed */
  const S = KP_SPACE;
  if (S && S.id === e.pointerId) {
    const dx = e.clientX - S.x0;
    if (!S.on && Math.abs(dx) < KP_SLOP_PX) return;
    const inp = kpLive_();
    if (!inp) return;
    if (!S.on) { S.on = true; S.at = inp.selectionEnd == null ? inp.value.length : inp.selectionEnd; kpHoldStop_(); }
    KP_REPEATED = true;
    const at = Math.max(0, Math.min(inp.value.length, S.at + Math.round(dx / KP_PAD_STEP_PX)));
    kpSelect_(inp, at, at);
  }
}, { capture: true, passive: false });
const kpEditEnd_ = e => {
  const g = KP_EDIT;
  const S = KP_SPACE;
  if (S && S.id === e.pointerId) {
    /* THE LIFT IS THE LAST PLACE: a slide's final moves can arrive coalesced into the lift itself */
    const inp = S.on && kpLive_();
    if (inp) { const at = Math.max(0, Math.min(inp.value.length, S.at + Math.round((e.clientX - S.x0) / KP_PAD_STEP_PX))); kpSelect_(inp, at, at); }
    KP_SPACE = null;
  }
  if (!g || g.id !== e.pointerId) return;
  clearTimeout(g.timer);
  KP_EDIT = null;
  if (g.mode === 'wait') {
    /* A PLAIN TAP: the click handler puts the caret where the finger was; a second one soon after selects the word */
    const now = Date.now(), T = KP_TAP;
    KP_TAP = { inp: g.inp, at: now, x: e.clientX, y: e.clientY };
    if (T && T.inp === g.inp && now - T.at < KP_DBL_MS && Math.hypot(e.clientX - T.x, e.clientY - T.y) < 24 && g.inp.value) {
      KP_TAP = null;
      KP_SWALLOW = now + 600;
      kpTake_(g.inp);
      const w = kpWordAt_(g.inp.value, kpPlace_(g.inp, e.clientX, e.clientY));
      kpSelect_(g.inp, w[0], w[1]);
    }
    return;
  }
  /* AND THE LIFT IS WHERE THE CARET OR THE END STAYS, as above */
  if (g.mode !== 'wait' && e.type === 'pointerup') {
    const at = kpPlace_(g.inp, e.clientX, e.clientY);
    if (g.mode === 'loupe') kpSelect_(g.inp, at, at);
    else kpSelect_(g.inp, g.mode === 'drag' ? g.anchor : g.fixed, at);
  }
  kpLoupe_(null);
  KP_SWALLOW = Date.now() + 600;
  kpHandles_(g.inp);
};
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, kpEditEnd_, true));
document.addEventListener('pointerdown', e => {
  const k = e.target && e.target.closest && e.target.closest('#kp .kp-key');
  if (k && k.getAttribute('data-v') === ' ') KP_SPACE = { id: e.pointerId, x0: e.clientX, on: false };
}, true);
/* A HELD FINGER MOVING THE CARET IS NOT A SCROLL: the box allows panning (`touch-action: manipulation`), so the
   browser would take the drag and cancel the pointer; refused here only while the caret or a handle is held */
document.addEventListener('touchmove', e => { if ((kpBusy_() || (KP_SPACE && KP_SPACE.on)) && e.cancelable) e.preventDefault(); }, { capture: true, passive: false });
