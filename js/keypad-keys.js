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
  try { return qtKeys_(qType_(workRow_(x))) === 'maths'; } catch (e) { return false; }
}

/* ---------- WHICH ANSWERS ARE ESSAYS § */
/* THE SAME ONE BOX, BIGGER: a part qType_ calls an essay is written on the sheet. */
function ansEssay_(x) {
  if (!x) return false;
  try { return qtKeys_(qType_(workRow_(x))) === 'sheet'; } catch (e) { return false; }
}
/* AND HOW LONG IT IS, in words -- the one thing a pupil checks about an essay while writing it, so the sheet says it under itself rather than leaving it to be § */
const KP_NOT_WORD = /^[.,;:!?'"()\[\]\-‐-―‘-‟…·*\/]+$/;
function kpWordCount_(v) { return (String(v || '').match(/\S+/g) || []).filter(w => !KP_NOT_WORD.test(w)).length; }
/* THE COUNT SAID, off the text itself, which is all either caller has. */
function kpWordsSay_(v) { const n = kpWordCount_(v); return n + (n === 1 ? ' word' : ' words'); }

/* ---------- THE ONE KEYBOARD (owner 23 Nov, ONE KEYBOARD): one fixed layout on every box on the site -- letters, numbers and maths keys
   always in the same places, seven rows of ten; a key a box cannot use is greyed where it stands (`kpCan_`), never hidden, and no key turns
   the pad over. NO KEY DOES ANOTHER KEY'S JOB (tools/keypad-taps.js): x² and x³ are xⁿ, (−) is −, ×10ⁿ is × 1 0 xⁿ, ( , ) is ( , ), a mixed
   number is its whole, space and the fraction, cm is c m, y and x are the letters, undo is ⌫, the hyphen is −. */
const kpCh_ = (t, a, span, at) => ({ t: t, a: a || '', c: ' kp-ch', span: span || 6, at: at || 0 });
const kpOp_ = (t, a, v) => ({ v: v, t: t, a: a, c: ' kp-op' });
/* THE POWER KEY (owner: "there's no to the power of button on keypad"): drawn as x and a raised box; it writes ^() with the caret inside */
const KP_POW = { v: '!pow', a: 'to the power of', c: ' kp-op kp-pow', t: { type: 'group', tag: 'span', look: 'kp-pw', attrs: { 'aria-hidden': 'true' }, text: ['x', { i: '' }] } };
const KP_FRAC = { v: '!frac', a: 'fraction', c: ' kp-op', t: { type: 'group', tag: 'span', look: 'kp-fr', text: [{ i: '' }, { b: '' }, { i: '' }] } };
/* THE VECTOR: a column vector, top over bottom in one pair of brackets (385). */
const KP_VEC_A = '⟮', KP_VEC_B = '⟯';
const KP_VEC = { v: '!vec', a: 'column vector', c: ' kp-op kp-vec', t: { type: 'group', tag: 'span', look: 'kp-vc', attrs: { 'aria-hidden': 'true' }, text: [{ i: '' }, { i: '' }] } };
/* ⌫ IS RED, AND ITS MARK IS DRAWN § */
const KP_BACK = { v: '!back', a: 'delete', c: ' kp-del',
  t: { type: 'drawing', node: { el: 'svg', a: { class: 'kp-del-i', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false', fill: 'none',
    stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    kids: [{ el: 'path', a: { d: 'M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z' } }, { el: 'path', a: { d: 'm12.5 9.5 5 5M17.5 9.5l-5 5' } }] } } };
/* ✓ IS DONE: the next box, or the pad put away; on a box elsewhere it is that box's Enter (`kpSiteDone_`) */
const KP_DONE = { v: '!done', a: 'done, put the keypad away', c: ' kp-done', t: 'done' };
const KP_DONE_ESSAY = { v: '!done', a: 'done, put the keypad away', c: ' kp-done kp-done-k', t: 'done' };
const KP_MIC = { v: '!mic', a: 'dictate, speak instead of typing', c: ' kp-mode kp-mic', icon: 'mic' };
/* AN ESSAY'S RETURN KEY YOU CAN SEE § */
const KP_RETURN = { v: '!nl', a: 'return, a new line', c: ' kp-mode kp-ret',
  t: [{ type: 'group', tag: 'span', look: 'kp-ret-i', attrs: { 'aria-hidden': 'true' }, text: '↵' }, { type: 'group', tag: 'span', look: 'kp-ret-k', text: 'return' }] };
const KP_ONE = [].concat(
  '1234567890'.split('').map(c => kpCh_(c)),
  [kpOp_('+', 'plus'), kpOp_('−', 'minus', '-'), kpOp_('×', 'times'), kpOp_('÷', 'divide'), kpOp_('=', 'equals'),
    kpOp_('(', 'open bracket'), kpOp_(')', 'close bracket'), KP_FRAC, KP_POW, kpOp_('√', 'square root', '!sqrt')],
  'qwertyuiop'.split('').map(c => kpCh_(c)),
  'asdfghjkl'.split('').map(c => kpCh_(c)), [kpCh_('\'', 'apostrophe')],
  'zxcvbnm'.split('').map(c => kpCh_(c)), [kpCh_('.', 'point, full stop'), kpCh_(',', 'comma'), KP_BACK],
  [kpOp_('<', 'less than'), kpOp_('>', 'greater than'), kpOp_('≤', 'less than or equal to'), kpOp_('≥', 'greater than or equal to'),
    kpOp_(':', 'colon, for a ratio'), kpOp_('±', 'plus or minus'), kpOp_('π', 'pi'), kpOp_('%', 'per cent'), kpOp_('£', 'pounds'), kpOp_('°', 'degrees')],
  [KP_VEC, kpCh_('?', 'question mark'), kpCh_('@', 'at'), KP_MIC,
    { v: '!left', a: 'move left', c: ' kp-mode', t: '←' },
    { v: ' ', a: 'space', c: ' kp-space kp-mode', t: 'space', span: 12 },
    { v: '!right', a: 'move right', c: ' kp-mode', t: '→' }, KP_RETURN, KP_DONE]);
const kpV_ = k => (k.v != null ? k.v : k.t);
/* AN EMPTY TOP OR BOTTOM DRAWN AS A HOLE TO TAP INTO, as the fraction's are */
const kpHoles_ = h => h.replace(/<span class="vec-(a|b)">(ϛ?)<\/span>/g, (m, w, c) => cardBlocks_({ type: 'group', tag: 'span', look: 'vec-' + w, text: c, blocks: [kpDotB_('kp-hole')] }));
/* A MARK IN THE DRAWN ANSWER (a hole, the caret, a selection's end): an empty span of one class, by the one maker. */
function kpDotB_(look) { return { type: 'group', tag: 'span', look }; }
const kpDot_ = look => cardBlocks_(kpDotB_(look));
/* A WORDED SELECTION, its words highlighted; `kpSelEnds_` is its open and close, for a selection that runs across a vector's parts. */
const kpSel_ = t => cardBlocks_({ type: 'group', tag: 'mark', look: 'kp-sel', text: t });
const kpSelEnds_ = () => kpSel_('\u0000').split('\u0000');
function kpVecStep_(v, a) {
  const c = v.charAt(a - 1);
  if (v.slice(a - 1, a + 2) === KP_VEC_A + ',' + KP_VEC_B) return { del: true, from: a - 1, to: a + 2 };
  if (c === KP_VEC_A || c === KP_VEC_B) return { at: a - 1 };
  if (c === ',' && v.lastIndexOf(KP_VEC_A, a - 1) > v.lastIndexOf(KP_VEC_B, a - 1)) return { at: a - 1 };
  return null;
}
/* ---------- THE SYMBOLS (round 4): what a stored answer is written in and no key types -- Greek letters, ≈ ≠ → ∞ … ∛, sets and
   intervals -- named here for the row under the seven that an answer using one gets (`kpNeedKeys_`) */
const kpSy_ = (t, a, v) => ({ v: v, t: t, a: a, c: ' kp-op', span: 6 });
const KP_SYM = [
  kpSy_('α', 'alpha'), kpSy_('β', 'beta'), kpSy_('γ', 'gamma'), kpSy_('θ', 'theta'), kpSy_('λ', 'lambda'),
  kpSy_('μ', 'mu'), kpSy_('σ', 'sigma'), kpSy_('φ', 'phi'), kpSy_('ω', 'omega'), kpSy_('Ω', 'capital omega, ohms'),
  kpSy_('≈', 'approximately equal to'), kpSy_('≠', 'not equal to'), kpSy_('→', 'an arrow, tends to'), kpSy_('∞', 'infinity'),
  kpSy_('…', 'and so on'), kpSy_('∛', 'cube root'), kpSy_('~', 'tilde, is distributed as'), kpSy_('∈', 'is a member of'),
  kpSy_('∪', 'union'), kpSy_('∩', 'intersection'),
  kpSy_('{', 'open curly bracket'), kpSy_('}', 'close curly bracket'), kpSy_('[', 'open square bracket'), kpSy_(']', 'close square bracket'),
  kpSy_('_', 'underscore, for a subscript'), kpSy_('!', 'exclamation mark, factorial'), kpSy_('x̄', 'a bar over the letter before', '̄'),
  kpSy_(';', 'semicolon', ';'), kpSy_('"', 'quotation mark', '"'), kpSy_('&', 'and', '&'),
  kpSy_('ℤ', 'the integers'), kpSy_('ℝ', 'the real numbers'), kpSy_('µ', 'micro, for a unit'),
];

/* A KEY'S FACE: its text escaped, or its drawing (a group or drawing block, or several) drawn by the one maker. */
const kpFace_ = t => (t != null && typeof t === 'object' ? cardBlocks_(t) : esc(String(t || '')));
/* A KEY IS A TILE (owner's look rule: every control is a tile), drawn by `tile_` with the key's own face; `.kp-key` gives it the pad's
   shape, and `.kp-off` greys a key this box cannot use where it stands. */
const kpKey_ = (k, off) => tile_({ act: 'kp-key', label: k.a || String(k.t || ''),
  data: off ? { v: kpV_(k), off: '1' } : { v: kpV_(k) }, icon: k.icon, face: k.icon ? '' : kpFace_(k.t),
  cls: 'kp-key' + (k.c || '') + ' kp-s' + (k.span || 6) + (k.at ? ' kp-at' + k.at : '') + (off ? ' kp-off' : '') });
/* EVERY ROW OF THE SIXTY COLUMNS STARTS AT COLUMN 1, said on its first key (`at: 1`) as the spans add up (iPad, 2406-2F Q28a). */
function kpRows_(keys) {
  let used = 0;
  return keys.map(k => { const span = k.span || 6, first = used % 60 === 0; used += (k.at ? k.at - 1 - used % 60 : 0) + span;
    return first && !k.at ? Object.assign({}, k, { at: 1 }) : k; });
}
const KP_SIGNS_RE = /[<>≤≥:±]/, KP_VEC_RE = /[%£°⟮⟯]/;
const kpWays_ = acc => String(acc || '').split('|').map(w => w.trim()).filter(w => w && !/^rule:/i.test(w));
/* A ROW UNDER THE SEVEN for a capital or a sign the answer uses that no key types (a Greek letter): added below, never in the layout's
   places, so every key above stays where it always is */
function kpNeedKeys_(acc) {
  const on = new Set(KP_ONE.map(kpV_).filter(v => typeof v === 'string' && v.length === 1).concat(['−', '/', '^', '√']));
  const out = [];
  for (const c of [...new Set(kpWays_(acc).join('').replace(/\s/g, ''))]) {
    if (on.has(c) || /[²³⟮⟯]/.test(c)) continue;
    const sym = KP_SYM.find(k => (k.v || k.t) === c);
    out.push(Object.assign(kpCh_(c, sym ? sym.a : (/[A-Z]/.test(c) ? 'capital ' + c : c), 6), { need: true }));
    if (out.length >= 10) break;
  }
  return out;
}
/* WHAT THIS BOX CAN USE: `box` is { kind: 'maths' | 'words' | 'letters' | 'site', essay, site: 'abc' | 'mail' | 'num', secret, acc } */
function kpCan_(k, box) {
  const v = kpV_(k);
  if (k.need || /^!(back|left|right|done)$/.test(v)) return true;
  if (v === '!nl') return !!box.essay;
  if (box.kind === 'letters') return /^[a-z]$/.test(v) && String(box.acc || '').indexOf(v.toUpperCase()) >= 0;
  if (box.kind === 'site') {
    if (box.site === 'num') return /^[\d.,+\-() ]$/.test(v);
    return v !== '!vec' && !(v === '!mic' && box.secret);
  }
  if (box.kind === 'words') return true;
  /* A MATHS BOX: the numbers, the maths row, π, x and y, and the space always; the rest when its answer uses them, or nothing says what it is */
  const ways = kpWays_(box.acc).join(' ');
  if (!ways) return v !== '!mic' && !/^[?'@]$/.test(v);
  if (/^[\d+\-×÷=().,π xy]$/.test(v) || /^!(frac|pow|sqrt)$/.test(v)) return true;
  if (/^[<>≤≥:±]$/.test(v)) return KP_SIGNS_RE.test(ways);
  if (/^[%£°]$/.test(v) || v === '!vec') return KP_VEC_RE.test(ways);
  if (/^[a-z?'@]$/.test(v)) return ways.toLowerCase().indexOf(v) >= 0;
  return false;
}
/* THE PAD'S KEYS FOR A BOX: the one layout, each key greyed or not, and the row of what no key types when the answer needs one */
function kpPadHtml_(box) {
  const b = box || { kind: 'maths' };
  const need = (b.kind === 'maths' || b.kind === 'words') && !b.essay ? kpNeedKeys_(b.acc) : [];
  return kpRows_(KP_ONE.map(k => (b.essay && k.v === '!done' ? KP_DONE_ESSAY : k)).concat(need)).map(k => kpKey_(k, !kpCan_(k, b))).join('');
}

/* ---------- THE BOX § */
const KP_HOLE = '\u03d9', KP_CARET = '\u03db';
/* `kind` 'essay' IS A WORDED BOX THAT IS A SHEET (`ansEssay_`): § */
/* `more` ARE A BOX'S OWN ATTRIBUTES over the answer's (a game's box: its id and its own data-do, so it is never stored as an answer). */
const KP_BOX_KINDS = { essay: { essay: true, words: true }, words: { words: true } };
function kpField_(k, val, kind, signs, name, more) {
  const box = Object.prototype.hasOwnProperty.call(KP_BOX_KINDS, kind) ? KP_BOX_KINDS[kind] : {};
  const essay = !!box.essay;
  const words = !!box.words;
  const v = val == null ? '' : String(val);
  const lock = { class: 'qp-ans-in kp-in', 'data-do': 'qp-ans',
    'data-k': k, 'data-kp': words ? 'words' : 'maths', 'data-kp-signs': signs & 1 ? '1' : null, 'data-kp-vec': signs & 2 ? '1' : null, 'data-kp-essay': essay ? '1' : null,
    'aria-label': name || text_('your-answer'), readonly: true, inputmode: 'none', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
    enterkeyhint: essay ? 'enter' : 'done' };
  if (more) Object.assign(lock, more);
  return cardBlocks_({ type: 'group', tag: 'span', look: 'kp-field kp-' + (words ? 'words' : 'maths') + (essay ? ' kp-essay' + (v ? '' : ' is-blank') : ''), blocks: [
    { type: 'group', tag: 'span', look: 'kp-show', attrs: { 'aria-hidden': 'true' }, inner: kpDraw_(v, -1, words) },
    words ? { type: 'control', tag: 'textarea', attrs: Object.assign({}, lock, { rows: '1' }), value: v } : { type: 'control', attrs: Object.assign({}, lock, { value: v }) }] });
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
    /* A POINT'S EMPTY x OR y (the coordinate key's (,)) is a hole too */
    .replace(/\((\u03db?),/g, '(' + KP_HOLE + '$1,').replace(/,(\u03db?)\)/g, ',' + KP_HOLE + '$1)')
    .replace(/(^|[\s(+\-\u00d7\u00f7=,])(\u03db?)\//g, '$1$2' + KP_HOLE + '/')
    .replace(new RegExp('\\/(\u03db?)' + END, 'g'), '/' + KP_HOLE + '$1')
    .replace(new RegExp('\\^(\u03db?)' + END, 'g'), '^(' + KP_HOLE + '$1)')
    .replace(new RegExp('\u221a(\u03db?)' + END, 'g'), '\u221a' + KP_HOLE + '$1')
    /* A FRACTION RAISED, x^((1)/(2)), DRAWN AS THE SMALL \u00bd OF x^(1/2), not with its working brackets showing */
    .replace(/\^\(\(([^()]*)\)\/\(([^()]*)\)\)/g, (m, p, q) => (/^-?[^-+\u00d7\u00f7=\s]*$/.test(p) && /^[^-+\u00d7\u00f7=\s]*$/.test(q) ? '^(' + p + '/' + q + ')' : m));
  /* THE SLASH AS `&frasl;` AFTER ESCAPING, which is what `typeset_` stacks — `tbMath_` in find.js does the same for the textbooks. § */
  const h = typeset_(esc(s).replace(/\//g, '&frasl;').replace(/-/g, '\u2212'));
  return h.replace(/\u03d9/g, () => kpDot_('kp-hole'))
          .replace(/\u03db/g, () => kpDot_('kp-caret'))
          .replace(/\u03dd/g, () => kpDot_('kp-sel-a')).replace(/\u03df/g, () => kpDot_('kp-sel-b'));
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
    const sel = kpSelEnds_();
    return kpHoles_(vecHtml_(esc(m))).replace(/\u03db/g, () => kpDot_('kp-caret'))
      .replace(/\u03dd/g, () => sel[0]).replace(/\u03df/g, () => sel[1]);
  }
  const a = Math.min(caret, s.length);
  const b = Math.max(a, Math.min(end == null ? a : end, s.length));
  return esc(s.slice(0, a)) + (b > a ? kpSel_(s.slice(a, b)) : kpDot_('kp-caret')) + esc(s.slice(b));
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
  tell_(out, 'info', say);
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
  pad.setAttribute('aria-label', 'Keyboard');
  pad.innerHTML = kpPadHtml_({ kind: 'maths' });
  pad.setAttribute('data-sig', '');
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

/* THE PAD FOR THIS BOX: the one layout (`kpPadHtml_`), greyed for what the box cannot use. § */
function kpBoxOf_(inp) {
  const site = kpSite_(inp) ? (inp.getAttribute('data-kpb') || 'abc') : '';
  /* a textarea elsewhere is an essay's pad: return types a new line, `done` puts it away */
  const essay = !!inp && (inp.hasAttribute('data-kp-essay') || (!!site && kpLines_(inp)));
  /* THE ANSWER'S ACCEPTED WAYS say which keys it can use: the part's `data-accept`, or an options box's letters */
  const holder = inp && inp.closest ? inp.closest('[data-accept]') : null;
  const kind = site ? 'site' : KP_LAYER === 'letters' ? 'letters' : inp && inp.getAttribute('data-kp') === 'words' ? 'words' : 'maths';
  const acc = kind === 'letters' ? inp.getAttribute('data-kp-letters') : kind === 'site' ? null : holder ? holder.getAttribute('data-accept') : null;
  return { kind, essay, site, secret: !!site && kpSecret_(inp), acc };
}
function kpLayout_(inp) {
  const pad = kpPad_();
  const box = kpBoxOf_(inp);
  const sig = JSON.stringify(box);
  if (pad.getAttribute('data-sig') !== sig) {
    pad.innerHTML = kpPadHtml_(box);
    pad.setAttribute('data-sig', sig);
  }
  pad.setAttribute('data-layer', box.kind);
  kpShiftPaint_();
  /* A NEEDED ROW ADDED OR GONE re-measures the room the page leaves under the pad */
  if (!pad.hidden) kpPadH_(pad);
  return pad;
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
    KP_LAYER = site ? (inp.getAttribute('data-kpb') === 'num' ? 'maths' : 'abc') : inp.hasAttribute('data-kp-letters') ? 'letters' : inp.getAttribute('data-kp') === 'words' ? 'abc' : 'maths';
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
  kpPadH_(pad);
  if (!same) kpInView_(inp, pad);
}
/* A BOX THE PAD WOULD HIDE IS BROUGHT ABOVE IT, ONCE, AS IT OPENS (owner, 17 Nov: "sometimes inputs are offset"): centred in the room over the pad, as a phone's own keyboard does; a box already in that room stays put, and nothing moves while you type. */
function kpInView_(inp, pad) {
  try {
    const box = (inp.closest && inp.closest('.kp-field, .qp-ans')) || inp, r = box.getBoundingClientRect();
    const room = Math.round(pad.getBoundingClientRect().top);
    if (!(room > 0) || (r.top >= 0 && r.bottom <= room - 8)) return;
    window.scrollBy({ top: Math.round(r.top + r.height / 2 - room / 2), behavior: 'instant' });
  } catch (e) { /* the box stays where it is; the body's foot still leaves room to scroll it up */ }
}

function kpClose_() {
  const pad = document.getElementById('kp');
  if (pad) pad.hidden = true;
  document.documentElement.classList.remove('kp-up');
  const was = KP_AT;
  KP_AT = null;
  kpHoldStop_();
  if (was) kpRender_(was);
}

/* ---------- THE PAD OPENS OVER THE FOOT OF THE PAGE (owner, 16 Nov): nothing moves while you type; the body's foot makes the room (style.css, `.kp-up`), and only a box it would hide is lifted, once (`kpInView_`) ---------- */
/* THE PAD'S HEIGHT, FOR THE STYLESHEET: § */
function kpPadH_(pad) {
  try {
    const h = Math.round(pad.getBoundingClientRect().height);
    if (h > 0 && document.documentElement.style.getPropertyValue('--kp-h') !== h + 'px') {
      document.documentElement.style.setProperty('--kp-h', h + 'px');
    }
  } catch (e) { /* the stylesheet's own guess stands */ }
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
/* THE RAISED BOX THE CARET IS AT THE END OF: the index of its `)` when the caret sits just before it and `^(` opened it, else -1. */
function kpPowAt_(v, a) {
  if (v.charAt(a) !== ')') return -1;
  const o = kpPartner_(v, a);
  return o > 0 && v.charAt(o - 1) === '^' ? a : -1;
}
/* THE CARET COMES DOWN BY ITSELF, as on a phone's maths keyboard (owner, 16 Nov: "using indices on keypad sucks"): at the end of a raised box,
   an operator leaves it first (2^3+1 is 9, a^m+n is a^m then +n), and so does a letter after a number power (3x^2y, 2^2x3).
   It stays up for a minus into an empty box (10^-3), and while a bracket typed inside it is still open (a^(m+n)). */
const kpBal_ = s => { let d = 0; for (const c of s) { d += c === '(' ? 1 : c === ')' ? -1 : 0; if (d < 0) return false; } return !d; };
function kpPowOut_(v, a, cmd) {
  const z = kpPowAt_(v, a);
  if (z < 0) return a;
  const box = v.slice(kpPartner_(v, z) + 1, z);
  if (!box || !kpBal_(box)) return a;
  if (/^[-+\u00d7\u00f7=<>\u2264\u2265,:\u00b1]$/.test(cmd) && !(cmd === '-' && /[(\u00d7\u00f7+\-^]$/.test(box))) return z + 1;
  if ((/^[a-z\u03b1-\u03c9]$/i.test(cmd) && /^[\d.]+$/.test(box))) return z + 1;
  return a;
}
/* `)` AT THE END OF A RAISED BOX: it closes a bracket the child opened at the box's start -- a^(m+n) is stored a^(m+n), not a^((m+n)) --
   and otherwise steps out first, so (x^2)^3 closes the outer bracket. The caret lands after the box either way; null when `)` is ordinary. */
function kpPowShut_(v, a) {
  if (v.charAt(a) !== ')') return null;
  /* the box's own `)` pairs with the child's `(` while the box's `(` before it is left open: ^((m+n|) */
  const p = kpPartner_(v, a);
  if (p > 1 && p + 1 < a && v.slice(p - 2, p) === '^(' && kpPartner_(v, p - 1) < 0) return { v: v.slice(0, p) + v.slice(p + 1), at: a };
  const z = kpPowAt_(v, a);
  const box = z < 0 ? '' : v.slice(kpPartner_(v, z) + 1, z);
  return box && kpBal_(box) ? { v: v.slice(0, z + 1) + ')' + v.slice(z + 1), at: z + 2 } : null;
}
function kpEdit_(inp, cmd) {
  /* A BOX ELSEWHERE IS PLAIN TEXT: the fraction, power and root keys type / ^ √ */
  if (kpSite_(inp)) return kpSiteEdit_(inp, KP_WORD_SIGN[cmd] || cmd);
  const v = inp.value;
  const words = inp.getAttribute('data-kp') === 'words';
  let a = inp.selectionStart, b = inp.selectionEnd;
  if (a == null) { a = v.length; b = v.length; }
  if (!words && a === b) { a = kpPowOut_(v, a, cmd); b = a; }
  const a0 = a, b0 = b;
  const shut = !words && a === b && cmd === ')' ? kpPowShut_(v, a) : null;
  /* AN OPTION'S LETTER (`choiceKeysAt_`): one replaces, a set adds in order without repeats, an order appends; ⌫ takes the last letter */
  const pick = inp.getAttribute('data-kp-pick'), lets = inp.getAttribute('data-kp-letters') || '';
  /* a laptop's letter is the option's key */
  if (pick && /^[a-z]$/i.test(cmd)) cmd = '!pick:' + (lets.indexOf(cmd) >= 0 ? cmd : lets.indexOf(cmd.toUpperCase()) >= 0 ? cmd.toUpperCase() : cmd);
  if (pick && (/^!pick:/.test(cmd) || cmd === '!back')) {
    if (cmd !== '!back' && lets.indexOf(cmd.slice(6)) < 0) return;
    let got = v.split(/[^A-Za-z]+/).filter(Boolean);
    const c = cmd.slice(6);
    if (cmd === '!back') got.pop();
    else if (pick === 'one') got = [c];
    else if (pick === 'set') got = got.indexOf(c) >= 0 ? got : got.concat(c).sort();
    else if (got.indexOf(c) < 0) got.push(c);
    inp.value = got.join(',');
    inp.setSelectionRange(inp.value.length, inp.value.length);
    if (inp.value !== v) { kpUndoNote_(inp, v, a0, b0, cmd); inp.dispatchEvent(new Event('input', { bubbles: true })); }
    return;
  }
  const put = (t, at) => {
    inp.value = v.slice(0, a) + t + v.slice(b);
    const c = a + (at == null ? t.length : at);
    inp.setSelectionRange(c, c);
  };
  const to = c => inp.setSelectionRange(c, c);
  const term = /[0-9a-z.\u03c0)]$/i.test(v.slice(0, a));
  if (shut) { inp.value = shut.v; to(shut.at); }
  else if (cmd === '!vec') put(KP_VEC_A + ',' + KP_VEC_B, 1);
  /* THE FRACTION: after a term the term is its top; after a whole and a space it is a mixed number's fraction, 2 (1)/(3) */
  else if (cmd === '!frac') { if (term) put('/()', 2); else put('()/()', 1); }
  else if (cmd === '!pow') put('^()', 2);
  else if (cmd === '!sqrt') put('\u221a()', 2);
  else if (cmd === '!home') to(kpLineStart_(v, a));
  else if (cmd === '!end') to(kpLineEnd_(v, b));
  else if (cmd === '!top') to(0);
  else if (cmd === '!bottom') to(v.length);
  else if (cmd === '!left') {
    to(b > a ? a : !words && /^\)[\/ ]\($/.test(v.slice(a - 3, a)) ? a - 3 : Math.max(0, a - 1));
  } else if (cmd === '!right') {
    /* box to box: a fraction's top to its bottom, a mixed number's whole to its top */
    to(b > a ? b : !words && /^\)[\/ ]\($/.test(v.slice(a, a + 3)) ? a + 3 : Math.min(v.length, a + 1));
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
      /* A `(` TYPED INTO AN EMPTY RAISED BOX goes alone, leaving the box: 2^(| ⌫ is 2^(), never a broken 2^( */
      if (v.slice(a - 3, a + 1) === '^(()' && kpPartner_(v, a - 2) < 0) from = a - 1;
      /* AN EMPTY POINT (,) GOES WHOLE */
      else if (v.slice(a - 1, a + 2) === '(,)') end = a + 2;
      else if (v.slice(a - 1, a + 1) === '()') {
        end = a + 1;
        if (v.slice(a + 1, a + 6) === ' ()/()') end = a + 6;       /* an empty mixed number () ()/() goes whole */
        else if (v.slice(a + 1, a + 4) === '/()') { end = a + 4; if (/\d $/.test(v.slice(0, a - 1))) from = a - 2; }  /* ()/(), and a mixed number's space */
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
  /* A TABLE ON THE ONE SHEET: the arrows step from cell to cell at a cell's ends (find-cells.js `sheetHop_`) */
  if ((cmd === '!left' || cmd === '!right') && typeof sheetHop_ === 'function' && sheetHop_(inp, cmd)) return;
  const words = inp.getAttribute('data-kp') === 'words';
  let c = cmd === '!nl' ? '\n' : cmd;
  if (!typed && KP_LAYER === 'abc' && /^[a-z]$/.test(c) && KP_SHIFT !== 'off') {
    c = c.toUpperCase();
    if (KP_SHIFT === 'once') KP_SHIFT = 'off';
  }
  if (words && KP_WORD_SIGN[c]) c = KP_WORD_SIGN[c];
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
  if (!/^!(left|right|home|end|top|bottom)$/.test(c)) kpAutoShift_(inp);
  kpShiftPaint_();
  kpSay_(inp);
}

/* A KEY HELD DOWN AND LET GO AFTER IT REPEATED (`kpHold_`) still sends its click at the lift; that click
   is the press already counted, and is swallowed here. */
let KP_REPEATED = false;
