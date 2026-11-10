/* @family. — the whiteboard's blank sheet (attic, 88a), cut from js/find-loupe.js; its widget entry is in widgets-engines.js, its style in attic/css/engines.css. Its board was `<svg class="wb-surf" viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true"></svg>` (WB_SURF). */
/* EVERY COPY, BY CLASS -- `tmtPaint_`'s reason: § */
/* AND EACH SLOT IT DRAWS INTO IS SAID TO BE DRAWN FOR WHOEVER IS SIGNED IN NOW (`slot.WHO`). § */
function wbPaint_() {
  const html = `<div class="wb">${padWrap_(WB_ITEM, WB_SURF, true)}</div>`;
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  document.querySelectorAll('.wb-box').forEach(el => {
    if (PAD_ST && PAD_GO && el.contains(PAD_GO.ink)) return;
    el.innerHTML = html;
    const slot = el.closest('.widget-slot');
    /* `OWN` AS WELL: the board is drawn from this person's strokes on this device and from no fact, so a
       landing or a repaint for the same person leaves it drawn (`widgetsReveil_`). */
    if (slot) { slot.WHO = who; slot.OWN = who; }
  });
}
function initWhiteboard() { wbPaint_(); }
