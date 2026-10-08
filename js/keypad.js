/* ==================================================================================================
   @family. — keypad.js

   THE ANSWER BOX, IN TWO KINDS: A MATHS ANSWER AND A WORDED ONE THAT GEMINI CAN MARK — AND BOTH ARE
   TYPED ON THE SITE'S OWN PAD. THE PHONE'S KEYBOARD HAS NO WAY IN.

   ASKED FOR AS "make the input better … like hegarty maths … desmos … worded answer normal device
   keyboard." and "add gemini marking system for worded questions." AND THEN THE OWNER, 8 Oct,
   reversing the half about the device keyboard: *"Make the keypad never need to use their own
   keyboard the key pad seems to allow ios keyboard to show I just want self contained system
   really"*.

   ---------- WHY THE PHONE'S KEYBOARD WENT, AFTER BEING KEPT ON PURPOSE -----------------------------
   IT WAS KEPT FOR WORDS because a word keyboard is what words want. That was right about the keyboard
   and wrong about the page. Counted on 8 Oct, the iPad's keyboard came up three ways by design -- every
   worded box (2,183 cards) and every practical worksheet box (246) were plain textareas, and `abc` on
   the maths pad set `inputmode="text"` on purpose, which 532 of the 5,149 maths boxes could not be
   answered without (`3n`, `y = 2x + 1`, `2:3`, `x < 3`). And four more ways that `inputmode="none"`
   was believed to close and does not, read from WebKit's own source: an iPad's hardware keyboard,
   Apple Pencil Scribble, the long-press menu's Paste / AutoFill / Scan Text, and any iOS before
   12.2, which ignores `inputmode` altogether. A second keyboard rising over the first, a different
   height on every device, with its own bar and its own guesses at the child's words, is the
   opposite of the one thing the pad was for.

   SO EVERY ANSWER BOX IS A PAD BOX, and the pad has two layouts: the maths keys, and letters. `abc`
   turns the pad to letters and `123` turns it back; a worded box opens on the letters. Nothing on a
   question's pages calls the phone's keyboard any more -- the Find search box and sign-in still do,
   because they are not answers.

   ---------- `readonly` IS THE LOCK, AND `inputmode="none"` THE SECOND ONE ---------------------------
   `inputmode="none"` ONLY STOPS THE AUTOMATIC KEYBOARD. WebKit's hardware-keyboard path, Scribble's
   `_focusTextInputContext` and Live Text's `captureTextFromCamera` all ask a question that IGNORES
   inputmode and refuses a field only when it is `readonly` -- which is also checked before the
   element's type on every iOS version. So both are on every box, WRITTEN IN THE MARKUP by `kpField_`
   and never added or taken off by script: a box rebuilt under the child by a redraw (`kpLive_`) has
   to come back locked without anybody remembering to lock it, and the old `abc` was exactly a script
   unlocking one.

   THE BOX IS STILL A REAL `<input>` OR `<textarea>` -- focusable, labelled, holding the value, saved
   by the same `input` listener in find.js and read by the same `qp-check`. `readonly` stops the
   BROWSER writing into it and nothing else: `.value`, `setSelectionRange` and a dispatched `input`
   all still work (measured), so every write the pad makes is the write it always made. What a
   readonly box does not do is take a laptop's keys, so those are read here (`keydown`) and sent
   through the pad's own edit, `kpEdit_` -- one path for a thumb and a keyboard, slots and all.

   AND THE FINGER NEVER TOUCHES IT. The box is `pointer-events: none` under its own drawing, so a tap
   lands on the drawing, inside the `<label>` that wraps both, and is answered here: the box focused
   by script and the caret put where the finger was (`kpHit_`). iOS has no field under the finger to
   offer its edit menu, magnifier or selection handles on.

   WHAT WENT WITH THE PHONE'S KEYBOARD, said rather than buried: spelling help, autocorrect,
   predictions, dictation, and copy-and-paste by touch on a worded answer. A laptop still pastes.

   WHAT IS STORED IS PLAIN TEXT, and that is the decision everything else rests on. A fraction is
   `(3)/(4)`, a power `x^(2)`, a root `√(11)`: each structure is typed with a slot to fill, because
   the drawing needs somewhere to put the caret. `markNorm_` folds a bracket round one term away (see
   the note there), so `(3)/(4)` marks right against a scheme of `0.75` exactly as `3/4` did. No
   second representation, no tree, nothing for `ansKey_` to learn about.

   THE MATHS DRAWING IS `typeset_`, THE LIBRARY'S OWN. A fraction stacks and a power rises exactly as
   they do in the question above the box, because it is the same function — a second typesetter for
   the answer would be a second opinion about what a fraction looks like. A WORDED ANSWER IS NEVER
   TYPESET: `typeset_` reads `well-known` as a minus and `and/or` as a fraction, so words are drawn as
   the plain text they are (`kpDraw_`).

   WHICH LAYOUT A BOX OPENS ON is `ansMaths_` below: the sheet's `answer_type`, and where that is
   `short`, whether the scheme's answer is maths-shaped.

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
   `ansBox_` and `guideBox_` there call `kpField_` and `aiTile_` here — at draw time, after every file
   has loaded. BEFORE `tiles`, so `tileIcon_` (the ✓ key's mark) is read when the pad is built, never
   at load.
================================================================================================== */

/* ---------- WHICH ANSWERS ARE MATHS ---------------------------------------------------------------
   THE SHEET SAYS, MOSTLY. `calculation` is 4,456 rows and every one is a number or an expression;
   `explain`, `written` and `proof` are sentences by definition; `drawing` and `annotate` are the pad
   on the picture, whose words box is a note. `short` is the one that could be either — "egestion" and
   `3y(2y + 5)` are both short — so there the scheme decides: maths when every accepted answer is,
   with the unit taken off first (`markBare_`, the marker's own), so `12 km/h` is a number.

   MATHS-SHAPED MEANS NO TWO LETTERS IN A ROW. `x`, `n`, `3y(2y+5)` and `x=3, y=-4` are algebra;
   `egestion` and `jupiter` are words. A rule this blunt is right because the cost of being wrong is
   small in both directions: a word answer that opens on the maths keys is one `abc` from its letters,
   and a maths answer that opens on the letters is one `123` from its digits -- it is the same pad
   either way, and only the first layout differs. */
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
     because 3 kg covers 45 m²" — and that is the letters' job. */
  if (t === 'calculation') return !ways.length || ways.every(kpMathsy_);
  return ways.length > 0 && ways.every(kpMathsy_);
}

/* ---------- THE SIGNS A SCHEME NEEDS AND THE DIGITS DO NOT HAVE -----------------------------------
   UNTIL 8 OCT THE WAY TO `<` WAS THE PHONE'S KEYBOARD, through `abc`. Measured over the library with
   the phone's keyboard taken away: 157 marked questions could not be answered right with the maths
   keys and the letters alone -- `<` 78, `≤` 57, `:` 51, `>` 23, `≥` 12 -- inequalities and ratios,
   whose schemes `markAnswer_` already reads (`x<=-4` for `x ≤ −4`, `2:5` for `2 : 5`).

   A ROW OF THEM ABOVE THE DIGITS, BUT ONLY ON A BOX THAT NEEDS ONE. Shown on every box it would be a
   sixth row -- 48px more of the card covered -- on the 5,000 that never use it, and on a 320x568
   phone that is the box going under the pad. So `kpField_` marks the box (`data-kp-signs`) from its
   scheme (`accept`), read the way `ansMaths_` reads it -- and where there is no scheme, from the
   answer the worked answer LEADS with, the part before its first dash (`140 < h ≤ 150 — the class
   …`), 48 boxes. NOT THE WHOLE WORKED ANSWER: its prose is the mark scheme's, and it names wrong
   forms -- 1F Q23b's says "the right numbers in the wrong form, eg 5 : 9" -- so read whole it gave
   411 more boxes the row, and measured at 320 that sixth row lifted Q23b's card 11px off the top of
   the screen. The rarer signs (`≈` 3, `→` 2, `∝` 1) are left out: a key nobody presses is a smaller
   key for everybody else. */
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
  /* `abc` IS THE LETTERS, ON THIS PAD. It was "type with the keyboard instead" and handed the box to
     the phone (see the header); now it only turns the pad over, and `123` on the letters turns it
     back. */
  { v: '!abc', a: 'letters', c: ' kp-mode', t: 'abc' },
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

/* ---------- THE LETTERS ---------------------------------------------------------------------------
   THE PHONE'S OWN ROWS, because every child already knows where `e` is: q to p, a to l set in by half
   a key, z to m between ⇧ and the apostrophe, then the punctuation an answer is written with and a
   space bar. The bottom row is the maths pad's own -- 123 ← → ⌫ ✓ in the same places, the same
   colours, so the keys that move, delete and send do not move when the pad turns over.

   ON SIXTY COLUMNS, NOT TEN. Ten across is what a word keyboard needs and six is what the maths pad
   has; sixty is what both divide into, so a letter is 6, ⇧ and the apostrophe 9, the space bar 36,
   a bottom-row key 10 -- and the bottom row lands where the maths pad's does. The gaps are inside
   each key's own box (a transparent border, `#kp.is-abc` in style.css), so every pixel of the row is
   some key's.

   NARROWER THAN 44px, AND IT HAS TO BE. Ten keys across need 440px and a phone has 288 inside its
   gutters: a letter is 28.8px wide at 320 and 35.8 at 390 -- the phone's own keyboard is about 32 on
   that phone. Every key is still 44px or more TALL, in px; a tap in a gutter or between rows goes to
   the nearest key (`kpNear_`), so the edge keys reach the edge of the glass; and a pressed letter
   shows above the finger. `check/ui.js` carries the reason (`ACCEPTED_TAP`, `kp-ch`). On a tablet the
   letters pad widens to 640px so its keys are 60px.

   NO SHIFT FOR A MARK: `markNorm_` lowercases, and Gemini reads the meaning. ⇧ is for the child's
   own sentence -- see `kpShiftTap_`. */
const kpCh_ = (t, a, span, at) => ({ t: t, a: a || '', c: ' kp-ch', span: span || 6, at: at || 0 });
const KP_ABC = [].concat(
  'qwertyuiop'.split('').map(c => kpCh_(c)),
  'asdfghjkl'.split('').map((c, i) => kpCh_(c, '', 6, i ? 0 : 4)),
  [{ v: '!shift', a: 'capitals', c: ' kp-shift kp-mode', span: 9, t: '\u21e7' }],
  'zxcvbnm'.split('').map(c => kpCh_(c)),
  [kpCh_('\'', 'apostrophe', 9), kpCh_(',', 'comma'), kpCh_('.', 'full stop'),
   { v: ' ', a: 'space', c: ' kp-space kp-mode', span: 36, t: 'space' },
   kpCh_('?', 'question mark'), kpCh_('-', 'hyphen')]);
/* THE BOTTOM ROW, THE MATHS PAD'S OWN with `123` where `abc` was. On a WORDED box its ␣ is a new line
   (↵), because the space bar is a row above and a paragraph is the one thing a sentence keyboard has
   that this would otherwise lack; ✓ stays "done", as on the phone's own `return`-less pad. */
const kpBottom_ = words => KP_KEYS.slice(-6).map(k =>
  k.v === '!abc' ? { v: '!123', a: 'numbers and maths', c: ' kp-mode', t: '123' }
  : (words && k.v === ' ') ? { v: '!nl', a: 'new line', c: ' kp-mode', t: '\u21b5' } : k)
  .map(k => Object.assign({}, k, { span: 10 }));

/* A KEY IS A BUTTON AND NOT A TILE, the one place on a question's pages the owner's *"it should all be
   tiles"* does not reach, and on purpose: these are a KEYBOARD. Thirty keys in a grid have to be the
   grid's size and carry their glyph (7, π, √, a fraction drawn as two boxes) as the whole face; a tile
   is a 44px plate with an outline mark and its name in `title`, which on a key would be a picture of a
   7 called "7". Typing is the answer being given, as a multiple-choice option is (`choiceBox_`). */
const kpKey_ = k => `<button type="button" class="kp-key${k.c || ''}" data-do="kp-key"
  data-v="${esc(k.v != null ? k.v : k.t)}"${k.a ? ` aria-label="${esc(k.a)}"` : ''}${
  k.span ? ` style="grid-column:${k.at ? k.at + ' / ' : ''}span ${k.span}"` : ''}>${
  k.icon ? tileIcon_(k.icon) : k.t}</button>`;
/* THE PAD'S KEYS FOR A LAYOUT AND A BOX. The maths layout grows its signs row only for a maths box
   that asked for one; the letters' bottom row knows whether it is under words (`kpBottom_`). */
function kpPadHtml_(layer, words, signs) {
  if (layer === 'abc') return KP_ABC.concat(kpBottom_(words)).map(kpKey_).join('');
  return (signs ? KP_SIGN_KEYS : []).concat(KP_KEYS).map(kpKey_).join('');
}

/* ---------- THE BOX -----------------------------------------------------------------------------------
   THE DRAWING IS WHAT YOU SEE; THE BOX IS LAID OVER IT, INVISIBLE. The box has to be the real thing —
   it takes the focus, it is what the label names, it is what `qp-check` and the `input` listener read —
   and its own text cannot be typeset. So its ink is transparent and the `.kp-show` under it draws the
   same value, with a caret of its own where the box's is.

   ONE FUNCTION FOR BOTH KINDS, so nothing that draws an answer box writes a field of its own: `ansBox_`
   and `guideBox_` both call this, and the lock (`readonly`, `inputmode="none"`) is written here and
   only here. A MATHS ANSWER IS AN `<input>`; A WORDED ONE A `<textarea>`, because an input strips
   newlines and an answer written before 8 Oct on a phone's keyboard may hold them. `data-kp` says
   which layout the pad opens on.

   16px ON THE BOX, whatever the root says, because iOS zooms the page into any field smaller than
   that the moment it is focused — and a zoom the student did not ask for, on the box they are
   typing into, is the page lurching at the worst moment. The ink is invisible, so its size costs
   nothing on the screen. */
const KP_HOLE = '\u03d9', KP_CARET = '\u03db';
function kpField_(k, val, kind, signs, name) {
  const words = kind === 'words';
  const v = val == null ? '' : String(val);
  const lock = `class="qp-ans-in kp-in" data-do="qp-ans" data-k="${esc(k)}" data-kp="${words ? 'words' : 'maths'}"${
    signs ? ' data-kp-signs="1"' : ''} aria-label="${esc(name || 'Your answer')}"
        readonly inputmode="none" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"`;
  return `<span class="kp-field kp-${words ? 'words' : 'maths'}">
      <span class="kp-show" aria-hidden="true">${kpDraw_(v, -1, words)}</span>
      ${words ? `<textarea ${lock} rows="1">${esc(v)}</textarea>` : `<input ${lock} value="${esc(v)}">`}
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

/* A WORDED ANSWER IS DRAWN AS THE TEXT IT IS: escaped, its newlines kept by `white-space: pre-wrap`,
   the caret a span between two halves -- and a laptop's Ctrl+A drawn as a marked run, because the
   next key replaces it and a selection you cannot see is a paragraph lost to one letter. */
function kpDraw_(v, caret, words, end) {
  if (!words) return kpTypeset_(v, caret);
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
  if (words && caret >= 0) kpCaretSeen_(show);
}
/* A WORDED DRAWING STOPS GROWING AT ABOUT FIVE LINES AND SCROLLS INSIDE (`.kp-words > .kp-show`), so the
   line being written is scrolled into its own window -- by `scrollTop` on the drawing, never
   `scrollIntoView`, which would scroll the transformed column the whole app is laid out on. */
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
   the pad stays up -- on the layout the child had. Nothing to find: the pad closes, which is what
   Chromium already did. The replacement is locked because `kpField_` drew it locked. */
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
   arrives, which is what `on('kp-key')` answers.

   `KP_LAYER` IS WHICH FACE THE PAD SHOWS, 'maths' or 'abc'. A box opens on its own kind's (`data-kp`);
   `abc` and `123` turn it over; a box retaken after a redraw keeps the face the child was using. */
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

/* THE PAD'S FACE FOR THIS BOX. Rebuilt only when what it should show has changed -- the layout, the
   kind of box, the signs row -- so a key pressed on the same face is pressed on the same button. */
function kpLayout_(inp) {
  const pad = kpPad_();
  const words = !!inp && inp.getAttribute('data-kp') === 'words';
  const signs = !!inp && !words && inp.hasAttribute('data-kp-signs');
  const sig = KP_LAYER + (words ? ':w' : ':m') + (signs && KP_LAYER === 'maths' ? ':s' : '');
  if (pad.getAttribute('data-sig') !== sig) {
    pad.innerHTML = kpPadHtml_(KP_LAYER, words, signs);
    pad.setAttribute('data-sig', sig);
  }
  pad.classList.toggle('is-abc', KP_LAYER === 'abc');
  pad.setAttribute('data-layer', KP_LAYER);
  pad.setAttribute('aria-label', KP_LAYER === 'abc' ? 'Letters keypad' : 'Maths keypad');
  kpShiftPaint_();
  return pad;
}
/* `abc` AND `123`: the same pad turned over, the box keeping its focus and its caret. The height does
   not change between the two -- five rows each, the same rows -- unless the maths face has its signs
   row, and then the room is asked for again. */
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
  /* THE CARET GOES TO THE END ON ARRIVAL -- where the next key belongs; ← and → move it from there,
     and a tap on the drawing puts it where the finger was (`kpHit_`, after this).
     EXCEPT ON THE BOX THAT REPLACED THE ONE BEING TYPED IN (`kpLive_`): the student never left it, so
     the caret goes back to where it was -- inside the fraction's bottom, say, and not after it -- and
     the pad keeps the face it had. */
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

/* ---------- AND THE BOX STAYS ABOVE THE PAD ---------------------------------------------------------
   THE PAD COVERS THE BOTTOM OF THE SCREEN, and a box near the bottom of a card is a box drawn
   underneath it — typing into something you cannot see. The phone's keyboard solves this by
   shrinking the viewport; a pad cannot, so the column it is in is given the pad's height as padding
   at its foot, for as long as the pad is up, and scrolled just enough to clear it. Taken off again on
   close, so the column is exactly as long as it was.

   WHAT IS KEPT CLEAR IS THE FIELD THE CHILD SEES (`kpBox_`, the label: the chat bar's paper pill, or a
   worksheet box with its question over it), not the invisible box inside it -- the pill is the thing
   that carries the ring and grows as a worded answer does. */
let KP_ROOM = null;
const kpBox_ = inp => (inp && inp.closest && inp.closest('.qp-ans')) || inp;
function kpRoom_(inp, pad) {
  kpRoomBack_();
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
/* ---------- AND AGAIN AS IT GROWS -----------------------------------------------------------------
   A WORDED ANSWER GROWS A LINE AT A TIME, and the room asked for when the pad came up was for the box
   as it was then. Measured with the prototype on 8 Oct: two paragraphs into Q33's box at 320x568 put
   its foot 56px under the pad. So after every key, and after the pad turns over, the question is
   asked again -- and answered by the LIFT, never by `kpRoom_`, whose reset would drop the column and
   lift it again on every letter. The lift only grows while the pad is up; closing it lets go. */
function kpKeepClear_(inp) {
  const pad = document.getElementById('kp');
  if (!pad || pad.hidden || !inp || KP_AT !== inp || !inp.isConnected) return;
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
   lift by the wrong amount and keep it -- and asked again after every key (`kpKeepClear_`), it is the
   same answer however often it is asked. */
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
   deletes like any character, because there is no other half to strand.

   A WORDED BOX HAS NO STRUCTURES, so none of that applies to it: ⌫ deletes the character before the
   caret, brackets included -- "(see above)" is prose, and stepping into it would be a key that
   sometimes does nothing. */
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
  const words = inp.getAttribute('data-kp') === 'words';
  let a = inp.selectionStart, b = inp.selectionEnd;
  if (a == null) { a = v.length; b = v.length; }
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
  else if (cmd === '!home') to(0);
  else if (cmd === '!end') to(v.length);
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
  /* THE SAME EVENT A KEYBOARD SENDS, so find.js's listener saves it under `ansKey_` and takes a stale
     verdict off it, exactly as it does for a typed letter. One path for both, or the pad is a second
     way to answer that the rest of the app does not know about. ONLY WHEN THE ANSWER CHANGED: a caret
     moved is not a new answer, and it took "Correct" off one that had not changed. */
  if (inp.value !== v) inp.dispatchEvent(new Event('input', { bubbles: true }));
}

/* ---------- A KEY, FROM THE PAD OR A KEYBOARD -----------------------------------------------------
   ONE PATH FOR BOTH (`kpType_`): the edit, the drawing, the capital for the next letter, the room
   above the pad, and the line a screen reader hears. `typed` is a laptop's key, which carries its own
   case -- the pad's ⇧ is for the pad's letters. On a WORDED box the maths face's structure keys type
   their plain signs, because a worded drawing is plain text and `(3)/()` in a sentence is noise. */
const KP_WORD_SIGN = { '!frac': '/', '!pow': '^', '!sqrt': '\u221a' };
function kpType_(inp, cmd, typed) {
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
  kpRender_(inp);
  if (!/^!(left|right|home|end)$/.test(c)) kpAutoShift_(inp);
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

/* ✓ IS CHECK, where the question has a scheme to check against — the same handler the button runs,
   not a copy of it — and otherwise it is "I have finished", which puts the pad away. NOT "Mark with
   AI": that spends one of the day's twenty marks, and a ✓ pressed to put the pad away should not
   spend one. Pressing the tile beside the box is how a worded answer is sent. */
function kpDone_(inp) {
  const card = inp.closest('.qcard');
  const chk = card && card.querySelector('.qp-check[data-do="qp-check"]');
  if (chk && ACTIONS['qp-check']) ACTIONS['qp-check'](chk);
  inp.blur();
  kpClose_();
}

/* ---------- CAPITALS ------------------------------------------------------------------------------
   THE PHONE'S OWN RULES, because they are the ones a child's thumbs already know. ⇧ capitalises the
   next letter; two taps inside 350ms is caps lock, drawn as a bar under the key; a tap while it is on
   turns it off. In a WORDED box a capital comes on by itself at the start, after `. ? !` and a space,
   and on a new line -- and never in a maths box, where `X` and `x` are different answers. */
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

/* ---------- A TAP BETWEEN KEYS IS THE NEAREST KEY ---------------------------------------------------
   THE LETTERS ARE NARROWER THAN A FINGER, so the pad's own gutters and the gaps between its rows are
   live, as they are on the phone's keyboard: a tap there goes to the nearest key -- in the ROW the
   finger was in first, then along it. Measured with the prototype: by distance alone a tap in the
   left gutter beside `a` at 390 picked `q` above it. Not after a slide (`PRESS_MOVED`), which the
   click handler in shell.js swallows for every other control. */
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

/* ---------- ⌫, ← AND → REPEAT WHILE HELD -------------------------------------------------------------
   A SENTENCE TAKES A LOT OF DELETING ONE TAP AT A TIME, and every keyboard a child has used repeats a
   held delete. After 450ms, every 70ms, until the finger lifts; the click at the lift is the press
   already counted (`KP_REPEATED`). */
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

/* ---------- WHAT A SCREEN READER HEARS ------------------------------------------------------------
   A KEY SAYS ITS OWN NAME, and nothing said what the box had become -- the drawing is `aria-hidden`,
   because a fraction read as its markup is noise. So a moment after the last key the box's content is
   said, maths read the way a person would say it ("3 over 4"), words the sentence being written. */
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

/* ---------- A TAP ON THE BOX ------------------------------------------------------------------------
   THE BOX TAKES NO TAPS (`pointer-events: none` in style.css), so a tap lands on its drawing inside the
   `<label>`, and the label would hand it to the box: a second click, sent to the box, which focuses it
   natively -- the very thing that offers iOS a field to type into. So the label's own click is
   cancelled and the box is focused here instead.

   AND ITS `mousedown` IS SWALLOWED, the pad's own trick: measured without it, a tap on a box that
   already had the focus blurred it first, the pad closed, and the refocus put the caret at the end and
   scrolled before the tap was read -- a tap on character 18 landed at 316. So the focus stays, and the
   caret is read off the drawing AS IT WAS WHEN TAPPED (`kpHit_`), before anything redraws or lifts it.
   A swipe that ends on the box is a swipe (`PRESS_MOVED`), and opens nothing. */
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

/* ---------- WHERE IN THE ANSWER A FINGER LANDED -------------------------------------------------------
   WORDS: the browser's own answer (`caretPositionFromPoint`, or `caretRangeFromPoint` where that is all
   there is), kept only when it lands inside the drawing -- and otherwise every character's box,
   nearest line first, then the nearer edge. Safari needs the second: WebKit will not place a caret in
   `user-select: none` text, and the drawing is `user-select: none` so a long press shows no loupe.
   Measured, the two agreed at 52 of 52 points, 0.42ms and 1.51ms a tap over 358 characters.

   MATHS: a stacked fraction has no text offsets to ask about, so every place the caret could go is
   drawn, side by side in one host fixed on <body>, read after ONE layout, and the nearest kept. One
   layout per place was 735-952ms on a 6,000-element page; one for all of them is 47-81. Fixed on <body>
   and not in the column, because `position: fixed` inside a transformed ancestor is relative to it. */
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
   covers a laptop's keys, which `kpKeys_` below has already sent through the pad. */
['input', 'keyup'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains('kp-in')) kpRender_(t);
}));

/* ---------- A LAPTOP'S KEYBOARD, AND AN iPAD'S ---------------------------------------------------------
   A READONLY BOX TAKES NO KEYS OF ITS OWN -- measured: `a`, Backspace and → arrive as `keydown` and
   change nothing -- so each is sent through the pad's own edit, which is better than the native typing
   it replaces: a laptop's Backspace now keeps the fraction's brackets paired, as ⌫ does. Enter is ✓;
   Shift+Enter is a new line in a worded box; Escape puts the pad away. Ctrl and ⌘ belong to the
   browser (copy, select all), and so does Tab, which moves to the next box. Option on a Mac types `≤`
   and `≥` with `,` and `.`, so Alt alone is let through as a character. Composition (an IME mid-word)
   is the browser's until it ends. */
function kpKeys_(e) {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('kp-in') || e.isComposing || e.keyCode === 229) return;
  const words = t.getAttribute('data-kp') === 'words';
  const k = e.key || '';
  let cmd = null;
  if (k === 'Enter') {
    e.preventDefault();
    if (!(words && e.shiftKey)) return kpDone_(t);
    cmd = '\n';
  } else if (k === 'Escape') {
    e.preventDefault();
    t.blur();
    kpClose_();
    return;
  } else if (e.ctrlKey || e.metaKey) return;
  else if (k === 'Backspace') cmd = '!back';
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
/* ↑ AND ↓ IN A WORDED BOX: the caret a line up or down, read off the drawing the way a tap is. */
function kpLine_(inp, dir) {
  const show = inp.parentNode && inp.parentNode.querySelector('.kp-show');
  const c = show && show.querySelector('.kp-caret');
  if (!c) return;
  const r = c.getBoundingClientRect();
  const lh = parseFloat(getComputedStyle(show).lineHeight) || r.height || 20;
  const at = kpHitWords_(show, r.left, r.top + r.height / 2 + dir * lh);
  try { inp.setSelectionRange(at, at); } catch (e) {}
  kpRender_(inp);
}
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
