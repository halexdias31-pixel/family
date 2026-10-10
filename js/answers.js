/* ==================================================================================================
   @family. — answers.js

   WHAT A CHILD WRITES IS THEIRS, AND IT GOES WHERE THEY GO.

   REPORTED BY THE OWNER, LIVE, ON A PUPIL'S iPAD:
     *"i just relogged in as [the child] after having done the questions earlier and i dont see his
      answers there"*
     *"it doesnt seem to save their answers"*
     *"i am very dissapointed it didnt have his answers already written in when he went to see them on
      the computer"*

   ALL THREE WERE TRUE. An answer — typed, picked, drawn or ringed — lived in the browser it was made
   in (`localStorage`, under `ans:u:<person>:<question>`) and nowhere else. The card on the computer
   said `Done 8 Oct` (the `attempts` tab has had the date since 268) over an empty box: the record that
   the work happened, without the work. And on the SAME iPad, an answer typed before anybody signed in
   was looked for under a key no answer had (the `ansRead_` regex — see find.js) and never found.

   SO EVERY ANSWER NOW HAS A HOME ON THE ACCOUNT — the `answers` tab (SCHEMA.answers), one row per
   person per answer — and this file is the phone's half:

     WRITING     `ansStore_` is the ONE writer. Every place that used to `localStorage.setItem` an answer
                 calls it (the box's `input`, a pick, a stroke, an undo, a clear, a ringed word, an old
                 drawing moved to whoever opened it). Signed in, it stamps the edit's time and marks the
                 key DIRTY — kept in `localStorage`, so a reload, a crash or a dead battery cannot lose
                 the fact that it still has to go up.
     SENDING     `answersPush_`, a second and a half after the last keystroke, and AT ONCE on Check, on a
                 pick, on leaving the box, and as the app goes to the background (with `keepalive`, so a
                 child closing the iPad cover does not take the last answer with them). A key stops
                 being dirty only when the server has it AND the box has not changed since it was sent.
     READING     `answersPull_`, from `adoptMarks_` once a visit, the moment somebody signs in, and when
                 the app comes back to the front (at most once a minute — the iPad to the computer and
                 back). A DIRTY KEY WINS (it is about to upload, and it is newer), and A BOX UNDER A
                 FINGER IS NEVER OVERWRITTEN.
     SAYING SO   `ansSavedSay_` / `ansSavedPaint_` — one dim line under the box: "Saved to Ada’s
                 account", "Saving…", or "On this device only — sign in to keep it". The owner said
                 *"i feel very insecure when signing into the kids accounts"*; a parent has to be able
                 to SEE where the work went. Not a global "who is signed in" pill: the owner took the
                 name off the box as clutter (*"remove 'names answer'. that is redundant."*), so the name
                 appears only in the one sentence that is about whose account the answer is on.

   AND `findKeep_`, which keeps the Find column from being rebuilt under a child who is typing — the
   other half of *"janky and unresponsive"*: a payload landing fifteen seconds after "Signed in" used to
   replace the box with the keypad up.

   ITS OWN FILE because it is one idea with one vocabulary, and find.js is 940 KB that three people are
   working in at once. It loads after find.js and keypad.js; everything it calls in them is called at
   run time, never while loading, so the order between them is free.
================================================================================================== */

/* ---------- THE KEYS ----------------------------------------------------------------------------------
   ON THE PHONE an answer's key carries the person: `ans:u:P7:q:Q-1`, `pad:u:P7:q:Q-1`,
   `pad:u:P7:q:Q-1:words`, `ans:u:P7:pr:PR-1#iv`. ON THE SHEET the person is its own column, so the key
   goes up without them — `ans:q:Q-1` — and comes back with whoever asked put in again. A signed-out key
   (`ans:q:Q-1`) has nobody in it, and is the device's alone. */
const ANS_KEY_WHO = /^(?:ans|pad):(u:[^:]+):/;
const ansWhoOf_ = k => { const m = ANS_KEY_WHO.exec(String(k || '')); return m ? m[1] : ''; };
const ansServerKey_ = k => String(k || '').replace(/^(ans|pad):u:[^:]+:/, '$1:');
const ansLocalKey_ = (sk, who) => String(sk || '').replace(/^(ans|pad):/, '$1:' + who + ':');
/* A DRAWING'S STROKES, as against its ringed words (`:words`) or a typed answer. */
const ansIsPad_ = k => /^pad:/.test(String(k || '')) && !/:words$/.test(String(k || ''));
const ansIsRing_ = k => /^pad:/.test(String(k || '')) && /:words$/.test(String(k || ''));
/* THE WHITEBOARD'S STROKES (`board:`, find.js): a drawing, kept on the device and never sent. */
const ansIsBoard_ = k => /^board:/.test(String(k || ''));
/* ---------- WHAT A MARK OF WHOSE IT IS CAN NAME (`ansGoneMark_`, below) ----------------------------------
   THE SIGNED-OUT KEY OF ANYTHING A PERSON MADE: an answer, a drawing or its rings (`ans:` / `pad:`), the
   whiteboard (`board:` — never sent anywhere, and still somebody's), and a draft of the device's
   (`draft:device:`, data.js — `bookFollow_` carries the booking form into whoever signs in). The board and
   the drafts were never marked, so a board drawn and an address typed signed out after the server ended
   Ada's session were handed to Ben when he signed in next (317, "Six edges closed": P5, P8). `ansKeyWho_` is
   whose key `k` is, in any of the four shapes. */
const ANS_MARKABLE = /^(?:(?:ans|pad|board):(?!u:)|draft:device:)/;
const ansMarkable_ = k => ANS_MARKABLE.test(String(k || ''));
const ansKeyWho_ = k => { const m = /^(?:ans|pad|board|draft):(u:[^:]+):/.exec(String(k || '')); return m ? m[1] : ''; };

/* THE SERVER'S CEILINGS, said again because the phone must not send what will be refused — and a value
   it would refuse stays on the device rather than being retried for ever. `ANSWER_TEXT_MAX`,
   `ANSWER_PAD_MAX` and `ANSWERS_PER_POST` in backend/constants.gs; `check-saved-answers.js` asks the
   server's. */
/* 20,000 SINCE AN ESSAY BECAME AN ANSWER (9 Oct): at 2,000 a forty-mark essay stopped going to the account
   at its fourth paragraph. See `ANSWER_TEXT_MAX`. */
const ANS_TEXT_MAX = 20000, ANS_PAD_MAX = 40000, ANS_PER_POST = 25;
/* AND WHAT A `keepalive` REQUEST MAY CARRY. A browser refuses one over 64 KB, so the flush as the app
   goes away sends what fits and leaves the rest dirty for next time. */
const ANS_KEEPALIVE_MAX = 60000;
/* THE STAMP OF AN ANSWER THE ACCOUNT WILL NOT TAKE — over its ceiling, or refused by the server — so it is
   neither due (it would be refused for ever) nor "saved". The next edit stamps it again and it is asked
   once more. */
const ANS_HERE_ONLY = -1;

/* ---------- WHAT IS ON THIS DEVICE -------------------------------------------------------------------
   EVERY READ AND WRITE IS WRAPPED, for find.js's reason: private mode THROWS on `localStorage` rather
   than answering null. `ANS_MEM` holds this visit's writes so a throwing storage still saves the visit's
   work to the account — the one case where the account is the only copy there will ever be.
   ONLY WHEN STORAGE THROWS. A storage that answers null means the key is not there — taken away by a
   clear, a move to whoever signed in, or another tab — and the visit's old copy must not bring it back. */
const ANS_MEM = new Map();
function ansValue_(k) {
  /* A KEY THE STORE REFUSED IS READ FROM THE VISIT FIRST (`keepHeld_`, data.js) — the stored copy is
     older, or nothing, and drawing it is how the next key saved it over the newer one (317). */
  const held = typeof keepHeld_ === 'function' ? keepHeld_(k) : undefined;
  if (held !== undefined) return held;
  try { return localStorage.getItem(k); } catch (e) {}
  return ANS_MEM.has(k) ? ANS_MEM.get(k) : null;
}
/* `words` IS TRUE FOR A WORDED BOX (the essay's too), from the `input` listener in find.js — what
   `ansJoin_` asks before it puts two answers of one person's together. */
function ansLocalPut_(k, v, words) {
  /* WHAT WAS HERE BEFORE THIS WRITE, which the mark below asks about — read before `ANS_MEM` takes the new
     value, because a store that throws is read from `ANS_MEM`. */
  const mark = ansMarkable_(k);
  const was = mark ? ansValue_(k) : null;
  ANS_MEM.set(k, v);
  /* SIGNED OUT, WHILE A SESSION THE SERVER ENDED IS FRESH, IT IS THAT PERSON'S — `ansGoneMark_` below.
     MARKED FIRST, THEN WRITTEN: an answer the mark is waiting on is not written without it
     (`keepWaits_`), and as the page goes the mark is tried again before the answers (`keepRetry_`). */
  if (mark) ansGoneMark_(k, v, words, was);
  /* A FULL STORE GIVES UP THE LOADING SCREEN'S COPY BEFORE IT GIVES UP A CHILD'S WORK. The splash
     keeps the books' drawings here (`splashSync_`, shell.js), and on a nearly full device they were
     the last 170 000 characters of room: a 2 000-character answer was refused, this swallowed it,
     and a child who was not signed in lost it on reload. So a refused write takes that copy away and
     tries once more — `keepPut_` in data.js now, the one writer for answers and drafts alike. A write
     refused even then is REMEMBERED there, read from the visit by every reader, and SAID under the box
     ("Not saved — this browser is not keeping it", below) — it was swallowed here, and the line read
     "On this device only" over an answer that was on no device at all (317). */
  if (typeof keepPut_ === 'function') keepPut_(k, v);
  else { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  /* A RING HELD FOR THE VISIT (`CIRC_HELD`) is the copy `circRead_` falls back to, and must say the same. */
  if (ansIsRing_(k) && typeof CIRC_HELD !== 'undefined') {
    try { if (v === null || v === '') CIRC_HELD.delete(k); else CIRC_HELD.set(k, JSON.parse(v)); } catch (e) {}
  }
}
/* WHEN THE ANSWER IN THIS KEY WAS LAST EDITED, in ms — by this device's child, or by whichever device
   the server's copy came from. 0 is "never stamped": a value from before this file existed. */
const ANS_AT_MEM = new Map();
function ansAt_(k) {
  try { return Number(localStorage.getItem('ansAt:' + k)) || 0; } catch (e) {}
  return ANS_AT_MEM.get(k) || 0;
}
function ansAtSet_(k, at) {
  ANS_AT_MEM.set(k, at);
  try { localStorage.setItem('ansAt:' + k, String(at)); } catch (e) {}
}
/* WHICH KEYS STILL HAVE TO GO UP, per person. A Set held for the visit and written through to storage,
   so the list survives a reload, a crash and a sign-out — and goes up the next time that person signs
   in, on this device. */
const ANS_DIRTY = new Map();
function ansDirtySet_(who) {
  let s = ANS_DIRTY.get(who);
  if (!s) {
    s = new Set();
    try { (JSON.parse(localStorage.getItem('ansDirty:' + who) || '[]') || []).forEach(k => s.add(String(k))); } catch (e) {}
    ANS_DIRTY.set(who, s);
  }
  return s;
}
function ansDirtyKeep_(who) {
  const s = ANS_DIRTY.get(who);
  try {
    if (s && s.size) localStorage.setItem('ansDirty:' + who, JSON.stringify([...s]));
    else localStorage.removeItem('ansDirty:' + who);
  } catch (e) {}
}

/* ---------- THE ONE WRITER ---------------------------------------------------------------------------
   `v` is the value as stored (`null` takes the key away — a cleared drawing, the last ring taken off).
   SIGNED OUT IT IS WHAT IT ALWAYS WAS: the value, on the device — there is nobody to send it to, and the
   line under the box says so. AND ITS TIME: that is what lets `answersClaim_` tell an answer typed a
   minute ago from an older one already on the account, when somebody signs in. */
function ansStore_(k, v, words) {
  k = String(k || '');
  if (!k) return;
  ansLocalPut_(k, v === undefined ? null : (v === null ? null : String(v)), words);
  const who = ansWhoOf_(k);
  ansAtSet_(k, Date.now());
  if (who) {
    ansDirtySet_(who).add(k);
    ansDirtyKeep_(who);
    answersPush_();
  }
  ansSavedPaint_();
}

/* ---------- MAY THIS PHONE SEND, AND READ ------------------------------------------------------------
   A person with an id and a session, and a backend that says it can (`DATA.features`) — so a phone
   ahead of the deploy keeps answers on the device and SAYS so under the box, rather than being refused
   on every keystroke or claiming a save that never happened. */
function answersCan_(what) {
  try {
    return !!(USER && USER.personId && USER.token && DATA && Array.isArray(DATA.features)
      && DATA.features.indexOf(what || 'saveAnswers') !== -1);
  } catch (e) { return false; }
}

/* ---------- A DRAWING, SMALLER, BEFORE IT TRAVELS -------------------------------------------------------
   RAMER–DOUGLAS–PEUCKER, ONE UNIT OF THE 340-WIDE PICTURE. Measured: a 340-unit freehand stroke is 504
   points and 3,796 characters as drawn, 33 points and 248 characters after — and the line it draws is
   the same line to within a unit, which is finer than the finger that made it. Only what is SENT is
   simplified; this device keeps every point it drew. A dot (one point) is a dot. */
function ansSimplify_(st, tol) {
  const n = Math.floor((st || []).length / 2);
  if (n <= 2) return (st || []).slice();
  const keep = new Uint8Array(n);
  keep[0] = 1; keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = st[2 * a], ay = st[2 * a + 1], bx = st[2 * b], by = st[2 * b + 1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let far = -1, most = 0;
    for (let i = a + 1; i < b; i++) {
      const px = st[2 * i], py = st[2 * i + 1];
      const d = len ? Math.abs(dy * px - dx * py + bx * ay - by * ax) / len : Math.hypot(px - ax, py - ay);
      if (d > most) { most = d; far = i; }
    }
    if (far > 0 && most > tol) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(st[2 * i], st[2 * i + 1]);
  return out;
}
/* WHAT GOES UP FOR ONE KEY: the text as it is, a drawing simplified, and nothing as ''. */
function ansOutgoing_(k, raw) {
  if (raw === null || raw === undefined) return '';
  if (!ansIsPad_(k)) return String(raw);
  try {
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) return String(raw);
    return JSON.stringify(all.map(st => Array.isArray(st) ? ansSimplify_(st, 1) : st));
  } catch (e) { return String(raw); }
}
/* AND WHAT COMES DOWN, CHECKED, before it goes anywhere near the markup. A drawing is a list of lists of
   numbers and a ringed word is `3.7`; anything else is a value this phone cannot draw, and it is left on
   the sheet rather than put in a `<path d>`. */
function ansIncoming_(sk, v) {
  const s = v === null || v === undefined ? '' : String(v);
  if (!/^pad:/.test(sk)) return s;
  if (s === '') return '';
  try {
    const all = JSON.parse(s);
    if (!Array.isArray(all)) return null;
    if (/:words$/.test(sk)) return all.every(w => /^\d+\.\d+$/.test(String(w))) ? JSON.stringify(all.map(String)) : null;
    return all.every(st => Array.isArray(st) && st.every(n => typeof n === 'number' && isFinite(n)))
      ? JSON.stringify(all.map(st => st.map(n => Math.round(n)))) : null;
  } catch (e) { return null; }
}

/* ---------- SENDING ----------------------------------------------------------------------------------
   `answersPush_()` books a send a second and a half out, the notepad's rhythm, so a sentence typed is one
   request and not forty. `answersPush_(true)` sends now — Check, a pick, leaving the box, the app going
   away — and returns a promise of whether everything due went up. `keepalive` is for the last of those:
   a request the browser finishes after the page is gone. */
const ANS_WAIT = 1500;
let ANS_TIMER = 0;
let ANS_BUSY = null;          // the request in flight, so a second flush joins it rather than racing it
let ANS_AGAIN = false;
let ANS_RETRY = 0, ANS_BACKOFF = 0;
function answersPush_(now, keepalive) {
  clearTimeout(ANS_TIMER);
  ANS_TIMER = 0;
  if (!now) { ANS_TIMER = setTimeout(() => answersPush_(true), ANS_WAIT); return Promise.resolve(false); }
  if (!answersCan_('saveAnswers') || typeof api !== 'function') return Promise.resolve(false);
  if (ANS_BUSY) { ANS_AGAIN = true; return ANS_BUSY; }
  const pid = String(USER.personId), who = 'u:' + pid;
  const dirty = ansDirtySet_(who);
  if (!dirty.size) return Promise.resolve(true);
  const items = [], sent = [];
  let size = 0;
  for (const k of dirty) {
    if (items.length >= ANS_PER_POST) break;
    const raw = ansValue_(k);
    const v = ansOutgoing_(k, raw);
    /* OVER ITS CEILING IT STAYS HERE, and stops being due: the server would refuse it every time. Its
       stamp says so (`ANS_HERE_ONLY`), so the line under the box does not claim a save that never was. */
    if (v.length > (/^pad:/.test(k) ? ANS_PAD_MAX : ANS_TEXT_MAX)) { dirty.delete(k); ansAtSet_(k, ANS_HERE_ONLY); continue; }
    const item = { key: ansServerKey_(k), v: v, at: ansAt_(k) || Date.now() };
    const len = JSON.stringify(item).length;
    if (keepalive && items.length && size + len > ANS_KEEPALIVE_MAX) break;
    if (keepalive && len > ANS_KEEPALIVE_MAX) continue;
    size += len;
    items.push(item);
    sent.push({ k: k, raw: raw, at: item.at });
  }
  ansDirtyKeep_(who);
  if (!items.length) { ansSavedPaint_(); return Promise.resolve(true); }
  /* `personId` AS WELL AS THE TOKEN — the gate overwrites it with the token's person, and `check-post.js`
     asks that every handler reading one is sent one. */
  const req = api({ action: 'saveAnswers', personId: pid, items: items }, keepalive ? { keepalive: true } : undefined);
  ANS_BUSY = Promise.resolve(req)
    .then(d => {
      if (!d || !d.success || !d.saved || typeof d.saved !== 'object') throw new Error((d && d.error) || 'not saved');
      const won = [];
      sent.forEach(s => {
        const got = d.saved[ansServerKey_(s.k)];
        /* REFUSED — a key or a size the server will not take. Not due any more; it stays on the device,
           and its stamp says so. */
        if (!got) { dirty.delete(s.k); ansAtSet_(s.k, ANS_HERE_ONLY); return; }
        /* TYPED OVER WHILE IT WAS ON THE WIRE: still due, and the send that is already booked takes it. */
        if (ansValue_(s.k) !== s.raw) return;
        dirty.delete(s.k);
        const at = Number(got.at) || s.at;
        /* THE SERVER HAD A LATER EDIT (another device, since) — and the later edit wins, here as there. */
        if (at > s.at && ansIncoming_(ansServerKey_(s.k), got.v) !== null && !ansHeld_(s.k)) {
          ansLocalPut_(s.k, ansIncoming_(ansServerKey_(s.k), got.v) || (/^pad:/.test(s.k) ? null : ''));
          won.push(s.k);
        }
        ansAtSet_(s.k, at);
      });
      ansDirtyKeep_(who);
      ANS_RETRY = 0; ANS_BACKOFF = 0;
      if (won.length) ansRefresh_(won);
      return true;
    })
    .catch(() => {
      /* REFUSED OR UNREACHED: every key stays due, and it is tried again — sooner at first, then less
         often, so a phone with no signal is not a request a second. */
      ANS_BACKOFF = Math.min(Math.max(5000, ANS_BACKOFF * 2), 300000);
      clearTimeout(ANS_RETRY);
      ANS_RETRY = setTimeout(() => answersPush_(true), ANS_BACKOFF);
      return false;
    })
    .then(ok => {
      ANS_BUSY = null;
      ansSavedPaint_();
      const again = ANS_AGAIN;
      ANS_AGAIN = false;
      const same = !!USER && String(USER.personId) === pid;
      /* MORE THAN ONE REQUEST'S WORTH, or a flush asked for while this one was out: once more, now. */
      if (ok && same && (again || (dirty.size && items.length >= ANS_PER_POST))) return answersPush_(true);
      /* TYPED OVER WHILE IT WAS OUT: due again, on the ordinary second and a half — a child typing
         through a slow reply is still one request per pause, not one per round trip. */
      if (ok && same && dirty.size && !keepalive) answersPush_();
      return ok;
    });
  return ANS_BUSY;
}

/* ---------- READING ----------------------------------------------------------------------------------
   ONCE PER PERSON PER VISIT from `adoptMarks_` (a payload landing), and again whenever `force` says so:
   signing in, and coming back to the app after a minute away. Answered `{ success, for, answers }`; a
   reply for anybody but the person signed in NOW is about the last child on a shared iPad, and is
   dropped. `check/ui.js` answers every POST with the payload, which has no `for` — dropped the same way. */
let ANS_PULLED = '';
let ANS_PULL_AT = 0;
let ANS_PULLING = null;
function answersPull_(force) {
  if (!answersCan_('myAnswers') || typeof api !== 'function') return Promise.resolve(false);
  const pid = String(USER.personId);
  if (!force && ANS_PULLED === pid) return Promise.resolve(false);
  if (ANS_PULLING && ANS_PULLING.pid === pid) return ANS_PULLING.p;
  ANS_PULLED = pid;
  ANS_PULL_AT = Date.now();
  const p = Promise.resolve(api({ action: 'myAnswers', personId: pid }))
    .then(d => {
      ANS_PULLING = null;
      if (!d || !d.success || !d.answers || typeof d.answers !== 'object') { ANS_PULLED = ''; return false; }
      if (String(d.for || '') !== pid || !USER || String(USER.personId) !== pid) return false;
      answersAdopt_(pid, d.answers);
      /* AND WHATEVER IS DUE GOES UP NOW — the backlog the merge just found included. */
      answersPush_(true);
      return true;
    })
    .catch(() => { ANS_PULLING = null; ANS_PULLED = ''; return false; });
  ANS_PULLING = { pid: pid, p: p };
  return p;
}

/* IS THIS KEY UNDER A FINGER — the box with the focus, or the pad taking the pen. Never overwritten. */
function ansHeld_(k) {
  try {
    const a = document.activeElement;
    if (a && a.getAttribute && a.getAttribute('data-k') === k) return true;
    if (typeof PAD_ON !== 'undefined' && PAD_ON && (PAD_ON === k || PAD_ON + ':words' === k)) return true;
  } catch (e) {}
  return false;
}

/* ---------- THE MERGE -----------------------------------------------------------------------------------
   `got` is `{ <server key>: { v, at } }` for this person — from `myAnswers` or the sign-in reply.
     a DIRTY key here         wins: it is about to go up, and it is the later edit
     a key under a finger     is left alone — the child is writing in it
     the same edit coming back (same `at`)  nothing to do
     otherwise                the server's value replaces this device's, and its `at` with it
   THEN THE BACKLOG: an answer on this device for this person with no stamp at all is from before this
   file — typed by this child on this iPad this afternoon, say — and if the sheet has nothing for it, it
   is due. That is the answer the owner went looking for on the computer. */
function answersAdopt_(pid, got) {
  const who = 'u:' + String(pid);
  const dirty = ansDirtySet_(who);
  const changed = [];
  const seen = new Set();
  Object.keys(got || {}).forEach(sk => {
    if (!/^(ans|pad):/.test(sk)) return;
    const g = got[sk];
    if (!g || typeof g !== 'object') return;
    const k = ansLocalKey_(sk, who);
    seen.add(k);
    const v = ansIncoming_(sk, g.v);
    if (v === null) return;
    const at = Number(g.at) || 0;
    if (dirty.has(k) || ansHeld_(k)) return;
    const lat = ansAt_(k);
    /* TOO LONG FOR THE ACCOUNT, SO KEPT HERE — and not replaced by the shorter one the account has. */
    if (lat === ANS_HERE_ONLY) return;
    if (lat && lat === at) return;
    const local = ansValue_(k);
    if ((local === null ? '' : local) === v) { if (at) ansAtSet_(k, at); return; }
    /* NEWER HERE AND NOT DUE — the sheet lost it, or never had the last of it. Sent again. */
    if (lat && lat > at) { dirty.add(k); return; }
    ansLocalPut_(k, v === '' && /^pad:/.test(k) ? null : v);
    if (at) ansAtSet_(k, at);
    changed.push(k);
  });
  try {
    const pre = ['ans:' + who + ':', 'pad:' + who + ':'];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || seen.has(k) || dirty.has(k) || !pre.some(p => k.indexOf(p) === 0)) continue;
      if (ansAt_(k)) continue;
      const v = localStorage.getItem(k);
      if (v === null || !String(v).trim() || v === '[]') continue;
      ansAtSet_(k, Date.now());
      dirty.add(k);
    }
  } catch (e) {}
  ansDirtyKeep_(who);
  if (changed.length) ansRefresh_(changed);
  ansSavedPaint_();
}

/* ---------- WHAT WAS WRITTEN SIGNED OUT, CLAIMED BY WHOEVER SIGNS IN FROM SIGNED OUT --------------------
   `signedIn_` (me.js) calls this when nobody was signed in — the same seat that keeps Find's place
   (docs/history/318) — after the sign-in reply's answers have gone into the boxes.

   IT WAS LEFT TO `ansRead_` AND `padAdopt_` (find.js), which move a signed-out answer the first time its
   box is drawn for somebody, and ONLY INTO AN EMPTY BOX. Measured (review of 318, 820x1180): Sol's
   account held Q13 = "75" from three days before; signed out, Sol typed "80" on Q13 and signed in. The
   reply put "75" in Sol's box, so the box was not empty, and "80" stayed under the signed-out key —
   not shown, not sent. Sol signed out, Kit signed in and opened Q13: Kit's box was empty, "80" moved
   into it, and went up to KIT'S account. The work of the child who typed it, in the next child's.

   SO EVERY SIGNED-OUT ANSWER ON THE DEVICE IS DECIDED HERE, AT ONCE, and none is left behind:
     this person has nothing in that box    it moves to them, and is due
     the signed-out one is the later edit   it replaces theirs, and is due — the account then decides
                                            against its own copy by the same rule (`answersUpsert_`:
                                            the later edit wins, and the reply carries the winner)
     theirs is the later edit               theirs stays, and the signed-out one goes
   `ansStore_` stamps a signed-out edit; one from before it did has no time, and counts as older than
   anything this person has — so it fills an empty box, stamped as it moves, which is what `ansRead_`
   always did, and never replaces one. A STAMPED ONE MOVES WITH ITS OWN TIME, not now's, so "later" means
   when it was typed, not when the child signed in.
   EXCEPT WHAT AN ENDED SESSION LEFT (317), which this did not ask about until the two were merged — and
   then Ada's words, typed signed out after the server ended her session, went into Ben's box and up to
   Ben's account the moment he signed in. `ansMayMove_` is asked FIRST, before anything is taken from
   under the signed-out key: another person's stays exactly where it is, for them. The same question
   `ansRead_` and `padAdopt_` ask.
   AND THE PERSON'S OWN IS ALL DECIDED HERE TOO, none of it left behind (review of the merge, P1). It was
   moved only into an EMPTY box of theirs — "the later edit wins" had put Ada's "More words" in place of
   her 3,000-character essay — and the rest stayed under the signed-out key for good: not shown to her,
   and drawn in the box for every signed-out visitor after her, the hour `ANS_GONE_MS` keeps the line to
   notwithstanding. Beside an answer of theirs it is now JOINED to it where the two can be one answer
   (`ansJoin_`: words after words, strokes after strokes, rings with rings), and otherwise decided by
   the later edit like anything else; either way the signed-out key is empty once they are back.
   ---------- `ownOnly`: SIGNED IN OVER SOMEBODY ELSE (317, "Six edges closed", G1) ----------------------------
   `signedIn_` called this from nobody only, by 318's reasoning: a switch from one child to another is not
   the same seat, so nothing anybody made signed out is the arriving child's. True of 'later'. NOT of what is
   marked as theirs — and that was left to `ansRead_` and `padAdopt_`, which move it only into an EMPTY box:
   Ada came back to the family computer while Ben was still signed in, signed in over him, and her "More
   words" stayed under the signed-out key, out of her essay, in the box for every signed-out visitor after
   her, as P1 had been from nobody. So a switch claims too, and takes the person's own and nothing else.
   `ansMayMove_` answers '' for 'later' on a switch itself now (`familySwitched`, 317, "Undo, the booking
   form, a switch"), so there this is a second line; it still decides a same-person sign-in, not a switch.
   ---------- THE WHITEBOARD'S OWN, and only its own (P5) --------------------------------------------------------
   A board drawn signed out with no ended session behind it is the device's, moved to whoever first OPENS
   the board (`padAdopt_`) and never claimed here — note 310's rule, unchanged. One drawn after the server
   ended its person's session is theirs: claimed by them like their answers (strokes after their strokes),
   and like the board itself never due to go up — it is not an answer, and the `answers` tab never sees it.
   ---------- WHAT THE STORE REFUSED IS CLAIMED TOO (G2) --------------------------------------------------------
   This walked `localStorage`'s keys, so a signed-out answer the store had refused — held by the visit
   (`keepPut_`, data.js) — was never claimed: not in the box of the person signing in, drawn for every
   signed-out visitor after them, and written back under the signed-out key as the page went
   (`keepRetry_`). `ansBareKeys_` is the store's keys and the visit's. */
function ansBareKeys_() {
  const all = new Set();
  try { for (let i = 0; i < localStorage.length; i++) all.add(localStorage.key(i)); }
  catch (e) { ANS_MEM.forEach((v, k) => all.add(k)); }
  if (typeof KEEP_UNKEPT !== 'undefined') KEEP_UNKEPT.forEach(k => all.add(k));
  return [...all].filter(k => k && /^(?:ans|pad|board):(?!u:)/.test(k));
}
function answersClaim_(pid, ownOnly) {
  const who = 'u:' + String(pid || '');
  if (who === 'u:') return [];
  const dirty = ansDirtySet_(who);
  const moved = [];
  ansBareKeys_().forEach(bare => {
    const board = ansIsBoard_(bare);
    const k = bare.replace(/^(ans|pad|board):/, '$1:' + who + ':');
    const may = ansMayMove_(bare, k);
    if (!may || ((ownOnly || board) && may !== 'own')) return;
    /* READ BEFORE THE REMOVAL BELOW TAKES THE MARK WITH THE ANSWER. */
    const mark = may === 'own' ? ansGoneOf_(bare) : null;
    const v = ansValue_(bare);
    const at = ansAt_(bare);
    const mine = ansValue_(k);
    const has = mine !== null && !!String(mine).trim() && mine !== '[]';
    /* GONE FROM UNDER THE SIGNED-OUT KEY WHATEVER HAPPENS NEXT — moved, joined, or the older of two. */
    ansLocalPut_(bare, null);
    ANS_AT_MEM.delete(bare);
    try { localStorage.removeItem('ansAt:' + bare); } catch (e) {}
    if (v === null || !String(v).trim() || v === '[]') return;
    const joined = mark && has ? ansJoin_(bare, mine, v, mark.words) : null;
    if (joined !== null) {
      if (joined === mine) return;
      ansLocalPut_(k, joined);
      ansAtSet_(k, Date.now());
    } else {
      if (has && !(at && at > ansAt_(k))) return;
      ansLocalPut_(k, v);
      ansAtSet_(k, at || Date.now());
    }
    /* THE BOARD STAYS ON THE DEVICE (note 310): its person's again, and never due to go up. */
    if (!board) dirty.add(k);
    moved.push(k);
  });
  ansDirtyKeep_(who);
  if (moved.length) { ansRefresh_(moved); answersPush_(); }
  ansSavedPaint_();
  return moved;
}

/* ---------- AND WHAT IS ON THE SCREEN, CHANGED WHERE IT STANDS -------------------------------------------
   NOT A REPAINT. A repaint of Find is the thing `findKeep_` exists to hold back, and it would throw away
   every verdict on the column. Each kind of answer is put back by the code that draws it: a box's value
   (and the keypad's drawing of it), the options rebuilt by `choiceBox_` exactly as a tap does, a pad's
   strokes by `padRepaint_`, a ring by its class. A verdict about the old answer goes, as typing takes it. */
function ansRefresh_(keys) {
  const want = new Set(keys);
  const has = k => want.has(k) && !ansHeld_(k);
  try {
    document.querySelectorAll('[data-do="qp-ans"][data-k]').forEach(el => {
      const k = el.getAttribute('data-k');
      if (!has(k)) return;
      const v = typeof ansRead_ === 'function' ? ansRead_(k) : (ansValue_(k) || '');
      if (el.value === v) return;
      el.value = v;
      /* REDRAWN BY THE PAD'S OWN DRAWING (`kpRender_`), which knows a worded box from a maths one: this
         called `kpTypeset_` on every box, and a worded answer filled from another device came back
         typeset -- `well-known` with a minus in it, `and/or` stacked as a fraction. */
      if (el.classList.contains('kp-in') && typeof kpRender_ === 'function') kpRender_(el);
      const card = el.closest('.qcard');
      [card && card.querySelector('.qp-mark[data-accept]'), card && card.querySelector('.qp-ai')].forEach(m => {
        if (!m) return;
        /* EXCEPT AN ESSAY'S KEPT AI MARK, which is said again against the words now on the sheet -- fresh
           if they are the ones it read, "before your changes" if not -- rather than blanked: blanking took
           the verdict and left its points under an empty line (docs/history/312, `aiKeptPaint_`). */
        if (m.classList.contains('qp-essay') && m.classList.contains('qp-ai') && typeof aiKeptPaint_ === 'function' && aiKeptPaint_(m, el)) return;
        m.classList.remove('is-right', 'is-near');
        const out = m.querySelector('.qp-verdict');
        if (out) out.textContent = '';
      });
    });
    document.querySelectorAll('.qp-choices[data-k]').forEach(box => {
      if (has(box.getAttribute('data-k')) && typeof choiceRedraw_ === 'function') choiceRedraw_(box);
    });
    /* AN ORDERING'S ROW, drawn again from the store by `orderBox_` exactly as a tap does. */
    document.querySelectorAll('.qp-order[data-k]').forEach(box => {
      if (has(box.getAttribute('data-k')) && typeof orderRedraw_ === 'function') orderRedraw_(box, '');
    });
    document.querySelectorAll('.qpad[data-k]').forEach(pad => {
      const k = pad.getAttribute('data-k');
      if (has(k) && typeof padRepaint_ === 'function') padRepaint_(pad, padRead_(k));
    });
    document.querySelectorAll('[data-circ]').forEach(h => {
      const k = h.getAttribute('data-circ');
      if (!has(k) || typeof circRead_ !== 'function') return;
      const on = circRead_(k);
      h.querySelectorAll('.qw').forEach(s => {
        const lit = on.indexOf(s.getAttribute('data-w')) !== -1;
        s.classList.toggle('is-circled', lit);
        s.setAttribute('aria-pressed', lit ? 'true' : 'false');
      });
    });
  } catch (e) {}
}

/* ---------- THE LINE UNDER THE BOX ---------------------------------------------------------------------
   ONE LINE, ALWAYS THE SAME HEIGHT (`.qp-saved` reserves it), so a box that goes from nothing to
   "Saving…" to "Saved" moves nothing under it — the rule 261 made for the verdict. Empty when there is
   nothing written: a line about saving an empty box is a line about nothing.

     signed out                         On this device only — sign in to keep it
     signed in, a backend that cannot   On this device only
     over the account's ceiling         On this device only — too long for the account
     due, or not yet reconciled         Saving…
     on the account                     Saved to Ada’s account

   THE FIRST NAME, AND ONLY HERE. It is the one sentence that is about whose account the work went to,
   which is exactly what a parent handing an iPad between children needs to read. */
function ansFirstName_() {
  try { return String((USER && (USER.name || USER.handle)) || '').trim().split(/\s+/)[0] || ''; }
  catch (e) { return ''; }
}
/* ON THE ACCOUNT, AS THIS DEVICE LAST WROTE IT — so a store refusing the device's copy loses nothing
   that a reload cannot bring back down. Asked by `keepAtRisk_` (data.js) before the browser is told to
   ask "Leave site?". */
function ansOnAccount_(k) {
  try {
    const who = ansWhoOf_(k);
    return !!who && answersCan_('saveAnswers') && who === 'u:' + String(USER.personId)
      && ansAt_(k) > 0 && !ansDirtySet_(who).has(k);
  } catch (e) { return false; }
}
const ANS_NOT_KEPT = 'Not saved — this browser is not keeping it';
/* ---------- AN EMPTY BOX OVER AN ANSWER THAT IS STILL HERE ---------------------------------------------
   THE OTHER LOSS THE HUNT REPRODUCED (317, scenario B): a session the SERVER ended — signed out on
   another device, a PIN changed, thirty days — answers `why: 'signed-out'` on the reload, `signedOut_`
   forgets the person, and the box is drawn under the signed-out key: empty, over an essay of 3,015
   characters still sitting under the person's own key. Nothing was deleted and nothing said so. `api()`
   (shell.js) notes whose session the server ended (`familyGone`) and this says it under the box that
   person had written in, until anybody signs in, and for an hour at most. The words only; the answer
   stays theirs. */
/* ---------- FOR AN HOUR, NOT UNTIL SOMEBODY SIGNS IN -----------------------------------------------------
   `familyGone` IS `{ who, at }`. It was the bare key, cleared only by a sign-in or a chosen sign-out, so
   on the family's iPad every signed-out visitor after the server ended a child's session was told
   "your answer is back" under each question that child had answered — words addressed to somebody else,
   and a list of what they had done (review of 317). It is for the person who was in front of the screen
   when it happened, so it lasts `ANS_GONE_MS`: a reload in the same lesson, not tomorrow's visitor. */
const ANS_GONE_MS = 60 * 60 * 1000;
/* ---------- AND THE RECORD OF IT IS KEPT AS CAREFULLY AS THE WORK IT GUARDS ------------------------------
   `familyGone` (whose session the server ended, and when) and `familyGoneKeys` (which signed-out answers
   are theirs, below) were bare `setItem`s read back with `getItem`. A browser keeping no site data THROWS on
   both, so `ansMayMove_` never knew whose an answer was and answered "anybody's" — and 318's claim, which
   walks the visit's copies (`ANS_MEM`) exactly when storage throws, moved Ada's "(5)/(6)" into Ben's box and
   up to Ben's account (review of the merge, P3). A store merely full at that moment lost the record the same
   way. So both go through `keepPut_` (data.js) as a `'record'`: held for the visit when the store refuses
   or throws, given the loading screen's room like an answer, tried again as the page goes — before the
   answers waiting on it — and read with the visit's copy first (`ansValue_` → `keepHeld_`). */
const ansRec_ = name => ansValue_(name);
function ansRecPut_(name, v) {
  if (typeof keepPut_ === 'function') { keepPut_(name, v, 'record'); return; }
  try { if (v === null) localStorage.removeItem(name); else localStorage.setItem(name, v); } catch (e) {}
}
function ansGone_() {
  try {
    const g = JSON.parse(ansRec_('familyGone') || 'null');
    return g && /^u:[^:]+$/.test(String(g.who || '')) && Date.now() - (Number(g.at) || 0) < ANS_GONE_MS ? String(g.who) : '';
  } catch (e) { return ''; }
}
function ansGoneSay_(k) {
  if (ansWhoOf_(k)) return '';
  const gone = ansGone_();
  if (!gone) return '';
  const theirs = ansValue_(ansLocalKey_(ansServerKey_(k), gone));
  return theirs !== null && String(theirs).trim() && theirs !== '[]'
    ? 'Signed out — sign in again and your answer is back' : '';
}
/* ---------- AND WHAT THEY TYPE SIGNED OUT MEANWHILE IS STILL THEIRS ---------------------------------------
   FOUND BY THE REVIEW OF 317, ON THE PATH THE LINE ABOVE PROTECTS: the server ended Sam's session, the
   reload drew his essay's box empty and signed out, and he typed "More words" into it. Kit signed in next
   and opened the question — and `ansRead_` (find.js), which moves a signed-out answer into whoever signs
   in if their box is empty, moved Sam's words into KIT'S account. So a signed-out answer written while a
   session the server ended is fresh (`ansGone_`) is marked as that person's, in `familyGoneKeys`, and
   nothing moves it into anybody else's box: every path that moves a signed-out answer asks `ansMayMove_`
   (below). It stays under the signed-out key, as it always did, until that person signs in. The mark
   goes with the answer — emptied, or moved to them.
   ---------- AND A LATER WRITE CHANGES WHOSE IT IS ONLY BY WRITING OVER ALL OF IT (317, "Six edges", P7) ----------
   THIS SAID "never taken off by a later write: an answer half one person's is not handed to the next" —
   and so an answer with NOTHING of theirs left in it stayed theirs. The hour passes, the next visitor on
   the family computer selects Ada's "(5)/(6)" and types "(1)/(9)" over it, and when Ada signed in again
   the visitor's answer went up to ADA's account, by the mark. And it was not true of the half-and-half
   case either: a write while ANOTHER child's ended session was fresh re-marked the whole answer as
   theirs, Ada's words in it. So whose it is follows what is in it (`ansKeeps_`, below):
     an EDIT of it — a key typed, a letter taken off, a word pasted in, a stroke added or undone — keeps
     it whose it was, whoever makes the edit: mostly theirs is theirs, and is not handed to the next;
     a write OVER ALL OF IT — the box selected and typed over, a paste over the whole, another number —
     is the writer's: theirs if their own ended session is fresh, and otherwise nobody's, so it follows
     whoever signs in next from nobody (318), as anything made signed out with no ended session does. If
     that is the person whose mark it was, it is theirs by that rule, not by the mark — after the hour
     nothing on the device can tell who is at the keyboard, and 318's seat is the rule for that.
     Emptied, it is nobody's, as before.
   `was` is the value before this write (`ansLocalPut_` reads it); a caller without it is read for it.
   ---------- AND UNDO PUTS BACK WHOSE IT WAS, WITH WHAT WAS THERE (317, "Undo, the booking form, a switch") -------
   EMPTIED IS NOBODY'S — and the two features built for slips put the emptied answer straight back: the pen's
   Undo after Clear (`PAD_CLEARED`, find.js — the bin sits 4px from Undo) and the keypad's Ctrl+Z (`kpUndo_`,
   keypad.js) after Ctrl+A and Backspace, or a held Backspace. The write that put it back was judged like a
   new one, against the empty box or the visitor's one letter, so `ansKeeps_` saw nothing of Ada's to keep:
   her own stroke and her own words came back with no mark — anybody's, and Ben, signing in next from
   nobody, was handed them and they went up to HIS account; or, while Cal's ended session was fresh, they
   came back marked as Cal's. So both Undos write through `ansPutBack_`, below, with the mark the answer had
   when it was last that value (kept beside the value it undoes to), and that mark is the one written —
   Ada's for Ada's words, nobody's for the visitor's one letter put back by a Redo. Undo is time going
   backwards for one box; whose it was goes backwards with it.
   A MARK IS `{ who, words }`: whose, and whether it was typed in a worded box (the `input` listener in
   find.js says), which is what `ansJoin_` needs to know when they sign in again. The record's name,
   `ANS_GONE_KEYS`, is declared in data.js: the draft sweep there asks it as that file loads. */
/* THE WRITE AN UNDO IS MAKING, while it makes it: `{ k, mark }`. `write` is the Undo's own write — the pen's
   `ansStore_`, or the keypad's `input` event, which find.js's listener stores — and the mark is decided here
   and not after it, so the answer is never on the device without its mark, even for a moment (`keepWaits_`).
   `mark` is null for a value that was nobody's. Only a key a mark can name is told anything. */
let ANS_PUT_BACK = null;
function ansPutBack_(k, mark, write) {
  const before = ANS_PUT_BACK;
  ANS_PUT_BACK = ansMarkable_(k) ? { k: String(k), mark: ansGoneRead_(mark) } : null;
  try { write(); } finally { ANS_PUT_BACK = before; }
}
function ansGoneMark_(k, v, words, was) {
  if (!ansMarkable_(k)) return;
  try {
    const empty = v === null || v === undefined || !String(v).trim() || v === '[]';
    const back = ANS_PUT_BACK && ANS_PUT_BACK.k === k ? ANS_PUT_BACK : null;
    const gone = empty ? '' : ansGone_();
    const raw = ansRec_(ANS_GONE_KEYS);
    if (!raw && !gone && !(back && back.mark)) return;
    const map = JSON.parse(raw || '{}') || {};
    const had = ansGoneRead_(map[k]);
    let want = empty || !gone ? null : { who: gone, words: !!words };
    /* PUT BACK BY AN UNDO: whose it was when it was last this value, whoever's session is fresh now. */
    if (!empty && back) want = back.mark;
    else if (!empty && had && (!want || want.who !== had.who)
        && ansKeeps_(k, was === undefined ? ansValue_(k) : was, v)) want = had;
    if (want ? !!had && had.who === want.who && had.words === want.words : !had) return;
    if (want) map[k] = want; else delete map[k];
    /* AND WHAT NO LONGER NAMES AN ANSWER, while it is open anyway — ASKED OF `ansValue_`, which answers
       with the visit's copy of a key the store refused. This asked `localStorage` alone, and so took the
       mark off an answer the visit was holding (`keepPut_`, data.js) the moment the next box was typed
       in; the store took the answer once there was room again, unmarked, and the next child to sign in
       was given it (review of the merge, P6). */
    Object.keys(map).forEach(x => { if (x !== k && ansValue_(x) === null) delete map[x]; });
    ansRecPut_(ANS_GONE_KEYS, Object.keys(map).length ? JSON.stringify(map) : null);
  } catch (e) {}
}
/* ---------- DOES A WRITE KEEP WHAT WAS THERE — an edit of it, or a new answer over it? (P7, above) ------------
   A KEY TYPED, A LETTER DELETED, A WORD PASTED IN: one place changes, and the text before it and after it
   is as it was — the keypad writes the whole box on every key, so two writes in a row differ in one place.
   HALF OR MORE of the old text still there, at its start and its end, is an edit of it. Less is a new
   answer written over it: "(5)/(6)" typed over with "(1)/(9)" keeps a bracket at each end, two characters
   of seven, which is chance and not keeping. A drawing or its rings is a list, and is kept while any
   stroke or ring of the old one is still in it: Undo takes one off, and Clear empties it, which takes the
   mark off on its own. NOT AS TEXT: a visitor's Undo that takes Ada's long stroke off leaves her short
   one, a fifth of the characters, and as text that read as a new drawing over hers — and Ben, signing
   in next, was handed her stroke.
   HALF COUNTS, and that was found the short way: "more than half" made one Backspace on Ada's "80" a new
   answer — "8" keeps one character of two — so her own last digit was nobody's and went to Ben. Every
   key is one write, so with half counted a visitor trimming her words key by key leaves them hers to the
   last character, and the empty box that ends it takes the mark off with nothing of hers left. */
function ansKeeps_(k, was, v) {
  if (was === null || was === undefined || v === null || v === undefined) return false;
  if (ansIsPad_(k) || ansIsRing_(k) || ansIsBoard_(k)) {
    try {
      const a = JSON.parse(was), b = JSON.parse(v);
      if (Array.isArray(a) && Array.isArray(b)) {
        const old = new Set(a.map(x => JSON.stringify(x)));
        return b.some(x => old.has(JSON.stringify(x)));
      }
    } catch (e) {}
  }
  const a = String(was), b = String(v);
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return 2 * (p + s) >= a.length;
}
/* ONE MARK, READ — `{ who, words }`, or null. A bare string is a mark from before marks said how the
   answer was typed. */
function ansGoneRead_(m) {
  if (!m) return null;
  if (typeof m === 'string') return { who: m, words: false };
  return typeof m === 'object' && m.who ? { who: String(m.who), words: !!m.words } : null;
}
function ansGoneOf_(bare) {
  try { return ansGoneRead_((JSON.parse(ansRec_(ANS_GONE_KEYS) || '{}') || {})[bare]); } catch (e) { return null; }
}
/* ---------- AND NEVER ON THE DEVICE WITHOUT ITS MARK -------------------------------------------------------
   Asked by `keepPut_` and `keepRetry_` (data.js) before they write a key. WHILE THE STORE IS REFUSING THE
   MARKS, an answer they name waits for them in the visit, like any refused write ("Not saved" under its
   box): written alone, it would be on the device with nothing to say whose it is, and after a reload it
   would be anybody's. The marks are written first as the page goes, so the two land together. */
function keepWaits_(k) {
  if (typeof KEEP_UNKEPT === 'undefined' || !KEEP_UNKEPT.has(ANS_GONE_KEYS)) return false;
  /* ANYTHING A MARK CAN NAME — the board and the device's drafts as well as answers (`ansMarkable_`). */
  if (!ansMarkable_(k)) return false;
  const held = ansGoneOf_(k);
  if (!held) return false;
  /* NOT WHEN THE STORED MARKS SAY THE SAME ALREADY — the refused write was about some other answer. */
  let kept = null;
  try { kept = ansGoneRead_((JSON.parse(localStorage.getItem(ANS_GONE_KEYS) || '{}') || {})[k]); } catch (e) {}
  return !(kept && kept.who === held.who);
}
/* ---------- THE PEN'S AND THE RINGS' NOTE, FOR THE KEY IT IS UNDER -------------------------------------
   `padKeptSay_` (below) says where drawings are kept, and only that: the review of 317 found it reading
   "Kept on this device only" over strokes the store had refused, and saying nothing over a pad drawn
   empty by a session the server ended. So the two lines the answer box gives come first here too.
   AND THE WHITEBOARD'S (`board:`, find.js), which is a pen's note too: refused, it is "Not saved" like
   anything else the store refused (the rule the board took from 317 when the two were merged — note
   310); otherwise it is on this device and nowhere else, so never an account's sentence and never an
   ended session's — `PAD_HERE_ONLY`. */
function padNoteSay_(k) {
  k = String(k || '');
  const v = ansValue_(k);
  const has = v !== null && !!String(v).trim() && v !== '[]';
  if (has && typeof KEEP_UNKEPT !== 'undefined' && KEEP_UNKEPT.has(k) && !ansOnAccount_(k)) return ANS_NOT_KEPT + '.';
  if (!/^(ans|pad):/.test(k)) return typeof PAD_HERE_ONLY === 'string' ? PAD_HERE_ONLY : 'Kept on this device only.';
  const gone = has ? '' : ansGoneSay_(k);
  return gone ? gone + '.' : padKeptSay_();
}
/* ---------- MAY THE SIGNED-OUT `bare` BECOME `k`'S — THE ONE QUESTION EVERY MOVE ASKS --------------------
   FOUR PATHS MOVE A SIGNED-OUT ANSWER INTO SOMEBODY'S KEY: `answersClaim_` (above — signing in from
   nobody, and the person's own over somebody else), `ansRead_` and `padAdopt_` (find.js — a box or a pad
   drawn for somebody signed in) and `circOf_` (find.js — the visit's rings, when storage throws). The
   guard used to be `ansGoneOthers_`, which `ansRead_` and `padAdopt_` asked, `circOf_` did not, and
   `answersClaim_` had never heard of: 317 and 318 were built on separate branches, and once merged, 318's
   claim moved Ada's "More words" — typed signed out after the server ended HER session — into Ben's box
   and up to Ben's account the moment Ben signed in, the fault 317's review had just closed at the other
   doors. So all four ask this, and only this:
     ''        it was written while ANOTHER person's ended session was fresh (`familyGoneKeys`): it is
               theirs, and stays under the signed-out key for them. Never moved, never sent.
     'own'     it is THIS person's own, typed after the server ended their session. Drawn for them
               (`ansRead_`, `padAdopt_`, `circOf_`) it moves only into an EMPTY box, as anything does
               there. Signing in from nobody (`answersClaim_`) it is all theirs and none of it is left:
               into an empty box, or JOINED to the answer there (`ansJoin_`, below) — never "the later
               edit wins" over a worded answer. The box it was typed into was drawn empty because the
               session had gone, over the answer the line under it promised back (`ansGoneSay_`), so it
               was typed beside that answer, not over it: by the later edit, "More words" went in place
               of a 3,000-character essay and up to the account — the owner's 9 Oct report again.
               It was 'empty', and moved ONLY into an empty box at sign-in too, which left the words
               typed beside the essay under the signed-out key for good (review of the merge, P1).
               And signing in OVER somebody else claims it too, and nothing else (`ownOnly`, G1).
     'later'   anybody's: no session ended. Whoever signs in, by 318's rule (`answersClaim_`).
   WHOSE IS READ FROM THE VISIT'S COPY FIRST (`ansRec_`), so a store that throws or is full still knows.
   ---------- AND EVERY MOVER READS BOTH KEYS AS THE WRITER'S OWN READER DOES (317, "Six edges") --------------
   `ansValue_`, the visit's copy first. `padAdopt_` asked `localStorage` whether the person's pad was
   empty, and a pad the store had refused — held by the visit — was "empty", so a drawing made signed out
   was moved over it (P4); the claim walked the store's keys and never saw a signed-out answer the visit
   was holding (G2). AND TWO MORE DOORS ASK THIS NOW: the whiteboard (`board:`, P5), and `bookFollow_`
   (book.js), which carries the device's booking form into whoever signs in (`draft:device:`, P8) — `k` is
   then the person's own key of that shape, and `ansKeyWho_` reads whose it is.
   ---------- 'later' IS NEVER FOR SOMEBODY WHO ARRIVED OVER SOMEBODY ELSE (317, "Undo, the booking form, a switch") ----
   THE CLAIM SAID SO (`ownOnly`) AND THE OTHER DOORS DID NOT. Ben signed in; another tab of the site, signed
   out there and never reloaded, wrote a maths answer and a stroke — nobody's session behind them, so 'later'.
   Ada signed in over Ben, and the claim rightly left them: a switch is not the same seat (318). Then her
   card was drawn, and `ansRead_` and `padAdopt_` — which refused only '' — moved the other tab's answer into
   her empty box and up to HER account; the board's `padAdopt_`, which `wbPaint_` runs at every sign-in, did
   the same with a board. So whoever signed in over somebody else is written down (`familySwitched`, set by
   `signedIn_`, gone at the next sign-out — `answersForget_`), kept as carefully as `familyGone` and for as long
   as the session (a reload is still the same arrival), and for them 'later' is ''. A device signed in from
   nobody, or already signed in when this tab opened, keeps 318's rule: `ansRead_` is what is left for it. */
const ANS_SWITCHED = 'familySwitched';
function ansSwitched_() {
  const v = String(ansRec_(ANS_SWITCHED) || '');
  return /^u:[^:]+$/.test(v) ? v : '';
}
function ansSwitchedIn_(pid) {
  try { ansRecPut_(ANS_SWITCHED, pid ? 'u:' + String(pid) : null); } catch (e) {}
}
function ansMayMove_(bare, k) {
  const m = ansGoneOf_(bare);
  const who = ansKeyWho_(k);
  if (m) return m.who === who ? 'own' : '';
  return who && who === ansSwitched_() ? '' : 'later';
}
/* ---------- TWO ANSWERS OF ONE PERSON'S, PUT TOGETHER WHERE THEY CAN BE ONE --------------------------------
   `mine` is what the box holds for them, `v` what they wrote signed out beside it after their session
   ended (`answersClaim_`). Nothing of either is lost, and nothing is said twice:
     a drawing   their strokes, then the ones drawn signed out
     rings       every word either rang
     words       theirs, a blank line, then the words typed signed out — the essay, then what was typed
                 after it — unless theirs already holds them
   ANYTHING ELSE IS ONE ANSWER, NOT TWO — a number, a pick, an order: `null`, and the later edit wins, as it
   does for every other signed-out answer. So does a worded answer whose mark is from before marks said
   how it was typed (`ansGoneRead_`). */
function ansJoin_(bare, mine, v, words) {
  if (ansIsPad_(bare) || ansIsRing_(bare) || ansIsBoard_(bare)) {
    try {
      const a = JSON.parse(mine), b = JSON.parse(v);
      if (!Array.isArray(a) || !Array.isArray(b)) return null;
      const seen = new Set(a.map(x => JSON.stringify(x)));
      const add = b.filter(x => { const s = JSON.stringify(x); if (seen.has(s)) return false; seen.add(s); return true; });
      return add.length ? JSON.stringify(a.concat(add)) : mine;
    } catch (e) { return null; }
  }
  if (!words) return null;
  const add = String(v).trim();
  if (String(mine).indexOf(add) !== -1) return mine;
  return String(mine).replace(/\s+$/, '') + '\n\n' + add;
}
function ansSavedSay_(k) {
  k = String(k || '');
  const v = ansValue_(k);
  if (v === null || !String(v).trim() || v === '[]') return ansGoneSay_(k);
  const who = ansWhoOf_(k);
  /* REFUSED BY THE STORE AND NOT ON THE ACCOUNT EITHER — the one line that must never say "on this
     device", because it is on no device. `keepPut_` in data.js. */
  if (typeof KEEP_UNKEPT !== 'undefined' && KEEP_UNKEPT.has(k) && !ansOnAccount_(k)) return ANS_NOT_KEPT;
  if (!who) return 'On this device only — sign in to keep it';
  if (!answersCan_('saveAnswers') || who !== 'u:' + String(USER.personId)) return 'On this device only';
  if (ansAt_(k) === ANS_HERE_ONLY) return 'On this device only \u2014 too long for the account';
  if (ansDirtySet_(who).has(k) || !ansAt_(k)) return 'Saving…';
  const name = ansFirstName_();
  return name ? 'Saved to ' + name + '’s account' : 'Saved to your account';
}
function ansSavedPaint_() {
  /* AND THE PEN'S AND THE RINGS' NOTE, which a refused stroke or an ended session changes too. */
  try {
    document.querySelectorAll('[data-kept-k]').forEach(el => {
      const say = padNoteSay_(el.getAttribute('data-kept-k'));
      if (el.textContent !== say) el.textContent = say;
    });
  } catch (e) {}
  try {
    document.querySelectorAll('.qp-saved[data-k]').forEach(el => {
      const say = ansSavedSay_(el.getAttribute('data-k'));
      if (el.textContent !== say) el.textContent = say;
    });
  } catch (e) {}
}
/* THE SAME FACT FOR THE PEN AND THE RINGED WORDS, in the note they already carried ("Kept on this phone
   only, like the answer box" — true until today, and now true only signed out). Drawn with the card, so
   it is the state at the last repaint. */
function padKeptSay_() {
  if (!(typeof whoIs_ === 'function' && whoIs_())) return 'Kept on this device only — sign in to keep it.';
  if (!answersCan_('saveAnswers')) return 'Kept on this device only.';
  const name = ansFirstName_();
  return 'Saved to ' + (name ? name + '’s' : 'your') + ' account, like the answer box.';
}

/* ---------- WHEN IT SENDS AT ONCE ------------------------------------------------------------------------
   LEAVING A BOX, which is the moment a child has finished with it. AFTER CHECK, A PICK, AN ORDER SENT OR
   "MARK WITH AI" — this listener is added after the app's own click dispatcher (shell.js), so the handler
   has stored the answer by the time this runs. AND THE APP GOING AWAY: `visibilitychange` to hidden is the last event an
   iPad reliably sends when the cover closes or the Home Screen is pressed, and `pagehide` is the one a
   tab closing sends — both with `keepalive`. */
document.addEventListener('focusout', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (el) answersPush_(true);
});
document.addEventListener('click', e => {
  const t = e.target && e.target.closest && e.target.closest('[data-do="qp-check"], [data-do="qp-choose"], [data-do="qp-order-send"], [data-do="qp-ai"]');
  if (t) answersPush_(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { answersPush_(true, true); return; }
  /* BACK IN FRONT, AND IT HAS BEEN A WHILE: the computer may have written since. Once a minute at most. */
  if (document.visibilityState === 'visible' && Date.now() - ANS_PULL_AT > 60000) answersPull_(true);
});
window.addEventListener('pagehide', () => { answersPush_(true, true); });

/* ---------- AND AN ANSWER WRITTEN IN ANOTHER TAB IS THE ANSWER IN THIS ONE -------------------------------
   FOUND BY THE HUNT (317): the card open in two tabs, the essay (1,369 characters) written in one, a
   single key pressed in the other — whose box was drawn empty before the first tab wrote — and that one
   letter was saved over the essay, because the box saves its whole value. Nothing here listened for
   `storage`, which a browser fires in every OTHER tab of the site when one writes. So a box, a pick, an
   ordering, a drawing or a ring showing a key another tab has just written is given that tab's value
   where it stands — a focused box too, since a `storage` event is never this tab's own keystroke — and
   the keypad's undo for it forgets a history that is no longer this box's. */
window.addEventListener('storage', e => {
  const k = e && e.key;
  if (!k || !/^(ans|pad):/.test(k)) return;
  try {
    if (typeof KEEP_UNKEPT !== 'undefined') KEEP_UNKEPT.delete(k);
    ANS_MEM.delete(k);
    if (ansIsRing_(k) && typeof CIRC_HELD !== 'undefined') CIRC_HELD.delete(k);
    const v = e.newValue === null ? '' : String(e.newValue);
    document.querySelectorAll('[data-do="qp-ans"][data-k]').forEach(el => {
      if (el.getAttribute('data-k') !== k || el.value === v) return;
      el.value = v;
      if (el.classList.contains('kp-in') && typeof kpRender_ === 'function') kpRender_(el);
    });
    if (typeof KP_UNDO !== 'undefined' && KP_UNDO && typeof KP_UNDO.delete === 'function') KP_UNDO.delete(k);
    ansRefresh_([k]);
    ansSavedPaint_();
  } catch (err) {}
});

/* ==================================================================================================
   AND THE FIND COLUMN IS NOT REBUILT UNDER A CHILD WHO IS WRITING.

   MEASURED (diag-signin, 820x1180, the iPad): focus a keypad box on Find right after signing in, type
   "7" — saved — and when the payload landed fifteen seconds later the whole column was rebuilt: the box
   replaced, `KP_AT` left on a detached input, the keypad closed. On Safari, which may not send
   `focusout` for a removed element, the pad would stay up typing into nothing. The messages reply and
   the profile refresh then did it twice more.

   `settingsKeep_` (me.js) already answers this for a half-filled settings card, and `paint` asks it.
   This is the same question for Find: while an answer box has the focus, the keypad is up or a stroke
   is half drawn, the column is marked STALE instead of rebuilt — and drawn again a moment after the
   child leaves the box, or the next time the column is arrived at.

   NOT WHILE THE PEN IS MERELY ON, and not while a verdict is showing, though both were tried: either
   can outlast a sign-out, and a Find column held stale across a change of person is one whose boxes are
   still keyed to the last child. The pen's state is redrawn from `PAD_ON` anyway, and every stroke is
   stored the moment it ends. A verdict is only held back from the moment-after redraw below, which is
   the one that would wipe "Correct" a heartbeat after Check put it there. */
function findKeep_(id) {
  if (id !== 'stuff') return false;
  try {
    const host = document.getElementById('s-stuff');
    if (!host) return false;
    const a = document.activeElement;
    if (a && host.contains(a) && a.matches && a.matches('[data-do="qp-ans"], .kp-in, textarea, input')) return true;
    if (document.documentElement.classList.contains('kp-up')) return true;
    return typeof PAD_ST !== 'undefined' && !!PAD_ST;
  } catch (e) { return false; }
}
/* A VERDICT ON THE SCREEN, which lives in the DOM only — Check writes it there and nothing stores it. */
function findVerdictShown_() {
  try {
    const host = document.getElementById('s-stuff');
    return !!host && [].some.call(host.querySelectorAll('.qp-mark[data-accept] .qp-verdict, .qp-ai .qp-verdict'),
      el => !!String(el.textContent || '').trim());
  } catch (e) { return false; }
}
/* THE REDRAW IT HELD BACK, once nothing is held — a moment after leaving the box, so a tap that moved the
   focus from one box to the next (focusout, then focusin) finds the next box focused and waits again.
   Not over a verdict just given: that waits for the next arrival at the column (`go` draws a stale
   column on the way in). */
let FIND_KEPT_TIMER = 0;
document.addEventListener('focusout', () => {
  clearTimeout(FIND_KEPT_TIMER);
  FIND_KEPT_TIMER = setTimeout(() => {
    try {
      if (AT === 'stuff' && STALE && STALE.stuff && !findKeep_('stuff') && !findVerdictShown_()) repaint();
    } catch (e) {}
  }, 400);
});

/* ---------- AND FORGOTTEN AT SIGN-OUT ----------------------------------------------------------------
   `signedOut_` (me.js) calls this: the next person to sign in is read for at once, whoever they are, and
   a retry booked for the last one is not left to run. What is still due stays due — under the last
   person's key, for the next time they sign in here. */
function answersForget_() {
  ANS_PULLED = '';
  ANS_PULLING = null;
  ANS_PULL_AT = 0;
  clearTimeout(ANS_RETRY);
  ANS_BACKOFF = 0;
  /* AND THE NOTE OF A SESSION THE SERVER ENDED (`ansGoneSay_`): whoever signs in next, or a sign-out
     somebody chose, is a new start. `api()` writes it again AFTER this, for the sign-out it causes.
     Through `ansRecPut_`, so the visit's copy goes with the stored one. */
  try { ansRecPut_('familyGone', null); } catch (e) {}
  /* AND WHO ARRIVED OVER SOMEBODY ELSE (`ansMayMove_`): the next arrival says again how it came. */
  try { ansRecPut_(ANS_SWITCHED, null); } catch (e) {}
}
