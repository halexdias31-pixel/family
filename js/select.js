/* @family. — select.js CTRL-A SELECTS THE THING YOU ARE LOOKING AT, NOT THE WHOLE APP. § */

/* THE BOXES A SELECTION IS ALLOWED TO STOP AT. Order does not matter — `closest` finds the nearest
   ancestor matching any of them — but it reads as the list of things somebody would call "a thing
   on the screen", which is the point. */
const SELECT_IN = '#sheet-body, .widget-full, .card, .cpn, .screen';

/* ---------- AND THE ONE IT SHOULD STOP AT FIRST § */
const SELECT_CARD = '#sheet-body, .widget-full, .card, .cpn';

/* WHERE YOUR EYE WAS. The last thing pressed, which is a better answer than any calculation about which screen the camera is over: § */
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

  /* ---------- A FIELD KEEPS ITS OWN CTRL-A § */
  const on = document.activeElement;
  if (on && (/^(INPUT|TEXTAREA|SELECT)$/.test(on.tagName) || on.isContentEditable)) return;

  const box = selectBoxFor_();
  if (!box) return;                     /* nothing to scope to — let the browser do its thing */

  e.preventDefault();
  selectContents_(box);
  selLastBox = box;
  selLastAt  = Date.now();
});

/* THE BOX THIS PRESS SHOULD SELECT. § */
function selectBoxFor_() {
  const again = selLastBox && (Date.now() - selLastAt) < 2000 && document.contains(selLastBox);
  if (again) {
    /* OUT ONE. From the PARENT, so `closest` cannot hand back the box we are trying to leave. */
    return selLastBox.parentElement ? selLastBox.parentElement.closest(SELECT_IN) : null;
  }

  /* ---------- WHERE THE EYE IS: FOCUS FIRST, THEN THE LAST TAP § */
  const on   = document.activeElement;
  const near = (on && on !== document.body && document.contains(on)) ? on
             : ((selTouched && document.contains(selTouched)) ? selTouched : null);
  const box  = near && near.closest ? near.closest(SELECT_CARD) : null;
  return box || selWidestOnScreen_();
}

/* THE WIDGET WITH THE MOST OF ITSELF IN VIEW. § */
function selWidestOnScreen_() {
  const h = window.innerHeight || 0;
  let best = null, most = 0;
  document.querySelectorAll('#screen .widget-full, #screen .card, #screen .cpn').forEach(el => {
    if (el.classList.contains('hidden') || !el.getClientRects().length) return;
    const r = el.getBoundingClientRect();
    const seen = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
    /* THE TAB IS NO LONGER IN THE RUNNING, so the weighting is between a widget and a card. § */
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
