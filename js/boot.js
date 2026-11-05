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
  try { placeCells('x', true); } catch (err2) { oops_(err2, 'boot:top') }
}

/* THE REST OF THE CODE FIRST (670), then the payload's wait and the library share the wire with nothing the first screen needs. */
try { laterFiles_(); } catch (e) { /* load() asks again */ }
load();
/* THE LIBRARY ONCE THE FIRST SCREEN IS UP (630), not from the head, where it held the code back; `load()` waits on these same promises. */
/* THE SETTINGS AT ONCE (a few KB the payload's columns need); THE LIBRARY BEHIND THE LATER CODE (670), so its megabyte never holds the feed's code back. */
try { settingsRows_(); laterFiles_().then(() => { try { libraryRows_(); libraryExtraRows_(); } catch (e) { /* load() asks again */ } }); } catch (e) { /* load() asks again and says what failed */ }
/* AND THE REST WHEN THE PHONE IS IDLE (466), so the first screen answers a tap at once: what needs no payload (`aheadPreOpen_`), and the old splash's store. */
const bootIdle_ = f => { try { (window.requestIdleCallback || (g => setTimeout(g, 1)))(() => { try { f(); } catch (e) { /* an idle job that fails leaves the screen as drawn */ } }, { timeout: 2000 }); } catch (e) { /* no idle callback: the job is skipped, nothing waits on it */ } };
bootIdle_(() => aheadPreOpen_());
bootIdle_(() => splashForget_());

/* ---------- AND FROM HERE ON, WHETHER THIS IS STILL THE CURRENT BUILD § */
try { watchBuild_(); } catch (e) { oops_(e, 'boot:top') }

/* ---------- AND AN ACCOUNT ARRIVING FROM ITS CONFIRMATION EMAIL § */
try { verifyFromLink_(); } catch (e) { oops_(e, 'boot:top') }
/* AND `?signin=<key>`, the link in a forgotten-PIN email — see `pinFromLink_` in me.js. Same reasons. */
try { pinFromLink_(); } catch (e) { oops_(e, 'boot:top') }
/* AND `?paid=1&ref=…`, a card payment coming back from Stripe — see `paidFromLink_` in me.js (430). */
try { paidFromLink_(); } catch (e) { oops_(e, 'boot:top') }
