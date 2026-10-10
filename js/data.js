/* ==================================================================================================
   @family. — data.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   data.js is number 4 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ================================================================================================
   @family. — the shell.

   Not the whole app: the RUNTIME the screens are built on. Tabs, screen switching, the sheet, the
   toast, and the one place a screen is registered.

   The point of doing this first is that every screen after it is small. A screen becomes a
   function that returns markup and says what its header should read — it never touches the tab
   bar, never hides another screen, and never has an opinion about the sheet.
================================================================================================ */

/* ---------- WHERE THE DATA COMES FROM -----------------------------------------------------------
   THE ONE LINE THAT DECIDES WHETHER ANY OF THIS WORKS, and the one that went wrong for a week.

   Apps Script has two ways to publish. "Manage deployments → pencil → New version" updates the
   deployment already here. "New deployment" makes a SECOND one with a DIFFERENT id — and then
   every version you push lands on a URL nothing is calling, while this line goes on asking the
   old one. From the outside that is indistinguishable from the code not working: the editor says
   deployed, the sheet is right, and the site answers as it did yesterday.

   IT MUST BE THE ONE UNDER "ACTIVE" IN MANAGE DEPLOYMENTS. There is exactly one, and everything
   else in that list is Archived — an archived deployment is not served at all, so a URL pointing
   at one fails before it reaches any code. That is what "Failed to fetch" was: not a wrong
   character, not an access setting, a dead address.

   The two mistakes that produced it, so neither is repeated:
     · "New deployment" makes a SECOND URL rather than updating this one. Every version pushed
       that way lands somewhere the site is not calling. Use the PENCIL on the Active row and
       choose Version: New version.
     · An id that used to work is not evidence it still exists. The Active list is the evidence.

   To change it: Manage deployments → Active → the Copy button under the Web app URL. COPY IT,
   NEVER TYPE IT, and never read it off a screen. Seventy-two characters, and the one that went
   wrong here was position 22: a lowercase L read as a capital I. In this font they are the same
   vertical stroke, the URL is valid, the request goes out, and what comes back is "Failed to
   fetch" — which is also what a dead deployment and a private one look like. Three faults, one
   symptom, and no way to tell them apart from inside the app.
--------------------------------------------------------------------------------------------- */
const API = 'https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec';

/* WHICH VERSION OF THE SITE THIS IS.
   The backend has had one since the beginning and the site has not, which is why "the backend is
   older than the site" could be diagnosed in ten seconds and "the site is older than the site"
   could not. GitHub Pages takes a minute to publish and a browser caches script.js for far longer,
   so a fix can be committed, pushed and live while the phone in your hand is still running last
   week's. Nothing said so, and there was no way to ask.

   Bumped whenever this file changes. Shown on the You screen and in every failure banner. */
/* THIS SAID `2026-08-08-wiring` FOR A WEEK OF CHANGES. `index.html` has a `LOAD` string that I have
   been bumping all along, and it is a cache-buster, not a version — so the You screen went on
   reporting a build from six days ago while everything under it changed. Which makes the one place
   you look to answer "is my frontend current" answer it wrongly, and that is worse than not
   showing it at all: twice today we chased a fault that was a file not yet pasted in. */
/* MEASURED, NOT TYPED. `SITE_STAMP` is set in index.html from the moment GitHub Pages last built
   the site — see the long note there. The fallback is only for a page opened straight off the
   filesystem, where there is no build to ask about. */
const SITE_VERSION = window.SITE_STAMP || 'local';

/**
 * WHICH STYLESHEET IS RUNNING.
 *
 * Read from a custom property `style.css` sets on :root. Without it the site could report its own
 * script version and its backend version and say nothing at all about its CSS — so a rule that had
 * been changed and a rule that had not arrived looked identical, and the only way to tell was to
 * ask somebody to hard refresh and try again.
 *
 * An empty answer means the stylesheet predates this, which is itself the answer.
 */
function cssVersion() {
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--css-version').trim().replace(/^["']|["']$/g, '');
    return v || '(older than versioning)';
  } catch { return '(unknown)'; }
}

let DATA = {};

/* ---------- ASKING BY SCRIPT TAG, FOR A PAGE THAT HAS NO ORIGIN ------------------------------------
   A PAGE OPENED FROM A FILE CANNOT FETCH. Double-click index.html and the browser gives it the
   origin `null`, and any request to another address is refused before a single byte leaves —
   instantly, with "Failed to fetch" and no network involved at all. Nothing at the far end is asked,
   so nothing at the far end can be wrong, and every symptom looks like a dead backend.

   A <script> TAG IS NOT SUBJECT TO THAT. It has been allowed to load from anywhere since the web
   began, which is what this is: the same reply, wrapped in a call to the function named here,
   delivered as a script rather than as data. Ancient, and the one thing that works from a file.

   THE NAME IS UNIQUE PER CALL, so two requests in flight cannot land in one another's handler, and
   it is removed the moment it fires — a global left behind is a global something else will find.

   WHAT IT CANNOT DO: a script tag is a GET. Every action — booking, saving, posting — is a POST, and
   no trick makes a POST leave a file:// page. So this restores READING from a file, and writing
   still needs the page served. Worth knowing before somebody tries to book something. */
function jsonp(url) {
  return new Promise((ok, no) => {
    const name = '__fam' + Date.now() + Math.floor(Math.random() * 1000);
    const tag = document.createElement('script');
    const done = () => { delete window[name]; tag.remove(); };
    window[name] = d => { done(); ok({ __jsonp: d }); };
    /* A script that 404s fires `onerror`, which is the one thing this route can report: it cannot
       see a status code, so "the address did not load" is all there is to say. */
    tag.onerror = () => { done(); no(new Error('the backend did not load as a script')); };
    tag.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + name;
    document.head.appendChild(tag);
  });
}

/* THE KEYS THE SITE ASKS FOR AND THE BACKEND DOES NOT SEND.
   Filled by the wrapper around DATA in `load`. Every silent fault this app has had has been one of
   these: a name written on one side and read on the other, with nothing in between able to tell.
   Tap through every screen once and then type `missingKeys()` into the console — it lists all of
   them at once, and there is no test to write and no list to keep in step. */
let MISSING_KEYS = {};
function missingKeys() {
  const ks = Object.keys(MISSING_KEYS);
  if (!ks.length) { console.log('Nothing has been asked for that the backend did not send.'); return {}; }
  console.table(MISSING_KEYS);
  return MISSING_KEYS;
}
let USER = null;

/* HAS THE FIRST LOAD COME BACK? Separate from "are there any posts" — the loader and an empty state
   answer different questions, and showing the wrong one makes the app look broken in the first
   second anybody sees it.
   HERE, WITH THE REST OF THE STATE, and not in me.js where it used to be: posts.js reads it and
   shell.js writes it, and neither has anything to do with the You screen. It worked only because
   me.js happens to be listed before posts.js in index.html — a fact about a list, not about either
   file — and the day that was not true, the app stopped on `LOADED is not defined`. */
let LOADED = false;

/* AND WHY there is nothing to show. `LOADED` says the attempt finished; this says whether it
   worked. Without it a failed fetch and an empty spreadsheet produce the same screen — and the
   words on that screen were "add a row to the posts tab", which is advice for a problem the person
   does not have and no mention of the one they do. */
let LOAD_FAILED = '';
/* WHY THE QUESTION FILE DID NOT ARRIVE, when it did not. Separate from `LOAD_FAILED` because they
   are separate requests with separate failures: the backend can be down while the library is in the
   browser's cache, and — the case that prompted this — the library can fail on a phone while the
   backend answers fine. See `libraryRows_`, and `nothingHere`, which reports whichever happened. */
let LIBRARY_FAILED = '';

/* WHETHER THE 30-SECOND WATCHDOG IN index.html HAS SPOKEN.
   It writes straight to the banner element, and until now nothing ever took that message down — so
   a load that was merely SLOW finished with "Still loading… Data: not yet" sitting above a screen
   full of posts. The app contradicting itself, in the one place somebody looks when they think it
   is broken, and it has sent us after the wrong thing more than once.
   Set there, read in `load`, so a payload that arrives late can clear that message AND ONLY THAT
   ONE. A banner written by anything else is a real warning and has to survive. */
let LOAD_SLOW = false;
try { USER = JSON.parse(localStorage.getItem('familyUser') || 'null'); } catch {}

/* ==================================================================================================
   WHAT A PERSON HAS WRITTEN IS KEPT ON THE DEVICE AS THEY WRITE IT — AND A WRITE THE DEVICE REFUSED
   IS SAID, NEVER KEPT QUIETLY IN MEMORY.

   THE OWNER, 9 OCT, DURING A LESSON: *"[the child] accidentally refreshed on his computer when doing the
   english language question. this lost him all his progress on his answer. the box should be
   autosaving his work like everywhere else should be doing this."* docs/history/317 has what three
   hunts found; this block is the half of the answer that every surface shares.

   ONE WRITER, `keepPut_`, for anything a person made: an answer (`ansLocalPut_`, answers.js) and a
   draft (below).
     · A STORE THAT REFUSES IT GIVES UP ITS CACHES FIRST. The only cache this app keeps in
       `localStorage` is the loading screen's copy of the textbooks' drawings — 181,176 of a normal
       boot's 181,339 characters, measured — and `splashGiveWay_` (shell.js) takes it. Then once more.
     · A WRITE STILL REFUSED IS REMEMBERED (`KEEP_UNKEPT`) WITH ITS VALUE HELD FOR THE VISIT
       (`KEEP_MEM`), and every reader asks `keepHeld_` FIRST. Measured before this (hunt A2/A3): the
       store refused the last 110 of 252 characters, a redraw drew the 142 it held, and the next key
       saved 143 over the visit's 252 — a refused write became a lost one without a reload at all.
       A browser keeping no site data refuses everything, and the same redraw drew an empty box.
     · AND IT IS SAID: under an answer box ("Not saved — this browser is not keeping it",
       `ansSavedSay_`), once a visit as a toast, and by the browser's own "Leave site?" if the page is
       left with something only the visit holds — see the `beforeunload` note below. */
const KEEP_MEM = new Map();
const KEEP_UNKEPT = new Set();
let KEEP_SAID = false;
/* `quiet` IS FOR A CONVENIENCE, NOT WORK — where Find was (`findPlaceKeep_`). It is written if there is
   room and forgotten if there is not: it takes no cache's room, says nothing, and is never the reason the
   browser asks "Leave site?" — written as the page is hidden, in a browser keeping nothing it would have
   made every refresh ask.
   `'record'` IS FOR WHAT GUARDS WORK WITHOUT BEING ANYBODY'S WORK — whose a signed-out answer is
   (`ansRecPut_`, answers.js). Lost, it hands the work to somebody else, so it is held, given the splash's
   room and tried again like work, and FIRST as the page goes (`keepRetry_`); but it says nothing and is
   never the reason the browser asks "Leave site?" (`KEEP_RECORD`). */
const KEEP_RECORD = new Set();
function keepPut_(k, v, quiet) {
  const put = () => { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); };
  if (quiet === true) { try { put(); return true; } catch (e) { return false; } }
  KEEP_MEM.set(k, v);
  if (quiet === 'record') KEEP_RECORD.add(k);
  /* NOT WRITTEN BEFORE WHAT IT WAITS ON — an answer whose owner's mark the store has not taken yet
     (`keepWaits_`, answers.js): held for the visit and said, as a refused write is. */
  const waits = v !== null && typeof keepWaits_ === 'function' && keepWaits_(k);
  if (!waits) {
    try { put(); KEEP_UNKEPT.delete(k); return true; } catch (e) {}
    try { if (v !== null && typeof splashGiveWay_ === 'function' && splashGiveWay_()) { put(); KEEP_UNKEPT.delete(k); return true; } } catch (e) {}
  }
  KEEP_UNKEPT.add(k);
  if (quiet !== 'record' && !KEEP_SAID && v !== null && String(v).trim()) {
    KEEP_SAID = true;
    try { if (typeof toast === 'function') toast('This browser is not saving what you type — leaving the page would lose it.'); } catch (e) {}
  }
  return false;
}
/* THE VISIT'S COPY OF A KEY THE STORE REFUSED, or `undefined` for a key the store holds as written. */
const keepHeld_ = k => (KEEP_UNKEPT.has(k) ? KEEP_MEM.get(k) : undefined);
/* ONCE MORE, AS THE PAGE GOES — a draft sent or a copy given way since may have made the room. THE
   RECORDS FIRST, so an answer waiting on its owner's mark (`keepWaits_`) is asked after the mark has had
   its chance, and is written only if the mark was. */
function keepRetry_() {
  [...KEEP_UNKEPT].sort((a, b) => KEEP_RECORD.has(b) - KEEP_RECORD.has(a)).forEach(k => {
    const v = KEEP_MEM.get(k);
    if (v !== null && v !== undefined && typeof keepWaits_ === 'function' && keepWaits_(k)) return;
    try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, v); KEEP_UNKEPT.delete(k); } catch (e) {}
  });
}
/* WHAT ONLY THIS VISIT HOLDS — non-empty, and not on the account either (`ansOnAccount_`, answers.js).
   NOT A RECORD (`'record'` above): it is nobody's writing, and the answer it guards counts for itself. */
function keepAtRisk_() {
  keepRetry_();
  return [...KEEP_UNKEPT].filter(k => {
    if (KEEP_RECORD.has(k)) return false;
    const v = KEEP_MEM.get(k);
    if (v === null || v === undefined || !String(v).trim() || v === '[]') return false;
    try { if (typeof ansOnAccount_ === 'function' && ansOnAccount_(k)) return false; } catch (e) {}
    return true;
  });
}
/* ---------- AND WHAT IS WAITING TO GO UP GOES AS THE PAGE GOES ------------------------------------------
   THREE THINGS SEND TO THE ACCOUNT A MOMENT AFTER THE LAST KEY — the notepad (1.4 s), the docket and the
   timetable (0.9 s) — and the cheat sheet maker keeps its words 0.2 s after. Each writes this device's
   copy at once, but a reload inside that moment took the send with it, and the next device opened the
   account's older copy. Each books its send here as well as on its timer (`keepDue_`), and leaving the
   page sends whatever is booked, with `keepalive` so the browser finishes it after the page has gone. */
const KEEP_DUE = new Map();
function keepDue_(name, send) { if (send) KEEP_DUE.set(name, send); else KEEP_DUE.delete(name); }
/* A PROMISE OF THEM ALL, so Sign out can send them before the session they need is ended (me.js). */
function keepFlush_() {
  const due = [...KEEP_DUE.values()];
  KEEP_DUE.clear();
  return Promise.all(due.map(f => { try { return Promise.resolve(f(true)).catch(() => {}); } catch (e) { return null; } }));
}
const keepLeaving_ = () => { keepFlush_(); keepRetry_(); };
window.addEventListener('pagehide', keepLeaving_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') keepLeaving_(); });
/* ---------- A RELOAD ASKS FIRST, BUT ONLY WHEN THE WORK IS IN NOTHING BUT THIS PAGE ------------------
   THE ASK WAS "NO 'are you sure' PROMPT — THE WORK IS ALREADY SAVED, and a prompt on every refresh is
   noise", and on every ordinary device that holds: nothing here asks. The hunt found the one case the
   premise is false (A1): a browser that keeps no site data — a blocked-cookies profile makes
   `localStorage` THROW — typed 111 characters, reloaded with no word from anybody, and drew an empty
   box. There the work is in this page and nowhere else, so the browser's own "Leave site?" is the
   last thing between it and a refresh; staying kept all 111 (measured on the hunt's patched copy).
   It never fires while every key is stored, and an answer already on the account does not count. */
window.addEventListener('beforeunload', e => {
  if (!keepAtRisk_().length) return;
  e.preventDefault();
  e.returnValue = '';
});

/* ---------- A DRAFT: EVERY BOX THAT IS SENT OR SAVED BY A BUTTON -------------------------------------
   AN ANSWER IS SAVED AS IT IS TYPED (answers.js). Everything else a person types waits for a Send, a
   Post or a Save — and lived in the page until then: the message composer, a comment, the new-post
   sheet, the booking form, a settings card, the week of hours, the business records, the make-an-
   account sheet. A reload lost every one of them. So each is now a DRAFT, kept as it changes:

     `draft:<who>:<surface>:<id>`   `<who>` is `u:<person id>` signed in and `device` signed out, so a
                                    draft is the signed-in person's and never handed to whoever signs in
                                    next on a shared iPad. A device's draft is kept for `DRAFT_DEVICE_MS`
                                    — long enough for a reload, not until tomorrow's visitor.
     `draftAttr_(surface, id, was)` on the box: ` data-draft="surface:id"` and the value it was drawn
                                    from (`data-draft-was`), so typing back to it takes the draft away.
     `draftVal_(surface, id, was)`  what the box is drawn holding: the draft, or `was`.
     `draftDrop_(surface, id)`      when the thing is sent, saved or cancelled.

   ONE DELEGATED LISTENER saves every `[data-draft]` box on `input` and `change` — so a surface takes
   part by carrying the attribute and drawing `draftVal_`, and `js/check-drafts.js` holds every
   `<input>` and `<textarea>` the app draws to being an answer, a draft, or on its EXEMPT list with a
   reason. NEVER A PIN, A PASSWORD, A FILE OR A HIDDEN BOX: refused here whatever the markup says.

   ---------- A DRAFT REMEMBERS WHAT IT WAS TYPED OVER (`from`) ---------------------------------------
   FOUND BY THE REVIEW OF 317: the sheet held the city "Oldtown", "Samtown" was typed on the computer and
   not saved, and the city was then saved as "Newtown" on the iPad. The computer reloaded and drew the
   box holding "Samtown" — a draft only knew its own words, so "differs from what is saved" could not
   tell an edit from a change made elsewhere since — and Save on the same card, pressed for the
   postcode, wrote "Samtown" over "Newtown". Every box of a card goes up with its Save (`meSave_`, the
   business records, the edit-post sheet), so an abandoned edit was committed by the next unrelated one.
   SO A DRAFT KEEPS THE SAVED VALUE ITS BOX WAS DRAWN FROM, and a box drawn over a DIFFERENT saved value
   is drawn holding the saved one: the newer value wins, and the draft waits, unread, until the box is
   typed in (a new draft, over the new value), its card is saved, or it is swept (below). NOT DROPPED
   THERE: a card drawn before its saved values have arrived is drawn over blanks, and dropping on that
   draw would throw away a good draft. A box drawn holding a draft says so (`data-draft-held`, which
   the settings card turns into a line under it).

   ---------- SENT IS NOT A DRAFT, EVEN BEFORE THE SERVER HAS SAID SO ----------------------------------
   ALSO THE REVIEW'S: Send pressed, Apps Script taking its six seconds, and the page reloaded inside
   them. The draft was dropped only when the reply came, and the reply never reaches a page that has
   gone — so the message, the comment or the whole booking came back in its box, stayed there after the
   server had it, and Send sent it twice (a booking with a new requestId each press, which the backend's
   guard cannot catch). So the press marks the draft SENT (`draftSent_`): this page still draws it while
   its own request is out (a comment box is not emptied under a slow reply), every other page — the
   reload, another tab — draws the box without it, the reply drops it (`draftSentDone_`) and a refusal
   gives it back (`draftSentBack_`). A request the reload cut off before the server got it is not
   offered back; that is the one case in which this is the behaviour from before 317.

   ---------- AND NOTHING IS KEPT FOR EVER ------------------------------------------------------------
   A comment on a post since deleted, a conversation gone, a sheet abandoned: each draft is small, and
   nothing ever took one away. `draftSweep_` runs as this file loads: a device's draft after six hours,
   a sent one after `DRAFT_SENT_MS`, anybody's after `DRAFT_KEEP_MS`, and past `DRAFT_MAX` the oldest. */
const DRAFT_DEVICE_MS = 6 * 60 * 60 * 1000;
/* WHOSE A SIGNED-OUT ANSWER OR DEVICE DRAFT IS (`ansGoneMark_`, answers.js; docs/history/317). Declared
   HERE, not beside the code that writes it, because `draftOld_` asks it while `draftSweep_` runs as this
   file loads — before answers.js exists. */
const ANS_GONE_KEYS = 'familyGoneKeys';
const DRAFT_KEEP_MS = 30 * 24 * 60 * 60 * 1000;
/* LONGER THAN ANY ANSWER APPS SCRIPT GIVES (six minutes is its ceiling), so a send still out in another
   tab is never swept from under it. */
const DRAFT_SENT_MS = 10 * 60 * 1000;
const DRAFT_MAX = 200;
/* WHAT IS NEVER WRITTEN DOWN, by name: a PIN, a password, and what a card or a bank account is paid with.
   A WORD AT A TIME — `pinned` and `spinner` are not PINs — and camelCase is two words (`draftNever_`),
   so `pinNew` and `newPin` are refused as `pin_new` and `new_pin` are. The review of 317 found
   `pinNew`, `pincode`, `card_number` and `sortcode` all let through; none is drafted today, but the
   people tab has the columns. */
const DRAFT_NEVER = /(^|[^a-z])(pin(code|no|num|number)?|password|passcode|passwd|cvc|cvv|csc|card_?(no|num|number)|sort_?code|security_?code|account_?(no|num|number)|iban)(\d|[^a-z]|$)/i;
function draftNever_(name) { return DRAFT_NEVER.test(String(name).replace(/([a-z\d])([A-Z])/g, '$1_$2')); }
function draftWho_() {
  try { if (USER && (USER.personId || USER.name)) return 'u:' + (USER.personId || USER.name); } catch (e) {}
  return 'device';
}
/* `who` only to name somebody else's draft — the device's, carried into the person who signed in
   (`bookFollow_`, book.js). Every other caller is the person in front of the screen. */
const draftKey_ = (surface, id, who) => 'draft:' + (who || draftWho_()) + ':' + surface + ':' + (id == null ? '' : id);
/* THE SAME WORDS, whichever line endings carried them — a textarea's value is `\n` and a cell may be `\r\n`. */
const draftSame_ = (a, b) => String(a == null ? '' : a).replace(/\r\n?/g, '\n') === String(b == null ? '' : b).replace(/\r\n?/g, '\n');
/* WHICH DRAFTS THIS PAGE HAS SENT AND NOT YET HEARD BACK ABOUT, and the words each went with. */
const DRAFT_SENDING = new Map();
function draftParse_(raw) {
  try {
    const d = JSON.parse(raw);
    return d && typeof d === 'object' && typeof d.v === 'string' ? d : null;
  } catch (e) { return null; }
}
function draftRaw_(k) {
  let raw = keepHeld_(k);
  if (raw === undefined) { try { raw = localStorage.getItem(k); } catch (e) { raw = KEEP_MEM.has(k) ? KEEP_MEM.get(k) : null; } }
  return raw === null || raw === undefined ? null : draftParse_(raw);
}
/* PAST ITS TIME — see the sweep's note above. */
/* A DEVICE'S DRAFT MARKED AS SOMEBODY'S lasts as long as their own drafts do, not six hours. The six
   hours are for a stranger's form: a reload, not tomorrow's visitor. One the device knows is Ada's — typed
   after the server ended her session — is hers, and `bookFollow_` gives it back when she signs in again;
   swept at six hours, it was gone by the afternoon, while her answers marked the same way waited with no
   limit (verifier of 317, B2b). The visit's copy is asked when answers.js can answer; at load, the store.
   ASKED, NOT `typeof`: where every file is one script (check-flow's jsdom), `ansRec_` is already declared
   at load but reads names answers.js has not reached yet, and throws — and the sweep took that for "not
   marked" and swept her form anyway. */
function draftHeld_(k) {
  try {
    let raw;
    try { raw = ansRec_(ANS_GONE_KEYS); } catch (e) { raw = localStorage.getItem(ANS_GONE_KEYS); }
    const map = JSON.parse(raw || '{}');
    return !!(map && map[k]);
  } catch (e) { return false; }
}
function draftOld_(k, d, now) {
  if (d.sent && !DRAFT_SENDING.has(k) && !(now - (Number(d.sent) || 0) < DRAFT_SENT_MS)) return true;
  const device = /^draft:device:/.test(k) && !draftHeld_(k);
  return !(now - (Number(d.at) || 0) < (device ? DRAFT_DEVICE_MS : DRAFT_KEEP_MS));
}
/* `was`, WHEN GIVEN, is the saved value the box is being drawn from: a draft typed over another one is
   not this box's any more (see `from` above). Callers with no saved value — the booking form, Find's
   place, the composer's own check — pass nothing and are not asked. `who` as for `draftKey_`: only
   `bookFollow_`, reading the device's form for the person signing in. */
function draftRead_(surface, id, was, who) {
  const k = draftKey_(surface, id, who);
  const d = draftRaw_(k);
  if (!d) return null;
  if (draftOld_(k, d, Date.now())) { draftDrop_(surface, id, who); return null; }
  if (d.sent && !DRAFT_SENDING.has(k)) return null;
  if (was !== undefined && typeof d.from === 'string' && !draftSame_(d.from, was)) return null;
  return d.v;
}
/* ---------- A DEVICE'S DRAFT IS SOMEBODY'S TOO, WHEN THE SERVER HAS JUST ENDED THEIR SESSION ---------------
   THE RULE ANSWERS KEEP (`ansGoneMark_`, answers.js; docs/history/317, "Six edges closed", P8). Ada's
   session was ended from the iPad, she typed her address into the booking form on the family computer
   signed out, and Ben signed in next: `bookFollow_` carries a filled-in device form into whoever signs in,
   so her address became his booking draft. So a device's draft written while such a session is fresh is
   marked as that person's, exactly as a signed-out answer is — by the same function, in the same record,
   asked by the same `ansMayMove_` — and taken off when the draft is dropped. Not Find's place (`quiet`):
   a convenience nothing carries into anybody. Compared by its words (`v`), not its stamp, so an edit of
   the form keeps the mark and a form written over whole does not. */
function draftMark_(k, v, quiet) {
  if (quiet === true || !/^draft:device:/.test(k) || typeof ansGoneMark_ !== 'function') return;
  const was = v === null ? null : draftRaw_(k);
  ansGoneMark_(k, v, false, was ? was.v : null);
}
function draftKeep_(surface, id, v, quiet, from) {
  if (draftNever_(String(surface) + ':' + String(id == null ? '' : id))) return false;
  if (v === null || v === undefined) return draftDrop_(surface, id);
  const d = { v: String(v), at: Date.now() };
  if (from !== undefined && from !== null) d.from = String(from);
  const k = draftKey_(surface, id);
  draftMark_(k, d.v, quiet);
  return keepPut_(k, JSON.stringify(d), quiet);
}
function draftDrop_(surface, id, who) {
  const k = draftKey_(surface, id, who);
  DRAFT_SENDING.delete(k);
  draftMark_(k, null);
  let had = KEEP_MEM.has(k);
  if (!had) { try { had = localStorage.getItem(k) !== null; } catch (e) {} }
  return had ? keepPut_(k, null) : true;
}
/* ---------- SENT, ANSWERED, REFUSED — see "SENT IS NOT A DRAFT" above. `v` is the words that went, so a
   box written in again since Send keeps its new draft; a surface that sends a whole form passes none. */
const draftIs_ = (d, v) => v === undefined || String(d.v).trim() === String(v).trim();
function draftSent_(surface, id, v) {
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (!d || !draftIs_(d, v)) return;
  d.sent = Date.now();
  DRAFT_SENDING.set(k, d.v);
  keepPut_(k, JSON.stringify(d));
}
function draftSentDone_(surface, id, v) {
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (v === undefined || draftIs_({ v: DRAFT_SENDING.get(k) || '' }, v)) DRAFT_SENDING.delete(k);
  if (d && d.sent && draftIs_(d, v)) draftDrop_(surface, id);
}
/* NOT WHILE THE PAGE IS GOING. A reload ABORTS the request still out, and the abort arrives here as a
   failure — measured in Chromium: the reload unmarked the draft on its way out and the next page drew the
   sent message back in the composer. `pagehide` comes before the abort; `pageshow` is a page kept and
   brought back, whose next failure is a real one. */
let DRAFT_LEAVING = false;
window.addEventListener('pagehide', () => { DRAFT_LEAVING = true; });
window.addEventListener('pageshow', () => { DRAFT_LEAVING = false; });
function draftSentBack_(surface, id, v) {
  if (DRAFT_LEAVING) return;
  const k = draftKey_(surface, id), d = draftRaw_(k);
  if (v === undefined || draftIs_({ v: DRAFT_SENDING.get(k) || '' }, v)) DRAFT_SENDING.delete(k);
  if (!d || !d.sent || !draftIs_(d, v)) return;
  delete d.sent;
  keepPut_(k, JSON.stringify(d));
}
function draftAttr_(surface, id, was) {
  const w = was === null || was === undefined ? '' : String(was);
  let held = false;
  try { const d = draftRead_(surface, id, w); held = d !== null && !draftSame_(d, w); } catch (e) {}
  return ' data-draft="' + esc(surface + ':' + (id == null ? '' : id)) + '"' + (w ? ' data-draft-was="' + esc(w) + '"' : '')
    + (held ? ' data-draft-held' : '');
}
function draftVal_(surface, id, was) {
  const w = was === null || was === undefined ? '' : String(was);
  const d = draftRead_(surface, id, w);
  if (d === null) return w;
  /* A DRAFT THAT SAYS WHAT IS SAVED ANYWAY is no draft — saved elsewhere since, or typed back. */
  if (draftSame_(d, w)) { draftDrop_(surface, id); return w; }
  return d;
}
function draftFrom_(el) {
  if (!el || !el.getAttribute) return;
  const spec = el.getAttribute('data-draft');
  if (!spec || /^(password|file|hidden)$/i.test(el.type || '')) return;
  const at = spec.indexOf(':');
  const surface = at < 0 ? spec : spec.slice(0, at), id = at < 0 ? '' : spec.slice(at + 1);
  const box = String(el.type || '').toLowerCase() === 'checkbox';
  const v = box ? (el.checked ? '1' : '0') : String(el.value == null ? '' : el.value);
  const was = el.hasAttribute('data-draft-was') ? el.getAttribute('data-draft-was') : (box ? '0' : '');
  if (draftSame_(v, was)) draftDrop_(surface, id); else draftKeep_(surface, id, v, false, was);
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  try { draftFrom_(e.target && e.target.closest && e.target.closest('[data-draft]')); } catch (err) {}
}));
function draftSweep_() {
  try {
    const now = Date.now(), all = [], live = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('draft:') === 0) all.push(k); }
    all.forEach(k => {
      const d = draftParse_(localStorage.getItem(k));
      if (!d || draftOld_(k, d, now)) localStorage.removeItem(k); else live.push([k, Number(d.at) || 0]);
    });
    live.sort((a, b) => b[1] - a[1]).slice(DRAFT_MAX).forEach(x => localStorage.removeItem(x[0]));
  } catch (e) {}
}
draftSweep_();
/* ---------- AND A DRAFT WRITTEN IN ANOTHER TAB IS THE DRAFT IN THIS ONE ----------------------------------
   THE ANSWERS' RULE (`storage` in answers.js), FOR DRAFTS TOO — the review of 317 found the composer open
   in two tabs: tab A wrote a sentence, tab B's empty composer took one key, and B's "?" was the draft A
   reloaded into. Each box here showing that draft is given the other tab's words (a box drawn over a
   different saved value is not — its draft would not be drawn there either); a draft the other tab sent
   or dropped empties a box here holding those same words, so this tab cannot send them a second time.
   The booking form is one draft for the whole of `BOOKING`, and book.js reads it again (`bookElsewhere_`). */
window.addEventListener('storage', e => {
  const k = e && e.key;
  if (!k || k.indexOf('draft:') !== 0) return;
  try {
    KEEP_UNKEPT.delete(k);
    KEEP_MEM.delete(k);
    const pre = 'draft:' + draftWho_() + ':';
    if (k.indexOf(pre) !== 0) return;
    const spec = k.slice(pre.length);
    const old = draftParse_(e.oldValue), now = draftParse_(e.newValue);
    const v = now && !now.sent ? now.v : null;
    document.querySelectorAll('[data-draft]').forEach(el => {
      if (el.getAttribute('data-draft') !== spec || /^(password|file|hidden)$/i.test(el.type || '')) return;
      const box = String(el.type || '').toLowerCase() === 'checkbox';
      const saved = el.hasAttribute('data-draft-was') ? el.getAttribute('data-draft-was') : (box ? '0' : '');
      if (now && typeof now.from === 'string' && !draftSame_(now.from, saved)) return;
      const cur = box ? (el.checked ? '1' : '0') : String(el.value == null ? '' : el.value);
      const want = v !== null ? v : (old && draftSame_(cur, old.v) ? saved : null);
      if (want === null || draftSame_(cur, want)) return;
      if (box) el.checked = want === '1'; else el.value = want;
    });
    if (spec === 'book:form' && typeof bookElsewhere_ === 'function') bookElsewhere_(v, old ? old.v : null);
  } catch (err) {}
});

/* ---------- THE SMALLEST HELPERS ---------------------------------------------------------------- */
/* ---------- AND WHEN ONE ID IS ON THE PAGE TWICE, THE COPY ON THE SCREEN IN FRONT --------------
   A WIDGET STARRED ONTO THE SAVED COLUMN WAS DEAD THERE. Every widget finds its parts by id, the
   Tools copy of it comes first in the document, and `getElementById` answers the first — so a
   starred cheat sheet maker drew an empty box on Saved and the Saved calculator typed into the
   Tools one. Rewriting every widget to scope its lookups to its own box is forty-odd widgets; this
   is the one place they all ask. Only when the first match is NOT on the screen in front is the
   screen asked for a copy of its own, so a unique id costs exactly what it did. */
const $ = id => {
  const el = document.getElementById(id);
  if (!el || typeof AT === 'undefined' || !AT) return el;
  const scr = document.getElementById('s-' + AT);
  if (!scr || scr.contains(el)) return el;
  try { return scr.querySelector('#' + CSS.escape(id)) || el; } catch { return el; }
};

/* The letter to put in a circle when there is no picture. The first LETTER, not the first
   character — punctuation is not an initial, and "@family." was giving "@", which sat next to the
   name and read as @@family. */
const initial = s => (String(s ?? '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();

/* Anything from the branding tab, by name, with a fallback. Never throws on a key that has not
   been filled in — the whole point of that tab is that most of it is empty most of the time. */
const brand = (k, or) => ((DATA.brand || {})[k] || or || '');

/**
 * IS THIS SOMETHING YOU WEAR?
 *
 * The backend used to call it `avatar` — the sheet's own word — and now says `wearable`, which is
 * what it is to a person looking at one. Both are accepted, and that is not tidiness: these two
 * files travel separately and are pasted one per message, so for at least one deploy the payload
 * and the code that reads it will disagree about the word. Accepting either means the order they
 * arrive in does not matter, which is the same reason the screen describes its own layout rather
 * than trusting the stylesheet.
 *
 * Asked in one place, so the day the old word can be dropped is a one-line day.
 */
const isWearable = x => {
  const k = norm(x && (x.kind || x.kindRaw));
  return k === 'wearable' || k === 'avatar';
};

/* Whether the person signed in is an admin. Asked through roleOf, so it is true whichever of the
   four spellings the sheet happens to use — the old app had this and the new shell never did,
   which would have thrown the moment an admin opened a tutor, silently, inside a template. */
const isAdmin = () => !!USER && roleOf(USER.role || '') === 'admin';

/* ---------- THE LAWS ----------------------------------------------------------------------------
   How words are coloured, wherever they appear. Subjects green, #tags blue, @names softer blue,
   client names red — and the list lives in the database, so a new law is a row rather than a
   deploy.

   TWO THINGS MAKE THIS SAFE, and neither is optional:

   1. THE TEXT IS ESCAPED FIRST. Captions come from a spreadsheet anybody with an account can type
      into. Colour the words first and a caption reading `<img onerror=…>` is a script running on
      every phone that opens the app. Escape, then wrap — there is exactly one correct order.

   2. A MATCH IS NEVER FOUND INSIDE A SPAN ALREADY MADE. Each match is swapped for a placeholder
      that later laws cannot see, and the placeholders are put back at the end. Without it a
      subject called "Art" would colour the letters inside `<span class="part">`.
--------------------------------------------------------------------------------------------- */

/* One place a colour name becomes a class. A law says "green"; the stylesheet decides what green
   is — so the palette stays where a designer would look for it. */
const LAW_CLASS = {
  green: 'w-green', blue: 'w-blue', 'blue-soft': 'w-blue-soft',
  /* PURPLE IS A VENUE, the way green is a subject. The second colour to be given a meaning, and
     the restraint is the same: nothing else may use it, or it stops meaning anything.
     It needs a row in the `laws` tab to take effect — kind `list`, match `venues`, colour
     `purple` — because the list of venues is data and this is only the palette. */
  purple: 'w-purple',
  /* PINK IS SOMETHING YOU WEAR. A cape and a subject are not the same kind of noun, and the whole
     value of colouring a word is that you know what kind of thing it is before you have read it.
     It needs a row in the `laws` tab like the others — kind `list`, match `wearables`, colour
     `pink`. This is the palette; the list of wearables is data. */
  pink: 'w-pink',
  red: 'w-red', amber: 'w-amber', dim: 'w-dim', ink: '',
};

/** The lists a `kind: list` law can name. Each is read fresh, so adding a subject colours it. */
function lawList(name) {
  const d = DATA || {};
  switch (norm(name)) {
    /* ---------- `subjects` WAS HERE, AND IT IS RETIRED ------------------------------------------
       REPORTED AS "some subjects are green and some arent... it makes it buggy as not all subjects
       seem to be treated the same for some reason". Measured, and that is exactly what it did: the
       list is `dropdowns.subjects` off the payload, which is what somebody can be BOOKED for --
       Maths, English, the things that are taught one to one. `Combined Science`, `Religious
       Studies` and half the library's subjects have never been in it, so the funnel drew a column
       of answers with some of them green and the rest plain, on a rule nobody could see.

       A COLOUR THAT MEANS "THIS IS A SUBJECT" IS ONLY WORTH HAVING IF IT IS ON EVERY SUBJECT. One
       that is on most of them is read as a state -- available, chosen, already done -- and the app
       never says which. That is the `cost: 0` shape in a colour: a fact drawn confidently from a
       column that does not hold it.

       RETIRED RATHER THAN LEFT TO THE SHEET, because the law that reads it is a row in the `laws`
       tab and a list nothing answers is a law that quietly does nothing. Returning nothing here is
       the deletion; the row can stay where it is. If subject-green is wanted back, it wants a list
       of every subject the library holds and not the booking dropdown -- which is the whole reason
       it is written down here rather than just deleted. */
    case 'subjects': return [];
    case 'tutors':   return (d.tutors || []).map(t => t.title);
    case 'venues':   return (d.venues || []).map(v => v.title);
    /* THE FAMILIES IN THE SESSIONS THIS PHONE CAN SEE. It read `d.clients || d.people`, and the
       payload has never held either — deliberately, since a list of every client is not something
       to send to every phone. So the law that colours a client's name has matched nothing since it
       was written, and a law that matches nothing is indistinguishable from a law nobody added.
       A session's participants are already here and are exactly the names worth colouring: the
       people you are in something WITH. Nothing private is added — it is on the screen already. */
    case 'clients':  return [...new Set((d.liveJobs || d.jobs || [])
                       .flatMap(j => (j.slots || []).map(s => s && s.client))
                       .filter(Boolean))];
    /* Everything in the shop that is worn rather than posted. Read from the shop rather than kept
       as a second list, so an item added to the sheet is coloured without anything else changing —
       which is the point of a law naming a list instead of naming words. */
    case 'wearables':
    case 'wearable': return (d.shop || []).filter(isWearable).map(x => x.name);
    default:         return [];
  }
}

const rxSafe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * ESCAPE, then colour. The only function that should ever put user text on screen.
 *
 * Returns HTML — so whatever uses it must NOT escape the result again, and must not pass it
 * anywhere that expects plain text.
 */
function mark(text) {
  let out = esc(text ?? '');
  const laws = (DATA.laws || []);
  if (!laws.length || !out) return out;

  /* Matches are parked as placeholders so later laws cannot see inside them. `\u0000` cannot occur
     in escaped text, which is what makes it a safe marker rather than a hopeful one. */
  const parked = [];
  const park = html => '\u0000' + (parked.push(html) - 1) + '\u0000';

  laws.forEach(law => {
    const cls = LAW_CLASS[norm(law.colour)];
    if (cls === undefined) return;                 // a colour nobody has defined: left alone
    const wrap = m => park(`<span class="${cls}">${m}</span>`);

    if (law.kind === 'prefix') {
      const p = rxSafe(law.match);
      /* The symbol and the word after it, and only when the symbol starts a word — so an email
         address is not read as four @names. */
      out = out.replace(new RegExp('(^|[\\s(])(' + p + '[\\w-]+)', 'g'),
                        (all, before, hit) => before + wrap(hit));

    } else if (law.kind === 'list') {
      /* Longest first, so "Further Maths" wins over "Maths" — otherwise the longer name is
         coloured in two halves with a gap in the middle. */
      lawList(law.match)
        .filter(Boolean).map(String)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {
          out = out.replace(new RegExp('\\b' + rxSafe(esc(word)) + '\\b', 'gi'), wrap);
        });

    } else if (law.kind === 'word') {
      out = out.replace(new RegExp('\\b' + rxSafe(esc(law.match)) + '\\b', 'gi'), wrap);

    } else if (law.kind === 'regex') {
      /* A bad pattern in a spreadsheet cell must not take the screen down with it. */
      try { out = out.replace(new RegExp(law.match, 'g'), wrap); } catch (e) { /* ignore */ }
    }
  });

  return out.replace(/\u0000(\d+)\u0000/g, (all, i) => parked[i]);
}
const money = n => '£' + (Number(n) || 0).toFixed(2);

/* ---------- WHEN SOMETHING HAPPENED --------------------------------------------------------------
   HOW LONG AGO, until that stops being the useful answer, and then the date.

   "3 hours ago" is something you feel; "16 August 2026" is something you look up. Everything
   recent enough to still be in somebody's head gets the first; past two months the gap has
   stopped meaning anything and the date is what you would actually want to know.
--------------------------------------------------------------------------------------------- */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/**
 * A timestamp WITH its time. `parseDMY` deliberately drops it — a session date is a date — and
 * here the time is the whole point: something posted forty minutes ago and something posted this
 * morning are both "today", and only one of them is news.
 *
 * DD/MM/YYYY, read explicitly. `new Date('12/06/2026')` is December the 6th in a browser, which
 * is the same misreading that would put half the feed in the wrong order.
 */
function parseWhen(v) {
  if (typeof v === 'number' && v > 0) return new Date(v);      // the payload's `at`, in ms
  const t = String(v ?? '').trim();
  if (!t) return null;
  /* ---------- AN ISO DATE IS READ FIRST, AND IT USED TO BE READ BACKWARDS -------------------------
     `2026-09-15` CAME OUT AS 26 SEPTEMBER 2015. The day-month-year match below is NOT ANCHORED, so
     on a four-digit year it simply started later in the string: `\d{1,2}` cannot take `2026`, the
     engine slid along to `26-09-15`, and read it as day 26, month 9, year 15. A plausible date, a
     confident sentence, and wrong by eleven years — the shape this file keeps recording, where the
     failure looks exactly like a success.

     `new Date(t)` ON LINE 343 WAS ALREADY RIGHT ABOUT THIS and never got the chance: an unanchored
     regex earlier in the function had always matched first. So the fix is an anchored ISO branch
     above it rather than a rule about what a date is.

     BUILT FIELD BY FIELD, NOT HANDED TO `new Date(string)`. `new Date('2026-09-15')` is UTC
     midnight and `new Date('2026-09-15 18:20')` is local, so the same function would put a date one
     side or the other of midnight depending on whether somebody typed a time — which is the
     timezone fault `waveOf` already cost this app seven buttons over.

     Found by a comment timestamped `2026-09-15 18:20` printing `26 September 2015`. */
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) {
    const d0 = new Date(+iso[1], +iso[2] - 1, +iso[3],
                        +(iso[4] || 0), +(iso[5] || 0), +(iso[6] || 0));
    return isNaN(d0) ? null : d0;
  }
  const m = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
    const d = new Date(y, +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return isNaN(d) ? null : d;
  }
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

/** 16 August 2026. No leading zero, the month written out, the year in full. */
const fullDate = d => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

/**
 * The ladder. Singulars are words rather than numbers — "a minute ago", not "1 minute ago",
 * because nobody counts to one — and "yesterday" for the same reason.
 *
 * A date in the FUTURE is not a negative age. Clock skew and a hand-typed timestamp both produce
 * one, and "-3 hours ago" is the app admitting it cannot subtract, so anything ahead of now shows
 * its date instead.
 */
function ago(value) {
  const d = parseWhen(value);
  if (!d) return String(value ?? '');        // unparseable: show it as written, not as nothing

  const secs = (Date.now() - d.getTime()) / 1000;
  if (secs < 0) return fullDate(d);
  if (secs < 45) return 'just now';

  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins <= 1 ? 'a minute ago' : mins + ' minutes ago';

  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : hours + ' hours ago';

  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7)  return days + ' days ago';
  if (days < 14) return 'a week ago';
  if (days < 28) return Math.floor(days / 7) + ' weeks ago';
  if (days < 60) return 'a month ago';

  /* Past two months, "nine weeks ago" is arithmetic and "16 August 2026" is an answer. */
  return fullDate(d);
}