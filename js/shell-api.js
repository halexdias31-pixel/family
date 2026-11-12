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
/* THE THREE REPAIRS EVERY READER DOWNSTREAM EXPECTS: an absent `checklists` is a throw rather than an empty screen. */
function loadRepairs_(d) {
  d.questions = d.questions || [];
  d.dropdowns = d.dropdowns || {};
  d.dropdowns.checklists = d.dropdowns.checklists || {};
}

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
  loadRepairs_(d);
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
  const finder = findIs_(id);
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
    try { if (isAtHost_(host) && STALE[AT]) repaint(); } catch (e) { oops_(e, 'shell:reconnectKeep_') }
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

