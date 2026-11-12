/* ---------- THE ROUND TRIP every me-*.js form saves through (cut from me-shelves.js; read with the other me-*.js by tools/piece-src.js). */
/* A ROUND TRIP THAT CANNOT FAIL SILENTLY. § */
function send_(body, o) {
  o = o || {};
  const btn = o.button;
  /* AN ID OR THE ELEMENT ITSELF. A settings card's status line is a CLASS, one per card — there are
     a dozen on one column, so it cannot be an id — and the caller already holds the element. */
  const say = msg => {
    const el = o.where && (typeof o.where === 'string' ? $(o.where) : o.where);
    /* A REQUEST NOBODY PRESSED says nothing with no connection: the Reconnecting line already does, and offline nothing pressed is lost (offline.js). */
    if (el) el.textContent = msg; else if (btn || navigator.onLine !== false) toast(msg);
  };

  /* `is-busy` IS THE SPINNER, and it goes on whether or not there is a `busy` label -- a
     button with no relabel still has to show that it is waiting. See `.btn.is-busy`. */
  /* `data-unlocked` — SEE BELOW: a control that queues its own press behind the save is left live. */
  if (btn) { btn.disabled = !btn.hasAttribute('data-unlocked'); btn.classList.add('is-busy');
             /* A TILE HAS NO WORD TO SWAP — its face is a mark, and writing text over it would lose
                the mark for good. The ring is the whole of its busy state. */
             if (o.busy && !btn.classList.contains('tile')) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
  if (o.saying) say(o.saying);

  /* ---------- AND THE FIELDS, WHICH IS THE HALF THAT WAS MISSING § */
  const box = o.lock
    ? (typeof o.lock === 'string' ? $(o.lock) : o.lock)
    : btn && btn.closest('.me-form, .msg-form, .rc, #sheet-body, .card');
  const had = document.activeElement;
  const locked = [];
  if (box) {
    [].forEach.call(box.querySelectorAll('input, select, textarea, button'), el => {
      if (el === btn || el.disabled || el.hasAttribute('data-unlocked')) return;
      el.disabled = true;
      locked.push(el);
    });
    box.classList.add('is-sending');
  }

  const done = () => {
    locked.forEach(el => { el.disabled = false; });
    locked.length = 0;
    if (box) box.classList.remove('is-sending');
    /* ONLY IF THE PAGE STILL HOLDS IT. A reply that repaints the card replaces the element that
       had the caret, and focusing a detached node moves focus to the body -- which is worse than
       leaving it where the repaint put it. */
    if (had && had.focus && document.contains(had)) { try { had.focus(); } catch (e) { /* focus and scrolling are niceties */ } }
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('is-busy');
    if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
  };

  return api(body)
    .then(d => {
      /* A REPLY CARRYING AN ERROR IS A FAILURE, and was being treated as success by anything that
         only checked whether the request went through. */
      /* AND IT IS MARKED `refused` — THE SERVER ANSWERED, AND THE ANSWER WAS NO. A caller can then tell that from a reply that never came: § */
      if (!d || d.error) {
        const refusal = new Error((d && d.error) || 'That did not work.');
        refusal.refused = !!(d && d.error);
        /* AND THE WHOLE REPLY RIDES ON IT, as on `send`'s — a refusal is sometimes a fact for the code as well as a sentence: § */
        refusal.reply = d || null;
        throw refusal;
      }
      done();
      return d;
    })
    .catch(err => {
      done();
      /* THE MESSAGE, NOT THE STACK. And a network failure has none worth reading — `Failed to
         fetch` tells somebody on a train nothing they can act on. */
      /* THROUGH `why_`, so the same sentence appears here and in the banner — the line under the button is where somebody looks, the banner is where text can be § */
      say(typeof why_ === 'function' ? why_(err) : String(err && err.message || err));
      /* Rethrown so a caller can still react, and marked so a caller that does not care can tell
         a handled failure from a bug. */
      err.handled = true;
      throw err;
    });
}
