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
/* THE LAYER THE ONE PAD OPENS ON: the accepted ways when the row has any, else its type (qtypes.js `qType_`). Never a gate on what it can type. */
/* the first way, the scheme's own answer, decides (Review A): 're | re-' is a prefix and 'HHH, HHT' outcomes, whatever their type says */
function ansMaths_(x) {
  if (!x) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  const ways = String(x.accept || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
  /* "x < 4 or x > 5" is two inequalities joined by a word: the joining word is not what is typed most */
  if (ways.length) return kpMathsy_(ways[0].replace(/\s+(or|and)\s+/gi, ' '));
  try { return !!QT_MATHS[qType_(workRow_(x))]; } catch (e) { return false; }
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
/* THE COUNT SAID, off the text itself, which is all either caller has. */
function kpWordsSay_(v) { const n = kpWordCount_(v); return n + (n === 1 ? ' word' : ' words'); }

/* ---------- THE KEYS § */
/* THE POWER KEY (owner: "there's no to the power of button on keypad"): drawn as x and a raised box, named so; it writes ^() with the caret inside, as x^2 and x^(n+1) are stored */
const KP_POW = { v: '!pow', a: 'to the power of', c: ' kp-op kp-pow', t: '<span class="kp-pw" aria-hidden="true">x<i></i></span>' };
const KP_KEYS = [
  { t: '7' }, { t: '8' }, { t: '9' }, { t: '\u00f7', a: 'divide' },
  { t: '(', a: 'open bracket' }, { t: ')', a: 'close bracket' },
  { t: '4' }, { t: '5' }, { t: '6' }, { t: '\u00d7', a: 'times' },
  { v: '!frac', a: 'fraction', c: ' kp-op',
    t: '<span class="kp-fr"><i></i><b></b><i></i></span>' },
  KP_POW,
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
/* AS AN iPHONE'S (562, owner notes 114, 128): ⇧ z–m ⌫ on the third row, one wide space bar on the last with 123, αβ and the mic; the rest of the punctuation is on αβ. */
const KP_DEL_KEY = () => KP_KEYS.find(k => k.v === '!back');
const KP_DONE_KEY = () => KP_KEYS.find(k => k.v === '!done');
const KP_MIC = { v: '!mic', a: 'dictate, speak instead of typing', c: ' kp-mode kp-mic', icon: 'mic' };
const KP_SPACE_KEY = { v: ' ', a: 'space', c: ' kp-space kp-mode', t: 'space' };
const KP_ABC = [].concat(
  'qwertyuiop'.split('').map(c => kpCh_(c)),
  'asdfghjkl'.split('').map((c, i) => kpCh_(c, '', 6, i ? 0 : 4)),
  [{ v: '!shift', a: 'capitals', c: ' kp-shift kp-mode', span: 9, t: '\u21e7' }],
  'zxcvbnm'.split('').map(c => kpCh_(c)),
  [Object.assign({}, KP_DEL_KEY(), { span: 9 })]);
/* THE LETTERS' LAST ROW: 123 αβ 🎤 [space] ' . ✓ — an essay's ends in return and done, a smaller space between. */
const kpAbcBottom_ = (essay, sym) => [
  Object.assign({ span: 6 }, { v: '!123', a: 'numbers and maths', c: ' kp-mode', t: '123' }),
  Object.assign({ span: 6 }, sym ? { v: '!abc', a: 'letters', c: ' kp-mode', t: 'abc' } : KP_SYM_KEY),
  Object.assign({}, KP_MIC, { span: 6 }),
  Object.assign({}, KP_SPACE_KEY, { span: essay ? 18 : 24 }),
  /* ON αβ the two punctuation keys give way to ⌫, which the symbols have no other row for. */
  ...(sym ? [Object.assign({}, KP_DEL_KEY(), { span: 12 })] : [kpCh_('\'', 'apostrophe', 6), kpCh_('.', 'full stop', 6)])]
  .concat(essay ? [Object.assign({}, KP_RETURN, { span: 6 }), Object.assign({}, KP_DONE_ESSAY, { span: 6 })]
    : [Object.assign({}, KP_DONE_KEY(), { span: 6 })]);
/* THE ESSAY'S DONE KEY, which puts the pad away rather than sending. */
const KP_DONE_ESSAY = { v: '!done', a: 'done, put the keypad away', c: ' kp-done kp-done-k', t: 'done' };
/* AND THE SYMBOLS' KEY BESIDE `123` (round 4); on the symbols face `abc` stands there, and the space stays a space */
const KP_SYM_KEY = { v: '!sym', a: 'symbols and Greek letters', c: ' kp-mode', t: '\u03b1\u03b2' };
/* ---------- THE SYMBOLS (round 4): what a stored answer is written in and no other key types -- Greek letters, ≈ ≠ → ∞ … ∛, sets and intervals */
const kpSy_ = (t, a, v) => ({ v: v, t: t, a: a, c: ' kp-op kp-sy', span: 6 });
const KP_SYM = [
  kpSy_('\u03b1', 'alpha'), kpSy_('\u03b2', 'beta'), kpSy_('\u03b3', 'gamma'), kpSy_('\u03b8', 'theta'), kpSy_('\u03bb', 'lambda'),
  kpSy_('\u03bc', 'mu'), kpSy_('\u03c3', 'sigma'), kpSy_('\u03c6', 'phi'), kpSy_('\u03c9', 'omega'), kpSy_('\u03a9', 'capital omega, ohms'),
  kpSy_('\u2248', 'approximately equal to'), kpSy_('\u2260', 'not equal to'), kpSy_('\u2192', 'an arrow, tends to'), kpSy_('\u221e', 'infinity'),
  kpSy_('\u2026', 'and so on'), kpSy_('\u221b', 'cube root'), kpSy_('~', 'tilde, is distributed as'), kpSy_('\u2208', 'is a member of'),
  kpSy_('\u222a', 'union'), kpSy_('\u2229', 'intersection'),
  kpSy_('{', 'open curly bracket'), kpSy_('}', 'close curly bracket'), kpSy_('[', 'open square bracket'), kpSy_(']', 'close square bracket'),
  kpSy_('_', 'underscore, for a subscript'), kpSy_('!', 'exclamation mark, factorial'), kpSy_('x\u0304', 'a bar over the letter before', '\u0304'),
  /* THE PUNCTUATION THE LETTERS GAVE UP FOR THE WIDE SPACE BAR (562): one row of ten. */
  kpSy_(',', 'comma', ','), kpSy_('?', 'question mark', '?'), kpSy_('-', 'hyphen', '-'), kpSy_(':', 'colon', ':'), kpSy_(';', 'semicolon', ';'),
  kpSy_('"', 'quotation mark', '"'), kpSy_('(', 'open bracket', '('), kpSy_(')', 'close bracket', ')'), kpSy_('/', 'slash', '/'), kpSy_('&amp;', 'and', '&'),
  kpSy_('\u2124', 'the integers'), kpSy_('\u211d', 'the real numbers'), kpSy_('\u00b5', 'micro, for a unit'),
];
/* ---------- AN ESSAY'S LETTERS: A RETURN KEY YOU CAN SEE § */
const KP_RETURN = { v: '!nl', a: 'return, a new line', c: ' kp-mode kp-ret', span: 12,
  t: '<span class="kp-ret-i" aria-hidden="true">\u21b5</span><span class="kp-ret-k">return</span>' };

/* ---------- EVERY OTHER BOX ON THE SITE (528): the same pad, its maths keys made plain characters, and @ . / for an address */
const KP_MAIL_KEYS = ['@', '.', '/', '_', '-', ':'].map(c => kpCh_(c, { '@': 'at', '.': 'dot', '/': 'slash', '_': 'underscore', '-': 'hyphen', ':': 'colon' }[c], 10));
const KP_SITE_KEYS = [
  { t: '@', a: 'at', c: ' kp-op' }, { t: '#', a: 'hash', c: ' kp-op' }, { t: '&amp;', v: '&', a: 'and', c: ' kp-op' },
  { t: '%', a: 'per cent', c: ' kp-op' }, { t: '\u00a3', a: 'pounds', c: ' kp-op' }, { t: '!', a: 'exclamation mark', c: ' kp-op' },
];
const KP_PLAIN = { '!frac': { t: '/', a: 'slash', c: ' kp-op' }, '!pow': { t: '^', a: 'caret', c: ' kp-op' }, '!sqrt': { t: '\u221a', a: 'root sign', c: ' kp-op' } };
const kpPlainKey_ = k => KP_PLAIN[k.v] || k;

/* A KEY IS A TILE (owner's look rule: every control is a tile), drawn by `tile_` with the key's own face; `.kp-key` gives it the pad's shape. */
const kpKey_ = k => tile_({ act: 'kp-key', cls: 'kp-key' + (k.c || ''), label: k.a || String(k.t || ''),
  data: { v: k.v != null ? k.v : k.t }, icon: k.icon, face: k.icon ? '' : String(k.t || ''),
  style: k.span ? 'grid-column:' + (k.at ? k.at + ' / ' : '') + 'span ' + k.span : '' });
/* THE PAD'S KEYS FOR A LAYOUT AND A BOX. § */
/* AND ON THE LETTERS TOO, beside the vector, so a power is never a face away: seven keys over the letters' sixty columns */
const KP_ABC_TOP_SPAN = [8, 9, 9, 9, 9, 8, 8];
/* `site` IS A BOX ELSEWHERE ON THE SITE (528): 'mail' tops the letters with @ . /, any other the 123 face with @ # & and plain keys for the structures */
function kpPadHtml_(layer, words, signs, essay, vec, site) {
  if (layer === 'sym') return KP_SYM.concat(kpAbcBottom_(essay, true)).map(kpKey_).join('');
  const top = site === 'mail' ? KP_MAIL_KEYS : site ? [] : vec ? [KP_POW].concat(KP_VEC_KEYS).map((k, i) => Object.assign({}, k, { span: KP_ABC_TOP_SPAN[i] })) : [];
  if (layer === 'abc') return top.concat(KP_ABC).concat(kpAbcBottom_(essay)).map(kpKey_).join('');
  if (site) return KP_SITE_KEYS.concat(KP_SIGN_KEYS, KP_KEYS.map(kpPlainKey_)).map(k => (essay && k.v === '!done' ? KP_DONE_ESSAY : k)).map(kpKey_).join('');
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
  if (kpSite_(inp)) return;
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
  const say = kpWordsSay_(inp.value);
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
  try { inp.focus({ preventScroll: true }); } catch (e) { try { inp.focus(); } catch (e2) { /* an element that cannot take focus is left as it is */ } }
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
  /* A BOX ELSEWHERE (528): a textarea is an essay's pad (return types a new line, `done` puts it away), an address has @ . / */
  const site = kpSite_(inp) ? (inp.getAttribute('data-kpb') === 'mail' ? 'mail' : 'site') : '';
  const essay = !!inp && (inp.hasAttribute('data-kp-essay') || (!!site && kpLines_(inp)));
  const vec = true;
  const sig = KP_LAYER + (words ? ':w' : ':m') + (signs && KP_LAYER === 'maths' ? ':s' : '') + (essay ? ':e' : '') + (vec ? ':v' : '') + (site ? ':' + site : '');
  if (pad.getAttribute('data-sig') !== sig) {
    pad.innerHTML = kpPadHtml_(KP_LAYER, words, signs, essay, vec, site);
    pad.setAttribute('data-sig', sig);
  }
  pad.classList.toggle('is-site', !!site);
  kpNextPaint_(pad, inp);
  pad.classList.toggle('is-abc', KP_LAYER === 'abc');
  pad.classList.toggle('is-sym', KP_LAYER === 'sym');
  pad.setAttribute('data-layer', KP_LAYER);
  pad.setAttribute('aria-label', KP_LAYER === 'abc' ? 'Letters keypad' : KP_LAYER === 'sym' ? 'Symbols keypad' : site ? 'Numbers keypad' : 'Maths keypad');
  kpShiftPaint_();
  kpStrip_(pad, inp);
  return pad;
}
/* ---------- THE QUESTION ABOVE THE PAD (round 4): on a phone the pad's eight rows can hide what is asked, so its first lines ride on the pad, and a tap goes to it whole */
/* THE WORDS OF A SHEET: a paragraph's end is a space ("…set, E Find the…", not "EFind"), and a figure's labels are not words */
function kpWordsOf_(sheet) {
  const c = sheet.cloneNode(true);
  c.querySelectorAll('svg, figure, img').forEach(el => el.remove());
  c.querySelectorAll('p, div, li, br, h3, h4, tr, td, th').forEach(el => el.appendChild(document.createTextNode(' ')));
  return String(c.textContent || '').replace(/\s+/g, ' ').trim();
}
function kpStrip_(pad, inp) {
  let q = pad.querySelector(':scope > .kp-q');
  const card = inp && inp.closest && inp.closest('.qcard');
  const sheet = card && (card.querySelector('.qsheet-part') || card.querySelector('.qsheet'));
  const said = sheet ? kpWordsOf_(sheet) : '';
  if (!said) { if (q) q.remove(); return; }
  if (!q) {
    q = document.createElement('button');
    q.type = 'button';
    q.className = 'kp-q';
    q.setAttribute('data-do', 'kp-q');
    q.innerHTML = '<span class="kp-q-t"></span>';
  }
  if (pad.firstElementChild !== q) pad.insertBefore(q, pad.firstElementChild);
  q.firstElementChild.textContent = said;
  q.setAttribute('aria-label', 'Show the question: ' + said.slice(0, 160));
}
/* THE TAP: the lift and the room for the pad let go, and the question's own scroller brought to its first line; the next key brings the box back */
on('kp-q', () => {
  const inp = kpLive_();
  const card = inp && inp.closest('.qcard');
  const sheet = card && (card.querySelector('.qsheet') || card);
  if (!sheet) return;
  kpRoomBack_();
  let el = sheet.parentNode;
  while (el && el !== document.body) {
    const oy = getComputedStyle(el).overflowY;
    if (oy === 'auto' || oy === 'scroll') break;
    el = el.parentNode;
  }
  if (el && el !== document.body) el.scrollTop += sheet.getBoundingClientRect().top - el.getBoundingClientRect().top - 8;
});
/* ✓ READS "next" IN A BOX WITH ANOTHER AFTER IT (one box per value, 362), and is Send again on the last. */
function kpNextPaint_(pad, inp) {
  const d = pad.querySelector('.kp-key.kp-done:not(.kp-done-k)');
  if (!d) return;
  const nx = !!(inp && typeof multiNext_ === 'function' && multiNext_(inp));
  if (d.classList.contains('is-next') === nx) return;
  d.classList.toggle('is-next', nx);
  d.setAttribute('aria-label', nx ? 'next box' : 'done');
  /* THE SEND MARK FROM A KEY DRAWN THE ONE WAY (`kpKey_`), so the pad keeps a single maker for its faces. */
  const t = document.createElement('i'); t.innerHTML = kpKey_({ icon: 'send' });
  d.innerHTML = nx ? 'next' : t.firstElementChild.innerHTML;
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
  if (!kpIs_(inp)) return;
  const site = kpSite_(inp);
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
    KP_LAYER = site ? (inp.getAttribute('data-kpb') === 'num' ? 'maths' : 'abc') : inp.getAttribute('data-kp') === 'words' ? 'abc' : 'maths';
    KP_SHIFT = 'off';
  }
  const pad = kpLayout_(inp);
  pad.hidden = false;
  document.documentElement.classList.add('kp-up');
  /* A BOX ELSEWHERE KEEPS THE CARET WHERE THE FINGER PUT IT: it is a real field, and the browser placed it */
  if (!same && !site) {
    const at = back ? Math.max(0, Math.min(KP_WAS.caret, inp.value.length)) : inp.value.length;
    try { inp.setSelectionRange(at, at); } catch (e) { /* focus and scrolling are niceties */ }
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
  /* A FINDER'S CARD IS CENTRED IN WHAT SHOWS ABOVE THE PAD (720), then held there while you type — `glassSeenH_` (shell.js). */
  if (kpFinderCentre_(inp)) return;
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
  /* AND A FINDER, ITS PAD GONE, IS CENTRED AGAIN in the whole glass. */
  if (!(L && L.lift) && typeof finderOf_ === 'function' && finderOf_(AT)) { try { placeCells('y', true, 0, AT); } catch (e) { /* left where it was */ } }
  if (L && L.lift) {
    L.lift = 0;
    try { if (HOLD_AT === L) placeCells('y', true, 0, L.id); } catch (e) { oops_(e, 'keypad:kpRoomBack_') }
  }
}
function kpFinderCentre_(inp) {
  try {
    if (typeof finderOf_ !== 'function' || !finderOf_(AT)) return false;
    const pg = inp.closest('#screen .page.on'), host = pg && pg.parentElement;
    if (!host || host.id !== 's-' + AT) return false;
    holdHere_(inp);
    const h = HOLD_AT;
    if (!h || h.id !== AT) return false;
    const seen = glassSeenH_(host);
    if (pg.offsetHeight > seen) return false;   // taller than what shows: the lift below keeps the box clear instead
    h.lift = 0; h.top = Math.max(0, (seen - pg.offsetHeight) / 2); h.h = pg.offsetHeight;
    placeCells('y', true, 0, AT);
    return true;
  } catch (e) { return false; }
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
  /* ONE SCROLLING PAGE (900): the page scrolls the box above the pad; the body's foot makes the room (style.css, `.kp-up`). */
  if (FLOW_LAYOUT) { try { window.scrollBy(0, kpBox_(inp).getBoundingClientRect().bottom - (pad.getBoundingClientRect().top - 12)); } catch (e) { /* left where it is */ } return; }
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
  if (kpSite_(inp)) return kpSiteEdit_(inp, cmd);
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
  try { inp.setSelectionRange(Math.min(to.a, to.v.length), Math.min(to.b, to.v.length)); } catch (e) { /* focus and scrolling are niceties */ }
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
