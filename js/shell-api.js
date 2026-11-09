addEventListener('click', e => {
  if (FLOW_LAYOUT || !WIDE || PRESS_MOVED || PRESS_SLIDING) return;
  /* ---------- A CLICK WITH NO POINTER UNDER IT IS NOT A PRESS BESIDE THE CARD § */
  if (!e.detail) return;
  const t = e.target;
  /* ONLY A PRESS THAT NOTHING IN FRONT TOOK — on the front card it is that card's press. */
  if (t && t.closest && t.closest('#screen .page.on')) return;
  if (!(t && t.closest && t.closest('#screen'))) return;
  const hit = wideHit_(e.clientX, e.clientY);
  if (!hit) return;
  try {
    /* THE PAGE FIRST, while its column is still beside: `goPage` on a column not in front only
       records where it is and places it, and `go` then slides the whole grid once. */
    if (PAGER[hit.id] && hit.p !== (PAGE[hit.id] || 0)) goPage(hit.id, hit.p);
    if (hit.id !== AT) go(hit.id, true);
  } catch (err) { /* a press that moved nothing is the behaviour before this existed */ }
}, true);

/* AND THE POINTER SAYS SO BEFORE THE PRESS. § */
let WIDE_OVER = null, WIDE_OVER_F = 0;
addEventListener('pointermove', e => {
  if (!WIDE || e.pointerType !== 'mouse' || WIDE_OVER_F) return;
  const x = e.clientX, y = e.clientY;
  WIDE_OVER_F = requestAnimationFrame(() => {
    WIDE_OVER_F = 0;
    const onFront = document.elementFromPoint(x, y);
    const hit = onFront && onFront.closest && onFront.closest('#screen .page.on') ? null : wideHit_(x, y);
    const el = hit ? hit.el : null;
    if (el === WIDE_OVER) return;
    if (WIDE_OVER) WIDE_OVER.classList.remove('wide-over');
    WIDE_OVER = el;
    if (el) el.classList.add('wide-over');
    const scr = $('screen');
    if (scr) scr.style.cursor = el ? 'pointer' : '';
  });
}, { passive: true });
/* ---------- LEAVING A WIDE WINDOW TAKES THE HAND AWAY § */
function wideOverClear_() {
  try {
    if (WIDE_OVER) WIDE_OVER.classList.remove('wide-over');
    WIDE_OVER = null;
    const scr = $('screen');
    if (scr) scr.style.cursor = '';
  } catch (e) { /* before this file has finished loading there is nothing to clear */ }
}

/* ---------- A SWIPE THAT BEGAN ON A FIELD OPENS NOTHING AND TICKS NOTHING § */
const FIELD_ACTS_ = 'select, label, summary, input[type="checkbox"], input[type="radio"]';
addEventListener('mousedown', e => {
  if (!PRESS_MOVED && !PRESS_SLIDING) return;
  if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
}, true);

document.addEventListener('click', e => {
  /* FIRST, because a swipe that ends on a tab must not change tab either. */
  if (PRESS_MOVED) {
    PRESS_MOVED = false;
    PRESS_SLIDING = false;
    pressClear_();
    /* AND ON A FIELD, NOT EVEN THE BROWSER'S OWN DEFAULT — see `FIELD_ACTS_` above. */
    if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
    if (CLICK_LOG) console.log('[click] swallowed — the finger moved, so this was a swipe');
    return;
  }
  /* A TAP ON A CARD STILL GLIDING STOPS NOTHING AND PRESSES NOTHING — see `SLIDE_UNTIL`. */
  if (PRESS_SLIDING) {
    PRESS_SLIDING = false;
    pressClear_();
    if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
    if (CLICK_LOG) console.log('[click] swallowed — it began on a card still sliding');
    return;
  }
  pressDone_();
  if (CLICK_LOG) {
    const d = e.target.closest('[data-do]');
    console.log('[click]', {
      pressed: e.target.tagName + (e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''),
      nearestAction: d ? d.dataset.do : '(nothing carries a data-do)',
      handlerRegistered: d ? !!ACTIONS[d.dataset.do] : false,
      /* A select or a checkbox is deliberately handled by `change` instead, so "no handler ran" is
         the right answer for those and not a fault. */
      handledByChange: !!(d && (d.tagName === 'SELECT' || isCheckbox_(d))),
    });
  }
  /* A PRESS ON THE CARD IN FRONT HOLDS IT WHERE IT IS, before the handler below changes it — see
     `HOLD_AT`. After the two swallows above, because a swipe is not somebody using the card. */
  holdHere_(e.target);
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  if (e.target.closest('#sheet-close')) { closeSheet(); return; }

  const doer = e.target.closest('[data-do]');
  /* A SELECT AND A CHECKBOX SPEAK THROUGH `change`, NOT `click`. § */
  if (doer && (doer.tagName === 'SELECT' || isCheckbox_(doer))) return;
  if (doer && ACTIONS[doer.dataset.do]) {
    /* ONE PRESS, ONE ACTION — see `pressAgain_`. */
    if (pressAgain_(doer)) {
      if (CLICK_LOG) console.log('[click] dropped — the same control again, or its request is still out');
      return;
    }
    /* A HEAVY PRESS BY A REAL FINGER WAITS ONE FRAME (720): the pressed mark is painted first, then the work — a chip on Find took 3 s at 4x CPU with nothing drawn. */
    if (e.isTrusted && PRESS_AFTER_PAINT_.has(doer.dataset.do)) { pressAfterPaint_(doer, e); return; }
    pressAct_(doer, e);
  }
});
/* THE ACTIONS WHOSE WORK IS A WHOLE REDRAW (the funnel's answers and chips): `pressAfterPaint_` lets the frame showing the press go first. */
const PRESS_AFTER_PAINT_ = new Set(['facet-pick', 'facet-skip', 'filter-drop', 'filter-clear']);
let PRESS_SOON_ = null;   // the one press waiting for its frame: { el, key }
function pressAfterPaint_(doer, e) {
  const key = pressKey_(doer);
  /* ONE AT A TIME: a second tap in the same frame is the first one's, already on its way. */
  if (PRESS_SOON_) return;
  PRESS_SOON_ = { el: doer, key };
  doer.classList.add('is-pressed');
  requestAnimationFrame(() => setTimeout(() => {
    PRESS_SOON_ = null;
    /* REDRAWN AWAY MEANWHILE (a payload landing): the press was on something no longer there, so nothing is done. */
    if (doer.isConnected) pressAct_(doer, e);
    else if (CLICK_LOG) console.log('[click] dropped — its control was redrawn before its frame came');
  }, 0));
}
function pressAct_(doer, e) {
  const acting = PRESS_ACTING_ = { key: pressKey_(doer), el: doer };
  /* CAUGHT HERE, WHERE THE MESSAGE STILL EXISTS. § */
  try {
    const got = ACTIONS[doer.dataset.do](doer, e);
    if (got && typeof got.then === 'function' && PRESS_ACTING_ === acting) pressOut_(acting.key, doer, got);
  } catch (err) {
    oops_(err, 'act:' + doer.dataset.do);
    toast('That did not work. Everything else still works.');
  } finally { PRESS_ACTING_ = null; }
}

/* Swiping between tabs is further down, with the gesture handling it belongs to — I wrote a second, cruder version here before noticing the first. § */

/* Escape closes the sheet, for anybody on a keyboard. Costs one line and is the first thing
   somebody tries. */
/* ---------- THE ARROW KEYS § */
const ARROWS = { ArrowLeft: ['x', -1], ArrowRight: ['x', 1],
                 ArrowUp: ['y', -1], ArrowDown: ['y', 1] };

addEventListener('keydown', e => {
  /* A [role=button] THAT IS NOT A <button> PRESSES ON ENTER OR SPACE LIKE ONE (561, U15). */
  if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('[role=button][data-do]:not(button)')) {
    e.preventDefault(); e.target.click(); return;
  }
  /* ESCAPE SHUT `#drop` FIRST while there was one. § */
  if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) { closeSheet(); return; }

  const arrow = !FLOW_LAYOUT && ARROWS[e.key];
  if (!arrow) return;
  if (typeof padlocked_ === 'function' && padlocked_()) return;   // the padlock (457)
  /* A modifier means the key belongs to the browser — ⌘← is back, alt+arrow is word-by-word. */
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  /* Typing, or anywhere a caret could be. `isContentEditable` catches the cases a tag name does
     not, which is the sort of thing a list of tag names quietly misses. */
  const t = e.target;
  if (t && (t.isContentEditable
    || /^(input|textarea|select)$/i.test(t.tagName || ''))) return;
  /* The sheet is the page; while it is open the grid is not what these are for. */
  if (!$('sheet').classList.contains('hidden')) return;

  const ax = AXES[arrow[0]];
  if (!ax || ax.count() < 2) return;
  e.preventDefault();
  ax.go(ax.at() + arrow[1]);
});

/* THE EDGES OF THE SCREEN were tappable from here — a second `click` listener that turned to the next card when you pressed the sliver either side. § */

/* ---------- LOADING ------------------------------------------------------------------------------ */
/* WHAT THE APP IS MADE OF WHEN THE BACKEND SAYS NOTHING. § */
async function filesOnly_() {
  try {
    if (DATA && DATA.questions && DATA.questions.length) return;
  } catch (e) { return; }
  const d = {};
  try { await laterFiles_(); } catch (e) { /* never rejects; drawn with what came */ }
  try {
    libraryInto_(d, await libraryRows_());
    libraryExtras_(d, await libraryExtraRows_());
    settingsInto_(d, await settingsRows_());
  } catch (e) { /* a file that did not come is drawn as empty */ }
  /* THE SAME THREE REPAIRS THE PAYLOAD PATH MAKES, because every reader downstream expects them
     and an absent `checklists` is a throw rather than an empty screen. */
  d.questions = d.questions || [];
  d.dropdowns = d.dropdowns || {};
  d.dropdowns.checklists = d.dropdowns.checklists || {};
  /* A PLAIN OBJECT, NOT THE PROXY. § */
  loadRowsClean_(d);
  DATA = d;
  /* THE COLUMNS AND THE ICON ARE IN `data/settings/`, so they are knowable here and are the two
     things that decide what the app looks like before anything is drawn. */
  try { applyColumns_(); } catch (e) { oops_(e, 'shell:filesOnly_') }
  try { applyBrandIcon_(); } catch (e) { oops_(e, 'shell:filesOnly_') }
}

/* The boot reply as JSON, or an error whose message says what arrived instead. See the note in
   `load()` where it is called; `not valid JSON` is the phrase `load()`'s banner listens for. */
async function bootJson_(res) {
  if (!res || typeof res.text !== 'function') return res.json();
  const body = await res.text();
  PAYLOAD_TEXT = body;
  try { return JSON.parse(body); }
  catch (e) {
    /* The page's text rather than its title: an Apps Script error page is titled just "Error". */
    const said = String(body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 160);
    const no = new Error('The reply was not valid JSON (HTTP ' + res.status + ')'
      + (said ? ': ' + said : ': it was empty'));
    /* A WEB PAGE, as against an empty or cut-off reply. § */
    no.page = /^\s*</.test(body);
    throw no;
  }
}

/* A PAYLOAD THAT DID NOT ARRIVE IS ASKED FOR AGAIN BY THE APP, NOT REPORTED TO THE VISITOR. § */
const RECONNECT = {
  timer: 0,        /* the next ask, booked */
  at: 0,           /* when it comes round */
  tries: 0,        /* failures in a row; 0 is "nothing is failing" */
  since: 0,        /* when the first of them happened */
  flying: 0,       /* loads in the air */
  asked: 0,        /* when the last one went */
  due: false,      /* an ask is owed: it came round while nobody was looking or a load was in the air,
                      or a reply was dropped and the person here has no payload of their own */
  seq: 0,          /* every load's number, in the order they went */
  shown: 0,        /* the number of the load whose payload is drawn */
  shownFor: null,  /* and whom it was asked for — `loadWho_` */
  banner: false,   /* the diagnostic is up, put there by this */
  hold: null,      /* the box being typed in, only while a landing payload repaints — `landRepaint_` */
  kept: null,      /* the box a landing payload was not drawn under, until it is left */
};
const RECONNECT_SOON = 3000;
/* THE LADDER, and its last step repeats for as long as the page is open. */
const RECONNECT_STEPS = [10000, 30000, 60000, 120000];
/* "ABOUT TWO MINUTES" — when the line says the plain sentence and an admin is shown why. */
const RECONNECT_TELL = 120000;
/* COMING BACK TO THE PAGE within this long of the last ask is flicking between apps, not an ask. */
const RECONNECT_FLICK = 5000;

function reconnectAdmin_() {
  try {
    return (typeof isAdmin === 'function' && isAdmin())
      || (typeof hasRole === 'function' && hasRole('admin'));
  } catch (e) { return false; }
}
function reconnectSay_(text) {
  const el = document.getElementById('reconnect');
  if (el && el.textContent !== text) el.textContent = text;
}
/* WHETHER THE APP IS ASKING AGAIN BY ITSELF — what `nothingHere` asks before it prints a failure and a
   Try again. A function rather than the object, because nothingHere is above this in the file. */
function reconnecting_() {
  try { return RECONNECT.tries > 0; } catch (e) { return false; }
}
function reconnectBook_(wait) {
  const R = RECONNECT;
  clearTimeout(R.timer);
  R.at = Date.now() + wait;
  R.timer = setTimeout(() => { R.timer = 0; reconnectAsk_('timer'); }, wait);
}
/* A real answer, or a load somebody asked for: nothing booked, nothing said. */
function reconnectStop_() {
  const R = RECONNECT;
  clearTimeout(R.timer);
  R.timer = 0; R.tries = 0; R.since = 0; R.due = false;
  reconnectSay_('');
}
/* AND THE DIAGNOSTIC THIS PUT UP GOES WITH IT — but only while it still says what this put there. A
   banner written since (a missing column, a newer build) is somebody else's, and true. */
function reconnectDone_() {
  const had = RECONNECT.banner;
  RECONNECT.banner = false;
  reconnectStop_();
  const el = document.getElementById('banner');
  if (had && el && /^(Could not reach the backend|The server said)/.test(el.textContent || '')) banner('');
}
/* A LOAD FAILED. Books the next ask, says the quiet line, and answers whether an admin should be shown the diagnostic now. § */
function reconnectFail_(err, how) {
  const R = RECONNECT;
  if (how === 'ours') {
    reconnectStop_();
    R.banner = reconnectAdmin_();
    return R.banner;
  }
  const now = Date.now();
  if (!R.tries) R.since = now;
  R.tries++;
  const timeout = (err && err.name === 'AbortError') || String((err && err.message) || err) === 'timeout';
  const slowest = RECONNECT_STEPS[RECONNECT_STEPS.length - 1];
  let wait = how === 'refused' ? slowest
    : R.tries === 1 ? (timeout ? 0 : RECONNECT_SOON)
    : RECONNECT_STEPS[Math.min(R.tries - 2, RECONNECT_STEPS.length - 1)];
  /* THE ASK THAT WOULD LAND PAST THE TWO-MINUTE MARK IS BROUGHT FORWARD TO IT, so the sentence that
     says it has been two minutes is said at two minutes, and by a failure rather than by a clock. */
  const left = R.since + RECONNECT_TELL - now;
  if (left > 0 && wait > left) wait = left;
  /* WHATEVER WAS OWED IS ANSWERED: this load was the ask, and the next one is booked here. */
  R.due = false;
  reconnectBook_(wait);
  const late = now - R.since >= RECONNECT_TELL;
  const tell = reconnectAdmin_()
    && (how === 'refused' || !!(err && err.page) || location.protocol === 'file:' || late);
  if (tell) R.banner = true;
  /* THE BANNER SAYS IT FOR AN ADMIN, so the line says nothing under it: one statement at a time. */
  reconnectSay_(tell ? '' : late ? 'Can’t reach the server — still trying.' : 'Reconnecting…');
  return tell;
}
function reconnectAsk_(why) {
  const R = RECONNECT;
  if (!R.tries && !R.due) return;               /* nothing is failing, and nothing is owed */
  /* A LOAD IN THE AIR: owed, and asked by `load()`'s `finally` if that one does not settle it. */
  if (R.flying) { R.due = true; return; }
  /* NOBODY IS LOOKING — a tab in the background, a phone in a pocket. Coming back asks at once, so a
     backend that is down all afternoon is not asked every two minutes by a tab nobody has open. */
  if (document.hidden) { R.due = true; return; }
  /* FLICKING BETWEEN APPS IS NOT FIVE ASKS — but the ask is only put off to the end of the five seconds, never left to a rung two minutes away. § */
  if (why === 'back' && !R.due && Date.now() - R.asked < RECONNECT_FLICK) {
    const end = R.asked + RECONNECT_FLICK;
    if (!R.timer || R.at > end) reconnectBook_(Math.max(0, end - Date.now()));
    return;
  }
  clearTimeout(R.timer);
  R.timer = 0; R.due = false;
  load(true);
}
addEventListener('online', () => reconnectAsk_('online'));
document.addEventListener('visibilitychange', () => { if (!document.hidden) reconnectAsk_('back'); });

/* ---------- WHOM A LOAD WAS ASKED FOR § */
function loadWho_() {
  const q = [];
  if (USER && USER.personId) q.push('person=' + encodeURIComponent(USER.personId));
  if (USER && USER.name) q.push('name=' + encodeURIComponent(USER.name));
  if (USER && USER.token) q.push('token=' + encodeURIComponent(USER.token));
  return q.length ? '?' + q.join('&') : '';
}
/* ---------- IS THIS REPLY STILL THE ANSWER § */
function loadStale_(n, who) {
  const R = RECONNECT;
  const now = loadWho_();
  if (who === now && n > R.shown) return false;
  if (R.shownFor !== now) R.due = true;
  return true;
}

/* ---------- A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN § */
/* ---------- AND NOT THE SELECT WHOSE LIST IS OPEN EITHER § */
const TYPING_ = 'textarea, input[type="text"], input[type="search"], input[type="email"], '
  + 'input[type="tel"], input[type="number"], input:not([type]), [contenteditable="true"], select';
function typingBox_() {
  const a = document.activeElement;
  if (!a || !a.matches || !a.matches(TYPING_)) return null;
  const s = a.closest ? a.closest('.screen') : null;
  const id = s ? String(s.id).replace(/^s-/, '') : '';
  /* A FINDER HOLDS ITS OWN TYPING (`findKeep_`) — but not a widget's box on a Find card (790), which is held here as a column's was. */
  const finder = typeof finderOf_ === 'function' ? finderOf_(id) : id === 'stuff';
  return finder && !(a.closest && a.closest('.widget-slot')) ? null : a;
}
/* `draw` IS ANY OTHER REPAINT THAT A LANDING REPLY MAKES — `profileRefresh_` (me.js) drawing your own settings once per app open is the other one, and it rebuilt § */
function landRepaint_(draw) {
  const R = RECONNECT;
  R.hold = typingBox_();
  /* A LANDING MARKS `'maybe'`, not 1 — see the note over `STALE`: a column it marks is drawn again, and
     written only if what it would draw differs from what it holds. */
  REPAINT_MARK = 'maybe';
  try { (typeof draw === 'function' ? draw : repaint)(); } finally { R.hold = null; REPAINT_MARK = 1; }
  DRAW_EPOCH++;
  if (typeof aheadKick_ === 'function') aheadKick_();
}
/* `paint` asks this beside `settingsKeep_` and `findKeep_`, and `startScreen_` before it restarts
   anything. In a `try`, because both are hoisted and this const is not. */
function reconnectKeep_(id) {
  try {
    const box = RECONNECT.hold;
    if (!box || document.activeElement !== box) return false;
    const host = document.getElementById('s-' + id);
    if (!host || !host.contains(box)) return false;
    RECONNECT.kept = box;
    return true;
  } catch (e) { return false; }
}
/* AND DRAWN WHEN IT IS LEFT — a moment after, so a tap from one box to the next in the same column
   (focusout, then focusin) finds the next box focused and waits on that one instead. */
document.addEventListener('focusout', () => {
  if (!RECONNECT.kept) return;
  setTimeout(() => {
    const box = RECONNECT.kept;
    if (!box) return;
    const a = document.activeElement;
    if (a === box && box.isConnected) return;
    const host = box.isConnected && box.closest ? box.closest('[id^="s-"]') : null;
    if (host && a && a !== box && host.contains(a) && a.matches && a.matches(TYPING_)) { RECONNECT.kept = a; return; }
    RECONNECT.kept = null;
    /* REDRAWN SINCE — a press, or arriving — and there is nothing left to do. */
    try { if (host && host.id === 's-' + AT && STALE[AT]) repaint(); } catch (e) { oops_(e, 'shell:reconnectKeep_') }
  }, 400);
});

/* THE LOAD, AS EVERY CALLER ASKS FOR IT. `again` is the retry above and nothing else passes it: any
   other caller is somebody signing in, saving, or pressing Try again, and that starts the count over. */
/* NON-ROWS DROPPED AND COUNTED, reported once as one line: a null in the sheet must not blank nine columns. */
function loadRowsClean_(d) {
  let gone = {};
  try { gone = dataRowsClean_(d); } catch (e) { oops_(e, 'load:clean'); return; }
  const keys = Object.keys(gone);
  if (keys.length) oops_(new Error(keys.map(k => k + ' ' + gone[k]).join(', ') + ' malformed row(s) dropped'), 'load:rows');
}
async function load(again) {
  const R = RECONNECT;
  if (!again) reconnectStop_();
  /* THE DEVICE'S COPY FIRST, once a visit (1070): drawn while the network is asked; a newer load's answer makes it stale. */
  if (!again && !PAYLOAD_KEPT_TRIED) {
    PAYLOAD_KEPT_TRIED = true;
    const kept = payloadKept_();
    if (kept) loadOnce_(false, ++R.seq, kept).catch(() => {});
  }
  R.asked = Date.now();
  R.flying++;
  try { await loadOnce_(again, ++R.seq); }
  finally {
    R.flying--;
    /* THE ASK THAT WAITED FOR THIS ONE — see `due`. Not while another is still in the air: the last
       to land makes it, so two that land together are still one ask. */
    if (!R.flying && R.due) reconnectAsk_('owed');
  }
}

/* `DATA` IS THE PAYLOAD BEHIND A PROXY that counts the keys read and never sent (`missingKeys`). A new proxy on the library's arrival is a new `DATA`, so every memo keyed on it starts again. */
function dataProxy_(d) {
  return new Proxy(d, {
    get(t, k) {
      /* `then` is asked for by anything that awaits an object, to find out whether it is a promise. Not a missing key. */
      if (typeof k === 'string' && !(k in t) && k !== 'then') MISSING_KEYS[k] = (MISSING_KEYS[k] || 0) + 1;
      return t[k];
    }
  });
}
/* THE LIBRARY AFTER THE PAYLOAD (670): merged into the same rows once both files are in, then Find draws, and the question a reload left is reopened. */
let LIBRARY_FOR = null;
async function libraryLate_(d) {
  try {
    const rows = await libraryRows_(), extra = await libraryExtraRows_();
    await libraryQuiet_();
    if (LIBRARY_FOR !== d) return;   /* a newer payload took its place, and merged the library itself */
    libraryInto_(d, rows);
    libraryExtras_(d, extra);
    loadRowsClean_(d);
    DATA = dataProxy_(d);
  } catch (e) { /* a malformed library row is what the payload path always swallowed: Find draws with what merged */ }
  LIBRARY_LATE = false;
  if (LIBRARY_FAILED) banner('The questions did not load — ' + LIBRARY_FAILED + '. Everything else is here; reload the page to try again.');
  /* THE CARRY-OVER WAITS FOR THE QUESTIONS (`subMigrate_`, submit.js), so it runs again now they are here. */
  try { if (typeof finderForgetFound_ === 'function') finderForgetFound_(); if (typeof subMigrate_ === 'function') { subMigrate_(); subPush_(true); } landRepaint_(); if (!LOAD_FAILED && typeof findPlaceBack_ === 'function') findPlaceBack_(); }
  catch (e) { oops_(e, 'load:library-paint'); }
  setTimeout(shapeSave_, 4000);
}

/* WHETHER A GOOD PAYLOAD HAS EVER BEEN PAINTED — see the end of `load()`. */
let FIRST_PAINT_DONE = false;
async function loadOnce_(again, n, kept) {
  /* THE REPLY ARRIVED AND WAS DATA — so a throw after this is our own code, not the connection. */
  let reached = false;
  /* AND IT BECAME `DATA` — the one outcome a retry repaints for. */
  let got = false;
  /* WHOM IT IS ASKED FOR, kept to check the reply against — see `loadStale_`, and the note below on
     why each of the three keys is sent. */
  const who = loadWho_();
  try {
    /* The person's id goes with the request so the server can say which posts YOU liked — it
       cannot know otherwise, and sending every like to every phone to answer it would be absurd. */
    /* AND THE NAME, which is a different question from the id and was never being asked. § */
    /* ---------- AND THE TOKEN, WHICH IS THE ONLY ONE OF THE THREE THAT PROVES ANYTHING § */
    /* ALL THREE ARE BUILT BY `loadWho_` — `who`, at the top of this function. */
    /* NO CACHE, AND A DIFFERENT URL EVERY TIME. § */
    let d; if (kept) { d = kept; window.PAYLOAD_KEPT = true; } else {
    d = await loadFetch_(who);
    reached = true;
    /* WHAT THE SLOW BOX ASKS (index.html): the backend has answered, so whatever is left is ours and bounded. */
    window.PAYLOAD_IN = true; }
    /* THE ANSWER TO A QUESTION NOBODY IS ASKING ANY MORE — for somebody who has signed out or been signed in over since it went, or older than a payload already § */
    if (loadStale_(n, who)) return;
    /* KEPT ONLY ONCE IT IS STILL THIS PERSON'S (1070): a stale answer for someone who signed out must never be filed under whoever is here now. */
    if (!kept) payloadOwe_(d);
    if (d && !d.error) {
      /* WHAT WAS ASKED FOR AND NOT SENT. § */
      /* AND THE STARS THE SHEET KNOWS ABOUT — see `adoptFavourites_`. Called here rather than in
         `find.js` because this is the moment a payload becomes DATA, and a favourite read before
         that is the last device's guess. */
      /* ---------- THE LIBRARY, MERGED IN BEFORE THIS BECOMES `DATA` § */
      /* ---------- NOT `d = ...`, AND THAT LINE HAD BEEN THROWING ON EVERY LOAD § */
      /* THE CODE THE FIRST SCREEN DID NOT NEED (670) is in before anything draws from the payload. */
      if (!(await loadTakeData_(d, n, who))) return;
      got = true;
      RECONNECT.shown = n; RECONNECT.shownFor = who;
      /* THE MESSAGES CAME WITH IT (700), so the DMs column is drawn with the rest, not one cold round trip later. */
      if (typeof dmAdopt_ === 'function') dmAdopt_(d);
      /* AND THE SHAPE THE COLUMNS LANDED IN, for the next visit's wait (700). */
      setTimeout(shapeSave_, 4000);
      /* THE STARS AND THE SPOTLIGHTS, from the payload that has just landed. § */
      adoptMarks_();
      /* BEFORE THE ICON AND BEFORE ANYTHING IS DRAWN. `applyColumns_` can change which screen you
         are on, and everything painted after it reads `AT`. */
      applyColumns_();
      applyBrandIcon_();
      /* ---------- THE WATCHDOG'S MESSAGE IS NOT TRUE ANY MORE § */
      if (!kept) loadNotices_(d);   /* a kept copy says nothing new (1070): banners, messages and settings wait for the network */
    }
    else {
      LOAD_FAILED = String(d.error || 'the server refused the request');
      /* THE FILES STILL STAND -- see `filesOnly_`. A refusal from the backend is not a reason for
         a student to lose the paper they are working through. */
      await filesOnly_();
      /* ASKED AGAIN, EVERY TWO MINUTES — doGet's catch-all answers ANY exception this way, and the client cannot tell a throw that will pass from a refusal that will § */
      if (reconnectFail_(null, 'refused')) banner('The server said: ' + (d.error || 'something went wrong'));
    }
  } catch (err) {
    /* A FAILURE IS STALE THE SAME WAY — it would put the quiet line back over a payload that came. Not
       once the payload is `DATA`: a throw after that is this load's own, and this load is current. */
    if (!got && loadStale_(n, who)) return;
    LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
    await filesOnly_();
    /* ASKED AGAIN, AND SAID QUIETLY — see `RECONNECT`. What follows is the diagnostic, and it is drawn
       only when `reconnectFail_` says an admin should see it now. */
    /* WHICH URL IT TRIED, as something you can press. § */
    if (reconnectFail_(err, reached ? 'ours' : 'way')) loadFailBanner_(err, reached);
  }
  /* A RETRY THAT BROUGHT NO PAYLOAD CHANGED NOTHING — failed on the way, or refused: § */
  if (again && !got && LOADED && reconnecting_()) return;
  loadFinish_(kept);
}

/* THE REQUEST ITSELF, under its deadlines: the reply parsed, or a throw for the catch in `loadOnce_`. */
async function loadFetch_(who) {
    const bust = (who ? '&' : '?') + '_=' + Date.now();
    /* THE SLOW-LOAD LINE STARTS ITS CLOCK HERE, beside the request it is about, rather than at boot:
       this is the moment the app begins waiting, and it is the only moment worth timing from. */
    /* ---------- AND AT THE SAME MOMENT, COME UP ON THE FILES § */
    clearTimeout(earlyTimer);
    earlyTimer = setTimeout(() => {
      if (LOADED) return;
      filesOnly_().then(() => {
        if (LOADED) return;
        try { repaint(); } catch (e) { oops_(e, 'shell:loadOnce_') }
      }).catch(() => {});
    }, EARLY_AFTER);
    /* ---------- A DEADLINE, BECAUSE A REQUEST THAT NEVER ANSWERS IS THE WORST FAILURE § */
    let bell;
    const deadline = new Promise((unused, no) => {
      bell = setTimeout(() => {
        const e = new Error('timeout');
        e.name = 'AbortError';
        no(e);
      }, 60000);
    });
    /* ---------- THE ONE THE HEAD ALREADY STARTED § */
    const early = window.BOOT_GET || null;
    window.BOOT_GET = null;
    let res;
    try {
      /* FROM A FILE, ASK A DIFFERENT WAY. `fetch` is refused outright by a page with no origin;
         a script tag is not. Served properly — Live Server, GitHub Pages — `fetch` is better in
         every way and this stays out of the way. */
      res = await Promise.race([
        early
          ? early.then(r => (r && r.ok ? r : (location.protocol === 'file:'
              ? jsonp(API + who + bust)
              : fetch(API + who + bust, { cache: 'no-store' }))))
          : location.protocol === 'file:'
          ? jsonp(API + who + bust)
          : fetch(API + who + bust, { cache: 'no-store' }),
        deadline]);
    } finally {
      /* Cleared whichever way it went, or a load that answered at 59 seconds leaves a timer running
         to reject a promise nobody is holding. */
      clearTimeout(bell);
    }
    /* JSONP HANDS BACK THE VALUE ITSELF — a script tag delivers a value, not a reply, so there is nothing to unwrap. § */
    if (res && res.__jsonp) {
      const got = res.__jsonp;
      res = { ok: true, status: 200, statusText: 'OK', json: () => got };
    }
    /* ---------- READ AS TEXT, THEN PARSE, so a web page says what it is § */
    /* THE BODY UNDER A DEADLINE TOO (503): the 60 seconds above covered the headers only. */
    let bodyBell;
    return await Promise.race([bootJson_(res), new Promise((u, no) => { bodyBell = setTimeout(() => no(new Error('timeout')), 60000); })])
      .finally(() => clearTimeout(bodyBell));
}

/* THE PAYLOAD BECOMES `DATA`, library and settings merged in first; false when it went stale on the way. */
async function loadTakeData_(d, n, who) {
      await laterFiles_();
      /* FEED FIRST (670): a library not yet here is merged after the payload is painted, and only Find waits for it (`LIBRARY_LATE`). */
      const late = !libraryHere_();
      try {
        if (!late) {
          libraryInto_(d, await libraryRows_());
          /* THE OTHER THREE TABS, WHICH MAY STILL BE EMPTY. § */
          libraryExtras_(d, await libraryExtraRows_());
        }
        /* AND THE SETTINGS TABS, ON THE SAME RULE; their own small fetch, so the columns and words never wait for the library. */
        settingsInto_(d, await settingsRows_());
      } catch (e) { /* the repairs below make an empty library a working one */ }
      d.questions = d.questions || [];
      d.dropdowns = d.dropdowns || {};
      d.dropdowns.checklists = d.dropdowns.checklists || {};
      /* AND ASKED AGAIN AT THE MOMENT IT BECOMES `DATA`. § */
      if (loadStale_(n, who)) return false;
      loadRowsClean_(d);
      DATA = dataProxy_(d);
      LIBRARY_LATE = late;
      LIBRARY_FOR = d;
      if (late) libraryLate_(d);
      LOAD_FAILED = '';
      return true;
}

/* WHAT A FRESH (NOT KEPT) PAYLOAD HAS TO SAY: banners, messages, settings, missing features. */
function loadNotices_(d) {
      if (LOAD_SLOW) banner('');
      /* AND THE ASKING-AGAIN STOPS — the quiet line goes, and an admin's diagnostic with it. Here, for
         the same reason as the line above: before the checks below write anything of their own. */
      reconnectDone_();
      /* WHAT THE BACKEND CAN DO, against what this site needs. § */
      /* A payload that could not write something — the schema check ran and a column is still
         missing. Said on load rather than waiting for somebody to try to save into it. */
      if (d.unwritten && d.unwritten.length) {
        banner('The sheet is missing columns: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + '. Anything saved to them is discarded.');
      }
      /* ---------- AND THE QUESTION FILE, WHICH FAILS SEPARATELY AND USED TO FAIL SILENTLY § */
      if (LIBRARY_FAILED && !LIBRARY_LATE) {
        banner('The questions did not load — ' + LIBRARY_FAILED
          + '. Everything else is here; reload the page to try again.');
      }

      /* ---------- THE MESSAGE WIDGETS COULD NOT EXIST UNTIL YOU OPENED THE MESSAGE SCREEN § */
      if (USER && typeof loadMessages === 'function') {
        loadMessages().then(() => { try { landRepaint_(); } catch (e) { oops_(e, 'shell:loadOnce_') } });
      }
      /* AND YOUR OWN SETTINGS, AS THE SHEET HOLDS THEM — see `profileRefresh_` in me.js. § */
      if (USER && typeof profileRefresh_ === 'function') profileRefresh_();
      /* NO BANNER FOR A VERSION MISMATCH ANY MORE. § */
      /* `editResource` AND `deleteResource` WERE IN THIS LIST. § */
      const NEEDS = ['editPost', 'deletePost'];
      const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
      if (missing.length) {
        /* THE VERSION IT ACTUALLY REACHED, said out loud. § */
        banner('The backend at this URL is ' + (d.version || 'an unknown version')
             + ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
             + 'this site is pointed at the wrong one — check the id in API against the '
             + 'Deployment ID in Manage deployments.');
      }
}

/* THE ADMIN'S DIAGNOSTIC for a load that failed: which URL, and advice that matches the fault. */
function loadFailBanner_(err, reached) {
    const el = $('banner');
    if (el) {
      el.classList.remove('hidden');
      /* NOT A DOOR. `banner(msg, true)` makes the whole bar a "tap to load the new build", and this writes its own markup over it — found by review: § */
      el.removeAttribute('data-do');
      /* THE ADVICE MATCHES THE FAULT. § */
      const msg = String((err && err.message) || err || '');
      const why = /Unexpected token|not valid JSON/.test(msg)
        /* A reply arrived and it was a web page. § */
        ? 'The backend answered with a web page instead of data. Open it in a tab and read what '
          + 'it says — “Authorization is required” means the scopes changed and nobody has '
          + 'consented yet: run authoriseDrive from the Apps Script editor, accept the prompt with '
          + 'every box ticked, and deploy a new version once its last line says READY.'
        /* ---------- A PAGE OPENED FROM A FILE CANNOT REACH ANYTHING § */
        : location.protocol === 'file:'
        ? 'This page was opened from a file, so the browser blocked the request before it left — '
          + 'that is what “Failed to fetch” in no time at all means, and nothing is wrong with the '
          + 'backend. Serve the folder instead: in VS Code, right-click index.html → Open with '
          + 'Live Server. The address then starts http:// and everything works.'
        : /Failed to fetch|NetworkError|Load failed/.test(msg)
        /* Served properly and still nothing arrived — so now it IS the address or the access. */
        ? 'The reply never arrived, so this URL is not being served. Check Manage deployments: the '
          + 'one under ACTIVE is the only one that answers, an archived id looks exactly like '
          + 'this, and “Only myself” access does too.'
        /* ---------- THE DEADLINE, WHICH WAS FILED UNDER "SOMETHING ELSE" § */
        : /^timeout$/.test(msg)
        ? 'The backend took longer than a minute, again and again. One slow answer is a payload '
          + 'built cold (after clearPayloadCache) and the next ask gets the copy it kept; minutes of '
          + 'them is the script itself — open it in a tab and see how long it takes.'
        : 'Something else went wrong on the way.';
      el.innerHTML = 'Could not reach the backend.' + (reached ? '' : ' Still trying by itself.') + '<br>'
        + '<span class="faint">' + esc(why) + '</span><br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — the page itself will say which it is.<br>'
        + '<span class="faint">' + esc(msg)
        + ' · site ' + esc(SITE_VERSION) + ' · css ' + esc(cssVersion()) + '</span>';
    }
}

/* A LOAD FINISHED, whether it succeeded or failed: the loader goes and every screen is drawn. */
function loadFinish_(kept) {
  LOADED = true;
  /* THE FIRST LOAD IS DONE, said on `<html>` for whatever waits on it; nothing on screen changes. */
  bootLoaded_(true);
  /* THE ADMIN'S FRONT DOOR (489, layout.js), once the layout has come with the payload. */
  try { if (typeof frontGo_ === 'function') frontGo_(); } catch (e) { oops_(e, 'shell:loadOnce_') }
  /* ---------- THE STALE SCREENS, CLEARED BEFORE THE REDRAW § */
  /* ---------- ONCE, NOT ON EVERY LOAD § */
  /* ---------- AND NOT EMPTIED AT ALL ANY MORE — THE GLASS IS DRAWN, THE REST IN THE QUIET AFTER IT § */
  const first = !FIRST_PAINT_DONE && !LOAD_FAILED;
  if (first) TABS.forEach(t => { if (t.id !== AT && screenHasMarkup_(t.id)) PRE_PAYLOAD.add(t.id); });
  if (!LOAD_FAILED) FIRST_PAINT_DONE = true;
  /* AND THE WHOLE SEQUENCE, in the one order it may happen in — see `repaint`. Around the box somebody
     is typing in, if they are: see `landRepaint_`. */
  landRepaint_();
  /* THE FIRST PAYLOAD IS A FACT, NOT A MAYBE — every column holding the boot's markup is drawn from it. */
  if (first) {
    PRE_PAYLOAD.forEach(id => { if (STALE[id]) STALE[id] = 1; });
    GLASS.cols.forEach(id => {
      if (id === AT || !STALE[id]) return;
      paint(id);
      if (!STALE[id]) { PRE_PAYLOAD.delete(id); if (PAGER[id]) paintPager(id, true); }
    });
    aheadOpen_(); if (kept) payloadFind_();
  }
  openSharedPost();     // if the app was opened on a shared link, go to that post
  try { openSharedTutor(); } catch (e) { oops_(e, 'shell:loadOnce_') }   // or on a tutor's own link (400)
  try { if (typeof pushLanding_ === 'function') pushLanding_(); } catch (e) { oops_(e, 'shell:loadOnce_') }   // or on a tapped notification (492, push.js)
  /* AND BACK TO THE QUESTION A RELOAD TOOK YOU AWAY FROM — once a visit, on the first payload that
     arrived, when the column came back too. See `findPlaceBack_` in find.js and docs/history/317. */
  if (!LOAD_FAILED && !LIBRARY_LATE && typeof findPlaceBack_ === 'function') findPlaceBack_();
}

/* ---------- NO SPLASH (466): THE APP IS ON SCREEN FROM THE FIRST FRAME */
/* `html.is-loaded` says the first load finished, for a check to wait on; it covers nothing. */
const EARLY_AFTER = 15000;
/* The one that draws the app on its files when the backend is slow -- see `load`. */
let earlyTimer = null;
function bootLoaded_(on) {
  clearTimeout(earlyTimer);
  try { document.documentElement.classList.toggle('is-loaded', !!on); } catch (e) { oops_(e, 'shell:bootLoaded_') }
  /* THE SLOW BOX GOES WHEN THE WAIT ENDS (503): `banner('')` hid #banner, never this, so a 31-second backend left it up for good. */
  if (on) try { const b = $('boot-slow'); if (b) { b.className = 'hidden'; b.textContent = ''; } } catch (e) { /* the slow-start note is only a hint */ }
}
/* THE OLD SPLASH'S KEPT DRAWINGS (up to 1.5 MB) OUT OF THE STORE: nothing reads them since 466. True when anything went. */
function splashForget_() {
  const gone = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'splashAnims' || k === 'splashOff' || k.indexOf('splashAnim:') === 0)) gone.push(k);
    }
    gone.forEach(k => localStorage.removeItem(k));
  } catch (e) { /* storage blocked: old splash keys stay, unread */ }
  return gone.length > 0;
}

/* A BANNER IS WORDS ONLY: the one tap it ever carried, "load the new version", is gone (610). */
function banner(msg) {
  const el = $('banner');
  if (!msg) { el.classList.add('hidden'); el.removeAttribute('data-do'); return; }
  el.textContent = msg;
  el.removeAttribute('data-do');
  el.classList.remove('hidden');
}

