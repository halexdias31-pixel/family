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
   rule for a form; nothing here is a tile. 48px tall, 44 on a short screen and 56 on a tablet, in px,
   because a fingertip does not scale with the root font -- see `#kp` in style.css.

   LOADED AFTER `find`: it reads `typeset_`, `markBare_`, `ansItem_` and `padWanted_` from there, and
   `ansBox_` there calls `kpField_` and `aiTile_` here — at draw time, after every file has loaded.
   BEFORE `tiles`, so `tileIcon_` (the ✓ key's mark) is read when the pad is built, never at load.
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
/* THE NUMBER AT THE FRONT, AND EVERY WORD AFTER IT GOES. This is not the marker's question, and it
   used to borrow the marker's answer: `markBare_` cut a way at its first letter, and that suited both.
   It no longer does — cutting `6w² − 10w` to `6` marked a bare 6 RIGHT, so `markBare_` takes off a
   UNIT now and nothing else. Asked of the keypad, the old cut was the right one: `8.5 to 8.9 cm`,
   `2 h 5 min` and `6cd` are all answered on the pad, and when this went on calling `markBare_` the
   sweep over every row moved 79 of them to the phone keyboard — 59 with a band like `3.0 to 3.8`.
   So the pad keeps its own cut. The number may be a root or a multiple of π (`MARK_NUM`, the
   marker's), so `√3cm` and `15π cm^2` are maths too — a unit glued to a surd was a way that sent
   exact-trig Q17 to the keyboard, which has no √ key.

   A UNIT AFTER A SPACE AT THE END IS STILL A UNIT when the cut left it — it only cuts after a number,
   and `400 − 50π cm²` does not start with one. Its power may be written raised: this took `cm^2`
   off and left `cm²`, two letters in a row, so that circle's area — an answer in π, the key the pad
   has and the phone does not — went to the keyboard. */
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
   `x` is the LETTER and `×` the operator, and they are different keys because the marker keeps them
   apart wherever they could mean different things: `markNorm_` reads a letter `x` as times only with
   a number on BOTH sides (`2^3 x 11`, the keyboard's way of writing a product of primes), which no
   algebra writes, so `2x`, `3x^2` and `x = 3` keep their letter. The pad gives the sign its own key
   rather than leaning on that. The minus types a hyphen, which `markNorm_` folds with the other
   three. */
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
  /* ---------- ⌫ IS RED, AND ITS MARK IS DRAWN ---------------------------------------------------------
     THE OWNER, 8 Oct, from a pupil's iPad in the sun: *"its hard to see keypad and each button especially
     backspace, which i thing should be red."* It was `⌫` in `--dim`, a thin outline glyph at 15px on a
     near-black key -- the font's own picture of a backspace, which in glare was a smudge. So the key is
     `--bad` (`.kp-del` in style.css; red is "something is wrong" everywhere else in this app, and this
     is the one exception, on the owner's word and because it is the key that destroys) and its mark is
     an SVG drawn here, black and 2.2 thick: white on that red is 2.99:1 and fails, black is 7:1. */
  { v: '!back', a: 'delete', c: ' kp-del',
    t: '<svg class="kp-del-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"'
     + ' stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
     + '<path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z"/><path d="m12.5 9.5 5 5M17.5 9.5l-5 5"/></svg>' },
  /* ✓ IS SEND: the same paper aeroplane as the Send tile beside the box (`ansBox_`), because it is the
     same act -- one mark for "mark it" wherever the child is looking. `icon` and not `t`, because
     `tileIcon_` is in tiles.js, which loads after this file; `kpKey_` draws it when the pad is built. */
  { v: '!done', a: 'done', c: ' kp-done', icon: 'send' },
];
/* A KEY IS A BUTTON AND NOT A TILE, the one place on a question's pages the owner's *"it should all be
   tiles"* does not reach, and on purpose: these are a KEYBOARD. Thirty keys in a grid have to be the
   grid's size and carry their glyph (7, π, √, a fraction drawn as two boxes) as the whole face; a tile
   is a 44px plate with an outline mark and its name in `title`, which on a key would be a picture of a
   7 called "7". Typing is the answer being given, as a multiple-choice option is (`choiceBox_`). */
const kpKey_ = k => `<button type="button" class="kp-key${k.c || ''}" data-do="kp-key"
  data-v="${esc(k.v != null ? k.v : k.t)}"${k.a ? ` aria-label="${esc(k.a)}"` : ''}>${
  k.icon ? tileIcon_(k.icon) : k.t}</button>`;

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
    /* WHICH BOX AND WHERE IN IT, kept apart from the element -- see `kpLive_`. */
    KP_WAS = { k: inp.getAttribute('data-k') || '', caret: caret };
  }
  show.innerHTML = kpTypeset_(inp.value, caret);
}

/* ---------- THE BOX THE PAD TYPES INTO, AFTER A REDRAW ---------------------------------------------
   THE OWNER, 8 Oct: *"they keypad was a bit unstable. it wasnt working at first for some reason."*
   Measured on the branch it was said about: a repaint replaces the card's markup -- `repaint()` on
   signing in, and again when `load()` lands about fifteen seconds later -- and the box the child is
   typing into goes with it. Chromium fires `focusout` for a removed element, so the pad closed and the
   next key did nothing. WebKit (the iPad) and jsdom fire NOTHING: the pad stayed up, `KP_AT` still
   named the removed input, and every key after that typed into a box that was no longer on the page --
   the 5 pressed after a redraw was lost without a trace, while the box on the screen still said 7.

   SO A KEY ASKS FOR THE LIVE BOX FIRST. Still in the page: that one. Gone: the box that replaced it,
   found by the answer key it carries (`data-k`, which is who and which question -- so a redraw after
   somebody else signs in finds nothing and the pad closes, rather than typing into their drawer), on
   the page in front first and anywhere in the document after that. Focused without scrolling (the
   columns are parked on transforms, CLAUDE.md), with the caret put back where it was (`KP_WAS`), and
   the pad stays up. Nothing to find: the pad closes, which is what Chromium already did. */
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
/* FOCUS THE REPLACEMENT, whose `focusin` reopens the pad on it (`kpOpen_`, which keeps the caret from
   `KP_WAS`). A browser that takes the focus without the event -- a page that is not the front window
   -- gets the same `kpOpen_` called by hand. In a try, because an old browser refusing the options
   object must still leave the box focused. */
function kpTake_(inp) {
  try { inp.focus({ preventScroll: true }); } catch (e) { try { inp.focus(); } catch (e2) {} }
  if (KP_AT !== inp) kpOpen_(inp);
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
  if (was && was !== inp && was.isConnected) kpRender_(was);
  const pad = kpPad_();
  pad.hidden = false;
  document.documentElement.classList.add('kp-up');
  /* THE CARET GOES TO THE END ON ARRIVAL. A tap lands it wherever the finger was in the INPUT'S text,
     which is invisible and laid out nothing like the drawing over it — so it would sit somewhere the
     student cannot see. The end is where the next key belongs; ← and → move it from there.
     EXCEPT ON THE BOX THAT REPLACED THE ONE BEING TYPED IN (`kpLive_`): the student never left it, so
     the caret goes back to where it was -- inside the fraction's bottom, say, and not after it. */
  const back = !!(was && was !== inp && !was.isConnected && KP_WAS && KP_WAS.k === inp.getAttribute('data-k'));
  const at = back ? Math.max(0, Math.min(KP_WAS.caret, inp.value.length)) : inp.value.length;
  try { inp.setSelectionRange(at, at); } catch (e) {}
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
  if (el && el !== document.body) {
    const h = pad.getBoundingClientRect().height;
    KP_ROOM = { el: el, was: el.style.paddingBottom };
    el.style.paddingBottom = h + 'px';
    const over = inp.getBoundingClientRect().bottom - (pad.getBoundingClientRect().top - 12);
    if (over > 0) el.scrollTop += over;
    /* A SCROLLER WITH NOTHING LEFT TO GIVE leaves the rest to the column, below. */
    if (inp.getBoundingClientRect().bottom - (pad.getBoundingClientRect().top - 12) <= 0) return;
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

/* ---------- A CARD WITH NOTHING TO SCROLL IS LIFTED WHOLE -----------------------------------------
   MEASURED ON 5 OCTOBER, AFTER THE CARD IN FRONT WAS CENTRED: at 320x568 the pad's top is at 315px
   and every answer box on a paper's question card bottomed out at 317–327px — under the pad on 8
   pages of 8, against 1 of 8 when cards hung from the top line. A card whose content fits is
   `overflow: hidden`, so the scroller search above finds nothing and the box stayed where it was,
   and the hold on focus (`HOLD_AT`) then kept it there.

   SO THE COLUMN GOES UP INSTEAD, by exactly what the box is short of, through the same hold —
   `columnShift_` reads `lift` — so a box that grows as you type grows downward from a card that is
   no longer moving, and swiping away lets go of both at once.

   WORKED OUT FROM WHERE THE COLUMN IS GOING, NOT WHERE IT IS DRAWN. A box's distance from the top of
   its column does not change when the column moves, so: the column's unmoved top, plus the shift it
   is held at with no lift, plus that distance. A rectangle read off a column still settling would
   lift by the wrong amount and keep it. */
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
    const fromTop = inp.getBoundingClientRect().bottom - host.getBoundingClientRect().top;
    const over = base + want + fromTop - (pad.getBoundingClientRect().top - 12);
    if (!isFinite(over) || over <= 0) return;
    h.lift = over;
    KP_LIFT = h;
    placeCells('y', true, 0, AT);
  } catch (e) { /* a box left where it was is the behaviour before this existed */ }
}

/* ---------- WHAT A KEY DOES -----------------------------------------------------------------------
   EVERY STRUCTURE IS TYPED WITH ITS SLOTS, and the caret goes into the first one. A fraction after a
   number takes that number as its top — `3` then the fraction key is three over a slot, which is how
   a calculator's `a/b` behaves and how a person says it. With nothing before it, both halves are
   slots. → steps over `)/(` in one press, from the top of a fraction to its bottom; one press per
   bracket would be three presses to cross one line.

   ⌫ TAKES AN EMPTY STRUCTURE AWAY WHOLE. Deleting `(` out of `^()` one character at a time leaves a
   `^)` that is not maths and not a slot, and the student has to find the stray half.

   AND IT NEVER TAKES HALF OF A FILLED ONE. That promise had a hole in it, measured on 8 Oct: after a
   filled slot ⌫ deleted the `)` on its own -- `123/(4)` then ⌫ was `123/(4`, and the next key made it
   `123/(46`. So a bracket with something between it and its partner is not deleted, it is STEPPED
   OVER: ⌫ after a `)` moves the caret inside, to the end of what the slot holds; ⌫ just inside a `(`
   moves the caret out to the left -- across `)/(` into the top of a fraction, across `^(` and `√(` to
   before the sign, across `/(` to the number over it -- and ⌫ just after a sign whose slot is filled
   steps back over the sign. Each of those deletes nothing; the next ⌫ deletes a digit, and a slot
   emptied that way goes whole by the rule above. EVERY PAIR, not only the ones a structure key typed:
   `(3)/()` loses its bottom whole and leaves `(3)`, and if those brackets could then be deleted one at
   a time, `(3` would be the stray half again. A bracket with no partner -- the ( key pressed alone --
   deletes like any character, because there is no other half to strand. */
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
    /* WHERE A FILLED PAIR IS STEPPED OVER RATHER THAN BROKEN -- see the note above. -1: delete. */
    const c = v.charAt(a - 1);
    const sign = /[\^\u221a\/]/;
    let step = -1;
    if (b > a || a < 1 || (c === '(' && v.charAt(a) === ')')) step = -1;
    else if (c === ')' && kpPartner_(v, a - 1) >= 0) step = a - 1;
    else if (c === '(' && kpPartner_(v, a - 1) >= 0) {
      step = v.slice(a - 3, a) === ')/(' ? a - 3 : sign.test(v.charAt(a - 2)) ? a - 2 : a - 1;
    } else if (sign.test(c) && v.charAt(a) === '(' && kpPartner_(v, a) > a + 1) step = a - 1;
    if (step >= 0) inp.setSelectionRange(step, step);
    else if (b > a) put('');
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
  /* THE LIVE BOX, NOT THE LAST ONE NAMED -- a redraw may have replaced it (`kpLive_`). */
  const inp = kpLive_();
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
    /* TAKEN AWAY, NOT LEFT: a box that is no longer in the page lost the focus because a redraw
       replaced it, not because the student went anywhere. Chromium says so with this event; the box
       that replaced it is found by its key and focused, and the pad stays up on it (`kpLive_`, which
       is how WebKit, firing nothing, is caught on the next key instead). */
    if (KP_AT === t && !t.isConnected) {
      const again = kpFind_(t.getAttribute('data-k'));
      if (again) { kpTake_(again); return; }
    }
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

   A TILE, WHERE SEND IS AND SHAPED LIKE IT, because it is the same act on a different kind of answer.
   This said "a form's button ... the answer box is a form, and its buttons belong to it" -- the house
   rule, and Check was a gold button beside it on the same argument. The owner overruled it for a
   question's pages, one control at a time and then all at once: *"check button should be a tile"*,
   then *"it should all be tiles."* So Mark with AI is a tile with a sparkle on it (`spark`, the mark
   every phone puts on "a model did this"), `.qp-ai-go` the name the handler and the checks find it
   by, and `disabled` when the server says there is no key -- which a tile draws without its plate.
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

/* THE TILE ALONE, GOLD AND ROUND IN THE ANSWER BAR WHERE SEND STANDS ON A BOX WITH A SCHEME -- the
   bar, its verdict line and the sentence under it are `ansBox_`'s, so one function lays out both. This
   was `aiBox_`, which drew its own row under the box. */
function aiTile_(x) {
  if (!aiWanted_(x) || !aiOffered_()) return '';
  return tile_({ icon: 'spark', label: 'Mark with AI', note: 'out of the marks', act: 'qp-ai', cls: 'qp-ai-go', tone: 'send' });
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
  /* THE TILE'S OWN RING WHILE IT WAITS (`.tile.is-busy`), on the tile as well as the row: a disabled
     tile loses its plate, which says "nothing to press" -- the wrong sentence for "pressed, marking". */
  box.classList.add('is-busy');
  el.classList.add('is-busy');
  out.textContent = 'Marking\u2026';
  const done = () => { el.disabled = AI_OFF; box.classList.remove('is-busy'); el.classList.remove('is-busy'); };
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
