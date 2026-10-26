/* @family. — boot.js ONE FILE, SPLIT. § */


/* AND GO. THE LAST LINES IN THE FILE, deliberately. § */
try {

  go(AT, false);
} catch (err) {
  /* Drawing failed. There is no point asking the backend for data to put in a screen that could
     not be built, so `load` is not called — the message stays on screen instead of being replaced
     by a network error a moment later. */
  bootFailed(err, 'drawing the first screen');

  /* AND THEN CARRY ON AS FAR AS IT CAN. § */
  try { placeCells('x', true); } catch (err2) {}
}

load();
/* AND THE REST WHEN THE PHONE IS IDLE (466), so the first screen answers a tap at once: what needs no payload (`aheadPreOpen_`), and the old splash's store. */
const bootIdle_ = f => { try { (window.requestIdleCallback || (g => setTimeout(g, 1)))(() => { try { f(); } catch (e) {} }, { timeout: 2000 }); } catch (e) {} };
bootIdle_(() => aheadPreOpen_());
bootIdle_(() => splashForget_());

/* ---------- AND FROM HERE ON, WHETHER THIS IS STILL THE CURRENT BUILD § */
try { watchBuild_(); } catch (e) {}

/* ---------- AND AN ACCOUNT ARRIVING FROM ITS CONFIRMATION EMAIL § */
try { verifyFromLink_(); } catch (e) {}
/* AND `?signin=<key>`, the link in a forgotten-PIN email — see `pinFromLink_` in me.js. Same reasons. */
try { pinFromLink_(); } catch (e) {}
/* AND `?paid=1&ref=…`, a card payment coming back from Stripe — see `paidFromLink_` in me.js (430). */
try { paidFromLink_(); } catch (e) {}
