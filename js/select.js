/* ==================================================================================================
   @family. — select.js

   CTRL-A SELECTS THE THING YOU ARE LOOKING AT, NOT THE WHOLE APP.

   The app is one page. Every screen, every widget, the tab bar, the eight sections index.html lists
   and the sheet that opens over them are all in one document at once — that is what makes the
   camera model work, and it is why the browser's Ctrl-A is useless here. It selects the DOCUMENT,
   which is everything ever drawn, including the seven screens you cannot see. Copy that and you get
   a wall of text from tabs you were not on.

   So: the key is caught, and the selection is put around the smallest sensible box containing
   whatever you were last touching.

   ------------------------------------------------------------------------------------------------
   IT DOES NOT TOUCH A TEXT FIELD, AND THAT IS THE FIRST RULE.

   Inside the notepad, the docket's input, any field at all — Ctrl-A already means "select what I
   have typed", which is right, which is what every other program does, and which nobody would
   thank us for improving. So a field being focused ends this before it starts. The one place the
   browser's behaviour is already correct is the one place it is left alone.

   ------------------------------------------------------------------------------------------------
   WHAT COUNTS AS "THE THING YOU ARE ON".

   Not a guess about which screen is showing — the app knows where the camera is, but the camera is
   not what you are reading when a sheet is open over it. What you are reading is whatever you last
   touched, so that is what is remembered: the target of the last pointer press, which is exactly
   what your eye was on when you reached for the keyboard.

   From there it walks OUT to the nearest box in this list, and stops:

       #sheet-body     the panel that opened over everything
       .widget-full    a widget that IS the page — the calculator, the docket, the mat
       .card           one card in a list of them
       .screen         a whole tab, if none of the above

   `closest` returns the nearest ancestor matching any of them, which is the right answer without
   the list needing to be in priority order — a `.card` inside a `.widget-full` is the card, because
   the card is the smaller and truer answer to "what am I on".

   NOTHING TOUCHED YET IS THE ORDINARY CASE ON A FRESH SCREEN. Somebody swipes to the calculator and
   presses Ctrl-A without clicking first, and there is no last-touched element to work from. So the
   fallback is the widget with the most of itself on screen — measured, not assumed, because a
   half-scrolled column has two widgets in view and only one of them is the one being read.

   ------------------------------------------------------------------------------------------------
   PRESS IT AGAIN AND IT WIDENS.

   The objection to any of this is the case where you DID want the whole screen, and a key that has
   decided it knows better is a key that has taken something away. So the second press inside two
   seconds goes out one box — card, then widget, then screen — and a press after that lets the
   browser have it and select the document, which is where you started.

   Nobody has to know the rule. Press it once for the sensible thing, press it again if the sensible
   thing was too small.
================================================================================================== */

/* THE BOXES A SELECTION IS ALLOWED TO STOP AT. Order does not matter — `closest` finds the nearest
   ancestor matching any of them — but it reads as the list of things somebody would call "a thing
   on the screen", which is the point. */
const SELECT_IN = '#sheet-body, .widget-full, .card, .screen';

/* WHERE YOUR EYE WAS. The last thing pressed, which is a better answer than any calculation about
   which screen the camera is over: a sheet opens on top of a screen, and while it is open the
   screen underneath is not what anybody is reading. */
let selTouched = null;
let selLastBox = null;    // what the previous Ctrl-A selected, for the widen-on-repeat
let selLastAt  = 0;

/* `capture` and `passive` — this only ever READS the target. Capture so it still sees the press
   when something below stops the event, which the swipe handlers and the games both do. */
document.addEventListener('pointerdown', e => { selTouched = e.target; },
                          { capture: true, passive: true });

document.addEventListener('keydown', e => {
  if (e.key !== 'a' && e.key !== 'A') return;
  /* Ctrl on everything, Cmd on a Mac. Shift or Alt with it is somebody else's shortcut. */
  if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;

  /* ---------- A FIELD KEEPS ITS OWN CTRL-A ------------------------------------------------------
     See the header. `isContentEditable` covers the case a tag name cannot: a div somebody made
     editable is a text field in every way that matters here. */
  const on = document.activeElement;
  if (on && (/^(INPUT|TEXTAREA|SELECT)$/.test(on.tagName) || on.isContentEditable)) return;

  const box = selectBoxFor_();
  if (!box) return;                     /* nothing to scope to — let the browser do its thing */

  e.preventDefault();
  selectContents_(box);
  selLastBox = box;
  selLastAt  = Date.now();
});

/**
 * THE BOX THIS PRESS SHOULD SELECT.
 *
 * Ordinarily the smallest box around whatever was last touched. On a repeat press, one box further
 * out than the last one — see the header: the escape hatch for when the sensible answer was too
 * small. Returning null means "let the browser select the document", which is the last step out and
 * the behaviour somebody pressing a third time is asking for.
 */
function selectBoxFor_() {
  const again = selLastBox && (Date.now() - selLastAt) < 2000 && document.contains(selLastBox);
  if (again) {
    /* OUT ONE. From the PARENT, so `closest` cannot hand back the box we are trying to leave. */
    return selLastBox.parentElement ? selLastBox.parentElement.closest(SELECT_IN) : null;
  }

  const from = (selTouched && document.contains(selTouched)) ? selTouched : null;
  const box  = from && from.closest ? from.closest(SELECT_IN) : null;
  return box || selWidestOnScreen_();
}

/**
 * THE WIDGET WITH THE MOST OF ITSELF IN VIEW.
 *
 * For the fresh-screen case where nothing has been touched yet. A column that is half scrolled has
 * two widgets showing and only one of them is being read, so this measures rather than takes the
 * first — the one with the greatest visible height wins, which is what "the one I am looking at"
 * means when it has to be worked out rather than remembered.
 */
function selWidestOnScreen_() {
  const h = window.innerHeight || 0;
  let best = null, most = 0;
  document.querySelectorAll('#screen .widget-full, #screen > .screen').forEach(el => {
    if (el.classList.contains('hidden') || !el.getClientRects().length) return;
    const r = el.getBoundingClientRect();
    const seen = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
    /* A `.screen` is the whole tab and will always beat a widget inside it on raw height, so a
       widget wins ties and near-ties — the smaller, truer answer again. */
    const worth = el.classList.contains('widget-full') ? seen * 1.5 : seen;
    if (worth > most) { most = worth; best = el; }
  });
  return best;
}

/** Put the selection around everything inside a box. */
function selectContents_(box) {
  const sel = window.getSelection && window.getSelection();
  if (!sel) return;
  try {
    const r = document.createRange();
    r.selectNodeContents(box);
    sel.removeAllRanges();
    sel.addRange(r);
  } catch (err) {
    /* A box that is being redrawn at this exact moment. Not worth a message — the next press works. */
  }
}
