/* ==================================================================================================
   @family. — keypad.js

   THE ANSWER BOX, IN TWO KINDS: A MATHS KEYPAD, AND WORDS THAT GEMINI CAN MARK.

   ASKED FOR AS "make the input better … like hegarty maths … desmos … worded answer normal device
   keyboard." and "add gemini marking system for worded questions."

   ---------- WHY A KEYPAD AND NOT THE PHONE'S KEYBOARD ----------------------------------------------
   THE PHONE'S KEYBOARD IS A WORD KEYBOARD. `3/4` on it is the number row, the symbol row and back;
   `x²` is a caret nobody knows is there; `√` and `π` are not on it at all, and `≤` was the reason
   `markNorm_` learned to fold `<=`. What a student SAW while typing was `3/4` in a box — not the
   fraction on the paper — so they could not tell `1/2x` from `1/(2x)` until Check told them they
   were wrong. Hegarty and Desmos both answer this the same way and so does this: a pad with the
   maths keys on it, and the answer drawn as it will be read while it is built.

   `inputmode="none"` IS THE WHOLE TRICK. The box is still a real `<input>` — focusable, labelled,
   saved by the same `input` listener in find.js, read by the same `qp-check` — but the phone keeps
   its keyboard down. A laptop's keyboard still types into it, because nothing stops a physical key.

   WHAT IS STORED IS PLAIN TEXT, and that is the decision everything else rests on. A fraction is
   `(3)/(4)`, a power `x^(2)`, a root `√(11)`: each structure is typed with a slot to fill, because
   the drawing needs somewhere to put the caret. `markNorm_` folds a bracket round one term away (see
   the note there), so `(3)/(4)` marks right against a scheme of `0.75` exactly as `3/4` did. No
   second representation, no tree, nothing for `ansKey_` to learn about.

   THE DRAWING IS `typeset_`, THE LIBRARY'S OWN. A fraction stacks and a power rises exactly as they
   do in the question above the box, because it is the same function — a second typesetter for the
   answer would be a second opinion about what a fraction looks like.

   WHICH BOX A QUESTION GETS is `ansMaths_` below: the sheet's `answer_type`, and where that is
   `short`, whether the scheme's answer is maths-shaped. Words — explain, written, proof — keep the
   textarea and the phone's own keyboard, which is what that keyboard is for.

   ---------- WHY THE PAD IS ONE ELEMENT ON <body> -------------------------------------------------
   THE SCREENS SIT SIDE BY SIDE ON TRANSFORMS (CLAUDE.md), and `position: fixed` inside a transformed
   ancestor is fixed to that ancestor, not to the phone. A pad drawn inside the card would scroll with
   it and slide sideways with the pane. So there is one pad, built the first time it is wanted, on
   <body> beside `#toast`, and it types into whichever box has the focus — the way the phone's own
   keyboard is one keyboard for every field.

   A FORM HAS BUTTONS. The keys are the controls of the box they type into, which is the CLAUDE.md
   rule for a form; nothing here is a tile. 44px tall at the narrowest phone, in px, because a
   fingertip does not scale with the root font.

   LOADED AFTER `find`: it reads `typeset_`, `markBare_`, `ansItem_` and `padWanted_` from there, and
   `ansBox_` there calls `kpField_` and `aiBox_` here — at draw time, after every file has loaded.
================================================================================================== */

/* ---------- WHICH ANSWERS ARE MATHS ---------------------------------------------------------------
   THE SHEET SAYS, MOSTLY. `calculation` is 4,456 rows and every one is a number or an expression;
   `explain`, `written` and `proof` are sentences by definition; `drawing` and `annotate` are the pad
   on the picture, whose words box is a note. `short` is the one that could be either — "egestion" and
   `3y(2y + 5)` are both short — so there the scheme decides: maths when every accepted answer is,
   with the unit taken off first (`markBare_`, the marker's own), so `12 km/h` is a number.

   MATHS-SHAPED MEANS NO TWO LETTERS IN A ROW. `x`, `n`, `3y(2y+5)` and `x=3, y=-4` are algebra;
   `egestion` and `jupiter` are words. A rule this blunt is right because the cost of being wrong is
   small in both directions: a word answer that gets the pad has an `abc` key, and a maths answer that
   gets the keyboard is what every answer had yesterday. */
const KP_WORDED = { explain: 1, written: 1, proof: 1, drawing: 1, annotate: 1 };
/* A UNIT AFTER A SPACE AT THE END IS STILL A UNIT when `markBare_` left it \u2014 it only strips one after
   a bare number, and `15\u03c0 cm^2` is not one. */
const kpMathsy_ = w => {
  const s = markBare_(w).replace(/\u221a|\u03c0/g, '1').replace(/\s+[a-z]{1,3}(?:[\/\^][a-z0-9]+)?$/, '');
  return !!s && /[0-9a-z]/.test(s) && !/[a-z]{2,}/.test(s);
};
function ansMaths_(x) {
  if (!x) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  const t = String(x.answerType || '').trim().toLowerCase();
  if (KP_WORDED[t]) return false;
  const ways = String(x.accept || '').split('|').map(w => w.trim()).filter(Boolean);
  /* A CALCULATION WITH A SCHEME THAT IS WORDS is a calculation whose answer is a sentence — "Yes,
     because 3 kg covers 45 m²" — and that is the keyboard's job. */
  if (t === 'calculation') return !ways.length || ways.every(kpMathsy_);
  return ways.length > 0 && ways.every(kpMathsy_);
}

/* ---------- THE KEYS ----------------------------------------------------------------------------------
   SIX ACROSS, FIVE DOWN — the calculator's digit block on the left where every thumb already looks
   for it, and the structures on the right. Six columns is what fits a 44px key into a 320px phone
   with its 16px gutters: (320 − 32 − 5 gaps × 4) ÷ 6 = 44.7. Seven would not.

   `v` IS WHAT A KEY TYPES, OR A `!` COMMAND. The label is drawn; the `aria-label` is what a screen
   reader says, because "÷" read aloud is "division sign" on one phone and nothing on another.
   `x` is the LETTER and `×` the operator, and they are different keys for exactly the reason the
   marker keeps them apart. The minus types a hyphen, which `markNorm_` folds with the other three. */
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
  { v: '!abc', a: 'type with the keyboard instead', c: ' kp-mode', t: 'abc' },
  { v: '!left', a: 'move left', c: ' kp-mode', t: '\u2190' },
  { v: '!right', a: 'move right', c: ' kp-mode', t: '\u2192' },
  { v: ' ', a: 'space', c: ' kp-mode', t: '\u2423' },
  { v: '!back', a: 'delete', c: ' kp-mode', t: '\u232b' },
  { v: '!done', a: 'done', c: ' kp-done', t: '\u2713' },
];
const kpKey_ = k => `<button type="button" class="kp-key${k.c || ''}" data-do="kp-key"
  data-v="${esc(k.v != null ? k.v : k.t)}"${k.a ? ` aria-label="${esc(k.a)}"` : ''}>${k.t}</button>`;

/* ---------- THE BOX -----------------------------------------------------------------------------------
   THE DRAWING IS WHAT YOU SEE; THE INPUT IS LAID OVER IT, INVISIBLE. The input has to be the real
   thing — it takes the focus, it is what the label names, it is what `qp-check` and the `input`
   listener read — and its own text cannot be typeset. So its ink is transparent and the `.kp-show`
   under it draws the same value stacked and raised, with a caret of its own where the input's is.

   16px ON THE INPUT, whatever the root says, because iOS zooms the page into any field smaller than
   that the moment it is focused — and a zoom the student did not ask for, on the box they are
   typing into, is the page lurching at the worst moment. The ink is invisible, so its size costs
   nothing on the screen. */
const KP_HOLE = '\u03d9', KP_CARET = '\u03db';
function kpField_(k, val) {
  return `<span class="kp-field">
      <span class="kp-show" aria-hidden="true">${kpTypeset_(val, -1)}</span>
      <input class="qp-ans-in kp-in" data-do="qp-ans" data-k="${esc(k)}" value="${esc(val)}"
        inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">
    </span>`;
}

/* ---------- DRAWING WHAT HAS BEEN TYPED -------------------------------------------------------------
   THE VALUE, WITH A SLOT SHOWN WHEREVER ONE IS EMPTY. `(3)/()` is a fraction with nothing under the
   line yet, and drawn as `3/` it is a slanted slash with nothing after it — the student cannot see
   where the next digit will go. So an empty slot becomes a dashed box, the way Hegarty draws one,
   and the caret sits inside it.

   TWO GREEK LETTERS NOBODY TYPES STAND IN FOR THE BOX AND THE CARET while `typeset_` reads the
   string, because they are characters it already treats as part of a term (its ATOM class takes the
   whole Greek block). A `<span>` put in first would be split from its numerator; a letter is part of
   it. They are swapped for their spans after, and any already in the value are stripped first, so a
   pasted ϙ is not a slot. */
function kpTypeset_(v, caret) {
  let s = String(v == null ? '' : v).replace(/[\u03d9\u03db]/g, '');
  if (caret >= 0) {
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
  /* THE SLASH AS `&frasl;` AFTER ESCAPING, which is what `typeset_` stacks — `tbMath_` in find.js does
     the same for the textbooks. The hyphen as a real minus, because that is how the paper prints it
     and `typeset_` ends a term at one. */
  const h = typeset_(esc(s).replace(/\//g, '&frasl;').replace(/-/g, '\u2212'));
  return h.replace(/\u03d9/g, '<span class="kp-hole"></span>')
          .replace(/\u03db/g, '<span class="kp-caret"></span>');
}

function kpRender_(inp) {
  const show = inp && inp.parentNode && inp.parentNode.querySelector('.kp-show');
  if (!show) return;
  let caret = -1;
  if (KP_AT === inp) {
    caret = inp.selectionStart;
    if (caret == null) caret = inp.value.length;
  }
  show.innerHTML = kpTypeset_(inp.value, caret);
}

/* ---------- OPENING AND CLOSING -------------------------------------------------------------------
   `KP_AT` IS THE BOX THE PAD IS TYPING INTO, and the focus is what sets it — the same signal the
   phone's keyboard answers to. A press on a key must not take the focus away from the box, so the
   pad swallows `mousedown` (whose default is moving the focus) and the box keeps it; `click` still
   arrives, which is what `on('kp-key')` answers. */
let KP_AT = null;
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
  pad.innerHTML = KP_KEYS.map(kpKey_).join('');
  pad.addEventListener('mousedown', e => e.preventDefault());
  document.body.appendChild(pad);
  return pad;
}

function kpOpen_(inp) {
  if (!inp || inp.getAttribute('inputmode') !== 'none') return;
  /* FROM ONE BOX STRAIGHT TO ANOTHER, the one left behind is redrawn without its caret — two blinking
     carets on one screen is two places the next key might go. */
  const was = KP_AT;
  KP_AT = inp;
  if (was && was !== inp) kpRender_(was);
  const pad = kpPad_();
  pad.hidden = false;
  document.documentElement.classList.add('kp-up');
  /* THE CARET GOES TO THE END ON ARRIVAL. A tap lands it wherever the finger was in the INPUT'S text,
     which is invisible and laid out nothing like the drawing over it — so it would sit somewhere the
     student cannot see. The end is where the next key belongs; ← and → move it from there. */
  try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {}
  kpRender_(inp);
  kpRoom_(inp, pad);
}

function kpClose_() {
  const pad = document.getElementById('kp');
  if (pad) pad.hidden = true;
  document.documentElement.classList.remove('kp-up');
  const was = KP_AT;
  KP_AT = null;
  if (was) kpRender_(was);
  kpRoomBack_();
}

/* ---------- AND THE BOX STAYS ABOVE THE PAD ---------------------------------------------------------
   THE PAD COVERS THE BOTTOM OF THE SCREEN, and a box near the bottom of a card is a box drawn
   underneath it — typing into something you cannot see. The phone's keyboard solves this by
   shrinking the viewport; a pad cannot, so the column it is in is given the pad's height as padding
   at its foot, for as long as the pad is up, and scrolled just enough to clear it. Taken off again on
   close, so the column is exactly as long as it was. */
let KP_ROOM = null;
function kpRoom_(inp, pad) {
  kpRoomBack_();
  let el = inp.parentNode;
  while (el && el !== document.body) {
    const oy = getComputedStyle(el).overflowY;
    if (oy === 'auto' || oy === 'scroll') break;
    el = el.parentNode;
  }
  if (!el || el === document.body) return;
  const h = pad.getBoundingClientRect().height;
  KP_ROOM = { el: el, was: el.style.paddingBottom };
  el.style.paddingBottom = h + 'px';
  const over = inp.getBoundingClientRect().bottom - (pad.getBoundingClientRect().top - 12);
  if (over > 0) el.scrollTop += over;
}
function kpRoomBack_() {
  if (!KP_ROOM) return;
  KP_ROOM.el.style.paddingBottom = KP_ROOM.was;
  KP_ROOM = null;
}

/* ---------- WHAT A KEY DOES -----------------------------------------------------------------------
   EVERY STRUCTURE IS TYPED WITH ITS SLOTS, and the caret goes into the first one. A fraction after a
   number takes that number as its top — `3` then the fraction key is three over a slot, which is how
   a calculator's `a/b` behaves and how a person says it. With nothing before it, both halves are
   slots. → steps over `)/(` in one press, from the top of a fraction to its bottom; one press per
   bracket would be three presses to cross one line.

   ⌫ TAKES AN EMPTY STRUCTURE AWAY WHOLE. Deleting `(` out of `^()` one character at a time leaves a
   `^)` that is not maths and not a slot, and the student has to find the stray half. */
function kpEdit_(inp, cmd) {
  const v = inp.value;
  let a = inp.selectionStart, b = inp.selectionEnd;
  if (a == null) { a = v.length; b = v.length; }
  const put = (t, at) => {
    inp.value = v.slice(0, a) + t + v.slice(b);
    const c = a + (at == null ? t.length : at);
    inp.setSelectionRange(c, c);
  };
  const term = /[0-9a-z.\u03c0)]$/i.test(v.slice(0, a));
  if (cmd === '!frac') { if (term) put('/()', 2); else put('()/()', 1); }
  else if (cmd === '!pow') put('^()', 2);
  else if (cmd === '!sqrt') put('\u221a()', 2);
  else if (cmd === '!left') {
    const c = v.slice(a - 3, a) === ')/(' ? a - 3 : Math.max(0, a - 1);
    inp.setSelectionRange(c, c);
  } else if (cmd === '!right') {
    const c = v.slice(a, a + 3) === ')/(' ? a + 3 : Math.min(v.length, a + 1);
    inp.setSelectionRange(c, c);
  } else if (cmd === '!back') {
    if (b > a) put('');
    else if (a > 0) {
      let from = a - 1, to = a;
      if (v.slice(a - 1, a + 1) === '()') {
        to = a + 1;
        if (v.slice(a + 1, a + 4) === '/()') to = a + 4;          /* ()/() with nothing in either */
        else if (/[\^\u221a\/]/.test(v.charAt(a - 2))) from = a - 2;
      }
      inp.value = v.slice(0, from) + v.slice(to);
      inp.setSelectionRange(from, from);
    }
  } else put(cmd);
  /* THE SAME EVENT A KEYBOARD SENDS, so find.js's listener saves it under `ansKey_` and takes a stale
     verdict off it, exactly as it does for a typed letter. One path for both, or the pad is a second
     way to answer that the rest of the app does not know about. */
  inp.dispatchEvent(new Event('input', { bubbles: true }));
}

on('kp-key', (el) => {
  const inp = KP_AT;
  if (!inp) return;
  const v = el.getAttribute('data-v') || '';
  if (v === '!done') return kpDone_(inp);
  if (v === '!abc') return kpWords_(inp);
  kpEdit_(inp, v);
  kpRender_(inp);
});

/* ✓ IS CHECK, where the question has a scheme to check against — the same handler the button runs,
   not a copy of it — and otherwise it is "I have finished", which puts the pad away. */
function kpDone_(inp) {
  const card = inp.closest('.qcard');
  const chk = card && card.querySelector('.qp-check[data-do="qp-check"]');
  if (chk && ACTIONS['qp-check']) ACTIONS['qp-check'](chk);
  inp.blur();
  kpClose_();
}

/* `abc` IS THE WAY OUT, for the answer the pad has no key for — `y = 2x + 1`, a unit, a word. The
   box becomes an ordinary text box for as long as it has the focus and goes back to the pad when it
   loses it, so the next visit to the question is the pad again. The drawing stays: typed letters are
   typeset the same as pressed keys. */
function kpWords_(inp) {
  kpClose_();
  inp.setAttribute('inputmode', 'text');
  inp.classList.add('is-words');
  inp.blur();
  inp.focus();
}

document.addEventListener('focusin', e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpOpen_(t);
});
document.addEventListener('focusout', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in')) return;
  /* AFTER THE FOCUS HAS LANDED, so a move from one maths box straight to another hands the pad over
     rather than closing and reopening it. */
  setTimeout(() => {
    const now = document.activeElement;
    if (t.classList.contains('is-words') && now !== t) {
      t.setAttribute('inputmode', 'none');
      t.classList.remove('is-words');
    }
    if (now && now.classList && now.classList.contains('kp-in')) return;
    if (KP_AT === t) kpClose_();
  }, 0);
});
/* A TYPED KEY AND A MOVED CARET REDRAW THE DRAWING. `input` covers what changed the value; `keyup`
   covers a laptop's arrow keys. */
['input', 'keyup'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpRender_(t);
}));
/* A TAP ON A BOX THAT ALREADY HAS THE FOCUS puts the pad back if ✓ put it away, and the caret back at
   the end — the tap landed in the input's invisible text, which is laid out nothing like the drawing,
   so wherever it put the caret is somewhere the student cannot see. */
document.addEventListener('click', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in') || t.getAttribute('inputmode') !== 'none') return;
  if (KP_AT !== t) return kpOpen_(t);
  try { t.setSelectionRange(t.value.length, t.value.length); } catch (err) {}
  kpRender_(t);
});
/* AND ENTER IS ✓, on a keyboard that has one. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if (e.key !== 'Enter' || !t || !t.classList || !t.classList.contains('kp-in')) return;
  e.preventDefault();
  kpDone_(t);
});


/* ==================================================================================================
   MARK WITH AI — A WORDED ANSWER, MARKED BY GEMINI AGAINST THE SCHEME THE CARD ALREADY HOLDS.

   `markAnswer_` CANNOT MARK A SENTENCE and should not try: "explain why the rate increases" has no
   string to compare against, and a marker that pattern-matched keywords would tell a child they were
   right for writing the right nouns in the wrong order. 578 rows of the library are `explain` and
   145 `written`, and all of them had a box that could do nothing but wait for the tutor.

   SO THE BACKEND ASKS GEMINI (`aiMark` in dopost.gs) with the question, the mark scheme and the
   answer, and draws what comes back: marks out of the question's marks, and one sentence. The key is
   in Script Properties and never here — the phone only learns whether there is one (`aiMarking`).

   OFFERED ONLY WHERE IT CAN BE RIGHT: a worded answer, with a scheme to mark against, and no
   `accept` — where there is one, Check is exact and free, and a model's opinion would only be a
   second, worse verdict on the same answer.

   OFF IS QUIET. No key (`aiMarking: false`), or a deployment that does not have the action (`features`),
   draws no button at all. A key that went away since the payload was cached answers `why: 'ai-off'`
   on the first press, and from then every AI button on the screen is greyed and says so — one press
   wasted, never a button that keeps doing nothing.

   A FORM'S BUTTON, beside Check and shaped like it, because it is the same act on a different kind of
   answer — the answer box is a form, and its buttons belong to it.
================================================================================================== */
let AI_OFF = false;

function aiOffered_() {
  if (AI_OFF) return false;
  try { return (DATA.features || []).indexOf('aiMark') !== -1 && DATA.aiMarking !== false; }
  catch (e) { return false; }
}

function aiWanted_(x) {
  if (!x || ansMaths_(x) || padWanted_(x)) return false;
  if (Array.isArray(x.choices) && x.choices.length >= 2) return false;
  if (String(x.accept || '').trim()) return false;
  return !!String(x.answer || '').trim();
}

function aiBox_(x) {
  if (!aiWanted_(x) || !aiOffered_()) return '';
  return `<div class="qp-mark qp-ai">
    <button type="button" class="qp-check qp-ai-go" data-do="qp-ai">Mark with AI</button>
    <span class="qp-verdict" role="status" aria-live="polite"></span>
  </div><p class="qp-ai-why"></p>`;
}

/* THE QUESTION AS WORDS. The library's markup carries fractions as `<sup>`/`&frasl;`/`<sub>` and
   powers as `<sup>`, and stripping the tags would hand Gemini `34` for three quarters and `x2` for x
   squared — so those two are written out first, then the rest read as text by a parser that runs no
   scripts and fetches no pictures. */
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

function aiQuestion_(x) {
  const parts = (x.stems || []).map(p => p && p.html).concat([x.lead, x.html]);
  return parts.map(aiPlain_).filter(Boolean).join('\n\n').slice(0, 4000);
}

function aiScheme_(x) {
  const note = String(x.examinerNote || '').trim();
  return (aiPlain_(x.answer) + (note ? '\nExaminer\u2019s note: ' + note : '')).slice(0, 3000);
}

function aiOff_(said) {
  AI_OFF = true;
  document.querySelectorAll('.qp-ai').forEach(box => {
    box.classList.add('is-off');
    const b = box.querySelector('.qp-ai-go');
    if (b) b.disabled = true;
    const out = box.querySelector('.qp-verdict');
    if (out) out.textContent = said || 'AI marking isn\u2019t switched on';
  });
}

on('qp-ai', (el) => {
  const box = el.closest('.qp-ai');
  const card = el.closest('.qcard');
  const inp = card && card.querySelector('.qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  const why = box && box.nextElementSibling && box.nextElementSibling.classList.contains('qp-ai-why')
    ? box.nextElementSibling : null;
  if (!inp || !out || el.disabled) return;
  box.classList.remove('is-right', 'is-near');
  if (why) why.textContent = '';
  /* NOTHING TYPED IS NOT A WRONG ANSWER, and it is not worth a request either. */
  if (!inp.value.trim()) { out.textContent = 'Write something first'; return; }
  if (typeof USER !== 'object' || !USER || !USER.token) { out.textContent = 'Sign in to have it marked'; return; }
  const x = ansItem_(inp.getAttribute('data-k'));
  if (!x) { out.textContent = 'Could not find this question'; return; }
  const sent = inp.value;
  el.disabled = true;
  box.classList.add('is-busy');
  out.textContent = 'Marking\u2026';
  const done = () => { el.disabled = AI_OFF; box.classList.remove('is-busy'); };
  api({ action: 'aiMark', personId: USER.personId || '', question: aiQuestion_(x), scheme: aiScheme_(x),
        answer: sent, marks: Number(x.marks) || 1 })
    .then(d => {
      done();
      if (d && d.why === 'ai-off') return aiOff_(d.message);
      /* A VERDICT IS ABOUT THE ANSWER IT MARKED. Typed over while Gemini was thinking, it is about an
         answer that is no longer in the box — the rule the `input` listener in find.js keeps for Check. */
      if (inp.value !== sent) { out.textContent = ''; return; }
      if (!d || !d.success) { out.textContent = (d && (d.message || d.error)) || 'Could not mark that just now'; return; }
      const full = d.awarded >= d.available;
      box.classList.add(full ? 'is-right' : 'is-near');
      out.textContent = d.awarded + ' of ' + d.available + ' mark' + (d.available === 1 ? '' : 's') + ' \u00b7 AI';
      if (why) why.textContent = d.feedback || '';
    })
    .catch(() => { done(); out.textContent = 'Could not reach the marker \u2014 try again'; });
});

/* TYPING TAKES THE AI'S VERDICT OFF, as it takes Check's off — find.js's listener does that for a box
   with a scheme, and this is the same rule for the AI's row. Not while it is still marking: the
   answer it was sent is compared when the reply lands. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  const card = el && el.closest('.qcard');
  const box = card && card.querySelector('.qp-ai');
  if (!box || box.classList.contains('is-busy') || box.classList.contains('is-off')) return;
  box.classList.remove('is-right', 'is-near');
  const out = box.querySelector('.qp-verdict');
  if (out) out.textContent = '';
  const why = box.nextElementSibling;
  if (why && why.classList.contains('qp-ai-why')) why.textContent = '';
});
